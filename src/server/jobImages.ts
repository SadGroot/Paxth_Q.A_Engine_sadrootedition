import http from 'node:http';
import https from 'node:https';
import { lookup } from 'node:dns/promises';
import type { Express } from 'express';
import type { Pool } from 'pg';
import { catalogImages } from '../lib/catalogImages';
import { resolvePublicAddress, ScrapeError, validateScrapeInput } from '../lib/scrapeNetwork';
import { ApiError, object } from './catalog';

const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']);

export async function retrieveCatalogImage(rawUrl: string, signal: AbortSignal, resolve = lookup) {
  const timeout = AbortSignal.any([signal, AbortSignal.timeout(30_000)]);
  let url = new URL(validateScrapeInput({ url: rawUrl }).url);
  for (let redirects = 0; ; redirects++) {
    const address = await resolvePublicAddress(url, resolve, timeout);
    // Pin the validated address so a second DNS lookup cannot reach a private host.
    const response = await new Promise<http.IncomingMessage>((accept, reject) => {
      const request = (url.protocol === 'https:' ? https : http).request(url, {
        agent: false, signal: timeout, family: address.family,
        lookup: (_host, _options, done) => done(null, address.address, address.family),
        headers: { Accept: 'image/jpeg,image/png,image/webp,image/avif,image/gif' },
      }, accept);
      request.on('error', reject);
      request.end();
    });
    if ([301, 302, 303, 307, 308].includes(response.statusCode!)) {
      response.destroy();
      if (!response.headers.location || redirects >= 5) throw new ApiError(502, 'The image has too many or invalid redirects.');
      url = new URL(validateScrapeInput({ url: new URL(response.headers.location, url).href }).url);
      continue;
    }
    const contentType = response.headers['content-type']?.split(';')[0].trim().toLowerCase();
    if (response.statusCode !== 200 || !IMAGE_TYPES.has(contentType || '')) {
      response.destroy();
      throw new ApiError(502, 'The image source did not return a supported image.');
    }
    if (Number(response.headers['content-length']) > MAX_IMAGE_BYTES) {
      response.destroy();
      throw new ApiError(413, 'The source image exceeds 20 MiB.');
    }
    const chunks: Buffer[] = [];
    let size = 0;
    for await (const chunk of response) {
      size += chunk.length;
      if (size > MAX_IMAGE_BYTES) { response.destroy(); throw new ApiError(413, 'The source image exceeds 20 MiB.'); }
      chunks.push(Buffer.from(chunk));
    }
    if (!size) throw new ApiError(502, 'The image source returned an empty image.');
    return { contentType: contentType!, data: Buffer.concat(chunks) };
  }
}

export function validateImageSelection(body: unknown, available: string[]) {
  if (!object(body) || Object.keys(body).some(key => !['selectedImageUrls', 'expectedSelectedImageUrls'].includes(key)) ||
      !Array.isArray(body.selectedImageUrls) || !Array.isArray(body.expectedSelectedImageUrls) ||
      !body.expectedSelectedImageUrls.every(url => typeof url === 'string') ||
      !body.selectedImageUrls.every(url => typeof url === 'string' && available.includes(url)) ||
      new Set(body.selectedImageUrls).size !== body.selectedImageUrls.length) {
    throw new ApiError(400, 'Select unique images from this SKU markdown and supply the previous saved selection.');
  }
  return { selected: body.selectedImageUrls as string[], expected: body.expectedSelectedImageUrls as string[] };
}

export function registerJobImageRoutes(app: Express, pool: Pool) {
  const readItem = async (runId: string, sku: string) => {
    const { rows: [item] } = await pool.query(`SELECT i.snapshot,i.result,i.selected_image_urls,r.status AS run_status,r.configuration->>'jobType' AS job_type
      FROM job_run_items i JOIN job_runs r ON r.id=i.run_id WHERE i.run_id=$1 AND i.sku=$2`, [runId, sku]);
    if (!item) throw new ApiError(404, 'Run SKU does not exist.');
    if (item.job_type !== 'catalog') throw new ApiError(400, 'Images are available only for Catalog runs.');
    if (['queued', 'running', 'cancelling'].includes(item.run_status)) throw new ApiError(409, 'Wait for this Catalog run to finish before selecting or exporting images.');
    return item;
  };
  app.put('/api/job-runs/:id/items/:sku/images', async (req, res, next) => {
    try {
      const item = await readItem(String(req.params.id), String(req.params.sku));
      const { selected, expected } = validateImageSelection(req.body, catalogImages(item.result || item.snapshot).map(image => image.url));
      const saved = await pool.query(`UPDATE job_run_items SET selected_image_urls=$3::jsonb
        WHERE run_id=$1 AND sku=$2 AND selected_image_urls=$4::jsonb RETURNING selected_image_urls`,
        [req.params.id, req.params.sku, JSON.stringify(selected), JSON.stringify(expected)]);
      if (!saved.rowCount) throw new ApiError(409, 'Image selections changed in another tab. Close and reopen the image picker before saving.');
      res.json({ selectedImageUrls: saved.rows[0].selected_image_urls });
    } catch (error) { next(error); }
  });
  app.get('/api/job-runs/:id/items/:sku/images/:index', async (req, res, next) => {
    const controller = new AbortController();
    const disconnect = () => { if (!res.writableEnded) controller.abort(); };
    res.on('close', disconnect);
    try {
      const item = await readItem(String(req.params.id), String(req.params.sku));
      const index = Number(req.params.index);
      const image = /^\d+$/.test(String(req.params.index)) && Number.isSafeInteger(index) && catalogImages(item.result || item.snapshot)[index];
      if (!image) throw new ApiError(404, 'The image is not present in this SKU markdown.');
      const result = await retrieveCatalogImage(image.url, controller.signal);
      if (!res.destroyed) res.set({ 'Content-Type': result.contentType, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'private, no-store' }).send(result.data);
    } catch (error) {
      if (!res.destroyed) next(error instanceof ApiError ? error : error instanceof ScrapeError ? new ApiError(error.status, error.message) :
        new ApiError(502, 'Could not retrieve this image. Its source may be unavailable or blocking downloads.'));
    } finally { res.removeListener('close', disconnect); }
  });
}
