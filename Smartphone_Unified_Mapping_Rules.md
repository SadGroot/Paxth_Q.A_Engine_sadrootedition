# Smartphone — Unified Data-Driven Mapping Rules
**Purpose:** Generate an Omnitron-compatible smartphone upload Excel from **SAP + exact-SKU scraped PDP + official specification data**, while validating the result. This specification replaces the separate QA instructions and sample-template interpretation.
**Schema:** Exactly **61 columns**, in the order supplied. The uploaded sample data row is a negative QC example, **not** a verified source of hardware facts.

## 1. Non-negotiable operating contract
1. **One SKU = one exact regional variant.** Match brand, manufacturer part number, marketing model, RAM, internal storage, color, network and regional SIM configuration before mapping. Do not combine sources from other variants or models.
2. **SAP is authoritative for dedicated identifiers** (`sku`, approved `base_code`, and especially `attributes__lulu_ean`). Manufacturer/regional documentation is strongest for technical specifications; use only scraped page facts that unambiguously belong to the same variant. Flag material conflicts instead of silently preferring a source.
3. **Source-supported values only.** A scraped data gap is not permission to insert a likely value. Leave unsupported optional fields genuinely empty; if a field is mandatory or identity is uncertain, HOLD the row.
4. **No web-page contamination.** Ignore recommendations, sibling-variant selectors not tied to the selected SKU, reviews, banners, page navigation, footer, ads, cross-sell product cards and generic category text.
5. **No assumptions.** Do not infer eSIM, card slot, storage type, charger in box, country of origin, device dimensions, GPU, battery life, Bluetooth, NFC, IP rating or physical ports from model family, appearance or general market knowledge.
6. **Keep metadata outside the upload.** Source URL, raw evidence, extraction confidence, HOLD reasons, contradictions and suggested fixes go into a separate QA report; do not create extra upload columns.
7. **Exact Excel header contract.** Use the existing `attributes__product_type` header. `attributes__lulu_product_type` is not in the user-provided schema.

## 2. End-to-end data flow
```text
SAP identity + SKU/EAN  ───┐
                          ├─> identity match ─> extract matching product facts ─> normalize ─> generate retail text ─> validate ─> Upload.xlsx
Cleaned exact-PDP scrape ─┤                                                │
Official regional specs ──┘                                                └─> separate Evidence + QA report / HOLD queue
```
**Execution order:** 1. Load SAP identities and the 61-column upload schema. → 2. Parse scraped PDP title, specifications, description and structured markup; discard unrelated site content. → 3. Match brand + exact manufacturer part/model + EAN (when available) + RAM + storage + color + regional SIM/network configuration. → 4. HOLD the SKU on unresolved identity conflicts; do not merge S23 with S25 or storage/color/regional variants. → 5. Extract each specification with evidence using source aliases and field-specific source priority. → 6. Normalize units, canonical names and display text; never change an underlying measurement. → 7. Generate name, product_title, keywords, bullet points and 180–200-word description from confirmed facts only. → 8. Validate field formats, cross-field consistency and source contradictions. → 9. Produce Upload XLSX only for READY rows; create separate QA report for REVIEW/HOLD rows.

## 3. Evidence and source precedence
| Data class | Primary authority | Secondary evidence | Conflict handling |
|---|---|---|---|
| SKU / base code / main EAN | Dedicated SAP columns | Approved internal mapping | Mismatch or bad EAN: **HOLD**; never overwrite with a scraped barcode |
| Brand / manufacturer part number / variant | SAP plus manufacturer regional data | Exact-variant PDP | Different generations, model suffixes, RAM, storage, color: **HOLD_IDENTITY** |
| Display / camera / chipset / battery / hardware | Exact model/region manufacturer specifications | Verified exact-variant PDP | Contradictions: **HOLD_SOURCE_CONFLICT** until reconciled |
| SIM / bands / network / included accessories | Regional manufacturer product/box data | Regional SAP/PDP evidence | No cross-region copying |
| Marketing fields | Generated only from approved normalized attributes | None | Any unsupported claim: rewrite or HOLD |
Every non-empty value should have field-level traceability in the **separate evidence log**: `sku`, `column`, `raw_value`, `normalized_value`, `source_type`, `source_reference`, `evidence_excerpt`, `validation_status`. This is a recommended log schema, **not upload fields**.

## 4. All 61 upload fields: source-to-field mapping
The mapping table below lists every output field in its **exact uploaded order**. `Critical` indicates a blocking conflict; lack of optional information is normally a REVIEW or blank value, not an invitation to guess.

