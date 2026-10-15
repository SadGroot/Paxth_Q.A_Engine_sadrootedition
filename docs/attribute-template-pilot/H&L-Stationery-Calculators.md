# H&L-Stationery-Calculators: sample-format mapping rules

Source: `OneDrive_2_10-15-2026/H&L-Stationery-Calculators.xls`, sheet `Sheet1`. Exact catalog headers are row 2, left to right; the only sample product is row 3. Row 1 contains merged group labels. Rows 4 onward contain notes or blanks, never additional product examples.

The workbook supplies formatting examples only. Obtain actual product facts from SAP first and use other verified evidence only where the existing workflow allows. Example brands, identifiers, measurements, countries, features, and claims are never defaults. Placeholders such as `{n}` and `{Brand}` show shape and must be replaced with supported facts, never emitted literally. Do not audit or reproduce the sample facts.

Keep every exact output header in source order. The six application pass-through columns are `sku`, `base_code`, `attributes__lulu_ean`, `attributes__shipping_weight`, `attributes__brand`, and `attributes__lulu_product_type`; `name` may be generated only when missing. Unknown values must not be invented; existing application validation and missing-value handling still apply. These rules do not add required/optional classifications or change IDQ flags.

Units, separators, and bullet priorities below are field-specific observations. One example does not establish fixed decimal precision, an allowed-value enum, or a universal feature set. A blank sample gives no evidence that a column should always be blank or is optional; any fallback described for it is semantic guidance, not learned sample formatting.

### Source annotations and unresolved mandatory metadata

Rows 6–8 list calculator_type and no_of_digits under Mandatory attributes in column D. Record this as source guidance only; do not alter IDQ flags or infer required/optional classifications. The literal final output header is `note`, not `attributes__note`. The sample marketing text and specification fields are not reconciled for factual accuracy; use current verified facts for power sources and function counts.

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

Sample-derived topic hint: display digit count/legibility. Write one concise factual benefit phrase as plain text, without a bullet marker or HTML. Use only supported current-product facts; do not fabricate a claim just to fill a position.

## attributes__bullet_point_2

Sample-derived topic hint: verified power-source capability. Write one concise factual benefit phrase as plain text, without a bullet marker or HTML. Use only supported current-product facts; do not fabricate a claim just to fill a position.

## attributes__bullet_point_3

Sample-derived topic hint: a verified calculation/check function. Write one concise factual benefit phrase as plain text, without a bullet marker or HTML. Use only supported current-product facts; do not fabricate a claim just to fill a position.

## attributes__bullet_point_4

Sample-derived topic hint: another verified calculation function. Write one concise factual benefit phrase as plain text, without a bullet marker or HTML. Use only supported current-product facts; do not fabricate a claim just to fill a position.

## attributes__bullet_point_5

Sample-derived topic hint: verified portability/design feature. Write one concise factual benefit phrase as plain text, without a bullet marker or HTML. Use only supported current-product facts; do not fabricate a claim just to fill a position.

## attributes__bullet_point_6

Sample-derived topic hint: verified audience/use or another distinct feature. Write one concise factual benefit phrase as plain text, without a bullet marker or HTML. Use only supported current-product facts; do not fabricate a claim just to fill a position.

## attributes__product_description

Use readable plain-text paragraphs separated by a blank line, following the two-paragraph sample. The sample does not establish a mandatory paragraph or word count. Use only current verified facts; no sample cell contains HTML, so do not add tags or infer an HTML requirement.

## attributes__keywords

Use relevant lower-case search phrases separated by a comma with no following space, shape `{product phrase},{feature phrase}`. Do not copy sample keywords or infer products from plurals.

## attributes__no_of_pieces

Use a verified whole-number count as text without a unit or label, shape `{n}`. Do not assume a count of one. Sample cell is blank: no sample-specific format or requiredness can be learned for this column.

## attributes__package_contents

Use a plain-text list of verified included items. Separate multiple items with a comma and one space; use `{n} x {item}` when a quantity is known. Do not add typical accessories without evidence. Sample cell is blank: no sample-specific format or requiredness can be learned for this column.

