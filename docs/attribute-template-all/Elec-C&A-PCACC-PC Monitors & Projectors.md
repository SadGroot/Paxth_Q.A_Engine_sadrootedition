# Elec-C&A-PCACC-PC Monitors & Projectors: sample-format mapping rules

Source: `OneDrive_2_10-15-2026/Elec-C&A-PCACC-PC Monitors & Projectors.xls`, sheet `Monitors & Projectors`. Catalog headers: row 2, in the reviewed manifest order. Sample product rows: 3, 4. Grouping labels and lower-row metadata are excluded from the output headers; reviewed corrections are listed below.

Learn formatting only. Obtain actual facts from SAP first, then other verified evidence where the existing workflow permits. Existing supplied values and missing-value handling remain governed by the application. Sample identities, claims, quantities, and classifications are never defaults or allowed-value lists. Placeholder examples show shape only and must never be emitted literally.

Keep the exact headers and their order. The six application pass-through fields are sku, base_code, attributes__lulu_ean, attributes__shipping_weight, attributes__brand, and attributes__lulu_product_type. Name may be generated only when missing. No required/optional classifications or IDQ flags are inferred. Blank samples establish neither optionality nor absence; fallback advice is explicitly labeled. Units/spacing are specific to this template; a single sample does not establish fixed precision. Qualifiers such as Up to and Approx. apply only when current source facts support them.

### Source annotations and unresolved metadata

Lower-row metadata is retained as source guidance only: row 8: `Mandatory attributes`; row 9: `attributes__screen_size`; row 10: `attributes__display_type`; row 11: `attributes__refresh_rate`; row 12: `attributes__display_feature`.

Mandatory labels, slash alternatives, new-header labels, and misspelled references do not add output columns, IDQ flags, or required/optional classifications. Actual row-2 keys govern output.

Explicit bullet priorities are applied by their literal column alignment: `attributes__bullet_point_1` → Display Size & Display Type; `attributes__bullet_point_2` → Refresh Rate; `attributes__bullet_point_3` → Display Feature; `attributes__bullet_point_4` → Features; `attributes__bullet_point_5` → Features; `attributes__bullet_point_6` → Features.

Rows 3, 4 are distinct product examples, not instructions. Use all only for format evidence; observed unit/style alternatives remain source-dependent and do not establish default values.

Reviewed source/header corrections: Collapsed repeated attributes__material at BA2 into its first position.

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

Explicit template priority: Display Size & Display Type. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_2

Explicit template priority: Refresh Rate. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_3

Explicit template priority: Display Feature. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_4

Explicit template priority: Features. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_5

Explicit template priority: Features. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__bullet_point_6

Explicit template priority: Features. Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

## attributes__product_description

Write a factual plain-text paragraph, following the single-paragraph sample layout; the short example does not establish a fixed length. No sample contains HTML; this template establishes no HTML requirement.

## attributes__keywords

Use relevant lower-case space-separated keyword tokens, following `{product} {type} {feature}`. The sample does not use commas.

## attributes__brand

Application pass-through: preserve the supplied SAP brand exactly; sample brand names are never defaults.

## attributes__lulu_product_type

Application pass-through: preserve the supplied SAP product type under this exact canonical key. Do not add a legacy attributes__product_type alias.

## attributes__color

Use the verified marketed color as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__model

Use the verified model identifier as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__model_year

Use the verified model year as four-digit text, shape `YYYY`; do not replace it with the current year or the sample year.

## attributes__material

Use the verified material or composition as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__no_of_pieces

Use the verified piece count as number-only text, shape `{n}`, with no added unit or label. Preserve identifiers/notation rather than performing arithmetic on the sample.

## attributes__pack

Use the verified pack composition/count as number-only text, shape `{n}`, with no added unit or label. Preserve identifiers/notation rather than performing arithmetic on the sample.

## attributes__package_contents

Use verified included package items as concise plain-text entries separated by a comma and one space: `{entry}, {entry}`. List verified included items only; quantities must come from evidence.

## attributes__in_the_box

Use verified actual box contents as concise plain-text entries separated by a comma and one space: `{entry}, {entry}`. Keep actual box contents distinct from separately sold compatible accessories.

## attributes__accessories

Multiple sample formats occur; choose the verified source basis rather than forcing all products into one sample value:

- Use verified included accessories as concise plain-text entries separated by a comma and one space: `{entry}, {entry}`. List included accessories only; compatibility alone does not establish inclusion.
- Use the verified included accessories as concise plain text, preserving official names, meaningful case, and punctuation. List included accessories only; compatibility alone does not establish inclusion.

## attributes__product_dimensions

Use verified product dimensions in the observed shape `W{width} x D{depth} x H{height} cm`. Preserve axis labels/order, exact x versus × separator, spacing, and unit. Keep product and package measurements separate and convert only from known measurements.

## attributes__package_dimensions

