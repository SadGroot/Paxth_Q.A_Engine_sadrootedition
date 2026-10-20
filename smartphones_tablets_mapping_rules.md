# Elec-M&W-Smartphones & Tablets — Mapping Rules

Your sample uses `attributes__product_type`. **New Catalog exports in this app require `attributes__lulu_product_type`.** Keep the original header when reviewing an existing upload; use the current header when configuring new Catalog output.

Apply these rules to smartphones and tablets. Validate the exact sellable variant, including model suffix, RAM, storage, colour, connectivity and regional configuration. Examples demonstrate formatting only; they never establish product facts.

## Evidence and processing rules

- SAP is the primary factual authority. Supplied product-page evidence may fill gaps only when it identifies the same product and variant.
- If SAP and webpage evidence disagree, retain SAP as the working authority, record the conflict and flag affected fields. Never combine specifications from different variants.
- Uploaded titles, bullets, keywords and specifications are values to review. Their repetition does not verify a claim.
- Never infer specifications from a model name, price, photograph, another capacity variant or general product knowledge.
- **QA:** review every original field and provide evidence-supported replacement values.
- **Catalog:** preserve every supplied nonempty value. Fill only empty editable cells; report incorrect supplied values without overwriting them.
- Catalog pass-through fields remain unchanged, including blanks: `sku`, `base_code`, `attributes__lulu_ean`, `attributes__shipping_weight`, `attributes__brand`, `attributes__lulu_product_type`.
- Treat the row containing “General”, “Display”, “OS & Processor”, “Memory & Storage Features” and similar labels as worksheet grouping information. These labels are not product values.
- Whitespace-only cells are empty. Never insert `N/A`, `Unknown`, `0`, `No` or `Not Supported` to conceal missing evidence.
- A field marked **required** must be flagged when missing. Other fields are conditional: populate when evidence supports them; accept an optional blank when no source supplies its value.
- Accept equivalent units and wording during QA. Apply the preferred formats below to generated content and suggested corrections; avoid reporting harmless presentation differences.

## Identifiers and physical attributes

| Field | Mapping and validation |
|---|---|
| `sku` | **Required.** Exact internal SKU from the input record. Preserve leading zeroes. Do not derive it from EAN or model. |
| `base_code` | **Required.** Exact supplied base/group identifier. Do not assume it must equal `sku`; flag differences only against authoritative grouping evidence. |
| `attributes__lulu_ean` | **Required.** Preserve as text. Validate the applicable barcode length, digits and check digit. Match the exact variant when evidence supplies its barcode. A valid checksum alone does not prove product identity. Never manufacture a replacement by changing the check digit. |
| `attributes__shipping_weight` | Packed/shipping weight, distinct from device weight. Preserve supplied values. Require an explicit unit or a documented import-unit convention; never assume `3000` means grams. Never calculate this from net weight plus guessed packaging. |
| `attributes__brand` | **Required.** Verified manufacturer brand with official spelling. Seller, distributor and chipset manufacturer are not the device brand. |
| `attributes__product_type` / `attributes__lulu_product_type` | **Required.** Use the applicable header. Classify as `Smartphone` or `Tablet` using evidence. “General”, “Display” and chipset names are invalid product types. Do not classify a tablet as a smartphone merely because it supports cellular connectivity. |
| `attributes__model` | **Required.** Exact manufacturer model/MPN, including regional and configuration suffixes. Keep the retail series name separate where possible. Never shorten a verified full model code. |
| `attributes__model_year` | Four-digit year for the exact model’s release or manufacturer-designated model year. Not the current year, upload year or an inferred year from its name. |
| `attributes__color` | **Required for variant identification.** Exact official colour. Preserve named finishes such as “Titanium Silver Blue”; do not reduce them to a generic colour or infer material from the colour name. |
| `attributes__weight` | Net device weight with unit, preferably `g`. Preserve qualifiers such as “approximately” and differences between Wi-Fi and cellular variants. Exclude packaging and accessories. |
| `attributes__product_dimensions` | Label axes and units, preferably `H × W × D mm`. Reorder only when the source identifies the axes. For foldables, label folded and unfolded dimensions separately. Do not confuse device and package dimensions. |
| `attributes__material` | Verified construction material, identifying the component where relevant: frame, rear panel or display cover. A titanium-coloured finish does not establish titanium construction. |
| `attributes__ip_rating` | Exact published IP rating and relevant limitations. Do not upgrade splash resistance to waterproofing. Dust, water and drop-resistance claims require their own evidence. |
| `attributes__in_the_box` | Exact regional retail-pack contents. Distinguish included items from compatible or separately sold accessories. Never assume an adapter, case, screen protector, stylus or keyboard is included. |
| `attributes__country_of_origin` | Verified manufacturing origin for the supplied item. Do not substitute brand headquarters, seller location or intended sales region. |