## attributes__pack

Use the verified pack count as number-only text, shape `{n}`. Do not assume that pack count equals pieces. Sample cell is blank: no sample-specific format or requiredness can be learned for this column.

## attributes__in_the_box

Use a plain-text list of verified box contents, with comma-and-space separation for multiple items and `{n} x {item}` quantities when known. Do not assume it equals package_contents.

## attributes__product_dimensions

Use labeled length, width, and height in the observed order: `L{n} × W{n} × H{n} cm`, with a multiplication sign and spaces. Preserve axis meanings and use cm only from known source measurements.

## attributes__package_dimensions

Use labeled package measurements in the observed order: `L{n} × W{n} × H{n} cm`, with a multiplication sign and spaces. Keep separate from product measurements.

## attributes__weight

Use the verified product weight as `{n} kg`, with a space before kg. Preserve meaningful source precision; one sample does not establish a fixed decimal count. Do not use shipping weight as product weight.

## attributes__brand

Application pass-through: preserve the supplied SAP brand exactly. A sample brand, including Generic, is never a default.

## attributes__lulu_product_type

Application pass-through: preserve the supplied SAP product type. Use this exact canonical output key; do not introduce attributes__product_type.

## attributes__model

Use the exact verified model identifier as short text, preserving letters, digits, hyphens, slashes, and meaningful case; shape `{model-code}`.

## attributes__calculator_type

Use a short verified calculator classification as plain text, shape `{calculator type}`. The sample does not define an allowed-value list.

## attributes__material

Use a concise factual material name or composition as plain text, for example `{material}`. Do not adopt the sample material as a category-wide value.

## attributes__size

Use a verified stated size as `{n} cm`, with a space. Do not choose an arbitrary dimension to fill this field when the source does not state a size.

## attributes__display_type

Use a short verified technology label with Display when supported, shape `{technology} Display`, matching the observed wording.

## attributes__no_of_digits

Use the verified display digit count as `{n} Digits`, with a space and capital D, matching the observed format.

## attributes__display_lines

Use the verified number of display lines as `{n}-line`, matching the observed hyphenated singular shape.

## attributes__color

Use the verified marketed color as concise plain text, for example `{color}` or Multicolor when explicitly supported. Do not choose the sample color by default.

## attributes__functions

Use verified function names as a comma-and-space-separated plain-text list. Do not populate a complete function list from an unverified count.

## attributes__power_source

Use the verified power-source name as concise text. State multiple supported sources only when evidenced; do not infer solar power from a marketing example.

## attributes__battery_capacity

No battery-capacity format is demonstrated. If a verified electrical capacity is supplied, a semantic fallback is `{n} mAh`; do not infer capacity from battery type, runtime, or solar support. Sample cell is blank: no sample-specific format or requiredness can be learned for this column.

## attributes__battery_life

No battery-runtime format is demonstrated. If verified, use a concise duration with its actual source unit, shape `{duration} {unit}`; do not impose hours or infer life from the power-source label. Sample cell is blank: no sample-specific format or requiredness can be learned for this column.

## attributes__no_of_functions

Use a verified whole-number function count as `{n} functions`, with a space and lowercase functions. Do not derive a count from an incomplete feature list.

## attributes__battery_type

Use the verified battery chemistry/type as concise text, for example `{battery chemistry}`. Do not infer it from the product category. Sample cell is blank: no sample-specific format or requiredness can be learned for this column.

## attributes__country_of_origin

Use the verified manufacturing country as its plain-text country name. Do not infer it from the brand, seller, or sample country.

## attributes__other_information

Include only additional verified product information that does not fit another header, as concise plain text. Do not use this field to copy the sample or invent a value. Sample cell is blank: no sample-specific format or requiredness can be learned for this column.

## note

Use concise factual plain-text notes only when supported by current product evidence. Preserve the literal output key `note`; do not rename it to attributes__note. Sample cell is blank: no sample-specific format or requiredness can be learned for this column.
