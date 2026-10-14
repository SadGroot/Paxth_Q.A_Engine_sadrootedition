import JSZip from 'jszip';
import { CATALOG_IMAGE_SIZE, catalogImageContentBounds, catalogImageFilename, catalogImagePath, catalogImagePlacement, catalogImages } from './catalogImages';
import type { SkuData } from '../hooks/useCatalogData';

export async function prepareCatalogImage(path: string, signal?: AbortSignal): Promise<Blob> {
  const response = await fetch(path, { credentials: 'same-origin', signal: AbortSignal.any([AbortSignal.timeout(35_000), ...(signal ? [signal] : [])]) });
  if (!response.ok) {
    if (response.status === 401) window.dispatchEvent(new Event('session-expired'));
    const error = await response.json().catch(() => null);
    throw new Error(error?.error || `Could not load image (${response.status}).`);
  }
  const bitmap = await createImageBitmap(await response.blob());
  try {
    signal?.throwIfAborted();
    const canvas = document.createElement('canvas');
    const scanScale = Math.min(1, CATALOG_IMAGE_SIZE / Math.max(bitmap.width, bitmap.height));
    canvas.width = Math.max(1, Math.round(bitmap.width * scanScale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scanScale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Image preparation is unavailable in this browser.');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const bounds = catalogImageContentBounds(context.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height);
    const crop = { x: bounds.x * bitmap.width / canvas.width, y: bounds.y * bitmap.height / canvas.height,
      width: bounds.width * bitmap.width / canvas.width, height: bounds.height * bitmap.height / canvas.height };
    canvas.width = canvas.height = CATALOG_IMAGE_SIZE;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    const rect = catalogImagePlacement(crop.width, crop.height);
    context.drawImage(bitmap, crop.x, crop.y, crop.width, crop.height, rect.x, rect.y, rect.width, rect.height);
    return await new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not encode the image.')), 'image/jpeg', 0.95));
  } finally { bitmap.close(); }
}

export async function exportCatalogImages(runId: string, items: Array<{ sku: string; snapshot: SkuData; result?: SkuData; selectedImageUrls?: string[] }>,
  progress: (done: number, total: number) => void): Promise<Blob> {
  const files = items.flatMap(item => {
    const images = catalogImages(item.result || item.snapshot);
    return (item.selectedImageUrls || []).map((url, index) => {
      const sourceIndex = images.findIndex(image => image.url === url);
      if (sourceIndex < 0) throw new Error(`Saved image for ${item.sku} is no longer in this run's markdown. Reopen its images and save again.`);
      return { name: catalogImageFilename(item.sku, index + 1), path: catalogImagePath(runId, item.sku, sourceIndex) };
    });
  });
  if (!files.length) throw new Error('Select and save at least one image before exporting.');
  if (new Set(files.map(file => file.name.toLowerCase())).size !== files.length) throw new Error('Some SKU image filenames overlap. Export those SKUs in separate jobs.');
  const zip = new JSZip();
  progress(0, files.length);
  for (const [index, file] of files.entries()) {
    try {
      const blob = await prepareCatalogImage(file.path);
      zip.file(file.name, await blob.arrayBuffer());
    } catch (error) { throw new Error(`${file.name}: ${error instanceof Error ? error.message : 'Could not prepare image'}. No ZIP was downloaded.`); }
    progress(index + 1, files.length);
  }
  return zip.generateAsync({ type: 'blob' });
}