## Customer-facing content

Generate customer-facing content from verified facts. Identity must agree across every title, bullet, description, keyword and specification.

| Field | Mapping and validation |
|---|---|
| `name` | **Required.** Preferred structure: `[Brand] [Series/Model] [Connectivity] [Smartphone/Tablet], [RAM] RAM, [Internal Storage] Storage, [Colour], [Full MPN]`. Include only verified components. A tablet’s verified screen size may be included. |
| `attributes__product_title` | **Required.** Follow the same naming structure and identify the same exact variant as `name`. Wording may differ; model, RAM, storage, colour and connectivity must agree. |
| `attributes__keywords` | Comma-separated, relevant search phrases built from the verified brand, series, model, product type, connectivity and capacity. Remove case-insensitive duplicates, unrelated models and repeated spelling variants that add no search meaning. No competitor names or unsupported features. |
| `attributes__bullet_point_1` | Display: verified screen size and display technology; resolution or refresh rate where useful. |
| `attributes__bullet_point_2` | Performance: exact chipset and a restrained explanation of its use. Avoid unsupported speed comparisons or benchmark claims. |
| `attributes__bullet_point_3` | Cameras: distinguish rear and front systems. If camera evidence is unavailable, use another verified distinguishing feature and explain the omission in QA. |
| `attributes__bullet_point_4` | Battery and charging: verified capacity and supported charging capability. Do not turn capacity into an invented runtime claim. |
| `attributes__bullet_point_5` | Connectivity: exact cellular/Wi-Fi capability, SIM arrangement or another verified connection feature. Never apply a 5G claim to a Wi-Fi-only tablet. |
| `attributes__bullet_point_6` | RAM/storage or a distinct verified productivity feature. Separate physical RAM from virtual expansion and included accessories from optional ones. |
| `attributes__product_description` | **Required.** Concise, coherent prose covering identity and supported display, performance, memory, camera, connectivity and battery facts. Include relevant regional or accessory limitations. Do not merely concatenate bullets. |

Use all six bullet slots when six distinct supported points are available. Otherwise leave unsupported slots empty and report incomplete content; never invent benefits to fill the template.

For generated content:

- Prefer concrete specifications over “top-tier”, “unmatched”, “blazing-fast”, “all-day” or similar unsubstantiated claims.
- Each bullet should communicate one main feature clearly.
- Preserve the field’s intended language. Correct grammar without changing technical meaning.
- Exclude prices, stock status, seller promotions, unrelated products and unsupported warranty claims.
- A full title correction must be the complete replacement title, preserving every verified identifying component.

## Display, platform and memory

