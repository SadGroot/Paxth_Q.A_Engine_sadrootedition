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
import { applyPilotTemplates, loadAllManifest, loadPilotTemplates, readReviewedSamples, readTemplate, validateRuleCoverage } from './import-attribute-template-pilot';

const templates = await loadPilotTemplates();
const additionalTemplates = await loadPilotTemplates('batch-50');
const completeTemplates = await loadPilotTemplates('all');
const manifest = await loadAllManifest();
const batches = [['pilot', templates], ['batch-50', additionalTemplates], ['all', completeTemplates]] as const;
const allTemplates = completeTemplates;
assert.deepEqual(templates.map(template => template.catalogHeaders.length), [63, 50, 50, 34, 40]);
assert.equal(templates.reduce((total, template) => total + template.catalogHeaders.length, 0), 237);
assert.equal(additionalTemplates.length, 50);
assert.equal(new Set([...templates, ...additionalTemplates].map(template => template.name)).size, 55, 'The fifty additions do not repeat the pilot.');
assert.equal(additionalTemplates.reduce((total, template) => total + template.catalogHeaders.length, 0), 2195);
assert.equal(additionalTemplates.reduce((total, template) => total + template.samples.length, 0), 51, 'Vacuum Cleaners includes two real format examples.');
assert.equal(completeTemplates.length, 138);
assert.equal(completeTemplates.reduce((total, template) => total + template.catalogHeaders.length, 0), 5638);
assert.equal(completeTemplates.reduce((total, template) => total + template.samples.length, 0), 143);
assert.equal(manifest.filter(entry => entry.provenance === 'missing-workbook').length, 13);
assert.equal(manifest.filter(entry => entry.source).length, 125);
const camera = completeTemplates.find(template => template.name === 'Electronic-Camera');
assert.equal(camera.samples.length, 1, 'The aligned camera fields remain usable.');
assert.equal(camera.sample.attributes__product_dimensions, 'W12 x D6 x H7 cm');
assert.equal(camera.sample.attributes__battery_capacity, '', 'Shifted camera cells must not teach false field formats.');
assert.equal(completeTemplates.find(template => template.name === 'Electronics-Medical Equipment').samples.length, 0, 'Protected content is not usable evidence.');

const fixture = (headers: string[], sample = headers.map(header => header === 'sku' ? '00042' : header === 'name' ? 'Fixture product' : '')) => XLSX.utils.aoa_to_sheet([
  ['Core Product Identifiers', 'Marketing Content'], headers, sample,
  ['Below 75 characters'], ['Mandatory attributes'], ['attributes_wrong_spelling'],
]);
const goodHeaders = [...CATALOG_PASS_THROUGH_HEADERS, 'name'];
assert.deepEqual(readTemplate(fixture(goodHeaders)).catalogHeaders, goodHeaders, 'Grouping labels and annotation rows never become headers.');
assert.equal(readTemplate(fixture(goodHeaders)).sample.sku, '00042');
assert.deepEqual(readTemplate(fixture(goodHeaders)).samples.map(sample => sample.row), [3], 'Annotation rows are not product examples.');
const twoSamples = readTemplate(XLSX.utils.aoa_to_sheet([
  ['Core Product Identifiers'], goodHeaders,
  goodHeaders.map(header => header === 'sku' ? '0001' : header === 'name' ? 'First product' : ''),
  goodHeaders.map(header => header === 'sku' ? '0002' : header === 'name' ? 'Second product' : ''),
  ['attributes__capacity', '', '', '', '', '', 'ADDED NEW HEADERS'],
]), [3, 4]);
assert.deepEqual(twoSamples.samples.map(sample => sample.row), [3, 4]);
assert.equal(twoSamples.sample.sku, '0001', 'The first sample remains available to original callers.');
const normalized = readReviewedSamples(XLSX.utils.aoa_to_sheet([
  ['sku', 'base_code', 'attributes__brand ', 'attributes__brand', '', 'attributes__product_type'],
  ['00042', '000BASE', 'Verified brand', '', 'Unlabelled text', 'Verified type'],
]), { headerRow: 1, sampleRows: [2], catalogHeaders: ['sku', 'base_code', 'attributes__brand', 'attributes__lulu_product_type'] });
assert.deepEqual(normalized[0].values, { sku: '00042', base_code: '000BASE', attributes__brand: 'Verified brand', attributes__lulu_product_type: 'Verified type' });
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
const reviewedCases = [
  ...JSON.parse(await readFile(new URL('../docs/attribute-template-batch-50/format-check-cases.json', import.meta.url), 'utf8')),
  ...JSON.parse(await readFile(new URL('../docs/attribute-template-all/format-check-cases.json', import.meta.url), 'utf8')),
];
for (const example of reviewedCases) {
  const template = allTemplates.find(template => template.name === example.set);
  assert.ok(template, `Missing reviewed format case ${example.set}.`);
  const values = template.samples.map(sample => sample.values[example.header]).filter(Boolean);
  assert.deepEqual([...new Set(values)], Array.isArray(example.sample) ? example.sample : example.sample ? [example.sample] : []);
  for (const shape of Array.isArray(example.documentedShape) ? example.documentedShape : [example.documentedShape]) {
    assert.ok(ruleFor(template.rulesMarkdown, example.header).includes(shape), `${example.set}: ${example.header} must document ${shape}.`);
  }
}
for (const template of allTemplates) {
  for (const header of template.catalogHeaders.filter(header => !template.samples.some(sample => sample.values[header].trim()))) {
    assert.match(ruleFor(template.rulesMarkdown, header), /sample.*blank|no sample.*format|no .*format.*(?:demonstrated|available)|format.*(?:unlearned|unknown)/i, `${template.name}: ${header} must disclose the missing format example.`);
  }
}

