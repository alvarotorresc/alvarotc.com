import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fetchGithub, githubLogin } from './lib/github.mjs';
import { fetchUmami, loadPostTitles } from './lib/umami.mjs';
import { buildStats, readStats, writeStats } from './lib/stats-file.mjs';

const root = process.cwd();
const output = join(root, 'src/data/generated/stats.json');
const now = new Date();
const env = process.env;

/**
 * @template T
 * @param {string} name
 * @param {boolean} ready
 * @param {() => Promise<T>} run
 * @returns {Promise<T | null>}
 */
async function source(name, ready, run) {
  if (!ready) {
    console.log(`${name}: skipped, missing credentials`);
    return null;
  }
  try {
    const data = await run();
    console.log(`${name}: ok`);
    return data;
  } catch (error) {
    console.log(`${name}: failed, ${error instanceof Error ? error.message : error}`);
    return null;
  }
}

const umamiWebsiteId = env.UMAMI_WEBSITE_ID || env.PUBLIC_UMAMI_WEBSITE_ID;

const github = await source('github', Boolean(env.GITHUB_TOKEN), () =>
  fetchGithub({
    token: env.GITHUB_TOKEN ?? '',
    login: githubLogin(readFileSync(join(root, 'site.config.ts'), 'utf8')),
    now,
  }),
);

const umami = await source('umami', Boolean(env.UMAMI_API_KEY && umamiWebsiteId), () =>
  fetchUmami({
    apiKey: env.UMAMI_API_KEY ?? '',
    websiteId: umamiWebsiteId ?? '',
    baseUrl: env.UMAMI_URL || 'https://analytics.alvarotc.com',
    now,
    titles: loadPostTitles(root),
  }),
);

try {
  writeStats(output, buildStats({ github, umami, previous: readStats(output), now }));
  console.log(`wrote ${output}`);
} catch (error) {
  console.error(`could not write ${output}: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
}
