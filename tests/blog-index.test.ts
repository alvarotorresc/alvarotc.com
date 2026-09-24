import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import PostList from '../src/components/blog/PostList.astro';

interface FlatPost {
  slug: string;
  href: string;
  title: string;
  description: string;
  date: Date;
  readingMinutes: number;
  tags: string[];
}

function post(slug: string, date: string, tags: string[]): FlatPost {
  return {
    slug,
    href: `/blog/${slug}`,
    title: `Post ${slug}`,
    description: `Description ${slug}`,
    date: new Date(date),
    readingMinutes: 5,
    tags,
  };
}

const posts: FlatPost[] = [
  post('recent', '2026-09-07', ['docker', 'foss']),
  post('second', '2026-09-02', ['docker', 'vps']),
  post('third', '2026-08-14', ['android']),
];

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

async function renderList(lang: 'en' | 'es') {
  const container = await AstroContainer.create();
  return container.renderToString(PostList, {
    props: { lang, posts, tags, rssHref: lang === 'es' ? '/es/rss.xml' : '/rss.xml' },
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
    expect(html).toMatch(/<h2[^>]*>\s*<a[^>]*href="\/blog\/recent"[^>]*>Post recent<\/a>\s*<\/h2>/);
  });

  it('renders each post tag as a link', async () => {
    const html = await renderList('es');
    expect(html).toMatch(/<a[^>]*data-filter-tag="docker"[^>]*>docker<\/a>/);
  });

  it('lists every topic with its count and an "All" entry in the topics panel', async () => {
    const html = await renderList('es');
    expect(html).toContain('Temas');
    expect(html).toMatch(/<button[^>]*data-tag=""[^>]*>[\s\S]*?Todos[\s\S]*?<\/button>/);
    for (const { tag, count } of tags) {
      expect(html).toMatch(
        new RegExp(
          `<button[^>]*data-tag="${tag}"[^>]*>[\\s\\S]*?${tag}[\\s\\S]*?${count}[\\s\\S]*?</button>`,
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

  it('keeps the space between the count and the word after the filter script rewrites the number (filtered state)', async () => {
    const es = await renderList('es');
    const esFiltered = es.replace(
      '<span data-header-count>3</span>',
      '<span data-header-count>2</span>',
    );
    expect(headerCountText(esFiltered)).toBe('2 artículos');

    const en = await renderList('en');
    const enFiltered = en.replace(
      '<span data-header-count>3</span>',
      '<span data-header-count>2</span>',
    );
    expect(headerCountText(enFiltered)).toBe('2 articles');
  });

  it('renders the topics panel closed by default', async () => {
    const html = await renderList('es');
    expect(html).toMatch(/<details[^>]*data-topics-filter[^>]*>/);
    expect(html).not.toMatch(/<details[^>]*data-topics-filter[^>]* open[^>]*>/);
  });
});
