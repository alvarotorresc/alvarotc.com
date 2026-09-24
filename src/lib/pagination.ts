import type { Locale } from '../i18n/translations';

export const POSTS_PER_PAGE = 10;

export interface Page<T> {
  items: T[];
  page: number;
  totalPages: number;
  start: number;
  end: number;
}

export function paginateItems<T>(items: T[], perPage: number = POSTS_PER_PAGE): Page<T>[] {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  return Array.from({ length: totalPages }, (_, i) => {
    const offset = i * perPage;
    const pageItems = items.slice(offset, offset + perPage);
    return {
      items: pageItems,
      page: i + 1,
      totalPages,
      start: offset + 1,
      end: offset + pageItems.length,
    };
  });
}

export function formatRange(start: number, end: number): string {
  return start === end ? String(start) : `${start}–${end}`;
}

/**
 * Builds the URL for a given page number under a base path.
 * `basePath` must end with a trailing slash (e.g. "/blog/", "/blog/topic/docker/").
 * Page 1 is the base path itself; page N>1 appends "N/".
 */
export function pagePath(basePath: string, page: number): string {
  return page <= 1 ? basePath : `${basePath}${page}/`;
}

export function blogBasePath(lang: Locale): string {
  return lang === 'es' ? '/es/blog/' : '/blog/';
}

export function topicBasePath(lang: Locale, tag: string): string {
  return lang === 'es' ? `/es/blog/tema/${tag}/` : `/blog/topic/${tag}/`;
}

/**
 * Resolves which page number of a counterpart listing (the other language's
 * equivalent page or topic page) the footer "view in other language" link
 * should point at: the same page number when it exists there, otherwise its
 * first page. Not meant for hreflang — see `hreflangLinksFor`, which only
 * points at a page that actually exists and is a true equivalent.
 */
export function otherLangPageNumber(page: number, otherTotalPages: number): number {
  return page <= otherTotalPages ? page : 1;
}

/**
 * Builds the hreflang set for a listing/topic page: itself, the other
 * language only when `alternateURL` is a true equivalent (same content,
 * same page number), and x-default. Never points at a URL that doesn't
 * exist or isn't equivalent.
 */
export function hreflangLinksFor(
  lang: Locale,
  canonicalURL: string,
  otherLang: Locale,
  alternateURL?: string,
): { lang: string; href: string }[] {
  const links = [{ lang, href: canonicalURL }];
  if (alternateURL) links.push({ lang: otherLang, href: alternateURL });
  links.push({
    lang: 'x-default',
    href: lang === 'en' ? canonicalURL : (alternateURL ?? canonicalURL),
  });
  return links;
}
