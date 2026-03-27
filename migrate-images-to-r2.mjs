/**
 * Villa Luar — Image Migration Script
 * Extracts base64 images from villa-content.json, uploads to R2, and
 * writes a new villa-content.json with CDN URLs replacing the base64 blobs.
 *
 * Usage:
 *   node migrate-images-to-r2.mjs
 *
 * Requirements:
 *   - `wrangler` authenticated locally (run `npx wrangler login` first)
 *   - R2 bucket `villa-luar-images` must exist (already created)
 *   - Set IMAGE_BASE_URL below to your bucket's public URL
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync, unlinkSync } from 'fs';
import { join, extname } from 'path';
import { tmpdir } from 'os';

// ── Configuration ──────────────────────────────────────────────────────────
const R2_BUCKET       = 'villa-luar-images';
const CONTENT_FILE    = './villa-content.json';
const OUTPUT_FILE     = './villa-content.json';    // overwrites in place
const BACKUP_FILE     = './villa-content.backup.json';

// Set this to your R2 bucket's public URL.
// Option A (r2.dev) — enable it in Cloudflare dashboard → R2 → villa-luar-images → Settings → Public Access
//   https://pub-XXXX.r2.dev
// Option B (custom domain) — e.g. https://images.villaluar.com
// Option C (Worker path) — https://villaluar.com/images  ← default if you deploy worker.ts
const IMAGE_BASE_URL  = 'https://villaluar.com/images';
// ───────────────────────────────────────────────────────────────────────────

const MIME_TO_EXT = {
  'image/jpeg': 'jpg',
  'image/png':  'png',
  'image/webp': 'webp',
  'image/gif':  'gif',
  'image/svg+xml': 'svg',
};

let uploadCount  = 0;
let skipCount    = 0;
let errorCount   = 0;

function parseDataUrl(dataUrl) {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/s);
  if (!match) return null;
  return { mime: match[1], b64: match[2] };
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function uploadToR2(key, buffer, mime) {
  const tmpFile = join(tmpdir(), `vl-upload-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  try {
    writeFileSync(tmpFile, buffer);
    execSync(
      `npx wrangler r2 object put "${R2_BUCKET}/${key}" --file="${tmpFile}" --content-type="${mime}" --cache-control="public, max-age=31536000, immutable"`,
      { stdio: 'pipe' }
    );
    return true;
  } catch (e) {
    console.error(`  ✗ Failed to upload ${key}:`, e.message.split('\n')[0]);
    return false;
  } finally {
    try { unlinkSync(tmpFile); } catch {}
  }
}

function processImages(obj, context = '') {
  if (!obj || typeof obj !== 'object') return obj;

  for (const [key, value] of Object.entries(obj)) {
    const path = context ? `${context}.${key}` : key;

    if (typeof value === 'string' && value.startsWith('data:image')) {
      const parsed = parseDataUrl(value);
      if (!parsed) { skipCount++; continue; }

      const ext      = MIME_TO_EXT[parsed.mime] || 'bin';
      const filename = `${slugify(path).replace(/\./g, '-')}.${ext}`;
      const r2Key    = filename;
      const cdnUrl   = `${IMAGE_BASE_URL}/${r2Key}`;

      process.stdout.write(`  Uploading ${path} (${Math.round(value.length / 1024)}KB) → ${r2Key} … `);

      const buffer = Buffer.from(parsed.b64, 'base64');
      const ok     = uploadToR2(r2Key, buffer, parsed.mime);

      if (ok) {
        obj[key] = cdnUrl;
        console.log('✓');
        uploadCount++;
      } else {
        errorCount++;
      }
    } else if (Array.isArray(value)) {
      value.forEach((item, i) => processImages(item, `${path}[${i}]`));
    } else if (typeof value === 'object' && value !== null) {
      processImages(value, path);
    }
  }

  return obj;
}

// ── Main ───────────────────────────────────────────────────────────────────

console.log('=== Villa Luar — R2 Image Migration ===\n');
console.log(`Bucket  : ${R2_BUCKET}`);
console.log(`Base URL: ${IMAGE_BASE_URL}\n`);

// Backup
const raw     = readFileSync(CONTENT_FILE, 'utf8');
writeFileSync(BACKUP_FILE, raw);
console.log(`✓ Backup written to ${BACKUP_FILE}\n`);

const content = JSON.parse(raw);
const before  = Math.round(raw.length / 1024);

console.log('Uploading images…\n');
processImages(content);

console.log(`\n── Summary ──`);
console.log(`  Uploaded : ${uploadCount}`);
console.log(`  Skipped  : ${skipCount}`);
console.log(`  Errors   : ${errorCount}`);

if (errorCount > 0) {
  console.error('\n⚠  Some uploads failed. Fix the errors above and re-run — already-uploaded images will be overwritten (safe).');
  process.exit(1);
}

const newJson = JSON.stringify(content, null, 2);
const after   = Math.round(newJson.length / 1024);
writeFileSync(OUTPUT_FILE, newJson);

console.log(`\n  JSON size: ${before}KB → ${after}KB`);
console.log(`\n✓ ${OUTPUT_FILE} written with CDN URLs.\n`);
console.log('Next steps:');
console.log('  1. Copy the updated villa-content.json to public/ if you want it bundled in the build');
console.log('  2. Deploy: npx wrangler deploy  (or push to your Pages branch)');
console.log('  3. Verify images load at:', IMAGE_BASE_URL + '/...');
