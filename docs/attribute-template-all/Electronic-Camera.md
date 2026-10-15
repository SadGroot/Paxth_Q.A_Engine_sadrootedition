# Electronic-Camera: sample-format mapping rules

Source: `OneDrive_2_10-15-2026/Electronic-Camera.xls`, sheet `Electronic Camera`. Catalog headers are row 2 in the reviewed manifest order. Row 3 is a partially usable sample: its 26 labeled cells A–Z align with their headers and provide format evidence. Cells AA onward are misaligned or unreliable and provide no per-header format evidence. The unlabelled AB3 value is excluded; no header or technical value is invented to accommodate it.

Learn formatting only. Obtain actual facts from SAP first, then other verified evidence where the existing workflow permits. Existing supplied values and missing-value handling remain governed by the application. Sample identities, quantities, measurements, and claims are never defaults or allowed-value lists. Placeholder patterns show shape only and must never be emitted literally.

Keep every exact output header in its reviewed order. The six application pass-through fields are sku, base_code, attributes__lulu_ean, attributes__shipping_weight, attributes__brand, and attributes__lulu_product_type. Name may be generated only when missing. No required/optional classifications or IDQ flags are inferred.

### Source annotations and unresolved metadata

Row 1 contains grouping labels rather than output headers. Row 4 supplies a title limit below 75 characters and bullet priorities: Mega Pixel for bullet 1, Features for bullets 2–6. These aligned instructions remain applicable.

Rows 5–11 contain Mandatory attributes notes referring to attributes__effective_pixel, attributes__camera_resolution, attributes__resolution, attributes__video_recording, attributes__shutter_speed, and attributes__lens_type. They remain source guidance only and do not establish required/optional classifications or authorize learning from shifted technical cells.

The aligned fields through attributes__weight use the observed formats below. Every header beginning at attributes__mounting_type (raw column AA) remains an explicitly labeled semantic fallback. Do not remap, shift, or guess technical sample values from AA onward, including the battery, camera-resolution, lens, shutter, wireless, and country fields. Preserve existing configured rules and original supplied data under the application workflow.
## sku

Application pass-through: preserve the supplied SAP SKU as exact identifier text, including meaningful punctuation and leading zeroes. The aligned sample is identifier text; never copy its identifier.

## base_code

Application pass-through: preserve the supplied SAP base code as exact identifier text. Do not assume it equals the SKU merely because the aligned sample does.

## attributes__lulu_ean

Application pass-through: preserve the supplied SAP EAN as text, including leading zeroes. The aligned sample is a digit-string identifier, not a number to calculate or format scientifically.

## attributes__shipping_weight

Application pass-through: preserve the supplied SAP shipping-weight value and its established application unit. The aligned sample is a bare number and does not establish a unit or a conversion from product weight.

## name

Preserve an existing supplied name. Only when missing and generation is requested, use verified identity and specifications in the same plain-text display-name style as product_title; omit unsupported parts and empty separators.

## attributes__product_title

Write a verified plain-text title in the observed general shape `{Brand} {series} {n} MP {camera type}, {sensor descriptor}, {color}, {model}`. Include only supported useful parts; secondary details use comma-and-space separation, with the model last when supplied. The explicit row-4 note says below 75 characters: use at most 74 characters. Sample identities and specifications are never defaults.

## attributes__bullet_point_1

Explicit row-4 priority: Mega Pixel. Write one concise plain-text benefit phrase led by verified sensor resolution in the observed `{n} MP {benefit}` shape, with a space before MP. Use current supported facts; no HTML, list marker, or terminal full stop is demonstrated.

## attributes__bullet_point_2

Explicit row-4 priority: Features. The aligned sample is a concise autofocus/tracking benefit phrase. Use a distinct verified feature as plain text, without HTML, a list marker, or a terminal full stop; autofocus is not assumed for every product.

## attributes__bullet_point_3

Explicit row-4 priority: Features. The aligned sample is a video-recording benefit phrase with the resolution token shape `{n}K`. Use a verified recording feature or another distinct supported feature as plain text; do not copy the demonstrated resolution. No HTML, list marker, or terminal full stop is demonstrated.

## attributes__bullet_point_4

Explicit row-4 priority: Features. The aligned sample is a short design/portability benefit phrase. Use a distinct verified design benefit or another supported feature as plain text, without HTML, a list marker, or a terminal full stop.

## attributes__bullet_point_5

