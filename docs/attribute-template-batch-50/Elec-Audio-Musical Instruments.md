# Elec-Audio-Musical Instruments: sample-format mapping rules

Source: `OneDrive_2_10-15-2026/Elec-Audio-Musical Instruments.xls`, sheet `Musical Instruments`. Catalog headers: row 2, left to right. Sample product row 3. Row 1 contains merged group labels; other populated rows are annotations, as explained below.

Learn formatting only. Obtain actual facts from SAP first, then other verified evidence where the existing workflow permits. Existing supplied values and missing-value handling remain governed by the application. Sample identities, claims, quantities, and classifications are never defaults or allowed-value lists. Placeholder examples show shape only and must never be emitted literally.

Keep the exact headers and their order. The six application pass-through fields are sku, base_code, attributes__lulu_ean, attributes__shipping_weight, attributes__brand, and attributes__lulu_product_type. Name may be generated only when missing. No required/optional classifications or IDQ flags are inferred. Blank samples establish neither optionality nor absence; fallback advice is explicitly labeled. Units/spacing are specific to this template; a single sample does not establish fixed precision. Qualifiers such as Up to and Approx. apply only when current source facts support them.

### Source annotations and unresolved metadata

No populated lower-row annotations are supplied. Sample content does not establish mandatory fields.

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

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified piece count as concise plain text with its actual source units/labels where relevant.

## attributes__pack

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified pack composition/count as concise plain text with its actual source units/labels where relevant.

## attributes__package_contents

Use verified supplied items with quantities in the observed shape `{count} x {item}`; separate multiple entries with a comma and one space. Preserve the quantity separator and spacing; include only verified contents.

## attributes__in_the_box

Use verified supplied items with quantities in the observed shape `{count} x {item}`; separate multiple entries with a comma and one space. Preserve the quantity separator and spacing; include only verified contents.

## attributes__accessories

Use the verified included accessories as concise plain text, preserving official names, meaningful case, and punctuation. List included accessories only; compatibility alone does not establish inclusion.

## attributes__product_dimensions

Use verified product measurements in the observed shape `W{width} x D{depth} x H{height} cm`. Preserve axis labels/order, exact x versus × separator, spacing, and unit. Keep product and package measurements separate and convert only from known measurements.

## attributes__package_dimensions

Use verified package measurements in the observed shape `W{width} x D{depth} x H{height} cm`. Preserve axis labels/order, exact x versus × separator, spacing, and unit. Keep product and package measurements separate and convert only from known measurements.

## attributes__weight

Use the verified product weight in the observed shape `{n} kg`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Keep product weight separate from pass-through shipping weight.

## attributes__audio

Use the verified supported audio modes/technologies as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__frequency_range

Use the verified audio frequency range in the observed shape `{min} Hz – {max} kHz`. Preserve the en dash with spaces, explicit units at both endpoints, and meaningful source precision; convert scales only from known source measurements.

## attributes__impedance

Use the verified electrical impedance in the observed shape `{min} to {max} Ohms`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Preserve source thousands grouping for large quantities.

## attributes__volume

Use the verified audio output/sound-level specification in the observed shape `{n} dB`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__no_of_channels

Use the verified audio channel configuration as number-only text, shape `{n}`, with no added unit or label. Preserve identifiers/notation rather than performing arithmetic on the sample.

## attributes__no_of_speakers

Use the verified speaker count as number-only text, shape `{n}`, with no added unit or label. Preserve identifiers/notation rather than performing arithmetic on the sample.

## attributes__mic

Use `Yes` or `No` for the verified microphone capability, matching the sample capability format. Preserve unknowns under existing blank handling; an unstated feature is not No.

## attributes__no_of_keys

Use the verified key count as number-only text, shape `{n}`, with no added unit or label. Preserve identifiers/notation rather than performing arithmetic on the sample.

## attributes__tuner_technology

Use the verified tuning technology as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__scale

Use the verified musical scale as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__tone

Use the verified tone/program designation in the observed shape `Tone {code}`. Preserve meaningful leading zeroes in the code rather than converting it to a number.

## attributes__sound_modes

Use the verified sound modes as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__connectivity

Use the verified connection methods as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__bluetooth

Use `Yes` or `No` for the verified Bluetooth capability/version, matching the sample capability format. Preserve unknowns under existing blank handling; an unstated feature is not No.

## attributes__usb

Use `Yes` or `No` for the verified USB connection/version/connector specification, matching the sample capability format. Preserve unknowns under existing blank handling; an unstated feature is not No.

## attributes__aux

Use `Yes` or `No` for the verified auxiliary input/connection specification, matching the sample capability format. Preserve unknowns under existing blank handling; an unstated feature is not No.

## attributes__ports

Use the verified port/connector specifications as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__interfaces

Use the verified interface names/types as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__power

Use the verified rated power in the observed shape `{n}W`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__battery_capacity

Use the verified battery capacity or battery-size/count specification in the observed shape `{n} mAh`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Keep electrical capacity distinct from battery chemistry, battery quantity, and runtime.

## attributes__battery_life

Use the verified battery life under stated usage conditions in the observed shape `{n} hours`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Keep stated usage/test conditions; do not substitute charging time.

## attributes__charging_time

Use the verified charging duration in the observed shape `{n} hours`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Express time to charge, not operating or standby duration.

## attributes__material

Use the verified material or composition as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__design

Use the verified design/style as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__form_factor

Use the verified form factor as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__finish

Use the verified surface finish as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__features

Use the verified product features as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__special_features

Use the verified distinctive features as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__functions

Use the verified supported functions as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__control

Use the verified control method as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__display_type

Use the verified display technology/type as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__display_feature

Use the verified display features as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__light_effect

Use the verified lighting effect specification as concise plain text, preserving official names, meaningful case, and punctuation. An explicit absence label is appropriate only when supported; unknown is not an absence claim.

## attributes__compatible_devices

Use verified compatible device names/classes as concise plain-text entries separated by a comma and one space: `{entry}, {entry}`. Use only supported devices; brand/category similarity is not compatibility evidence.

## attributes__compatible_models

Use the verified compatible model/series identifiers as concise plain text, preserving official names, meaningful case, and punctuation. Use exact supported model identifiers; compatibility with one example never establishes universal support.

## attributes__other_information

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified additional relevant product information as concise plain text with its actual source units/labels where relevant.

## attributes__note

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified product-specific caveats as concise plain text with its actual source units/labels where relevant.

## attributes__country_of_origin

Use the verified manufacturing country name as concise plain text, preserving official names, meaningful case, and punctuation. Use the manufacturing country from evidence rather than brand origin or seller location.
