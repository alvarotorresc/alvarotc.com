import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import StatsView from '../src/components/stats/StatsView.astro';
import { buildStatsView } from '../src/lib/stats-view';
import type { StatsData, WritingStats } from '../src/lib/stats';

const now = new Date('2026-09-19T00:00:00Z');

const emptyWriting: WritingStats = { posts: 0, words: 0, topics: [] };

const writing: WritingStats = {
  posts: 5,
  words: 7081,
  topics: [
    { tag: 'docker', count: 2 },
    { tag: 'foss', count: 2 },
    { tag: 'vps', count: 1 },
    { tag: 'self-hosted', count: 1 },
  ],
};

function contributions(days: { date: string; count: number }[]) {
  return days;
}

const githubBase: NonNullable<StatsData['github']> = {
  contributions: contributions([
    { date: '2026-09-15', count: 5 },
    { date: '2026-09-16', count: 3 },
    { date: '2026-09-17', count: 0 },
  ]),
  commitsThisYear: 2054,
  publicRepos: 16,
  stars: 1,
  streak: 2,
  mostActiveRepo: { name: 'alvarotc-web', commits30d: 42 },
  languages: [
    { name: 'JavaScript', percent: 33 },
    { name: 'TypeScript', percent: 28 },
    { name: 'Kotlin', percent: 25 },
    { name: 'other', percent: 14 },
  ],
};

const umamiBase: NonNullable<StatsData['umami']> = {
  views30d: 431,
  mostRead: [{ path: '/blog/one/', title: 'One', views: 120 }],
};

async function render(
  statsPatch: Partial<StatsData>,
  opts: { analytics?: boolean; writing?: WritingStats } = {},
) {
  const stats: StatsData = {
    generatedAt: null,
    github: githubBase,
    umami: umamiBase,
    ...statsPatch,
  };
  const view = buildStatsView({
    stats,
    writing: opts.writing ?? writing,
    lang: 'es',
    now,
    githubUrl: 'https://github.com/alvarotorresc',
    analytics: opts.analytics ?? false,
  });
  const container = await AstroContainer.create();
  return container.renderToString(StatsView, { props: { view } });
}

describe('StatsView, hero figures', () => {
  it('formats the commits count with the Spanish thousands separator', async () => {
    const html = await render({});
    expect(html).toContain('2.054');
  });

  it('formats the commits count with the English thousands separator', async () => {
    const stats: StatsData = { generatedAt: null, github: githubBase, umami: umamiBase };
    const view = buildStatsView({
      stats,
      writing,
      lang: 'en',
      now,
      githubUrl: 'https://github.com/alvarotorresc',
      analytics: false,
    });
    const container = await AstroContainer.create();
    const html = await container.renderToString(StatsView, { props: { view } });
    expect(html).toContain('2,054');
  });
});

describe('StatsView, hidden blocks', () => {
  it('hides the Código section entirely when github is null', async () => {
    const html = await render({ github: null });
    expect(html).not.toContain('Código');
    expect(html).not.toContain('2.054');
  });

  it('hides stars when below 10', async () => {
    const html = await render({ github: { ...githubBase, stars: 1 } });
    expect(html).not.toContain('Estrellas recibidas');
  });

  it('shows stars when 10 or above', async () => {
    const html = await render({ github: { ...githubBase, stars: 12 } });
    expect(html).toContain('Estrellas recibidas');
    expect(html).toContain('12');
  });

  it('shows "Última actualización" only when generatedAt is set', async () => {
    const withoutDate = await render({ generatedAt: null });
    expect(withoutDate).not.toContain('Última actualización');

    const withDate = await render({ generatedAt: '2026-09-19T10:00:00.000Z' });
    expect(withDate).toContain('Última actualización');
  });

  it('hides the sources note when generatedAt is null', async () => {
    const html = await render({ generatedAt: null });
    expect(html).not.toContain('De dónde salen los números');
  });

  it('hides the views/most-read block when umami is null', async () => {
    const html = await render({ umami: null });
    expect(html).not.toContain('Más leídos');
    expect(html).not.toContain('vistas en los últimos');
  });

  it('shows self-hosted analytics copy only when the env flag is set', async () => {
    const withoutFlag = await render({}, { analytics: false });
    expect(withoutFlag).not.toContain('analítica está autoalojada con Umami');

    const withFlag = await render({}, { analytics: true });
    expect(withFlag).toContain('analítica está autoalojada con Umami');
  });

  it('never renders a "[n]" placeholder', async () => {
    const html = await render({});
    expect(html).not.toContain('[n]');
  });

  it('never mentions Lighthouse', async () => {
    const html = await render({});
    expect(html).not.toContain('Lighthouse');
  });
});

describe('StatsView, bilingual copy', () => {
  it('renders Spanish labels', async () => {
    const html = await render({});
    expect(html).toContain('commits este año');
    expect(html).toContain('repos públicos');
  });

  it('renders English labels', async () => {
    const stats: StatsData = { generatedAt: null, github: githubBase, umami: umamiBase };
    const view = buildStatsView({
      stats,
      writing,
      lang: 'en',
      now,
      githubUrl: 'https://github.com/alvarotorresc',
      analytics: false,
    });
    const container = await AstroContainer.create();
    const html = await container.renderToString(StatsView, { props: { view } });
    expect(html).toContain('commits this year');
    expect(html).toContain('public repos');
  });
});

describe('StatsView, writing with no posts', () => {
  it('still renders without topics or most-read data', async () => {
    const html = await render({ umami: null }, { writing: emptyWriting });
    expect(html).not.toContain('[n]');
  });
});
