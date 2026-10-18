import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, realpathSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import pg from 'pg';
import { activate, validOrigin, withIdleDatabase } from '../ops/deploy.mjs';

const base = mkdtempSync(path.join(tmpdir(), 'paxth-deploy-test-'));
const a = 'a'.repeat(40), b = 'b'.repeat(40), c = 'c'.repeat(40);
const actions = [];
let busy = false;
const client = { query: async sql => ({ rows: sql.startsWith('SELECT 1') && busy ? [{}] : [] }) };
const service = async action => { actions.push(action); };
const options = { base, service, probe: async () => true };
function release(commit, schema = '1'.repeat(64)) {
  const directory = path.join(base, 'releases', commit);
  mkdirSync(directory, { recursive: true });
  writeFileSync(path.join(directory, 'release.json'), JSON.stringify({ commit, schema }));
  return directory;
}
try {
  mkdirSync(path.join(base, 'state'));
  writeFileSync(path.join(base, 'state/origin.env'), 'APP_ORIGIN=https://paxth-test.trycloudflare.com\n');
  release(a); release(b); release(c, '2'.repeat(64));
  assert.ok(validOrigin('https://paxth-test.trycloudflare.com'));
  for (const origin of ['http://paxth.trycloudflare.com', 'https://evil.example', 'https://x.trycloudflare.com/extra', 'https://x.trycloudflare.com.evil.example']) assert.ok(!validOrigin(origin));
  await assert.rejects(activate('../escape', client, options), /Invalid release/);
  await assert.rejects(activate(a, client, { ...options, probe: async () => false }), /readiness/);
  assert.ok(!existsSync(path.join(base, 'current')), 'A failed first release cannot start on the next reboot.');
  actions.length = 0;
  await activate(a, client, options);
  assert.equal(realpathSync(path.join(base, 'current')), path.join(base, 'releases', a));
  busy = true; actions.length = 0;
  await assert.rejects(activate(b, client, options), /jobs are active/);
  assert.deepEqual(actions, [], 'A busy app is never stopped or restarted.');
  assert.equal(realpathSync(path.join(base, 'current')), path.join(base, 'releases', a));
  busy = false;
  await assert.rejects(activate(b, client, { ...options, probe: async commit => commit === a }), /readiness/);
  assert.equal(realpathSync(path.join(base, 'current')), path.join(base, 'releases', a), 'Failed readiness restores the previous release.');
  actions.length = 0;
  await assert.rejects(activate(c, client, options), /schema modules changed/);
  assert.deepEqual(actions, [], 'Unreviewed schema changes leave the running app untouched.');
  await assert.rejects(activate(b, client, { ...options, probe: async () => false }), /Deployment and rollback readiness failed/);
  assert.ok(existsSync(path.join(base, 'state/deployment-failed')));
  await assert.rejects(activate(a, client, options), /manual recovery review/);
  await activate(a, client, { ...options, allowSchemaChange: true });
  assert.ok(!existsSync(path.join(base, 'state/deployment-failed')), 'A reviewed retry clears the boot-time block.');
  await activate(b, client, options);
  assert.equal(realpathSync(path.join(base, 'previous')), path.join(base, 'releases', a));
  assert.ok(existsSync(path.join(base, 'releases', c)), 'Do not remove a pending release during another deployment.');
  actions.length = 0;
  await assert.rejects(activate(c, client, { ...options, allowSchemaChange: true, probe: async () => false }), /Schema-changing release failed/);
  assert.deepEqual(actions, ['stop', 'start', 'stop'], 'Never downgrade automatically after an explicit schema-changing release.');
  assert.ok(existsSync(path.join(base, 'state/deployment-failed')), 'Block boot-time startup until schema failure is reviewed.');
  const queries = [];
  await assert.rejects(withIdleDatabase({ query: async sql => { queries.push(sql); if (sql.startsWith('LOCK')) throw Object.assign(new Error(), { code: '55P03' }); return { rows: [] }; } }, async () => assert.fail('must not stop')), /transaction is active/);
  assert.equal(queries.at(-1), 'ROLLBACK');
  console.log('Deployment checks passed: busy queues, rollback, schema gates, path/origin validation and pending-release retention.');
} finally { rmSync(base, { recursive: true, force: true }); }

if (process.env.TEST_DATABASE_URL) {
  const namespace = 'deploy_' + crypto.randomUUID().replaceAll('-', '');
  const pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
  const first = await pool.connect(), second = await pool.connect();
  try {
    await first.query(`CREATE SCHEMA ${namespace}; SET search_path=${namespace}; CREATE TABLE job_runs(status text); CREATE TABLE idq_jobs(status text)`);
    await second.query(`SET search_path=${namespace}; SET statement_timeout='2s'`);
    let inserted = false;
    await withIdleDatabase(first, async () => {
      const pending = second.query("INSERT INTO idq_jobs VALUES ('queued')").then(() => { inserted = true; });
      await new Promise(resolve => setTimeout(resolve, 100));
      assert.equal(inserted, false, 'Queue submissions cannot commit during the idle check/service stop.');
      // Resolve outside this callback, after COMMIT releases the queue locks.
      second.pending = pending;
    });
    await second.pending;
    await assert.rejects(withIdleDatabase(first, async () => assert.fail('busy queue must not stop')), /jobs are active/);
    await second.query('BEGIN'); await second.query("INSERT INTO job_runs VALUES ('running')");
    await assert.rejects(withIdleDatabase(first, async () => assert.fail('locked queue must not stop')), /transaction is active/);
    await second.query('ROLLBACK');
    console.log('Real PostgreSQL deployment checks passed: blocked concurrent submissions, active jobs and lock contention.');
  } finally {
    await second.query('ROLLBACK').catch(() => {});
    await first.query(`DROP SCHEMA ${namespace} CASCADE`);
    first.release(); second.release(); await pool.end();
  }
}
