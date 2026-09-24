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
    expect(en).toContain('No cookies, no trackers. Source under AGPL.');
    expect(en).not.toContain('Umami');
    const es = await render(false, 'es');
    expect(es).toContain('Sin cookies ni rastreadores. Código bajo AGPL.');
    expect(es).not.toContain('Umami');
  });
});
