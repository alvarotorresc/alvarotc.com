# Plan A: base visual, contenido y home estática

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dejar alvarotc.com con el sistema visual nuevo (tokens claro/oscuro, Manrope, nav, pie), las colecciones de contenido nuevas y la home completa tal como está en la maqueta aprobada, con datos de ejemplo donde aún no hay datos reales.

**Architecture:** Astro 5 estático. Todo lo de este plan es HTML generado en build con scripts vanilla mínimos (tema, menú móvil, copiar email). Sin islas React todavía: la timeline animada, la paleta de comandos y el envío del formulario llegan en el plan B. El contenido pasa al content layer de Astro 5 (`src/content.config.ts` con `glob()`), lo que obliga a migrar las páginas de blog de `post.slug` a `post.id` y de `post.render()` a `render(post)`.

**Tech Stack:** Astro 7.3 (Vite 8, Node 22.12+), Tailwind 4 vía `@tailwindcss/vite`, TypeScript strict, Vitest 5 con `getViteConfig` y el Container API de Astro, `@fontsource-variable/manrope`, `@fontsource/jetbrains-mono`, Prettier + ESLint + husky (ya configurados). La Task 1 se escribió sobre Astro 5 y Tailwind 3; la Task 1b sube de versión y adapta lo que la Task 1 dejó.

**Spec:** `docs/superpowers/specs/2026-09-19-cv-web-redesign-design.md`

## Global Constraints

- Node >= 22.12 (Astro 7). Node 22 instalado. `engines.node` pasa a `>=22.12.0` en la Task 1b.
- Astro 7, Tailwind 4 con `@tailwindcss/vite`, Vitest 5, `@astrojs/react` 6. Sin `@astrojs/tailwind` ni `tailwind.config.ts` a partir de la Task 1b.
- Zod 4: `z.url()`, nunca `z.string().url()`.
- `npm run build` ejecuta `astro check && astro build`; ambos deben pasar en cada commit.
- `npm run lint` (ESLint + Prettier check) debe pasar. El hook pre-commit ya formatea con Prettier y lanza `eslint --fix`.
- Conventional Commits en inglés: `feat:`, `fix:`, `refactor:`, `test:`, `chore:`, `docs:`.
- Sin `console.log` en código de producción (ESLint avisa).
- Idioma: inglés en la raíz, español en `/es`. Todo componente recibe `lang: 'en' | 'es'`.
- Sin Google Fonts por `<link>`. Fuentes autoalojadas vía fontsource.
- Sin em-dashes en textos visibles. Sin emojis. Iconos como SVG inline de trazo.
- Tokens de color exactamente los de la spec, sección 9, con `--text-faint` oscuro corregido a `#8a93a3` para cumplir AA (ver Task 1).
- Contraste AA (4.5:1) en los pares texto/fondo de ambos temas, verificado por test.
- Todo lo que sea dato inventado lleva `mock: true` en su fichero de contenido.
- Rama de trabajo: `redesign/cv-web`. Commit por tarea.

---

## Mapa de ficheros

Crear:

- `src/lib/contrast.ts`: cálculo de contraste WCAG.
- `src/content.config.ts`: colecciones `posts`, `posts-en`, `projects`, `experience`, `now`, `interests`.
- `src/content/projects/en/*.md`, `src/content/projects/es/*.md`: un fichero por proyecto e idioma.
- `src/content/experience/*.yaml`: un fichero por puesto o titulación.
- `src/content/now/now.yaml`, `src/content/interests/*.yaml`.
- `src/lib/projects.ts`, `src/lib/experience.ts`: helpers puros y consultas.
- `src/components/site/Nav.astro`, `Footer.astro`, `ThemeToggle.astro`.
- `src/components/icons/Icon.astro`: un componente con los SVG por nombre.
- `src/components/home/Hero.astro`, `About.astro`, `NowCards.astro`, `ProjectBento.astro`, `ExperienceTimeline.astro`, `WritingList.astro`, `StackStats.astro`, `OffClock.astro`, `ContactSection.astro`.
- `src/components/ui/SectionHeading.astro`, `Tag.astro`, `Placeholder.astro`.
- `tests/contrast.test.ts`, `tests/tokens.test.ts`, `tests/projects.test.ts`, `tests/experience.test.ts`, `tests/nav.test.ts`, `tests/schemas.test.ts`.

Modificar:

- `src/styles/global.css`: tokens y base nuevos.
- `tailwind.config.ts`: colores mapeados a tokens, `darkMode` por selector.
- `vitest.config.ts`: `getViteConfig` de Astro para poder renderizar componentes en tests.
- `src/layouts/BaseLayout.astro`: fuentes, script de tema, Nav y Footer, JSON-LD Person en home.
- `src/layouts/BlogPostLayout.astro`: tokens nuevos (solo renombrar variables).
- `src/pages/index.astro`, `src/pages/es/index.astro`: home nueva.
- `src/pages/projects.astro`, `src/pages/es/projects.astro`: lista con la colección nueva.
- `src/pages/blog/index.astro`, `src/pages/es/blog/index.astro`, `src/pages/blog/[slug].astro`, `src/pages/es/blog/[slug].astro`, `src/pages/rss.xml.ts`, `src/pages/og/[slug].png.ts`: migración a `post.id` y `render()`.
- `src/i18n/translations.ts`: claves nuevas.
- `site.config.ts`: nav nuevo.
- `package.json`: dependencias de fuentes.

Borrar:

- `src/content/config.ts` (sustituido por `src/content.config.ts`).
- `src/content/projects/*.md` antiguos (los siete de la raíz).
- `src/data/projects.ts`.
- `src/components/ProjectCard.astro`, `src/components/LanguageToggle.astro`.

---

### Task 1: Tokens de color, fuentes y test de contraste

**Files:**

- Create: `src/lib/contrast.ts`, `tests/contrast.test.ts`, `tests/tokens.test.ts`
- Modify: `src/styles/global.css`, `tailwind.config.ts`, `package.json`, `vitest.config.ts`

**Interfaces:**

- Produces: `contrastRatio(hexA: string, hexB: string): number` en `src/lib/contrast.ts`.
- Produces: variables CSS `--bg`, `--surface`, `--surface-2`, `--border`, `--text`, `--text-muted`, `--text-faint`, `--accent`, `--accent-fg`, `--ok` en `:root` (claro) y `:root[data-theme='dark']`.
- Produces: clases Tailwind `bg-bg`, `bg-surface`, `bg-surface-2`, `border-border`, `text-text`, `text-muted`, `text-faint`, `text-accent`, `bg-accent`, `text-accent-fg`, `text-ok`, `font-sans` (Manrope), `font-mono` (JetBrains Mono).

- [ ] **Step 1: Instalar fuentes y configurar Vitest con el config de Astro**

```bash
npm install @fontsource-variable/manrope @fontsource/jetbrains-mono
```

Sustituir `vitest.config.ts` por:

```ts
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    globals: true,
    include: ['tests/**/*.test.ts'],
  },
});
```

- [ ] **Step 2: Escribir el test de contraste (falla)**

`tests/contrast.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { contrastRatio } from '../src/lib/contrast';

describe('contrastRatio', () => {
  it('black on white is 21', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1);
  });

  it('is symmetric', () => {
    expect(contrastRatio('#4f8ef7', '#0f1115')).toBeCloseTo(contrastRatio('#0f1115', '#4f8ef7'), 5);
  });

  it('same color is 1', () => {
    expect(contrastRatio('#abcdef', '#abcdef')).toBeCloseTo(1, 5);
  });
});
```

- [ ] **Step 3: Ejecutar y ver que falla**

Run: `npx vitest run tests/contrast.test.ts`
Expected: FAIL, "Failed to resolve import ../src/lib/contrast".

- [ ] **Step 4: Implementar `src/lib/contrast.ts`**

```ts
function channel(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(hexA: string, hexB: string): number {
  const a = relativeLuminance(hexA);
  const b = relativeLuminance(hexB);
  const [light, dark] = a > b ? [a, b] : [b, a];
  return (light + 0.05) / (dark + 0.05);
}
```

- [ ] **Step 5: Ejecutar y ver que pasa**

Run: `npx vitest run tests/contrast.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 6: Escribir el test de tokens (falla)**

`tests/tokens.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { contrastRatio } from '../src/lib/contrast';

const css = readFileSync('src/styles/global.css', 'utf8');

function block(selector: string): Record<string, string> {
  const start = css.indexOf(selector);
  expect(start, `selector ${selector} not found`).toBeGreaterThan(-1);
  const body = css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start));
  const vars: Record<string, string> = {};
  for (const m of body.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})/g)) vars[m[1]] = m[2];
  return vars;
}

const pairs: Array<[string, string, number]> = [
  ['text', 'bg', 4.5],
  ['text-muted', 'bg', 4.5],
  ['text-faint', 'bg', 4.5],
  ['text', 'surface', 4.5],
  ['text-muted', 'surface', 4.5],
  ['text-faint', 'surface', 4.5],
  ['accent-fg', 'accent', 4.5],
  ['accent', 'bg', 3],
  ['ok', 'surface', 3],
];

describe('color tokens', () => {
  for (const [selector, name] of [
    [':root {', 'light'],
    [":root[data-theme='dark'] {", 'dark'],
  ] as const) {
    const vars = block(selector);
    for (const [fg, bg, min] of pairs) {
      it(`${name}: ${fg} on ${bg} >= ${min}`, () => {
        expect(vars[fg], `missing --${fg}`).toBeDefined();
        expect(vars[bg], `missing --${bg}`).toBeDefined();
        expect(contrastRatio(vars[fg], vars[bg])).toBeGreaterThanOrEqual(min);
      });
    }
  }
});
```

- [ ] **Step 7: Ejecutar y ver que falla**

Run: `npx vitest run tests/tokens.test.ts`
Expected: FAIL, "selector :root[data-theme='dark'] { not found" o variables ausentes.

- [ ] **Step 8: Reescribir `src/styles/global.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --bg: #f7f8fa;
    --surface: #ffffff;
    --surface-2: #eef0f4;
    --border: #dfe2e8;
    --text: #16181d;
    --text-muted: #4b5160;
    --text-faint: #6b7280;
    --accent: #2f6fe4;
    --accent-fg: #ffffff;
    --ok: #1a7f4b;
    color-scheme: light;
  }

  :root[data-theme='dark'] {
    --bg: #0f1115;
    --surface: #161920;
    --surface-2: #1c2029;
    --border: #22262e;
    --text: #e7e9ee;
    --text-muted: #9aa3b2;
    --text-faint: #8a93a3;
    --accent: #4f8ef7;
    --accent-fg: #0b1020;
    --ok: #5fd08a;
    color-scheme: dark;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-family: 'Manrope Variable', system-ui, sans-serif;
    background: var(--bg);
    color: var(--text);
    scroll-behavior: smooth;
  }

  body {
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1,
  h2,
  h3,
  h4 {
    font-weight: 700;
    line-height: 1.15;
    letter-spacing: -0.02em;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  ::selection {
    background: var(--accent);
    color: var(--accent-fg);
  }

  :focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
}

@layer components {
  .container-page {
    width: 100%;
    max-width: 1280px;
    margin-inline: auto;
    padding-inline: 1rem;
  }

  @media (min-width: 768px) {
    .container-page {
      padding-inline: 2.5rem;
    }
  }

  @media (min-width: 1280px) {
    .container-page {
      padding-inline: 5rem;
    }
  }

  .section {
    padding-block: 3.5rem 4rem;
    border-top: 1px solid var(--border);
  }

  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 1rem;
  }

  .card-sm {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 0.75rem;
  }

  .btn-primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 2.625rem;
    padding-inline: 1.25rem;
    border-radius: 0.5rem;
    background: var(--accent);
    color: var(--accent-fg);
    font-size: 0.875rem;
    font-weight: 700;
    transition: transform 0.15s ease;
  }

  .btn-secondary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 2.625rem;
    padding-inline: 1.25rem;
    border-radius: 0.5rem;
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text);
    font-size: 0.875rem;
    font-weight: 600;
    transition: transform 0.15s ease;
  }

  .btn-primary:active,
  .btn-secondary:active {
    transform: scale(0.98);
  }

  .placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 0.75rem;
    border-radius: 0.625rem;
    background: var(--surface-2);
    border: 1px dashed var(--border);
    color: var(--text-faint);
    font-size: 0.75rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  html {
    scroll-behavior: auto;
  }
}
```

- [ ] **Step 9: Reescribir `tailwind.config.ts`**

```ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: {
          DEFAULT: 'var(--surface)',
          2: 'var(--surface-2)',
        },
        border: 'var(--border)',
        text: 'var(--text)',
        muted: 'var(--text-muted)',
        faint: 'var(--text-faint)',
        accent: {
          DEFAULT: 'var(--accent)',
          fg: 'var(--accent-fg)',
        },
        ok: 'var(--ok)',
      },
      fontFamily: {
        sans: ['Manrope Variable', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      maxWidth: {
        page: '1280px',
      },
    },
  },
  plugins: [],
} satisfies Config;
```

- [ ] **Step 10: Ejecutar los tests y ver que pasan**

Run: `npx vitest run tests/contrast.test.ts tests/tokens.test.ts`
Expected: PASS, 3 + 18 tests.

- [ ] **Step 11: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/lib/contrast.ts src/styles/global.css tailwind.config.ts tests/contrast.test.ts tests/tokens.test.ts
git commit -m "feat(design): color tokens for light and dark, self-hosted fonts, contrast tests"
```

