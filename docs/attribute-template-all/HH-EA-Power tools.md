# HH-EA-Power tools: sample-format mapping rules

Source: `OneDrive_2_10-15-2026/HH-EA-Power tools.xls`, sheet `Power Tools Template`. Catalog headers: row 2, in the reviewed manifest order. Sample product rows: 3. Grouping labels and lower-row metadata are excluded from the output headers; reviewed corrections are listed below.

Learn formatting only. Obtain actual facts from SAP first, then other verified evidence where the existing workflow permits. Existing supplied values and missing-value handling remain governed by the application. Sample identities, claims, quantities, and classifications are never defaults or allowed-value lists. Placeholder examples show shape only and must never be emitted literally.

Keep the exact headers and their order. The six application pass-through fields are sku, base_code, attributes__lulu_ean, attributes__shipping_weight, attributes__brand, and attributes__lulu_product_type. Name may be generated only when missing. No required/optional classifications or IDQ flags are inferred. Blank samples establish neither optionality nor absence; fallback advice is explicitly labeled. Units/spacing are specific to this template; a single sample does not establish fixed precision. Qualifiers such as Up to and Approx. apply only when current source facts support them.

### Source annotations and unresolved metadata

Explicit bullet priorities are applied by their literal column alignment: `attributes__bullet_point_1` → Wattage; `attributes__bullet_point_2` → Chuck Size/Features; `attributes__bullet_point_3` → RPM/Features; `attributes__bullet_point_4` → Features; `attributes__bullet_point_5` → Features; `attributes__bullet_point_6` → Features.

The explicit title note below 75 characters is applied to product_title only.

The explicit 200-word description instruction takes precedence over the shorter demonstration text; use supported facts rather than padding.

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

Explicit template priority: Wattage. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_2

Explicit template priority: Chuck Size/Features. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_3

Explicit template priority: RPM/Features. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_4

Explicit template priority: Features. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_5

Explicit template priority: Features. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_6

Explicit template priority: Features. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__product_description

Write readable factual plain-text paragraphs separated by a blank line, following the sample layout; its paragraph count is not a requirement. The explicit annotation requests a 200-word description: target 200 supported words, without inventing details to pad the text. No sample contains HTML; this template establishes no HTML requirement.

## attributes__keywords

Use relevant lower-case search phrases separated by a comma and one space: `{product phrase}, {feature phrase}`. Select phrases from the current product facts.

## attributes__brand

Application pass-through: preserve the supplied SAP brand exactly; sample brand names are never defaults.

## attributes__lulu_product_type

Application pass-through: preserve the supplied SAP product type under this exact canonical key. Do not add a legacy attributes__product_type alias.

## attributes__material

Use the verified material or composition as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__size

Use verified stated product size in the observed shape `W{width} x D{depth} x H{height} cm`. Preserve axis labels/order, exact x versus × separator, spacing, and unit. Keep product and package measurements separate and convert only from known measurements.

## attributes__model

Use the verified model identifier as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__color

Use the verified marketed color as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__no_of_pieces

Use the verified piece count as number-only text, shape `{n}`, with no added unit or label. Preserve identifiers/notation rather than performing arithmetic on the sample.

## attributes__pack

Use the verified pack composition/count as number-only text, shape `{n}`, with no added unit or label. Preserve identifiers/notation rather than performing arithmetic on the sample.

## attributes__package_contents

Use a verified count plus item name in the observed shape `{count} {item}`, with one space. Do not infer quantities or included items.

## attributes__in_the_box

Use verified actual box contents as concise plain-text entries separated by a comma and one space: `{entry}, {entry}`. Keep actual box contents distinct from separately sold compatible accessories.

## attributes__product_dimensions

Use verified product dimensions in the observed shape `W{width} x D{depth} x H{height} cm`. Preserve axis labels/order, exact x versus × separator, spacing, and unit. Keep product and package measurements separate and convert only from known measurements.

## attributes__package_dimensions

Use verified package dimensions in the observed shape `W{width} x D{depth} x H{height} cm`. Preserve axis labels/order, exact x versus × separator, spacing, and unit. Keep product and package measurements separate and convert only from known measurements.

## attributes__weight

Use the verified product weight in the observed shape `{n} kg`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Keep product weight separate from pass-through shipping weight.

## attributes__voltage

Use the verified electrical input voltage in the observed shape `{min}-{max} V`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__wattage

Use the verified rated wattage in the observed shape `{n} W`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__power

Use the verified rated power in the observed shape `{n} W`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__power_source

Use the verified actual power source as concise plain text, preserving official names, meaningful case, and punctuation. Use a source/type label, not a Yes/No value inferred from the header. The populated sample uses descriptive text, not a Yes/No flag.

## attributes__battery_capacity

Use the verified battery capacity or battery-size/count specification in the observed shape `{n} mAh`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Keep electrical capacity distinct from battery chemistry, battery quantity, and runtime.

## attributes__plug_type

Use the verified plug designation in the observed shape `{count} pin plug`. Preserve its hyphen/space and label case; a pin count alone does not establish a regional standard.

## attributes__rpm

Use the verified rotational speed in the observed shape `{n} RPM`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__drilling_diameters

Use verified material-specific drilling capacities in the observed shape `{material}: {n} mm, {material}: {n} mm`. Preserve colon-space, comma-space, and the space before mm; keep each capacity paired with its actual material.

## attributes__chuck_size

Use the verified chuck size in the observed shape `{n} mm`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__speed

Use the verified speed specification in context as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__no_of_speed_settings

Use the verified speed-setting count as number-only text, shape `{n}`, with no added unit or label. Preserve identifiers/notation rather than performing arithmetic on the sample.

## attributes__reverse_function

Use `Yes` or `No` for the verified reverse-stitch capability, matching the sample capability format and case. Preserve unknowns under existing blank handling; an unstated feature is not No.

## attributes__cord_length

Use the verified cord length in the observed shape `{n}m`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__special_features

Use verified distinctive features as concise plain-text entries separated by a comma and one space: `{entry}, {entry}`.

## attributes__features

Use verified product features as concise plain-text entries separated by a comma and one space: `{entry}, {entry}`.

## attributes__safety_features

Use verified verified safety features as concise plain-text entries separated by a comma and one space: `{entry}, {entry}`. Claims and certifications need source support; the example feature set is not a default.

## attributes__usage

Use the verified intended uses as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__care_instructions

Use the verified care instructions as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__other_information

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified additional relevant product information as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__note

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified product-specific caveats as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__country_of_origin

Use the verified manufacturing country name as concise plain text, preserving official names, meaningful case, and punctuation. Use the manufacturing country from evidence rather than brand origin or seller location.
