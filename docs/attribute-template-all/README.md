# All attribute-set headers and filling rules

Current workbook result: **124 of 125 Excel files have verified saved per-header rules; one protected file remains blocked**. All five phases of 25 are recorded in the [workbook phase report](workbook-phases.md), with [per-file source hashes and backend verification](workbook-phases.json). The 13 backend categories without a workbook are outside this 125-file completion count.

Registry coverage: **138 existing backend attribute sets**, **5,638 configured header/rule entries**, **125 supplied workbooks**, and **143 usable example rows** (including partial examples). The [reviewed manifest](manifest.json) records exact backend names, source sheets, header/sample rows, output order, rule documents, evidence limitations and source corrections. The five-set pilot and fifty-set expansion are included.

The initial fill-only import added **125 rule documents** and **130 header lists**, preserving the existing configuration. A subsequent file-by-file audit found eight retained legacy mappings without the new workbook format sections. The phased completion added those sections and improved Camera's aligned examples, updating nine saved mappings while retaining prior text verbatim. Nonempty placeholder rules for the protected workbook are not counted as completion.

## Evidence and filling behavior

- **121 sets** have usable workbook examples. Rules learn cell layout, units and unit spacing, separators, title/paragraph guidance, boolean/version distinctions, column-aligned bullet priorities and real alternative sample formats. Examples are never factual defaults or allowed-value enums.
- **Two sets** (Laptops and Mattress) supply headers without product examples. Their schemas are retained; field formats are explicitly unlearned.
- **Electronic-Camera** has 26 aligned fields in A–Z that supply useful examples. The 47 specification fields in AA–BV are shifted and excluded from format learning; their filling rules remain explicit fallbacks.
- **Electronics-Medical Equipment** is IRM protected and supplies no readable schema or examples. Its protection is not bypassed.
- **13 sets** have no workbook. Bag Attribute Set retains its existing 58 headers. The other missing schemas, plus the protected workbook, use only the six application pass-through fields and `name`. These are labeled source-only fallbacks, with no invented category-specific columns or units.

The six pass-through fields are `sku`, `base_code`, `attributes__lulu_ean`, `attributes__shipping_weight`, `attributes__brand` and `attributes__lulu_product_type`. Existing values, including blanks, remain governed by the application. SAP supplies product facts first; supported web evidence may fill source gaps under the existing workflow. Unknown facts stay empty with the application's warnings. IDQ classifications remain unchanged and must be set explicitly before IDQ use.

## Preview, apply and verify

Audit the exact 125-workbook scope, or complete all five phases and append missing workbook-format sections without deleting existing rules:

```sh
npx tsx scripts/complete-workbook-rules.ts
npx tsx scripts/complete-workbook-rules.ts --apply
npx tsx scripts/complete-workbook-rules.test.ts
```

Each phase has its own transaction, backup and fresh backend verification. Repeats do not duplicate format sections or change timestamps. Exit code **2** means that source-blocked or pending files remain; the per-file report identifies them. The Medical Equipment workbook contains only the message “This workbook has been IRM protected by policy.” and no accessible product headers. Replace it with an unprotected copy, review its headers/examples and update the manifest/rules before rerunning. Header-only Laptops/Mattress sheets have complete per-header fallback instructions but no learned example formats.

The original fill-only commands remain available for the broader backend registry:

```sh
npx tsx scripts/import-attribute-template-pilot.ts --all
npx tsx scripts/import-attribute-template-pilot.ts --all --apply
npx tsx scripts/import-attribute-template-pilot.test.ts
npm run lint
```

The all-set mode fills missing rules and missing header lists independently. It preserves nonblank saved rules, existing header lists/order, IDs, names, classifications and creation dates. Fully configured sets remain untouched, including their update timestamps. Generated format documents for already curated sets are available here for review; the import does not overwrite those saved rules.

The complete reviewed manifest is required. Before database updates, all headers and per-header document coverage are checked. A transaction locks the selected rows, saves the original records to ignored `backups/attribute-template-all-*.json`, and applies only missing configuration. A fresh database read verifies saved values against the pre-import configuration. An identical repeat changes zero rows. Neither sample products nor new attribute sets are inserted.

