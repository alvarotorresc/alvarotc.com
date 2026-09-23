import { describe, it, expect } from 'vitest';
import { z } from 'astro/zod';
import type { SchemaContext } from 'astro:content';
import { aboutSchema } from '../src/content.config';
import { personJsonLd } from '../src/lib/jsonld';

const schema = aboutSchema({ image: () => z.string() } as unknown as SchemaContext);

const base = {
  title: 'Hi, I am Álvaro.',
  intro: 'Backend developer from Spain.',
  values: [{ icon: 'git-fork', title: 'Free software', text: 'If I ship it, you can read it.' }],
};

const withPhoto = {
  id: 'daw-2018',
  kicker: '2018',
  title: 'Web application development',
  paragraphs: ['Two years at IES Velázquez.'],
  photo: '../../assets/about/ies-2018.jpg',
  photoAlt: 'IES Velázquez',
  caption: '2018 · IES Velázquez, Sevilla',
  facts: { year: '2018', place: 'Sevilla', os: '[DATO]', stack: 'PHP, JavaScript' },
};

const withoutPhoto = {
  id: 'chess',
  kicker: 'Chess',
  title: 'Chess',
  paragraphs: ['On Lichess.'],
};

describe('aboutSchema', () => {
  it('defaults mock to false and links to an empty list', () => {
    const parsed = schema.parse({ ...base, stages: [withoutPhoto] });
    expect(parsed.mock).toBe(false);
    expect(parsed.stages[0].links).toEqual([]);
  });

  it('accepts a stage with a photo and a stage without one', () => {
    const parsed = schema.parse({ ...base, stages: [withPhoto, withoutPhoto] });
    expect(parsed.stages).toHaveLength(2);
    expect(parsed.stages[0].facts?.year).toBe('2018');
    expect(parsed.stages[1].photo).toBeUndefined();
  });

  it('rejects an empty stages list', () => {
    expect(() => schema.parse({ ...base, stages: [] })).toThrow();
  });

  it('rejects an entry without values', () => {
    expect(() => schema.parse({ ...base, values: [], stages: [withoutPhoto] })).toThrow();
  });
});

describe('personJsonLd', () => {
  it('builds the Person schema for Spanish', () => {
    const jsonLd = personJsonLd('es') as {
      jobTitle: string;
      url: string;
      sameAs: string[];
    };
    expect(jsonLd.jobTitle).toBe('Software Engineer');
    expect(jsonLd.url).toBe('https://alvarotc.com/es/');
    expect(jsonLd.sameAs).toHaveLength(3);
  });

  it('builds the Person schema for English', () => {
    const jsonLd = personJsonLd('en') as { jobTitle: string; url: string };
    expect(jsonLd.jobTitle).toBe('Software Engineer');
    expect(jsonLd.url).toBe('https://alvarotc.com');
  });
});
