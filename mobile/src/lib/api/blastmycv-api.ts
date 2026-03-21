import { useAuthStore } from '../state/auth-store';

// BlastMyCV external API base URL
// When real API endpoints are provided, update this
const BLASTMYCV_API_BASE = 'https://api.blastmycv.com';

// Internal Vibecode backend URL for any local features
const INTERNAL_API_BASE = process.env.EXPO_PUBLIC_BACKEND_URL;

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

async function request<T>(
  baseUrl: string,
  path: string,
  method: Method,
  body?: unknown
): Promise<T> {
  const token = useAuthStore.getState().token;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (token) {
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

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// BlastMyCV external API calls
export const blastAPI = {
  get: <T>(path: string) => request<T>(BLASTMYCV_API_BASE, path, 'GET'),
  post: <T>(path: string, body: unknown) => request<T>(BLASTMYCV_API_BASE, path, 'POST', body),
  put: <T>(path: string, body: unknown) => request<T>(BLASTMYCV_API_BASE, path, 'PUT', body),
  patch: <T>(path: string, body: unknown) => request<T>(BLASTMYCV_API_BASE, path, 'PATCH', body),
  delete: <T>(path: string) => request<T>(BLASTMYCV_API_BASE, path, 'DELETE'),
};

// Internal backend API calls (for local features)
export const internalAPI = {
  get: <T>(path: string) => request<T>(INTERNAL_API_BASE ?? '', path, 'GET'),
  post: <T>(path: string, body: unknown) => request<T>(INTERNAL_API_BASE ?? '', path, 'POST', body),
};

// Auth endpoints - will call BlastMyCV real API
export async function loginUser(email: string, password: string): Promise<{ token: string; user: import('../state/auth-store').User }> {
  return blastAPI.post('/auth/login', { email, password });
}

export async function registerUser(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<{ token: string; user: import('../state/auth-store').User }> {
  return blastAPI.post('/auth/register', data);
}
