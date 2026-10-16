import { workspaceKeySlot } from './workspaces';
import { randomUUID } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import type { Pool, PoolClient } from 'pg';

const LEADER_LOCK = 73462191;
const ACTIVE = ['queued', 'running', 'cancelling'];
export const MAX_ACTIVE_WORKSPACES = 4;
type Execute = (client: PoolClient, pool: Pool, job: any, token: string, signal: AbortSignal) => Promise<void>;

/** One database leader dispatches both queues; each workspace has one dedicated execution connection. */
export function startWorkScheduler(pool: Pool, handlers: { qa?: Execute; idq?: Execute }) {
  const stop = new AbortController();
  const task = (async () => {
    while (!stop.signal.aborted) {
      let leader: PoolClient | undefined;
      const lost = new AbortController();
      const ownership = AbortSignal.any([stop.signal, lost.signal]);
      const onLoss = () => lost.abort(new Error('Scheduler database ownership lost.'));
      const running = new Map<string, Promise<void>>();
      try {
        leader = await pool.connect();
        leader.on('error', onLoss); leader.on('end', onLoss);
        const lock = await leader.query('SELECT pg_try_advisory_lock($1) AS acquired', [LEADER_LOCK]);
        if (lock.rows[0].acquired) {
          // Fence interrupted executors and show recovered jobs as queued until their workspace is claimed.
          await leader.query("UPDATE job_runs SET status='queued',owner_token=NULL WHERE status='running'; UPDATE idq_jobs SET status='queued',owner_token=NULL WHERE status='running'");
          while (!ownership.aborted) {
            if (running.size < MAX_ACTIVE_WORKSPACES) {
              const candidates = await leader.query(`SELECT * FROM (
                SELECT 'qa' AS kind,r.id,j.owner_id,r.status,r.started_at,r.created_at FROM job_runs r JOIN jobs j ON j.id=r.job_id WHERE $1 AND r.status=ANY($3::text[])
                UNION ALL SELECT 'idq',id,owner_id,status,started_at,created_at FROM idq_jobs WHERE $2 AND status=ANY($3::text[])
              ) work WHERE NOT(owner_id=ANY($4::text[]))
              ORDER BY (started_at IS NOT NULL) DESC,created_at,id LIMIT 1`, [Boolean(handlers.qa), Boolean(handlers.idq), ACTIVE, [...running.keys()]]);
              const next = candidates.rows[0];
              if (next) {
                const token = randomUUID();
                const table = next.kind === 'qa' ? 'job_runs' : 'idq_jobs';
                const claimed = await leader.query(`UPDATE ${table} SET status=CASE WHEN status='cancelling' THEN status ELSE 'running' END,
                  owner_token=$2,started_at=COALESCE(started_at,now()) WHERE id=$1 AND status=ANY($3::text[]) RETURNING *`, [next.id, token, ACTIVE]);
                if (!claimed.rows[0]) continue;
                const job = { ...claimed.rows[0], owner_id: next.owner_id };
                const execute = handlers[next.kind as 'qa' | 'idq']!;
                const execution = (async () => {
                  let client: PoolClient | undefined;
                  const disconnected = new AbortController();
                  const onDisconnect = () => disconnected.abort(new Error('Execution database connection lost.'));
                  try {
                    client = await pool.connect();
                    client.on('error', onDisconnect); client.on('end', onDisconnect);
                    const signal = AbortSignal.any([ownership, disconnected.signal]);
                    signal.throwIfAborted();
                    const keySlot = await workspaceKeySlot(client, job.owner_id);
                    if (job.configuration.settings.providerKeySlot !== keySlot) throw new Error('Job key assignment does not match its workspace.');
                    await execute(client, pool, job, token, signal);
                  } catch {
                    if (!ownership.aborted) {
                      console.error('Workspace execution paused; committed progress will resume after recovery.');
                      await delay(1000, undefined, { signal: ownership }).catch(() => {});
                    }
                  } finally {
                    if (client) {
                      client.removeListener('error', onDisconnect); client.removeListener('end', onDisconnect);
                      client.release(disconnected.signal.aborted);
                    }
                  }
                })();
                running.set(next.owner_id, execution);
                void execution.finally(() => running.delete(next.owner_id));
                continue;
              }
            }
            await delay(250, undefined, { signal: ownership });
          }
        }
      } catch {
        onLoss();
        if (!stop.signal.aborted) console.error('Scheduler paused; durable queues will resume after database recovery.');
      } finally {
        const connectionLost = lost.signal.aborted;
        lost.abort();
        await Promise.allSettled(running.values());
        if (leader) {
          await leader.query('SELECT pg_advisory_unlock($1)', [LEADER_LOCK]).catch(() => {});
          leader.removeListener('error', onLoss); leader.removeListener('end', onLoss);
          leader.release(connectionLost);
        }
      }
      await delay(500, undefined, { signal: stop.signal }).catch(() => {});
    }
  })();
  return async () => { stop.abort(new Error('Server shutting down.')); await task; };
}