| Field | Mapping and validation |
|---|---|
| `attributes__screen_size` | **Required.** Display diagonal in inches, not body length. For foldables, identify main and cover displays separately. Preserve meaningful measurement qualifiers. |
| `attributes__display_type` | **Required.** Exact panel technology and manufacturer branding where verified. Distinguish OLED/AMOLED/LCD, adaptive-refresh technology and foldable construction rather than treating them as interchangeable terms. |
| `attributes__display_resolution` | **Required.** Native pixel dimensions, preferably `[width] × [height] pixels`. Preserve verified orientation. Do not substitute camera megapixels, video resolution or an inferred marketing class. |
| `attributes__brightness` | State value, unit and mode: typical, HBM or peak. Different modes may have different valid values. Do not automatically treat typical and peak brightness as contradictory. |
| `attributes__refresh_rate` | Display refresh rate in `Hz`; preserve adaptive ranges where supplied. Touch-sampling rate, game touch response and video frame rate do not belong here. |
| `attributes__os` | **Required.** Operating-system family, such as Android, iOS or iPadOS. A manufacturer interface alone does not establish the underlying OS. |
| `attributes__os_version` | Verified OS release; append the manufacturer interface/version when supported. An interface name alone is incomplete when the source supplies the OS release. Distinguish launch software from a later update; never assume an update is installed. |
| `attributes__processor` | **Required.** Chipset manufacturer/family or complete official chipset designation, following the source. Keep it consistent with `attributes__version`. |
| `attributes__version` | In this template, the chipset model/version. Not the OS release, Bluetooth version or cellular generation. If `processor` already contains the full chipset name, accept consistent repetition. |
| `attributes__gpu` | Exact verified GPU designation. Do not substitute the CPU name or repair a suspicious GPU name from memory. |
| `attributes__ram` | **Required.** Installed physical RAM with unit. State virtual/extended RAM separately and never add it to physical RAM. |
| `attributes__storage_type` | Verified storage technology and version, such as UFS or eMMC. Do not place storage capacity here or infer the technology from the device’s price or generation. |
| `attributes__internal_storage` | **Required.** Exact advertised capacity for the sellable variant. Distinguish advertised capacity from usable free space. Do not list every capacity in the model family. |
| `attributes__external_storage` | Verified expansion method and maximum supported capacity. State whether a card is included only when confirmed. Use “Not supported” only when explicitly established; internal storage does not prove external-storage support. |

## Cameras

Validate cameras by their physical role. **For this mapping, primary means rear/main camera; secondary means front/selfie camera.** Translate source terminology by role rather than copying its column order.

| Field | Mapping and validation |
|---|---|
| `attributes__camera_features` | Verified functions such as autofocus, OIS, EIS, optical zoom, night mode or portrait mode. Attribute features to the correct camera and preserve recording-mode restrictions. |
| `attributes__camera_resolution` | Clearly labelled resolution summary, such as `Rear: …; Front: …`. Prefer the main sensor and relevant system details; never add megapixels across sensors into an invented total. |
| `attributes__primary_camera` | Rear camera system. List sensor resolutions and roles when known: main, ultrawide, telephoto, etc. Preserve the correct sensor-to-feature pairing. |
| `attributes__secondary_camera` | Front/selfie camera specifications. Do not decide which camera is front or rear solely from its megapixel count. |
| `attributes__video_recording` | Label front/rear camera, resolution and frame rate. Pair each resolution with its supported rate. Do not imply every mode works on every camera, zoom setting or stabilisation mode. |
| `attributes__flash` | Verified flash type and location where relevant. Distinguish a physical LED flash from screen illumination. Do not assume both front and rear flash. |

## Connectivity

Validate connectivity against the exact regional variant.

| Field | Mapping and validation |
|---|---|
| `attributes__network` | Supported cellular generations and relevant verified bands. Distinguish cellular capability from Wi-Fi. Record “Wi-Fi only” only when established; lack of cellular evidence is not proof of its absence. |
| `attributes__sim` | Physical SIM size/count and eSIM capability. Distinguish supported configurations from simultaneously active lines. A memory-card slot is not an additional SIM slot. |
| `attributes__bluetooth` | Verified Bluetooth version and supported qualifiers. Never infer codecs or profiles from the version alone. |
| `attributes__wifi` | Verified Wi-Fi generation/standard and bands. Do not infer 6 GHz support from Wi-Fi 6 or assume regional availability of every supported band. |
| `attributes__nfc` | Verified NFC support or explicit absence. NFC does not itself establish payment-service availability, transit compatibility or regional activation. |
| `attributes__usb` | Connector and data standard where known. Separate USB Type-C connector shape from USB transfer protocol. Do not infer speed from Type-C or Thunderbolt from appearance. |
| `attributes__ports` | Physical connectors only: USB, headphone jack and other verified ports. Avoid treating Bluetooth/NFC as ports. Keep USB details consistent with `attributes__usb`. |
| `attributes__sensors` | Verified sensors, using clear names and removing genuine duplicates. Do not merge distinct proximity and ambient-light functions or invent a fingerprint reader from the product family. |

