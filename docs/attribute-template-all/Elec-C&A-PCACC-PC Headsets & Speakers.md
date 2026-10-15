# Elec-C&A-PCACC-PC Headsets & Speakers: sample-format mapping rules

Source: `OneDrive_2_10-15-2026/Elec-C&A-PCACC-PC Headsets & Speakers.xls`, sheet `Sheet1`. Catalog headers: row 2, in the reviewed manifest order. Sample product rows: 3. Grouping labels and lower-row metadata are excluded from the output headers; reviewed corrections are listed below.

Learn formatting only. Obtain actual facts from SAP first, then other verified evidence where the existing workflow permits. Existing supplied values and missing-value handling remain governed by the application. Sample identities, claims, quantities, and classifications are never defaults or allowed-value lists. Placeholder examples show shape only and must never be emitted literally.

Keep the exact headers and their order. The six application pass-through fields are sku, base_code, attributes__lulu_ean, attributes__shipping_weight, attributes__brand, and attributes__lulu_product_type. Name may be generated only when missing. No required/optional classifications or IDQ flags are inferred. Blank samples establish neither optionality nor absence; fallback advice is explicitly labeled. Units/spacing are specific to this template; a single sample does not establish fixed precision. Qualifiers such as Up to and Approx. apply only when current source facts support them.

### Source annotations and unresolved metadata

Lower-row metadata is retained as source guidance only: row 5: `Mandatory Attributes`; row 6: `attributes__connectivity`; row 7: `attributes__ports`.

Mandatory labels, slash alternatives, new-header labels, and misspelled references do not add output columns, IDQ flags, or required/optional classifications. Actual row-2 keys govern output.

Reviewed source/header corrections: Trimmed header whitespace at V2. Trimmed header whitespace at W2. Trimmed header whitespace at X2. Trimmed header whitespace at AD2. Trimmed header whitespace at AE2. Appended required application pass-through header attributes__brand, absent from the source.

The literal output key is `note`; preserve it rather than renaming it to attributes__note.

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

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified piece count as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__package_contents

Use verified supplied items with quantities in the observed shape `{count} x {item}`. Preserve the quantity separator and spacing; include only verified contents.

## attributes__pack

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified pack composition/count as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__in_the_box

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified actual box contents as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__product_dimensions

Use verified product dimensions in the observed shape `L{length} × W{width} × H{height} cm`. Preserve axis labels/order, exact x versus × separator, spacing, and unit. Keep product and package measurements separate and convert only from known measurements.

## attributes__package_dimensions

Use verified package dimensions in the observed shape `L{length} × W{width} × H{height} cm`. Preserve axis labels/order, exact x versus × separator, spacing, and unit. Keep product and package measurements separate and convert only from known measurements.

## attributes__weight

Use the verified product weight in the observed shape `{n} kg`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Keep product weight separate from pass-through shipping weight.

## attributes__lulu_product_type

Application pass-through: preserve the supplied SAP product type under this exact canonical key. Do not add a legacy attributes__product_type alias.

## attributes__model

Use the verified model identifier as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__color

Use the verified marketed color as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__audio

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified supported audio modes/technologies as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__no_of_channels

Sample cell is blank: no sample format evidence. Semantic fallback only: Preserve verified audio channel notation, including meaningful decimal subwoofer notation; it is not an ordinary integer count.

## attributes__connectivity

Use the verified connection methods as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__bluetooth

Use the verified Bluetooth version in the observed shape `v{major}.{minor}`, retaining lowercase v and any specified dot. This sample supplies a version, not a Yes/No flag; do not replace it with a boolean.

## attributes__design

Use the verified design/style as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__features

Use verified product features as concise plain-text entries separated by a comma and one space: `{entry}, {entry}`.

## attributes__noise_cancellation

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified noise-cancellation type as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__mic

Use `Yes` or `No` for the verified microphone capability, matching the sample capability format and case. Preserve unknowns under existing blank handling; an unstated feature is not No.

## attributes__battery_capacity

Use the verified battery capacity or battery-size/count specification in the observed shape `{n} mAh`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Keep electrical capacity distinct from battery chemistry, battery quantity, and runtime.

## attributes__playback_time

Use the verified playback duration in the observed shape `Up to {n} Hours`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__standby_time

Use the verified standby duration in the observed shape `Up to {n} Months`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__battery_life

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified battery life under stated usage conditions as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__battery_type

Use the verified battery chemistry/size/type as concise plain text, preserving official names, meaningful case, and punctuation. Preserve the specified chemistry/size; do not derive it from runtime.

## attributes__ports

Use the verified port/connector specifications as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__power

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified rated power as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__water_resistance

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified water-resistance claim as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__ip_rating

Preserve the exact verified IP protection token as `IP{rating}–IP{rating}`, including any X and any verified range separator. Do not infer a certification from a generic water-resistance claim.

## attributes__other_information

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified additional relevant product information as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__country_of_origin

Use the verified manufacturing country name as concise plain text, preserving official names, meaningful case, and punctuation. Use the manufacturing country from evidence rather than brand origin or seller location.

## note

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified product-specific caveats as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__brand

Application pass-through: preserve the supplied SAP brand exactly; sample brand names are never defaults. Sample cell is blank or no trustworthy sample is available: no sample format evidence. Preserve the supplied application value or existing blank.
