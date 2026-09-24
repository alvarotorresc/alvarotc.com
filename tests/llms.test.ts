import { describe, it, expect } from 'vitest';
import { GET as llmsTxt } from '../src/pages/llms.txt';
import { GET as llmsFullEn } from '../src/pages/llms-full.txt';
import { GET as llmsFullEs } from '../src/pages/es/llms-full.txt';
import { GET as postMdEn, getStaticPaths as postMdEnPaths } from '../src/pages/blog/[slug].md';
import { GET as postMdEs, getStaticPaths as postMdEsPaths } from '../src/pages/es/blog/[slug].md';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const site = new URL('https://alvarotc.com/');
const context = { site } as unknown as Parameters<typeof llmsTxt>[0];

const enTitles = [
  "BaseCero: Your money doesn't have to sit on someone else's server",
  'Set up a service on your VPS today and move it to your homelab tomorrow: FreshRSS with Docker and Caddy',
  'From an idea to an APK in 24 hours',
  'How I Set Up My VPS with Full Observability for Less Than €5/Month',
  'New website, new direction',
];

const esTitles = [
  'BaseCero: tu dinero no tiene por qué vivir en el servidor de nadie',
  'Monta un servicio en tu VPS hoy y múdalo a tu homelab mañana: FreshRSS con Docker y Caddy',
  'De una idea a una APK en 24h',
  'Cómo monté mi VPS con observabilidad completa por menos de 5€/mes',
  'Nueva web, nuevo rumbo',
];

describe('/llms.txt', () => {
  it('lists the 5 English and 5 Spanish articles with absolute URLs', async () => {
    const res = await llmsTxt(context);
    const text = await res.text();

    expect(text).toContain('# Álvaro Torres Carrasco');
    expect(text).toContain('## Articles');
    expect(text).toContain('## Artículos (Español)');
    expect(text).toContain('## Projects');
    expect(text).toContain('## Pages');
    expect(text).toContain('## Feeds');

    for (const title of enTitles) expect(text).toContain(title);
    for (const title of esTitles) expect(text).toContain(title);

    expect(text).toContain('https://alvarotc.com/blog/new-website-new-direction.md');
    expect(text).toContain('https://alvarotc.com/es/blog/nueva-web-nuevo-rumbo.md');
    expect(text).toContain('https://alvarotc.com/projects/');
    expect(text).toContain('https://alvarotc.com/about/');
    expect(text).toContain('https://alvarotc.com/rss.xml');
    expect(text).toContain('https://alvarotc.com/llms-full.txt');
    expect(text).toContain('https://alvarotc.com/es/llms-full.txt');
  });

  it('keeps the canonical blank-line separators between the header and each section', async () => {
    const res = await llmsTxt(context);
    const text = await res.text();

    expect(text.startsWith('# Álvaro Torres Carrasco\n\n> ')).toBe(true);
    expect(text).toContain('\n\n## Articles\n\n');
    expect(text).toContain('\n\n## Artículos (Español)\n\n');
  });
});

describe('/llms-full.txt (English)', () => {
  it('only contains English posts, with real body content', async () => {
    const res = await llmsFullEn(context);
    const text = await res.text();

    for (const title of enTitles) expect(text).toContain(`# ${title}`);
    for (const title of esTitles) expect(text).not.toContain(`# ${title}`);

    expect(text).toContain('My personal website had been dead for over two years with Next.js 12');
    expect(text).toContain('URL: https://alvarotc.com/blog/new-website-new-direction/');
  });

  it('translates the Spanish-slugged tag to English', async () => {
    const res = await llmsFullEn(context);
    const text = await res.text();

    expect(text).toContain('observability');
    expect(text).not.toContain('observabilidad');
  });
});

describe('/es/llms-full.txt (Spanish)', () => {
  it('only contains Spanish posts, with real body content', async () => {
    const res = await llmsFullEs(context);
    const text = await res.text();

    for (const title of esTitles) expect(text).toContain(`# ${title}`);
    for (const title of enTitles) expect(text).not.toContain(`# ${title}`);

    expect(text).toContain('Mi web personal llevaba más de dos años con Next.js 12');
    expect(text).toContain('URL: https://alvarotc.com/es/blog/nueva-web-nuevo-rumbo/');
  });
});

describe('/blog/<slug>.md', () => {
  it('serves frontmatter and the original Markdown body', async () => {
    const paths = await postMdEnPaths();
    const target = paths.find((p) => p.params.slug === 'new-website-new-direction');
    expect(target).toBeDefined();

    const res = await postMdEn({ props: target!.props, site } as unknown as Parameters<
      typeof postMdEn
    >[0]);
    const text = await res.text();

    expect(text).toContain('title: "New website, new direction"');
    expect(text).toContain('canonical: "https://alvarotc.com/blog/new-website-new-direction/"');
    expect(text).toContain('language: "en"');
    expect(text).toContain('alternate: "https://alvarotc.com/es/blog/nueva-web-nuevo-rumbo/"');
    expect(text).toContain('## The previous website was dead');
  });

  it('translates the Spanish-slugged tag to English in the frontmatter', async () => {
    const paths = await postMdEnPaths();
    const target = paths.find((p) => p.params.slug === 'new-website-new-direction');
    const res = await postMdEn({ props: target!.props, site } as unknown as Parameters<
      typeof postMdEn
    >[0]);
    const text = await res.text();

    expect(text).toContain('"projects"');
    expect(text).not.toContain('"proyectos"');
  });
});

describe('/es/blog/<slug>.md', () => {
  it('serves frontmatter and the original Markdown body', async () => {
    const paths = await postMdEsPaths();
    const target = paths.find((p) => p.params.slug === 'nueva-web-nuevo-rumbo');
    expect(target).toBeDefined();

    const res = await postMdEs({ props: target!.props, site } as unknown as Parameters<
      typeof postMdEs
    >[0]);
    const text = await res.text();

    expect(text).toContain('title: "Nueva web, nuevo rumbo"');
    expect(text).toContain('canonical: "https://alvarotc.com/es/blog/nueva-web-nuevo-rumbo/"');
    expect(text).toContain('language: "es"');
    expect(text).toContain('alternate: "https://alvarotc.com/blog/new-website-new-direction/"');
    expect(text).toContain('## La web anterior estaba muerta');
  });
});

describe('robots.txt', () => {
  it('allows everything and points to the sitemap', () => {
    const text = readFileSync(resolve('public/robots.txt'), 'utf8');
    expect(text).toContain('Allow: /');
    expect(text).toContain('Sitemap: https://alvarotc.com/sitemap-index.xml');
    expect(text).not.toMatch(/GPTBot|ClaudeBot|PerplexityBot/);
  });
});

const dist = resolve('dist');
const built = existsSync(dist);

describe.skipIf(!built)('build output', () => {
  it('generates llms.txt, llms-full.txt and per-post Markdown files', () => {
    expect(existsSync(resolve(dist, 'llms.txt'))).toBe(true);
    expect(existsSync(resolve(dist, 'llms-full.txt'))).toBe(true);
    expect(existsSync(resolve(dist, 'es/llms-full.txt'))).toBe(true);
    expect(existsSync(resolve(dist, 'blog/new-website-new-direction.md'))).toBe(true);
    expect(existsSync(resolve(dist, 'es/blog/nueva-web-nuevo-rumbo.md'))).toBe(true);
  });
});
