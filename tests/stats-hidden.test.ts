import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Nav from '../src/components/site/Nav.astro';
import { GET as searchJson } from '../src/pages/search.json';
import { buildLlmsTxt } from '../src/lib/llms';

const dist = resolve('dist');
const site = new URL('https://alvarotc.com/');

describe('hidden stats page', () => {
  it('is not in the search index', async () => {
    const response = await searchJson({} as Parameters<typeof searchJson>[0]);
    const items = JSON.parse(await response.text()) as { url: string }[];
    expect(items.length).toBeGreaterThan(0);
    expect(items.filter((item) => item.url.includes('/stats/'))).toEqual([]);
  });

  it('is not listed in llms.txt in either language', async () => {
    expect(await buildLlmsTxt('en', site)).not.toContain('/stats/');
    expect(await buildLlmsTxt('es', site)).not.toContain('/stats/');
  });

  it('is not linked from the nav', async () => {
    const container = await AstroContainer.create();
    for (const lang of ['en', 'es'] as const) {
      const html = await container.renderToString(Nav, { props: { lang, currentPath: '/' } });
      expect(html).not.toContain('/stats/');
    }
  });
});

describe.skipIf(!process.env.RELEASE_CHECK)('hidden stats page in the build', () => {
  it('is left out of the sitemap', () => {
    const sitemap = readFileSync(join(dist, 'sitemap-0.xml'), 'utf8');
    expect(sitemap).not.toContain('https://alvarotc.com/stats/');
    expect(sitemap).not.toContain('https://alvarotc.com/es/stats/');
  });

  it('is still built but marked noindex', () => {
    for (const route of ['stats/index.html', 'es/stats/index.html']) {
      const path = join(dist, route);
      expect(existsSync(path)).toBe(true);
      expect(readFileSync(path, 'utf8')).toContain('<meta name="robots" content="noindex, follow"');
    }
  });
});