## Battery, charging, audio and remaining claims

| Field | Mapping and validation |
|---|---|
| `attributes__charging_speed` | Supported charging power in `W`, labelled wired, wireless or reverse where applicable. Distinguish device maximum, included adapter rating and charging-time claims. Preserve protocol/accessory conditions. |
| `attributes__battery_capacity` | **Required.** Capacity in `mAh`, with typical/rated designation where supplied. Different typical and rated values can both be valid. Do not sum multiple battery cells unless the source explicitly states the combined device capacity. |
| `attributes__battery_type` | Verified chemistry, such as lithium-ion or lithium-polymer. Record removability separately when useful; “non-removable” is not a chemistry. |
| `attributes__battery_life` | Runtime plus test activity and relevant conditions: playback, browsing, calls or standby. An unexplained `7h 31min` is incomplete. Never calculate runtime from capacity alone. |
| `attributes__charging_type` | Verified wired, wireless and reverse-charging capabilities. Distinguish capability from included charging equipment. Do not infer wireless charging from USB Type-C. |
| `attributes__audio` | Verified speaker arrangement, audio processing and supported formats. Distinguish built-in speakers from headphone playback and accessory-dependent features. A named audio format does not prove a particular speaker count. |
| `attributes__special_features` | Distinct supported features not adequately captured elsewhere. Label display, gaming, stylus, biometric and productivity features precisely. Preserve feature conditions; exclude unrelated-model specifications and repeated marketing text. |
| `attributes__other_information` | Relevant supported qualifications, regional restrictions, accessory exclusions or compatibility notes. Do not use this field to hide contradictions or add generic filler. An evidence-free blank is acceptable. |

## Cross-field validation

Check the entire row for consistency before assigning a result.

1. **Identity:** brand, retail model, full MPN, colour, RAM, storage and connectivity must describe one variant throughout.
2. **Display:** title, bullets, screen size, technology, resolution and special features must agree. Keep refresh rate separate from touch sampling and brightness modes separate from each other.
3. **Platform:** chipset, chipset version, GPU, OS and software version must be compatible according to supplied evidence. A familiar product name is not sufficient proof.
4. **Memory:** physical RAM, virtual RAM, internal storage and expansion capacity must remain distinct.
5. **Cameras:** rear/front roles, sensor resolutions, stabilisation and recording modes must agree across all camera fields and marketing content.
6. **Battery:** compare like-for-like capacity designations. Distinguish capacity, runtime, supported charging power and adapter output.
7. **Connectivity:** network, SIM, eSIM, Wi-Fi, Bluetooth, NFC, USB and ports must reflect the same regional configuration.
8. **Physical data:** distinguish net/packed weight and device/package dimensions. Flag implausible measurements for review without inventing replacements.
9. **Included items:** an accessory mentioned in a description, bullet or special feature must not be presented as included unless pack evidence confirms it.
10. **Internal conflicts:** if two uploaded fields disagree and evidence cannot select the correct value, report unresolved verification. Never choose whichever value appears more often.

## Severity and status

| Severity | Apply to |
|---|---|
| `critical` / `red` | Wrong or unresolved product identity; invalid or contradictory barcode; mixed models/variants; material errors in chipset, physical RAM, storage, display, camera, cellular capability, battery or compatibility. Unsupported major specifications also qualify. |
| `moderate` / `orange` | Missing required content/specifications; incomplete verification without a critical identity problem; secondary inaccuracies; unlabeled measurements; incorrectly placed information; source conflicts requiring review. |
| `minor` / `yellow` | Grammar, spelling, spacing, punctuation, harmless duplication and keyword presentation that do not alter product meaning. |

