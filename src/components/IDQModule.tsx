import { useEffect, useRef, useState } from 'react';
import { saveAs } from 'file-saver';
import { useAttributeSets } from '../hooks/useAttributeSets';
import { useAppContext } from '../context/AppContext';
import { IDQ_LIMITS, validateIdqInput, type IdqMapping, type IdqMode, type IdqResult, type IdqSheet } from '../lib/idq';
import { parseIdqWorkbook } from '../lib/idqUpload';

type Batch = { id: string; name: string; actorId: string; status: string; mode: IdqMode; modelName: string; createdAt: string; total: number; finished: number; error?: string };
type Detail = Batch & { mappings: IdqMapping[]; items: Array<{ position: number; sku?: string; url: string; attributeSet: string; status: string; stage: string; searches: number; reads: number; result: IdqResult; error?: string }> };
const active = (status: string) => ['queued','running','cancelling'].includes(status);
const statusText = (status: string) => status.replaceAll('_', ' ');
const button = 'border border-[#D7D3CD] px-4 py-2 text-sm rounded-sm hover:bg-[#F5F2EF] disabled:opacity-50';

export function IDQModule() {
  const { user, request: api, workspaceId, workspaceSignal } = useAppContext();
  const { attributeSets, isLoading, loadError } = useAttributeSets();
  const mode: IdqMode = 'research';
  const [sets, setSets] = useState<string[]>([]);
  const [sheets, setSheets] = useState<IdqSheet[] | null>(null);
  const [filename, setFilename] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<Batch[]>([]);
  const [selected, setSelected] = useState('');
  const [detail, setDetail] = useState<Detail | null>(null);
  const [historyError, setHistoryError] = useState('');
  const upload = useRef<HTMLInputElement>(null);
  const requestId = useRef(crypto.randomUUID());
  const canChange = Boolean(detail);
  const refresh = async () => {
    try { setHistory(await api<Batch[]>('/api/idq/jobs')); setHistoryError(''); }
    catch (e) { setHistoryError((e as Error).message); }
  };
  useEffect(() => {
    void refresh(); const timer = setInterval(() => void refresh(), 2500); return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!selected) { setDetail(null); return; }
    let disposed = false;
    const load = async () => { try { const data = await api<Detail>(`/api/idq/jobs/${selected}`); if (!disposed) { setDetail(data); setHistoryError(''); } } catch (e) { if (!disposed) setHistoryError((e as Error).message); } };
    void load(); const timer = setInterval(() => void load(), 2000);
    return () => { disposed = true; clearInterval(timer); };
  }, [selected]);
  const reset = () => { setSheets(null); setFilename(''); setError(''); requestId.current = crypto.randomUUID(); if (upload.current) upload.current.value = ''; };
  const download = async (path: string, file: string, init?: RequestInit) => {
    const response = await fetch(path, { credentials: 'same-origin', ...init, headers: { ...init?.headers, 'X-Workspace-Id': workspaceId }, signal: workspaceSignal });
    workspaceSignal.throwIfAborted();
    if (!response.ok) throw new Error((await response.json().catch(() => null))?.error || 'Download failed.');
    const blob = await response.blob();
    workspaceSignal.throwIfAborted();
    saveAs(blob, file);
  };
  const act = async (action: 'cancel' | 'resume') => {
    if (!detail) return; setBusy(true); setError('');
    try { setDetail(await api<Detail>(`/api/idq/jobs/${detail.id}/${action}`, { method: 'POST' })); await refresh(); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  let preview: ReturnType<typeof validateIdqInput> | null = null, validation = '';
  if (sheets) { try { preview = validateIdqInput(mode, sheets, attributeSets); } catch (e) { validation = (e as Error).message; } }
  return <section className="w-full overflow-y-auto p-8 space-y-6" aria-label="IDQ catalog enrichment">
    <div><h1 className="font-serif text-4xl">IDQ</h1><p className="mt-2 text-sm text-[#6B675F]">Upload existing product data. AI identifies each product, TinyFish researches it, and verified web values are compared with SAP before creating mapped upload rows. Up to {IDQ_LIMITS.products} products per batch.</p></div>
    {(error || loadError) && <p role="alert" className="text-red-700">{error || loadError}</p>}
    <fieldset disabled={busy || isLoading} className="bg-white border border-[#E5E2DE] p-6 space-y-4">
      <legend className="px-2 font-medium">New batch</legend>
        <p className="text-sm text-[#6B675F]">Include sku, an attribute set column, and product information such as title, bullets or specifications. Paste SAP data into source__sap. Product URLs are optional. Saved mapping rules and Catalog Output Headers determine each upload template.</p>
        <details><summary className="cursor-pointer text-sm">Download a template</summary>
          <div className="max-h-48 overflow-y-auto border p-3 my-2 grid sm:grid-cols-2 gap-2">
            {attributeSets.filter(s => s.catalogHeaders.length).map(set => <label key={set.id} className="flex gap-2 text-sm"><input type="checkbox" checked={sets.includes(set.id)} onChange={e => setSets(current => e.target.checked ? [...current, set.id] : current.filter(id => id !== set.id))} />{set.name}</label>)}
          </div>
          <button className={button} disabled={!sets.length} onClick={async () => { setError(''); try { await download('/api/idq/jobs/template', 'IDQ-template.xlsx', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ attributeSetIds: sets }) }); } catch (e) { setError((e as Error).message); } }}>Download selected templates</button>
        </details>
        <div><label htmlFor="idq-upload" className="block text-sm mb-1">Excel workbook (.xlsx or .xls)</label>
          <input id="idq-upload" type="file" ref={upload} accept=".xlsx,.xls" onChange={async event => {
            const file = event.target.files?.[0]; reset(); if (!file) return;
            if (file.size > 10 * 1024 * 1024) { setError('Upload a workbook smaller than 10 MiB.'); return; }
            try { const parsed = parseIdqWorkbook(await file.arrayBuffer()); setSheets(parsed); setFilename(file.name); setName(file.name.replace(/\.xlsx?$/i, '')); }
            catch { setError('Could not read this Excel workbook. Download a template and retry.'); }
          }} />
        </div>
        <div><label htmlFor="idq-name" className="block text-sm mb-1">Batch name</label><input id="idq-name" value={name} maxLength={200} className="border border-[#D7D3CD] p-2 w-full max-w-lg" onChange={e => { setName(e.target.value); requestId.current = crypto.randomUUID(); }} /></div>
        {validation && <p role="alert" className="text-red-700 text-sm">{validation}</p>}
        {preview && <p role="status" className="text-sm">{filename}: {preview.items.length} products across {preview.mappings.length} attribute sets. Original SAP text is preserved; verified web corrections are highlighted in Review.</p>}
        <p className="text-xs text-[#6B675F]">Each product has at most four searches and six research-page reads. A ten-minute deadline reserves the final 90 seconds for output. Unsupported replacements are flagged for review.</p>
        <button className="bg-[#36483C] text-white px-5 py-2 disabled:opacity-50" disabled={!preview || !name.trim()} onClick={async () => {
          setBusy(true); setError('');
          try { const job = await api<Detail>('/api/idq/jobs', { method: 'POST', body: JSON.stringify({ requestId: requestId.current, name, mode, sheets }) }); setSelected(job.id); setDetail(job); await refresh(); reset(); }
          catch (e) { setError((e as Error).message); } finally { setBusy(false); }
        }}>{busy ? 'Saving…' : 'Start enrichment'}</button>
    </fieldset>
    <div className="grid lg:grid-cols-[18rem_1fr] gap-6">
      <aside className="border border-[#E5E2DE] p-4 bg-white"><h2 className="font-serif text-xl mb-3">Batch history</h2>
        {historyError && <p role="alert" className="text-red-700 text-sm">{historyError}</p>}
        {!history.length && <p className="text-sm text-[#6B675F]">No IDQ batches yet.</p>}
        <ul className="space-y-2">{history.map(job => <li key={job.id}><button aria-pressed={job.id === selected} className={`text-left w-full p-3 rounded-sm ${job.id === selected ? 'bg-[#E8ECE6]' : 'hover:bg-[#F5F2EF]'}`} onClick={() => { setDetail(null); setSelected(job.id); }}>
          <span className="block font-medium break-words">{job.name}</span><span className="text-xs capitalize">{statusText(job.status)} · {job.finished}/{job.total}</span>
        </button></li>)}</ul>
      </aside>
      <div className="border border-[#E5E2DE] p-5 bg-white min-w-0">
        {selected && !detail && <p role="status">Loading batch…</p>}
        {!selected && <p className="text-sm text-[#6B675F]">Select a batch to view progress and download its workbook.</p>}
        {detail && <>
          <h2 className="font-serif text-2xl">{detail.name}</h2>
          <p role="status" aria-live="polite" className="my-2 text-sm capitalize">{statusText(detail.status)} · {detail.finished}/{detail.total} products · {detail.modelName}</p>
          <progress aria-label="Batch progress" max={detail.total || 1} value={detail.finished} className="w-full accent-[#36483C]" />
          <div className="flex flex-wrap gap-2 my-4">
            {canChange && active(detail.status) && <button className={button} disabled={busy || detail.status === 'cancelling'} onClick={() => void act('cancel')}>Cancel batch</button>}
            {canChange && ['cancelled','failed'].includes(detail.status) && <button className={button} disabled={busy} onClick={() => void act('resume')}>Resume unfinished products</button>}
            <button className={button} onClick={async () => { try { await download(`/api/idq/jobs/${detail.id}/export`, `IDQ-${detail.name.replace(/[^\w-]/g, '_')}.xlsx`); } catch (e) { setError((e as Error).message); } }}>Download workbook{active(detail.status) ? ' (partial)' : ''}</button>
            {detail.mode === 'research' && <button className={button} disabled={!detail.items.some(item => item.result?.readyForUpload && ['completed', 'needs_review'].includes(item.status))} onClick={async () => { try { await download(`/api/idq/jobs/${detail.id}/export?format=upload`, `IDQ-${detail.name.replace(/[^\w-]/g, '_')}-upload.xlsx`); } catch (e) { setError((e as Error).message); } }}>Download upload templates</button>}
          </div>
          <p className="text-xs mb-4">Green = added; amber = mismatch; red = missing mandatory. The review workbook includes idq_mismatches and original SAP text. Upload templates use the exact mapped headers and retain coloured mismatch cells with source comments.</p>
          {detail.error && <p role="alert">{detail.error}</p>}
          <div className="space-y-3">{detail.items.map(item => <details key={item.position} className="border-t border-[#E5E2DE] pt-3">
            <summary className="cursor-pointer text-sm"><span className="font-medium">{item.sku ? `SKU ${item.sku}` : `Row ${item.position + 1}`} · {item.attributeSet}</span> · {statusText(item.status)} · {item.stage} <span className="text-xs">({item.searches}/4 searches, {item.reads}/6 reads)</span></summary>
            {item.url && <a href={item.url} target="_blank" rel="noreferrer" className="block break-all underline text-sm my-2">{item.url}</a>}
            {item.error && <p className="text-red-700 text-sm">{item.error}</p>}
            {item.result && <div className="text-sm space-y-1">
              <p>{item.result.added.length} added values · {item.result.conflicts.length} conflicts</p>
              {!!item.result.missing.length && <p className="text-red-700">Missing mandatory: {item.result.missing.join(', ')}</p>}
              {!!item.result.conflicts.length && <p className="text-amber-800">Conflicts: {item.result.conflicts.join(', ')}</p>}
              <ul className="list-disc pl-5">{item.result.issues.map((issue, i) => <li key={i}>{issue}</li>)}</ul>
            </div>}
          </details>)}</div>
        </>}
      </div>
    </div>
  </section>;
}
