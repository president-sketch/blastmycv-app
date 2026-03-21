import { Hono } from 'hono';

const BLAST_API = 'https://blastmycv.com/api';

const blastProxy = new Hono();

blastProxy.all('/*', async (c) => {
  // In Hono sub-routers, c.req.path may or may not include the mount prefix.
  // Strip /api/proxy prefix defensively to always get the bare BlastMyCV path.
  const rawPath = c.req.path;
  const mountPrefix = '/api/proxy';
  const apiPath = rawPath.startsWith(mountPrefix)
    ? rawPath.slice(mountPrefix.length) || '/'
    : rawPath;

  const search = new URL(c.req.url).search;
  const targetUrl = `${BLAST_API}${apiPath}${search}`;

  console.log('[BlastProxy]', c.req.method, targetUrl);

  // Forward relevant headers from client to blastmycv.com
  const forwardHeaders: Record<string, string> = {
    Accept: c.req.header('Accept') ?? 'application/json',
  };

  const contentType = c.req.header('Content-Type');
  if (contentType) forwardHeaders['Content-Type'] = contentType;

  // Forward session cookie if present
  const cookie = c.req.header('Cookie') ?? c.req.header('X-Session-Cookie');
  if (cookie) forwardHeaders['Cookie'] = cookie;

  // Forward body for non-GET requests
  let body: Blob | string | undefined;
  const method = c.req.method;
  if (method !== 'GET' && method !== 'HEAD') {
    if (contentType?.includes('multipart/form-data')) {
      // For file uploads, stream raw body
      const blob = await c.req.blob();
      body = blob;
      // Remove Content-Type so fetch sets correct boundary
      delete forwardHeaders['Content-Type'];
    } else {
      body = await c.req.text();
    }
  }

  let response: Response;
  try {
    response = await fetch(targetUrl, {
      method,
      headers: forwardHeaders,
      body,
    });
  } catch (err) {
    return c.json({ error: { message: 'Failed to reach BlastMyCV API' } }, 502);
  }

  // Build response headers to forward back
  const resHeaders: Record<string, string> = {};

  const resContentType = response.headers.get('content-type');
  if (resContentType) resHeaders['Content-Type'] = resContentType;

  // Forward Set-Cookie so the client can store the PHP session
  const setCookie = response.headers.get('set-cookie');
  if (setCookie) resHeaders['Set-Cookie'] = setCookie;

  const responseBody = await response.text();

  return new Response(responseBody, {
    status: response.status,
    headers: resHeaders,
  });
});

export default blastProxy;