Preview: `.cache/attribute-template-all/preview.json`. Format-check workbook: `.cache/attribute-template-all/format-check.xlsx`. The workbook contains original illustrative examples under the reviewed headers; sets without usable samples contain headers only. It is not generated or verified catalog content.

Tests exercise all exact header/rule pairs, source gaps, multiple/partial samples, canonical product type, duplicate/padded columns, ignored unlabelled values, numeric/boolean/version formats, prompt wiring, pass-through protection and Excel round trips. Set `TEST_DATABASE_URL` to additionally check all three batches in isolated temporary schemas: atomic import, backup failure, protected existing rules/headers/classifications, unchanged IDs, unrelated rows and idempotency. Live LLM generation and factual accuracy of the examples are not checked.

## All mappings

| Attribute set | Header/rule entries | Evidence |
| --- | ---: | --- |
| [Bag Attribute Set](Bag%20Attribute%20Set.md) | 58 | No workbook; fallback |
| [Combo Offers](Combo%20Offers.md) | 7 | No workbook; fallback |
| [E-HM-Weighing scales](../attribute-template-batch-50/E-HM-Weighing%20scales.md) | 44 | Workbook examples |
| [Elec-Audio-Audio Accessories](../attribute-template-batch-50/Elec-Audio-Audio%20Accessories.md) | 43 | Workbook examples |
| [Elec-Audio-Headphones](../attribute-template-pilot/Elec-Audio-Headphones.md) | 63 | Workbook examples |
| [Elec-Audio-Musical Instruments](../attribute-template-batch-50/Elec-Audio-Musical%20Instruments.md) | 64 | Workbook examples |
| [Elec-Audio-Radio](Elec-Audio-Radio.md) | 40 | Workbook examples |
| [Elec-Audio-Receiver](../attribute-template-batch-50/Elec-Audio-Receiver.md) | 58 | Workbook examples |
| [Elec-Audio-Soundbars&Speakers](../attribute-template-batch-50/Elec-Audio-Soundbars%26Speakers.md) | 64 | Workbook examples |
| [Elec-C&A-Desktops](Elec-C%26A-Desktops.md) | 7 | No workbook; fallback |
| [Elec-C&A-Laptops](Elec-C%26A-Laptops.md) | 55 | Headers only |
| [Elec-C&A-PCACC-External Storages](../attribute-template-batch-50/Elec-C%26A-PCACC-External%20Storages.md) | 38 | Workbook examples |
| [Elec-C&A-PCACC-Laptop Stand & Mouse Pad](../attribute-template-batch-50/Elec-C%26A-PCACC-Laptop%20Stand%20%26%20Mouse%20Pad.md) | 37 | Workbook examples |
| [Elec-C&A-PCACC-Memory Card Adapters](../attribute-template-batch-50/Elec-C%26A-PCACC-Memory%20Card%20Adapters.md) | 35 | Workbook examples |
| [Elec-C&A-PCACC-Other PC Accessories](../attribute-template-batch-50/Elec-C%26A-PCACC-Other%20PC%20Accessories.md) | 40 | Workbook examples |
| [Elec-C&A-PCACC-PC Headsets & Speakers](Elec-C%26A-PCACC-PC%20Headsets%20%26%20Speakers.md) | 45 | Workbook examples |
| [Elec-C&A-PCACC-PC Keyboards & Mouse](../attribute-template-batch-50/Elec-C%26A-PCACC-PC%20Keyboards%20%26%20Mouse.md) | 41 | Workbook examples |
| [Elec-C&A-PCACC-PC Monitors & Projectors](Elec-C%26A-PCACC-PC%20Monitors%20%26%20Projectors.md) | 58 | Workbook examples |
| [Elec-C&A-PCACC-USB Hubs](Elec-C%26A-PCACC-USB%20Hubs.md) | 36 | Workbook examples |
| [Elec-C&A-PCACC-Web camera](../attribute-template-batch-50/Elec-C%26A-PCACC-Web%20camera.md) | 40 | Workbook examples |
| [Elec-C&A-T&A-Styllus](Elec-C%26A-T%26A-Stylus.md) | 35 | Workbook examples |
| [Elec-Gaming-Consoles](../attribute-template-batch-50/Elec-Gaming-Consoles.md) | 47 | Workbook examples |
| [Elec-Gaming-GA-Controllers](../attribute-template-batch-50/Elec-Gaming-GA-Controllers.md) | 40 | Workbook examples |
| [Elec-Gaming-GA-Gaming Chairs & Desks](../attribute-template-batch-50/Elec-Gaming-GA-Gaming%20Chairs%20%26%20Desks.md) | 35 | Workbook examples |
| [Elec-Gaming-GA-Gaming-Accessories](../attribute-template-batch-50/Elec-Gaming-GA-Gaming-Accessories.md) | 32 | Workbook examples |
| [Elec-Gaming-Titles](../attribute-template-batch-50/Elec-Gaming-Titles.md) | 33 | Workbook examples |
| [Elec-Gaming-VR Headsets](../attribute-template-batch-50/Elec-Gaming-VR%20Headsets.md) | 36 | Workbook examples |
| [Elec-HA-Air Purifier Filters](../attribute-template-batch-50/Elec-HA-Air%20Purifier%20Filters.md) | 38 | Workbook examples |
| [Elec-HA-Air Purifiers](../attribute-template-batch-50/Elec-HA-Air%20Purifiers.md) | 60 | Workbook examples |
| [Elec-HA-Disinfectant Equipment](../attribute-template-batch-50/Elec-HA-Disinfectant%20Equipment.md) | 47 | Workbook examples |
| [Elec-HA-Fans](../attribute-template-batch-50/Elec-HA-Fans.md) | 51 | Workbook examples |
| [Elec-HA-Garment Steamers](../attribute-template-batch-50/Elec-HA-Garment%20Steamers.md) | 44 | Workbook examples |
| [Elec-HA-Heaters](../attribute-template-batch-50/Elec-HA-Heaters.md) | 34 | Workbook examples |
| [Elec-HA-Insect Killers](../attribute-template-batch-50/Elec-HA-Insect%20Killers.md) | 46 | Workbook examples |
| [Elec-HA-Irons](../attribute-template-batch-50/Elec-HA-Irons.md) | 40 | Workbook examples |
| [Elec-HA-Pressure Washers](../attribute-template-batch-50/Elec-HA-Pressure%20Washers.md) | 45 | Workbook examples |
| [Elec-HA-Robotic Vacuum Cleaner](../attribute-template-batch-50/Elec-HA-Robotic%20Vacuum%20Cleaner.md) | 59 | Workbook examples |
| [Elec-HA-Sewing Machines](../attribute-template-batch-50/Elec-HA-Sewing%20Machines.md) | 44 | Workbook examples |
| [Elec-HA-Vacuum Cleaner Accessories](../attribute-template-batch-50/Elec-HA-Vacuum%20Cleaner%20Accessories.md) | 31 | Workbook examples |
| [Elec-HA-Vacuum Cleaners](../attribute-template-batch-50/Elec-HA-Vacuum%20Cleaners.md) | 53 | Workbook examples |
| [Elec-HA-Vacuum Cleaning Liquid](Elec-HA-Vacuum%20Cleaning%20Liquid.md) | 35 | Workbook examples |
| [Elec-HA-Water Coolers/Dispensers](Elec-HA-Water%20Coolers_Dispensers.md) | 54 | Workbook examples |
| [Elec-HA-Water Filters & Accessories](../attribute-template-batch-50/Elec-HA-Water%20Filters%20%26%20Accessories.md) | 46 | Workbook examples |
| [Elec-ITACC-Other IT Accessories](../attribute-template-batch-50/Elec-ITACC-Other%20IT%20Accessories.md) | 33 | Workbook examples |
| [Elec-ITACC-Printers, Scanners & Accessories](../attribute-template-batch-50/Elec-ITACC-Printers%2C%20Scanners%20%26%20Accessories.md) | 48 | Workbook examples |
| [Elec-ITACC-Routers & Wi-Fi Range Extenders](../attribute-template-batch-50/Elec-ITACC-Routers%20%26%20Wi-Fi%20Range%20Extenders.md) | 38 | Workbook examples |
| [Elec-ITACC-Smart Devices & Accessories](../attribute-template-batch-50/Elec-ITACC-Smart%20Devices%20%26%20Accessories.md) | 52 | Workbook examples |
| [Elec-ITACC-Softwares](../attribute-template-batch-50/Elec-ITACC-Softwares.md) | 35 | Workbook examples |
| [Elec-LA-Air Conditioners](Elec-LA-Air%20Conditioners.md) | 72 | Workbook examples |
| [Elec-LA-Cooker Hoods](../attribute-template-batch-50/Elec-LA-Cooker%20Hoods.md) | 42 | Workbook examples |
| [Elec-LA-Cooking Hobs](../attribute-template-batch-50/Elec-LA-Cooking%20Hobs.md) | 47 | Workbook examples |
| [Elec-LA-Cooking Ranges](../attribute-template-batch-50/Elec-LA-Cooking%20Ranges.md) | 44 | Workbook examples |
| [Elec-LA-Dishwashers](../attribute-template-batch-50/Elec-LA-Dishwashers.md) | 45 | Workbook examples |
| [Elec-LA-Refrigerators](../attribute-template-batch-50/Elec-LA-Refrigerators.md) | 56 | Workbook examples |
| [Elec-LA-Washing Machines](../attribute-template-pilot/Elec-LA-Washing%20Machines.md) | 50 | Workbook examples |
| [Elec-M&W-MA-Mobile Cases & Skins](../attribute-template-batch-50/Elec-M%26W-MA-Mobile%20Cases%20%26%20Skins.md) | 42 | Workbook examples |
| [Elec-M&W-MA-Power Adapters / Chargers & Utility Cables](Elec-M%26W-MA-Power%20Adapters_Chargers%20%26%20Utility%20Cables.md) | 42 | Workbook examples |
| [Elec-M&W-MA-Power Banks](../attribute-template-batch-50/Elec-M%26W-MA-Power%20Banks.md) | 42 | Workbook examples |
| [Elec-M&W-MA-Screen Protectors](../attribute-template-batch-50/Elec-M%26W-MA-Screen%20Protectors.md) | 35 | Workbook examples |
| [Elec-M&W-MA-Stands & Other Accessories](../attribute-template-batch-50/Elec-M%26W-MA-Stands%20%26%20Other%20Accessories.md) | 37 | Workbook examples |
| [Elec-M&W-Smartphones & Tablets](Elec-M%26W-Smartphones%20%26%20Tablets.md) | 61 | Workbook examples |
| [Elec-M&W-W-Smartwatches & Fitness Trackers](Elec-M%26W-W-Smartwatches%20%26%20Fitness%20Trackers.md) | 7 | No workbook; fallback |
| [Elec-M&W-W-Wearable Accessories](../attribute-template-batch-50/Elec-M%26W-W-Wearable%20Accessories.md) | 39 | Workbook examples |
| [Elec-PC-Electric Toothbrush](../attribute-template-batch-50/Elec-PC-Electric%20Toothbrush.md) | 46 | Workbook examples |
| [Elec-PC-Epilators & IPL Hair Remover](../attribute-template-batch-50/Elec-PC-Epilators%20%26%20IPL%20Hair%20Remover.md) | 54 | Workbook examples |
| [Elec-PC-Hair Dryers](Elec-PC-Hair%20Dryers.md) | 42 | Workbook examples |
| [Elec-PC-Hair Stylers](../attribute-template-batch-50/Elec-PC-Hair%20Stylers.md) | 42 | Workbook examples |
| [Elec-PC-Other Accessories](Elec-PC-Other%20Accessories.md) | 7 | No workbook; fallback |
| [Elec-PC-Shavers & Trimmers](../attribute-template-batch-50/Elec-PC-Shavers%20%26%20Trimmers.md) | 53 | Workbook examples |
| [Electrics-Kitchen Appliances](Electrics-Kitchen%20Appliances.md) | 68 | Workbook examples |
| [Electronic-Camera](Electronic-Camera.md) | 73 | 26 aligned examples; remaining fields use fallbacks |
| [Electronics-e-Gift Cards](Electronics-e-Gift%20Cards.md) | 7 | No workbook; fallback |
| [Electronics-Medical Equipment](Electronics-Medical%20Equipment.md) | 7 | Protected workbook; fallback |
| [Electronics-TV](Electronics-TV.md) | 70 | Workbook examples |
| [Grocery Fish&Meat Multi Pack](Grocery%20Fish%26Meat%20Multi%20Pack.md) | 7 | No workbook; fallback |
| [Grocery Multi Pack](Grocery%20Multi%20Pack.md) | 7 | No workbook; fallback |
| [Grocery Single Pack](Grocery%20Single%20Pack.md) | 7 | No workbook; fallback |
| [H&B-Eyexpress-Sunglasses](H%26B-Eyexpress-Sunglasses.md) | 45 | Workbook examples |
| [H&B-Make Up](H%26B-Make%20Up.md) | 47 | Workbook examples |
| [H&B-Perfumes](H%26B-Perfumes.md) | 40 | Workbook examples |
| [H&B-Skin Care](H%26B-Skin%20Care.md) | 45 | Workbook examples |
| [H&L-Baby Accessories](H%26L-Baby%20Accessories.md) | 53 | Workbook examples |
| [H&L-Books](H%26L-Books.md) | 42 | Workbook examples |
| [H&L-C&D-Bakeware](H%26L-C%26D-Bakeware.md) | 42 | Workbook examples |
| [H&L-C&D-Containers](H%26L-C%26D-Containers.md) | 39 | Workbook examples |
| [H&L-C&D-Cookware](H%26L-C%26D-Cookware.md) | 42 | Workbook examples |
| [H&L-C&D-Serveware](H%26L-C%26D-Serveware.md) | 47 | Workbook examples |
| [H&L-HF-Bath Furnishing](H%26L-HF-Bath%20Furnishing.md) | 42 | Workbook examples |
| [H&L-HF-Bed Room](H%26L-HF-Bed%20Room.md) | 42 | Workbook examples |
| [H&L-HF-Cordless Phones](H%26L-HF-Cordless%20Phones.md) | 44 | Workbook examples |
| [H&L-HF-Floor Covering](H%26L-HF-Floor%20Covering.md) | 32 | Workbook examples |
| [H&L-HF-Living Room](H%26L-HF-Living%20Room.md) | 40 | Workbook examples |
| [H&L-HF-Mattress](H%26L-HF-Mattress.md) | 32 | Headers only |
| [H&L-HF-Seasonal Decor](H%26L-HF-Seasonal%20Decor.md) | 36 | Workbook examples |
| [H&L-HF-Sofas & Furnitures](H%26L-HF-Sofas%20%26%20Furnitures.md) | 49 | Workbook examples |
| [H&L-HF-Table Linen & Curtains](H%26L-HF-Table%20Linen%20%26%20Curtains.md) | 34 | Workbook examples |
| [H&L-Luggage](../attribute-template-pilot/H%26L-Luggage.md) | 50 | Workbook examples |
| [H&L-Outdoor & Accessories](H%26L-Outdoor%20%26%20Accessories.md) | 53 | Workbook examples |
| [H&L-S&F-E&F-B&A-E-Bikes](H%26L-S%26F-E%26F-B%26A-E-Bikes.md) | 52 | Workbook examples |
| [H&L-S&F-E&F-Bicycle & Accessories](H%26L-S%26F-E%26F-Bicycle%20%26%20Accessories.md) | 42 | Workbook examples |
| [H&L-S&F-E&F-EM-Cross Trainer](H%26L-S%26F-E%26F-EM-Cross%20Trainer.md) | 51 | Workbook examples |
| [H&L-S&F-E&F-EM-Home GYM](H%26L-S%26F-E%26F-EM-Home%20GYM.md) | 48 | Workbook examples |
| [H&L-S&F-E&F-EM-Magnetic Upright Bike](H%26L-S%26F-E%26F-EM-Magnetic%20Upright%20Bike.md) | 38 | Workbook examples |
| [H&L-S&F-E&F-EM-Spinning Bike](H%26L-S%26F-E%26F-EM-Spinning%20Bike.md) | 44 | Workbook examples |
| [H&L-S&F-E&F-EM-Tread Mills](H%26L-S%26F-E%26F-EM-Tread%20Mills.md) | 50 | Workbook examples |
| [H&L-S&F-E&F-Fitness Accessories](H%26L-S%26F-E%26F-Fitness%20Accessories.md) | 40 | Workbook examples |
| [H&L-S&F-E&F-Gym And Workout Equipments](H%26L-S%26F-E%26F-Gym%20And%20Workout%20Equipments.md) | 37 | Workbook examples |
| [H&L-S&F-E&F-Strength Training Equipments](H%26L-S%26F-E%26F-Strength%20Training%20Equipments.md) | 40 | Workbook examples |
| [H&L-S&F-E&F-Support Equipments](H%26L-S%26F-E%26F-Support%20Equipments.md) | 36 | Workbook examples |
| [H&L-S&F-I&D-Racket Sports](H%26L-S%26F-I%26D-Racket%20Sports.md) | 41 | Workbook examples |
| [H&L-S&F-O&G-Team Sports](H%26L-S%26F-O%26G-Team%20Sports.md) | 41 | Workbook examples |
| [H&L-S&F-OG-Other Games & Accessories](H%26L-S%26F-OG-Other%20Games%20%26%20Accessories.md) | 35 | Workbook examples |
| [H&L-S&F-OG-Trampoline](H%26L-S%26F-OG-Trampoline.md) | 42 | Workbook examples |
| [H&L-S&F-OG-TS-Golf Accessories](H%26L-S%26F-OG-TS-Golf%20Accessories.md) | 34 | Workbook examples |
| [H&L-S&F-OG-TS-Skating](H%26L-S%26F-OG-TS-Skating.md) | 40 | Workbook examples |
| [H&L-S&F-Swimming Pool & Accessories](H%26L-S%26F-Swimming%20Pool%20%26%20Accessories.md) | 40 | Workbook examples |
| [H&L-Stationery-Art & Craft](../attribute-template-pilot/H%26L-Stationery-Art%20%26%20Craft.md) | 34 | Workbook examples |
| [H&L-Stationery-Calculators](../attribute-template-pilot/H%26L-Stationery-Calculators.md) | 40 | Workbook examples |
| [H&L-Stationery-General Stationery](H%26L-Stationery-General%20Stationery.md) | 38 | Workbook examples |
| [H&L-Stationery-Lunch Box & Water Bottle](H%26L-Stationery-Lunch%20Box%20%26%20Water%20Bottle.md) | 37 | Workbook examples |
| [H&L-Stationery-Office Supplies](H%26L-Stationery-Office%20Supplies.md) | 33 | Workbook examples |
| [H&L-Stationery-Pen & Pencil](H%26L-Stationery-Pen%20%26%20Pencil.md) | 37 | Workbook examples |
| [H&L-Stationery-School Bags](H%26L-Stationery-School%20Bags.md) | 39 | Workbook examples |
| [H&L-Stationery-School Stationery](H%26L-Stationery-School%20Stationery.md) | 34 | Workbook examples |
| [H&L-Toys](H%26L-Toys.md) | 41 | Workbook examples |
| [H&L-Toys-E-Bikes](H%26L-Toys-E-Bikes.md) | 45 | Workbook examples |
| [H&L-Toys-Play Ground & Inflated Games](H%26L-Toys-Play%20Ground%20%26%20Inflated%20Games.md) | 41 | Workbook examples |
| [HA-WP&D-Accessories](HA-WP%26D-Accessories.md) | 7 | No workbook; fallback |
| [HH-CE-Brushes, Mops & Buckets](HH-CE-Brushes%2C%20Mops%20%26%20Buckets.md) | 37 | Workbook examples |
| [HH-EA-Light & Bulbs](HH-EA-Light%20%26%20Bulbs.md) | 55 | Workbook examples |
| [HH-EA-Plug & Extenstion](HH-EA-Plug%20%26%20Extenstion.md) | 38 | Workbook examples |
| [HH-EA-Power tools](HH-EA-Power%20tools.md) | 48 | Workbook examples |
| [HH-HE-Car Accessories](HH-HE-Car%20Accessories.md) | 67 | Workbook examples |
| [HH-HE-Plastic Storage and Buckets](HH-HE-Plastic%20Storage%20and%20Buckets.md) | 38 | Workbook examples |
| [HH-LE-Laundary Accessories](HH-LE-Laundary%20Accessories.md) | 46 | Workbook examples |
| [Lulu Gift Card](Lulu%20Gift%20Card.md) | 7 | No workbook; fallback |
| [TestSet](TestSet.md) | 7 | No workbook; fallback |
| [WarrantySet](WarrantySet.md) | 7 | No workbook; fallback |
| **Total** | **5,638** | **138 sets** |

