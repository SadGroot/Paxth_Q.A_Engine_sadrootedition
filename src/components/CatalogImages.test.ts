import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'vite';
import { chromium } from 'playwright-core';
import JSZip from 'jszip';
import type { SkuData } from '../hooks/useCatalogData';
import { DEFAULT_SETTINGS } from '../lib/providerSettings';

const row = (sku: string): SkuData => ({ sku, source: { url: 'https://shop.example/product' }, raw_row: {}, upload_attributes: {}, status: 'completed',
  scraped_markdown: '## Product images\n- <https://cdn.example/front.png>\n- <https://cdn.example/side.png>\n- <https://cdn.example/transparent.png>\n\nSource: <https://shop.example/product>',
  catalog_state: { status: 'completed', revision: 0, jobId: 'image-job', headers: ['sku', 'name'], row: { sku, name: 'Test' }, warnings: [], cellWarnings: [] } });
const rows = [row('00123'), row('B')];
const job = { id: 'image-job', name: 'Product Photos', jobType: 'catalog', createdAt: new Date().toISOString(), status: 'completed', skus: rows.map(row => row.sku) };
const run = { id: 'image-run', jobId: job.id, jobType: 'catalog', actorId: 'operator', actorName: 'Operator', createdAt: job.createdAt, status: 'completed',
  catalogOutputs: { groups: [], shipping: null }, items: rows.map(snapshot => ({ sku: snapshot.sku, snapshot, result: snapshot, status: 'completed', attempts: 1, selectedImageUrls: [] as string[] })) };
