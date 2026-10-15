# HH-EA-Light & Bulbs: sample-format mapping rules

Source: `OneDrive_2_10-15-2026/HH-EA-Light & Bulbs.xls`, sheet `Light & Bulbs Template`. Catalog headers: row 2, in the reviewed manifest order. Sample product rows: 3. Grouping labels and lower-row metadata are excluded from the output headers; reviewed corrections are listed below.

Learn formatting only. Obtain actual facts from SAP first, then other verified evidence where the existing workflow permits. Existing supplied values and missing-value handling remain governed by the application. Sample identities, claims, quantities, and classifications are never defaults or allowed-value lists. Placeholder examples show shape only and must never be emitted literally.

Keep the exact headers and their order. The six application pass-through fields are sku, base_code, attributes__lulu_ean, attributes__shipping_weight, attributes__brand, and attributes__lulu_product_type. Name may be generated only when missing. No required/optional classifications or IDQ flags are inferred. Blank samples establish neither optionality nor absence; fallback advice is explicitly labeled. Units/spacing are specific to this template; a single sample does not establish fixed precision. Qualifiers such as Up to and Approx. apply only when current source facts support them.

### Source annotations and unresolved metadata

Lower-row metadata is retained as source guidance only: row 6: `Mandatory attributes`; row 7: `attributes__wattage/attributes__power`.

Mandatory labels, slash alternatives, new-header labels, and misspelled references do not add output columns, IDQ flags, or required/optional classifications. Actual row-2 keys govern output.

Explicit bullet priorities are applied by their literal column alignment: `attributes__bullet_point_1` → Wattage/Power; `attributes__bullet_point_2` → Holder/base type or Features; `attributes__bullet_point_3` → Connectivity(smart) or Features; `attributes__bullet_point_4` → Features; `attributes__bullet_point_5` → Features; `attributes__bullet_point_6` → Features.

Unresolved metadata references absent from the exact header row: `attributes__power`. Keep actual header spellings and leave these references unresolved.

Reviewed source/header corrections: Dropped empty header at BD2. Dropped empty header at BE2. Unlabelled example value at BF3 is not mapped to an invented header.

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

## attributes__bullet_point_1

Explicit template priority: Wattage/Power. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_2

Explicit template priority: Holder/base type or Features. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_3

Explicit template priority: Connectivity(smart) or Features. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

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

## attributes__material

Use the verified material or composition as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__no_of_pieces

Use the verified piece count as number-only text, shape `{n}`, with no added unit or label. Preserve identifiers/notation rather than performing arithmetic on the sample.

## attributes__pack

Use verified pack composition in the observed shape `{pack count} pack set of {pieces per set}`. Preserve comma presence/absence and spacing; keep pack counts distinct from total piece counts.

## attributes__package_contents

Use verified supplied items with quantities in the observed shape `{count} x {item}`. Preserve the quantity separator and spacing; include only verified contents.

## attributes__in_the_box

Use verified supplied items with quantities in the observed shape `{count} x {item}`. Preserve the quantity separator and spacing; include only verified contents.

## attributes__product_dimensions

Use verified product dimensions in the observed shape `W{width} x D{depth} x H{height} cm`. Preserve axis labels/order, exact x versus × separator, spacing, and unit. Keep product and package measurements separate and convert only from known measurements.

## attributes__package_dimensions

Use verified package dimensions in the observed shape `W{width} x D{depth} x H{height} cm`. Preserve axis labels/order, exact x versus × separator, spacing, and unit. Keep product and package measurements separate and convert only from known measurements.

## attributes__weight

Use the verified product weight in the observed shape `{n}g`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Keep product weight separate from pass-through shipping weight.

## attributes__size

Use the verified stated product size in the observed shape `{n} cm`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__cap_type

Use the verified bulb-cap designation as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__base_type

Use the verified base construction/type as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__brightness

Use the verified rated brightness with its actual luminance/luminous-flux basis in the observed shape `{n} lumens`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__color_temprature

Use the verified color temperature in the observed shape `{n}K`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__light_effect

Use the verified lighting effect specification as concise plain text, preserving official names, meaningful case, and punctuation. An explicit absence label is appropriate only when supported; unknown is not an absence claim.

## attributes__coverage

Use the verified coverage specification in its actual technical context in the observed shape `{n} m²`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Keep area, treatment-head area, or throughput context from the source; the same header is not always an area.

## attributes__wattage

Use the verified rated wattage in the observed shape `{n}W`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__voltage

Use the verified electrical input voltage in the observed shape `{min}-{max}V`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__frequency_range

Use the verified frequency specification in its actual technical context in the observed shape `{min}-{max} Hz`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Preserve the actual audio, radio, or electrical-supply context and units.

## attributes__iot_connectivity

Use the verified connected platform/app or IoT capability as concise plain text, preserving official names, meaningful case, and punctuation. The populated sample uses descriptive text, not a Yes/No flag.

## attributes__wifi

Use the verified wireless-band designation in the observed shape `Wi-Fi {n} GHz`, preserving spelling, spaces, and GHz case. Do not confuse the radio band with the Wi-Fi generation.

## attributes__battery_type

Use the verified battery chemistry/size/type as concise plain text, preserving official names, meaningful case, and punctuation. Preserve the specified chemistry/size; do not derive it from runtime.

## attributes__battery_capacity

Use the verified battery capacity or battery-size/count specification in the observed shape `{n} mAh`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Keep electrical capacity distinct from battery chemistry, battery quantity, and runtime.

## attributes__battery_life

Use the verified battery life under stated usage conditions in the observed shape `up to {n} hours`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Keep stated usage/test conditions; do not substitute charging time.

## attributes__charging_time

Use the verified charging duration in the observed shape `{n} hours`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Express time to charge, not operating or standby duration.

## attributes__charging_type

Use the verified charging method/connector as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__runtime

Use verified duration with its operating condition in the observed shape `{n} hours continuous use`. Preserve the space before hours and retain the condition only when supported.

## attributes__cord_length

Use the verified cord length in the observed shape `{n}m`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__plug_type

Use verified plug/connector type as concise plain text. The sample uses slash-separated entries, shape `{entry}/{entry}`; select applicable supported entries rather than copying every example alternative or treating them as an allowed-value enum.

## attributes__range

Use the verified operating/connection range in the observed shape `up to {n} m`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__ports

Use verified port/connector specifications as concise plain text. The sample uses slash-separated entries, shape `{entry}/{entry}`; select applicable supported entries rather than copying every example alternative or treating them as an allowed-value enum.

## attributes__accessories

Use verified included accessories as concise plain text. The sample uses slash-separated entries, shape `{entry}/{entry}`; select applicable supported entries rather than copying every example alternative or treating them as an allowed-value enum. List included accessories only; compatibility alone does not establish inclusion.

## attributes__safety_features

Use verified verified safety features as concise plain text. The sample uses slash-separated entries, shape `{entry}/{entry}`; select applicable supported entries rather than copying every example alternative or treating them as an allowed-value enum. Claims and certifications need source support; the example feature set is not a default.

## attributes__features

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified product features as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__special_features

Use verified distinctive features as concise plain text. The sample uses slash-separated entries, shape `{entry}/{entry}`; select applicable supported entries rather than copying every example alternative or treating them as an allowed-value enum.

## attributes__other_information

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified additional relevant product information as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__note

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified product-specific caveats as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__country_of_origin

Use the verified manufacturing country name as concise plain text, preserving official names, meaningful case, and punctuation. Use the manufacturing country from evidence rather than brand origin or seller location.
