import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const file = (lang: string, slug: string) => `src/content/projects/${lang}/${slug}.md`;
const read = (lang: string, slug: string) => readFileSync(file(lang, slug), 'utf8');
const field = (source: string, key: string) =>
  new RegExp(`^${key}: (.+)$`, 'm').exec(source)?.[1]?.trim();
const refsOf = (path: string) =>
  [...readFileSync(path, 'utf8').matchAll(/(\.\.\/[^\s'"]+\.(?:jpg|jpeg|png|webp))/g)].map((m) =>
    resolve(dirname(path), m[1]),
  );
const imageRefs = (lang: string, slug: string) => refsOf(file(lang, slug));

const placeholders: Record<string, string[]> = {
  bito: ['icon', 'cover', 'widget', 'reminder', 'review', 'stats', 'badges', 'habi'],
  pokeutils: ['icon', 'cover', 'pokedex', 'compare', 'egg-groups', 'team', 'pokemon'],
  basecero: [
    'icon',
    'cover',
    'cover-mobile',
    'home',
    'movements',
    'net-worth',
    'categories',
    'period',
    'shared',
  ],
};

describe('project placeholders', () => {
  it.each(Object.entries(placeholders))('%s has its placeholder images', (slug, names) => {
    names.forEach((name) =>
      expect(existsSync(`src/assets/projects/${slug}/${name}.jpg`), name).toBe(true),
    );
  });
});

describe.each(['es', 'en'])('bito (%s)', (lang) => {
  const source = read(lang, 'bito');

  it('is a mobile project being published', () => {
    expect(field(source, 'kind')).toBe('mobile');
    expect(field(source, 'status')).toBe('publishing');
  });

  it('keeps the data confirmed by the user', () => {
    expect(field(source, 'platform')).toBe('Android 10+');
    expect(field(source, 'license')).toBe('GPL-3.0');
    expect(field(source, 'url')).toBe('https://bito.alvarotc.com');
    expect(field(source, 'stack')).toBe('[Kotlin, Offline-first, Privacy]');
    expect(source).toContain(
      'https://github.com/alvarotorresc/bito/releases/download/v1.0.0/app-release.apk',
    );
    expect(source).toMatch(/date: 2026-08-26/);
  });

  it('has five screenshots and seven features', () => {
    expect(source.match(/^ {2}- src: /gm)).toHaveLength(5);
    expect(source.match(/^ {2}- title: /gm)).toHaveLength(7);
  });

  it('drops hero and gallery and has no post yet', () => {
    expect(source).not.toMatch(/^(hero|gallery|post):/m);
  });

  it('points only at images that exist', () => {
    const refs = imageRefs(lang, 'bito');
    expect(refs.length).toBeGreaterThan(0);
    refs.forEach((ref) => expect(existsSync(ref), ref).toBe(true));
  });
});

describe.each(['es', 'en'])('pokeutils (%s)', (lang) => {
  const source = read(lang, 'pokeutils');

  it('is a published web project', () => {
    expect(field(source, 'kind')).toBe('web');
    expect(field(source, 'status')).toBe('published');
    expect(field(source, 'stack')).toBe('[JavaScript, SPA]');
  });

  it('has no license, no playground and no hero', () => {
    expect(source).not.toMatch(/^(license|playground|hero|gallery):/m);
  });

  it('dates v1.0.0 and leaves its note as [DATO]', () => {
    expect(source).toMatch(/version: 'v1\.0\.0', date: 2026-08-28, note: '\[DATO\]'/);
  });

  it('has three screenshots and seven features', () => {
    expect(source.match(/^ {2}- src: /gm)).toHaveLength(3);
    expect(source.match(/^ {2}- title: /gm)).toHaveLength(7);
  });

  it('points only at images that exist', () => {
    imageRefs(lang, 'pokeutils').forEach((ref) => expect(existsSync(ref), ref).toBe(true));
  });
});

describe.each(['es', 'en'])('basecero (%s)', (lang) => {
  const source = read(lang, 'basecero');

  it('is a published hybrid project under MIT', () => {
    expect(field(source, 'kind')).toBe('hybrid');
    expect(field(source, 'status')).toBe('published');
    expect(field(source, 'license')).toBe('MIT');
    expect(field(source, 'url')).toBe('https://basecero.alvarotc.com');
  });

  it('embeds the app as a pwa playground', () => {
    expect(source).toContain(
      "playground: { kind: pwa, src: 'https://basecero.alvarotc.com/app/' }",
    );
  });

  it('has a desktop cover and a phone cover', () => {
    expect(field(source, 'cover')).toContain('basecero/cover.jpg');
    expect(field(source, 'coverMobile')).toContain('basecero/cover-mobile.jpg');
  });

  it('dates v1.0.0 and leaves its note as [DATO]', () => {
    expect(source).toMatch(/version: 'v1\.0\.0', date: 2026-09-02, note: '\[DATO\]'/);
  });

  it('has four screenshots and seven features', () => {
    expect(source.match(/^ {2}- src: /gm)).toHaveLength(4);
    expect(source.match(/^ {2}- title: /gm)).toHaveLength(7);
  });

  it('points only at images that exist', () => {
    imageRefs(lang, 'basecero').forEach((ref) => expect(existsSync(ref), ref).toBe(true));
  });
});

describe.each(['es', 'en'])('create-astro-blog (%s)', (lang) => {
  const source = read(lang, 'create-astro-blog');

  it('is a hidden cli project', () => {
    expect(field(source, 'kind')).toBe('cli');
    expect(field(source, 'visible')).toBe('false');
    expect(field(source, 'command')).toBe('npx create-astro-blog my-blog');
    expect(field(source, 'after')).toBe("'cd my-blog && npm run dev'");
  });

  it('keeps version, license and Node as [DATO]', () => {
    expect(source).toMatch(/value: '\[DATO\]', mono: true/);
    expect(source).not.toMatch(/^(license|hero|gallery):/m);
  });

  it('has the terminal session, eight features and six steps', () => {
    expect(source.match(/^ {2}- '\$ /gm)).toHaveLength(2);
    expect(source.match(/^ {2}- '✔ /gm)).toHaveLength(7);
    expect(source.match(/^ {2}- title: /gm)).toHaveLength(14);
  });
});
