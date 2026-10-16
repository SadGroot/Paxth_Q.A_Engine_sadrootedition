# QA response-format fix: live verification

Verified on 16 October 2026 using the approved laptop SKU 2757383 and its existing SAP evidence. Application SKU and job records were read only; execution and persistence used a disposable local PostgreSQL database. No additional product-page evidence was collected.

## Provider result

- Model: `deepseek/deepseek-v4.1-flash` through the configured AI Credits provider.
- Saved settings: medium reasoning, temperature 0.1, maximum output 32,768 tokens.
- Attempt 1: HTTP 500 at medium reasoning.
- Attempt 2: existing fallback with reasoning off; completed with `finish_reason: stop`.
- Two model calls were used. The successful response reported 6,311 prompt tokens and 1,904 completion tokens.

## Verified behavior

- No QA schema or enum validation error.
- Execution completed without an error; the QA verdict was `fail`, with 12 findings.
- The canonical result persisted to the disposable SKU record.
- Original source data and template cells remained unchanged.
- Excel export round-tripped successfully with the saved QA verdict.
- Disposable run tables were removed after verification.

## Accuracy limitations observed

The model's summary described box contents, accessories, model year, and country of origin as missing source-supported values, although the supplied SAP text contains none of these facts. Two bullet-position explanations also misdescribe the original positions, although the proposed ordering follows the category rule.

Therefore, this replay verifies the response-format fix, persistence, and export. It does not certify every model finding or correction as factually correct. Successful output at medium reasoning remains unverified because that request returned HTTP 500.

The full fast suite, production build, dashboard/jobs and Catalog browser checks, and disposable-database configuration, security/jobs, and IDQ checks passed before this replay.
