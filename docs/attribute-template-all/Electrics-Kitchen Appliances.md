# Electrics-Kitchen Appliances: sample-format mapping rules

Source: `OneDrive_2_10-15-2026/Electrics-Kitchen Appliances.xls`, sheet `Sheet1`. Catalog headers: row 2, in the reviewed manifest order. Sample product rows: 3. Grouping labels and lower-row metadata are excluded from the output headers; reviewed corrections are listed below.

Learn formatting only. Obtain actual facts from SAP first, then other verified evidence where the existing workflow permits. Existing supplied values and missing-value handling remain governed by the application. Sample identities, claims, quantities, and classifications are never defaults or allowed-value lists. Placeholder examples show shape only and must never be emitted literally.

Keep the exact headers and their order. The six application pass-through fields are sku, base_code, attributes__lulu_ean, attributes__shipping_weight, attributes__brand, and attributes__lulu_product_type. Name may be generated only when missing. No required/optional classifications or IDQ flags are inferred. Blank samples establish neither optionality nor absence; fallback advice is explicitly labeled. Units/spacing are specific to this template; a single sample does not establish fixed precision. Qualifiers such as Up to and Approx. apply only when current source facts support them.

### Source annotations and unresolved metadata

Lower-row metadata is retained as source guidance only: row 5: `Mandatory Attributes`; row 6: `attributes__size/capacity`.

Mandatory labels, slash alternatives, new-header labels, and misspelled references do not add output columns, IDQ flags, or required/optional classifications. Actual row-2 keys govern output.

Reviewed source/header corrections: Collapsed repeated attributes__power_consumption at BO2 into its first position. Preserved the existing Catalog output header list and order.

The literal output key is `note`; preserve it rather than renaming it to attributes__note.

## sku

Application pass-through: preserve the supplied SAP sku as exact identifier text, including meaningful punctuation and leading zeroes. Do not generate or copy sample identifiers.

## base_code

Application pass-through: preserve the supplied SAP base code as exact identifier text, including meaningful punctuation and leading zeroes. Do not generate or copy sample identifiers.

## attributes__lulu_ean

Application pass-through: preserve the supplied SAP lulu ean as exact identifier text, including meaningful punctuation and leading zeroes. Do not generate or copy sample identifiers.

## attributes__shipping_weight

Application pass-through: preserve the supplied SAP shipping-weight value and its established application unit. Do not derive it from product weight or copy a sample weight.

## attributes__keywords

Use relevant lower-case search phrases separated by commas without following spaces: `{product phrase},{feature phrase}`. Select phrases from the current product facts.

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

## attributes__brand

Application pass-through: preserve the supplied SAP brand exactly; sample brand names are never defaults.

## attributes__lulu_product_type

Application pass-through: preserve the supplied SAP product type under this exact canonical key. Do not add a legacy attributes__product_type alias.

## attributes__model

Use verified model identifier as concise plain text. The sample uses slash-separated entries, shape `{entry}/{entry}`; select applicable supported entries rather than copying every example alternative or treating them as an allowed-value enum.

## attributes__no_of_pieces

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified piece count as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__package_contents

Use verified supplied items with quantities in the observed shape `{count} x {item}`; separate multiple entries with a comma and one space. Preserve the quantity separator and spacing; include only verified contents.

## attributes__pack

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified pack composition/count as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__in_the_box

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified actual box contents as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__product_dimensions

Use verified product dimensions in the observed shape `L{length} × W{width} × H{height} cm`. Preserve axis labels/order, exact x versus × separator, spacing, and unit. Keep product and package measurements separate and convert only from known measurements.

## attributes__package_dimensions

Use verified package dimensions in the observed shape `L{length} × W{width} × H{height} cm`. Preserve axis labels/order, exact x versus × separator, spacing, and unit. Keep product and package measurements separate and convert only from known measurements.

## attributes__weight

Use the verified product weight in the observed shape `{n} kg`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Keep product weight separate from pass-through shipping weight.

## attributes__size

Use the verified stated product size in the observed shape `{n}L`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__screen_size

