import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const dist = resolve('dist');
const built = existsSync(dist);
const SITE = 'https://alvarotc.com/';
const NOINDEX = /<meta name="robots" content="noindex[^"]*">/;
const SITEMAP_URL_COUNT = 36;

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return walk(path);
    return entry.name.endsWith('.html') ? [path] : [];
  });
}

const isAbsoluteSiteUrl = (url: string) => url.startsWith(SITE) && url.endsWith('/');

function htmlPages() {
  return walk(dist).map((file) => ({
    route: relative(dist, file),
    html: readFileSync(file, 'utf8'),
  }));
}

function sitemapXml(): string {
  return readdirSync(dist)
    .filter((f) => /^sitemap-\d+\.xml$/.test(f))
    .map((f) => readFileSync(join(dist, f), 'utf8'))
    .join('\n');
}

const sitemapLocs = () => [...sitemapXml().matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url);

const legalRoutes = [
  'legal/index.html',
  'privacy/index.html',
  'es/legal/index.html',
  'es/privacy/index.html',
];

const topicRoute = (route: string) => /^(?:blog\/topic|es\/blog\/tema)\//.test(route);

describe.skipIf(!built)('absolute urls in built pages', () => {
  it('uses absolute site urls ending in a slash for canonical, og:url and hreflang', () => {
    const bad: string[] = [];
    for (const { route, html } of htmlPages()) {
      const canonical = [...html.matchAll(/<link\b[^>]*rel="canonical"[^>]*href="([^"]*)"/g)];
      if (route === '404.html' && canonical.length === 0) continue;
      if (canonical.length !== 1) bad.push(`${route}: ${canonical.length} canonical tags`);
      const urls = [
        ...canonical.map(([, url]) => url),
        ...[...html.matchAll(/<meta\b[^>]*property="og:url"[^>]*content="([^"]*)"/g)].map(
          ([, url]) => url,
        ),
        ...[...html.matchAll(/<link\b[^>]*hreflang="[^"]+"[^>]*href="([^"]*)"/g)].map(
          ([, url]) => url,
        ),
      ];
      for (const url of urls) if (!isAbsoluteSiteUrl(url)) bad.push(`${route}: ${url}`);
    }
    expect(bad).toEqual([]);
  });

  it('gives the home pages the root and /es/ canonicals', () => {
    expect(readFileSync(join(dist, 'index.html'), 'utf8')).toContain(
      '<link rel="canonical" href="https://alvarotc.com/">',
    );
    expect(readFileSync(join(dist, 'es/index.html'), 'utf8')).toContain(
      '<link rel="canonical" href="https://alvarotc.com/es/">',
    );
  });

  it('uses absolute site urls ending in a slash in every sitemap loc and xhtml:link', () => {
    const xml = sitemapXml();
    const urls = [
      ...[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url),
      ...[...xml.matchAll(/<xhtml:link[^>]*href="([^"]+)"/g)].map(([, url]) => url),
    ];
    expect(urls.length).toBeGreaterThan(0);
    expect(urls.filter((url) => !isAbsoluteSiteUrl(url))).toEqual([]);
  });
});

describe.skipIf(!built)('indexability', () => {
  it.each(legalRoutes)('noindexes %s', (route) => {
    expect(readFileSync(join(dist, route), 'utf8')).toMatch(NOINDEX);
  });

  it('noindexes every topic page, since no topic has 4 articles yet', () => {
    const topics = htmlPages().filter(({ route }) => topicRoute(route));
    expect(topics.length).toBeGreaterThan(0);
    expect(topics.filter(({ html }) => !NOINDEX.test(html)).map(({ route }) => route)).toEqual([]);
  });

  it('keeps legal and topic pages out of the sitemap', () => {
    const locs = sitemapLocs();
    expect(locs.filter((url) => /\/(?:legal|privacy)\/$/.test(url))).toEqual([]);
    expect(locs.filter((url) => /\/(?:blog\/topic|es\/blog\/tema)\//.test(url))).toEqual([]);
  });

  it('lists exactly the indexable pages in the sitemap', () => {
    const indexable = htmlPages()
      .filter(({ html }) => !NOINDEX.test(html))
      .map(({ html }) => html.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]*)"/)![1])
      .sort();
    const locs = sitemapLocs().sort();
    expect(locs).toEqual(indexable);
    expect(locs).toHaveLength(SITEMAP_URL_COUNT);
  });
});
