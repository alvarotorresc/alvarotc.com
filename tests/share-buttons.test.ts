import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import ShareButtons from '../src/components/blog/ShareButtons.astro';

describe('ShareButtons', () => {
  it('labels the buttons in Spanish and exposes a data hook for the copy button', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ShareButtons, {
      props: { title: 'Hola', url: 'https://alvarotc.com/es/blog/x/', lang: 'es' },
    });
    expect(html).toContain('<span class="sr-only">Compartir en X</span>');
    expect(html).toContain('<span class="sr-only">Compartir en LinkedIn</span>');
    expect(html).toContain('<span class="sr-only">Compartir en WhatsApp</span>');
    expect(html).toContain('aria-label="Copiar enlace"');
    expect(html).toContain('data-copy-link="https://alvarotc.com/es/blog/x/"');
    expect(html).toContain('data-copied-label="Enlace copiado"');
    expect(html).not.toContain('id="copy-link"');
  });
});
