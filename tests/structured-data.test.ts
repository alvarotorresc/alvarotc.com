import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const dist = resolve('dist');
const built = existsSync(dist);
const DOMAIN = 'https://alvarotc.com';

const CATEGORIES: Record<string, string> = {
  devtools: 'DeveloperApplication',
  'create-astro-blog': 'DeveloperApplication',
  pokeutils: 'ReferenceApplication',
  cheesy: 'GameApplication',
  bito: 'LifestyleApplication',
  basecero: 'FinanceApplication',
  quedamos: 'SocialNetworkingApplication',
  huellas: 'LifestyleApplication',
};

type Node = Record<string, any>;

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return walk(path);
    return entry.name.endsWith('.html') ? [path] : [];
  });
}

function jsonLd(html: string): Node[] {
  return [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) =>
    JSON.parse(m[1]),
  );
}

const pages = () =>
  walk(dist).map((file) => {
    const html = readFileSync(file, 'utf8');
    return {
      route: relative(dist, file),
      html,
      canonical: html.match(/<link rel="canonical" href="([^"]+)"/)?.[1],
    };
  });

const ofType = (nodes: Node[], type: string) => nodes.find((node) => node['@type'] === type);
const distFile = (url: string) => join(dist, new URL(url).pathname, 'index.html');
const isSpanish = (route: string) => route.startsWith('es/');
const home = (route: string) => `${DOMAIN}${isSpanish(route) ? '/es' : ''}/`;
const section = (route: string, path: string) => `${home(route)}${path}/`;

const posts = () => pages().filter(({ html }) => ofType(jsonLd(html), 'BlogPosting'));
const fichas = () =>
  pages().filter(({ route }) => /^(es\/)?projects\/[^/]+\/index\.html$/.test(route));
const topics = () => pages().filter(({ route }) => /^(blog\/topic|es\/blog\/tema)\//.test(route));

function expectTrail(route: string, html: string, canonical: string | undefined, parent: string) {
  const crumbs = ofType(jsonLd(html), 'BreadcrumbList');
  expect(crumbs, route).toBeDefined();
  const items: Node[] = crumbs!.itemListElement;
  expect(
    items.map((item) => item.position),
    route,
  ).toEqual([1, 2, 3]);
  expect(
    items.map((item) => item.item),
    route,
  ).toEqual([home(route), parent, canonical]);
  items.forEach((item) => {
    expect(item['@type'], route).toBe('ListItem');
    expect(item.name, route).toMatch(/\S/);
    expect(item.item, route).toMatch(/^https:\/\/alvarotc\.com\/.*\/$|^https:\/\/alvarotc\.com\/$/);
  });
}

describe.skipIf(!built)('JSON-LD in the build', () => {
  it('parses every JSON-LD block as JSON', () => {
    const broken = pages().flatMap(({ route, html }) => {
      try {
        jsonLd(html);
        return [];
      } catch {
        return [route];
      }
    });
    expect(broken).toEqual([]);
  });

  it.each(['projects/index.html', 'es/projects/index.html'])(
    '%s is a CollectionPage listing every project page',
    (route) => {
      const html = readFileSync(join(dist, route), 'utf8');
      const page = ofType(jsonLd(html), 'CollectionPage');
      expect(page).toBeDefined();
      expect(page!.url).toBe(section(route, 'projects'));
      expect(page!.inLanguage).toBe(isSpanish(route) ? 'es' : 'en');
      expect(page!.isPartOf).toMatchObject({ '@type': 'WebSite', url: home(route) });
      expect(page!.mainEntity['@type']).toBe('ItemList');

      const items: Node[] = page!.mainEntity.itemListElement;
      const expected = fichas().filter(({ route: r }) => isSpanish(r) === isSpanish(route));
      expect(items).toHaveLength(expected.length);
      expect(items.map((item) => item.position)).toEqual(items.map((_, i) => i + 1));
      items.forEach((item) => {
        expect(item.url).toMatch(new RegExp(`^${section(route, 'projects')}[\\w-]+/$`));
        expect(existsSync(distFile(item.url)), item.url).toBe(true);
      });
    },
  );

  it('gives every post a Home → Blog → post breadcrumb', () => {
    const list = posts();
    expect(list.length).toBeGreaterThan(0);
    list.forEach(({ route, html, canonical }) =>
      expectTrail(route, html, canonical, section(route, 'blog')),
    );
  });

  it('gives every project page a Home → Projects → project breadcrumb', () => {
    const list = fichas();
    expect(list.length).toBeGreaterThan(0);
    list.forEach(({ route, html, canonical }) =>
      expectTrail(route, html, canonical, section(route, 'projects')),
    );
  });

  it('gives every topic page a Home → Blog → topic breadcrumb', () => {
    const list = topics();
    expect(list.length).toBeGreaterThan(0);
    list.forEach(({ route, html, canonical }) =>
      expectTrail(route, html, canonical, section(route, 'blog')),
    );
  });

  it('gives every project page its own applicationCategory', () => {
    fichas().forEach(({ route, html }) => {
      const slug = route.match(/projects\/([^/]+)\//)![1];
      const app = ofType(jsonLd(html), 'SoftwareApplication');
      expect(app?.applicationCategory, route).toBe(CATEGORIES[slug]);
    });
  });

  it('links the repository through sameAs instead of codeRepository', () => {
    const list = fichas();
    expect(list.length).toBeGreaterThan(0);
    list.forEach(({ route, html }) => {
      const [, lang, slug] = route.match(/^(es\/)?projects\/([^/]+)\//)!;
      const source = readFileSync(`src/content/projects/${lang ? 'es' : 'en'}/${slug}.md`, 'utf8');
      const repo = source.match(/^repo: (\S+)$/m)?.[1];
      const app = ofType(jsonLd(html), 'SoftwareApplication');
      expect(app, route).not.toHaveProperty('codeRepository');
      expect(app?.sameAs, route).toEqual(repo ? [repo] : undefined);
    });
  });
});
