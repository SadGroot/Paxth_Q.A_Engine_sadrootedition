import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import type { SkuData } from '../hooks/useCatalogData';
import { api } from '../lib/api';
import { catalogImageFilename, catalogImagePath, catalogImages } from '../lib/catalogImages';
import { prepareCatalogImage } from '../lib/catalogImageExport';

function ImageOption({ path, alt, filename, order, disabled, onToggle }: {
  path: string; alt: string; filename: string; order: number; disabled: boolean; onToggle: () => void;
}) {
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let objectUrl = '';
    setPreview(''); setError('');
    prepareCatalogImage(path, controller.signal).then(blob => {
      if (!controller.signal.aborted) { objectUrl = URL.createObjectURL(blob); setPreview(objectUrl); }
    }).catch(error => { if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'Image unavailable.'); });
    return () => { controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [path, attempt]);
  return <div className="space-y-2">
    <button type="button" aria-label={alt} aria-pressed={order > 0} onClick={onToggle}
      disabled={disabled || (!preview && !order)} className={`w-full border-2 rounded-sm overflow-hidden text-left disabled:opacity-60 ${order ? 'border-emerald-700' : 'border-[#E5E2DE]'}`}>
      <div className="aspect-square bg-white flex items-center justify-center">
        {preview ? <img src={preview} alt={alt} className="w-full h-full" /> : <span className="p-3 text-xs">{error ? 'Image unavailable' : 'Preparing image…'}</span>}
      </div>
      <p className="p-2 text-xs break-all">{order ? `${order}. ${filename}` : 'Click to select'}</p>
    </button>
    {error && <div role="alert" className="text-xs text-red-700">
      {error} <button type="button" disabled={disabled} className="underline" onClick={() => setAttempt(value => value + 1)}>Retry image</button>
    </div>}
  </div>;
}

export function CatalogImagePicker({ runId, sku, selectedImageUrls, onSaved, onClose }: {
  runId: string; sku: SkuData; selectedImageUrls: string[]; onSaved: (urls: string[]) => void; onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const images = catalogImages(sku);
  const [selected, setSelected] = useState(() => selectedImageUrls.filter(url => images.some(image => image.url === url)));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { dialog.current?.showModal(); }, []);
  const save = async () => {
    setSaving(true); setError('');
    try {
      const result = await api<{ selectedImageUrls: string[] }>(catalogImagePath(runId, sku.sku), {
        method: 'PUT', body: JSON.stringify({ selectedImageUrls: selected, expectedSelectedImageUrls: selectedImageUrls }),
      });
      onSaved(result.selectedImageUrls);
      dialog.current?.close();
    } catch (error) { setError(error instanceof Error ? error.message : 'Could not save image selections.'); }
    finally { setSaving(false); }
  };
  return <dialog ref={dialog} aria-labelledby="catalog-images-title" onClose={onClose} onCancel={event => { if (saving) event.preventDefault(); }}
    className="m-auto w-[min(95vw,1100px)] max-h-[90vh] bg-white p-0 rounded-sm border border-[#E5E2DE] backdrop:bg-black/50">
    <div className="p-5 border-b border-[#E5E2DE] flex items-center justify-between gap-3">
      <div><h3 id="catalog-images-title" className="font-serif text-2xl">Images for {sku.sku}</h3>
        <p className="text-sm text-[#8C8882] mt-1">1500 × 1500 JPG · white canvas · 150 px padding · white/transparent margins trimmed</p>
        <p className="text-sm mt-1">Click images in the order you want: {sku.sku}-1, {sku.sku}-2, and so on. Deselecting renumbers the remaining images.</p>
      </div>
      <button type="button" aria-label="Close image picker" disabled={saving} onClick={() => dialog.current?.close()} className="p-2"><X className="w-5 h-5" /></button>
    </div>
    <div className="p-5 space-y-4">
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      {!images.length && <p>No images were found in this SKU’s saved markdown.</p>}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => {
          const order = selected.indexOf(image.url) + 1;
          return <ImageOption key={image.url} path={catalogImagePath(runId, sku.sku, index)} alt={image.alt || `Image ${index + 1} for ${sku.sku}`}
            filename={order ? catalogImageFilename(sku.sku, order) : ''} order={order} disabled={saving}
            onToggle={() => setSelected(previous => previous.includes(image.url) ? previous.filter(url => url !== image.url) : [...previous, image.url])} />;
        })}
      </div>
    </div>
    <div className="sticky bottom-0 bg-white p-5 border-t border-[#E5E2DE] flex items-center justify-between gap-3">
      <span className="text-sm">{selected.length} selected</span>
      <div className="flex gap-3">
        <button type="button" disabled={saving || !selected.length} onClick={() => setSelected([])} className="px-3 py-2 text-sm border rounded-sm disabled:opacity-50">Clear selection</button>
        <button type="button" disabled={saving} onClick={save} className="px-4 py-2 text-sm bg-[#1A1A1A] text-white rounded-sm disabled:opacity-50">{saving ? 'Saving…' : 'Save selections'}</button>
      </div>
    </div>
  </dialog>;
}
