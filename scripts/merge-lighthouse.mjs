import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { lighthouseScores } from './lib/lighthouse.mjs';
import { readStats, withLighthouse, writeStats } from './lib/stats-file.mjs';

const [mobilePath, desktopPath] = process.argv.slice(2);
if (!mobilePath || !desktopPath) {
  console.error('usage: node scripts/merge-lighthouse.mjs <mobile manifest> <desktop manifest>');
  process.exit(1);
}

const output = join(process.cwd(), 'src/data/generated/stats.json');

try {
  const scores = lighthouseScores(
    JSON.parse(readFileSync(mobilePath, 'utf8')),
    JSON.parse(readFileSync(desktopPath, 'utf8')),
  );
  if (!scores) {
    console.log('lighthouse: no representative run for /, stats.json untouched');
    process.exit(0);
  }
  writeStats(output, withLighthouse(readStats(output), scores, new Date()));
  console.log(
    `lighthouse: mobile ${scores.performanceMobile}, desktop ${scores.performanceDesktop}`,
  );
} catch (error) {
  console.error(`lighthouse: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
}
