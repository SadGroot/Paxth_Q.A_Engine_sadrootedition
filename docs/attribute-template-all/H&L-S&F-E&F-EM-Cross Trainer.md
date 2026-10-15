# H&L-S&F-E&F-EM-Cross Trainer: sample-format mapping rules

Source: `OneDrive_2_10-15-2026/H&L-S&F-E&F-EM-Cross Trainer.xls`, sheet `Cross Trainer`. Catalog headers: row 2, in the reviewed manifest order. Sample product rows: 3, 4, 5. Grouping labels and lower-row metadata are excluded from the output headers; reviewed corrections are listed below.

Learn formatting only. Obtain actual facts from SAP first, then other verified evidence where the existing workflow permits. Existing supplied values and missing-value handling remain governed by the application. Sample identities, claims, quantities, and classifications are never defaults or allowed-value lists. Placeholder examples show shape only and must never be emitted literally.

Keep the exact headers and their order. The six application pass-through fields are sku, base_code, attributes__lulu_ean, attributes__shipping_weight, attributes__brand, and attributes__lulu_product_type. Name may be generated only when missing. No required/optional classifications or IDQ flags are inferred. Blank samples establish neither optionality nor absence; fallback advice is explicitly labeled. Units/spacing are specific to this template; a single sample does not establish fixed precision. Qualifiers such as Up to and Approx. apply only when current source facts support them.

### Source annotations and unresolved metadata

Lower-row metadata is retained as source guidance only: row 8: `Mandatory Attributes`, `attributes__drive_system`; row 9: `attributes__resistance_levels`, `attributes__flywheel_weight`, `Front drive / Rear drive / Center drive`; row 10: `attributes__resistance_types`.

Mandatory labels, slash alternatives, new-header labels, and misspelled references do not add output columns, IDQ flags, or required/optional classifications. Actual row-2 keys govern output.

Explicit bullet priorities are applied by their literal column alignment: `attributes__bullet_point_1` → Resistance levels/Features; `attributes__bullet_point_2` → Resistance type/Features; `attributes__bullet_point_3` → Features; `attributes__bullet_point_4` → Features; `attributes__bullet_point_5` → Features; `attributes__bullet_point_6` → Features.

Unresolved metadata references absent from the exact header row: `attributes__resistance_types`. Keep actual header spellings and leave these references unresolved.

Rows 3, 4, 5 are distinct product examples, not instructions. Use all only for format evidence; observed unit/style alternatives remain source-dependent and do not establish default values.

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

Explicit template priority: Resistance levels/Features. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_2

Explicit template priority: Resistance type/Features. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_3

Explicit template priority: Features. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_4

Explicit template priority: Features. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_5

Explicit template priority: Features. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_6

Explicit template priority: Features. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__product_description

Write readable factual plain-text paragraphs separated by a blank line, following the sample layout; its paragraph count is not a requirement. No sample contains HTML; this template establishes no HTML requirement.

## attributes__keywords

Use relevant lower-case search phrases separated by a comma and one space: `{product phrase}, {feature phrase}`. Select phrases from the current product facts.

## attributes__brand

Application pass-through: preserve the supplied SAP brand exactly; sample brand names are never defaults.

## attributes__lulu_product_type

Application pass-through: preserve the supplied SAP product type under this exact canonical key. Do not add a legacy attributes__product_type alias.

## attributes__model

Sample cell is blank in every sample product: no sample format evidence. Semantic fallback only: Use verified model identifier as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__color

Use the verified marketed color as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__installation

Use the verified installation type as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__frame_material

Sample cell is blank in every sample product: no sample format evidence. Semantic fallback only: Use verified frame material as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__material

Use the verified material or composition as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__usage

Use the verified intended uses as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__ideal_for

Use the verified intended audience/use environments as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__size

Use the verified stated product size as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__maximum_user_weight

Use the verified maximum supported user weight in the observed shape `{n} kg`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__flywheel_weight

Sample cell is blank in every sample product: no sample format evidence. Semantic fallback only: Use verified flywheel weight as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__stride_length

Use the verified stride length in the observed shape `{n} cm`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__screen_size

Use the verified display diagonal size in the observed shape `{n} inches`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__resistance_type

Use the verified resistance technology as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__resistance_levels

Use the verified resistance-level count/specification as number-only text, shape `{n}`, with no added unit or label. Preserve identifiers/notation rather than performing arithmetic on the sample.

## attributes__display_type

Use the verified display technology/type as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__drive_system

Use the verified drive-system design as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__features

Use the verified product features as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__special_features

Sample cell is blank in every sample product: no sample format evidence. Semantic fallback only: Use verified distinctive features as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__safety_features

Use the verified verified safety features as concise plain text, preserving official names, meaningful case, and punctuation. Claims and certifications need source support; the example feature set is not a default.

## attributes__no_of_programs

Use the verified programme count as number-only text, shape `{n}`, with no added unit or label. Preserve identifiers/notation rather than performing arithmetic on the sample. A partial programme list does not establish a total count.

## attributes__programs

Use the verified programme names as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__connectivity

Use the verified connection methods as concise plain text, preserving official names, meaningful case, and punctuation.

One sample cell is blank; a value in another sample does not establish requiredness or authorize filling without evidence.

## attributes__supported_apps

Use the verified supported application names/compatibility as concise plain text, preserving official names, meaningful case, and punctuation.

One sample cell is blank; a value in another sample does not establish requiredness or authorize filling without evidence.

## attributes__power

Use the verified rated power as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__power_consumption

Sample cell is blank in every sample product: no sample format evidence. Semantic fallback only: Use verified power consumption as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__no_of_pieces

Use the verified piece count as number-only text, shape `{n}`, with no added unit or label. Preserve identifiers/notation rather than performing arithmetic on the sample.

## attributes__pack

Sample cell is blank in every sample product: no sample format evidence. Semantic fallback only: Use verified pack composition/count as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__package_contents

Sample cell is blank in every sample product: no sample format evidence. Semantic fallback only: Use verified included package items as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__in_the_box

Sample cell is blank in every sample product: no sample format evidence. Semantic fallback only: Use verified actual box contents as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__product_dimensions

Use verified product dimensions in the observed shape `W{width} x D{depth} x H{height} cm`. Preserve axis labels/order, exact x versus × separator, spacing, and unit. Keep product and package measurements separate and convert only from known measurements.

## attributes__package_dimensions

Use verified package dimensions in the observed shape `W{width} x D{depth} x H{height} cm`. Preserve axis labels/order, exact x versus × separator, spacing, and unit. Keep product and package measurements separate and convert only from known measurements.

## attributes__weight

Use the verified product weight in the observed shape `{n} kg`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Keep product weight separate from pass-through shipping weight.

## attributes__other_information

Sample cell is blank in every sample product: no sample format evidence. Semantic fallback only: Use verified additional relevant product information as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__note

Sample cell is blank in every sample product: no sample format evidence. Semantic fallback only: Use verified product-specific caveats as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__country_of_origin

Use the verified manufacturing country name as concise plain text, preserving official names, meaningful case, and punctuation. Use the manufacturing country from evidence rather than brand origin or seller location.
