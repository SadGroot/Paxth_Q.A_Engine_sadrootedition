# H&L-C&D-Cookware: sample-format mapping rules

Source: `OneDrive_2_10-15-2026/H&L-C&D-Cookware.xls`, sheet `Sheet1`. Catalog headers: row 2, in the reviewed manifest order. Sample product rows: 3. Grouping labels and lower-row metadata are excluded from the output headers; reviewed corrections are listed below.

Learn formatting only. Obtain actual facts from SAP first, then other verified evidence where the existing workflow permits. Existing supplied values and missing-value handling remain governed by the application. Sample identities, claims, quantities, and classifications are never defaults or allowed-value lists. Placeholder examples show shape only and must never be emitted literally.

Keep the exact headers and their order. The six application pass-through fields are sku, base_code, attributes__lulu_ean, attributes__shipping_weight, attributes__brand, and attributes__lulu_product_type. Name may be generated only when missing. No required/optional classifications or IDQ flags are inferred. Blank samples establish neither optionality nor absence; fallback advice is explicitly labeled. Units/spacing are specific to this template; a single sample does not establish fixed precision. Qualifiers such as Up to and Approx. apply only when current source facts support them.

### Source annotations and unresolved metadata

No populated lower-row annotations are supplied. Sample content does not establish mandatory fields.

Reviewed source/header corrections: Selected Sheet1; other sheets are vertical header notes, not product tables.

## sku

Application pass-through: preserve the supplied SAP sku as exact identifier text, including meaningful punctuation and leading zeroes. Do not generate or copy sample identifiers. Sample cell is blank or no trustworthy sample is available: no sample format evidence. Preserve the supplied application value or existing blank.

## base_code

Application pass-through: preserve the supplied SAP base code as exact identifier text, including meaningful punctuation and leading zeroes. Do not generate or copy sample identifiers. Sample cell is blank or no trustworthy sample is available: no sample format evidence. Preserve the supplied application value or existing blank.

## attributes__lulu_ean

Application pass-through: preserve the supplied SAP lulu ean as exact identifier text, including meaningful punctuation and leading zeroes. Do not generate or copy sample identifiers. Sample cell is blank or no trustworthy sample is available: no sample format evidence. Preserve the supplied application value or existing blank.

## attributes__shipping_weight

Application pass-through: preserve the supplied SAP shipping-weight value and its established application unit. Do not derive it from product weight or copy a sample weight. Sample cell is blank or no trustworthy sample is available: no sample format evidence. Preserve the supplied application value or existing blank.

## name

Sample cell is blank: no sample format evidence. Semantic fallback only: Preserve an existing supplied name. Generate a clear factual plain-text name only when missing and requested, using verified current-product identity; no delimiter or title recipe is learned.

## attributes__product_title

Sample cell is blank: no sample format evidence. Semantic fallback only: When requested, write a concise factual plain-text product title from verified identity and specifications; no ordering, delimiter, or category-specific measurement style is learned.

## attributes__bullet_point_1

Sample cell is blank: no sample format evidence. Semantic fallback only: If a supported distinct benefit is available and generation is requested, write concise plain text without a list marker; the blank does not require inventing a sixth claim.

## attributes__bullet_point_2

Sample cell is blank: no sample format evidence. Semantic fallback only: If a supported distinct benefit is available and generation is requested, write concise plain text without a list marker; the blank does not require inventing a sixth claim.

## attributes__bullet_point_3

Sample cell is blank: no sample format evidence. Semantic fallback only: If a supported distinct benefit is available and generation is requested, write concise plain text without a list marker; the blank does not require inventing a sixth claim.

## attributes__bullet_point_4

Sample cell is blank: no sample format evidence. Semantic fallback only: If a supported distinct benefit is available and generation is requested, write concise plain text without a list marker; the blank does not require inventing a sixth claim.

## attributes__bullet_point_5

Sample cell is blank: no sample format evidence. Semantic fallback only: If a supported distinct benefit is available and generation is requested, write concise plain text without a list marker; the blank does not require inventing a sixth claim.

## attributes__bullet_point_6

Sample cell is blank: no sample format evidence. Semantic fallback only: If a supported distinct benefit is available and generation is requested, write concise plain text without a list marker; the blank does not require inventing a sixth claim.

## attributes__product_description

Sample cell is blank: no sample format evidence. Semantic fallback only: If description generation is requested, write useful factual plain text from current evidence; no length, paragraph count, or HTML format is established.

## attributes__keywords

Sample cell is blank: no sample format evidence. Semantic fallback only: Use relevant search terms/phrases from current verified facts; no delimiter, spacing, or case convention is established by a sample.

## attributes__brand

Application pass-through: preserve the supplied SAP brand exactly; sample brand names are never defaults. Sample cell is blank or no trustworthy sample is available: no sample format evidence. Preserve the supplied application value or existing blank.

## attributes__lulu_product_type

Application pass-through: preserve the supplied SAP product type under this exact canonical key. Do not add a legacy attributes__product_type alias. Sample cell is blank or no trustworthy sample is available: no sample format evidence. Preserve the supplied application value or existing blank.

## attributes__model

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified model identifier as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__color

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified marketed color as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__no_of_pieces

Use the verified piece count in the observed shape `{n} pcs`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__package_contents

Use verified supplied items with quantities in the observed shape `{count} x {item}`; separate multiple entries with a comma and one space. Preserve the quantity separator and spacing; include only verified contents.

## attributes__pack

Use verified pack composition in the observed shape `{pack count} pack, set of {pieces per set}`. Preserve comma presence/absence and spacing; keep pack counts distinct from total piece counts.

## attributes__product_dimensions

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified axis labels/order and original measurement units; no axis order or delimiter is established by this sample.

## attributes__package_dimensions

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified package dimensions with their actual axis meanings and units; do not reuse product measurements.

## attributes__weight

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified product weight with its source unit; do not infer it from shipping weight.

## attributes__material

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified material or composition as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__inner_material

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified inner/lining material as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__outer_material

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified outer material as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__coating

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified surface coating as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__shape

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified shape as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__size

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified stated product size as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__capacity

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified function-specific capacity as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__features

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified product features as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__dishwasher_safe

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified dishwasher suitability as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__microwave_safe

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified microwave suitability as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__induction_base

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified induction-base construction/suitability as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__surface_recommendation

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified suitable surfaces as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__suitable_heat_sources

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified supported fuel/heat sources as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__handle_type

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified handle type as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__other_information

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified additional relevant product information as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__note

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified product-specific caveats as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__usage

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified intended uses as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__country_of_origin

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified manufacturing country name as concise plain text; preserve its source representation because no template-specific style is established.
