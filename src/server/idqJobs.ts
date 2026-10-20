import { startWorkScheduler } from './workScheduler';
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
import { getTinyfishApiKey } from './tinyfish';
import type { AttributeSet } from '../types';

const ACTIVE = ['queued', 'running', 'cancelling'];
const TERMINAL = ['completed', 'needs_review'];
export async function initializeIdq(pool: Pool) {
  await pool.query(`CREATE TABLE IF NOT EXISTS idq_jobs (
    id text PRIMARY KEY, owner_id text NOT NULL REFERENCES users(id) ON DELETE RESTRICT, request_id text NOT NULL, actor_id text NOT NULL, actor_name text NOT NULL,
    name text NOT NULL, status text NOT NULL DEFAULT 'queued' CHECK(status IN ('queued','running','cancelling','cancelled','completed','needs_review','failed')),
    configuration jsonb NOT NULL, owner_token text, created_at timestamptz NOT NULL DEFAULT now(),
    started_at timestamptz, finished_at timestamptz, error text, UNIQUE(owner_id,actor_id,request_id)
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
export async function readIdqJob(pool: Pool | PoolClient, id: string, ownerId: string) {
  const { rows: [job] } = await pool.query(`${summaryQuery} WHERE j.id=$1 AND j.owner_id=$2`, [id, ownerId]);
  if (!job) throw new ApiError(404, 'IDQ batch does not exist.');
  const { rows } = await pool.query('SELECT * FROM idq_items WHERE job_id=$1 ORDER BY position', [id]);
  return { ...summary(job), mappings: job.configuration.mappings, limits: job.configuration.limits, items: rows.map(item => ({
    position: item.position, sku: item.input.values.sku || '', url: item.input.url, attributeSet: item.input.attributeSet, status: item.status,
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
      const existing = await pool.query('SELECT id FROM idq_jobs WHERE actor_id=$1 AND request_id=$2 AND owner_id=$3', [actor.id, req.body.requestId, res.locals.workspaceId]);
      if (existing.rows[0]) { res.json(await readIdqJob(pool, existing.rows[0].id, res.locals.workspaceId)); return; }
      const { rows } = await pool.query('SELECT * FROM attribute_sets ORDER BY name');
      let input: ReturnType<typeof validateIdqInput>;
      try { input = validateIdqInput(req.body.mode, req.body.sheets, rows.map(mapSet)); }
      catch (error) { throw new ApiError(400, (error as Error).message); }
      // No model, search or crawl requests until the whole workbook passes public URL/DNS checks.
      for (const item of input.items) {
        if (item.url) {
          try { const url = validateScrapeInput({ url: item.url }).url; await resolvePublicAddress(new URL(url)); }
          catch { throw new ApiError(400, `Product URL must resolve exclusively to public internet addresses: ${item.url}`); }
        }
        const image = item.values.image_url;
        if (image?.trim()) { try { validateScrapeInput({ url: image }); } catch { throw new ApiError(400, 'Image URLs must be public HTTP(S) URLs without credentials.'); } }
      }

      try { if (input.mode === 'research') getTinyfishApiKey(); else getScraperApiKey(); } catch (error) { throw new ApiError(503, (error as Error).message); }
      const settings = await getProviderSettings(pool, res.locals.workspaceId);
      getProviderCredentials(settings.providerKeySlot);
      const configuration: IdqConfig = { mode: input.mode, mappings: input.mappings, settings, limits: { ...IDQ_LIMITS } };
      const id = await transaction(pool, async client => {
        const found = await client.query('SELECT id FROM idq_jobs WHERE actor_id=$1 AND request_id=$2 AND owner_id=$3', [actor.id, req.body.requestId, res.locals.workspaceId]);
        if (found.rows[0]) return found.rows[0].id;
        const jobId = randomUUID();
        await client.query('INSERT INTO idq_jobs(id,request_id,actor_id,actor_name,name,configuration,owner_id) VALUES($1,$2,$3,$4,$5,$6,$7)',
          [jobId, req.body.requestId, actor.id, actor.username, req.body.name.trim(), JSON.stringify(configuration), res.locals.workspaceId]);
        for (const [position, item] of input.items.entries()) await client.query('INSERT INTO idq_items(job_id,position,input,progress) VALUES($1,$2,$3,$4)', [jobId, position, JSON.stringify(item), JSON.stringify(emptyIdqProgress())]);
        return jobId;
      });
      res.status(201).json(await readIdqJob(pool, id, res.locals.workspaceId));
    } catch (error) { next(error); }
  });
  app.get('/api/idq/jobs', async (_req, res, next) => {
    try { res.set('Cache-Control', 'no-store').json((await pool.query(`${summaryQuery} WHERE j.owner_id=$1 ORDER BY j.created_at DESC LIMIT 100`, [res.locals.workspaceId])).rows.map(summary)); }
    catch (error) { next(error); }
  });
  app.get('/api/idq/jobs/:id', async (req, res, next) => {
    try { res.set('Cache-Control', 'no-store').json(await readIdqJob(pool, String(req.params.id), res.locals.workspaceId)); } catch (error) { next(error); }
  });
  for (const action of ['cancel','resume']) app.post(`/api/idq/jobs/:id/${action}`, async (req, res, next) => {
    try {
      await transaction(pool, async client => {
        const { rows: [job] } = await client.query('SELECT * FROM idq_jobs WHERE id=$1 AND owner_id=$2 FOR UPDATE', [req.params.id, res.locals.workspaceId]);
        if (!job) throw new ApiError(404, 'IDQ batch does not exist.');
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
      res.json(await readIdqJob(pool, String(req.params.id), res.locals.workspaceId));
    } catch (error) { next(error); }
  });
  app.get('/api/idq/jobs/:id/export', async (req, res, next) => {
    try {
      const { rows: [job] } = await pool.query('SELECT * FROM idq_jobs WHERE id=$1 AND owner_id=$2', [req.params.id, res.locals.workspaceId]);
      if (!job) throw new ApiError(404, 'IDQ batch does not exist.');
      const { rows } = await pool.query('SELECT * FROM idq_items WHERE job_id=$1 ORDER BY position', [job.id]);
      const uploadOnly = req.query.format === 'upload';
      if (uploadOnly && !rows.some(row => TERMINAL.includes(row.status) && (row.result || row.progress.result)?.readyForUpload === true)) throw new ApiError(409, 'No verified rows are ready for upload. Review product matching, source conflicts and missing mandatory fields.');
      const data = await idqWorkbook(job.configuration.mappings, rows.map(row => ({ input: row.input, progress: { ...emptyIdqProgress(), ...row.progress }, result: row.result, status: row.status, error: row.error })), uploadOnly);
      res.set({ 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': `attachment; filename="IDQ-${job.id}.xlsx"`, 'Cache-Control': 'no-store' }).send(Buffer.from(data));
    } catch (error) { next(error); }
  });
}

export async function executeIdqJob(client: PoolClient, pool: Pool, job: any, owner: string, ownership: AbortSignal, run = runIdqProduct) {
  const cancelled = new AbortController();
  let monitor: ReturnType<typeof setInterval> | undefined;
  try {
    let checking = false;
    monitor = setInterval(async () => {
      if (checking) return; checking = true;
      try { const current = (await pool.query('SELECT status,owner_token FROM idq_jobs WHERE id=$1', [job.id])).rows[0]; if (current?.status !== 'running' || current.owner_token !== owner) cancelled.abort(); }
      catch { /* The dedicated connection fences ownership while checkpoints retry. */ } finally { checking = false; }
    }, 300);
    const execution = AbortSignal.any([ownership, cancelled.signal]);
    while (!execution.aborted && job.status !== 'cancelling') {
      const { rows: [item] } = await client.query("UPDATE idq_items SET status='running',started_at=COALESCE(started_at,now()) WHERE job_id=$1 AND EXISTS(SELECT 1 FROM idq_jobs WHERE id=$1 AND owner_token=$2 AND status='running') AND position=(SELECT position FROM idq_items WHERE job_id=$1 AND status IN ('queued','running') ORDER BY position LIMIT 1) RETURNING *", [job.id, owner]);
      if (!item) break;
      const progress: IdqProgress = { ...emptyIdqProgress(), ...item.progress };
      const mapping = job.configuration.mappings.find((m: any) => m.name === item.input.attributeSet);
      const checkpoint = async (state: IdqProgress) => {
        // Retain every paid response in memory while retrying only its database save.
        while (!ownership.aborted) {
          try {
            const saved = await client.query(`UPDATE idq_items SET progress=$3 WHERE job_id=$1 AND position=$2 AND EXISTS
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
        await client.query("UPDATE idq_items SET status=$3,result=$4,error=NULL,finished_at=now() WHERE job_id=$1 AND position=$2 AND EXISTS(SELECT 1 FROM idq_jobs WHERE id=$1 AND owner_token=$5)", [job.id, item.position, status, JSON.stringify(result), owner]);
      } catch (error) {
        ownership.throwIfAborted();
        if (execution.aborted) break;
        await client.query("UPDATE idq_items SET status='failed',error=$3,finished_at=now() WHERE job_id=$1 AND position=$2 AND EXISTS(SELECT 1 FROM idq_jobs WHERE id=$1 AND owner_token=$4)", [job.id, item.position, error instanceof Error ? error.message : 'Product processing failed.', owner]);
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
  } finally { if (monitor) clearInterval(monitor); }
}

export function startIdqWorker(pool: Pool, run = runIdqProduct) {
  return startWorkScheduler(pool, { idq: (client, pool, job, owner, signal) => executeIdqJob(client, pool, job, owner, signal, run) });
}
