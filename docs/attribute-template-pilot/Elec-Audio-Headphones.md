# Elec-Audio-Headphones: sample-format mapping rules

Source: `OneDrive_2_10-15-2026/Elec-Audio-Headphones.xls`, sheet `Headphones`. Exact catalog headers are row 2, left to right; the only sample product is row 3. Row 1 contains merged group labels. Rows 4 onward contain notes or blanks, never additional product examples.

The workbook supplies formatting examples only. Obtain actual product facts from SAP first and use other verified evidence only where the existing workflow allows. Example brands, identifiers, measurements, countries, features, and claims are never defaults. Placeholders such as `{n}` and `{Brand}` show shape and must be replaced with supported facts, never emitted literally. Do not audit or reproduce the sample facts.

Keep every exact output header in source order. The six application pass-through columns are `sku`, `base_code`, `attributes__lulu_ean`, `attributes__shipping_weight`, `attributes__brand`, and `attributes__lulu_product_type`; `name` may be generated only when missing. Unknown values must not be invented; existing application validation and missing-value handling still apply. These rules do not add required/optional classifications or change IDQ flags.

Units, separators, and bullet priorities below are field-specific observations. One example does not establish fixed decimal precision, an allowed-value enum, or a universal feature set. A blank sample gives no evidence that a column should always be blank or is optional; any fallback described for it is semantic guidance, not learned sample formatting.

### Source annotations and unresolved mandatory metadata

Rows 6–10 contain a Mandatory attributes label followed by design, battery_capacity, `attributes_connectivity`, and noise_cancellation. `attributes_connectivity` is misspelled relative to the actual header `attributes__connectivity`. Record the intent as a source note only; do not add the misspelled field or infer a new required/optional classification. Row 4 requests battery capacity for bullet 2 although the sample bullet describes runtime; follow the explicit priority with current verified facts.

## sku

Application pass-through: preserve the SAP SKU exactly as identifier text, including leading zeroes. Do not generate, reformat, or copy the example identifier.

## base_code

Application pass-through: preserve the SAP base code exactly as identifier text. Do not assume it equals the SKU because the sample does.

## attributes__lulu_ean

Application pass-through: preserve the supplied SAP EAN as text, including leading zeroes. Do not infer, calculate, or substitute a barcode from the sample.

## attributes__shipping_weight

Application pass-through: preserve the supplied SAP shipping weight. The sample has a bare number and does not establish its unit; do not infer a unit or convert it from product weight.

## name

Preserve an existing SAP name. If missing, generate a plain-text product name from verified facts using the title shape described below; the sample name and title match, so reuse the generated title when appropriate.

## attributes__product_title

Generate a concise plain-text title from verified facts in the shape `{Brand} {product/type/key specification}, {color}, {model}`. Include only available useful parts; use comma-separated secondary details and avoid empty separators. Never copy the sample product identity. Row 4 explicitly says Below 75 characters: keep this field under 75 characters (at most 74).

## attributes__bullet_point_1

Explicit row-4 priority: wearing/design type. Write one concise factual benefit phrase as plain text, without a bullet marker or HTML. Use only supported current-product facts; do not fabricate a claim just to fill a position.

## attributes__bullet_point_2

Explicit row-4 priority: battery capacity, as explicitly requested in row 4; use verified capacity when available and do not substitute the sample runtime as capacity. Write one concise factual benefit phrase as plain text, without a bullet marker or HTML. Use only supported current-product facts; do not fabricate a claim just to fill a position.

## attributes__bullet_point_3

Explicit row-4 priority: connectivity. Write one concise factual benefit phrase as plain text, without a bullet marker or HTML. Use only supported current-product facts; do not fabricate a claim just to fill a position.

## attributes__bullet_point_4

Explicit row-4 priority: a distinct verified feature. Write one concise factual benefit phrase as plain text, without a bullet marker or HTML. Use only supported current-product facts; do not fabricate a claim just to fill a position.

