import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import ProjectCard from '../src/components/projects/ProjectCard.astro';
import type { ProjectEntry } from '../src/lib/projects';
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

describe('ProjectCard', () => {
  it('links to the project page in the current language', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectCard, {
      props: { lang: 'es', project: project() },
    });
    expect(html).toContain('href="/es/projects/bito"');
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