| # | Exact upload column | Source data / aliases | Mapping and validation | Output format | Severity |
|---:|---|---|---|---|---|
| 1 | `sku` | SAP.sku; SAP.item_code; approved SKU input | Use the source SAP SKU for this listing; never infer from EAN or website URL. | Text, exact digits/characters | CRITICAL |
| 2 | `base_code` | SAP.base_code; approved base_code mapping | Copy the approved base code; do not assume it equals sku because the example happens to match. | Text, exact | CRITICAL if required by import |
| 3 | `attributes__lulu_ean` | SAP.ean; SAP.gtin; SAP.barcode | Copy dedicated SAP EAN. Preserve leading zeroes; validate GTIN-8/12/13/14 check digit. Never substitute scraped barcode without explicit approval. | Text; 8, 12, 13 or 14 digits | CRITICAL |
| 4 | `attributes__shipping_weight` | SAP.shipping_weight; approved logistics gross weight | Use confirmed shipping/logistics weight only. Convert to required import unit only if known; no category default. | As configured by upload contract; clarify unit | MODERATE |
| 5 | `attributes__keywords` | Verified brand; product family; marketing model; network; relevant capabilities | Generate deduplicated realistic customer searches; include brand/model and category phrases where relevant, exclude conflicting models, unrelated phrases, and keyword stuffing. | Comma-separated phrases | MODERATE |
| 6 | `attributes__brand` | SAP.brand; manufacturer brand; source product identity | Use official canonical brand capitalization. Brand must agree across sources. | Brand text | CRITICAL |
| 7 | `name` | Verified brand + marketing model + network + product type + RAM + storage + color + optional part code | Generate full customer-facing product name; must describe same exact variant as model/title. Omit only unavailable optional elements. | Readable text; commas between attribute groups | CRITICAL if wrong identity; MODERATE if format |
| 8 | `attributes__product_title` | Verified brand + marketing model + network + product type + RAM + storage + color + optional part code | Generate concise retail title from same identity as name. Format: Brand Model [Network] Smartphone, [RAM] RAM, [Storage] Storage, [Color][, Part Number when required]. | Readable title; no unsupported specs | CRITICAL if wrong identity; MODERATE if format |
| 9 | `attributes__bullet_point_1` | screen_size; display_type; display_resolution; refresh_rate | Display topic: one concise, factual, customer-facing benefit grounded in confirmed screen specs. If unsupported choose next confirmed selling feature. | One short line, no terminal period | MODERATE; CRITICAL if contradictory |
| 10 | `attributes__bullet_point_2` | processor; version; gpu; ram | Performance topic: confirmed chipset/model and relevant measurable specification, not claims such as latest/fastest without proof. | One short line, no terminal period | MODERATE; CRITICAL if contradictory |
| 11 | `attributes__bullet_point_3` | primary_camera; secondary_camera; camera_features | Photography topic: use rear camera details first, optionally confirmed front camera or features. | One short line, no terminal period | MODERATE; CRITICAL if contradictory |
| 12 | `attributes__bullet_point_4` | battery_capacity; charging_speed; charging_type | Battery/charging topic: state verified capacity and charging features only. Do not infer endurance. | One short line, no terminal period | MODERATE; CRITICAL if contradictory |
| 13 | `attributes__bullet_point_5` | network; wifi; bluetooth; sim | Connectivity topic: say 5G only if explicitly verified for this regional variant. Otherwise use another confirmed capability. | One short line, no terminal period | MODERATE; CRITICAL if contradictory |
| 14 | `attributes__bullet_point_6` | internal_storage; ram; storage_type | Memory/storage topic: factual RAM and storage; do not imply external storage unless explicitly supported. | One short line, no terminal period | MODERATE; CRITICAL if contradictory |
| 15 | `attributes__product_description` | Verified identity + display + performance + cameras + battery + network + experience | Create original 180–200-word neutral retail description. Begin with product name/family, but do not include SKU or manufacturer part numbers. Do not invent capabilities. If facts are too sparse, leave blank and flag REVIEW. | 180–200 words; paragraph(s) | MODERATE; CRITICAL if contradictory |
| 16 | `attributes__product_type` | Confirmed product category; SAP classification | Use the exact upload field; normalize only to Smartphone or Mobile Phone (according to target import taxonomy). Never use attributes__lulu_product_type. | Smartphone / Mobile Phone | CRITICAL |
| 17 | `attributes__model` | SAP.manufacturer_part_number; official regional model_code; source SKU variant model | Capture exact regional manufacturer part/SKU model, including suffix. Do not substitute marketing family name or similar region code. | Exact manufacturer part number | CRITICAL |
| 18 | `attributes__model_year` | manufacturer launch year for exact model; verified product release_year | Fill only when documented for exact product; do not calculate from marketing name. | YYYY | MODERATE |
| 19 | `attributes__color` | SAP.variant_color; verified source.color; official regional color | Use the retail color name for matched variant; resolve marketing synonyms only if manufacturer confirms equivalence. | Standardized canonical color name | CRITICAL if identity mismatch |
| 20 | `attributes__weight` | official product weight; technical specification weight | Physical handset weight, not shipping weight. Preserve exact verified value in grams. | e.g. 218 g | MODERATE |
| 21 | `attributes__product_dimensions` | official width; height; depth; dimensions | Normalize only with known axis labels; output W<width> x H<height> x D<depth> mm. Never permute unlabeled source dimensions. | Wxx x Hxx x Dxx mm | MODERATE |
| 22 | `attributes__material` | official body/frame/back material; material specification | Use expressly stated handset material(s); do not infer from appearance. | Material text | MODERATE |
| 23 | `attributes__ip_rating` | official ingress_protection; ip_rating | Only confirmed IP rating (and conditions if useful). Do not infer from water resistant marketing copy. | IP67 / IP68 / ... | MODERATE |
| 24 | `attributes__in_the_box` | exact regional box contents; SAP box_contents | List only included accessories for the matched regional pack; do not assume charger/case/protector. | Comma-separated verified contents | MODERATE |
| 25 | `attributes__country_of_origin` | SAP.country_of_origin; packaging; verified country_of_origin | Country of manufacture explicitly stated for this unit; do not infer from brand headquarters. | Country name | MODERATE |
| 26 | `attributes__screen_size` | display.size; screen_size; screen diagonal inches | Normalize verified physical diagonal in inches; do not convert resolution into screen size. | e.g. 6.9 Inch | MODERATE |
| 27 | `attributes__display_type` | display.technology; display_type; panel type | Preserve specific technology (Dynamic AMOLED 2X, LTPO OLED, IPS LCD, etc.) when provided. | Display technology text | MODERATE |
| 28 | `attributes__display_resolution` | display.resolution; pixels_horizontal; pixels_vertical | Normalize confirmed resolution as width x height pixels; preserve correct orientation if source explicitly identifies. | e.g. 1440 x 3120 pixels | MODERATE |
| 29 | `attributes__brightness` | display.typical_brightness; hbm_brightness; peak_brightness | Keep brightness mode labels (typical, HBM, peak) to avoid misrepresenting a peak value as typical. | e.g. Peak: 2600 nits | MODERATE |
| 30 | `attributes__refresh_rate` | display.refresh_rate_hz; refresh_rate | Confirmed max/adaptive range, preserving range if source gives 1–120 Hz. | e.g. 120 Hz or 1–120 Hz | MODERATE |
| 31 | `attributes__os` | operating_system; OS family and version | Use verified operating system (e.g. Android 15, iOS 18); avoid changing a source version to an assumed upgrade. | Android 15 / iOS 18 | CRITICAL if conflicting |
| 32 | `attributes__os_version` | os_version; ui_version; skin; One UI/HyperOS/EMUI | Use verified vendor UI/OS edition/version when distinctly provided. Do not duplicate or invent version; if only Android version exists, allow blank. | e.g. One UI 7 / HyperOS 2 | CRITICAL if conflicting |
| 33 | `attributes__processor` | chipset vendor and family; processor; soc | Map processor maker/family, e.g. Qualcomm Snapdragon, MediaTek Dimensity, Apple A-series. | Processor family text | MODERATE |
| 34 | `attributes__version` | chipset full model; processor model; cpu model | Processor model/version only (e.g. 8 Elite, 8 Gen 3, Helio G88); not phone version, Android version, or arbitrary numeric token. | Chipset model text | CRITICAL if conflicting |
| 35 | `attributes__gpu` | graphics_processing_unit; gpu | Copy verified chipset GPU product name; do not generate GPU from SoC knowledge unless accepted official source explicitly supports. | GPU text | MODERATE |
| 36 | `attributes__ram` | variant.ram; memory.ram; RAM capacity | Exact RAM for specific variant. Normalize GB (e.g. 12GB). Never merge marketing virtual RAM with physical RAM. | e.g. 12GB | CRITICAL |
| 37 | `attributes__storage_type` | storage.technology; UFS version; NVMe | Confirmed built-in storage technology, not capacity. | e.g. UFS 4.0 | MODERATE |
| 38 | `attributes__internal_storage` | variant.internal_storage; capacity; ROM | Exact built-in storage capacity for matched variant; normalize GB/TB, not external capacity. | e.g. 256GB | CRITICAL |
| 39 | `attributes__external_storage` | memory card support; microSD slot; expandable storage | Specify only directly verified card support/capacity; absence is not proof of non-support. | e.g. microSDXC up to 1TB | MODERATE |
| 40 | `attributes__camera_features` | camera.features; rear_camera_features; front_camera_features | Summarize directly stated camera capabilities such as OIS, HDR and zoom; distinguish rear/front as needed. | Comma-separated verified features | MODERATE |
| 41 | `attributes__camera_resolution` | rear camera module MP list; front camera module MP list | Derive deterministic summary from verified rear and front modules, labeled Rear and Front; avoid redundancy if source ambiguous. | e.g. Rear: 50 MP + 12 MP; Front: 12 MP | MODERATE |
| 42 | `attributes__primary_camera` | rear camera; main/rear cameras; rear-camera modules | REAR cameras only. Keep sensor order and module megapixels as specified. Do not put front selfie specs here. | e.g. 200 MP + 50 MP + 12 MP | CRITICAL if swapped/conflicting |
| 43 | `attributes__secondary_camera` | front camera; selfie camera; front-camera modules | FRONT/selfie cameras only. Do not put multi-module rear array here. | e.g. 12 MP | CRITICAL if swapped/conflicting |
| 44 | `attributes__video_recording` | rear_video; front_video; recording_modes; video | State verified max modes with fps and rear/front labels where applicable. | e.g. Rear: 8K at 30fps; Front: 4K at 60fps | MODERATE |
| 45 | `attributes__flash` | rear_flash; camera_flash | Only verified built-in flash type and placement; no default LED. | e.g. LED Flash | MODERATE |
| 46 | `attributes__network` | network technology; radio bands; connectivity generation | Use verified 4G LTE / 5G data for exact region; do not infer by marketing model alone. | 5G / 4G LTE | CRITICAL if conflicting |
| 47 | `attributes__sim` | sim configuration; physical sim; esim; regional sim slots | Preserve exact region SIM configuration; do not infer eSIM availability across regions. | e.g. Dual Nano-SIM + eSIM | CRITICAL if conflicting |
| 48 | `attributes__bluetooth` | bluetooth.version; Bluetooth support | Normalize version only if confirmed; use v5.3 as given convention. | e.g. v5.3 | MODERATE |
| 49 | `attributes__wifi` | wifi.standard; WLAN; Wi-Fi standard | Use stated version/standard and avoid inferred Wi-Fi 7. | e.g. Wi-Fi 6E | MODERATE |
| 50 | `attributes__nfc` | nfc; near_field_communication | Yes/Supported only on explicit positive source evidence, No only on explicit negative source evidence. | Supported / Not Supported | MODERATE |
| 51 | `attributes__usb` | usb connector type; usb.version; USB-C | Capture confirmed physical USB interface and supported generation (type vs data protocol). | e.g. USB Type-C 3.2 | MODERATE |
| 52 | `attributes__ports` | ports; audio jack; physical connectors | List confirmed external ports only. Do not include accessories or assume headphone jack. | Comma-separated ports | MODERATE |
| 53 | `attributes__sensors` | sensors list; biometric sensor; accelerometer; gyro | Preserve only confirmed sensors, without duplicate synonyms. | Comma-separated sensor names | MODERATE |
| 54 | `attributes__charging_speed` | wired_charging_watts; wireless_charging_watts; reverse_charging_watts | Map verified charging wattage(s) with wired/wireless labels; do not infer speed from charging type. | e.g. 45W Wired, 15W Wireless | MODERATE |
| 55 | `attributes__battery_capacity` | battery_capacity; rated_capacity; typical_capacity | Map confirmed capacity and label rated vs typical if both. Bullet and description must match. | e.g. 5000 mAh | CRITICAL |
| 56 | `attributes__battery_type` | battery chemistry; battery type | Only verified chemistry; do not default to Li-ion. | e.g. Lithium-Ion | MODERATE |
| 57 | `attributes__battery_life` | battery_test; official endurance claim; video playback hours | Use only exact stated test result and test scenario; do not infer runtime from mAh. | e.g. Video playback: up to 24 hours | MODERATE |
| 58 | `attributes__charging_type` | charging modes; charging standards | List verified modes such as Wired, Wireless, Reverse Wireless; do not add unsupported modes. | e.g. Wired, Wireless | MODERATE |
| 59 | `attributes__audio` | speaker; audio channels; Dolby Atmos; headphone jack audio features | List confirmed speaker/audio features without inferring loudness or sound quality. | e.g. Stereo Speakers, Dolby Atmos | MODERATE |
| 60 | `attributes__special_features` | special_features; supported flagship features; stylus; AI; UWB; satellite | Verified differentiating features not already well represented; do not add unrelated display facts. | Comma-separated verified features | MODERATE |
| 61 | `attributes__other_information` | verified residual product information; additional_specs | Place important verified facts not represented elsewhere; never use for unverified guesses, warnings, or QA notes. | Concise residual verified text | MODERATE |

