# Elec-HA-Air Purifiers: sample-format mapping rules

Source: `OneDrive_2_10-15-2026/Elec-HA-Air Purifiers.xls`, sheet `Sheet1`. Catalog headers: row 2, left to right. Sample product row 3. Row 1 contains merged group labels; other populated rows are annotations, as explained below.

Learn formatting only. Obtain actual facts from SAP first, then other verified evidence where the existing workflow permits. Existing supplied values and missing-value handling remain governed by the application. Sample identities, claims, quantities, and classifications are never defaults or allowed-value lists. Placeholder examples show shape only and must never be emitted literally.

Keep the exact headers and their order. The six application pass-through fields are sku, base_code, attributes__lulu_ean, attributes__shipping_weight, attributes__brand, and attributes__lulu_product_type. Name may be generated only when missing. No required/optional classifications or IDQ flags are inferred. Blank samples establish neither optionality nor absence; fallback advice is explicitly labeled. Units/spacing are specific to this template; a single sample does not establish fixed precision. Qualifiers such as Up to and Approx. apply only when current source facts support them.

### Source annotations and unresolved metadata

Lower-row metadata is retained as source guidance only: row 5: `Mandatory Attributes`; row 6: `attributes__coverage`; row 7: `attributes__indoor_outdoor_usage`.

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

Sample cell is blank: no sample format evidence. Semantic fallback only: If a supported distinct benefit is available and generation is requested, write concise plain text without a list marker; the blank does not require inventing a sixth claim.

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

## attributes__accessories

Use verified included accessories as concise plain-text entries separated by a comma and one space: `{entry}, {entry}`. List included accessories only; compatibility alone does not establish inclusion.

## attributes__in_the_box

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified actual box contents as concise plain text with its actual source units/labels where relevant.

## attributes__product_dimensions

Use verified product measurements in the observed shape `L{length} × W{width} × H{height} cm`. Preserve axis labels/order, exact x versus × separator, spacing, and unit. Keep product and package measurements separate and convert only from known measurements.

## attributes__package_dimensions

Use verified package measurements in the observed shape `L{length} × W{width} × H{height} cm`. Preserve axis labels/order, exact x versus × separator, spacing, and unit. Keep product and package measurements separate and convert only from known measurements.

## attributes__weight

Use the verified product weight in the observed shape `{n} kg`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Keep product weight separate from pass-through shipping weight.

## attributes__cord_length

Use the verified cord length in the observed shape `{n}m`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__brand

Application pass-through: preserve the supplied SAP brand exactly; sample brand names are never defaults.

## attributes__lulu_product_type

Application pass-through: preserve the supplied SAP product type under this exact canonical key. Do not add a legacy attributes__product_type alias.

## attributes__model

Use the verified model identifier as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__usage

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified intended uses as concise plain text with its actual source units/labels where relevant.

## attributes__coverage

Use the verified coverage specification in its actual technical context in the observed shape `Up to {min}–{max} m²`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Keep area, treatment-head area, or throughput context from the source; the same header is not always an area.

## attributes__indoor_outdoor_usage

Use the verified supported usage location as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__power_source

Use the verified actual power source as concise plain text, preserving official names, meaningful case, and punctuation. Use a source/type label, not a Yes/No value inferred from the header. The populated sample uses descriptive text, not a Yes/No flag.

## attributes__material

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified material or composition as concise plain text with its actual source units/labels where relevant.

## attributes__filter

Use the verified filter type/technology as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__control

Use the verified control method as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__form_factor

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified form factor as concise plain text with its actual source units/labels where relevant.

## attributes__color

Use the verified marketed color as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__tank_capacity

Use the verified tank volume in the observed shape `{n}L`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__display_feature

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified display features as concise plain text with its actual source units/labels where relevant.

## attributes__runtime

Use the verified operating duration under stated conditions in the observed shape `Up to {min}–{max} Hours`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Keep stated operating conditions; do not assume it equals battery life.

## attributes__no_of_speed_settings

Use the verified speed-setting count as number-only text, shape `{n}`, with no added unit or label. Preserve identifiers/notation rather than performing arithmetic on the sample.

## attributes__functions

Use verified supported functions as concise plain-text entries separated by a comma and one space: `{entry}, {entry}`.

## attributes__sensors

Use the verified sensor names/types as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__air_swing

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified air-swing capability as concise plain text with its actual source units/labels where relevant.

## attributes__moisture_removal

Use the verified moisture-removal rate in the observed shape `Up to {n} Liters/Day`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__power

Use the verified rated power in the observed shape `{n}W`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__power_consumption

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified power consumption as concise plain text with its actual source units/labels where relevant.

## attributes__iot_connectivity

Sample cell is blank: no sample format evidence. Semantic fallback only: Use the verified platform/app or capability specification; no Yes/No or platform-name format is established here.

## attributes__remote

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified remote-control capability as concise plain text with its actual source units/labels where relevant.

## attributes__noise_level

Use the verified noise measurement and operating conditions in the observed shape `{n} dB`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__safety_features

Use verified verified safety features as concise plain-text entries separated by a comma and one space: `{entry}, {entry}`. Claims and certifications need source support; the example feature set is not a default.

## attributes__water_resistance

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified water-resistance claim as concise plain text with its actual source units/labels where relevant.

## attributes__features

Use verified product features as concise plain-text entries separated by a comma and one space: `{entry}, {entry}`.

## attributes__special_features

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified distinctive features as concise plain text with its actual source units/labels where relevant.

## attributes__voltage

Use the verified electrical input voltage in the observed shape `{min}–{max}V`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__wattage

Use the verified rated wattage in the observed shape `{n}W`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__other_information

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified additional relevant product information as concise plain text with its actual source units/labels where relevant.

## attributes__compatible_models

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified compatible model/series identifiers as concise plain text with its actual source units/labels where relevant.

## attributes__compatible_devices

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified compatible device names/classes as concise plain text with its actual source units/labels where relevant.

## attributes__installation

Use the verified installation type as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__country_of_origin

Use the verified manufacturing country name as concise plain text, preserving official names, meaningful case, and punctuation. Use the manufacturing country from evidence rather than brand origin or seller location.

## note

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified product-specific caveats as concise plain text with its actual source units/labels where relevant.
