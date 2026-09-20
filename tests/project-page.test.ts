import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import ProjectCard from '../src/components/projects/ProjectCard.astro';
import PlaygroundFrame from '../src/components/projects/PlaygroundFrame.astro';
import { projectSchema } from '../src/content.config';
import type { ProjectEntry } from '../src/lib/projects';

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
      gallery: [],
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

describe('PlaygroundFrame', () => {
  it('renders a load button for a pwa playground', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(PlaygroundFrame, {
      props: { kind: 'pwa', src: 'https://bito.alvarotc.com', title: 'Bito', lang: 'en' },
    });
    expect(html).toContain('data-playground-load');
  });

  it('renders no load button for a video playground', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(PlaygroundFrame, {
      props: { kind: 'video', src: '/videos/bito.mp4', title: 'Bito', lang: 'en' },
    });
    expect(html).not.toContain('data-playground-load');
  });
});

describe('projectSchema', () => {
  it('coerces a changelog entry date into a Date', () => {
    const parsed = projectSchema.parse({
      name: 'Bito',
      tagline: 'Habits',
      status: 'published',
      tier: 'featured',
      order: 1,
      changelog: [{ version: 'v1.0.0', date: '2025-03-01', note: 'First release.' }],
    });
    expect(parsed.changelog[0].date).toBeInstanceOf(Date);
  });
});
