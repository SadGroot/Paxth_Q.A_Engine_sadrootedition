# Elec-M&W-MA-Mobile Cases & Skins: sample-format mapping rules

Source: `OneDrive_2_10-15-2026/Elec-M&W-MA-Mobile Cases & Skins.xls`, sheet `Mobile Cases & Skins`. Catalog headers: row 2, left to right. Sample product row 3. Row 1 contains merged group labels; other populated rows are annotations, as explained below.

Learn formatting only. Obtain actual facts from SAP first, then other verified evidence where the existing workflow permits. Existing supplied values and missing-value handling remain governed by the application. Sample identities, claims, quantities, and classifications are never defaults or allowed-value lists. Placeholder examples show shape only and must never be emitted literally.

Keep the exact headers and their order. The six application pass-through fields are sku, base_code, attributes__lulu_ean, attributes__shipping_weight, attributes__brand, and attributes__lulu_product_type. Name may be generated only when missing. No required/optional classifications or IDQ flags are inferred. Blank samples establish neither optionality nor absence; fallback advice is explicitly labeled. Units/spacing are specific to this template; a single sample does not establish fixed precision. Qualifiers such as Up to and Approx. apply only when current source facts support them.

### Source annotations and unresolved metadata

Lower-row metadata is retained as source guidance only: row 5: `Mandatory attributes`; row 6: `attributes__material`.

Mandatory labels, slash alternatives, new-header labels, and misspelled references do not add output columns, IDQ flags, or required/optional classifications. Actual row-2 keys govern output.

Explicit bullet priorities are applied by their literal column alignment: `attributes__bullet_point_1` → COMPATIBILITY/Features; `attributes__bullet_point_2` → MATERIAL/Features; `attributes__bullet_point_3` → Features; `attributes__bullet_point_4` → Features; `attributes__bullet_point_5` → Features; `attributes__bullet_point_6` → Features.

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

Explicit template priority: COMPATIBILITY/Features. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_2

Explicit template priority: MATERIAL/Features. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_3

Explicit template priority: Features. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_4

Explicit template priority: Features. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_5

Explicit template priority: Features. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_6

Explicit template priority: Features. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__product_description

Sample cell is blank: no sample format evidence. Semantic fallback only: If description generation is requested, write useful factual plain text from current evidence; no length, paragraph count, or HTML format is established.

## attributes__keywords

Use relevant lower-case search phrases separated by a comma and one space: `{product phrase}, {feature phrase}`. Select phrases from the current product facts.

## attributes__brand

Application pass-through: preserve the supplied SAP brand exactly; sample brand names are never defaults.

## attributes__lulu_product_type

Application pass-through: preserve the supplied SAP product type under this exact canonical key. Do not add a legacy attributes__product_type alias.

## attributes__model

Use the verified model identifier as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__color

Use the verified marketed color as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__material

Use the verified material or composition as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__coating

Use the verified surface coating as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__finish

Use the verified surface finish as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__design

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified design/style as concise plain text with its actual source units/labels where relevant.

## attributes__pattern

Use the verified surface pattern as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__size

Use the verified stated product size in the observed shape `{n} cm`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__no_of_pieces

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified piece count as concise plain text with its actual source units/labels where relevant.

## attributes__pack

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified pack composition/count as concise plain text with its actual source units/labels where relevant.

## attributes__package_contents

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified included package items as concise plain text with its actual source units/labels where relevant.

## attributes__in_the_box

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified actual box contents as concise plain text with its actual source units/labels where relevant.

## attributes__product_dimensions

Use verified product measurements in the observed shape `W{width} x D{depth} x H{height} cm`. Preserve axis labels/order, exact x versus × separator, spacing, and unit. Keep product and package measurements separate and convert only from known measurements.

## attributes__package_dimensions

Use verified package measurements in the observed shape `W{width} x D{depth} x H{height} cm`. Preserve axis labels/order, exact x versus × separator, spacing, and unit. Keep product and package measurements separate and convert only from known measurements.

## attributes__weight

Use the verified product weight in the observed shape `{n}g`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Keep product weight separate from pass-through shipping weight.

## attributes__features

Use the verified product features as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__compatible_models

Use the verified compatible model/series identifiers as concise plain text, preserving official names, meaningful case, and punctuation. Use exact supported model identifiers; compatibility with one example never establishes universal support.

## attributes__closure

Use the verified closure method as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__grip

Use the verified grip design as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__fit_type

Use the verified fit description as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__usage

Use the verified intended uses as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__safety_features

Use the verified verified safety features as concise plain text, preserving official names, meaningful case, and punctuation. Claims and certifications need source support; the example feature set is not a default.

## attributes__scratch_resistant

Use `Yes` or `No` for the verified scratch-resistance claim, matching the sample capability format. Preserve unknowns under existing blank handling; an unstated feature is not No.

## attributes__other_information

Use the verified additional relevant product information as concise plain text, preserving official names, meaningful case, and punctuation. Include only additional relevant facts that do not fit another field.

## attributes__note

Use the verified product-specific caveats as concise plain text, preserving official names, meaningful case, and punctuation. Use only applicable caveats; sample warranty/region statements are not defaults.

## attributes__country_of_origin

Use the verified manufacturing country name as concise plain text, preserving official names, meaningful case, and punctuation. Use the manufacturing country from evidence rather than brand origin or seller location.
