import { describe, it, expect } from 'vitest';
import { projectSlug, projectLang, sortProjects, tone } from '../src/lib/projects';
import { statusLabel, translations } from '../src/i18n/translations';

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

describe('tone', () => {
  it('maps each status to a tag tone', () => {
    expect(tone('published')).toBe('ok');
    expect(tone('publishing')).toBe('warn');
    expect(tone('beta')).toBe('warn');
    expect(tone('development')).toBe('neutral');
    expect(tone('design')).toBe('neutral');
    expect(tone('archived')).toBe('neutral');
  });
});

describe('project translations', () => {
  it('labels the publishing status', () => {
    expect(statusLabel('publishing', 'es')).toBe('En publicación');
    expect(statusLabel('publishing', 'en')).toBe('Publishing');
  });

  it('translates every project key into Spanish', () => {
    const keys = Object.keys(translations.en).filter((key) => key.startsWith('project.'));
    expect(keys.length).toBeGreaterThan(40);
    keys.forEach((key) => expect(translations.es).toHaveProperty([key]));
  });
});
