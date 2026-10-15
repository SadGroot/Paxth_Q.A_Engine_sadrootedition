# H&L-S&F-OG-TS-Skating: sample-format mapping rules

Source: `OneDrive_2_10-15-2026/H&L-S&F-OG-TS-Skating.xls`, sheet `H&L-S&F-OG-TS-Skating`. Catalog headers: row 2, in the reviewed manifest order. Sample product rows: 3, 4, 5. Grouping labels and lower-row metadata are excluded from the output headers; reviewed corrections are listed below.

Learn formatting only. Obtain actual facts from SAP first, then other verified evidence where the existing workflow permits. Existing supplied values and missing-value handling remain governed by the application. Sample identities, claims, quantities, and classifications are never defaults or allowed-value lists. Placeholder examples show shape only and must never be emitted literally.

Keep the exact headers and their order. The six application pass-through fields are sku, base_code, attributes__lulu_ean, attributes__shipping_weight, attributes__brand, and attributes__lulu_product_type. Name may be generated only when missing. No required/optional classifications or IDQ flags are inferred. Blank samples establish neither optionality nor absence; fallback advice is explicitly labeled. Units/spacing are specific to this template; a single sample does not establish fixed precision. Qualifiers such as Up to and Approx. apply only when current source facts support them.

### Source annotations and unresolved metadata

Lower-row metadata is retained as source guidance only: row 8: `Mandatory Headers`; row 9: `attributes_material`; row 10: `attributes_size`.

Mandatory labels, slash alternatives, new-header labels, and misspelled references do not add output columns, IDQ flags, or required/optional classifications. Actual row-2 keys govern output.

Explicit bullet priorities are applied by their literal column alignment: `attributes__bullet_point_1` → Material; `attributes__bullet_point_2` → Size; `attributes__bullet_point_3` → Features; `attributes__bullet_point_4` → Features; `attributes__bullet_point_5` → Features; `attributes__bullet_point_6` → Features.

The explicit title note below 75 characters is applied to product_title only.

Unresolved metadata references absent from the exact header row: `attributes_material`, `attributes_size`. Keep actual header spellings and leave these references unresolved.

Rows 3, 4, 5 are distinct product examples, not instructions. Use all only for format evidence; observed unit/style alternatives remain source-dependent and do not establish default values.

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

Write a concise plain-text title in the observed general shape `{Brand} {series/product/type} {verified key specification}, {verified distinguishing details}, {model}`. Include only available useful parts; secondary details use comma-and-space separation and the model appears last when supplied. The explicit annotation says below 75 characters: keep the title under 75 characters (at most 74).

## attributes__bullet_point_1

Explicit template priority: Material. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_2

Explicit template priority: Size. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_3

Explicit template priority: Features. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_4

Explicit template priority: Features. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_5

Explicit template priority: Features. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_6

Explicit template priority: Features. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__product_description

Write readable factual plain-text paragraphs separated by a blank line, following the sample layout; its paragraph count is not a requirement. No sample contains HTML; this template establishes no HTML requirement.

## attributes__keywords

Use relevant lower-case search phrases separated by a comma and one space: `{product phrase}, {feature phrase}`. Select phrases from the current product facts.

## attributes__brand

Application pass-through: preserve the supplied SAP brand exactly; sample brand names are never defaults.

## attributes__lulu_product_type

Application pass-through: preserve the supplied SAP product type under this exact canonical key. Do not add a legacy attributes__product_type alias.

## attributes__model

Sample cell is blank in every sample product: no sample format evidence. Semantic fallback only: Use verified model identifier as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__color

Use the verified marketed color as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__gender

Use the verified intended audience designation as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__ideal_for

Use the verified intended audience/use environments as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__material

Use the verified material or composition as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__deck_material

Use the verified deck material as concise plain text, preserving official names, meaningful case, and punctuation.

One sample cell is blank; a value in another sample does not establish requiredness or authorize filling without evidence.

## attributes__size

Multiple sample formats occur; choose the verified source basis rather than forcing all products into one sample value:

- Use the verified stated product size in the observed shape `{n} Inches`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.
- Use the verified stated product size as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__bearings

Use the verified bearing classification in the observed shape `ABEC {grade}`, preserving the capitalized standard label and space. Do not infer a grade from price or intended audience.

## attributes__deck_length

Use the verified deck length in the observed shape `{n} Inches`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

One sample cell is blank; a value in another sample does not establish requiredness or authorize filling without evidence.

## attributes__wheel_size

Use the verified wheel diameter/size in the observed shape `{n} mm`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__brake_type

Use the verified brake type as concise plain text, preserving official names, meaningful case, and punctuation.

One sample cell is blank; a value in another sample does not establish requiredness or authorize filling without evidence.

## attributes__safety_features

Use the verified verified safety features as concise plain text, preserving official names, meaningful case, and punctuation. Claims and certifications need source support; the example feature set is not a default.

One sample cell is blank; a value in another sample does not establish requiredness or authorize filling without evidence.

## attributes__features

Use the verified product features as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__special_features

Use the verified distinctive features as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__no_of_pieces

Use the verified piece count as number-only text, shape `{n}`, with no added unit or label. Preserve identifiers/notation rather than performing arithmetic on the sample.

## attributes__pack

Multiple sample formats occur; choose the verified source basis rather than forcing all products into one sample value:

- Use the verified pack composition/count in the observed shape `{n} piece`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.
- Use the verified pack composition/count in the observed shape `{n} pair`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__package_contents

Use a verified count plus item name in the observed shape `{count} {item}`, with one space. Do not infer quantities or included items.

## attributes__in_the_box

Use a verified count plus item name in the observed shape `{count} {item}`, with one space. Do not infer quantities or included items.

## attributes__product_dimensions

Sample cell is blank in every sample product: no sample format evidence. Semantic fallback only: Use verified axis labels/order and original measurement units; no axis order or delimiter is established by this sample.

## attributes__package_dimensions

Use verified package dimensions in the observed shape `W{width} x D{depth} x H{height} cm`. Preserve axis labels/order, exact x versus × separator, spacing, and unit. Keep product and package measurements separate and convert only from known measurements.

## attributes__weight

Use the verified product weight in the observed shape `{n} kg`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Keep product weight separate from pass-through shipping weight.

## attributes__other_information

Use the verified additional relevant product information as concise plain text, preserving official names, meaningful case, and punctuation. Include only additional relevant facts that do not fit another field.

## attributes__note

Sample cell is blank in every sample product: no sample format evidence. Semantic fallback only: Use verified product-specific caveats as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__country_of_origin

Use the verified manufacturing country name as concise plain text, preserving official names, meaningful case, and punctuation. Use the manufacturing country from evidence rather than brand origin or seller location.
