import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';

const ids = [
  'daw-2018',
  'z1-2020',
  'therapyside-2022',
  'soltel-2025',
  'own-2026',
  'free-software',
  'animals',
  'guitar',
  'chess',
  'boxing',
  'rpg',
];
const photos = [
  'desk-2026',
  'ies-2018',
  'z1-2020',
  'therapyside-2022',
  'soltel-2025',
  'linux',
  'cats',
  'guitar',
  'chess',
  'boxing',
  'rpg',
];

describe.each(['es', 'en'])('about/%s.md', (lang) => {
  const source = readFileSync(`src/content/about/${lang}.md`, 'utf8');
  const body = source.split(/^---$/m)[2] ?? '';

  it('lists the eleven stages in order', () => {
    const found = [...source.matchAll(/^ {2}- id: ([\w-]+)$/gm)].map((m) => m[1]);
    expect(found).toEqual(ids);
  });

  it('keeps the values used by the home page', () => {
    expect(source).toContain('values:');
  });

  it('is not mock', () => {
    expect(source).toContain('mock: false');
  });

  it('has an empty markdown body', () => {
    expect(body.trim()).toBe('');
  });

  it('contains none of the invented mock anecdotes', () => {
    expect(source).not.toMatch(
      /portátil de segunda mano|second-hand laptop|conversación incómoda|awkward conversation/,
    );
  });
});

describe('about placeholders', () => {
  it.each(photos)('%s.jpg exists', (name) => {
    expect(existsSync(`src/assets/about/${name}.jpg`)).toBe(true);
  });
});

describe.skipIf(!process.env.RELEASE_CHECK)('about release guard', () => {
  it('has no [DATO] placeholders left', () => {
    const es = readFileSync('src/content/about/es.md', 'utf8');
    const en = readFileSync('src/content/about/en.md', 'utf8');
    expect(es).not.toContain('[DATO]');
    expect(en).not.toContain('[DATO]');
  });

  it('ships real photos, not placeholders', () => {
    const files = readdirSync('src/assets/about/');
    const jpgs = files.filter((f) => f.endsWith('.jpg'));

    jpgs.forEach((jpg) => {
      const stat = statSync(`src/assets/about/${jpg}`);
      expect(stat.size).toBeGreaterThan(20000);
    });
  });
});