Use verified package dimensions in the observed shape `W{width} x D{depth} x H{height} cm`. Preserve axis labels/order, exact x versus × separator, spacing, and unit. Keep product and package measurements separate and convert only from known measurements.

## attributes__weight

Use the verified product weight in the observed shape `{n} kg`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Keep product weight separate from pass-through shipping weight.

## attributes__display_type

Use the verified display technology/type as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__display_resolution

Use verified display pixel dimensions in the observed shape `{horizontal} x {vertical}`, with lowercase x and spaces. The sample has no trailing unit label; preserve the horizontal/vertical order.

## attributes__screen_size

Multiple sample formats occur; choose the verified source basis rather than forcing all products into one sample value:

- Use the verified display diagonal size in the observed shape `{n} inches`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.
- Use the verified display diagonal size in the observed shape `Up to {n} inches`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__refresh_rate

Use the verified display/output refresh rate in the observed shape `{n} Hz`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

One sample cell is blank; a value in another sample does not establish requiredness or authorize filling without evidence.

## attributes__brightness

Multiple sample formats occur; choose the verified source basis rather than forcing all products into one sample value:

- Use the verified rated brightness with its actual luminance/luminous-flux basis in the observed shape `{n} nits`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.
- Use the verified rated brightness with its actual luminance/luminous-flux basis in the observed shape `{n} lumens`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__audio

Use the verified supported audio modes/technologies as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__no_of_speakers

Use the verified speaker count as number-only text, shape `{n}`, with no added unit or label. Preserve identifiers/notation rather than performing arithmetic on the sample.

## attributes__light_source

Use the verified light-treatment technology as concise plain text, preserving official names, meaningful case, and punctuation.

One sample cell is blank; a value in another sample does not establish requiredness or authorize filling without evidence.

## attributes__focus_type

Use the verified focusing method as concise plain text, preserving official names, meaningful case, and punctuation.

One sample cell is blank; a value in another sample does not establish requiredness or authorize filling without evidence.

## attributes__control

Use the verified control method as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__connectivity

Use verified connection methods as concise plain-text entries separated by a comma and one space: `{entry}, {entry}`.

## attributes__ports

Sample cell is blank in every sample product: no sample format evidence. Semantic fallback only: Use verified connector names and counts, preserving connector/version information; a fixed count/list style is not established.

## attributes__hdmi

Use the verified HDMI port specification/count as number-only text, shape `{n}`, with no added unit or label. Preserve identifiers/notation rather than performing arithmetic on the sample.

## attributes__usb

Use the verified USB connection/version/connector specification as number-only text, shape `{n}`, with no added unit or label. Preserve identifiers/notation rather than performing arithmetic on the sample.

## attributes__wifi

Use `Yes` or `No` for the verified Wi-Fi capability/standard, matching the sample capability format and case. Preserve unknowns under existing blank handling; an unstated feature is not No.

One sample cell is blank; a value in another sample does not establish requiredness or authorize filling without evidence.

## attributes__bluetooth

Sample cell is blank in every sample product: no sample format evidence. Semantic fallback only: Report a verified version/standard when stated, or a supported capability value under the existing workflow; no version or boolean format is learned.

## attributes__power

Use the verified rated power as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__voltage

Use the verified electrical input voltage in the observed shape `{n}V`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__wattage

Use the verified rated wattage in the observed shape `{n}W`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__cord_length

Use the verified cord length in the observed shape `{n}m`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__standby

Sample cell is blank in every sample product: no sample format evidence. Semantic fallback only: Use verified standby specification as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__os

Sample cell is blank in every sample product: no sample format evidence. Semantic fallback only: Use verified supported/installed operating systems as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__version

Sample cell is blank in every sample product: no sample format evidence. Semantic fallback only: Use verified product/system version designation as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__noise_level

Sample cell is blank in every sample product: no sample format evidence. Semantic fallback only: Use verified noise measurement and operating conditions as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__mouting_type

Multiple sample formats occur; choose the verified source basis rather than forcing all products into one sample value:

- Use the verified mounting method as concise plain text, preserving official names, meaningful case, and punctuation.
- Use verified mounting method as concise plain text. The sample uses slash-separated entries, shape `{entry} / {entry}`; select applicable supported entries rather than copying every example alternative or treating them as an allowed-value enum.

## attributes__features

Use verified product features as concise plain-text entries separated by a comma and one space: `{entry}, {entry}`.

## attributes__display_feature

Use the verified display features as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__other_information

Sample cell is blank in every sample product: no sample format evidence. Semantic fallback only: Use verified additional relevant product information as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__note

Sample cell is blank in every sample product: no sample format evidence. Semantic fallback only: Use verified product-specific caveats as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__country_of_origin

Use the verified manufacturing country name as concise plain text, preserving official names, meaningful case, and punctuation. Use the manufacturing country from evidence rather than brand origin or seller location.
