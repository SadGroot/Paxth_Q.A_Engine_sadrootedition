# H&L-HF-Mattress: sample-format mapping rules

Source: `OneDrive_2_10-15-2026/H&L-HF-Mattress.xlsx`, sheet `Sheet1`. Catalog headers: row 1, in the reviewed manifest order. No trustworthy product samples. Grouping labels and lower-row metadata are excluded from the output headers; reviewed corrections are listed below.

Learn formatting only. Obtain actual facts from SAP first, then other verified evidence where the existing workflow permits. Existing supplied values and missing-value handling remain governed by the application. Sample identities, claims, quantities, and classifications are never defaults or allowed-value lists. Placeholder examples show shape only and must never be emitted literally.

Keep the exact headers and their order. The six application pass-through fields are sku, base_code, attributes__lulu_ean, attributes__shipping_weight, attributes__brand, and attributes__lulu_product_type. Name may be generated only when missing. No required/optional classifications or IDQ flags are inferred. Blank samples establish neither optionality nor absence; fallback advice is explicitly labeled. Units/spacing are specific to this template; a single sample does not establish fixed precision. Qualifiers such as Up to and Approx. apply only when current source facts support them.

### Source annotations and unresolved metadata

No populated lower-row annotations are supplied. Sample content does not establish mandatory fields.

No trustworthy sample product rows are available (headers-only). Every per-field filling suggestion is an explicitly labeled semantic fallback, not learned formatting. Preserve existing configured rules and original supplied data under the application workflow.

## sku

Application pass-through: preserve the supplied SAP sku as exact identifier text, including meaningful punctuation and leading zeroes. Do not generate or copy sample identifiers. Sample cell is blank or no trustworthy sample is available: no sample format evidence. Preserve the supplied application value or existing blank.

## base_code

Application pass-through: preserve the supplied SAP base code as exact identifier text, including meaningful punctuation and leading zeroes. Do not generate or copy sample identifiers. Sample cell is blank or no trustworthy sample is available: no sample format evidence. Preserve the supplied application value or existing blank.

## attributes__lulu_ean

Application pass-through: preserve the supplied SAP lulu ean as exact identifier text, including meaningful punctuation and leading zeroes. Do not generate or copy sample identifiers. Sample cell is blank or no trustworthy sample is available: no sample format evidence. Preserve the supplied application value or existing blank.

## attributes__brand

Application pass-through: preserve the supplied SAP brand exactly; sample brand names are never defaults. Sample cell is blank or no trustworthy sample is available: no sample format evidence. Preserve the supplied application value or existing blank.

## attributes__product_title

No sample format evidence: no trustworthy sample product row is available. Semantic fallback only: When requested, write a concise factual plain-text product title from verified identity and specifications; no ordering, delimiter, or category-specific measurement style is learned.

## attributes__bullet_point_1

No sample format evidence: no trustworthy sample product row is available. Semantic fallback only: If a supported distinct benefit is available and generation is requested, write concise plain text without a list marker; the blank does not require inventing a sixth claim.

## attributes__bullet_point_2

No sample format evidence: no trustworthy sample product row is available. Semantic fallback only: If a supported distinct benefit is available and generation is requested, write concise plain text without a list marker; the blank does not require inventing a sixth claim.

## attributes__bullet_point_3

No sample format evidence: no trustworthy sample product row is available. Semantic fallback only: If a supported distinct benefit is available and generation is requested, write concise plain text without a list marker; the blank does not require inventing a sixth claim.

## attributes__bullet_point_4

No sample format evidence: no trustworthy sample product row is available. Semantic fallback only: If a supported distinct benefit is available and generation is requested, write concise plain text without a list marker; the blank does not require inventing a sixth claim.

## attributes__bullet_point_5

No sample format evidence: no trustworthy sample product row is available. Semantic fallback only: If a supported distinct benefit is available and generation is requested, write concise plain text without a list marker; the blank does not require inventing a sixth claim.

## attributes__bullet_point_6

No sample format evidence: no trustworthy sample product row is available. Semantic fallback only: If a supported distinct benefit is available and generation is requested, write concise plain text without a list marker; the blank does not require inventing a sixth claim.

## attributes__product_description

No sample format evidence: no trustworthy sample product row is available. Semantic fallback only: If description generation is requested, write useful factual plain text from current evidence; no length, paragraph count, or HTML format is established.

## attributes__lulu_product_type

Application pass-through: preserve the supplied SAP product type under this exact canonical key. Do not add a legacy attributes__product_type alias. Sample cell is blank or no trustworthy sample is available: no sample format evidence. Preserve the supplied application value or existing blank.

## attributes__keywords

No sample format evidence: no trustworthy sample product row is available. Semantic fallback only: Use relevant search terms/phrases from current verified facts; no delimiter, spacing, or case convention is established by a sample.

## attributes__material

No sample format evidence: no trustworthy sample product row is available. Semantic fallback only: Use verified material or composition as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__size

No sample format evidence: no trustworthy sample product row is available. Semantic fallback only: Use verified stated product size as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__ideal_for

No sample format evidence: no trustworthy sample product row is available. Semantic fallback only: Use verified intended audience/use environments as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__product_dimensions

No sample format evidence: no trustworthy sample product row is available. Semantic fallback only: Use verified axis labels/order and original measurement units; no axis order or delimiter is established by this sample.

## attributes__weight

No sample format evidence: no trustworthy sample product row is available. Semantic fallback only: Use verified product weight with its source unit; do not infer it from shipping weight.

## attributes__shipping_weight

Application pass-through: preserve the supplied SAP shipping-weight value and its established application unit. Do not derive it from product weight or copy a sample weight. Sample cell is blank or no trustworthy sample is available: no sample format evidence. Preserve the supplied application value or existing blank.

## attributes__care_instructions

No sample format evidence: no trustworthy sample product row is available. Semantic fallback only: Use verified care instructions as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__fabric

No sample format evidence: no trustworthy sample product row is available. Semantic fallback only: Use verified fabric type/composition as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__model

No sample format evidence: no trustworthy sample product row is available. Semantic fallback only: Use verified model identifier as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__country_of_origin

No sample format evidence: no trustworthy sample product row is available. Semantic fallback only: Use verified manufacturing country name as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__color

No sample format evidence: no trustworthy sample product row is available. Semantic fallback only: Use verified marketed color as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__structure_type

No sample format evidence: no trustworthy sample product row is available. Semantic fallback only: Use verified structure/construction type as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__other_information

No sample format evidence: no trustworthy sample product row is available. Semantic fallback only: Use verified additional relevant product information as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__no_of_pieces

No sample format evidence: no trustworthy sample product row is available. Semantic fallback only: Use verified piece count as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__features

No sample format evidence: no trustworthy sample product row is available. Semantic fallback only: Use verified product features as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__product_name

No sample format evidence: no trustworthy sample product row is available. Semantic fallback only: Use verified display product name as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__filling_material

No sample format evidence: no trustworthy sample product row is available. Semantic fallback only: Use verified filling material as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__maximum_capacity

No sample format evidence: no trustworthy sample product row is available. Semantic fallback only: Use verified maximum supported capacity in its stated basis as concise plain text; preserve its source representation because no template-specific style is established.
