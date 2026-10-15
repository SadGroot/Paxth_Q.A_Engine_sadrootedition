import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const manifest = JSON.parse(readFileSync(new URL('docs/agency-agents.lock.json', root), 'utf8'));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
assert.equal(manifest.schemaVersion, 1);
assert.match(manifest.catalog.commit, /^[a-f0-9]{40}$/);
assert.equal(sha256(readFileSync(new URL(manifest.license.path, root))), manifest.license.sha256, 'Agent license changed');
assert.deepEqual(
  readdirSync(new URL('.codex/agents/', root)).filter(file => file.endsWith('.toml')).sort(),
  manifest.agents.map(agent => agent.destination.split('/').at(-1)).sort(),
  'Installed agents differ from the manifest',
);
for (const agent of manifest.agents) {
  assert.match(agent.destination, /^\.codex\/agents\/[a-z0-9-]+\.toml$/);
  const bytes = readFileSync(new URL(agent.destination, root));
  assert.equal(sha256(bytes), agent.sha256, `${agent.name}: installed bytes changed; review before updating the manifest`);
  // shortcut: upstream emits three JSON-compatible TOML strings; use a TOML parser if its format changes.
  const fields = Object.fromEntries(bytes.toString('utf8').trimEnd().split('\n').map(line => {
    const match = line.match(/^(name|description|developer_instructions) = (".*")$/);
    assert.ok(match, `${agent.name}: unexpected converter format`);
    return [match[1], JSON.parse(match[2])];
  }));
  assert.deepEqual(Object.keys(fields).sort(), ['description', 'developer_instructions', 'name']);
  assert.equal(fields.name, agent.name);
  assert.ok(fields.description.trim() && fields.developer_instructions.trim());
}
console.log(`Verified ${manifest.agents.length} Agency agents, required fields, pinned hashes, and license.`);
