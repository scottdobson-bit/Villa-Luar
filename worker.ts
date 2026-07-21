/**
 * Villa Luar — Cloudflare Worker
 *
 * Routes:
 *   GET  /images/*           — serves photos from R2
 *   GET  /api/content        — returns villa content JSON from KV
 *   POST /api/content        — updates villa content JSON in KV (admin auth required)
 *   POST /api/upload         — uploads an image to R2 (admin auth required)
 *   GET  /api/slots          — returns available (non-booked) viewing slots
 *   POST /api/slots          — adds a slot (admin auth required)
 *   DELETE /api/slots/:id    — removes a slot (admin auth required)
 *   POST /api/book           — books a slot, sends confirmation emails
 *   GET  /api/bookings       — lists all bookings (admin auth required)
 *   DELETE /api/bookings/:id — cancels booking & restores slot (admin auth required)
 *   *                        — falls through to static site assets
 */

interface Env {
  ASSETS: Fetcher;
  VILLA_LUAR_IMAGES: R2Bucket;
  VILLA_CONTENT: KVNamespace;
  ADMIN_PASSWORD: string;
  MAILJET_APIKEY: string;
  MAILJET_APISECRET: string;
  EMAIL_ENGINE_KEY: string;
  NOTIFY_EMAIL: string; // scott@cobellon.co.uk
  FROM_EMAIL: string;   // scott@villaluar.com
}

interface BookingSlot {
  id: string;
  datetime: string; // ISO 8601 UTC
  label: string;
  booked: boolean;
}

interface Booking {
  id: string;
  slotId: string;
  slotDatetime: string;
  slotLabel: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
}

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

async function getSlots(env: Env): Promise<BookingSlot[]> {
  const raw = await env.VILLA_CONTENT.get('booking-slots');
  return raw ? JSON.parse(raw) : [];
}

async function getBookings(env: Env): Promise<Booking[]> {
  const raw = await env.VILLA_CONTENT.get('bookings');
  return raw ? JSON.parse(raw) : [];
}

// ── Mailjet email sending ────────────────────────────────────────────────────
async function sendEmail(to: string, subject: string, body: string, env: Env): Promise<void> {
  try {
    const fromEmail = env.FROM_EMAIL || 'scott@villaluar.com';
    const res = await fetch('https://webhooks.villacheckin.com/api/email/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.EMAIL_ENGINE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Messages: [{
          From: { Email: fromEmail, Name: 'Villa Luar' },
          To: [{ Email: to }],
          Subject: subject,
          TextPart: body,
        }],
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error('Mailjet send failed:', res.status, err);
    }
  } catch (e) {
    console.error('Email error:', e);
  }
}

