# Elec-Audio-Soundbars&Speakers: sample-format mapping rules

Source: `OneDrive_2_10-15-2026/Elec-Audio-Soundbars&Speakers.xls`, sheet `Sheet1`. Catalog headers: row 2, left to right. Sample product row 3. Row 1 contains merged group labels; other populated rows are annotations, as explained below.

Learn formatting only. Obtain actual facts from SAP first, then other verified evidence where the existing workflow permits. Existing supplied values and missing-value handling remain governed by the application. Sample identities, claims, quantities, and classifications are never defaults or allowed-value lists. Placeholder examples show shape only and must never be emitted literally.

Keep the exact headers and their order. The six application pass-through fields are sku, base_code, attributes__lulu_ean, attributes__shipping_weight, attributes__brand, and attributes__lulu_product_type. Name may be generated only when missing. No required/optional classifications or IDQ flags are inferred. Blank samples establish neither optionality nor absence; fallback advice is explicitly labeled. Units/spacing are specific to this template; a single sample does not establish fixed precision. Qualifiers such as Up to and Approx. apply only when current source facts support them.

### Source annotations and unresolved metadata

Lower-row metadata is retained as source guidance only: row 7: `Mandatory Attributes`; row 8: `attributes__wattage`; row 9: `attributes__connectivity`.

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

## attributes__in_the_box

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified actual box contents as concise plain text with its actual source units/labels where relevant.

## attributes__brand

Application pass-through: preserve the supplied SAP brand exactly; sample brand names are never defaults.

## attributes__lulu_product_type

Application pass-through: preserve the supplied SAP product type under this exact canonical key. Do not add a legacy attributes__product_type alias.

## attributes__model

Use the verified model identifier as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__color

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified marketed color as concise plain text with its actual source units/labels where relevant.

## attributes__product_dimensions

Use verified product measurements in the observed shape `L{length} × W{width} × H{height} cm`. Preserve axis labels/order, exact x versus × separator, spacing, and unit. Keep product and package measurements separate and convert only from known measurements.

## attributes__package_dimensions

Use verified package measurements in the observed shape `L{length} × W{width} × H{height} cm`. Preserve axis labels/order, exact x versus × separator, spacing, and unit. Keep product and package measurements separate and convert only from known measurements.

## attributes__weight

Use the verified product weight in the observed shape `{n} kg`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Keep product weight separate from pass-through shipping weight.

## attributes__audio

Use verified supported audio modes/technologies as concise plain-text entries separated by a comma and one space: `{entry}, {entry}`.

## attributes__driver_size

Use verified component-labeled driver sizes in the observed shape `{component}: {n} inches, {component}: {n} inches`. Preserve the colon-space, comma-space, and space before inches; label the actual components rather than guessing their roles.

## attributes__frequency_range

Use the verified audio frequency range in the observed shape `{min} Hz – {max} kHz`. Preserve the en dash with spaces, explicit units at both endpoints, and meaningful source precision; convert scales only from known source measurements.

## attributes__impedance

Use the verified electrical impedance in the observed shape `{n} Ohms`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__subwoofer

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified subwoofer support/type as concise plain text with its actual source units/labels where relevant.

## attributes__channel_configuration

Preserve the verified audio channel notation as text, shape `{main channels}.{subwoofer channels}`. The dot separates channel components; do not treat it as an ordinary decimal or round it.

## attributes__no_of_channels

Sample cell is blank: no sample format evidence. Semantic fallback only: Preserve verified audio channel notation, including meaningful decimal subwoofer notation; it is not an ordinary integer count.

## attributes__no_of_speakers

Use the verified speaker count as number-only text, shape `{n}`, with no added unit or label. Preserve identifiers/notation rather than performing arithmetic on the sample.

## attributes__power

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified rated power as concise plain text with its actual source units/labels where relevant.

## attributes__wattage

Use the verified rated wattage in the observed shape `{n}W`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__battery_capacity

Sample cell is blank: no sample format evidence. Semantic fallback only: Use an explicit verified battery specification with its real unit or battery-size/count basis; neither mAh nor a count is established here.

## attributes__battery_type

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified battery chemistry/size/type as concise plain text with its actual source units/labels where relevant.

## attributes__battery_life

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified battery life under stated usage conditions as concise plain text with its actual source units/labels where relevant.

## attributes__playback_time

Sample cell is blank: no sample format evidence. Semantic fallback only: Use a verified playback duration with its actual unit and conditions; do not substitute standby or charging time.

## attributes__charging_time

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified charging duration as concise plain text with its actual source units/labels where relevant.

## attributes__charging_type

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified charging method/connector as concise plain text with its actual source units/labels where relevant.

## attributes__runtime

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified operating duration under stated conditions as concise plain text with its actual source units/labels where relevant.

## attributes__connectivity

Use the verified connection methods as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__bluetooth

Use the verified Bluetooth version in the observed shape `v{major}.{minor}`, retaining lowercase v and the dot. This sample supplies a version, not a Yes/No flag; do not replace it with a boolean.

## attributes__wifi

Sample cell is blank: no sample format evidence. Semantic fallback only: Use a verified Wi-Fi standard or capability value with its source context; do not invent a generation or absence claim.

## attributes__nfc

Sample cell is blank: no sample format evidence. Semantic fallback only: Use an explicitly supported NFC capability specification; an unstated capability is not No.

## attributes__ports

Use verified port/connector specifications as concise plain-text entries separated by a comma and one space: `{entry}, {entry}`.

## attributes__hdmi

Use the verified HDMI port specification/count in the observed shape `{n} ea`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__usb

Use verified connector counts in the observed shape `{count} x {connector type}`, with lowercase x and spaces. Preserve connector designations from evidence; this is not a Yes/No field in this template.

## attributes__aux

Use verified connector counts in the observed shape `{count} x {connector type}`, with lowercase x and spaces. Preserve connector designations from evidence; this is not a Yes/No field in this template.

## attributes__compatible_devices

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified compatible device names/classes as concise plain text with its actual source units/labels where relevant.

## attributes__features

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified product features as concise plain text with its actual source units/labels where relevant.

## attributes__control

Use the verified control method as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__mic

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified microphone capability as concise plain text with its actual source units/labels where relevant.

## attributes__range

Use the verified operating/connection range in the observed shape `Up to {n}m`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__design

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified design/style as concise plain text with its actual source units/labels where relevant.

## attributes__ip_rating

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified certified IP protection rating as concise plain text with its actual source units/labels where relevant.

## attributes__water_resistance

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified water-resistance claim as concise plain text with its actual source units/labels where relevant.

## attributes__mounting_type

Use supported mounting methods in the observed slash-separated shape `{mounting method}/{mounting method}`, with no spaces around the slash. Do not invent a second method.

## attributes__cable_length

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified cable length as concise plain text with its actual source units/labels where relevant.

## attributes__country_of_origin

Use the verified manufacturing country name as concise plain text, preserving official names, meaningful case, and punctuation. Use the manufacturing country from evidence rather than brand origin or seller location.

## attributes__other_information

Use verified additional relevant product information as concise plain-text entries separated by a comma and one space: `{entry}, {entry}`. Include only additional relevant facts that do not fit another field.

## attributes__voltage

Use the verified electrical input voltage in the observed shape `{min}–{max}V`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## note

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified product-specific caveats as concise plain text with its actual source units/labels where relevant.
