import { describe, it, expect } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  loadStats,
  writingStats,
  heatmapWeeks,
  heatmapColumnStarts,
  heatLevel,
  type StatsData,
  type Contribution,
} from '../src/lib/stats';

function makeRoot(): string {
  const root = mkdtempSync(join(tmpdir(), 'stats-'));
  mkdirSync(join(root, 'src/data/fallback'), { recursive: true });
  return root;
}

const emptyStats: StatsData = { generatedAt: null, github: null, umami: null };

describe('loadStats', () => {
  it('reads the fallback file when there is no generated one', () => {
    const root = makeRoot();
    writeFileSync(join(root, 'src/data/fallback/stats.json'), JSON.stringify(emptyStats));
    expect(loadStats(root)).toEqual(emptyStats);
  });

  it('prefers the generated file over the fallback one', () => {
    const root = makeRoot();
    writeFileSync(join(root, 'src/data/fallback/stats.json'), JSON.stringify(emptyStats));
    mkdirSync(join(root, 'src/data/generated'), { recursive: true });
    const generated: StatsData = { ...emptyStats, generatedAt: '2026-09-20T00:00:00.000Z' };
    writeFileSync(join(root, 'src/data/generated/stats.json'), JSON.stringify(generated));
    expect(loadStats(root)).toEqual(generated);
  });
});

describe('writingStats', () => {
  it('counts posts, words and topics', () => {
    const posts = [
      { body: 'one two three', data: { tags: ['astro', 'docker'] } },
      { body: 'four five', data: { tags: ['docker'] } },
    ];
    const result = writingStats(posts);
    expect(result.posts).toBe(2);
    expect(result.words).toBe(5);
    expect(result.topics).toEqual([
      { tag: 'docker', count: 2 },
      { tag: 'astro', count: 1 },
    ]);
  });

  it('handles a post without a body as zero words', () => {
    const result = writingStats([{ data: { tags: [] } }]);
    expect(result.posts).toBe(1);
    expect(result.words).toBe(0);
    expect(result.topics).toEqual([]);
  });
});

describe('heatmapWeeks', () => {
  it('returns 53 columns of 7 days each', () => {
    const weeks = heatmapWeeks([], new Date('2026-09-19T00:00:00Z'));
    expect(weeks).toHaveLength(53);
    for (const week of weeks) expect(week).toHaveLength(7);
  });

  it('ends the last column on the Saturday of the week containing end', () => {
    // 2026-09-19 is a Saturday: it must land on the last row of the last column.
    const contributions: Contribution[] = [{ date: '2026-09-19', count: 7 }];
    const weeks = heatmapWeeks(contributions, new Date('2026-09-19T00:00:00Z'));
    expect(weeks[52][6]).toBe(7);
    expect(weeks[52].slice(0, 6)).toEqual([0, 0, 0, 0, 0, 0]);
  });

  it('places a contribution in its sunday-to-saturday column, indexed [week][day]', () => {
    // 2026-09-16 is the Wednesday of the same week as the 2026-09-19 Saturday end date
    // (week runs 2026-09-13 Sunday .. 2026-09-19 Saturday, so Wednesday is day index 3).
    const contributions: Contribution[] = [{ date: '2026-09-16', count: 3 }];
    const weeks = heatmapWeeks(contributions, new Date('2026-09-19T00:00:00Z'));
    expect(weeks[52][3]).toBe(3);
  });

  it('leaves every other cell at zero', () => {
    const weeks = heatmapWeeks(
      [{ date: '2026-09-19', count: 1 }],
      new Date('2026-09-19T00:00:00Z'),
    );
    const total = weeks.flat().reduce((sum, n) => sum + n, 0);
    expect(total).toBe(1);
  });
});

describe('heatmapColumnStarts', () => {
  it('returns 53 Sunday dates aligned with heatmapWeeks columns', () => {
    const end = new Date('2026-09-19T00:00:00Z');
    const starts = heatmapColumnStarts(end);
    expect(starts).toHaveLength(53);
    for (const start of starts) expect(start.getUTCDay()).toBe(0);
    // last column starts on the Sunday of the week containing the Saturday end date.
    expect(starts[52].toISOString().slice(0, 10)).toBe('2026-09-13');
    expect(starts[51].toISOString().slice(0, 10)).toBe('2026-09-06');
  });
});

describe('heatLevel', () => {
  it('is 0 for a zero count', () => {
    expect(heatLevel(0, 10)).toBe(0);
  });

  it('reaches the maximum level exactly at the max count', () => {
    expect(heatLevel(10, 10)).toBe(4);
  });

  it('is bounded to 4 even above the max', () => {
    expect(heatLevel(40, 10)).toBe(4);
  });

  it('rounds up to the next level', () => {
    expect(heatLevel(1, 10)).toBe(1);
    expect(heatLevel(3, 10)).toBe(2);
  });
});