---

### Task 1b: Subida a Astro 7, Vitest 5 y Tailwind 4

**Files:**

- Modify: `package.json`, `package-lock.json`, `astro.config.mjs`, `src/styles/global.css`, `vitest.config.ts`, `.gitignore`
- Create: `.prettierignore`
- Delete: `tailwind.config.ts`

**Interfaces:**

- Consumes: los tokens y tests de la Task 1 (`tests/tokens.test.ts` sigue leyendo `src/styles/global.css` y debe pasar sin cambios) y `tests/astro-env.test.ts` (Container API y `astro:content`).
- Produces: las mismas clases Tailwind que prometía la Task 1 (`bg-bg`, `bg-surface`, `bg-surface-2`, `border-border`, `text-text`, `text-muted`, `text-faint`, `text-accent`, `bg-accent`, `text-accent-fg`, `text-ok`, `font-sans`, `font-mono`) pero declaradas en `@theme`; variante `dark:` activa bajo `[data-theme='dark']`.

- [ ] **Step 1: Subir dependencias**

```bash
npm uninstall @astrojs/tailwind tailwindcss
npm install astro@^7.3 @astrojs/react@^6 @astrojs/sitemap@^3.7 @astrojs/rss@^4
npm install -D vite@^8 vitest@^5 @tailwindcss/vite@^4 tailwindcss@^4 @astrojs/check@latest
npm ls vite astro vitest tailwindcss
```

Expected: una sola copia de `vite@8.x`, `astro@7.3.x`, `vitest@5.x`, `tailwindcss@4.x`. Si `npm ls vite` muestra dos copias, `npm dedupe` y repetir. Cambiar en `package.json` `"engines": { "node": ">=22.12.0" }`.

- [ ] **Step 2: `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://alvarotc.com',
  integrations: [
    react(),
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', es: 'es' },
      },
    }),
  ],
  output: 'static',
  build: { inlineStylesheets: 'auto' },
  vite: {
    plugins: [tailwindcss()],
    ssr: { noExternal: ['framer-motion'] },
  },
});
```

- [ ] **Step 3: `src/styles/global.css` a Tailwind 4**

Sustituir las tres líneas `@tailwind base; @tailwind components; @tailwind utilities;` por:

```css
@import 'tailwindcss';

@custom-variant dark (&:where([data-theme='dark'], [data-theme='dark'] *));

@theme {
  --color-bg: var(--bg);
  --color-surface: var(--surface);
  --color-surface-2: var(--surface-2);
  --color-border: var(--border);
  --color-text: var(--text);
  --color-muted: var(--text-muted);
  --color-faint: var(--text-faint);
  --color-accent: var(--accent);
  --color-accent-fg: var(--accent-fg);
  --color-ok: var(--ok);
  --font-sans: 'Manrope Variable', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

El resto del fichero (los dos bloques `:root`, `@layer base`, `@layer components`, reduced motion) se mantiene tal cual. Borrar `tailwind.config.ts`:

```bash
git rm tailwind.config.ts
```

- [ ] **Step 4: `vitest.config.ts`**

Debe quedar exactamente:

```ts
/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    globals: true,
    include: ['tests/**/*.test.ts'],
  },
});
```

- [ ] **Step 5: Ficheros de ignore**

Añadir a `.gitignore` al final:

```
# SDD scratch
.superpowers/
.playwright-mcp/
```

Crear `.prettierignore`:

```
dist/
.astro/
node_modules/
.superpowers/
.playwright-mcp/
reports/
research_notes/
package-lock.json
```

- [ ] **Step 6: Verificar**

Run: `npx vitest run && npm run lint && npm run build`
Expected: 24 tests PASS (contrast 3, tokens 18, build 1, astro-env 2); lint limpio en todo el repo; `astro check` y build de Astro 7 completos. Si `astro check` señala HTML sin cerrar en páginas antiguas (compilador nuevo), cerrar las etiquetas y anotarlo en el report. Si `@vercel/analytics/astro` no compila con Astro 7, quitar su import y su `<Analytics />` de `BaseLayout.astro` (Umami ya cubre la analítica) y anotarlo.

- [ ] **Step 7: Commit**

```bash
git add -A package.json package-lock.json astro.config.mjs src/styles/global.css vitest.config.ts tailwind.config.ts .gitignore .prettierignore
git commit -m "chore(deps): upgrade to Astro 7, Vitest 5 and Tailwind 4"
```

---

### Task 2: Iconos, tema, Nav, Footer y BaseLayout

**Files:**

- Create: `src/components/icons/Icon.astro`, `src/components/site/ThemeToggle.astro`, `src/components/site/Nav.astro`, `src/components/site/Footer.astro`, `tests/nav.test.ts`
- Modify: `src/layouts/BaseLayout.astro`, `src/i18n/translations.ts`, `site.config.ts`, `src/layouts/BlogPostLayout.astro`

**Interfaces:**

- Produces: `<Icon name="..." size={16} class="..." />` con nombres: `sun`, `moon`, `search`, `menu`, `close`, `copy`, `book`, `music`, `commit`, `hammer`, `tux`, `guitar`, `chess`, `boxing`, `print`, `external`, `arrow`.
- Produces: `<Nav lang currentPath />`, `<Footer lang />`, `<ThemeToggle />`.
- Produces: `BaseLayout` con props `title`, `description?`, `image?`, `type?`, `publishedTime?`, `lang?` (si no llega, se deduce de la URL) y slot por defecto. Renderiza Nav y Footer alrededor del slot.
- Produces: `t(key, locale)` con las claves nuevas listadas abajo.

- [ ] **Step 1: Crear `src/components/icons/Icon.astro`**

```astro
---
interface Props {
  name: string;
  size?: number;
  class?: string;
  strokeWidth?: number;
}

const { name, size = 16, class: className = '', strokeWidth = 1.8 } = Astro.props;

const paths: Record<string, string> = {
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  commit: '<circle cx="12" cy="12" r="3"/><path d="M12 3v6M12 15v6"/>',
  hammer: '<path d="M14 4l6 6-9 9-6-6z"/><path d="M5 19l-2 2"/><path d="M15 9l3-3"/>',
  tux: '<path d="M12 2.5c-2.6 0-4 2-4 4.6 0 1.6-.6 2.8-1.6 4.4C5.3 13.3 4.5 15 4.5 17c0 2.6 3.3 4.5 7.5 4.5s7.5-1.9 7.5-4.5c0-2-.8-3.7-1.9-5.5C16.6 9.9 16 8.7 16 7.1c0-2.6-1.4-4.6-4-4.6z"/><path d="M9.2 13.5c.8 3 4.8 3 5.6 0"/><path d="M10.3 7.3h.01M13.7 7.3h.01"/><path d="M10.6 9.4l1.4.9 1.4-.9"/><path d="M6.5 21.2l-1.6.6M17.5 21.2l1.6.6"/>',
  guitar:
    '<path d="M20 4l-9.5 9.5"/><path d="M17.5 2.5l4 4"/><path d="M10.5 13.5c-2.5-.5-5 1-5.5 3.5-.4 2 .8 3.5 2.8 3.5 2.5 0 4.2-2.6 3.7-5"/><path d="M5.5 15.5l3 3"/>',
  chess:
    '<path d="M8 21h8"/><path d="M9 18h6l-1-3H10z"/><path d="M12 15V9"/><path d="M12 9a3.5 3.5 0 1 0-3.5-3.5c0 1.5 1 2.5 1.5 3.5"/><path d="M12 9a3.5 3.5 0 1 1 3.5-3.5c0 1.5-1 2.5-1.5 3.5"/>',
  boxing:
    '<path d="M7 10V7a3 3 0 0 1 3-3h1v6"/><path d="M11 4h2a3 3 0 0 1 3 3v3"/><path d="M6 10h11a2 2 0 0 1 2 2v3a5 5 0 0 1-5 5h-3a5 5 0 0 1-5-5v-5z"/><path d="M6 13h11"/>',
  print:
    '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/>',
  external:
    '<path d="M14 4h6v6"/><path d="M20 4L10 14"/><path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6"/>',
  arrow: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
};

const d = paths[name];
if (!d) throw new Error(`Unknown icon: ${name}`);
---

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width={strokeWidth}
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
  class={className}
  set:html={d}
/>
```

- [ ] **Step 2: Ampliar `src/i18n/translations.ts`**

Sustituir el objeto `translations` por:

```ts
export const translations = {
  en: {
    'site.title': 'Álvaro Torres Carrasco',
    'site.tagline': 'Backend developer',
    'nav.about': 'About',
    'nav.projects': 'Projects',
    'nav.experience': 'Experience',
    'nav.writing': 'Writing',
    'nav.stats': 'Stats',
    'nav.cv': 'CV',
    'nav.search': 'Search',
    'nav.menu': 'Menu',
    'nav.theme': 'Toggle theme',
    'nav.lang': 'ES',
    'nav.viewAll': 'View all',
    'nav.back': 'Back',
    'footer.privacy':
      'No cookies, no trackers. Analytics self-hosted with Umami. Source under AGPL.',
    'footer.lang': 'Español',
    'footer.source': 'Source',
    'hero.intro':
      'Backend developer. I build offline-first apps and the infrastructure behind them, all of it free software, and I write about how.',
    'hero.contact': 'Get in touch',
    'hero.cv': 'Download CV',
    'about.title': 'About',
    'about.more': 'More about me',
    'about.tag.foss': 'Free software',
    'about.tag.privacy': 'Privacy by default',
    'about.tag.offline': 'Offline-first',
    'about.tag.selfhosted': 'Self-hosted',
    'now.reading': 'Reading',
    'now.driver': 'Daily driver',
    'now.listening': 'Listening',
    'now.building': 'Building',
    'now.via': 'via ListenBrainz',
    'projects.title': 'Projects',
    'projects.all': 'All projects',
    'projects.also': 'Also',
    'projects.caseStudy': 'Case study',
    'projects.live': 'Live site',
    'projects.repo': 'Repo',
    'status.published': 'Published',
    'status.beta': 'Private beta',
    'status.development': 'In development',
    'status.design': 'In design',
    'status.archived': 'Archived',
    'experience.title': 'Experience',
    'experience.cv': 'Full CV, printable',
    'experience.now': 'now',
    'writing.title': 'Writing',
    'writing.all': 'All posts',
    'writing.latest': 'Latest',
    'writing.minRead': 'min read',
    'post.minRead': 'min read',
    'stack.title': 'Stack',
    'stats.title': 'Stats',
    'stats.full': 'Full stats page',
    'stats.commits': 'commits this year',
    'stats.posts': 'posts published',
    'stats.apps': 'apps in the wild',
    'offclock.title': 'Off the clock',
    'offclock.subtitle': 'What I do when the laptop is closed.',
    'contact.title': 'Contact',
    'contact.open': 'Open to backend and full-stack roles',
    'contact.email': 'Email',
    'contact.copy': 'Copy',
    'contact.copied': 'Copied',
    'contact.response': 'Response time',
    'contact.responseValue': 'Usually within two days',
    'contact.call': 'Book a 20 min call',
    'contact.from': 'From:',
    'contact.subject': 'Subject:',
    'contact.body': 'Body:',
    'contact.note': 'Sent through a self-hosted service, no tracking.',
    'contact.send': 'send',
    'contact.soon': 'Sending arrives with the next release. Use the email meanwhile.',
    'lang.spanish': 'Español',
    'lang.english': 'English',
  },
  es: {
    'site.title': 'Álvaro Torres Carrasco',
    'site.tagline': 'Desarrollador backend',
    'nav.about': 'Sobre mí',
    'nav.projects': 'Proyectos',
    'nav.experience': 'Experiencia',
    'nav.writing': 'Escritos',
    'nav.stats': 'Stats',
    'nav.cv': 'CV',
    'nav.search': 'Buscar',
    'nav.menu': 'Menú',
    'nav.theme': 'Cambiar tema',
    'nav.lang': 'EN',
    'nav.viewAll': 'Ver todos',
    'nav.back': 'Volver',
    'footer.privacy':
      'Sin cookies ni rastreadores. Analítica autoalojada con Umami. Código bajo AGPL.',
    'footer.lang': 'English',
    'footer.source': 'Código',
    'hero.intro':
      'Desarrollador backend. Construyo apps offline-first y la infraestructura que las sostiene, todo software libre, y escribo sobre cómo.',
    'hero.contact': 'Contactar',
    'hero.cv': 'Descargar CV',
    'about.title': 'Sobre mí',
    'about.more': 'Más sobre mí',
    'about.tag.foss': 'Software libre',
    'about.tag.privacy': 'Privacidad por defecto',
    'about.tag.offline': 'Offline-first',
    'about.tag.selfhosted': 'Autoalojado',
    'now.reading': 'Leyendo',
    'now.driver': 'Sistema diario',
    'now.listening': 'Escuchando',
    'now.building': 'Construyendo',
    'now.via': 'vía ListenBrainz',
    'projects.title': 'Proyectos',
    'projects.all': 'Todos los proyectos',
    'projects.also': 'También',
    'projects.caseStudy': 'Ficha',
    'projects.live': 'Web',
    'projects.repo': 'Repo',
    'status.published': 'Publicado',
    'status.beta': 'Beta privada',
    'status.development': 'En desarrollo',
    'status.design': 'En diseño',
    'status.archived': 'Archivado',
    'experience.title': 'Experiencia',
    'experience.cv': 'CV completo, imprimible',
    'experience.now': 'actualidad',
    'writing.title': 'Escritos',
    'writing.all': 'Todos los posts',
    'writing.latest': 'Último',
    'writing.minRead': 'min de lectura',
    'post.minRead': 'min de lectura',
    'stack.title': 'Stack',
    'stats.title': 'Stats',
    'stats.full': 'Página de stats',
    'stats.commits': 'commits este año',
    'stats.posts': 'posts publicados',
    'stats.apps': 'apps en producción',
    'offclock.title': 'Fuera del teclado',
    'offclock.subtitle': 'Lo que hago cuando cierro el portátil.',
    'contact.title': 'Contacto',
    'contact.open': 'Abierto a roles backend y full-stack',
    'contact.email': 'Email',
    'contact.copy': 'Copiar',
    'contact.copied': 'Copiado',
    'contact.response': 'Tiempo de respuesta',
    'contact.responseValue': 'Normalmente en dos días',
    'contact.call': 'Reservar llamada de 20 min',
    'contact.from': 'De:',
    'contact.subject': 'Asunto:',
    'contact.body': 'Mensaje:',
    'contact.note': 'Enviado por un servicio propio, sin rastreo.',
    'contact.send': 'enviar',
    'contact.soon': 'El envío llega en la próxima versión. Mientras, usa el email.',
    'lang.spanish': 'Español',
    'lang.english': 'English',
  },
};
```

Mantener `Locale` y `t()` tal como están, y añadir al final del fichero:

```ts
export function statusLabel(status: string, locale: Locale = 'en'): string {
  return t(('status.' + status) as keyof typeof translations.en, locale);
}
```

- [ ] **Step 3: Actualizar `site.config.ts`**

Sustituir `nav` por:

```ts
  nav: [
    { key: 'nav.about', href: '/about' },
    { key: 'nav.projects', href: '/#projects' },
    { key: 'nav.experience', href: '/#experience' },
    { key: 'nav.writing', href: '/blog' },
    { key: 'nav.stats', href: '/stats' },
    { key: 'nav.cv', href: '/cv' },
  ],
