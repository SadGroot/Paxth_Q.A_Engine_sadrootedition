
import { useState, useCallback, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { scrapeCatalogSku } from '../lib/scrapeRequest';
import type { CatalogState, JobType } from '../types';

export type QAStatus = "pending" | "ready" | "cannot_qa" | "running" | "completed" | "failed";

export interface SkuData {
  sku: string;
  revision?: number;
  upload_attributes: Record<string, any>;
  source: {
    sap?: string;
    url?: string;
    fileName?: string;
    headerOrder?: string[];
  };
  raw_row: Record<string, any>;
  status: QAStatus;
  attribute_set?: string;
  scraped_markdown?: string;
  scrape_status?: "success" | "failed" | "skipped_no_url";
  scrape_metadata?: {
    method: 'cloud' | 'browser' | 'manual' | 'legacy';
    requestedUrl: string | null;
    finalUrl: string | null;
    capturedAt: string | null;
    receivedAt?: string;
    crawler?: 'crawl4ai';
    modelName?: string;
  } | null;
  scrape_error?: string | null;
  qa_stale?: boolean;
  tokensUsed?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  timeTaken?: number;
  error?: string | null;
  qa_result?: Record<string, any>;
  export_data?: Record<string, any>;
  last_job_id?: string;
  catalog_state?: CatalogState | null;
}

export function useCatalogData(enabled = true, sessionKey?: string, request: typeof api = api) {
  const [skuDataList, setSkuDataList] = useState<SkuData[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [catalogError, setCatalogError] = useState("");
  const generation = useRef(0);
  const refreshSerial = useRef(0);
  const refreshCatalog = useCallback(async () => {
    if (!enabled) return;
    const current = generation.current;
    const serial = ++refreshSerial.current;
    const rows = await request<SkuData[]>('/api/catalog');
    if (current === generation.current && serial === refreshSerial.current) {
      setSkuDataList(previous => {
        const known = new Map(previous.map(row => [row.sku, row]));
        return rows.map(row => {
          const saved = known.get(row.sku);
          return saved && (saved.revision ?? 0) > (row.revision ?? 0) ? saved : row;
        });
      });
      setCatalogError("");
    }
  }, [enabled, sessionKey, request]);
  const resetCatalog = useCallback(() => { generation.current++; setSkuDataList([]); }, [request]);
  useEffect(() => {
    generation.current++;
    if (!enabled) { setSkuDataList([]); setCatalogError(""); setIsLoading(false); return; }
    let active = true;
    setSkuDataList([]); setCatalogError("");
    setIsLoading(true);
    refreshCatalog().catch(error => { if (active) setCatalogError(error.message); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; generation.current++; };
  }, [enabled, refreshCatalog]);

  const addParsedData = useCallback(async (data: SkuData[], mode: JobType = 'qa') => {
    const current = generation.current;
    try {
      const result = await request<{inserted: SkuData[]; skipped: string[]}>(mode === 'catalog' ? '/api/catalog?mode=catalog' : '/api/catalog', { method:'POST', body:JSON.stringify(data) });
      if (current !== generation.current) return null;
      refreshSerial.current++;
      setSkuDataList(previous => {
        const rows = new Map(previous.map(item => [item.sku,item]));
        result.inserted.forEach(item => rows.set(item.sku,item));
        return [...rows.values()];
      });
      setCatalogError("");
      return result;
    } catch (error) { if (current === generation.current) setCatalogError((error as Error).message); return null; }
  }, [request]);
  const updateSku = useCallback(async (sku: string, updates: Partial<SkuData>, expectedRevision?: number): Promise<boolean> => {
    const current = generation.current;
    try {
      const revision = expectedRevision ?? skuDataList.find(item => item.sku === sku)?.revision ?? 0;
      const saved = await request<SkuData>(`/api/catalog/${encodeURIComponent(sku)}`, { method:'PUT', body:JSON.stringify({...updates, expectedRevision: revision}) });
      if (current !== generation.current) return false;
      refreshSerial.current++;
      setSkuDataList(previous => previous.map(item => item.sku === sku && (saved.revision ?? 0) > (item.revision ?? 0) ? saved : item));
      setCatalogError("");
      return true;
    } catch (error) {
      if (current === generation.current) await refreshCatalog().catch(() => {});
      if (current === generation.current) setCatalogError((error as Error).message);
      return false;
    }
  }, [skuDataList, refreshCatalog, request]);
  const scrapeSku = useCallback(async (sku: SkuData, signal?: AbortSignal): Promise<SkuData> => {
    const current = generation.current;
    try {
      const saved = await scrapeCatalogSku(sku, signal, request);
      if (current === generation.current) {
        refreshSerial.current++;
        setSkuDataList(previous => previous.map(item => item.sku === saved.sku && (saved.revision ?? 0) > (item.revision ?? 0) ? saved : item));
        setCatalogError("");
      }
      return saved;
    } catch (error) {
      if (current === generation.current) await refreshCatalog().catch(() => {});
      if (current === generation.current && !signal?.aborted) setCatalogError((error as Error).message);
      throw error;
    }
  }, [refreshCatalog, request]);
  const removeSkus = useCallback(async (skus: string[]) => {
    const current = generation.current;
    try {
      await request('/api/catalog', { method:'DELETE', body:JSON.stringify({skus}) });
      if (current !== generation.current) return false;
      refreshSerial.current++;
      setSkuDataList(previous => previous.filter(item => !skus.includes(item.sku)));
      setCatalogError("");
      return true;
    } catch (error) { if (current === generation.current) setCatalogError((error as Error).message); return false; }
  }, [request]);
  const ingestSkuFile = useCallback(async (sku: SkuData, file: File): Promise<SkuData> => {
    const current = generation.current;
    try {
      if (!/\.(pdf|xlsx|xls)$/i.test(file.name)) throw new Error('Choose a PDF, .xlsx, or .xls file.');
      if (!file.size) throw new Error('The file is empty.');
      if (file.size > 10 * 1024 * 1024) throw new Error('Files must be 10 MiB or smaller.');
      const dataBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(',')[1]);
        reader.onerror = () => reject(new Error('Could not read the selected file.'));
        reader.readAsDataURL(file);
      });
      if (current !== generation.current) throw new Error('Your session changed. Select the file again.');
      const saved = await request<SkuData>(`/api/catalog/${encodeURIComponent(sku.sku)}/ingest`, {
        method: 'POST', body: JSON.stringify({ expectedRevision: sku.revision ?? 0, fileName: file.name, dataBase64 }),
      });
      if (current === generation.current) {
        refreshSerial.current++;
        setSkuDataList(previous => previous.map(item => item.sku === saved.sku && (saved.revision ?? 0) > (item.revision ?? 0) ? saved : item));
        setCatalogError('');
      }
      return saved;
    } catch (error) {
      if (current === generation.current) {
        await refreshCatalog().catch(() => {});
        setCatalogError((error as Error).message);
      }
      throw error;
    }
  }, [refreshCatalog, request]);
  return { skuDataList, addParsedData, updateSku, scrapeSku, ingestSkuFile, removeSkus, resetCatalog, refreshCatalog, isLoading, catalogError };
}
