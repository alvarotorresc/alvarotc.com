import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const dist = resolve('dist');
const built = existsSync(dist);
const VAGUE = ['Live site', 'Repo', 'Web', 'Código', ''];
const LANGS = [
  { lang: 'en', prefix: '' },
  { lang: 'es', prefix: '/es' },
] as const;

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return walk(path);
    return entry.name.endsWith('.html') ? [path] : [];
  });
}

const pages = () =>
  walk(dist).map((file) => ({ route: relative(dist, file), html: readFileSync(file, 'utf8') }));

const page = (prefix: string, route: string) =>
  readFileSync(join(dist, prefix.slice(1), route), 'utf8');

function anchors(html: string) {
  return [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].map(([, attrs, inner]) => ({
    href: attrs.match(/\shref="([^"]*)"/)?.[1],
    hidden: /\shidden(?=[\s=>]|$)/.test(attrs),
    text: inner
      .replace(/<img\b[^>]*\salt="([^"]*)"[^>]*>/g, ' $1 ')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim(),
  }));
}

function linkedPosts(lang: 'en' | 'es') {
  const dir = resolve('src/content/projects', lang);
  return readdirSync(dir)
    .map((file) => ({
      slug: file.replace(/\.md$/, ''),
      source: readFileSync(join(dir, file), 'utf8'),
    }))
    .filter(({ source }) => !/^visible: false$/m.test(source))
    .flatMap(({ slug, source }) => {
      const post = source.match(/^post: (\S+)$/m)?.[1];
      const name = source.match(/^name: ['"]?(.+?)['"]?$/m)?.[1];
      return post && name ? [{ slug, post, name }] : [];
    });
}

function exists(path: string): boolean {
  const target = join(dist, decodeURIComponent(path));
  return existsSync(join(target, 'index.html')) || (existsSync(target) && !path.endsWith('/'));
}

describe.skipIf(!built)('link text', () => {
  it('finds links to check', () => {
    expect(pages().flatMap(({ html }) => anchors(html)).length).toBeGreaterThan(0);
  });

  it('gives no shown link a vague or empty text', () => {
    const vague = pages().flatMap(({ route, html }) =>
      anchors(html)
        .filter(({ text, hidden }) => !hidden && VAGUE.includes(text))
        .map(({ href, text }) => `${route}: "${text}" → ${href}`),
    );
    expect(vague).toEqual([]);
  });
});

describe.skipIf(!built)('main menu', () => {
  it.each(LANGS)('links to the $lang projects page', ({ prefix }) => {
    expect(page(prefix, 'index.html')).toContain(`href="${prefix}/projects/"`);
  });
});

describe.skipIf(!built)('project and post cross-links', () => {
  it.each(LANGS)('has $lang projects that point to a post', ({ lang }) => {
    expect(linkedPosts(lang).length).toBeGreaterThan(0);
  });

  it.each(LANGS)('links each $lang project page to its post', ({ lang, prefix }) => {
    linkedPosts(lang).forEach(({ slug, post }) => {
      const html = page(prefix, `projects/${slug}/index.html`);
      expect(html, slug).toMatch(new RegExp(`data-post-link href="${prefix}/blog/${post}/"`));
    });
  });

  it.each(LANGS)('links each $lang post back to its project page', ({ lang, prefix }) => {
    linkedPosts(lang).forEach(({ slug, post, name }) => {
      const html = page(prefix, `blog/${post}/index.html`);
      const link = anchors(html).find(({ href }) => href === `${prefix}/projects/${slug}/`);
      expect(link?.text, post).toContain(name);
    });
  });
});

describe.skipIf(!built)('internal links', () => {
  it('points every internal href to a built file', () => {
    const broken = new Set<string>();
    let checked = 0;
    for (const { route, html } of pages()) {
      for (const { href } of anchors(html)) {
        if (!href?.startsWith('/') || href.startsWith('//')) continue;
        const path = href.split(/[?#]/)[0];
        checked += 1;
        if (!exists(path)) broken.add(`${route}: ${href}`);
      }
    }
    expect(checked).toBeGreaterThan(0);
    expect([...broken].sort()).toEqual([]);
  });
});
