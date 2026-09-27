import { describe, it, expect } from 'vitest';
import { z } from 'astro/zod';
import type { SchemaContext } from 'astro:content';
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

const project = projectSchema({ image: () => z.string() } as unknown as SchemaContext);

const minimal = {
  name: 'Bito',
  tagline: 'Habits',
  kind: 'mobile',
  status: 'published',
  tier: 'featured',
  order: 1,
};

describe('projectSchema', () => {
  it('defaults the lists and visibility', () => {
    const p = project.parse(minimal);
    expect(p.visible).toBe(true);
    expect(p.stack).toEqual([]);
    expect(p.changelog).toEqual([]);
    expect(p.terminal).toEqual([]);
    expect(p.facts).toEqual([]);
    expect(p.screenshots).toEqual([]);
    expect(p.features).toEqual([]);
    expect(p.steps).toEqual([]);
    expect(p.built).toEqual([]);
    expect(p.tools).toEqual([]);
    expect(p.toolsIntro).toBeUndefined();
  });

  it('accepts tools with an optional image and link', () => {
    const p = project.parse({
      ...minimal,
      toolsIntro: 'Cada herramienta en su dirección.',
      tools: [
        { name: 'Pokédex', text: 'Los 1025.', href: 'https://pokeutils.alvarotc.com/#/pokedex' },
        { name: 'Tipos', text: 'La tabla.', image: '../../../assets/projects/pokeutils/tipos.png' },
      ],
    });
    expect(p.toolsIntro).toBe('Cada herramienta en su dirección.');
    expect(p.tools).toHaveLength(2);
    expect(p.tools[0].image).toBeUndefined();
    expect(p.tools[1].href).toBeUndefined();
    expect(() =>
      project.parse({ ...minimal, tools: [{ name: 'X', text: 'Y', href: 'not a url' }] }),
    ).toThrow();
  });

  it('requires a kind', () => {
    const withoutKind: Record<string, unknown> = { ...minimal };
    delete withoutKind.kind;
    expect(() => project.parse(withoutKind)).toThrow();
  });

  it('accepts the publishing status', () => {
    expect(project.parse({ ...minimal, status: 'publishing' }).status).toBe('publishing');
  });

  it('rejects an unknown status', () => {
    expect(() => project.parse({ ...minimal, status: 'live' })).toThrow();
  });

  it('coerces a changelog entry date into a Date', () => {
    const p = project.parse({
      ...minimal,
      changelog: [{ version: 'v1.0.0', date: '2026-08-26', note: 'First release.' }],
    });
    expect(p.changelog[0].date).toBeInstanceOf(Date);
  });

  it('defaults a fact to not mono', () => {
    const p = project.parse({ ...minimal, facts: [{ label: 'Red', value: 'Sin permiso de red' }] });
    expect(p.facts[0].mono).toBe(false);
  });

  it('accepts the cli fields and the media fields', () => {
    const p = project.parse({
      ...minimal,
      kind: 'cli',
      command: 'npx create-astro-blog my-blog',
      terminal: ['$ npx create-astro-blog my-blog'],
      steps: [{ title: 'Dominio', text: 'Para el SEO.' }],
      stepsIntro: 'Seis preguntas.',
      after: 'cd my-blog && npm run dev',
      download: { url: 'https://example.com/app.apk', label: '4,7 MB' },
      screenshots: [
        { src: '../../../assets/projects/bito/widget.png', alt: 'Widget', caption: 'Widget' },
      ],
      features: [{ title: 'Widget', text: 'Un toque.' }],
    });
    expect(p.kind).toBe('cli');
    expect(p.steps).toHaveLength(1);
    expect(p.features[0].image).toBeUndefined();
  });

  it('accepts an optional promo image for the home', () => {
    const p = project.parse({
      ...minimal,
      promo: '../../../assets/projects/bito/promo.png',
    });
    expect(p.promo).toBe('../../../assets/projects/bito/promo.png');
  });

  it('drops the removed hero and gallery fields', () => {
    const p = project.parse({ ...minimal, hero: '/projects/x.png', gallery: ['/a.png'] });
    expect(p).not.toHaveProperty('hero');
    expect(p).not.toHaveProperty('gallery');
  });

  it('accepts a local video file as a site path and keeps urls for the rest', () => {
    const src = '/video/bito-promo-es.mp4';
    expect(project.parse({ ...minimal, playground: { kind: 'file', src } }).playground).toEqual({
      kind: 'file',
      src,
    });
    expect(() =>
      project.parse({ ...minimal, playground: { kind: 'file', src: 'https://x.dev/a.mp4' } }),
    ).toThrow();
    expect(() => project.parse({ ...minimal, playground: { kind: 'video', src } })).toThrow();
    expect(() => project.parse({ ...minimal, playground: { kind: 'pwa', src } })).toThrow();
  });

  it('defaults featureBlockLimit to three and accepts one to six', () => {
    expect(project.parse(minimal).featureBlockLimit).toBe(3);
    expect(project.parse({ ...minimal, featureBlockLimit: 5 }).featureBlockLimit).toBe(5);
  });

  it('rejects a featureBlockLimit that is not a whole number from one to six', () => {
    [0, 7, 2.5, '5'].forEach((featureBlockLimit) =>
      expect(
        () => project.parse({ ...minimal, featureBlockLimit }),
        String(featureBlockLimit),
      ).toThrow(),
    );
  });
});
