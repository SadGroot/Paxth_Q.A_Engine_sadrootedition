import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Pool } from 'pg';
import { auditPhase, completePhase, completeRules, workbookPhases, workbookRuleBlock } from './complete-workbook-rules';
import { validateRuleCoverage } from './import-attribute-template-pilot';

const curated = '# Existing rules\n\nKeep these business checks and defaults.\n\n';
const rules = '# Workbook formats\n\n## sku\n\nPreserve identifiers.\n';
const merged = completeRules(curated, rules);
assert.ok(merged.startsWith(curated), 'Existing rules must be retained verbatim.');
assert.equal(workbookRuleBlock(merged), rules.trim());
validateRuleCoverage(['sku'], workbookRuleBlock(merged));
assert.equal(completeRules(merged, rules), merged, 'An identical supplement must not duplicate or change text.');
assert.equal(completeRules(rules, rules), rules, 'Existing complete workbook documents remain untouched.');
assert.equal(completeRules('', rules), rules);
const revised = rules.replace('Preserve identifiers.', 'Preserve exact identifier text.');
const updated = completeRules(merged + '\nKeep this suffix.\n', revised);
assert.ok(updated.startsWith(curated) && updated.endsWith('\nKeep this suffix.\n'));
assert.equal(workbookRuleBlock(updated), revised.trim());
for (const malformed of ['<!-- workbook-format-rules:start -->', '<!-- workbook-format-rules:end -->', merged + merged]) {
  assert.throws(() => completeRules(malformed, rules), /Ambiguous workbook-rule markers/);
}

const phases = await workbookPhases();
assert.deepEqual(phases.map(phase => phase.length), [25, 25, 25, 25, 25]);
assert.equal(new Set(phases.flat().map(template => template.source)).size, 125);
assert.ok(phases.flat().every(template => template.source), 'Backend-only sets do not count toward the 125 workbooks.');
const blockedPhase = phases.find(phase => phase.some(template => 'provenance' in template && template.provenance === 'unreadable'));
assert.ok(blockedPhase);
console.log('Workbook phase checks passed: exactly 125 files, five phases, per-header supplements, preserved prior text, safe updates and idempotency.');

if (process.env.TEST_DATABASE_URL) {
  const namespace = `workbook_phases_${randomUUID().replaceAll('-', '')}`;
  const root = new Pool({ connectionString: process.env.TEST_DATABASE_URL, connectionTimeoutMillis: 10000 });
  const pool = new Pool({ connectionString: process.env.TEST_DATABASE_URL, options: `-c search_path=${namespace}`, connectionTimeoutMillis: 10000 });
  const directory = await mkdtemp(join(tmpdir(), 'workbook-phases-'));
  try {
    await root.query(`CREATE SCHEMA ${namespace}`);
    await pool.query(`CREATE TABLE attribute_sets (
      id text PRIMARY KEY,name text NOT NULL,rules_markdown text NOT NULL,catalog_headers jsonb NOT NULL,
      catalog_header_requirements jsonb NOT NULL DEFAULT '{}',created_at timestamp DEFAULT now(),updated_at timestamp DEFAULT now())`);
    const phase = phases[0];
    for (const template of [...phase, ...blockedPhase]) {
      await pool.query('INSERT INTO attribute_sets(id,name,rules_markdown,catalog_headers) VALUES($1,$1,$2,$3::jsonb)',
        [template.name, template.rulesMarkdown, JSON.stringify(template.catalogHeaders)]);
    }
    await pool.query("INSERT INTO attribute_sets VALUES('unrelated','Unrelated','Preserve unrelated rules','[]','{}',now(),now())");
    await pool.query('UPDATE attribute_sets SET rules_markdown=$2,catalog_header_requirements=$3::jsonb WHERE name=$1', [phase[0].name, curated, JSON.stringify({ name: 'mandatory' })]);
    const snapshot = () => pool.query('SELECT * FROM attribute_sets ORDER BY id').then(result => result.rows);
    const before = await snapshot();
    const audit = await auditPhase(pool, phase);
    assert.equal(audit.filter(file => file.status === 'needs-rules').length, 1, 'Nonempty legacy rules alone do not prove workbook coverage.');
    await assert.rejects(completePhase(pool, phase, directory), { code: 'EEXIST' });
    assert.deepEqual(await snapshot(), before, 'A failed backup prevents all writes.');
    await pool.query('UPDATE attribute_sets SET catalog_headers=$2::jsonb WHERE name=$1', [phase.at(-1).name, JSON.stringify([...phase.at(-1).catalogHeaders].reverse())]);
    const mismatch = await snapshot();
    await assert.rejects(completePhase(pool, phase, join(directory, 'mismatch.json')), /header changes need review/);
    assert.deepEqual(await snapshot(), mismatch, 'A late header mismatch prevents earlier candidate updates.');
    await pool.query('UPDATE attribute_sets SET catalog_headers=$2::jsonb WHERE name=$1', [phase.at(-1).name, JSON.stringify(phase.at(-1).catalogHeaders)]);
    const backup = join(directory, 'before.json');
    const completed = await completePhase(pool, phase, backup);
    assert.equal(completed.changed, 1);
    assert.ok(completed.files.every(file => file.status === 'verified'));
    assert.equal(JSON.parse(await readFile(backup, 'utf8')).attributeSets.length, 25);
    const after = await snapshot();
    for (const saved of after) {
      const old = before.find(row => row.id === saved.id);
      assert.deepEqual(saved.catalog_headers, old.catalog_headers);
      assert.deepEqual(saved.catalog_header_requirements, old.catalog_header_requirements);
      assert.equal(saved.name, old.name);
      assert.deepEqual(saved.created_at, old.created_at);
      if (saved.name !== phase[0].name) assert.equal(saved.rules_markdown, old.rules_markdown);
    }
    assert.ok(after.find(row => row.name === phase[0].name).rules_markdown.startsWith(curated));
    assert.equal((await completePhase(pool, phase, join(directory, 'repeat.json'))).changed, 0);
    assert.deepEqual(await snapshot(), after, 'Repeat completion leaves all values and timestamps untouched.');
    await assert.rejects(readFile(join(directory, 'repeat.json')), { code: 'ENOENT' });
    const protectedResult = await completePhase(pool, blockedPhase, join(directory, 'protected.json'));
    assert.equal(protectedResult.changed, 0);
    assert.equal(protectedResult.files.filter(file => file.status === 'blocked').length, 1);
    assert.equal(protectedResult.files.filter(file => file.status === 'verified').length, 24);
    assert.deepEqual(await snapshot(), after, 'A protected placeholder is never promoted to completed rules or rewritten.');
    console.log('Isolated phase database checks passed: legacy coverage detection, backups, atomicity, exact headers, unchanged IDs/classifications, fresh read-back, blocked source and zero-change repeats.');
  } finally {
    await pool.end();
    await root.query(`DROP SCHEMA IF EXISTS ${namespace} CASCADE`);
    await root.end();
    await rm(directory, { recursive: true, force: true });
  }
} else console.log('Database checks skipped: set TEST_DATABASE_URL to use an isolated schema.');
