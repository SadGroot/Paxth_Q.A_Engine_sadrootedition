# Elec-LA-Air Conditioners: sample-format mapping rules

Source: `OneDrive_2_10-15-2026/Elec-LA-Air Conditioners.xls`, sheet `Air Conditioners`. Catalog headers: row 2, in the reviewed manifest order. Sample product rows: 3. Grouping labels and lower-row metadata are excluded from the output headers; reviewed corrections are listed below.

Learn formatting only. Obtain actual facts from SAP first, then other verified evidence where the existing workflow permits. Existing supplied values and missing-value handling remain governed by the application. Sample identities, claims, quantities, and classifications are never defaults or allowed-value lists. Placeholder examples show shape only and must never be emitted literally.

Keep the exact headers and their order. The six application pass-through fields are sku, base_code, attributes__lulu_ean, attributes__shipping_weight, attributes__brand, and attributes__lulu_product_type. Name may be generated only when missing. No required/optional classifications or IDQ flags are inferred. Blank samples establish neither optionality nor absence; fallback advice is explicitly labeled. Units/spacing are specific to this template; a single sample does not establish fixed precision. Qualifiers such as Up to and Approx. apply only when current source facts support them.

### Source annotations and unresolved metadata

Lower-row metadata is retained as source guidance only: row 6: `Mandatory attributes`; row 7: `attributes__capacity/attributes__cooling_capacity`; row 8: `attributes__compressor`.

Mandatory labels, slash alternatives, new-header labels, and misspelled references do not add output columns, IDQ flags, or required/optional classifications. Actual row-2 keys govern output.

Explicit bullet priorities are applied by their literal column alignment: `attributes__bullet_point_1` → Capacity; `attributes__bullet_point_2` → Compressor; `attributes__bullet_point_3` → Cooling capacity; `attributes__bullet_point_4` → Features; `attributes__bullet_point_5` → Functions; `attributes__bullet_point_6` → Connectivity.

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

## attributes__product_name

Use a verified plain-text display name: `{Brand} {product/type} {key specification}, {verified distinguishing detail}, {model}`. Preserve a supplied value; omit unsupported parts and never copy the sample identity.

## attributes__bullet_point_1

Explicit template priority: Capacity. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_2

Explicit template priority: Compressor. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_3

Explicit template priority: Cooling capacity. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_4

Explicit template priority: Features. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_5

Explicit template priority: Functions. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_6

Explicit template priority: Connectivity. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__product_description

Write readable factual plain-text paragraphs separated by a blank line, following the sample layout; its paragraph count is not a requirement. No sample contains HTML; this template establishes no HTML requirement.

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

## attributes__mounting_type

Use the verified mounting method as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__installation

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified installation type as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__ideal_for

Use the verified intended audience/use environments as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__climate_class

Use the verified climate-class designation as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__finish

Use the verified surface finish as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__capacity

Use the verified function-specific capacity in the observed shape `{n} ton`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Keep the supported function and volume/load basis distinct from other capacity fields.

## attributes__cooling_capacity

Use the verified cooling-capacity specification in its actual power/coverage context in the observed shape `{n}W`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__coverage

Use the verified coverage specification in its actual technical context in the observed shape `Up to {n} sq ft`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Keep area, treatment-head area, or throughput context from the source; the same header is not always an area.

## attributes__compressor

Use the verified compressor type as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__cooling_system

Use the verified cooling technology as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__refrigerant

Use the verified refrigerant designation as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__air_swing

Use `Yes` or `No` for the verified air-swing capability, matching the sample capability format and case. Preserve unknowns under existing blank handling; an unstated feature is not No.

## attributes__temperature_settings

Use the verified temperature range in the observed shape `{min}°C to {max}°C`. Preserve °C at both endpoints, the actual range separator, and spacing; state adjustability only when verified.

## attributes__product_dimensions

Use verified product dimensions in the observed shape `W{width} x D{depth} x H{height} cm`. Preserve axis labels/order, exact x versus × separator, spacing, and unit. Keep product and package measurements separate and convert only from known measurements.

## attributes__package_dimensions

Use verified package dimensions in the observed shape `W{width} x D{depth} x H{height} cm`. Preserve axis labels/order, exact x versus × separator, spacing, and unit. Keep product and package measurements separate and convert only from known measurements.

## attributes__weight

Use the verified product weight in the observed shape `{n} kg`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Keep product weight separate from pass-through shipping weight.

