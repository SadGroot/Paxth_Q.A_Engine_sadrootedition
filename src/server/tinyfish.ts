import { acquireScrapeSlot, MAX_SCRAPE_CHARACTERS, type CollectedPage } from '../lib/cloudScrape';
import { bufferResponse } from '../lib/chatCompletion';
import { resolvePublicAddress, ScrapeError, validateScrapeInput } from '../lib/scrapeNetwork';

export function getTinyfishApiKey() {
  const key = process.env.TINYFISH_API_KEY?.trim();
  if (!key) throw new ScrapeError('Configure TINYFISH_API_KEY on the server to research products.', 503, 'TINYFISH_NOT_CONFIGURED');
  return key;
}

async function request(url: string, signal: AbortSignal, body?: unknown) {
  const key = getTinyfishApiKey(), release = await acquireScrapeSlot(signal);
  const bounded = AbortSignal.any([signal, AbortSignal.timeout(60_000)]);
  try {
    const response = await fetch(url, { method: body ? 'POST' : 'GET', redirect: 'error', signal: bounded,
      headers: { 'X-API-Key': key, ...(body && { 'Content-Type': 'application/json' }) }, ...(body && { body: JSON.stringify(body) }) });
    if (!response.ok) {
      await response.body?.cancel();
      const detail = [401, 403].includes(response.status) ? 'Check the server TINYFISH_API_KEY and account access.'
        : response.status === 402 ? 'TinyFish allowance or credits are exhausted.' : response.status === 429 ? 'TinyFish rate limit reached.' : 'Retry the product later.';
      throw new ScrapeError(`TinyFish request failed (HTTP ${response.status}). ${detail}`, response.status === 401 ? 502 : response.status, 'TINYFISH_FAILED');
    }
    return await (await bufferResponse(response, bounded)).json();
  } catch (error) {
    signal.throwIfAborted();
    if (error instanceof ScrapeError) throw error;
    throw new ScrapeError(bounded.aborted ? 'TinyFish request timed out.' : 'TinyFish returned an unavailable or invalid response.', 502, 'TINYFISH_FAILED');
  } finally { release(); }
}

export async function searchTinyfish(query: string, signal: AbortSignal) {
  if (!query.trim() || query.length > 512) throw new Error('Search query must contain 1–512 characters.');
  const data = await request(`https://api.search.tinyfish.ai?query=${encodeURIComponent(query)}`, signal);
  if (!Array.isArray(data?.results)) throw new ScrapeError('TinyFish search returned invalid results.', 502, 'TINYFISH_FAILED');
  return data.results.slice(0, 10).flatMap((hit: any) => {
    if (typeof hit?.url !== 'string') return [];
    try { return [{ title: String(hit.title || '').slice(0, 1000), url: validateScrapeInput({ url: hit.url }).url, snippet: String(hit.snippet || '').slice(0, 2000) }]; }
    catch { return []; }
  });
}

export async function collectTinyfishPage(value: string, signal: AbortSignal, resolve = resolvePublicAddress): Promise<CollectedPage> {
  const url = validateScrapeInput({ url: value }).url;
  await resolve(new URL(url), undefined, signal);
  const started = Date.now();
  // shortcut: Fetch reads rendered pages; add bounded Agent retrieval when a product fixture needs clicks.
  const data = await request('https://api.fetch.tinyfish.ai', signal, { urls: [url], format: 'markdown', ttl: 0, per_url_timeout_ms: 45_000 });
  const page = Array.isArray(data?.results) ? data.results.find((item: any) => item?.url === url) : null;
  if (!page || typeof page.text !== 'string' || !page.text.trim()) throw new ScrapeError('TinyFish could not retrieve readable product evidence.', 502, 'PAGE_UNAVAILABLE');
  const finalUrl = validateScrapeInput({ url: page.final_url || url }).url;
  await resolve(new URL(finalUrl), undefined, signal);
  if (page.text.length > MAX_SCRAPE_CHARACTERS) throw new ScrapeError('TinyFish page exceeds the evidence size limit.', 413, 'CONTENT_TOO_LARGE');
  return { markdown: page.text, requestedUrl: url, finalUrl, capturedAt: null, receivedAt: new Date().toISOString(), status: 'collected',
    report: { durationMs: Date.now() - started, characters: page.text.length, warnings: [] } };
}
