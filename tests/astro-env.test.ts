import { describe, it, expect } from 'vitest';

describe('Astro environment', () => {
  it('astro:content module resolves', async () => {
    const { z } = await import('astro:content');
    expect(typeof z.object).toBe('function');
  });

  it('experimental_AstroContainer is available', async () => {
    const { experimental_AstroContainer } = await import('astro/container');
    expect(experimental_AstroContainer).toBeDefined();
    const container = await experimental_AstroContainer.create();
    expect(container).toBeDefined();
    expect(typeof container.renderToString).toBe('function');
  });
});
