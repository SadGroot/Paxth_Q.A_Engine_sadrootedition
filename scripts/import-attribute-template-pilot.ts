import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Pool } from 'pg';
import XLSX from 'xlsx';
import { validateCatalogHeaders } from '../src/lib/catalogGeneration';
import { validateIdqRequirements } from '../src/lib/idq';
import { transaction } from '../src/server/database';

export const PILOT_SETS = [
  'Elec-Audio-Headphones', 'Elec-LA-Washing Machines', 'H&L-Luggage',
  'H&L-Stationery-Art & Craft', 'H&L-Stationery-Calculators',
] as const;
export const ADDITIONAL_SETS = [
  'E-HM-Weighing scales',
  'Elec-Audio-Audio Accessories',
  'Elec-Audio-Musical Instruments',
  'Elec-Audio-Receiver',
  'Elec-Audio-Soundbars&Speakers',
  'Elec-C&A-PCACC-External Storages',
  'Elec-C&A-PCACC-Laptop Stand & Mouse Pad',
  'Elec-C&A-PCACC-Memory Card Adapters',
  'Elec-C&A-PCACC-Other PC Accessories',
  'Elec-C&A-PCACC-PC Keyboards & Mouse',
  'Elec-C&A-PCACC-Web camera',
  'Elec-Gaming-Consoles',
  'Elec-Gaming-GA-Controllers',
  'Elec-Gaming-GA-Gaming Chairs & Desks',
  'Elec-Gaming-GA-Gaming-Accessories',
  'Elec-Gaming-Titles',
  'Elec-Gaming-VR Headsets',
  'Elec-HA-Air Purifier Filters',
  'Elec-HA-Air Purifiers',
  'Elec-HA-Disinfectant Equipment',
  'Elec-HA-Fans',
  'Elec-HA-Garment Steamers',
  'Elec-HA-Heaters',
  'Elec-HA-Insect Killers',
  'Elec-HA-Irons',
  'Elec-HA-Pressure Washers',
  'Elec-HA-Robotic Vacuum Cleaner',
  'Elec-HA-Sewing Machines',
  'Elec-HA-Vacuum Cleaner Accessories',
  'Elec-HA-Vacuum Cleaners',
  'Elec-HA-Water Filters & Accessories',
  'Elec-ITACC-Other IT Accessories',
  'Elec-ITACC-Printers, Scanners & Accessories',
  'Elec-ITACC-Routers & Wi-Fi Range Extenders',
  'Elec-ITACC-Smart Devices & Accessories',
  'Elec-ITACC-Softwares',
  'Elec-LA-Cooker Hoods',
  'Elec-LA-Cooking Hobs',
  'Elec-LA-Cooking Ranges',
  'Elec-LA-Dishwashers',
  'Elec-LA-Refrigerators',
  'Elec-M&W-MA-Mobile Cases & Skins',
  'Elec-M&W-MA-Power Banks',
  'Elec-M&W-MA-Screen Protectors',
  'Elec-M&W-MA-Stands & Other Accessories',
  'Elec-M&W-W-Wearable Accessories',
  'Elec-PC-Electric Toothbrush',
  'Elec-PC-Epilators & IPL Hair Remover',
  'Elec-PC-Hair Stylers',
  'Elec-PC-Shavers & Trimmers',
] as const;
const root = fileURLToPath(new URL('../', import.meta.url));

export function readTemplate(sheet: XLSX.WorkSheet, sampleRows: readonly number[] = [3]) {
  // shortcut: row positions are fixed for reviewed layouts; inspect them before adding another batch.
  const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, raw: false, defval: '' });
  const catalogHeaders = rows[1] ?? [];
  validateCatalogHeaders(catalogHeaders);
  assert.ok(catalogHeaders.length, 'Missing template headers on row 2.');
  assert.ok(catalogHeaders.includes('name'), 'Expected a catalog name column.');
  const skuColumn = catalogHeaders.indexOf('sku'), nameColumn = catalogHeaders.indexOf('name');
  const samples = sampleRows.map(row => {
    const cells = rows[row - 1];
    assert.ok(row >= 3 && cells?.[skuColumn]?.trim() && cells[nameColumn]?.trim(), `Missing sample product on row ${row}.`);
    return { row, values: Object.fromEntries(catalogHeaders.map((header, column) => [header, cells[column] ?? ''])) };
  });
  assert.ok(samples[0]?.row === 3, 'Missing sample product on row 3.');
  return { catalogHeaders, sample: samples[0].values, samples };
}

