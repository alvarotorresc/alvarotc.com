import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import ShareButtons from '../src/components/blog/ShareButtons.astro';

describe('ShareButtons', () => {
  it('labels the buttons in Spanish and exposes a data hook for the copy button', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ShareButtons, {
      props: { title: 'Hola', url: 'https://alvarotc.com/es/blog/x/', lang: 'es' },
    });
    expect(html).toContain('aria-label="Compartir en X"');
    expect(html).toContain('aria-label="Compartir en LinkedIn"');
    expect(html).toContain('aria-label="Compartir en WhatsApp"');
    expect(html).toContain('aria-label="Copiar enlace"');
    expect(html).toContain('data-copy-link="https://alvarotc.com/es/blog/x/"');
    expect(html).toContain('data-copied-label="Enlace copiado"');
    expect(html).not.toContain('id="copy-link"');
  });
});
