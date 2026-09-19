import { describe, it, expect } from 'vitest';
import ShareButtons from '../src/components/blog/ShareButtons.astro';

describe('Astro environment', () => {
  it('astro:content module resolves', async () => {
    const { z } = await import('astro:content');
    expect(typeof z.object).toBe('function');
  });

  it('renders Astro components through Container API', async () => {
    const { experimental_AstroContainer } = await import('astro/container');
    const container = await experimental_AstroContainer.create();
    const html = await container.renderToString(ShareButtons, {
      props: {
        title: 'Hello',
        url: 'https://alvarotc.com/x',
      },
    });
    expect(html).toContain('Hello');
  });
});
