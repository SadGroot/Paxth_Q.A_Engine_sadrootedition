# Elec-ITACC-Smart Devices & Accessories: sample-format mapping rules

Source: `OneDrive_2_10-15-2026/Elec-ITACC-Smart Devices & Accessories.xls`, sheet `Template`. Catalog headers: row 2, left to right. Sample product row 3. Row 1 contains merged group labels; other populated rows are annotations, as explained below.

Learn formatting only. Obtain actual facts from SAP first, then other verified evidence where the existing workflow permits. Existing supplied values and missing-value handling remain governed by the application. Sample identities, claims, quantities, and classifications are never defaults or allowed-value lists. Placeholder examples show shape only and must never be emitted literally.

Keep the exact headers and their order. The six application pass-through fields are sku, base_code, attributes__lulu_ean, attributes__shipping_weight, attributes__brand, and attributes__lulu_product_type. Name may be generated only when missing. No required/optional classifications or IDQ flags are inferred. Blank samples establish neither optionality nor absence; fallback advice is explicitly labeled. Units/spacing are specific to this template; a single sample does not establish fixed precision. Qualifiers such as Up to and Approx. apply only when current source facts support them.

### Source annotations and unresolved metadata

Explicit bullet priorities are applied by their literal column alignment: `attributes__bullet_point_1` → Features; `attributes__bullet_point_2` → Features; `attributes__bullet_point_3` → Features; `attributes__bullet_point_4` → Features; `attributes__bullet_point_5` → Features; `attributes__bullet_point_6` → Features.

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

Explicit template priority: Features. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_2

Explicit template priority: Features. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_3

Explicit template priority: Features. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_4

Explicit template priority: Features. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_5

Explicit template priority: Features. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_6

Explicit template priority: Features. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__product_description

Write a factual plain-text paragraph, following the single-paragraph sample layout; the short example does not establish a fixed length. No sample contains HTML; this template establishes no HTML requirement.

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

## attributes__no_of_pieces

Use the verified piece count as number-only text, shape `{n}`, with no added unit or label. Preserve identifiers/notation rather than performing arithmetic on the sample.

## attributes__pack

Use the verified pack composition/count as number-only text, shape `{n}`, with no added unit or label. Preserve identifiers/notation rather than performing arithmetic on the sample.

## attributes__package_contents

Use verified included package items as concise plain-text entries separated by a comma and one space: `{entry}, {entry}`. List verified included items only; quantities must come from evidence.

## attributes__in_the_box

Use a verified count plus item name in the observed shape `{count} {item}`, with one space. Do not infer quantities or included items.

## attributes__product_dimensions

Use verified product measurements in the observed shape `W{width} x D{depth} x H{height} cm`. Preserve axis labels/order, exact x versus × separator, spacing, and unit. Keep product and package measurements separate and convert only from known measurements.

## attributes__package_dimensions

Use verified package measurements in the observed shape `W{width} x D{depth} x H{height} cm`. Preserve axis labels/order, exact x versus × separator, spacing, and unit. Keep product and package measurements separate and convert only from known measurements.

## attributes__weight

Use the verified product weight in the observed shape `{n} kg`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Keep product weight separate from pass-through shipping weight.

## attributes__shape

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified shape as concise plain text with its actual source units/labels where relevant.

## attributes__pattern

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified surface pattern as concise plain text with its actual source units/labels where relevant.

## attributes__design

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified design/style as concise plain text with its actual source units/labels where relevant.

## attributes__lens_shape

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified lens shape as concise plain text with its actual source units/labels where relevant.

## attributes__lens_color

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified lens color as concise plain text with its actual source units/labels where relevant.

## attributes__lens_type

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified lens type as concise plain text with its actual source units/labels where relevant.

## attributes__frame_shape

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified frame shape as concise plain text with its actual source units/labels where relevant.

## attributes__frame_size

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified frame size as concise plain text with its actual source units/labels where relevant.

## attributes__frame_color

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified frame color as concise plain text with its actual source units/labels where relevant.

## attributes__frame_material

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified frame material as concise plain text with its actual source units/labels where relevant.

## attributes__features

Use the verified product features as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__display_type

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified display technology/type as concise plain text with its actual source units/labels where relevant.

## attributes__audio

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified supported audio modes/technologies as concise plain text with its actual source units/labels where relevant.

## attributes__compatible_devices

Use the verified compatible device names/classes as concise plain text, preserving official names, meaningful case, and punctuation. Use only supported devices; brand/category similarity is not compatibility evidence.

## attributes__connectivity

Use the verified connection methods as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__motion_detection

Use `Yes` or `No` for the verified motion-detection capability, matching the sample capability format. Preserve unknowns under existing blank handling; an unstated feature is not No.

## attributes__interfaces

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified interface names/types as concise plain text with its actual source units/labels where relevant.

## attributes__storage

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified storage capacity as concise plain text with its actual source units/labels where relevant.

## attributes__battery_type

Use the verified battery chemistry/size/type as concise plain text, preserving official names, meaningful case, and punctuation. Preserve the specified chemistry/size; do not derive it from runtime.

## attributes__frequency_range

Use the verified frequency specification in its actual technical context in the observed shape `{n} GHz`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Preserve the actual audio, radio, or electrical-supply context and units.

## attributes__voltage

Use the verified electrical input voltage in the observed shape `{n}V`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__battery_capacity

Sample cell is blank: no sample format evidence. Semantic fallback only: Use an explicit verified battery specification with its real unit or battery-size/count basis; neither mAh nor a count is established here.

## attributes__compatible_models

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified compatible model/series identifiers as concise plain text with its actual source units/labels where relevant.

## attributes__range

Use the verified operating/connection range in the observed shape `{n}m`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__other_information

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified additional relevant product information as concise plain text with its actual source units/labels where relevant.

## attributes__note

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified product-specific caveats as concise plain text with its actual source units/labels where relevant.

## attributes__country_of_origin

Use the verified manufacturing country name as concise plain text, preserving official names, meaningful case, and punctuation. Use the manufacturing country from evidence rather than brand origin or seller location.
