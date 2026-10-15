# IDQ catalog enrichment

IDQ is an export-only module. It stores batches and item checkpoints in `idq_jobs` and `idq_items`; it never writes into the QA/Catalog SKU table or existing Catalog jobs. Startup creates the tables and adds `attribute_sets.catalog_header_requirements` safely to existing databases.

## Use

1. In **Attribute Sets → Catalog Output Headers**, configure the exact headers and classify each as **Mandatory** or **Optional**. Existing sets start unclassified; QA and Catalog continue working. Only administrators can edit configuration.
2. Open **IDQ** and choose **URL list** or **Already-scraped catalog** before uploading. Download templates for the relevant sets. Each row needs `attributes__url` and `attributes__attribute_set`; the latter contains the saved set name.
3. Upload an Excel workbook with at most 50 product rows. Multiple input worksheets and attribute sets are supported. Keep identifiers as Excel text (formatted leading zeros are retained). Extra columns, commercial terms and supplied values are preserved. `image_url` is the image column.
4. Start the batch. The screen shows progress, research counters and history. The batch owner or an administrator can cancel or resume unfinished work. Any authenticated user can view/export shared batches, following the existing access model.
5. Download the workbook, including partial/cancelled products. Each set has a worksheet, with configured headers followed by extra input columns. The Review worksheet lists matching issues, conflicts, missing mandatory fields and errors. Green cells are added values; amber cells have conflicts; red cells are missing mandatory values. Source details appear in cell comments.

URL mode retrieves the original product page once, retains its evidence, maps its title/description/bullets/specifications to the configured headers and selects the first image of the identified main gallery. Navigation, recommendation and banner images are excluded where identifiable. Already-scraped mode uses uploaded values and checks the supplied image URL without retrieving the original product page; unavailable images are flagged.

## Research boundaries

IDQ uses the current server model/provider settings and `CRAWL4AI_API_KEY`. It calls Crawl4AI's documented [search and scrape APIs](https://api.crawl4ai.com/docs/), including readable PDF URLs. Credentials stay on the server and are absent from job snapshots.

Each product gets four search attempts and six research-page attempts, plus its initial URL-mode capture. A fixed ten-minute deadline reserves the last 90 seconds for extraction. Final extraction runs even when research fails, preserving available input/capture data. Failed/interrupted research attempts consume their limits. Model requests have at most two recorded attempts per stage. Resume/restart keeps the original deadline and counters; it cannot extend a product's research budget.

The agent seeks manufacturer pages/documents before verified retailers, using the input's product, variant, market and language. A server-generated source ID, matching retrieved quote and product-specific match evidence are required for research additions. Search snippets and model-supplied URLs do not establish facts. Local SKU/base codes are never invented. Known variant markers must match; uncertain variant-dependent gaps stay empty. Another store's price, stock and delivery terms cannot populate the original listing. Existing values are never replaced.

Complete captures, search/read attempts, tool messages and paid model responses are checkpointed. A dedicated database advisory lock fences the worker. Checkpoint saves retry without making another model/retrieval request. A crash between dispatch and saving a response can lose that in-flight response; the recorded attempt remains consumed. Completed captures and items are reused. Cancellation saves completed evidence and results.

Source availability and model matching determine coverage. Very long pages use excerpts within the existing page-content setting; supported details can still be missed. Dynamic specifications that Crawl4AI cannot expose are flagged rather than inferred. Excel comments/review findings obey Excel's text-length limit; complete retrieved evidence stays in job storage. Review the workbook before publishing catalog changes.

## Verification

- `npm test`: includes IDQ validation, modes, source grounding, wrong variants, conflicting sources, first-image choice, blocked pages, deadlines, cancellation/restart, preserved text and Excel comments.
- `TEST_DATABASE_URL=... npm run test:idq-db`: uses an isolated test schema for authenticated API, snapshots, storage isolation, durable worker restart, cancel/resume, template/export and ownership checks.
- `TEST_DATABASE_URL=... npm run test:qa-config-db` and `npm run test:security-db`: existing configuration and security regressions (the latter also requires TEST_DATABASE_URL).
- `npm run test:idq-browser`: mode-first upload, validation, templates, progress, cancel/resume, history, downloads and requirement editing. Uses installed Playwright Chromium; set `CHROMIUM_EXECUTABLE` if necessary.
- `npm run test:idq-live -- https://public-product-detail-url`: explicitly runs one product in both modes with current credentials and writes checkpoint JSON/workbooks under `.cache/idq-pilot`. This makes paid provider/Crawl4AI requests and does not modify catalog data.

A live pilot was run with `z-ai/glm-5.3-flash` and the existing Crawl4AI key against an HONOR product in both modes. Search and page-reading worked. The original spec page exposed headings without spec values; a product-navigation image was rejected. Saved evidence was reused to verify final extraction after improving excerpt selection; Already-scraped mode added a manufacturer-supported description with a source comment and green fill. Unknown color/storage variants stayed blank. A full 50-product live batch has not been run.
