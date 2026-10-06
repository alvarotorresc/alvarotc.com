import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import clientInteraction from './src/integrations/client-interaction.ts';
import { MIN_INDEXABLE_TOPIC_POSTS } from './src/lib/topics.ts';
import { readPublishedPosts } from './src/lib/post-frontmatter.ts';

const SITE = 'https://alvarotc.com';

const en = readPublishedPosts('./src/content/posts-en');
const es = readPublishedPosts('./src/content/posts');

const tagCounts = (entries) => {
  const counts = new Map();
  for (const entry of entries) {
    for (const tag of entry.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return counts;
};

const thinTopicUrls = new Set();
for (const [tag, count] of tagCounts(en)) {
  if (count < MIN_INDEXABLE_TOPIC_POSTS) thinTopicUrls.add(`${SITE}/blog/topic/${tag}/`);
}
for (const [tag, count] of tagCounts(es)) {
  if (count < MIN_INDEXABLE_TOPIC_POSTS) thinTopicUrls.add(`${SITE}/es/blog/tema/${tag}/`);
}

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

const legalPage = /^https:\/\/alvarotc\.com\/(?:es\/)?(?:privacy|legal)\/$/;

const alternatesFor = (url) => {
  if (pairs.has(url)) return pairs.get(url);
  const t = url.match(
    /^https:\/\/alvarotc\.com\/(?:blog\/topic|es\/blog\/tema)\/([^/]+)\/(\d+\/)?$/,
  );
  if (t)
    return {
      en: `${SITE}/blog/topic/${t[1]}/${t[2] ?? ''}`,
      es: `${SITE}/es/blog/tema/${t[1]}/${t[2] ?? ''}`,
    };
  return null;
};

export default defineConfig({
  site: 'https://alvarotc.com',
  integrations: [
    react(),
    clientInteraction(),
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', es: 'es' },
      },
      filter: (page) => !thinTopicUrls.has(page) && !legalPage.test(page),
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
  trailingSlash: 'always',
  build: { inlineStylesheets: 'auto' },
  vite: {
    plugins: [tailwindcss()],
    ssr: { noExternal: ['framer-motion'] },
    build: { assetsInlineLimit: 0 },
  },
});
