import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import AboutStory from '../src/components/about/AboutStory.astro';
import type { StoryStage } from '../src/lib/about-stages';

const stages: StoryStage[] = [
  {
    id: 'daw-2018',
    kicker: '2018',
    title: 'Desarrollo de Aplicaciones Web',
    paragraphs: ['Dos años en el IES Velázquez.'],
    links: [],
    polaroid: {
      src: '/_astro/ies-2018.webp',
      alt: 'IES Velázquez',
      caption: '2018 · IES Velázquez, Sevilla',
      facts: { year: '2018', place: 'Sevilla', os: '[DATO]', stack: 'PHP' },
    },
  },
  {
    id: 'own-2026',
    kicker: '2026',
    title: 'Mis propias cosas',
    paragraphs: ['[Bito](/es/projects/bito) y 1 < 2.'],
    links: [],
    polaroid: {
      src: '/_astro/desk-2026.webp',
      alt: 'Mi mesa',
      caption: '2026 · Sevilla',
      facts: { year: '2026', place: 'Sevilla', os: '[DATO]', stack: '[DATO]' },
    },
  },
  {
    id: 'free-software',
    kicker: 'Principios',
    title: 'Por qué lo publico todo libre',
    paragraphs: ['Uno.', 'Dos.', 'Tres.'],
    links: [{ label: '/stats', href: '/es/stats' }],
  },
];

async function render(mock: boolean) {
  const container = await AstroContainer.create();
  return container.renderToString(AboutStory, {
    props: { lang: 'es', title: 'Hola, soy Álvaro.', intro: 'Intro.', stages, mock },
  });
}

describe('AboutStory', () => {
  it('renders one data-stage section per stage', async () => {
    const html = await render(false);
    expect(html.match(/data-stage="/g)).toHaveLength(3);
  });

  it('shows the first photo stage in the sticky polaroid', async () => {
    const html = await render(false);
    const sticky = html.slice(html.indexOf('data-polaroid="sticky"'));
    expect(sticky).toContain('src="/_astro/ies-2018.webp"');
    expect(sticky).toContain('alt="IES Velázquez"');
    expect(sticky).toContain('2018 · IES Velázquez, Sevilla');
  });

  it('shows the 2026 stage in the mobile polaroid', async () => {
    const html = await render(false);
    const mobile = html.slice(html.indexOf('data-polaroid="mobile"'));
    expect(mobile).toContain('src="/_astro/desk-2026.webp"');
  });

  it('renders the fact labels in Spanish', async () => {
    const html = await render(false);
    expect(html).toContain('sistema');
    expect(html).toContain('data-fact="stack"');
  });

  it('turns inline links into anchors and escapes the rest', async () => {
    const html = await render(false);
    expect(html).toContain('<a href="/es/projects/bito/">Bito</a> y 1 &lt; 2.');
  });

  it('lists the proof links in mono without a heading', async () => {
    const html = await render(false);
    expect(html).toContain('href="/es/stats/"');
  });

  it('carries the polaroid data on stages that have a photo', async () => {
    const html = await render(false);
    expect(html).toContain('data-photo="/_astro/desk-2026.webp"');
    expect(html).toContain('data-caption="2026 · Sevilla"');
  });

  it('hides the stages but keeps the polaroid when mock', async () => {
    const html = await render(true);
    expect(html).not.toContain('data-stage="');
    expect(html).toContain('data-polaroid="sticky"');
  });

  it('links the closing buttons to contact and the Spanish CV PDF', async () => {
    const html = await render(false);
    expect(html).toContain('href="/es/#contact"');
    expect(html).toContain('href="/cv/Alvaro_Torres_Carrasco_CV_ES.pdf"');
    expect(html).not.toContain('href="/es/cv/"');
  });
});

describe('AboutStory polaroid script', () => {
  const source = readFileSync('src/components/about/AboutStory.astro', 'utf8');

  it('observes the stages with the spec rootMargin', () => {
    expect(source).toContain('IntersectionObserver');
    expect(source).toContain("rootMargin: '-40% 0px -30% 0px'");
    expect(source).toContain('[data-stage]');
  });

  it('crossfades in 200ms and skips it with reduced motion', () => {
    expect(source).toContain('transition: opacity 200ms');
    expect(source).toContain('prefers-reduced-motion: reduce');
  });

  it('re-initialises on client navigation and uses no islands', () => {
    expect(source).toContain('astro:page-load');
    expect(source).toContain('astro:before-swap');
    expect(source).not.toContain('client:');
    expect(source).not.toContain('framer-motion');
  });
});

describe('AboutStory mobile layout', () => {
  const source = readFileSync('src/components/about/AboutStory.astro', 'utf8');

  it('collapses to one column below 1024px with a single 360px polaroid first', () => {
    const start = source.indexOf('@media (max-width: 1023px)');
    expect(start).toBeGreaterThan(-1);
    const block = source.slice(start, source.indexOf('</style>', start));
    expect(block).toContain('grid-template-columns: 1fr');
    expect(block).toContain('max-width: 360px');
    expect(block).toContain('order: -1');
    expect(block).toMatch(/\.about-aside\s*{\s*display: none;/);
  });
});
