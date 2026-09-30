import { describe, it, expect } from 'vitest';
import { createIslandContainer } from './islands';
import TimelineHost from './fixtures/TimelineHost.astro';

const entries = [
  {
    period: '2024 - now',
    title: 'Backend developer, Nortia',
    summaryHtml: 'Servicios internos.',
    current: true,
  },
  {
    period: '2021 - 2022',
    title: 'Developer, Kestrel',
    summaryHtml: 'Integraciones.',
    current: false,
  },
];

describe('Timeline island', () => {
  it('ships every entry in the server HTML', async () => {
    const container = await createIslandContainer();
    const html = await container.renderToString(TimelineHost, { props: { entries } });
    expect(html).toContain('Backend developer, Nortia');
    expect(html).toContain('Developer, Kestrel');
    expect(html).toContain('2024 - now');
    expect(html).toContain('Servicios internos.');
  });

  it('marks only the current entry with the accent dot', async () => {
    const container = await createIslandContainer();
    const html = await container.renderToString(TimelineHost, { props: { entries } });
    expect(html).toContain('ring-accent/25');
    expect(html).toContain('border-2 border-border bg-bg');
    expect(html.match(/ring-accent\/25/g)).toHaveLength(1);
  });

  it('renders visible markup without JavaScript', async () => {
    const container = await createIslandContainer();
    const html = await container.renderToString(TimelineHost, { props: { entries } });
    expect(html).not.toContain('opacity:0');
  });
});
