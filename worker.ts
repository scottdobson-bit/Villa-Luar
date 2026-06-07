/**
 * Villa Luar — Cloudflare Worker
 *
 * Routes:
 *   GET  /images/*          — serves photos from R2
 *   GET  /api/content       — returns villa content JSON from KV
 *   POST /api/content       — updates villa content JSON in KV (admin auth required)
 *   POST /api/upload        — uploads an image to R2 (admin auth required)
 *   GET  /api/slots         — returns available viewing slots (public)
 *   POST /api/slots         — add a slot (admin auth required)
 *   DELETE /api/slots/:id   — remove a slot (admin auth required)
 *   GET  /api/bookings      — list all bookings (admin auth required)
 *   POST /api/book          — submit a booking request (public)
 *   DELETE /api/bookings/:id — delete a booking (admin auth required)
 *   *                       — falls through to static site assets
 */

interface Env {
  ASSETS: Fetcher;
  VILLA_LUAR_IMAGES: R2Bucket;
  VILLA_CONTENT: KVNamespace;
  ADMIN_PASSWORD: string; // set via: npx wrangler secret put ADMIN_PASSWORD
}

// ── Booking types ─────────────────────────────────────────────────────────────

interface BookingSlot {
  id: string;
  datetime: string; // ISO 8601
  label: string;    // e.g. "Monday 15 Jun · 10:00"
  booked: boolean;
}

interface Booking {
  id: string;
  slotId: string;
  slotLabel: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  bookedAt: string; // ISO 8601
}

async function getSlots(env: Env): Promise<BookingSlot[]> {
  const raw = await env.VILLA_CONTENT.get('booking-slots');
  if (!raw) return [];
  try { return JSON.parse(raw) as BookingSlot[]; } catch { return []; }
}

async function getBookings(env: Env): Promise<Booking[]> {
  const raw = await env.VILLA_CONTENT.get('bookings');
  if (!raw) return [];
  try { return JSON.parse(raw) as Booking[]; } catch { return []; }
}

// ─────────────────────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
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

    // ── GET /api/slots ───────────────────────────────────────────────────────
    if (pathname === '/api/slots' && method === 'GET') {
      const slots = await getSlots(env);
      const available = slots.filter(s => !s.booked);
      return jsonResponse(available);
    }

    // ── POST /api/slots ──────────────────────────────────────────────────────
    if (pathname === '/api/slots' && method === 'POST') {
      if (!isAuthorized(request, env)) return jsonResponse({ error: 'Unauthorized' }, 401);

      let body: { datetime: string; label: string };
      try { body = await request.json() as { datetime: string; label: string }; }
      catch { return jsonResponse({ error: 'Invalid JSON' }, 400); }

      if (!body.datetime || !body.label) return jsonResponse({ error: 'Missing datetime or label' }, 400);

      const slots = await getSlots(env);
      const newSlot: BookingSlot = {
        id: crypto.randomUUID(),
        datetime: body.datetime,
        label: body.label,
        booked: false,
      };
      slots.push(newSlot);
      slots.sort((a, b) => a.datetime.localeCompare(b.datetime));
      await env.VILLA_CONTENT.put('booking-slots', JSON.stringify(slots));
      return jsonResponse(newSlot, 201);
    }

    // ── DELETE /api/slots/:id ────────────────────────────────────────────────
    if (pathname.startsWith('/api/slots/') && method === 'DELETE') {
      if (!isAuthorized(request, env)) return jsonResponse({ error: 'Unauthorized' }, 401);

      const id = pathname.replace('/api/slots/', '');
      const slots = await getSlots(env);
      const filtered = slots.filter(s => s.id !== id);
      if (filtered.length === slots.length) return jsonResponse({ error: 'Slot not found' }, 404);
      await env.VILLA_CONTENT.put('booking-slots', JSON.stringify(filtered));
      return jsonResponse({ ok: true });
    }

    // ── GET /api/bookings ────────────────────────────────────────────────────
    if (pathname === '/api/bookings' && method === 'GET') {
      if (!isAuthorized(request, env)) return jsonResponse({ error: 'Unauthorized' }, 401);
      const bookings = await getBookings(env);
      return jsonResponse(bookings);
    }

    // ── DELETE /api/bookings/:id ─────────────────────────────────────────────
    if (pathname.startsWith('/api/bookings/') && method === 'DELETE') {
      if (!isAuthorized(request, env)) return jsonResponse({ error: 'Unauthorized' }, 401);

      const id = pathname.replace('/api/bookings/', '');
      const bookings = await getBookings(env);
      const booking = bookings.find(b => b.id === id);
      if (!booking) return jsonResponse({ error: 'Booking not found' }, 404);

      // Restore the slot to available
      const slots = await getSlots(env);
      const slot = slots.find(s => s.id === booking.slotId);
      if (slot) slot.booked = false;
      await env.VILLA_CONTENT.put('booking-slots', JSON.stringify(slots));
      await env.VILLA_CONTENT.put('bookings', JSON.stringify(bookings.filter(b => b.id !== id)));
      return jsonResponse({ ok: true });
    }

    // ── POST /api/book ───────────────────────────────────────────────────────
    if (pathname === '/api/book' && method === 'POST') {
      let body: { slotId: string; name: string; email: string; phone: string; message: string };
      try { body = await request.json() as typeof body; }
      catch { return jsonResponse({ error: 'Invalid JSON' }, 400); }

      if (!body.slotId || !body.name || !body.email) {
        return jsonResponse({ error: 'Missing slotId, name, or email' }, 400);
      }

      const slots = await getSlots(env);
      const slot = slots.find(s => s.id === body.slotId);
      if (!slot) return jsonResponse({ error: 'Slot not found' }, 404);
      if (slot.booked) return jsonResponse({ error: 'Slot already booked' }, 409);

      slot.booked = true;
      await env.VILLA_CONTENT.put('booking-slots', JSON.stringify(slots));

      const newBooking: Booking = {
        id: crypto.randomUUID(),
        slotId: slot.id,
        slotLabel: slot.label,
        name: body.name,
        email: body.email,
        phone: body.phone ?? '',
        message: body.message ?? '',
        bookedAt: new Date().toISOString(),
      };
      const bookings = await getBookings(env);
      bookings.push(newBooking);
      await env.VILLA_CONTENT.put('bookings', JSON.stringify(bookings));

      return jsonResponse({ ok: true, booking: newBooking }, 201);
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
