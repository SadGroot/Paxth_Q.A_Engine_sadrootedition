import type { Express } from 'express';
import type { Pool, PoolClient } from 'pg';
import { setTimeout as delay } from 'node:timers/promises';
import { fetchChatCompletion, ProviderError, providerResponseError } from '../lib/chatCompletion';
import { DEFAULT_SETTINGS, editableSettings, normalizeSettings, type AppSettings } from '../lib/providerSettings';
import { extractLLMResponseContent } from '../lib/llmResponse';
import { buildQaRequest, QaResponseError, type QaRecoveryState, type QaResponseFailure } from '../lib/qaRequest';
import { transaction } from './database';

export function getProviderCredentials() {
  let baseUrl = process.env.LLM_BASE_URL?.trim();
  let apiKey = process.env.LLM_API_KEY?.trim();
  // Use the existing AI Credits key only with its own gateway; never mix it with an override.
  if (!baseUrl && !apiKey && process.env.AICREDITS_API_KEY?.trim()) {
    // shortcut: the documented API host is unreachable from Codespaces, recheck its routing before switching back.
    baseUrl = 'https://aicredits.in/v1';
    apiKey = process.env.AICREDITS_API_KEY.trim();
  }
  if (!baseUrl || !apiKey) throw new ProviderError('Configure both LLM_BASE_URL and LLM_API_KEY on the server, or use AICREDITS_API_KEY without LLM overrides.', 503);
  let url: URL;
  try { url = new URL(baseUrl); } catch { throw new ProviderError('Invalid server LLM_BASE_URL.', 503); }
  if (!['https:', ...(process.env.NODE_ENV !== 'production' ? ['http:'] : [])].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new ProviderError('Invalid server LLM_BASE_URL.', 503);
  return { baseUrl, apiKey };
}
export async function initializeProvider(pool: Pool) {
  await pool.query(`CREATE TABLE IF NOT EXISTS provider_settings (id text PRIMARY KEY CHECK(id='default'), settings jsonb NOT NULL);
    INSERT INTO provider_settings VALUES ('default','{}') ON CONFLICT DO NOTHING`);
  // The retired navigation model is unrelated to the Markdown formatter.
  await pool.query(`UPDATE provider_settings SET settings = settings - 'scrapperModelName' - 'navigationModelInitialized' - 'scraperTimeout'
    WHERE id='default' AND settings ?| ARRAY['scrapperModelName','navigationModelInitialized','scraperTimeout']`);
}
export async function getProviderSettings(pool: Pool | PoolClient): Promise<AppSettings> {
  const { rows: [row] } = await pool.query("SELECT p.settings, q.memory FROM provider_settings p JOIN qa_agent_settings q ON q.id=p.id WHERE p.id='default'");
  if (!row) throw new ProviderError('Provider settings unavailable', 503);
  let providerConfigured = false;
  try { getProviderCredentials(); providerConfigured = true; } catch { /* Report configuration state without exposing secrets. */ }
  return normalizeSettings({ ...row.settings, qaAgentMemory: row.memory, providerConfigured,
    scraperConfigured: Boolean(process.env.CRAWL4AI_API_KEY?.trim()) });
}
export function validateSettings(value: any) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).some(key => !Object.keys(editableSettings(DEFAULT_SETTINGS)).includes(key)) ||
    typeof value.modelName !== 'string' || !value.modelName.trim() || value.modelName.length > 256 ||
    (value.scraperModelName !== undefined && (typeof value.scraperModelName !== 'string' || !value.scraperModelName.trim() || value.scraperModelName.length > 256)) ||
    (value.reasoningEffort !== undefined && !['low', 'high', 'max'].includes(value.reasoningEffort)) ||
    (value.deepseekReasoningEffort !== undefined && !['auto', 'none', 'low', 'medium', 'high', 'max'].includes(value.deepseekReasoningEffort)) ||
    typeof value.temperature !== 'number' || !Number.isFinite(value.temperature) || value.temperature < 0 || value.temperature > 1 ||
    !Number.isSafeInteger(value.maxTokens) || value.maxTokens < 1 || value.maxTokens > 65536 ||
    !Number.isSafeInteger(value.maxPageContentLength) || value.maxPageContentLength < 1 || value.maxPageContentLength > 200000 ||
    typeof value.qaAgentMemory !== 'string' || value.qaAgentMemory.length > 200000) throw new ProviderError('Invalid model settings or unsupported fields', 400);
  return editableSettings(normalizeSettings(value));
}
export async function completeQa(payload: unknown, signal: AbortSignal, options: {
  taskLabel?: 'QA' | 'Catalog' | 'Scraping' | 'IDQ';
  maxAttempts?: 1 | 2 | 3;
  attempts?: number; beforeAttempt?: (attempt: number, payload: unknown, recovery: QaRecoveryState) => Promise<void>;
  lastError?: string | null; onAttemptError?: (attempt: number, error: ProviderError, recovery: QaRecoveryState) => Promise<void>;
  fallbackPayload?: unknown; lastFailure?: { status: number; retryable: boolean; kind?: QaResponseFailure };
  lastReasoningEffort?: string;
  qaRecovery?: QaRecoveryState;
  validateResponse?: (data: any) => void;
  onResponse?: (data: any) => Promise<void>;
} = {}) {
  const label = options.taskLabel || 'QA';
  const maxAttempts = options.maxAttempts ?? 3;
  const budget = maxAttempts === 3 ? 'three' : maxAttempts === 2 ? 'two' : 'one';
  const exhaustedMessage = options.lastError?.trim()
    ? `${label} exhausted its ${budget}-attempt budget. Last recorded failure: ${options.lastError} Start a fresh run to retry this SKU.`
    : `${label} used all ${budget} attempts before a result was saved; execution was interrupted. Start a fresh run to retry this SKU.`;
  signal.throwIfAborted();
  if ((options.attempts ?? 0) >= maxAttempts) throw new ProviderError(exhaustedMessage);
  const { baseUrl, apiKey } = getProviderCredentials();
  let lastFailure = options.lastFailure;
  let recovery = { ...options.qaRecovery };
  let thinkingDisabled = options.lastReasoningEffort === 'none' || recovery.thinkingDisabled === true;
  for (let attempt = (options.attempts ?? 0) + 1; attempt <= maxAttempts; attempt++) {
    signal.throwIfAborted();
    let request = attempt === 3 && options.fallbackPayload && lastFailure?.retryable &&
      [408, 500, 502, 503, 504, 529].includes(lastFailure.status) ? options.fallbackPayload : payload;
    const selected = request as { model?: string; reasoning_effort?: string };
    if (selected?.model === DEFAULT_SETTINGS.modelName && (thinkingDisabled || lastFailure?.retryable && !lastFailure.kind &&
        [400, 422, 408, 500, 502, 503, 504, 529].includes(lastFailure.status))) {
      request = { ...selected, reasoning_effort: 'none' };
      thinkingDisabled = true;
    }
    if (options.validateResponse && recovery.feedback) {
      const qa = request as { messages: unknown[] };
      request = { ...qa, messages: [...qa.messages, { role: 'system', content:
        `The previous answer failed QA output validation: ${recovery.feedback}\nReturn a fresh, complete QA JSON object using the original supplied evidence and application requirements. Do not omit findings or shorten complete replacement values.` }] };
    }
    try {
      const response = await fetchChatCompletion(baseUrl, apiKey, request, signal, () => options.beforeAttempt?.(attempt, request, recovery) ?? Promise.resolve(), 120_000);
      if (!response.ok) {
        const error = await providerResponseError(response, apiKey);
        // Only an explicit reasoning-parameter rejection can recover from a client error.
        if (selected?.model === DEFAULT_SETTINGS.modelName && (request as typeof selected).reasoning_effort !== 'none' &&
            [400, 422].includes(error.status) && /reasoning_effort/i.test(error.message) &&
            /unsupported|not supported|invalid|not permitted|not allowed|must be|one of/i.test(error.message)) error.retryable = true;
        throw error;
      }
      let data: any;
      try { data = await response.json(); } catch {
        throw options.validateResponse ? new QaResponseError('Model returned invalid JSON. Expected a complete chat-completion response.', 'invalid_json')
          : new ProviderError('Model returned invalid JSON');
      }
      await options.onResponse?.(data);
      options.validateResponse?.(data);
      signal.throwIfAborted();
      return data;
    } catch (error) {
      signal.throwIfAborted();
      if (options.validateResponse && error instanceof QaResponseError) {
        if (['empty_answer', 'invalid_json', 'invalid_schema'].includes(error.kind) && !recovery.correctiveRetryUsed) {
          recovery = { ...recovery, correctiveRetryUsed: true, feedback: error.message.slice(0, 2000) };
          error.retryable = true;
        } else if (error.kind === 'truncated' && selected?.model === DEFAULT_SETTINGS.modelName &&
            (request as typeof selected).reasoning_effort !== 'none') {
          recovery = { ...recovery, thinkingDisabled: true };
          thinkingDisabled = true;
          error.retryable = true;
        }
      }
      if (error instanceof ProviderError) {
        lastFailure = { status: error.status, retryable: error.retryable,
          ...(error instanceof QaResponseError && { kind: error.kind }) };
        await options.onAttemptError?.(attempt, error, recovery);
      }
      signal.throwIfAborted();
      if (!(error instanceof ProviderError) || !error.retryable || attempt === maxAttempts) throw error;
      if (error.retryAfterMs > 300000) throw new ProviderError('Provider requested a retry beyond the job deadline', 429);
      await delay(Math.max(attempt * 1000, Number.isFinite(error.retryAfterMs) ? error.retryAfterMs : 0), undefined, { signal });
    }
  }
  signal.throwIfAborted();
  throw new ProviderError(exhaustedMessage);
}
export function registerProviderRoutes(app: Express, pool: Pool) {
  app.get('/api/provider-settings', async (_req, res) => { res.json(await getProviderSettings(pool)); });
  app.put('/api/provider-settings', async (req, res) => {
    if (res.locals.user?.role !== 'admin') { res.status(403).json({ error: 'Administrator access required' }); return; }
    const settings = validateSettings(req.body);
    await transaction(pool, async client => {
      await client.query("UPDATE provider_settings SET settings=$1::jsonb WHERE id='default'", [JSON.stringify(settings)]);
      await client.query("UPDATE qa_agent_settings SET memory=$1,updated_at=now() WHERE id='default'", [settings.qaAgentMemory]);
    });
    res.json(await getProviderSettings(pool));
  });
  app.post('/api/chat', async (req, res) => {
    if (res.locals.user?.role !== 'admin') { res.status(403).json({ error: 'Administrator access required' }); return; }
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body) ||
      Object.keys(req.body).some(key => !['modelName', 'purpose', 'deepseekReasoningEffort'].includes(key)) ||
      (req.body.purpose !== undefined && !['qa', 'scrape'].includes(req.body.purpose)) ||
      (req.body.deepseekReasoningEffort !== undefined && !['auto', 'none', 'low', 'medium', 'high', 'max'].includes(req.body.deepseekReasoningEffort)) ||
      (req.body.modelName !== undefined && (typeof req.body.modelName !== 'string' || !req.body.modelName.trim() || req.body.modelName.length > 256))) {
      res.status(400).json({ error: 'Test API accepts optional modelName, purpose (qa or scrape), and deepseekReasoningEffort only' }); return;
    }
    const controller = new AbortController();
    const disconnect = () => { if (!res.writableEnded) controller.abort(); };
    res.on('close', disconnect);
    const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(120000)]);
    try {
      const credentials = getProviderCredentials();
      const purpose = req.body.purpose ?? 'qa';
      let modelName = req.body.modelName?.trim();
      let settings = DEFAULT_SETTINGS;
      if (modelName === undefined) {
        settings = await getProviderSettings(pool);
        modelName = purpose === 'scrape' ? settings.scraperModelName : settings.modelName;
      }
      signal.throwIfAborted();
      const { response_format: _format, ...payload } = buildQaRequest({ ...settings, modelName,
        deepseekReasoningEffort: req.body.deepseekReasoningEffort ?? settings.deepseekReasoningEffort,
        maxTokens: DEFAULT_SETTINGS.maxTokens,
      }, {
        messages: [{ role: 'user', content: 'Reply with OK to confirm API connectivity.' }],
      }, purpose === 'scrape' ? 'catalog' : 'qa').payload;
      const response = await fetchChatCompletion(credentials.baseUrl, credentials.apiKey, payload, signal);
      if (!response.ok) throw await providerResponseError(response, credentials.apiKey);
      let data: any;
      try { data = await response.json(); } catch { throw new ProviderError('Model returned invalid JSON'); }
      if (data?.choices?.[0]?.message?.refusal || ['length', 'content_filter'].includes(data?.choices?.[0]?.finish_reason)) throw new ProviderError('Model test was refused or truncated');
      if (!extractLLMResponseContent(data).trim()) throw new ProviderError('Model returned an empty response');
      signal.throwIfAborted();
      if (!res.destroyed) res.json({ success: true, purpose, modelName });
    } catch (error) {
      const known = error instanceof ProviderError;
      if (!res.destroyed) res.status(known ? error.status : controller.signal.aborted || (error instanceof Error && ['AbortError', 'TimeoutError'].includes(error.name)) ? 504 : 502)
        .json({ error: known ? error.message : 'Model test failed or timed out. Check the server provider configuration.' });
    } finally { res.removeListener('close', disconnect); }
  });
}
