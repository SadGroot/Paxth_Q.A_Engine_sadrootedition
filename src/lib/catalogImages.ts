import { fromMarkdown } from 'mdast-util-from-markdown';
import { DomUtils, parseDocument } from 'htmlparser2';
import type { RootContent } from 'mdast';
import type { SkuData } from '../hooks/useCatalogData';
import { evidenceUrl, usableScrapedMarkdown } from './scrapeEvidence';

export type CatalogImage = { url: string; alt: string };

export function catalogImages(sku: SkuData): CatalogImage[] {
  const root = fromMarkdown(usableScrapedMarkdown(sku));
  const definitions = new Map(root.children.filter(node => node.type === 'definition').map(node => [node.identifier, node.url]));
  const images = new Map<string, CatalogImage>();
  const base = evidenceUrl(sku.scrape_metadata?.finalUrl || sku.source?.url) || undefined;
  const add = (value: string, alt = '') => {
    if (!value.trim()) return;
    try {
      const url = new URL(value, base);
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return;
      url.hash = '';
      if (!images.has(url.href)) images.set(url.href, { url: url.href, alt });
    } catch { /* Ignore non-URL image sources. */ }
  };
  const visit = (node: RootContent, inGallery: boolean) => {
    if (node.type === 'image') add(node.url, node.alt || '');
    if (node.type === 'imageReference') add(definitions.get(node.identifier) || '', node.alt || '');
    if (node.type === 'link' && (inGallery || /\.(?:jpe?g|png|webp|avif|gif)(?:[?#]|$)/i.test(node.url))) add(node.url);
    if (node.type === 'linkReference' && inGallery) add(definitions.get(node.identifier) || '');
    if (node.type === 'html') {
      const dom = parseDocument(node.value);
      for (const img of DomUtils.findAll(element => element.name === 'img', dom.children)) add(img.attribs.src || '', img.attribs.alt || '');
    }
    if ('children' in node) for (const child of node.children) visit(child as RootContent, inGallery);
  };
  let galleryDepth = 0;
  for (const node of root.children) {
    if (node.type === 'heading') {
      if (galleryDepth && node.depth <= galleryDepth) galleryDepth = 0;
      if (node.children.map(child => 'value' in child ? child.value : '').join('').trim().toLowerCase() === 'product images') galleryDepth = node.depth;
    }
    const sourceFooter = node.type === 'paragraph' && node.children[0]?.type === 'text' && /^(?:Source|Retrieved URL):/.test(node.children[0].value);
    visit(node, Boolean(galleryDepth) && !sourceFooter);
  }
  return [...images.values()];
}

export const CATALOG_IMAGE_SIZE = 1500;
export const CATALOG_IMAGE_PADDING = 150;

// shortcut: only white/transparent outer margins are trimmed, use segmentation if colored backgrounds must be removed.
export function catalogImageContentBounds(pixels: Uint8ClampedArray, width: number, height: number) {
  let left = width, top = height, right = -1, bottom = -1;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const index = (y * width + x) * 4;
    if (pixels[index + 3] <= 5 || pixels[index] >= 250 && pixels[index + 1] >= 250 && pixels[index + 2] >= 250) continue;
    left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y);
  }
  return right < left ? { x: 0, y: 0, width, height } : { x: left, y: top, width: right - left + 1, height: bottom - top + 1 };
}

export function catalogImagePlacement(width: number, height: number) {
  if (!(width > 0 && height > 0)) throw new Error('The image has no usable dimensions.');
  const scale = (CATALOG_IMAGE_SIZE - 2 * CATALOG_IMAGE_PADDING) / Math.max(width, height);
  const w = width * scale, h = height * scale;
  return { x: (CATALOG_IMAGE_SIZE - w) / 2, y: (CATALOG_IMAGE_SIZE - h) / 2, width: w, height: h };
}

export function catalogImageFilename(sku: string, order: number) {
  const name = sku.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').replace(/[. ]+$/g, '').trim() || 'SKU';
  return `${name}-${order}.jpg`;
}

export const catalogImagePath = (runId: string, sku: string, index?: number) =>
  `/api/job-runs/${encodeURIComponent(runId)}/items/${encodeURIComponent(sku)}/images${index === undefined ? '' : `/${index}`}`;
