/**
 * Villa Luar — Cloudflare Worker
 *
 * Routes:
 *   GET  /images/*          — serves photos from R2
 *   GET  /api/content       — returns villa content JSON from KV
 *   POST /api/content       — updates villa content JSON in KV (admin auth required)
 *   POST /api/upload        — uploads an image to R2 (admin auth required)
 *   *                       — falls through to static site assets
 */

interface Env {
  ASSETS: Fetcher;
  VILLA_LUAR_IMAGES: R2Bucket;
  VILLA_CONTENT: KVNamespace;
  ADMIN_PASSWORD: string; // set via: npx wrangler secret put ADMIN_PASSWORD
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

function isAuthorized(request: Request, env: Env): boolean {
  const auth = request.headers.get('Authorization') ?? '';
  const [scheme, token] = auth.split(' ');
  return scheme === 'Bearer' && token === env.ADMIN_PASSWORD;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;
    const method = request.method;

    // CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // ── GET /images/* ────────────────────────────────────────────────────────
    if (pathname.startsWith('/images/')) {
      const key = pathname.replace('/images/', '');
      if (!key) return new Response('Not found', { status: 404 });

      const object = await env.VILLA_LUAR_IMAGES.get(key);
      if (!object) return new Response('Image not found', { status: 404 });

      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set('etag', object.httpEtag);
      headers.set('cache-control', 'public, max-age=31536000, immutable');

      return new Response(object.body, { headers });
    }

    // ── GET /api/content ─────────────────────────────────────────────────────
    if (pathname === '/api/content' && method === 'GET') {
      const content = await env.VILLA_CONTENT.get('villa-content');
if (!content) return jsonResponse({ error: 'Content not found' }, 404);

      return new Response(content, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
          ...CORS_HEADERS,
        },
      });
    }

    // ── POST /api/content ────────────────────────────────────────────────────
    if (pathname === '/api/content' && method === 'POST') {
      if (!isAuthorized(request, env)) return jsonResponse({ error: 'Unauthorized' }, 401);

      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return jsonResponse({ error: 'Invalid JSON' }, 400);
      }

      await env.VILLA_CONTENT.put('villa-content', JSON.stringify(body));
      return jsonResponse({ ok: true });
    }

    // ── POST /api/upload ─────────────────────────────────────────────────────
    if (pathname === '/api/upload' && method === 'POST') {
      if (!isAuthorized(request, env)) return jsonResponse({ error: 'Unauthorized' }, 401);

      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const key = formData.get('key') as string | null;

      if (!file || !key) return jsonResponse({ error: 'Missing file or key' }, 400);

      const sanitizedKey = key.replace(/[^a-z0-9._-]/gi, '-').toLowerCase();
      const arrayBuffer = await file.arrayBuffer();

      await env.VILLA_LUAR_IMAGES.put(sanitizedKey, arrayBuffer, {
        httpMetadata: { contentType: file.type },
      });

      return jsonResponse({ ok: true, url: `/images/${sanitizedKey}` });
    }

    // ── Static assets (SPA fallback) ─────────────────────────────────────────
    const assetResponse = await env.ASSETS.fetch(request);
    if (assetResponse.status === 404) {
      // Serve index.html for all unmatched paths so client-side routing works
      return env.ASSETS.fetch(new Request(new URL('/', request.url).toString(), request));
    }
    return assetResponse;
  },
};
