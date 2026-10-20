import type { AttributeSet } from '../types';
import type { AppSettings } from './providerSettings';

export const IDQ_URL = 'attributes__url';
export const IDQ_SET = 'attributes__attribute_set';
export const IDQ_SAP = 'source__sap';
export const IDQ_MISMATCHES = 'idq_mismatches';
export const IDQ_REVIEW_COLUMNS = ['sku', IDQ_URL, IDQ_SET, 'Input row', 'Status', 'Type', 'Attribute', 'Finding'];
export const IDQ_LIMITS = { products: 50, searches: 4, reads: 6, totalMs: 600_000, finalMs: 90_000 };
export type IdqMode = 'research' | 'url' | 'scraped';
export type IdqRequirements = Record<string, 'mandatory' | 'optional'>;
export type IdqSheet = { columns: string[]; rows: string[][] };
export type IdqMapping = { id: string; name: string; headers: string[]; requirements: IdqRequirements; rules: string };
export type IdqInput = { url: string; attributeSet: string; columns: string[]; values: Record<string, string> };
export type IdqConfig = { mode: IdqMode; mappings: IdqMapping[]; settings: AppSettings; limits: typeof IDQ_LIMITS };
export type IdqSource = { id: string; url: string; kind: 'supplied' | 'original' | 'research'; text: string; receivedAt: string };
export type IdqReference = { sourceId: string; quote: string };
export type IdqFact = { header: string; value: string; evidence: IdqReference[] };
export type IdqIdentity = { description: string; anchors: Array<{ value: string; quote: string; kind?: 'model' | 'gtin' | 'mpn' | 'product' }>; variants: Array<{ value: string; quote: string }>; market: string; language: string; ambiguous?: boolean };
export type IdqBaseline = { identity: IdqIdentity; facts: IdqFact[]; sapFacts?: Array<{ header: string; value: string; quote: string }>; galleryId?: string; issues: string[] };
export type IdqMismatch = { header: string; uploaded: string; sap: string; selected: string };
export type IdqResult = { values: Record<string, string>; added: string[]; notes: Record<string, string[]>; conflicts: string[]; missing: string[]; issues: string[]; mismatches?: IdqMismatch[]; verified?: string[]; readyForUpload?: boolean };
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
export const idqSap = (input: IdqInput) => input.values[IDQ_SAP] || input.values.attributes__sap || '';

export function validateIdqRequirements(value: unknown, headers?: string[]): asserts value is IdqRequirements {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.entries(value).some(([key, flag]) =>
    (headers && !headers.includes(key)) || (flag !== 'mandatory' && flag !== 'optional'))) {
    throw new Error('Classify configured headers as Mandatory or Optional.');
  }
}
export function idqMapping(set: AttributeSet, mode: IdqMode = 'scraped'): IdqMapping {
  const headers = set.catalogHeaders;
  const requirements = set.catalogHeaderRequirements || {};
  validateIdqRequirements(requirements, headers);
  if (!headers.length) throw new Error(`Configure Catalog Output Headers in attribute set “${set.name}” before running IDQ.`);
  if (mode !== 'research' && headers.some(header => !Object.hasOwn(requirements, header))) {
    throw new Error(`Classify every Catalog Output Header as Mandatory or Optional in attribute set “${set.name}” before running IDQ.`);
  }
  return { id: set.id, name: set.name, headers: [...headers], requirements: { ...requirements }, rules: set.rulesMarkdown };
}