export function validateRuleCoverage(headers: string[], rules: string) {
  const headings = [...rules.matchAll(/^## (.+)$/gm)].map(match => match[1]);
  assert.deepEqual(headings, headers, 'Mapping rules must cover each exact header once, in workbook order.');
}

export type ReviewedTemplate = {
  name: string; source: string | null; sheet: string | null; headerRow: number | null;
  sampleRows: number[]; catalogHeaders: string[]; rulesFile: string; provenance: string; corrections: string[];
  ignoredSampleHeaders?: string[];
};

export async function loadAllManifest(): Promise<ReviewedTemplate[]> {
  const entries: ReviewedTemplate[] = JSON.parse(await readFile(join(root, 'docs/attribute-template-all/manifest.json'), 'utf8'));
  assert.ok(entries.length && new Set(entries.map(entry => entry.name)).size === entries.length, 'Reviewed backend names must be unique.');
  for (const entry of entries) validateCatalogHeaders(entry.catalogHeaders);
  return entries;
}

export function readReviewedSamples(sheet: XLSX.WorkSheet, entry: Pick<ReviewedTemplate, 'headerRow' | 'sampleRows' | 'catalogHeaders' | 'ignoredSampleHeaders'>) {
  const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, raw: false, defval: '' });
  const rawHeaders = (rows[entry.headerRow - 1] ?? []).map(header => header.trim() === 'attributes__product_type' ? 'attributes__lulu_product_type' : header.trim());
  return entry.sampleRows.map(row => {
    assert.ok(row > entry.headerRow && rows[row - 1]?.some(value => value.trim()), `Missing reviewed sample on row ${row}.`);
    return { row, values: Object.fromEntries(entry.catalogHeaders.map(header => [header, entry.ignoredSampleHeaders?.includes(header) ? '' :
      [...new Set(rawHeaders.flatMap((key, index) => key === header && rows[row - 1][index] ? [rows[row - 1][index]] : []))].join('\n'),
    ])) };
  });
}

export async function loadPilotTemplates(batch: 'pilot' | 'batch-50' | 'all' = 'pilot') {
  if (batch === 'all') {
    return Promise.all((await loadAllManifest()).map(async entry => {
      let samples: Array<{ row: number; values: Record<string, string> }> = [];
      if (entry.source && entry.headerRow) {
        const book = XLSX.read(await readFile(join(root, entry.source)), { type: 'buffer' });
        assert.ok(entry.sheet && book.Sheets[entry.sheet], `${entry.name}: missing reviewed sheet.`);
        samples = readReviewedSamples(book.Sheets[entry.sheet], entry);
      }
      const rulesMarkdown = await readFile(join(root, entry.rulesFile), 'utf8');
      validateRuleCoverage(entry.catalogHeaders, rulesMarkdown);
      return { ...entry, rulesMarkdown, samples, sample: samples[0]?.values ?? Object.fromEntries(entry.catalogHeaders.map(header => [header, ''])) };
    }));
  }
  const names = batch === 'pilot' ? PILOT_SETS : ADDITIONAL_SETS;
  return Promise.all(names.map(async name => {
    const source = `OneDrive_2_10-15-2026/${name}.xls`;
    const book = XLSX.read(await readFile(join(root, source)), { type: 'buffer' });
    assert.equal(book.SheetNames.length, 1, `${source}: inspect multi-sheet workbooks before importing.`);
    const sheet = book.SheetNames[0];
    const { catalogHeaders, sample, samples } = readTemplate(book.Sheets[sheet], name === 'Elec-HA-Vacuum Cleaners' ? [3, 4] : [3]);
    const rulesMarkdown = await readFile(join(root, `docs/attribute-template-${batch}`, `${name}.md`), 'utf8');
    validateRuleCoverage(catalogHeaders, rulesMarkdown);
    return { name, source, sheet, catalogHeaders, rulesMarkdown, sample, samples };
  }));
}

type PilotTemplate = Awaited<ReturnType<typeof loadPilotTemplates>>[number];

