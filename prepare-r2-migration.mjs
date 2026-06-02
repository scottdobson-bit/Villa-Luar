/**
 * Villa Luar — R2 Migration Prep (safe/offline companion to migrate-images-to-r2.mjs)
 *
 * What it does:
 *   1. Reads   public/villa-content.json
 *   2. Extracts every base64 image to   ./r2-upload/<slug>.<ext>
 *   3. Writes  public/villa-content.migrated.json  with the CDN URLs swapped in
 *   4. Writes  ./upload-r2.sh                     (batch `wrangler r2 object put` script)
 *   5. Writes  ./r2-upload/manifest.json          (audit trail)
 *
 * Running this does NOT touch Cloudflare. You then:
 *   - Log in once:   npx wrangler login
 *   - Upload:        bash upload-r2.sh
 *   - Swap:          mv public/villa-content.migrated.json public/villa-content.json
 *   - Ship:          npm run build && npm run deploy
 *
 * Re-runnable — deletes and regenerates ./r2-upload/ each time.
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync, chmodSync, statSync } from 'fs';
import { join } from 'path';

// ── Configuration ────────────────────────────────────────────────────────
const IN_FILE    = 'public/villa-content.json';
const OUT_FILE   = 'public/villa-content.migrated.json';
const IMG_DIR    = 'r2-upload';
const UPLOAD_SH  = 'upload-r2.sh';
const BUCKET     = 'villa-luar-images';
// If you serve via worker.ts this stays /images on your apex domain.
// Change to a custom subdomain or pub-*.r2.dev if you prefer.
const BASE_URL   = 'https://villaluar.com/images';
// ─────────────────────────────────────────────────────────────────────────

const MIME2EXT = {
  'image/jpeg':    'jpg',
  'image/jpg':     'jpg',
  'image/png':     'png',
  'image/webp':    'webp',
  'image/gif':     'gif',
  'image/svg+xml': 'svg',
};

const slugify = (path) =>
  path
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// Fresh r2-upload/
try { rmSync(IMG_DIR, { recursive: true, force: true }); } catch {}
mkdirSync(IMG_DIR, { recursive: true });

const raw = readFileSync(IN_FILE, 'utf8');
const inputSize = Math.round(raw.length / 1024);
const data = JSON.parse(raw);

const manifest = [];

const DATA_URL_RE = /^data:(image\/[a-zA-Z+]+);base64,(.+)$/s;

function transform(node, path = '') {
  if (node === null || node === undefined) return node;

  if (Array.isArray(node)) {
    return node.map((v, i) => transform(v, `${path}[${i}]`));
  }

  if (typeof node === 'object') {
    for (const k of Object.keys(node)) {
      node[k] = transform(node[k], path ? `${path}.${k}` : k);
    }
    return node;
  }

  if (typeof node === 'string' && node.startsWith('data:image')) {
    const m = node.match(DATA_URL_RE);
    if (!m) return node;

    const mime = m[1];
    const b64  = m[2];
    const ext  = MIME2EXT[mime] || 'bin';
    const key  = `${slugify(path)}.${ext}`;
    const file = join(IMG_DIR, key);
    const buf  = Buffer.from(b64, 'base64');

    writeFileSync(file, buf);
    manifest.push({ key, mime, size_kb: Math.round(buf.length / 1024), path });

    return `${BASE_URL}/${key}`;
  }

  return node;
}

transform(data);

writeFileSync(OUT_FILE, JSON.stringify(data, null, 2));
writeFileSync(join(IMG_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));

// Upload script
const lines = [
  '#!/usr/bin/env bash',
  '# Villa Luar — batch-upload extracted images to R2.',
  '# Prerequisite:  npx wrangler login   (one-time)',
  'set -euo pipefail',
  '',
  `BUCKET=${BUCKET}`,
  'CACHE="public, max-age=31536000, immutable"',
  '',
  `echo "Uploading ${manifest.length} images to $BUCKET…"`,
  '',
];
for (const m of manifest) {
  lines.push(
    `npx wrangler r2 object put "$BUCKET/${m.key}" \\`,
    `  --file="${IMG_DIR}/${m.key}" \\`,
    `  --content-type="${m.mime}" \\`,
    `  --cache-control="$CACHE" --remote`,
    ''
  );
}
lines.push(
  'echo "✓ Uploaded. Next: mv public/villa-content.migrated.json public/villa-content.json"',
  'echo "Then: npm run build && npm run deploy"',
  ''
);
writeFileSync(UPLOAD_SH, lines.join('\n'));
chmodSync(UPLOAD_SH, 0o755);

const outSize = Math.round(statSync(OUT_FILE).size / 1024);
const imgTotal = manifest.reduce((s, m) => s + m.size_kb, 0);

console.log('=== Villa Luar — R2 Migration Prep ===\n');
console.log(`Input            : ${IN_FILE}   (${inputSize} KB)`);
console.log(`Migrated JSON    : ${OUT_FILE}  (${outSize} KB)`);
console.log(`Extracted images : ${manifest.length}  (~${imgTotal} KB total)`);
console.log(`Upload script    : ${UPLOAD_SH}`);
console.log(`Manifest         : ${IMG_DIR}/manifest.json`);
console.log('\nNext:');
console.log('  1. npx wrangler login        # one-time');
console.log('  2. bash upload-r2.sh         # uploads all images');
console.log(`  3. mv ${OUT_FILE} ${IN_FILE}`);
console.log('  4. npm run build && npm run deploy');
