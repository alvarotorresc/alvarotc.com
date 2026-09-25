import { register } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import satori from 'satori';
import sharp from 'sharp';

register(new URL('./lib/ts-loader.mjs', import.meta.url));

const { generateOGImage } = await import(new URL('../src/lib/og.ts', import.meta.url).href);

const TITLE = 'Álvaro Torres Carrasco';
const SUBTITLE =
  'Software Engineer · Backend developer. Offline-first apps, self-hosted infrastructure, free software.';
const DOMAIN = 'alvarotc.com';
const OUTPUT = resolve(process.cwd(), 'public/og-default.png');

const fontRegular = readFileSync(
  resolve(process.cwd(), 'node_modules/@fontsource/manrope/files/manrope-latin-400-normal.woff'),
);

async function renderDomainOverlay() {
  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          height: '100%',
          width: '100%',
          display: 'flex',
          position: 'relative',
        },
        children: {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              bottom: '15px',
              left: '60px',
              display: 'flex',
              fontSize: '22px',
              fontWeight: 400,
              color: '#9aa3b2',
              letterSpacing: '0.5px',
              fontFamily: 'Manrope',
            },
            children: DOMAIN,
          },
        },
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [{ name: 'Manrope', data: fontRegular, weight: 400, style: 'normal' }],
    },
  );

  return sharp(Buffer.from(svg)).png().toBuffer();
}

const [base, overlay] = await Promise.all([
  generateOGImage({ title: TITLE, subtitle: SUBTITLE }),
  renderDomainOverlay(),
]);

const png = await sharp(base)
  .composite([{ input: overlay }])
  .png()
  .toBuffer();

writeFileSync(OUTPUT, png);

const meta = await sharp(png).metadata();
console.log(`og-default.png: ${meta.width}x${meta.height}, ${(png.length / 1024).toFixed(1)} KB`);
