# Elec-M&W-Smartphones & Tablets: sample-format mapping rules

Source: `OneDrive_2_10-15-2026/Elec-M&W-Smartphones & Tablets.xls`, sheet `Smartphones & Tablets`. Catalog headers: row 2, in the reviewed manifest order. Sample product rows: 3. Grouping labels and lower-row metadata are excluded from the output headers; reviewed corrections are listed below.

Learn formatting only. Obtain actual facts from SAP first, then other verified evidence where the existing workflow permits. Existing supplied values and missing-value handling remain governed by the application. Sample identities, claims, quantities, and classifications are never defaults or allowed-value lists. Placeholder examples show shape only and must never be emitted literally.

Keep the exact headers and their order. The six application pass-through fields are sku, base_code, attributes__lulu_ean, attributes__shipping_weight, attributes__brand, and attributes__lulu_product_type. Name may be generated only when missing. No required/optional classifications or IDQ flags are inferred. Blank samples establish neither optionality nor absence; fallback advice is explicitly labeled. Units/spacing are specific to this template; a single sample does not establish fixed precision. Qualifiers such as Up to and Approx. apply only when current source facts support them.

### Source annotations and unresolved metadata

Lower-row metadata is retained as source guidance only: row 6: `Mandatory attributes`; row 7: `attributes_screen_size`; row 8: `attributes_processor`; row 9: `attributes_ram`; row 10: `attributes_storage`.

Mandatory labels, slash alternatives, new-header labels, and misspelled references do not add output columns, IDQ flags, or required/optional classifications. Actual row-2 keys govern output.

Explicit bullet priorities are applied by their literal column alignment: `attributes__bullet_point_1` → Camera; `attributes__bullet_point_2` → Battery; `attributes__bullet_point_3` → Connectivity; `attributes__bullet_point_4` → Ram and Storage.

Unresolved metadata references absent from the exact header row: `attributes_screen_size`, `attributes_processor`, `attributes_ram`, `attributes_storage`. Keep actual header spellings and leave these references unresolved.

Reviewed source/header corrections: Preserved the existing Catalog output header list and order.

## sku

Application pass-through: preserve the supplied SAP sku as exact identifier text, including meaningful punctuation and leading zeroes. Do not generate or copy sample identifiers.

## base_code

Application pass-through: preserve the supplied SAP base code as exact identifier text, including meaningful punctuation and leading zeroes. Do not generate or copy sample identifiers.

## attributes__lulu_ean

Application pass-through: preserve the supplied SAP lulu ean as exact identifier text, including meaningful punctuation and leading zeroes. Do not generate or copy sample identifiers.

## attributes__shipping_weight

Application pass-through: preserve the supplied SAP shipping-weight value and its established application unit. Do not derive it from product weight or copy a sample weight.

## attributes__keywords

Use relevant lower-case space-separated keyword tokens, following `{product} {type} {feature}`. The sample does not use commas.

## attributes__brand

Application pass-through: preserve the supplied SAP brand exactly; sample brand names are never defaults.

## name

Preserve an existing supplied product name. When missing and generation is requested, use the verified title-style product name below, with available distinguishing details and no empty separators.

## attributes__product_title

Write a concise plain-text title in the observed general shape `{Brand} {series/product/type} {verified key specification}, {verified distinguishing details}, {model}`. Include only available useful parts; secondary details use comma-and-space separation and the model appears last when supplied.

## attributes__bullet_point_1

Explicit template priority: Camera. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_2

Explicit template priority: Battery. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_3

Explicit template priority: Connectivity. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_4

Explicit template priority: Ram and Storage. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_5

Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_6

Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__product_description

Write a factual plain-text paragraph, following the single-paragraph sample layout; the short example does not establish a fixed length. No sample contains HTML; this template establishes no HTML requirement.

## attributes__lulu_product_type

Application pass-through: preserve the supplied SAP product type under this exact canonical key. Do not add a legacy attributes__product_type alias.

## attributes__model

Use the verified model identifier as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__model_year

Use the verified model year as four-digit text, shape `YYYY`; do not replace it with the current year or the sample year.

## attributes__color

Use the verified marketed color as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__weight

