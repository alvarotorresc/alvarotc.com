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
