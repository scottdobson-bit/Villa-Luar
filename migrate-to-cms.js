#!/usr/bin/env node
/**
 * Villa Luar — CMS Migration Script
 *
 * 1. Reads villa-content.json
 * 2. Extracts all base64 images → uploads to R2 via wrangler
 * 3. Replaces base64 values with /images/<key> URLs
 * 4. Writes clean JSON to public/villa-content.json (fallback)
 * 5. Seeds the KV namespace with the clean JSON
 *
 * Run from the project root: node migrate-to-cms.js
 * Requires: wrangler auth (run `npx wrangler login` first if needed)
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import os from 'os';

const R2_BUCKET = 'villa-luar-images';
const KV_NAMESPACE_ID = '09868a9ddd57433eb24cd4c1db97630f';
const KV_KEY = 'villa-content';
const CONTENT_FILE = './villa-content.json';

const MIME_TO_EXT = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'image/gif': 'gif',
};

let uploadCount = 0;
let skipCount = 0;

function slugify(path) {
  return path
    .replace(/\[(\d+)\]/g, '-$1')
    .replace(/\./g, '-')
    .replace(/^-/, '')
    .toLowerCase();
}

function uploadToR2(key, mimeType, base64Data) {
  const ext = MIME_TO_EXT[mimeType] || 'bin';
  const fullKey = `${key}.${ext}`;

  // Write to a temp file then upload via wrangler
  const tmpFile = join(os.tmpdir(), `villa-upload-${Date.now()}.${ext}`);
  const buffer = Buffer.from(base64Data, 'base64');
  writeFileSync(tmpFile, buffer);

  try {
    execSync(
      `npx wrangler r2 object put "${R2_BUCKET}/${fullKey}" --file="${tmpFile}" --content-type="${mimeType}"`,
      { stdio: 'pipe' }
    );
    uploadCount++;
    console.log(`  ✓ /images/${fullKey} (${Math.round(buffer.length / 1024)}KB)`);
    return `/images/${fullKey}`;
  } catch (err) {
    console.error(`  ✗ Failed to upload ${fullKey}:`, err.message);
    return null;
  } finally {
    try { execSync(`rm "${tmpFile}"`); } catch {}
  }
}

function processValue(value, fieldPath) {
  if (typeof value !== 'string') return value;
  if (!value.startsWith('data:')) return value;

  const match = value.match(/^data:([^;]+);base64,(.+)$/s);
  if (!match) return value;

  const [, mimeType, base64Data] = match;
  const key = slugify(fieldPath);

  // Check if already uploaded (re-run safety)
  try {
    execSync(`npx wrangler r2 object get "${R2_BUCKET}/${key}.${MIME_TO_EXT[mimeType] || 'bin'}" --pipe 2>/dev/null`, {
      stdio: 'pipe'
    });
    const ext = MIME_TO_EXT[mimeType] || 'bin';
    skipCount++;
    console.log(`  → /images/${key}.${ext} (already exists, skipping)`);
    return `/images/${key}.${ext}`;
  } catch {
    // Doesn't exist yet, upload it
    const url = uploadToR2(key, mimeType, base64Data);
    return url || value; // fall back to original if upload fails
  }
}

function processObject(obj, path = '') {
  if (typeof obj === 'string') {
    return processValue(obj, path);
  }
  if (Array.isArray(obj)) {
    return obj.map((item, i) => processObject(item, `${path}-${i}`));
  }
  if (obj && typeof obj === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      const fieldPath = path ? `${path}-${key}` : key;
      result[key] = processObject(value, fieldPath);
    }
    return result;
  }
  return obj;
}

// ── Main ─────────────────────────────────────────────────────────────────────

console.log('📦 Villa Luar CMS Migration\n');
console.log('Reading villa-content.json...');
const raw = readFileSync(CONTENT_FILE, 'utf-8');
const content = JSON.parse(raw);
console.log(`  File size: ${Math.round(raw.length / 1024)}KB\n`);

console.log('Uploading images to R2...');
const cleaned = processObject(content);

console.log(`\n✓ Uploaded: ${uploadCount} | Skipped (already exist): ${skipCount}\n`);

// Write clean JSON locally as a backup
const cleanJson = JSON.stringify(cleaned, null, 2);
writeFileSync('./villa-content-clean.json', cleanJson);
console.log(`Wrote villa-content-clean.json (${Math.round(cleanJson.length / 1024)}KB)`);

// Seed KV namespace
console.log('\nSeeding KV namespace...');
const tmpKv = join(os.tmpdir(), 'villa-kv-seed.json');
writeFileSync(tmpKv, cleanJson);
try {
  execSync(
    `npx wrangler kv key put --namespace-id="${KV_NAMESPACE_ID}" "${KV_KEY}" --path="${tmpKv}"`,
    { stdio: 'inherit' }
  );
  console.log('✓ KV seeded successfully');
} catch (err) {
  console.error('✗ KV seed failed:', err.message);
  console.log('  You can seed manually: npx wrangler kv key put --namespace-id="' + KV_NAMESPACE_ID + '" "' + KV_KEY + '" --path="./villa-content-clean.json"');
} finally {
  try { execSync(`rm "${tmpKv}"`); } catch {}
}

console.log('\n🎉 Migration complete!');
console.log('Next steps:');
console.log('  1. Check villa-content-clean.json looks correct');
console.log('  2. Update wrangler.json with KV binding (see below)');
console.log('  3. Deploy: npx wrangler deploy\n');
console.log('Add to wrangler.json:');
console.log(JSON.stringify({
  kv_namespaces: [{ binding: 'VILLA_CONTENT', id: KV_NAMESPACE_ID }]
}, null, 2));
