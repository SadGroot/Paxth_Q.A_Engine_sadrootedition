# H&L-Luggage: sample-format mapping rules

Source: `OneDrive_2_10-15-2026/H&L-Luggage.xls`, sheet `Luggage Template`. Exact catalog headers are row 2, left to right; the only sample product is row 3. Row 1 contains merged group labels. Rows 4 onward contain notes or blanks, never additional product examples.

The workbook supplies formatting examples only. Obtain actual product facts from SAP first and use other verified evidence only where the existing workflow allows. Example brands, identifiers, measurements, countries, features, and claims are never defaults. Placeholders such as `{n}` and `{Brand}` show shape and must be replaced with supported facts, never emitted literally. Do not audit or reproduce the sample facts.

Keep every exact output header in source order. The six application pass-through columns are `sku`, `base_code`, `attributes__lulu_ean`, `attributes__shipping_weight`, `attributes__brand`, and `attributes__lulu_product_type`; `name` may be generated only when missing. Unknown values must not be invented; existing application validation and missing-value handling still apply. These rules do not add required/optional classifications or change IDQ flags.

Units, separators, and bullet priorities below are field-specific observations. One example does not establish fixed decimal precision, an allowed-value enum, or a universal feature set. A blank sample gives no evidence that a column should always be blank or is optional; any fallback described for it is semantic guidance, not learned sample formatting.

### Source annotations and unresolved mandatory metadata

Rows 6–8 name size and capacity under Mandatory Attributes. Retain this as template guidance only; no required/optional classification or IDQ flag change is inferred from the note or the sample.

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

Explicit row-4 priority: capacity/volume. Write one concise factual benefit phrase as plain text, without a bullet marker or HTML. Use only supported current-product facts; do not fabricate a claim just to fill a position.

## attributes__bullet_point_2

Explicit row-4 priority: nominal size. Write one concise factual benefit phrase as plain text, without a bullet marker or HTML. Use only supported current-product facts; do not fabricate a claim just to fill a position.

## attributes__bullet_point_3

Explicit row-4 priority: number of wheels. Write one concise factual benefit phrase as plain text, without a bullet marker or HTML. Use only supported current-product facts; do not fabricate a claim just to fill a position.

## attributes__bullet_point_4

Explicit row-4 priority: a distinct verified feature. Write one concise factual benefit phrase as plain text, without a bullet marker or HTML. Use only supported current-product facts; do not fabricate a claim just to fill a position.

## attributes__bullet_point_5

Explicit row-4 priority: another distinct verified feature. Write one concise factual benefit phrase as plain text, without a bullet marker or HTML. Use only supported current-product facts; do not fabricate a claim just to fill a position.

## attributes__bullet_point_6

Explicit row-4 priority: another distinct verified feature. Write one concise factual benefit phrase as plain text, without a bullet marker or HTML. Use only supported current-product facts; do not fabricate a claim just to fill a position.

## attributes__product_description

Use readable plain-text paragraphs separated by a blank line, following the sample layout. Its three paragraphs do not establish a mandatory paragraph or word count. Use only current verified facts; no sample cell contains HTML, so do not add tags or infer an HTML requirement.

## attributes__keywords

Use relevant lower-case search phrases from verified facts, separated by a comma and one space, for example `{product phrase}, {feature phrase}`. Do not copy the example product or brand.

## attributes__brand

Application pass-through: preserve the supplied SAP brand exactly. A sample brand, including Generic, is never a default.

## attributes__lulu_product_type

Application pass-through: preserve the supplied SAP product type. Use this exact canonical output key; do not introduce attributes__product_type.

## attributes__model

Use the exact verified model identifier as short text, preserving letters, digits, hyphens, slashes, and meaningful case; shape `{model-code}`.

## attributes__model_number

Use the exact verified model number as text, preserving significant punctuation and zeroes. Do not assume it duplicates attributes__model. Sample cell is blank: no sample-specific format or requiredness can be learned for this column.

## attributes__material

Use a concise factual material name or composition as plain text, for example `{material}`. Do not adopt the sample material as a category-wide value.

## attributes__inner_material

Use the verified lining/interior material as concise plain text, for example `{inner material}`. Do not infer it from the exterior material. Sample cell is blank: no sample-specific format or requiredness can be learned for this column.