export function validateIdqInput(mode: unknown, sheets: unknown, sets: AttributeSet[]): { mode: IdqMode; items: IdqInput[]; mappings: IdqMapping[] } {
  if (!['research', 'url', 'scraped'].includes(mode as string) || !Array.isArray(sheets) || !sheets.length) throw new Error('Upload an Excel workbook with product data.');
  const items: IdqInput[] = [], mappings = new Map<string, IdqMapping>();
  const seenSkus = new Set<string>();
  for (const sheet of sheets) {
    const columns = sheet?.columns;
    if (!Array.isArray(columns) || !columns.length || columns.length > 1000 || columns.some(h => typeof h !== 'string' || !h.trim() || h !== h.trim() || h.length > 255 || /[\x00-\x1f]/.test(h)) || new Set(columns).size !== columns.length) throw new Error('Each worksheet needs unique, nonempty column names without surrounding whitespace.');
    const setColumn = [IDQ_SET, 'attribute_set', 'attribute set'].find(header => columns.includes(header));
    if (!setColumn || (mode !== 'research' && !columns.includes(IDQ_URL))) throw new Error(`Each worksheet needs an attribute set column${mode === 'research' ? '.' : ` and ${IDQ_URL}.`}`);
    if (mode === 'research' && !columns.includes('sku')) throw new Error('Each worksheet needs a sku column.');
    if (!Array.isArray(sheet.rows)) throw new Error('Invalid workbook rows.');
    for (const row of sheet.rows) {
      if (!Array.isArray(row) || row.length !== columns.length || row.some(v => typeof v !== 'string' || v.length > 32767)) throw new Error('Workbook cells must be text no longer than 32,767 characters.');
      if (row.every((value, index) => columns[index] === setColumn || blank(value))) continue;
      if (items.length >= IDQ_LIMITS.products) throw new Error('IDQ accepts at most 50 products per batch.');
      const values: Record<string, string> = Object.fromEntries(columns.map((header, index) => [header, row[index]]));
      const matches = sets.filter(s => s.name.trim().toLowerCase() === values[setColumn].trim().toLowerCase());
      if (matches.length !== 1) throw new Error(`${matches.length ? 'Ambiguous' : 'Unknown'} attribute set “${values[setColumn]}”.`);
      const set = matches[0];
      if (mode === 'research') {
        if (!set.rulesMarkdown.trim()) throw new Error(`Add Mapping Rules for attribute set “${set.name}” before running IDQ.`);
        if (blank(values.sku)) throw new Error('Every product needs a SKU.');
        if (seenSkus.has(values.sku.trim())) throw new Error(`Duplicate SKU “${values.sku}”.`);
        seenSkus.add(values.sku.trim());
        const controls = ['sku', 'base_code', setColumn, IDQ_URL, 'source__url', IDQ_SAP, 'attributes__sap', 'image_url', IDQ_MISMATCHES];
        if (!Object.entries(values).some(([header, value]) => !controls.includes(header) && !blank(value))) throw new Error(`SKU “${values.sku}” needs product information such as a title, bullets or specifications.`);
      }
      // URL safety and DNS are also checked on the server before any paid operation.
      const suppliedUrl = values[IDQ_URL] || values.source__url || '';
      let url = '';
      if (suppliedUrl || mode !== 'research') {
        let parsed: URL;
        try { parsed = new URL(suppliedUrl); } catch { throw new Error(`Invalid product URL: ${suppliedUrl}`); }
        if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password || /[\s\\\x00-\x1f]/.test(suppliedUrl)) throw new Error('Use a valid public HTTP(S) product URL without credentials.');
        parsed.hash = ''; url = parsed.href;
      }
      if (!mappings.has(set.id)) mappings.set(set.id, idqMapping(set, mode as IdqMode));
      items.push({ url, attributeSet: set.name, columns, values });
    }
  }
  if (!items.length) throw new Error('The workbook contains no products.');
  return { mode: mode as IdqMode, items, mappings: [...mappings.values()] };
}

export function idqBaseResult(input: IdqInput, mapping: IdqMapping, state: IdqProgress): IdqResult {
  const values = Object.fromEntries([...new Set([...mapping.headers, ...input.columns, 'image_url'])].map(h => [h, Object.hasOwn(input.values, h) ? input.values[h] : '']));
  const aliases = { [IDQ_SET]: input.attributeSet, attribute_set: input.attributeSet, 'attribute set': input.attributeSet,
    [IDQ_SAP]: idqSap(input), attributes__sap: idqSap(input), [IDQ_URL]: input.url, source__url: input.url };
  for (const [header, value] of Object.entries(aliases)) if (Object.hasOwn(values, header) && blank(values[header])) values[header] = value;
  const notes = Object.assign(Object.create(null), Object.fromEntries(Object.entries(input.values).filter(([,v]) => !blank(v)).map(([h]) => [h, [`Supplied catalog data; not re-fetched.\nURL: ${input.url}`]])));
  return { values, notes, added: [], conflicts: [], missing: mapping.headers.filter(h => mapping.requirements[h] === 'mandatory' && blank(values[h])), issues: [...state.issues], mismatches: [] };
}
