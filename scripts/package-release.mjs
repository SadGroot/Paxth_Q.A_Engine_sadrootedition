import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const commit = process.argv[2];
assert.match(commit || '', /^[a-f0-9]{40}$/, 'Pass the full tested commit SHA.');
assert.equal(execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), commit, 'Package the checked-out commit.');
assert.equal(process.versions.node.split('.')[0], '22', 'Release runtime must be Node 22.');
const stage = path.resolve('.cache/release');
rmSync(stage, { recursive: true, force: true });
mkdirSync(path.join(stage, 'runtime'), { recursive: true });
for (const item of ['dist', 'package.json', 'package-lock.json']) cpSync(item, path.join(stage, item), { recursive: true });
mkdirSync(path.join(stage, 'ops'));
for (const file of ['deploy.mjs', 'deploy.sh', 'tunnel.py', 'setup-vps.sh', 'paxth-qa.service', 'paxth-qa-tunnel.service']) cpSync(path.join('ops', file), path.join(stage, 'ops', file));
cpSync(process.execPath, path.join(stage, 'runtime/node'));
execFileSync('npm', ['ci', '--omit=dev', '--prefix', stage], { stdio: 'inherit' });
// shortcut: conservatively fingerprint whole startup modules until versioned migrations exist.
const schemaFiles = ['src/db/schema.ts', 'src/db/qaConfiguration.ts', 'src/server/database.ts', 'src/server/auth.ts',
  'src/server/provider.ts', 'src/server/jobRunner.ts', 'src/server/idqJobs.ts', 'src/server/workspaces.ts'];
const schema = createHash('sha256');
for (const file of schemaFiles) schema.update(file).update(readFileSync(file));
writeFileSync(path.join(stage, 'release.json'), JSON.stringify({ commit, schema: schema.digest('hex'), node: process.versions.node }) + '\n');
writeFileSync(path.join(stage, 'dist/public/version.json'), JSON.stringify({ commit }) + '\n');
const archive = `paxth-qa-${commit}.tar.gz`;
execFileSync('tar', ['-czf', path.resolve('.cache', archive), '-C', stage, '.']);
const entries = execFileSync('tar', ['-tzf', path.resolve('.cache', archive)], { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 }).trim().split('\n');
assert.ok(entries.every(entry => /^\.\/(?:$|dist\/|runtime\/|ops\/|node_modules\/|package(?:-lock)?\.json$|release\.json$)/.test(entry)), 'Unexpected release contents.');
const digest = createHash('sha256').update(readFileSync(path.resolve('.cache', archive))).digest('hex');
writeFileSync(path.resolve('.cache', archive + '.sha256'), `${digest}  ${archive}\n`);
console.log(`Packaged ${commit}: ${archive}`);
