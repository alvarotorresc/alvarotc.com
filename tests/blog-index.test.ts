import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import PostList from '../src/components/blog/PostList.astro';
import { topicBasePath } from '../src/lib/pagination';

interface FlatPost {
  slug: string;
  href: string;
  title: string;
  description: string;
  date: Date;
  readingMinutes: number;
  tags: string[];
  tagHref: (tag: string) => string;
}

function post(lang: 'en' | 'es', slug: string, date: string, tags: string[]): FlatPost {
  return {
    slug,
    href: lang === 'es' ? `/es/blog/${slug}` : `/blog/${slug}`,
    title: `Post ${slug}`,
    description: `Description ${slug}`,
    date: new Date(date),
    readingMinutes: 5,
    tags,
    tagHref: (tag: string) => topicBasePath(lang, tag),
  };
}

function postsFor(lang: 'en' | 'es'): FlatPost[] {
  return [
    post(lang, 'recent', '2026-09-07', ['docker', 'foss']),
    post(lang, 'second', '2026-09-02', ['docker', 'vps']),
    post(lang, 'third', '2026-08-14', ['android']),
  ];
}

const tags = [
  { tag: 'docker', count: 2 },
  { tag: 'vps', count: 1 },
  { tag: 'foss', count: 1 },
  { tag: 'android', count: 1 },
];

function headerCountText(html: string): string {
  const match = html.match(/<p class="text-muted">([\s\S]*?)<\/p>/);
  if (!match) throw new Error('header count paragraph not found');
  return match[1].replace(/<[^>]+>/g, '').trim();
}

interface RenderOptions {
  title?: string;
  activeTag?: string;
  scopeTotal?: number;
  page?: number;
  totalPages?: number;
  prevHref?: string;
  nextHref?: string;
}

async function renderList(lang: 'en' | 'es', options: RenderOptions = {}) {
  const posts = postsFor(lang);
  const allHref = lang === 'es' ? '/es/blog/' : '/blog/';
  const container = await AstroContainer.create();
  return container.renderToString(PostList, {
    props: {
      lang,
      posts,
      tags,
      rssHref: lang === 'es' ? '/es/rss.xml' : '/rss.xml',
      title: options.title,
      languageTotal: posts.length,
      scopeTotal: options.scopeTotal ?? posts.length,
      rangeStart: 1,
      rangeEnd: options.scopeTotal ?? posts.length,
      allHref,
      topicHref: (tag: string) => topicBasePath(lang, tag),
      activeTag: options.activeTag,
      page: options.page ?? 1,
      totalPages: options.totalPages ?? 1,
      prevHref: options.prevHref,
      nextHref: options.nextHref,
    },
  });
}

describe('PostList', () => {
  it('gives the first post the large-size class and the rest the regular one', async () => {
    const html = await renderList('es');
    const articles = html.split('<article').slice(1);
    expect(articles.length).toBe(3);
    expect(articles[0]).toContain('text-[34px]');
    expect(articles[1]).not.toContain('text-[34px]');
    expect(articles[2]).not.toContain('text-[34px]');
  });

  it('renders titles as h2 with a link inside', async () => {
    const html = await renderList('es');
    expect(html).toMatch(
      /<h2[^>]*>\s*<a[^>]*href="\/es\/blog\/recent"[^>]*>Post recent<\/a>\s*<\/h2>/,
    );
  });

  it('renders each post tag as a link to its topic page', async () => {
    const es = await renderList('es');
    expect(es).toMatch(/<a[^>]*href="\/es\/blog\/tema\/docker\/"[^>]*>docker<\/a>/);
    const en = await renderList('en');
    expect(en).toMatch(/<a[^>]*href="\/blog\/topic\/docker\/"[^>]*>docker<\/a>/);
  });

  it('lists every topic with its count and an "All" entry linking to the blog root', async () => {
    const html = await renderList('es');
    expect(html).toContain('Temas');
    expect(html).toMatch(/<a href="\/es\/blog\/"[^>]*>[\s\S]*?Todos[\s\S]*?<\/a>/);
    for (const { tag, count } of tags) {
      expect(html).toMatch(
        new RegExp(
          `<a href="/es/blog/tema/${tag}/"[^>]*>[\\s\\S]*?${tag}[\\s\\S]*?${count}[\\s\\S]*?</a>`,
        ),
      );
    }
  });

  it('links the RSS button to the feed of each language', async () => {
    const es = await renderList('es');
    expect(es).toMatch(/<a[^>]*href="\/es\/rss\.xml"[^>]*>[\s\S]*?RSS/);
    const en = await renderList('en');
    expect(en).toMatch(/<a[^>]*href="\/rss\.xml"[^>]*>[\s\S]*?RSS/);
  });

  it('shows the Spanish header, count and footer texts with a space between the number and the word', async () => {
    const html = await renderList('es');
    expect(html).toContain('Artículos');
    expect(headerCountText(html)).toBe('3 artículos');
    expect(html).toContain('Filtrar por tema');
    expect(html).toContain('3 de 3');
  });

  it('shows the English header, count and footer texts with a space between the number and the word', async () => {
    const html = await renderList('en');
    expect(html).toContain('Writing');
    expect(headerCountText(html)).toBe('3 articles');
    expect(html).toContain('Filter by topic');
    expect(html).toContain('3 of 3');
  });

  it('keeps the header count as the full language total even on a topic page', async () => {
    const html = await renderList('es', {
      title: 'Artículos sobre docker',
      activeTag: 'docker',
      scopeTotal: 2,
    });
    expect(headerCountText(html)).toBe('3 artículos');
    expect(html).toContain('2 de 2');
    expect(html).toContain('Artículos sobre docker');
  });

  it('shows the active topic label and a clear-filter link on a topic page', async () => {
    const html = await renderList('es', { activeTag: 'docker', scopeTotal: 2 });
    expect(html).toContain('Tema: docker');
    expect(html).toMatch(/<a href="\/es\/blog\/"[^>]*>[\s\S]*?Quitar filtro/);
  });

  it('does not show a clear-filter link when there is no active topic', async () => {
    const html = await renderList('es');
    expect(html).not.toContain('Quitar filtro');
  });

  it('renders the topics panel closed by default', async () => {
    const html = await renderList('es');
    expect(html).toMatch(/<details[^>]*data-topics-filter[^>]*>/);
    expect(html).not.toMatch(/<details[^>]*data-topics-filter[^>]* open[^>]*>/);
  });

  it('shows a page count and prev/next links only when there is more than one page', async () => {
    const single = await renderList('es');
    expect(single).not.toContain('Página');

    const multi = await renderList('es', {
      page: 2,
      totalPages: 3,
      prevHref: '/es/blog/',
      nextHref: '/es/blog/3/',
    });
    expect(multi).toContain('Página 2 de 3');
    expect(multi).toMatch(/<a[^>]*href="\/es\/blog\/"[^>]*rel="prev"/);
    expect(multi).toMatch(/<a[^>]*href="\/es\/blog\/3\/"[^>]*rel="next"/);
  });

  it('hides the previous link on the first page and the next link on the last page', async () => {
    const first = await renderList('es', { page: 1, totalPages: 3, nextHref: '/es/blog/2/' });
    expect(first).not.toMatch(/rel="prev"/);
    expect(first).toMatch(/rel="next"/);

    const last = await renderList('es', { page: 3, totalPages: 3, prevHref: '/es/blog/2/' });
    expect(last).not.toMatch(/rel="next"/);
    expect(last).toMatch(/rel="prev"/);
  });
});