for (const [batch, templates] of batches) {
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
      row: { ...input.template, sku: 'CHANGED BY MODEL', [mapping.headers.includes('name') ? 'name' : 'attributes__product_title']: 'Test Brand TEST-99' }, warnings: [], cellWarnings: [],
    }) } }] }, input);
    assert.equal(parsed.row.sku, raw.sku, 'The application still protects identifiers.');
    assert.equal(parsed.row.attributes__lulu_product_type, '', 'Unknown product type remains blank.');
    assert.ok(parsed.cellWarnings.some(warning => warning.header === 'attributes__lulu_product_type'));
    const sheet = workbook.addWorksheet(`${index + 1} ${template.name.replace(/[\\/*?:[\]]/g, ' ')}`.slice(0, 31));
    populateCatalogFile(sheet, { headers: mapping.headers, rows: template.samples.map(sample => sample.values) });
  }
  const reloaded = new ExcelJS.Workbook();
  await reloaded.xlsx.load(await workbook.xlsx.writeBuffer());
  for (const [index, template] of templates.entries()) {
    const sheet = reloaded.worksheets[index];
    assert.equal(sheet.columnCount, template.catalogHeaders.length);
    assert.deepEqual(template.catalogHeaders.map((_, column) => sheet.getCell(1, column + 1).value), template.catalogHeaders);
    assert.equal(sheet.rowCount, template.samples.length + 1);
    for (const [sampleIndex, sample] of template.samples.entries()) {
      assert.deepEqual(template.catalogHeaders.map((_, column) => sheet.getCell(sampleIndex + 2, column + 1).value), template.catalogHeaders.map(header => sample.values[header]));
    }
    if (template.samples.length) assert.equal(typeof sheet.getCell('A2').value, 'string', 'Spreadsheet identifiers are exported as text.');
  }
  const artifactDirectory = `.cache/attribute-template-${batch}`;
  await mkdir(artifactDirectory, { recursive: true });
  await workbook.xlsx.writeFile(join(artifactDirectory, 'format-check.xlsx'));
}

assert.equal(templates[4].catalogHeaders.at(-1), 'note', 'The calculator template uses the exact bare note header.');
assert.match(templates[0].rulesMarkdown, /mAh/);
assert.match(templates[1].rulesMarkdown, /L\/cycle/);
assert.match(templates[2].rulesMarkdown, /TSA/);
assert.match(templates[3].rulesMarkdown, /Pack of/);
assert.match(templates[4].rulesMarkdown, /digit/i);
console.log('All 138 sets passed: 5,638 ordered headers/rules, 143 example rows, explicit source gaps, sample isolation, prompt wiring, identifier protection, missing-value warnings, and Excel round trips.');

