import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import ProjectScreens from '../src/components/projects/ProjectScreens.astro';
import ProjectFeatures from '../src/components/projects/ProjectFeatures.astro';
import ProjectWhy from '../src/components/projects/ProjectWhy.astro';
import {
  bitoFields,
  bitoImages,
  cliFields,
  makeView,
  pokeFields,
  pokeImages,
  sparseFields,
} from './fixtures/project-view';

describe('ProjectScreens', () => {
  it('renders a snapping strip of tall captioned screenshots', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectScreens, {
      props: { view: makeView(bitoFields, bitoImages) },
    });
    expect(html).toContain('data-section="screens"');
    expect(html).toContain('>Capturas</h2>');
    expect(html).toContain('Pantallas de la v1.0.0 en un Android real.');
    expect(html.match(/<figure/g)).toHaveLength(2);
    expect(html).toContain('alt="Widget en la pantalla de inicio"');
    expect(html).toMatch(/<figcaption[^>]*>Widget<\/figcaption>/);
    expect(html).toContain('shot-tall');
  });

  it('uses wide 16:10 screenshots for the web', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectScreens, {
      props: { view: makeView(pokeFields, pokeImages) },
    });
    expect(html).toContain('shot-wide');
  });

  it('renders nothing without screenshots', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectScreens, {
      props: { view: makeView(sparseFields) },
    });
    expect(html).not.toContain('data-section="screens"');
  });
});

describe('ProjectFeatures', () => {
  it('shows up to three features with an image as blocks and the rest as a list', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectFeatures, {
      props: { view: makeView(bitoFields, bitoImages) },
    });
    expect(html).toContain('>Qué hace</h2>');
    expect(html).toContain('Tres formas de registrar, dos sin abrir la app.');
    expect(html.match(/data-feature="block"/g)).toHaveLength(3);
    expect(html.match(/data-feature="item"/g)).toHaveLength(1);
    expect(html).toContain('src="/_astro/review.webp"');
    expect(html).not.toContain('data-section="steps"');
  });

  it('lists every cli feature under "Qué te da" and numbers the steps', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectFeatures, {
      props: { view: makeView(cliFields) },
    });
    expect(html).toContain('>Qué te da</h2>');
    expect(html).not.toContain('data-feature="block"');
    expect(html.match(/data-feature="item"/g)).toHaveLength(2);
    expect(html).toContain('data-section="steps"');
    expect(html).toContain('>Cómo lo configuras</h2>');
    expect(html).toContain('El CLI hace seis preguntas.');
    expect(html.match(/data-step=/g)).toHaveLength(2);
    expect(html).toContain('Después:');
    expect(html).toContain('cd my-blog &amp;&amp; npm run dev');
  });

  it('renders nothing without features or steps', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectFeatures, {
      props: { view: makeView(sparseFields) },
    });
    expect(html).not.toContain('<section');
  });
});

describe('ProjectWhy', () => {
  it('renders the markdown body, the post link and the illustration', async () => {
    const container = await AstroContainer.create();
    const view = makeView(bitoFields, bitoImages, 'es', {
      href: '/es/blog/de-una-idea-a-una-apk-en-24h',
      label: 'De una idea a una APK en 24 horas',
    });
    const html = await container.renderToString(ProjectWhy, {
      props: { view },
      slots: { default: '<p>Todas las apps de hábitos que probé pedían una cuenta.</p>' },
    });
    expect(html).toContain('>Por qué existe</h2>');
    expect(html).toContain('Todas las apps de hábitos que probé pedían una cuenta.');
    expect(html).toContain('href="/es/blog/de-una-idea-a-una-apk-en-24h"');
    expect(html).toContain('Leer el post: De una idea a una APK en 24 horas');
    expect(html).toContain('data-illustration');
    expect(html).toContain('src="/_astro/habi.webp"');
  });

  it('skips the post link and the illustration when there are none', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectWhy, {
      props: { view: makeView(sparseFields) },
      slots: { default: '<p>Beta privada.</p>' },
    });
    expect(html).toContain('data-section="why"');
    expect(html).not.toContain('data-post-link');
    expect(html).not.toContain('data-illustration');
  });
});
