# H&L-Outdoor & Accessories: sample-format mapping rules

Source: `OneDrive_2_10-15-2026/H&L-Outdoor & Accessories.xls`, sheet `Outdoor Template`. Catalog headers: row 2, in the reviewed manifest order. Sample product rows: 3. Grouping labels and lower-row metadata are excluded from the output headers; reviewed corrections are listed below.

Learn formatting only. Obtain actual facts from SAP first, then other verified evidence where the existing workflow permits. Existing supplied values and missing-value handling remain governed by the application. Sample identities, claims, quantities, and classifications are never defaults or allowed-value lists. Placeholder examples show shape only and must never be emitted literally.

Keep the exact headers and their order. The six application pass-through fields are sku, base_code, attributes__lulu_ean, attributes__shipping_weight, attributes__brand, and attributes__lulu_product_type. Name may be generated only when missing. No required/optional classifications or IDQ flags are inferred. Blank samples establish neither optionality nor absence; fallback advice is explicitly labeled. Units/spacing are specific to this template; a single sample does not establish fixed precision. Qualifiers such as Up to and Approx. apply only when current source facts support them.

### Source annotations and unresolved metadata

Lower-row metadata is retained as source guidance only: row 6: `Mandatory Attributes`; row 7: `attributes__material`; row 8: `attributes__size/attributes__capacity`.

Mandatory labels, slash alternatives, new-header labels, and misspelled references do not add output columns, IDQ flags, or required/optional classifications. Actual row-2 keys govern output.

Explicit bullet priorities are applied by their literal column alignment: `attributes__bullet_point_1` → Features; `attributes__bullet_point_2` → Features; `attributes__bullet_point_3` → Features; `attributes__bullet_point_4` → Features; `attributes__bullet_point_5` → Features; `attributes__bullet_point_6` → Features.

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

Explicit template priority: Features. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_2

Explicit template priority: Features. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

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

Use relevant lower-case search phrases separated by commas without following spaces: `{product phrase},{feature phrase}`. Select phrases from the current product facts.

## attributes__brand

Application pass-through: preserve the supplied SAP brand exactly; sample brand names are never defaults.

## attributes__lulu_product_type

Application pass-through: preserve the supplied SAP product type under this exact canonical key. Do not add a legacy attributes__product_type alias.

## attributes__model

Use the verified model identifier as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__color

Use the verified marketed color as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__no_of_pieces

Use the verified piece count as number-only text, shape `{n}`, with no added unit or label. Preserve identifiers/notation rather than performing arithmetic on the sample.

## attributes__package_contents

Use verified supplied items with quantities in the observed shape `{count} x {item}`. Preserve the quantity separator and spacing; include only verified contents.

## attributes__pack

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified pack composition/count as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__in_the_box

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified actual box contents as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__product_dimensions

Use verified product dimensions in the observed shape `{dimension1} x {dimension2} x {dimension3} cm`. Preserve axis labels/order, exact x versus × separator, spacing, and unit. The three axes are unlabeled in this sample; retain source ordering rather than inventing width/depth/height meanings. Keep product and package measurements separate and convert only from known measurements.

## attributes__package_dimensions

Use verified package dimensions in the observed shape `{dimension1} x {dimension2} x {dimension3} cm`. Preserve axis labels/order, exact x versus × separator, spacing, and unit. The three axes are unlabeled in this sample; retain source ordering rather than inventing width/depth/height meanings. Keep product and package measurements separate and convert only from known measurements.

## attributes__weight

Use the verified product weight in the observed shape `{n} kg`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Keep product weight separate from pass-through shipping weight.

## attributes__material

Use the verified material or composition as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__filling_material

Use the verified filling material as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__finish

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified surface finish as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__design

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified design/style as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__pattern

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified surface pattern as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__volume

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified audio output/sound-level specification as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__content

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified net content or contents in its stated context as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__capacity

Use the verified function-specific capacity in the observed shape `{n} kg`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Keep the supported function and volume/load basis distinct from other capacity fields.

## attributes__size

Use the verified stated product size in the observed shape `{n} cm`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__usage_instructions

Use verified supported operating/installation instructions as concise plain-text entries separated by a comma and one space: `{entry}, {entry}`.

## attributes__usage

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified intended uses as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__maximum_weight_capacity

Use the verified load limit in the observed shape `Maximum Load Capacity : {n} kg`, preserving the label, spaces around the colon, and the space before kg. Do not infer load capacity from product weight.

## attributes__seating_capacity

Use the verified seating capacity as number-only text, shape `{n}`, with no added unit or label. Preserve identifiers/notation rather than performing arithmetic on the sample.

## attributes__brightness

Use the verified rated brightness with its actual luminance/luminous-flux basis in the observed shape `{n} Lumens`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__charging_type

Use the verified charging method/connector as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__charging_time

Use the verified charging duration in the observed shape `{n} hours`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Express time to charge, not operating or standby duration.

## attributes__battery_capacity

Use the verified battery capacity or battery-size/count specification in the observed shape `{n} mAh`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Keep electrical capacity distinct from battery chemistry, battery quantity, and runtime.

## attributes__features

Use verified product features as concise plain-text entries separated by a comma and one space: `{entry}, {entry}`.

## attributes__special_features

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified distinctive features as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__foldability

Use the verified folding designation in the observed shape `{n} fold`, with a space; this is a folding-count description rather than a Yes/No flag.

## attributes__adjustability

Use the verified supported adjustments as concise plain text, preserving official names, meaningful case, and punctuation. The populated sample uses descriptive text, not a Yes/No flag.

## attributes__assembly_required

Use verified assembly requirement as concise plain text. The sample uses slash-separated entries, shape `{entry}/{entry}`; select applicable supported entries rather than copying every example alternative or treating them as an allowed-value enum.

## attributes__indoor_outdoor_usage

Use verified supported usage location as concise plain text. The sample uses slash-separated entries, shape `{entry}/{entry}`; select applicable supported entries rather than copying every example alternative or treating them as an allowed-value enum.

## attributes__water_resistance

Use the exact verified IP-rating token in this field, shape `IP{rating}`. This sample is a rating rather than a Yes/No flag; do not infer certification from an unsupported water-resistance claim.

## attributes__note

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified product-specific caveats as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__other_information

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified additional relevant product information as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__country_of_origin

Use the verified manufacturing country name as concise plain text, preserving official names, meaningful case, and punctuation. Use the manufacturing country from evidence rather than brand origin or seller location.

## attributes__care_instructions

Use verified care instructions as concise plain-text entries separated by a comma and one space: `{entry}, {entry}`.