## 5. Exact field interpretation and formatting
- **Marketing model vs part number:** `name` / `attributes__product_title` use the marketed name (e.g., Galaxy S25 Ultra); `attributes__model` holds the complete regional manufacturer part code. The fields must refer to the **same** product.
- **Title:** `[Brand] [Marketing Model] [Network] Smartphone, [RAM] RAM, [Storage] Storage, [Color][, Part Number if title policy requires]`. Do not fill missing title parts by guessing. `name` may be slightly more descriptive but may not differ in model, region, storage, RAM or color.
- **OS:** `attributes__os` may contain the confirmed OS/version as given (e.g., Android 15); `attributes__os_version` holds confirmed manufacturer UI/OS skin/edition where separately provided (e.g., One UI 7). If the scraper never supplies the UI version, leave this field empty.
- **Chipset:** `attributes__processor` = chipset maker/family (Qualcomm Snapdragon); `attributes__version` = verified model/version (8 Elite); `attributes__gpu` = separately verified GPU. Do not put handset generation under processor version.
- **Cameras:** `attributes__primary_camera` = **rear** module array. `attributes__secondary_camera` = **front/selfie**. `attributes__camera_resolution` may label a deterministic summary `Rear: ...; Front: ...`; do not reverse them.
- **Screen and units:** `6.9 Inch`, `120 Hz`, `Peak: 2600 nits`, `1440 x 3120 pixels`; retain typical/HBM/peak distinction.
- **Memory / physical dimensions:** `12GB`, `256GB`; physical handset weight `218 g`; handset dimensions `W75.6 x H162.8 x D8.2 mm` **only where the individual axes are known**.
- **Battery / charging:** `5000 mAh`; `45W Wired, 15W Wireless`; distinguish `battery_capacity`, `charging_speed`, `charging_type` and source-specific rated/typical battery capacities.
- **EAN:** text only; digits, 8/12/13/14 length as appropriate; validate GTIN mod-10. Do not accidentally convert EAN into scientific notation or trim a leading zero.
- **Shipping weight:** different from handset weight. Do not use a presumed default (`3000` in a sample row is not a universal default). Convert units only when the portal contract is documented.
- **No fake blanks:** Leave unsupported optional fields as empty cells; never emit `N/A`, `Unknown`, `None`, `null`, literal `NaN`, `-`, or fabricated negatives.

