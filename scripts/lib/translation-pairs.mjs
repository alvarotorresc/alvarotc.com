import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';

/**
 * An English post is paired with a Spanish one through its `source`
 * frontmatter field, which holds the Spanish entry id (its filename
 * without `.md`). Same rule as `findTranslation` in `src/lib/posts.ts`.
 *
 * @param {string} content
 * @returns {string | null}
 */
export function readSource(content) {
  const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatter) return null;
  const line = frontmatter[1].split(/\r?\n/).find((l) => /^source\s*:/.test(l));
  if (!line) return null;
  const value = line
    .replace(/^source\s*:/, '')
    .trim()
    .replace(/^(['"])(.*)\1$/, '$2');
  return value || null;
}

/**
 * @param {string} esFile path or filename of a Spanish post
 * @param {string} postsEnDir
 * @returns {string | null} filename of the English pair, if any
 */
export function findEnglishPair(esFile, postsEnDir) {
  if (!existsSync(postsEnDir)) return null;
  const id = basename(esFile).replace(/\.md$/, '');
  for (const file of readdirSync(postsEnDir).filter((f) => f.endsWith('.md'))) {
    if (readSource(readFileSync(join(postsEnDir, file), 'utf-8')) === id) return file;
  }
  return null;
}

/**
 * @param {string[]} esFiles
 * @param {string} postsEnDir
 * @param {{ force?: boolean }} [options]
 * @returns {{ toTranslate: string[]; skipped: { file: string; pair: string }[] }}
 */
export function planTranslations(esFiles, postsEnDir, { force = false } = {}) {
  const toTranslate = [];
  const skipped = [];
  for (const file of esFiles) {
    const pair = force ? null : findEnglishPair(file, postsEnDir);
    if (pair) skipped.push({ file, pair });
    else toTranslate.push(file);
  }
  return { toTranslate, skipped };
}
