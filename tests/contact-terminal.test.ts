import { describe, it, expect } from 'vitest';
import { createIslandContainer } from './islands';
import ContactHost from './fixtures/ContactHost.astro';

describe('ContactTerminal', () => {
  it('renders the whole form on the server, in Spanish and enabled', async () => {
    const container = await createIslandContainer();
    const html = await container.renderToString(ContactHost, {
      props: { lang: 'es', endpoint: 'https://contact.alvarotc.com/send' },
    });
    expect(html).toContain('<fieldset');
    expect(html).toContain('name="website"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('De:');
    expect(html).toContain('Enviado por un servicio propio, sin rastreo.');
    expect(html).not.toContain('disabled');
  });

  it('keeps the labels in English for the root locale', async () => {
    const container = await createIslandContainer();
    const html = await container.renderToString(ContactHost, {
      props: { lang: 'en', endpoint: 'https://contact.alvarotc.com/send' },
    });
    expect(html).toContain('From:');
    expect(html).toContain('Subject:');
    expect(html).toContain('Body:');
  });
});
