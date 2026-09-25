import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

/**
 * `astro:content` is powered by Astro's own `astro-content-virtual-mod-plugin`,
 * which resolves the content-layer store from `.astro/data-store.json` whenever
 * Vite runs in "serve" mode (`isDev = env.command === 'serve'` in
 * `astro/dist/content/vite-plugin-content-virtual-mod.js`). Vitest always loads
 * config through `getViteConfig`, and Vite always calls that factory with
 * `command: 'serve'` — even for `vitest run` — so tests read the store from
 * `.astro/data-store.json`.
 *
 * `astro build` and a plain `astro sync`, on the other hand, run with
 * `isDev = false` and write the store to `node_modules/.astro/data-store.json`
 * (Astro's default `cacheDir`). On a clean checkout (`.astro/` and
 * `node_modules/.astro/` both absent) that leaves `.astro/data-store.json`
 * missing, so every test that reads a content collection sees an empty store.
 *
 * Passing `cacheDir: './.astro'` to `sync()` makes it write the store to the
 * exact path Vitest reads from, and `force: true` regenerates it from the
 * current content on every test run instead of trusting whatever is already
 * on disk (which is what let this pass by accident on a machine with a stale,
 * unrelated `.astro/data-store.json` left over from a previous `astro dev`
 * session).
 *
 * This runs `astro`'s programmatic `sync()` API in a plain Node subprocess
 * rather than importing it directly in this file: Vitest loads `globalSetup`
 * through the same Vite/`getViteConfig` pipeline used for the tests
 * themselves, and under that SSR transform the named `sync` export from the
 * `astro` package does not come through correctly. A separate `node` process
 * resolves the package as plain ESM, sidestepping that entirely.
 */
export default async function setup() {
  const root = fileURLToPath(new URL('..', import.meta.url));
  execFileSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      "import { sync } from 'astro';" +
        "await sync({ cacheDir: './.astro', force: true, logLevel: 'error' });",
    ],
    { cwd: root, stdio: 'inherit' },
  );
}
