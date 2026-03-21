import { useAuthStore } from '../state/auth-store';
import type { User } from '../state/auth-store';
import type {
  Package, CV, Order, Submission, Notification, UserProfile
} from '../types/blastmycv';

// Route through our backend proxy to avoid CORS issues in web/browser environments.
// The proxy forwards requests server-to-server to https://blastmycv.com/api
const BASE = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/proxy`;

// Switch to 'jwt' when blastmycv.com migrates from session cookies to JWT tokens.
const AUTH_MODE: 'session' | 'jwt' = 'session';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Module-level token cache — set synchronously on login to avoid Zustand AsyncStorage
// hydration timing issues (async hydration can overwrite freshly set state).
let _activeCookie: string | null = null;

// Keep in sync with the auth store (catches hydration restores and logout)
useAuthStore.subscribe((state) => {
  _activeCookie = state.authToken;
});

/** Call this when switching to JWT mode and a token is received out-of-band. */
export function setJwtToken(token: string | null): void {
  _activeCookie = token;
}

function getCookie(): string | null {
  const cookie = _activeCookie ?? useAuthStore.getState().authToken;
  console.log('[getCookie]', cookie ? cookie.slice(0, 30) + '…' : 'null');
  return cookie;
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
  if (auth && cookie) {
    if (AUTH_MODE === 'jwt') {
      headers['Authorization'] = `Bearer ${cookie}`;
    } else {
      headers['X-Session-Cookie'] = cookie;
    }
  }

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
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  console.log('[BlastMyCV] POST /auth/login status:', res.status);

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || 'Invalid email or password.');
  }

  // Proxy always returns { authToken, user } regardless of session vs JWT mode
  const { authToken, user } = await res.json();
  console.log('[BlastMyCV] Auth token:', authToken ? 'received' : 'none');
  console.log('[BlastMyCV] User:', user?.email ?? 'unknown');

  if (!user?.email) {
    throw new Error('Signed in but could not load your profile. Please try again.');
  }

  if (!user.name && (user.firstName || user.lastName)) {
    user.name = [user.firstName, user.lastName].filter(Boolean).join(' ');
  }

  // Set module-level token immediately so getCookie() works in subsequent requests
  // even before Zustand's async AsyncStorage hydration completes.
  _activeCookie = authToken ?? null;

  // Return as sessionCookie so existing callers (login.tsx, register.tsx) stay unchanged
  return { sessionCookie: authToken ?? '', user };
}

export async function registerUser(data: {
  email: string; password: string; confirmPassword: string;
  firstName: string; lastName: string; phone: string;
}): Promise<{ sessionCookie: string; user: User }> {
  const res = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email: data.email, password: data.password, confirmPassword: data.confirmPassword, firstName: data.firstName, lastName: data.lastName, phone: data.phone }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || 'Registration failed.');
  }

  const { sessionCookie, user } = await res.json();
  if (!user?.email) throw new Error('Registration succeeded but could not load your profile. Please sign in.');
  if (!user.name && (user.firstName || user.lastName)) user.name = [user.firstName, user.lastName].filter(Boolean).join(' ');
  return { sessionCookie: sessionCookie ?? '', user };
}

export async function logoutUser(): Promise<void> {
  const cookie = getCookie();
  _activeCookie = null;
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
  const data = await req<CV[] | { cvs: CV[] }>('/cvs', 'GET', undefined, true).catch(() => []);
  if (Array.isArray(data)) return data;
  return (data as { cvs: CV[] })?.cvs ?? [];
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
  const data = await req<Order[] | { orders: Order[]; total: number }>('/orders', 'GET', undefined, true);
  if (Array.isArray(data)) return data;
  return (data as { orders: Order[] })?.orders ?? [];
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
  const data = await req<Notification[] | { notifications: Notification[] }>('/notifications', 'GET', undefined, true).catch(() => []);
  if (Array.isArray(data)) return data;
  return (data as { notifications: Notification[] })?.notifications ?? [];
}

// ─── Support ──────────────────────────────────────────────────────────────────

export async function contactSupport(data: { subject: string; message: string }): Promise<void> {
  return req<void>('/support/contact', 'POST', data, true);
}
