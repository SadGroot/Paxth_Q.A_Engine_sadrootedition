# H&L-S&F-E&F-EM-Home GYM: sample-format mapping rules

Source: `OneDrive_2_10-15-2026/H&L-S&F-E&F-EM-Home GYM.xls`, sheet `Sheet1`. Catalog headers: row 2, in the reviewed manifest order. Sample product rows: 3. Grouping labels and lower-row metadata are excluded from the output headers; reviewed corrections are listed below.

Learn formatting only. Obtain actual facts from SAP first, then other verified evidence where the existing workflow permits. Existing supplied values and missing-value handling remain governed by the application. Sample identities, claims, quantities, and classifications are never defaults or allowed-value lists. Placeholder examples show shape only and must never be emitted literally.

Keep the exact headers and their order. The six application pass-through fields are sku, base_code, attributes__lulu_ean, attributes__shipping_weight, attributes__brand, and attributes__lulu_product_type. Name may be generated only when missing. No required/optional classifications or IDQ flags are inferred. Blank samples establish neither optionality nor absence; fallback advice is explicitly labeled. Units/spacing are specific to this template; a single sample does not establish fixed precision. Qualifiers such as Up to and Approx. apply only when current source facts support them.

### Source annotations and unresolved metadata

No populated lower-row annotations are supplied. Sample content does not establish mandatory fields.

## sku

Application pass-through: preserve the supplied SAP sku as exact identifier text, including meaningful punctuation and leading zeroes. Do not generate or copy sample identifiers.

## base_code

Application pass-through: preserve the supplied SAP base code as exact identifier text, including meaningful punctuation and leading zeroes. Do not generate or copy sample identifiers.

## attributes__lulu_ean

Application pass-through: preserve the supplied SAP lulu ean as exact identifier text, including meaningful punctuation and leading zeroes. Do not generate or copy sample identifiers.

## attributes__shipping_weight

Application pass-through: preserve the supplied SAP shipping-weight value and its established application unit. Do not derive it from product weight or copy a sample weight.

## name

Preserve an existing supplied product name. When missing and generation is requested, use the verified title-style product name below, with available distinguishing details and no empty separators.

## attributes__product_title

Write a concise plain-text title in the observed general shape `{Brand} {series/product/type} {verified key specification}, {verified distinguishing details}, {model}`. Include only available useful parts; secondary details use comma-and-space separation and the model appears last when supplied.

## attributes__bullet_point_1

Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_2

Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_3

Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_4

Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_5

Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_6

Sample cell is blank: no sample format evidence. Semantic fallback only: If a supported distinct benefit is available and generation is requested, write concise plain text without a list marker; the blank does not require inventing a sixth claim.

## attributes__product_description

Write readable factual plain-text paragraphs separated by a blank line, following the sample layout; its paragraph count is not a requirement. No sample contains HTML; this template establishes no HTML requirement.

## attributes__keywords

Use relevant lower-case search phrases separated by commas without following spaces: `{product phrase},{feature phrase}`. Select phrases from the current product facts.

## attributes__brand

Application pass-through: preserve the supplied SAP brand exactly; sample brand names are never defaults.

## attributes__lulu_product_type

Application pass-through: preserve the supplied SAP product type under this exact canonical key. Do not add a legacy attributes__product_type alias.

## attributes__model

Use the verified model identifier as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__color

Use the verified marketed color as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__no_of_pieces

Use the verified piece count as number-only text, shape `{n}`, with no added unit or label. Preserve identifiers/notation rather than performing arithmetic on the sample.

## attributes__package_contents

Use verified supplied items with quantities in the observed shape `{count} x {item}`. Preserve the quantity separator and spacing; include only verified contents.

## attributes__pack

Use verified pack composition in the observed shape `{pack count} pack, set of {pieces per set}`. Preserve comma presence/absence and spacing; keep pack counts distinct from total piece counts.

## attributes__in_the_box

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified actual box contents as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__product_dimensions

Use verified product dimensions in the observed shape `{dimension1} x {dimension2} x {dimension3} cm`. Preserve axis labels/order, exact x versus × separator, spacing, and unit. The three axes are unlabeled in this sample; retain source ordering rather than inventing width/depth/height meanings. Keep product and package measurements separate and convert only from known measurements.

## attributes__package_dimensions

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified package dimensions with their actual axis meanings and units; do not reuse product measurements.

## attributes__weight

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified product weight with its source unit; do not infer it from shipping weight.

## attributes__material

Use the verified material or composition as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__frame_material

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified frame material as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__structure_type

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified structure/construction type as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__coating

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified surface coating as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__finish

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified surface finish as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__features

Use verified product features as concise plain-text entries separated by a comma and one space: `{entry}, {entry}`.

## attributes__functions

Use verified supported functions as concise plain-text entries separated by a comma and one space: `{entry}, {entry}`.

## attributes__usage

Use verified intended uses as concise plain-text entries separated by a comma and one space: `{entry}, {entry}`.

## attributes__adjustability

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified supported adjustments as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__foldability

Sample cell is blank: no sample format evidence. Semantic fallback only: Use an explicitly supported folding description/capability; no Yes/No format is established.

## attributes__resistance_type

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified resistance technology as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__resistance_levels

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified resistance-level count/specification as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__max_speed

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified maximum speed as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__incline_range

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified incline range as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__maximum_user_weight

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified maximum supported user weight as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__power

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified rated power as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__motor_horsepower

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified motor horsepower as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__safety_features

Use verified verified safety features as concise plain-text entries separated by a comma and one space: `{entry}, {entry}`. Claims and certifications need source support; the example feature set is not a default.

## attributes__safety_information

Use the verified source-supported safety information as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__installation

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified installation type as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__mounting_type

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified mounting method as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__country_of_origin

Use the verified manufacturing country name as concise plain text, preserving official names, meaningful case, and punctuation. Use the manufacturing country from evidence rather than brand origin or seller location.

## attributes__other_information

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified additional relevant product information as concise plain text; preserve its source representation because no template-specific style is established.
