import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Nav from '../src/components/site/Nav.astro';

describe('Nav', () => {
  it('renders every English link at the root', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Nav, {
      props: { lang: 'en', currentPath: '/' },
    });
    expect(html).toContain('href="/about"');
    expect(html).toContain('href="/#projects"');
    expect(html).toContain('href="/blog"');
    expect(html).toContain('href="/stats"');
    expect(html).toContain('href="/cv"');
    expect(html).toContain('href="/es/"');
    expect(html).toContain('aria-label="Toggle theme"');
  });

  it('hides the experience entry while the experience is mock', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Nav, {
      props: { lang: 'en', currentPath: '/' },
    });
    expect(html).not.toContain('#experience');
  });

  it('shows the experience entry when the caller says it is visible', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Nav, {
      props: { lang: 'en', currentPath: '/', experienceVisible: true },
    });
    expect(html).toContain('href="/#experience"');
    expect(html).toContain('Experience');
  });

  it('enables the command palette button', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Nav, {
      props: { lang: 'en', currentPath: '/' },
    });
    expect(html).toContain('data-command-palette');
    expect(html).not.toContain('aria-disabled');
  });

  it('renders a command palette trigger for desktop and one for the mobile menu', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Nav, {
      props: { lang: 'en', currentPath: '/' },
    });
    expect(html.match(/<button[^>]*data-command-palette/g)).toHaveLength(2);
  });

  it('prefixes links with /es for Spanish', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Nav, {
      props: { lang: 'es', currentPath: '/es/' },
    });
    expect(html).toContain('href="/es/about"');
    expect(html).toContain('href="/es/#projects"');
    expect(html).toContain('href="/es/cv"');
    expect(html).toContain('href="/"');
    expect(html).toContain('Sobre mí');
  });

  it('uses an explicit alternate path when the page provides one', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Nav, {
      props: {
        lang: 'en',
        currentPath: '/blog/from-an-idea',
        alternatePath: '/es/blog/de-una-idea',
      },
    });
    expect(html).toContain('href="/es/blog/de-una-idea"');
    expect(html).not.toContain('href="/es/blog/from-an-idea"');
  });
});
