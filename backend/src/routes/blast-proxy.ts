import { Hono } from 'hono';

const BLAST_API = 'https://blastmycv.com/api';
const TIMEOUT_MS = 10_000;

const blastProxy = new Hono();

// Helper: fetch with a 10-second timeout
async function fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// ─── Special login handler ───────────────────────────────────────────────────
// JS cannot read Set-Cookie response headers (security restriction in browsers/RN).
// So we extract the session cookie server-side and return it in the response body.
// When blastmycv.com switches to JWT, the response body will contain a `token` field
// instead of Set-Cookie — we detect that and return authToken from the body directly.
blastProxy.post('/auth/login', async (c) => {
  const body = await c.req.text();
  console.log('[BlastProxy] POST /auth/login (special handler) body:', body);

  let response: Response;
  try {
    response = await fetchWithTimeout(`${BLAST_API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body,
    });
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      return c.json({ message: 'Request timed out' }, 504);
    }
    return c.json({ message: 'Failed to reach BlastMyCV API' }, 502);
  }

  const responseBody = await response.text();
  console.log('[BlastProxy] /auth/login status:', response.status, '| body:', responseBody.slice(0, 300));

  if (!response.ok) {
    let errJson: any = {};
    try { errJson = JSON.parse(responseBody); } catch {}
    return c.json(errJson, (response.status || 400) as 400);
  }

  // Login response body already contains the full user object
  let parsed: any = {};
  try { parsed = JSON.parse(responseBody); } catch {}

  const user = parsed;

  // JWT mode: blastmycv.com returns a `token` field in the response body
  if (parsed?.token) {
    console.log('[BlastProxy] JWT token received in response body');
    return c.json({ authToken: parsed.token, user }, 200);
  }

  // Session mode: extract Set-Cookie server-side (Bun/Node can read Set-Cookie; JS clients cannot)
  const setCookie = response.headers.get('set-cookie') ?? '';
  const sessionCookie = setCookie
    .split(/,(?=[^;]+=[^;]+)/)
    .map((p) => (p.split(';')[0] ?? '').trim())
    .filter(Boolean)
    .join('; ');

  console.log('[BlastProxy] Session cookie extracted:', sessionCookie ? sessionCookie : 'none');

  return c.json({ authToken: sessionCookie, user }, 200);
});

// ─── Special register handler ─────────────────────────────────────────────────
blastProxy.post('/auth/register', async (c) => {
  const body = await c.req.text();
  console.log('[BlastProxy] POST /auth/register body:', body);

  let response: Response;
  try {
    response = await fetchWithTimeout(`${BLAST_API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body,
    });
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      return c.json({ message: 'Request timed out' }, 504);
    }
    return c.json({ message: 'Failed to reach BlastMyCV API' }, 502);
  }

  const responseBody = await response.text();
  console.log('[BlastProxy] /auth/register status:', response.status, '| body:', responseBody.slice(0, 300));

  if (!response.ok) {
    let errJson: any = {};
    try { errJson = JSON.parse(responseBody); } catch {}
    return c.json(errJson, response.status as any);
  }

  const setCookie = response.headers.get('set-cookie') ?? '';
  const sessionCookie = setCookie
    .split(/,(?=[^;]+=[^;]+)/)
    .map((p) => (p.split(';')[0] ?? '').trim())
    .filter(Boolean)
    .join('; ');

  console.log('[BlastProxy] Register session cookie:', sessionCookie ? sessionCookie : 'none');

  let user: any = {};
  try { user = JSON.parse(responseBody); } catch {}

  return c.json({ sessionCookie: sessionCookie ?? '', user }, 200);
});

// ─── General proxy (all other routes) ────────────────────────────────────────
blastProxy.all('/*', async (c) => {
  const rawPath = c.req.path;
  const mountPrefix = '/api/proxy';
  const apiPath = rawPath.startsWith(mountPrefix)
    ? rawPath.slice(mountPrefix.length) || '/'
    : rawPath;

  const search = new URL(c.req.url).search;
  const targetUrl = `${BLAST_API}${apiPath}${search}`;

  console.log('[BlastProxy]', c.req.method, targetUrl);

  const forwardHeaders: Record<string, string> = {
    Accept: c.req.header('Accept') ?? 'application/json',
  };

  const contentType = c.req.header('Content-Type');
  if (contentType) forwardHeaders['Content-Type'] = contentType;

  // Support both session cookie and JWT bearer token forwarding.
  // X-Session-Cookie: used in session mode (current behavior).
  // Authorization: Bearer <token>: used in JWT mode (future behavior).
  const sessionCookieHeader = c.req.header('X-Session-Cookie');
  const authorizationHeader = c.req.header('Authorization');

  if (authorizationHeader?.startsWith('Bearer ')) {
    // JWT mode: forward Authorization header directly to blastmycv.com
    forwardHeaders['Authorization'] = authorizationHeader;
  } else if (sessionCookieHeader) {
    // Session mode: forward as Cookie
    forwardHeaders['Cookie'] = sessionCookieHeader;
  } else {
    // Fallback: forward raw Cookie header if present
    const cookie = c.req.header('Cookie');
    if (cookie) forwardHeaders['Cookie'] = cookie;
  }

  let body: Blob | string | undefined;
  const method = c.req.method;
  if (method !== 'GET' && method !== 'HEAD') {
    if (contentType?.includes('multipart/form-data')) {
      const blob = await c.req.blob();
      body = blob;
      delete forwardHeaders['Content-Type'];
    } else {
      body = await c.req.text();
    }
  }

  console.log('[BlastProxy] Forwarding headers:', JSON.stringify(forwardHeaders));

  let response: Response;
  try {
    response = await fetchWithTimeout(targetUrl, { method, headers: forwardHeaders, body });
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      return c.json({ message: 'Request timed out' }, 504);
    }
    return c.json({ error: { message: 'Failed to reach BlastMyCV API' } }, 502);
  }

  const resHeaders: Record<string, string> = {};
  const resContentType = response.headers.get('content-type');
  if (resContentType) resHeaders['Content-Type'] = resContentType;

  const responseBody = await response.text();
  console.log('[BlastProxy] Response status:', response.status, '| Body:', responseBody.slice(0, 300));

  // When upstream returns 500 with empty body, return a structured error instead
  if (response.status === 500 && responseBody.trim() === '') {
    return c.json({ message: 'Server error' }, 500);
  }

  return new Response(responseBody, { status: response.status, headers: resHeaders });
});

export default blastProxy;