function formatSlotDate(isoDatetime: string): string {
  return new Date(isoDatetime).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Atlantic/Canary',
  });
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
      try { body = await request.json(); }
      catch { return jsonResponse({ error: 'Invalid JSON' }, 400); }

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
      return jsonResponse(slots.filter(s => !s.booked));
    }

    // ── POST /api/slots (admin) ──────────────────────────────────────────────
    if (pathname === '/api/slots' && method === 'POST') {
      if (!isAuthorized(request, env)) return jsonResponse({ error: 'Unauthorized' }, 401);

      let body: { datetime: string; label: string };
      try { body = await request.json() as { datetime: string; label: string }; }
      catch { return jsonResponse({ error: 'Invalid JSON' }, 400); }

      if (!body.datetime || !body.label) {
        return jsonResponse({ error: 'datetime and label are required' }, 400);
      }

      const slots = await getSlots(env);
      const newSlot: BookingSlot = {
        id: crypto.randomUUID(),
        datetime: body.datetime,
        label: body.label,
        booked: false,
      };
      slots.push(newSlot);
      await env.VILLA_CONTENT.put('booking-slots', JSON.stringify(slots));
      return jsonResponse(newSlot, 201);
    }

    // ── DELETE /api/slots/:id (admin) ────────────────────────────────────────
    if (pathname.startsWith('/api/slots/') && method === 'DELETE') {
      if (!isAuthorized(request, env)) return jsonResponse({ error: 'Unauthorized' }, 401);

      const slotId = pathname.replace('/api/slots/', '');
      let slots = await getSlots(env);
      const slot = slots.find(s => s.id === slotId);
      if (!slot) return jsonResponse({ error: 'Slot not found' }, 404);
      if (slot.booked) return jsonResponse({ error: 'Cannot delete a booked slot' }, 409);

      slots = slots.filter(s => s.id !== slotId);
      await env.VILLA_CONTENT.put('booking-slots', JSON.stringify(slots));
      return jsonResponse({ ok: true });
    }

    // ── POST /api/book ───────────────────────────────────────────────────────
    if (pathname === '/api/book' && method === 'POST') {
      let body: { slotId: string; name: string; email: string; phone: string; message?: string };
      try { body = await request.json() as typeof body; }
      catch { return jsonResponse({ error: 'Invalid JSON' }, 400); }

      if (!body.slotId || !body.name || !body.email || !body.phone) {
        return jsonResponse({ error: 'slotId, name, email, phone are required' }, 400);
      }

      // Re-read slots fresh to minimise race window
      const slots = await getSlots(env);
      const slotIndex = slots.findIndex(s => s.id === body.slotId);
      if (slotIndex === -1) return jsonResponse({ error: 'Slot not found' }, 404);
      if (slots[slotIndex].booked) return jsonResponse({ error: 'Slot already booked' }, 409);

      // Mark booked and persist immediately
      slots[slotIndex].booked = true;
      await env.VILLA_CONTENT.put('booking-slots', JSON.stringify(slots));

      // Create booking record
      const bookings = await getBookings(env);
      const newBooking: Booking = {
        id: crypto.randomUUID(),
        slotId: body.slotId,
        slotDatetime: slots[slotIndex].datetime,
        slotLabel: slots[slotIndex].label,
        name: body.name,
        email: body.email,
        phone: body.phone,
        message: body.message ?? '',
        createdAt: new Date().toISOString(),
      };
      bookings.push(newBooking);
      await env.VILLA_CONTENT.put('bookings', JSON.stringify(bookings));

      const dateStr = formatSlotDate(newBooking.slotDatetime);
      const timeStr = newBooking.slotLabel;

      // Send admin notification (fire and forget — don't block response)
      const adminBody = [
        `New viewing request for Villa Luar`,
        ``,
        `Name:    ${newBooking.name}`,
        `Email:   ${newBooking.email}`,
        `Phone:   ${newBooking.phone}`,
        `Date:    ${dateStr}`,
        `Time:    ${timeStr}`,
        newBooking.message ? `Message: ${newBooking.message}` : '',
        ``,
        `Booking ID: ${newBooking.id}`,
        `Booked at:  ${new Date(newBooking.createdAt).toLocaleString('en-GB', { timeZone: 'Atlantic/Canary' })}`,
      ].filter(l => l !== undefined).join('\n');

      const notifyEmail = env.NOTIFY_EMAIL || 'scott@cobellon.co.uk';

      // Send user confirmation
      const userBody = [
        `Dear ${newBooking.name},`,
        ``,
        `Thank you for requesting a private viewing of Villa Luar.`,
        ``,
        `Your viewing is confirmed for:`,
        `  Date: ${dateStr}`,
        `  Time: ${timeStr}`,
        ``,
        `We will be in touch to confirm final details. If you need to make any changes,`,
        `please reply to this email or call us directly.`,
        ``,
        `We look forward to welcoming you to Villa Luar.`,
        ``,
        `Best regards,`,
        `Villa Luar`,
        `villaluar.com`,
      ].join('\n');

      // Non-blocking email sends
      const ctx = { waitUntil: (p: Promise<unknown>) => p } as unknown as ExecutionContext;
      ctx.waitUntil(Promise.all([
        sendEmail(notifyEmail, `Villa Luar Viewing: ${newBooking.name} — ${dateStr} ${timeStr}`, adminBody, env),
        sendEmail(newBooking.email, `Your Villa Luar Viewing is Confirmed — ${dateStr}`, userBody, env),
      ]));

      return jsonResponse(newBooking, 201);
    }

    // ── GET /api/bookings (admin) ────────────────────────────────────────────
    if (pathname === '/api/bookings' && method === 'GET') {
      if (!isAuthorized(request, env)) return jsonResponse({ error: 'Unauthorized' }, 401);
      return jsonResponse(await getBookings(env));
    }

    // ── DELETE /api/bookings/:id (admin) ─────────────────────────────────────
    if (pathname.startsWith('/api/bookings/') && method === 'DELETE') {
      if (!isAuthorized(request, env)) return jsonResponse({ error: 'Unauthorized' }, 401);

      const bookingId = pathname.replace('/api/bookings/', '');
      let bookings = await getBookings(env);
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) return jsonResponse({ error: 'Booking not found' }, 404);

      // Restore the slot
      const slots = await getSlots(env);
      const slotIndex = slots.findIndex(s => s.id === booking.slotId);
      if (slotIndex !== -1) {
        slots[slotIndex].booked = false;
        await env.VILLA_CONTENT.put('booking-slots', JSON.stringify(slots));
      }

      bookings = bookings.filter(b => b.id !== bookingId);
      await env.VILLA_CONTENT.put('bookings', JSON.stringify(bookings));

      return jsonResponse({ ok: true });
    }

    // ── Static assets (SPA fallback) ─────────────────────────────────────────
    const assetResponse = await env.ASSETS.fetch(request);
    if (assetResponse.status === 404) {
      return env.ASSETS.fetch(new Request(new URL('/', request.url).toString(), request));
    }
    return assetResponse;
  },
};
