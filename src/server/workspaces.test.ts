import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import express from 'express';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import { initializeAuth, registerAuth, hashSessionToken } from './auth';
import { initializeDatabase, verifySchema } from './database';
import { initializeQaConfiguration } from '../db/qaConfiguration';
import { initializeProvider, registerProviderRoutes, getProviderCredentials } from './provider';
import { initializeJobRuns, registerJobRunRoutes, executeRun } from './jobRunner';
import { initializeIdq, registerIdqRoutes, executeIdqJob } from './idqJobs';
import { registerCatalogRoutes, ApiError } from './catalog';
import { registerJobImageRoutes } from './jobImages';
import { registerDocumentIngestionRoutes } from './documentIngestion';
import { ProviderError } from '../lib/chatCompletion';
import { DEFAULT_SETTINGS } from '../lib/providerSettings';
import { startWorkScheduler } from './workScheduler';
import { assignKeySlot, configuredKeySlots } from './workspaces';

assert.ok(process.env.TEST_DATABASE_URL, 'Use a disposable TEST_DATABASE_URL.');
const namespace = `workspaces_${randomUUID().replaceAll('-', '')}`;
const root = new Pool({ connectionString: process.env.TEST_DATABASE_URL });
await root.query(`CREATE SCHEMA ${namespace}`);
const pool = new Pool({ connectionString: process.env.TEST_DATABASE_URL, options: `-c search_path=${namespace}`, max: 10 });
const app = express();
const http = app.listen(0, '127.0.0.1');
await new Promise<void>(resolve => http.once('listening', resolve));
const origin = `http://127.0.0.1:${(http.address() as any).port}`;
process.env.APP_ORIGIN = origin; process.env.NODE_ENV = 'test';
for (let slot = 1; slot <= 5; slot++) process.env[`AICREDITS_API_KEY_${slot}`] = `workspace-key-${slot}`;
const nativeFetch = globalThis.fetch;
let stop: (() => Promise<void>) | undefined, standby: (() => Promise<void>) | undefined;
const cookies: Record<string, string> = {};
const waitFor = async (test: () => Promise<boolean>, description: string) => {
  for (let count = 0; count < 400; count++) { if (await test()) return; await delay(25); }
  throw new Error(`Timed out: ${description}`);
};
const request = async (actor: string, path: string, method = 'GET', body?: unknown, workspace?: string) => {
  const result = await nativeFetch(origin + '/api' + path, { method, headers: { Origin: origin, Cookie: cookies[actor], 'Content-Type': 'application/json', ...(workspace ? { 'X-Workspace-Id': workspace } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  return { status: result.status, body: await result.json() };
};
try {
  await initializeAuth(pool); await initializeDatabase(pool); await initializeQaConfiguration(drizzle(pool, { schema }));
  await initializeProvider(pool); await initializeJobRuns(pool); await initializeIdq(pool); await verifySchema(pool);
  const accounts = ['admin', 'alice', 'bob', 'carol'];
  for (const id of accounts) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN'); await assignKeySlot(client, id);
      await client.query('INSERT INTO users(id,username,password,role) VALUES($1,$1,$2,$3)', [id, 'unused', id === 'admin' ? 'admin' : 'user']);
      await client.query('COMMIT');
    } finally { client.release(); }
    const token = randomBytes(32).toString('hex'); cookies[id] = `paxth_session=${token}`;
    await pool.query("INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '1 hour')", [hashSessionToken(token), id]);
  }
  registerAuth(app, pool); registerCatalogRoutes(app, pool); registerJobRunRoutes(app, pool);
  registerIdqRoutes(app, pool); registerProviderRoutes(app, pool); registerJobImageRoutes(app, pool); registerDocumentIngestionRoutes(app, pool);
  app.use((error: any, _req: any, res: any, _next: any) => res.status(error instanceof ApiError || error instanceof ProviderError ? error.status : 503).json({ error: error.message }));
  const anonymous = await nativeFetch(origin + '/api/catalog', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: '{' });
  assert.equal(anonymous.status, 401, 'Authentication precedes parsing large upload bodies');
  const product = (index: number, owner: string) => ({ sku: `sku-${index}`, source: { sap: `${owner} product source` }, raw_row: { sku: `sku-${index}` }, upload_attributes: {}, status: 'ready' });
  const runs: Record<string, string> = {};
  for (const id of accounts) {
    const uploaded = await request(id, '/catalog', 'POST', Array.from({ length: 50 }, (_, index) => product(index, id)));
    assert.equal(uploaded.status, 200); assert.equal(uploaded.body.inserted.length, 50);
    assert.equal((await request(id, '/jobs', 'POST', { id: `job-${id}`, name: id, skus: uploaded.body.inserted.map((row: any) => row.sku) })).status, 201);
    const run = await request(id, `/jobs/job-${id}/runs`, 'POST', { requestId: randomUUID(), mode: 'all' });
    assert.equal(run.status, 202); runs[id] = run.body.id;
  }
  assert.equal((await pool.query('SELECT count(*) FROM sku_data')).rows[0].count, '200', 'Duplicate SKUs belong independently to each workspace');
  assert.equal((await request('alice', '/catalog')).body.length, 50);
  assert.match((await request('alice', '/catalog')).body[0].source.sap, /alice/);
  assert.equal((await request('alice', '/catalog', 'GET', undefined, 'bob')).status, 404);
  for (const path of [`/job-runs/${runs.bob}`, '/jobs/job-bob/runs', '/jobs/job-bob/outputs', `/job-runs/${runs.bob}/items/sku-0/images/0`]) assert.equal((await request('alice', path)).status, 404, path);
  assert.equal((await request('alice', `/job-runs/${runs.bob}/cancel`, 'POST', {})).status, 404);
  assert.equal((await request('alice', `/job-runs/${runs.bob}/items/sku-0/images`, 'PUT', { selectedImageUrls: [], expectedSelectedImageUrls: [] })).status, 404);
  assert.equal((await request('alice', '/catalog', 'POST', [{ ...product(1, 'alice'), owner_id: 'bob' }])).status, 400);
  assert.equal((await request('alice', '/catalog/sku-0', 'PUT', { expectedRevision: 0, owner_id: 'bob' })).status, 400);
  assert.equal((await request('admin', '/catalog', 'GET', undefined, 'bob')).body.length, 50);
  assert.equal((await request('admin', '/users/bob', 'DELETE')).status, 409, 'Owned data prevents account deletion');
  assert.equal((await request('alice', '/workspace-provider-settings', 'PUT', { modelName: 'forged' })).status, 403);
  assert.equal((await request('admin', '/workspace-provider-settings', 'PUT', { modelName: 'workspace-model', temperature: 0.3 }, 'alice')).status, 200);
  assert.equal((await request('alice', '/workspace-provider-settings')).body.modelName, 'workspace-model');
  assert.equal((await request('bob', '/workspace-provider-settings')).body.modelName, DEFAULT_SETTINGS.modelName);
  const frozen = (await pool.query('SELECT configuration FROM job_runs WHERE id=$1', [runs.alice])).rows[0].configuration;
  assert.equal(frozen.settings.modelName, DEFAULT_SETTINGS.modelName, 'Existing jobs keep their settings snapshot');
  assert.equal(frozen.settings.providerKeySlot, 'AICREDITS_API_KEY_2');
  assert.doesNotMatch(JSON.stringify(frozen), /workspace-key-/);
  // Only one of two concurrent account creations can claim the fifth slot.
  const created = await Promise.all(['eve', 'frank'].map(username => request('admin', '/users', 'POST', { username, password: 'test-only-long-password', role: 'user' })));
  assert.deepEqual(created.map(result => result.status).sort(), [201, 409]);
  const winner = created.find(result => result.status === 201)!.body;
  assert.equal(winner.keySlot, 'AICREDITS_API_KEY_5');
  assert.equal((await pool.query('SELECT count(*) FROM users')).rows[0].count, '5');
  assert.equal((await request('admin', `/users/${winner.id}`, 'DELETE')).status, 200);
  assert.equal((await request('admin', '/users', 'POST', { username: 'replacement', password: 'test-only-long-password', role: 'user' })).status, 409, 'Deleted users do not release their permanent key slot');
  process.env.AICREDITS_API_KEY_5 = 'workspace-key-4'; assert.throws(configuredKeySlots, /distinct/); process.env.AICREDITS_API_KEY_5 = 'workspace-key-5';
  delete process.env.AICREDITS_API_KEY_2; assert.throws(() => getProviderCredentials('AICREDITS_API_KEY_2'), /assigned workspace API key/); process.env.AICREDITS_API_KEY_2 = 'workspace-key-2';

  // A queued IDQ job must wait behind Alice's QA, while three other workspaces keep progressing.
  const idqId = randomUUID();
  await pool.query("INSERT INTO idq_jobs(id,owner_id,request_id,actor_id,actor_name,name,configuration) VALUES($1,'alice',$1,'admin','admin','Queued IDQ',$2)", [idqId, JSON.stringify({ mode: 'scraped', settings: { ...DEFAULT_SETTINGS, providerKeySlot: 'AICREDITS_API_KEY_2' }, mappings: [], limits: {} })]);
  for (const suffix of ['', '/export']) assert.equal((await request('bob', `/idq/jobs/${idqId}${suffix}`)).status, 404);
  for (const action of ['cancel', 'resume']) assert.equal((await request('bob', `/idq/jobs/${idqId}/${action}`, 'POST')).status, 404);
  assert.deepEqual((await request('bob', '/idq/jobs')).body, []);
  let active = 0, peak = 0, paid = 0, held = true;
  const activeByKey = new Map<string, number>(), counts = new Map<string, number>();
  globalThis.fetch = async (url, init) => {
    assert.equal(String(url), 'https://aicredits.in/v1/chat/completions');
    const key = new Headers(init?.headers).get('authorization')!;
    const keyActive = (activeByKey.get(key) || 0) + 1; activeByKey.set(key, keyActive);
    assert.equal(keyActive, 1, 'SKUs in one workspace execute sequentially');
    active++; peak = Math.max(peak, active); paid++; counts.set(key, (counts.get(key) || 0) + 1);
    try {
      while (held) await delay(10, undefined, { signal: init?.signal ?? undefined });
      await delay(3, undefined, { signal: init?.signal ?? undefined });
      return Response.json({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ qa_status: 'pass', confidence: 'high', summary: 'Matches source', issue_count: 0, issues: [], source_notes: { sap_used: true, url_used: false, source_conflicts: [] } }) } }], usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 } });
    } finally { active--; activeByKey.set(key, keyActive - 1); }
  };
  stop = startWorkScheduler(pool, { qa: executeRun, idq: executeIdqJob });
  standby = startWorkScheduler(pool, { qa: executeRun, idq: executeIdqJob });
  await waitFor(async () => active === 4, 'four overlapping workspace jobs');
  assert.equal((await pool.query('SELECT status FROM idq_jobs WHERE id=$1', [idqId])).rows[0].status, 'queued');
  assert.equal((await pool.query("SELECT count(*) FROM job_runs WHERE status='running'")).rows[0].count, '4');
  held = false;
  await waitFor(async () => (await pool.query("SELECT count(*) FROM job_runs WHERE status='completed'")).rows[0].count === '4', 'all 200 SKUs');
  await waitFor(async () => (await pool.query('SELECT status FROM idq_jobs WHERE id=$1', [idqId])).rows[0].status === 'completed', 'IDQ runs after QA');
  assert.equal(paid, 200); assert.equal(peak, 4); assert.equal(counts.size, 4);
  for (const count of counts.values()) assert.equal(count, 50);
  for (const id of accounts) {
    const { rows } = await pool.query('SELECT last_job_id,qa_result FROM sku_data WHERE owner_id=$1', [id]);
    assert.ok(rows.every(row => row.last_job_id === `job-${id}` && row.qa_result?.qa_status === 'warning'), 'Result persistence stays inside its workspace');
  }
  await standby(); standby = undefined; await stop(); stop = undefined;
  // Recover four interrupted workspaces without rerunning any of the 200 saved SKU results.
  const resumed: string[] = [];
  for (const id of accounts) {
    assert.equal((await request(id, '/jobs', 'POST', { id: 'recovery-' + id, name: 'Recovery', skus: ['sku-0', 'sku-1'] })).status, 201);
    if (id === 'alice') {
      const probe = await request('admin', '/jobs/recovery-alice/runs', 'POST', { requestId: randomUUID(), mode: 'all' }, 'alice');
      assert.equal(probe.status, 202);
      assert.equal((await request('alice', '/job-runs/' + probe.body.id + '/cancel', 'POST', {})).body.status, 'cancelled', 'Workspace owners can cancel an admin-started queued run');
    }
    const run = await request(id === 'alice' ? 'admin' : id, '/jobs/recovery-' + id + '/runs', 'POST', { requestId: randomUUID(), mode: 'all' }, id === 'alice' ? 'alice' : undefined);
    if (id === 'alice') assert.equal(run.body.actorId, 'admin');
    assert.equal(run.status, 202); resumed.push(run.body.id);
  }
  const paidBeforeRestart = paid; held = true;
  stop = startWorkScheduler(pool, { qa: executeRun, idq: executeIdqJob });
  await waitFor(async () => active === 4, 'four jobs before restart');
  await stop(); stop = undefined;
  assert.equal(active, 0); assert.equal(paid, paidBeforeRestart + 4);
  const beforeRestart = await pool.query('SELECT attempts FROM job_run_items WHERE run_id=ANY($1) AND position=0', [resumed]);
  assert.ok(beforeRestart.rows.every(row => row.attempts === 1));
  held = false; stop = startWorkScheduler(pool, { qa: executeRun, idq: executeIdqJob });
  await waitFor(async () => (await pool.query("SELECT count(*) FROM job_runs WHERE id=ANY($1) AND status='completed'", [resumed])).rows[0].count === '4', 'four recovered jobs');
  assert.equal(paid, paidBeforeRestart + 12, 'Only interrupted attempts and the eight new items dispatch; completed history is preserved');
  assert.ok((await pool.query('SELECT attempts FROM job_run_items WHERE run_id=ANY($1) AND position=0', [resumed])).rows.every(row => row.attempts === 2));
  await stop(); stop = undefined;
  assert.equal((await request('bob', '/catalog', 'POST', [product(999, 'bob')])).status, 200);
  assert.equal((await request('alice', '/catalog/sku-999/ingest', 'POST', { expectedRevision: 0, fileName: 'source.pdf', dataBase64: 'not-a-file' })).status, 404, 'Document ingestion cannot access another owner’s SKU');
  assert.equal((await request('admin', '/data', 'DELETE', undefined, 'bob')).status, 200);
  assert.equal((await request('bob', '/catalog')).body.length, 0);
  assert.equal((await request('bob', '/jobs')).body.length, 0);
  assert.equal((await request('alice', '/catalog')).body.length, 50, 'Clear Data affects only the selected workspace');
  assert.equal((await request('alice', '/idq/jobs')).body.length, 1);
  console.log('Workspace checks passed: isolation, private duplicate SKUs, key race/exhaustion/deletion, frozen settings, mixed queues, two scheduler instances, 200 QA SKUs, four concurrent calls and per-key attribution.');
} finally {
  await stop?.(); await standby?.(); globalThis.fetch = nativeFetch;
  http.closeAllConnections(); await new Promise<void>(resolve => http.close(() => resolve()));
  await pool.end(); await root.query(`DROP SCHEMA ${namespace} CASCADE`); await root.end();
}
