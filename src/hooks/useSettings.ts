import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { DEFAULT_SETTINGS, editableSettings, normalizeSettings, type AppSettings } from '../lib/providerSettings';
export { normalizeSettings, normalizeMaxTokens } from '../lib/providerSettings';
export type { AppSettings } from '../lib/providerSettings';
export function useSettings(workspaceId?: string, request: typeof api = api) {
  const endpoint = workspaceId ? '/api/workspace-provider-settings' : '/api/provider-settings';
  const [settings,setSettings]=useState(DEFAULT_SETTINGS);
  const [isMemoryLoading,setLoading]=useState(true);
  const [memoryError,setError]=useState('');
  useEffect(()=>{
    let active=true;
    try { localStorage.removeItem('qa-analyzer-settings'); } catch { /* Storage can be disabled. */ }
    request<AppSettings>(endpoint).then(value=>{if(active) setSettings(normalizeSettings(value));})
      .catch(error=>{if(active)setError(error.message);}).finally(()=>{if(active)setLoading(false);});
    return ()=>{active=false;};
  },[endpoint, request]);
  const saveSettings=async(value:AppSettings)=>{
    const fields = editableSettings(value);
    const { qaAgentMemory: _memory, ...modelFields } = fields;
    const saved=await request<AppSettings>(endpoint,{method:'PUT',body:JSON.stringify(workspaceId ? modelFields : fields)});
    setSettings(saved);setError('');
  };
  const resetOverrides = async () => { setSettings(await request<AppSettings>(endpoint, { method: 'DELETE' })); setError(''); };
  return {settings,saveSettings,resetOverrides,defaultSettings:DEFAULT_SETTINGS,isMemoryLoading,memoryError};
}
