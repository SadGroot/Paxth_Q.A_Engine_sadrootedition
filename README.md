# Paxth Q.A. Engine

Paxth Q.A. Engine helps catalog editors review ecommerce product spreadsheets and create catalog upload files using supplied SAP information, product-page evidence, and category-specific rules. The interface calls the application **Project 22**.

Upload a spreadsheet, prepare the evidence, create a job, run the review, and export an Excel workbook with findings and suggested corrections. A language model produces the review; a person should verify its findings before changing the product catalog.

**Development and delivery:** the app is built in GitHub Codespaces. GitHub Actions and isolated systemd deployment are configured for a secondary VPS app; see [CI/CD setup, required GitHub settings, and recovery](docs/ci-cd.md).

**Current readiness:** private workspaces, permanent per-user key slots and four-workspace execution are implemented. Existing installations require the explicit [workspace migration](docs/workspaces.md). Configure real keys and verify live throughput before onboarding; remaining dependency findings in the [codebase review](docs/codebase-review.md) still apply.

## Contents

- [Features and terminology](#features-and-terminology)
- [How the app works](#how-the-app-works)
- [Local setup](#local-setup)
- [Configuration](#configuration)
- [Your first review](#your-first-review)
- [Creating a catalog](#creating-a-catalog)
- [Spreadsheet format](#spreadsheet-format)
- [Mapping rules and shared instructions](#mapping-rules-and-shared-instructions)
- [Cloud retrieval](#cloud-retrieval)
- [Jobs, recovery, and cancellation](#jobs-recovery-and-cancellation)
- [Understanding results and exports](#understanding-results-and-exports)
- [Accounts and permissions](#accounts-and-permissions)
- [Architecture, storage, and source layout](#architecture-storage-and-source-layout)
- [API reference](#api-reference)
- [Tests and developer commands](#tests-and-developer-commands)
- [Production deployment](#production-deployment)
- [Scaling limits](#scaling-limits)
- [Troubleshooting](#troubleshooting)
- [Further documentation](#further-documentation)

## Features and terminology

| Screen | Purpose | Access |
| --- | --- | --- |
| Dashboard | Import spreadsheets; search/select products; edit evidence; scrape URLs; create jobs; export a summary | Signed-in users; deletions require admin |
| Scraper | Test any public URL without a SKU; inspect/copy/download temporary results and diagnostics; save collected evidence to a selected SKU; cancel retrieval | Signed-in users |
| Attribute Sets | Read category rules; create, edit, delete, or import rules | Shared reading; changes require admin |
| Jobs | Queue reviews; follow progress; cancel eligible runs; inspect history; export detailed findings | Signed-in users; deletion requires admin |
| LLM Settings | Configure the shared model, limits, temperature, and instructions; test model connectivity | Admin |
| Users | Create accounts, change roles/passwords, remove accounts | Admin |

A **SKU** identifies a product. An **attribute set** is a category and its validation rules. **Evidence** means supplied SAP text or product-page content. A **job** groups products; a **run** records one execution of that job. A **QA verdict** describes review findings, separately from execution status.

Each account has a private workspace for catalog, jobs, evidence, history and IDQ. Admins can explicitly select another workspace. Rules and QA/Catalog instructions remain shared; admins control global model defaults and workspace overrides. See [workspace setup and migration](docs/workspaces.md).

There is no direct SAP/ERP integration. SAP text comes from the spreadsheet or editor. The app does not automatically update SAP, a storefront, or the uploaded file.

## How the app works

```mermaid
flowchart LR
    File[Product spreadsheet] --> Browser[React interface]
    Browser -->|Same-origin API and session cookie| API[Express API]
    API --> DB[(PostgreSQL)]
    Worker[Worker in the Express process] -->|Claims durable runs| DB
    Worker --> Model[OpenAI-compatible QA provider]
    Worker --> Scraper[Crawl4AI cloud API]
    Scraper --> Formatter[GLM Markdown cleanup]
    API -->|Interactive retrieval| Scraper
    Browser -->|Poll progress and results| API
    Browser --> Export[Excel review workbook]
```

The browser parses imports and generates Excel exports. Express handles authentication, validation, persistence, provider requests, and background execution. PostgreSQL holds durable state. One database-owned scheduler runs up to four workspaces concurrently, with one job per workspace and one SKU at a time in each job.

The review follows this source hierarchy:

1. SAP is the primary factual source.
2. Product-page evidence can support details absent from SAP.
3. Category rules define requirements, formats, and severity; they do not supply product facts.
4. Conflicting sources should produce a review finding.

The app checks the model's JSON structure, evidence flags, issue types, severity, and correction requirements. Those checks cannot prove that the model interpreted a source correctly. Confidence is model-reported, not a measured probability.

## Local setup

### Prerequisites

- **Node.js 22** and npm, matching the Docker image.
- An accessible PostgreSQL database; use a maintained release for new installations.
- A direct database connection or **session pooler**. Transaction pooling is unsuitable for the worker's session advisory lock.
- An OpenAI-compatible provider account for QA.
- A Crawl4AI cloud API key for URL retrieval; see [scraping configuration](docs/browser-scraper.md).

Docker is optional for local development. The supplied application Compose file does **not** provision PostgreSQL.

### 1. Install dependencies and create configuration

From the repository root:

```bash
npm ci
test -e .env || cp .env.example .env
```

The second command preserves an existing `.env`. Edit it locally; never commit credentials. Git and Docker ignore the real environment file.

Set `DATABASE_URL` to your intended development database:

```dotenv
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/paxth_qa_engine
```

These are development credentials only. The database must already exist: startup creates application tables inside it, not the PostgreSQL database itself. Use a dedicated development database because startup executes schema changes.

If Docker is installed and port 5432 is available, this optional command creates a database matching that example:

```bash
docker run --name paxth-qa-dev-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=paxth_qa_engine \
  -p 127.0.0.1:5432:5432 \
  -v paxth-qa-dev-db:/var/lib/postgresql/data \
  -d postgres:17
```

For Supabase, copy the exact TLS-enabled URI from the project's Connect dialog. In an IPv4-only environment, use the Session pooler. Preserve its hostname, region, port, username, and connection parameters rather than guessing them.

### 2. Configure provider credentials

Configure distinct server-only `AICREDITS_API_KEY_1` through `AICREDITS_API_KEY_5` slots in `.env`. Each account receives one permanent slot; all its AI requests use that key at `https://aicredits.in/v1`. Crawl4AI uses its separate `CRAWL4AI_API_KEY`. See [workspace setup](docs/workspaces.md) for allocation, migration and deployment limits.

### 3. Create the first administrator

Supply an explicit username and password of **12–256 characters**. Bootstrap also requires an unused configured numbered API-key slot; it has no default credentials.

This Bash example avoids putting the password in shell history:

```bash
read -r -p 'Administrator username: ' BOOTSTRAP_ADMIN_USERNAME
read -r -s -p 'Administrator password: ' BOOTSTRAP_ADMIN_PASSWORD
echo
export BOOTSTRAP_ADMIN_USERNAME BOOTSTRAP_ADMIN_PASSWORD
npm run admin:bootstrap
unset BOOTSTRAP_ADMIN_USERNAME BOOTSTRAP_ADMIN_PASSWORD
```

Bootstrap creates auth tables if needed and refuses to replace an existing administrator with a usable password hash. Manage existing accounts through Users. The optional `--recover-legacy` flag is restricted to installations whose administrator passwords are all in the retired plaintext format; it is not a general password-reset command.

### 4. Start and verify

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). In Codespaces, use the forwarded port 3000 URL. Development derives its origin when `APP_ORIGIN` is empty. Frontend, API, and live reload share this port.

Backend imports are watched and restart the server when changed. Restart the process after changing environment credentials.

On Linux, `./start.sh` is an alternative launcher. It stops an existing listener belonging to this checkout, waits for shutdown, and refuses to stop another project's listener. It requires `lsof`, `readlink`, and standard shell tools. Its port check uses exported `PORT`; export a custom port before using it.

With the development server running and HMR enabled:

```bash
node scripts/verify-dev-server.mjs
```

This checks development HTML, database readiness, Vite, and the live-reload WebSocket. It does not test a paid provider request.

## Configuration

### Server environment

| Variable | Required? | Meaning |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL URI; loaded from the process environment or `.env` |
| `APP_ORIGIN` | In production | Exact public HTTPS origin, e.g. `https://qa.example.com`, without path/query/credentials |
| `AICREDITS_API_KEY_1` … `_5` | One per account | Distinct server-only keys permanently assigned to accounts |
| `CRAWL4AI_API_KEY` | For URL scraping | Server-only Crawl4AI cloud key; scraping also requires model credentials |
| `PORT` | No | Express port, default `3000` |
| `HOST` | No | Listening address, default `0.0.0.0`; use loopback where appropriate for native deployment |
| `NODE_ENV` | Set for production | `production` serves built assets; other values start Vite middleware |
| `DISABLE_HMR` | No | `true` disables development live reload/file watching |
| `BOOTSTRAP_ADMIN_USERNAME` | Supply for bootstrap | First-admin name; remove after use |
| `BOOTSTRAP_ADMIN_PASSWORD` | Supply for bootstrap | First-admin password; remove after use |
| `TEST_DATABASE_URL` | For DB tests | Explicit disposable PostgreSQL connection; never production |
| `CHROMIUM_EXECUTABLE` | Optional test override | Installed Chromium path for browser tests; irrelevant to production retrieval |

Production cookies are Secure, so a production browser session needs HTTPS. An HTTP request to the container is useful for `/healthz`, but is not a complete login test.

### Shared model settings

Admins edit these in **LLM Settings**. They persist in PostgreSQL and apply to new runs. Catalog generation shares the model, temperature, token limit, evidence limit, and global instructions with QA. Reasoning selections apply to both workflows, with model-specific automatic defaults.

| Setting | Fresh-install default | Accepted range/behavior |
| --- | --- | --- |
| QA model | `deepseek/deepseek-v4.1-flash` | Provider identifier; availability depends on the gateway |
| Scraping / Markdown model | `deepseek/deepseek-v4.1-flash` | Independent formatter model using the same server credentials |
| Reasoning level | GLM: `low`; DeepSeek: `low` | GLM: Low, High, Max. DeepSeek: Auto, Off, Low, Medium, High, Max |
| Temperature | `0.1` | `0`–`1` |
| Maximum output tokens | `32768` | Integer `1`–`65536`; the model/provider can impose a lower limit |
| Maximum evidence characters | `40000` | Integer `1`–`200000`; limits web Markdown, not the entire prompt |
| Shared QA / Catalog instructions | Built-in catalog review instructions | Global; blank text uses the default |

The reasoning dropdown supports `z-ai/glm-5.3-flash`, `z-ai/glm-5.3-flashx`, and `deepseek/deepseek-v4.1-flash`. GLM retains its saved Low/High/Max choice. DeepSeek saves a separate `deepseekReasoningEffort`, defaulting to Low across QA, Catalog, IDQ, and Markdown cleanup. DeepSeek accepts Medium as an alias for High, and temperature has no effect while thinking is enabled. Existing explicit selections remain valid; Auto uses Low for QA and Off (`none`) for Catalog, IDQ, and cleanup. Other models receive no reasoning override. Temporary DeepSeek failures retry with thinking Off within the existing attempt budget. Compatibility concurrency/retry fields do not increase worker concurrency.

To switch the shared QA/Catalog model through AI Credits, enter `deepseek/deepseek-v4.1-flash` in **Q&A model**, choose **Low**, and start with 32,768 output tokens, 40,000 evidence characters, and temperature 0.1. Validate completeness on representative SKUs before treating this as a tuned profile. This is V4.1 Flash, not a `v4.11` identifier. New runs use the saved model; admitted runs keep their configuration.

**Test Q&A API** and **Test Markdown model** send a short prompt to their displayed model, including unsaved model and DeepSeek effort edits. They do not save settings, retrieve a page, or validate a complete task answer. They use the selected workspace owner’s key and can incur provider cost. The remaining limits and QA instructions apply to mapping; Markdown conversion has fixed instructions and a 16,384-token ceiling.

## Your first review

1. Sign in as an admin. Select a supported model in **LLM Settings**, test connectivity, and save.
2. In **Attribute Sets**, add or edit the category and save its Markdown rules. Seeded names initially have blank rules.
3. Prepare a spreadsheet with SKU, category, attributes, and SAP evidence or a product URL.
4. Upload in **Dashboard**. Check the import notification for duplicates and missing identifiers.
5. For URLs, configure both Crawl4AI and model credentials, then use Dashboard's **Scrape URLs** on selected SKUs. Inspect the retrieved evidence; paste manual content when needed.
6. Select products sharing one nonblank category and click **Create QA Job**. A SKU with SAP, usable saved Markdown, or a URL can join a job; URL-only SKUs scrape before QA.
7. Open **Jobs** and run it. Closing the screen does not stop an accepted server run.
8. Inspect the findings and source conflicts. Export through Jobs for detailed correction cells and notes.
9. Verify the replacements before applying them to the source catalog.

A URL can make an imported SKU appear `ready` before evidence is collected. That label alone does not prove the SKU has enough information for QA.

## Creating a catalog

Use the **QA / Catalog** toggle beside Notifications. A fresh page load defaults to QA. Both modes share uploaded SKUs, evidence, category rules, and model settings; each mode shows its own jobs, counters, filters, and results. Switching modes does not cancel accepted server runs.

1. In **Attribute Sets**, select a category. Use **Mapping Rules** for the shared Markdown instructions/examples, and **Catalog Output Headers** for one exact output column per line in export order. Save both together. Output headers apply only to Catalog; QA continues using its original uploaded template.
2. Switch to **Catalog**. Beside **Upload New File**, choose **Download Input Template** for `Catalog_Input_Template.xlsx`: one **Catalog Input** worksheet with the 14 required headers, text-formatted columns, and no sample products. Fill rows below the headers, then upload the file. The download is available before any SKUs or attribute sets are configured; its fixed input headers are separate from each attribute set's output headers. You can also upload a `.xlsx`, `.xls`, or `.csv` file containing every required input header, with these exact case-sensitive names:

   ```text
   sku,base_code,attributes__lulu_ean,attributes__shipping_weight,attributes__brand,attributes__sap,attributes__url,attribute__shipping_attribute,attribute__shipment_type,attribute__common_item_whippy,attribute__fallback,attributes__region,attributes__attribute_set,attributes__lulu_product_type
   ```

   Missing headers reject the whole upload and list the missing names. Input columns may appear in any order, and extra columns are allowed. Headers are mandatory; individual cells may be blank subject to the existing SKU/evidence requirements. `attributes__attribute_set` selects the category mapping, `attributes__sap` supplies factual context, and `attributes__url` supplies the scraper URL. Older `source__*` columns cannot substitute for or override these columns in Catalog mode. QA uploads retain their existing format. API clients use `POST /api/catalog?mode=catalog` for this validation; omitted mode defaults to QA.

3. Select SKUs with one common region and one or more non-empty attribute sets, then choose **Create Catalog Job**. Every SKU needs SAP, usable saved page evidence, or a URL. Every set needs valid Catalog output headers and non-empty mapping rules. Creation prepares one template per set and one populated shipping file, without scraping or model calls.
4. Successful creation opens the parent job in **Jobs**. **Category Subjobs & Files** shows one subjob/template per attribute set, category progress/failures, and exactly one shared shipping workbook. Download prepared files immediately; choose **Run All Categories** to run the parent, or **Run Catalog** on its card to process unfinished rows. SKU, base code, EAN, shipping weight, brand, and product type pass through unchanged, including blank cells. Other empty cells are generated using SAP/page evidence and explicit defaults from the global instructions and category mapping. SAP takes factual precedence; mapping examples are formatting guidance, not product facts. Each run snapshots the shared global instructions, category rules, and fixed headers; later edits do not change an active or historical run.
5. Inspect generated cells and warnings in **View Results**, then download each set's final `.xlsx` upload file. Uploaded values that conflict with evidence or mapping requirements stay unchanged. Affected cells are highlighted in Jobs and Excel; Excel comments explain the source conflict, missing fact, or mapping requirement. Unknown facts remain blank with cell warnings; malformed or incomplete model responses fail that SKU. All catalog exports preserve these comments, including combined exports after SKU deduplication. Final uploads include only validated rows, report omitted unfinished/failed SKUs per set, and contain exactly the mapped columns without QA or warning columns. Shipping always contains every assigned SKU. Run history selects that run's saved files and schemas; **Current prepared files** shows the most recent prepared snapshot.

After a Catalog run finishes, open **View Results** and click **Images** beside a SKU. The picker uses image URLs in that run's saved Markdown, including its **Product images** gallery. Click images in the desired filename order, then **Save selections**. Deselecting closes gaps; selecting again appends the image. Choices are private to their workspace and saved per run, including after reopening the app. New runs start with a fresh selection. **Export Images (.zip)** downloads all saved selections across that run's SKUs as `SKU-1.jpg`, `SKU-2.jpg`, and so on.

Previews and downloads use the same 1500 × 1500 white canvas. White/transparent outer margins are trimmed, then the visible content is centered inside a 1200 × 1200 area with at least 150 px padding, preserving proportions. Transparent pixels become white; colored backgrounds remain. This does not perform background removal. The server retrieves only public HTTP(S) raster images from the saved Markdown, checks redirects, and limits each source to 20 MiB. A failed source stops export with an error, preserving the saved choices; no partial ZIP downloads. Keep the tab open during export. Very large jobs can require substantial browser memory.

Catalog generation requires JSON with `row`, general `warnings`, and `cellWarnings: [{ header, message }]`; each cell warning must use an exact output header. These server-validated findings persist with the result. Historical results without cell warnings remain readable/exportable, but the next unfinished run regenerates them once to produce cell findings. Model validation checks structure, not factual correctness; review representative evidence and flagged values before upload.

For `deepseek/deepseek-v4.1-flash`, new settings use `reasoning_effort: "low"`. Live requests with thinking have returned HTTP 500 after about 30 seconds even at Low. The shared provider retries the next remaining attempt with `reasoning_effort: "none"` after transient network errors, 408, or retryable 5xx responses. Explicit 400/422 rejections of `reasoning_effort` can use the same recovery; unrelated client errors, authentication, and credit failures stop immediately, and rate limits retain their effort and backoff. Actual effort and failure classification are checkpointed for QA/Catalog and IDQ restart recovery, and reduced-effort results carry a notice. QA/Catalog retain three attempts and five minutes per SKU; IDQ retains two attempts per call. [DeepSeek documents reasoning levels and Medium compatibility](https://api-docs.deepseek.com/api/create-chat-completion/).

QA validates answers inside that attempt budget. Empty answers, malformed JSON, and invalid QA fields can use one corrective retry, with the original evidence and a concise field-specific validation message. DeepSeek truncation can use a remaining attempt with thinking Off; truncation when already Off fails with advice to review the response size or increase the configured token limit. Retries never raise that limit. Refusals and semantic source/correction validation failures remain terminal. Recovery flags, actual limits/effort, finish reason, available response usage, and invalid field paths are stored in `job_run_items.provider_state`, including across worker restarts. Each SKU's terminal result is saved before the next begins; failed SKUs do not block later SKUs. Start a fresh **unfinished** run to retry failed or unfinished SKUs with new settings while retaining completed results.

For `z-ai/glm-5.3-flash` and `z-ai/glm-5.3-flashx`, QA and Catalog use the saved reasoning level, defaulting to `low`. GLM defaults to maximum reasoning when no level is supplied and does not support disabling thinking ([Z.ai documentation](https://docs.z.ai/guides/capabilities/thinking)). On 12 October 2026, replaying an actual failed GLM catalog request reproduced HTTP 500 after 30 seconds; changing only reasoning effort to low returned a validated 61-column catalog row in 16 seconds. The connectivity test uses a tiny prompt and cannot verify full Catalog processing. Model choice, token limits, JSON validation, and bounded retries stay unchanged.

Low effort does not prevent every GLM gateway failure. Two remaining HONOR rows repeatedly failed after about 30 seconds even with Low effort; the exact inputs produced validated 61-column rows through DeepSeek with thinking Off in 15 and 12 seconds. Catalog therefore makes at most two attempts with a selected GLM Flash/FlashX, then uses DeepSeek with Off for its final attempt after transient network, 408, or selected 5xx failures. All three attempts share the existing five-minute SKU deadline and reuse the same evidence, rules, and output schema. Authentication, configuration, credits, and rate limits do not switch models; refused, truncated, or invalid successful output still fails validation. The actual requested model, reasoning effort, and transient failure status are checkpointed for restart recovery; results show the actual model and a fallback notice. Successful rows are preserved by **Resume Catalog**. QA and Markdown cleanup retain their own retry policies. Startup adds the nullable `job_run_items.provider_state` column automatically.

Catalog imports retain displayed Excel text and CSV identifiers, including leading zeroes and the exact capitalization of attribute names. Keep identifiers as text in source files: formatting or precision already lost in a numeric spreadsheet cell cannot be reconstructed.

The shipping workbook has one **Shipping** worksheet and exactly 16 text-formatted columns: `sku`, `base_code`, six shipping-attribute columns in UAE/KWT/QTR/OMAN/KSA/BAHRAIN order, six shipment-type columns in that same order, and the selected region's Whippy and fallback columns. The UAE shipping attribute is `attributes__erp_shipping_attribute`; the other five append their region code. Shipment types use `attributes__erp_shipment_type_<region>`.

| Region | Whippy column | Fallback column |
| --- | --- | --- |
| UAE | `attributes__common_item_whippy_uae` | `attributes__fallback_uae` |
| KWT | `attributes__common_item_whippy_kwt` | `attributes__fallback_kuwait` |
| QTR | `attributes__common_item_whippy_qtr` | `attributes__fallback_qatar` |
| OMAN | `attributes__common_item_whippy_oman` | `attributes__fallback_oman` |
| KSA | `attributes__common_item_whippy_ksa` | `attributes__fallback_ksa` |
| BAHRAIN | `attributes__common_item_whippy_bahrain` | `attributes__fallback_bahrain` |

All shipping attributes default to `Courier delivery`; all shipment types default to `Scheduled`. Only the selected region uses non-empty `attribute__shipping_attribute` and `attribute__shipment_type` input cells. `attribute__common_item_whippy` and `attribute__fallback` pass through unchanged, including blanks. Shipping reads these exact original input fields; extra ERP columns cannot override the rules. Region validation ignores case and surrounding whitespace. New jobs and subsequent runs use the prefixed fallback headers; existing prepared files refresh on the next run, while historical files retain their saved headers. New jobs reject missing, unknown, or mixed regions; older incompatible jobs can still run Catalog but show shipping as unavailable.

Generated content never replaces the original upload or becomes QA input automatically. Catalog results live separately in `catalog_state` and durable run history. Shared evidence edits/scrapes still advance the evidence revision and invalidate older current results. Historical exports remain available without another model call.

Catalog unfinished runs reuse completed results from the same job only when the evidence revision, category, global instructions, mapping rules, and ordered output headers still match. Category rule/header changes invalidate only the affected set's rows; global instruction changes invalidate every set. Results generated before Catalog applied global instructions regenerate once on the next unfinished run. New runs refresh prepared templates and snapshot each set's rules/headers; historical files keep their saved snapshots. Cancellation preserves committed rows; resume retries unfinished/failed rows. Selected-job Catalog exports group by attribute set, require identical saved header order within each set, and deduplicate SKUs. Multiple sets get individual download buttons; shipping remains one file per job.

**Resume Catalog** remains available after completion so it can regenerate only rows affected by later mapping changes. **Rerun All** regenerates every assigned SKU. Startup adds the nullable `jobs.catalog_outputs` snapshot column automatically; older jobs keep their saved results and prepare available files on their next run.

## Spreadsheet format

### Recognized columns

Only the first worksheet is imported. Its first header row supplies column names. There is no interactive column-mapping step.

| Header | Meaning | Matching |
| --- | --- | --- |
| `sku` or `SKU` | Product identifier | These two spellings |
| `attributes__brand`, `attributes__colour`, etc. | Uploaded values to review | Lowercase `attributes__` prefix; stripped in the parsed attribute object |
| `source__sap` or `sap` | SAP text | Exact `source__sap`; case-insensitive standalone `sap` |
| `source__url` or `url` | Product-page URL | Exact `source__url`; case-insensitive standalone `url` |
| `attribute_set` or `attribute set` | Category for grouping/rules | Case-insensitive header |
| Other columns, e.g. `name`, `base_code` | Original template values | Preserved and included in QA unless recognized as source/result metadata |

Example CSV:

```csv
sku,attribute_set,attributes__brand,attributes__colour,source__sap,source__url
000123,Electronics-TV,Example Brand,Black,"Brand: Example Brand; Colour: Black; Model: TV-55A",
000124,Electronics-TV,Example Brand,Silver,"Brand: Example Brand; Colour: Black; Model: TV-55B",https://shop.example.com/products/tv-55b
```

Replace the example URL with a real public product page, or leave it empty for SAP-only QA. For identifiers with leading zeroes, an XLSX worksheet with text-formatted cells is safer than relying on CSV type inference.

### Import behavior and limits

- The file picker accepts `.xlsx`, `.xls`, and `.csv`.
- Rows without usable SKUs are skipped. The first occurrence of a trimmed SKU within a file is kept.
- Existing database SKUs are skipped atomically. Uploading duplicates is not an edit operation.
- The API accepts **1–10,000 rows per import request**. The UI sends the file as one batch without automatic chunking.
- Express accepts JSON bodies up to **50 MB**. This is a request-body limit, not a spreadsheet file-size guarantee.
- Browser parsing has no pre-parse file-size cap and can freeze on large files before reaching the API.
- Keep identifiers and barcodes as text. Numeric cells may already have lost formatting or precision.
- Original rows and header order are retained for detailed exports.

`qa_result` is reserved for server-generated QA. Any row with its own `raw_row.qa_result` property rejects the **entire request with HTTP 400**, even when the value is `null`, blank, a string, or a plausible review. Nothing from that batch is saved. Remove the reserved column/property and resubmit. The response is:

```text
raw_row.qa_result is reserved for server-generated QA; remove it before importing.
```

Top-level QA results, export metadata, token usage, and last-job metadata are also rejected. Imports may use only unprocessed states (`pending`, `ready`, `cannot_qa`). The server validates every row before opening the write transaction.

`catalog_state` is also reserved for server-generated catalog results. Imports reject it both at the top level and in the original raw row; generated content cannot impersonate a completed catalog execution.

## Mapping rules and shared instructions

An attribute set stores a category name and Markdown rules. Define exact column names, required/optional values, accepted formats/units, missing-evidence handling, source conflicts, severity, and when a complete correction is supported.

Job grouping currently requires identical category strings, including case and spacing. Rule lookup trims names and ignores case. Keep spreadsheet category names consistent.

Reference documents for [TVs](tv_mapping_rules.md), [USB hubs](usb_hubs_mapping_rules.md), [adapters, chargers, and cables](power_adapters_chargers_utility_cables_mapping_rules.md), and [Electrics-Kitchen Appliances](kitchen_appliances_mapping_rules.md) are not automatically imported. Review and paste applicable rules into Attribute Sets.

Example:

```markdown
# Television review rules

## attributes__brand
- Required.
- Compare with SAP; use web evidence when SAP lacks the value.
- A confirmed different brand is critical.
- Suggest the complete source-supported replacement.

## attributes__colour
- Optional when neither source supplies a colour.
- Do not infer colour from material or a model number.
- Explain the evidence needed for an unverifiable claim.
- Leave the correction blank when no source supports it.
```

Shared QA / Catalog instructions provide standing guidance for both modes. Category rules take precedence for category checks; the application's final output/evidence requirements take precedence over both.

Missing, blank, or ambiguous rules produce a general review with a warning. New runs snapshot configuration; editing rules does not retroactively change a running review or old result.

Legacy **Import browser rules** fills missing/blank shared rules without overwriting nonblank ones. Browser-owned accounts and provider credentials are retired and discarded.

### Catalog output headers and shared mapping rules

Use **Catalog Output Headers** to list one exact output column per line. Names must be unique and non-empty, without surrounding whitespace or control characters. The list must include all six pass-through columns shown below, in any order. Add further output columns as needed; their listed order is the export order. An empty list is allowed for QA-only sets, but blocks Catalog job creation and execution. The fixed 14-column import contract above is independent of this output list.

```text
sku
base_code
attributes__lulu_ean
attributes__shipping_weight
attributes__brand
attributes__lulu_product_type
name
attributes__product_description
attributes__color
```

Use **Mapping Rules** for the Markdown shared by QA and Catalog. A header section is not required. Example instructions:

```markdown
# Example USB Hub Catalog

## Cell ruless

- The six pass-through values always remain unchanged, including blanks.
- `name`: use source-supported brand and model. Example format: `ExampleBrand Model X USB Hub`.
- `attributes__product_description`: write a readable paragraph using only verified features. Example format: `This USB hub provides [verified port layout] for [verified compatible devices].`
- `attributes__color`: use only the source-supported color for this SKU; leave blank if unknown. Example format: `Black`.
```

This is a format example, not an approved production template. Add all required business columns and their filling instructions before running catalog jobs. On upgrade, compatible legacy Markdown header lists are copied once into the separate stored list; incompatible lists leave it empty for manual setup. Markdown and saved runs are preserved, and clearing headers later does not repopulate them. Legacy browser-rule imports never replace separately configured output headers. Catalog generation applies the shared global instructions and selected category mapping inside its dedicated application prompt. Application requirements take precedence over both, and category rules take precedence for category-specific checks.

`attributes__lulu_product_type` is the mandatory product-type header for Catalog uploads, downloaded input templates, and output-header lists. Older `attributes__product_type` headers cannot substitute in new Catalog uploads and must be removed from newly saved output lists. Startup renames that header in existing saved output lists, preserving order; if both names exist, the canonical header keeps its position. Earlier SKU uploads retain their original rows, and Catalog carries their old product-type value into the renamed column when no canonical value exists. Admitted runs and historical exports retain their saved header snapshots; rerun to generate output with the new header.

## Cloud retrieval

Dashboard, Scraper URL previews, and durable QA/Catalog jobs share this pipeline:

`public URL → Crawl4AI cloud API → DeepSeek Markdown cleanup → product evidence`

Set server-only `CRAWL4AI_API_KEY` and the selected workspace’s assigned numbered AI Credits key. Both configurations are checked before collection. The cloud request follows the [official API reference](https://api.crawl4ai.com/llms.txt): one Bearer-authenticated `POST https://api.crawl4ai.com/scrape` with `{url, format: "both", parse: {media: true}}` to collect Markdown, HTML, and parsed image media together. Proxy and region use the service defaults.. There is no local fallback or automatic cloud retry.

The existing `scraperModelName` defaults to `deepseek/deepseek-v4.1-flash` and remains independently editable. Cleanup removes navigation, cookie banners, unrelated promotions, recommendations, and duplicate boilerplate. It preserves source language, product facts, identifiers, specifications, numbers, currencies, variants, tables, and relevant links. Page instructions are treated as untrusted content. Temperature is fixed at `0.1`, with 16,384 output tokens. The selected model gets at most two attempts within 60 seconds; temporary model/network failures can use one backup attempt within the existing 120-second total cleanup deadline. Cleanup enables JSON output mode and validates the internal `{markdown, selectedGalleryIds}` response before accepting it. A single outer JSON code fence is accepted without changing Markdown inside it. DeepSeek cleanup uses the saved DeepSeek effort, defaulting to Low; an explicitly selected GLM still uses Low. Automatic backups use DeepSeek with thinking Off, including when DeepSeek was the primary. Invalid JSON or schema output can use one backup attempt. The same captured Markdown is reused, and evidence records the model that actually succeeded. Configuration, authentication, credit, rate-limit, refusal, and truncation errors do not switch models. Invalid backup output still fails safely and preserves previous evidence. These instructions cannot prove factual preservation; inspect live results.

Scraper defaults to **Test URL** and works with an empty catalog. Authenticated `POST /api/scrape/preview` accepts only `{url}`, returns temporary cleaned Markdown and diagnostics, and writes no catalog/jobs/runs. Copy/download, duration, character count, and cancellation remain available. Unknown interaction diagnostics are hidden. **Test Markdown model** in Settings checks only model connectivity; **Test URL** checks the complete paid pipeline.

Use Dashboard's **Scrape URLs**, or Scraper's **Save to SKU**, to save evidence with `POST /api/catalog/:sku/scrape` and `{expectedRevision}`. The server obtains the URL from the saved row. A newer edit, competing scrape, or deletion rejects a stale save. Bulk progress distinguishes saved, failed, conflicted, and skipped SKUs and supports cancellation.

New provenance uses `method: "cloud"`, `crawler: "crawl4ai"`, the formatter's `modelName`, requested URL, and `receivedAt`. The current API supplies neither final URL nor capture time: `finalUrl` and `capturedAt` stay null. Receipt time is labeled **Received**, never **Captured**. Browser/manual/legacy evidence and historical runs remain readable. A source change excludes old URL evidence from automatic processing. Failed retrieval or invalid/empty/refused/truncated cleanup preserves previously saved evidence. Jobs retain SAP fallback.

| Retrieval limit | Value |
| --- | --- |
| Cloud admission | One active, eight queued; 60-second queue wait |
| Retrieval deadline after admission | 120 seconds, including DNS and response reading |
| Cleanup deadline | Separate 120 seconds, including model admission/retries |
| Job execution budget | Existing five minutes | s
| Response size | 4 MiB for each upstream response |
| Markdown size | 200,000 characters, including appended source footer |

Public HTTP(S) input and all initial DNS answers are validated before the cloud request. Private addresses and embedded credentials are rejected. Crawl4AI performs page navigation remotely; the app no longer runs a browser or DNS-pinning proxy. API redirects are rejected, and keys go only to their respective providers. Safe errors distinguish bad keys, exhausted credits, rate limits, blocked/login pages, busy service, network failure, and invalid content. Upstream key failures do not sign users out. A page result cannot certify an entire website as fully scrapeable. Use SAP/manual evidence when a site cannot be retrieved. See [configuration and verification](docs/browser-scraper.md).

## Jobs, recovery, and cancellation

A job groups SKUs. Each run stores the actor, configuration, evidence snapshots, attempts, and results.

| Mode | Behavior |
| --- | --- |
| `unfinished` | Process SKUs without completed QA, including evidence marked for rerun |
| `all` | Review every SKU again |
| `single` | Review one specified SKU in the job |

Run creation is idempotent by request ID. Retrying the same ID and payload returns the same run. One active run is allowed per job; different jobs queue behind the worker.

A SKU satisfies the completed-review check only when it has a canonical server-written `qa_result` for its current revision, no error, and catalog status `completed` or `failed`. A genuine `fail` verdict is a finished review; `completed` status by itself is insufficient. An `unfinished` run selects unverified legacy reviews for processing, but creating or viewing history does not automatically start a paid rerun.

Run snapshots store evidence, not proof that QA happened. Newly skipped items with a trusted prior review retain it in their dedicated item `result`. That keeps genuine reviews available for partial-run exports and excludes their previous token usage from the new run's usage totals. An older skipped item with QA only in its snapshot stays unverified and cannot make the job fully reviewed.

### Execution limits

- Up to four workspaces execute concurrently; each has one active QA/Catalog/IDQ job and one SKU at a time. Other jobs wait in their workspace’s durable queue.
- Each SKU has a five-minute budget covering waits, scraping, and retries.
- QA has at most three total attempts, including at most one corrective retry for invalid answer structure; permanent errors fail immediately.
- Attempt counts are recorded before dispatch and survive restart.
- A QA request has a 120-second deadline after admission and the durable attempt checkpoint.
- QA, Catalog, IDQ, Markdown cleanup and admin connectivity tests share four active calls and eight waiting slots per process, with a 60-second queue wait cap.
- Cloud retrieval shares one active slot and eight queued requests across Scraper, Dashboard, and background jobs.

### Recovery

An accepted run continues when the tab closes. Reopen Jobs to reconnect.

After a restart, committed items are skipped and unfinished items resume within the original budget. Downtime counts against an item already started. A dispatched scrape interrupted by a crash is not automatically repeated; SAP can provide fallback, otherwise start a fresh run.

If saving a paid QA response fails, the worker retains it in memory and retries the database commit. A process crash before commit can still cause another billable request. Exactly-once provider billing is not guaranteed.

Evidence edits increment the catalog revision. An older run retains its historical result but cannot overwrite newer catalog evidence. Human edits also require the expected revision; conflicts retain the unsaved draft and require refresh. Successful job scraping is committed before QA, so a later QA failure or cancellation preserves it.

### Cancellation and deletion

Workspace owners can cancel their runs, including runs started for them by an admin. Admins select the target workspace to cancel its runs. Queued jobs cancel immediately; running jobs abort active requests while preserving committed results.

Cancel affected runs and wait for them to stop before deleting jobs/SKUs. Job deletion cascades to its run history. Clear All Data removes QA/Catalog jobs and catalog rows in the selected workspace; it preserves IDQ batches, accounts, shared rules and provider settings.

## Understanding results and exports

### Execution status versus verdict

| Concept | Values | Meaning |
| --- | --- | --- |
| Catalog state | `pending`, `ready`, `cannot_qa`, `running`, `completed`, `failed` | Catalog/workflow state |
| Run state | `queued`, `running`, `cancelling`, `completed`, `failed`, `cancelled` | Execution lifecycle |
| QA verdict | `pass`, `warning`, `fail` | Whether reviewed values meet the checks |

A completed run can contain failing QA verdicts: execution succeeded and found critical defects. That SKU's catalog state becomes `failed`, while the run item can be `completed` because a valid review was returned. Use run-item state for progress; the catalog need not show `running` while work executes.

| Severity | Color | Effect |
| --- | --- | --- |
| Critical | Red | Failing verdict |
| Moderate | Orange | At least warning |
| Minor | Yellow | At least warning |

Missing rules, truncated web evidence, and reported source conflicts prevent an unqualified pass. Issue types are `data_mismatch`, `missing_data`, `formatting`, `spelling_grammar`, and `unsupported_claim`.

A `data_mismatch` requires source truth and a complete replacement value. Unverifiable claims should explain missing evidence and leave replacement blank. JSON validation does not establish factual correctness.

### Detailed Jobs exports

Prefer Jobs exports for review. They preserve original column order, add `Corrected: <original header>` beside affected `attributes__` fields, highlight severity, and attach notes containing explanation/source truth/suggestion. Corrections remain blank when unavailable or conflicting. General/unmatched findings attach to `qa_status`. The workbook appends `qa_status`, `qa_scrape_status`, and `job_error`.

Single-job exports use a selected historical run when viewing one, otherwise the latest run. Legacy jobs without history use current catalog data. Combined exports include completed jobs, require one identical nonblank category and compatible headers, and deduplicate repeated SKUs. **Issues Only** includes warning/fail verdicts.

Genuine historical results survive later evidence edits and reruns. Catalog `qa_stale` hides reviews and usage for older revisions from Dashboard and current exports; Jobs can still export a selected historical run. Legacy rows without recorded header order export with a warning. Exports reuse saved results without a model request.

### Legacy reviews that need a rerun

The dedicated catalog `qa_result` column and durable run-item `result` are the authorities for review output. A review found only in an original raw row or an old run snapshot is not verified. The app hides its verdict, findings, corrections, and issue notes and shows:

```text
Legacy review is unverified; rerun QA.
```

Original product fields and stored legacy data are preserved. For an unverified catalog row previously marked `completed`, the app shows `ready` when SAP, saved Markdown, or a URL exists; otherwise it shows `cannot_qa`. Existing meaningful errors take precedence. Exports can retain original fields and the error explanation, but unverified reviews supply no QA corrections and are excluded from **Issues Only**.

Run QA explicitly after checking the evidence. No migration promotes old metadata into trusted results, and no automatic paid reruns are triggered. New worker results are saved in canonical result storage without being copied into the original raw row.

Dashboard's **Export Results** is a separate summary. Its missing/mapping counts use obsolete issue types and can undercount. Use Jobs findings for decisions. Other export helpers remain in Dashboard source without visible controls.

## Accounts and permissions

| Capability | User | Admin |
| --- | --- | --- |
| Read catalog, jobs, history | Own workspace | Selected workspace |
| Read shared rules | Yes | Yes |
| Import rows and edit evidence | Yes | Yes |
| Create/edit jobs and start runs | Yes | Yes |
| Retrieve/preview URLs | Yes | Yes |
| Cancel runs | Own workspace | Selected workspace |
| Delete catalog data/jobs | No | Yes |
| Change shared rules/instructions/model | No | Yes |
| Test shared QA provider | No | Yes |
| Manage accounts | No | Yes |

Passwords use salted scrypt. Random session tokens are stored as hashes in PostgreSQL and sent in eight-hour HttpOnly cookies. Production adds Secure and SameSite=Strict. Mutations require the configured same origin; permissions are enforced server-side.

Account changes revoke that account's sessions. The last administrator with a usable scrypt password cannot be deleted/demoted. Password reset is administrator-managed; no self-service recovery is implemented.

Login throttling is process-local: 10 attempts per socket-address/username key and 100 total attempts per process per 15 minutes, counting failed or pending attempts; successful logins release their global count. Behind a proxy the socket address is usually the proxy. This is a known availability/scaling issue, not a recommended public deployment policy.

## Architecture, storage, and source layout

### Storage

| Table/data | Purpose |
| --- | --- |
| `sku_data` | Upload, original row, evidence/provenance/error, revision, QA revision/result, and independent `catalog_state` |
| `jobs` | Definitions, QA/catalog job type, JSON SKU membership, server-owned `catalog_outputs` file snapshots, aggregate totals |
| `job_runs` | Execution history, actor, idempotency key, configuration snapshot |
| `job_run_items` | Per-SKU snapshot, attempts, scrape checkpoint, historical result |
| `attribute_sets` | Category names, shared Markdown rules, and ordered Catalog output headers |
| `qa_agent_settings` | Shared instructions |
| `provider_settings` | Editable QA settings, excluding credentials |
| `users` | Accounts, password hashes, retired scraper credential/control columns |
| `sessions` | Hashed tokens and expiry |
| Legacy `site_selectors` | Compatibility data; no active selector runtime |
| Browser memory/local storage | Temporary notifications/UI state, last filename, legacy importable rules |

Startup initializes schema through server SQL and Drizzle configuration setup, then verifies required tables/indexes/columns/constraints before listening. Schema errors stop startup. The Drizzle schema also describes tables for tooling; maintain both representations consistently.

The workspace upgrade has an explicit transactional migration in `scripts/migrate-workspaces.ts`; other schema setup remains in startup initialization. `db:generate`/`db:push` are developer tools, not the deployed startup mechanism. Do not blindly apply `db:push` to shared production data. Rehearse initialization against a restored backup.

### Source layout

```text
server.ts                     Startup, middleware, routes, shutdown
src/
  App.tsx, main.tsx           Browser entrypoint and navigation
  components/                Dashboard, Jobs, rules, settings, accounts, UI checks
  context/AppContext.tsx     Session, catalog, jobs, notifications
  hooks/                     Data-loading and mutation hooks
  server/
    auth.ts                  Accounts, sessions, origin checks, permissions
    catalog.ts               Catalog and job-definition routes
    scraper.ts               Temporary standalone URL preview route
    database.ts              Schema setup and shared write transactions
    provider.ts              QA dispatch, settings and connectivity routes
    jobRunner.ts             Durable runs and worker
  db/                        Pool, Drizzle schema, shared configuration
  lib/                       QA prompts/results, scraping, requests, exports
scripts/                     Bootstrap and development/public-access checks
docs/                        Review and operational/historical runbooks
Dockerfile                   Development, build, production stages
compose.yaml                 One app container; external PostgreSQL
```

Build output is `dist/public` for frontend assets, `dist/server.mjs` for Express, and `dist/bootstrap-admin.mjs` for administrator setup, plus `dist/migrate-workspaces.mjs` for the explicit workspace migration. The server bundle is outside the public directory. Frontend/API use one origin.

## API reference

Except `/healthz` and login, these routes require an application session. Login also requires a valid mutation origin. Protected APIs use `Cache-Control: no-store`. Production mutations need `Origin` matching `APP_ORIGIN`; command-line clients must supply it and the cookie.

| Route | Methods | Purpose/input |
| --- | --- | --- |
| `/healthz` | GET | Public schema readiness: `{ "status": "ready" }` or 503 |
| `/api/auth/login` | POST | `{ username, password }`; sets cookie |
| `/api/auth/me` | GET | Current account |
| `/api/auth/logout` | POST | Revoke current session |
| `/api/users` | GET, POST | Admin list/create; username/password/role |
| `/api/users/:id` | PUT, DELETE | Admin account changes/removal |
| `/api/db-status` | GET | Authenticated schema readiness |
| `/api/catalog` | GET, POST, DELETE | Full list; import array; delete `{ skus }` or `{ all: true }` |
| `/api/catalog/:sku` | PUT | Edit evidence with `expectedRevision`; QA fields are server-controlled |
| `/api/data` | DELETE | Admin clear jobs/catalog |
| `/api/jobs` | GET, POST, DELETE | Full list with `jobType` and server-derived `attributeSets`; create one/array with optional `jobType: "qa" \| "catalog"` (default `qa`); delete `{ ids }` or `{ all: true }` |
| `/api/jobs/:id/outputs` | GET | Authenticated Catalog-only prepared templates and shipping data; large file snapshots are excluded from job-list responses |
| `/api/jobs/:id` | PUT, DELETE | Edit name/SKUs/category while idle; job type is immutable; admin deletion |
| `/api/jobs/:id/runs` | GET, POST | History; queue `{ requestId, mode, sku? }` |
| `/api/job-runs/:id` | GET | Metadata and all item snapshots/results |
| `/api/job-runs/:id/cancel` | POST | Creator/admin cancellation |
| `/api/job-runs/:id/items/:sku/images` | PUT | Save ordered `{ selectedImageUrls, expectedSelectedImageUrls }` from a finished Catalog run; stale choices return 409 |
| `/api/job-runs/:id/items/:sku/images/:index` | GET | Download a public raster image present in that run SKU's Markdown |
| `/api/qa-configuration` | GET | Consistent snapshot of memory/rules and attribute-set `catalogHeaders` |
| `/api/qa-agent-memory` | PUT | Admin `{ qaAgentMemory }` |
| `/api/attribute-sets` | POST | Admin `{ name, rulesMarkdown, catalogHeaders? }`; omitted headers default to `[]` |
| `/api/attribute-sets/:id` | PUT, DELETE | Admin rule/header changes or removal; omitted headers on update preserve the saved list |
| `/api/attribute-sets/import` | POST | Admin rule array; preserve nonblank existing rules |
| `/api/provider-settings` | GET, PUT | Shared editable settings; admin write |
| `/api/chat` | POST | Admin test; optional `modelName`, `purpose` |
| `/api/catalog/:sku/scrape` | POST | `{ expectedRevision }` → saved SKU row; server uses saved URL |
| `/api/scrape/preview` | POST | `{ url }` → temporary collected/partial Markdown, URLs, capture time and diagnostics; no SKU required |

`/api/chat` tests QA connectivity with optional `modelName` and `purpose: "qa"`. Navigation purposes, `/api/scrape`, and personal scraper-settings routes are retired.

Example run body:

```json
{
  "requestId": "a3d41183-83d6-45f0-a1ef-1fd5a57f7ac9",
  "mode": "single",
  "sku": "000123"
}
```

Generate a fresh request ID for new work; retain it when retrying an uncertain start. Omit `sku` for `unfinished`/`all`.

Common responses: `400` invalid input, `401` expired/missing session, `403` origin/role rejection, `409` conflict, `413` size limit, `429` admission/rate limit, `5xx` database/provider unavailable. Upstream bad keys are mapped away from application `401` so they do not sign users out.

## Tests and developer commands

### Fast suite and build

```bash
npm test
npm run build
```

The fast suite covers TypeScript, auth origins, provider limits/retries, catalog import/result trust, job state/exports, transaction recovery, response parsing, settings/QA contracts, and scraping contracts. Provider responses are mocked; no API credits are spent.

`lint` is **`tsc --noEmit`**, not ESLint. Strict TypeScript is not enabled. `npm test` excludes database and browser suites. Run the browser/database suites and the [production smoke check](docs/browser-scraper.md#verify-before-rollout) separately.

### Database checks

Create a dedicated test database first and use a connection that can create/drop schemas. Tests isolate their own schema and remove it, but must not point to production:

```bash
export TEST_DATABASE_URL='postgresql://postgres:postgres@localhost:5432/paxth_qa_test'
npm run test:security-db
npm run test:qa-config-db
unset TEST_DATABASE_URL
```

The security suite covers auth, transactions, retired-column preservation, durable jobs, recovery, cancellation, failure injection, legacy QA reruns, and historical result trust. The configuration suite covers shared rules/instructions and conflicts.

### Browser checks

```bash
npm run setup:browser
# Linux may also need Chromium system libraries:
npx playwright-core install-deps chromium
npm run test:sap-editor
```

The historically named browser script also checks QA settings, SKU-connected Markdown, cancellation, run-start feedback, and unverified history display/export exclusion. APIs are mocked; it does not establish real persistence or provider behavior. OS dependency installation may require administrator privileges.

### Command reference

| Command | Purpose |
| --- | --- |
| `npm run dev` | Watch Express and serve development frontend |
| `./start.sh` | Linux launcher with checkout-aware listener restart |
| `npm run build` | Frontend plus server/bootstrap bundles |
| `NODE_ENV=production npm start` | Built production server |
| `npm run preview` | Frontend-only Vite preview; no Express API |
| `npm run clean` | Remove local `dist` |
| `npm run lint` | TypeScript under current compiler options |
| `npm test` | Fast suite |
| `npm run test:auth` | Origin/auth boundaries |
| `npm run test:provider` | Provider admission/retries |
| `npm run test:catalog` | Import trust boundary and canonical result/history projections |
| `npm run test:catalog-generation` | Catalog headers, copied cells, model validation, independent results, regional shipping, grouping, and exact workbook exports |
| `npm run test:catalog-browser` | QA/Catalog switch, text-preserving CSV/XLSX imports, job controls, warnings, and upload exports |
| `npm run test:catalog-images` | Markdown images, padding, filenames, saved order, conflicts, safe retrieval and source limits |
| `npm run test:catalog-images-browser` | Image picker, saved selections, all-SKU ZIP, actual pixel dimensions, padding and failures |
| `npm run test:job-state` | Job state and Excel feedback |
| `npm run test:job-runner` | Transaction retries/rollback |
| `npm run test:llm-response` | Parsing/output budgets |
| `npm run test:qa-agent` | Settings and QA contracts |
| `npm run test:scraper` | Cloud authentication, URL/DNS restrictions, queue, deadlines, cleanup/retries, cancellation, SKU requests and preview contracts |
| `npm run test:scrape-production` | Production-bundle preview, SKU persistence, URL-only jobs, compatibility and login with both providers mocked |
| `npm run test:scrape-live` | Paid cloud/GLM check with raw/cleaned Markdown comparison; optional case-name filter |
| `npm run test:security-db` | Disposable-database auth/jobs |
| `npm run test:qa-config-db` | Disposable-database configuration |
| `npm run test:sap-editor` | Mocked browser checks |
| `npm run admin:bootstrap` | First admin/restricted legacy recovery |
| `npm run db:generate` | Generate Drizzle migrations for review |
| `npm run db:push` | Direct schema application; avoid blind production use |
| `npm run db:studio` | Local DB inspection UI |

### Validation on 6 October 2026

The QA integrity follow-up passed `npm test`, `npm run build`, `test:security-db`, `test:qa-config-db`, and `test:sap-editor` on Node 22.23.3. The frontend JS bundle was approximately **1.78 MB minified / 533 KB gzip**, with Vite's existing large-chunk warning.

The database suites used an isolated local PostgreSQL 15 instance and disposable schemas. Browser checks used mocked APIs, cached Chromium, and temporary Linux libraries/font configuration. These supplied the environment missing during the initial review. No production database or paid provider was used. Docker execution, the target host, and live provider behavior remain unverified. See the review for the original audit counts and strict-mode diagnostics.

## Production deployment

The [secondary VPS CI/CD guide](docs/ci-cd.md) describes the supported automated setup. The native and Docker instructions below remain alternatives for other installations.

### Release decision

Build artifacts and container configuration exist, but a successful build is not production approval. The QA import/result trust issue is fixed in this source. Resolve the review's remaining credential and dependency findings, then verify the intended database, HTTPS gateway, and provider contracts before unrestricted access.

The checked-in workflow runs core, disposable-database and browser checks before deploying `main` to the secondary VPS app. Automatic delivery requires the owner-configured environment and SSH credentials described in the [CI/CD guide](docs/ci-cd.md). A workflow file alone does not enforce branch protection.

### Without Docker

```bash
npm ci
npm test
npm run build
NODE_ENV=production npm start
```

Configure the database, production origin, and provider credentials first. `npm start` alone does not set production mode. Use a dedicated OS user, process supervisor, and HTTPS gateway. Native service units and proxy configuration are not included.

The compiled bootstrap command is `node dist/bootstrap-admin.mjs`; supply temporary explicit credentials as in local setup.

### Docker Compose

The supplied configuration uses one app container, a non-root Node process, init, restart policy, rotating logs, readiness checks, one CPU, and 1,536 MiB memory. Host port `127.0.0.1:3200` maps to container `3000`.

Set the real HTTPS `APP_ORIGIN`. PostgreSQL must be reachable **inside the container**; container `localhost` is not the host database.

After resolving release blockers and rehearsing schema changes:

```bash
docker compose build app
```

For a new installation, bootstrap with temporary exported credentials:

```bash
read -r -p 'Administrator username: ' BOOTSTRAP_ADMIN_USERNAME
read -r -s -p 'Administrator password: ' BOOTSTRAP_ADMIN_PASSWORD
echo
export BOOTSTRAP_ADMIN_USERNAME BOOTSTRAP_ADMIN_PASSWORD
docker compose run --rm --no-deps \
  -e BOOTSTRAP_ADMIN_USERNAME -e BOOTSTRAP_ADMIN_PASSWORD \
  app node dist/bootstrap-admin.mjs
unset BOOTSTRAP_ADMIN_USERNAME BOOTSTRAP_ADMIN_PASSWORD
```

Start and inspect:

```bash
docker compose up -d --no-build app
docker compose ps
docker compose logs --tail=50 app
curl -fsS http://127.0.0.1:3200/healthz
```

Route the public HTTPS gateway to the private listener. A separate Basic authentication gate can be an additional barrier; its configuration is host-specific and absent here. Docker health failures mark the container unhealthy; the restart policy does not automatically restart a still-running unhealthy container.

Several build tools are currently classified as production dependencies. Production retrieval uses native fetch with Crawl4AI cloud and the shared model provider; npm Playwright is used only for UI tests.

### Updates and rollback

1. Choose the exact tested commit and retain the prior image/release.
2. Finish or cancel active jobs and verify they stopped.
3. Back up data outside the source tree; restore into a separate database to verify the backup.
4. Rehearse startup schema changes against that restored copy. Builds do not exercise initialization.
5. Build a new release without replacing production `.env` or gateway configuration.
6. Smoke-test it with an appropriate test database before promotion.
7. Promote; verify readiness, HTTPS login, permissions, catalog/rules, evidence edits, a representative QA run, export, and restart recovery.
8. Record the deployed commit and retain a compatible rollback release.

For the QA integrity fix, reload browser clients after promotion so they use the new result readers. Before restoring normal access, confirm that a forged nested-QA import is rejected without partial saves, a normal import succeeds, an `unfinished` run selects an unverified legacy row, and a genuine saved review exports correctly. Keep the database backup and previous release. Legacy reruns require an explicit operator action; the release does not schedule them automatically.

For URL testing, release the server and frontend assets together, then reload clients. This upgrade has no schema migration. Verify collected/partial previews with an empty catalog, diagnostics/downloads, cancellation, and a SKU partial failure that preserves prior evidence before checking saved evidence → QA → export.

With the supplied Docker naming, retain the old image **before** rebuilding:

```bash
docker image tag paxth-qa:local paxth-qa:previous
```

After testing the replacement:

```bash
docker compose up -d --no-build --no-deps --force-recreate app
```

If the previous image remains compatible with the current schema:

```bash
docker image tag paxth-qa:previous paxth-qa:local
docker compose up -d --no-build --no-deps --force-recreate app
```

This rolls back the image, not schema/configuration/data. Do not automatically restore an old database over newer data. A future native installation needs its own tested service and release rollback procedure.

If a future installation adds a Basic-auth gateway, temporarily supply `QA_USERNAME`, `QA_PASSWORD`, `APP_USERNAME`, and `APP_PASSWORD`, then run the public verification script with that installation's explicit HTTPS URL:

```bash
node scripts/verify-public-access.mjs https://your-real-qa-hostname/
```

It checks wrong/missing gateway credentials, application-session requirements, and protected catalog access. It assumes that gateway and is not a generic production probe.

## Scaling limits

The design fits a modest shared internal tool. There is no measured capacity guarantee. Growth first increases latency, queue wait, bandwidth, and memory; adding replicas does not remove every limit.

| Growth | Limit | Consequence |
| --- | --- | --- |
| More catalog/evidence | Full catalog responses and browser rendering | Larger payloads and memory pressure |
| More jobs/viewers | Each Jobs screen polls histories; terminal details are cached and catalog refresh follows progress changes | Traffic grows with viewers × jobs |
| More QA work | Four active workspaces, one job and SKU at a time per workspace | Queue backlog and delays behind large jobs |
| Large imports/run starts | Sequential inserts under a shared mutation lock | Unrelated writes wait; database latency compounds |
| More replicas | Shared worker lock, process-local admission | One scheduler leader; process-local request limits multiply across HTTP replicas |
| More history | Repeated snapshots/results/rules, no retention | Growing storage and progress payloads |
| More sign-ins | Process-local failed/pending-attempt caps | Shared proxies can still concentrate traffic |
| More scraping | One active browser, eight waiting requests | Queue overflow and the VPS resource limit |

Illustration: at 45 seconds per SKU, each workspace needs about **38 minutes for 50 QA SKUs**, before scraping, retries and queued work. Four such workspaces can overlap. This is arithmetic, not a benchmark. Measure average/p95 service times and arrival rate before committing to capacity.

Start with paginated summary APIs, relevant progress polling, bulk/bounded writes, run indexes, and history retention. Use shared admission when adding replicas. Increase the current four-workspace limit only after measuring provider quotas, database load and recovery behavior. These changes do not require a microservices rewrite.

## Troubleshooting

| Symptom | Check/next step |
| --- | --- |
| Startup exits | Database reachability/schema conflicts; production `APP_ORIGIN` |
| Production login does not persist | HTTPS and exact origin; Secure cookies do not work through plain HTTP browser access |
| Mutation returns 403 | Origin, role, proxy behavior |
| Correct login returns 429 | Global attempt cap or two active password hashes |
| Provider missing | Assigned numbered key slot and account assignment; restart after env changes |
| Model fails while readiness passes | Model availability, credentials, quota, supported payload |
| Model connection fails with a hostname/error code | Server DNS, TLS, or outbound connectivity to that hostname; the AI Credits default uses `https://aicredits.in/v1` |
| Scrape fails | Check both cloud/model keys and credits, saved URL, blocked/login page, rate limit or timeout; inspect scrape error or use SAP/manual evidence |
| SKU cannot create a job | Supply SAP, usable saved Markdown, or a URL, and use one nonblank category |
| Job waits in queue | Worker, older jobs, session-pooler mode, database/provider latency |
| Queued cancellation waits | Worker must reach it after older work |
| Run fails after restart | Original deadline/attempt budget may be exhausted; inspect history |
| QA needs rerun after evidence edit | Current reviews are revision-bound; old results remain in job history |
| Duplicate upload changes nothing | Imports skip existing SKUs; use supported edits |
| Combined export rejected | One identical category and compatible original headers |
| Summary counters wrong | Obsolete issue types; inspect Jobs findings |
| Browser tests fail before assertions | Install Chromium OS libraries and inspect launch error |
| Codespaces app shows older code | Check the branch, development-server output, and browser reload |
| Settings vanish after refresh | Save errors/database reachability; notifications are temporary |

## Further documentation

- [IDQ catalog enrichment](docs/idq.md): input modes, attribute requirements, traceable Excel output, durable research limits and verification.
- [Agency Agents setup](docs/agency-agents.md): seven project review agents, pinned provenance, usage and integrity verification.
- [Agency review — 15 October 2026](docs/agency-review-2026-10-15.md): current security, architecture, UI and deployment findings, validation evidence and prioritized recommendations.
- [Codebase review](docs/codebase-review.md): ratings, defects, scaling analysis, prioritized work, and actual validation limits.
- [Security and durable jobs](docs/security-and-jobs.md): implementation details and historical validation; older sections include retired retrieval designs.

There is no root `LICENSE` file. Individual source headers do not establish repository-wide licensing; confirm intended licensing before distribution.
