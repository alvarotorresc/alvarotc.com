import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  collectDistHashes,
  readVercelConfig,
  findCspHeader,
  extractDirective,
  getCspHashes,
} from '../scripts/csp-hashes.mjs';

const dist = resolve('dist');
const built = existsSync(dist);

const REGENERATE_HINT =
  'Regenerate with `node scripts/csp-hashes.mjs` (add --write to apply the fix).';

type Occurrence = { file: string; content: string; hash: string };

/** Groups occurrences by hash so one widely-shared script doesn't produce one line per page. */
function summarizeMissing(occurrences: Occurrence[]) {
  const byHash = new Map();
  for (const occurrence of occurrences) {
    const entry = byHash.get(occurrence.hash);
    if (entry) entry.count += 1;
    else
      byHash.set(occurrence.hash, { file: occurrence.file, content: occurrence.content, count: 1 });
  }
  return [...byHash.entries()].map(
    ([hash, { file, content, count }]) =>
      `'sha256-${hash}' — ${count} occurrence(s), e.g. ${file}: ${JSON.stringify(content.slice(0, 80))}`,
  );
}

describe.skipIf(!built)('CSP hashes stay in sync with the build', () => {
  const cspValue = findCspHeader(readVercelConfig()).value;
  const csp = getCspHashes(cspValue);
  const cspScriptHashes = new Set(csp.scriptHashes);
  const cspStyleHashes = new Set(csp.styleHashes);

  it('covers every inline script found in dist under script-src', () => {
    const { scriptOccurrences } = collectDistHashes(dist);
    const missing = summarizeMissing(
      scriptOccurrences.filter((occurrence) => !cspScriptHashes.has(occurrence.hash)),
    );

    expect(
      missing,
      `vercel.json's script-src is missing hashes for inline scripts built into dist. ${REGENERATE_HINT}\n${missing.join('\n')}`,
    ).toEqual([]);
  });

  it('covers every inline style found in dist under style-src', () => {
    const { styleOccurrences } = collectDistHashes(dist);
    const missing = summarizeMissing(
      styleOccurrences.filter((occurrence) => !cspStyleHashes.has(occurrence.hash)),
    );

    expect(
      missing,
      `vercel.json's style-src is missing hashes for inline styles built into dist. ${REGENERATE_HINT}\n${missing.join('\n')}`,
    ).toEqual([]);
  });

  it('has no dead script-src hashes with no matching inline script in dist', () => {
    const { scriptHashes: distScriptHashes } = collectDistHashes(dist);
    const distHashSet = new Set(distScriptHashes);
    const dead = csp.scriptHashes
      .filter((hash) => !distHashSet.has(hash))
      .map((hash) => `'sha256-${hash}'`);

    expect(
      dead,
      `vercel.json's script-src carries hashes that no longer match any built script. ${REGENERATE_HINT}\n${dead.join('\n')}`,
    ).toEqual([]);
  });

  it('has no dead style-src hashes with no matching inline style in dist', () => {
    const { styleHashes: distStyleHashes } = collectDistHashes(dist);
    const distHashSet = new Set(distStyleHashes);
    const dead = csp.styleHashes
      .filter((hash) => !distHashSet.has(hash))
      .map((hash) => `'sha256-${hash}'`);

    expect(
      dead,
      `vercel.json's style-src carries hashes that no longer match any built style. ${REGENERATE_HINT}\n${dead.join('\n')}`,
    ).toEqual([]);
  });

  it('never allows unsafe-inline in script-src or style-src', () => {
    const scriptSrc = extractDirective(cspValue, 'script-src') ?? '';
    const styleSrc = extractDirective(cspValue, 'style-src') ?? '';

    expect(
      scriptSrc,
      `script-src must rely on hashes, not 'unsafe-inline'. ${REGENERATE_HINT}`,
    ).not.toContain("'unsafe-inline'");
    expect(
      styleSrc,
      `style-src must rely on hashes, not 'unsafe-inline'. ${REGENERATE_HINT}`,
    ).not.toContain("'unsafe-inline'");
  });

  it('never allows unsafe-eval anywhere in the policy', () => {
    expect(cspValue).not.toContain("'unsafe-eval'");
  });
});
