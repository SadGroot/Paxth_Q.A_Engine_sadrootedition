import { DomUtils, parseDocument } from 'htmlparser2';
import parseSrcset from 'parse-srcset';
import { validateScrapeInput } from './scrapeNetwork';

export type GalleryImage = { identity: string; url: string; alt: string };
export type ImageGallery = { id: string; label: string; images: GalleryImage[] };
type Candidate = GalleryImage & { area: number; density: number; quality: number; original: boolean; zoom: boolean; thumbnail: boolean };
type Element = ReturnType<typeof DomUtils.findAll>[number];

const sourceAttributes = ['src', 'data-src', 'data-lazy-src', 'data-desktop-src', 'data-mobile-src',
  'data-original', 'data-original-src', 'data-full', 'data-full-src', 'data-large-image', 'data-large_image', 'data-zoom-image', 'data-zoom-src'];
const sizeParameters = ['w', 'width', 'h', 'height', 'q', 'quality', 'dpr', 'fm', 'format'];
const positive = (value: unknown) => Number.isFinite(Number(value)) && Number(value) > 0 ? Number(value) : 0;
const description = (element: Element) => [element.attribs.id, element.attribs.class, element.attribs['aria-label'], element.attribs['aria-roledescription']].filter(Boolean).join(' ');

function better(candidate: Candidate, previous: Candidate) {
  if (candidate.original !== previous.original) return candidate.original;
  if (candidate.area && previous.area) {
    if (candidate.area !== previous.area) return candidate.area > previous.area;
    if (candidate.quality && previous.quality && candidate.quality !== previous.quality) return candidate.quality > previous.quality;
    return candidate.zoom && !previous.zoom;
  }
  if (candidate.zoom !== previous.zoom) return candidate.zoom;
  return candidate.area > previous.area || (!candidate.area && !previous.area && candidate.density > previous.density);
}

