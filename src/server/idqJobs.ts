import { randomUUID } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import type { Express } from 'express';
import type { Pool, PoolClient } from 'pg';
import { ApiError } from './catalog';
import { transaction } from './database';
import { getProviderCredentials, getProviderSettings } from './provider';
import { getScraperApiKey } from '../lib/cloudScrape';
import { resolvePublicAddress, validateScrapeInput } from '../lib/scrapeNetwork';
import { emptyIdqProgress, IDQ_LIMITS, idqBaseResult, validateIdqInput, type IdqConfig, type IdqProgress } from '../lib/idq';
import { idqTemplate, idqWorkbook } from '../lib/idqExcel';
import { runIdqProduct } from './idqResearch';
import type { AttributeSet } from '../types';

const WORKER_LOCK = 73462194;
const ACTIVE = ['queued', 'running', 'cancelling'];
const TERMINAL = ['completed', 'needs_review'];
export async function initializeIdq(pool: Pool) {
  await pool.query(`CREATE TABLE IF NOT EXISTS idq_jobs (
    id text PRIMARY KEY, request_id text NOT NULL, actor_id text NOT NULL, actor_name text NOT NULL,
    name text NOT NULL, status text NOT NULL DEFAULT 'queued' CHECK(status IN ('queued','running','cancelling','cancelled','completed','needs_review','failed')),
    configuration jsonb NOT NULL, owner_token text, created_at timestamptz NOT NULL DEFAULT now(),
    started_at timestamptz, finished_at timestamptz, error text, UNIQUE(actor_id,request_id)
  );
  CREATE TABLE IF NOT EXISTS idq_items (
    job_id text NOT NULL REFERENCES idq_jobs(id) ON DELETE CASCADE, position integer NOT NULL,
    input jsonb NOT NULL, progress jsonb NOT NULL DEFAULT '{}', result jsonb,
    status text NOT NULL DEFAULT 'queued' CHECK(status IN ('queued','running','cancelled','completed','needs_review','failed')),
    started_at timestamptz, finished_at timestamptz, error text, PRIMARY KEY(job_id,position)
  );`);
}
const mapSet = (row: any): AttributeSet => ({ id: row.id, name: row.name, rulesMarkdown: row.rules_markdown, catalogHeaders: row.catalog_headers,
  catalogHeaderRequirements: row.catalog_header_requirements, createdAt: new Date(row.created_at).getTime(), updatedAt: new Date(row.updated_at).getTime() });
const summary = (row: any) => ({ id: row.id, name: row.name, actorId: row.actor_id, actorName: row.actor_name, status: row.status,
  mode: row.configuration.mode, modelName: row.configuration.settings.modelName, createdAt: row.created_at, startedAt: row.started_at, finishedAt: row.finished_at, error: row.error,
  total: Number(row.total || 0), finished: Number(row.finished || 0) });
const summaryQuery = `SELECT j.*, (SELECT count(*) FROM idq_items i WHERE i.job_id=j.id) AS total,
  (SELECT count(*) FROM idq_items i WHERE i.job_id=j.id AND i.status IN ('completed','needs_review','failed')) AS finished FROM idq_jobs j`;
