import type { Locale } from '../i18n/translations';

export type SearchKind = 'page' | 'project' | 'post';

export type SearchItem = {
  kind: SearchKind;
  lang: Locale;
  title: string;
  text: string;
  url: string;
};

const kindOrder: Record<SearchKind, number> = { page: 0, project: 1, post: 2 };

export function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function score(item: SearchItem, terms: string[]): number {
  const title = normalize(item.title);
  const text = normalize(item.text);
  let total = 0;
  for (const term of terms) {
    if (!title.includes(term) && !text.includes(term)) return -1;
    if (title.startsWith(term)) total += 3;
    else if (title.includes(term)) total += 2;
    if (text.includes(term)) total += 1;
  }
  return total;
}

export function searchItems(
  items: SearchItem[],
  query: string,
  lang: Locale,
  limit = 8,
): SearchItem[] {
  const byKind = items
    .filter((item) => item.lang === lang)
    .sort((a, b) => kindOrder[a.kind] - kindOrder[b.kind]);
  const terms = normalize(query).split(' ').filter(Boolean);
  if (terms.length === 0) return byKind.slice(0, limit);
  return byKind
    .map((item) => ({ item, score: score(item, terms) }))
    .filter((row) => row.score >= 0)
    .sort((a, b) => b.score - a.score || kindOrder[a.item.kind] - kindOrder[b.item.kind])
    .slice(0, limit)
    .map((row) => row.item);
}
