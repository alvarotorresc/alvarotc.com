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
});
