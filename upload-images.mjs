/**
 * Upload all base64 images from villa-content.json to R2
 * Run: node upload-images.mjs
 */
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const BUCKET = 'villa-luar-images';
const SOURCE = './villa-content.json';
const CLEAN = './villa-content-clean.json';

const MIME_EXT = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'image/gif': 'gif',
};

function slugify(path) {
  return path.replace(/\[(\d+)\]/g, '-$1').replace(/\./g, '-').replace(/^-/, '').toLowerCase();
}

function findBase64(obj, path = '') {
  const found = [];
  if (typeof obj === 'string' && obj.startsWith('data:')) {
    const m = obj.match(/^data:([^;]+);base64,(.+)$/s);
    if (m) found.push({ path, mime: m[1], data: m[2] });
  } else if (Array.isArray(obj)) {
    obj.forEach((v, i) => found.push(...findBase64(v, `${path}-${i}`)));
  } else if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      found.push(...findBase64(v, path ? `${path}-${k}` : k));
    }
  }
  return found;
}

function setNested(obj, pathStr, value) {
  // pathStr is like "logourl" or "gallerysections-0-subsections-0-photos-0-url"
  // We match on the path slugified key to find and replace in the clean JSON
  // Actually simpler: rebuild clean JSON by replacing base64 values directly
}

console.log('📦 Reading villa-content.json...');
const raw = readFileSync(SOURCE, 'utf-8');
const content = JSON.parse(raw);

const images = findBase64(content);
console.log(`Found ${images.length} base64 images\n`);

let uploaded = 0, failed = 0;

for (const { path, mime, data } of images) {
  const ext = MIME_EXT[mime] || 'bin';
  const key = `${slugify(path)}.${ext}`;
  const tmp = join(tmpdir(), `villa-img-${Date.now()}.${ext}`);

  writeFileSync(tmp, Buffer.from(data, 'base64'));

  try {
    execSync(
      `npx wrangler r2 object put "${BUCKET}/${key}" --file="${tmp}" --content-type="${mime}" `,
      { stdio: 'pipe' }
    );
    console.log(`  ✓ ${key} (${Math.round(Buffer.from(data,'base64').length/1024)}KB)`);
    uploaded++;
  } catch (e) {
    console.error(`  ✗ ${key}: ${e.message.slice(0,100)}`);
    failed++;
  } finally {
    try { execSync(`rm -f "${tmp}"`); } catch {}
  }
}

console.log(`\n✓ Uploaded: ${uploaded}  ✗ Failed: ${failed}`);
console.log('\nDone! Images should now be live at /images/<key>');
