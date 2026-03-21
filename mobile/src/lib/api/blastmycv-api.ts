import { useAuthStore } from '../state/auth-store';
import type { User } from '../state/auth-store';
import type { Package, Application, JobListing } from '../types/blastmycv';

const BLASTMYCV_API_BASE = 'https://blastmycv.com/api';
const INTERNAL_API_BASE = process.env.EXPO_PUBLIC_BACKEND_URL;

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Extracts cookie name=value pairs from Set-Cookie header (strips attributes like Path, HttpOnly, etc.)
function extractCookies(setCookieHeader: string): string {
  return setCookieHeader
    .split(/,(?=[^;]+=[^;]+)/)
    .map((part) => part.split(';')[0].trim())
    .filter(Boolean)
    .join('; ');
}

async function request<T>(
  baseUrl: string,
  path: string,
  method: Method,
  body?: unknown,
  requiresAuth = false,
  isMultipart = false
): Promise<T> {
  const sessionCookie = useAuthStore.getState().sessionCookie;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }

  if (sessionCookie && requiresAuth) {
    headers['Cookie'] = sessionCookie;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: isMultipart
      ? (body as FormData)
      : body
      ? JSON.stringify(body)
      : undefined,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || error.error || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// ─── Public API ───────────────────────────────────────────────────────────────
export const publicAPI = {
  get: <T>(path: string) => request<T>(BLASTMYCV_API_BASE, path, 'GET', undefined, false),
  post: <T>(path: string, body: unknown) => request<T>(BLASTMYCV_API_BASE, path, 'POST', body, false),
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

// POST /auth/login
export async function loginUser(email: string, password: string): Promise<{ sessionCookie: string; user: User }> {
  const response = await fetch(`${BLASTMYCV_API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Invalid email or password.' }));
    throw new Error(error.message || error.error || 'Login failed');
  }

  // Extract PHP session cookie from response headers
  const rawCookie = response.headers.get('set-cookie') ?? '';
  const sessionCookie = rawCookie ? extractCookies(rawCookie) : '';

  // Fetch current user profile using the fresh cookie
  const meResponse = await fetch(`${BLASTMYCV_API_BASE}/auth/me`, {
    headers: {
      Accept: 'application/json',
      ...(sessionCookie ? { Cookie: sessionCookie } : {}),
    },
    credentials: 'include',
  });

  const user: User = await meResponse.json();

  // Normalise name field
  if (!user.name && (user.firstName || user.lastName)) {
    user.name = [user.firstName, user.lastName].filter(Boolean).join(' ');
  }

  return { sessionCookie, user };
}

// POST /auth/register
export async function registerUser(data: {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  cvFile?: { uri: string; name: string; type: string };
}): Promise<{ sessionCookie: string; user: User }> {
  let response: Response;

  if (data.cvFile) {
    // Multipart when CV file is attached
    const form = new FormData();
    form.append('email', data.email);
    form.append('password', data.password);
    form.append('confirmPassword', data.confirmPassword);
    form.append('firstName', data.firstName);
    form.append('lastName', data.lastName);
    form.append('phone', data.phone);
    form.append('cv', { uri: data.cvFile.uri, name: data.cvFile.name, type: data.cvFile.type } as unknown as Blob);

    response = await fetch(`${BLASTMYCV_API_BASE}/auth/register`, {
      method: 'POST',
      body: form,
      credentials: 'include',
    });
  } else {
    response = await fetch(`${BLASTMYCV_API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      }),
      credentials: 'include',
    });
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Registration failed.' }));
    throw new Error(error.message || error.error || 'Registration failed');
  }

  const rawCookie = response.headers.get('set-cookie') ?? '';
  const sessionCookie = rawCookie ? extractCookies(rawCookie) : '';

  const meResponse = await fetch(`${BLASTMYCV_API_BASE}/auth/me`, {
    headers: {
      Accept: 'application/json',
      ...(sessionCookie ? { Cookie: sessionCookie } : {}),
    },
    credentials: 'include',
  });

  const user: User = await meResponse.json();
  if (!user.name && (user.firstName || user.lastName)) {
    user.name = [user.firstName, user.lastName].filter(Boolean).join(' ');
  }

  return { sessionCookie, user };
}

// POST /auth/logout
export async function logoutUser(): Promise<void> {
  const sessionCookie = useAuthStore.getState().sessionCookie;
  await fetch(`${BLASTMYCV_API_BASE}/auth/logout`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      ...(sessionCookie ? { Cookie: sessionCookie } : {}),
    },
    credentials: 'include',
  }).catch(() => {
    // Ignore errors — we clear local session regardless
  });
}

// GET /packages — confirmed live
export async function getPackages(): Promise<Package[]> {
  return publicAPI.get<Package[]>('/packages');
}

// GET /auth/me — confirmed
export async function getProfile(): Promise<User> {
  return blastAPI.get<User>('/auth/me');
}

// GET /applications — TODO: confirm response shape
export async function getApplications(): Promise<Application[]> {
  return blastAPI.get<Application[]>('/applications');
}

// GET /jobs — TODO: confirm response shape
export async function getJobs(params?: { search?: string; type?: string }): Promise<JobListing[]> {
  const query = params
    ? '?' + new URLSearchParams(params as Record<string, string>).toString()
    : '';
  return blastAPI.get<JobListing[]>(`/jobs${query}`);
}
