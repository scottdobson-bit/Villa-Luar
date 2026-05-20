/**
 * Villa Luar — Cloudflare Worker Entry Point
 *
 * Handles three concerns:
 *   1. /api/content — GET (public) and PUT (authenticated) for live content via KV
 *   2. /images/* — serves photos from R2 bucket `villa-luar-images`
 *   3. Everything else — delegated to the static site assets (Vite build)
 */

interface Env {
  ASSETS: Fetcher;
  VILLA_LUAR_IMAGES: R2Bucket;
  VILLA_LUAR_CONTENT: KVNamespace;
  CONTENT_API_KEY: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS preflight for content API
    if (request.method === 'OPTIONS' && url.pathname === '/api/content') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // Content API — read/write live content via KV
    if (url.pathname === '/api/content') {
      if (request.method === 'GET') {
        const content = await env.VILLA_LUAR_CONTENT.get('content');
        if (!content) {
          return new Response('Not found', { status: 404 });
        }
        return new Response(content, {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store',
            ...CORS_HEADERS,
          },
        });
      }

      if (request.method === 'PUT') {
        const apiKey = request.headers.get('Authorization')?.replace('Bearer ', '') ?? '';
        if (!apiKey || !env.CONTENT_API_KEY || apiKey !== env.CONTENT_API_KEY) {
          return new Response('Unauthorized', { status: 401 });
        }

        let body: string;
        try {
          body = await request.text();
          JSON.parse(body); // validate JSON before storing
        } catch {
          return new Response('Invalid JSON', { status: 400 });
        }

        await env.VILLA_LUAR_CONTENT.put('content', body);
        return new Response('Published', { status: 200, headers: CORS_HEADERS });
      }

      return new Response('Method not allowed', { status: 405 });
    }

    // Serve R2 images
    if (url.pathname.startsWith('/images/')) {
      const key = url.pathname.replace('/images/', '');
      if (!key) return new Response('Not found', { status: 404 });

      const object = await env.VILLA_LUAR_IMAGES.get(key);

      if (!object) {
        return new Response('Image not found', { status: 404 });
      }

      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set('etag', object.httpEtag);
      // Images are immutable — cache for 1 year in browser and CDN
      headers.set('cache-control', 'public, max-age=31536000, immutable');

      return new Response(object.body, { headers });
    }

    // Fall through to static site assets
    return env.ASSETS.fetch(request);
  },
};
