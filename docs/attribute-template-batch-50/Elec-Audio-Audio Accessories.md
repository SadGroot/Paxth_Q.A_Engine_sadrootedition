# Elec-Audio-Audio Accessories: sample-format mapping rules

Source: `OneDrive_2_10-15-2026/Elec-Audio-Audio Accessories.xls`, sheet `Sheet1`. Catalog headers: row 2, left to right. Sample product row 3. Row 1 contains merged group labels; other populated rows are annotations, as explained below.

Learn formatting only. Obtain actual facts from SAP first, then other verified evidence where the existing workflow permits. Existing supplied values and missing-value handling remain governed by the application. Sample identities, claims, quantities, and classifications are never defaults or allowed-value lists. Placeholder examples show shape only and must never be emitted literally.

Keep the exact headers and their order. The six application pass-through fields are sku, base_code, attributes__lulu_ean, attributes__shipping_weight, attributes__brand, and attributes__lulu_product_type. Name may be generated only when missing. No required/optional classifications or IDQ flags are inferred. Blank samples establish neither optionality nor absence; fallback advice is explicitly labeled. Units/spacing are specific to this template; a single sample does not establish fixed precision. Qualifiers such as Up to and Approx. apply only when current source facts support them.

### Source annotations and unresolved metadata

Lower-row metadata is retained as source guidance only: row 6: `Mandatory Attributes`; row 7: `attributes__compatible_devices`; row 8: `attributes__connectivity`.

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

Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

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

Use verified product measurements in the observed shape `L{length} × W{width} × H{height} cm`. Preserve axis labels/order, exact x versus × separator, spacing, and unit. Keep product and package measurements separate and convert only from known measurements.

## attributes__package_dimensions

Use verified package measurements in the observed shape `L{length} × W{width} × H{height} cm`. Preserve axis labels/order, exact x versus × separator, spacing, and unit. Keep product and package measurements separate and convert only from known measurements.

## attributes__weight

Use the verified product weight in the observed shape `{n} kg`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Keep product weight separate from pass-through shipping weight.

## attributes__brand

Application pass-through: preserve the supplied SAP brand exactly; sample brand names are never defaults.

## attributes__model

Use the verified model identifier as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__lulu_product_type

Application pass-through: preserve the supplied SAP product type under this exact canonical key. Do not add a legacy attributes__product_type alias.

## attributes__color

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified marketed color as concise plain text with its actual source units/labels where relevant.

## attributes__control

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified control method as concise plain text with its actual source units/labels where relevant.

## attributes__water_resistance

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified water-resistance claim as concise plain text with its actual source units/labels where relevant.

## attributes__connectivity

Use the verified connection methods as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__compatible_devices

Use the verified compatible device names/classes as concise plain text, preserving official names, meaningful case, and punctuation. Use only supported devices; brand/category similarity is not compatibility evidence.

## attributes__frequency_range

Use the verified frequency specification in its actual technical context in the observed shape `{n} GHz`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Preserve the actual audio, radio, or electrical-supply context and units.

## attributes__impedence

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified electrical impedance as concise plain text with its actual source units/labels where relevant.

## attributes__mic

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified microphone capability as concise plain text with its actual source units/labels where relevant.

## attributes__features

Use verified product features as concise plain-text entries separated by a comma and one space: `{entry}, {entry}`.

## attributes__battery_capacity

Use the verified battery capacity or battery-size/count specification in the observed shape `{n} Wh`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Keep electrical capacity distinct from battery chemistry, battery quantity, and runtime.

## attributes__charging_time

Use the verified charging duration in the observed shape `{min}–{max} Hours`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Express time to charge, not operating or standby duration.

## attributes__bluetooth

Sample cell is blank: no sample format evidence. Semantic fallback only: Report a verified version/standard when stated, or a supported capability value under the existing workflow; no version or boolean format is learned.

## attributes__material

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified material or composition as concise plain text with its actual source units/labels where relevant.

## attributes__sensors

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified sensor names/types as concise plain text with its actual source units/labels where relevant.

## attributes__ports

Use the verified port/connector specifications as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__country_of_origin

Use the verified manufacturing country name as concise plain text, preserving official names, meaningful case, and punctuation. Use the manufacturing country from evidence rather than brand origin or seller location.

## attributes__power

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified rated power as concise plain text with its actual source units/labels where relevant.

## attributes__other_information

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified additional relevant product information as concise plain text with its actual source units/labels where relevant.

## note

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified product-specific caveats as concise plain text with its actual source units/labels where relevant.