## attributes__outer_material

Use the verified exterior material as concise plain text, for example `{outer material}`. Do not infer it from the lining. Sample cell is blank: no sample-specific format or requiredness can be learned for this column.

## attributes__color

Use the verified marketed color as concise plain text, for example `{color}` or Multicolor when explicitly supported. Do not choose the sample color by default.

## attributes__age_group

Use a concise verified age/audience label as plain text. Do not infer audience from the sample or product size.

## attributes__ideal_for

Use the verified intended audience or use as concise plain text. Do not assume every product shares the sample audience.

## attributes__no_of_pieces

Use a verified whole-number count as text without a unit or label, shape `{n}`. Do not assume a count of one.

## attributes__pack

Use the verified pack count as number-only text, shape `{n}`. Do not assume that pack count equals pieces.

## attributes__package_contents

Use a plain-text count and item name in the observed shape `{n} {item}`. If multiple included item types are verified, separate them with a comma and one space.

## attributes__in_the_box

Use a plain-text count and item name in the observed shape `{n} {item}`. Keep actual box contents separate from accessories sold independently.

## attributes__product_dimensions

Use labeled width, depth, and height in this observed order: `W{n} x D{n} x H{n} cm`, with lowercase x and spaces around it. Preserve the axis meaning; convert units only from known source measurements and never fill a missing axis by guessing.

## attributes__package_dimensions

Use labeled package measurements in the observed order: `W{n} x D{n} x H{n} cm`, with lowercase x and spaces around it. Keep package measurements separate from product dimensions; do not infer one from the other.

## attributes__weight

Use the verified product weight as `{n} kg`, with a space before kg. Preserve meaningful source precision; one sample does not establish a fixed decimal count. Do not use shipping weight as product weight.

## attributes__shape

Use a short verified geometric shape label as plain text.

## attributes__design

Use a short verified marketed design/style descriptor as plain text; do not infer one from the sample.

## attributes__pattern

Use the verified surface pattern as concise plain text. Do not infer a pattern from color.

## attributes__size

Use verified nominal luggage size as `{n} inches`, with a space. Do not invent a nominal size from the package dimensions.

## attributes__capacity

Use verified storage capacity as `{n}L`, matching the sample with no space before uppercase L. Do not calculate it from exterior dimensions.

## attributes__shell_type

Use the verified shell classification as short plain text, shape `{shell type}`.

## attributes__no_of_wheels

Use a verified whole-number wheel count as number-only text, shape `{n}`. Do not infer it from the luggage type.

## attributes__handle_type

Use a concise verified handle-type descriptor as plain text.

## attributes__closure

Use a short verified closure mechanism label as plain text.

## attributes__laptop_compartment

Use exactly `Yes` or `No` only when verified. An unknown or unstated capability is not evidence for No.

## attributes__compartment

Use a verified whole-number compartment count as number-only text, shape `{n}`. Do not count pockets as compartments without source support.

## attributes__lock_type

Use the verified lock mechanism/type as concise text. Do not infer a TSA lock merely because a combination lock is mentioned. Sample cell is blank: no sample-specific format or requiredness can be learned for this column.

## attributes__tsa_combination_lock

Use exactly `Yes` or `No` only when verified. An unknown or unstated capability is not evidence for No.

## attributes__water_resistance

Use exactly `Yes` or `No` only when verified. An unknown or unstated capability is not evidence for No.

## attributes__special_features

Use verified feature names as a comma-and-space-separated plain-text list, matching the observed short-phrase style. Do not copy the sample feature set.

## attributes__features

Use a short factual feature phrase; if several verified features are needed, separate them with a comma and one space. No HTML or list markers. Sample cell is blank: no sample-specific format or requiredness can be learned for this column.

## attributes__other_information

Include only additional verified product information that does not fit another header, as concise plain text. Do not use this field to copy the sample or invent a value. Sample cell is blank: no sample-specific format or requiredness can be learned for this column.

## attributes__note

Use concise factual plain-text notes only when supported by the current product evidence. Do not add a generic sample caveat to every product.

## attributes__country_of_origin

Use the verified manufacturing country as its plain-text country name. Do not infer it from the brand, seller, or sample country.
