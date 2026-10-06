import { getCollection, type CollectionEntry } from 'astro:content';
import type { ImageMetadata } from 'astro';
import type { Locale } from '../i18n/translations';

export type ProjectEntry = CollectionEntry<'projects'>;

export function projectSlug(entry: ProjectEntry): string {
  return entry.id.split('/').pop() ?? entry.id;
}

export function projectLang(entry: ProjectEntry): Locale {
  return entry.id.startsWith('es/') ? 'es' : 'en';
}

export function sortProjects(entries: ProjectEntry[]): ProjectEntry[] {
  return [...entries].sort((a, b) => a.data.order - b.data.order);
}

export async function getProjects(lang: Locale): Promise<ProjectEntry[]> {
  const all = await getCollection('projects', (e) => projectLang(e) === lang && e.data.visible);
  return sortProjects(all);
}

export async function getFeaturedProjects(lang: Locale): Promise<ProjectEntry[]> {
  return (await getProjects(lang)).filter((e) => e.data.tier === 'featured');
}

export async function getLabProjects(lang: Locale): Promise<ProjectEntry[]> {
  return (await getProjects(lang)).filter((e) => e.data.tier === 'lab');
}

export function projectForPost(entries: ProjectEntry[], postId: string): ProjectEntry | undefined {
  return entries.find((e) => e.data.post === postId);
}

export function homeImage(entry: ProjectEntry): ImageMetadata | undefined {
  return entry.data.promo ?? entry.data.cover;
}

export function isVerticalImage(image: ImageMetadata): boolean {
  return image.height > image.width;
}

export type StatusTone = 'ok' | 'warn' | 'neutral';

export function tone(status: string): StatusTone {
  if (status === 'published') return 'ok';
  if (status === 'publishing' || status === 'beta') return 'warn';
  return 'neutral';
}