export async function applyPilotTemplates(pool: Pool, templates: PilotTemplate[], backupFile: string) {
  const allNames = (await loadAllManifest()).map(entry => entry.name);
  const matches = (names: readonly string[]) => names.length === templates.length && names.every((name, index) => name === templates[index].name);
  const fillMissing = matches(allNames);
  assert.ok([PILOT_SETS, ADDITIONAL_SETS].some(matches) || fillMissing,
    'Only a complete reviewed pilot, fifty-set batch, or all-set manifest can be applied.');
  for (const template of templates) {
    validateCatalogHeaders(template.catalogHeaders);
    validateRuleCoverage(template.catalogHeaders, template.rulesMarkdown);
  }
  return transaction(pool, async client => {
    const { rows } = await client.query(`SELECT id,name,rules_markdown,catalog_headers,catalog_header_requirements,created_at,updated_at
      FROM attribute_sets WHERE lower(btrim(name))=ANY($1::text[]) ORDER BY name FOR UPDATE`,
    [templates.map(template => template.name.toLowerCase())]);
    assert.equal(rows.length, templates.length, 'Each workbook must match one existing backend attribute set.');
    const changes = templates.flatMap(template => {
      const existing = rows.find(row => row.name.trim().toLowerCase() === template.name.toLowerCase());
      assert.ok(existing, `No existing attribute set for ${template.name}.`);
      const rulesMarkdown = fillMissing && existing.rules_markdown.trim() ? existing.rules_markdown : template.rulesMarkdown;
      const catalogHeaders = fillMissing && existing.catalog_headers.length ? existing.catalog_headers : template.catalogHeaders;
      validateCatalogHeaders(catalogHeaders);
      validateIdqRequirements(existing.catalog_header_requirements, catalogHeaders);
      const unchanged = existing.rules_markdown === rulesMarkdown && JSON.stringify(existing.catalog_headers) === JSON.stringify(catalogHeaders);
      if (unchanged) return [];
      assert.ok(fillMissing || (!existing.rules_markdown.trim() && existing.catalog_headers.length === 0),
        `${template.name}: existing rules or headers differ; refusing to overwrite saved configuration.`);
      if (!fillMissing) assert.equal(Object.keys(existing.catalog_header_requirements).length, 0, `${template.name}: existing header classifications need review.`);
      return [{ rulesMarkdown, catalogHeaders, existing }];
    });
    if (!changes.length) return 0;
    await mkdir(dirname(backupFile), { recursive: true });
    await writeFile(backupFile, JSON.stringify({ savedAt: new Date().toISOString(), attributeSets: rows }, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
    for (const { rulesMarkdown, catalogHeaders, existing } of changes) {
      const { rows: [saved] } = await client.query(`UPDATE attribute_sets SET rules_markdown=$2,catalog_headers=$3::jsonb,updated_at=now()
        WHERE id=$1 RETURNING id,name,rules_markdown,catalog_headers,catalog_header_requirements`,
      [existing.id, rulesMarkdown, JSON.stringify(catalogHeaders)]);
      assert.equal(saved.id, existing.id);
      assert.equal(saved.name, existing.name);
      assert.equal(saved.rules_markdown, rulesMarkdown);
      assert.deepEqual(saved.catalog_headers, catalogHeaders);
      assert.deepEqual(saved.catalog_header_requirements, existing.catalog_header_requirements);
    }
    return changes.length;
  });
}

async function main() {
  const args = process.argv.slice(2);
  assert.ok(new Set(args).size === args.length && args.every(arg => ['--apply', '--batch-50', '--all'].includes(arg)) && !(args.includes('--all') && args.includes('--batch-50')),
    'Usage: npx tsx scripts/import-attribute-template-pilot.ts [--batch-50 | --all] [--apply]');
  const batch = args.includes('--all') ? 'all' : args.includes('--batch-50') ? 'batch-50' : 'pilot';
  const templates = await loadPilotTemplates(batch);
  const previewFile = join(root, `.cache/attribute-template-${batch}/preview.json`);
  await mkdir(dirname(previewFile), { recursive: true });
  await writeFile(previewFile, JSON.stringify(templates, null, 2) + '\n');
  console.table(templates.map(template => ({ name: template.name, headers: template.catalogHeaders.length, rules: template.catalogHeaders.length })));
  console.log(`Format-only preview: ${previewFile}`);
  if (!args.includes('--apply')) return;
  const { pool } = await import('../src/db/index');
  assert.ok(pool, 'Set DATABASE_URL before applying the pilot.');
  try {
    const names = templates.map(template => template.name.toLowerCase());
    const { rows: before } = await pool.query(`SELECT name,rules_markdown,catalog_headers FROM attribute_sets WHERE lower(btrim(name))=ANY($1::text[])`, [names]);
    const backupFile = join(root, 'backups', `attribute-template-${batch}-${new Date().toISOString().replaceAll(':', '-')}.json`);
    const changed = await applyPilotTemplates(pool, templates, backupFile);
    const { rows } = await pool.query(`SELECT name,rules_markdown,catalog_headers FROM attribute_sets WHERE lower(btrim(name))=ANY($1::text[])`, [names]);
    for (const template of templates) {
      const saved = rows.find(row => row.name.trim().toLowerCase() === template.name.toLowerCase());
      const previous = before.find(row => row.name.trim().toLowerCase() === template.name.toLowerCase());
      assert.ok(saved, `Missing persisted set ${template.name}.`);
      assert.equal(saved.rules_markdown, batch === 'all' && previous.rules_markdown.trim() ? previous.rules_markdown : template.rulesMarkdown);
      assert.deepEqual(saved.catalog_headers, batch === 'all' && previous.catalog_headers.length ? previous.catalog_headers : template.catalogHeaders);
    }
    console.log(`${changed} attribute sets updated; all ${templates.length} verified from a fresh database read.${changed ? ` Backup: ${backupFile}` : ''}`);
  } finally { await pool.end(); }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