export function extractImageGalleries(html: unknown, media: unknown, baseUrl: string): ImageGallery[] {
  const galleries = new Map<Element | string, { label: string; keys: string[] }>();
  const images = new Map<string, Candidate>();
  const aliases = new Map<string, string>();
  const keyFor = (key: string): string => {
    let root = key;
    const path: string[] = [];
    while (aliases.has(root)) { path.push(root); root = aliases.get(root)!; }
    for (const parent of path) aliases.set(parent, root);
    return root;
  };
  const seenHtml = new Set<string>();

  const candidate = (raw: unknown, alt: string, attributes: Record<string, unknown>, kind = 'src', density = 0, width = 0): Candidate | null => {
    if (typeof raw !== 'string' || !raw.trim() || /\{\{|\}\}/.test(raw)) return null;
    let url: URL;
    try { url = new URL(validateScrapeInput({ url: new URL(raw, baseUrl).href }).url); }
    catch { return null; }
    const zoom = /zoom/.test(kind) || Boolean(attributes.zoom);
    let height = 0;
    const samsung = url.hostname === 'images.samsung.com' && url.pathname.startsWith('/is/image/');
    const dimensions = samsung ? url.search.match(/^\?\$(?:Q\d+_)?(\d+)_(\d+|N)(?:_F)?_(?:PNG|JPG)\$(?:&|$)/) : null;
    const originalToken = samsung ? url.search.match(/^\?\$ORIGIN_(?:PNG|JPG)\$(?:&|$)/) : null;
    const lazyToken = samsung ? url.search.match(/^\?\$LazyLoad_Home_(?:PNG|JPG)\$(?:&|$)/) : null;
    const original = /original|full|large/.test(kind) || Boolean(originalToken);
    if (dimensions) { width = positive(dimensions[1]); height = positive(dimensions[2]); }
    else {
      width ||= positive(url.searchParams.get('w') || url.searchParams.get('width')) || positive(attributes.width) * (density || 1);
      height = positive(url.searchParams.get('h') || url.searchParams.get('height')) || positive(attributes.height) * (density || 1);
    }
    const identity = new URL(url.href);
    const transform = dimensions || originalToken || lazyToken;
    if (transform) identity.search = identity.search.slice(transform[0].length).replace(/^([^?])/, '?$1');
    else for (const parameter of sizeParameters) {
      const value = identity.searchParams.get(parameter);
      if (positive(value) || (['fm', 'format'].includes(parameter) && /^(?:auto|jpe?g|png|webp|avif)$/i.test(value || ''))) identity.searchParams.delete(parameter);
    }
    const quality = positive(url.searchParams.get('q') || url.searchParams.get('quality') || (samsung && url.search.match(/^\?\$Q(\d+)_/)?.[1]));
    return { identity: identity.href, url: url.href, alt, area: width * (height || width), density, quality,
      original, zoom, thumbnail: Boolean(attributes.thumbnail) || /(?:^|[-_/])thumb(?:nail)?(?:[-_/]|$)/i.test(url.pathname) };
  };

  const add = (group: Element | string, label: string, variants: Candidate[]) => {
    if (!variants.length) return;
    const key = keyFor(variants[0].identity);
    let best = images.get(key) || variants[0];
    for (const variant of variants) {
      const otherKey = keyFor(variant.identity), previous = images.get(otherKey);
      if (previous && better(previous, best)) best = previous;
      if (better(variant, best)) best = variant;
      if (otherKey !== key) { aliases.set(otherKey, key); images.delete(otherKey); }
    }
    images.set(key, best);
    if (!galleries.has(group)) galleries.set(group, { label, keys: [] });
    galleries.get(group)!.keys.push(key);
  };

  const dom = parseDocument(typeof html === 'string' ? html : '');
  for (const image of DomUtils.findAll(element => element.name === 'img', dom.children)) {
    let gallery: Element | undefined, zoom = false, thumbnail = false;
    for (let parent = image.parent; parent && parent.type === 'tag'; parent = parent.parent) {
      const context = description(parent);
      if (/gallery|carousel|swiper|slider/i.test(context)) gallery = parent;
      zoom ||= /(?:^|[\s_-])zoom(?:[\s_-]|$)/i.test(context);
      thumbnail ||= /thumb(?:nail)?|(?:^|[\s_-])dots(?:[\s_-]|$)/i.test(context);
    }
    if (!gallery) continue;
    const alt = image.attribs.alt || '';
    const attributes = { ...image.attribs, zoom, thumbnail };
    const variants: Candidate[] = [];
    const collect = (element: Element) => {
      for (const name of sourceAttributes) {
        const value = candidate(element.attribs[name], alt, attributes, name);
        if (value) variants.push(value);
      }
      for (const name of ['srcset', 'data-srcset']) {
        if (!element.attribs[name]) continue;
        for (const source of parseSrcset(element.attribs[name])) {
          const value = candidate(source.url, alt, attributes, name, positive(source.d), positive(source.w));
          if (value) variants.push(value);
        }
      }
    };
    collect(image);
    if (image.parent?.type === 'tag' && image.parent.name === 'picture') {
      for (const source of DomUtils.findAll(element => element.name === 'source', image.parent.children)) collect(source);
    }
    for (let parent = image.parent; parent && parent.type === 'tag' && parent !== gallery; parent = parent.parent) {
      if (parent.name !== 'a') continue;
      const href = parent.attribs.href;
      if (href && !href.startsWith('#') && (/\.(?:jpe?g|png|webp|avif|gif)(?:[?#]|$)/i.test(href) || /zoom|original|full/i.test(description(parent)))) {
        const value = candidate(href, alt, attributes, 'original');
        if (value) variants.push(value);
      }
      break;
    }
    for (const variant of variants) seenHtml.add(variant.identity);
    add(gallery || variants[0]?.identity, gallery ? description(gallery) : alt, variants);
  }

  const mediaGroups = new Map<string, { label: string; variants: Candidate[] }>();
  for (const image of Array.isArray(media) ? media : []) {
    if (!image || typeof image !== 'object') continue;
    const value = candidate(image.src, typeof image.alt === 'string' ? image.alt : '', image);
    if (!value) continue;
    if (seenHtml.has(value.identity)) {
      const key = keyFor(value.identity), previous = images.get(key);
      if (previous && better(value, previous)) images.set(key, value);
    } else {
      const group = Number.isSafeInteger(image.group_id) && image.group_id >= 0 ? `media-${image.group_id}` : value.identity;
      if (!mediaGroups.has(group)) mediaGroups.set(group, { label: typeof image.desc === 'string' ? image.desc : value.alt, variants: [] });
      mediaGroups.get(group)!.variants.push(value);
    }
  }
  for (const [group, { label, variants }] of mediaGroups) add(group, label, variants);

  const result: ImageGallery[] = [], seenGalleries = new Set<string>();
  for (const gallery of galleries.values()) {
    const keys = [...new Set(gallery.keys.map(keyFor))];
    let selected = keys.map(key => ({ ...images.get(key)!, identity: key }));
    // shortcut: thumbnail controls are redundant for full zoom galleries, add a site adapter if unique slides exist only as thumbnails.
    if (selected.some(image => image.zoom && !image.thumbnail)) selected = selected.filter(image => !image.thumbnail);
    const signature = selected.map(image => image.identity).sort().join('\n');
    if (!selected.length || seenGalleries.has(signature)) continue;
    seenGalleries.add(signature);
    result.push({ id: `gallery-${result.length + 1}`, label: gallery.label,
      images: selected.map(({ identity, url, alt }) => ({ identity, url, alt })) });
  }
  return result;
}
