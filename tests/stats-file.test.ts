import { describe, it, expect } from 'vitest';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readStats, buildStats, serializeStats, writeStats } from '../scripts/lib/stats-file.mjs';

const now = new Date('2026-09-24T05:00:00Z');
const github = {
  contributions: [{ date: '2026-09-23', count: 6 }],
  commitsThisYear: 2054,
  publicRepos: 16,
  stars: 1,
  streak: 1,
  mostActiveRepo: { name: 'basecero', commits30d: 486 },
  languages: [{ name: 'JavaScript', percent: 100 }],
};
const umami = { views30d: 1342, mostRead: [] };

describe('buildStats', () => {
  it('stamps generatedAt and keeps a null block per missing source', () => {
    expect(buildStats({ github, umami: null, previous: null, now })).toEqual({
      generatedAt: '2026-09-24T05:00:00.000Z',
      github,
      umami: null,
    });
  });

  it('leaves generatedAt null when every source is missing', () => {
    expect(buildStats({ github: null, umami: null, previous: null, now }).generatedAt).toBeNull();
  });

  it('keeps the previous generatedAt when nothing changed', () => {
    const previous = { generatedAt: '2026-09-23T05:00:00.000Z', github, umami };
    expect(buildStats({ github, umami, previous, now }).generatedAt).toBe(
      '2026-09-23T05:00:00.000Z',
    );
  });
});

describe('stats file on disk', () => {
  it('writes two-space JSON with a trailing newline and reads it back', () => {
    const dir = mkdtempSync(join(tmpdir(), 'stats-file-'));
    const path = join(dir, 'nested/stats.json');
    const data = buildStats({ github, umami, previous: null, now });
    writeStats(path, data);
    expect(readFileSync(path, 'utf8')).toBe(serializeStats(data));
    expect(serializeStats(data).endsWith('}\n')).toBe(true);
    expect(readStats(path)).toEqual(data);
  });

  it('reads a missing or broken file as null', () => {
    const dir = mkdtempSync(join(tmpdir(), 'stats-file-'));
    expect(readStats(join(dir, 'missing.json'))).toBeNull();
    writeFileSync(join(dir, 'broken.json'), '{');
    expect(readStats(join(dir, 'broken.json'))).toBeNull();
  });
});