```

Y `tagline: 'Backend developer'`, `description: 'Backend developer. Offline-first apps, self-hosted infrastructure, free software.'`.

- [ ] **Step 4: Escribir el test de Nav (falla)**

`tests/nav.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Nav from '../src/components/site/Nav.astro';

describe('Nav', () => {
  it('renders English links at the root', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Nav, {
      props: { lang: 'en', currentPath: '/' },
    });
    expect(html).toContain('href="/about"');
    expect(html).toContain('href="/cv"');
    expect(html).toContain('href="/es/"');
    expect(html).toContain('aria-label="Toggle theme"');
  });

  it('prefixes links with /es for Spanish', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Nav, {
      props: { lang: 'es', currentPath: '/es/' },
    });
    expect(html).toContain('href="/es/about"');
    expect(html).toContain('href="/es/#projects"');
    expect(html).toContain('href="/"');
    expect(html).toContain('Sobre mí');
  });
});
```

- [ ] **Step 5: Ejecutar y ver que falla**

Run: `npx vitest run tests/nav.test.ts`
Expected: FAIL, no resuelve `Nav.astro`.

- [ ] **Step 6: Crear `src/components/site/ThemeToggle.astro`**

```astro
---
import Icon from '../icons/Icon.astro';
import { t, type Locale } from '../../i18n/translations';

interface Props {
  lang: Locale;
}
const { lang } = Astro.props;
---

<button
  type="button"
  data-theme-toggle
  aria-label={t('nav.theme', lang)}
  class="flex h-[34px] w-[34px] items-center justify-center rounded-lg border border-border bg-surface text-muted hover:text-text"
>
  <span class="hidden dark:inline"><Icon name="sun" size={15} /></span>
  <span class="inline dark:hidden"><Icon name="moon" size={15} /></span>
</button>

<script>
  function bind() {
    document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((button) => {
      if (button.dataset.bound) return;
      button.dataset.bound = 'true';
      button.addEventListener('click', () => {
        const current = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = next;
        try {
          localStorage.setItem('theme', next);
        } catch {
          /* private mode */
        }
      });
    });
  }
  bind();
  document.addEventListener('astro:after-swap', bind);
</script>
```

- [ ] **Step 7: Crear `src/components/site/Nav.astro`**

```astro
---
import Icon from '../icons/Icon.astro';
import ThemeToggle from './ThemeToggle.astro';
import { t, translations, type Locale } from '../../i18n/translations';
import { getNav } from '../../lib/config';

interface Props {
  lang: Locale;
  currentPath: string;
}
const { lang, currentPath } = Astro.props;

const prefix = lang === 'es' ? '/es' : '';
const items = getNav().map((item) => ({
  label: t(item.key as keyof typeof translations.en, lang),
  href: `${prefix}${item.href}`,
}));

const otherLang =
  lang === 'es'
    ? currentPath.replace(/^\/es/, '') || '/'
    : `/es${currentPath === '/' ? '/' : currentPath}`;
---

<header class="border-b border-border">
  <nav class="container-page flex h-[72px] items-center justify-between">
    <a href={`${prefix}/`} class="text-base font-extrabold tracking-tight">alvarotc</a>

    <div class="hidden items-center gap-6 text-sm font-medium md:flex">
      {
        items.map((item) => (
          <a href={item.href} class="text-muted hover:text-text">
            {item.label}
          </a>
        ))
      }
      <button
        type="button"
        data-command-palette
        class="flex h-[34px] items-center gap-2 rounded-lg border border-border bg-surface pl-3 pr-2 text-[13px] text-muted"
      >
        <Icon name="search" size={14} />
        <span>{t('nav.search', lang)}</span>
        <kbd class="rounded border border-border px-1.5 py-0.5 font-mono text-[11px] text-faint"
          >⌘K</kbd
        >
      </button>
      <a
        href={otherLang}
        class="text-[13px] text-muted hover:text-text"
        hreflang={lang === 'es' ? 'en' : 'es'}
      >
        {t('nav.lang', lang)}
      </a>
      <ThemeToggle lang={lang} />
    </div>

    <div class="flex items-center gap-2 md:hidden">
      <ThemeToggle lang={lang} />
      <button
        type="button"
        data-menu-toggle
        aria-label={t('nav.menu', lang)}
        aria-expanded="false"
        aria-controls="mobile-menu"
        class="flex h-[34px] w-[34px] items-center justify-center rounded-lg border border-border bg-surface text-muted"
      >
        <Icon name="menu" size={16} />
      </button>
    </div>
  </nav>

  <div id="mobile-menu" hidden class="container-page border-t border-border pb-4 md:hidden">
    <ul class="flex flex-col gap-1 pt-2">
      {
        items.map((item) => (
          <li>
            <a
              href={item.href}
              class="block rounded-lg px-2 py-2 text-sm font-medium text-muted hover:bg-surface-2"
            >
              {item.label}
            </a>
          </li>
        ))
      }
      <li>
        <a
          href={otherLang}
          class="block rounded-lg px-2 py-2 text-sm font-medium text-muted hover:bg-surface-2"
        >
          {t('footer.lang', lang)}
        </a>
      </li>
    </ul>
  </div>
</header>

<script>
  function bind() {
    const button = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
    const menu = document.getElementById('mobile-menu');
    if (!button || !menu || button.dataset.bound) return;
    button.dataset.bound = 'true';
    button.addEventListener('click', () => {
      const open = menu.hidden;
      menu.hidden = !open;
      button.setAttribute('aria-expanded', String(open));
    });
  }
  bind();
  document.addEventListener('astro:after-swap', bind);
</script>
```

- [ ] **Step 8: Crear `src/components/site/Footer.astro`**

```astro
---
import { t, type Locale } from '../../i18n/translations';

interface Props {
  lang: Locale;
  currentPath: string;
}
const { lang, currentPath } = Astro.props;
const otherLang =
  lang === 'es'
    ? currentPath.replace(/^\/es/, '') || '/'
    : `/es${currentPath === '/' ? '/' : currentPath}`;
const rss = lang === 'es' ? '/rss.xml' : '/rss-en.xml';
---

<footer class="border-t border-border">
  <div
    class="container-page flex flex-col gap-3 py-6 pb-10 text-[13px] text-faint md:flex-row md:items-center md:justify-between"
  >
    <span>{t('footer.privacy', lang)}</span>
    <div class="flex gap-4">
      <a href={otherLang} class="hover:text-text">{t('footer.lang', lang)}</a>
      <a href={rss} class="hover:text-text">RSS</a>
      <a href="/llms.txt" class="hover:text-text">llms.txt</a>
      <a href="https://github.com/alvarotorresc/alvarotc-web" class="hover:text-text"
        >{t('footer.source', lang)}</a
      >
    </div>
  </div>
</footer>
```

Nota: `/rss-en.xml` y `/llms.txt` se crean en el plan C. Hasta entonces son enlaces a 404 conocidos.

- [ ] **Step 9: Reescribir `src/layouts/BaseLayout.astro`**

```astro
---
import '@fontsource-variable/manrope';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '../styles/global.css';
import { ClientRouter } from 'astro:transitions';
import Analytics from '@vercel/analytics/astro';
import Nav from '../components/site/Nav.astro';
import Footer from '../components/site/Footer.astro';
import { getSiteName, getDescription, getAuthor } from '../lib/config';
import type { Locale } from '../i18n/translations';

interface Props {
  title: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  lang?: Locale;
  jsonLd?: Record<string, unknown>;
}

const currentPath = Astro.url.pathname;
const {
  title,
  description = getDescription(),
  image = '/og-default.png',
  type = 'website',
  publishedTime,
  lang = currentPath.startsWith('/es') ? 'es' : 'en',
  jsonLd,
} = Astro.props;

const canonicalURL = new URL(currentPath, Astro.site);
const ogImage = new URL(image, Astro.site);
const siteName = getSiteName();
const author = getAuthor();
const fullTitle = title === siteName ? title : `${title} | ${siteName}`;

const alternateURL =
  lang === 'es'
    ? new URL(currentPath.replace(/^\/es/, '') || '/', Astro.site)
    : new URL('/es' + currentPath, Astro.site);

const defaultJsonLd = {
  '@context': 'https://schema.org',
  '@type': type === 'article' ? 'BlogPosting' : 'WebSite',
  name: title,
  description,
  url: canonicalURL.toString(),
  image: ogImage.toString(),
  author: { '@type': 'Person', name: author.name, url: 'https://alvarotc.com' },
  ...(publishedTime && { datePublished: publishedTime }),
};
---

<!doctype html>
<html lang={lang}>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0f1115" media="(prefers-color-scheme: dark)" />
    <meta name="theme-color" content="#f7f8fa" media="(prefers-color-scheme: light)" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="manifest" href="/manifest.json" />
    <link rel="canonical" href={canonicalURL} />
    <link rel="alternate" hreflang={lang === 'es' ? 'en' : 'es'} href={alternateURL} />

    <title>{fullTitle}</title>
    <meta name="description" content={description} />
    <meta name="author" content={author.name} />

    <meta property="og:type" content={type} />
    <meta property="og:url" content={canonicalURL} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={ogImage} />
    <meta property="og:site_name" content={siteName} />
    {publishedTime && <meta property="article:published_time" content={publishedTime} />}

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={ogImage} />

    <script is:inline>
      (function () {
        function apply() {
          var theme = 'dark';
          try {
            var stored = localStorage.getItem('theme');
            if (stored === 'light' || stored === 'dark') theme = stored;
            else theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          } catch (e) {
            /* keep default */
          }
          document.documentElement.dataset.theme = theme;
        }
        apply();
        document.addEventListener('astro:after-swap', apply);
      })();
    </script>

    <script type="application/ld+json" set:html={JSON.stringify(jsonLd ?? defaultJsonLd)} />

    <ClientRouter />
    <Analytics />
    <script
      defer
      src="https://analytics.alvarotc.com/script.js"
      data-website-id="4dc00bab-7da7-488d-b399-299d751b6801"></script>
  </head>
  <body class="flex min-h-screen flex-col bg-bg text-text">
    <Nav lang={lang} currentPath={currentPath} />
    <main class="flex-1">
      <slot />
    </main>
    <Footer lang={lang} currentPath={currentPath} />
  </body>
