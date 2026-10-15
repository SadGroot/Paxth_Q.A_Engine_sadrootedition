# Five attribute-set template pilot

[All 138 backend attribute sets](../attribute-template-all/README.md) are now covered by the full reviewed manifest. The commands below retain the original pilot behavior; use `--all` to fill missing configuration across every set while preserving existing saved values.

Read the header row and sample product in `OneDrive_2_10-15-2026`. Samples teach cell formats only; they are not verified product data or defaults. Each mapping document contains one filling rule for every exact header, in workbook order.

| Existing attribute set | Headers and filling rules |
| --- | ---: |
| [Elec-Audio-Headphones](Elec-Audio-Headphones.md) | 63 |
| [Elec-LA-Washing Machines](Elec-LA-Washing%20Machines.md) | 50 |
| [H&L-Luggage](H%26L-Luggage.md) | 50 |
| [H&L-Stationery-Art & Craft](H%26L-Stationery-Art%20%26%20Craft.md) | 34 |
| [H&L-Stationery-Calculators](H%26L-Stationery-Calculators.md) | 40 |
| **Total** | **237** |

The five sets had empty backend headers and rules when selected. Existing IDs, category names, and header classifications are preserved. The pilot does not create categories or import sample products. Mandatory/optional IDQ classifications are not inferred from samples or ambiguous annotation lists.

[The next 50 attribute sets](../attribute-template-batch-50/README.md) add 2,195 headers and filling rules, forming a 55-set subset with 2,432 header/rule entries. Use `--batch-50` to preview or apply that separate batch.

Preview without database changes:

```sh
npx tsx scripts/import-attribute-template-pilot.ts
```

Save the reviewed five to the configured backend:

```sh
npx tsx scripts/import-attribute-template-pilot.ts --apply
```

The importer validates all five before updating them in one transaction, saves the previous rows to an ignored `backups/attribute-template-pilot-*.json`, and verifies persistence from a fresh read. It refuses to replace differing nonempty rules, header lists, or existing classifications. An identical repeat changes nothing. The preview is `.cache/attribute-template-pilot/preview.json`.

Check header extraction, rule coverage, sample isolation, Catalog prompt wiring, protected identifiers, missing-value warnings, and Excel round trips:

```sh
npx tsx scripts/import-attribute-template-pilot.test.ts
```

Setting `TEST_DATABASE_URL` also exercises atomic import, backup, overwrite protection, and idempotency in a temporary isolated database schema. The test removes that schema afterward. `.cache/attribute-template-pilot/format-check.xlsx` contains the original illustrative sample rows exported under the exact pilot headers; it is a format test, not generated or verified product content. These checks do not call an LLM or validate the sample facts.

These five pilot `.xls` layouts have merged group labels on row 1, exact headers on row 2, one illustrative product on row 3, and annotations below. The separate 50-set batch uses the same header row; Vacuum Cleaners also has a reviewed second sample on row 4. The folder contains 125 workbooks. Other inspected templates include duplicate headers, trailing spaces, and a header-only Mattress workbook; review those separately before expanding the import.
