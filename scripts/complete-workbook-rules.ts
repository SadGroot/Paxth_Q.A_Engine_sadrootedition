import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Pool } from 'pg';
import { loadPilotTemplates, validateRuleCoverage } from './import-attribute-template-pilot';
import { transaction } from '../src/server/database';

const root = fileURLToPath(new URL('../', import.meta.url));
const START = '<!-- workbook-format-rules:start -->';
const END = '<!-- workbook-format-rules:end -->';
const policy = 'Use the following workbook rules for field formatting. Earlier business checks remain applicable. Examples never establish product facts or defaults; application requirements take precedence.';
type Template = Awaited<ReturnType<typeof loadPilotTemplates>>[number];

export function workbookRuleBlock(saved: string): string | null {
  const starts = saved.split(START).length - 1, ends = saved.split(END).length - 1;
  assert.ok((starts === 0 && ends === 0) || (starts === 1 && ends === 1 && saved.indexOf(END) > saved.indexOf(START)),
    'Ambiguous workbook-rule markers; preserve the saved text and repair the markers before updating.');
  return starts ? saved.slice(saved.indexOf(START) + START.length, saved.indexOf(END)).trim() : null;
}

export function completeRules(saved: string, desired: string): string {
  if (saved.trim() === desired.trim()) return saved;
  const existing = workbookRuleBlock(saved);
  if (existing === desired.trim()) return saved;
  const block = `${START}\n${desired.trimEnd()}\n${END}`;
  if (existing !== null) return saved.slice(0, saved.indexOf(START)) + block + saved.slice(saved.indexOf(END) + END.length);
  if (!saved.trim()) return desired;
  return `${saved}${saved.endsWith('\n') ? '\n' : '\n\n'}### Workbook filling formats\n\n${policy}\n\n${block}\n`;
}

export async function workbookPhases() {
  const templates = (await loadPilotTemplates('all')).filter(template => template.source)
    .sort((a, b) => a.source < b.source ? -1 : a.source > b.source ? 1 : 0);
  const actualFiles = (await readdir(join(root, 'OneDrive_2_10-15-2026'))).filter(file => /\.xlsx?$/i.test(file)).sort();
  assert.equal(templates.length, 125, 'This task covers exactly 125 supplied Excel files.');
  assert.deepEqual(templates.map(template => template.source.slice(template.source.lastIndexOf('/') + 1)), actualFiles,
    'Every Excel file must match exactly one reviewed backend mapping.');
  return Array.from({ length: 5 }, (_, index) => templates.slice(index * 25, (index + 1) * 25));
}

export async function auditPhase(pool: Pool, templates: Template[]) {
  const { rows } = await pool.query('SELECT name,rules_markdown,catalog_headers FROM attribute_sets WHERE name=ANY($1::text[])', [templates.map(template => template.name)]);
  assert.equal(rows.length, templates.length, 'Every workbook needs its existing backend attribute set.');
  return Promise.all(templates.map(async template => {
    const saved = rows.find(row => row.name === template.name);
    const file = template.source.slice(template.source.lastIndexOf('/') + 1);
    const sourceSha256 = createHash('sha256').update(await readFile(join(root, template.source))).digest('hex');
    const blocked = 'provenance' in template && template.provenance === 'unreadable';
    const block = workbookRuleBlock(saved.rules_markdown);
    const verified = !blocked && (saved.rules_markdown.trim() === template.rulesMarkdown.trim() || block === template.rulesMarkdown.trim());
    if (verified) {
      validateRuleCoverage(template.catalogHeaders, block ?? saved.rules_markdown);
      assert.deepEqual(saved.catalog_headers, template.catalogHeaders, `${file}: saved header order differs from the reviewed workbook.`);
    }
    return {
      file, attributeSet: template.name, source: template.source, rulesFile: 'rulesFile' in template ? template.rulesFile : '',
      status: blocked ? 'blocked' : verified ? 'verified' : 'needs-rules',
      headerRules: blocked ? 0 : template.catalogHeaders.length,
      sampleRows: template.samples.map(sample => sample.row), evidence: 'provenance' in template ? template.provenance : 'workbook',
      sourceSha256, rulesSha256: createHash('sha256').update(template.rulesMarkdown).digest('hex'),
      limitation: blocked ? 'IRM-protected workbook exposes no product headers or samples. An unprotected copy is required.'
        : 'provenance' in template && template.provenance === 'headers-only' ? 'Headers exist, but the workbook has no product example; filling rules are explicit semantic fallbacks.'
        : 'provenance' in template && template.provenance === 'partial-sample' ? 'Aligned fields use examples; misaligned specification fields remain explicit fallbacks.' : null,
    };
  }));
}

