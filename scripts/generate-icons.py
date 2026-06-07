#!/usr/bin/env python3
import os
import subprocess
import json
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
PUBLIC_DIR = PROJECT_ROOT / 'public'
ICONS_DIR = PUBLIC_DIR / 'icons'
BRAND_DIR = PROJECT_ROOT / 'brand' / 'icons'
INPUT_SVG = PUBLIC_DIR / 'favicon.svg'

THEME_COLOR = '#1a1a1a'
PLATE_COLOR = '#1a1a1a'
APP_NAME = 'Villa Luar'

def run_cmd(cmd):
    """Run a shell command"""
    print(f"  $ {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"❌ Error: {result.stderr}")
        raise Exception(f"Command failed: {' '.join(cmd)}")
    return result.stdout

def create_squircle_mask(size=1024):
    """Create squircle mask SVG"""
    corner_radius = int(size * 0.2)
    svg = f"""<svg viewBox="0 0 {size} {size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="smooth">
      <feGaussianBlur in="SourceGraphic" stdDeviation="0.5"/>
    </filter>
  </defs>
  <rect width="{size}" height="{size}" fill="white" rx="{corner_radius}" ry="{corner_radius}"/>
</svg>"""
    return svg

def generate_icons():
    print(f"🎨 Generating squircle icons for {APP_NAME}")

    # Create directories
    ICONS_DIR.mkdir(parents=True, exist_ok=True)
    BRAND_DIR.mkdir(parents=True, exist_ok=True)

    # Convert SVG to PNG at 1024x1024
    master_1024 = BRAND_DIR / 'source-1024.png'
    print(f"✓ Converting SVG to 1024x1024 PNG...")
    run_cmd(['convert', '-background', PLATE_COLOR, '-density', '300',
             str(INPUT_SVG), '-resize', '1024x1024', '-gravity', 'center',
             '-extent', '1024x1024', '-background', PLATE_COLOR, str(master_1024)])
    print(f"  → {master_1024}")

    # Create squircle mask
    print(f"✓ Applying squircle mask...")
    mask_svg_path = BRAND_DIR / 'mask.svg'
    with open(mask_svg_path, 'w') as f:
        f.write(create_squircle_mask(1024))

    # Apply mask to create rounded icon
    masked_icon = BRAND_DIR / 'source-masked.png'
    run_cmd(['convert', str(master_1024),
             '\\(', mask_svg_path.with_suffix('.png').as_posix(), '-alpha', 'on', '\\)',
             '-compose', 'DstIn', '-composite',
             str(masked_icon)])

    # If masked file doesn't exist, use original with rounded corners instead
    if not masked_icon.exists():
        print(f"  Using rounded corners instead of mask...")
        run_cmd(['convert', str(master_1024),
                 '-background', PLATE_COLOR, '-alpha', 'off',
                 '-define', 'connected-components:verbose=false',
                 '\\(', '+clone', '-alpha', 'extract',
                 '-draw', 'fill black polygon 0,0 0,50 50,0 fill white circle 50,50 50,0',
                 '-trim', '+repage', '-write', 'mpr:arc', '+delete', '\\)',
                 '-gravity', 'northwest', '-composite',
                 '\\(', 'mpr:arc', '-flip', '\\)', '-gravity', 'northeast', '-composite',
                 '\\(', 'mpr:arc', '-rotate', '180', '\\)', '-gravity', 'southeast', '-composite',
                 '\\(', 'mpr:arc', '-flop', '\\)', '-gravity', 'southwest', '-composite',
                 str(masked_icon)])

    source_for_icons = masked_icon if masked_icon.exists() else master_1024

    print(f"✓ Squircle mask applied")

    # Generate all icon sizes
    sizes = {
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
    }

    for filename, size in sizes.items():
        output_path = PUBLIC_DIR / filename
        output_path.parent.mkdir(parents=True, exist_ok=True)
        run_cmd(['convert', str(source_for_icons),
                 '-resize', f'{size}x{size}',
                 '-background', PLATE_COLOR,
                 '-gravity', 'center',
                 '-extent', f'{size}x{size}',
                 str(output_path)])
        print(f"✓ Generated {filename} ({size}x{size})")

    # Create OG image
    print(f"✓ Generating OG image...")
    run_cmd(['convert', '-size', '1200x630', f'xc:{PLATE_COLOR}',
             str(source_for_icons), '-resize', '400x400',
             '-gravity', 'center', '-composite',
             str(PUBLIC_DIR / 'og-image.png')])
    print(f"✓ Generated og-image.png (1200x630)")

    # Generate head snippet
    head_snippet = f"""<!-- App Icons & Manifests -->
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
<link rel="icon" type="image/png" sizes="96x96" href="/favicon-96.png" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120.png" />
<link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152.png" />
<link rel="apple-touch-icon" sizes="167x167" href="/apple-touch-icon-167.png" />
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="{THEME_COLOR}" />"""

    snippet_path = PUBLIC_DIR / 'icons-head-snippet.html'
    with open(snippet_path, 'w') as f:
        f.write(head_snippet)
    print(f"✓ Generated icons-head-snippet.html")

    # Update manifest.json
    manifest_path = PUBLIC_DIR / 'manifest.json'
    manifest = {}
    if manifest_path.exists():
        with open(manifest_path) as f:
            manifest = json.load(f)

    manifest['icons'] = [
        {'src': '/icons/icon-72.png', 'sizes': '72x72', 'type': 'image/png'},
        {'src': '/icons/icon-96.png', 'sizes': '96x96', 'type': 'image/png'},
        {'src': '/icons/icon-128.png', 'sizes': '128x128', 'type': 'image/png'},
        {'src': '/icons/icon-144.png', 'sizes': '144x144', 'type': 'image/png'},
        {'src': '/icons/icon-152.png', 'sizes': '152x152', 'type': 'image/png'},
        {'src': '/icons/icon-192.png', 'sizes': '192x192', 'type': 'image/png', 'purpose': 'any'},
        {'src': '/icons/icon-256.png', 'sizes': '256x256', 'type': 'image/png'},
        {'src': '/icons/icon-384.png', 'sizes': '384x384', 'type': 'image/png'},
        {'src': '/icons/icon-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'maskable'},
    ]

    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)
    print(f"✓ Updated manifest.json")

    print(f"\n✨ Icon set generation complete!")
    print(f"\nNext: Copy the contents of public/icons-head-snippet.html into your index.html <head>")

if __name__ == '__main__':
    try:
        generate_icons()
    except Exception as e:
        print(f"❌ Error: {e}")
        exit(1)
