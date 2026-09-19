import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from '../i18n/translations';
import { t } from '../i18n/translations';

export type ExperienceEntry = CollectionEntry<'experience'>;

export function formatPeriod(start: string, end: string | undefined, lang: Locale): string {
  const startYear = start.slice(0, 4);
  if (!end) return `${startYear}, ${t('experience.now', lang)}`;
  const endYear = end.slice(0, 4);
  return startYear === endYear ? startYear : `${startYear}, ${endYear}`;
}

export function isCurrent(entry: ExperienceEntry): boolean {
  return !entry.data.end;
}

export function sortExperience(entries: ExperienceEntry[]): ExperienceEntry[] {
  return [...entries].sort((a, b) => (a.data.start < b.data.start ? 1 : -1));
}

export async function getExperience(): Promise<ExperienceEntry[]> {
  return sortExperience(await getCollection('experience'));
}
