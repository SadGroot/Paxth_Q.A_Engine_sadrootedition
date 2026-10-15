import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import ExcelJS from 'exceljs';
import { Pool } from 'pg';
import XLSX from 'xlsx';
import { CATALOG_PASS_THROUGH_HEADERS, getCatalogMapping, parseCatalogResponse, populateCatalogFile, prepareCatalogInput } from '../src/lib/catalogGeneration';
import type { SkuData } from '../src/hooks/useCatalogData';
import { applyPilotTemplates, loadPilotTemplates, readTemplate, validateRuleCoverage } from './import-attribute-template-pilot';

const templates = await loadPilotTemplates();
assert.deepEqual(templates.map(template => template.catalogHeaders.length), [63, 50, 50, 34, 40]);
assert.equal(templates.reduce((total, template) => total + template.catalogHeaders.length, 0), 237);

const fixture = (headers: string[], sample = ['00042']) => XLSX.utils.aoa_to_sheet([
  ['Core Product Identifiers', 'Marketing Content'], headers, sample,
  ['Below 75 characters'], ['Mandatory attributes'], ['attributes_wrong_spelling'],
]);
const goodHeaders = [...CATALOG_PASS_THROUGH_HEADERS, 'name'];
assert.deepEqual(readTemplate(fixture(goodHeaders)).catalogHeaders, goodHeaders, 'Grouping labels and annotation rows never become headers.');
assert.equal(readTemplate(fixture(goodHeaders)).sample.sku, '00042');
assert.throws(() => readTemplate(fixture([...goodHeaders, 'name'])), /unique/);
assert.throws(() => readTemplate(fixture(goodHeaders.map(header => header === 'name' ? 'name ' : header))), /whitespace/);
assert.throws(() => readTemplate(fixture(goodHeaders.filter(header => header !== 'attributes__brand'))), /pass-through/);
assert.throws(() => readTemplate(fixture(goodHeaders, [])), /Missing sample/);
assert.throws(() => readTemplate(XLSX.utils.aoa_to_sheet([goodHeaders])), /Missing template/);
assert.throws(() => validateRuleCoverage(goodHeaders, goodHeaders.slice(1).map(header => `## ${header}`).join('\n')), /each exact header/);
assert.throws(() => validateRuleCoverage(goodHeaders, [...goodHeaders, 'name'].map(header => `## ${header}`).join('\n')), /each exact header/);

const formatCases: Array<[number, string, RegExp, string]> = [
  [0, 'attributes__battery_capacity', /^\d+(?:\.\d+)? mAh$/, '{n} mAh'],
  [0, 'attributes__battery_life', /^\d+(?:\.\d+)? hours$/, '{n} hours'],
  [1, 'attributes__water_consumption', /^\d+(?:\.\d+)? L\/cycle$/, '{n} L/cycle'],
  [1, 'attributes__wattage', /^\d+(?:\.\d+)?W$/, '{n}W'],
  [2, 'attributes__capacity', /^\d+(?:\.\d+)?L$/, '{n}L'],
  [2, 'attributes__size', /^\d+(?:\.\d+)? inches$/, '{n} inches'],
  [3, 'attributes__weight', /^\d+(?:\.\d+)?g$/, '{n}g'],
  [3, 'attributes__pack', /^Pack of \d+$/, 'Pack of {n}'],
  [4, 'attributes__no_of_digits', /^\d+ Digits$/, '{n} Digits'],
  [4, 'attributes__display_lines', /^\d+-line$/, '{n}-line'],
];
const ruleFor = (rules: string, header: string) => rules.split(`\n## ${header}\n`)[1].split('\n## ')[0];
for (const [index, header, sampleShape, ruleShape] of formatCases) {
  const template = templates[index];
  assert.match(template.sample[header], sampleShape, `${template.name}: verify the observed sample shape.`);
  assert.ok(ruleFor(template.rulesMarkdown, header).includes(ruleShape), `${template.name}: ${header} must document its observed format.`);
}
for (const template of templates) {
  for (const header of template.catalogHeaders.filter(header => !template.sample[header])) {
    assert.match(ruleFor(template.rulesMarkdown, header), /sample cell is blank/i, `${template.name}: ${header} must disclose the missing format example.`);
  }
}

