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

const tabs = (html: string) => [...html.matchAll(/<button[^>]*role="tab"[^>]*>/g)].map(([t]) => t);
const attr = (tag: string, name: string) => new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1];
const showcase = (html: string) => {
  const start = html.indexOf('data-tools-panel');
  return html.slice(start, html.indexOf('</section>', start));
};
const openLink = (html: string) => /<a[^>]*data-tools-open[^>]*>/.exec(html)?.[0] ?? '';
const groupNames = (html: string) =>
  [...html.matchAll(/class="tools-group-name[^"]*"[^>]*>([^<]+)</g)].map((m) => m[1]);

describe('ProjectTools', () => {
  it('renders the title, the intro and one tab per tool grouped by section', async () => {
    const html = await render(ProjectTools, makeView(pokeFields, pokeImages));
    expect(html).toContain('data-section="tools"');
    expect(html).toContain('>Herramientas</h2>');
    expect(html).toContain('Cada herramienta en su dirección.');
    expect(html).toMatch(/role="tablist"[^>]*aria-label="Herramientas de PokeUtils"/);
    expect(tabs(html)).toHaveLength(2);
    expect(groupNames(html)).toEqual(['Datos', 'Pokédex']);
  });

  it('selects the first tool and gives only it a place in the tab order', async () => {
    const [first, second] = tabs(await render(ProjectTools, makeView(pokeFields, pokeImages)));
    expect(attr(first, 'aria-selected')).toBe('true');
    expect(attr(first, 'tabindex')).toBe('0');
    expect(attr(second, 'aria-selected')).toBe('false');
    expect(attr(second, 'tabindex')).toBe('-1');
  });

  it('carries each tool in data attributes of its tab', async () => {
    const [first, second] = tabs(await render(ProjectTools, makeView(pokeFields, pokeImages)));
    expect(attr(first, 'data-image')).toBe('/_astro/types.webp');
    expect(attr(first, 'data-full')).toBe('/_astro/types-full.webp');
    expect(attr(first, 'data-alt')).toBe('Tabla de tipos');
    expect(attr(first, 'data-address')).toBe('pokeutils.alvarotc.com');
    expect(first).toMatch(/\sdata-href(?:="")?[\s>]/);
    expect(attr(second, 'data-name')).toBe('Pokédex');
    expect(attr(second, 'data-text')).toBe('Los 1025 Pokémon.');
    expect(attr(second, 'data-address')).toBe('pokeutils.alvarotc.com/#/pokedex');
    expect(attr(second, 'data-href')).toBe('https://pokeutils.alvarotc.com/#/pokedex');
  });

  it('shows the first tool in a single browser image that opens in the lightbox', async () => {
    const html = showcase(await render(ProjectTools, makeView(pokeFields, pokeImages)));
    const images = [...html.matchAll(/<img[^>]*>/g)].map(([tag]) => tag);
    expect(images).toHaveLength(1);
    expect(attr(images[0], 'src')).toBe('/_astro/types.webp');
    expect(attr(images[0], 'alt')).toBe('Tabla de tipos');
    expect(html).toMatch(
      /<button[^>]*data-lightbox="tools"[^>]*data-full="\/_astro\/types-full\.webp"[^>]*data-caption="Tabla de tipos"/,
    );
    expect(html).toContain('aria-label="Ampliar: Tabla de tipos"');
    expect(html).toContain('>pokeutils.alvarotc.com</span>');
    expect(html).toMatch(/<h3[^>]*data-tools-name[^>]*>Tabla de tipos<\/h3>/);
  });

  it('hides the open button when the tool has no address', async () => {
    const html = await render(ProjectTools, makeView(pokeFields, pokeImages));
    expect(openLink(html)).toMatch(/\shidden[\s>=]/);
  });

  it('keeps the tablist to tabs, describing the first tab of each group by its name', async () => {
    const html = await render(ProjectTools, makeView(pokeFields, pokeImages));
    const names = [...html.matchAll(/<span[^>]*class="tools-group-name[^"]*"[^>]*>/g)].map(
      ([tag]) => tag,
    );
    expect(names).toHaveLength(2);
    names.forEach((tag) => expect(tag).toContain('aria-hidden="true"'));
    const [first, second] = tabs(html);
    expect(attr(first, 'aria-describedby')).toBe(attr(names[0], 'id'));
    expect(attr(second, 'aria-describedby')).toBe(attr(names[1], 'id'));
  });

  it('loads the showcase image lazily', async () => {
    const html = showcase(await render(ProjectTools, makeView(pokeFields, pokeImages)));
    expect(/<img[^>]*>/.exec(html)?.[0]).toContain('loading="lazy"');
  });

  it('hides the image, the enlarge button and the open link when the first tool has neither', async () => {
    const view = makeView(
      {
        ...pokeFields,
        tools: [{ name: 'Sin nada', group: 'Datos', text: 'Nada.' }, pokeFields.tools[0]],
      },
      {
        ...pokeImages,
        tools: [undefined, '/_astro/types.webp'],
        toolsFull: [undefined, '/_astro/types-full.webp'],
      },
    );
    const html = showcase(await render(ProjectTools, view));
    expect(/<img[^>]*>/.exec(html)?.[0]).toMatch(/\shidden[\s>=]/);
    expect(/<button[^>]*data-lightbox="tools"[^>]*>/.exec(html)?.[0]).toMatch(/\shidden[\s>=]/);
    const open = openLink(html);
    expect(open).toMatch(/\shidden[\s>=]/);
    expect(open).not.toMatch(/\shref/);
  });

  it('is labelled in English on the English page', async () => {
    const html = await render(ProjectTools, makeView(pokeFields, pokeImages, 'en'));
    expect(html).toContain('>Tools</h2>');
    expect(html).toMatch(/role="tablist"[^>]*aria-label="PokeUtils tools"/);
    expect(html).toContain('aria-label="Enlarge: Tabla de tipos"');
    expect(html).toContain('Open in PokeUtils');
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
    const tools = entry.data.tools.map((_, i) => `/_astro/tool-${i}.webp`);
    const toolsFull = entry.data.tools.map((_, i) => `/_astro/tool-${i}-full.webp`);
    return toProjectView(entry.data, { ...noImages, tools, toolsFull }, lang);
  };
  const names =
    lang === 'es'
      ? ['Pokédex', 'Datos', 'Competitivo', 'Calculadora']
      : ['Pokédex', 'Data', 'Competitive', 'Calculator'];

  it('renders sixteen PokeUtils tabs in the four sections of the app', async () => {
    const html = await render(ProjectView, await viewOf('pokeutils'));
    const all = tabs(html);
    expect(all).toHaveLength(16);
    expect(groupNames(html)).toEqual(names);
    expect(all.map((tab) => attr(tab, 'aria-selected'))).toEqual(
      all.map((_, i) => String(i === 0)),
    );
    all.forEach((tab) =>
      expect(attr(tab, 'data-href')).toMatch(/^https:\/\/pokeutils\.alvarotc\.com\/#\/.+/),
    );
  });

  it('shows the Pokédex first, at its address, with a button to open it', async () => {
    const html = showcase(await render(ProjectView, await viewOf('pokeutils')));
    const images = [...html.matchAll(/<img[^>]*>/g)].map(([tag]) => tag);
    expect(images).toHaveLength(1);
    expect(attr(images[0], 'src')).toBe('/_astro/tool-0.webp');
    expect(html).toContain('>pokeutils.alvarotc.com/#/pokedex</span>');
    const open = openLink(html);
    expect(attr(open, 'href')).toBe('https://pokeutils.alvarotc.com/#/pokedex');
    expect(open).not.toMatch(/\shidden/);
    expect(html).toContain(lang === 'es' ? 'Abrir en PokeUtils' : 'Open in PokeUtils');
  });

  it('labels the tab list and the enlarge button in the page language', async () => {
    const html = await render(ProjectView, await viewOf('pokeutils'));
    expect(html).toContain(
      lang === 'es' ? 'aria-label="Herramientas de PokeUtils"' : 'aria-label="PokeUtils tools"',
    );
    expect(html).toContain(
      lang === 'es' ? 'aria-label="Ampliar: Pokédex"' : 'aria-label="Enlarge: Pokédex"',
    );
  });

  it('renders no tools section for Bito', async () => {
    const html = await render(ProjectView, await viewOf('bito'));
    expect(html).not.toContain('data-section="tools"');
  });
});

const dist = resolve('dist');

describe.skipIf(!existsSync(dist))('tools in the build', () => {
  it.each(['es', 'en'])('ships sixteen tool tabs on the %s PokeUtils page', (lang) => {
    const prefix = lang === 'es' ? 'es/' : '';
    const poke = readFileSync(join(dist, `${prefix}projects/pokeutils/index.html`), 'utf8');
    const bito = readFileSync(join(dist, `${prefix}projects/bito/index.html`), 'utf8');
    expect(tabs(poke)).toHaveLength(16);
    expect(bito).not.toContain('data-section="tools"');
  });
});
