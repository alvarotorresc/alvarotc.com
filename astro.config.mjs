import { readdirSync, readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const SITE = 'https://alvarotc.com';

const readFm = (dir) =>
  readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const src = readFileSync(`${dir}/${f}`, 'utf8');
      const fm = src.split('---')[1] ?? '';
      const get = (k) => fm.match(new RegExp(`^${k}:\\s*['"]?([^'"\\n]+)`, 'm'))?.[1]?.trim();
      return { id: f.replace(/\.md$/, ''), source: get('source'), date: get('updated') ?? get('date') };
    });

const en = readFm('./src/content/posts-en');
const es = readFm('./src/content/posts');

const pairs = new Map();
const lastmod = new Map();
for (const p of en) {
  const enUrl = `${SITE}/blog/${p.id}/`;
  lastmod.set(enUrl, p.date);
  if (p.source) {
    const esUrl = `${SITE}/es/blog/${p.source}/`;
    pairs.set(enUrl, { en: enUrl, es: esUrl });
    pairs.set(esUrl, { en: enUrl, es: esUrl });
  }
}
for (const p of es) lastmod.set(`${SITE}/es/blog/${p.id}/`, p.date);

const alternatesFor = (url) => {
  if (pairs.has(url)) return pairs.get(url);
  const t = url.match(/^https:\/\/alvarotc\.com\/(?:blog\/topic|es\/blog\/tema)\/([^/]+)\/(\d+\/)?$/);
  if (t) return { en: `${SITE}/blog/topic/${t[1]}/${t[2] ?? ''}`, es: `${SITE}/es/blog/tema/${t[1]}/${t[2] ?? ''}` };
  return null;
};

export default defineConfig({
  site: 'https://alvarotc.com',
  integrations: [
    react(),
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', es: 'es' },
      },
      serialize(item) {
        const alt = alternatesFor(item.url);
        if (alt) {
          item.links = [
            { lang: 'en', url: alt.en },
            { lang: 'es', url: alt.es },
            { lang: 'x-default', url: alt.en },
          ];
        }
        const d = lastmod.get(item.url);
        if (d) item.lastmod = new Date(d).toISOString();
        return item;
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
