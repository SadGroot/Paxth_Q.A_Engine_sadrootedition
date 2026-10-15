# H&L-Stationery-Art & Craft: sample-format mapping rules

Source: `OneDrive_2_10-15-2026/H&L-Stationery-Art & Craft.xls`, sheet `Art & Craft`. Exact catalog headers are row 2, left to right; the only sample product is row 3. Row 1 contains merged group labels. Rows 4 onward contain notes or blanks, never additional product examples.

The workbook supplies formatting examples only. Obtain actual product facts from SAP first and use other verified evidence only where the existing workflow allows. Example brands, identifiers, measurements, countries, features, and claims are never defaults. Placeholders such as `{n}` and `{Brand}` show shape and must be replaced with supported facts, never emitted literally. Do not audit or reproduce the sample facts.

Keep every exact output header in source order. The six application pass-through columns are `sku`, `base_code`, `attributes__lulu_ean`, `attributes__shipping_weight`, `attributes__brand`, and `attributes__lulu_product_type`; `name` may be generated only when missing. Unknown values must not be invented; existing application validation and missing-value handling still apply. These rules do not add required/optional classifications or change IDQ flags.

Units, separators, and bullet priorities below are field-specific observations. One example does not establish fixed decimal precision, an allowed-value enum, or a universal feature set. A blank sample gives no evidence that a column should always be blank or is optional; any fallback described for it is semantic guidance, not learned sample formatting.

### Source annotations and unresolved mandatory metadata

There are no populated mandatory notes or row-4 bullet instructions. The six bullet topics above are sample-derived ordering hints, not a mandatory structure for every art-and-craft product. Blank rows through row 12 are not products or metadata.

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

Sample-derived topic hint: verified count/color variety or a comparable core specification. Write one concise factual benefit phrase as plain text, without a bullet marker or HTML. Use only supported current-product facts; do not fabricate a claim just to fill a position.

## attributes__bullet_point_2

Sample-derived topic hint: verified material or construction benefit. Write one concise factual benefit phrase as plain text, without a bullet marker or HTML. Use only supported current-product facts; do not fabricate a claim just to fill a position.

## attributes__bullet_point_3

Sample-derived topic hint: verified performance/use benefit. Write one concise factual benefit phrase as plain text, without a bullet marker or HTML. Use only supported current-product facts; do not fabricate a claim just to fill a position.

## attributes__bullet_point_4

Sample-derived topic hint: verified handling/design feature. Write one concise factual benefit phrase as plain text, without a bullet marker or HTML. Use only supported current-product facts; do not fabricate a claim just to fill a position.

## attributes__bullet_point_5

Sample-derived topic hint: verified intended use. Write one concise factual benefit phrase as plain text, without a bullet marker or HTML. Use only supported current-product facts; do not fabricate a claim just to fill a position.

## attributes__bullet_point_6

Sample-derived topic hint: verified pack/count detail or another distinct feature. Write one concise factual benefit phrase as plain text, without a bullet marker or HTML. Use only supported current-product facts; do not fabricate a claim just to fill a position.

## attributes__product_description

The only sample text is a placeholder description. It establishes plain text only, with no trustworthy length, structure, or content recipe; write a useful factual description for the current product. Use only current verified facts; no sample cell contains HTML, so do not add tags or infer an HTML requirement.

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

## attributes__usage

Use concise verified activity/use names as plain text; separate multiple uses with a comma and one space.

## attributes__ideal_for

Use the verified intended audience or use as concise plain text. Do not assume every product shares the sample audience.

## attributes__size

Use the verified size designation and its unit as short text. Do not derive a size from an unrelated measurement. Sample cell is blank: no sample-specific format or requiredness can be learned for this column.

## attributes__no_of_pieces

Use a verified whole-number count as text without a unit or label, shape `{n}`. Do not assume a count of one.

## attributes__pack

Use the observed text shape `Pack of {n}` with a verified pack count. This differs from number-only pack values in other templates; do not substitute a count from unrelated piece fields.

## attributes__package_contents

Use a plain-text verified count plus item name, shape `{n} {items}`. Separate multiple supplied item types with a comma and one space.

## attributes__in_the_box

Use a short plain-text description of verified box contents. The sample contains only a simple item/container word, so it does not establish a quantity format; do not infer contents from packaging alone.

## attributes__product_dimensions

Use labeled width, depth, and height in this observed order: `W{n} x D{n} x H{n} cm`, with lowercase x and spaces around it. Preserve the axis meaning; convert units only from known source measurements and never fill a missing axis by guessing.

## attributes__package_dimensions

Use labeled package measurements in the observed order: `W{n} x D{n} x H{n} cm`, with lowercase x and spaces around it. Keep package measurements separate from product dimensions; do not infer one from the other.

## attributes__weight

Use verified product weight in grams as `{n}g`, matching the sample with no space before lowercase g. Do not substitute shipping weight; convert units only from known product measurements.

## attributes__special_features

Use a concise factual special-feature phrase or comma-and-space-separated feature list. Do not invent advantages or use sample features as defaults. Sample cell is blank: no sample-specific format or requiredness can be learned for this column.

## attributes__features

Use a short factual feature phrase; if several verified features are needed, separate them with a comma and one space. No HTML or list markers. Sample cell is blank: no sample-specific format or requiredness can be learned for this column.

## attributes__other_information

Include only additional verified product information that does not fit another header, as concise plain text. Do not use this field to copy the sample or invent a value. Sample cell is blank: no sample-specific format or requiredness can be learned for this column.

## attributes__note

Use concise factual plain-text notes only when supported by the current product evidence. Do not add a generic sample caveat to every product. Sample cell is blank: no sample-specific format or requiredness can be learned for this column.

## attributes__country_of_origin

Use the verified manufacturing country as its plain-text country name. Do not infer it from the brand, seller, or sample country.
