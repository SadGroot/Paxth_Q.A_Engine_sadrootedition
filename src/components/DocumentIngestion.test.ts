import assert from 'node:assert/strict';
import { DEFAULT_SETTINGS } from '../lib/providerSettings';
import * as XLSX from 'xlsx';
import { chromium } from 'playwright-core';
import { createServer } from 'vite';
import type { SkuData } from '../hooks/useCatalogData';
import { documentMarkdown } from '../server/documentIngestion';
import { ApiError, mapCatalogRow } from '../server/catalog';
import { prepareQaInput } from '../lib/qaAgent';
import { prepareCatalogInput } from '../lib/catalogGeneration';

const item: SkuData = { sku: 'doc/9 #?', revision: 0, source: {}, raw_row: { sku: 'doc/9 #?' }, upload_attributes: {}, status: 'cannot_qa', attribute_set: 'TV' };
const book = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet([['Attribute', 'Value'], ['Brand', 'Example'], ['Model', '00012']]), 'Product');
const excel = { name: 'specifications.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer: XLSX.write(book, { type: 'buffer', bookType: 'xlsx' }) };
const legacy = { name: 'legacy.xls', mimeType: 'application/vnd.ms-excel', buffer: XLSX.write(book, { type: 'buffer', bookType: 'xls' }) };
let requests = 0, refreshes = 0, failure: 'save' | 'conflict' | undefined;
let release = () => {};
let gate = new Promise<void>(resolve => { release = resolve; });
const server = await createServer({ cacheDir: '/tmp/paxth-ingestion-browser-cache', server: { host: '127.0.0.1', port: 0, hmr: false }, logLevel: 'error' });
let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
try {
  await server.listen();
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE, args: ['--no-sandbox'] });
  const pdfPage = await browser.newPage();
  await pdfPage.setContent('<p>Weight: 12 kg. Warranty: 2 years.</p>');
  const pdf = { name: 'manual.pdf', mimeType: 'application/pdf', buffer: await pdfPage.pdf() };
  await pdfPage.close();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.setDefaultTimeout(15000); page.setDefaultNavigationTimeout(60000);
  await page.route('**/api/**', async route => {
    const request = route.request(), path = new URL(request.url()).pathname;
    if (path === '/api/auth/me') return route.fulfill({ json: { id: 'uploader', username: 'Uploader', role: 'user' } });
    if (path === '/api/jobs') return route.fulfill({ json: [] });
    if (path === '/api/db-status') return route.fulfill({ json: { status: 'connected' } });
    if (path === '/api/workspace-provider-settings') return route.fulfill({ json: DEFAULT_SETTINGS });
    if (path === '/api/qa-configuration') return route.fulfill({ json: { qaAgentMemory: '', attributeSets: [] } });
    if (path === '/api/catalog') { refreshes++; return route.fulfill({ json: [item] }); }
    if (path === `/api/catalog/${encodeURIComponent(item.sku)}/ingest`) {
      requests++;
      assert.equal(request.method(), 'POST');
      const body = request.postDataJSON();
      assert.deepEqual(Object.keys(body), ['expectedRevision', 'fileName', 'dataBase64']);
      await gate;
      if (failure === 'save') return route.fulfill({ status: 503, json: { error: 'The operation could not be saved. Please retry.' } });
      if (failure === 'conflict') {
        item.revision!++; item.scraped_markdown += '\n\nNewer saved evidence';
        return route.fulfill({ status: 409, json: { error: 'SKU changed during ingestion. Refresh the catalog before retrying.' } });
      }
      assert.equal(body.expectedRevision, item.revision);
      try {
        const markdown = await documentMarkdown(body.fileName, body.dataBase64);
        Object.assign(item, { revision: item.revision! + 1, scraped_markdown: item.scraped_markdown ? `${item.scraped_markdown}\n\n${markdown}` : markdown,
          status: 'ready', scrape_status: 'success', scrape_metadata: { method: 'manual', requestedUrl: null, finalUrl: null, capturedAt: new Date().toISOString() } });
        return route.fulfill({ json: mapCatalogRow(item) });
      } catch (error) {
        assert.ok(error instanceof ApiError);
        return route.fulfill({ status: error.status, json: { error: error.message } });
      }
    }
    throw new Error(`Unexpected API request: ${request.method()} ${path}`);
  });
  await page.goto(server.resolvedUrls!.local[0]);
  const row = page.getByRole('row').filter({ has: page.getByRole('cell', { name: item.sku, exact: true }) });
  await row.waitFor();
  assert.deepEqual(await page.getByRole('columnheader').allTextContents(), ['', 'SKU Code', 'Name', 'Attribute Set', 'SAP Available', 'URL Available', 'Scraped Data', 'Attach File', 'Actions']);
  const input = () => page.getByLabel(`Attach file to ${item.sku}`, { exact: true });
  assert.equal(await input().getAttribute('accept'), '.pdf,.xlsx,.xls');
  await input().focus(); assert.equal(await input().evaluate(element => element === document.activeElement), true, 'The upload control is keyboard reachable');
  await input().setInputFiles(excel);
  await row.getByRole('status').filter({ hasText: 'Ingesting…' }).waitFor();
  assert.equal(await input().isDisabled(), true);
  assert.equal(item.scraped_markdown, undefined, 'File selection does not mutate saved data before conversion succeeds');
  release(); await input().waitFor({ state: 'attached' });
  await page.waitForFunction(() => !document.querySelector<HTMLInputElement>('input[accept=".pdf,.xlsx,.xls"]')!.disabled);
  assert.equal(requests, 1, 'Selecting a file starts exactly one ingestion without a save step');
  assert.ok(item.scraped_markdown!.includes('00012'));
  const viewData = async () => {
    await row.getByRole('button', { name: 'View/Edit Data', exact: true }).click();
    const editor = page.getByRole('dialog').getByRole('textbox');
    await editor.waitFor(); return editor;
  };
  assert.equal(await (await viewData()).inputValue(), item.scraped_markdown);
  await page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.reload(); await row.waitFor();
  assert.equal(await (await viewData()).inputValue(), item.scraped_markdown, 'Converted content persists after reload');
  await page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true }).click();

  await page.getByRole('button', { name: 'Catalog', exact: true }).click();
  assert.equal(await row.getByRole('cell').nth(7).getByLabel(`Attach file to ${item.sku}`).count(), 1);
  gate = Promise.resolve();
  for (const file of [legacy, pdf]) {
    const previous = item.scraped_markdown;
    await input().setInputFiles(file);
    await page.waitForFunction(() => !document.querySelector<HTMLInputElement>('input[accept=".pdf,.xlsx,.xls"]')!.disabled);
    assert.ok(item.scraped_markdown!.startsWith(`${previous}\n\n`), 'Both modes append to existing evidence');
  }
  assert.ok(item.scraped_markdown!.includes('Weight: 12 kg'));
  assert.equal(prepareQaInput(item, [], '', 200000).webAvailable, true);
  const mapping = { attributeSet: 'TV', rulesMarkdown: '', headers: ['sku', 'attribute__brand'] };
  assert.equal(JSON.parse(prepareCatalogInput(item, mapping, '', 200000).messages[1].content).scraped_markdown, item.scraped_markdown);
  const preserved = structuredClone(item);
  for (const mode of ['save', 'conflict'] as const) {
    failure = mode;
    const previousRefreshes = refreshes;
    await input().setInputFiles(excel);
    await row.getByRole('alert').filter({ hasText: mode === 'save' ? 'could not be saved' : 'SKU changed' }).waitFor();
    assert.ok(refreshes > previousRefreshes, 'Failures refresh the catalog, including revision conflicts');
    if (mode === 'save') assert.deepEqual(item, preserved, 'Failed saves preserve all evidence');
    else assert.ok(item.scraped_markdown!.endsWith('Newer saved evidence'));
  }
  failure = undefined;
  const beforeInvalid = structuredClone(item);
  await input().setInputFiles({ name: 'broken.pdf', mimeType: 'application/pdf', buffer: Buffer.from('Not a PDF') });
  await row.getByRole('alert').filter({ hasText: 'not a valid PDF' }).waitFor();
  assert.deepEqual(item, beforeInvalid);
  const beforeValidation = requests;
  for (const file of [{ name: 'notes.txt', buffer: Buffer.from('No'), mimeType: 'text/plain' },
    { name: 'large.pdf', buffer: Buffer.alloc(10 * 1024 * 1024 + 1), mimeType: 'application/pdf' }]) {
    await input().setInputFiles(file);
    await row.getByRole('alert').filter({ hasText: file.name === 'notes.txt' ? 'Choose a PDF' : '10 MiB' }).waitFor();
  }
  assert.equal(requests, beforeValidation, 'Invalid types and oversized files are rejected before upload');
  console.log('Document browser checks passed: automatic uploads, both modes, PDF/XLS/XLSX, append, reload, progress, accessibility, errors, and conflict refresh.');
} finally {
  release(); await browser?.close(); await server.close();
}
