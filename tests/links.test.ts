import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const dist = resolve('dist');
const built = existsSync(dist);
const SITE = 'https://alvarotc.com';

function walk(dir: string, ext: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return walk(path, ext);
    return entry.name.endsWith(ext) ? [path] : [];
  });
}

function isPagePath(url: string): boolean {
  const path = url.split(/[?#]/)[0];
  return !/\.[a-z0-9]+$/i.test(path);
}

function missingSlash(url: string): boolean {
  const path = url.split(/[?#]/)[0];
  return isPagePath(url) && !path.endsWith('/');
}

function offenders(pattern: RegExp): string[] {
  const found = new Set<string>();
  for (const file of walk(dist, '.html')) {
    const html = readFileSync(file, 'utf8');
    for (const [, url] of html.matchAll(pattern)) {
      if (missingSlash(url)) found.add(`${relative(dist, file)}: ${url}`);
    }
  }
  return [...found].sort();
}

describe.skipIf(!built)('internal links', () => {
  it('ends every internal page href with a slash', () => {
    expect(offenders(/<a\b[^>]*\shref="(\/(?!\/)[^"]*)"/g)).toEqual([]);
  });

  it('ends every canonical url with a slash', () => {
    const urls = offenders(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/g);
    expect(urls).toEqual([]);
  });

  it('ends every hreflang alternate with a slash', () => {
    expect(offenders(/<link\b[^>]*hreflang="[^"]+"[^>]*href="([^"]+)"/g)).toEqual([]);
  });

  it('ends every sitemap url with a slash', () => {
    const urls = walk(dist, '.xml')
      .filter((file) => relative(dist, file).startsWith('sitemap-'))
      .flatMap((file) => [
        ...readFileSync(file, 'utf8').matchAll(
          /<loc>([^<]+)<\/loc>|<xhtml:link[^>]*href="([^"]+)"/g,
        ),
      ])
      .map(([, loc, alt]) => loc ?? alt)
      .filter((url) => url.startsWith(SITE));
    expect(urls.length).toBeGreaterThan(0);
    expect(urls.filter(missingSlash)).toEqual([]);
  });

  it('ends every search index url with a slash', () => {
    const items = JSON.parse(readFileSync(join(dist, 'search.json'), 'utf8')) as { url: string }[];
    expect(items.map((item) => item.url).filter(missingSlash)).toEqual([]);
  });
});
