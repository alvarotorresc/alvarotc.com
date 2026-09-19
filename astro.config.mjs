import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://alvarotc.com',
  integrations: [
    react(),
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', es: 'es' },
      },
    }),
  ],
  output: 'static',
  build: { inlineStylesheets: 'auto' },
  vite: {
    plugins: [tailwindcss()],
    ssr: { noExternal: ['framer-motion'] },
    build: { assetsInlineLimit: 0 },
  },
});