Use the verified product weight in the observed shape `{n} kg`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Keep product weight separate from pass-through shipping weight.

## attributes__product_dimensions

Use verified product dimensions in the observed shape `W{width} x D{depth} x H{height} cm`. Preserve axis labels/order, exact x versus × separator, spacing, and unit. Keep product and package measurements separate and convert only from known measurements.

## attributes__material

Use the verified material or composition as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__ip_rating

Preserve the exact verified IP protection token as `IP{rating}`, including any X and any verified range separator. Do not infer a certification from a generic water-resistance claim.

## attributes__in_the_box

Use verified actual box contents as concise plain-text entries separated by a comma and one space: `{entry}, {entry}`. Keep actual box contents distinct from separately sold compatible accessories.

## attributes__country_of_origin

Use the verified manufacturing country name as concise plain text, preserving official names, meaningful case, and punctuation. Use the manufacturing country from evidence rather than brand origin or seller location.

## attributes__screen_size

Use the verified display diagonal size in the observed shape `{n} inches`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__display_type

Use the verified display technology/type as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__display_resolution

Use verified display pixel dimensions in the observed shape `{horizontal} x {vertical}`, with lowercase x and spaces. The sample has no trailing unit label; preserve the horizontal/vertical order.

## attributes__brightness

Use the verified rated brightness with its actual luminance/luminous-flux basis in the observed shape `{n} nits`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__refresh_rate

Use the verified display/output refresh rate in the observed shape `{n} Hz`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__os

Use the verified supported/installed operating systems as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__os_version

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified operating-system version as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__processor

Use the verified processor designation as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__version

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified product/system version designation as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__gpu

Use the verified graphics processor designation as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__ram

Use the verified RAM capacity in the observed shape `{n} GB`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__storage_type

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified storage/connector specification under the supplied field key as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__internal_storage

Use the verified internal storage capacity and medium in the observed shape `{n} GB`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__external_storage

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified external-storage support/capacity as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__camera_features

Use verified camera features as concise plain-text entries separated by a comma and one space: `{entry}, {entry}`.

## attributes__camera_resolution

Use the verified camera resolution in the observed shape `{n} MP`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__primary_camera

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified primary-camera specification as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__secondary_camera

Use the verified secondary-camera specification in the observed shape `{n} MP`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__video_recording

Use the verified supported video-recording format/resolution in the observed shape `{n}K`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__flash

Use the verified flash specification as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__network

Use the verified supported mobile/network standard as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__sim

Use the verified SIM configuration as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__bluetooth

Use the verified Bluetooth version in the observed shape `v{major}.{minor}`, retaining lowercase v and any specified dot. This sample supplies a version, not a Yes/No flag; do not replace it with a boolean.

## attributes__wifi

Use the verified wireless standard in the observed shape `WiFi {generation}`, preserving the supplied spelling and space; this is a standard designation, not a Yes/No flag.

## attributes__nfc

Use `Yes` or `No` for the verified NFC capability, matching the sample capability format and case. Preserve unknowns under existing blank handling; an unstated feature is not No.

## attributes__usb

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified connector, version, or port-count information with its source labels; no Yes/No convention is established here.

## attributes__ports

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified connector names and counts, preserving connector/version information; a fixed count/list style is not established.

## attributes__sensors

Use verified sensor names/types as concise plain-text entries separated by a comma and one space: `{entry}, {entry}`.

## attributes__charging_speed

Use the verified rated charging power/speed in the observed shape `{n}W`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__battery_capacity

Use the verified battery capacity or battery-size/count specification in the observed shape `{n} mAh`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Keep electrical capacity distinct from battery chemistry, battery quantity, and runtime.

## attributes__battery_type

Use the verified battery chemistry/size/type as concise plain text, preserving official names, meaningful case, and punctuation. Preserve the specified chemistry/size; do not derive it from runtime.

## attributes__battery_life

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified battery life under stated usage conditions as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__charging_type

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified charging method/connector as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__audio

Use the verified supported audio modes/technologies as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__special_features

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified distinctive features as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__other_information

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified additional relevant product information as concise plain text; preserve its source representation because no template-specific style is established.
