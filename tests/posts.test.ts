import { describe, it, expect } from 'vitest';
import { sortPostsByDate, tagCounts, type PostEntry } from '../src/lib/posts';

function post(id: string, date: string, tags: string[]): PostEntry {
  return {
    id,
    collection: 'posts-en',
    data: { title: id, description: '', date: new Date(date), draft: false, tags },
  } as unknown as PostEntry;
}

describe('sortPostsByDate', () => {
  it('orders newest first without mutating the input', () => {
    const input = [
      post('a', '2026-01-01', []),
      post('b', '2026-03-01', []),
      post('c', '2026-02-01', []),
    ];
    const sorted = sortPostsByDate(input);
    expect(sorted.map((p) => p.id)).toEqual(['b', 'c', 'a']);
    expect(input.map((p) => p.id)).toEqual(['a', 'b', 'c']);
  });
});

describe('tagCounts', () => {
  it('counts tags, most used first, ties alphabetical', () => {
    const posts = [
      post('a', '2026-01-01', ['astro', 'docker']),
      post('b', '2026-01-02', ['docker', 'vps']),
      post('c', '2026-01-03', ['android']),
    ];
    expect(tagCounts(posts)).toEqual([
      { tag: 'docker', count: 2 },
      { tag: 'android', count: 1 },
      { tag: 'astro', count: 1 },
      { tag: 'vps', count: 1 },
    ]);
  });

  it('returns an empty list for no posts', () => {
    expect(tagCounts([])).toEqual([]);
  });
});
