import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import { initializeAuth } from './auth';
import { initializeDatabase, verifySchema } from './database';
import { initializeQaConfiguration } from '../db/qaConfiguration';
import { initializeProvider } from './provider';
import { initializeJobRuns } from './jobRunner';
import { initializeIdq } from './idqJobs';
import { requireWorkspaceMigration } from './workspaces';

assert.ok(process.env.TEST_DATABASE_URL, 'Use a disposable TEST_DATABASE_URL.');
const namespace = `migration_${randomUUID().replaceAll('-', '')}`;
const root = new Pool({ connectionString: process.env.TEST_DATABASE_URL });
await root.query(`CREATE SCHEMA ${namespace}`);
const url = new URL(process.env.TEST_DATABASE_URL); url.searchParams.set('options', `-c search_path=${namespace}`);
const pool = new Pool({ connectionString: url.href });
const migrate = (apply = false, overrides: Record<string, string> = {}) => promisify(execFile)(process.execPath, ['--import', 'tsx', 'scripts/migrate-workspaces.ts', '--owner=admin', '--key-slot=AICREDITS_API_KEY_1', ...(apply ? ['--apply'] : [])], {
  env: { ...process.env, DATABASE_URL: url.href, AICREDITS_API_KEY_1: 'migration-key-1', AICREDITS_API_KEY_2: 'migration-key-2', AICREDITS_API_KEY_3: '', AICREDITS_API_KEY_4: '', AICREDITS_API_KEY_5: '', ...overrides }, timeout: 15000,
});
try {
  await initializeAuth(pool); await initializeDatabase(pool); await initializeQaConfiguration(drizzle(pool, { schema }));
  await initializeProvider(pool); await initializeJobRuns(pool); await initializeIdq(pool);
  await pool.query("INSERT INTO users(id,username,password,role) VALUES('admin','Admin','unused','admin'),('user','User','unused','user')");
  await pool.query("INSERT INTO sku_data(sku,owner_id,source,raw_row,upload_attributes) VALUES('same-sku','admin','{\"sap\":\"Preserve source\"}','{\"original\":\"row\"}','{}')");
  await pool.query("INSERT INTO jobs(id,owner_id,name,created_at,skus) VALUES('legacy-job','admin','Original job','2026-01-01','[\"same-sku\"]')");
  await pool.query("INSERT INTO job_runs(id,job_id,request_id,actor_id,actor_name,mode,configuration) VALUES('legacy-run','legacy-job','original-request','admin','Admin','all','{\"settings\":{},\"original\":true}')");
  await pool.query("INSERT INTO job_run_items(run_id,sku,position,revision,snapshot,status,selected_image_urls) VALUES('legacy-run','same-sku',0,0,'{\"original\":true}','queued','[\"https://example.com/image.jpg\"]')");
  await pool.query("INSERT INTO idq_jobs(id,owner_id,request_id,actor_id,actor_name,name,configuration) VALUES('legacy-idq','admin','idq-request','admin','Admin','Original IDQ','{\"settings\":{},\"original\":true}')");
  await pool.query('ALTER TABLE sku_data DROP COLUMN owner_id; ALTER TABLE sku_data ADD UNIQUE(sku); CREATE UNIQUE INDEX sku_data_sku_unique ON sku_data(sku); ALTER TABLE jobs DROP COLUMN owner_id; ALTER TABLE idq_jobs DROP COLUMN owner_id; ALTER TABLE idq_jobs ADD UNIQUE(actor_id,request_id)');
  await assert.rejects(requireWorkspaceMigration(pool), /Workspace migration required/);
  await assert.rejects(migrate(true, { AICREDITS_API_KEY_2: '' }), /No unused configured API key slot/);
  assert.equal((await pool.query('SELECT count(*) FROM user_key_assignments')).rows[0].count, '0', 'Failed migration rolls back assignments');
  const dry = await migrate(); assert.match(dry.stdout, /"applied":false/);
  await assert.rejects(requireWorkspaceMigration(pool), /Workspace migration required/);
  assert.equal((await pool.query('SELECT count(*) FROM user_key_assignments')).rows[0].count, '0', 'Dry run rolls back everything');
  const owner = await pool.connect();
  try {
    await owner.query('SELECT pg_advisory_lock(73462191)');
    await assert.rejects(migrate(true), /Stop all app servers and workers/);
  } finally { await owner.query('SELECT pg_advisory_unlock(73462191)'); owner.release(); }
  const applied = await migrate(true); assert.match(applied.stdout, /"applied":true/);
  await requireWorkspaceMigration(pool); await verifySchema(pool);
  const { rows: [sku] } = await pool.query('SELECT * FROM sku_data');
  assert.equal(sku.owner_id, 'admin'); assert.deepEqual(sku.source, { sap: 'Preserve source' }); assert.deepEqual(sku.raw_row, { original: 'row' });
  const { rows: [item] } = await pool.query('SELECT * FROM job_run_items');
  assert.deepEqual(item.snapshot, { original: true }); assert.deepEqual(item.selected_image_urls, ['https://example.com/image.jpg']);
  assert.equal((await pool.query('SELECT configuration FROM job_runs')).rows[0].configuration.settings.providerKeySlot, 'AICREDITS_API_KEY_1');
  assert.equal((await pool.query('SELECT configuration FROM idq_jobs')).rows[0].configuration.settings.providerKeySlot, 'AICREDITS_API_KEY_1');
  await pool.query("INSERT INTO sku_data(sku,owner_id) VALUES('same-sku','user')");
  await assert.rejects(pool.query("INSERT INTO sku_data(sku,owner_id) VALUES('same-sku','user')"), { code: '23505' });
  await migrate(true);
  assert.equal((await pool.query("SELECT owner_id FROM sku_data WHERE owner_id='user'")).rowCount, 1, 'Repeat migration never reassigns owned data');
  assert.equal((await pool.query('SELECT count(*) FROM user_key_assignments')).rows[0].count, '2');
  console.log('Workspace migration checks passed: rollback, dry run, worker lock, preserved evidence/history/images, ownership, permanent assignments, duplicate SKUs and idempotence.');
} finally { await pool.end(); await root.query(`DROP SCHEMA ${namespace} CASCADE`); await root.end(); }
