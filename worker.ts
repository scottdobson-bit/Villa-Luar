/**
 * Villa Luar — Cloudflare Worker Entry Point
 *
 * Handles two concerns:
 *   1. /images/* — serves photos from R2 bucket `villa-luar-images`
 *   2. Everything else — delegated to the static site assets (Vite build)
 */

interface Env {
  ASSETS: Fetcher;
  VILLA_LUAR_IMAGES: R2Bucket;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

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
