import type { Express } from 'express';
import type { Pool } from 'pg';
import * as XLSX from 'xlsx';
import { ApiError, mapCatalogRow, object } from './catalog';
import { transaction } from './database';
import { MAX_SCRAPE_CHARACTERS } from '../lib/cloudScrape';
import { usableScrapedMarkdown } from '../lib/scrapeEvidence';

export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
const escapeMarkdown = (value: string) => value.replace(/([\\`*_{}\[\]()#+.!|<>~-])/g, '\\$1');

export async function documentMarkdown(fileName: unknown, dataBase64: unknown): Promise<string> {
  if (typeof fileName !== 'string' || !fileName.trim() || fileName.length > 256 || /[\x00-\x1f\x7f/\\]/.test(fileName)) {
    throw new ApiError(400, 'Supply a valid filename without a path.');
  }
  const extension = fileName.match(/\.(pdf|xlsx|xls)$/i)?.[1].toLowerCase();
  if (!extension) throw new ApiError(400, 'Choose a PDF, .xlsx, or .xls file.');
  if (typeof dataBase64 !== 'string' || !dataBase64.length) throw new ApiError(400, 'The file is empty.');
  if (dataBase64.length > 4 * Math.ceil(MAX_DOCUMENT_BYTES / 3)) throw new ApiError(413, 'Files must be 10 MiB or smaller.');
  if (dataBase64.length % 4 || !/^[A-Za-z0-9+/]*={0,2}$/.test(dataBase64)) throw new ApiError(400, 'Invalid file encoding.');
  const data = Buffer.from(dataBase64, 'base64');
  if (data.toString('base64') !== dataBase64) throw new ApiError(400, 'Invalid file encoding.');
  if (!data.length) throw new ApiError(400, 'The file is empty.');
  if (data.length > MAX_DOCUMENT_BYTES) throw new ApiError(413, 'Files must be 10 MiB or smaller.');

  let content: string;
  try {
    if (extension === 'pdf') {
      if (!data.subarray(0, 1024).includes(Buffer.from('%PDF-'))) throw new ApiError(400, 'The file is not a valid PDF.');
      const { PDFParse } = await import('pdf-parse');
      const parser = new PDFParse({ data, isEvalSupported: false });
      try {
        const result = await parser.getText({ pageJoiner: '' });
        if (!result.pages.some(page => page.text.trim())) {
          throw new ApiError(400, 'This PDF has no selectable text. Scanned PDFs require OCR and are not supported.');
        }
        content = result.pages.filter(page => page.text.trim()).map(page => `### Page ${page.num}\n\n${escapeMarkdown(page.text.trim())}`).join('\n\n');
      } finally { await parser.destroy(); }
    } else {
      const zip = data.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]));
      const ole = data.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]));
      if (extension === 'xlsx' ? !zip : !ole) throw new ApiError(400, 'The file does not match its Excel format.');
      const workbook = XLSX.read(data, { type: 'buffer', cellText: true, cellDates: false });
      const sections: string[] = [];
      for (const name of workbook.SheetNames) {
        const worksheet = workbook.Sheets[name];
        if (!worksheet['!ref']) continue;
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        // Even empty table cells need three characters; reject huge sparse ranges before expanding them.
        const minimumTableCharacters = 3 * (range.e.r - range.s.r + 2) * (range.e.c - range.s.c + 1);
        if (minimumTableCharacters > MAX_SCRAPE_CHARACTERS) throw new ApiError(413, 'Converted content exceeds 200,000 characters.');
        const grid = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1, raw: false, defval: '', blankrows: true });
        if (!grid.some(row => row.some(cell => String(cell).trim()))) continue;
        const columns = grid.reduce((count, row) => Math.max(count, row.length), 0);
        const rows = grid.map(row => `| ${Array.from({ length: columns }, (_, i) => escapeMarkdown(String(row[i] ?? '')).replace(/\r\n?|\n/g, '<br>')).join(' | ')} |`);
        rows.splice(1, 0, `| ${Array(columns).fill('---').join(' | ')} |`);
        sections.push(`### ${escapeMarkdown(name)}\n\n${rows.join('\n')}`);
      }
      content = sections.join('\n\n');
      if (!content) throw new ApiError(400, 'The workbook has no nonempty worksheets.');
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(400, extension === 'pdf' ? 'Could not read this PDF. It may be corrupt or password-protected.' : 'Could not read this workbook. It may be corrupt or password-protected.');
  }
  const markdown = `## ${escapeMarkdown(fileName)}\n\n${content}`;
  if (markdown.length > MAX_SCRAPE_CHARACTERS) throw new ApiError(413, 'Converted content exceeds 200,000 characters.');
  return markdown;
}

export function registerDocumentIngestionRoutes(app: Express, pool: Pool) {
  app.post('/api/catalog/:sku/ingest', async (req, res) => {
    if (!object(req.body) || Object.keys(req.body).length !== 3 || !['expectedRevision', 'fileName', 'dataBase64'].every(key => Object.hasOwn(req.body, key)) ||
        !Number.isSafeInteger(req.body.expectedRevision) || req.body.expectedRevision < 0) {
      throw new ApiError(400, 'Supply expectedRevision, fileName, and dataBase64.');
    }
    const sku = String(req.params.sku), { expectedRevision, fileName, dataBase64 } = req.body;
    const { rows: [before] } = await pool.query('SELECT id,revision FROM sku_data WHERE sku=$1 AND owner_id=$2', [sku, res.locals.workspaceId]);
    if (!before) throw new ApiError(404, 'SKU not found.');
    if (before.revision !== expectedRevision) throw new ApiError(409, 'SKU evidence changed. Refresh the catalog before attaching a file.');
    const converted = await documentMarkdown(fileName, dataBase64);
    const saved = await transaction(pool, async client => {
      const { rows: [current] } = await client.query('SELECT * FROM sku_data WHERE sku=$1 AND owner_id=$2 FOR UPDATE', [sku, res.locals.workspaceId]);
      if (!current) throw new ApiError(404, 'SKU was deleted during ingestion.');
      if (current.id !== before.id || current.revision !== expectedRevision) throw new ApiError(409, 'SKU changed during ingestion. Refresh the catalog before retrying.');
      const existing = current.scraped_markdown || '';
      if (existing.trim() && !usableScrapedMarkdown(current)) throw new ApiError(409, 'The source URL changed. Rescrape or save manual content before attaching a file.');
      const markdown = existing.trim() ? `${existing}\n\n${converted}` : converted;
      if (markdown.length > MAX_SCRAPE_CHARACTERS) throw new ApiError(413, 'Combined Scraped Data exceeds 200,000 characters. Existing data was preserved.');
      const metadata = existing.trim() ? current.scrape_metadata || { method: 'legacy', requestedUrl: current.source?.url ?? null, finalUrl: null, capturedAt: null }
        : { method: 'manual', requestedUrl: null, finalUrl: null, capturedAt: new Date().toISOString() };
      const { rows: [row] } = await client.query(`UPDATE sku_data SET scraped_markdown=$3,scrape_metadata=$4,
        scrape_status='success',scrape_error=NULL,status='ready',error=NULL,revision=revision+1
        WHERE sku=$1 AND revision=$2 AND id=$5 AND owner_id=$6 RETURNING *`, [sku, expectedRevision, markdown, JSON.stringify(metadata), before.id, res.locals.workspaceId]);
      if (!row) throw new ApiError(409, 'SKU changed during ingestion. Refresh the catalog before retrying.');
      return mapCatalogRow(row);
    });
    res.json(saved);
  });
}