- `fail`: at least one critical finding.
- `warning`: findings or incomplete checks remain, with no critical finding.
- `pass`: every applicable check is complete, with no findings or unresolved source conflicts.
- Confidence describes the strength of the evidence and conclusions. A clearly proven failure may have `high` confidence.

## Application output contract

Follow the active application output contract.

- **QA:** return only the structured object containing `qa_status`, `confidence`, `summary`, `issue_count`, `issues` and `source_notes`.
- Every issue must contain `field`, `issue_type`, `severity`, `uploaded_value`, `source_truth`, `explanation`, `suggested_fix` and `cell_color`. Use exact original headers and string values for issue text.
- Use `data_mismatch` only for a verified contradiction, with nonempty `source_truth` and a complete replacement in `suggested_fix`.
- Use `unsupported_claim` for an unverified populated claim; `missing_data` for missing required/source-supported information; `formatting` for structural or format defects; and `spelling_grammar` for language defects.
- A failed barcode checksum is a `formatting` issue with `critical` severity. Leave its replacement empty until an authoritative barcode is supplied.
- If no verified replacement exists, set `suggested_fix` to `""` and explain what evidence is needed. Never put editing instructions or a guessed specification in that field.
- Record SAP/web conflicts in `source_notes.source_conflicts`. Set evidence-use flags only for sources actually used.
- **Catalog:** return the application’s `row`, `warnings` and `cellWarnings` structure. Preserve supplied values and report affected cells by exact header.
- Do not duplicate the same finding on the same cell. Report each affected cell when a conflict spans multiple fields.

## Supplied sample: expected findings

These findings refer only to the supplied example. They are not verified specifications or defaults for other products.

| Sample evidence | Required finding |
|---|---|
| `name` identifies **Galaxy S25 Ultra / SM-S938BZBIMEA**, while `attributes__product_title` identifies **Galaxy S23 Ultra / SM-S918BZGCMEA**. | **Critical identity conflict.** Evidence must establish the intended SKU before correcting either title or related specifications. |
| Keywords identify S23 Ultra while other fields identify S25 Ultra. | Flag model contamination. Rebuild keywords only after identity is verified. |
| EAN `2457588765343`. | **Invalid EAN-13 checksum:** the first twelve digits require check digit **6**, while the supplied digit is **3**. Do not “repair” the barcode without product evidence. |
| Bullet 1 says **6.9 inches**; `attributes__screen_size` says **5.8 inches**. | Material internal display conflict. Neither value is verified merely by appearing in the upload. |
| Bullet 2 says **Snapdragon 8 Elite**; chipset version says **888s**. | Resolve the chipset identity before accepting the processor, version, GPU or performance claims. |
| Primary camera says **32 MP**; secondary camera contains the multi-camera array used in the camera bullet. | Verify rear/front roles. The values may be misplaced; megapixel counts alone do not establish the correction. |
| Bullet 4 says **5000 mAh**; battery field says **4900 mAh**. | Check whether these are typical and rated capacities before declaring a factual contradiction. Label both if verified. |
| Display says **500 nits**; special features list **HBM 2000 nits** and **peak 3000 nits**. | Different brightness modes can coexist. Verify the values and label the 500-nit mode. |
| Refresh rate is **144 Hz**; special features mention **220/300 Hz touch rate**. | These measure different things. Verify each separately; do not report a contradiction solely because the numbers differ. |
| Shipping weight is `3000`; runtime is `7h 31min`. | Shipping weight needs an established unit convention; runtime needs its test activity/conditions. Preserve supplied values in Catalog and flag them. |
| Box contents include adapter, case and screen protector; ports include a headphone jack; features include foldable AMOLED. | Require exact-model, regional-pack evidence for every claim. Do not assume inclusion or compatibility. |

Under these rules, the sample **fails** because of its conflicting product identities and invalid barcode checksum. Live manufacturer specifications were not verified; a corrected product row still requires authoritative evidence for the intended variant.