const workbook = new ExcelJS.Workbook();
for (const [index, template] of templates.entries()) {
  const mapping = getCatalogMapping(template.name, [template]);
  assert.deepEqual(mapping.headers, template.catalogHeaders);
  const raw = Object.fromEntries(CATALOG_PASS_THROUGH_HEADERS.map(header => [header, '']));
  Object.assign(raw, { sku: `0000${index}`, base_code: '000BASE', attributes__lulu_ean: '0001234567890', attributes__brand: 'Test Brand' });
  const sku = { sku: raw.sku, raw_row: raw, upload_attributes: {}, attribute_set: template.name,
    source: { sap: 'Synthetic test evidence only: brand Test Brand; model TEST-99.' } } as SkuData;
  const input = prepareCatalogInput(sku, mapping, 'Use only supplied evidence.', 40000);
  assert.deepEqual(Object.keys(input.template), template.catalogHeaders);
  for (const header of template.catalogHeaders) {
    assert.equal(input.template[header], Object.hasOwn(raw, header) ? raw[header] : '', `${header}: sample facts must never become generated defaults.`);
  }
  assert.ok(input.messages[0].content.includes(template.rulesMarkdown), 'Catalog receives the complete saved format rules.');
  const parsed = parseCatalogResponse({ choices: [{ message: { content: JSON.stringify({
    row: { ...input.template, sku: 'CHANGED BY MODEL', name: 'Test Brand TEST-99' }, warnings: [], cellWarnings: [],
  }) } }] }, input);
  assert.equal(parsed.row.sku, raw.sku, 'The application still protects identifiers.');
  assert.equal(parsed.row.attributes__lulu_product_type, '', 'Unknown product type remains blank.');
  assert.ok(parsed.cellWarnings.some(warning => warning.header === 'attributes__lulu_product_type'));
  const sheet = workbook.addWorksheet(template.name.slice(0, 31));
  populateCatalogFile(sheet, { headers: mapping.headers, rows: [template.sample] });
}
const reloaded = new ExcelJS.Workbook();
await reloaded.xlsx.load(await workbook.xlsx.writeBuffer());
for (const [index, template] of templates.entries()) {
  const sheet = reloaded.worksheets[index];
  assert.equal(sheet.columnCount, template.catalogHeaders.length);
  assert.deepEqual(template.catalogHeaders.map((_, column) => sheet.getCell(1, column + 1).value), template.catalogHeaders);
  assert.deepEqual(template.catalogHeaders.map((_, column) => sheet.getCell(2, column + 1).value), template.catalogHeaders.map(header => template.sample[header]));
  assert.equal(typeof sheet.getCell('A2').value, 'string', 'Spreadsheet identifiers are exported as text.');
}
const artifactDirectory = '.cache/attribute-template-pilot';
await mkdir(artifactDirectory, { recursive: true });
await workbook.xlsx.writeFile(join(artifactDirectory, 'format-check.xlsx'));
assert.equal(templates[4].catalogHeaders.at(-1), 'note', 'The calculator template uses the exact bare note header.');
assert.match(templates[0].rulesMarkdown, /mAh/);
assert.match(templates[1].rulesMarkdown, /L\/cycle/);
assert.match(templates[2].rulesMarkdown, /TSA/);
assert.match(templates[3].rulesMarkdown, /Pack of/);
assert.match(templates[4].rulesMarkdown, /digit/i);
console.log('Five-set format checks passed: 237 ordered headers/rules, sample isolation, prompt wiring, identifier protection, missing-value warnings, and Excel round trips.');