## 6. Customer-facing copy generation
**Bullets:** Exactly six dedicated slots exist. Preferred topics by slot: 1 display, 2 processor/performance, 3 rear camera, 4 battery/charging, 5 network/connectivity, 6 RAM/storage. Each populated slot must be short, neutral, feature-led, evidence-supported, non-repetitive, and without a terminal period. If a primary topic lacks evidence, substitute another confirmed capability; do not force 5G/camera/battery claims.
**Description:** 180–200 original words; begin with the product name/family; do **not** include exact part/model codes or SKU; avoid lengthy dimension/weight details unless material; do not promise battery hours or relative performance without supporting data. If sufficient information is unavailable for truthful 180–200 words, leave blank and mark REVIEW rather than padding with invented content.
**Keywords:** Relevant realistic comma-separated search phrases combining verified brand/product/category/network/capability terms. Deduplicate; avoid repeated plural/singular spam, unrelated variants, ad words, other models, and copied website navigation text.

## 7. QC engine: stop, review, export
| Result | When to assign | Export to upload? |
|---|---|---|
| **READY** | Identity consistent, mandatory fields present, EAN valid and no unresolved critical contradiction | **Yes** |
| **REVIEW** | Variant established but source-supported optional mapping/copy formatting incomplete | Only after acceptance or correction; no fabricated placeholder |
| **HOLD_IDENTITY** | Brand/model code/marketing generation/variant/region conflict or wrong product in scrape | **No** |
| **HOLD_SOURCE_CONFLICT** | Trusted sources or output fields contradict critical hardware/variant specs | **No** |
| **HOLD_INVALID_EAN** | Missing/wrong length/bad check digit/main EAN contradicts SAP | **No** |
**Rule execution:**
- `Q01` **CRITICAL** — sku unique and source-approved, one SKU per upload row
- `Q02` **CRITICAL** — EAN exact matches dedicated SAP column; numeric GTIN length 8/12/13/14 and mod-10 check digit valid; retain leading zeros
- `Q03` **CRITICAL** — Brand, exact part number/model, marketing model, variant RAM/storage/color, and regional configuration refer to one device
- `Q04` **CRITICAL** — name, product_title, model, keywords and sourced identity do not reference different phone generations
- `Q05` **CRITICAL** — RAM and internal storage match exact product variant across all output fields
- `Q06` **CRITICAL** — Rear modules are in primary_camera, selfie modules in secondary_camera
- `Q07` **CRITICAL** — Bullet, description and attribute battery capacity agree; do not mix rated and typical values without labels
- `Q08` **CRITICAL** — OS, processor model, network, SIM and IP rating do not contradict verified exact-region manufacturer source
- `Q09` **CRITICAL** — No output claims unsupported product properties; any direct contradiction with reliable source is critical
- `Q10` **MODERATE** — Empty column with directly evidenced exact-SKU data should be filled or reviewed
- `Q11` **MODERATE** — Numeric measurements and formatting normalized; unit conversions only when source unit clear
- `Q12` **MODERATE** — Text clean: no HTML, stray separators, double spaces, template language, source-audit phrasing
- `Q13` **MODERATE** — Bullets follow preferred subject order where facts exist, concise and nonduplicative; omit unsupported claim instead of inventing
- `Q14` **MODERATE** — Description 180-200 words and free of SKU/part numbers; authored solely from verified facts
- `Q15` **CRITICAL** — Excel headers exactly equal source 61 columns in original order, including attributes__product_type
- `Q16` **MODERATE** — No QA notes, provenance, URLs or hold-reason columns in upload tab
- `Q17` **CRITICAL** — Exclude website navigation, recommendation carousels, sibling variants, ads and review claims from mapped facts

