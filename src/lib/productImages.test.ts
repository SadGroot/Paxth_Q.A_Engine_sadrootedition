import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { extractImageGalleries } from './productImages';

const base = 'https://shop.example/product';
const extract = (html: string, media: unknown = []) => extractImageGalleries(html, media, base);
const urls = (html: string, media: unknown = []) => extract(html, media).flatMap(gallery => gallery.images.map(image => image.url));
const gallery = (content: string) => `<section class="product-gallery">${content}</section>`;

const samsung = await readFile(new URL('./fixtures/samsung-gallery.html', import.meta.url), 'utf8');
const assets = ['551866336', '546182716', '546182717', '546182719', '546182720', '547964753', '547964758', '547964783',
  '547964777', '548123605', '548318150', '548126234_10149706079738', '546478574', '546369371', '546369405', '546369437'];
const prefix = 'https://images.samsung.com/is/image/samsung/p6pim/ae/qa55qn90fauxzn/gallery/ae-qled-qn90f-qa55qn90fauxzn-';
const expectedSamsung = assets.map(asset => `${prefix}${asset}?$Q90_2052_1641_JPG$`);
assert.deepEqual(urls(samsung), expectedSamsung, 'All 16 captured slides use their advertised zoom URL, in carousel order');
assert.deepEqual(urls(gallery(`<img src="${expectedSamsung[0]}"><img src="${prefix}${assets[0]}?$ORIGIN_PNG$">`)),
  [`${prefix}${assets[0]}?$ORIGIN_PNG$`], 'A supplied Samsung original replaces its sized copies without inventing a URL');
assert.deepEqual(urls(gallery(`<img src="${prefix}${assets[0]}?$LazyLoad_Home_JPG$"><img src="${prefix}${assets[0]}?$900_N_JPG$">`)),
  [`${prefix}${assets[0]}?$900_N_JPG$`], 'Samsung lazy and width-only transforms are copies of the same source asset');

assert.deepEqual(urls(gallery(`<img src="/front.jpg?w=320&amp;h=240" data-src="/front.jpg?w=1600&amp;h=1200" alt="Front">
  <img src="/front.jpg?w=800&amp;h=600" alt="Duplicate"><img data-src="/side.jpg?w=1200&amp;h=900" alt="Side">`)),
  ['https://shop.example/front.jpg?w=1600&h=1200', 'https://shop.example/side.jpg?w=1200&h=900']);
assert.deepEqual(urls(gallery(`<picture><source srcset="//cdn.example.com/upload/w_400,h_300/front.jpg 400w, //cdn.example.com/upload/w_1800,h_1350/front.jpg 1800w">
  <img src="//cdn.example.com/front-small.jpg" alt="Front"></picture>`)), ['https://cdn.example.com/upload/w_1800,h_1350/front.jpg']);
assert.deepEqual(urls(gallery('<img data-srcset="/photo-1.jpg 1x, /photo-2.jpg 2x" alt="Photo">')), ['https://shop.example/photo-2.jpg']);
assert.deepEqual(urls(gallery('<a class="zoom" href="/original.jpg?signature=abc%2Fdef"><img src="/small.jpg?w=400" alt="Photo"></a>')),
  ['https://shop.example/original.jpg?signature=abc%2Fdef']);
assert.deepEqual(urls(gallery('<a class="zoom" href="#gallery-modal"><img src="/large.jpg?w=1800" alt="Photo"></a>')),
  ['https://shop.example/large.jpg?w=1800'], 'Zoom popup controls are not image URLs');
assert.deepEqual(urls(gallery('<img src="/large.jpg?w=2000" data-original="/original.jpg?token=keep%2Bthis" alt="Photo">')),
  ['https://shop.example/original.jpg?token=keep%2Bthis']);
assert.deepEqual(urls(gallery('<picture><source srcset="/signed.jpg?w=500&amp;sig=small 500w, /signed.jpg?w=2000&amp;sig=big%2Btoken 2000w"><img alt="Signed"></picture>')),
  ['https://shop.example/signed.jpg?w=2000&sig=big%2Btoken']);
assert.deepEqual(urls(gallery('<img src="/photo.jpg?w=600&amp;variant=black" alt="Front"><img src="/photo.jpg?w=600&amp;variant=white" alt="Front">')),
  ['https://shop.example/photo.jpg?w=600&variant=black', 'https://shop.example/photo.jpg?w=600&variant=white'], 'Alt text and distinct variant parameters never collapse different images');
assert.deepEqual(urls(gallery('<img src="/photo.jpg?w=1200&amp;q=30"><img src="/photo.jpg?w=1200&amp;q=90">')),
  ['https://shop.example/photo.jpg?w=1200&q=90'], 'Higher advertised encoding quality wins at equal resolution');
assert.deepEqual(urls(gallery('<img src="/photo.jpg?q=front"><img src="/photo.jpg?q=back">')),
  ['https://shop.example/photo.jpg?q=front', 'https://shop.example/photo.jpg?q=back'], 'Unknown parameter meanings are retained in asset identity');

const desktop = gallery('<img src="/front.jpg?w=1800"><img src="/side.jpg?w=1800">');
const mobile = '<div class="mobile-gallery"><img src="/front.jpg?w=400"><img src="/side.jpg?w=400"></div>';
assert.equal(extract(desktop + mobile).length, 1, 'Repeated desktop/mobile galleries merge without repeating images');
assert.deepEqual(urls(desktop + mobile), ['https://shop.example/front.jpg?w=1800', 'https://shop.example/side.jpg?w=1800']);
assert.deepEqual(urls(gallery('<img src="/front-small.jpg"><img src="/front-large.jpg"><picture><img srcset="/front-small.jpg 400w, /front-large.jpg 1800w"></picture>')),
  ['https://shop.example/front-large.jpg'], 'Later responsive associations merge earlier copies');

assert.deepEqual(urls('', [{ src: '/small.jpg', group_id: 7, width: 400, height: 300 }, { src: '/big.jpg', group_id: 7, width: 1800, height: 1350 }]),
  ['https://shop.example/big.jpg'], 'Parsed responsive media groups retain their best supplied source');
for (const media of [undefined, null, {}, [null, {}, { src: 42 }]]) assert.deepEqual(extract('', media), []);
assert.deepEqual(urls(gallery('<img src="{{product.image}}"><img src="data:image/png;base64,a"><img src="javascript:alert(1)"><img src="http://127.0.0.1/a.jpg"><img src="https://user:pass@cdn.example.com/a.jpg"><img src="http://service.local/a.jpg">')), []);
assert.deepEqual(urls('<section class="product-gallery"><img data-src="/valid.jpg"><picture><img srcset="broken 0w"></section>'), ['https://shop.example/valid.jpg']);
assert.equal(extract(gallery('<img src="/main.jpg">') + '<section class="related-carousel"><img src="/other.jpg"></section>').length, 2,
  'Unrelated galleries remain separate for product selection');
console.log('Product image checks passed: complete Samsung carousel, source ranking, lazy/responsive images, grouping, signatures and URL boundaries.');