let failSave = false, failImage = false;
let imageBytes: Buffer[] = [];
const server = await createServer({ cacheDir: '/tmp/paxth-catalog-images-vite-cache', server: { host: '127.0.0.1', port: 0, hmr: false }, logLevel: 'error' });
let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
try {
  await server.listen();
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } });
  page.setDefaultTimeout(15000);
  const unexpected: string[] = [];
  page.on('pageerror', error => unexpected.push(error.message));
  await page.route('**/api/**', async route => {
    const request = route.request(), path = new URL(request.url()).pathname;
    if (path === '/api/auth/me') return route.fulfill({ json: { id: 'operator', username: 'Operator', role: 'user' } });
    if (path === '/api/db-status') return route.fulfill({ json: { status: 'connected' } });
    if (path === '/api/workspace-provider-settings') return route.fulfill({ json: DEFAULT_SETTINGS });
    if (path === '/api/qa-configuration') return route.fulfill({ json: { qaAgentMemory: '', attributeSets: [] } });
    if (path === '/api/catalog') return route.fulfill({ json: rows });
    if (path === '/api/jobs') return route.fulfill({ json: [job] });
    if (path === '/api/jobs/image-job/runs') return route.fulfill({ json: [run] });
    if (path === '/api/jobs/image-job/outputs') return route.fulfill({ json: run.catalogOutputs });
    if (path === '/api/job-runs/image-run') return route.fulfill({ json: run });
    const image = path.match(/^\/api\/job-runs\/image-run\/items\/([^/]+)\/images(?:\/(\d+))?$/);
    if (image) {
      const item = run.items.find(item => item.sku === decodeURIComponent(image[1]))!;
      if (request.method() === 'PUT') {
        if (failSave) { failSave = false; return route.fulfill({ status: 503, json: { error: 'Save unavailable; retry.' } }); }
        const body = request.postDataJSON();
        assert.deepEqual(body.expectedSelectedImageUrls, item.selectedImageUrls);
        item.selectedImageUrls = body.selectedImageUrls;
        return route.fulfill({ json: { selectedImageUrls: item.selectedImageUrls } });
      }
      if (failImage) return route.fulfill({ status: 502, json: { error: 'Image source unavailable.' } });
      return route.fulfill({ contentType: 'image/png', body: imageBytes[Number(image[2])] });
    }
    unexpected.push(`Unexpected API: ${request.method()} ${path}`);
    return route.fulfill({ status: 404, json: { error: 'Unexpected request' } });
  });
  await page.goto(server.resolvedUrls!.local[0]);
  const pngs = await page.evaluate(() => [[200, 100, '#ff0000'], [100, 200, '#0000ff'], [80, 80, '#00ff00']].map(([width, height, color]) => {
    const canvas = document.createElement('canvas'); canvas.width = Number(width); canvas.height = Number(height);
    const context = canvas.getContext('2d')!;
    if (color === '#ff0000') { context.fillStyle = '#fff'; context.fillRect(0, 0, canvas.width, canvas.height); }
    context.fillStyle = String(color);
    if (color === '#00ff00') context.fillRect(20, 20, 40, 40);
    else if (color === '#ff0000') context.fillRect(20, 10, 160, 80);
    else context.fillRect(0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png').split(',')[1];
  }));
  imageBytes = pngs.map(base64 => Buffer.from(base64, 'base64'));
  await page.getByRole('group', { name: 'Workspace mode' }).getByRole('button', { name: 'Catalog', exact: true }).click();
  await page.getByRole('button', { name: 'Jobs', exact: true }).click();
  await page.getByRole('button', { name: 'View Results', exact: true }).click();
  const details = page.getByRole('dialog', { name: 'Job details' });
  const picker = page.getByRole('dialog', { name: 'Images for 00123', exact: true });
  const firstRow = details.locator('div.border').filter({ has: page.getByRole('button', { name: /^SKU: 00123/ }) }).last();
  const firstImages = firstRow.getByRole('button', { name: /^Images \(/ });
  await firstImages.focus(); await page.keyboard.press('Enter');
  const front = picker.getByRole('button', { name: 'Image 1 for 00123', exact: true });
  const side = picker.getByRole('button', { name: 'Image 2 for 00123', exact: true });
  await side.waitFor();
  await page.waitForFunction(() => !document.querySelector<HTMLButtonElement>('dialog button[aria-label="Image 2 for 00123"]')?.disabled);
  await side.click(); await front.click();
  await picker.getByText('1. 00123-1.jpg', { exact: true }).waitFor();
  await picker.getByRole('button', { name: 'Save selections', exact: true }).click();
  await picker.waitFor({ state: 'detached' });
  assert.deepEqual(run.items[0].selectedImageUrls, ['https://cdn.example/side.png', 'https://cdn.example/front.png']);
  await details.getByRole('button', { name: 'Close job details', exact: true }).click();
  await page.getByRole('button', { name: 'View Results', exact: true }).click();
  await firstImages.click();
  assert.equal(await side.getAttribute('aria-pressed'), 'true', 'Selections survive reopening');
  await side.click();
  const transparent = picker.getByRole('button', { name: 'Image 3 for 00123', exact: true });
  await page.waitForFunction(() => !document.querySelector<HTMLButtonElement>('dialog button[aria-label="Image 3 for 00123"]')?.disabled);
  await transparent.click();
  await page.screenshot({ path: '/tmp/paxth-catalog-image-picker.png' });
  assert.equal(await front.getAttribute('aria-pressed'), 'true');
  failSave = true;
  await picker.getByRole('button', { name: 'Save selections', exact: true }).click();
  await picker.getByRole('alert').filter({ hasText: 'Save unavailable' }).waitFor();
  assert.equal(await transparent.getAttribute('aria-pressed'), 'true', 'Failed saves preserve the draft');
  await picker.getByRole('button', { name: 'Save selections', exact: true }).click();
  await picker.waitFor({ state: 'detached' });
  assert.deepEqual(run.items[0].selectedImageUrls, ['https://cdn.example/front.png', 'https://cdn.example/transparent.png']);
  const secondRow = details.locator('div.border').filter({ has: page.getByRole('button', { name: /^SKU: B/ }) }).last();
  await secondRow.getByRole('button', { name: /^Images \(/ }).click();
  const secondPicker = page.getByRole('dialog', { name: 'Images for B', exact: true });
  await page.waitForFunction(() => !document.querySelector<HTMLButtonElement>('dialog button[aria-label="Image 2 for B"]')?.disabled);
  await secondPicker.getByRole('button', { name: 'Image 2 for B', exact: true }).click();
  await secondPicker.getByRole('button', { name: 'Save selections', exact: true }).click();
  await secondPicker.waitFor({ state: 'detached' });
  await page.reload();
  await page.getByRole('group', { name: 'Workspace mode' }).getByRole('button', { name: 'Catalog', exact: true }).click();
  await page.getByRole('button', { name: 'Jobs', exact: true }).click();
  await page.getByRole('button', { name: 'View Results', exact: true }).click();
  const downloads: unknown[] = [];
  page.on('download', download => downloads.push(download));
  const downloadEvent = page.waitForEvent('download');
  await details.getByRole('button', { name: 'Export Images (.zip)', exact: true }).click();
  const download = await downloadEvent;
  assert.equal(download.suggestedFilename(), 'Product_Photos_Images.zip');
  const zip = await JSZip.loadAsync(await readFile((await download.path())!));
  assert.deepEqual(Object.keys(zip.files), ['00123-1.jpg', '00123-2.jpg', 'B-1.jpg']);
  for (const name of Object.keys(zip.files)) {
    const bytes = await zip.file(name)!.async('uint8array');
    const pixels = await page.evaluate(async bytes => {
      const bitmap = await createImageBitmap(new Blob([new Uint8Array(bytes)], { type: 'image/jpeg' }));
      const canvas = document.createElement('canvas'); canvas.width = bitmap.width; canvas.height = bitmap.height;
      const context = canvas.getContext('2d')!; context.drawImage(bitmap, 0, 0); bitmap.close();
      return { width: canvas.width, height: canvas.height, corner: [...context.getImageData(0, 0, 1, 1).data],
        center: [...context.getImageData(750, 750, 1, 1).data], margin: [...context.getImageData(140, 750, 1, 1).data],
        topMargin: [...context.getImageData(750, 140, 1, 1).data], inside: [...context.getImageData(160, 750, 1, 1).data],
        topInside: [...context.getImageData(750, 160, 1, 1).data] };
    }, [...bytes]);
    assert.equal(pixels.width, 1500); assert.equal(pixels.height, 1500);
    for (const pixel of [pixels.corner, pixels.margin, pixels.topMargin]) assert.ok(pixel.slice(0, 3).every(channel => channel >= 250), `${name} has white padding`);
    const channel = name === '00123-1.jpg' ? 0 : name === '00123-2.jpg' ? 1 : 2;
    assert.ok(pixels.center[channel] > 245 && pixels.center[(channel + 1) % 3] < 10, `${name} retains the selected image and click order`);
    assert.ok((name === 'B-1.jpg' ? pixels.topInside : pixels.inside)[channel] > 245, `${name} trims source margins before applying consistent padding`);
  }
  failImage = true;
  await details.getByRole('button', { name: 'Export Images (.zip)', exact: true }).click();
  await page.getByRole('button', { name: 'Notifications', exact: true }).click();
  await page.getByText('Image Export Failed', { exact: true }).waitFor();
  assert.equal(downloads.length, 1, 'Image failures do not download a partial ZIP');
  await page.getByRole('button', { name: 'Notifications', exact: true }).click();
  await firstImages.click();
  await picker.getByRole('alert').first().waitFor();
  failImage = false;
  await picker.getByRole('button', { name: 'Retry image', exact: true }).first().click();
  await page.waitForFunction(() => document.querySelector('dialog img[alt="Image 1 for 00123"]'));
  await page.keyboard.press('Escape');
  assert.equal(await picker.count(), 0, 'Escape closes the image picker');
  assert.equal(unexpected.length, 0, unexpected.join('\n'));
} finally { await browser?.close(); await server.close(); }
console.log('Catalog image browser checks passed: ordered selections, saved drafts, reloads, all-SKU ZIP, dimensions, white padding, transparency, retries and export failures.');
