import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DAY_MS = 24 * 60 * 60 * 1000;
const BLOG_PATH = /^\/(es\/)?blog\/([a-z0-9-]+)\/?$/;

/**
 * @typedef {{ x: string; y: number }} Metric
 * @typedef {{ path: string; title: string; views: number }} MostRead
 */

/** @param {Date} now */
export function umamiRange(now) {
  return {
    startAt: String(now.getTime() - 30 * DAY_MS),
    endAt: String(now.getTime()),
  };
}

/** @param {string} apiKey */
export function umamiHeaders(apiKey) {
  return {
    Accept: 'application/json',
    Authorization: `Bearer ${apiKey}`,
    'x-umami-api-key': apiKey,
  };
}

/**
 * @param {{ pageviews: number | string | { value: number | string } }} stats
 * @returns {number}
 */
export function parseViews(stats) {
  const pageviews = stats.pageviews;
  const value = typeof pageviews === 'object' ? pageviews.value : pageviews;
  const views = Number(value);
  if (!Number.isFinite(views)) throw new Error('Umami stats without pageviews');
  return views;
}

/**
 * @param {string} path
 * @returns {string | null}
 */
export function blogPath(path) {
  const clean = path.split(/[?#]/)[0];
  const match = clean.match(BLOG_PATH);
  if (!match) return null;
  return `${match[1] ? '/es' : ''}/blog/${match[2]}/`;
}

/**
 * @param {string} markdown
 * @returns {{ title: string; draft: boolean } | null}
 */
export function frontmatter(markdown) {
  const block = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!block) return null;
  const title = block[1].match(/^title:\s*(.+?)\s*$/m);
  if (!title) return null;
  const raw = title[1];
  let value = raw;
  if (raw.startsWith("'") && raw.endsWith("'")) value = raw.slice(1, -1).replaceAll("''", "'");
  else if (raw.startsWith('"') && raw.endsWith('"')) value = JSON.parse(raw);
  return { title: value, draft: /^draft:\s*true\s*$/m.test(block[1]) };
}

/**
 * @param {string} root
 * @returns {Map<string, string>}
 */
export function loadPostTitles(root) {
  const titles = new Map();
  const dirs = [
    { dir: 'src/content/posts', prefix: '/es/blog/' },
    { dir: 'src/content/posts-en', prefix: '/blog/' },
  ];
  for (const { dir, prefix } of dirs) {
    const full = join(root, dir);
    if (!existsSync(full)) continue;
    for (const file of readdirSync(full)) {
      if (!file.endsWith('.md')) continue;
      const meta = frontmatter(readFileSync(join(full, file), 'utf8'));
      if (meta && !meta.draft) titles.set(`${prefix}${file.slice(0, -3)}/`, meta.title);
    }
  }
  return titles;
}

/**
 * @param {Metric[]} metrics
 * @param {Map<string, string>} titles
 * @returns {MostRead[]}
 */
export function mostRead(metrics, titles) {
  const views = new Map();
  for (const metric of metrics) {
    const path = blogPath(metric.x);
    if (!path || !titles.has(path)) continue;
    views.set(path, (views.get(path) ?? 0) + Number(metric.y));
  }
  return [...views.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 3)
    .map(([path, count]) => ({
      path,
      title: titles.get(path) ?? path,
      views: count,
    }));
}

/**
 * @param {{
 *   apiKey: string;
 *   websiteId: string;
 *   baseUrl: string;
 *   now: Date;
 *   titles: Map<string, string>;
 *   fetchImpl?: typeof fetch;
 * }} input
 */
export async function fetchUmami({ apiKey, websiteId, baseUrl, now, titles, fetchImpl = fetch }) {
  const range = umamiRange(now);
  const headers = umamiHeaders(apiKey);
  const api = `${baseUrl.replace(/\/$/, '')}/api/websites/${websiteId}`;

  const statsRes = await fetchImpl(`${api}/stats?${new URLSearchParams(range)}`, { headers });
  if (!statsRes.ok) throw new Error(`Umami stats ${statsRes.status}`);
  const views30d = parseViews(await statsRes.json());

  let metricsRes = null;
  for (const type of ['path', 'url']) {
    const query = new URLSearchParams({ ...range, type, limit: '100' });
    metricsRes = await fetchImpl(`${api}/metrics?${query}`, { headers });
    if (metricsRes.status !== 400) break;
  }
  if (!metricsRes || !metricsRes.ok) throw new Error(`Umami metrics ${metricsRes?.status}`);
  return { views30d, mostRead: mostRead(await metricsRes.json(), titles) };
}
