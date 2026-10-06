import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const dist = resolve('dist');
const built = existsSync(dist);

const enSlug = 'new-website-new-direction';
const esSlug = 'nueva-web-nuevo-rumbo';

const enHtml = () => readFileSync(resolve(dist, `blog/${enSlug}/index.html`), 'utf8');
const esHtml = () => readFileSync(resolve(dist, `es/blog/${esSlug}/index.html`), 'utf8');

function extractJsonLd(html: string): Record<string, unknown> {
  const match = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
  if (!match) throw new Error('JSON-LD script not found');
  return JSON.parse(match[1]);
}

function countOccurrences(html: string, needle: string): number {
  return html.split(needle).length - 1;
}

describe.skipIf(!built)('post JSON-LD (BlogPosting)', () => {
  it('parses and has the required fields with real values (EN)', () => {
    const jsonLd = extractJsonLd(enHtml()) as Record<string, any>;
    expect(jsonLd['@type']).toBe('BlogPosting');
    expect(jsonLd.headline).toBe('New website, new direction');
    expect(typeof jsonLd.description).toBe('string');
    expect(jsonLd.description.length).toBeGreaterThan(0);
    expect(jsonLd.datePublished).toBe('2026-02-16T00:00:00.000Z');
    expect(jsonLd.dateModified).toBe('2026-02-16T00:00:00.000Z');
    expect(jsonLd.keywords).toBe('meta, web, astro, projects');
    expect(jsonLd.inLanguage).toBe('en');
    expect(jsonLd.wordCount).toBeGreaterThan(0);
    expect(jsonLd.timeRequired).toMatch(/^PT\d+M$/);
    expect(jsonLd.url).toBe('https://alvarotc.com/blog/new-website-new-direction/');
    expect(jsonLd.mainEntityOfPage).toEqual({
      '@type': 'WebPage',
      '@id': 'https://alvarotc.com/blog/new-website-new-direction/',
    });
    expect(jsonLd.image).toBe('https://alvarotc.com/og/new-website-new-direction.png');
    expect(jsonLd.author.url).toBe('https://alvarotc.com/');
    expect(jsonLd.author.sameAs).toHaveLength(3);
    expect(jsonLd.publisher.name).toBe(jsonLd.author.name);
    expect(jsonLd.isPartOf).toEqual({ '@type': 'Blog', '@id': 'https://alvarotc.com/blog/' });
  });

  it('uses the Spanish domain path and language for the ES version', () => {
    const jsonLd = extractJsonLd(esHtml()) as Record<string, any>;
    expect(jsonLd.inLanguage).toBe('es');
    expect(jsonLd.url).toBe('https://alvarotc.com/es/blog/nueva-web-nuevo-rumbo/');
    expect(jsonLd.author.url).toBe('https://alvarotc.com/es/');
    expect(jsonLd.isPartOf).toEqual({ '@type': 'Blog', '@id': 'https://alvarotc.com/es/blog/' });
  });
});

describe.skipIf(!built)('post <head> metadata', () => {
  it('has an absolute canonical URL (EN)', () => {
    expect(enHtml()).toContain(
      '<link rel="canonical" href="https://alvarotc.com/blog/new-website-new-direction/">',
    );
  });

  it('has an absolute canonical URL (ES)', () => {
    expect(esHtml()).toContain(
      '<link rel="canonical" href="https://alvarotc.com/es/blog/nueva-web-nuevo-rumbo/">',
    );
  });

  it('declares en, es and x-default hreflang on the EN page', () => {
    const html = enHtml();
    expect(html).toContain(
      '<link rel="alternate" hreflang="en" href="https://alvarotc.com/blog/new-website-new-direction/">',
    );
    expect(html).toContain(
      '<link rel="alternate" hreflang="es" href="https://alvarotc.com/es/blog/nueva-web-nuevo-rumbo/">',
    );
    expect(html).toContain(
      '<link rel="alternate" hreflang="x-default" href="https://alvarotc.com/blog/new-website-new-direction/">',
    );
  });

  it('declares en, es and x-default hreflang on the ES page', () => {
    const html = esHtml();
    expect(html).toContain(
      '<link rel="alternate" hreflang="es" href="https://alvarotc.com/es/blog/nueva-web-nuevo-rumbo/">',
    );
    expect(html).toContain(
      '<link rel="alternate" hreflang="en" href="https://alvarotc.com/blog/new-website-new-direction/">',
    );
    expect(html).toContain(
      '<link rel="alternate" hreflang="x-default" href="https://alvarotc.com/blog/new-website-new-direction/">',
    );
  });

  it('links to the Markdown source', () => {
    expect(enHtml()).toContain(
      '<link rel="alternate" type="text/markdown" href="https://alvarotc.com/blog/new-website-new-direction.md">',
    );
    expect(esHtml()).toContain(
      '<link rel="alternate" type="text/markdown" href="https://alvarotc.com/es/blog/nueva-web-nuevo-rumbo.md">',
    );
  });

  it('has og:type article with a single og:title and locale metas', () => {
    const html = enHtml();
    expect(html).toContain('<meta property="og:type" content="article">');
    expect(countOccurrences(html, 'property="og:title"')).toBe(1);
    expect(html).toContain('<meta property="og:locale" content="en_US">');
    expect(html).toContain('<meta property="og:locale:alternate" content="es_ES">');
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image">');
  });

  it('has article:published_time, article:modified_time, article:author and article:tag per tag', () => {
    const html = enHtml();
    expect(html).toContain('article:published_time');
    expect(html).toContain('article:modified_time');
    expect(html).toContain('<meta property="article:author" content="Álvaro Torres Carrasco">');
    for (const tag of ['meta', 'web', 'astro', 'projects']) {
      expect(html).toContain(`<meta property="article:tag" content="${tag}">`);
    }
  });

  it('shows the English tag label on the EN page', () => {
    const html = enHtml();
    expect(html).toContain('>projects<');
    expect(html).not.toContain('>proyectos<');
  });

  it('renders a single article with a single h1 and a published <time datetime>', () => {
    const html = enHtml();
    expect(countOccurrences(html, '<article')).toBe(1);
    expect(countOccurrences(html, '<h1')).toBe(1);
    expect(html).toContain('<time datetime="2026-02-16T00:00:00.000Z">');
  });
});
