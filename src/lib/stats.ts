import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tagCounts, type PostEntry } from './posts';

export type Contribution = { date: string; count: number };

export type StatsData = {
  generatedAt: string | null;
  github: {
    contributions: Contribution[];
    commitsThisYear: number;
    publicRepos: number;
    stars: number;
    streak: number;
    mostActiveRepo: { name: string; commits30d: number } | null;
    languages: { name: string; percent: number }[];
  } | null;
  umami: { views30d: number; mostRead: { path: string; title: string; views: number }[] } | null;
};

export function loadStats(root: string = process.cwd()): StatsData {
  const generated = join(root, 'src/data/generated/stats.json');
  const fallback = join(root, 'src/data/fallback/stats.json');
  const path = existsSync(generated) ? generated : fallback;
  return JSON.parse(readFileSync(path, 'utf8')) as StatsData;
}

export type WritingStats = {
  posts: number;
  words: number;
  topics: { tag: string; count: number }[];
};

function wordCount(text: string): number {
  const trimmed = text.trim();
  return trimmed === '' ? 0 : trimmed.split(/\s+/).length;
}

export function writingStats(posts: { body?: string; data: { tags: string[] } }[]): WritingStats {
  return {
    posts: posts.length,
    words: posts.reduce((sum, post) => sum + wordCount(post.body ?? ''), 0),
    topics: tagCounts(posts as unknown as PostEntry[]),
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKS = 53;

function atUTCMidnight(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function heatmapWeeks(contributions: Contribution[], end: Date): number[][] {
  const byDate = new Map(contributions.map((c) => [c.date, c.count]));
  const endUTC = atUTCMidnight(end);
  const lastSaturday = new Date(endUTC.getTime() + (6 - endUTC.getUTCDay()) * DAY_MS);
  const firstSunday = new Date(lastSaturday.getTime() - (WEEKS * 7 - 1) * DAY_MS);

  const weeks: number[][] = [];
  for (let week = 0; week < WEEKS; week++) {
    const days: number[] = [];
    for (let day = 0; day < 7; day++) {
      const date = new Date(firstSunday.getTime() + (week * 7 + day) * DAY_MS);
      days.push(byDate.get(isoDate(date)) ?? 0);
    }
    weeks.push(days);
  }
  return weeks;
}

export function heatmapColumnStarts(end: Date): Date[] {
  const endUTC = atUTCMidnight(end);
  const lastSaturday = new Date(endUTC.getTime() + (6 - endUTC.getUTCDay()) * DAY_MS);
  const firstSunday = new Date(lastSaturday.getTime() - (WEEKS * 7 - 1) * DAY_MS);
  return Array.from(
    { length: WEEKS },
    (_, week) => new Date(firstSunday.getTime() + week * 7 * DAY_MS),
  );
}

export function heatLevel(count: number, max: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0 || max <= 0) return 0;
  const level = Math.ceil((count / max) * 4);
  return Math.min(4, Math.max(1, level)) as 1 | 2 | 3 | 4;
}