Explicit row-4 priority: Features. The aligned sample is a short connectivity/file-transfer benefit phrase. Use a verified connection capability or another distinct supported feature as plain text; do not infer wireless support from the sample. No HTML, list marker, or terminal full stop is demonstrated.

## attributes__bullet_point_6

Explicit row-4 priority: Features. The aligned sample is a short display/use benefit phrase. Use a verified display capability or another distinct supported feature as plain text; do not invent a display feature to fill the position. No HTML, list marker, or terminal full stop is demonstrated.

## attributes__product_description

Write a useful factual plain-text paragraph, following the aligned single-paragraph sample. No HTML is demonstrated, and the sample establishes no fixed word count. Describe only current supported product facts.

## attributes__keywords

Use relevant lower-case space-separated keyword tokens in the observed shape `{brand} {camera type} {resolution token} {video token}`. The aligned sample has no commas; derive tokens from current supported facts and never copy sample identities or numeric specifications.

## attributes__brand

Application pass-through: preserve the supplied SAP brand exactly. The aligned sample is a short brand name; it is never a fallback brand.

## attributes__lulu_product_type

Application pass-through: preserve the supplied SAP product type under this exact canonical key. The aligned sample is a short product-type label; do not hardcode it or introduce attributes__product_type.

## attributes__model

Use the exact verified model identifier as short text, shape `{model-code}`, preserving meaningful letters, digits, punctuation, case, and zeroes. Never copy the example model.

## attributes__color

Use the verified marketed color as concise plain text, shape `{color}`. The aligned sample is a simple color label, not an allowed-value list or default.

## attributes__no_of_pieces

Use the verified whole-number piece count as number-only text, shape `{n}`, with no unit or label. Do not assume the sample count applies to the current product.

## attributes__pack

Use the verified pack count as number-only text, shape `{n}`, matching the aligned sample. Keep pack count distinct from total piece count; neither quantity is a default.

## attributes__package_contents

Use verified included items as a plain-text comma-and-space list, shape `{item}, {item}, {item}`. The aligned sample has item names without quantity prefixes; include quantities only when supported by current source data. Do not add typical accessories without evidence.

## attributes__in_the_box

Use verified actual box contents as a plain-text comma-and-space list, shape `{item}, {item}, {item}`. The aligned sample has item names without quantity prefixes. Keep current box contents distinct from separately sold compatible accessories.

## attributes__accessories

Use concise verified included-accessory names as plain text, shape `{accessory}`. The aligned sample is a single item name rather than a quantity or a Yes/No flag; additional accessories require current source support.

## attributes__product_dimensions

Use verified product measurements in the observed shape `W{width} x D{depth} x H{height} cm`. Preserve width/depth/height order, lowercase x with surrounding spaces, and a space before cm. Convert units only from known measurements and keep package dimensions separate.

## attributes__package_dimensions

Use verified package measurements in the observed shape `W{width} x D{depth} x H{height} cm`. Preserve axis order, lowercase x with surrounding spaces, and the space before cm. Product measurements are not a substitute for package dimensions.

## attributes__weight

Use verified product weight in the observed shape `{n} kg`, with a space before kg. Keep meaningful source precision; one sample does not establish a fixed decimal count. Keep product weight separate from pass-through shipping weight.

## attributes__mounting_type

No sample format evidence: no trustworthy sample value for this header is available; row-3 cells from AA onward are misaligned or unreliable and excluded from learning. Semantic fallback only: Use verified mounting method as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__camera_resolution

No sample format evidence: no trustworthy sample value for this header is available; row-3 cells from AA onward are misaligned or unreliable and excluded from learning. Semantic fallback only: Use verified camera resolution as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__camera_features

No sample format evidence: no trustworthy sample value for this header is available; row-3 cells from AA onward are misaligned or unreliable and excluded from learning. Semantic fallback only: Use verified camera features as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__effective_pixel

No sample format evidence: no trustworthy sample value for this header is available; row-3 cells from AA onward are misaligned or unreliable and excluded from learning. Semantic fallback only: Use verified effective sensor pixel count as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__lens_type

No sample format evidence: no trustworthy sample value for this header is available; row-3 cells from AA onward are misaligned or unreliable and excluded from learning. Semantic fallback only: Use verified lens type as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__focal_length

No sample format evidence: no trustworthy sample value for this header is available; row-3 cells from AA onward are misaligned or unreliable and excluded from learning. Semantic fallback only: Use a verified lens focal length with its stated unit and equivalent/actual context.

