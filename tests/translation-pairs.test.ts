import { describe, it, expect, beforeEach } from 'vitest';
import { mkdtempSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  readSource,
  findEnglishPair,
  planTranslations,
} from '../scripts/lib/translation-pairs.mjs';

const enPost = (source?: string) =>
  `---\ntitle: 'Hello'\ndescription: 'x'\ndate: 2026-01-01\n${source ? `source: ${source}\n` : ''}---\n\nBody\n`;

describe('readSource', () => {
  it('reads plain and quoted values', () => {
    expect(readSource(enPost('mi-post'))).toBe('mi-post');
    expect(readSource("---\ntitle: a\nsource: 'mi-post'\n---\n")).toBe('mi-post');
    expect(readSource('---\ntitle: a\nsource: "mi-post"\n---\n')).toBe('mi-post');
  });

  it('returns null without source or frontmatter', () => {
    expect(readSource(enPost())).toBeNull();
    expect(readSource('no frontmatter\nsource: mi-post\n')).toBeNull();
    expect(readSource('---\ntitle: a\n---\n\nsource: mi-post\n')).toBeNull();
  });
});

describe('findEnglishPair / planTranslations', () => {
  let enDir: string;

  beforeEach(() => {
    enDir = mkdtempSync(join(tmpdir(), 'posts-en-'));
    writeFileSync(join(enDir, 'a-different-english-slug.md'), enPost('publicado'));
    writeFileSync(join(enDir, 'orphan.md'), enPost());
  });

  it('pairs through the source field, not the filename', () => {
    expect(findEnglishPair('src/content/posts/publicado.md', enDir)).toBe(
      'a-different-english-slug.md',
    );
    expect(findEnglishPair('nuevo.md', enDir)).toBeNull();
    expect(findEnglishPair('orphan.md', enDir)).toBeNull();
  });

  it('returns null when the english directory does not exist', () => {
    expect(findEnglishPair('publicado.md', join(enDir, 'missing'))).toBeNull();
  });

  it('skips posts that already have a pair and keeps new ones', () => {
    expect(planTranslations(['publicado.md', 'nuevo.md'], enDir)).toEqual({
      toTranslate: ['nuevo.md'],
      skipped: [{ file: 'publicado.md', pair: 'a-different-english-slug.md' }],
    });
  });

  it('finds a pair for every published spanish post in the repo', () => {
    const esFiles = readdirSync('src/content/posts').filter((f) => f.endsWith('.md'));
    expect(planTranslations(esFiles, 'src/content/posts-en').toTranslate).toEqual([]);
  });

  it('translates everything with force', () => {
    expect(planTranslations(['publicado.md', 'nuevo.md'], enDir, { force: true })).toEqual({
      toTranslate: ['publicado.md', 'nuevo.md'],
      skipped: [],
    });
  });
});
