import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

/**
 * @typedef {{
 *   generatedAt: string | null;
 *   github: Record<string, unknown> | null;
 *   umami: Record<string, unknown> | null;
 *   lighthouse: { performanceMobile: number; performanceDesktop: number } | null;
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
 * }} input
 * @returns {StatsFile}
 */
export function buildStats({ github, umami, previous, now }) {
  const lighthouse = previous?.lighthouse ?? null;
  const next = {
    generatedAt: github || umami || lighthouse ? now.toISOString() : null,
    github,
    umami,
    lighthouse,
  };
  if (next.generatedAt && previous?.generatedAt && withoutDate(previous) === withoutDate(next)) {
    return { ...next, generatedAt: previous.generatedAt };
  }
  return next;
}

/**
 * @param {StatsFile | null} previous
 * @param {StatsFile['lighthouse']} lighthouse
 * @param {Date} now
 * @returns {StatsFile}
 */
export function withLighthouse(previous, lighthouse, now) {
  const base = previous ?? {
    generatedAt: null,
    github: null,
    umami: null,
    lighthouse: null,
  };
  return {
    ...base,
    generatedAt: base.generatedAt ?? now.toISOString(),
    lighthouse,
  };
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
