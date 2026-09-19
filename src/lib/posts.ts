import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from '../i18n/translations';

export type PostEntry = CollectionEntry<'posts'> | CollectionEntry<'posts-en'>;

export function sortPostsByDate(posts: PostEntry[]): PostEntry[] {
  return [...posts].sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function tagCounts(posts: PostEntry[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.data.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export async function getPosts(lang: Locale): Promise<PostEntry[]> {
  const entries =
    lang === 'es'
      ? await getCollection('posts', (p) => !p.data.draft)
      : await getCollection('posts-en', (p) => !p.data.draft);
  return sortPostsByDate(entries);
}