## attributes__bullet_point_5

Explicit row-4 priority: another distinct verified feature. Write one concise factual benefit phrase as plain text, without a bullet marker or HTML. Use only supported current-product facts; do not fabricate a claim just to fill a position.

## attributes__bullet_point_6

Explicit row-4 priority: another distinct verified feature. Write one concise factual benefit phrase as plain text, without a bullet marker or HTML. Use only supported current-product facts; do not fabricate a claim just to fill a position.

## attributes__product_description

The sample is a single short plain-text paragraph; it does not establish a mandatory word count. Use only current verified facts; no sample cell contains HTML, so do not add tags or infer an HTML requirement.

## attributes__keywords

Use relevant lower-case space-separated keyword tokens, shape `{brand} {product} {feature}`. The sample contains no commas; do not copy its product-specific tokens.

## attributes__brand

Application pass-through: preserve the supplied SAP brand exactly. A sample brand, including Generic, is never a default.

## attributes__lulu_product_type

Application pass-through: preserve the supplied SAP product type. Use this exact canonical output key; do not introduce attributes__product_type.

## attributes__model

Use the exact verified model identifier as short text, preserving letters, digits, hyphens, slashes, and meaningful case; shape `{model-code}`.

## attributes__color

Use the verified marketed color as concise plain text, for example `{color}` or Multicolor when explicitly supported. Do not choose the sample color by default.

## attributes__no_of_pieces

Use a verified whole-number count as text without a unit or label, shape `{n}`. Do not assume a count of one.

## attributes__pack

Use the verified pack count as number-only text, shape `{n}`. Do not assume that pack count equals pieces.

## attributes__package_contents

Use a plain-text list of verified included items. Separate multiple items with a comma and one space; use `{n} x {item}` when a quantity is known. Do not add typical accessories without evidence.

## attributes__in_the_box

Use a plain-text list of verified box contents, with comma-and-space separation for multiple items and `{n} x {item}` quantities when known. Do not assume it equals package_contents.

## attributes__accessories

Use short plain-text names of verified included accessories; use a comma and one space for multiple items. Do not treat separately sold accessories as included.

## attributes__product_dimensions

Use labeled width, depth, and height in this observed order: `W{n} x D{n} x H{n} cm`, with lowercase x and spaces around it. Preserve the axis meaning; convert units only from known source measurements and never fill a missing axis by guessing.

## attributes__package_dimensions

Use labeled package measurements in the observed order: `W{n} x D{n} x H{n} cm`, with lowercase x and spaces around it. Keep package measurements separate from product dimensions; do not infer one from the other.

## attributes__weight

Use the verified product weight as `{n} kg`, with a space before kg. Preserve meaningful source precision; one sample does not establish a fixed decimal count. Do not use shipping weight as product weight.

## attributes__audio

Use a short factual audio-mode/quality descriptor as plain text, for example `{sound mode}`. Do not infer a sound technology from the model family.

## attributes__frequency_range

Use a verified audio frequency range in the observed shape `{min} Hz – {max} kHz`, with an en dash, spaces around it, and explicit units at both ends when they differ. Preserve the actual source scale and convert only when justified.

## attributes__impedance

Use verified impedance as `{n} Ohms`, with a space before Ohms.

## attributes__driver_size

Use the verified driver diameter as `{n} mm`, with a space before mm.

## attributes__noise_cancellation

Use the verified cancellation type as a short categorical label, for example `{cancellation type}`. The sample uses a type label rather than Yes/No; do not infer Active for all headphones.

## attributes__connectivity

Use short verified connection/transport names as plain text; separate multiple connection types with a comma and one space.

## attributes__bluetooth

Use exactly `Yes` or `No` only when verified. An unknown or unstated capability is not evidence for No.

## attributes__aux

Use exactly `Yes` or `No` only when verified. An unknown or unstated capability is not evidence for No.

