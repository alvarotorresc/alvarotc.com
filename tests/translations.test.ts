import { describe, it, expect } from 'vitest';
import { translations } from '../src/i18n/translations';

describe('translations', () => {
  it('has the same keys in English and Spanish', () => {
    expect(Object.keys(translations.es).sort()).toEqual(Object.keys(translations.en).sort());
  });

  it('keeps page descriptions under 155 characters', () => {
    const keys = [
      'error.description',
      'stats.description',
      'legal.privacy.description',
      'legal.notice.description',
    ] as const;
    for (const lang of ['en', 'es'] as const) {
      for (const key of keys) expect(translations[lang][key].length).toBeLessThan(155);
    }
  });

  it('gives the projects page its own description of 120 to 155 characters', () => {
    for (const lang of ['en', 'es'] as const) {
      const description = translations[lang]['projects.description'];
      expect(description.length).toBeGreaterThanOrEqual(120);
      expect(description.length).toBeLessThanOrEqual(155);
      expect(description).not.toMatch(/sin\s*herencia/i);
    }
  });

  it('names the role and the city in the home title', () => {
    expect(translations.en['home.title']).toBe(
      'Álvaro Torres Carrasco · Software Engineer in Seville',
    );
    expect(translations.es['home.title']).toBe(
      'Álvaro Torres Carrasco · Software Engineer en Sevilla',
    );
  });
});
