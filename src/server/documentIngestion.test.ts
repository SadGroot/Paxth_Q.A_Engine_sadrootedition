import assert from 'node:assert/strict';
import express from 'express';
import type { Pool } from 'pg';
import * as XLSX from 'xlsx';
import { ApiError } from './catalog';
import { registerAuth } from './auth';
import { documentMarkdown, MAX_DOCUMENT_BYTES, registerDocumentIngestionRoutes } from './documentIngestion';
import { usableScrapedMarkdown } from '../lib/scrapeEvidence';
import { prepareQaInput } from '../lib/qaAgent';
import { prepareCatalogInput } from '../lib/catalogGeneration';

// Minimal PDFs keep the extraction and no-text fixtures independent of external files.
function pdf(text = '', encrypted = false) {
  const stream = text ? `BT /F1 12 Tf 30 100 Td (${text}) Tj ET` : '0 0 20 20 re f';
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 200] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`];
  if (encrypted) objects.push(`<< /Filter /Standard /V 1 /R 2 /Length 40 /O <${'00'.repeat(32)}> /U <${'00'.repeat(32)}> /P -4 >>`);
  let value = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, i) => { offsets.push(value.length); value += `${i + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = value.length;
  value += `xref\n0 ${offsets.length}\n0000000000 65535 f \n${offsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}`;
  value += `trailer\n<< /Size ${offsets.length} /Root 1 0 R ${encrypted ? `/Encrypt 6 0 R /ID [<${'00'.repeat(16)}> <${'00'.repeat(16)}>]` : ''} >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(value).toString('base64');
}
const workbook = XLSX.utils.book_new();
const sheet = XLSX.utils.aoa_to_sheet([['Name', 'Value', 'Note'], ['Model', 123, 'café 漢字 😀'], ['Zero', 0, ''], ['', '', ''], ['Markup', 'a|b\nc', '<tag> *text*']]);
sheet.B2.z = '00000';
XLSX.utils.book_append_sheet(workbook, sheet, 'Specs');
XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([['Extra', 'Detail'], ['Power', '12 W']]), 'More & details');
XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([]), 'Empty');
const excel = (bookType: 'xlsx' | 'xls' = 'xlsx') => XLSX.write(workbook, { type: 'base64', bookType });
const converted = await documentMarkdown('Product [specs].xlsx', excel());
assert.match(converted, /^## Product \\\[specs\\\]\\.xlsx/);
for (const value of ['### Specs', '### More & details', '| Model | 00123 | café 漢字 😀 |', '| Zero | 0 |  |', '|  |  |  |', 'a\\|b<br>c', '\\<tag\\> \\*text\\*']) assert.ok(converted.includes(value), value);
assert.ok(!converted.includes('### Empty'));
assert.match(await documentMarkdown('legacy.xls', excel('xls')), /00123/);
assert.match(await documentMarkdown('manual.PDF', pdf('Brand: Example. Weight: 12 kg.')), /### Page 1\n\nBrand: Example\\. Weight: 12 kg\\./);
await assert.rejects(documentMarkdown('scan.pdf', pdf()), /no selectable text/);
await assert.rejects(documentMarkdown('locked.pdf', pdf('Private product', true)), /password-protected/);
for (const [name, data] of [['file.txt', excel()], ['../file.pdf', pdf('x')], ['line\n.pdf', pdf('x')], ['wrong.xlsx', pdf('x')], ['wrong.xls', excel()], ['broken.pdf', Buffer.from('%PDF-1.4 broken').toString('base64')], ['bad.xlsx', 'not base64'], ['empty.pdf', '']] as const) {
  await assert.rejects(documentMarkdown(name, data), { status: 400 });
}
await assert.rejects(documentMarkdown('large.pdf', Buffer.alloc(MAX_DOCUMENT_BYTES + 1).toString('base64')), { status: 413 });
const empty = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(empty, XLSX.utils.aoa_to_sheet([]), 'Empty');
await assert.rejects(documentMarkdown('empty.xlsx', XLSX.write(empty, { type: 'base64', bookType: 'xlsx' })), /no nonempty worksheets/);
const large = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(large, XLSX.utils.aoa_to_sheet(Array.from({ length: 10 }, () => ['x'.repeat(25000)])), 'Too much');
await assert.rejects(documentMarkdown('large.xlsx', XLSX.write(large, { type: 'base64', bookType: 'xlsx' })), { status: 413 });
const sparse = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(sparse, { A1: { t: 's', v: 'One value' }, '!ref': 'A1:Z5000' }, 'Sparse');
await assert.rejects(documentMarkdown('sparse.xlsx', XLSX.write(sparse, { type: 'base64', bookType: 'xlsx' })), { status: 413 });

const initial = () => ({ id: 7, sku: 'file/9 #?', revision: 0, source: {}, raw_row: {}, upload_attributes: {}, status: 'cannot_qa',
  scraped_markdown: null, scrape_metadata: null, scrape_error: 'Old scrape error', error: 'Old QA error', qa_result: { qa_status: 'pass', issues: [] }, qa_revision: 0 });
let row: any = initial(), onLock: (() => void) | undefined, failSave = false, transactions = 0;
const pool = {
  query: async (sql: string) => {
    if (sql.includes('FROM sessions')) return { rows: [{ id: 'test-user', username: 'Uploader', role: 'user' }] };
    assert.match(sql, /SELECT id,revision FROM sku_data/);
    return { rows: row ? [{ id: row.id, revision: row.revision }] : [] };
  },
  connect: async () => {
    transactions++;
    let pending: any;
    return { release() {}, query: async (sql: string, values?: any[]) => {
      if (sql === 'COMMIT') { row = pending; return { rows: [] }; }
      if (sql === 'BEGIN' || sql === 'ROLLBACK' || sql.includes('pg_advisory_xact_lock')) return { rows: [] };
      if (sql.includes('FOR UPDATE')) { onLock?.(); pending = structuredClone(row); return { rows: pending ? [pending] : [] }; }
      assert.match(sql, /UPDATE sku_data SET scraped_markdown/);
      assert.equal(values![0], row.sku); assert.equal(values![1], row.revision); assert.equal(values![4], row.id);
      if (failSave) throw new Error('Simulated database failure');
      pending = { ...pending, revision: pending.revision + 1, scraped_markdown: values![2], scrape_metadata: JSON.parse(values![3]), scrape_status: 'success', scrape_error: null, status: 'ready', error: null };
      return { rows: [pending] };
    } };
  },
} as unknown as Pool;
const savedOrigin = process.env.APP_ORIGIN;
process.env.APP_ORIGIN = 'https://ingestion.example';
const app = express(); app.use(express.json({ limit: '50mb' })); registerAuth(app, pool); registerDocumentIngestionRoutes(app, pool);
app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => res.status(error instanceof ApiError ? error.status : 503).json({ error: error.message }));
const server = app.listen(0, '127.0.0.1');
await new Promise<void>(resolve => server.once('listening', resolve));
const url = `http://127.0.0.1:${(server.address() as { port: number }).port}/api/catalog/${encodeURIComponent(initial().sku)}/ingest`;
const body = { expectedRevision: 0, fileName: 'spec.xlsx', dataBase64: excel() };
const send = (payload: any = body, cookie = true, origin = 'https://ingestion.example') => fetch(url, { method: 'POST', headers: {
  'Content-Type': 'application/json', Origin: origin, ...(cookie ? { Cookie: `paxth_session=${'a'.repeat(64)}` } : {}),
}, body: JSON.stringify(payload) });
try {
  assert.equal((await send(body, false)).status, 401);
  assert.equal((await send(body, true, 'https://evil.example')).status, 403);
  for (const payload of [{ ...body, expectedRevision: -1 }, { ...body, extra: true }, { ...body, dataBase64: null }]) assert.equal((await send(payload)).status, 400);
  assert.equal(transactions, 0, 'Invalid requests never open a save transaction');
  let response = await send(); assert.equal(response.status, 200);
  let saved = await response.json();
  assert.equal(saved.revision, 1); assert.equal(saved.status, 'ready'); assert.equal(saved.scrape_status, 'success');
  assert.equal(saved.scrape_error, null); assert.equal(saved.error, null); assert.equal(saved.qa_stale, true); assert.equal(saved.qa_result, null);
  assert.equal(saved.scrape_metadata.method, 'manual');
  assert.equal(prepareQaInput(saved, [], '', 200000).webAvailable, true);
  const mapping = { attributeSet: 'Test', rulesMarkdown: '', headers: ['sku', 'attribute__brand'] };
  assert.ok(JSON.parse(prepareCatalogInput(saved, mapping, '', 200000).messages[1].content).scraped_markdown.includes('00123'));
  const originalText = row.scraped_markdown;
  response = await send({ ...body, expectedRevision: 1 }); assert.equal(response.status, 200);
  assert.equal(row.scraped_markdown, `${originalText}\n\n${originalText}`, 'A second file appends without losing the first');
  const preserved = structuredClone(row);
  assert.equal((await send()).status, 409); assert.deepEqual(row, preserved);
  failSave = true;
  assert.equal((await send({ ...body, expectedRevision: 2 })).status, 503); assert.deepEqual(row, preserved);
  failSave = false;
  row = { ...initial(), scraped_markdown: '# Existing web data\n ', source: { url: 'https://example.com/old' },
    scrape_metadata: { method: 'cloud', requestedUrl: 'https://example.com/old', finalUrl: null, capturedAt: null } };
  const webMetadata = structuredClone(row.scrape_metadata);
  assert.equal((await send()).status, 200); assert.ok(row.scraped_markdown.startsWith('# Existing web data\n \n\n'));
  assert.deepEqual(row.scrape_metadata, webMetadata);
  row.source.url = 'https://example.com/new';
  assert.equal(usableScrapedMarkdown(row), '');
  const stale = structuredClone(row);
  assert.equal((await send({ ...body, expectedRevision: 1 })).status, 409); assert.deepEqual(row, stale);
  row = { ...initial(), scraped_markdown: 'x'.repeat(199999), scrape_metadata: { method: 'manual' } };
  const oversized = structuredClone(row);
  assert.equal((await send()).status, 413); assert.deepEqual(row, oversized);
  for (const mutate of [() => { row.revision++; }, () => { row = null; }, () => { row.id++; }]) {
    row = initial(); onLock = mutate;
    const status = (await send()).status;
    assert.equal(status, row ? 409 : 404, 'Concurrent edits, deletion, and recreation cannot be overwritten');
  }
  onLock = undefined; row = null; assert.equal((await send()).status, 404);
  console.log('Document ingestion checks passed: real PDF/Excel conversion, validation, authentication, append, revision conflicts, provenance, and rollback.');
} finally {
  if (savedOrigin === undefined) delete process.env.APP_ORIGIN; else process.env.APP_ORIGIN = savedOrigin;
  server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve()));
}
