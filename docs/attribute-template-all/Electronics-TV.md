# Electronics-TV: sample-format mapping rules

Source: `OneDrive_2_10-15-2026/Electronics-TV.xls`, sheet `Sheet1`. Catalog headers: row 2, in the reviewed manifest order. Sample product rows: 3. Grouping labels and lower-row metadata are excluded from the output headers; reviewed corrections are listed below.

Learn formatting only. Obtain actual facts from SAP first, then other verified evidence where the existing workflow permits. Existing supplied values and missing-value handling remain governed by the application. Sample identities, claims, quantities, and classifications are never defaults or allowed-value lists. Placeholder examples show shape only and must never be emitted literally.

Keep the exact headers and their order. The six application pass-through fields are sku, base_code, attributes__lulu_ean, attributes__shipping_weight, attributes__brand, and attributes__lulu_product_type. Name may be generated only when missing. No required/optional classifications or IDQ flags are inferred. Blank samples establish neither optionality nor absence; fallback advice is explicitly labeled. Units/spacing are specific to this template; a single sample does not establish fixed precision. Qualifiers such as Up to and Approx. apply only when current source facts support them.

### Source annotations and unresolved metadata

Lower-row metadata is retained as source guidance only: row 6: `Mandatory Attributes`; row 7: `attributes__screen_size`; row 8: `attributes__display_type`; row 9: `attributes__display_feature`.

Mandatory labels, slash alternatives, new-header labels, and misspelled references do not add output columns, IDQ flags, or required/optional classifications. Actual row-2 keys govern output.

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

Write one concise factual benefit phrase as plain text, without HTML or a list marker. Keep separate bullets distinct and use current verified facts only. The sample has no terminal full stop.

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

## attributes__accessories

Use verified included accessories as concise plain-text entries separated by a comma and one space: `{entry}, {entry}`. List included accessories only; compatibility alone does not establish inclusion.

## attributes__in_the_box

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified actual box contents as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__brand

Application pass-through: preserve the supplied SAP brand exactly; sample brand names are never defaults.

## attributes__lulu_product_type

Application pass-through: preserve the supplied SAP product type under this exact canonical key. Do not add a legacy attributes__product_type alias.

## attributes__model

Use the verified model identifier as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__color

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified marketed color as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__cord_length

Use the verified cord length in the observed shape `{n}m`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__model_year

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified model year as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__product_dimensions

Use verified product dimensions in the observed shape `{dimension1} × {dimension2} × {dimension3} mm`. Preserve axis labels/order, exact x versus × separator, spacing, and unit. The three axes are unlabeled in this sample; retain source ordering rather than inventing width/depth/height meanings. Keep product and package measurements separate and convert only from known measurements.

## attributes__package_dimensions

Use verified package dimensions in the observed shape `{dimension1} × {dimension2} × {dimension3} mm`. Preserve axis labels/order, exact x versus × separator, spacing, and unit. The three axes are unlabeled in this sample; retain source ordering rather than inventing width/depth/height meanings. Keep product and package measurements separate and convert only from known measurements.

## attributes__weight

Use the verified product weight in the observed shape `{n} kg`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count. Keep product weight separate from pass-through shipping weight.

## attributes__display_type

Use the verified display technology/type as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__display_resolution

Use verified resolution in the observed shape `{horizontal} x {vertical} pixels`. Preserve lowercase x, spaces, and the exact unit case/basis; do not confuse print DPI with display pixels.

## attributes__display_feature

Use the verified display features in the observed shape `{n}K`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__screen_size

Use the verified display diagonal size in the observed shape `{n} inches`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__refresh_rate

Use the verified display/output refresh rate in the observed shape `{n} Hz`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__brightness

Use the verified rated brightness with its actual luminance/luminous-flux basis in the observed shape `{n} nits`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__audio

Use verified supported audio modes/technologies as concise plain-text entries separated by a comma and one space: `{entry}, {entry}`.

## attributes__no_of_speakers

Use the verified speaker count as number-only text, shape `{n}`, with no added unit or label. Preserve identifiers/notation rather than performing arithmetic on the sample.

## attributes__no_of_channels

Use verified channel notation in the observed shape `{main channels}.{subwoofer channels} Channel`, with a space before Channel. Preserve the dot as channel configuration rather than rounding a decimal.

## attributes__processor

Use the verified processor designation as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__picture_processor

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified picture-processing engine as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__version

Use the verified product/system version designation as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__ram

Use the verified RAM capacity in the observed shape `{n} GB`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__internal_storage

Use the verified internal storage capacity and medium in the observed shape `{n} GB`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__ssd

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified solid-state-drive capacity/type as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__storage

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified storage capacity as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__gpu

Use the verified graphics processor designation as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__os

Use the verified supported/installed operating systems as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__range

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified operating/connection range as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__graphics

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified graphics specification as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__connectivity

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified connection methods as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__wifi

Use the verified Wi-Fi standard in the observed shape `Wi-Fi {generation}`. Preserve the hyphen and space; this is a standard label rather than a Yes/No flag.

## attributes__bluetooth

Use the verified Bluetooth version in the observed shape `v{major}.{minor}`, retaining lowercase v and any specified dot. This sample supplies a version, not a Yes/No flag; do not replace it with a boolean.

## attributes__ethernet

Use verified connector counts in the observed shape `{count} × {connector type}`. Preserve the quantity separator, spaces, and connector designations from evidence; this is not a Yes/No field in this template.

## attributes__ports

Use verified connector counts in the observed shape `{count} × {connector type}`, separating multiple entries with a comma and one space. Preserve the quantity separator, spaces, and connector designations from evidence; this is not a Yes/No field in this template.

## attributes__hdmi

Use the verified HDMI port specification/count in the observed shape `{n} ea`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__usb

Use verified connector counts in the observed shape `{count} × {connector type}`. Preserve the quantity separator, spaces, and connector designations from evidence; this is not a Yes/No field in this template.

## attributes__aux

Use verified connector counts in the observed shape `{count} x {connector type}`. Preserve the quantity separator, spaces, and connector designations from evidence; this is not a Yes/No field in this template.

## attributes__iot_connectivity

Sample cell is blank: no sample format evidence. Semantic fallback only: Use the verified platform/app or capability specification; no Yes/No or platform-name format is established here.

## attributes__supported_video_formats

Use verified supported video formats as concise plain-text entries separated by a comma and one space: `{entry}, {entry}`.

## attributes__features

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified product features as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__special_features

Use verified distinctive features as concise plain-text entries separated by a comma and one space: `{entry}, {entry}`.

## attributes__remote

Use `Yes` or `No` for the verified remote-control capability, matching the sample capability format and case. Preserve unknowns under existing blank handling; an unstated feature is not No.

## attributes__ui

Use the verified user-interface/system name as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__sensors

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified sensor names/types as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__battery_type

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified battery chemistry/size/type as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__mounting_type

Use the verified mounting method as concise plain text, preserving official names, meaningful case, and punctuation.

## attributes__country_of_origin

Use the verified manufacturing country name as concise plain text, preserving official names, meaningful case, and punctuation. Use the manufacturing country from evidence rather than brand origin or seller location.

## attributes__other_information

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified additional relevant product information as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__power_consumption

Use the verified power consumption in the observed shape `{n}W`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## attributes__voltage

Use the verified electrical input voltage in the observed shape `{min}–{max}V`. Use verified current-product measurements; preserve the observed unit case, spacing, and separator. Keep meaningful source precision without imposing the sample decimal count.

## note

Sample cell is blank: no sample format evidence. Semantic fallback only: Use verified product-specific caveats as concise plain text; preserve its source representation because no template-specific style is established.
