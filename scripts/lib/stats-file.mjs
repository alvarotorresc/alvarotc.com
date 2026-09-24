import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

/**
 * @typedef {{
 *   generatedAt: string | null;
 *   github: Record<string, unknown> | null;
 *   umami: Record<string, unknown> | null;
 * }} StatsFile
 */

/**
 * @param {string} path
 * @returns {StatsFile | null}
 */
export function readStats(path) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

/** @param {StatsFile} data */
function withoutDate(data) {
  return JSON.stringify({ ...data, generatedAt: null });
}

/**
 * @param {{
 *   github: StatsFile['github'];
 *   umami: StatsFile['umami'];
 *   previous: StatsFile | null;
 *   now: Date;
 *   githubFailed?: boolean;
 *   umamiFailed?: boolean;
 * }} input
 * @returns {StatsFile}
 */
export function buildStats({
  github,
  umami,
  previous,
  now,
  githubFailed = false,
  umamiFailed = false,
}) {
  let resolvedGithub = github;
  let usedFallback = false;
  if (resolvedGithub === null && githubFailed && previous?.github) {
    console.log('kept previous github data');
    resolvedGithub = previous.github;
    usedFallback = true;
  }
  let resolvedUmami = umami;
  if (resolvedUmami === null && umamiFailed && previous?.umami) {
    console.log('kept previous umami data');
    resolvedUmami = previous.umami;
    usedFallback = true;
  }

  const next = {
    generatedAt: resolvedGithub || resolvedUmami ? now.toISOString() : null,
    github: resolvedGithub,
    umami: resolvedUmami,
  };
  if (
    !usedFallback &&
    next.generatedAt &&
    previous?.generatedAt &&
    withoutDate(previous) === withoutDate(next)
  ) {
    return { ...next, generatedAt: previous.generatedAt };
  }
  return next;
}

/** @param {StatsFile} data */
export function serializeStats(data) {
  return `${JSON.stringify(data, null, 2)}\n`;
}

/**
 * @param {string} path
 * @param {StatsFile} data
 */
export function writeStats(path, data) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, serializeStats(data));
}
