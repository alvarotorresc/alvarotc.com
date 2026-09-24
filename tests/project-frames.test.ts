import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import DeviceFrame from '../src/components/projects/DeviceFrame.astro';
import BrowserFrame from '../src/components/projects/BrowserFrame.astro';
import TerminalFrame from '../src/components/projects/TerminalFrame.astro';

describe('DeviceFrame', () => {
  it('shows the screenshot with its alt inside a hero phone', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DeviceFrame, {
      props: { size: 'hero', src: '/_astro/cover.webp', alt: 'Pantalla principal de Bito' },
    });
    expect(html).toContain('data-frame="device"');
    expect(html).toContain('data-size="hero"');
    expect(html).toMatch(/<img[^>]*src="\/_astro\/cover\.webp"/);
    expect(html).toContain('alt="Pantalla principal de Bito"');
    expect(html).toContain('loading="eager"');
  });

  it('hides the notch and the side keys from assistive tech', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DeviceFrame, {
      props: { size: 'hero', src: '/_astro/cover.webp', alt: 'x' },
    });
    expect(html.match(/aria-hidden="true"/g)).toHaveLength(3);
  });

  it('renders the slot when there is no screenshot', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DeviceFrame, {
      props: { size: 'play' },
      slots: { default: '<button data-test-slot>Cargar</button>' },
    });
    expect(html).toContain('data-test-slot');
    expect(html).not.toContain('<img');
  });
});

describe('BrowserFrame', () => {
  it('shows the address bar and the 16:10 screenshot', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BrowserFrame, {
      props: {
        size: 'hero',
        address: 'pokeutils.alvarotc.com',
        src: '/_astro/poke.webp',
        alt: 'Pantalla principal de PokeUtils',
      },
    });
    expect(html).toContain('data-frame="browser"');
    expect(html).toContain('pokeutils.alvarotc.com');
    expect(html).toContain('alt="Pantalla principal de PokeUtils"');
    expect(html).toMatch(/browser-bar"[^>]*aria-hidden="true"/);
  });

  it('renders the slot in the play size', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BrowserFrame, {
      props: { size: 'play', address: 'pokeutils.alvarotc.com' },
      slots: { default: '<button data-test-slot>Cargar la web</button>' },
    });
    expect(html).toContain('data-size="play"');
    expect(html).toContain('data-test-slot');
  });
});

describe('TerminalFrame', () => {
  it('renders the session with prompt, answers, gaps and output', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TerminalFrame, {
      props: {
        title: '~/proyectos',
        lines: [
          '$ npx create-astro-blog my-blog',
          '',
          '✔ Blog name: › My Blog',
          'Installing dependencies...',
        ],
      },
    });
    expect(html).toContain('data-frame="terminal"');
    expect(html).toContain('~/proyectos');
    expect(html).toMatch(/term-faint[^>]*>\$ <\/span>\s*npx create-astro-blog my-blog/);
    expect(html).toContain('term-gap');
    expect(html).toMatch(/term-value[^>]*>My Blog</);
    expect(html).toMatch(/term-out[^>]*>Installing dependencies\.\.\.</);
    expect(html).toMatch(/term-bar"[^>]*aria-hidden="true"/);
  });
});
