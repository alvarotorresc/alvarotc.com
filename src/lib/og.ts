import satori from 'satori';
import sharp from 'sharp';
import { getSiteName } from './config';

interface OGImageOptions {
  title: string;
  subtitle?: string;
}

let fontRegular: ArrayBuffer | null = null;
let fontBold: ArrayBuffer | null = null;

async function loadFonts() {
  if (!fontRegular || !fontBold) {
    const [regular, bold] = await Promise.all([
      fetch(
        'https://cdn.jsdelivr.net/fontsource/fonts/plus-jakarta-sans@latest/latin-400-normal.ttf',
      ).then((r) => r.arrayBuffer()),
      fetch(
        'https://cdn.jsdelivr.net/fontsource/fonts/plus-jakarta-sans@latest/latin-700-normal.ttf',
      ).then((r) => r.arrayBuffer()),
    ]);
    fontRegular = regular;
    fontBold = bold;
  }
  return { regular: fontRegular, bold: fontBold };
}

export async function generateOGImage(options: OGImageOptions): Promise<Buffer> {
  const fonts = await loadFonts();

  const svg = await satori(
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
          backgroundColor: '#0a0a0f',
          fontFamily: 'Plus Jakarta Sans',
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
                      color: '#818cf8',
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
                      color: '#e8e8ea',
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
                          color: '#9ca3af',
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
                background: 'linear-gradient(135deg, #818cf8, #6366f1)',
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
        {
          name: 'Plus Jakarta Sans',
          data: fonts.regular,
          weight: 400,
          style: 'normal',
        },
        {
          name: 'Plus Jakarta Sans',
          data: fonts.bold,
          weight: 700,
          style: 'normal',
        },
      ],
    },
  );

  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return png;
}

export async function generateDefaultOGImage(): Promise<Buffer> {
  return generateOGImage({
    title: 'Full Stack Developer & Product Builder',
    subtitle: 'TypeScript • React • Astro • Node.js',
  });
}
