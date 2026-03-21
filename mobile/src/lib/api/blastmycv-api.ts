import { useAuthStore } from '../state/auth-store';
import type { User } from '../state/auth-store';
import type {
  Package, CV, Order, Submission, Notification, UserProfile
} from '../types/blastmycv';

const BASE = 'https://blastmycv.com/api';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

function extractCookies(header: string): string {
  return header
    .split(/,(?=[^;]+=[^;]+)/)
    .map((p) => p.split(';')[0].trim())
    .filter(Boolean)
    .join('; ');
}

function getCookie(): string | null {
  return useAuthStore.getState().sessionCookie;
}

async function req<T>(
  path: string,
  method: Method,
  body?: unknown,
  auth = false,
  multipart = false
): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (!multipart) headers['Content-Type'] = 'application/json';
  const cookie = getCookie();
  if (auth && cookie) headers['Cookie'] = cookie;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: multipart ? (body as FormData) : body ? JSON.stringify(body) : undefined,
  });

  // Session expired
  if (res.status === 401 && auth) {
    useAuthStore.getState().logout();
    throw new Error('Session expired. Please sign in again.');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function loginUser(email: string, password: string): Promise<{ sessionCookie: string; user: User }> {
  // Step 1: POST /auth/login
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });

  console.log('[BlastMyCV] POST /auth/login status:', res.status);

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || 'Invalid email or password.');
  }

  // Step 2: Extract session cookie from response headers.
  // On iOS, NSURLSession may consume Set-Cookie before JS sees it — that's OK,
  // the cookie is stored in NSHTTPCookieStorage and sent automatically via credentials:'include'.
  const raw = res.headers.get('set-cookie') ?? '';
  const sessionCookie = raw ? extractCookies(raw) : '';
  console.log('[BlastMyCV] Session cookie extracted:', sessionCookie ? 'yes' : 'none (platform-managed)');

  // Step 3: GET /auth/me to confirm session and load user data
  const meHeaders: Record<string, string> = { Accept: 'application/json' };
  if (sessionCookie) meHeaders['Cookie'] = sessionCookie;

  const meRes = await fetch(`${BASE}/auth/me`, {
    method: 'GET',
    headers: meHeaders,
    credentials: 'include',
  });

  console.log('[BlastMyCV] GET /auth/me status:', meRes.status);

  if (!meRes.ok) {
    // Login worked but session not accessible — network/CORS issue
    throw new Error('Signed in but could not load your profile. Please try again.');
  }

  const user: User = await meRes.json();
  console.log('[BlastMyCV] User loaded:', user?.email ?? 'unknown');

  // Normalise name field
  if (!user.name && (user.firstName || user.lastName)) {
    user.name = [user.firstName, user.lastName].filter(Boolean).join(' ');
  }

  return { sessionCookie, user };
}

export async function registerUser(data: {
  email: string; password: string; confirmPassword: string;
  firstName: string; lastName: string; phone: string;
  cvFile?: { uri: string; name: string; type: string };
}): Promise<{ sessionCookie: string; user: User }> {
  let res: Response;
  if (data.cvFile) {
    const form = new FormData();
    Object.entries(data).forEach(([k, v]) => { if (k !== 'cvFile' && v) form.append(k, String(v)); });
    form.append('cv', { uri: data.cvFile.uri, name: data.cvFile.name, type: data.cvFile.type } as unknown as Blob);
    res = await fetch(`${BASE}/auth/register`, { method: 'POST', body: form, credentials: 'include' });
  } else {
    res = await fetch(`${BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email: data.email, password: data.password, confirmPassword: data.confirmPassword, firstName: data.firstName, lastName: data.lastName, phone: data.phone }),
      credentials: 'include',
    });
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || 'Registration failed.');
  }
  const raw = res.headers.get('set-cookie') ?? '';
  const sessionCookie = raw ? extractCookies(raw) : '';

  const meHeaders: Record<string, string> = { Accept: 'application/json' };
  if (sessionCookie) meHeaders['Cookie'] = sessionCookie;

  const meRes = await fetch(`${BASE}/auth/me`, {
    method: 'GET',
    headers: meHeaders,
    credentials: 'include',
  });

  if (!meRes.ok) {
    throw new Error('Registration succeeded but could not load your profile. Please sign in.');
  }

  const user: User = await meRes.json();
  if (!user.name && (user.firstName || user.lastName)) user.name = [user.firstName, user.lastName].filter(Boolean).join(' ');
  return { sessionCookie, user };
}

export async function logoutUser(): Promise<void> {
  const cookie = getCookie();
  await fetch(`${BASE}/auth/logout`, {
    method: 'POST',
    headers: { Accept: 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
    credentials: 'include',
  }).catch(() => {});
}

export async function getMe(): Promise<User> {
  return req<User>('/auth/me', 'GET', undefined, true);
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export async function getUserProfile(): Promise<UserProfile> {
  return req<UserProfile>('/user/profile', 'GET', undefined, true);
}

export async function updateUserProfile(data: Partial<UserProfile>): Promise<UserProfile> {
  return req<UserProfile>('/user/profile', 'PUT', data, true);
}

export async function changePassword(data: {
  currentPassword: string; newPassword: string; confirmPassword: string;
}): Promise<void> {
  return req<void>('/user/change-password', 'POST', data, true);
}

// ─── CVs ──────────────────────────────────────────────────────────────────────

export async function getCVs(): Promise<CV[]> {
  return req<CV[]>('/cvs', 'GET', undefined, true);
}

export async function uploadCV(file: { uri: string; name: string; type: string }, title: string): Promise<CV> {
  const form = new FormData();
  form.append('cv', { uri: file.uri, name: file.name, type: file.type } as unknown as Blob);
  form.append('title', title);
  return req<CV>('/cvs', 'POST', form, true, true);
}

// ─── Packages ─────────────────────────────────────────────────────────────────

export async function getPackages(): Promise<Package[]> {
  return req<Package[]>('/packages', 'GET', undefined, false);
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function getOrders(): Promise<Order[]> {
  return req<Order[]>('/orders', 'GET', undefined, true);
}

export async function createOrder(data: {
  packageId: number; cvId: number; targetCountries: string[];
}): Promise<Order> {
  return req<Order>('/orders', 'POST', data, true);
}

// ─── Submissions ──────────────────────────────────────────────────────────────

export async function getSubmissions(): Promise<Submission[]> {
  return req<Submission[]>('/submissions', 'GET', undefined, true);
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function getNotifications(): Promise<Notification[]> {
  return req<Notification[]>('/notifications', 'GET', undefined, true);
}

// ─── Support ──────────────────────────────────────────────────────────────────

export async function contactSupport(data: { subject: string; message: string }): Promise<void> {
  return req<void>('/support/contact', 'POST', data, true);
}
