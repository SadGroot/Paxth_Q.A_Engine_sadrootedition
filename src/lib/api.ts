import type { ScrapeReport } from './cloudScrape';

export class ApiError extends Error {
  constructor(message: string, public status: number, public code?: string, public report?: ScrapeReport) { super(message); }
}

export async function api<T>(path: string, init: RequestInit = {}, workspaceId?: string): Promise<T> {
  init.signal?.throwIfAborted();
  const response = await fetch(path, {
    ...init,
    credentials: 'same-origin',
    headers: { ...(workspaceId ? { 'X-Workspace-Id': workspaceId } : {}), ...(init.body ? { 'Content-Type': 'application/json' } : {}), ...init.headers },
  });
  const data = await response.json().catch(() => null);
  init.signal?.throwIfAborted();
  if (!response.ok) {
    if (response.status === 401 && !['/api/auth/login', '/api/auth/me'].includes(path) && typeof window !== 'undefined') window.dispatchEvent(new Event('session-expired'));
    throw new ApiError(data?.error || `Request failed (${response.status}).`, response.status, data?.code, data?.report);
  }
  return data as T;
}
