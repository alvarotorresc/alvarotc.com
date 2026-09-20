import { describe, it, expect } from 'vitest';
import { createIslandContainer } from './islands';
import PaletteHost from './fixtures/PaletteHost.astro';

describe('CommandPalette island', () => {
  it('renders no dialog on the server', async () => {
    const container = await createIslandContainer();
    const html = await container.renderToString(PaletteHost, { props: { lang: 'es' } });
    expect(html).not.toContain('role="dialog"');
    expect(html).not.toContain('Sin resultados');
  });

  it('is mounted as an idle island', async () => {
    const container = await createIslandContainer();
    const html = await container.renderToString(PaletteHost, { props: { lang: 'es' } });
    expect(html).toContain('<astro-island');
    expect(html).toContain('client="idle"');
  });
});
