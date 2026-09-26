import type { ClientDirective } from 'astro';

const OPEN_EVENT = 'command-palette:open';
const READY_EVENT = 'command-palette:ready';
const TRIGGER_SELECTOR = '[data-command-palette]';

const interaction: ClientDirective = (load, _options, el) => {
  let started = false;

  function isShortcut(event: KeyboardEvent) {
    return (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
  }

  function onKeyDown(event: KeyboardEvent) {
    if (!isShortcut(event)) return;
    event.preventDefault();
    void start();
  }

  function onClick(event: MouseEvent) {
    const target = event.target;
    if (target instanceof Element && target.closest(TRIGGER_SELECTOR)) void start();
  }

  function onOpen() {
    void start();
  }

  function onReady() {
    document.dispatchEvent(new CustomEvent(OPEN_EVENT));
  }

  function onAfterSwap() {
    if (!el.isConnected) removeListeners();
  }

  function removeListeners() {
    window.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('click', onClick);
    document.removeEventListener(OPEN_EVENT, onOpen);
    document.removeEventListener('astro:after-swap', onAfterSwap);
  }

  async function start() {
    if (started) return;
    started = true;
    removeListeners();
    document.addEventListener(READY_EVENT, onReady, { once: true });
    const hydrate = await load();
    await hydrate();
  }

  window.addEventListener('keydown', onKeyDown);
  document.addEventListener('click', onClick);
  document.addEventListener(OPEN_EVENT, onOpen);
  document.addEventListener('astro:after-swap', onAfterSwap);
};

export default interaction;
