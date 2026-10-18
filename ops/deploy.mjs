import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { existsSync, readFileSync, realpathSync, renameSync, rmSync, symlinkSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import dotenv from 'dotenv';
import pg from 'pg';

const run = promisify(execFile);
const root = '/opt/paxth-qa';
const shaPattern = /^[a-f0-9]{40}$/;
export const validOrigin = value => /^https:\/\/[a-z0-9-]+\.trycloudflare\.com$/.test(value);
const metadata = directory => JSON.parse(readFileSync(path.join(directory, 'release.json'), 'utf8'));
const control = action => run('/usr/bin/sudo', ['-n', '/usr/bin/systemctl', action, 'paxth-qa.service'], { timeout: 35000 });

export async function withIdleDatabase(client, stop) {
  await client.query('BEGIN');
  try {
    await client.query("SET LOCAL idle_in_transaction_session_timeout = '45s'");
    // Locks cover both queues, including requests that were already being validated.
    await client.query('LOCK TABLE job_runs, idq_jobs IN SHARE MODE NOWAIT');
    const { rows } = await client.query("SELECT 1 FROM job_runs WHERE status IN ('queued','running','cancelling') UNION ALL SELECT 1 FROM idq_jobs WHERE status IN ('queued','running','cancelling') LIMIT 1");
    if (rows.length) throw new Error('Deployment deferred: QA/IDQ jobs are active. Retry after they finish.');
    await stop();
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    if (error.code === '55P03') throw new Error('Deployment deferred: a job transaction is active. Retry later.');
    throw error;
  }
}

function point(base, name, directory) {
  const temporary = path.join(base, name + '.next');
  rmSync(temporary, { force: true });
  symlinkSync(path.relative(base, directory), temporary);
  renameSync(temporary, path.join(base, name));
}

export async function ready(commit, base = root) {
  const origin = dotenv.parse(readFileSync(path.join(base, 'state/origin.env'))).APP_ORIGIN;
  assert.ok(validOrigin(origin), 'Missing or invalid preview origin.');
  const until = Date.now() + 90000;
  let lastFailure = '';
  while (Date.now() < until) {
    try {
      for (const address of ['http://127.0.0.1:3200', origin]) {
        const health = await fetch(address + '/healthz', { redirect: 'error', signal: AbortSignal.timeout(20000) });
        assert.equal(health.status, 200);
        assert.equal((await health.json()).status, 'ready');
        const version = await fetch(address + '/version.json', { redirect: 'error', signal: AbortSignal.timeout(3000) });
        assert.equal(version.status, 200);
        assert.equal((await version.json()).commit, commit);
        const session = await fetch(address + '/api/auth/me', { redirect: 'error', signal: AbortSignal.timeout(3000) });
        assert.equal(session.status, 401, 'Anonymous API access must remain protected.');
      }
      return true;
    } catch (error) { lastFailure = error.message; await delay(1000); }
  }
  console.error('Readiness check failed: ' + lastFailure);
  return false;
}

export async function activate(commit, client, { base = root, service = control, probe = ready, allowSchemaChange = false, origin } = {}) {
  assert.match(commit || '', shaPattern, 'Invalid release SHA.');
  if (origin !== undefined) assert.ok(validOrigin(origin), 'Invalid preview origin.');
  const release = path.join(base, 'releases', commit);
  assert.equal(realpathSync(release), release, 'Release must be a real directory inside releases.');
  const next = metadata(release);
  assert.equal(next.commit, commit, 'Release metadata does not match the requested SHA.');
  assert.match(next.schema, /^[a-f0-9]{64}$/);
  const current = path.join(base, 'current');
  const blocked = path.join(base, 'state/deployment-failed');
  if (existsSync(blocked) && !allowSchemaChange) throw new Error('Previous deployment requires manual recovery review. Retry with --allow-schema-change after review.');
  const previous = existsSync(current) ? realpathSync(current) : undefined;
  const changedSchema = previous && metadata(previous).schema !== next.schema;
  if (changedSchema && !allowSchemaChange) throw new Error('Startup/schema modules changed. Back up and review migrations, then deploy manually with --allow-schema-change.');
  if (!origin) assert.ok(validOrigin(dotenv.parse(readFileSync(path.join(base, 'state/origin.env'))).APP_ORIGIN), 'Wait for the HTTPS tunnel before deploying.');
  let stopAttempted = false, newStarted = false;
  try {
    await withIdleDatabase(client, async () => { stopAttempted = true; await service('stop'); });
    if (origin) {
      const temporary = path.join(base, 'state/origin.env.next');
      writeFileSync(temporary, `APP_ORIGIN=${origin}\n`, { mode: 0o600 });
      renameSync(temporary, path.join(base, 'state/origin.env'));
      writeFileSync(path.join(base, 'state/url.txt'), origin + '\n', { mode: 0o600 });
    }
    point(base, 'current', release);
    rmSync(blocked, { force: true });
    newStarted = true;
    await service('start');
    if (!await probe(commit, base)) throw new Error('Release failed local/public readiness or authentication checks.');
    if (previous && previous !== release) point(base, 'previous', previous);
    writeFileSync(path.join(base, 'state/deployed-' + commit), '');
    const keep = new Set([release, existsSync(path.join(base, 'previous')) && realpathSync(path.join(base, 'previous'))]);
    for (const entry of readdirSync(path.join(base, 'releases'), { withFileTypes: true })) {
      const directory = path.join(base, 'releases', entry.name);
      const marker = path.join(base, 'state/deployed-' + entry.name);
      if (entry.isDirectory() && shaPattern.test(entry.name) && !keep.has(directory) && existsSync(marker)) {
        rmSync(directory, { recursive: true });
        rmSync(marker);
      }
    }
    console.log(`Deployed ${commit}`);
  } catch (error) {
    if (stopAttempted) {
      await service('stop').catch(() => {});
      if (previous && (!changedSchema || !newStarted)) {
        point(base, 'current', previous);
        await service('start');
        if (!await probe(metadata(previous).commit, base)) {
          await service('stop').catch(() => {});
          writeFileSync(blocked, 'Deployment and rollback readiness failed.\n');
          throw new Error('Deployment and rollback readiness failed; app stopped. Inspect the app service.');
        }
        console.error('Previous compatible release restored.');
      } else if (previous) {
        writeFileSync(blocked, 'Schema-changing release requires manual recovery.\n');
        throw new Error('Schema-changing release failed; app stopped. Restore service only after reviewing database compatibility.');
      } else {
        rmSync(current, { force: true });
      }
    }
    throw error;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [requested, ...flags] = process.argv.slice(2);
  const commit = requested === '--refresh-origin' ? metadata(path.join(root, 'current')).commit : requested;
  const originFlag = flags.find(flag => flag.startsWith('--origin='));
  assert.ok(flags.every(flag => flag === '--allow-schema-change' || flag === originFlag), 'Unsupported deployment option.');
  const env = dotenv.parse(readFileSync('/etc/paxth-qa/app.env'));
  const client = new pg.Client({ connectionString: env.DATABASE_URL, connectionTimeoutMillis: 10000, statement_timeout: 15000, query_timeout: 20000 });
  client.on('error', () => {});
  try {
    await client.connect();
    await activate(commit, client, { allowSchemaChange: flags.includes('--allow-schema-change'), origin: originFlag?.slice('--origin='.length) });
    console.log('URL: ' + readFileSync(path.join(root, 'state/url.txt'), 'utf8').trim());
  } catch (error) {
    // Provider and connection errors must not echo server credentials into Actions logs.
    console.error(error.code ? `Deployment failed (${error.code}). Inspect the protected server logs.` : error.message);
    process.exitCode = 1;
  } finally { await client.end().catch(() => {}); }
}
