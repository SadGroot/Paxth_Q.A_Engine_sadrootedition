# WarrantySet: sample-format mapping rules

No matching workbook is available. These are the existing reviewed application headers or the minimum application contract; no sample-derived format is claimed.

Learn formatting only. Obtain actual facts from SAP first, then other verified evidence where the existing workflow permits. Existing supplied values and missing-value handling remain governed by the application. Sample identities, claims, quantities, and classifications are never defaults or allowed-value lists. Placeholder examples show shape only and must never be emitted literally.

Keep the exact headers and their order. The six application pass-through fields are sku, base_code, attributes__lulu_ean, attributes__shipping_weight, attributes__brand, and attributes__lulu_product_type. Name may be generated only when missing. No required/optional classifications or IDQ flags are inferred. Blank samples establish neither optionality nor absence; fallback advice is explicitly labeled. Units/spacing are specific to this template; a single sample does not establish fixed precision. Qualifiers such as Up to and Approx. apply only when current source facts support them.

### Source annotations and unresolved metadata

No populated lower-row annotations are supplied. Sample content does not establish mandatory fields.

Reviewed source/header corrections: No source schema is available: use the six application pass-through columns plus name, without invented category-specific columns.

No trustworthy sample product rows are available (missing-workbook). Every per-field filling suggestion is an explicitly labeled semantic fallback, not learned formatting. Preserve existing configured rules and original supplied data under the application workflow.

## sku

Application pass-through: preserve the supplied SAP sku as exact identifier text, including meaningful punctuation and leading zeroes. Do not generate or copy sample identifiers. Sample cell is blank or no trustworthy sample is available: no sample format evidence. Preserve the supplied application value or existing blank.

## base_code

Application pass-through: preserve the supplied SAP base code as exact identifier text, including meaningful punctuation and leading zeroes. Do not generate or copy sample identifiers. Sample cell is blank or no trustworthy sample is available: no sample format evidence. Preserve the supplied application value or existing blank.

## attributes__lulu_ean

Application pass-through: preserve the supplied SAP lulu ean as exact identifier text, including meaningful punctuation and leading zeroes. Do not generate or copy sample identifiers. Sample cell is blank or no trustworthy sample is available: no sample format evidence. Preserve the supplied application value or existing blank.

## attributes__shipping_weight

Application pass-through: preserve the supplied SAP shipping-weight value and its established application unit. Do not derive it from product weight or copy a sample weight. Sample cell is blank or no trustworthy sample is available: no sample format evidence. Preserve the supplied application value or existing blank.

## attributes__brand

Application pass-through: preserve the supplied SAP brand exactly; sample brand names are never defaults. Sample cell is blank or no trustworthy sample is available: no sample format evidence. Preserve the supplied application value or existing blank.

## attributes__lulu_product_type

Application pass-through: preserve the supplied SAP product type under this exact canonical key. Do not add a legacy attributes__product_type alias. Sample cell is blank or no trustworthy sample is available: no sample format evidence. Preserve the supplied application value or existing blank.

## name

No sample format evidence: no trustworthy sample product row is available. Semantic fallback only: Preserve an existing supplied name. Generate a clear factual plain-text name only when missing and requested, using verified current-product identity; no delimiter or title recipe is learned.
