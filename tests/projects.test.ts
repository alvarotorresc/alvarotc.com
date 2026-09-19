import { describe, it, expect } from 'vitest';
import { projectSlug, projectLang, sortProjects } from '../src/lib/projects';

const entry = (id: string, order: number) =>
  ({ id, data: { order } }) as unknown as Parameters<typeof sortProjects>[0][number];

describe('projects helpers', () => {
  it('extracts slug and lang from the id', () => {
    expect(projectSlug(entry('en/bito', 1))).toBe('bito');
    expect(projectLang(entry('es/bito', 1))).toBe('es');
    expect(projectLang(entry('en/bito', 1))).toBe('en');
  });

  it('sorts by order ascending without mutating', () => {
    const list = [entry('en/b', 3), entry('en/a', 1), entry('en/c', 2)];
    const sorted = sortProjects(list);
    expect(sorted.map((e) => e.id)).toEqual(['en/a', 'en/c', 'en/b']);
    expect(list[0].id).toBe('en/b');
  });
});
