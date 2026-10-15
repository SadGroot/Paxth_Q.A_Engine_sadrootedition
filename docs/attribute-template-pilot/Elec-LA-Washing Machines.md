# Elec-LA-Washing Machines: sample-format mapping rules

Source: `OneDrive_2_10-15-2026/Elec-LA-Washing Machines.xls`, sheet `Washing Machines`. Exact catalog headers are row 2, left to right; the only sample product is row 3. Row 1 contains merged group labels. Rows 4 onward contain notes or blanks, never additional product examples.

The workbook supplies formatting examples only. Obtain actual product facts from SAP first and use other verified evidence only where the existing workflow allows. Example brands, identifiers, measurements, countries, features, and claims are never defaults. Placeholders such as `{n}` and `{Brand}` show shape and must be replaced with supported facts, never emitted literally. Do not audit or reproduce the sample facts.

Keep every exact output header in source order. The six application pass-through columns are `sku`, `base_code`, `attributes__lulu_ean`, `attributes__shipping_weight`, `attributes__brand`, and `attributes__lulu_product_type`; `name` may be generated only when missing. Unknown values must not be invented; existing application validation and missing-value handling still apply. These rules do not add required/optional classifications or change IDQ flags.

Units, separators, and bullet priorities below are field-specific observations. One example does not establish fixed decimal precision, an allowed-value enum, or a universal feature set. A blank sample gives no evidence that a column should always be blank or is optional; any fallback described for it is semantic guidance, not learned sample formatting.

### Source annotations and unresolved mandatory metadata

Rows 6–10 contain a Mandatory attributes list. It names `attributes__capacity/attributes__wash_capacity/attributes__dryer_capacity` even though the real header is `attributes__washer_capacity`, and it names `attributes_spin_speed`, `attributes_programs`, and `attributes_no_of_programs` with missing underscores. The slash notation does not establish whether those capacity fields are alternatives or all required. Preserve actual output headers and record this unresolved metadata only; do not create typo columns, change IDQ flags, or infer required/optional classifications.

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

Generate a concise plain-text title from verified facts in the shape `{Brand} {product/type/key specification}, {color}, {model}`. Include only available useful parts; use comma-separated secondary details and avoid empty separators. Never copy the sample product identity.

## attributes__bullet_point_1

Explicit row-4 priority: washer/laundry capacity. Write one concise factual benefit phrase as plain text, without a bullet marker or HTML. Use only supported current-product facts; do not fabricate a claim just to fill a position.

## attributes__bullet_point_2

Explicit row-4 priority: spin speed in RPM. Write one concise factual benefit phrase as plain text, without a bullet marker or HTML. Use only supported current-product facts; do not fabricate a claim just to fill a position.

## attributes__bullet_point_3

Explicit row-4 priority: verified number of programmes. Write one concise factual benefit phrase as plain text, without a bullet marker or HTML. Use only supported current-product facts; do not fabricate a claim just to fill a position.

## attributes__bullet_point_4

Explicit row-4 priority: a distinct verified feature. Write one concise factual benefit phrase as plain text, without a bullet marker or HTML. Use only supported current-product facts; do not fabricate a claim just to fill a position.

## attributes__bullet_point_5

Explicit row-4 priority: another distinct verified feature. Write one concise factual benefit phrase as plain text, without a bullet marker or HTML. Use only supported current-product facts; do not fabricate a claim just to fill a position.

## attributes__bullet_point_6

Explicit row-4 priority: another distinct verified feature. Write one concise factual benefit phrase as plain text, without a bullet marker or HTML. Use only supported current-product facts; do not fabricate a claim just to fill a position.

## attributes__product_description

Use readable plain-text paragraphs separated by a blank line, following the sample layout. The sample has three paragraphs but does not establish a mandatory paragraph or word count. Use only current verified facts; no sample cell contains HTML, so do not add tags or infer an HTML requirement.

## attributes__keywords

Use relevant lower-case search phrases from verified facts, separated by a comma and one space, for example `{product phrase}, {feature phrase}`. Do not copy the example product or brand.

## attributes__brand

Application pass-through: preserve the supplied SAP brand exactly. A sample brand, including Generic, is never a default.

## attributes__lulu_product_type

Application pass-through: preserve the supplied SAP product type. Use this exact canonical output key; do not introduce attributes__product_type.

## attributes__model

Use the exact verified model identifier as short text, preserving letters, digits, hyphens, slashes, and meaningful case; shape `{model-code}`.

## attributes__material

Use a concise factual material name or composition as plain text, for example `{material}`. Do not adopt the sample material as a category-wide value.

## attributes__color

Use the verified marketed color as concise plain text, for example `{color}` or Multicolor when explicitly supported. Do not choose the sample color by default.

## attributes__installation

Use the verified installation type as a short plain-text label, shape `{installation type}`.

## attributes__capacity

Use the verified laundry capacity as `{n} kg`, with a space. State the correct function/context from the evidence; do not treat dryer capacity as washer capacity.