export async function completePhase(pool: Pool, templates: Template[], backupFile: string) {
  assert.equal(templates.length, 25, 'A phase contains exactly 25 workbooks.');
  for (const template of templates) validateRuleCoverage(template.catalogHeaders, template.rulesMarkdown);
  const changed = await transaction(pool, async client => {
    const { rows } = await client.query('SELECT * FROM attribute_sets WHERE name=ANY($1::text[]) ORDER BY name FOR UPDATE', [templates.map(template => template.name)]);
    assert.equal(rows.length, templates.length, 'Missing backend attribute set.');
    const updates = templates.flatMap(template => {
      if ('provenance' in template && template.provenance === 'unreadable') return [];
      const saved = rows.find(row => row.name === template.name);
      assert.deepEqual(saved.catalog_headers, template.catalogHeaders, `${template.name}: header changes need review; no saved rules were changed.`);
      const rules = completeRules(saved.rules_markdown, template.rulesMarkdown);
      return rules === saved.rules_markdown ? [] : [{ id: saved.id, rules }];
    });
    if (!updates.length) return 0;
    await mkdir(dirname(backupFile), { recursive: true });
    await writeFile(backupFile, JSON.stringify({ savedAt: new Date().toISOString(), attributeSets: rows }, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
    for (const update of updates) await client.query('UPDATE attribute_sets SET rules_markdown=$2,updated_at=now() WHERE id=$1', [update.id, update.rules]);
    return updates.length;
  });
  const files = await auditPhase(pool, templates);
  assert.ok(files.every(file => file.status !== 'needs-rules'), 'Saved workbook-rule coverage failed verification.');
  return { changed, files };
}

async function main() {
  const args = process.argv.slice(2);
  assert.ok(args.length === 0 || (args.length === 1 && args[0] === '--apply'), 'Usage: npx tsx scripts/complete-workbook-rules.ts [--apply]');
  const phases = await workbookPhases();
  const { pool } = await import('../src/db/index');
  assert.ok(pool, 'Set DATABASE_URL to audit or complete the saved mappings.');
  const report = { totalFiles: 125, phaseSize: 25, phases: [] as Array<{ phase: number; changed: number; verified: number; blocked: number; pending: number; files: Awaited<ReturnType<typeof auditPhase>> }> };
  try {
    for (const [index, templates] of phases.entries()) {
      const backup = join(root, 'backups', `workbook-phase-${index + 1}-${new Date().toISOString().replaceAll(':', '-')}.json`);
      const result = args.includes('--apply') ? await completePhase(pool, templates, backup) : { changed: 0, files: await auditPhase(pool, templates) };
      const phase = { phase: index + 1, changed: result.changed, verified: result.files.filter(file => file.status === 'verified').length,
        blocked: result.files.filter(file => file.status === 'blocked').length, pending: result.files.filter(file => file.status === 'needs-rules').length, files: result.files };
      report.phases.push(phase);
      await writeFile(join(root, 'docs/attribute-template-all/workbook-phases.json'), JSON.stringify(report, null, 2) + '\n');
      console.log(`Phase ${phase.phase}/5: ${templates.length} files; ${phase.verified} verified, ${phase.blocked} blocked, ${phase.pending} pending; ${phase.changed} saved mappings updated.`);
    }
    const files = report.phases.flatMap(phase => phase.files);
    assert.equal(new Set(files.map(file => file.source)).size, 125);
    const summary = `# Workbook completion phases\n\nExactly 125 Excel files are tracked in five phases of 25. [Per-file evidence and saved-rule verification](workbook-phases.json) includes source/rule hashes and explicit limitations.\n\n| Phase | Files | Verified rules | Blocked source | Pending rules |\n| --- | ---: | ---: | ---: | ---: |\n${report.phases.map(phase => `| ${phase.phase} | 25 | ${phase.verified} | ${phase.blocked} | ${phase.pending} |`).join('\n')}\n\n${files.filter(file => file.limitation).map(file => `- **${file.file}**: ${file.limitation}`).join('\n')}\n\nExisting business rules are retained verbatim before the workbook-format supplement. Headers, IDs and classifications are preserved. A protected-file placeholder is never counted as a verified workbook mapping.\n`;
    await writeFile(join(root, 'docs/attribute-template-all/workbook-phases.md'), summary);
    if (files.some(file => file.status !== 'verified')) process.exitCode = 2;
  } finally { await pool.end(); }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
