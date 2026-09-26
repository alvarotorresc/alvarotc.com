import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import ProjectView from '../src/components/projects/ProjectView.astro';
import ProjectScreens from '../src/components/projects/ProjectScreens.astro';
import ProjectFeatures from '../src/components/projects/ProjectFeatures.astro';
import {
  bitoFields,
  bitoImages,
  cliFields,
  makeView,
  pokeFields,
  pokeImages,
  sparseFields,
} from './fixtures/project-view';

const triggers = (html: string) => [
  ...html.matchAll(/<button[^>]*class="lightbox-trigger[^"]*"[^>]*>/g),
];
const attr = (tag: string, name: string) => new RegExp(`${name}="([^"]*)"`).exec(tag)?.[1];

async function renderView(view: ReturnType<typeof makeView>) {
  const container = await AstroContainer.create();
  return container.renderToString(ProjectView, {
    props: { view },
    slots: { default: '<p>Por qué.</p>' },
  });
}

describe('lightbox triggers', () => {
  it('wraps every screenshot in a button of the screens group with a full url', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectScreens, {
      props: { view: makeView(bitoFields, bitoImages) },
    });
    const buttons = triggers(html).map(([tag]) => tag);
    expect(buttons).toHaveLength(2);
    buttons.forEach((tag) => {
      expect(tag).toContain('type="button"');
      expect(attr(tag, 'data-lightbox')).toBe('screens');
      expect(attr(tag, 'data-full')).toMatch(/-full\.webp$/);
    });
    expect(buttons[0]).toContain('data-alt="Widget en la pantalla de inicio"');
    expect(buttons[0]).toContain('data-caption="Widget"');
    expect(buttons[0]).toContain('aria-label="Ampliar: Widget"');
  });

  it('wraps the feature block images in the features group', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectFeatures, {
      props: { view: makeView(bitoFields, bitoImages, 'en') },
    });
    const buttons = triggers(html).map(([tag]) => tag);
    expect(buttons).toHaveLength(3);
    buttons.forEach((tag) => {
      expect(attr(tag, 'data-lightbox')).toBe('features');
      expect(attr(tag, 'data-full')).toMatch(/-full\.webp$/);
      expect(attr(tag, 'aria-label')).toMatch(/^Enlarge: /);
    });
  });

  it('draws the expand icon on every trigger', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectScreens, {
      props: { view: makeView(pokeFields, pokeImages) },
    });
    expect(html.match(/class="lightbox-badge"/g)).toHaveLength(1);
  });
});

describe('lightbox dialog', () => {
  it('appears once on a page with images, labelled in Spanish', async () => {
    const html = await renderView(makeView(bitoFields, bitoImages));
    expect(html.match(/<dialog/g)).toHaveLength(1);
    expect(html).toMatch(/<dialog[^>]*class="lightbox"/);
    expect(html).toContain('aria-label="Cerrar"');
    expect(html).toContain('aria-label="Imagen anterior"');
    expect(html).toContain('aria-label="Imagen siguiente"');
  });

  it('is labelled in English on the English page', async () => {
    const html = await renderView(makeView(bitoFields, bitoImages, 'en'));
    expect(html.match(/<dialog/g)).toHaveLength(1);
    expect(html).toContain('aria-label="Close"');
    expect(html).toContain('aria-label="Previous image"');
    expect(html).toContain('aria-label="Next image"');
  });

  it('is left out when nothing can be enlarged', async () => {
    expect(await renderView(makeView(sparseFields))).not.toContain('<dialog');
    expect(await renderView(makeView(cliFields))).not.toContain('<dialog');
  });
});

const dist = resolve('dist');

describe.skipIf(!existsSync(dist))('lightbox in the build', () => {
  it.each(['es/projects/bito/index.html', 'projects/pokeutils/index.html'])(
    'serves a bigger image than the thumbnail on %s',
    (route) => {
      const html = readFileSync(join(dist, route), 'utf8');
      const blocks = [
        ...html.matchAll(/<button[^>]*class="lightbox-trigger[^"]*"[^>]*>[\s\S]*?<\/button>/g),
      ].map(([block]) => block);
      expect(blocks.length).toBeGreaterThan(0);
      blocks.forEach((block) => {
        const full = attr(block.slice(0, block.indexOf('>')), 'data-full') ?? '';
        const thumb = /<img[^>]*src="([^"]+)"/.exec(block)?.[1];
        expect(full).not.toBe('');
        expect(full).not.toBe(thumb);
        expect(existsSync(join(dist, full))).toBe(true);
      });
      expect(html.match(/<dialog/g)).toHaveLength(1);
    },
  );
});