if (process.env.TEST_DATABASE_URL) {
  const namespace = `attribute_pilot_test_${randomUUID().replaceAll('-', '')}`;
  const admin = new Pool({ connectionString: process.env.TEST_DATABASE_URL, connectionTimeoutMillis: 10000 });
  const isolated = new Pool({ connectionString: process.env.TEST_DATABASE_URL, options: `-c search_path=${namespace}`, connectionTimeoutMillis: 10000 });
  const directory = await mkdtemp(join(tmpdir(), 'attribute-pilot-'));
  try {
    await admin.query(`CREATE SCHEMA ${namespace}`);
    await isolated.query(`CREATE TABLE attribute_sets (
      id text PRIMARY KEY,name text NOT NULL,rules_markdown text NOT NULL DEFAULT '',catalog_headers jsonb NOT NULL DEFAULT '[]',
      catalog_header_requirements jsonb NOT NULL DEFAULT '{}',created_at timestamp DEFAULT now(),updated_at timestamp DEFAULT now())`);
    for (const [index, template] of templates.entries()) await isolated.query('INSERT INTO attribute_sets(id,name) VALUES($1,$2)', [`pilot-${index}`, template.name]);
    await isolated.query("INSERT INTO attribute_sets(id,name,rules_markdown) VALUES('unrelated','Unrelated','Keep these rules')");
    const snapshot = () => isolated.query('SELECT * FROM attribute_sets ORDER BY id').then(result => result.rows);
    await isolated.query("UPDATE attribute_sets SET rules_markdown='Existing curated rules' WHERE id='pilot-4'");
    const protectedRows = await snapshot();
    await assert.rejects(applyPilotTemplates(isolated, templates, join(directory, 'refused.json')), /refusing to overwrite/);
    assert.deepEqual(await snapshot(), protectedRows, 'A conflict prevents changes to every set.');
    await assert.rejects(readFile(join(directory, 'refused.json')), { code: 'ENOENT' });
    await isolated.query("UPDATE attribute_sets SET rules_markdown='' WHERE id='pilot-4'");
    await isolated.query("UPDATE attribute_sets SET catalog_header_requirements=$1::jsonb WHERE id='pilot-4'", [JSON.stringify({ name: 'mandatory' })]);
    await assert.rejects(applyPilotTemplates(isolated, templates, join(directory, 'classified.json')), /classifications need review/);
    await isolated.query("UPDATE attribute_sets SET catalog_header_requirements='{}' WHERE id='pilot-4'");
    const before = await snapshot();
    await assert.rejects(applyPilotTemplates(isolated, templates, directory), { code: 'EEXIST' });
    assert.deepEqual(await snapshot(), before, 'A failed backup prevents database writes.');
    const backupFile = join(directory, 'before.json');
    assert.equal(await applyPilotTemplates(isolated, templates, backupFile), 5);
    const backup = JSON.parse(await readFile(backupFile, 'utf8'));
    assert.equal(backup.attributeSets.length, 5);
    const after = await snapshot();
    for (const [index, template] of templates.entries()) {
      const saved = after.find(row => row.id === `pilot-${index}`);
      assert.equal(saved.rules_markdown, template.rulesMarkdown);
      assert.deepEqual(saved.catalog_headers, template.catalogHeaders);
      assert.deepEqual(saved.catalog_header_requirements, {});
      assert.equal(new Date(saved.created_at).getTime(), new Date(before.find(row => row.id === saved.id).created_at).getTime());
    }
    assert.deepEqual(after.find(row => row.id === 'unrelated'), before.find(row => row.id === 'unrelated'));
    assert.equal(await applyPilotTemplates(isolated, templates, join(directory, 'repeat.json')), 0);
    assert.deepEqual(await snapshot(), after, 'Repeating the import leaves timestamps and data untouched.');
    await assert.rejects(readFile(join(directory, 'repeat.json')), { code: 'ENOENT' });
    console.log('Isolated database checks passed: atomic five-set import, backup, existing-rule/classification protection, unchanged IDs, unrelated-set preservation, and idempotency.');
  } finally {
    await isolated.end();
    await admin.query(`DROP SCHEMA IF EXISTS ${namespace} CASCADE`);
    await admin.end();
    await rm(directory, { recursive: true, force: true });
  }
} else console.log('Database import checks skipped: set TEST_DATABASE_URL to run them in an isolated schema.');
