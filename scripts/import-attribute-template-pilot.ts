import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Pool } from 'pg';
import XLSX from 'xlsx';
import { validateCatalogHeaders } from '../src/lib/catalogGeneration';
import { transaction } from '../src/server/database';

export const PILOT_SETS = [
  'Elec-Audio-Headphones', 'Elec-LA-Washing Machines', 'H&L-Luggage',
  'H&L-Stationery-Art & Craft', 'H&L-Stationery-Calculators',
] as const;
const root = fileURLToPath(new URL('../', import.meta.url));

export function readTemplate(sheet: XLSX.WorkSheet) {
  // shortcut: these five reviewed templates use rows 2/3, inspect layouts before extending the pilot.
  const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, raw: false, defval: '' });
  const catalogHeaders = rows[1] ?? [];
  validateCatalogHeaders(catalogHeaders);
  assert.ok(catalogHeaders.length, 'Missing template headers on row 2.');
  assert.ok(catalogHeaders.includes('name'), 'Expected a catalog name column.');
  assert.ok(rows[2]?.some(value => value.trim()), 'Missing sample product on row 3.');
  return { catalogHeaders, sample: Object.fromEntries(catalogHeaders.map((header, index) => [header, rows[2][index] ?? ''])) };
}

export function validateRuleCoverage(headers: string[], rules: string) {
  const headings = [...rules.matchAll(/^## (.+)$/gm)].map(match => match[1]);
  assert.deepEqual(headings, headers, 'Mapping rules must cover each exact header once, in workbook order.');
}

export async function loadPilotTemplates() {
  return Promise.all(PILOT_SETS.map(async name => {
    const source = `OneDrive_2_10-15-2026/${name}.xls`;
    const book = XLSX.read(await readFile(join(root, source)), { type: 'buffer' });
    assert.equal(book.SheetNames.length, 1, `${source}: inspect multi-sheet workbooks before importing.`);
    const sheet = book.SheetNames[0];
    const { catalogHeaders, sample } = readTemplate(book.Sheets[sheet]);
    const rulesMarkdown = await readFile(join(root, 'docs/attribute-template-pilot', `${name}.md`), 'utf8');
    validateRuleCoverage(catalogHeaders, rulesMarkdown);
    return { name, source, sheet, catalogHeaders, rulesMarkdown, sample };
  }));
}

type PilotTemplate = Awaited<ReturnType<typeof loadPilotTemplates>>[number];

export async function applyPilotTemplates(pool: Pool, templates: PilotTemplate[], backupFile: string) {
  assert.deepEqual(templates.map(template => template.name), [...PILOT_SETS], 'Only the reviewed five-set pilot can be applied.');
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
      const unchanged = existing.rules_markdown === template.rulesMarkdown && JSON.stringify(existing.catalog_headers) === JSON.stringify(template.catalogHeaders);
      if (unchanged) return [];
      assert.ok(!existing.rules_markdown.trim() && existing.catalog_headers.length === 0,
        `${template.name}: existing rules or headers differ; refusing to overwrite saved configuration.`);
      assert.equal(Object.keys(existing.catalog_header_requirements).length, 0, `${template.name}: existing header classifications need review.`);
      return [{ template, existing }];
    });
    if (!changes.length) return 0;
    await mkdir(dirname(backupFile), { recursive: true });
    await writeFile(backupFile, JSON.stringify({ savedAt: new Date().toISOString(), attributeSets: rows }, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
    for (const { template, existing } of changes) {
      const { rows: [saved] } = await client.query(`UPDATE attribute_sets SET rules_markdown=$2,catalog_headers=$3::jsonb,updated_at=now()
        WHERE id=$1 RETURNING id,name,rules_markdown,catalog_headers,catalog_header_requirements`,
      [existing.id, template.rulesMarkdown, JSON.stringify(template.catalogHeaders)]);
      assert.equal(saved.id, existing.id);
      assert.equal(saved.name, existing.name);
      assert.equal(saved.rules_markdown, template.rulesMarkdown);
      assert.deepEqual(saved.catalog_headers, template.catalogHeaders);
      assert.deepEqual(saved.catalog_header_requirements, existing.catalog_header_requirements);
    }
    return changes.length;
  });
}

async function main() {
  const args = process.argv.slice(2);
  assert.ok(args.length === 0 || (args.length === 1 && args[0] === '--apply'), 'Usage: npx tsx scripts/import-attribute-template-pilot.ts [--apply]');
  const templates = await loadPilotTemplates();
  const previewFile = join(root, '.cache/attribute-template-pilot/preview.json');
  await mkdir(dirname(previewFile), { recursive: true });
  await writeFile(previewFile, JSON.stringify(templates, null, 2) + '\n');
  console.table(templates.map(template => ({ name: template.name, headers: template.catalogHeaders.length, rules: template.catalogHeaders.length })));
  console.log(`Format-only preview: ${previewFile}`);
  if (!args.includes('--apply')) return;
  const { pool } = await import('../src/db/index');
  assert.ok(pool, 'Set DATABASE_URL before applying the pilot.');
  try {
    const backupFile = join(root, 'backups', `attribute-template-pilot-${new Date().toISOString().replaceAll(':', '-')}.json`);
    const changed = await applyPilotTemplates(pool, templates, backupFile);
    const { rows } = await pool.query(`SELECT name,rules_markdown,catalog_headers FROM attribute_sets WHERE lower(btrim(name))=ANY($1::text[])`, [templates.map(template => template.name.toLowerCase())]);
    for (const template of templates) {
      const saved = rows.find(row => row.name.trim().toLowerCase() === template.name.toLowerCase());
      assert.ok(saved, `Missing persisted set ${template.name}.`);
      assert.equal(saved.rules_markdown, template.rulesMarkdown);
      assert.deepEqual(saved.catalog_headers, template.catalogHeaders);
    }
    console.log(`${changed} attribute sets updated; all five verified from a fresh database read.${changed ? ` Backup: ${backupFile}` : ''}`);
  } finally { await pool.end(); }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