Sample cell is blank: no sample format evidence. Semantic fallback only: Use a verified display diagonal with its actual unit; do not derive it from product dimensions.

## attributes__cord_length

Use the verified cord length in the observed shape `{n}m`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__usage

Use verified intended uses as concise plain-text entries separated by a comma and one space: `{entry}, {entry}`.

## attributes__noise_level

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified noise measurement and operating conditions as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__dishwasher_safe

Use `Yes` or `No` for the verified dishwasher suitability, matching the sample capability format and case. Preserve unknowns under existing blank handling; an unstated feature is not No.

## attributes__microwave_safe

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified microwave suitability as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__display_type

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified display technology/type as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__power_indicator

Use `Yes` or `No` for the verified power-indicator specification, matching the sample capability format and case. Preserve unknowns under existing blank handling; an unstated feature is not No.

## attributes__material

Use the verified material or composition as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__inner_material

Use the verified inner/lining material as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__base_material

Use the verified base material as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__coating

Use the verified surface coating as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__handle_type

Use the verified handle type as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__attachments

Use verified supplied attachments as concise plain-text entries separated by a comma and one space: `{entry}, {entry}`. List supplied attachments only; infer neither inclusion nor count.

## attributes__induction_base

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified induction-base construction/suitability as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__color

Use the verified marketed color as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__capacity

Use the verified function-specific capacity in the observed shape `{n}L`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Keep the supported function and volume/load basis distinct from other capacity fields.

## attributes__tank_capacity

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified tank volume as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__oven_capacity

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified oven volume as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__no_of_blades

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified blade count as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__blade_material

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified blade material as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__no_of_programs

Use the verified programme count as number-only text, shape `{n}`, with no added unit or label. Preserve identifiers/notation rather than performing arithmetic on the sample. A partial programme list does not establish a total count.

## attributes__no_of_speed_settings

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified speed-setting count as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__functions

Use verified supported functions as concise plain-text entries separated by a comma and one space: `{entry}, {entry}`.

## attributes__programs

Use verified programme names as concise plain-text entries separated by a comma and one space: `{entry}, {entry}`.

## attributes__power

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified rated power as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__power_consumption

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified power consumption as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__wattage

Use the verified rated wattage in the observed shape `{n}W`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__voltage

Use the verified electrical input voltage in the observed shape `{min}–{max}V`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__frequency_range

Use the verified frequency specification in its actual technical context in the observed shape `{min}–{max} Hz`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Preserve the actual audio, radio, or electrical-supply context and units.

## attributes__speed

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified speed specification in context as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__rpm

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified rotational speed with its stated RPM unit/basis; speed-setting count is not RPM.

## attributes__temperature_setting

Use the verified temperature range in the observed shape `{min}°C – {max}°C Adjustable`. Preserve °C at both endpoints, the actual range separator, and spacing; state adjustability only when verified.

## attributes__power_source

Use the verified actual power source as concise plain text, preserving official names, meaningful case, and punctuation. Use a source/type label, not a Yes/No value inferred from the header. The populated sample uses descriptive text, not a Yes/No flag.

## attributes__control

Use the verified control method as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__iot_connectivity

Sample cell is blank: no sample format evidence. Semantic fallback only: Use the verified platform/app or capability specification; no Yes/No or platform-name format is established here.

## attributes__safety_features

Use verified verified safety features as concise plain-text entries separated by a comma and one space: `{entry}, {entry}`. Claims and certifications need source support; the example feature set is not a default.

## attributes__care_instructions

Use verified care instructions as concise plain-text entries separated by a comma and one space: `{entry}, {entry}`.

## attributes__model_year

Use the verified model year as four-digit text, shape `YYYY`; do not replace it with the current year or the sample year.

## attributes__country_of_origin

Use the verified manufacturing country name as concise plain text, preserving official names, meaningful case, and punctuation. Use the manufacturing country from evidence rather than brand origin or seller location.

## attributes__features

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified product features as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__other_information

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified additional relevant product information as concise plain text; preserve its source representation because no template-specific style is established.

## note

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified product-specific caveats as concise plain text; preserve its source representation because no template-specific style is established.
