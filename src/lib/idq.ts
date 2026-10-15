import type { AttributeSet } from '../types';
import type { AppSettings } from './providerSettings';

export const IDQ_URL = 'attributes__url';
export const IDQ_SET = 'attributes__attribute_set';
export const IDQ_REVIEW_COLUMNS = [IDQ_URL, IDQ_SET, 'Input row', 'Status', 'Type', 'Attribute', 'Finding'];
export const IDQ_LIMITS = { products: 50, searches: 4, reads: 6, totalMs: 600_000, finalMs: 90_000 };
export type IdqMode = 'url' | 'scraped';
export type IdqRequirements = Record<string, 'mandatory' | 'optional'>;
export type IdqSheet = { columns: string[]; rows: string[][] };
export type IdqMapping = { id: string; name: string; headers: string[]; requirements: IdqRequirements; rules: string };
export type IdqInput = { url: string; attributeSet: string; columns: string[]; values: Record<string, string> };
export type IdqConfig = { mode: IdqMode; mappings: IdqMapping[]; settings: AppSettings; limits: typeof IDQ_LIMITS };
export type IdqSource = { id: string; url: string; kind: 'supplied' | 'original' | 'research'; text: string; receivedAt: string };
export type IdqReference = { sourceId: string; quote: string };
export type IdqFact = { header: string; value: string; evidence: IdqReference[] };
export type IdqIdentity = { description: string; anchors: Array<{ value: string; quote: string; kind?: 'model' | 'gtin' | 'mpn' }>; variants: Array<{ value: string; quote: string }>; market: string; language: string };
export type IdqBaseline = { identity: IdqIdentity; facts: IdqFact[]; galleryId?: string; issues: string[] };
export type IdqResult = { values: Record<string, string>; added: string[]; notes: Record<string, string[]>; conflicts: string[]; missing: string[]; issues: string[] };
export type IdqProgress = {
  deadlineAt?: number; captureAttempted?: boolean; capture?: IdqSource; galleries?: Array<{ id: string; label: string; images: Array<{ url: string; alt: string }> }>;
  baseline?: IdqBaseline; sources: IdqSource[];
  searches: Array<{ query: string; results?: Array<{ title: string; url: string; snippet: string }>; error?: string }>;
  reads: Array<{ url: string; error?: string }>; messages?: any[];
  calls: Record<string, { attempts: number; response?: any; error?: string; reasoningEffort?: string; lastFailure?: { status: number; retryable: boolean } }>;
  imageChecked?: boolean; issues: string[]; stage?: string; result?: IdqResult;
};
export const emptyIdqProgress = (): IdqProgress => ({ sources: [], searches: [], reads: [], calls: {}, issues: [] });
export const blank = (value: unknown) => typeof value !== 'string' || !value.trim();

export function validateIdqRequirements(value: unknown, headers?: string[]): asserts value is IdqRequirements {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.entries(value).some(([key, flag]) =>
    (headers && !headers.includes(key)) || (flag !== 'mandatory' && flag !== 'optional'))) {
    throw new Error('Classify configured headers as Mandatory or Optional.');
  }
}
export function idqMapping(set: AttributeSet): IdqMapping {
  const headers = set.catalogHeaders;
  const requirements = set.catalogHeaderRequirements || {};
  validateIdqRequirements(requirements, headers);
  if (!headers.length || headers.some(header => !Object.hasOwn(requirements, header))) {
    throw new Error(`Classify every Catalog Output Header as Mandatory or Optional in attribute set “${set.name}” before running IDQ.`);
  }
  return { id: set.id, name: set.name, headers: [...headers], requirements: { ...requirements }, rules: set.rulesMarkdown };
}

export function validateIdqInput(mode: unknown, sheets: unknown, sets: AttributeSet[]): { mode: IdqMode; items: IdqInput[]; mappings: IdqMapping[] } {
  if ((mode !== 'url' && mode !== 'scraped') || !Array.isArray(sheets) || !sheets.length) throw new Error('Choose URL list or Already-scraped catalog and upload an Excel workbook.');
  const items: IdqInput[] = [], mappings = new Map<string, IdqMapping>();
  for (const sheet of sheets) {
    const columns = sheet?.columns;
    if (!Array.isArray(columns) || !columns.length || columns.length > 1000 || columns.some(h => typeof h !== 'string' || !h.trim() || h !== h.trim() || h.length > 255 || /[\x00-\x1f]/.test(h)) || new Set(columns).size !== columns.length) throw new Error('Each worksheet needs unique, nonempty column names without surrounding whitespace.');
    if (!columns.includes(IDQ_URL) || !columns.includes(IDQ_SET)) throw new Error(`Each worksheet needs ${IDQ_URL} and ${IDQ_SET}.`);
    if (!Array.isArray(sheet.rows)) throw new Error('Invalid workbook rows.');
    for (const row of sheet.rows) {
      if (!Array.isArray(row) || row.length !== columns.length || row.some(v => typeof v !== 'string' || v.length > 32767)) throw new Error('Workbook cells must be text no longer than 32,767 characters.');
      if (row.every((value, index) => columns[index] === IDQ_SET || blank(value))) continue;
      if (items.length >= IDQ_LIMITS.products) throw new Error('IDQ accepts at most 50 products per batch.');
      const values: Record<string, string> = Object.fromEntries(columns.map((header, index) => [header, row[index]]));
      const set = sets.find(s => s.name.trim().toLowerCase() === values[IDQ_SET].trim().toLowerCase());
      if (!set) throw new Error(`Unknown attribute set “${values[IDQ_SET]}”.`);
      // URL safety and DNS are also checked on the server before any paid operation.
      let url: URL;
      try { url = new URL(values[IDQ_URL]); } catch { throw new Error(`Invalid product URL: ${values[IDQ_URL]}`); }
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || /[\s\\\x00-\x1f]/.test(values[IDQ_URL])) throw new Error('Use a valid public HTTP(S) product URL without credentials.');
      url.hash = '';
      if (!mappings.has(set.id)) mappings.set(set.id, idqMapping(set));
      items.push({ url: url.href, attributeSet: set.name, columns, values });
    }
  }
  if (!items.length) throw new Error('The workbook contains no products.');
  return { mode: mode as IdqMode, items, mappings: [...mappings.values()] };
}

export function idqBaseResult(input: IdqInput, mapping: IdqMapping, state: IdqProgress): IdqResult {
  const values = Object.fromEntries([...new Set([...mapping.headers, ...input.columns, 'image_url'])].map(h => [h, Object.hasOwn(input.values, h) ? input.values[h] : '']));
  const notes = Object.assign(Object.create(null), Object.fromEntries(Object.entries(input.values).filter(([,v]) => !blank(v)).map(([h]) => [h, [`Supplied catalog data; not re-fetched.\nURL: ${input.url}`]])));
  return { values, notes, added: [], conflicts: [], missing: mapping.headers.filter(h => mapping.requirements[h] === 'mandatory' && blank(values[h])), issues: [...state.issues] };
}
