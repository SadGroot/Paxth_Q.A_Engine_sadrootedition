import assert from 'node:assert/strict';
import https from 'node:https';
import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';
import { mock } from 'node:test';
import express from 'express';
import type { Pool } from 'pg';
import { ApiError } from './catalog';
import { registerJobImageRoutes, retrieveCatalogImage, validateImageSelection } from './jobImages';

const urls = ['https://cdn.example/a.jpg', 'https://cdn.example/b.jpg'];
assert.deepEqual(validateImageSelection({ selectedImageUrls: [urls[1], urls[0]], expectedSelectedImageUrls: [] }, urls).selected, [urls[1], urls[0]]);
for (const body of [null, {}, { selectedImageUrls: urls }, { selectedImageUrls: [urls[0], urls[0]], expectedSelectedImageUrls: [] },
  { selectedImageUrls: ['https://evil.example/other.jpg'], expectedSelectedImageUrls: [] },
  { selectedImageUrls: [], expectedSelectedImageUrls: [123] }, { selectedImageUrls: [], expectedSelectedImageUrls: [], url: urls[0] }]) {
  assert.throws(() => validateImageSelection(body, urls), /unique images/);
}
const publicDns = async () => [{ address: '8.8.8.8', family: 4 }];
const privateDns = async () => [{ address: '127.0.0.1', family: 4 }];
const requests: any[] = [];
let responses: Array<{ status: number; headers: Record<string, string>; body?: Buffer }> = [];
const transport = mock.method(https, 'request', (url: URL, options: any, callback: (response: any) => void) => {
  requests.push({ url: url.href, options });
  const request = new EventEmitter() as any;
  request.end = () => queueMicrotask(() => {
    const next = responses.shift()!;
    const response = new PassThrough() as any;
    response.statusCode = next.status; response.headers = next.headers;
    callback(response);
    if (!response.destroyed) response.end(next.body || Buffer.from('image-bytes'));
  });
  return request;
});
try {
  const signal = new AbortController().signal;
  responses = [{ status: 302, headers: { location: '/large.jpg' } }, { status: 200, headers: { 'content-type': 'image/jpeg' } }];
  const image = await retrieveCatalogImage(urls[0], signal, publicDns as any);
  assert.equal(image.contentType, 'image/jpeg'); assert.equal(image.data.toString(), 'image-bytes');
  assert.equal(requests[1].url, 'https://cdn.example/large.jpg');
  let pinned: unknown[] = [];
  requests[0].options.lookup('cdn.example', {}, (...args: unknown[]) => { pinned = args; });
  assert.deepEqual(pinned, [null, '8.8.8.8', 4]);
  assert.equal(requests[0].options.family, 4); assert.equal(requests[0].options.agent, false);
  await assert.rejects(retrieveCatalogImage(urls[0], signal, privateDns as any), /public internet/);
  for (const url of ['https://127.0.0.1/a.jpg', 'file:///etc/passwd', 'https://user:password@cdn.example/a.jpg']) await assert.rejects(retrieveCatalogImage(url, signal));
  responses = [{ status: 302, headers: { location: 'https://169.254.169.254/latest' } }];
  await assert.rejects(retrieveCatalogImage(urls[0], signal, publicDns as any), /public HTTP/);
  responses = Array.from({ length: 6 }, () => ({ status: 302, headers: { location: '/loop.jpg' } }));
  await assert.rejects(retrieveCatalogImage(urls[0], signal, publicDns as any), /redirects/);
  for (const type of ['text/html', 'image/svg+xml']) {
    responses = [{ status: 200, headers: { 'content-type': type } }];
    await assert.rejects(retrieveCatalogImage(urls[0], signal, publicDns as any), /supported image/);
  }
  responses = [{ status: 403, headers: { 'content-type': 'image/jpeg' } }];
  await assert.rejects(retrieveCatalogImage(urls[0], signal, publicDns as any), /supported image/);
  responses = [{ status: 200, headers: { 'content-type': 'image/jpeg', 'content-length': String(21 * 1024 * 1024) } }];
  await assert.rejects(retrieveCatalogImage(urls[0], signal, publicDns as any), /20 MiB/);
  responses = [{ status: 200, headers: { 'content-type': 'image/jpeg' }, body: Buffer.alloc(20 * 1024 * 1024 + 1) }];
  await assert.rejects(retrieveCatalogImage(urls[0], signal, publicDns as any), /20 MiB/);
  responses = [{ status: 200, headers: { 'content-type': 'image/jpeg' }, body: Buffer.alloc(0) }];
  await assert.rejects(retrieveCatalogImage(urls[0], signal, publicDns as any), /empty image/);
  await assert.rejects(retrieveCatalogImage(urls[0], AbortSignal.abort(), publicDns as any), { name: 'AbortError' });
} finally { transport.mock.restore(); }

const item = { snapshot: { sku: '00123', source: {}, scraped_markdown: `## Product images\n- <${urls[0]}>\n- <${urls[1]}>` }, result: null,
  selected_image_urls: [] as string[], run_status: 'completed', job_type: 'catalog' };
const pool = { query: async (sql: string, params: any[]) => {
  if (sql.startsWith('SELECT i.snapshot')) return { rows: params[0] === 'run' && params[1] === '00123' ? [item] : [] };
  if (sql.startsWith('UPDATE job_run_items')) {
    if (params[3] !== JSON.stringify(item.selected_image_urls)) return { rowCount: 0, rows: [] };
    item.selected_image_urls = JSON.parse(params[2]);
    return { rowCount: 1, rows: [{ selected_image_urls: item.selected_image_urls }] };
  }
  throw new Error('Unexpected query');
} } as unknown as Pool;
const app = express(); app.use(express.json()); registerJobImageRoutes(app, pool);
app.use((error: any, _req: any, res: any, _next: any) => res.status(error instanceof ApiError ? error.status : 500).json({ error: error.message }));
const server = app.listen(0, '127.0.0.1');
await new Promise<void>(resolve => server.once('listening', resolve));
const origin = `http://127.0.0.1:${(server.address() as any).port}`;
const save = (selected: string[], expected: string[], run = 'run') => fetch(`${origin}/api/job-runs/${run}/items/00123/images`, {
  method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ selectedImageUrls: selected, expectedSelectedImageUrls: expected }),
});
try {
  const saved = await save([urls[1], urls[0]], []); assert.equal(saved.status, 200);
  assert.deepEqual((await saved.json()).selectedImageUrls, [urls[1], urls[0]]);
  assert.equal((await save([], [])).status, 409, 'Concurrent edits cannot overwrite a newer selection');
  assert.equal((await save([], [], 'missing')).status, 404);
  assert.equal((await fetch(`${origin}/api/job-runs/run/items/00123/images/-1`)).status, 404);
  item.run_status = 'running'; assert.equal((await save([], item.selected_image_urls)).status, 409);
  item.run_status = 'completed'; item.job_type = 'qa'; assert.equal((await save([], item.selected_image_urls)).status, 400);
  item.job_type = 'catalog'; assert.equal((await save([], item.selected_image_urls)).status, 200);
} finally { await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())); }
console.log('Job image checks passed: saved order, concurrent edits, run boundaries, public DNS pinning, redirects, raster types and size limits.');
