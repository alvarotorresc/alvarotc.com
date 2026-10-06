import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import { tagLabel } from '../src/lib/tags';
import { readPublishedPosts } from '../src/lib/post-frontmatter';

const RENAMED = {
  proyectos: 'projects',
  observabilidad: 'observability',
  privacidad: 'privacy',
  proceso: 'process',
};

describe('tagLabel', () => {
  it.each(Object.entries(RENAMED))('shows %s in Spanish for the %s tag', (es, en) => {
    expect(tagLabel(en, 'es')).toBe(es);
    expect(tagLabel(en, 'en')).toBe(en);
  });

  it('still translates Spanish-slugged tags in English', () => {
    expect(tagLabel('producto', 'en')).toBe('product');
    expect(tagLabel('finanzas', 'en')).toBe('finance');
  });
});

describe('post tags', () => {
  const posts = [
    ...readPublishedPosts(resolve('src/content/posts')),
    ...readPublishedPosts(resolve('src/content/posts-en')),
  ];

  it('use the English slug for renamed tags in both languages', () => {
    const old = posts.flatMap((post) =>
      post.tags.filter((tag) => tag in RENAMED).map((tag) => `${post.id}: ${tag}`),
    );
    expect(posts.length).toBeGreaterThan(0);
    expect(old).toEqual([]);
  });
});
