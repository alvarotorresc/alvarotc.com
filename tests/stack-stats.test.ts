import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import StackStats from '../src/components/home/StackStats.astro';

const heatmapWeeks = (weeks: number, withCommits = true): number[][] =>
  Array.from({ length: weeks }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => (withCommits && w === weeks - 1 && d === 0 ? 5 : 0)),
  );

describe('StackStats', () => {
  it('shows three figures and a 26-column heatmap when stats.json has github data', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(StackStats, {
      props: {
        lang: 'en',
        stats: { posts: 5, apps: 2 },
        commits: 2054,
        heatmapWeeks: heatmapWeeks(26),
      },
    });
    expect(html).toMatch(/>2,054<\/span><span class="text-sm text-muted"[^>]*>commits this year</);
    expect(html).toMatch(/>5<\/span><span class="text-sm text-muted"[^>]*>articles published</);
    expect(html).toMatch(/>2<\/span><span class="text-sm text-muted"[^>]*>apps in the wild</);
    expect(html.match(/stack-stats-heatmap-cell/g)?.length).toBe(26 * 7);
    expect(html).toContain('Contribution activity over the last 6 months');
  });

  it('formats numbers with Spanish grouping', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(StackStats, {
      props: {
        lang: 'es',
        stats: { posts: 5, apps: 2 },
        commits: 2054,
        heatmapWeeks: heatmapWeeks(26),
      },
    });
    expect(html).toContain('2.054');
  });

  it('drops the commits figure and the heatmap when there is no github data', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(StackStats, {
      props: {
        lang: 'en',
        stats: { posts: 5, apps: 2 },
      },
    });
    expect(html).not.toContain('stack-stats-heatmap-cell');
    expect(html).not.toContain('commits this year');
    expect(html).toMatch(/>5<\/span><span class="text-sm text-muted"[^>]*>articles published</);
    expect(html).toMatch(/>2<\/span><span class="text-sm text-muted"[^>]*>apps in the wild</);
    expect(html.match(/class="[^"]*font-mono[^"]*"/g)?.length).toBe(2);
  });

  it('does not link to the stats page, in either language', async () => {
    const container = await AstroContainer.create();
    for (const lang of ['en', 'es'] as const) {
      const html = await container.renderToString(StackStats, {
        props: { lang, stats: { posts: 5, apps: 2 } },
      });
      expect(html).not.toContain('/stats/');
      expect(html).not.toContain('Full stats page');
      expect(html).not.toContain('Página de stats');
    }
  });

  it('renders only the stack, titled Stack, when no stats are passed', async () => {
    const container = await AstroContainer.create();
    for (const lang of ['en', 'es'] as const) {
      const html = await container.renderToString(StackStats, { props: { lang } });
      expect(html).not.toContain('class="card');
      expect(html).not.toContain('font-mono');
      expect(html).not.toContain('stack-stats-heatmap');
      expect(html).toMatch(/<h2[^>]*>\s*Stack\s*<\/h2>/);
      expect(html).not.toContain('Stack & stats');
      expect(html).not.toContain('Stack y stats');
    }
  });

  it('keeps the Spanish section title', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(StackStats, {
      props: { lang: 'es', stats: { posts: 5, apps: 2 } },
    });
    expect(html).toContain('Stack y stats');
  });
});
