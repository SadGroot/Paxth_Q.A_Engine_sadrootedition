# Elec-C&A-PCACC-Web camera: sample-format mapping rules

Source: `OneDrive_2_10-15-2026/Elec-C&A-PCACC-Web camera.xls`, sheet `Sheet1`. Catalog headers: row 2, left to right. Sample product row 3. Row 1 contains merged group labels; other populated rows are annotations, as explained below.

Learn formatting only. Obtain actual facts from SAP first, then other verified evidence where the existing workflow permits. Existing supplied values and missing-value handling remain governed by the application. Sample identities, claims, quantities, and classifications are never defaults or allowed-value lists. Placeholder examples show shape only and must never be emitted literally.

Keep the exact headers and their order. The six application pass-through fields are sku, base_code, attributes__lulu_ean, attributes__shipping_weight, attributes__brand, and attributes__lulu_product_type. Name may be generated only when missing. No required/optional classifications or IDQ flags are inferred. Blank samples establish neither optionality nor absence; fallback advice is explicitly labeled. Units/spacing are specific to this template; a single sample does not establish fixed precision. Qualifiers such as Up to and Approx. apply only when current source facts support them.

### Source annotations and unresolved metadata

Lower-row metadata is retained as source guidance only: row 5: `Mandatory Attributes`; row 6: `attributes__camera_resolution`.

Mandatory labels, slash alternatives, new-header labels, and misspelled references do not add output columns, IDQ flags, or required/optional classifications. Actual row-2 keys govern output.

The literal output key is `note`; preserve it rather than renaming it to attributes__note.

## sku

Application pass-through: preserve the supplied SAP sku as exact identifier text, including meaningful punctuation and leading zeroes. Do not generate or copy sample identifiers.

## base_code

Application pass-through: preserve the supplied SAP base code as exact identifier text, including meaningful punctuation and leading zeroes. Do not generate or copy sample identifiers.

## attributes__lulu_ean

Application pass-through: preserve the supplied SAP lulu ean as exact identifier text, including meaningful punctuation and leading zeroes. Do not generate or copy sample identifiers.

## attributes__shipping_weight

Application pass-through: preserve the supplied SAP shipping-weight value. The bare sample number does not establish a unit; do not derive or convert it from product weight.

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

## attributes__no_of_pieces

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified piece count as concise plain text with its actual source units/labels where relevant.

## attributes__package_contents

Use verified supplied items with quantities in the observed shape `{count} x {item}`. Preserve the quantity separator and spacing; include only verified contents.

## attributes__pack

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified pack composition/count as concise plain text with its actual source units/labels where relevant.

## attributes__in_the_box

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified actual box contents as concise plain text with its actual source units/labels where relevant.

## attributes__product_dimensions

Use verified product measurements in the observed shape `{dimension1} x {dimension2} x {dimension3} cm`. Preserve axis labels/order, exact x versus × separator, spacing, and unit. The three axes are unlabeled in this sample; retain source ordering rather than inventing width/depth/height meanings. Keep product and package measurements separate and convert only from known measurements.

## attributes__package_dimensions

Use verified package measurements in the observed shape `{dimension1} x {dimension2} x {dimension3} cm`. Preserve axis labels/order, exact x versus × separator, spacing, and unit. The three axes are unlabeled in this sample; retain source ordering rather than inventing width/depth/height meanings. Keep product and package measurements separate and convert only from known measurements.

## attributes__weight

Use the verified product weight in the observed shape `{n}g`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Keep product weight separate from pass-through shipping weight.

## attributes__brand

Application pass-through: preserve the supplied SAP brand exactly; sample brand names are never defaults.

## attributes__lulu_product_type

Application pass-through: preserve the supplied SAP product type under this exact canonical key. Do not add a legacy attributes__product_type alias.

## attributes__model

Use the verified model identifier as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__color

Use the verified marketed color as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__mounting_type

Use the verified mounting method as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__camera_resolution

Use the verified camera resolution in the observed shape `{n}K`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__display_resolution

Use verified resolution in the observed shape `{horizontal} x {vertical} pixels`. Preserve lowercase x, spaces, and the exact unit case/basis; do not confuse print DPI with display pixels.

## attributes__frame_rate

Use verified camera/view-specific frame rates in the observed shape `{n} fps ({view} {resolution}), {n} fps ({view} {resolution})`. Preserve parentheses and comma-space separation; keep each resolution paired with its own camera/view.

## attributes__focal_length

Sample cell is blank: no sample format evidence. Semantic fallback only: Use a verified lens focal length with its stated unit and equivalent/actual context.

## attributes__zoom

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified optical/digital zoom and its stated factor; do not infer zoom from resolution.

## attributes__flash

Sample cell is blank: no sample format evidence. Semantic fallback only: Use the appropriate verified flash technology/count for this product; the header alone does not identify its measurement basis.

## attributes__night_vision

Use `Yes` or `No` for the verified night-vision capability, matching the sample capability format. Preserve unknowns under existing blank handling; an unstated feature is not No.

## attributes__connectivity

Use the verified connection methods as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__ports

Use the verified port/connector specifications as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__wifi

Sample cell is blank: no sample format evidence. Semantic fallback only: Use a verified Wi-Fi standard or capability value with its source context; do not invent a generation or absence claim.

## attributes__country_of_origin

Use the verified manufacturing country name as concise plain text, preserving official names, meaningful case, and punctuation. Use the manufacturing country from evidence rather than brand origin or seller location.

## attributes__voltage

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified electrical input voltage as concise plain text with its actual source units/labels where relevant.

## attributes__other_information

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified additional relevant product information as concise plain text with its actual source units/labels where relevant.

## note

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified product-specific caveats as concise plain text with its actual source units/labels where relevant.
