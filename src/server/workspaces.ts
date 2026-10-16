import type { Pool, PoolClient } from 'pg';
import { ProviderError } from '../lib/chatCompletion';

export const KEY_SLOTS = Array.from({ length: 5 }, (_, index) => `AICREDITS_API_KEY_${index + 1}`);

export function configuredKeySlots() {
  const configured = KEY_SLOTS.filter(slot => process.env[slot]?.trim());
  if (new Set(configured.map(slot => process.env[slot]!.trim())).size !== configured.length) {
    throw new ProviderError('Workspace API keys must be distinct. Check the configured key slots.', 503);
  }
  return configured;
}

export async function initializeWorkspaces(pool: Pool | PoolClient) {
  await pool.query(`CREATE TABLE IF NOT EXISTS user_key_assignments (
    user_id text PRIMARY KEY, key_slot text NOT NULL UNIQUE CHECK(key_slot ~ '^AICREDITS_API_KEY_[1-5]$'),
    assigned_at timestamptz NOT NULL DEFAULT now()
  );
  CREATE TABLE IF NOT EXISTS workspace_provider_settings (
    owner_id text PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    settings jsonb NOT NULL DEFAULT '{}'
  );`);
}

/** Call inside the account transaction. Deleted accounts retain their slot reservation. */
export async function assignKeySlot(client: PoolClient, userId: string, requested?: string) {
  await client.query('SELECT pg_advisory_xact_lock(21422, 1)');
  const configured = configuredKeySlots();
  const { rows } = await client.query('SELECT user_id,key_slot FROM user_key_assignments');
  const existing = rows.find(row => row.user_id === userId);
  if (existing) {
    if (!configured.includes(existing.key_slot)) throw new ProviderError('The assigned workspace API key must be configured before migration or recovery.', 503);
    if (requested && requested !== existing.key_slot) throw new ProviderError('An account’s key slot cannot be reassigned.', 409);
    return existing.key_slot as string;
  }
  const available = configured.filter(slot => !rows.some(row => row.key_slot === slot));
  const slot = requested ?? available[0];
  if (!slot || !available.includes(slot)) throw new ProviderError('No unused configured API key slot is available. Configure a distinct key before creating this account.', 409);
  await client.query('INSERT INTO user_key_assignments(user_id,key_slot) VALUES($1,$2)', [userId, slot]);
  return slot;
}

export async function workspaceKeySlot(pool: Pool | PoolClient, ownerId: string) {
  const { rows: [row] } = await pool.query('SELECT key_slot FROM user_key_assignments WHERE user_id=$1', [ownerId]);
  if (!row) throw new ProviderError('This workspace has no assigned API key. Ask an administrator to complete workspace setup.', 503);
  return row.key_slot as string;
}

export async function requireWorkspaceMigration(pool: Pool) {
  const { rows: [row] } = await pool.query(`SELECT to_regclass('sku_data') IS NOT NULL AS existing,
    EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema=current_schema() AND table_name='sku_data' AND column_name='owner_id') AS migrated`);
  if (row.existing && !row.migrated) throw new Error('Workspace migration required. Stop the old server, back up the database, and run npm run migrate:workspaces -- --owner=<admin-id> --key-slot=AICREDITS_API_KEY_1.');
}
