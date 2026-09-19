import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Nav from '../src/components/site/Nav.astro';

describe('Nav', () => {
  it('renders English links at the root', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Nav, {
      props: { lang: 'en', currentPath: '/' },
    });
    expect(html).toContain('href="/about"');
    expect(html).toContain('href="/cv"');
    expect(html).toContain('href="/es/"');
    expect(html).toContain('aria-label="Toggle theme"');
  });

  it('prefixes links with /es for Spanish', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Nav, {
      props: { lang: 'es', currentPath: '/es/' },
    });
    expect(html).toContain('href="/es/about"');
    expect(html).toContain('href="/es/#projects"');
    expect(html).toContain('href="/"');
    expect(html).toContain('Sobre mí');
  });
});