## 8. Detected issues in the provided example row (not verified product specifications)
- Sample name describes Galaxy S25 Ultra while product_title describes Galaxy S23 Ultra; output should HOLD_IDENTITY, not choose one.
- Sample primary_camera=32 MP while secondary_camera=200 MP + 50 MP + 50 MP + 10 MP; likely front/rear mapping reversal relative to agreed schema; verify actual product source.
- Sample bullet battery_capacity=5000 mAh while attribute capacity=4900 mAh; source-specific typical/rated labels may explain a difference but cannot be assumed.
- Sample bullet claims screen size 6.9 inches while screen_size attribute says 5.8 inches.
- Sample EAN 2457588765343 fails GTIN-13 check-digit validation (computed final digit is 8, supplied digit is 3).
- Other suspicious attributes in sample (processor version, GPU, IP rating, accessories) must be checked against matched manufacturer source, not auto-corrected from assumptions.
**Important:** The sample is a contradiction test case. Do not output a corrected S25/S23 specification from the example alone; resolve it against exact product source and SAP first.

## 9. Output files and implementation checklist
**Upload.xlsx:** 1 worksheet named `Upload`; row 1 exactly equals the 61 headers, with no extra QA/evidence columns. One verified product variant per row. All identifiers text-formatted. Write literal values only.
**QA report (separate file):** `sku`, `status`, `severity`, `column`, `source_A`, `value_A`, `source_B`, `value_B`, `issue`, `resolution_action`. These are examples of operational logging fields, not part of the 61 upload columns.
**Programmatic contract:** The companion `Smartphone_Data_Driven_Mapping_Rules.json` provides machine-readable field definitions, source aliases, transformations, output formats, QA severity and exact column order.
**Parser behavior:** Extraction should support fields supplied in structured tables, free-form sentences, mixed-case aliases, and source formats such as `Bluetooth 5.3`, `Bluetooth v5.3`, and `BT version 5.3`; normalize to the accepted value only after positive exact-variant evidence.
**No silent overrides:** Each unresolved critical conflict is a distinct QA finding. Do not mark the SKU READY until all critical findings are resolved.
