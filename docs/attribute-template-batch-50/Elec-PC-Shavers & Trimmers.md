# Elec-PC-Shavers & Trimmers: sample-format mapping rules

Source: `OneDrive_2_10-15-2026/Elec-PC-Shavers & Trimmers.xls`, sheet `Shavers & Trimmers`. Catalog headers: row 2, left to right. Sample product row 3. Row 1 contains merged group labels; other populated rows are annotations, as explained below.

Learn formatting only. Obtain actual facts from SAP first, then other verified evidence where the existing workflow permits. Existing supplied values and missing-value handling remain governed by the application. Sample identities, claims, quantities, and classifications are never defaults or allowed-value lists. Placeholder examples show shape only and must never be emitted literally.

Keep the exact headers and their order. The six application pass-through fields are sku, base_code, attributes__lulu_ean, attributes__shipping_weight, attributes__brand, and attributes__lulu_product_type. Name may be generated only when missing. No required/optional classifications or IDQ flags are inferred. Blank samples establish neither optionality nor absence; fallback advice is explicitly labeled. Units/spacing are specific to this template; a single sample does not establish fixed precision. Qualifiers such as Up to and Approx. apply only when current source facts support them.

### Source annotations and unresolved metadata

Lower-row metadata is retained as source guidance only: row 5: `Mandatory attributes`; row 6: `attributes__blade_material`; row 7: `attributes__no_of_blades`; row 8: `attributes__runtime`; row 9: `attributes__wattage`.

Mandatory labels, slash alternatives, new-header labels, and misspelled references do not add output columns, IDQ flags, or required/optional classifications. Actual row-2 keys govern output.

Explicit bullet priorities are applied by their literal column alignment: `attributes__bullet_point_1` → blade material; `attributes__bullet_point_2` → battery capacity; `attributes__bullet_point_3` → runtime; `attributes__bullet_point_4` → Features; `attributes__bullet_point_5` → Features; `attributes__bullet_point_6` → Features.

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

Explicit template priority: blade material. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_2

Explicit template priority: battery capacity. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_3

Explicit template priority: runtime. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_4

Explicit template priority: Features. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_5

Explicit template priority: Features. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_6

Explicit template priority: Features. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__product_description

Write a factual plain-text paragraph, following the single-paragraph sample layout; the short example does not establish a fixed length. No sample contains HTML; this template establishes no HTML requirement.

## attributes__keywords

Use relevant lower-case space-separated keyword tokens, following `{product} {type} {feature}`. The sample does not use commas.

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

Use verified actual box contents as concise plain-text entries separated by a comma and one space: `{entry}, {entry}`. Keep actual box contents distinct from separately sold compatible accessories.

## attributes__accessories

Use the verified included accessories as concise plain text, preserving official names, meaningful case, and punctuation. List included accessories only; compatibility alone does not establish inclusion.

## attributes__attachments

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified supplied attachments as concise plain text with its actual source units/labels where relevant.

## attributes__number_of_attachments__clips

Use the verified attachment/clip count as number-only text, shape `{n}`, with no added unit or label. Preserve identifiers/notation rather than performing arithmetic on the sample.

## attributes__product_dimensions

Use verified product measurements in the observed shape `W{width} x D{depth} x H{height} cm`. Preserve axis labels/order, exact x versus × separator, spacing, and unit. Keep product and package measurements separate and convert only from known measurements.

## attributes__package_dimensions

Use verified package measurements in the observed shape `W{width} x D{depth} x H{height} cm`. Preserve axis labels/order, exact x versus × separator, spacing, and unit. Keep product and package measurements separate and convert only from known measurements.

## attributes__weight

Use the verified product weight in the observed shape `{n}g`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Keep product weight separate from pass-through shipping weight.

## attributes__blade_material

Use the verified blade material as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__no_of_blades

Use the verified blade count as number-only text, shape `{n}`, with no added unit or label. Preserve identifiers/notation rather than performing arithmetic on the sample.

## attributes__rpm

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified rotational speed with its stated RPM unit/basis; speed-setting count is not RPM.

## attributes__no_of_speed_settings

Use the verified speed-setting count as number-only text, shape `{n}`, with no added unit or label. Preserve identifiers/notation rather than performing arithmetic on the sample.

## attributes__usage

Use the verified intended uses as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__ideal_for

Use the verified intended audience/use environments as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__functions

Use the verified supported functions as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__wattage

Use the verified rated wattage in the observed shape `{n}W`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__voltage

Use the verified electrical input voltage in the observed shape `{n} V`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__rechargable

Use `Yes` or `No` for the verified rechargeability, matching the sample capability format. Preserve unknowns under existing blank handling; an unstated feature is not No.

## attributes__battery_type

Use the verified battery chemistry/size/type as concise plain text, preserving official names, meaningful case, and punctuation. Preserve the specified chemistry/size; do not derive it from runtime.

## attributes__battery_capacity

Use the verified battery capacity or battery-size/count specification in the observed shape `{n} mAh`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Keep electrical capacity distinct from battery chemistry, battery quantity, and runtime.

## attributes__battery_life

Use the verified battery life under stated usage conditions in the observed shape `{n} minutes`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Keep stated usage/test conditions; do not substitute charging time.

## attributes__runtime

Use the verified operating duration under stated conditions in the observed shape `{n} minutes`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Keep stated operating conditions; do not assume it equals battery life.

## attributes__charging_time

Use the verified charging duration in the observed shape `{n} hours`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Express time to charge, not operating or standby duration.

## attributes__charging_type

Use the verified charging method/connector as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__material

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified material or composition as concise plain text with its actual source units/labels where relevant.

## attributes__water_resistance

Use `Yes` or `No` for the verified water-resistance claim, matching the sample capability format. Preserve unknowns under existing blank handling; an unstated feature is not No.

## attributes__ip_rating

Preserve the exact verified IP protection token as `IP{rating}`, including any X. Do not infer a certification from a generic water-resistance claim.

## attributes__design

Use the verified design/style as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__cord_length

Use the verified cord length in the observed shape `{n} m`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__features

Use the verified product features as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__other_information

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified additional relevant product information as concise plain text with its actual source units/labels where relevant.

## attributes__note

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified product-specific caveats as concise plain text with its actual source units/labels where relevant.

## attributes__country_of_origin

Use the verified manufacturing country name as concise plain text, preserving official names, meaningful case, and punctuation. Use the manufacturing country from evidence rather than brand origin or seller location.
