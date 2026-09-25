import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Footer from '../src/components/site/Footer.astro';

async function render(analytics: boolean, lang: 'en' | 'es' = 'en') {
  const container = await AstroContainer.create();
  return container.renderToString(Footer, {
    props: { lang, currentPath: lang === 'es' ? '/es/stats/' : '/stats/', analytics },
  });
}

describe('Footer privacy line', () => {
  it('mentions Umami only when the tracking script is on the page', async () => {
    expect(await render(true)).toContain('Analytics self-hosted with Umami');
    expect(await render(true, 'es')).toContain('Analítica autoalojada con Umami');
  });

  it('drops the Umami sentence when there is no tracking', async () => {
    const en = await render(false);
    expect(en).toContain('No cookies, no trackers. Source under MIT.');
    expect(en).not.toContain('Umami');
    const es = await render(false, 'es');
    expect(es).toContain('Sin cookies ni rastreadores. Código bajo MIT.');
    expect(es).not.toContain('Umami');
  });
});

describe('Footer social links', () => {
  it('renders four social links, each with an aria-label', async () => {
    const html = await render(true);
    const labels = [...html.matchAll(/aria-label="([^"]+)"/g)].map((m) => m[1]);
    expect(labels).toHaveLength(4);
    expect(labels.some((l) => l.startsWith('GitHub,'))).toBe(true);
    expect(labels.some((l) => l.startsWith('LinkedIn,'))).toBe(true);
    expect(labels.some((l) => l.startsWith('X,'))).toBe(true);
    expect(labels.some((l) => l.startsWith('Email,'))).toBe(true);
  });

  it('marks the identity links with rel="me" but not the mail link', async () => {
    const html = await render(true);
    expect(html).toContain('href="https://github.com/alvarotorresc" aria-label="GitHub,');
    expect(html).toMatch(/href="https:\/\/github\.com\/alvarotorresc"[^>]*rel="me"/);
    expect(html).toMatch(/href="mailto:hello@alvarotc\.com"/);
    expect(html).not.toMatch(/href="mailto:hello@alvarotc\.com"[^>]*rel="me"/);
  });
});

describe('Footer llms.txt link', () => {
  it('links to /llms.txt in English and /es/llms.txt in Spanish', async () => {
    const en = await render(true, 'en');
    expect(en).toContain('href="/llms.txt"');
    const es = await render(true, 'es');
    expect(es).toContain('href="/es/llms.txt"');
  });
});

describe('Footer site links', () => {
  it('points the source link at the real repository', async () => {
    expect(await render(true)).toContain('href="https://github.com/alvarotorresc/alvarotc.com"');
  });

  it('links to the privacy and legal pages in the current language', async () => {
    const en = await render(true, 'en');
    expect(en).toContain('href="/privacy/"');
    expect(en).toContain('href="/legal/"');
    const es = await render(true, 'es');
    expect(es).toContain('href="/es/privacy/"');
    expect(es).toContain('href="/es/legal/"');
  });

  it('links to the status page and shows the copyright line', async () => {
    const html = await render(true);
    expect(html).toContain('href="https://status.alvarotc.com"');
    expect(html).toContain(`© ${new Date().getFullYear()} Álvaro Torres Carrasco`);
  });
});
