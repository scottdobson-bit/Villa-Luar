#!/usr/bin/env node
import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const THEME_COLOR = '#1a1a1a';
const PLATE_COLOR = '#1a1a1a';
const APP_NAME = 'Villa Luar';
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

// Create squircle mask SVG
function createSquircleMaskSVG(size = 1024) {
  const cornerRadius = size * 0.2;
  return Buffer.from(`<svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <mask id="squircle" x="0" y="0" width="${size}" height="${size}">
        <rect width="${size}" height="${size}" fill="white"/>
        <path d="M ${cornerRadius} 0
                 L ${size - cornerRadius} 0
                 Q ${size} 0 ${size} ${cornerRadius}
                 L ${size} ${size - cornerRadius}
                 Q ${size} ${size} ${size - cornerRadius} ${size}
                 L ${cornerRadius} ${size}
                 Q 0 ${size} 0 ${size - cornerRadius}
                 L 0 ${cornerRadius}
                 Q 0 0 ${cornerRadius} 0 Z"
              fill="black" stroke="none"/>
      </mask>
    </defs>
    <rect width="${size}" height="${size}" fill="white" mask="url(#squircle)"/>
  </svg>`);
}

async function generateIcons() {
  console.log('🎨 Generating squircle icons for', APP_NAME);

  const publicDir = path.join(projectRoot, 'public');
  const iconsDir = path.join(publicDir, 'icons');
  const brandDir = path.join(projectRoot, 'brand', 'icons');

  // Ensure directories exist
  await fs.mkdir(iconsDir, { recursive: true });
  await fs.mkdir(brandDir, { recursive: true });

  const inputPath = path.join(publicDir, 'favicon.svg');

  // Read and convert SVG to PNG at 1024x1024
  const svgBuffer = await fs.readFile(inputPath);
  const master1024 = await sharp(svgBuffer)
    .resize(1024, 1024, { fit: 'contain', background: PLATE_COLOR })
    .png()
    .toBuffer();

  // Save master
  await fs.writeFile(path.join(brandDir, 'source-1024.png'), master1024);
  console.log('✓ Source 1024x1024 saved');

  // Create squircle mask and apply it
  const maskSvg = createSquircleMaskSVG(1024);
  const maskBuffer = await sharp(maskSvg)
    .resize(1024, 1024)
    .png()
    .toBuffer();

  // Apply mask using composite
  const maskedIcon = await sharp(master1024)
    .composite([{ input: maskBuffer, blend: 'dest-in' }])
    .png()
    .toBuffer();

  console.log('✓ Squircle mask applied');

  // Generate all required sizes
  const sizes = {
    'favicon-16.png': 16,
    'favicon-32.png': 32,
    'favicon-96.png': 96,
    'apple-touch-icon.png': 180,
    'apple-touch-icon-120.png': 120,
    'apple-touch-icon-152.png': 152,
    'apple-touch-icon-167.png': 167,
    'icons/icon-72.png': 72,
    'icons/icon-96.png': 96,
    'icons/icon-128.png': 128,
    'icons/icon-144.png': 144,
    'icons/icon-152.png': 152,
    'icons/icon-192.png': 192,
    'icons/icon-256.png': 256,
    'icons/icon-384.png': 384,
    'icons/icon-512.png': 512,
  };

  for (const [filename, size] of Object.entries(sizes)) {
    const iconBuffer = await sharp(maskedIcon)
      .resize(size, size, { fit: 'cover' })
      .png()
      .toBuffer();

    const outputPath = path.join(publicDir, filename);
    await fs.writeFile(outputPath, iconBuffer);
    console.log(`✓ Generated ${filename} (${size}x${size})`);
  }

  // Create OG image (1200x630)
  await sharp({
    create: {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      channels: 3,
      background: PLATE_COLOR
    }
  })
    .composite([{
      input: await sharp(maskedIcon)
        .resize(400, 400)
        .png()
        .toBuffer(),
      left: Math.floor((OG_WIDTH - 400) / 2),
      top: Math.floor((OG_HEIGHT - 400) / 2),
      blend: 'over'
    }])
    .png()
    .toFile(path.join(publicDir, 'og-image.png'));

  console.log('✓ Generated og-image.png (1200x630)');

  // Generate head snippet
  const headSnippet = `<!-- App Icons & Manifests -->
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
<link rel="icon" type="image/png" sizes="96x96" href="/favicon-96.png" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120.png" />
<link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152.png" />
<link rel="apple-touch-icon" sizes="167x167" href="/apple-touch-icon-167.png" />
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="${THEME_COLOR}" />`;

  await fs.writeFile(
    path.join(publicDir, 'icons-head-snippet.html'),
    headSnippet
  );

  console.log('✓ Generated icons-head-snippet.html');

  // Update manifest.json if it exists
  const manifestPath = path.join(publicDir, 'manifest.json');
  let manifest = { icons: [] };

  try {
    const existing = await fs.readFile(manifestPath, 'utf-8');
    manifest = JSON.parse(existing);
  } catch (e) {
    // No existing manifest, create new
  }

  manifest.icons = [
    { src: '/icons/icon-72.png', sizes: '72x72', type: 'image/png' },
    { src: '/icons/icon-96.png', sizes: '96x96', type: 'image/png' },
    { src: '/icons/icon-128.png', sizes: '128x128', type: 'image/png' },
    { src: '/icons/icon-144.png', sizes: '144x144', type: 'image/png' },
    { src: '/icons/icon-152.png', sizes: '152x152', type: 'image/png' },
    { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: '/icons/icon-256.png', sizes: '256x256', type: 'image/png' },
    { src: '/icons/icon-384.png', sizes: '384x384', type: 'image/png' },
    { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ];

  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('✓ Updated manifest.json');

  console.log('\n✨ Icon set generation complete!');
  console.log('\nNext: Copy the contents of public/icons-head-snippet.html into your index.html <head>');
}

generateIcons().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
