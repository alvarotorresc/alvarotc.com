import { describe, it, expect } from 'vitest';
import {
  paginateItems,
  formatRange,
  pagePath,
  blogBasePath,
  topicBasePath,
  otherLangPageNumber,
  hreflangLinksFor,
  POSTS_PER_PAGE,
} from '../src/lib/pagination';

function items(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i + 1);
}

describe('paginateItems', () => {
  it('splits 23 items into 3 pages of 10/10/3', () => {
    const pages = paginateItems(items(23));
    expect(pages.length).toBe(3);
    expect(pages[0].items.length).toBe(10);
    expect(pages[1].items.length).toBe(10);
    expect(pages[2].items.length).toBe(3);
    expect(pages.map((p) => p.totalPages)).toEqual([3, 3, 3]);
    expect(pages.map((p) => p.page)).toEqual([1, 2, 3]);
  });

  it('keeps a single page when there are 5 items', () => {
    const pages = paginateItems(items(5));
    expect(pages.length).toBe(1);
    expect(pages[0].items.length).toBe(5);
    expect(pages[0].totalPages).toBe(1);
  });

  it('reports the correct 1-based start/end for each page', () => {
    const pages = paginateItems(items(23));
    expect([pages[0].start, pages[0].end]).toEqual([1, 10]);
    expect([pages[1].start, pages[1].end]).toEqual([11, 20]);
    expect([pages[2].start, pages[2].end]).toEqual([21, 23]);
  });

  it('defaults to POSTS_PER_PAGE items per page', () => {
    expect(POSTS_PER_PAGE).toBe(10);
    const pages = paginateItems(items(POSTS_PER_PAGE));
    expect(pages.length).toBe(1);
  });

  it('produces a single empty page for an empty list', () => {
    const pages = paginateItems(items(0));
    expect(pages.length).toBe(1);
    expect(pages[0].items).toEqual([]);
  });
});

describe('formatRange', () => {
  it('formats ranges with an en dash', () => {
    expect(formatRange(1, 10)).toBe('1–10');
    expect(formatRange(11, 20)).toBe('11–20');
    expect(formatRange(21, 23)).toBe('21–23');
  });

  it('formats a single-item range without a dash', () => {
    expect(formatRange(5, 5)).toBe('5');
  });
});

describe('pagePath', () => {
  it('returns the base path for page 1', () => {
    expect(pagePath('/blog/', 1)).toBe('/blog/');
    expect(pagePath('/blog/topic/docker/', 1)).toBe('/blog/topic/docker/');
  });

  it('appends the page number for page 2 and beyond', () => {
    expect(pagePath('/blog/', 2)).toBe('/blog/2/');
    expect(pagePath('/blog/topic/docker/', 3)).toBe('/blog/topic/docker/3/');
  });
});

describe('blogBasePath', () => {
  it('builds the language-specific blog root', () => {
    expect(blogBasePath('en')).toBe('/blog/');
    expect(blogBasePath('es')).toBe('/es/blog/');
  });
});

describe('topicBasePath', () => {
  it('builds the language-specific topic root', () => {
    expect(topicBasePath('en', 'docker')).toBe('/blog/topic/docker/');
    expect(topicBasePath('es', 'docker')).toBe('/es/blog/tema/docker/');
  });
});

describe('otherLangPageNumber', () => {
  it('keeps the same page number when the counterpart has it', () => {
    expect(otherLangPageNumber(2, 3)).toBe(2);
  });

  it('falls back to page 1 when the counterpart is shorter', () => {
    expect(otherLangPageNumber(2, 1)).toBe(1);
  });
});

describe('hreflangLinksFor', () => {
  it('emits self, the other language and x-default when a true equivalent exists', () => {
    const links = hreflangLinksFor(
      'en',
      'https://alvarotc.com/blog/topic/docker/',
      'es',
      'https://alvarotc.com/es/blog/tema/docker/',
    );
    expect(links).toEqual([
      { lang: 'en', href: 'https://alvarotc.com/blog/topic/docker/' },
      { lang: 'es', href: 'https://alvarotc.com/es/blog/tema/docker/' },
      { lang: 'x-default', href: 'https://alvarotc.com/blog/topic/docker/' },
    ]);
  });

  it('never points hreflang at a URL that does not exist when there is no equivalent', () => {
    const links = hreflangLinksFor('en', 'https://alvarotc.com/blog/topic/kotlin/', 'es');
    expect(links).toEqual([
      { lang: 'en', href: 'https://alvarotc.com/blog/topic/kotlin/' },
      { lang: 'x-default', href: 'https://alvarotc.com/blog/topic/kotlin/' },
    ]);
  });

  it('falls back x-default to its own canonical when the Spanish page has no English equivalent', () => {
    const links = hreflangLinksFor('es', 'https://alvarotc.com/es/blog/tema/process/2/', 'en');
    expect(links).toEqual([
      { lang: 'es', href: 'https://alvarotc.com/es/blog/tema/process/2/' },
      { lang: 'x-default', href: 'https://alvarotc.com/es/blog/tema/process/2/' },
    ]);
  });
});
