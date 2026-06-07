/**
 * Seed Sunday viewing slots: 12:00, 13:00, 14:00, 15:00 for the next 8 Sundays.
 * Usage: ADMIN_PASSWORD=xxx node scripts/seed-slots.mjs
 */

const SITE_URL = process.env.SITE_URL || 'https://villaluar.com';
const PASSWORD = process.env.ADMIN_PASSWORD;

if (!PASSWORD) {
  console.error('❌  Set ADMIN_PASSWORD env var');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${PASSWORD}`,
};

function nextNSundays(n) {
  const sundays = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  // advance to next Sunday
  d.setDate(d.getDate() + ((7 - d.getDay()) % 7 || 7));
  for (let i = 0; i < n; i++) {
    sundays.push(new Date(d));
    d.setDate(d.getDate() + 7);
  }
  return sundays;
}

const hours = [12, 13, 14, 15];
const sundays = nextNSundays(8);

let added = 0;
for (const sunday of sundays) {
  for (const hour of hours) {
    const dt = new Date(sunday);
    dt.setHours(hour, 0, 0, 0);
    const datetime = dt.toISOString();
    const label = `${String(hour).padStart(2, '0')}:00 – ${String(hour + 1).padStart(2, '0')}:00`;

    const res = await fetch(`${SITE_URL}/api/slots`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ datetime, label }),
    });

    if (res.ok) {
      console.log(`✅  Added: ${label} on ${sunday.toDateString()}`);
      added++;
    } else {
      const err = await res.json();
      console.error(`❌  Failed: ${label} on ${sunday.toDateString()} —`, err);
    }
  }
}

console.log(`\nDone. ${added} slots seeded.`);
