# Four-user workspaces

The app supports four active workspaces at once, targeting about 50 SKUs per user per working day. Each account owns a private catalog, QA/Catalog jobs, IDQ batches, history, evidence and image selections. Identical SKU strings can exist in different workspaces. Administrators explicitly select a workspace in the header; ordinary users cannot access other workspaces.

## Execution and API keys

- One active job per workspace across QA, Catalog and IDQ. Additional jobs remain in PostgreSQL, ordered by creation time. Interrupted work resumes before newer queued jobs.
- One SKU at a time within each job. Four workspaces can therefore process four SKUs concurrently.
- All AI calls share a four-call process limit, including retries, Markdown cleanup and admin connectivity tests. Crawl4AI retains its separate one-request limit.
- Deploy one application instance. The database leader lock prevents duplicate background schedulers; the AI admission limit is process-local, so additional HTTP replicas require a shared admission limit first.
- A user receives one permanent key slot when their account is created. Assignment and account creation commit together. No free configured slot means account creation returns a conflict and saves neither record.
- Deleted users retain their key-slot reservation. Slots are never borrowed or automatically recycled. Removing or invalidating an assigned key stops that workspace’s AI requests; no fallback to another user’s key occurs.
- Settings snapshots contain the slot name, never its secret. Admin actions in another workspace use that workspace owner’s key and keep the admin as the job’s actor.

Configure distinct provider keys in the server environment:

```dotenv
AICREDITS_API_KEY_1=...
AICREDITS_API_KEY_2=...
AICREDITS_API_KEY_3=...
AICREDITS_API_KEY_4=...
AICREDITS_API_KEY_5=...
```

Each account, including an administrator, uses one slot. Five slots support four operators plus a separate administrator, with at most four active jobs. Leave unused slots empty until real keys are available. Restart the server after changing secrets. Name provider-side keys after their assigned account for per-key reporting in AI Credits. The assignment shown in Users maps each account ID to its slot. Do not repurpose an occupied slot; rotating its secret keeps the same owner.

Numbered slots use `https://aicredits.in/v1`. Legacy `LLM_API_KEY` / `AICREDITS_API_KEY` support remains in standalone provider utilities; workspace operations require their assigned numbered key. Extra keys provide attribution, not a guarantee of extra provider quota. Account-level provider limits can still constrain throughput.

## Settings

Admins choose **LLM Settings → Global defaults** or **Selected workspace**. Saving workspace settings creates a profile override; **Use global defaults** removes it. Shared rules and QA/Catalog instructions remain global. Regular users can inspect **Model Settings** but cannot edit or test models. Model, reasoning, temperature, output tokens and evidence limits are frozen when a job is queued; changes apply to new jobs.

## Existing installations: explicit migration

Startup refuses to open the old shared schema. The migration does not run automatically and has not been applied to the current application database.

1. Stop every old app/server/worker process, including development watchers. Take and verify a database backup.
2. Configure distinct numbered keys for all existing accounts. Select the existing administrator who should own the previously shared catalog/jobs/IDQ data. Read its ID with `SELECT id,username,role FROM users;` in your database console.
3. Run the migration rehearsal. Substitute the chosen ID; the default behavior rolls back all changes:

   ```bash
   npm run migrate:workspaces -- --owner=EXISTING_ADMIN_ID --key-slot=AICREDITS_API_KEY_1
   ```

4. Review the owner, account count and migrated record counts. Apply the same command with `--apply`:

   ```bash
   npm run migrate:workspaces -- --owner=EXISTING_ADMIN_ID --key-slot=AICREDITS_API_KEY_1 --apply
   ```

5. Build and start the new server. Reload all browser tabs. Verify an admin’s old data and a new user’s empty workspace before onboarding operators.

The production bundle also includes `dist/migrate-workspaces.mjs`, accepting the same arguments. In Docker, run it as a one-off container with the app service stopped. Do not restart an older release against the migrated database: older reads are not workspace-scoped. Rolling back requires the matching pre-migration database backup and release, with a plan to preserve any later data.

The migration preserves existing records, snapshots, selected images and evidence. Previously shared records go only to the chosen admin; other users begin with empty workspaces. Every existing account receives a distinct unused slot. Queued/interrupted jobs receive their owner’s slot in their settings snapshot. Historical provider charges are not retrospectively attributed to the new keys. Insufficient keys, invalid ownership or active worker locks abort the transaction. Repeating migration does not reassign already-owned data.

For a new empty installation, supply explicit `BOOTSTRAP_ADMIN_USERNAME`, `BOOTSTRAP_ADMIN_PASSWORD` and at least one configured slot, then run `npm run admin:bootstrap`. There is no default bootstrap password.

## Validation and operating limits

Run these against a dedicated disposable database, never production:

```bash
npm test
TEST_DATABASE_URL=postgresql://... npm run test:security-db
TEST_DATABASE_URL=postgresql://... npm run test:idq-db
TEST_DATABASE_URL=postgresql://... npm run test:workspaces-db
TEST_DATABASE_URL=postgresql://... npm run test:workspace-migration-db
npm run test:workspace-browser
npm run test:catalog-browser
npm run test:catalog-images-browser
npm run test:idq-browser
npm run build
```

Database suites create and drop isolated schemas. Run them sequentially when they share a database because advisory locks are database-wide.

The workspace test uses mocked AI responses for 200 SKUs, verifies four concurrent calls, sequential SKUs per workspace, exact per-key attribution, an IDQ job waiting behind QA, and recovery of four interrupted workspaces. Migration tests cover dry-run rollback, failed migration rollback, worker locks, data preservation and repeat execution. Browser checks cover captured workspace headers, discarded late responses, logout/login and read-only settings.

These tests establish correctness, not live throughput. At a measured 45 seconds per SKU, 50 QA SKUs would take about 38 minutes in one workspace before scraping, retries and queue wait. Benchmark representative live input with the actual provider account before promising turnaround. The 50-SKU daily target is not a quota enforced by the application.

QA/Catalog retain the five-minute per-SKU budget and three-attempt limit. Recovery does not guarantee exactly-once provider billing after a process crash. Full catalog lists, imports and browser exports remain suitable for this small rollout; larger teams need measurements, pagination and provider-capacity review. Existing dependency findings in the codebase review still require separate remediation before public exposure.
