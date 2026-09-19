import { describe, it, expect } from 'vitest';
import { postSchema, projectSchema } from '../src/content.config';

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

  it('accepts an optional source id for translated posts', () => {
    const parsed = postSchema.parse({
      title: 'Hello',
      description: 'A post',
      date: '2026-09-01',
      source: 'hola',
    });
    expect(parsed.source).toBe('hola');
  });
});

describe('projectSchema', () => {
  it('defaults visible, stack, gallery and changelog', () => {
    const p = projectSchema.parse({
      name: 'Bito',
      tagline: 'Habits',
      status: 'published',
      tier: 'featured',
      order: 1,
    });
    expect(p.visible).toBe(true);
    expect(p.stack).toEqual([]);
    expect(p.gallery).toEqual([]);
    expect(p.changelog).toEqual([]);
  });

  it('rejects an unknown status', () => {
    expect(() =>
      projectSchema.parse({ name: 'x', tagline: 'y', status: 'live', tier: 'lab', order: 1 }),
    ).toThrow();
  });
});
