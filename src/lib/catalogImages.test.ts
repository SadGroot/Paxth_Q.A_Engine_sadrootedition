import assert from 'node:assert/strict';
import type { SkuData } from '../hooks/useCatalogData';
import { catalogImageContentBounds, catalogImageFilename, catalogImagePath, catalogImagePlacement, catalogImages } from './catalogImages';
import { exportCatalogImages } from './catalogImageExport';

const sku: SkuData = { sku: '00123', source: { url: 'https://shop.example/product' }, status: 'completed', raw_row: {}, upload_attributes: {},
  scraped_markdown: `# Product
![Front](/front.jpg?token=a%2Fb)
![Duplicate](https://shop.example/front.jpg?token=a%2Fb)
![Side][side]
![Back](<https://cdn.example/back(view).png>)
<img src="/html.png?a=1&amp;b=2" alt="HTML image">
<img alt="No source">
![Empty]()
![Unsafe](javascript:alert(1))
![Inline data](data:image/png;base64,abc)
![Credentials](https://secret:password@cdn.example/no.jpg)

[side]: /side.webp "Side image"

## Product images
- <https://cdn.example/asset?$Q90_2052_1641_JPG$>
- [Other](/other.avif)

Source: <https://shop.example/product>
Retrieved URL: <https://shop.example/final>

## Specifications
[Manual](https://shop.example/manual.pdf)
\`![Not an image](/code.jpg)\`
` };
const extracted = catalogImages(sku);
assert.deepEqual(extracted.map(image => image.url), [
  'https://shop.example/front.jpg?token=a%2Fb', 'https://shop.example/side.webp', 'https://cdn.example/back(view).png',
  'https://shop.example/html.png?a=1&b=2', 'https://cdn.example/asset?$Q90_2052_1641_JPG$', 'https://shop.example/other.avif',
]);
assert.equal(extracted[0].alt, 'Front');
assert.equal(extracted[3].alt, 'HTML image');
assert.deepEqual(catalogImages({ ...sku, scraped_markdown: undefined }), []);
assert.deepEqual(catalogImages({ ...sku, scrape_metadata: { method: 'cloud', requestedUrl: 'https://shop.example/another-product', finalUrl: null, capturedAt: null } }), [], 'Stale source evidence supplies no images');
assert.equal(catalogImages({ ...sku, source: {}, scraped_markdown: '![Absolute](https://cdn.example/image.jpg)' }).length, 1);
const pixels = new Uint8ClampedArray(4 * 4 * 4).fill(255);
pixels.set([255, 0, 0, 255], (1 * 4 + 1) * 4);
pixels.set([255, 0, 0, 255], (2 * 4 + 2) * 4);
pixels.set([0, 0, 0, 0], 0);
assert.deepEqual(catalogImageContentBounds(pixels, 4, 4), { x: 1, y: 1, width: 2, height: 2 }, 'White and transparent margins share the same content bounds');
assert.deepEqual(catalogImageContentBounds(new Uint8ClampedArray(16).fill(255), 2, 2), { x: 0, y: 0, width: 2, height: 2 }, 'Entirely white images keep usable dimensions');
assert.deepEqual(catalogImagePlacement(2000, 1000), { x: 150, y: 450, width: 1200, height: 600 });
assert.deepEqual(catalogImagePlacement(1000, 2000), { x: 450, y: 150, width: 600, height: 1200 });
assert.deepEqual(catalogImagePlacement(100, 100), { x: 150, y: 150, width: 1200, height: 1200 });
assert.throws(() => catalogImagePlacement(0, 10));
assert.equal(catalogImageFilename('00123', 2), '00123-2.jpg');
assert.equal(catalogImageFilename('../A/B', 1), '.._A_B-1.jpg');
assert.equal(catalogImageFilename('...', 1), 'SKU-1.jpg');
assert.equal(catalogImagePath('run/1', 'sku/a', 3), '/api/job-runs/run%2F1/items/sku%2Fa/images/3');
await assert.rejects(exportCatalogImages('run', [], () => {}), /at least one image/);
const selected = [extracted[0].url];
await assert.rejects(exportCatalogImages('run', [
  { sku: 'A/B', snapshot: sku, selectedImageUrls: selected }, { sku: 'A_B', snapshot: sku, selectedImageUrls: selected },
], () => {}), /filenames overlap/, 'Sanitizing SKU names cannot silently overwrite ZIP entries');
await assert.rejects(exportCatalogImages('run', [{ sku: sku.sku, snapshot: sku, selectedImageUrls: ['https://cdn.example/missing.jpg'] }], () => {}), /no longer in/);
console.log('Catalog image checks passed: markdown sources, duplicates, signed URLs, source freshness, padding and filenames.');