## attributes__indoor_unit_dimensions

Use verified indoor-unit dimensions in the observed shape `W{width} x D{depth} x H{height} cm`. Preserve axis labels/order, exact x versus × separator, spacing, and unit. Keep product and package measurements separate and convert only from known measurements.

## attributes__indoor_unit_weight

Use the verified indoor-unit weight in the observed shape `{n} kg`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__outdoor_unit_dimensions

Use verified outdoor-unit dimensions in the observed shape `W{width} x D{depth} x H{height} cm`. Preserve axis labels/order, exact x versus × separator, spacing, and unit. Keep product and package measurements separate and convert only from known measurements.

## attributes__outdoor_unit_weight

Use the verified outdoor-unit weight in the observed shape `{n} kg`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__installation_dimension

Use the verified installation/cutout dimensions as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__features

Use verified product features as concise plain-text entries separated by a comma and one space: `{entry}, {entry}`.

## attributes__special_features

Use the verified distinctive features as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__functions

Use verified supported functions as concise plain-text entries separated by a comma and one space: `{entry}, {entry}`.

## attributes__display_type

Use the verified display technology/type as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__remote

Use the verified remote-control capability as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__filter

Use the verified filter type/technology as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__no_of_filters

Use the verified filter count as number-only text, shape `{n}`, with no added unit or label. Preserve identifiers/notation rather than performing arithmetic on the sample.

## attributes__moisture_removal

Use `Yes` or `No` for the verified moisture-removal rate, matching the sample capability format and case. Preserve unknowns under existing blank handling; an unstated feature is not No.

## attributes__wattage

Use the verified rated wattage in the observed shape `{n}W`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__power_consumption

Use the verified power consumption in the observed shape `{n}W`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__energy_consumption

Use the verified energy consumption over its stated period in the observed shape `{n} kWh/year`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__voltage

Use the verified electrical input voltage in the observed shape `{min}-{max} V`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__frequency_range

Use the verified frequency specification in its actual technical context in the observed shape `{n} Hz`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Preserve the actual audio, radio, or electrical-supply context and units.

## attributes__noise_level

Use the verified noise measurement and operating conditions in the observed shape `{n} dB`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__indoor_noise_level

Use the verified indoor-unit noise level in the observed shape `{n} dB`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__outdoor_noise_level

Use the verified outdoor-unit noise level in the observed shape `{n} dB`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__connectivity

Use the verified connection methods as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__iot_connectivity

Use `Yes` or `No` for the verified connected platform/app or IoT capability, matching the sample capability format and case. Preserve unknowns under existing blank handling; an unstated feature is not No.

## attributes__wifi

Use `Yes` or `No` for the verified Wi-Fi capability/standard, matching the sample capability format and case. Preserve unknowns under existing blank handling; an unstated feature is not No.

## attributes__supported_apps

Use the verified supported application names/compatibility as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__cord_length

Use the verified cord length in the observed shape `{n}m`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__plug_type

Use the verified plug designation in the observed shape `{count}-pin plug`. Preserve its hyphen/space and label case; a pin count alone does not establish a regional standard.

## attributes__safety_features

Use the verified verified safety features as concise plain text, preserving official names, meaningful case, and punctuation. Claims and certifications need source support; the example feature set is not a default.

## attributes__safety_standards

Use the verified verified safety standards/certifications as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__no_of_pieces

Use the verified piece count as number-only text, shape `{n}`, with no added unit or label. Preserve identifiers/notation rather than performing arithmetic on the sample.

## attributes__pack

Use the verified pack composition/count as number-only text, shape `{n}`, with no added unit or label. Preserve identifiers/notation rather than performing arithmetic on the sample.

## attributes__package_contents

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified included package items as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__in_the_box

Use verified actual box contents as concise plain-text entries separated by a comma and one space: `{entry}, {entry}`. Keep actual box contents distinct from separately sold compatible accessories.

## attributes__other_information

Use the verified additional relevant product information as concise plain text, preserving official names, meaningful case, and punctuation. Include only additional relevant facts that do not fit another field.

## attributes__note

Use the verified product-specific caveats as concise plain text, preserving official names, meaningful case, and punctuation. Use only applicable caveats; sample warranty/region statements are not defaults.

## attributes__country_of_origin

Use the verified manufacturing country name as concise plain text, preserving official names, meaningful case, and punctuation. Use the manufacturing country from evidence rather than brand origin or seller location.
