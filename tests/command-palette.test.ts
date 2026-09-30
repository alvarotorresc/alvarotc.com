import { describe, it, expect, vi, afterEach } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createIslandContainer } from './islands';
import PaletteHost from './fixtures/PaletteHost.astro';
import interaction from '../src/directives/interaction';

describe('CommandPalette island', () => {
  it('renders no dialog on the server', async () => {
    const container = await createIslandContainer();
    const html = await container.renderToString(PaletteHost, { props: { lang: 'es' } });
    expect(html).not.toContain('role="dialog"');
    expect(html).not.toContain('Sin resultados');
  });
});

const dist = resolve('dist');

describe.skipIf(!existsSync(dist))('CommandPalette in the build', () => {
  const paletteIsland = (file: string) => {
    const html = readFileSync(resolve(dist, file), 'utf8');
    return html.match(/<astro-island[^>]*CommandPalette[^>]*>/)?.[0] ?? '';
  };

  it.each(['index.html', 'es/blog/index.html', 'about/index.html'])(
    'hydrates the palette on interaction in %s',
    (file) => {
      const island = paletteIsland(file);
      expect(island).toContain('client="interaction"');
      expect(island).not.toContain('client="idle"');
    },
  );
});

describe('client:interaction directive', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function setup(connected = true) {
    const win = new EventTarget();
    const doc = new EventTarget();
    vi.stubGlobal('window', win);
    vi.stubGlobal('document', doc);
    const hydrate = vi.fn(async () => {});
    const load = vi.fn(async () => hydrate);
    const el = { isConnected: connected } as HTMLElement;
    interaction(load, { name: 'CommandPalette', value: '' }, el);
    return { win, doc, load, hydrate, el };
  }

  const shortcut = (key: string) =>
    Object.assign(new Event('keydown', { cancelable: true }), { key, ctrlKey: true });

  it('is a directive with the (load, opts, el) signature', () => {
    expect(typeof interaction).toBe('function');
    expect(interaction.length).toBe(3);
  });

  it('does not load anything until asked', () => {
    const { load } = setup();
    expect(load).not.toHaveBeenCalled();
  });

  it('hydrates on Ctrl+K and blocks the browser shortcut', async () => {
    const { win, load, hydrate } = setup();
    const event = shortcut('k');
    win.dispatchEvent(event);
    await vi.waitFor(() => expect(hydrate).toHaveBeenCalledOnce());
    expect(load).toHaveBeenCalledOnce();
    expect(event.defaultPrevented).toBe(true);
  });

  it('ignores other keys', () => {
    const { win, load } = setup();
    win.dispatchEvent(shortcut('j'));
    expect(load).not.toHaveBeenCalled();
  });

  it('hydrates once on the open event and reopens only after the palette is ready', async () => {
    const { doc, load, hydrate } = setup();
    const opens = vi.fn();
    doc.dispatchEvent(new CustomEvent('command-palette:open'));
    doc.addEventListener('command-palette:open', opens);
    doc.dispatchEvent(new CustomEvent('command-palette:open'));
    await vi.waitFor(() => expect(hydrate).toHaveBeenCalledOnce());
    expect(load).toHaveBeenCalledOnce();
    expect(opens).toHaveBeenCalledTimes(1);
    doc.dispatchEvent(new CustomEvent('command-palette:ready'));
    expect(opens).toHaveBeenCalledTimes(2);
    doc.dispatchEvent(new CustomEvent('command-palette:ready'));
    expect(opens).toHaveBeenCalledTimes(2);
    expect(load).toHaveBeenCalledOnce();
  });

  it('drops its listeners when a view transition removes the island', () => {
    const { win, doc, load, el } = setup();
    Object.assign(el, { isConnected: false });
    doc.dispatchEvent(new Event('astro:after-swap'));
    win.dispatchEvent(shortcut('k'));
    doc.dispatchEvent(new CustomEvent('command-palette:open'));
    expect(load).not.toHaveBeenCalled();
  });
});
