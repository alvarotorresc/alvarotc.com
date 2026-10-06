import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const dist = resolve('dist');
const built = existsSync(dist);
const NOINDEX = /<meta name="robots" content="noindex[^"]*">/;
const OLD_TAGS = ['proyectos', 'observabilidad', 'privacidad', 'proceso'];

const page = (route: string) => readFileSync(join(dist, route), 'utf8');

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return walk(path);
    return entry.name.endsWith('.html') ? [path] : [];
  });
}

function htmlPages() {
  return walk(dist).map((file) => ({
    route: relative(dist, file),
    html: readFileSync(file, 'utf8'),
  }));
}

function indexablePages() {
  return htmlPages().filter(({ html }) => !NOINDEX.test(html) && /rel="canonical"/.test(html));
}

function collisions(pattern: RegExp): string[][] {
  const groups = new Map<string, string[]>();
  for (const { route, html } of indexablePages()) {
    const value = html.match(pattern)?.[1] ?? '';
    groups.set(value, [...(groups.get(value) ?? []), route]);
  }
  return [...groups.values()].filter((routes) => routes.length > 1).map((r) => r.sort());
}

const isProjectPair = (routes: string[]) => {
  const slug = routes[1]?.match(/^projects\/([^/]+)\/index\.html$/)?.[1];
  return (
    routes.length === 2 && slug !== undefined && routes[0] === `es/projects/${slug}/index.html`
  );
};

describe.skipIf(!built)('unique titles and descriptions', () => {
  it('finds indexable pages', () => {
    expect(indexablePages().length).toBeGreaterThan(0);
  });

  it('only repeats a <title> between the English and Spanish page of the same project', () => {
    expect(collisions(/<title>([^<]*)<\/title>/).filter((r) => !isProjectPair(r))).toEqual([]);
  });

  it('gives every indexable page its own description', () => {
    expect(collisions(/<meta name="description" content="([^"]*)">/)).toEqual([]);
  });
});

describe.skipIf(!built)('renamed topics', () => {
  it.each(OLD_TAGS)('builds no topic page for %s', (tag) => {
    expect(existsSync(join(dist, 'blog/topic', tag))).toBe(false);
    expect(existsSync(join(dist, 'es/blog/tema', tag))).toBe(false);
  });

  it('links to no old topic url', () => {
    const old = new RegExp(`/(?:topic|tema)/(?:${OLD_TAGS.join('|')})/`);
    expect(
      htmlPages()
        .filter(({ html }) => old.test(html))
        .map(({ route }) => route),
    ).toEqual([]);
  });
});

describe.skipIf(!built)('home title', () => {
  it('uses the role and city in the English <title>', () => {
    expect(page('index.html')).toContain(
      '<title>Álvaro Torres Carrasco · Software Engineer in Seville</title>',
    );
  });

  it('uses the role and city in the Spanish <title>', () => {
    expect(page('es/index.html')).toContain(
      '<title>Álvaro Torres Carrasco · Software Engineer en Sevilla</title>',
    );
  });

  it('keeps the plain name as og:title', () => {
    expect(page('index.html')).toContain(
      '<meta property="og:title" content="Álvaro Torres Carrasco">',
    );
  });
});
