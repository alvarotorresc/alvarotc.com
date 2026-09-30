import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import satori from 'satori';
import sharp from 'sharp';
import { getSiteName } from './config';

interface OGImageOptions {
  title: string;
  subtitle?: string;
}

const FONT_DIR = 'node_modules/@fontsource/manrope/files';

let fontRegular: Buffer | null = null;
let fontBold: Buffer | null = null;

function loadFonts(): { regular: Buffer; bold: Buffer } {
  if (!fontRegular) {
    fontRegular = readFileSync(resolve(process.cwd(), FONT_DIR, 'manrope-latin-400-normal.woff'));
  }
  if (!fontBold) {
    fontBold = readFileSync(resolve(process.cwd(), FONT_DIR, 'manrope-latin-700-normal.woff'));
  }
  return { regular: fontRegular, bold: fontBold };
}

export async function generateOGImage(options: OGImageOptions): Promise<Buffer> {
  const fonts = loadFonts();

  const svg = await satori(
    // @ts-expect-error satori accepts this format but types don't match ReactNode
    {
      type: 'div',
      props: {
        style: {
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px',
          backgroundColor: '#0f1115',
          fontFamily: 'Manrope',
          position: 'relative',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '24px',
                      fontWeight: 700,
                      color: '#4f8ef7',
                      textTransform: 'uppercase',
                      letterSpacing: '2px',
                    },
                    children: getSiteName(),
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '56px',
                      fontWeight: 700,
                      color: '#e7e9ee',
                      lineHeight: 1.2,
                      maxWidth: '900px',
                    },
                    children: options.title,
                  },
                },
                options.subtitle
                  ? {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: '24px',
                          color: '#9aa3b2',
                          marginTop: '8px',
                        },
                        children: options.subtitle,
                      },
                    }
                  : null,
              ].filter(Boolean),
            },
          },
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                bottom: '60px',
                left: '60px',
                right: '60px',
                height: '4px',
                backgroundColor: '#4f8ef7',
              },
              children: '',
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Manrope', data: fonts.regular, weight: 400, style: 'normal' },
        { name: 'Manrope', data: fonts.bold, weight: 700, style: 'normal' },
      ],
    },
  );

  return sharp(Buffer.from(svg)).png().toBuffer();
}
