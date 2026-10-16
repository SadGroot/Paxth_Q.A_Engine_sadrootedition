import 'dotenv/config';
import { Pool } from 'pg';
import { assignKeySlot, initializeWorkspaces, KEY_SLOTS } from '../src/server/workspaces';

const args = process.argv.slice(2);
const ownerId = args.find(arg => arg.startsWith('--owner='))?.slice(8);
const keySlot = args.find(arg => arg.startsWith('--key-slot='))?.slice(11);
const apply = args.includes('--apply');
if (!ownerId || !KEY_SLOTS.includes(keySlot || '') || args.some(arg => !arg.startsWith('--owner=') && !arg.startsWith('--key-slot=') && arg !== '--apply')) {
  throw new Error('Usage: npm run migrate:workspaces -- --owner=<existing-admin-id> --key-slot=AICREDITS_API_KEY_1 [--apply]. Without --apply all changes roll back.');
}
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query("SET LOCAL lock_timeout='5s'");
  for (const lock of [73462191, 73462194]) {
    const { rows: [row] } = await client.query('SELECT pg_try_advisory_xact_lock($1) AS acquired', [lock]);
    if (!row.acquired) throw new Error('Stop all app servers and workers before migration.');
  }
  const { rows: [owner] } = await client.query("SELECT id FROM users WHERE id=$1 AND role='admin' FOR UPDATE", [ownerId]);
  if (!owner) throw new Error('The selected owner must be an existing administrator.');
  await initializeWorkspaces(client);
  await assignKeySlot(client, ownerId, keySlot);
  const { rows: accounts } = await client.query('SELECT id FROM users ORDER BY created_at,id');
  for (const account of accounts) await assignKeySlot(client, account.id);
  const counts: Record<string, number> = {};
  for (const table of ['sku_data', 'jobs', 'idq_jobs']) {
    if (!(await client.query('SELECT to_regclass($1) AS relation', [table])).rows[0].relation) continue;
    await client.query(`LOCK TABLE ${table} IN ACCESS EXCLUSIVE MODE`);
    await client.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS owner_id text REFERENCES users(id) ON DELETE RESTRICT`);
    const result = await client.query(`UPDATE ${table} SET owner_id=$1 WHERE owner_id IS NULL`, [ownerId]);
    counts[table] = result.rowCount || 0;
    await client.query(`ALTER TABLE ${table} ALTER COLUMN owner_id SET NOT NULL`);
  }
  // Remove any legacy single-column SKU uniqueness, including Drizzle's constraint name.
  const { rows: constraints } = await client.query(`SELECT conname FROM pg_constraint WHERE conrelid='sku_data'::regclass AND contype='u' AND conkey=ARRAY[(SELECT attnum FROM pg_attribute WHERE attrelid='sku_data'::regclass AND attname='sku')]::smallint[]`);
  for (const { conname } of constraints) await client.query(`ALTER TABLE sku_data DROP CONSTRAINT "${conname.replaceAll('"', '""')}"`);
  await client.query('DROP INDEX IF EXISTS sku_data_sku_unique');
  await client.query('CREATE UNIQUE INDEX IF NOT EXISTS sku_data_owner_sku_unique ON sku_data(owner_id,sku)');
  if ((await client.query("SELECT to_regclass('idq_jobs') AS relation")).rows[0].relation) {
    await client.query('ALTER TABLE idq_jobs DROP CONSTRAINT IF EXISTS idq_jobs_actor_id_request_id_key');
    await client.query('DROP INDEX IF EXISTS idq_jobs_actor_id_request_id_key');
    await client.query('CREATE UNIQUE INDEX IF NOT EXISTS idq_jobs_owner_id_actor_id_request_id_key ON idq_jobs(owner_id,actor_id,request_id)');
    await client.query(`UPDATE idq_jobs j SET configuration=jsonb_set(configuration,'{settings,providerKeySlot}',to_jsonb(a.key_slot)) FROM user_key_assignments a WHERE a.user_id=j.owner_id AND status IN ('queued','running','cancelling')`);
  }
  if ((await client.query("SELECT to_regclass('job_runs') AS relation")).rows[0].relation) {
    await client.query(`UPDATE job_runs r SET configuration=jsonb_set(r.configuration,'{settings,providerKeySlot}',to_jsonb(a.key_slot)) FROM jobs j JOIN user_key_assignments a ON a.user_id=j.owner_id WHERE j.id=r.job_id AND r.status IN ('queued','running','cancelling')`);
  }
  await client.query(apply ? 'COMMIT' : 'ROLLBACK');
  console.log(JSON.stringify({ applied: apply, ownerId, keySlot, assignedAccounts: accounts.length, migratedRecords: counts }));
  if (!apply) console.log('Dry run rolled back. Repeat with --apply after reviewing the owner and taking a backup.');
} catch (error) { await client.query('ROLLBACK'); throw error; }
finally { client.release(); await pool.end(); }
