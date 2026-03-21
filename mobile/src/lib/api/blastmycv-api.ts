import { useAuthStore } from '../state/auth-store';
import type { User } from '../state/auth-store';

// ─── Base URLs ────────────────────────────────────────────────────────────────
// The real BlastMyCV API base. All confirmed endpoints are relative to this.
const BLASTMYCV_API_BASE = 'https://blastmycv.com/api';

// Internal Vibecode backend (local features only)
const INTERNAL_API_BASE = process.env.EXPO_PUBLIC_BACKEND_URL;

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

async function request<T>(
  baseUrl: string,
  path: string,
  method: Method,
  body?: unknown,
  requiresAuth = false
): Promise<T> {
  const token = useAuthStore.getState().token;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Only attach auth header when we have a real token (not demo token)
  if (token && token !== 'demo-token' && requiresAuth) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// ─── Public API (no auth required) ───────────────────────────────────────────
export const publicAPI = {
  get: <T>(path: string) => request<T>(BLASTMYCV_API_BASE, path, 'GET', undefined, false),
};

// ─── Authenticated API ────────────────────────────────────────────────────────
export const blastAPI = {
  get: <T>(path: string) => request<T>(BLASTMYCV_API_BASE, path, 'GET', undefined, true),
  post: <T>(path: string, body: unknown) => request<T>(BLASTMYCV_API_BASE, path, 'POST', body, true),
  put: <T>(path: string, body: unknown) => request<T>(BLASTMYCV_API_BASE, path, 'PUT', body, true),
  patch: <T>(path: string, body: unknown) => request<T>(BLASTMYCV_API_BASE, path, 'PATCH', body, true),
  delete: <T>(path: string) => request<T>(BLASTMYCV_API_BASE, path, 'DELETE', undefined, true),
};

// ─── Internal backend ─────────────────────────────────────────────────────────
export const internalAPI = {
  get: <T>(path: string) => request<T>(INTERNAL_API_BASE ?? '', path, 'GET', undefined, true),
  post: <T>(path: string, body: unknown) => request<T>(INTERNAL_API_BASE ?? '', path, 'POST', body, true),
};

// ─── CONFIRMED ENDPOINTS ──────────────────────────────────────────────────────

// GET /packages — confirmed live
import type { Package } from '../types/blastmycv';
export async function getPackages(): Promise<Package[]> {
  return publicAPI.get<Package[]>('/packages');
}

// ─── PENDING ENDPOINTS (add implementation when confirmed) ───────────────────

// POST /auth/login — TODO: confirm endpoint path + response shape
export async function loginUser(email: string, password: string): Promise<{ token: string; user: User }> {
  return request<{ token: string; user: User }>(BLASTMYCV_API_BASE, '/auth/login', 'POST', { email, password }, false);
}

// GET /auth/me — TODO: confirm endpoint path
export async function getProfile(): Promise<User> {
  return blastAPI.get<User>('/auth/me');
}

// GET /applications — TODO: confirm endpoint path + response shape
export async function getApplications(): Promise<import('../types/blastmycv').Application[]> {
  return blastAPI.get<import('../types/blastmycv').Application[]>('/applications');
}

// GET /jobs — TODO: confirm endpoint path + response shape
export async function getJobs(params?: { search?: string; type?: string }): Promise<import('../types/blastmycv').JobListing[]> {
  const query = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
  return blastAPI.get<import('../types/blastmycv').JobListing[]>(`/jobs${query}`);
}
