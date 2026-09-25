import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import ProjectHeader from '../src/components/projects/ProjectHeader.astro';
import type { ProjectView } from '../src/lib/project-view';
import {
  baseceroFields,
  baseceroImages,
  bitoFields,
  bitoImages,
  cliFields,
  makeView,
  pokeFields,
  pokeImages,
  sparseFields,
} from './fixtures/project-view';

async function render(view: ProjectView) {
  const container = await AstroContainer.create();
  return container.renderToString(ProjectHeader, { props: { view } });
}

describe('ProjectHeader, mobile', () => {
  it('shows name, tagline, intro, status and last release', async () => {
    const html = await render(makeView(bitoFields, bitoImages));
    expect(html).toMatch(/<h1[^>]*>Bito<\/h1>/);
    expect(html).toContain('Registra un hábito en un toque');
    expect(html).toContain('La app de hábitos que no te roba tiempo.');
    expect(html).toContain('En publicación');
    expect(html).toContain('v1.0.0, 26 ago 2026');
    expect(html).toContain('href="/es/projects/"');
  });

  it('shows the cover in a phone frame', async () => {
    const html = await render(makeView(bitoFields, bitoImages));
    expect(html).toContain('data-media="mobile"');
    expect(html).toContain('data-frame="device"');
    expect(html).toContain('alt="Pantalla principal de Bito"');
  });

  it('offers the APK first, then GitHub, then the site', async () => {
    const html = await render(makeView(bitoFields, bitoImages));
    const download = html.indexOf('data-action="download"');
    const repo = html.indexOf('data-action="repo"');
    const site = html.indexOf('data-action="site"');
    expect(download).toBeGreaterThan(-1);
    expect(download).toBeLessThan(repo);
    expect(repo).toBeLessThan(site);
    expect(html).toContain('Descargar APK');
    expect(html).toContain('app-release.apk');
    expect(html).toContain('Código en GitHub');
  });

  it('lists the facts in order', async () => {
    const html = await render(makeView(bitoFields, bitoImages));
    const labels = ['Plataforma', 'Licencia', 'Última versión', 'Web', 'Tamaño del APK', 'Red'];
    const positions = labels.map((label) => html.indexOf(`>${label}</dt>`));
    positions.forEach((position) => expect(position).toBeGreaterThan(-1));
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });

  it('puts font-mono only on verifiable fact values, not on the platform', async () => {
    const html = await render(makeView(bitoFields, bitoImages));
    expect(html).toMatch(/<dd class="break-words text-sm">Android 10\+<\/dd>/);
    expect(html).toMatch(/<dd class="break-words text-sm font-mono">GPL-3\.0<\/dd>/);
  });

  it('still shows the cover when there are no screenshots', async () => {
    const html = await render(
      makeView({ ...bitoFields, screenshots: [] }, { ...bitoImages, screenshots: [] }),
    );
    expect(html).toContain('data-media="mobile"');
  });

  it('translates the labels to English', async () => {
    const html = await render(makeView(bitoFields, bitoImages, 'en'));
    expect(html).toContain('Download APK');
    expect(html).toContain('Source on GitHub');
    expect(html).toContain('Aug 26, 2026');
    expect(html).toContain('href="/projects/"');
  });
});

describe('ProjectHeader, web', () => {
  it('opens the site as the main action inside a browser frame', async () => {
    const html = await render(makeView(pokeFields, pokeImages));
    expect(html).toContain('data-media="web"');
    expect(html).toContain('data-frame="browser"');
    expect(html).toContain('data-action="open"');
    expect(html).toContain('Abrir la web');
    expect(html).not.toContain('data-action="download"');
    expect(html).not.toContain('data-action="site"');
  });
});

describe('ProjectHeader, hybrid', () => {
  it('puts the small phone over the thin browser', async () => {
    const html = await render(makeView(baseceroFields, baseceroImages));
    expect(html).toContain('data-media="hybrid"');
    expect(html).toContain('data-size="thin"');
    expect(html).toContain('data-size="small"');
    expect(html).toContain('basecero.alvarotc.com/app/');
    expect(html).toContain('alt="BaseCero instalada en el móvil"');
    expect(html).toContain('Abrir la app');
    expect(html).toContain('data-action="site"');
  });
});

describe('ProjectHeader, cli', () => {
  it('offers the command with a copy button and shows the terminal', async () => {
    const html = await render(makeView(cliFields));
    expect(html).toContain('data-copy-command="npx create-astro-blog my-blog"');
    expect(html).toContain('data-copied-label="Copiado"');
    expect(html).toContain('Copiar el comando');
    expect(html).toContain('data-action="npm"');
    expect(html).toContain('Ver en npm');
    expect(html).toContain('data-media="cli"');
    expect(html).toContain('~/proyectos');
    expect(html).not.toContain('<img');
  });
});

describe('ProjectHeader, sparse', () => {
  it('renders only the text column for a project without media', async () => {
    const html = await render(makeView(sparseFields));
    expect(html).not.toContain('data-media=');
    expect(html).not.toContain('grid-cols-[minmax(0,1fr)_');
    expect(html).not.toContain('data-release-label');
    expect(html).toContain('Beta');
    expect(html).toContain('data-action="repo"');
    expect(html).not.toContain('data-action="download"');
  });
});
