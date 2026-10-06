import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import ProjectCard from '../src/components/projects/ProjectCard.astro';
import { homeImage, isVerticalImage, type ProjectEntry } from '../src/lib/projects';
import ProjectView from '../src/components/projects/ProjectView.astro';
import { translations } from '../src/i18n/translations';
import { bitoFields, bitoImages, cliFields, makeView, sparseFields } from './fixtures/project-view';

function project(overrides: Record<string, unknown> = {}): ProjectEntry {
  return {
    id: 'en/bito',
    collection: 'projects',
    data: {
      name: 'Bito',
      tagline: 'Log a habit in one tap, without accounts or cloud.',
      status: 'published',
      tier: 'featured',
      order: 1,
      visible: true,
      stack: ['Android', 'Offline-first', 'React', 'Capacitor', 'SQLite'],
      kind: 'mobile',
      changelog: [],
      mock: false,
      url: 'https://bito.alvarotc.com',
      repo: 'https://github.com/alvarotorresc/bito',
      ...overrides,
    },
  } as unknown as ProjectEntry;
}

const linkTexts = (html: string) =>
  [...html.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/g)].map(([, inner]) =>
    inner
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim(),
  );

describe('ProjectCard', () => {
  it('names the project in the site and source links', async () => {
    const container = await AstroContainer.create();
    const en = await container.renderToString(ProjectCard, {
      props: { lang: 'en', project: project() },
    });
    const es = await container.renderToString(ProjectCard, {
      props: { lang: 'es', project: project() },
    });
    expect(linkTexts(en)).toEqual(
      expect.arrayContaining(['Open Bito', 'Bito source code on GitHub']),
    );
    expect(linkTexts(es)).toEqual(
      expect.arrayContaining(['Abrir Bito', 'Código de Bito en GitHub']),
    );
  });

  it('links to the project page in the current language', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectCard, {
      props: { lang: 'es', project: project() },
    });
    expect(html).toContain('href="/es/projects/bito/"');
  });

  it('shows the publishing status in the warn tone and no image without a cover', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectCard, {
      props: { lang: 'es', project: project({ status: 'publishing' }), featured: true },
    });
    expect(html).toContain('En publicación');
    expect(html).toContain('text-amber-800');
    expect(html).not.toContain('<img');
  });

  it('shows the cover on a lab card that has one', async () => {
    const container = await AstroContainer.create();
    const cover = { src: '/cover.jpg', width: 1280, height: 720, format: 'jpg' };
    const html = await container.renderToString(ProjectCard, {
      props: { lang: 'es', project: project({ tier: 'lab', cover }) },
    });
    expect(html).toContain('<img');
  });

  it('shows no image on a lab card without a cover', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectCard, {
      props: { lang: 'es', project: project({ tier: 'lab' }) },
    });
    expect(html).not.toContain('<img');
  });
});

const order = (html: string, sections: string[]) =>
  sections.map((name) => html.indexOf(name === 'header' ? '<header' : `data-section="${name}"`));

describe('ProjectView', () => {
  it('renders every section of a full project in the spec order', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectView, {
      props: { view: makeView(bitoFields, bitoImages) },
      slots: { default: '<p>Bito pide un toque.</p>' },
    });
    const positions = order(html, [
      'header',
      'screens',
      'features',
      'why',
      'playground',
      'history',
    ]);
    positions.forEach((position) => expect(position).toBeGreaterThan(-1));
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
    expect(html).toContain('Bito pide un toque.');
    expect(html).toContain('data-project="mobile"');
  });

  it('puts the cli steps between the features and the why', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectView, {
      props: { view: makeView(cliFields) },
      slots: { default: '<p>[DATO]</p>' },
    });
    const positions = order(html, ['features', 'steps', 'why', 'history']);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
    expect(html).not.toContain('data-section="screens"');
    expect(html).not.toContain('data-section="playground"');
  });

  it('keeps a sparse project to header, why and the way back', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectView, {
      props: { view: makeView(sparseFields) },
      slots: { default: '<p>Beta privada con un grupo de amigos.</p>' },
    });
    expect(html).toContain('<header');
    expect(html).toContain('data-section="why"');
    expect(html).toContain('data-section="history"');
    ['screens', 'features', 'steps', 'playground'].forEach((name) =>
      expect(html).not.toContain(`data-section="${name}"`),
    );
    expect(html).not.toContain('data-media=');
  });

  it('speaks English on the English page', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectView, {
      props: { view: makeView(bitoFields, bitoImages, 'en') },
      slots: { default: '<p>Bito asks for one tap.</p>' },
    });
    expect(html).toContain('>Screenshots</h2>');
    expect(html).toContain('>Why it exists</h2>');
    expect(html).toContain('>How it is built</h2>');
  });
});

describe('retired project translations', () => {
  it.each(['project.tryText', 'project.load', 'project.changelogFull', 'project.screenshot'])(
    '%s is gone',
    (key) => {
      expect(translations.en).not.toHaveProperty([key]);
      expect(translations.es).not.toHaveProperty([key]);
    },
  );
});

describe('home project media', () => {
  it('no longer ships the empty project PNGs', () => {
    expect(existsSync('public/projects')).toBe(false);
  });

  it.each(['src/components/home/ProjectBento.astro', 'src/components/projects/ProjectCard.astro'])(
    '%s reads the home image and the shared tone',
    (path) => {
      const source = readFileSync(path, 'utf8');
      expect(source).not.toContain('data.hero');
      expect(source).toContain('homeImage');
      expect(source).not.toMatch(/const tone =/);
    },
  );

  it('renders the Now card icon as an optimised image', () => {
    const source = readFileSync('src/components/home/NowCards.astro', 'utf8');
    expect(source).toMatch(/<Image\s+src=\{project\.data\.icon\}/);
  });
});

describe('homeImage', () => {
  it('prefers the promo image over the cover', () => {
    const cover = { src: '/cover.jpg', width: 400, height: 844, format: 'jpg' };
    const promo = { src: '/promo.jpg', width: 1280, height: 720, format: 'jpg' };
    const entry = project({ cover, promo }) as unknown as ProjectEntry;
    expect(homeImage(entry)).toBe(promo);
  });

  it('falls back to the cover when there is no promo', () => {
    const cover = { src: '/cover.jpg', width: 400, height: 844, format: 'jpg' };
    const entry = project({ cover }) as unknown as ProjectEntry;
    expect(homeImage(entry)).toBe(cover);
  });

  it('flags a vertical image so the home paints it with object-contain', () => {
    expect(isVerticalImage({ src: '/x.jpg', width: 400, height: 844, format: 'jpg' })).toBe(true);
    expect(isVerticalImage({ src: '/x.jpg', width: 1280, height: 720, format: 'jpg' })).toBe(false);
  });
});
