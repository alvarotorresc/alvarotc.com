import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { getEntry } from 'astro:content';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import ProjectTools from '../src/components/projects/ProjectTools.astro';
import ProjectView from '../src/components/projects/ProjectView.astro';
import { toProjectView } from '../src/lib/project-view';
import type { Locale } from '../src/i18n/translations';
import {
  bitoFields,
  bitoImages,
  makeView,
  noImages,
  pokeFields,
  pokeImages,
} from './fixtures/project-view';

async function render(component: typeof ProjectTools | typeof ProjectView, view: object) {
  const container = await AstroContainer.create();
  return container.renderToString(component, {
    props: { view },
    slots: { default: '<p>Por qué.</p>' },
  });
}

describe('ProjectTools', () => {
  it('renders a titled grid of tool cards with the intro', async () => {
    const html = await render(ProjectTools, makeView(pokeFields, pokeImages));
    expect(html).toContain('data-section="tools"');
    expect(html).toContain('>Herramientas</h2>');
    expect(html).toContain('Cada herramienta en su dirección.');
    expect(html.match(/data-tool(?=[\s>])/g)).toHaveLength(2);
    expect(html).toMatch(/sm:grid-cols-2[^"]*lg:grid-cols-3[^"]*xl:grid-cols-4/);
  });

  it('opens a tool image in the tools group of the lightbox', async () => {
    const html = await render(ProjectTools, makeView(pokeFields, pokeImages));
    expect(html).toMatch(
      /<button[^>]*data-lightbox="tools"[^>]*data-full="\/_astro\/types-full\.webp"/,
    );
    expect(html).toContain('src="/_astro/types.webp"');
  });

  it('shows the name in mono when a tool has no image, and links it when it has an href', async () => {
    const html = await render(ProjectTools, makeView(pokeFields, pokeImages));
    expect(html).toMatch(/class="tool-empty[^"]*font-mono[^"]*"[^>]*>Pokédex</);
    expect(html).toMatch(
      /<a href="https:\/\/pokeutils\.alvarotc\.com\/#\/pokedex" rel="noopener"[^>]*>Pokédex<\/a>/,
    );
    expect(html).not.toMatch(/<a [^>]*>Tabla de tipos<\/a>/);
  });

  it('is titled in English on the English page', async () => {
    const html = await render(ProjectTools, makeView(pokeFields, pokeImages, 'en'));
    expect(html).toContain('>Tools</h2>');
  });

  it('renders nothing without tools', async () => {
    expect(await render(ProjectTools, makeView(bitoFields, bitoImages))).not.toContain(
      'data-section="tools"',
    );
  });

  it('sits between the screenshots and the features', async () => {
    const html = await render(ProjectView, makeView(pokeFields, pokeImages));
    const positions = ['screens', 'tools', 'features'].map((name) =>
      html.indexOf(`data-section="${name}"`),
    );
    positions.forEach((position) => expect(position).toBeGreaterThan(-1));
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });
});

describe.each(['es', 'en'] as Locale[])('project pages from content (%s)', (lang) => {
  const viewOf = async (slug: string) => {
    const entry = await getEntry('projects', `${lang}/${slug}`);
    if (!entry) throw new Error(`missing ${lang}/${slug}`);
    return toProjectView(entry.data, noImages, lang);
  };

  it('renders sixteen PokeUtils tool cards linked to the app', async () => {
    const html = await render(ProjectView, await viewOf('pokeutils'));
    expect(html.match(/data-tool(?=[\s>])/g)).toHaveLength(16);
    expect(
      html.match(/href="https:\/\/pokeutils\.alvarotc\.com\/#\/[^"]+" rel="noopener"/g),
    ).toHaveLength(16);
  });

  it('renders no tools section for Bito', async () => {
    const html = await render(ProjectView, await viewOf('bito'));
    expect(html).not.toContain('data-section="tools"');
  });
});

const dist = resolve('dist');

describe.skipIf(!existsSync(dist))('tools in the build', () => {
  it.each(['es', 'en'])('ships sixteen tool cards on the %s PokeUtils page', (lang) => {
    const prefix = lang === 'es' ? 'es/' : '';
    const poke = readFileSync(join(dist, `${prefix}projects/pokeutils/index.html`), 'utf8');
    const bito = readFileSync(join(dist, `${prefix}projects/bito/index.html`), 'utf8');
    expect(poke.match(/data-tool(?=[\s>])/g)).toHaveLength(16);
    expect(bito).not.toContain('data-section="tools"');
  });
});
