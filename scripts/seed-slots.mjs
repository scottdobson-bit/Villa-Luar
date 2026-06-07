/**
 * seed-slots.mjs
 * Seeds Sunday viewing slots (12:00, 13:00, 14:00, 15:00, 16:00 local Spain time)
 * for the next N weeks via the Worker API.
 *
 * Usage:
 *   ADMIN_PASSWORD=your_password node scripts/seed-slots.mjs
 *
 * Options (env vars):
 *   WEEKS      — how many weeks ahead to add (default: 8)
 *   SITE_URL   — your Cloudflare Pages / Worker URL
 */

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const SITE_URL = process.env.SITE_URL ?? 'https://villaluar.com';
const WEEKS = parseInt(process.env.WEEKS ?? '8', 10);

// Viewing hours: 12:00–16:00, one slot per hour
const HOURS = [12, 13, 14, 15, 16];

if (!ADMIN_PASSWORD) {
  console.error('❌  Set ADMIN_PASSWORD env var first.');
  process.exit(1);
}

function nextSunday(from) {
  const d = new Date(from);
  d.setDate(d.getDate() + ((7 - d.getDay()) % 7 || 7));
  return d;
}

function formatLabel(dt) {
  return dt.toLocaleString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
    timeZone: 'Europe/Madrid',
  });
}

async function addSlot(datetime, label) {
  const res = await fetch(`${SITE_URL}/api/slots`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ADMIN_PASSWORD}`,
    },
    body: JSON.stringify({ datetime, label }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.warn(`  ⚠️  ${label} — ${res.status} ${text}`);
  } else {
    console.log(`  ✓  ${label}`);
  }
}

async function main() {
  let cursor = new Date();
  let sunday = nextSunday(cursor);

  for (let w = 0; w < WEEKS; w++) {
    console.log(`\nWeek ${w + 1}: ${sunday.toDateString()}`);
    for (const hour of HOURS) {
      // Build datetime in Madrid local time
      const dt = new Date(sunday);
      dt.setHours(hour, 0, 0, 0);

      // Convert local Madrid time to UTC (Spain is UTC+2 in summer, UTC+1 in winter)
      // Use Intl to get the correct ISO string
      const tzOffset = new Date(dt.toLocaleString('en-US', { timeZone: 'Europe/Madrid' })) - dt;
      const utcDt = new Date(dt.getTime() - tzOffset);

      await addSlot(utcDt.toISOString(), formatLabel(utcDt));
    }

    // Advance to next Sunday
    sunday = new Date(sunday);
    sunday.setDate(sunday.getDate() + 7);
  }

  console.log('\n✅  Done — all slots added.');
}

main().catch(err => { console.error(err); process.exit(1); });