</html>
```

- [ ] **Step 10: Renombrar tokens en `src/layouts/BlogPostLayout.astro`**

En el bloque `<style is:global>` sustituir: `var(--color-text)` por `var(--text)`, `var(--color-accent)` por `var(--accent)`, `var(--color-border)` por `var(--surface-2)`, `var(--color-text-muted)` por `var(--text-muted)`. En el markup, cambiar las clases `text-text-muted` por `text-muted`, `hover:text-accent` se mantiene, `border-border` se mantiene. Cambiar el contenedor `max-w-2xl mx-auto px-6 py-16` por `container-page py-14`, y envolver `<article>` en `<div class="max-w-[720px]">`.

- [ ] **Step 11: Ejecutar el test de Nav y ver que pasa**

Run: `npx vitest run tests/nav.test.ts`
Expected: PASS, 2 tests.

- [ ] **Step 12: Comprobar que la web sigue construyendo**

Run: `npm run build`
Expected: `astro check` sin errores y build completa. La home todavía es la antigua pero con nav, pie y tokens nuevos.

- [ ] **Step 13: Commit**

```bash
git add src/components/icons/Icon.astro src/components/site src/layouts src/i18n/translations.ts site.config.ts tests/nav.test.ts
git commit -m "feat(layout): theme toggle, nav, footer and base layout with self-hosted fonts"
```

---

### Task 3: Migración de posts al content layer

**Files:**

- Create: `src/content.config.ts`, `tests/schemas.test.ts`
- Delete: `src/content/config.ts`
- Modify: `src/pages/blog/index.astro`, `src/pages/es/blog/index.astro`, `src/pages/blog/[slug].astro`, `src/pages/es/blog/[slug].astro`, `src/pages/rss.xml.ts`, `src/pages/og/[slug].png.ts`, `src/pages/index.astro` (solo la consulta de posts), `src/pages/es/index.astro` (idem)

**Interfaces:**

- Produces: `postSchema` exportado desde `src/content.config.ts`; colecciones `posts` y `posts-en` con `glob()`. Entradas con `post.id` (slug del fichero) y `post.data`.
- Produces: en las páginas, `render(post)` de `astro:content` en lugar de `post.render()`.

- [ ] **Step 1: Escribir el test de esquema (falla)**

`tests/schemas.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { postSchema } from '../src/content.config';

describe('postSchema', () => {
  it('accepts a valid post and defaults draft and tags', () => {
    const parsed = postSchema.parse({
      title: 'Hello',
      description: 'A post',
      date: '2026-09-01',
    });
    expect(parsed.draft).toBe(false);
    expect(parsed.tags).toEqual([]);
    expect(parsed.date).toBeInstanceOf(Date);
  });

  it('rejects a post without description', () => {
    expect(() => postSchema.parse({ title: 'x', date: '2026-01-01' })).toThrow();
  });
});
```

- [ ] **Step 2: Ejecutar y ver que falla**

Run: `npx vitest run tests/schemas.test.ts`
Expected: FAIL, no existe `src/content.config`.

- [ ] **Step 3: Crear `src/content.config.ts` y borrar el antiguo**

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

export const postSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  draft: z.boolean().default(false),
  image: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: postSchema,
});

const postsEn = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts-en' }),
  schema: postSchema,
});

export const collections = {
  posts,
  'posts-en': postsEn,
};
```

```bash
git rm src/content/config.ts
```

Nota: `astro:content` en un test de Vitest resuelve gracias a `getViteConfig`. Si el import de `zod` fallara en el test, cambiar la primera línea por `import { defineCollection } from 'astro:content'; import { z } from 'astro/zod';`.

- [ ] **Step 4: Ejecutar y ver que pasa**

Run: `npx vitest run tests/schemas.test.ts`
Expected: PASS, 2 tests.

- [ ] **Step 5: Migrar las páginas de blog**

`src/pages/blog/[slug].astro`:

```astro
---
import { getCollection, render } from 'astro:content';
import BlogPostLayout from '../../layouts/BlogPostLayout.astro';

export async function getStaticPaths() {
  const posts = await getCollection('posts-en');
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}

const { post } = Astro.props;
const { Content } = await render(post);
---

<BlogPostLayout
  title={post.data.title}
  description={post.data.description}
  date={post.data.date}
  image={post.data.image || `/og/${post.id}.png`}
>
  <Content />
</BlogPostLayout>
```

`src/pages/es/blog/[slug].astro`: igual con `getCollection('posts')` y la ruta del layout `../../../layouts/BlogPostLayout.astro`.

En `src/pages/blog/index.astro` y `src/pages/es/blog/index.astro`: sustituir cada `post.slug` por `post.id`.

En `src/pages/index.astro` y `src/pages/es/index.astro`: sustituir `post.slug` por `post.id` (estas páginas se reescriben enteras en la Task 8; aquí solo se mantiene la build verde).

`src/pages/rss.xml.ts`: `link: \`/blog/${post.id}/\``.

`src/pages/og/[slug].png.ts`: `params: { slug: post.id }`.

- [ ] **Step 6: Build**

Run: `npm run build`
Expected: build completa. Comprobar que `dist/blog/` contiene las cinco carpetas de posts en inglés y `dist/es/blog/` las cinco en español.

- [ ] **Step 7: Commit**

```bash
git add -A src/content.config.ts src/content/config.ts src/pages tests/schemas.test.ts
git commit -m "refactor(content): move posts to the Astro 5 content layer"
```

---

### Task 4: Colección `projects` bilingüe y helpers

**Files:**

- Create: `src/lib/projects.ts`, `tests/projects.test.ts`, `src/content/projects/en/{bito,quedamos,huellas,basecero,pokeutils,create-astro-blog,devtools,swiss-knife}.md` y los mismos en `src/content/projects/es/`
- Modify: `src/content.config.ts`, `tests/schemas.test.ts`
- Delete: `src/content/projects/*.md` antiguos, `src/data/projects.ts`, `src/components/ProjectCard.astro`

**Interfaces:**

- Produces: `projectSchema` y colección `projects` con `glob({ pattern: '**/*.md', base: './src/content/projects' })`. El `id` de cada entrada es `en/bito` o `es/bito`.
- Produces: en `src/lib/projects.ts`:
  - `type ProjectEntry = CollectionEntry<'projects'>`
  - `projectSlug(entry): string` devuelve `bito` a partir de `en/bito`.
  - `projectLang(entry): Locale`.
  - `sortProjects(entries): entries` por `order` ascendente.
  - `getProjects(lang): Promise<ProjectEntry[]>` visibles y ordenados.
  - `getFeaturedProjects(lang): Promise<ProjectEntry[]>` con `tier === 'featured'`.
  - `getLabProjects(lang): Promise<ProjectEntry[]>` con `tier === 'lab'`.

- [ ] **Step 1: Añadir el esquema a `src/content.config.ts`**

```ts
export const projectSchema = z.object({
  name: z.string(),
  tagline: z.string(),
  status: z.enum(['published', 'beta', 'development', 'design', 'archived']),
  tier: z.enum(['featured', 'lab']),
  order: z.number(),
  visible: z.boolean().default(true),
  repo: z.url().optional(),
  url: z.url().optional(),
  license: z.string().optional(),
  stack: z.array(z.string()).default([]),
  platform: z.string().optional(),
  icon: z.string().optional(),
  hero: z.string().optional(),
  gallery: z.array(z.string()).default([]),
  playground: z.object({ kind: z.enum(['pwa', 'iframe', 'video']), src: z.string() }).optional(),
  changelog: z
    .array(z.object({ version: z.string(), date: z.string().optional(), note: z.string() }))
    .default([]),
  githubRepo: z.string().optional(),
  mock: z.boolean().default(false),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: projectSchema,
});
```

Y añadir `projects` al objeto `collections`.

- [ ] **Step 2: Escribir tests (fallan)**

Añadir a `tests/schemas.test.ts`:

```ts
import { projectSchema } from '../src/content.config';

describe('projectSchema', () => {
  it('defaults visible, stack, gallery and changelog', () => {
    const p = projectSchema.parse({
      name: 'Bito',
      tagline: 'Habits',
      status: 'published',
      tier: 'featured',
      order: 1,
    });
    expect(p.visible).toBe(true);
    expect(p.stack).toEqual([]);
    expect(p.gallery).toEqual([]);
    expect(p.changelog).toEqual([]);
  });

  it('rejects an unknown status', () => {
    expect(() =>
      projectSchema.parse({ name: 'x', tagline: 'y', status: 'live', tier: 'lab', order: 1 }),
    ).toThrow();
  });
});
```

`tests/projects.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { projectSlug, projectLang, sortProjects } from '../src/lib/projects';

const entry = (id: string, order: number) =>
  ({ id, data: { order } }) as unknown as Parameters<typeof sortProjects>[0][number];

describe('projects helpers', () => {
  it('extracts slug and lang from the id', () => {
    expect(projectSlug(entry('en/bito', 1))).toBe('bito');
    expect(projectLang(entry('es/bito', 1))).toBe('es');
    expect(projectLang(entry('en/bito', 1))).toBe('en');
  });

  it('sorts by order ascending without mutating', () => {
    const list = [entry('en/b', 3), entry('en/a', 1), entry('en/c', 2)];
    const sorted = sortProjects(list);
    expect(sorted.map((e) => e.id)).toEqual(['en/a', 'en/c', 'en/b']);
    expect(list[0].id).toBe('en/b');
  });
});
```

- [ ] **Step 3: Ejecutar y ver que fallan**

Run: `npx vitest run tests/projects.test.ts tests/schemas.test.ts`
Expected: FAIL en `projects.test.ts` (módulo inexistente) y en el `describe` nuevo de `schemas.test.ts` (import inexistente).

- [ ] **Step 4: Crear `src/lib/projects.ts`**

```ts
import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from '../i18n/translations';

export type ProjectEntry = CollectionEntry<'projects'>;

export function projectSlug(entry: ProjectEntry): string {
  return entry.id.split('/').pop() ?? entry.id;
}

export function projectLang(entry: ProjectEntry): Locale {
  return entry.id.startsWith('es/') ? 'es' : 'en';
}

export function sortProjects(entries: ProjectEntry[]): ProjectEntry[] {
  return [...entries].sort((a, b) => a.data.order - b.data.order);
}

export async function getProjects(lang: Locale): Promise<ProjectEntry[]> {
  const all = await getCollection('projects', (e) => projectLang(e) === lang && e.data.visible);
  return sortProjects(all);
}

export async function getFeaturedProjects(lang: Locale): Promise<ProjectEntry[]> {
  return (await getProjects(lang)).filter((e) => e.data.tier === 'featured');
}

export async function getLabProjects(lang: Locale): Promise<ProjectEntry[]> {
  return (await getProjects(lang)).filter((e) => e.data.tier === 'lab');
}
```

- [ ] **Step 5: Crear los ficheros de proyectos**

Borrar los antiguos y el fichero TypeScript:

```bash
git rm src/content/projects/*.md src/data/projects.ts src/components/ProjectCard.astro
mkdir -p src/content/projects/en src/content/projects/es
```

`src/content/projects/en/bito.md`:

```md
---
name: Bito
tagline: Log a habit in one tap, without accounts or cloud.
status: published
tier: featured
order: 1
repo: https://github.com/alvarotorresc/bito
url: https://bito.alvarotc.com
license: GPL-3.0
platform: Android 10+
stack: [Android, Offline-first, React, Capacitor, SQLite]
githubRepo: alvarotorresc/bito
changelog:
  - { version: 'v2.0.0', note: 'Habi companion, store listings, home screen widget. Coming.' }
  - { version: 'v1.0.0', note: 'First public release. One-tap logging, streaks, export to file.' }
  - { version: 'v0.1.0', note: 'The 24 hour prototype.' }
---

Every habit tracker I tried asked for an account, then a subscription, then my data. Bito asks for one tap. It stores everything on the phone, exports to a plain file, and does not phone home.

I built the first version in a day to prove the idea, and wrote about it. The second version adds Habi, a small companion that nudges without nagging, and is the one going to the stores.
```

`src/content/projects/es/bito.md`:

```md
---
name: Bito
tagline: Registra un hábito en un toque, sin cuentas ni nube.
status: published
tier: featured
order: 1
repo: https://github.com/alvarotorresc/bito
url: https://bito.alvarotc.com
license: GPL-3.0
platform: Android 10+
stack: [Android, Offline-first, React, Capacitor, SQLite]
githubRepo: alvarotorresc/bito
changelog:
  - { version: 'v2.0.0', note: 'Habi como compañera, fichas de tienda, widget. En camino.' }
  - {
      version: 'v1.0.0',
      note: 'Primera versión pública. Registro en un toque, rachas, exportar a fichero.',
    }
  - { version: 'v0.1.0', note: 'El prototipo de 24 horas.' }
---

Todas las apps de hábitos que probé pedían una cuenta, luego una suscripción, luego mis datos. Bito pide un toque. Guarda todo en el móvil, exporta a un fichero plano y no llama a casa.

Hice la primera versión en un día para probar la idea, y lo conté. La segunda añade a Habi, una compañera que anima sin dar la lata, y es la que va a las tiendas.
```

`src/content/projects/en/quedamos.md`:

```md
---
name: Quedamos
tagline: Coordinate meetups with your group, shared availability, plans and votes.
status: beta
tier: featured
order: 2
repo: https://github.com/alvarotorresc/quedamos-app
url: https://quedamos.alvarotc.com
license: AGPL-3.0
hero: /projects/quedamos.png
stack: [React, Ionic, Capacitor, NestJS, Prisma, Supabase]
githubRepo: alvarotorresc/quedamos-app
---

Mobile app plus API to organise plans with a group: shared availability, proposals, votes, push notifications and real-time updates. Private beta with a group of friends.
```

`src/content/projects/es/quedamos.md`:

```md
---
name: Quedamos
tagline: Coordina quedadas con tu grupo, disponibilidad compartida, planes y votaciones.
status: beta
tier: featured
order: 2
repo: https://github.com/alvarotorresc/quedamos-app
url: https://quedamos.alvarotc.com
license: AGPL-3.0
hero: /projects/quedamos.png
stack: [React, Ionic, Capacitor, NestJS, Prisma, Supabase]
githubRepo: alvarotorresc/quedamos-app
---

App móvil más API para organizar planes con un grupo: disponibilidad compartida, propuestas, votaciones, notificaciones push y actualizaciones en tiempo real. Beta privada con un grupo de amigos.
```