## attributes__washer_capacity

Use verified washing capacity as `{n} kg`, with a space. Keep separate from dryer capacity.

## attributes__dryer_capacity

When verified, express drying capacity as `{n} kg`, consistent with the neighboring laundry-capacity fields. This unit choice is a semantic fallback because the dryer sample is blank; do not infer that the machine includes a dryer. Sample cell is blank: no sample-specific format or requiredness can be learned for this column.

## attributes__screen_size

Use the verified display size as `{n} inches`, with a space. Do not infer screen size from overall product dimensions.

## attributes__product_dimensions

Use labeled width, depth, and height in this observed order: `W{n} x D{n} x H{n} cm`, with lowercase x and spaces around it. Preserve the axis meaning; convert units only from known source measurements and never fill a missing axis by guessing.

## attributes__package_dimensions

Use labeled package measurements in the observed order: `W{n} x D{n} x H{n} cm`, with lowercase x and spaces around it. Keep package measurements separate from product dimensions; do not infer one from the other.

## attributes__weight

Use the verified product weight as `{n} kg`, with a space before kg. Preserve meaningful source precision; one sample does not establish a fixed decimal count. Do not use shipping weight as product weight.

## attributes__features

Use a short factual feature phrase; if several verified features are needed, separate them with a comma and one space. No HTML or list markers.

## attributes__special_features

Use a concise factual special-feature phrase or comma-and-space-separated feature list. Do not invent advantages or use sample features as defaults.

## attributes__functions

Use short plain-text names of verified functions. When several functions are supplied, separate them with a comma and one space.

## attributes__programs

Use verified programme names as a comma-and-space-separated plain-text list. Preserve official names; the sample uses mixed/lower case rather than a required case conversion.

## attributes__wash_programmes

Use verified wash-programme names as a comma-and-space-separated plain-text list. Preserve official names; do not treat this spelling of the output key as interchangeable with another key.

## attributes__no_of_programs

Use the verified whole-number programme count as number-only text, shape `{n}`. Do not derive a total from a partial list.

## attributes__spin_speed

Use the verified spin speed as `{n} RPM`, with a space and uppercase RPM.

## attributes__noise_level

Use the verified noise measurement as `{n} dB`, with a space and the case shown. Retain operating-mode context if necessary.

## attributes__water_consumption

Use verified water usage as `{n} L/cycle`, with a space before L. Do not convert an annual figure to per-cycle usage without sufficient source data.

## attributes__iot_connectivity

Use exactly `Yes` or `No` only when verified. An unknown or unstated capability is not evidence for No.

## attributes__display_type

Use a concise verified display technology/type label as plain text. Do not derive display technology from the digit count.

## attributes__voltage

Use the verified voltage specification in the observed range shape `{min}-{max} V`, with an ASCII hyphen and a space before V; retain a single value when only one is specified.

## attributes__frequency_range

For electrical supply frequency, use `{n} Hz`, with a space before Hz. Do not apply the headphones audio-frequency shape to this appliance field.

## attributes__wattage

Use verified power as `{n}W`, matching the observed lack of a space before W. Do not infer consumption or wattage from voltage alone.

## attributes__no_of_pieces

Use a verified whole-number count as text without a unit or label, shape `{n}`. Do not assume a count of one. Sample cell is blank: no sample-specific format or requiredness can be learned for this column.

## attributes__pack

Use the verified pack count as number-only text, shape `{n}`. Do not assume that pack count equals pieces. Sample cell is blank: no sample-specific format or requiredness can be learned for this column.

## attributes__package_contents

Use a plain-text list of verified included items. Separate multiple items with a comma and one space; use `{n} x {item}` when a quantity is known. Do not add typical accessories without evidence. Sample cell is blank: no sample-specific format or requiredness can be learned for this column.

## attributes__in_the_box

Use a plain-text list of verified box contents, with comma-and-space separation for multiple items and `{n} x {item}` quantities when known. Do not assume it equals package_contents.

## attributes__accessories

Use short plain-text names of verified included accessories; use a comma and one space for multiple items. Do not treat separately sold accessories as included. Sample cell is blank: no sample-specific format or requiredness can be learned for this column.

## attributes__attachments

Use short plain-text names of verified supplied attachments; use a comma and one space for multiple items. Do not infer inclusion from compatibility. Sample cell is blank: no sample-specific format or requiredness can be learned for this column.

## attributes__other_information

Include only additional verified product information that does not fit another header, as concise plain text. Do not use this field to copy the sample or invent a value. Sample cell is blank: no sample-specific format or requiredness can be learned for this column.

## attributes__note

Use concise factual plain-text notes only when supported by the current product evidence. Do not add a generic sample caveat to every product. Sample cell is blank: no sample-specific format or requiredness can be learned for this column.

## attributes__country_of_origin

Use the verified manufacturing country as its plain-text country name. Do not infer it from the brand, seller, or sample country.
