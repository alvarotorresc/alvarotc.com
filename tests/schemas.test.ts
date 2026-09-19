import { describe, it, expect } from 'vitest';
import { postSchema } from '../src/content.config';

describe('postSchema', () => {
  it('accepts a valid post and defaults draft and tags', () => {
    const parsed = postSchema.parse({
      title: 'Hello',
      description: 'A post',
      date: '2026-09-01',
    });
    expect(parsed.draft).toBe(false);
    expect(parsed.tags).toEqual([]);
    expect(parsed.date).toBeInstanceOf(Date);
  });

  it('rejects a post without description', () => {
    expect(() => postSchema.parse({ title: 'x', date: '2026-01-01' })).toThrow();
  });
});
