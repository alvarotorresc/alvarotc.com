import { describe, it, expect } from 'vitest';
import { aboutSchema } from '../src/content.config';
import { personJsonLd } from '../src/lib/jsonld';

describe('aboutSchema', () => {
  it('defaults mock to false', () => {
    const parsed = aboutSchema.parse({
      title: 'Hi, I am Álvaro.',
      intro: 'Backend developer from Spain.',
      values: [
        { icon: 'git-fork', title: 'Free software', text: 'If I ship it, you can read it.' },
      ],
    });
    expect(parsed.mock).toBe(false);
  });

  it('rejects an entry without values', () => {
    expect(() =>
      aboutSchema.parse({ title: 'Hi', intro: 'Backend developer.', values: [] }),
    ).toThrow();
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
