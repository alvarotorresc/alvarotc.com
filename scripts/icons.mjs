import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import satori from 'satori';
import sharp from 'sharp';

const BG = '#0f1115';
const FG = '#4f8ef7';
const GLYPH = 'A';

const FONT_DIR = 'node_modules/@fontsource/manrope/files';
const fontBold = readFileSync(resolve(process.cwd(), FONT_DIR, 'manrope-latin-700-normal.woff'));

async function renderIcon(size, glyphRatio) {
  const fontSize = Math.round(size * glyphRatio);
  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: BG,
        },
        children: {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              fontSize: `${fontSize}px`,
              fontWeight: 700,
              lineHeight: 1,
              color: FG,
              fontFamily: 'Manrope',
            },
            children: GLYPH,
          },
        },
      },
    },
    {
      width: size,
      height: size,
      fonts: [{ name: 'Manrope', data: fontBold, weight: 700, style: 'normal' }],
    },
  );

  return sharp(Buffer.from(svg)).flatten({ background: BG }).png().toBuffer();
}

async function writeIcon(fileName, size, glyphRatio) {
  const png = await renderIcon(size, glyphRatio);
  const output = resolve(process.cwd(), 'public', fileName);
  writeFileSync(output, png);
  const meta = await sharp(png).metadata();
  console.log(`${fileName}: ${meta.width}x${meta.height}, ${(png.length / 1024).toFixed(1)} KB`);
}

await writeIcon('apple-touch-icon.png', 180, 0.5);
await writeIcon('icon-192.png', 192, 0.5);
await writeIcon('icon-512.png', 512, 0.5);
await writeIcon('icon-maskable-512.png', 512, 0.4);

const manifestPath = resolve(process.cwd(), 'public/manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

manifest.icons = [
  { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
  { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
  { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
  { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
];

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log('manifest.json updated');