if (process.env.TEST_DATABASE_URL) {
  for (const [batch, templates] of batches) {
    const fillMissing = batch === 'all';
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
      const lastId = `pilot-${templates.length - 1}`;
      await isolated.query("UPDATE attribute_sets SET rules_markdown='Existing curated rules' WHERE id=$1", [lastId]);
      if (fillMissing) {
        await isolated.query("UPDATE attribute_sets SET catalog_headers=$1::jsonb,catalog_header_requirements=$2::jsonb WHERE id='pilot-0'",
          [JSON.stringify([...templates[0].catalogHeaders].reverse()), JSON.stringify({ name: 'mandatory' })]);
        await isolated.query("UPDATE attribute_sets SET rules_markdown='Keep complete configuration',catalog_headers=$1::jsonb WHERE id='pilot-1'", [JSON.stringify(templates[1].catalogHeaders)]);
      } else {
        const protectedRows = await snapshot();
        await assert.rejects(applyPilotTemplates(isolated, templates, join(directory, 'refused.json')), /refusing to overwrite/);
        assert.deepEqual(await snapshot(), protectedRows, 'A conflict prevents changes to every set.');
        await assert.rejects(readFile(join(directory, 'refused.json')), { code: 'ENOENT' });
        await isolated.query("UPDATE attribute_sets SET rules_markdown='' WHERE id=$1", [lastId]);
        await isolated.query("UPDATE attribute_sets SET catalog_header_requirements=$1::jsonb WHERE id=$2", [JSON.stringify({ name: 'mandatory' }), lastId]);
        await assert.rejects(applyPilotTemplates(isolated, templates, join(directory, 'classified.json')), /classifications need review/);
        await isolated.query("UPDATE attribute_sets SET catalog_header_requirements='{}' WHERE id=$1", [lastId]);
      }
      const before = await snapshot();
      await assert.rejects(applyPilotTemplates(isolated, templates, directory), { code: 'EEXIST' });
      assert.deepEqual(await snapshot(), before, 'A failed backup prevents database writes.');
      const backupFile = join(directory, 'before.json');
      await assert.rejects(applyPilotTemplates(isolated, templates.slice(1), join(directory, 'partial.json')), /complete reviewed/);
      assert.equal(await applyPilotTemplates(isolated, templates, backupFile), templates.length - (fillMissing ? 1 : 0));
      const backup = JSON.parse(await readFile(backupFile, 'utf8'));
      assert.equal(backup.attributeSets.length, templates.length);
      const after = await snapshot();
      for (const [index, template] of templates.entries()) {
        const saved = after.find(row => row.id === `pilot-${index}`);
        const previous = before.find(row => row.id === saved.id);
        assert.equal(saved.rules_markdown, fillMissing && previous.rules_markdown.trim() ? previous.rules_markdown : template.rulesMarkdown);
        assert.deepEqual(saved.catalog_headers, fillMissing && previous.catalog_headers.length ? previous.catalog_headers : template.catalogHeaders);
        assert.deepEqual(saved.catalog_header_requirements, previous.catalog_header_requirements);
        assert.equal(new Date(saved.created_at).getTime(), new Date(previous.created_at).getTime());
      }
      assert.deepEqual(after.find(row => row.id === 'unrelated'), before.find(row => row.id === 'unrelated'));
      if (fillMissing) assert.deepEqual(after.find(row => row.id === 'pilot-1'), before.find(row => row.id === 'pilot-1'), 'Complete configurations keep their timestamp.');
      assert.equal(await applyPilotTemplates(isolated, templates, join(directory, 'repeat.json')), 0);
      assert.deepEqual(await snapshot(), after, 'Repeating the import leaves timestamps and data untouched.');
      await assert.rejects(readFile(join(directory, 'repeat.json')), { code: 'ENOENT' });
      console.log(`Isolated ${templates.length}-set database checks passed: atomic import, backup, existing-rule/classification protection, unchanged IDs, unrelated-set preservation, and idempotency.`);
    } finally {
      await isolated.end();
      await admin.query(`DROP SCHEMA IF EXISTS ${namespace} CASCADE`);
      await admin.end();
      await rm(directory, { recursive: true, force: true });
    }
  }
} else console.log('Database import checks skipped: set TEST_DATABASE_URL to run them in an isolated schema.');