## attributes__maximum_aperture

No sample format evidence: no trustworthy sample value for this header is available; row-3 cells from AA onward are misaligned or unreliable and excluded from learning. Semantic fallback only: Use verified maximum lens aperture as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__optical_zoom

No sample format evidence: no trustworthy sample value for this header is available; row-3 cells from AA onward are misaligned or unreliable and excluded from learning. Semantic fallback only: Use verified optical zoom factor as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__zoom

No sample format evidence: no trustworthy sample value for this header is available; row-3 cells from AA onward are misaligned or unreliable and excluded from learning. Semantic fallback only: Use verified optical/digital zoom and its stated factor; do not infer zoom from resolution.

## attributes__focus_type

No sample format evidence: no trustworthy sample value for this header is available; row-3 cells from AA onward are misaligned or unreliable and excluded from learning. Semantic fallback only: Use verified focusing method as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__iso_sensitivity

No sample format evidence: no trustworthy sample value for this header is available; row-3 cells from AA onward are misaligned or unreliable and excluded from learning. Semantic fallback only: Use verified ISO sensitivity as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__image_stabilization

No sample format evidence: no trustworthy sample value for this header is available; row-3 cells from AA onward are misaligned or unreliable and excluded from learning. Semantic fallback only: Use verified image stabilization as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__image_sensor

No sample format evidence: no trustworthy sample value for this header is available; row-3 cells from AA onward are misaligned or unreliable and excluded from learning. Semantic fallback only: Use verified image-sensor type as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__sensors

No sample format evidence: no trustworthy sample value for this header is available; row-3 cells from AA onward are misaligned or unreliable and excluded from learning. Semantic fallback only: Use verified sensor names/types as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__video_recording

No sample format evidence: no trustworthy sample value for this header is available; row-3 cells from AA onward are misaligned or unreliable and excluded from learning. Semantic fallback only: Use verified supported video-recording format/resolution as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__supported_video_formats

No sample format evidence: no trustworthy sample value for this header is available; row-3 cells from AA onward are misaligned or unreliable and excluded from learning. Semantic fallback only: Use verified supported video formats as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__frame_rate

No sample format evidence: no trustworthy sample value for this header is available; row-3 cells from AA onward are misaligned or unreliable and excluded from learning. Semantic fallback only: Use verified frame rate for each camera/view and resolution as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__resolution

No sample format evidence: no trustworthy sample value for this header is available; row-3 cells from AA onward are misaligned or unreliable and excluded from learning. Semantic fallback only: Use verified image/print/output resolution in the correct technical context as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__display_type

No sample format evidence: no trustworthy sample value for this header is available; row-3 cells from AA onward are misaligned or unreliable and excluded from learning. Semantic fallback only: Use verified display technology/type as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__display_resolution

No sample format evidence: no trustworthy sample value for this header is available; row-3 cells from AA onward are misaligned or unreliable and excluded from learning. Semantic fallback only: Use verified display pixel dimensions as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__display_feature

No sample format evidence: no trustworthy sample value for this header is available; row-3 cells from AA onward are misaligned or unreliable and excluded from learning. Semantic fallback only: Use verified display features as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__brightness

No sample format evidence: no trustworthy sample value for this header is available; row-3 cells from AA onward are misaligned or unreliable and excluded from learning. Semantic fallback only: Use verified rated brightness with its actual luminance/luminous-flux basis as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__screen_size

No sample format evidence: no trustworthy sample value for this header is available; row-3 cells from AA onward are misaligned or unreliable and excluded from learning. Semantic fallback only: Use a verified display diagonal with its actual unit; do not derive it from product dimensions.

## attributes__viewfinder_type

No sample format evidence: no trustworthy sample value for this header is available; row-3 cells from AA onward are misaligned or unreliable and excluded from learning. Semantic fallback only: Use verified viewfinder type as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__storage

No sample format evidence: no trustworthy sample value for this header is available; row-3 cells from AA onward are misaligned or unreliable and excluded from learning. Semantic fallback only: Use verified storage capacity as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__external_storage

No sample format evidence: no trustworthy sample value for this header is available; row-3 cells from AA onward are misaligned or unreliable and excluded from learning. Semantic fallback only: Use verified external-storage support/capacity as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__waterproof