`src/content/projects/en/huellas.md`:

```md
---
name: Huellas
tagline: A platform to reunite lost pets with their families.
status: design
tier: featured
order: 3
repo: https://github.com/alvarotorresc/huellas
license: AGPL-3.0
stack: [Next.js, Expo, NestJS, PostGIS]
githubRepo: alvarotorresc/huellas
---

Profiles, alerts, sightings on a map, notifications by area. Building it in public, definition and design documents open.
```

`src/content/projects/es/huellas.md`:

```md
---
name: Huellas
tagline: Una plataforma para reunir mascotas perdidas con sus familias.
status: design
tier: featured
order: 3
repo: https://github.com/alvarotorresc/huellas
license: AGPL-3.0
stack: [Next.js, Expo, NestJS, PostGIS]
githubRepo: alvarotorresc/huellas
---

Perfiles, avisos, avistamientos en un mapa, notificaciones por zona. Construido en público, con los documentos de definición y diseño abiertos.
```

`src/content/projects/en/basecero.md`:

```md
---
name: BaseCero
tagline: Your money, from scratch. Personal finance that lives entirely on your device.
status: published
tier: lab
order: 4
repo: https://github.com/alvarotorresc/basecero
url: https://basecero.alvarotc.com
license: GPL-3.0
stack: [Local-first, TypeScript]
githubRepo: alvarotorresc/basecero
---

Local-first personal finance. No server, no account, plain file export.
```

`src/content/projects/es/basecero.md`:

```md
---
name: BaseCero
tagline: Tu dinero, desde cero. Finanzas personales que viven enteras en tu dispositivo.
status: published
tier: lab
order: 4
repo: https://github.com/alvarotorresc/basecero
url: https://basecero.alvarotc.com
license: GPL-3.0
stack: [Local-first, TypeScript]
githubRepo: alvarotorresc/basecero
---

Finanzas personales local-first. Sin servidor, sin cuenta, exportación a fichero plano.
```

`src/content/projects/en/pokeutils.md`:

```md
---
name: PokeUtils
tagline: Your retro Pokémon guide, competitive analysis, breeding tools and a full Pokédex.
status: published
tier: lab
order: 5
repo: https://github.com/alvarotorresc/PokeUtils
url: https://pokeutils.alvarotc.com
hero: /projects/pokeutils.png
stack: [Vanilla JS, SPA]
githubRepo: alvarotorresc/PokeUtils
---

A vanilla JavaScript single-page app, no framework, built to learn the platform.
```

`src/content/projects/es/pokeutils.md`:

```md
---
name: PokeUtils
tagline: Tu guía Pokémon retro, análisis competitivo, crianza y Pokédex completa.
status: published
tier: lab
order: 5
repo: https://github.com/alvarotorresc/PokeUtils
url: https://pokeutils.alvarotc.com
hero: /projects/pokeutils.png
stack: [Vanilla JS, SPA]
githubRepo: alvarotorresc/PokeUtils
---

Una SPA en JavaScript sin framework, hecha para aprender la plataforma.
```

`src/content/projects/en/create-astro-blog.md`:

```md
---
name: create-astro-blog
tagline: Create a customizable Astro blog with one command.
status: published
tier: lab
order: 6
repo: https://github.com/alvarotorresc/create-astro-blog
url: https://www.npmjs.com/package/create-astro-blog
hero: /projects/create-astro-blog.png
stack: [Node, CLI, Astro]
githubRepo: alvarotorresc/create-astro-blog
---

An npm initializer that scaffolds an Astro blog with the choices already made.
```

`src/content/projects/es/create-astro-blog.md`:

```md
---
name: create-astro-blog
tagline: Crea un blog con Astro, personalizable, con un solo comando.
status: published
tier: lab
order: 6
repo: https://github.com/alvarotorresc/create-astro-blog
url: https://www.npmjs.com/package/create-astro-blog
hero: /projects/create-astro-blog.png
stack: [Node, CLI, Astro]
githubRepo: alvarotorresc/create-astro-blog
---

Un inicializador de npm que monta un blog con Astro con las decisiones ya tomadas.
```

Los dos ocultos, en ambos idiomas con `visible: false` y `tier: lab`: `devtools.md` (order 7, `repo: https://github.com/alvarotorresc/devtools`, `url: https://devtools.alvarotc.com`, tagline en "UUID generator, hash calculator, JWT decoder and more." / es "Generador de UUID, calculadora de hash, decodificador de JWT y más."), `swiss-knife.md` (order 8, `repo: https://github.com/alvarotorresc/swiss-knife`, tagline en "Randomizer, wheel, secret santa and more utilities." / es "Randomizador, ruleta, amigo invisible y más utilidades."). Cuerpo: una frase.

- [ ] **Step 6: Actualizar las páginas que usaban el fichero antiguo**

`src/pages/projects.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Tag from '../components/ui/Tag.astro';
import { getProjects, projectSlug } from '../lib/projects';
import { t, statusLabel } from '../i18n/translations';

const lang = 'en';
const projects = await getProjects(lang);
---

<BaseLayout title={t('projects.title', lang)} lang={lang}>
  <div class="container-page py-14">
    <h1 class="mb-8 text-3xl font-extrabold tracking-tight">{t('projects.title', lang)}</h1>
    <ul class="grid gap-4 md:grid-cols-2">
      {
        projects.map((p) => (
          <li class="card flex flex-col gap-2 p-5">
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-bold">{p.data.name}</h2>
              <Tag>{statusLabel(p.data.status, lang)}</Tag>
            </div>
            <p class="text-sm text-muted">{p.data.tagline}</p>
            <div class="mt-auto flex gap-4 pt-2 text-[13px] font-semibold text-accent">
              <a href={`/projects/${projectSlug(p)}`}>{t('projects.caseStudy', lang)}</a>
              {p.data.url && <a href={p.data.url}>{t('projects.live', lang)}</a>}
              {p.data.repo && <a href={p.data.repo}>{t('projects.repo', lang)}</a>}
            </div>
          </li>
        ))
      }
    </ul>
  </div>
</BaseLayout>
```

`src/pages/es/projects.astro`: igual con `lang = 'es'`, rutas de import con `../../` y enlaces `/es/projects/...`.

Crear `src/components/ui/Tag.astro`:

```astro
---
interface Props {
  tone?: 'neutral' | 'ok' | 'warn';
  class?: string;
}
const { tone = 'neutral', class: className = '' } = Astro.props;
const tones = {
  neutral: 'bg-surface-2 text-muted',
  ok: 'bg-ok/15 text-ok',
  warn: 'bg-amber-500/15 text-amber-600 dark:text-amber-300',
};
---

<span class={`rounded-md px-2 py-0.5 text-[11px] font-bold ${tones[tone]} ${className}`}
  ><slot /></span
>
```

En `src/pages/index.astro` y `src/pages/es/index.astro` eliminar el import de `getFeaturedProjects` desde `../data/projects` y de `ProjectCard`, y sustituir la sección de proyectos por un `<p>` temporal. Se reescriben enteras en la Task 8.

Nota: `/projects/[slug]` no existe hasta el plan B; los enlaces "Case study" apuntan a un 404 conocido hasta entonces.

- [ ] **Step 7: Ejecutar tests y build**

Run: `npx vitest run && npm run build`
Expected: todos los tests PASS y build completa.

- [ ] **Step 8: Commit**

```bash
git add -A src/content src/lib/projects.ts src/pages src/components tests src/data
git commit -m "feat(content): bilingual projects collection replaces the TypeScript list"
```

---

### Task 5: Colecciones `experience`, `now` e `interests`

**Files:**

- Create: `src/lib/experience.ts`, `tests/experience.test.ts`, `src/content/experience/{2024-nortia,2022-bluemar,2021-kestrel,2017-degree}.yaml`, `src/content/now/now.yaml`, `src/content/interests/{guitar,chess,boxing}.yaml`
- Modify: `src/content.config.ts`

**Interfaces:**

- Produces: esquemas `experienceSchema`, `nowSchema`, `interestSchema` y colecciones `experience`, `now`, `interests`.
- Produces: en `src/lib/experience.ts`:
  - `formatPeriod(start: string, end: string | undefined, lang: Locale): string` devuelve `2024, now` / `2024, actualidad` o `2022, 2024`.
  - `sortExperience(entries)`: por `start` descendente.
  - `getExperience(): Promise<CollectionEntry<'experience'>[]>` ordenada.
  - `isCurrent(entry): boolean`.

- [ ] **Step 1: Escribir el test (falla)**

`tests/experience.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { formatPeriod, sortExperience } from '../src/lib/experience';

const entry = (id: string, start: string) =>
  ({ id, data: { start } }) as unknown as Parameters<typeof sortExperience>[0][number];

describe('formatPeriod', () => {
  it('shows only years', () => {
    expect(formatPeriod('2022-03', '2024-06', 'en')).toBe('2022, 2024');
  });
  it('uses now when there is no end', () => {
    expect(formatPeriod('2024-07', undefined, 'en')).toBe('2024, now');
    expect(formatPeriod('2024-07', undefined, 'es')).toBe('2024, actualidad');
  });
  it('collapses same year', () => {
    expect(formatPeriod('2021-01', '2021-11', 'en')).toBe('2021');
  });
});

describe('sortExperience', () => {
  it('sorts newest first', () => {
    const list = [entry('a', '2017-09'), entry('b', '2024-07'), entry('c', '2022-03')];
    expect(sortExperience(list).map((e) => e.id)).toEqual(['b', 'c', 'a']);
  });
});
```

- [ ] **Step 2: Ejecutar y ver que falla**

Run: `npx vitest run tests/experience.test.ts`
Expected: FAIL, módulo inexistente.

- [ ] **Step 3: Añadir esquemas y colecciones a `src/content.config.ts`**

```ts
const localized = z.object({ en: z.string(), es: z.string() });
const localizedList = z.object({ en: z.array(z.string()), es: z.array(z.string()) });

export const experienceSchema = z.object({
  kind: z.enum(['work', 'education', 'certification']),
  company: z.string(),
  role: localized,
  location: z.string().optional(),
  start: z.string().regex(/^\d{4}-\d{2}$/),
  end: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .optional(),
  summary: localized,
  highlights: localizedList.optional(),
  stack: z.array(z.string()).default([]),
  url: z.url().optional(),
  mock: z.boolean().default(false),
});

export const nowSchema = z.object({
  reading: z.object({
    title: z.string(),
    author: z.string(),
    progress: z.number().min(0).max(100),
    cover: z.string().optional(),
  }),
  dailyDriver: z.object({
    distro: z.string(),
    kernel: z.string().optional(),
    selfHosted: z.array(z.string()).default([]),
  }),
  building: z.object({ project: z.string() }),
  listenbrainzUser: z.string().optional(),
  mock: z.boolean().default(false),
});

export const interestSchema = z.object({
  icon: z.enum(['guitar', 'chess', 'boxing', 'book', 'music']),
  order: z.number(),
  title: localized,
  text: localized,
  mock: z.boolean().default(false),
});

const experience = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/experience' }),
  schema: experienceSchema,
});

const now = defineCollection({
  loader: glob({ pattern: 'now.yaml', base: './src/content/now' }),
  schema: nowSchema,
});

const interests = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/interests' }),
  schema: interestSchema,
});
```

Añadir `experience`, `now`, `interests` a `collections`.

- [ ] **Step 4: Crear `src/lib/experience.ts`**

```ts
import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from '../i18n/translations';
import { t } from '../i18n/translations';

export type ExperienceEntry = CollectionEntry<'experience'>;

export function formatPeriod(start: string, end: string | undefined, lang: Locale): string {
  const startYear = start.slice(0, 4);
  if (!end) return `${startYear}, ${t('experience.now', lang)}`;
  const endYear = end.slice(0, 4);
  return startYear === endYear ? startYear : `${startYear}, ${endYear}`;
}

export function isCurrent(entry: ExperienceEntry): boolean {
  return !entry.data.end;
}

export function sortExperience(entries: ExperienceEntry[]): ExperienceEntry[] {
  return [...entries].sort((a, b) => (a.data.start < b.data.start ? 1 : -1));
}

export async function getExperience(): Promise<ExperienceEntry[]> {
  return sortExperience(await getCollection('experience'));
}
```

- [ ] **Step 5: Ejecutar y ver que pasa**

Run: `npx vitest run tests/experience.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 6: Crear el contenido de ejemplo**

`src/content/experience/2024-nortia.yaml`:

```yaml
kind: work
company: Nortia Software
role: { en: Backend Engineer, es: Ingeniero backend }
location: Remote, Spain
start: '2024-07'
summary:
  en: Own the payments and notifications services of a B2B platform. NestJS, PostgreSQL, Redis queues, Docker on Hetzner. Cut p95 latency of the main API by 40 percent.
  es: Responsable de los servicios de pagos y notificaciones de una plataforma B2B. NestJS, PostgreSQL, colas en Redis, Docker en Hetzner. Reduje la latencia p95 de la API principal un 40 por ciento.
