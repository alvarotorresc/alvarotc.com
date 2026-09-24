import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import WritingList from '../src/components/home/WritingList.astro';
import type { PostEntry } from '../src/lib/posts';

function makePost(id: string, date: string): PostEntry {
  return {
    id,
    body: 'word '.repeat(50),
    data: {
      title: `Post ${id}`,
      description: `Description ${id}`,
      date: new Date(date),
      draft: false,
      tags: [],
    },
  } as unknown as PostEntry;
}

function makePosts(count: number): PostEntry[] {
  return Array.from({ length: count }, (_, i) =>
    makePost(String(i + 1), `2026-01-${String(i + 1).padStart(2, '0')}`),
  );
}

describe('WritingList', () => {
  it('shows the count when there are more posts than the ones shown', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(WritingList, {
      props: { lang: 'es', posts: makePosts(12) },
    });
    expect(html).toContain('Ver los 12 artículos');
  });

  it('falls back to the generic label when there is nothing extra to show', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(WritingList, {
      props: { lang: 'es', posts: makePosts(3) },
    });
    expect(html).toContain('Todos los artículos');
    expect(html).not.toContain('Ver los');
  });

  it('shows the English count label too', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(WritingList, {
      props: { lang: 'en', posts: makePosts(12) },
    });
    expect(html).toContain('See all 12 articles');
  });
});
