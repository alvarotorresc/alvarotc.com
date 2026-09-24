import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import ProjectPlayground from '../src/components/projects/ProjectPlayground.astro';
import ProjectHistory from '../src/components/projects/ProjectHistory.astro';
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

async function playground(view: ProjectView) {
  const container = await AstroContainer.create();
  return container.renderToString(ProjectPlayground, { props: { view } });
}

async function history(view: ProjectView) {
  const container = await AstroContainer.create();
  return container.renderToString(ProjectHistory, { props: { view } });
}

describe('ProjectPlayground', () => {
  it('loads a mobile app on demand inside a phone frame with three notes', async () => {
    const html = await playground(makeView(bitoFields, bitoImages));
    expect(html).toContain('data-section="playground"');
    expect(html).toContain('data-size="play"');
    expect(html).toContain('data-playground-load');
    expect(html).toContain('data-src="https://bito.alvarotc.com"');
    expect(html).toContain('Cargar la app');
    expect(html).toContain('La app entera, aquí mismo, en un marco de móvil.');
    expect(html.match(/data-note/g)).toHaveLength(3);
    expect(html).toMatch(/font-mono[^"]*"[^>]*>4,7 MB<\/span>/);
    expect(html).not.toContain('<iframe');
  });

  it('links the hybrid install note to the app address', async () => {
    const html = await playground(makeView(baseceroFields, baseceroImages));
    expect(html).toContain('href="https://basecero.alvarotc.com/app/"');
    expect(html).toContain('basecero.alvarotc.com/app/</a>');
  });

  it('loads a website inside a full-width browser frame with one note', async () => {
    const html = await playground(makeView(pokeFields, pokeImages));
    expect(html).toContain('data-frame="browser"');
    expect(html).toContain('Cargar la web');
    expect(html).toContain('La web entera, aquí mismo.');
    expect(html.match(/data-note/g)).toHaveLength(1);
    expect(html).toContain('abrirla en su dirección');
  });

  it('renders nothing without a playground', async () => {
    expect(await playground(makeView(sparseFields))).not.toContain('<section');
    expect(await playground(makeView(cliFields))).not.toContain('<section');
  });
});

describe('ProjectHistory', () => {
  it('lists the built lines with safe inline links', async () => {
    const html = await history(makeView(bitoFields, bitoImages));
    expect(html).toContain('>Cómo está hecho</h2>');
    expect(html).toContain(
      '<a href="https://github.com/alvarotorresc/bito">github.com/alvarotorresc/bito</a>',
    );
  });

  it('shows the changelog with the newest entry in the accent colour', async () => {
    const html = await history(makeView(bitoFields, bitoImages));
    expect(html).toContain('>Cambios</h2>');
    expect(html.match(/data-release(?!s)/g)).toHaveLength(3);
    expect(html).toMatch(/text-accent[^>]*>v2\.0\.0, en camino</);
    expect(html).toContain('v1.0.0, 26 ago 2026');
    expect(html).toMatch(/>v0\.1\.0</);
    expect(html).toContain('href="https://github.com/alvarotorresc/bito/releases"');
    expect(html).toContain('Todas las versiones en GitHub');
  });

  it('points a cli at npm', async () => {
    const html = await history(makeView(cliFields));
    expect(html).toContain('Todas las versiones en npm');
    expect(html).toContain('?activeTab=versions');
  });

  it('keeps only the link back to all projects when there is nothing else', async () => {
    const html = await history(makeView(sparseFields));
    expect(html).toContain('data-section="history"');
    expect(html).not.toContain('<h2');
    expect(html).not.toContain('data-releases');
    expect(html).toContain('href="/es/projects"');
    expect(html).toContain('Todos los proyectos');
  });
});

describe('PlaygroundFrame', () => {
  it('is gone', () => {
    expect(existsSync('src/components/projects/PlaygroundFrame.astro')).toBe(false);
  });
});