stack: [TypeScript, NestJS, PostgreSQL, Redis, Docker]
mock: true
```

`src/content/experience/2022-bluemar.yaml`:

```yaml
kind: work
company: Bluemar Logistics
role: { en: Software Developer, es: Desarrollador de software }
location: Madrid
start: '2022-03'
end: '2024-06'
summary:
  en: Built the shipment tracking API and its carrier integrations. Node, TypeScript, Prisma. Introduced CI with GitHub Actions and containerised deploys.
  es: Construí la API de seguimiento de envíos y sus integraciones con transportistas. Node, TypeScript, Prisma. Introduje CI con GitHub Actions y despliegues en contenedores.
stack: [Node, TypeScript, Prisma, GitHub Actions]
mock: true
```

`src/content/experience/2021-kestrel.yaml`:

```yaml
kind: work
company: Kestrel Labs
role: { en: Junior Developer, es: Desarrollador junior }
location: Madrid
start: '2021-06'
end: '2022-02'
summary:
  en: Internal tools and a React admin panel. First production incidents, first on-call, first migrations.
  es: Herramientas internas y un panel de administración en React. Primeros incidentes en producción, primera guardia, primeras migraciones.
stack: [React, Node, PostgreSQL]
mock: true
```

`src/content/experience/2017-degree.yaml`:

```yaml
kind: education
company: '[University]'
role: { en: BSc Computer Engineering, es: Grado en Ingeniería Informática }
start: '2017-09'
end: '2021-06'
summary:
  en: Final project on distributed systems.
  es: Trabajo de fin de grado sobre sistemas distribuidos.
mock: true
```

`src/content/now/now.yaml`:

```yaml
reading:
  title: Designing Data-Intensive Applications
  author: Martin Kleppmann
  progress: 62
dailyDriver:
  distro: Nobara Linux
  kernel: '7.1'
  selfHosted: [FreshRSS, Umami, Plane]
building:
  project: huellas
mock: true
```

`src/content/interests/guitar.yaml`:

```yaml
icon: guitar
order: 1
title: { en: Electric guitar, es: Guitarra eléctrica }
text:
  en: Mostly rock and blues, badly recorded on Linux with Ardour.
  es: Sobre todo rock y blues, mal grabado en Linux con Ardour.
mock: true
```

`src/content/interests/chess.yaml`:

```yaml
icon: chess
order: 2
title: { en: Chess, es: Ajedrez }
text:
  en: On Lichess, which is free software too. Always up for a game.
  es: En Lichess, que también es software libre. Siempre listo para una partida.
mock: true
```

`src/content/interests/boxing.yaml`:

```yaml
icon: boxing
order: 3
title: { en: Boxing, es: Boxeo }
text:
  en: A few sessions a week. The only place where I do not think about queues.
  es: Unas cuantas sesiones a la semana. El único sitio donde no pienso en colas.
mock: true
```

- [ ] **Step 7: Build**

Run: `npm run build`
Expected: build completa; `astro check` valida los YAML contra los esquemas. Si un YAML falla, el error dice el fichero y el campo.

- [ ] **Step 8: Commit**

```bash
git add src/content.config.ts src/lib/experience.ts src/content/experience src/content/now src/content/interests tests/experience.test.ts
git commit -m "feat(content): experience, now and interests collections with sample data"
```

---

### Task 6: Componentes de UI compartidos y Hero, About y Now

**Files:**

- Create: `src/components/ui/SectionHeading.astro`, `src/components/ui/Placeholder.astro`, `src/components/home/Hero.astro`, `src/components/home/About.astro`, `src/components/home/NowCards.astro`

**Interfaces:**

- Produces: `<SectionHeading id lang titleKey subtitle? link? linkLabel? />` que pinta el encabezado en la columna izquierda de un grid de 12 (span 3) y devuelve el contenido en el slot (span 9).
- Produces: `<Placeholder label class? />` caja discontinua etiquetada.
- Produces: `<Hero lang />`, `<About lang />`, `<NowCards lang />`. `NowCards` recibe además `listening?: { title: string; artist: string; art?: string }` y `lastCommit?: { message: string; repo: string; when: string }`, ambos opcionales hasta el plan C.

- [ ] **Step 1: Crear `src/components/ui/SectionHeading.astro`**

```astro
---
import { t, type Locale, translations } from '../../i18n/translations';

interface Props {
  id: string;
  lang: Locale;
  titleKey: keyof typeof translations.en;
  subtitle?: string;
  link?: string;
  linkLabel?: string;
}
const { id, lang, titleKey, subtitle, link, linkLabel } = Astro.props;
---

<section id={id} class="section container-page grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-x-6">
  <div class="flex flex-col gap-2 md:col-span-3">
    <h2 class="text-[22px] font-bold tracking-tight">{t(titleKey, lang)}</h2>
    {subtitle && <p class="text-sm leading-relaxed text-faint">{subtitle}</p>}
    {
      link && (
        <a href={link} class="text-sm font-semibold text-accent">
          {linkLabel}
        </a>
      )
    }
  </div>
  <div class="md:col-span-9">
    <slot />
  </div>
</section>
```

- [ ] **Step 2: Crear `src/components/ui/Placeholder.astro`**

```astro
---
interface Props {
  label: string;
  class?: string;
}
const { label, class: className = '' } = Astro.props;
---

<div class={`placeholder ${className}`} role="img" aria-label={label}>[{label}]</div>
```

- [ ] **Step 3: Crear `src/components/home/Hero.astro`**

```astro
---
import { t, type Locale } from '../../i18n/translations';
import { getSiteName } from '../../lib/config';

interface Props {
  lang: Locale;
}
const { lang } = Astro.props;
const prefix = lang === 'es' ? '/es' : '';
---

<header
  id="top"
  class="container-page flex flex-col items-start gap-6 py-14 md:flex-row md:items-center md:gap-8 md:py-20"
>
  <div
    class="hero-in flex h-[88px] w-[88px] shrink-0 items-center justify-center rounded-full bg-surface-2 text-2xl font-extrabold text-faint md:h-[104px] md:w-[104px]"
    aria-hidden="true"
  >
    AT
  </div>
  <div class="flex flex-col gap-4">
    <h1
      class="hero-in text-4xl font-extrabold tracking-[-0.03em] md:text-5xl"
      style="animation-delay: 60ms"
    >
      {getSiteName()}
    </h1>
    <p
      class="hero-in max-w-[640px] text-lg leading-relaxed text-muted md:text-[19px]"
      style="animation-delay: 120ms"
    >
      {t('hero.intro', lang)}
    </p>
    <div class="hero-in flex gap-3 pt-1" style="animation-delay: 180ms">
      <a href="#contact" class="btn-primary">{t('hero.contact', lang)}</a>
      <a href={`${prefix}/cv`} class="btn-secondary">{t('hero.cv', lang)}</a>
    </div>
  </div>
</header>

