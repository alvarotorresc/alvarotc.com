import { describe, it, expect } from 'vitest';
import { toStoryStage, firstPolaroid, polaroidFor, type RawStage } from '../src/lib/about-stages';
import { t } from '../src/i18n/translations';

const facts = { year: '2018', place: 'Sevilla', os: '[DATO]', stack: 'PHP' };

const raw = (id: string, extra: Partial<RawStage> = {}): RawStage => ({
  id,
  kicker: id,
  title: id,
  paragraphs: ['p'],
  links: [],
  ...extra,
});

describe('toStoryStage', () => {
  it('builds a polaroid when the stage has a photo', () => {
    const stage = toStoryStage(
      raw('daw', { photoAlt: 'IES', caption: '2018 · IES', facts }),
      '/a.webp',
    );
    expect(stage.polaroid).toEqual({ src: '/a.webp', alt: 'IES', caption: '2018 · IES', facts });
  });

  it('leaves the polaroid empty when there is no photo', () => {
    expect(toStoryStage(raw('chess'), undefined).polaroid).toBeUndefined();
  });

  it('fills missing alt, caption and facts with empty strings', () => {
    const stage = toStoryStage(raw('x'), '/x.webp');
    expect(stage.polaroid).toEqual({
      src: '/x.webp',
      alt: '',
      caption: '',
      facts: { year: '', place: '', os: '', stack: '' },
    });
  });
});

describe('firstPolaroid and polaroidFor', () => {
  const stages = [
    toStoryStage(raw('intro'), undefined),
    toStoryStage(raw('daw', { caption: 'first' }), '/daw.webp'),
    toStoryStage(raw('own-2026', { caption: 'today' }), '/desk.webp'),
  ];

  it('returns the first stage that has a photo', () => {
    expect(firstPolaroid(stages)?.src).toBe('/daw.webp');
  });

  it('returns the polaroid of the requested stage', () => {
    expect(polaroidFor(stages, 'own-2026')?.caption).toBe('today');
  });

  it('falls back to the first polaroid when the stage has none', () => {
    expect(polaroidFor(stages, 'intro')?.src).toBe('/daw.webp');
  });
});

describe('about fact labels', () => {
  it('translates the four fact keys', () => {
    expect(
      ['year', 'place', 'os', 'stack'].map((k) =>
        t(`about.facts.${k}` as 'about.facts.year', 'es'),
      ),
    ).toEqual(['año', 'lugar', 'sistema', 'stack']);
    expect(t('about.facts.os', 'en')).toBe('os');
  });
});
