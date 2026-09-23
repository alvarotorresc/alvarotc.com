import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';

const ids = [
  'daw-2018',
  'z1-2020',
  'therapyside-2022',
  'soltel-2025',
  'own-2026',
  'free-software',
  'cats',
  'guitar',
  'chess',
  'boxing',
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
];

describe.each(['es', 'en'])('about/%s.md', (lang) => {
  const source = readFileSync(`src/content/about/${lang}.md`, 'utf8');
  const body = source.split(/^---$/m)[2] ?? '';

  it('lists the ten stages in order', () => {
    const found = [...source.matchAll(/^ {2}- id: ([\w-]+)$/gm)].map((m) => m[1]);
    expect(found).toEqual(ids);
  });

  it('keeps the values used by the home page', () => {
    expect(source).toContain('values:');
  });

  it('stays not mock even while it has [DATO] gaps', () => {
    expect(source).toContain('[DATO]');
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