## attributes__plug_type

Use the verified connector specification as short text. For a measured analog jack, the observed shape is `{n} mm`, with a space before mm; do not replace a named connector with a guessed diameter.

## attributes__control

Use a short verified control-method label, for example `{control method}`, rather than a boolean.

## attributes__mic

Use exactly `Yes` or `No` only when verified. An unknown or unstated capability is not evidence for No.

## attributes__battery_type

Use the verified battery chemistry/type as concise text, for example `{battery chemistry}`. Do not infer it from the product category.

## attributes__battery_capacity

Use verified electrical battery capacity as `{n} mAh`, including a space and the case shown. Do not infer capacity from runtime or battery type.

## attributes__battery_life

Use a verified runtime as `{n} hours`, with a space before hours. Keep usage/test conditions when needed; do not confuse runtime with charging time.

## attributes__playback_time

Use verified playback duration as `{n} hours`, with a space. Keep source conditions where necessary; do not assume it equals general battery life.

## attributes__standby_time

Use verified standby duration as `{n} hours`, with a space; do not derive it from playback time.

## attributes__charging_time

Use verified full-charge duration as `{n} hours`, with a space; do not infer it from capacity.

## attributes__charging_type

Use the exact verified charging connector/method as short text, preserving its spelling and punctuation, for example `{connector type}`.

## attributes__design

Use the verified wearing/design style as concise text, shape `{wearing style}`. Do not infer it from the marketing name alone.

## attributes__form_factor

Use a concise factual form-factor description as plain text. The sample is a descriptive label; it does not define a restricted vocabulary.

## attributes__fit_type

Use a short verified fit description as plain text, for example `{fit description}`.

## attributes__adjustability

Use exactly `Yes` or `No` only when verified. An unknown or unstated capability is not evidence for No.

## attributes__foldability

Use exactly `Yes` or `No` only when verified. An unknown or unstated capability is not evidence for No.

## attributes__comfort_level

Use a concise comfort descriptor only if explicitly supported by source evidence. Do not infer a subjective rating from price, padding, or the sample.

## attributes__cord_length

Use verified cord length as `{n} m`, with a space before m. Do not assume it equals cable_length.

## attributes__cable_length

Use verified cable length as `{n} m`, with a space before m. Do not infer a cable is included because the product supports wired use.

## attributes__features

Use a short factual feature phrase; if several verified features are needed, separate them with a comma and one space. No HTML or list markers.

## attributes__functions

Use short plain-text names of verified functions. When several functions are supplied, separate them with a comma and one space.

## attributes__special_features

Use a concise factual special-feature phrase or comma-and-space-separated feature list. Do not invent advantages or use sample features as defaults.

## attributes__water_resistance

Use exactly `Yes` or `No` only when verified. An unknown or unstated capability is not evidence for No.

## attributes__ip_rating

Preserve the exact verified IP rating token, shape `IP{rating}`. Do not infer an IP rating from a water-resistance claim or vice versa.

## attributes__sensors

Use a short verified sensor name or comma-and-space-separated sensor list. Do not infer sensors from unrelated smart features.

## attributes__compatible_devices

Use verified device classes as a comma-and-space-separated list, shape `{device class}, {device class}`.

## attributes__compatible_models

Use exact verified compatible model or series names as text; separate multiple entries with a comma and one space. Do not infer universal compatibility.

## attributes__other_information

Include only additional verified product information that does not fit another header, as concise plain text. Do not use this field to copy the sample or invent a value. Sample cell is blank: no sample-specific format or requiredness can be learned for this column.

## attributes__note

Use concise factual plain-text notes only when supported by the current product evidence. Do not add a generic sample caveat to every product. Sample cell is blank: no sample-specific format or requiredness can be learned for this column.

## attributes__country_of_origin

Use the verified manufacturing country as its plain-text country name. Do not infer it from the brand, seller, or sample country.