export async function readIdqJob(pool: Pool | PoolClient, id: string) {
  const { rows: [job] } = await pool.query(`${summaryQuery} WHERE j.id=$1`, [id]);
  if (!job) throw new ApiError(404, 'IDQ batch does not exist.');
  const { rows } = await pool.query('SELECT * FROM idq_items WHERE job_id=$1 ORDER BY position', [id]);
  return { ...summary(job), mappings: job.configuration.mappings, limits: job.configuration.limits, items: rows.map(item => ({
    position: item.position, url: item.input.url, attributeSet: item.input.attributeSet, status: item.status,
    stage: item.progress.stage || 'Waiting', searches: item.progress.searches?.length || 0, reads: item.progress.reads?.length || 0,
    result: item.result || item.progress.result || idqBaseResult(item.input, job.configuration.mappings.find((m: any) => m.name === item.input.attributeSet), { ...emptyIdqProgress(), ...item.progress }),
    error: item.error,
  })) };
}
export function registerIdqRoutes(app: Express, pool: Pool) {
  app.post('/api/idq/jobs/template', async (req, res, next) => {
    try {
      if (!Array.isArray(req.body?.attributeSetIds) || !req.body.attributeSetIds.length || req.body.attributeSetIds.some((id: unknown) => typeof id !== 'string') || new Set(req.body.attributeSetIds).size !== req.body.attributeSetIds.length) throw new ApiError(400, 'Choose at least one attribute set.');
      const { rows } = await pool.query('SELECT * FROM attribute_sets WHERE id=ANY($1::text[]) ORDER BY name', [req.body.attributeSetIds]);
      if (rows.length !== req.body.attributeSetIds.length) throw new ApiError(400, 'Unknown attribute set.');
      // Templates remain available while administrators finish classifying requirements.
      const mappings = rows.map(row => ({ id: row.id, name: row.name, headers: row.catalog_headers, requirements: row.catalog_header_requirements, rules: row.rules_markdown }));
      if (mappings.some(m => !m.headers.length)) throw new ApiError(400, 'Configure Catalog Output Headers for each selected set first.');
      const data = await idqTemplate(mappings);
      res.set({ 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': 'attachment; filename="IDQ-template.xlsx"', 'Cache-Control': 'no-store' }).send(Buffer.from(data));
    } catch (error) { next(error); }
  });
  app.post('/api/idq/jobs', async (req, res, next) => {
    try {
      if (!req.body || Object.keys(req.body).some(k => !['requestId','name','mode','sheets'].includes(k)) || typeof req.body.requestId !== 'string' || !/^[\w-]{16,100}$/.test(req.body.requestId) || typeof req.body.name !== 'string' || !req.body.name.trim() || req.body.name.length > 200) throw new ApiError(400, 'Supply a batch name, requestId, input mode and workbook sheets.');
      const actor = res.locals.user;
      const existing = await pool.query('SELECT id FROM idq_jobs WHERE actor_id=$1 AND request_id=$2', [actor.id, req.body.requestId]);
      if (existing.rows[0]) { res.json(await readIdqJob(pool, existing.rows[0].id)); return; }
      const { rows } = await pool.query('SELECT * FROM attribute_sets ORDER BY name');
      let input: ReturnType<typeof validateIdqInput>;
      try { input = validateIdqInput(req.body.mode, req.body.sheets, rows.map(mapSet)); }
      catch (error) { throw new ApiError(400, (error as Error).message); }
      // No model, search or crawl requests until the whole workbook passes public URL/DNS checks.
      for (const item of input.items) {
        try { const url = validateScrapeInput({ url: item.url }).url; await resolvePublicAddress(new URL(url)); }
        catch { throw new ApiError(400, `Product URL must resolve exclusively to public internet addresses: ${item.url}`); }
        const image = item.values.image_url;
        if (image?.trim()) { try { validateScrapeInput({ url: image }); } catch { throw new ApiError(400, 'Image URLs must be public HTTP(S) URLs without credentials.'); } }
      }
      getProviderCredentials();
      try { getScraperApiKey(); } catch (error) { throw new ApiError(503, (error as Error).message); }
      const settings = await getProviderSettings(pool);
      const configuration: IdqConfig = { mode: input.mode, mappings: input.mappings, settings, limits: { ...IDQ_LIMITS } };
      const id = await transaction(pool, async client => {
        const found = await client.query('SELECT id FROM idq_jobs WHERE actor_id=$1 AND request_id=$2', [actor.id, req.body.requestId]);
        if (found.rows[0]) return found.rows[0].id;
        const jobId = randomUUID();
        await client.query('INSERT INTO idq_jobs(id,request_id,actor_id,actor_name,name,configuration) VALUES($1,$2,$3,$4,$5,$6)',
          [jobId, req.body.requestId, actor.id, actor.username, req.body.name.trim(), JSON.stringify(configuration)]);
        for (const [position, item] of input.items.entries()) await client.query('INSERT INTO idq_items(job_id,position,input,progress) VALUES($1,$2,$3,$4)', [jobId, position, JSON.stringify(item), JSON.stringify(emptyIdqProgress())]);
        return jobId;
      });
      res.status(201).json(await readIdqJob(pool, id));
    } catch (error) { next(error); }
  });
  app.get('/api/idq/jobs', async (_req, res, next) => {
    try { res.set('Cache-Control', 'no-store').json((await pool.query(`${summaryQuery} ORDER BY j.created_at DESC LIMIT 100`)).rows.map(summary)); }
    catch (error) { next(error); }
  });
  app.get('/api/idq/jobs/:id', async (req, res, next) => {
    try { res.set('Cache-Control', 'no-store').json(await readIdqJob(pool, String(req.params.id))); } catch (error) { next(error); }
  });
  for (const action of ['cancel','resume']) app.post(`/api/idq/jobs/:id/${action}`, async (req, res, next) => {
    try {
      await transaction(pool, async client => {
        const { rows: [job] } = await client.query('SELECT * FROM idq_jobs WHERE id=$1 FOR UPDATE', [req.params.id]);
        if (!job) throw new ApiError(404, 'IDQ batch does not exist.');
        if (job.actor_id !== res.locals.user.id && res.locals.user.role !== 'admin') throw new ApiError(403, 'You can only change your own IDQ batches.');
        if (action === 'cancel' && job.status === 'queued') {
          await client.query("UPDATE idq_items SET status='cancelled' WHERE job_id=$1 AND status='queued'", [job.id]);
          await client.query("UPDATE idq_jobs SET status='cancelled',owner_token=NULL,finished_at=now() WHERE id=$1", [job.id]);
        } else if (action === 'cancel' && ACTIVE.includes(job.status)) await client.query("UPDATE idq_jobs SET status='cancelling' WHERE id=$1", [job.id]);
        if (action === 'resume') {
          if (!['cancelled','failed'].includes(job.status)) throw new ApiError(409, 'Only cancelled or failed batches can be resumed.');
          await client.query("UPDATE idq_items SET status='queued',error=NULL,finished_at=NULL WHERE job_id=$1 AND status IN ('cancelled','failed')", [job.id]);
          await client.query("UPDATE idq_jobs SET status='queued',owner_token=NULL,error=NULL,finished_at=NULL WHERE id=$1", [job.id]);
        }
      });
      res.json(await readIdqJob(pool, String(req.params.id)));
    } catch (error) { next(error); }
  });
  app.get('/api/idq/jobs/:id/export', async (req, res, next) => {
    try {
      const { rows: [job] } = await pool.query('SELECT * FROM idq_jobs WHERE id=$1', [req.params.id]);
      if (!job) throw new ApiError(404, 'IDQ batch does not exist.');
      const { rows } = await pool.query('SELECT * FROM idq_items WHERE job_id=$1 ORDER BY position', [job.id]);
      const data = await idqWorkbook(job.configuration.mappings, rows.map(row => ({ input: row.input, progress: { ...emptyIdqProgress(), ...row.progress }, result: row.result, status: row.status, error: row.error })));
      res.set({ 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': `attachment; filename="IDQ-${job.id}.xlsx"`, 'Cache-Control': 'no-store' }).send(Buffer.from(data));
    } catch (error) { next(error); }
  });
}

export function startIdqWorker(pool: Pool, run = runIdqProduct): () => Promise<void> {
  const stop = new AbortController();
  const task = (async () => {
    while (!stop.signal.aborted) {
      let client: PoolClient | undefined;
      const lost = new AbortController(), cancelled = new AbortController();
      const ownership = AbortSignal.any([stop.signal, lost.signal]);
      const onLoss = () => lost.abort(new Error('IDQ worker database ownership lost.'));
      let monitor: ReturnType<typeof setInterval> | undefined;
      try {
        client = await pool.connect(); client.on('error', onLoss); client.on('end', onLoss);
        const lock = await client.query('SELECT pg_try_advisory_lock($1) AS acquired', [WORKER_LOCK]);
        if (lock.rows[0].acquired) {
          const { rows: [next] } = await client.query('SELECT * FROM idq_jobs WHERE status=ANY($1::text[]) ORDER BY created_at LIMIT 1', [ACTIVE]);
          if (next) {
            const owner = randomUUID();
            const { rows: [job] } = await client.query("UPDATE idq_jobs SET status=CASE WHEN status='cancelling' THEN status ELSE 'running' END,owner_token=$2,started_at=COALESCE(started_at,now()) WHERE id=$1 AND status=ANY($3::text[]) RETURNING *", [next.id, owner, ACTIVE]);
            if (!job) continue;
            let checking = false;
            monitor = setInterval(async () => {
              if (checking) return; checking = true;
              try { const current = (await pool.query('SELECT status,owner_token FROM idq_jobs WHERE id=$1', [job.id])).rows[0]; if (current?.status !== 'running' || current.owner_token !== owner) cancelled.abort(); }
              catch { /* The dedicated connection fences ownership while checkpoints retry. */ } finally { checking = false; }
            }, 300);
            const execution = AbortSignal.any([ownership, cancelled.signal]);
            while (!execution.aborted && job.status !== 'cancelling') {
              const { rows: [item] } = await client.query("UPDATE idq_items SET status='running',started_at=COALESCE(started_at,now()) WHERE job_id=$1 AND position=(SELECT position FROM idq_items WHERE job_id=$1 AND status IN ('queued','running') ORDER BY position LIMIT 1) RETURNING *", [job.id]);
              if (!item) break;
              const progress: IdqProgress = { ...emptyIdqProgress(), ...item.progress };
              const mapping = job.configuration.mappings.find((m: any) => m.name === item.input.attributeSet);
              const checkpoint = async (state: IdqProgress) => {
                // Retain every paid response in memory while retrying only its database save.
                while (!ownership.aborted) {
                  try {
                    const saved = await client!.query(`UPDATE idq_items SET progress=$3 WHERE job_id=$1 AND position=$2 AND EXISTS
                      (SELECT 1 FROM idq_jobs WHERE id=$1 AND owner_token=$4 AND status IN ('running','cancelling'))
                      RETURNING position,(SELECT status FROM idq_jobs WHERE id=$1) AS job_status`, [job.id, item.position, JSON.stringify(state), owner]);
                    if (!saved.rowCount) throw new ApiError(409, 'IDQ ownership lost.');
                    if (saved.rows[0].job_status === 'cancelling') cancelled.abort();
                    return;
                  } catch (error) { if (error instanceof ApiError) throw error; await delay(1000, undefined, { signal: ownership }); }
                }
                ownership.throwIfAborted();
              };
              try {
                const result = progress.result || await run(item.input, mapping, job.configuration, progress, execution, checkpoint);
                progress.result = result; await checkpoint(progress); execution.throwIfAborted();
                const status = result.issues.length || result.conflicts.length || result.missing.length ? 'needs_review' : 'completed';
                await client.query("UPDATE idq_items SET status=$3,result=$4,error=NULL,finished_at=now() WHERE job_id=$1 AND position=$2", [job.id, item.position, status, JSON.stringify(result)]);
              } catch (error) {
                ownership.throwIfAborted();
                if (execution.aborted) break;
                await client.query("UPDATE idq_items SET status='failed',error=$3,finished_at=now() WHERE job_id=$1 AND position=$2", [job.id, item.position, error instanceof Error ? error.message : 'Product processing failed.']);
              }
            }
            ownership.throwIfAborted();
            const current = (await client.query('SELECT status FROM idq_jobs WHERE id=$1 AND owner_token=$2', [job.id, owner])).rows[0];
            if (current?.status === 'cancelling') {
              await client.query("UPDATE idq_items SET status='cancelled' WHERE job_id=$1 AND status IN ('queued','running')", [job.id]);
              await client.query("UPDATE idq_jobs SET status='cancelled',owner_token=NULL,finished_at=now() WHERE id=$1 AND owner_token=$2", [job.id, owner]);
            } else if (current?.status === 'running') {
              const statuses = (await client.query('SELECT status FROM idq_items WHERE job_id=$1', [job.id])).rows.map(row => row.status);
              if (statuses.every(status => TERMINAL.includes(status) || status === 'failed')) {
                const status = statuses.includes('failed') ? 'failed' : statuses.includes('needs_review') ? 'needs_review' : 'completed';
                await client.query("UPDATE idq_jobs SET status=$3,owner_token=NULL,finished_at=now() WHERE id=$1 AND owner_token=$2 AND status='running'", [job.id, owner, status]);
              }
            }
          }
        }
      } catch { if (!stop.signal.aborted) console.error('IDQ worker paused; saved captures and research will resume after database recovery.'); }
      finally {
        if (monitor) clearInterval(monitor);
        if (client) {
          await client.query('SELECT pg_advisory_unlock($1)', [WORKER_LOCK]).catch(() => {});
          client.removeListener('error', onLoss); client.removeListener('end', onLoss); client.release(lost.signal.aborted);
        }
      }
      await delay(500, undefined, { signal: stop.signal }).catch(() => {});
    }
  })();
  return async () => { stop.abort(); await task; };
}
