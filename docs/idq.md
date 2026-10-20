# IDQ product research and catalog upload

IDQ stores batches and item checkpoints in `idq_jobs` and `idq_items`. It identifies products from uploaded catalog content, researches them with TinyFish, applies saved attribute-set mapping rules and compares the resulting upload rows against SAP. Downloads do not write into the QA/Catalog SKU table or existing Catalog jobs.

## Use

1. Use the existing **Attribute Sets → Mapping Rules** and **Catalog Output Headers**. Optional Mandatory/Optional classifications are honoured when present; unclassified headers follow the saved mapping rules. IDQ reports unmet mapping requirements instead of requiring a second manual classification step. Only administrators can edit configuration.
2. Open **IDQ** and upload the existing Excel export. Each row needs `sku`, a saved attribute set name in `attributes__attribute_set`, `attribute_set` or `attribute set`, and product information such as title, bullets and specification values. URLs are optional. Paste all SAP data for the SKU into one `source__sap` cell (`attributes__sap` is also supported). Download input templates for the relevant sets if needed.
3. Upload an Excel workbook with at most 50 product rows. Multiple input worksheets and attribute sets are supported. Keep identifiers as Excel text (formatted leading zeros are retained). Extra columns, commercial terms and supplied values are preserved. `image_url` is the image column.
4. Start the batch. The screen shows progress, research counters and history. The batch owner or an administrator can cancel or resume unfinished work. Any authenticated user can view/export shared batches, following the existing access model.
5. Download the review workbook, including partial/cancelled products. Each set has a worksheet with configured headers, extra input columns, original SAP text and `idq_mismatches`. The Review worksheet lists matching issues, conflicts, missing mandatory fields and errors. Green cells are added values; amber cells have mismatches; red cells are missing mandatory values. Source details and SAP excerpts appear in cell comments.
6. Download upload templates when verified rows are ready. Each attribute set gets a worksheet with exactly its configured headers, in order. Mismatch colours and comments remain on the affected cells. Unresolved product identity, conflicting web sources, failed mapping/SAP comparison and missing mandatory fields prevent a row from entering this download.

AI identifies the product from uploaded title, bullets, specifications and identifiers. SAP is a comparison reference, not an identity override. A supported model, GTIN/MPN or distinctive brand/product name and known variant markers form the initial search. TinyFish Search discovers pages and Fetch retrieves readable evidence. Search snippets cannot establish facts. Manufacturer documents are preferred before public retailers. Verified web values take precedence over uploaded and SAP facts; original SAP text, SKU/base codes and internal identifiers remain unchanged. Another retailer cannot set the original listing's commercial terms.

The model then applies the saved mapping to supported text fields while factual values and internal identifiers are retained. A final comparison checks the generated upload row against SAP, including contradictions embedded in titles, descriptions and bullets. Equivalent supported unit conversions are not mismatches. Old URL and already-scraped batch snapshots remain readable and retain their Crawl4AI execution behaviour.

## Research boundaries

New IDQ batches use the workspace's current model/provider settings and server-only `TINYFISH_API_KEY`, using TinyFish's documented [Search](https://docs.tinyfish.ai/search-api/reference) and [Fetch](https://docs.tinyfish.ai/fetch-api/reference) APIs. Credentials are absent from job snapshots. Crawl4AI remains in use for the existing QA/Catalog scraper and legacy IDQ batches.

Each product gets four search attempts and six research-page attempts, plus its initial URL-mode capture. A fixed ten-minute deadline reserves the last 90 seconds for extraction. Final extraction runs even when research fails, preserving available input/capture data. Failed/interrupted research attempts consume their limits. Model requests have at most two recorded attempts per stage. Resume/restart keeps the original deadline and counters; it cannot extend a product's research budget.

The agent uses the input's product, variant, market and language. A server-generated source ID, matching retrieved quote and product-specific match evidence are required for research values. Model-supplied URLs do not establish facts. Known variant markers must match; uncertain variant-dependent gaps stay empty. Conflicting web values retain the uploaded value for review and prevent an upload-ready result.

Complete captures, search/read attempts, tool messages and paid model responses are checkpointed. A dedicated database advisory lock fences the worker. Checkpoint saves retry without making another model/retrieval request. A crash between dispatch and saving a response can lose that in-flight response; the recorded attempt remains consumed. Completed captures and items are reused. Cancellation saves completed evidence and results.

Source availability and model matching determine coverage. Very long pages use excerpts within the existing page-content setting; supported details can still be missed. Dynamic specifications that Crawl4AI cannot expose are flagged rather than inferred. Excel comments/review findings obey Excel's text-length limit; complete retrieved evidence stays in job storage. Review the workbook before publishing catalog changes.

## Verification

- `npm test`: includes URL-free IDQ validation, TinyFish API contracts, source grounding, SAP comparison, mapped rows, wrong variants, conflicting sources, blocked pages, deadlines, cancellation/restart, preserved identifiers and Excel comments/colours. Legacy IDQ modes remain covered.
- `TEST_DATABASE_URL=... npm run test:idq-db`: uses an isolated test schema for authenticated API, snapshots, storage isolation, durable worker restart, cancel/resume, template/export and ownership checks.
- `TEST_DATABASE_URL=... npm run test:qa-config-db` and `npm run test:security-db`: existing configuration and security regressions (the latter also requires TEST_DATABASE_URL).
- `npm run test:idq-browser`: direct URL-free upload, validation, templates, progress, cancel/resume, history, review/upload downloads and requirement editing. Uses installed Playwright Chromium; set `CHROMIUM_EXECUTABLE` if necessary.
- `npm run test:idq-live -- https://public-product-detail-url`: legacy Crawl4AI pilot for old batch modes. It is not an end-to-end TinyFish validation.

The previously recorded HONOR/Crawl4AI pilot applies to the legacy modes. A full 50-product live TinyFish batch has not been run. Dynamic controls that Fetch does not expose remain a source-coverage limit; add bounded TinyFish Agent retrieval when a real product fixture demonstrates that need.