## Reviewed source corrections

Original workbooks are unchanged. Header padding is trimmed, repeated keys collapse to their first position, blank keys are omitted, and the canonical product-type key is used. Unlabelled sample cells do not justify inventing a column. PC Headsets & Speakers lacks the required brand pass-through header; it is appended explicitly. Existing saved output lists take precedence.

- **Bag Attribute Set**: Preserved the existing Catalog output header list and order.
- **Combo Offers**: No source schema is available: use the six application pass-through columns plus name, without invented category-specific columns.
- **Elec-Audio-Radio**: Collapsed repeated attributes__material at AK2 into its first position.
- **Elec-C&A-Desktops**: No source schema is available: use the six application pass-through columns plus name, without invented category-specific columns.
- **Elec-C&A-PCACC-PC Headsets & Speakers**: Trimmed header whitespace at V2. Trimmed header whitespace at W2. Trimmed header whitespace at X2. Trimmed header whitespace at AD2. Trimmed header whitespace at AE2. Appended required application pass-through header attributes__brand, absent from the source.
- **Elec-C&A-PCACC-PC Monitors & Projectors**: Collapsed repeated attributes__material at BA2 into its first position.
- **Elec-C&A-T&A-Styllus**: Filename matched to the existing backend name via an explicit alias.
- **Elec-HA-Vacuum Cleaning Liquid**: Collapsed repeated attributes__shipping_weight at AJ2 into its first position.
- **Elec-HA-Water Coolers/Dispensers**: Filename matched to the existing backend name via an explicit alias.
- **Elec-M&W-MA-Power Adapters / Chargers & Utility Cables**: Filename matched to the existing backend name via an explicit alias.
- **Elec-M&W-Smartphones & Tablets**: Preserved the existing Catalog output header list and order.
- **Elec-M&W-W-Smartwatches & Fitness Trackers**: No source schema is available: use the six application pass-through columns plus name, without invented category-specific columns.
- **Elec-PC-Hair Dryers**: Dropped empty header at AQ2.
- **Elec-PC-Other Accessories**: No source schema is available: use the six application pass-through columns plus name, without invented category-specific columns.
- **Electrics-Kitchen Appliances**: Collapsed repeated attributes__power_consumption at BO2 into its first position. Preserved the existing Catalog output header list and order.
- **Electronic-Camera**: Unlabelled example value at AB3 is not mapped to an invented header. Aligned A–Z fields supply format examples; the 47 AA–BV specification fields are excluded from learning because their values are shifted.
- **Electronics-e-Gift Cards**: No source schema is available: use the six application pass-through columns plus name, without invented category-specific columns.
- **Electronics-Medical Equipment**: No readable product header table; protected workbook supplies no usable header or sample evidence. No source schema is available: use the six application pass-through columns plus name, without invented category-specific columns.
- **Grocery Fish&Meat Multi Pack**: No source schema is available: use the six application pass-through columns plus name, without invented category-specific columns.
- **Grocery Multi Pack**: No source schema is available: use the six application pass-through columns plus name, without invented category-specific columns.
- **Grocery Single Pack**: No source schema is available: use the six application pass-through columns plus name, without invented category-specific columns.
- **H&B-Perfumes**: Trimmed header whitespace at AM2.
- **H&L-C&D-Cookware**: Selected Sheet1; other sheets are vertical header notes, not product tables.
- **H&L-HF-Floor Covering**: Selected Sheet1; other sheets are vertical header notes, not product tables.
- **H&L-S&F-OG-Trampoline**: Dropped empty header at AQ2.
- **HA-WP&D-Accessories**: No source schema is available: use the six application pass-through columns plus name, without invented category-specific columns.
- **HH-EA-Light & Bulbs**: Dropped empty header at BD2. Dropped empty header at BE2. Unlabelled example value at BF3 is not mapped to an invented header.
- **Lulu Gift Card**: No source schema is available: use the six application pass-through columns plus name, without invented category-specific columns.
- **TestSet**: No source schema is available: use the six application pass-through columns plus name, without invented category-specific columns.
- **WarrantySet**: No source schema is available: use the six application pass-through columns plus name, without invented category-specific columns.