No sample format evidence: no trustworthy sample value for this header is available; row-3 cells from AA onward are misaligned or unreliable and excluded from learning. Semantic fallback only: Use verified waterproofing claim as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__memory_card_type

No sample format evidence: no trustworthy sample value for this header is available; row-3 cells from AA onward are misaligned or unreliable and excluded from learning. Semantic fallback only: Use verified supported memory-card formats as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__battery_type

No sample format evidence: no trustworthy sample value for this header is available; row-3 cells from AA onward are misaligned or unreliable and excluded from learning. Semantic fallback only: Use verified battery chemistry/size/type as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__battery_capacity

No sample format evidence: no trustworthy sample value for this header is available; row-3 cells from AA onward are misaligned or unreliable and excluded from learning. Semantic fallback only: Use an explicit verified battery specification with its real unit or battery-size/count basis; neither mAh nor a count is established here.

## attributes__battery_life

No sample format evidence: no trustworthy sample value for this header is available; row-3 cells from AA onward are misaligned or unreliable and excluded from learning. Semantic fallback only: Use verified battery life under stated usage conditions as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__charging_type

No sample format evidence: no trustworthy sample value for this header is available; row-3 cells from AA onward are misaligned or unreliable and excluded from learning. Semantic fallback only: Use verified charging method/connector as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__charging_time

No sample format evidence: no trustworthy sample value for this header is available; row-3 cells from AA onward are misaligned or unreliable and excluded from learning. Semantic fallback only: Use verified charging duration as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__audio

No sample format evidence: no trustworthy sample value for this header is available; row-3 cells from AA onward are misaligned or unreliable and excluded from learning. Semantic fallback only: Use verified supported audio modes/technologies as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__mic

No sample format evidence: no trustworthy sample value for this header is available; row-3 cells from AA onward are misaligned or unreliable and excluded from learning. Semantic fallback only: Use verified microphone capability as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__wifi

No sample format evidence: no trustworthy sample value for this header is available; row-3 cells from AA onward are misaligned or unreliable and excluded from learning. Semantic fallback only: Use a verified Wi-Fi standard or capability value with its source context; do not invent a generation or absence claim.

## attributes__bluetooth

No sample format evidence: no trustworthy sample value for this header is available; row-3 cells from AA onward are misaligned or unreliable and excluded from learning. Semantic fallback only: Report a verified version/standard when stated, or a supported capability value under the existing workflow; no version or boolean format is learned.

## attributes__connectivity

No sample format evidence: no trustworthy sample value for this header is available; row-3 cells from AA onward are misaligned or unreliable and excluded from learning. Semantic fallback only: Use verified connection methods as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__processor

No sample format evidence: no trustworthy sample value for this header is available; row-3 cells from AA onward are misaligned or unreliable and excluded from learning. Semantic fallback only: Use verified processor designation as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__version

No sample format evidence: no trustworthy sample value for this header is available; row-3 cells from AA onward are misaligned or unreliable and excluded from learning. Semantic fallback only: Use verified product/system version designation as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__shutter_speed

No sample format evidence: no trustworthy sample value for this header is available; row-3 cells from AA onward are misaligned or unreliable and excluded from learning. Semantic fallback only: Use verified shutter-speed range as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__field_of_view

No sample format evidence: no trustworthy sample value for this header is available; row-3 cells from AA onward are misaligned or unreliable and excluded from learning. Semantic fallback only: Use verified field of view as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__functions

No sample format evidence: no trustworthy sample value for this header is available; row-3 cells from AA onward are misaligned or unreliable and excluded from learning. Semantic fallback only: Use verified supported functions as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__features

No sample format evidence: no trustworthy sample value for this header is available; row-3 cells from AA onward are misaligned or unreliable and excluded from learning. Semantic fallback only: Use verified product features as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__other_information

No sample format evidence: no trustworthy sample value for this header is available; row-3 cells from AA onward are misaligned or unreliable and excluded from learning. Semantic fallback only: Use verified additional relevant product information as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__note

No sample format evidence: no trustworthy sample value for this header is available; row-3 cells from AA onward are misaligned or unreliable and excluded from learning. Semantic fallback only: Use verified product-specific caveats as concise plain text; preserve its source representation because no template-specific style is established.

## attributes__country_of_origin

No sample format evidence: no trustworthy sample value for this header is available; row-3 cells from AA onward are misaligned or unreliable and excluded from learning. Semantic fallback only: Use verified manufacturing country name as concise plain text; preserve its source representation because no template-specific style is established.
