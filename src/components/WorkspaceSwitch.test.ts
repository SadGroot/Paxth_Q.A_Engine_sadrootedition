import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { chromium, type Route } from 'playwright-core';
import { DEFAULT_SETTINGS } from '../lib/providerSettings';

const vite = await createServer({ cacheDir: '/tmp/paxth-workspace-vite', server: { host: '127.0.0.1', port: 0, hmr: false }, logLevel: 'error' });
let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
try {
  await vite.listen();
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1900, height: 1100 } });
  page.setDefaultTimeout(15000);
  const errors: string[] = [], calls: Array<{ path: string; owner?: string; method: string }> = [];
  page.on('pageerror', error => errors.push(error.message));
  let account = { id: 'admin', username: 'Administrator', role: 'admin' }, signedIn = true;
  let delayed: Route | undefined;
  const row = (owner: string) => ({ sku: `${owner}-private`, source: { sap: `${owner} secret` }, upload_attributes: {}, raw_row: {}, status: 'ready', revision: 0 });
  await page.route('**/api/**', async route => {
    const request = route.request(), path = new URL(request.url()).pathname;
    const owner = request.headers()['x-workspace-id'];
    calls.push({ path, owner, method: request.method() });
    if (path === '/api/auth/me') return route.fulfill({ status: signedIn ? 200 : 401, json: signedIn ? account : { error: 'Sign in' } });
    if (path === '/api/auth/logout') { signedIn = false; return route.fulfill({ json: { success: true } }); }
    if (path === '/api/auth/login') { signedIn = true; account = { id: 'bob', username: 'Bob', role: 'user' }; return route.fulfill({ json: account }); }
    if (path === '/api/db-status') return route.fulfill({ json: { status: 'connected' } });
    if (path === '/api/users') return route.fulfill({ json: [{ id: 'admin', username: 'Administrator', role: 'admin' }, { id: 'alice', username: 'Alice', role: 'user' }, { id: 'bob', username: 'Bob', role: 'user' }] });
    if (path === '/api/qa-configuration') return route.fulfill({ json: { qaAgentMemory: '', attributeSets: [] } });
    if (path === '/api/workspace-provider-settings') return route.fulfill({ json: { ...DEFAULT_SETTINGS, modelName: `model-${owner}`, providerConfigured: true, providerKeySlot: 'AICREDITS_API_KEY_3' } });
    if (path === '/api/catalog') {
      assert.ok(owner, 'Workspace data requests always capture an owner');
      if (owner === 'alice') { delayed = route; return; }
      return route.fulfill({ json: [row(owner)] });
    }
    if (path === '/api/jobs' || path === '/api/idq/jobs') return route.fulfill({ json: [] });
    errors.push(`Unexpected ${request.method()} ${path}`);
    return route.fulfill({ status: 404, json: { error: 'Unexpected request' } });
  });
  await page.goto(vite.resolvedUrls!.local[0]);
  await page.getByText('admin-private', { exact: true }).first().waitFor();
  await page.getByRole('combobox', { name: 'Workspace owner' }).selectOption('alice');
  await page.waitForFunction(() => document.querySelector<HTMLSelectElement>('[aria-label="Workspace owner"]')?.value === 'alice');
  for (let i = 0; i < 100 && !delayed; i++) await page.waitForTimeout(20);
  assert.ok(delayed, 'Alice’s catalog request is pending');
  await page.getByRole('combobox', { name: 'Workspace owner' }).selectOption('bob');
  await page.getByText('bob-private', { exact: true }).first().waitFor();
  await delayed!.fulfill({ json: [row('alice')] }).catch(() => {});
  await page.waitForTimeout(200);
  assert.equal(await page.getByText('alice-private', { exact: true }).count(), 0);
  assert.equal(await page.getByText('admin-private', { exact: true }).count(), 0);
  await page.getByRole('button', { name: 'LLM Settings', exact: true }).click();
  await page.getByLabel('Q&A model', { exact: true }).waitFor();
  assert.equal(await page.getByLabel('Q&A model', { exact: true }).inputValue(), 'model-bob');
  assert.equal(await page.getByLabel('Q&A model', { exact: true }).isEnabled(), true);
  await page.getByRole('button', { name: /Administrator.*admin/ }).click();
  await page.getByRole('button', { name: 'Sign Out', exact: true }).click();
  await page.getByRole('button', { name: /sign in/i }).waitFor();
  const meReads = calls.filter(call => call.path === '/api/auth/me').length;
  await page.waitForTimeout(300);
  assert.equal(calls.filter(call => call.path === '/api/auth/me').length, meReads, 'Expired sessions do not repeatedly remount');
  await page.getByLabel(/username/i).fill('Bob'); await page.getByLabel(/^password$/i).fill('test-only-password');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.getByText('bob-private', { exact: true }).first().waitFor();
  assert.equal(await page.getByRole('combobox', { name: 'Workspace owner' }).count(), 0, 'Regular users cannot select another workspace');
  await page.getByRole('button', { name: 'Model Settings', exact: true }).click();
  await page.getByLabel('Q&A model', { exact: true }).waitFor();
  assert.equal(await page.getByLabel('Q&A model', { exact: true }).isDisabled(), true);
  assert.equal(await page.getByRole('button', { name: 'Save changes', exact: true }).isDisabled(), true);
  assert.deepEqual(errors, []);
  console.log('Workspace browser checks passed: captured owner headers, pending-response isolation, state reset, logout/login, no expiry loop and user read-only settings.');
} finally { await browser?.close(); await vite.close(); }
