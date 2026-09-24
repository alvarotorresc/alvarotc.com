import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import PostSidebar from '../src/components/blog/PostSidebar.astro';

const headings = [
  { depth: 2, slug: 'intro', text: 'Intro' },
  { depth: 3, slug: 'intro-detail', text: 'Intro detail' },
  { depth: 2, slug: 'setup', text: 'Setup' },
];

describe('PostSidebar', () => {
  it('renders the TOC links with data hooks and the scroll-spy script', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(PostSidebar, {
      props: { lang: 'es', headings },
    });

    expect(html).toContain('data-toc');
    expect(html).toContain('data-toc-link');
    expect(html).toContain('href="#intro"');
    expect(html).toContain('href="#setup"');
    expect(html).not.toContain('href="#intro-detail"');
    expect(html).toContain('<script type="module" src=');
    expect(html).toContain('PostSidebar.astro?astro&type=script');
  });

  it('links the Spanish RSS feed to /es/rss.xml', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(PostSidebar, {
      props: { lang: 'es', headings },
    });

    expect(html).toContain('href="/es/rss.xml"');
    expect(html).not.toContain('href="/rss.xml"');
  });

  it('links the English RSS feed to /rss.xml', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(PostSidebar, {
      props: { lang: 'en', headings },
    });

    expect(html).toContain('href="/rss.xml"');
  });
});
