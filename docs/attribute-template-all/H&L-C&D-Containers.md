# H&L-C&D-Containers: sample-format mapping rules

Source: `OneDrive_2_10-15-2026/H&L-C&D-Containers.xls`, sheet `Sheet1`. Catalog headers: row 2, in the reviewed manifest order. Sample product rows: 3. Grouping labels and lower-row metadata are excluded from the output headers; reviewed corrections are listed below.

Learn formatting only. Obtain actual facts from SAP first, then other verified evidence where the existing workflow permits. Existing supplied values and missing-value handling remain governed by the application. Sample identities, claims, quantities, and classifications are never defaults or allowed-value lists. Placeholder examples show shape only and must never be emitted literally.

Keep the exact headers and their order. The six application pass-through fields are sku, base_code, attributes__lulu_ean, attributes__shipping_weight, attributes__brand, and attributes__lulu_product_type. Name may be generated only when missing. No required/optional classifications or IDQ flags are inferred. Blank samples establish neither optionality nor absence; fallback advice is explicitly labeled. Units/spacing are specific to this template; a single sample does not establish fixed precision. Qualifiers such as Up to and Approx. apply only when current source facts support them.

### Source annotations and unresolved metadata

Lower-row metadata is retained as source guidance only: row 7: `Mandatory attributes`; row 8: `attributes__material`; row 9: `attributes__capacity/attributes__size`.

Mandatory labels, slash alternatives, new-header labels, and misspelled references do not add output columns, IDQ flags, or required/optional classifications. Actual row-2 keys govern output.

The literal output key is `note`; preserve it rather than renaming it to attributes__note.

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

Sample cell is blank: no sample format evidence. Semantic fallback only: If a supported distinct benefit is available and generation is requested, write concise plain text without a list marker; the blank does not require inventing a sixth claim.

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

Use the verified model identifier in the observed shape `{n}A`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__color

Use the verified marketed color as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__no_of_pieces

Use the verified piece count as number-only text, shape `{n}`, with no added unit or label. Preserve identifiers/notation rather than performing arithmetic on the sample.

## attributes__package_contents

Use verified supplied items with quantities in the observed shape `{count} x {item}`; separate multiple entries with a comma and one space. Preserve the quantity separator and spacing; include only verified contents.

## attributes__pack

Use verified pack composition in the observed shape `{pack count} pack, set of {pieces per set}`. Preserve comma presence/absence and spacing; keep pack counts distinct from total piece counts.

## attributes__in_the_box

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified actual box contents as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__product_dimensions

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified axis labels/order and original measurement units; no axis order or delimiter is established by this sample.

## attributes__package_dimensions

Use verified package dimensions in the observed shape `{dimension1} x {dimension2} cm`. Preserve axis labels/order, exact x versus × separator, spacing, and unit. The three axes are unlabeled in this sample; retain source ordering rather than inventing width/depth/height meanings. Keep product and package measurements separate and convert only from known measurements.

## attributes__weight

Use the verified product weight in the observed shape `{n}g`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Keep product weight separate from pass-through shipping weight.

## attributes__inner_material

Use the verified inner/lining material as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__outer_material

Use the verified outer material as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__material

Use the verified material or composition as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__shape

Use the verified shape as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__size

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified stated product size as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__capacity

Use the verified function-specific capacity in the observed shape `{n} ml`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Keep the supported function and volume/load basis distinct from other capacity fields.

## attributes__dishwasher_safe

Use `Yes` or `No` for the verified dishwasher suitability, matching the sample capability format and case. Preserve unknowns under existing blank handling; an unstated feature is not No.

## attributes__microwave_safe

Use `Yes` or `No` for the verified microwave suitability, matching the sample capability format and case. Preserve unknowns under existing blank handling; an unstated feature is not No.

## attributes__features

Use verified product features as concise plain-text entries separated by a comma and one space: `{entry}, {entry}`.

## attributes__usage

Use verified intended uses as concise plain-text entries separated by a comma and one space: `{entry}, {entry}`.

## attributes__other_information

Use the verified additional relevant product information as concise plain text, preserving official names, meaningful case, and punctuation. Include only additional relevant facts that do not fit another field.

## attributes__care_instructions

Use verified care instructions as concise plain-text entries separated by a comma and one space: `{entry}, {entry}`.

## attributes__country of origin

Use the verified manufacturing country name as concise plain text, preserving official names, meaningful case, and punctuation.

## note

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified product-specific caveats as concise plain text; preserve its source representation because no template-specific style is established.
