import { Hono } from 'hono';

const BLAST_API = 'https://blastmycv.com/api';

const blastProxy = new Hono();

// ─── Special login handler ───────────────────────────────────────────────────
// JS cannot read Set-Cookie response headers (security restriction in browsers/RN).
// So we extract the session cookie server-side and return it in the response body.
blastProxy.post('/auth/login', async (c) => {
  const body = await c.req.text();
  console.log('[BlastProxy] POST /auth/login (special handler) body:', body);

  let response: Response;
  try {
    response = await fetch(`${BLAST_API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body,
    });
  } catch (err) {
    return c.json({ message: 'Failed to reach BlastMyCV API' }, 502);
  }

  const responseBody = await response.text();
  console.log('[BlastProxy] /auth/login status:', response.status, '| body:', responseBody.slice(0, 300));

  if (!response.ok) {
    let errJson: any = {};
    try { errJson = JSON.parse(responseBody); } catch {}
    return c.json(errJson, (response.status || 400) as 400);
  }

  // Extract session cookie server-side (Bun/Node can read Set-Cookie; JS clients cannot)
  const setCookie = response.headers.get('set-cookie') ?? '';
  const sessionCookie = setCookie
    .split(/,(?=[^;]+=[^;]+)/)
    .map((p) => (p.split(';')[0] ?? '').trim())
    .filter(Boolean)
    .join('; ');

  console.log('[BlastProxy] Session cookie extracted:', sessionCookie ? sessionCookie : 'none');

  // Login response body already contains the full user object
  let user: any = {};
  try { user = JSON.parse(responseBody); } catch {}

  return c.json({ sessionCookie, user }, 200);
});

// ─── Special register handler ─────────────────────────────────────────────────
blastProxy.post('/auth/register', async (c) => {
  const body = await c.req.text();
  console.log('[BlastProxy] POST /auth/register body:', body);

  let response: Response;
  try {
    response = await fetch(`${BLAST_API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body,
    });
  } catch (err) {
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

  return c.json({ sessionCookie, user }, 200);
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

  // Forward session cookie for authenticated requests
  const cookie = c.req.header('Cookie') ?? c.req.header('X-Session-Cookie');
  if (cookie) {
    forwardHeaders['Cookie'] = cookie;
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
    response = await fetch(targetUrl, { method, headers: forwardHeaders, body });
  } catch (err) {
    return c.json({ error: { message: 'Failed to reach BlastMyCV API' } }, 502);
  }

  const resHeaders: Record<string, string> = {};
  const resContentType = response.headers.get('content-type');
  if (resContentType) resHeaders['Content-Type'] = resContentType;

  const responseBody = await response.text();
  console.log('[BlastProxy] Response status:', response.status, '| Body:', responseBody.slice(0, 300));

  return new Response(responseBody, { status: response.status, headers: resHeaders });
});

export default blastProxy;