<style>
  @media (prefers-reduced-motion: no-preference) {
    .hero-in {
      animation: hero-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    @keyframes hero-in {
      from {
        opacity: 0;
        transform: translateY(12px);
      }
      to {
        opacity: 1;
        transform: none;
      }
    }
  }
</style>
```

- [ ] **Step 4: Crear `src/components/home/About.astro`**

```astro
---
import SectionHeading from '../ui/SectionHeading.astro';
import NowCards from './NowCards.astro';
import { t, type Locale } from '../../i18n/translations';

interface Props {
  lang: Locale;
}
const { lang } = Astro.props;
const prefix = lang === 'es' ? '/es' : '';

const paragraphs = {
  en: [
    'I build the parts of a product that nobody sees until they break: APIs, data models, queues, deploys. Lately I ship small apps end to end so I understand the whole thing, not just my slice.',
    'Everything I publish is free software and works without an account. I run Linux, self-host what I can, and treat your data as yours. Based in Spain, working in English and Spanish, open to backend and full-stack roles.',
  ],
  es: [
    'Construyo las partes de un producto que nadie ve hasta que fallan: APIs, modelos de datos, colas, despliegues. Últimamente publico apps pequeñas de principio a fin para entender el conjunto, no solo mi trozo.',
    'Todo lo que publico es software libre y funciona sin cuenta. Uso Linux, autoalojo lo que puedo y trato tus datos como tuyos. Vivo en España, trabajo en inglés y español, y estoy abierto a roles backend y full-stack.',
  ],
}[lang];

const tags = [
  'about.tag.foss',
  'about.tag.privacy',
  'about.tag.offline',
  'about.tag.selfhosted',
] as const;
---

<SectionHeading id="about" lang={lang} titleKey="about.title">
  <div class="flex flex-col gap-6">
    <div class="flex max-w-[720px] flex-col gap-3">
      {paragraphs.map((p) => <p class="text-[17px] leading-relaxed text-muted">{p}</p>)}
      <ul class="flex flex-wrap gap-2 pt-1">
        {
          tags.map((key) => (
            <li class="rounded-md bg-surface-2 px-2.5 py-1 text-xs font-bold text-muted">
              {t(key, lang)}
            </li>
          ))
        }
      </ul>
      <a href={`${prefix}/about`} class="text-sm font-semibold text-accent"
        >{t('about.more', lang)}</a
      >
    </div>
    <NowCards lang={lang} />
  </div>
</SectionHeading>
```

- [ ] **Step 5: Crear `src/components/home/NowCards.astro`**

```astro
---
import { getEntry } from 'astro:content';
import Icon from '../icons/Icon.astro';
import Placeholder from '../ui/Placeholder.astro';
import { t, type Locale } from '../../i18n/translations';

interface Props {
  lang: Locale;
  listening?: { title: string; artist: string; art?: string };
  lastCommit?: { message: string; repo: string; when: string };
}
const { lang, listening, lastCommit } = Astro.props;

const now = await getEntry('now', 'now');
if (!now) throw new Error('Missing src/content/now/now.yaml');
const { reading, dailyDriver, building } = now.data;
const project = await getEntry('projects', `${lang}/${building.project}`);
---

<ul class="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
  <li class="card-sm flex gap-3.5 p-3.5">
    {
      reading.cover ? (
        <img
          src={reading.cover}
          alt=""
          width="54"
          height="80"
          class="h-20 w-[54px] shrink-0 rounded object-cover"
        />
      ) : (
        <Placeholder label="cover" class="h-20 w-[54px] shrink-0 !p-1 !text-[9px]" />
      )
    }
    <div class="flex flex-col justify-center gap-1">
      <span class="text-[11px] font-bold text-faint">{t('now.reading', lang)}</span>
      <span class="text-[13px] font-bold leading-snug">{reading.title}</span>
      <span class="text-xs text-muted">{reading.author}</span>
      <span
        class="h-[3px] w-full overflow-hidden rounded-sm bg-surface-2"
        aria-label={`${reading.progress}%`}
      >
        <span class="block h-full bg-accent" style={`width: ${reading.progress}%`}></span>
      </span>
    </div>
  </li>

  <li class="card-sm flex gap-3.5 p-3.5">
    <div
      class="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-lg bg-surface-2"
    >
      <Icon name="tux" size={30} strokeWidth={1.6} />
    </div>
    <div class="flex flex-col justify-center gap-1">
      <span class="text-[11px] font-bold text-faint">{t('now.driver', lang)}</span>
      <span class="text-[13px] font-bold leading-snug">
        {dailyDriver.distro}{dailyDriver.kernel && `, kernel ${dailyDriver.kernel}`}
      </span>
      {
        dailyDriver.selfHosted.length > 0 && (
          <span class="text-xs text-muted">Self-hosted: {dailyDriver.selfHosted.join(', ')}</span>
        )
      }
    </div>
  </li>

  <li class="card-sm flex gap-3.5 p-3.5">
    {
      listening?.art ? (
        <img
          src={listening.art}
          alt=""
          width="54"
          height="54"
          class="h-[54px] w-[54px] shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div class="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-lg bg-surface-2">
          <Icon name="music" size={22} />
        </div>
      )
    }
    <div class="flex flex-col justify-center gap-1">
      <span class="text-[11px] font-bold text-ok">{t('now.listening', lang)}</span>
      <span class="text-[13px] font-bold leading-snug">{listening?.title ?? '[track title]'}</span>
      <span class="text-xs text-muted">{listening?.artist ?? '[artist]'}, {t('now.via', lang)}</span
      >
    </div>
  </li>

  <li class="card-sm flex gap-3.5 p-3.5">
    {
      project?.data.icon ? (
        <img
          src={project.data.icon}
          alt=""
          width="54"
          height="54"
          class="h-[54px] w-[54px] shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div class="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-lg bg-surface-2">
          <Icon name="hammer" size={22} />
        </div>
      )
    }
    <div class="flex flex-col justify-center gap-1">
      <span class="text-[11px] font-bold text-faint">{t('now.building', lang)}</span>
      <span class="text-[13px] font-bold leading-snug"
        >{project?.data.name ?? building.project}</span
      >
      <span class="font-mono text-xs text-muted">
        {lastCommit ? `${lastCommit.message}, ${lastCommit.when}` : (project?.data.tagline ?? '')}
      </span>
    </div>
  </li>
</ul>
```

- [ ] **Step 6: Comprobar con `astro check`**

Run: `npx astro check`
Expected: sin errores. (Estos componentes aún no se usan en ninguna página; el check los tipa igualmente.)

- [ ] **Step 7: Commit**

```bash
git add src/components/ui src/components/home
git commit -m "feat(home): hero, about and now cards"
```

---

### Task 7: Proyectos, experiencia, escritos, stack, off the clock y contacto

**Files:**

- Create: `src/components/home/ProjectBento.astro`, `src/components/home/ExperienceTimeline.astro`, `src/components/home/WritingList.astro`, `src/components/home/StackStats.astro`, `src/components/home/OffClock.astro`, `src/components/home/ContactSection.astro`

**Interfaces:**

- Consumes: `getFeaturedProjects`, `getLabProjects`, `projectSlug` (Task 4); `getExperience`, `formatPeriod`, `isCurrent` (Task 5); `SectionHeading`, `Placeholder`, `Tag`, `Icon`.
- Produces: `<ProjectBento lang />`, `<ExperienceTimeline lang />`, `<WritingList lang posts />` donde `posts` es la lista ya ordenada de `CollectionEntry<'posts' | 'posts-en'>`, `<StackStats lang stats? />` con `stats?: { commits?: number; posts: number; apps: number }`, `<OffClock lang />`, `<ContactSection lang />`.

- [ ] **Step 1: Crear `src/components/home/ProjectBento.astro`**

```astro
---
import Placeholder from '../ui/Placeholder.astro';
import Tag from '../ui/Tag.astro';
import { t, statusLabel, type Locale } from '../../i18n/translations';
import { getFeaturedProjects, getLabProjects, projectSlug } from '../../lib/projects';

interface Props {
  lang: Locale;
}
const { lang } = Astro.props;
const prefix = lang === 'es' ? '/es' : '';

const [big, mid, band] = await getFeaturedProjects(lang);
const lab = await getLabProjects(lang);

const tone = (status: string) =>
  status === 'published' ? 'ok' : status === 'beta' ? 'warn' : 'neutral';
const href = (p: NonNullable<typeof big>) => `${prefix}/projects/${projectSlug(p)}`;
---

<section id="projects" class="section container-page flex flex-col gap-6">
  <div class="flex items-baseline justify-between">
    <h2 class="text-[22px] font-bold tracking-tight">{t('projects.title', lang)}</h2>
    <a href={`${prefix}/projects`} class="text-sm font-semibold text-accent"
      >{t('projects.all', lang)}</a
    >
  </div>

  <div class="grid grid-cols-1 gap-5 md:grid-cols-12">
    {
      big && (
        <a
          href={href(big)}
          class="card flex flex-col gap-4 border-accent/30 bg-accent/5 p-5 md:col-span-8"
        >
          {big.data.hero ? (
            <img
              src={big.data.hero}
              alt={big.data.name}
              class="aspect-video w-full rounded-[10px] object-cover"
            />
          ) : (
            <Placeholder
              label={`${big.data.name} product shot or promo video, 16:9`}
              class="aspect-video w-full"
            />
          )}
          <div class="flex flex-col justify-between gap-4 sm:flex-row">
            <div class="flex flex-col gap-2">
              <div class="flex items-center gap-2.5">
                <h3 class="text-2xl font-extrabold tracking-tight">{big.data.name}</h3>
                <Tag tone={tone(big.data.status)}>{statusLabel(big.data.status, lang)}</Tag>
              </div>
              <p class="max-w-[520px] text-sm leading-relaxed text-muted">{big.data.tagline}</p>
            </div>
            <ul class="flex shrink-0 gap-2 font-mono text-xs text-accent sm:flex-col sm:items-end sm:gap-1.5">
              {big.data.stack.slice(0, 3).map((s) => (
                <li>{s}</li>
              ))}
            </ul>
          </div>
        </a>
      )
    }

    {
      mid && (
        <a href={href(mid)} class="card flex flex-col gap-3 p-5 md:col-span-4">
          {mid.data.hero ? (
            <img
              src={mid.data.hero}
              alt={mid.data.name}
              class="h-[200px] w-full rounded-[10px] object-cover"
            />
          ) : (
            <Placeholder label={`${mid.data.name} screenshot`} class="h-[200px]" />
          )}
          <div class="flex items-center gap-2.5">
            <h3 class="text-xl font-extrabold tracking-tight">{mid.data.name}</h3>
            <Tag tone={tone(mid.data.status)}>{statusLabel(mid.data.status, lang)}</Tag>
          </div>
          <p class="text-sm leading-relaxed text-muted">{mid.data.tagline}</p>
          <span class="mt-auto font-mono text-xs text-faint">
            {mid.data.stack.slice(0, 4).join(', ')}
          </span>
        </a>
      )
    }

    {
      band && (
        <a
          href={href(band)}
          class="card grid grid-cols-1 items-center gap-6 p-5 md:col-span-12 md:grid-cols-[minmax(0,1fr)_340px]"
        >
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2.5">
              <h3 class="text-xl font-extrabold tracking-tight">{band.data.name}</h3>
              <Tag tone={tone(band.data.status)}>{statusLabel(band.data.status, lang)}</Tag>
            </div>
            <p class="max-w-[620px] text-sm leading-relaxed text-muted">{band.data.tagline}</p>
            <span class="font-mono text-xs text-faint">{band.data.stack.join(', ')}</span>
          </div>
          {band.data.hero ? (
            <img
              src={band.data.hero}
              alt={band.data.name}
              class="h-[120px] w-full rounded-[10px] object-cover"
            />
          ) : (
            <Placeholder label={`${band.data.name} concept`} class="h-[120px]" />
          )}
        </a>
      )
    }
  </div>

  {
    lab.length > 0 && (
      <p class="text-sm text-faint">
        {t('projects.also', lang)}:{' '}
        {lab.map((p, i) => (
          <>
            <a href={href(p)} class="hover:text-text">
              {p.data.name}
            </a>
            {i < lab.length - 1 && ', '}
          </>
        ))}
      </p>
    )
  }
</section>
```

- [ ] **Step 2: Crear `src/components/home/ExperienceTimeline.astro`**

Versión estática; el plan B la convierte en isla con progreso al hacer scroll.

```astro
---
import SectionHeading from '../ui/SectionHeading.astro';
import { t, type Locale } from '../../i18n/translations';
import { getExperience, formatPeriod, isCurrent } from '../../lib/experience';

interface Props {
  lang: Locale;
}
const { lang } = Astro.props;
const prefix = lang === 'es' ? '/es' : '';
const entries = await getExperience();
---

<SectionHeading
  id="experience"
  lang={lang}
  titleKey="experience.title"
  link={`${prefix}/cv`}
  linkLabel={t('experience.cv', lang)}
>
  <ol class="grid grid-cols-[28px_minmax(0,1fr)] gap-x-4 md:grid-cols-[120px_28px_minmax(0,1fr)]">
    {
      entries.map((e, i) => {
        const current = isCurrent(e);
        const last = i === entries.length - 1;
        return (
          <li class="contents">
            <span
              class:list={[
                'col-span-2 pb-1 font-mono text-[13px] md:col-span-1 md:pb-10',
                current ? 'text-accent' : 'text-faint',
              ]}
            >
              {formatPeriod(e.data.start, e.data.end, lang)}
            </span>
            <span class="flex flex-col items-center" aria-hidden="true">
              <span
                class:list={[
                  'h-3 w-3 rounded-full',
                  current
                    ? 'bg-accent ring-4 ring-accent/25'
                    : i < 2
                      ? 'bg-accent'
                      : 'bg-surface-2',
                ]}
              />
              {!last && (
                <span class:list={['w-0.5 flex-1', i < 1 ? 'bg-accent' : 'bg-surface-2']} />
              )}
            </span>
            <article class:list={['flex flex-col gap-1.5', !last && 'pb-10']}>
              <h3 class:list={['text-[17px] font-bold', !current && i >= 2 && 'text-muted']}>
                {e.data.role[lang]}, {e.data.company}
              </h3>
              <p class="max-w-[640px] text-sm leading-relaxed text-muted">{e.data.summary[lang]}</p>
            </article>
          </li>
        );
      })
    }
  </ol>
</SectionHeading>
```

- [ ] **Step 3: Crear `src/components/home/WritingList.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
import Placeholder from '../ui/Placeholder.astro';
import { t, type Locale } from '../../i18n/translations';
import { formatDate, getReadingTime } from '../../lib/utils';

interface Props {
  lang: Locale;
  posts: Array<CollectionEntry<'posts'> | CollectionEntry<'posts-en'>>;
}
const { lang, posts } = Astro.props;
const prefix = lang === 'es' ? '/es' : '';
const [latest, ...rest] = posts;
const minutes = (p: (typeof posts)[number]) => getReadingTime(p.body ?? p.data.description);
---

<section id="writing" class="section container-page flex flex-col gap-5">
  <div class="flex items-baseline justify-between">
    <h2 class="text-[22px] font-bold tracking-tight">{t('writing.title', lang)}</h2>
    <a href={`${prefix}/blog`} class="text-sm font-semibold text-accent">{t('writing.all', lang)}</a
    >
  </div>

  <div class="grid grid-cols-1 gap-5 md:grid-cols-12">
    {
      latest && (
        <a href={`${prefix}/blog/${latest.id}`} class="card flex flex-col gap-3 p-6 md:col-span-7">
          {latest.data.image ? (
            <img
              src={latest.data.image}
              alt=""
              class="h-[200px] w-full rounded-[10px] object-cover"
            />
          ) : (
            <img
              src={`/og/${latest.id}.png`}
              alt=""
              class="h-[200px] w-full rounded-[10px] object-cover"
              loading="lazy"
            />
          )}
          <span class="font-mono text-[13px] text-accent">
            {t('writing.latest', lang)}, {formatDate(latest.data.date, lang)}, {minutes(latest)}{' '}
            {t('writing.minRead', lang)}
          </span>
          <h3 class="text-2xl font-extrabold leading-tight tracking-tight">{latest.data.title}</h3>
          <p class="text-sm leading-relaxed text-muted">{latest.data.description}</p>
        </a>
      )
    }
    <ul class="flex flex-col md:col-span-5">
      {
        rest.slice(0, 3).map((p, i) => (
          <li class:list={['border-t border-border', i === 2 && 'border-b']}>
            <a href={`${prefix}/blog/${p.id}`} class="flex flex-col gap-1.5 py-4">
              <span class="font-mono text-xs text-faint">
                {formatDate(p.data.date, lang)}, {minutes(p)} {t('writing.minRead', lang)}
              </span>
              <span class="text-base font-bold leading-snug">{p.data.title}</span>
            </a>
          </li>
        ))
      }
    </ul>
  </div>
</section>
```

Si `latest` no tiene ni `image` ni OG, `Placeholder` queda importado sin uso y ESLint no se queja en `.astro`; puede eliminarse el import.

- [ ] **Step 4: Crear `src/components/home/StackStats.astro`**

```astro
---
import { t, type Locale } from '../../i18n/translations';

interface Props {
  lang: Locale;
  stats?: { commits?: number; posts: number; apps: number };
}
const { lang, stats } = Astro.props;
const prefix = lang === 'es' ? '/es' : '';

const groups = [
  { label: 'Backend', items: ['TypeScript, Node', 'NestJS, PostgreSQL', 'Prisma, Redis'] },
  { label: 'Infra', items: ['Linux, Docker, Caddy', 'Hetzner, Cloudflare', 'GitHub Actions'] },
  { label: 'Frontend', items: ['React, Astro', 'Tailwind', 'Capacitor'] },
  {
    label: lang === 'es' ? 'Servicios' : 'Services',
    items: ['Supabase, Vercel', 'Firebase Cloud Messaging', 'Umami'],
  },
];

const counters = [
  { value: stats?.commits ?? '[n]', label: t('stats.commits', lang) },
  { value: stats?.posts ?? '[n]', label: t('stats.posts', lang) },
  { value: stats?.apps ?? '[n]', label: t('stats.apps', lang) },
];
---

<section id="stats" class="section container-page grid grid-cols-1 gap-10 md:grid-cols-2">
  <div class="flex flex-col gap-4">
    <h2 class="text-[22px] font-bold tracking-tight">{t('stack.title', lang)}</h2>
    <dl class="grid grid-cols-2 gap-4">
      {
        groups.map((g) => (
          <div class="flex flex-col gap-1.5">
            <dt class="text-xs font-bold text-faint">{g.label}</dt>
            <dd class="text-sm leading-relaxed text-muted">
              {g.items.map((line) => (
                <span class="block">{line}</span>
              ))}
            </dd>
          </div>
        ))
      }
    </dl>
  </div>
  <div class="flex flex-col gap-4">
    <h2 class="text-[22px] font-bold tracking-tight">{t('stats.title', lang)}</h2>
    <ul class="grid grid-cols-3 gap-3">
      {
        counters.map((c) => (
          <li class="card-sm flex flex-col gap-1 p-4">
            <span class="font-mono text-[26px] font-extrabold">{c.value}</span>
            <span class="text-xs text-faint">{c.label}</span>
          </li>
        ))
      }
    </ul>
    <a href={`${prefix}/stats`} class="text-sm font-semibold text-accent">{t('stats.full', lang)}</a
    >
  </div>
</section>
```

- [ ] **Step 5: Crear `src/components/home/OffClock.astro`**

```astro
---
import { getCollection } from 'astro:content';
import SectionHeading from '../ui/SectionHeading.astro';
import Icon from '../icons/Icon.astro';
import { t, type Locale } from '../../i18n/translations';

interface Props {
  lang: Locale;
}
const { lang } = Astro.props;
const interests = (await getCollection('interests')).sort((a, b) => a.data.order - b.data.order);
---

<SectionHeading
  id="offclock"
  lang={lang}
  titleKey="offclock.title"
  subtitle={t('offclock.subtitle', lang)}
>
  <ul class="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
    {
      interests.map((i) => (
        <li class="card-sm flex flex-col gap-3 p-[18px]">
          <span class="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-2">
            <Icon name={i.data.icon} size={22} />
          </span>
          <span class="text-[15px] font-bold">{i.data.title[lang]}</span>
          <span class="text-[13px] leading-relaxed text-muted">{i.data.text[lang]}</span>
        </li>
      ))
    }
  </ul>
</SectionHeading>
```

- [ ] **Step 6: Crear `src/components/home/ContactSection.astro`**

Estático: el botón de enviar está deshabilitado con una nota hasta el plan B, que añade la isla y el envío. El botón de copiar funciona con un script vanilla.

```astro
---
import Icon from '../icons/Icon.astro';
import { t, type Locale } from '../../i18n/translations';
import { getAuthor } from '../../lib/config';

interface Props {
  lang: Locale;
}
const { lang } = Astro.props;
const { email } = getAuthor();
const calLink = 'https://cal.com/alvarotc';
---

<section id="contact" class="section container-page flex flex-col gap-5">
  <h2 class="text-[22px] font-bold tracking-tight">{t('contact.title', lang)}</h2>
  <div class="grid grid-cols-1 gap-5 lg:grid-cols-[400px_minmax(0,1fr)]">
    <div class="card flex flex-col gap-[18px] p-6">
      <p class="flex items-center gap-2.5 text-[13px] font-bold text-ok">
        <span class="h-2 w-2 rounded-full bg-ok" aria-hidden="true"></span>
        {t('contact.open', lang)}
      </p>
      <div class="flex flex-col gap-1.5">
        <span class="text-xs text-faint">{t('contact.email', lang)}</span>
        <div
          class="flex items-center justify-between gap-2.5 rounded-lg border border-border bg-bg px-3 py-2.5"
        >
          <span class="font-mono text-sm font-semibold">{email}</span>
          <button
            type="button"
            data-copy={email}
            data-copied-label={t('contact.copied', lang)}
            class="flex h-7 items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 text-xs text-muted"
          >
            <Icon name="copy" size={12} />
            <span>{t('contact.copy', lang)}</span>
          </button>
        </div>
      </div>
      <div class="flex flex-col gap-1">
        <span class="text-xs text-faint">{t('contact.response', lang)}</span>
        <span class="text-sm font-semibold">{t('contact.responseValue', lang)}</span>
      </div>
      <a href={calLink} class="btn-primary h-10">{t('contact.call', lang)}</a>
      <div class="flex gap-3.5 text-[13px] text-accent">
        <a href="https://github.com/alvarotorresc">GitHub</a>
        <a href="https://www.linkedin.com/in/alvaro-torres-carrasco/">LinkedIn</a>
        <a href="https://x.com/torresc_alvaro">X</a>
      </div>
    </div>

    <form
      data-contact-form
      class="flex flex-col overflow-hidden rounded-2xl border border-border bg-[#0b0d11] font-mono text-[#e7e9ee]"
      aria-describedby="contact-soon"
    >
      <div class="flex items-center gap-2 border-b border-[#22262e] bg-[#12151b] px-3.5 py-2.5">
        <span class="h-2.5 w-2.5 rounded-full bg-[#2c313b]"></span>
        <span class="h-2.5 w-2.5 rounded-full bg-[#2c313b]"></span>
        <span class="h-2.5 w-2.5 rounded-full bg-[#2c313b]"></span>
        <span class="ml-2 text-xs text-[#8a93a3]">alvarotc.com, mail</span>
      </div>
      <div class="flex flex-col gap-2.5 p-4 text-[13px] leading-relaxed">
        <p class="flex gap-2.5"><span class="text-[#5fd08a]">$</span><span>mail alvaro</span></p>
        <div class="flex items-center gap-2.5">
          <label for="c-from" class="w-[60px] text-[#8a93a3]">{t('contact.from', lang)}</label>
          <input
            id="c-from"
            name="from"
            type="email"
            autocomplete="email"
            placeholder="you@company.com"
            class="h-[30px] flex-1 rounded-md border border-[#22262e] bg-[#0f1115] px-2.5 font-mono text-[13px] text-[#e7e9ee] placeholder:text-[#5c6470]"
          />
        </div>
        <div class="flex items-center gap-2.5">
          <label for="c-subject" class="w-[60px] text-[#8a93a3]">{t('contact.subject', lang)}</label
          >
          <input
            id="c-subject"
            name="subject"
            type="text"
            class="h-[30px] flex-1 rounded-md border border-[#22262e] bg-[#0f1115] px-2.5 font-mono text-[13px] text-[#e7e9ee]"
          />
        </div>
        <div class="flex items-start gap-2.5">
          <label for="c-body" class="w-[60px] pt-1.5 text-[#8a93a3]"
            >{t('contact.body', lang)}</label
          >
          <textarea
            id="c-body"
            name="body"
            rows="5"
            class="flex-1 resize-y rounded-md border border-[#22262e] bg-[#0f1115] px-2.5 py-2 font-mono text-[13px] text-[#e7e9ee]"
          ></textarea>
        </div>
        <input
          type="text"
          name="website"
          tabindex="-1"
          autocomplete="off"
          class="hidden"
          aria-hidden="true"
        />
        <div class="flex items-center justify-between gap-3 pt-1">
          <span id="contact-soon" class="text-xs text-[#8a93a3]">{t('contact.soon', lang)}</span>
          <button
            type="submit"
            disabled
            class="h-8 rounded-md border border-[#2c313b] bg-[#161920] px-3.5 font-mono text-xs text-[#e7e9ee] opacity-60"
          >
            {t('contact.send', lang)} ↵
          </button>
        </div>
      </div>
    </form>
  </div>
</section>

<script>
  function bind() {
    document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((button) => {
      if (button.dataset.bound) return;
      button.dataset.bound = 'true';
      button.addEventListener('click', async () => {
        const label = button.querySelector('span');
        const original = label?.textContent ?? '';
        try {
          await navigator.clipboard.writeText(button.dataset.copy ?? '');
          if (label) label.textContent = button.dataset.copiedLabel ?? original;
          setTimeout(() => {
            if (label) label.textContent = original;
          }, 1500);
        } catch {
          /* clipboard unavailable */
        }
      });
    });
  }
  bind();
  document.addEventListener('astro:after-swap', bind);
</script>
```

El terminal mantiene colores fijos oscuros en ambos temas a propósito: es una ventana de terminal, no un panel del tema.

- [ ] **Step 7: `astro check`**

Run: `npx astro check`
Expected: sin errores.

- [ ] **Step 8: Commit**

```bash
git add src/components/home
git commit -m "feat(home): project bento, timeline, writing, stack, off the clock and contact sections"
```

---

### Task 8: Home en inglés y español

**Files:**

- Modify: `src/pages/index.astro`, `src/pages/es/index.astro`
- Delete: `src/components/LanguageToggle.astro`

**Interfaces:**

- Consumes: todos los componentes de `src/components/home/`, `BaseLayout` con `lang` y `jsonLd`.

- [ ] **Step 1: Reescribir `src/pages/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../components/home/Hero.astro';
import About from '../components/home/About.astro';
import ProjectBento from '../components/home/ProjectBento.astro';
import ExperienceTimeline from '../components/home/ExperienceTimeline.astro';
import WritingList from '../components/home/WritingList.astro';
import StackStats from '../components/home/StackStats.astro';
import OffClock from '../components/home/OffClock.astro';
import ContactSection from '../components/home/ContactSection.astro';
import { getSiteName, getDescription, getAuthor } from '../lib/config';
import { getProjects } from '../lib/projects';

const lang = 'en';
const posts = (await getCollection('posts-en', (p) => !p.data.draft)).sort(
  (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
);
const apps = (await getProjects(lang)).filter((p) => p.data.status === 'published').length;
const author = getAuthor();

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: author.name,
  url: 'https://alvarotc.com',
  email: `mailto:${author.email}`,
  jobTitle: 'Backend developer',
  sameAs: [
    `https://github.com/${author.github}`,
    `https://www.linkedin.com/in/${author.linkedin}/`,
    `https://x.com/${author.twitter}`,
  ],
};
---

<BaseLayout title={getSiteName()} description={getDescription()} lang={lang} jsonLd={jsonLd}>
  <Hero lang={lang} />
  <About lang={lang} />
  <ProjectBento lang={lang} />
  <ExperienceTimeline lang={lang} />
  <WritingList lang={lang} posts={posts} />
  <StackStats lang={lang} stats={{ posts: posts.length, apps }} />
  <OffClock lang={lang} />
  <ContactSection lang={lang} />
</BaseLayout>
```

- [ ] **Step 2: Reescribir `src/pages/es/index.astro`**

Igual que el anterior con `lang = 'es'`, `getCollection('posts', ...)`, imports con `../../`, `url: 'https://alvarotc.com/es/'` y `jobTitle: 'Desarrollador backend'`.

- [ ] **Step 3: Borrar `LanguageToggle.astro`**

```bash
git rm src/components/LanguageToggle.astro
grep -rn "LanguageToggle" src || echo "no references"
```

Expected: "no references".

- [ ] **Step 4: Build y comprobación visual**

Run: `npm run build && npm run preview`
Abrir `http://localhost:4321/` y `http://localhost:4321/es/`. Comprobar: nav y pie, hero con animación de entrada, About con etiquetas y cuatro tarjetas Now, bento con Bito, Quedamos y Huellas, timeline con cuatro entradas, post destacado más tres, stack y contadores, tres tarjetas de gustos, tarjeta de contacto con botón de copiar funcionando y terminal con botón deshabilitado. Cambiar tema con el toggle y recargar: se mantiene. Reducir la ventana a 390 px: todo en una columna y menú móvil funcionando.

- [ ] **Step 5: Commit**

```bash
git add -A src/pages/index.astro src/pages/es/index.astro src/components/LanguageToggle.astro
git commit -m "feat(home): assemble the new home in English and Spanish"
```

---

### Task 9: Aviso de datos mock, lint, tests y cierre del plan

**Files:**

- Create: `src/lib/mock-report.ts`, `tests/mock-report.test.ts`
- Modify: `src/pages/index.astro` (una línea)

**Interfaces:**

- Produces: `mockEntries(entries: Array<{ id: string; data: { mock?: boolean } }>): string[]` devuelve los ids marcados como mock.

- [ ] **Step 1: Test (falla)**

`tests/mock-report.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { mockEntries } from '../src/lib/mock-report';

describe('mockEntries', () => {
  it('returns only ids flagged as mock', () => {
    const ids = mockEntries([
      { id: 'a', data: { mock: true } },
      { id: 'b', data: {} },
      { id: 'c', data: { mock: false } },
    ]);
    expect(ids).toEqual(['a']);
  });
});
```

- [ ] **Step 2: Ejecutar y ver que falla**

Run: `npx vitest run tests/mock-report.test.ts`
Expected: FAIL, módulo inexistente.

- [ ] **Step 3: Implementar `src/lib/mock-report.ts`**

```ts
export function mockEntries(entries: Array<{ id: string; data: { mock?: boolean } }>): string[] {
  return entries.filter((e) => e.data.mock === true).map((e) => e.id);
}

export function warnMock(label: string, ids: string[]): void {
  if (ids.length === 0) return;
  console.warn(`[mock] ${label}: ${ids.join(', ')}`);
}
```

Añadir al principio de `src/lib/mock-report.ts` la línea `/* eslint-disable no-console */`.

- [ ] **Step 4: Usarlo en `src/pages/index.astro`**

Añadir el import junto a los demás y, tras `const author = getAuthor();`, las tres llamadas. `getCollection` ya está importado en esa página:

```ts
import { mockEntries, warnMock } from '../lib/mock-report';

warnMock('experience', mockEntries(await getCollection('experience')));
warnMock('now', mockEntries(await getCollection('now')));
warnMock('interests', mockEntries(await getCollection('interests')));
```

Solo en la home en inglés, para no duplicar el aviso.

- [ ] **Step 5: Ejecutar todo**

Run: `npx vitest run && npm run lint && npm run build`
Expected: todos los tests PASS; lint limpio; la build muestra tres líneas `[mock] ...` y termina bien.

- [ ] **Step 6: Commit y resumen**

```bash
git add src/lib/mock-report.ts tests/mock-report.test.ts src/pages/index.astro
git commit -m "chore(content): warn at build time while sample data remains"
git log --oneline redesign/cv-web ^main
```

Expected: nueve commits de este plan más los de la spec.

---

## Fuera de este plan (quedan para B, C y D)

- Timeline animada, paleta de comandos, envío del formulario: plan B.
- `/projects/[slug]`, `/about`, `/cv`, `/stats`, layout nuevo de post: plan B.
- `fetch-data.ts`, ListenBrainz, GitHub, Umami, Lighthouse, workflow diario: plan C.
- `/rss-en.xml`, `/llms.txt`, `/llms-full.txt`, `/blog/[slug].md`, JSON-LD de artículo ampliado: plan C.
- Reescritura de `CLAUDE.md`, borrado de `research_notes/` y `reports/` o su exclusión en git: plan C.
- Servicio de contacto en el VPS con Proton Bridge: plan D.
