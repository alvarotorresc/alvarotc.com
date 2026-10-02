# Plan B: islas y páginas secundarias

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Completar alvarotc.com como CV navegable: layout nuevo de blog, fichas de proyecto, `/about`, `/cv` imprimible, `/stats`, las tres islas React (timeline animada, paleta de comandos, formulario de contacto con envío real) y la restauración de todos los enlaces que el plan A dejó retirados, en inglés y en español.

**Architecture:** Astro 7 estático. Cada página nueva es un componente `*Page.astro` que recibe `lang` y lo envuelven dos ficheros de ruta espejo (`src/pages/x.astro` con `lang="en"` y `src/pages/es/x.astro` con `lang="es"`). Las tres islas React viven en `src/components/islands/` y reciben datos ya resueltos como props planos (la colección se lee en el `.astro` padre). Framer Motion solo en `Timeline.tsx`. Los datos de stats se leen de `src/data/generated/stats.json` si existe (lo escribirá el plan C) y si no de `src/data/fallback/stats.json`; la página oculta cada bloque cuya fuente sea `null`. El plan mantiene la regla del plan A: nada inventado visible en producción (experiencia y biografía se ocultan mientras `mock: true`).

**Tech Stack:** Astro 7.3, React 18, framer-motion 11 (ya instalado), Tailwind 4 vía `@tailwindcss/vite`, TypeScript strict, Vitest 5 con `getViteConfig` y la Container API (para islas: `loadRenderers([getContainerRenderer()])` de `astro:container` y `@astrojs/react/container-renderer`, comprobado en este repo el 2026-09-20), `@fontsource/manrope` (nuevo, solo para OG en build), satori + sharp (ya instalados).

**Spec:** `docs/superpowers/specs/2026-09-19-cv-web-redesign-design.md` (secciones 4, 5, 8, 11, 12, 13). Plan anterior: `docs/superpowers/plans/2026-09-19-plan-a-base-y-home.md`. Ledger del plan A con las rulings que este plan absorbe: `.superpowers/sdd/2026-09-19-plan-a-base-y-home/progress.md`.

## Global Constraints

- Node >= 22.12. Astro 7, Tailwind 4 con `@tailwindcss/vite`, Vitest 5, `@astrojs/react` 6, React 18. No se cambia ninguna versión mayor en este plan.
- Zod 4 vía `astro/zod`: `z.url()`, nunca `z.string().url()`.
- `npm run build` ejecuta `astro check && astro build`; ambos deben pasar en cada commit. `npm run lint` (ESLint + Prettier check) y `npm test` (Vitest) deben pasar en cada commit.
- Conventional Commits en inglés: `feat:`, `fix:`, `refactor:`, `test:`, `chore:`, `docs:`. Un commit por tarea, en la rama `redesign/cv-web`, sin worktree. Todo mensaje de commit termina con las dos líneas `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>` y `Claude-Session: https://claude.ai/code/session_01VTyzAnCsjWPpc8CETZJnnx` (los bloques `git commit` de cada tarea las omiten por brevedad; el implementador las añade).
- Sin `console.log` en código de producción. La única excepción existente es `src/lib/mock-report.ts` (aviso de build).
- Idioma: inglés en la raíz, español en `/es`. Todo componente recibe `lang: Locale` (`'en' | 'es'`, tipo exportado por `src/i18n/translations.ts`). La función de traducción es `t(key, lang)`: la clave va primero. Toda clave nueva se añade a los dos idiomas.
- Cada ruta nueva tiene espejo en `/es`. Las rutas alternas que se pasan como `alternatePath` llevan barra final (`/es/cv/`), como decidió la revisión final del plan A.
- Regla mock: mientras cualquier entrada de `experience` tenga `mock: true`, la sección Experience de la home, el bloque de experiencia y formación de `/cv` y la entrada `nav.experience` no se renderizan. Mientras `about` tenga `mock: true`, su cuerpo largo no se renderiza. Cada colección con `mock: true` sigue avisando en build por `warnMock`.
- Sin cadenas `[placeholder]`, sin bloques rayados vacíos y sin enlaces muertos: si un dato no existe, su bloque no se pinta.
- Astro estático por defecto; isla React solo para la timeline, la paleta y el formulario. Las islas se hidratan con la directiva indicada en cada tarea (`client:visible` timeline y formulario, `client:idle` paleta). El HTML de cada isla debe estar completo en el render del servidor.
- Iconos como SVG inline de trazo. En componentes Astro, vía `src/components/icons/Icon.astro` (lanza `Error('Unknown icon: <name>')` si el nombre no existe: cada icono nuevo se añade primero al mapa `paths`). En islas React, SVG inline dentro del propio `.tsx`.
- Contraste AA. Sin em-dashes ni emojis en textos visibles. Sin sombras difusas, sin degradados.
- Framer Motion y todo movimiento respetan `prefers-reduced-motion` (en islas, con `useReducedMotion()`; en CSS, el bloque global ya existe).
- Tailwind 4 escanea `.tsx` automáticamente: las clases de las islas usan los mismos tokens (`bg-surface`, `text-muted`, `border-border`, `text-accent`, `bg-accent`, `text-accent-fg`, `text-faint`, `bg-surface-2`, `text-ok`, `font-mono`).
- El formato de fechas visibles es `formatDate(date, lang)` de `src/lib/utils.ts`. El tiempo de lectura es `getReadingTime(text)` (200 palabras por minuto) y se calcula siempre sobre el cuerpo del post, nunca sobre la descripción.

---

## Mapa de ficheros

Crear:

- `src/lib/posts.ts`: consultas y helpers puros de posts (`getPosts`, `sortPostsByDate`, `tagCounts`).
- `src/lib/stack.ts`: grupos de stack compartidos por la home y el CV.
- `src/lib/jsonld.ts`: `personJsonLd(lang)` para la home y `/about`.
- `src/lib/search.ts`: tipo `SearchItem`, normalización y puntuación de la búsqueda.
- `src/lib/contact.ts`: validación del formulario y mapa de errores del servicio.
- `src/lib/stats.ts`: tipo `StatsData`, carga con fallback, `writingStats`, `heatmapWeeks`, `heatLevel`.
- `src/data/fallback/stats.json`: datos de stats versionados (todo `null` hasta el plan C).
- `src/components/blog/PostSidebar.astro`, `src/components/blog/PostNav.astro`, `src/components/blog/TagFilter.astro`.
- `src/components/projects/ProjectPage.astro`, `ProjectCard.astro`, `PlaygroundFrame.astro`.
- `src/components/about/AboutPage.astro`.
- `src/components/cv/CvPage.astro`, `CvSheet.astro`.
- `src/components/stats/StatsPage.astro`, `StatsGrid.astro`, `ContributionHeatmap.astro`.
- `src/components/islands/Timeline.tsx`, `CommandPalette.tsx`, `ContactTerminal.tsx`.
- `src/content/about/en.md`, `src/content/about/es.md`.
- `src/pages/projects/[slug].astro`, `src/pages/es/projects/[slug].astro`, `src/pages/about.astro`, `src/pages/es/about.astro`, `src/pages/cv.astro`, `src/pages/es/cv.astro`, `src/pages/stats.astro`, `src/pages/es/stats.astro`, `src/pages/search.json.ts`.
- `src/types/global.d.ts`: tipo de `window.__applyTheme`.
- Tests: `tests/posts.test.ts`, `tests/share-buttons.test.ts`, `tests/project-page.test.ts`, `tests/about.test.ts`, `tests/cv.test.ts`, `tests/stats.test.ts`, `tests/timeline.test.ts`, `tests/search.test.ts`, `tests/command-palette.test.ts`, `tests/contact.test.ts`, `tests/contact-terminal.test.ts`, `tests/og.test.ts`, `tests/islands.ts` (helper).

Modificar:

- `src/layouts/BlogPostLayout.astro`: reescritura completa (props nuevos, sidebar, portada, prev/next).
- `src/layouts/BaseLayout.astro`: monta `CommandPalette`, calcula `experienceVisible`, `theme-color` único gobernado por script, preload de la fuente latina.
- `src/styles/global.css`: `.prose` (movido desde BlogPostLayout), `.terminal-*`, reglas `@media print`, borrado de `.placeholder`.
- `src/pages/blog/[slug].astro`, `src/pages/es/blog/[slug].astro`, `src/pages/blog/index.astro`, `src/pages/es/blog/index.astro`, `src/pages/projects.astro`, `src/pages/es/projects.astro`, `src/pages/index.astro`, `src/pages/es/index.astro`, `src/pages/rss.xml.ts`.
- `src/components/blog/ShareButtons.astro`, `src/components/home/ProjectBento.astro`, `ExperienceTimeline.astro`, `StackStats.astro`, `ContactSection.astro`, `Hero.astro`, `NowCards.astro`, `src/components/site/Nav.astro`, `ThemeToggle.astro`, `src/components/icons/Icon.astro`.
- `src/content.config.ts`: colección `about`.
- `src/i18n/translations.ts`: claves nuevas (listadas en cada tarea).
- `site.config.ts`: nav restaurado, `contactEndpoint`, `calLink`.
- `src/lib/og.ts`: Manrope local y tokens nuevos.
- `public/manifest.json`, `public/favicon.svg`.
- `tests/nav.test.ts`, `tests/build.test.ts`.
- `.gitignore`: `src/data/generated/`.
- `package.json`: `@fontsource/manrope`.

Borrar:

- `src/components/ui/Placeholder.astro` y la clase `.placeholder` de `global.css`.

Orden de las tareas y por qué: 1 (blog) mueve `.prose` a global, que 2 y 3 necesitan. 2 a 5 crean las rutas antes de que 6 y 9 enlacen a ellas, para no dejar enlaces muertos en ningún commit. 7 y 8 son islas independientes. 9 restaura la navegación cuando ya existe todo. 10 cierra la deuda de cabecera y assets.

---

### Task 1: Layout de post nuevo, índice de blog con filtro por etiqueta, helpers de posts

**Files:**

- Create: `src/lib/posts.ts`, `src/components/blog/PostSidebar.astro`, `src/components/blog/PostNav.astro`, `src/components/blog/TagFilter.astro`, `tests/posts.test.ts`, `tests/share-buttons.test.ts`
- Modify: `src/layouts/BlogPostLayout.astro` (reescritura), `src/styles/global.css`, `src/components/blog/ShareButtons.astro`, `src/pages/blog/[slug].astro`, `src/pages/es/blog/[slug].astro`, `src/pages/blog/index.astro`, `src/pages/es/blog/index.astro`, `src/pages/index.astro`, `src/pages/es/index.astro`, `src/pages/rss.xml.ts`, `src/i18n/translations.ts`, `src/components/ui/Tag.astro`

**Interfaces:**

- Consumes: `getReadingTime(text)` y `formatDate(date, lang)` de `src/lib/utils.ts`; `t(key, lang)` y `Locale`; `render(post)` de `astro:content` (devuelve `{ Content, headings }`; `headings` es `{ depth: number; slug: string; text: string }[]`).
- Produces:
  - `src/lib/posts.ts`: `type PostEntry = CollectionEntry<'posts'> | CollectionEntry<'posts-en'>`; `sortPostsByDate(posts: PostEntry[]): PostEntry[]` (más reciente primero, no muta); `tagCounts(posts: PostEntry[]): { tag: string; count: number }[]` (orden por `count` desc y luego alfabético); `getPosts(lang: Locale): Promise<PostEntry[]>` (colección `posts-en` si `en`, `posts` si `es`, sin drafts, ordenada).
  - `BlogPostLayout.astro` Props: `{ post: PostEntry; lang: Locale; alternatePath: string; hasTranslation: boolean; headings: MarkdownHeading[]; prev?: PostEntry; next?: PostEntry }`.
  - Clase global `.prose` en `global.css` (la usan las Tasks 2 y 3).

- [ ] **Step 1: Test de los helpers puros de posts**

`tests/posts.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { sortPostsByDate, tagCounts, type PostEntry } from '../src/lib/posts';

function post(id: string, date: string, tags: string[]): PostEntry {
  return {
    id,
    collection: 'posts-en',
    data: { title: id, description: '', date: new Date(date), draft: false, tags },
  } as unknown as PostEntry;
}

describe('sortPostsByDate', () => {
  it('orders newest first without mutating the input', () => {
    const input = [
      post('a', '2026-01-01', []),
      post('b', '2026-03-01', []),
      post('c', '2026-02-01', []),
    ];
    const sorted = sortPostsByDate(input);
    expect(sorted.map((p) => p.id)).toEqual(['b', 'c', 'a']);
    expect(input.map((p) => p.id)).toEqual(['a', 'b', 'c']);
  });
});

describe('tagCounts', () => {
  it('counts tags, most used first, ties alphabetical', () => {
    const posts = [
      post('a', '2026-01-01', ['astro', 'docker']),
      post('b', '2026-01-02', ['docker', 'vps']),
      post('c', '2026-01-03', ['android']),
    ];
    expect(tagCounts(posts)).toEqual([
      { tag: 'docker', count: 2 },
      { tag: 'android', count: 1 },
      { tag: 'astro', count: 1 },
      { tag: 'vps', count: 1 },
    ]);
  });

  it('returns an empty list for no posts', () => {
    expect(tagCounts([])).toEqual([]);
  });
});
```

- [ ] **Step 2: Ejecutar y ver fallar**

Run: `npx vitest run tests/posts.test.ts`
Expected: FAIL, `Cannot find module '../src/lib/posts'`.

- [ ] **Step 3: Escribir `src/lib/posts.ts`**

```ts
import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from '../i18n/translations';

export type PostEntry = CollectionEntry<'posts'> | CollectionEntry<'posts-en'>;

export function sortPostsByDate(posts: PostEntry[]): PostEntry[] {
  return [...posts].sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function tagCounts(posts: PostEntry[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.data.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export async function getPosts(lang: Locale): Promise<PostEntry[]> {
  const entries =
    lang === 'es'
      ? await getCollection('posts', (p) => !p.data.draft)
      : await getCollection('posts-en', (p) => !p.data.draft);
  return sortPostsByDate(entries);
}
```

- [ ] **Step 4: Ejecutar y ver pasar**

Run: `npx vitest run tests/posts.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Claves de traducción nuevas**

En `src/i18n/translations.ts`, añadir dentro de `en`:

```
    'post.alternate': 'Leer en español',
    'post.toc': 'On this page',
    'post.previous': 'Previous',
    'post.next': 'Next',
    'post.subscribe': 'Subscribe',
    'post.rssOnly': 'No newsletter. RSS only.',
    'post.rss': 'RSS feed',
    'post.cover': 'Cover image for',
    'writing.filter': 'Filter by topic',
    'writing.filterAll': 'All',
    'writing.count': 'posts',
    'share.x': 'Share on X',
    'share.linkedin': 'Share on LinkedIn',
    'share.whatsapp': 'Share on WhatsApp',
    'share.copy': 'Copy link',
    'share.copied': 'Link copied',
```

y dentro de `es`:

```
    'post.alternate': 'Read in English',
    'post.toc': 'En esta página',
    'post.previous': 'Anterior',
    'post.next': 'Siguiente',
    'post.subscribe': 'Suscríbete',
    'post.rssOnly': 'Sin newsletter. Solo RSS.',
    'post.rss': 'Feed RSS',
    'post.cover': 'Imagen de portada de',
    'writing.filter': 'Filtrar por tema',
    'writing.filterAll': 'Todos',
    'writing.count': 'posts',
    'share.x': 'Compartir en X',
    'share.linkedin': 'Compartir en LinkedIn',
    'share.whatsapp': 'Compartir en WhatsApp',
    'share.copy': 'Copiar enlace',
    'share.copied': 'Enlace copiado',
```

`post.alternate` se muestra en el idioma de destino a propósito (en la página inglesa el enlace dice "Leer en español").

- [ ] **Step 6: Test de ShareButtons en español y con marcador de re-bind**

`tests/share-buttons.test.ts`:

```ts
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
```

- [ ] **Step 7: Ejecutar y ver fallar**

Run: `npx vitest run tests/share-buttons.test.ts`
Expected: FAIL en `aria-label="Compartir en X"` (hoy es `Share on X` fijo).

- [ ] **Step 8: Reescribir `src/components/blog/ShareButtons.astro`**

Conservar los tres SVG de marca que ya tiene el fichero (X, LinkedIn, WhatsApp) y el icono de cadena; cambiar solo la estructura y el script. Resultado completo:

```astro
---
import { t, type Locale } from '../../i18n/translations';

interface Props {
  title: string;
  url: string;
  lang?: Locale;
}
const { title, url, lang = 'en' } = Astro.props;

const encodedUrl = encodeURIComponent(url);
const encodedTitle = encodeURIComponent(title);
const links = [
  {
    key: 'share.x',
    href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    icon: 'x',
  },
  {
    key: 'share.linkedin',
    href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    icon: 'linkedin',
  },
  {
    key: 'share.whatsapp',
    href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    icon: 'whatsapp',
  },
] as const;
---

<div class="flex flex-wrap items-center gap-2">
  <span class="mr-2 text-sm text-muted">{t('post.share', lang)}:</span>
  {links.map((link) => (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t(link.key, lang)}
      class="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-muted hover:text-text"
    >
      {link.icon === 'x' && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      )}
      {link.icon === 'linkedin' && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      )}
      {link.icon === 'whatsapp' && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      )}
    </a>
  ))}
  <button
    type="button"
    data-copy-link={url}
    data-copied-label={t('share.copied', lang)}
    aria-label={t('share.copy', lang)}
    class="flex h-9 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm text-muted hover:text-text"
  >
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
    </svg>
    <span>{t('share.copy', lang)}</span>
  </button>
</div>

<script>
  function bind() {
    document.querySelectorAll<HTMLButtonElement>('[data-copy-link]').forEach((button) => {
      if (button.dataset.bound) return;
      button.dataset.bound = 'true';
      button.addEventListener('click', async () => {
        const label = button.querySelector('span');
        const original = label?.textContent ?? '';
        try {
          await navigator.clipboard.writeText(button.dataset.copyLink ?? '');
          if (label) label.textContent = button.dataset.copiedLabel ?? original;
          setTimeout(() => {
            if (label) label.textContent = original;
          }, 2000);
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

Los cuatro `<path>` son los mismos que ya tiene el fichero (X, LinkedIn, WhatsApp y la cadena). El `<style>` con `.copy-feedback` desaparece: el feedback es el texto del botón.

- [ ] **Step 9: Ejecutar y ver pasar**

Run: `npx vitest run tests/share-buttons.test.ts tests/astro-env.test.ts`
Expected: PASS (el test de entorno sigue viendo `Hello` en el HTML porque el título va en las URLs de compartir; si no lo encuentra, cambiar esa aserción de entorno a `expect(html).toContain('Share on X')`).

- [ ] **Step 10: Mover `.prose` a `global.css`**

Cortar el bloque `<style is:global>` completo de `src/layouts/BlogPostLayout.astro` (las reglas de `.prose`, `.prose h2`, `.prose h3`, `.prose h4`, `.prose p`, `.prose a`, `.prose code`, `.prose pre`, `.prose ul`, `.prose ol`, `.prose li`, `.prose blockquote`, `.prose img`) y pegarlo, sin cambiar ninguna declaración, al final de `@layer components { ... }` en `src/styles/global.css`, justo antes de la llave que cierra la capa. Comprobar con `grep -n 'prose' src/styles/global.css` que están todas.

- [ ] **Step 11: `Tag.astro` acepta un `href` opcional**

`src/components/ui/Tag.astro` completo:

```astro
---
interface Props {
  tone?: 'neutral' | 'ok' | 'warn';
  href?: string;
  class?: string;
}
const { tone = 'neutral', href, class: className = '' } = Astro.props;
const tones = {
  neutral: 'bg-surface-2 text-muted',
  ok: 'bg-ok/15 text-ok',
  warn: 'bg-amber-500/15 text-amber-600 dark:text-amber-300',
};
const classes = `inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold ${tones[tone]} ${className}`;
---

{href ? (
  <a href={href} class={classes}>
    <slot />
  </a>
) : (
  <span class={classes}>
    <slot />
  </span>
)}
```

- [ ] **Step 12: Componentes de la página de post**

`src/components/blog/PostSidebar.astro`:

```astro
---
import type { MarkdownHeading } from 'astro';
import { t, type Locale } from '../../i18n/translations';

interface Props {
  lang: Locale;
  headings: MarkdownHeading[];
}
const { lang, headings } = Astro.props;
const toc = headings.filter((h) => h.depth === 2);
const rss = lang === 'es' ? '/rss.xml' : '/rss.xml';
---

<aside class="flex flex-col gap-8 lg:sticky lg:top-8">
  {toc.length > 0 && (
    <nav aria-label={t('post.toc', lang)} class="flex flex-col gap-3">
      <h2 class="text-[11px] font-bold uppercase tracking-[0.08em] text-faint">
        {t('post.toc', lang)}
      </h2>
      <ol class="flex flex-col gap-2 text-sm">
        {toc.map((h) => (
          <li>
            <a href={`#${h.slug}`} class="text-muted hover:text-text">
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )}
  <div class="card-sm flex flex-col gap-2 p-4">
    <h2 class="text-sm font-bold">{t('post.subscribe', lang)}</h2>
    <p class="text-[13px] text-muted">{t('post.rssOnly', lang)}</p>
    <a href={rss} class="text-[13px] font-semibold text-accent">
      {t('post.rss', lang)}
    </a>
  </div>
</aside>
```

(La constante `rss` apunta a `/rss.xml` en ambos idiomas hasta que el plan C cree `/rss-en.xml`; dejarla así para que el plan C solo cambie un valor.)

`src/components/blog/PostNav.astro`:

```astro
---
import { t, type Locale } from '../../i18n/translations';
import type { PostEntry } from '../../lib/posts';

interface Props {
  lang: Locale;
  prev?: PostEntry;
  next?: PostEntry;
}
const { lang, prev, next } = Astro.props;
const prefix = lang === 'es' ? '/es' : '';
---

{(prev || next) && (
  <nav
    aria-label={`${t('post.previous', lang)} / ${t('post.next', lang)}`}
    class="grid grid-cols-1 gap-4 border-t border-border pt-8 sm:grid-cols-2"
  >
    {prev ? (
      <a href={`${prefix}/blog/${prev.id}`} class="card-sm flex flex-col gap-1 p-4">
        <span class="text-[11px] font-bold uppercase tracking-[0.08em] text-faint">
          {t('post.previous', lang)}
        </span>
        <span class="text-sm font-semibold">{prev.data.title}</span>
      </a>
    ) : (
      <span />
    )}
    {next && (
      <a href={`${prefix}/blog/${next.id}`} class="card-sm flex flex-col gap-1 p-4 sm:text-right">
        <span class="text-[11px] font-bold uppercase tracking-[0.08em] text-faint">
          {t('post.next', lang)}
        </span>
        <span class="text-sm font-semibold">{next.data.title}</span>
      </a>
    )}
  </nav>
)}
```

- [ ] **Step 13: Reescribir `src/layouts/BlogPostLayout.astro`**

```astro
---
import type { MarkdownHeading } from 'astro';
import BaseLayout from './BaseLayout.astro';
import ShareButtons from '../components/blog/ShareButtons.astro';
import PostSidebar from '../components/blog/PostSidebar.astro';
import PostNav from '../components/blog/PostNav.astro';
import Tag from '../components/ui/Tag.astro';
import { t, type Locale } from '../i18n/translations';
import { formatDate, getReadingTime } from '../lib/utils';
import type { PostEntry } from '../lib/posts';

interface Props {
  post: PostEntry;
  lang: Locale;
  alternatePath: string;
  hasTranslation: boolean;
  headings: MarkdownHeading[];
  prev?: PostEntry;
  next?: PostEntry;
}

const { post, lang, alternatePath, hasTranslation, headings, prev, next } = Astro.props;
const prefix = lang === 'es' ? '/es' : '';
const { title, description, date, tags } = post.data;
const image = post.data.image || `/og/${post.id}.png`;
const readingTime = getReadingTime(post.body ?? '');
const canonicalURL = new URL(Astro.url.pathname, Astro.site).toString();
---

<BaseLayout
  title={title}
  description={description}
  image={image}
  type="article"
  publishedTime={date.toISOString()}
  lang={lang}
  alternatePath={alternatePath}
>
  <div class="container-page py-12 lg:grid lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-12">
    <article class="mx-auto flex w-full max-w-[720px] flex-col gap-8 lg:mx-0">
      <header class="flex flex-col gap-4">
        <div class="flex flex-wrap items-center gap-2 text-sm">
          <a href={`${prefix}/blog`} class="font-semibold text-accent">
            {t('writing.all', lang)}
          </a>
          {tags.map((tag) => (
            <Tag>{tag}</Tag>
          ))}
        </div>
        <h1 class="text-3xl font-extrabold tracking-tight md:text-4xl">{title}</h1>
        <p class="text-lg leading-relaxed text-muted">{description}</p>
        <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-faint">
          <time datetime={date.toISOString()}>{formatDate(date, lang)}</time>
          <span>
            {readingTime} {t('post.minRead', lang)}
          </span>
          {hasTranslation && (
            <a href={alternatePath} hreflang={lang === 'es' ? 'en' : 'es'} class="text-accent">
              {t('post.alternate', lang)}
            </a>
          )}
        </div>
      </header>

      <img
        src={image}
        alt={`${t('post.cover', lang)} ${title}`}
        width="1200"
        height="630"
        class="w-full rounded-2xl border border-border object-cover"
      />

      <div class="prose">
        <slot />
      </div>

      <div class="border-t border-border pt-8">
        <ShareButtons title={title} url={canonicalURL} lang={lang} />
      </div>

      <PostNav lang={lang} prev={prev} next={next} />
    </article>

    <div class="mt-12 lg:mt-0">
      <PostSidebar lang={lang} headings={headings} />
    </div>
  </div>
</BaseLayout>
```

- [ ] **Step 14: Páginas de post**

`src/pages/blog/[slug].astro` completo:

```astro
---
import { render } from 'astro:content';
import BlogPostLayout from '../../layouts/BlogPostLayout.astro';
import { getPosts } from '../../lib/posts';

export async function getStaticPaths() {
  const posts = await getPosts('en');
  return posts.map((post, i) => ({
    params: { slug: post.id },
    props: { post, prev: posts[i + 1], next: posts[i - 1] },
  }));
}

const { post, prev, next } = Astro.props;
const { Content, headings } = await render(post);
const hasTranslation = Boolean(post.data.source);
const alternatePath = hasTranslation ? `/es/blog/${post.data.source}/` : '/es/blog/';
---

<BlogPostLayout
  post={post}
  lang="en"
  alternatePath={alternatePath}
  hasTranslation={hasTranslation}
  headings={headings}
  prev={prev}
  next={next}
>
  <Content />
</BlogPostLayout>
```

`src/pages/es/blog/[slug].astro` completo:

```astro
---
import { getCollection, render } from 'astro:content';
import BlogPostLayout from '../../../layouts/BlogPostLayout.astro';
import { getPosts } from '../../../lib/posts';

export async function getStaticPaths() {
  const [posts, postsEn] = await Promise.all([getPosts('es'), getCollection('posts-en')]);
  return posts.map((post, i) => {
    const translation = postsEn.find((p) => p.data.source === post.id);
    return {
      params: { slug: post.id },
      props: {
        post,
        prev: posts[i + 1],
        next: posts[i - 1],
        alternatePath: translation ? `/blog/${translation.id}/` : '/blog/',
        hasTranslation: Boolean(translation),
      },
    };
  });
}

const { post, prev, next, alternatePath, hasTranslation } = Astro.props;
const { Content, headings } = await render(post);
---

<BlogPostLayout
  post={post}
  lang="es"
  alternatePath={alternatePath}
  hasTranslation={hasTranslation}
  headings={headings}
  prev={prev}
  next={next}
>
  <Content />
</BlogPostLayout>
```

`prev` es el post anterior en el tiempo (más antiguo) y `next` el siguiente (más reciente).

- [ ] **Step 15: Filtro por etiqueta e índice de blog**

`src/components/blog/TagFilter.astro`:

```astro
---
import { t, type Locale } from '../../i18n/translations';

interface Props {
  lang: Locale;
  tags: { tag: string; count: number }[];
}
const { lang, tags } = Astro.props;
const base =
  'h-8 rounded-lg border border-border bg-surface px-3 text-[13px] font-semibold text-muted hover:text-text aria-pressed:border-accent aria-pressed:text-accent';
---

{tags.length > 0 && (
  <div
    role="group"
    aria-label={t('writing.filter', lang)}
    class="flex flex-wrap gap-2"
    data-tag-filter
  >
    <button type="button" data-tag="" aria-pressed="true" class={base}>
      {t('writing.filterAll', lang)}
    </button>
    {tags.map(({ tag, count }) => (
      <button type="button" data-tag={tag} aria-pressed="false" class={base}>
        {tag} <span class="font-mono text-[11px] text-faint">{count}</span>
      </button>
    ))}
  </div>
)}

<script>
  function bind() {
    document.querySelectorAll<HTMLElement>('[data-tag-filter]').forEach((group) => {
      if (group.dataset.bound) return;
      group.dataset.bound = 'true';
      const buttons = group.querySelectorAll<HTMLButtonElement>('button[data-tag]');
      buttons.forEach((button) => {
        button.addEventListener('click', () => {
          const tag = button.dataset.tag ?? '';
          buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
          document.querySelectorAll<HTMLElement>('[data-tags]').forEach((item) => {
            const tags = (item.dataset.tags ?? '').split(' ');
            item.hidden = tag !== '' && !tags.includes(tag);
          });
        });
      });
    });
  }
  bind();
  document.addEventListener('astro:after-swap', bind);
</script>
```

`src/pages/blog/index.astro` completo:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import TagFilter from '../../components/blog/TagFilter.astro';
import { t } from '../../i18n/translations';
import { formatDate, getReadingTime } from '../../lib/utils';
import { getPosts, tagCounts } from '../../lib/posts';

const lang = 'en';
const posts = await getPosts(lang);
const tags = tagCounts(posts);
---

<BaseLayout title={t('writing.title', lang)} lang={lang}>
  <div class="container-page flex flex-col gap-8 py-14">
    <header class="flex flex-col gap-3">
      <h1 class="text-3xl font-extrabold tracking-tight md:text-4xl">{t('writing.title', lang)}</h1>
      <p class="text-muted">
        {posts.length} {t('writing.count', lang)}
      </p>
    </header>
    <TagFilter lang={lang} tags={tags} />
    <ul class="flex flex-col">
      {posts.map((post) => (
        <li data-tags={post.data.tags.join(' ')} class="border-t border-border last:border-b">
          <a href={`/blog/${post.id}`} class="flex flex-col gap-2 py-6 md:flex-row md:gap-8">
            <span class="shrink-0 font-mono text-[13px] text-faint md:w-[160px]">
              <time datetime={post.data.date.toISOString()}>
                {formatDate(post.data.date, lang)}
              </time>
              <span class="block">
                {getReadingTime(post.body ?? '')} {t('post.minRead', lang)}
              </span>
            </span>
            <span class="flex flex-col gap-1">
              <span class="text-lg font-bold">{post.data.title}</span>
              <span class="text-sm leading-relaxed text-muted">{post.data.description}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  </div>
</BaseLayout>
```

`src/pages/es/blog/index.astro`: idéntico con `lang = 'es'`, imports con un nivel más (`../../../`) y `href={`/es/blog/${post.id}`}`.

- [ ] **Step 16: Usar `getPosts` en las homes y el RSS**

En `src/pages/index.astro`, sustituir el cálculo de `posts` (`getCollection('posts-en', ...).sort(...)`) por `const posts = await getPosts(lang);` (import `getPosts` de `../lib/posts`) y quitar el import de `getCollection` si queda sin uso (sigue usándose para `warnMock`; mantenerlo). Igual en `src/pages/es/index.astro`. En `src/pages/rss.xml.ts`, sustituir el filtro y orden manual por `const posts = await getPosts('es');`.

- [ ] **Step 17: Build, lint, tests**

Run: `npm run build && npm run lint && npm test`
Expected: build verde; en `dist/blog/<slug>/index.html` aparece `On this page` cuando el post tiene h2, la portada `/og/<slug>.png` y `Leer en español`; en `dist/es/blog/index.html` aparece `Filtrar por tema`.

Comprobar con: `grep -c 'On this page' dist/blog/*/index.html` (al menos un 1) y `grep -l 'data-tag-filter' dist/es/blog/index.html`.

- [ ] **Step 18: Commit**

```bash
git add src/lib/posts.ts src/components/blog src/components/ui/Tag.astro src/layouts/BlogPostLayout.astro src/styles/global.css src/pages/blog src/pages/es/blog src/pages/index.astro src/pages/es/index.astro src/pages/rss.xml.ts src/i18n/translations.ts tests/posts.test.ts tests/share-buttons.test.ts tests/astro-env.test.ts
git commit -m "feat(blog): new post layout with sidebar, cover and prev/next; tag filter on the index"
```

---

### Task 2: Fichas de proyecto `/projects/[slug]`, `ProjectCard`, `PlaygroundFrame` y rework del índice `/projects`

**Files:**

- Create: `src/components/projects/ProjectCard.astro`, `src/components/projects/PlaygroundFrame.astro`, `src/components/projects/ProjectPage.astro`, `src/pages/projects/[slug].astro`, `src/pages/es/projects/[slug].astro`, `tests/project-page.test.ts`
- Modify: `src/i18n/translations.ts`, `src/pages/projects.astro`, `src/pages/es/projects.astro`, `src/components/home/ProjectBento.astro`

**Interfaces:**

- Consumes: `getProjects(lang: Locale): Promise<ProjectEntry[]>`, `getFeaturedProjects(lang)`, `getLabProjects(lang)`, `projectSlug(entry: ProjectEntry): string`, `projectLang(entry)`, tipo `ProjectEntry = CollectionEntry<'projects'>` de `src/lib/projects.ts`; `t(key, lang)`, `statusLabel(status, lang)`, tipo `Locale` de `src/i18n/translations.ts`; `render(project)` de `astro:content` (devuelve `{ Content }`); `getAuthor()` de `src/lib/config.ts` (`{ name, email, github, linkedin, twitter, devto }`); `Tag` Props `{ tone?: 'neutral' | 'ok' | 'warn'; href?: string; class?: string }` de `src/components/ui/Tag.astro` (firma post Task 1); `BaseLayout` Props `{ title, description?, image?, type?, publishedTime?, lang?, alternatePath?, jsonLd? }`; `projectSchema` de `src/content.config.ts` (`name, tagline, status, tier, order, visible, repo?, url?, license?, stack[], platform?, icon?, hero?, gallery[], playground?{kind:'pwa'|'iframe'|'video', src}, changelog[]{version, date?, note}, githubRepo?, mock`).
- Produces:
  - `src/components/projects/ProjectCard.astro` Props `{ lang: Locale; project: ProjectEntry; featured?: boolean }`.
  - `src/components/projects/PlaygroundFrame.astro` Props `{ kind: 'pwa' | 'iframe' | 'video'; src: string; title: string; lang: Locale }`.
  - `src/components/projects/ProjectPage.astro` Props `{ lang: Locale; project: ProjectEntry }`.
  - Rutas `/projects/[slug]` y `/es/projects/[slug]`.
  - `ProjectBento.astro`: `href(p)` enlaza ahora a la ficha interna en vez de a `url`/`repo`.

- [ ] **Step 1: Claves de traducción nuevas**

En `src/i18n/translations.ts`, añadir dentro de `en`:

```
    'projects.lab': 'Lab',
    'project.source': 'Source on GitHub',
    'project.platform': 'Platform',
    'project.license': 'License',
    'project.lastRelease': 'Last release',
    'project.try': 'Try it',
    'project.tryText':
      'A web build of the same code, running in your browser. Nothing is sent anywhere.',
    'project.load': 'Load the playground',
    'project.changelog': 'Changelog',
    'project.changelogFull': 'Full changelog on GitHub Releases',
    'project.screenshot': 'Screenshot',
```

y dentro de `es`:

```
    'projects.lab': 'Laboratorio',
    'project.source': 'Código en GitHub',
    'project.platform': 'Plataforma',
    'project.license': 'Licencia',
    'project.lastRelease': 'Última versión',
    'project.try': 'Pruébalo',
    'project.tryText':
      'Una build web del mismo código, en tu navegador. No se envía nada a ningún sitio.',
    'project.load': 'Cargar la demo',
    'project.changelog': 'Cambios',
    'project.changelogFull': 'Historial completo en GitHub Releases',
    'project.screenshot': 'Captura',
```

- [ ] **Step 2: Test de `ProjectCard` y `PlaygroundFrame`**

`tests/project-page.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import ProjectCard from '../src/components/projects/ProjectCard.astro';
import PlaygroundFrame from '../src/components/projects/PlaygroundFrame.astro';
import type { ProjectEntry } from '../src/lib/projects';

function project(overrides: Record<string, unknown> = {}): ProjectEntry {
  return {
    id: 'en/bito',
    collection: 'projects',
    data: {
      name: 'Bito',
      tagline: 'Log a habit in one tap, without accounts or cloud.',
      status: 'published',
      tier: 'featured',
      order: 1,
      visible: true,
      stack: ['Android', 'Offline-first', 'React', 'Capacitor', 'SQLite'],
      gallery: [],
      changelog: [],
      mock: false,
      url: 'https://bito.alvarotc.com',
      repo: 'https://github.com/alvarotorresc/bito',
      ...overrides,
    },
  } as unknown as ProjectEntry;
}

describe('ProjectCard', () => {
  it('links to the project page in the current language', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectCard, {
      props: { lang: 'es', project: project() },
    });
    expect(html).toContain('href="/es/projects/bito"');
  });
});

describe('PlaygroundFrame', () => {
  it('renders a load button for a pwa playground', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(PlaygroundFrame, {
      props: { kind: 'pwa', src: 'https://bito.alvarotc.com', title: 'Bito', lang: 'en' },
    });
    expect(html).toContain('data-playground-load');
  });

  it('renders no load button for a video playground', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(PlaygroundFrame, {
      props: { kind: 'video', src: '/videos/bito.mp4', title: 'Bito', lang: 'en' },
    });
    expect(html).not.toContain('data-playground-load');
  });
});
```

- [ ] **Step 3: Ejecutar y ver fallar**

Run: `npx vitest run tests/project-page.test.ts`
Expected: FAIL, `Failed to resolve import "../src/components/projects/ProjectCard.astro"` (el directorio `src/components/projects/` todavía no existe).

- [ ] **Step 4: Escribir `src/components/projects/PlaygroundFrame.astro`**

```astro
---
import { t, type Locale } from '../../i18n/translations';

interface Props {
  kind: 'pwa' | 'iframe' | 'video';
  src: string;
  title: string;
  lang: Locale;
}
const { kind, src, title, lang } = Astro.props;
---

{kind === 'video' ? (
  <video
    controls
    src={src}
    title={title}
    class="mx-auto w-full max-w-[420px] rounded-2xl border border-border"
  />
) : (
  <div class="mx-auto flex aspect-[9/19] w-full max-w-[360px] items-center justify-center overflow-hidden rounded-[36px] border-[6px] border-border bg-surface-2">
    <button
      type="button"
      data-playground-load
      data-src={src}
      data-title={title}
      class="btn-primary"
    >
      {t('project.load', lang)}
    </button>
  </div>
)}

<script>
  function bind() {
    document.querySelectorAll<HTMLButtonElement>('[data-playground-load]').forEach((button) => {
      if (button.dataset.bound) return;
      button.dataset.bound = 'true';
      button.addEventListener('click', () => {
        const iframe = document.createElement('iframe');
        iframe.src = button.dataset.src ?? '';
        iframe.title = button.dataset.title ?? '';
        iframe.loading = 'lazy';
        iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms');
        iframe.className = 'h-full w-full';
        button.replaceWith(iframe);
      });
    });
  }
  bind();
  document.addEventListener('astro:after-swap', bind);
</script>
```

- [ ] **Step 5: Escribir `src/components/projects/ProjectCard.astro`**

```astro
---
import Tag from '../ui/Tag.astro';
import { t, statusLabel, type Locale } from '../../i18n/translations';
import { projectSlug, type ProjectEntry } from '../../lib/projects';

interface Props {
  lang: Locale;
  project: ProjectEntry;
  featured?: boolean;
}
const { lang, project, featured = false } = Astro.props;
const prefix = lang === 'es' ? '/es' : '';
const slug = projectSlug(project);
const tone = (status: string) =>
  status === 'published' ? 'ok' : status === 'beta' ? 'warn' : 'neutral';
---

<div class="card flex flex-col gap-3 p-5">
  {featured && project.data.hero && (
    <img
      src={project.data.hero}
      alt={project.data.name}
      class="aspect-video w-full rounded-[10px] object-cover"
    />
  )}
  <a href={`${prefix}/projects/${slug}`} class="flex items-center gap-2.5">
    <h3 class="text-lg font-extrabold tracking-tight">{project.data.name}</h3>
    <Tag tone={tone(project.data.status)}>{statusLabel(project.data.status, lang)}</Tag>
  </a>
  <p class="text-sm leading-relaxed text-muted">{project.data.tagline}</p>
  {project.data.stack.length > 0 && (
    <ul class="flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-accent">
      {project.data.stack.slice(0, 3).map((s) => (
        <li>{s}</li>
      ))}
    </ul>
  )}
  {(project.data.url || project.data.repo) && (
    <div class="mt-auto flex gap-4 pt-2 text-[13px] font-semibold text-accent">
      {project.data.url && (
        <a href={project.data.url} rel="noopener">
          {t('projects.live', lang)}
        </a>
      )}
      {project.data.repo && (
        <a href={project.data.repo} rel="noopener">
          {t('projects.repo', lang)}
        </a>
      )}
    </div>
  )}
</div>
```

`ProjectCard` no envuelve toda la tarjeta en un único `<a>`: los enlaces `Live`/`Repo` son anclas reales y anidar un `<a>` dentro de otro sería HTML inválido, así que el enlace a la ficha cubre solo el nombre y el estado.

- [ ] **Step 6: Ejecutar y ver pasar**

Run: `npx vitest run tests/project-page.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 7: Escribir `src/components/projects/ProjectPage.astro`**

```astro
---
import { render } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Tag from '../ui/Tag.astro';
import PlaygroundFrame from './PlaygroundFrame.astro';
import { t, statusLabel, type Locale } from '../../i18n/translations';
import { getAuthor } from '../../lib/config';
import { projectSlug, type ProjectEntry } from '../../lib/projects';

interface Props {
  lang: Locale;
  project: ProjectEntry;
}
const { lang, project } = Astro.props;
const prefix = lang === 'es' ? '/es' : '';
const slug = projectSlug(project);
const alternatePath = `${lang === 'es' ? '' : '/es'}/projects/${slug}/`;

const {
  name,
  tagline,
  status,
  platform,
  license,
  repo,
  url,
  icon,
  hero,
  gallery,
  changelog,
  playground,
} = project.data;

const isVideo = (src: string) => src.endsWith('.mp4') || src.endsWith('.webm');
const image = hero && !isVideo(hero) ? hero : undefined;

const lastRelease = changelog.find((entry) => entry.date);
const versionSuffix = lastRelease ? `, ${lastRelease.version}` : '';

const author = getAuthor();
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name,
  description: tagline,
  applicationCategory: 'DeveloperApplication',
  ...(platform && { operatingSystem: platform }),
  ...(url && { url }),
  ...(repo && { codeRepository: repo }),
  ...(license && { license }),
  author: { '@type': 'Person', name: author.name },
};

const { Content } = await render(project);
---

<BaseLayout
  title={name}
  description={tagline}
  image={image}
  lang={lang}
  alternatePath={alternatePath}
  jsonLd={jsonLd}
>
  <div class="container-page flex flex-col gap-10 py-14">
    <a href={`${prefix}/projects`} class="text-sm font-semibold text-accent">
      {t('projects.all', lang)}
    </a>

    <header class="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-4">
          {icon ? (
            <img src={icon} alt="" class="h-14 w-14 rounded-2xl object-cover" />
          ) : (
            <div
              class="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 text-xl font-extrabold text-faint"
              aria-hidden="true"
            >
              {name.slice(0, 1)}
            </div>
          )}
          <div class="flex flex-col gap-1.5">
            <div class="flex items-center gap-2.5">
              <h1 class="text-3xl font-extrabold tracking-tight md:text-4xl">{name}</h1>
              <Tag tone={status === 'published' ? 'ok' : status === 'beta' ? 'warn' : 'neutral'}>
                {statusLabel(status, lang)}
                {versionSuffix}
              </Tag>
            </div>
            <p class="text-lg text-muted">{tagline}</p>
          </div>
        </div>
        <div class="flex gap-3">
          {url && (
            <a href={url} rel="noopener" class="btn-primary">
              {t('projects.live', lang)}
            </a>
          )}
          {repo && (
            <a href={repo} rel="noopener" class="btn-secondary">
              {t('project.source', lang)}
            </a>
          )}
        </div>
      </div>
      {(platform || license || lastRelease) && (
        <dl class="grid grid-cols-2 gap-3 md:w-[340px]">
          {platform && (
            <div class="card-sm flex flex-col gap-0.5 p-3.5">
              <dt class="text-xs text-faint">{t('project.platform', lang)}</dt>
              <dd class="text-sm font-bold">{platform}</dd>
            </div>
          )}
          {license && (
            <div class="card-sm flex flex-col gap-0.5 p-3.5">
              <dt class="text-xs text-faint">{t('project.license', lang)}</dt>
              <dd class="text-sm font-bold">{license}</dd>
            </div>
          )}
          {lastRelease && (
            <div class="card-sm flex flex-col gap-0.5 p-3.5">
              <dt class="text-xs text-faint">{t('project.lastRelease', lang)}</dt>
              <dd class="font-mono text-sm font-bold">{lastRelease.date}</dd>
            </div>
          )}
        </dl>
      )}
    </header>

    {hero && (
      <section>
        {isVideo(hero) ? (
          <video
            controls
            muted
            playsinline
            preload="metadata"
            class="aspect-video w-full rounded-2xl border border-border"
          >
            <source src={hero} />
          </video>
        ) : (
          <img
            src={hero}
            alt={name}
            class="aspect-video w-full rounded-2xl border border-border object-cover"
          />
        )}
      </section>
    )}

    {gallery.length > 0 && (
      <section class="grid grid-cols-2 gap-3 md:grid-cols-4">
        {gallery.map((src, i) => (
          <img
            src={src}
            alt={`${t('project.screenshot', lang)} ${i + 1}`}
            loading="lazy"
            class="aspect-[9/16] w-full rounded-xl border border-border object-cover"
          />
        ))}
      </section>
    )}

    <div class="prose">
      <Content />
    </div>

    {playground && (
      <section class="flex flex-col gap-6 border-t border-border pt-10">
        <div class="flex flex-col gap-2">
          <h2 class="text-[22px] font-bold tracking-tight">{t('project.try', lang)}</h2>
          <p class="max-w-[520px] text-sm leading-relaxed text-muted">
            {t('project.tryText', lang)}
          </p>
        </div>
        <PlaygroundFrame kind={playground.kind} src={playground.src} title={name} lang={lang} />
      </section>
    )}

    {changelog.length > 0 && (
      <section class="flex flex-col gap-4 border-t border-border pt-10">
        <h2 class="text-[22px] font-bold tracking-tight">{t('project.changelog', lang)}</h2>
        <ul class="flex flex-col">
          {changelog.map((entry) => (
            <li class="grid grid-cols-1 gap-2 border-t border-border py-3.5 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-4">
              <span class="font-mono text-[13px] text-accent">{entry.version}</span>
              <span class="text-sm text-muted">
                {entry.date && <span class="mr-2 text-faint">{entry.date}</span>}
                {entry.note}
              </span>
            </li>
          ))}
        </ul>
        {repo && (
          <a href={`${repo}/releases`} rel="noopener" class="text-sm font-semibold text-accent">
            {t('project.changelogFull', lang)}
          </a>
        )}
      </section>
    )}
  </div>
</BaseLayout>
```

Nota sobre `versionSuffix`: la versión de la cabecera es la del primer cambio del changelog que tiene `date`, la misma entrada que alimenta `project.lastRelease`. Un cambio sin fecha es un cambio no publicado y no se muestra como versión actual. Con el contenido actual de `bito.md` (ningún cambio con fecha) la cabecera muestra solo el estado; en cuanto el usuario ponga `date` a `v1.0.0`, aparece `, v1.0.0`.

- [ ] **Step 8: Rutas `/projects/[slug]` y `/es/projects/[slug]`**

`src/pages/projects/[slug].astro`:

```astro
---
import ProjectPage from '../../components/projects/ProjectPage.astro';
import { getProjects, projectSlug } from '../../lib/projects';

export async function getStaticPaths() {
  const projects = await getProjects('en');
  return projects.map((project) => ({
    params: { slug: projectSlug(project) },
    props: { project },
  }));
}

const { project } = Astro.props;
---

<ProjectPage lang="en" project={project} />
```

`src/pages/es/projects/[slug].astro`:

```astro
---
import ProjectPage from '../../../components/projects/ProjectPage.astro';
import { getProjects, projectSlug } from '../../../lib/projects';

export async function getStaticPaths() {
  const projects = await getProjects('es');
  return projects.map((project) => ({
    params: { slug: projectSlug(project) },
    props: { project },
  }));
}

const { project } = Astro.props;
---

<ProjectPage lang="es" project={project} />
```

- [ ] **Step 9: Reescribir `src/pages/projects.astro` y `src/pages/es/projects.astro`**

`src/pages/projects.astro` completo:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import ProjectCard from '../components/projects/ProjectCard.astro';
import { getFeaturedProjects, getLabProjects } from '../lib/projects';
import { t } from '../i18n/translations';

const lang = 'en';
const featured = await getFeaturedProjects(lang);
const lab = await getLabProjects(lang);
---

<BaseLayout title={t('projects.title', lang)} lang={lang}>
  <div class="container-page flex flex-col gap-12 py-14">
    <h1 class="text-3xl font-extrabold tracking-tight md:text-4xl">{t('projects.title', lang)}</h1>

    <div class="grid grid-cols-1 gap-5 md:grid-cols-3">
      {featured.map((project) => (
        <ProjectCard lang={lang} project={project} featured />
      ))}
    </div>

    {lab.length > 0 && (
      <div class="flex flex-col gap-5">
        <h2 class="text-[22px] font-bold tracking-tight">{t('projects.lab', lang)}</h2>
        <div class="grid grid-cols-1 gap-5 md:grid-cols-3">
          {lab.map((project) => (
            <ProjectCard lang={lang} project={project} />
          ))}
        </div>
      </div>
    )}
  </div>
</BaseLayout>
```

`src/pages/es/projects.astro` completo (idéntico con `lang = 'es'` e importes con un nivel más de profundidad):

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import ProjectCard from '../../components/projects/ProjectCard.astro';
import { getFeaturedProjects, getLabProjects } from '../../lib/projects';
import { t } from '../../i18n/translations';

const lang = 'es';
const featured = await getFeaturedProjects(lang);
const lab = await getLabProjects(lang);
---

<BaseLayout title={t('projects.title', lang)} lang={lang}>
  <div class="container-page flex flex-col gap-12 py-14">
    <h1 class="text-3xl font-extrabold tracking-tight md:text-4xl">{t('projects.title', lang)}</h1>

    <div class="grid grid-cols-1 gap-5 md:grid-cols-3">
      {featured.map((project) => (
        <ProjectCard lang={lang} project={project} featured />
      ))}
    </div>

    {lab.length > 0 && (
      <div class="flex flex-col gap-5">
        <h2 class="text-[22px] font-bold tracking-tight">{t('projects.lab', lang)}</h2>
        <div class="grid grid-cols-1 gap-5 md:grid-cols-3">
          {lab.map((project) => (
            <ProjectCard lang={lang} project={project} />
          ))}
        </div>
      </div>
    )}
  </div>
</BaseLayout>
```

- [ ] **Step 10: Enlazar `ProjectBento.astro` a la ficha interna**

Antes:

```
import { getFeaturedProjects, getLabProjects, type ProjectEntry } from '../../lib/projects';
```

```astro
const href = (p: ProjectEntry) => p.data.url ?? p.data.repo;
```

Después:

```
import { getFeaturedProjects, getLabProjects, projectSlug, type ProjectEntry } from '../../lib/projects';
```

```astro
const href = (p: ProjectEntry) => `${prefix}/projects/${projectSlug(p)}`;
```

El resto del fichero (los tres bloques `big`/`mid`/`band` y la línea "Also:") no cambia: siguen usando `href(p)`, que ahora apunta a la ficha interna en vez de a `url`/`repo`.

- [ ] **Step 11: Build, lint, tests**

Run: `npm run build && npm run lint && npm test`
Expected: build verde. En `dist/projects/bito/index.html` aparece `GPL-3.0` y no aparece `data-playground-load` (Bito no tiene `playground` en su contenido); en `dist/es/projects/bito/index.html` aparece `Código en GitHub`; en `dist/index.html` los enlaces del bento ya no apuntan a `bito.alvarotc.com` sino a `/projects/bito`; en `dist/es/projects/index.html` aparece `Laboratorio`.

Comprobar con:

```bash
test -f dist/projects/bito/index.html && test -f dist/es/projects/bito/index.html && echo "routes ok"
grep -o 'href="/projects/[a-z-]*"' dist/index.html | sort -u
grep -c 'bito.alvarotc.com' dist/index.html
grep -l 'GPL-3.0' dist/projects/bito/index.html
grep -l 'Código en GitHub' dist/es/projects/bito/index.html
grep -l 'Laboratorio' dist/es/projects/index.html
```

Expected:

```
routes ok
href="/projects/basecero"
href="/projects/bito"
href="/projects/create-astro-blog"
href="/projects/huellas"
href="/projects/pokeutils"
href="/projects/quedamos"
0
dist/projects/bito/index.html
dist/es/projects/bito/index.html
dist/es/projects/index.html
```

- [ ] **Step 12: Commit**

```bash
git add src/i18n/translations.ts src/components/projects tests/project-page.test.ts src/pages/projects.astro src/pages/es/projects.astro "src/pages/projects/[slug].astro" "src/pages/es/projects/[slug].astro" src/components/home/ProjectBento.astro
git commit -m "feat(projects): add project detail pages, cards, and an embeddable playground"
```

---

### Task 3: Página `/about`, colección `about` y `src/lib/jsonld.ts`

**Files:**

- Create: `src/lib/jsonld.ts`, `src/components/about/AboutPage.astro`, `src/content/about/en.md`, `src/content/about/es.md`, `src/pages/about.astro`, `src/pages/es/about.astro`, `tests/about.test.ts`
- Modify: `src/content.config.ts`, `src/i18n/translations.ts`, `src/pages/index.astro`, `src/pages/es/index.astro`

**Interfaces:**

- Consumes: `getEntry(collection, id)` y `render(entry)` de `astro:content`; `t(key, lang)`, tipo `Locale` de `src/i18n/translations.ts`; `getAuthor()` de `src/lib/config.ts` (`{ name, email, github, linkedin, twitter, devto }`); `mockEntries(entries)` y `warnMock(label, ids)` de `src/lib/mock-report.ts`; `BaseLayout` Props `{ title, description?, image?, type?, publishedTime?, lang?, alternatePath?, jsonLd? }`.
- Produces:
  - `src/content.config.ts`: `aboutSchema` exportado (`{ title: string; intro: string; values: { title: string; text: string }[] (mínimo 1); mock: boolean (default false) }`) y colección `about` (`glob({ pattern: '*.md', base: './src/content/about' })`, ids `en` y `es`).
  - `src/lib/jsonld.ts`: `personJsonLd(lang: Locale): Record<string, unknown>`.
  - `src/components/about/AboutPage.astro` Props `{ lang: Locale }`.
  - Rutas `/about` y `/es/about`.

- [ ] **Step 1: Test de `aboutSchema` y `personJsonLd`**

`tests/about.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { aboutSchema } from '../src/content.config';
import { personJsonLd } from '../src/lib/jsonld';

describe('aboutSchema', () => {
  it('defaults mock to false', () => {
    const parsed = aboutSchema.parse({
      title: 'Hi, I am Álvaro.',
      intro: 'Backend developer from Spain.',
      values: [{ title: 'Free software', text: 'If I ship it, you can read it.' }],
    });
    expect(parsed.mock).toBe(false);
  });

  it('rejects an entry without values', () => {
    expect(() =>
      aboutSchema.parse({ title: 'Hi', intro: 'Backend developer.', values: [] }),
    ).toThrow();
  });
});

describe('personJsonLd', () => {
  it('builds the Person schema for Spanish', () => {
    const jsonLd = personJsonLd('es') as {
      jobTitle: string;
      url: string;
      sameAs: string[];
    };
    expect(jsonLd.jobTitle).toBe('Desarrollador backend');
    expect(jsonLd.url).toBe('https://alvarotc.com/es/');
    expect(jsonLd.sameAs).toHaveLength(3);
  });

  it('builds the Person schema for English', () => {
    const jsonLd = personJsonLd('en') as { jobTitle: string; url: string };
    expect(jsonLd.jobTitle).toBe('Backend developer');
    expect(jsonLd.url).toBe('https://alvarotc.com');
  });
});
```

- [ ] **Step 2: Ejecutar y ver fallar**

Run: `npx vitest run tests/about.test.ts`
Expected: FAIL, `Cannot find module '../src/lib/jsonld'` (el fichero todavía no existe; `aboutSchema` tampoco existe aún en `content.config.ts`).

- [ ] **Step 3: Añadir la colección `about` y `aboutSchema` en `content.config.ts`**

Antes (final del fichero):

```ts
const interests = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/interests' }),
  schema: interestSchema,
});

export const collections = {
  posts,
  'posts-en': postsEn,
  projects,
  experience,
  now,
  interests,
};
```

Después:

```ts
const interests = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/interests' }),
  schema: interestSchema,
});

export const aboutSchema = z.object({
  title: z.string(),
  intro: z.string(),
  values: z.array(z.object({ title: z.string(), text: z.string() })).min(1),
  mock: z.boolean().default(false),
});

const about = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/about' }),
  schema: aboutSchema,
});

export const collections = {
  posts,
  'posts-en': postsEn,
  projects,
  experience,
  now,
  interests,
  about,
};
```

- [ ] **Step 4: Escribir `src/lib/jsonld.ts`**

```ts
import { getAuthor } from './config';
import type { Locale } from '../i18n/translations';

export function personJsonLd(lang: Locale): Record<string, unknown> {
  const author = getAuthor();
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    url: lang === 'es' ? 'https://alvarotc.com/es/' : 'https://alvarotc.com',
    email: `mailto:${author.email}`,
    jobTitle: lang === 'es' ? 'Desarrollador backend' : 'Backend developer',
    sameAs: [
      `https://github.com/${author.github}`,
      `https://www.linkedin.com/in/${author.linkedin}/`,
      `https://x.com/${author.twitter}`,
    ],
  };
}
```

- [ ] **Step 5: Ejecutar y ver pasar**

Run: `npx vitest run tests/about.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: Clave de traducción `about.values`**

En `src/i18n/translations.ts`, añadir dentro de `en`:

```
    'about.values': 'What I care about',
```

y dentro de `es`:

```
    'about.values': 'Lo que me importa',
```

(`about.title` y `about.more` ya existen y no se tocan.)

- [ ] **Step 7: Ficheros de contenido `about/en.md` y `about/es.md`**

`src/content/about/en.md` completo:

```md
---
title: 'Hi, I am Álvaro. I like software that respects the person using it.'
intro: 'Backend developer from Spain. This is the long version.'
values:
  - title: 'Free software'
    text: 'If I ship it, you can read it, build it and fork it.'
  - title: 'Privacy by default'
    text: 'No accounts unless they earn their place. No trackers, ever.'
  - title: 'Boring infrastructure'
    text: 'Linux, Docker, Caddy, a small VPS and good alerts beat a big cloud bill.'
  - title: 'Writing it down'
    text: 'Decisions, not tutorials. What worked, what broke, why.'
mock: true
---

## 2008. First computer, first Linux

A hand-me-down laptop and a live CD. I broke the bootloader in the first week and learned more fixing it than in the next year of classes.

## 2017. Computer engineering, and the server side

I went in wanting to make games and came out caring about databases. The moment something I wrote handled real traffic without falling over, I was hooked.

## 2021. Production, on-call, and humility

First job, first incident at 3 am, first migration that could not be rolled back. This is where I learned that boring is a feature and that observability is not optional.

## 2026. Shipping my own things

Bito, Quedamos, BaseCero, now Huellas. All free software, all offline-first when it makes sense. Building in public and writing the decisions down.

## Off the clock. Guitar, chess, boxing

Electric guitar badly recorded with Ardour, rapid games on Lichess, and a few boxing sessions a week. The three things that keep me away from a terminal.
```

`src/content/about/es.md` completo:

```md
---
title: 'Hola, soy Álvaro. Me gusta el software que respeta a quien lo usa.'
intro: 'Desarrollador backend en España. Esta es la versión larga.'
values:
  - title: 'Software libre'
    text: 'Si lo publico, puedes leerlo, compilarlo y bifurcarlo.'
  - title: 'Privacidad por defecto'
    text: 'Sin cuentas de usuario, salvo que se lo ganen. Sin rastreadores, nunca.'
  - title: 'Infraestructura aburrida'
    text: 'Linux, Docker, Caddy, un VPS pequeño y buenas alertas ganan a una factura de nube enorme.'
  - title: 'Dejarlo por escrito'
    text: 'Decisiones, no tutoriales. Qué funcionó, qué se rompió, y por qué.'
mock: true
---

## 2008. Primer ordenador, primer Linux

Un portátil de segunda mano y un live CD. Rompí el gestor de arranque la primera semana y aprendí más arreglándolo que en el año siguiente de clases.

## 2017. Ingeniería informática, y el lado del servidor

Entré queriendo hacer videojuegos y salí preocupándome por las bases de datos. El momento en que algo que escribí aguantó tráfico real sin caerse, quedé enganchado.

## 2021. Producción, guardias y humildad

Primer trabajo, primer incidente a las tres de la madrugada, primera migración que no se podía deshacer. Ahí aprendí que aburrido es una virtud y que la observabilidad no es opcional.

## 2026. Publicar mis propias cosas

Bito, Quedamos, BaseCero, ahora Huellas. Todo software libre, todo offline-first cuando tiene sentido. Construir en público y dejar las decisiones escritas.

## Fuera del teclado. Guitarra, ajedrez, boxeo

Guitarra eléctrica mal grabada con Ardour, partidas rápidas en Lichess y unas cuantas sesiones de boxeo a la semana. Las tres cosas que me alejan de una terminal.
```

- [ ] **Step 8: Escribir `src/components/about/AboutPage.astro`**

```astro
---
import { getEntry, render } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import { t, type Locale } from '../../i18n/translations';
import { mockEntries, warnMock } from '../../lib/mock-report';
import { personJsonLd } from '../../lib/jsonld';

interface Props {
  lang: Locale;
}
const { lang } = Astro.props;
const prefix = lang === 'es' ? '/es' : '';

const entry = await getEntry('about', lang);
if (!entry) throw new Error(`Missing src/content/about/${lang}.md`);
warnMock('about', mockEntries([entry]));

const { title, intro, values, mock } = entry.data;
const { Content } = await render(entry);
---

<BaseLayout
  title={t('about.title', lang)}
  description={intro}
  lang={lang}
  jsonLd={personJsonLd(lang)}
>
  <div class="container-page py-14">
    <div class="mx-auto flex max-w-[680px] flex-col gap-10">
      <header class="flex flex-col items-center gap-4 text-center">
        <div
          class="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-surface-2 text-2xl font-extrabold text-faint md:h-[104px] md:w-[104px]"
          aria-hidden="true"
        >
          AT
        </div>
        <h1 class="text-3xl font-extrabold tracking-tight md:text-4xl">{title}</h1>
        <p class="max-w-[520px] text-lg leading-relaxed text-muted">{intro}</p>
      </header>

      {!mock && (
        <div class="prose">
          <Content />
        </div>
      )}

      <section class="flex flex-col gap-6 border-t border-border pt-10">
        <h2 class="text-center text-[22px] font-bold tracking-tight">{t('about.values', lang)}</h2>
        <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
          {values.map((value) => (
            <div class="flex flex-col gap-1.5">
              <h3 class="text-base font-bold">{value.title}</h3>
              <p class="text-sm leading-relaxed text-muted">{value.text}</p>
            </div>
          ))}
        </div>
      </section>

      <div class="flex justify-center gap-3">
        <a href={`${prefix}/#contact`} class="btn-primary">
          {t('hero.contact', lang)}
        </a>
        <a href={`${prefix}/cv`} class="btn-secondary">
          {t('experience.cv', lang)}
        </a>
      </div>
    </div>
  </div>
</BaseLayout>
```

El avatar de iniciales copia las clases del div `AT` de `Hero.astro` (sin `hero-in`, que es una animación con `@keyframes` local a ese componente, y sin `shrink-0`, innecesario en una cabecera centrada de una sola columna).

- [ ] **Step 9: Rutas `/about` y `/es/about`**

`src/pages/about.astro` completo:

```astro
---
import AboutPage from '../components/about/AboutPage.astro';
---

<AboutPage lang="en" />
```

`src/pages/es/about.astro` completo:

```astro
---
import AboutPage from '../../components/about/AboutPage.astro';
---

<AboutPage lang="es" />
```

- [ ] **Step 10: Sustituir el `jsonLd` inline de las homes por `personJsonLd(lang)`**

En `src/pages/index.astro`, antes:

```ts
import { getSiteName, getDescription, getAuthor } from '../lib/config';
```

```ts
const author = getAuthor();
```

```ts
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
```

Después:

```ts
import { getSiteName, getDescription } from '../lib/config';
import { personJsonLd } from '../lib/jsonld';
```

```ts
// (la línea `const author = getAuthor();` se elimina por completo)
```

```ts
const jsonLd = personJsonLd(lang);
```

En `src/pages/es/index.astro`, antes:

```ts
import { getSiteName, getDescription, getAuthor } from '../../lib/config';
```

```ts
const author = getAuthor();
```

```ts
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: author.name,
  url: 'https://alvarotc.com/es/',
  email: `mailto:${author.email}`,
  jobTitle: 'Desarrollador backend',
  sameAs: [
    `https://github.com/${author.github}`,
    `https://www.linkedin.com/in/${author.linkedin}/`,
    `https://x.com/${author.twitter}`,
  ],
};
```

Después:

```ts
import { getSiteName, getDescription } from '../../lib/config';
import { personJsonLd } from '../../lib/jsonld';
```

```ts
// (la línea `const author = getAuthor();` se elimina por completo)
```

```ts
const jsonLd = personJsonLd(lang);
```

En ninguno de los dos ficheros queda ningún otro uso de `author` ni de `getAuthor`, así que no hacen falta más cambios en esas líneas. El resto de cada fichero (imports de componentes, cálculo de `posts` y `apps`, las llamadas a `warnMock` en `index.astro`, y el `<BaseLayout ... jsonLd={jsonLd}>` con las secciones dentro) no cambia.

- [ ] **Step 11: Build, lint, tests**

Run: `npm run build && npm run lint && npm test`
Expected: build verde. `dist/about/index.html` y `dist/es/about/index.html` existen; el título largo y la intro aparecen en ambos; el cuerpo largo (las cinco etapas) NO aparece porque `mock: true`; `dist/es/index.html` incluye el `jobTitle` que construye `personJsonLd('es')`.

Comprobar con:

```bash
test -f dist/about/index.html && test -f dist/es/about/index.html && echo "routes ok"
grep -l 'This is the long version' dist/about/index.html
grep -c 'First computer, first Linux' dist/about/index.html
grep -o '"jobTitle":"[^"]*"' dist/es/index.html
grep -l 'Lo que me importa' dist/es/about/index.html
```

Expected:

```
routes ok
dist/about/index.html
0
"jobTitle":"Desarrollador backend"
dist/es/about/index.html
```

- [ ] **Step 12: Commit**

```bash
git add src/content.config.ts src/lib/jsonld.ts src/content/about src/components/about src/pages/about.astro src/pages/es/about.astro src/pages/index.astro src/pages/es/index.astro src/i18n/translations.ts tests/about.test.ts
git commit -m "feat(about): add the about page, about content collection, and shared Person JSON-LD"
```

---

### Task 4: `/cv` imprimible

**Files:**

- Create: `src/lib/stack.ts`, `src/components/cv/CvSheet.astro`, `src/components/cv/CvPage.astro`, `src/pages/cv.astro`, `src/pages/es/cv.astro`, `tests/cv.test.ts`
- Modify: `src/components/home/StackStats.astro`, `src/styles/global.css`, `src/i18n/translations.ts`

**Interfaces:**

- Consumes: `getExperience()`, `hasMockExperience(entries)`, `formatPeriod(start, end, lang)` de `src/lib/experience.ts`; `getFeaturedProjects(lang)` y tipo `ProjectEntry` de `src/lib/projects.ts`; `getPosts(lang)` y tipo `PostEntry` de `src/lib/posts.ts`; `getAuthor()`, `getDescription(lang)` de `src/lib/config.ts`; `formatDate(date, lang)` de `src/lib/utils.ts`; `t(key, lang)`, `statusLabel(status, lang)`, `type Locale` de `src/i18n/translations.ts`; `Icon` (`name="print"` ya existe en `paths`) de `src/components/icons/Icon.astro`; `BaseLayout` de `src/layouts/BaseLayout.astro`.
- Produces:
  - `src/lib/stack.ts`: `type StackGroup = { label: string; items: string[] }`; `getStackGroups(lang: Locale): StackGroup[]` (los cuatro grupos que hoy están hardcodeados en `StackStats.astro`).
  - `CvSheet.astro` Props `{ lang: Locale }`: hoja A4 con cabecera, experiencia, proyectos, skills, educación y escritos.
  - `CvPage.astro` Props `{ lang: Locale }`: monta `BaseLayout` + fila de acciones (`no-print`) + `<CvSheet>`.
  - Clase `.cv-sheet` (hook de estilos) y bloque `@media print` en `global.css`, fuera de `@layer`.
  - Rutas `/cv` y `/es/cv`.

- [ ] **Step 1: Test de `getStackGroups` y de las reglas de impresión**

`tests/cv.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { getStackGroups } from '../src/lib/stack';

describe('getStackGroups', () => {
  it('returns four groups for Spanish, with a translated services label', () => {
    const groups = getStackGroups('es');
    expect(groups).toHaveLength(4);
    expect(groups.map((g) => g.label)).toEqual(['Backend', 'Infra', 'Frontend', 'Servicios']);
  });

  it('returns four groups for English, with an English services label', () => {
    const groups = getStackGroups('en');
    expect(groups).toHaveLength(4);
    expect(groups.map((g) => g.label)).toEqual(['Backend', 'Infra', 'Frontend', 'Services']);
  });

  it('gives every group at least one item', () => {
    for (const group of getStackGroups('en')) {
      expect(group.items.length).toBeGreaterThan(0);
    }
  });
});

describe('CV print styles', () => {
  const css = readFileSync('src/styles/global.css', 'utf8');

  it('defines a print media block that resets tokens to light and targets the cv sheet', () => {
    expect(css).toContain('@media print');
    expect(css).toContain('.cv-sheet');
  });

  it('hides the header, footer and any .no-print element when printing', () => {
    const start = css.indexOf('@media print');
    const block = css.slice(start, css.indexOf('@page', start) + 200);
    expect(block).toContain('header');
    expect(block).toContain('footer');
    expect(block).toContain('.no-print');
  });
});

describe('CvSheet markup', () => {
  const sheet = readFileSync('src/components/cv/CvSheet.astro', 'utf8');

  it('avoids header and footer tags, which the print rules hide unconditionally', () => {
    // global.css hides every <header> and <footer> in the document when printing
    // (it targets the site Nav and Footer). CvSheet must not use those tags for its
    // own name/contact band or its "Generated from..." band, or they vanish on paper.
    expect(sheet).not.toContain('<header');
    expect(sheet).not.toContain('<footer');
  });
});
```

- [ ] **Step 2: Ejecutar y ver fallar**

Run: `npx vitest run tests/cv.test.ts`
Expected: FAIL, `Cannot find module '../src/lib/stack'`.

- [ ] **Step 3: Escribir `src/lib/stack.ts`**

```ts
import type { Locale } from '../i18n/translations';

export type StackGroup = { label: string; items: string[] };

export function getStackGroups(lang: Locale): StackGroup[] {
  return [
    { label: 'Backend', items: ['TypeScript, Node', 'NestJS, PostgreSQL', 'Prisma, Redis'] },
    { label: 'Infra', items: ['Linux, Docker, Caddy', 'Hetzner, Cloudflare', 'GitHub Actions'] },
    { label: 'Frontend', items: ['React, Astro', 'Tailwind', 'Capacitor'] },
    {
      label: lang === 'es' ? 'Servicios' : 'Services',
      items: ['Supabase, Vercel', 'Firebase Cloud Messaging', 'Umami'],
    },
  ];
}
```

- [ ] **Step 4: Ejecutar y ver pasar a medias**

Run: `npx vitest run tests/cv.test.ts`
Expected: FAIL parcial. Las 3 pruebas de `getStackGroups` pasan; las 2 de `CV print styles` fallan con `expected '@import ...' to contain '@media print'` (el bloque de impresión no existe todavía); la suite `CvSheet markup` falla al recolectarse con `ENOENT: no such file or directory, open 'src/components/cv/CvSheet.astro'` (el fichero se crea en el Step 9).

- [ ] **Step 5: Bloque de impresión en `global.css`**

Al final de `src/styles/global.css`, después del bloque `@media (prefers-reduced-motion: reduce)` (fuera de `@layer components`), añadir:

Antes (fin de fichero):

```css
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

Después (mismo bloque, con el nuevo añadido debajo):

```css
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

@media print {
  :root,
  :root[data-theme='dark'] {
    --bg: #ffffff;
    --surface: #ffffff;
    --surface-2: #eef0f4;
    --border: #dfe2e8;
    --text: #16181d;
    --text-muted: #4b5160;
    --text-faint: #5b6270;
    --accent: #2563eb;
    --accent-fg: #ffffff;
    --ok: #1a7f4b;
  }

  header,
  footer,
  .no-print {
    display: none !important;
  }

  .cv-sheet {
    border: 0;
    max-width: none;
    padding: 0;
  }

  @page {
    margin: 16mm;
  }
}
```

`header` aquí es el `<header>` que pinta `Nav.astro` en toda la web (`Hero.astro` también usa `<header>`, pero `Hero` no se monta en `/cv`, así que no hay colisión).

- [ ] **Step 6: Ejecutar y ver pasar a medias, otra vez**

Run: `npx vitest run tests/cv.test.ts`
Expected: FAIL parcial. Las 5 pruebas de `getStackGroups` y `CV print styles` pasan ahora; `CvSheet markup` sigue fallando con el mismo `ENOENT`, porque el fichero se crea en el Step 9. Es el estado esperado hasta entonces.

- [ ] **Step 7: Claves de traducción del CV**

En `src/i18n/translations.ts`, dentro de `en`, insertar antes de `'offclock.title'`:

Antes:

```
    'stats.apps': 'apps in the wild',
    'offclock.title': 'Off the clock',
```

Después:

```
    'stats.apps': 'apps in the wild',
    'cv.title': 'Curriculum vitae',
    'cv.subtitle':
      'Same content as the timeline, laid out for paper. Print it or save it as PDF from your browser.',
    'cv.print': 'Print or save as PDF',
    'cv.otherLang': 'Versión en español',
    'cv.experience': 'Experience',
    'cv.projects': 'Projects',
    'cv.skills': 'Skills',
    'cv.education': 'Education',
    'cv.writing': 'Writing',
    'cv.writingText': 'Technical blog at alvarotc.com/blog, in English and Spanish. Recent:',
    'cv.languages': 'Languages',
    'cv.languagesValue': 'Spanish native, English professional',
    'cv.location': 'Spain, remote friendly',
    'cv.generated': 'Generated from alvarotc.com/cv',
    'cv.updated': 'Updated',
    'offclock.title': 'Off the clock',
```

Dentro de `es`, insertar antes de `'offclock.title'`:

Antes:

```
    'stats.apps': 'apps en producción',
    'offclock.title': 'Fuera del teclado',
```

Después:

```
    'stats.apps': 'apps en producción',
    'cv.title': 'Currículum',
    'cv.subtitle':
      'El mismo contenido que la línea de tiempo, maquetado para papel. Imprímelo o guárdalo como PDF desde el navegador.',
    'cv.print': 'Imprimir o guardar como PDF',
    'cv.otherLang': 'English version',
    'cv.experience': 'Experiencia',
    'cv.projects': 'Proyectos',
    'cv.skills': 'Habilidades',
    'cv.education': 'Formación',
    'cv.writing': 'Escritos',
    'cv.writingText': 'Blog técnico en alvarotc.com/blog, en inglés y español. Recientes:',
    'cv.languages': 'Idiomas',
    'cv.languagesValue': 'Español nativo, inglés profesional',
    'cv.location': 'España, remoto',
    'cv.generated': 'Generado desde alvarotc.com/cv',
    'cv.updated': 'Actualizado',
    'offclock.title': 'Fuera del teclado',
```

`cv.otherLang` se muestra en el idioma de destino a propósito, igual que `post.alternate`: en la página en inglés dice "Versión en español" (enlaza a `/es/cv/`), en la página en español dice "English version" (enlaza a `/cv/`).

- [ ] **Step 8: `StackStats.astro` usa `getStackGroups`**

Antes (`src/components/home/StackStats.astro`):

```astro
---
import { t, type Locale } from '../../i18n/translations';

interface Props {
  lang: Locale;
  stats?: { commits?: number; posts?: number; apps?: number };
}
const { lang, stats } = Astro.props;

const groups = [
  { label: 'Backend', items: ['TypeScript, Node', 'NestJS, PostgreSQL', 'Prisma, Redis'] },
  { label: 'Infra', items: ['Linux, Docker, Caddy', 'Hetzner, Cloudflare', 'GitHub Actions'] },
  { label: 'Frontend', items: ['React, Astro', 'Tailwind', 'Capacitor'] },
  {
    label: lang === 'es' ? 'Servicios' : 'Services',
    items: ['Supabase, Vercel', 'Firebase Cloud Messaging', 'Umami'],
  },
];
---
```

Después:

```astro
---
import { t, type Locale } from '../../i18n/translations';
import { getStackGroups } from '../../lib/stack';

interface Props {
  lang: Locale;
  stats?: { commits?: number; posts?: number; apps?: number };
}
const { lang, stats } = Astro.props;

const groups = getStackGroups(lang);
---
```

El resto del fichero (el `<section>`, los contadores) no cambia en esta tarea.

- [ ] **Step 9: `src/components/cv/CvSheet.astro`**

```astro
---
import { t, statusLabel, type Locale } from '../../i18n/translations';
import { getExperience, formatPeriod, hasMockExperience } from '../../lib/experience';
import { getFeaturedProjects, type ProjectEntry } from '../../lib/projects';
import { getStackGroups } from '../../lib/stack';
import { getPosts } from '../../lib/posts';
import { getAuthor, getDescription } from '../../lib/config';
import { formatDate } from '../../lib/utils';

interface Props {
  lang: Locale;
}
const { lang } = Astro.props;
const prefix = lang === 'es' ? '/es' : '';

const all = await getExperience();
const experience = hasMockExperience(all) ? [] : all;
const work = experience.filter((e) => e.data.kind === 'work');
const education = experience.filter((e) => e.data.kind !== 'work');
const projects = await getFeaturedProjects(lang);
const stack = getStackGroups(lang);
const posts = (await getPosts(lang)).slice(0, 3);
const author = getAuthor();

function projectLine(project: ProjectEntry): string {
  const parts: string[] = [];
  if (project.data.stack.length > 0) parts.push(project.data.stack.join(', '));
  const status = statusLabel(project.data.status, lang);
  parts.push(project.data.license ? `${status}, ${project.data.license}` : status);
  if (project.data.url) parts.push(project.data.url.replace(/^https?:\/\//, ''));
  return parts.join('. ');
}
---

<article class="cv-sheet card mx-auto w-full max-w-[794px] p-8 md:p-14">
  <div class="flex flex-col gap-4 border-b-2 border-text pb-4 sm:flex-row sm:items-start sm:justify-between">
    <div class="flex flex-col gap-1">
      <h1 class="text-2xl font-extrabold tracking-tight">{author.name}</h1>
      <p class="text-sm text-muted">{getDescription(lang)}</p>
    </div>
    <div class="flex flex-col gap-0.5 font-mono text-[11px] text-muted sm:items-end">
      <span>{author.email}</span>
      <span>alvarotc.com</span>
      <span>github.com/{author.github}</span>
      <span>{t('cv.location', lang)}</span>
    </div>
  </div>

  <div class="grid grid-cols-[110px_minmax(0,1fr)] gap-x-5 gap-y-4 pt-5">
    {work.length > 0 && (
      <>
        <span class="text-[11px] font-bold uppercase tracking-[0.04em] text-faint">
          {t('cv.experience', lang)}
        </span>
        <div class="flex flex-col gap-3">
          {work.map((entry) => (
            <div class="flex flex-col gap-1">
              <div class="flex items-baseline justify-between gap-3">
                <span class="text-[13px] font-extrabold">
                  {entry.data.role[lang]}, {entry.data.company}
                </span>
                <span class="shrink-0 font-mono text-[11px] text-faint">
                  {formatPeriod(entry.data.start, entry.data.end, lang)}
                </span>
              </div>
              <p class="text-[12px] leading-relaxed text-muted">{entry.data.summary[lang]}</p>
              {entry.data.highlights && entry.data.highlights[lang].length > 0 && (
                <ul class="list-disc pl-4 text-[12px] leading-relaxed text-muted">
                  {entry.data.highlights[lang].map((h) => (
                    <li>{h}</li>
                  ))}
                </ul>
              )}
              {entry.data.stack.length > 0 && (
                <span class="font-mono text-[11px] text-faint">{entry.data.stack.join(', ')}</span>
              )}
            </div>
          ))}
        </div>
      </>
    )}

    {projects.length > 0 && (
      <>
        <span class="text-[11px] font-bold uppercase tracking-[0.04em] text-faint">
          {t('cv.projects', lang)}
        </span>
        <div class="flex flex-col gap-2.5">
          {projects.map((project) => (
            <div class="flex flex-col gap-0.5">
              <span class="text-[13px] font-extrabold">
                {project.data.name}, {project.data.tagline}
              </span>
              <span class="text-[12px] leading-relaxed text-muted">{projectLine(project)}</span>
            </div>
          ))}
        </div>
      </>
    )}

    <span class="text-[11px] font-bold uppercase tracking-[0.04em] text-faint">
      {t('cv.skills', lang)}
    </span>
    <div class="grid grid-cols-1 gap-x-4 gap-y-1.5 text-[12px] leading-relaxed text-muted sm:grid-cols-2">
      {stack.map((group) => (
        <span>
          <strong class="text-text">{group.label}:</strong> {group.items.join(', ')}
        </span>
      ))}
      <span>
        <strong class="text-text">{t('cv.languages', lang)}:</strong> {t('cv.languagesValue', lang)}
      </span>
    </div>

    {education.length > 0 && (
      <>
        <span class="text-[11px] font-bold uppercase tracking-[0.04em] text-faint">
          {t('cv.education', lang)}
        </span>
        <div class="flex flex-col gap-3">
          {education.map((entry) => (
            <div class="flex flex-col gap-1">
              <div class="flex items-baseline justify-between gap-3">
                <span class="text-[13px] font-extrabold">
                  {entry.data.role[lang]}, {entry.data.company}
                </span>
                <span class="shrink-0 font-mono text-[11px] text-faint">
                  {formatPeriod(entry.data.start, entry.data.end, lang)}
                </span>
              </div>
              <p class="text-[12px] leading-relaxed text-muted">{entry.data.summary[lang]}</p>
              {entry.data.highlights && entry.data.highlights[lang].length > 0 && (
                <ul class="list-disc pl-4 text-[12px] leading-relaxed text-muted">
                  {entry.data.highlights[lang].map((h) => (
                    <li>{h}</li>
                  ))}
                </ul>
              )}
              {entry.data.stack.length > 0 && (
                <span class="font-mono text-[11px] text-faint">{entry.data.stack.join(', ')}</span>
              )}
            </div>
          ))}
        </div>
      </>
    )}

    {posts.length > 0 && (
      <>
        <span class="text-[11px] font-bold uppercase tracking-[0.04em] text-faint">
          {t('cv.writing', lang)}
        </span>
        <div class="flex flex-col gap-1.5 text-[12px] leading-relaxed text-muted">
          <p>{t('cv.writingText', lang)}</p>
          <ul class="list-disc pl-4">
            {posts.map((post) => (
              <li>
                <a href={`https://alvarotc.com${prefix}/blog/${post.id}`} class="text-accent">
                  {post.data.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </>
    )}
  </div>

  <div class="mt-8 flex justify-between border-t border-border pt-4 font-mono text-[10px] text-faint">
    <span>{t('cv.generated', lang)}</span>
    <span>
      {t('cv.updated', lang)}
      {formatDate(new Date(), lang)}
    </span>
  </div>
</article>
```

`work` y `education` se listan con la misma estructura de bloque; se repite el marcado a propósito (cada bloque es independiente). El grid de dos columnas (`110px` de etiqueta + contenido) usa fragmentos (`<>...</>`, ya usados en `ProjectBento.astro`) para que cada sección añada exactamente dos hijos directos al grid sin envolverlos en un `div` que rompería el `grid-template-columns`.

Importante: la cabecera y el pie de la hoja son `<div>`, no `<header>`/`<footer>`. El bloque `@media print` del Step 5 oculta _todo_ `header`/`footer` del documento (para quitar el `<header>` del `Nav` y el `<footer>` del `Footer` global), sin distinguir profundidad ni ancestro; si la cabecera con el nombre y el pie con la fecha de este componente usaran esas etiquetas, desaparecerían también al imprimir.

Nota de tipos: si `astro check` se queja del acceso a `entry.data.highlights[lang]` tras el `&&`, sustituir esa condición y el `.map` por `entry.data.highlights?.[lang] && entry.data.highlights[lang].length > 0` y `{(entry.data.highlights?.[lang] ?? []).map((h) => <li>{h}</li>)}` en los dos bloques (work y education); es un cambio local, no afecta al resto del fichero.

- [ ] **Step 10: Ejecutar y ver pasar**

Run: `npx vitest run tests/cv.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 11: `src/components/cv/CvPage.astro`**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import CvSheet from './CvSheet.astro';
import Icon from '../icons/Icon.astro';
import { t, type Locale } from '../../i18n/translations';

interface Props {
  lang: Locale;
}
const { lang } = Astro.props;
const alternatePath = lang === 'es' ? '/cv/' : '/es/cv/';
---

<BaseLayout
  title={t('cv.title', lang)}
  description={t('cv.subtitle', lang)}
  lang={lang}
  alternatePath={alternatePath}
>
  <div class="container-page flex flex-col gap-8 py-14">
    <div class="no-print flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div class="flex flex-col gap-2">
        <h1 class="text-3xl font-extrabold tracking-tight md:text-4xl">{t('cv.title', lang)}</h1>
        <p class="max-w-[560px] text-muted">{t('cv.subtitle', lang)}</p>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <a href={alternatePath} class="btn-secondary">
          {t('cv.otherLang', lang)}
        </a>
        <button type="button" data-print class="btn-primary gap-2">
          <Icon name="print" size={16} />
          {t('cv.print', lang)}
        </button>
      </div>
    </div>

    <CvSheet lang={lang} />
  </div>
</BaseLayout>

<script>
  function bind() {
    document.querySelectorAll<HTMLButtonElement>('[data-print]').forEach((button) => {
      if (button.dataset.bound) return;
      button.dataset.bound = 'true';
      button.addEventListener('click', () => window.print());
    });
  }
  bind();
  document.addEventListener('astro:after-swap', bind);
</script>
```

- [ ] **Step 12: Rutas `/cv` y `/es/cv`**

`src/pages/cv.astro`:

```astro
---
import CvPage from '../components/cv/CvPage.astro';
---

<CvPage lang="en" />
```

`src/pages/es/cv.astro`:

```astro
---
import CvPage from '../../components/cv/CvPage.astro';
---

<CvPage lang="es" />
```

- [ ] **Step 13: Build, lint, tests**

Run: `npm run build && npm run lint && npm test`
Expected: `astro check` y `astro build` en verde (ninguna experiencia real todavía, así que `/cv` se genera sin las secciones Experience/Education, solo cabecera, Projects, Skills y Writing); ESLint y Prettier sin errores; toda la suite de Vitest en verde, incluidas las 6 pruebas de `tests/cv.test.ts`.

Comprobar con:

```bash
grep -l 'cv-sheet' dist/cv/index.html dist/es/cv/index.html
grep -l '@media print' dist/_astro/*.css
grep -c 'Servicios' dist/es/cv/index.html
```

Expected: los dos primeros comandos listan los ficheros indicados (coincidencia encontrada en ambos); el tercero devuelve un número mayor que 0 (la etiqueta del cuarto grupo de stack en español, dentro de la sección Skills).

- [ ] **Step 14: Commit**

```bash
git add src/lib/stack.ts src/components/cv src/components/home/StackStats.astro src/styles/global.css src/i18n/translations.ts src/pages/cv.astro src/pages/es/cv.astro tests/cv.test.ts
git commit -m "feat(cv): add a printable /cv page built from experience, projects and stack data"
```

---

### Task 5: `/stats` con datos de fallback

**Files:**

- Create: `src/lib/stats.ts`, `src/data/fallback/stats.json`, `src/components/stats/ContributionHeatmap.astro`, `src/components/stats/StatsGrid.astro`, `src/components/stats/StatsPage.astro`, `src/pages/stats.astro`, `src/pages/es/stats.astro`, `tests/stats.test.ts`
- Modify: `.gitignore`, `src/i18n/translations.ts`, `src/components/home/StackStats.astro`

**Interfaces:**

- Consumes: `getPosts(lang)` de `src/lib/posts.ts`; `t(key, lang)`, `type Locale` de `src/i18n/translations.ts`; `getAuthor()` de `src/lib/config.ts`; `formatDate(date, lang)` de `src/lib/utils.ts`; `Tag` (Props `{ tone?, href?, class? }`) de `src/components/ui/Tag.astro`; `BaseLayout` de `src/layouts/BaseLayout.astro`.
- Produces:
  - `src/lib/stats.ts`: tipos `Contribution = { date: string; count: number }`, `StatsData`, `WritingStats = { posts: number; words: number; topics: { tag: string; count: number }[] }`; funciones `loadStats(root?: string): StatsData`, `writingStats(posts): WritingStats`, `heatmapWeeks(contributions, end): number[][]`, `heatLevel(count, max): 0 | 1 | 2 | 3 | 4`.
  - `src/data/fallback/stats.json`: datos por defecto, todo `null` hasta el plan C.
  - `ContributionHeatmap.astro` Props `{ weeks: number[][]; lang: Locale }`.
  - `StatsGrid.astro` Props `{ items: { value: string; label: string }[] }`.
  - `StatsPage.astro` Props `{ lang: Locale }`.
  - Rutas `/stats` y `/es/stats`.
  - Enlace `stats.full` añadido a `StackStats.astro`.

- [ ] **Step 1: Tests de `src/lib/stats.ts`**

`tests/stats.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  loadStats,
  writingStats,
  heatmapWeeks,
  heatLevel,
  type StatsData,
  type Contribution,
} from '../src/lib/stats';

function makeRoot(): string {
  const root = mkdtempSync(join(tmpdir(), 'stats-'));
  mkdirSync(join(root, 'src/data/fallback'), { recursive: true });
  return root;
}

const emptyStats: StatsData = { generatedAt: null, github: null, umami: null, lighthouse: null };

describe('loadStats', () => {
  it('reads the fallback file when there is no generated one', () => {
    const root = makeRoot();
    writeFileSync(join(root, 'src/data/fallback/stats.json'), JSON.stringify(emptyStats));
    expect(loadStats(root)).toEqual(emptyStats);
  });

  it('prefers the generated file over the fallback one', () => {
    const root = makeRoot();
    writeFileSync(join(root, 'src/data/fallback/stats.json'), JSON.stringify(emptyStats));
    mkdirSync(join(root, 'src/data/generated'), { recursive: true });
    const generated: StatsData = { ...emptyStats, generatedAt: '2026-09-20T00:00:00.000Z' };
    writeFileSync(join(root, 'src/data/generated/stats.json'), JSON.stringify(generated));
    expect(loadStats(root)).toEqual(generated);
  });
});

describe('writingStats', () => {
  it('counts posts, words and topics', () => {
    const posts = [
      { body: 'one two three', data: { tags: ['astro', 'docker'] } },
      { body: 'four five', data: { tags: ['docker'] } },
    ];
    const result = writingStats(posts);
    expect(result.posts).toBe(2);
    expect(result.words).toBe(5);
    expect(result.topics).toEqual([
      { tag: 'docker', count: 2 },
      { tag: 'astro', count: 1 },
    ]);
  });

  it('handles a post without a body as zero words', () => {
    const result = writingStats([{ data: { tags: [] } }]);
    expect(result.posts).toBe(1);
    expect(result.words).toBe(0);
    expect(result.topics).toEqual([]);
  });
});

describe('heatmapWeeks', () => {
  it('returns 53 columns of 7 days each', () => {
    const weeks = heatmapWeeks([], new Date('2026-09-19T00:00:00Z'));
    expect(weeks).toHaveLength(53);
    for (const week of weeks) expect(week).toHaveLength(7);
  });

  it('ends the last column on the Saturday of the week containing end', () => {
    // 2026-09-19 is a Saturday: it must land on the last row of the last column.
    const contributions: Contribution[] = [{ date: '2026-09-19', count: 7 }];
    const weeks = heatmapWeeks(contributions, new Date('2026-09-19T00:00:00Z'));
    expect(weeks[52][6]).toBe(7);
    expect(weeks[52].slice(0, 6)).toEqual([0, 0, 0, 0, 0, 0]);
  });

  it('places a contribution in its sunday-to-saturday column, indexed [week][day]', () => {
    // 2026-09-16 is the Wednesday of the same week as the 2026-09-19 Saturday end date
    // (week runs 2026-09-13 Sunday .. 2026-09-19 Saturday, so Wednesday is day index 3).
    const contributions: Contribution[] = [{ date: '2026-09-16', count: 3 }];
    const weeks = heatmapWeeks(contributions, new Date('2026-09-19T00:00:00Z'));
    expect(weeks[52][3]).toBe(3);
  });

  it('leaves every other cell at zero', () => {
    const weeks = heatmapWeeks(
      [{ date: '2026-09-19', count: 1 }],
      new Date('2026-09-19T00:00:00Z'),
    );
    const total = weeks.flat().reduce((sum, n) => sum + n, 0);
    expect(total).toBe(1);
  });
});

describe('heatLevel', () => {
  it('is 0 for a zero count', () => {
    expect(heatLevel(0, 10)).toBe(0);
  });

  it('reaches the maximum level exactly at the max count', () => {
    expect(heatLevel(10, 10)).toBe(4);
  });

  it('is bounded to 4 even above the max', () => {
    expect(heatLevel(40, 10)).toBe(4);
  });

  it('rounds up to the next level', () => {
    expect(heatLevel(1, 10)).toBe(1);
    expect(heatLevel(3, 10)).toBe(2);
  });
});
```

- [ ] **Step 2: Ejecutar y ver fallar**

Run: `npx vitest run tests/stats.test.ts`
Expected: FAIL, `Cannot find module '../src/lib/stats'`.

- [ ] **Step 3: Escribir `src/lib/stats.ts`**

```ts
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tagCounts, type PostEntry } from './posts';

export type Contribution = { date: string; count: number };

export type StatsData = {
  generatedAt: string | null;
  github: {
    contributions: Contribution[];
    commitsThisYear: number;
    publicRepos: number;
    stars: number;
    streak: number;
    mostActiveRepo: { name: string; commits30d: number } | null;
    languages: { name: string; percent: number }[];
  } | null;
  umami: { views30d: number; mostRead: { path: string; title: string; views: number }[] } | null;
  lighthouse: { performanceMobile: number; performanceDesktop: number } | null;
};

export function loadStats(root: string = process.cwd()): StatsData {
  const generated = join(root, 'src/data/generated/stats.json');
  const fallback = join(root, 'src/data/fallback/stats.json');
  const path = existsSync(generated) ? generated : fallback;
  return JSON.parse(readFileSync(path, 'utf8')) as StatsData;
}

export type WritingStats = {
  posts: number;
  words: number;
  topics: { tag: string; count: number }[];
};

function wordCount(text: string): number {
  const trimmed = text.trim();
  return trimmed === '' ? 0 : trimmed.split(/\s+/).length;
}

export function writingStats(posts: { body?: string; data: { tags: string[] } }[]): WritingStats {
  return {
    posts: posts.length,
    words: posts.reduce((sum, post) => sum + wordCount(post.body ?? ''), 0),
    topics: tagCounts(posts as unknown as PostEntry[]),
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKS = 53;

function atUTCMidnight(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function heatmapWeeks(contributions: Contribution[], end: Date): number[][] {
  const byDate = new Map(contributions.map((c) => [c.date, c.count]));
  const endUTC = atUTCMidnight(end);
  const lastSaturday = new Date(endUTC.getTime() + (6 - endUTC.getUTCDay()) * DAY_MS);
  const firstSunday = new Date(lastSaturday.getTime() - (WEEKS * 7 - 1) * DAY_MS);

  const weeks: number[][] = [];
  for (let week = 0; week < WEEKS; week++) {
    const days: number[] = [];
    for (let day = 0; day < 7; day++) {
      const date = new Date(firstSunday.getTime() + (week * 7 + day) * DAY_MS);
      days.push(byDate.get(isoDate(date)) ?? 0);
    }
    weeks.push(days);
  }
  return weeks;
}

export function heatLevel(count: number, max: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0 || max <= 0) return 0;
  const level = Math.ceil((count / max) * 4);
  return Math.min(4, Math.max(1, level)) as 1 | 2 | 3 | 4;
}
```

`heatmapWeeks` recibe 53 semanas de 7 días. Cada columna (índice de semana, `weeks[w]`) representa un rango domingo a sábado; la columna `52` (la última) es la que termina el sábado de la semana que contiene `end`. Para ubicar ese sábado se suman `6 - end.getUTCDay()` días a `end` (si `end` ya es sábado, `getUTCDay()` es `6` y no se suma nada). El primer domingo de la rejilla es ese sábado menos `53 * 7 - 1` días (371 días cubren exactamente 53 semanas completas). Las fechas se normalizan a medianoche UTC (`atUTCMidnight`) y se comparan como cadenas `YYYY-MM-DD` (`isoDate`, vía `toISOString().slice(0, 10)`) para que el resultado no dependa de la zona horaria de la máquina que ejecuta el build o los tests.

- [ ] **Step 4: Ejecutar y ver pasar**

Run: `npx vitest run tests/stats.test.ts`
Expected: PASS (12 tests).

- [ ] **Step 5: `src/data/fallback/stats.json`**

```json
{
  "generatedAt": null,
  "github": null,
  "umami": null,
  "lighthouse": null
}
```

- [ ] **Step 6: `.gitignore` ignora los datos generados**

Antes:

```
# build output
dist/
# generated types
.astro/

# dependencies
node_modules/
```

Después:

```
# build output
dist/
# generated types
.astro/
# generated stats data
src/data/generated/

# dependencies
node_modules/
```

- [ ] **Step 7: Claves de traducción de `/stats`**

En `src/i18n/translations.ts`, dentro de `en`, insertar después de `'cv.updated'` (añadida en la Task 4) y antes de `'offclock.title'`:

Antes:

```
    'cv.updated': 'Updated',
    'offclock.title': 'Off the clock',
```

Después:

```
    'cv.updated': 'Updated',
    'stats.subtitle':
      'Numbers behind the site and the code, refreshed at build time from public sources. No client-side tracking.',
    'stats.lastBuild': 'Last build',
    'stats.code': 'Code',
    'stats.contributions': 'Contributions, last 12 months',
    'stats.repos': 'public repos',
    'stats.stars': 'stars received',
    'stats.streak': 'day streak',
    'stats.mostActive': 'Most active repo',
    'stats.commits30d': 'commits in the last 30 days',
    'stats.languages': 'Languages',
    'stats.writing': 'Writing',
    'stats.postsTwoLangs': 'posts, in two languages',
    'stats.words': 'words written',
    'stats.views': 'views, last 30 days, Umami',
    'stats.mostRead': 'Most read',
    'stats.topics': 'Topics',
    'stats.site': 'This site',
    'stats.lighthouse': 'Lighthouse performance, mobile',
    'stats.sources': 'Where the numbers come from',
    'stats.sourcesText':
      'GitHub GraphQL API and Umami API, fetched by a scheduled GitHub Action that rebuilds the site once a day. Lighthouse runs in CI on every deploy. Nothing runs in your browser to compute this page.',
    'offclock.title': 'Off the clock',
```

Dentro de `es`, insertar después de `'cv.updated'` y antes de `'offclock.title'`:

Antes:

```
    'cv.updated': 'Actualizado',
    'offclock.title': 'Fuera del teclado',
```

Después:

```
    'cv.updated': 'Actualizado',
    'stats.subtitle':
      'Los números detrás de la web y del código, actualizados en build desde fuentes públicas. Sin rastreo en el navegador.',
    'stats.lastBuild': 'Última build',
    'stats.code': 'Código',
    'stats.contributions': 'Contribuciones, últimos 12 meses',
    'stats.repos': 'repos públicos',
    'stats.stars': 'estrellas recibidas',
    'stats.streak': 'días de racha',
    'stats.mostActive': 'Repo más activo',
    'stats.commits30d': 'commits en los últimos 30 días',
    'stats.languages': 'Lenguajes',
    'stats.writing': 'Escritos',
    'stats.postsTwoLangs': 'posts, en dos idiomas',
    'stats.words': 'palabras escritas',
    'stats.views': 'visitas, últimos 30 días, Umami',
    'stats.mostRead': 'Más leídos',
    'stats.topics': 'Temas',
    'stats.site': 'Esta web',
    'stats.lighthouse': 'Rendimiento Lighthouse, móvil',
    'stats.sources': 'De dónde salen los números',
    'stats.sourcesText':
      'API GraphQL de GitHub y API de Umami, consultadas por una GitHub Action programada que reconstruye la web una vez al día. Lighthouse corre en CI en cada despliegue. Nada se ejecuta en tu navegador para calcular esta página.',
    'offclock.title': 'Fuera del teclado',
```

Las claves `stats.commits`, `stats.posts`, `stats.apps` y `stats.full` ya existen desde antes de este plan; no se tocan.

- [ ] **Step 8: `src/components/stats/ContributionHeatmap.astro`**

```astro
---
import { t, type Locale } from '../../i18n/translations';
import { heatLevel } from '../../lib/stats';

interface Props {
  weeks: number[][];
  lang: Locale;
}
const { weeks, lang } = Astro.props;

const max = Math.max(1, ...weeks.flat());
const opacityByLevel: Record<0 | 1 | 2 | 3 | 4, number> = { 0: 1, 1: 0.25, 2: 0.5, 3: 0.75, 4: 1 };
---

<svg
  viewBox={`0 0 ${53 * 12} ${7 * 12}`}
  role="img"
  aria-label={t('stats.contributions', lang)}
  class="aspect-[53/7] w-full"
>
  {weeks.map((week, w) =>
    week.map((count, d) => {
      const level = heatLevel(count, max);
      return (
        <rect
          x={w * 12}
          y={d * 12}
          width="10"
          height="10"
          rx="2"
          fill={level === 0 ? 'var(--surface-2)' : 'var(--accent)'}
          opacity={opacityByLevel[level]}
        >
          <title>{count}</title>
        </rect>
      );
    }),
  )}
</svg>
```

`weeks[w][d]` sigue el índice `[semana][día]` que produce `heatmapWeeks`: `w` es la columna (0 la más antigua, 52 la más reciente) y `d` es el día dentro de esa semana (0 domingo, 6 sábado), tal y como se colocan en el eje `x`/`y` del SVG.

- [ ] **Step 9: `src/components/stats/StatsGrid.astro`**

```astro
---
interface Props {
  items: { value: string; label: string }[];
}
const { items } = Astro.props;
---

<ul class="grid grid-cols-2 gap-3.5 md:grid-cols-4">
  {items.map((item) => (
    <li class="card-sm flex flex-col gap-1 p-[18px]">
      <span class="font-mono text-[26px] font-extrabold">{item.value}</span>
      <span class="text-xs text-muted">{item.label}</span>
    </li>
  ))}
</ul>
```

- [ ] **Step 10: `src/components/stats/StatsPage.astro`**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import ContributionHeatmap from './ContributionHeatmap.astro';
import StatsGrid from './StatsGrid.astro';
import Tag from '../ui/Tag.astro';
import { t, type Locale } from '../../i18n/translations';
import { getPosts } from '../../lib/posts';
import { loadStats, writingStats, heatmapWeeks } from '../../lib/stats';
import { getAuthor } from '../../lib/config';
import { formatDate } from '../../lib/utils';

interface Props {
  lang: Locale;
}
const { lang } = Astro.props;
const alternatePath = lang === 'es' ? '/stats/' : '/es/stats/';
const locale = lang === 'es' ? 'es-ES' : 'en-US';
const num = (n: number) => n.toLocaleString(locale);

const stats = loadStats();
const posts = await getPosts(lang);
const writing = writingStats(posts);
const weeks = stats.github ? heatmapWeeks(stats.github.contributions, new Date()) : [];
const author = getAuthor();
---

<BaseLayout
  title={t('stats.title', lang)}
  description={t('stats.subtitle', lang)}
  lang={lang}
  alternatePath={alternatePath}
>
  <div class="container-page flex flex-col gap-4 py-14">
    <header class="flex flex-col gap-2.5">
      <h1 class="text-3xl font-extrabold tracking-tight md:text-4xl">{t('stats.title', lang)}</h1>
      <p class="max-w-[640px] text-muted">{t('stats.subtitle', lang)}</p>
      {stats.generatedAt && (
        <span class="font-mono text-xs text-faint">
          {t('stats.lastBuild', lang)}: {formatDate(new Date(stats.generatedAt), lang)}
        </span>
      )}
    </header>

    {stats.github && (
      <section class="flex flex-col gap-4 border-t border-border pt-10">
        <h2 class="text-[22px] font-bold tracking-tight">{t('stats.code', lang)}</h2>
        <div class="grid grid-cols-1 gap-3.5 lg:grid-cols-[2fr_1fr]">
          <div class="card-sm flex flex-col gap-3.5 p-5">
            <div class="flex items-baseline justify-between gap-3">
              <span class="text-sm font-bold">{t('stats.contributions', lang)}</span>
              <span class="font-mono text-xs text-faint">github.com/{author.github}</span>
            </div>
            <ContributionHeatmap weeks={weeks} lang={lang} />
          </div>
          <StatsGrid
            items={[
              { value: num(stats.github.commitsThisYear), label: t('stats.commits', lang) },
              { value: num(stats.github.publicRepos), label: t('stats.repos', lang) },
              { value: num(stats.github.stars), label: t('stats.stars', lang) },
              { value: num(stats.github.streak), label: t('stats.streak', lang) },
            ]}
          />
        </div>
        {(stats.github.mostActiveRepo || stats.github.languages.length > 0) && (
          <div class="grid grid-cols-1 gap-3.5 md:grid-cols-2">
            {stats.github.mostActiveRepo && (
              <div class="card-sm flex flex-col gap-2 p-[18px]">
                <span class="text-xs font-bold text-faint">{t('stats.mostActive', lang)}</span>
                <span class="font-mono text-base font-bold">
                  {stats.github.mostActiveRepo.name}
                </span>
                <span class="text-[13px] text-muted">
                  {num(stats.github.mostActiveRepo.commits30d)} {t('stats.commits30d', lang)}
                </span>
              </div>
            )}
            {stats.github.languages.length > 0 && (
              <div class="card-sm flex flex-col gap-2 p-[18px]">
                <span class="text-xs font-bold text-faint">{t('stats.languages', lang)}</span>
                <span class="text-[13px] text-muted">
                  {stats.github.languages.map((l) => `${l.name} ${l.percent}%`).join(', ')}
                </span>
              </div>
            )}
          </div>
        )}
      </section>
    )}

    <section class="flex flex-col gap-4 border-t border-border pt-10">
      <h2 class="text-[22px] font-bold tracking-tight">{t('stats.writing', lang)}</h2>
      <StatsGrid
        items={[
          { value: num(writing.posts), label: t('stats.postsTwoLangs', lang) },
          { value: num(writing.words), label: t('stats.words', lang) },
          ...(stats.umami
            ? [{ value: num(stats.umami.views30d), label: t('stats.views', lang) }]
            : []),
        ]}
      />
      {(writing.topics.length > 0 || (stats.umami && stats.umami.mostRead.length > 0)) && (
        <div class="grid grid-cols-1 gap-3.5 md:grid-cols-2">
          {stats.umami && stats.umami.mostRead.length > 0 && (
            <div class="card-sm flex flex-col gap-2 p-[18px]">
              <span class="text-xs font-bold text-faint">{t('stats.mostRead', lang)}</span>
              <ul class="flex flex-col">
                {stats.umami.mostRead.map((page) => (
                  <li class="flex items-center justify-between gap-4 border-t border-border py-2.5 first:border-t-0">
                    <span class="text-sm font-semibold">{page.title}</span>
                    <span class="font-mono text-[13px] text-faint">{num(page.views)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {writing.topics.length > 0 && (
            <div class="card-sm flex flex-col gap-2 p-[18px]">
              <span class="text-xs font-bold text-faint">{t('stats.topics', lang)}</span>
              <div class="flex flex-wrap gap-2">
                {writing.topics.map((topic) => (
                  <Tag>
                    {topic.tag} {topic.count}
                  </Tag>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>

    {stats.lighthouse && (
      <section class="flex flex-col gap-4 border-t border-border pt-10">
        <h2 class="text-[22px] font-bold tracking-tight">{t('stats.site', lang)}</h2>
        <StatsGrid
          items={[
            {
              value: num(stats.lighthouse.performanceMobile),
              label: t('stats.lighthouse', lang),
            },
          ]}
        />
      </section>
    )}

    <section class="flex flex-col gap-3 border-t border-border pt-10">
      <h2 class="text-[22px] font-bold tracking-tight">{t('stats.sources', lang)}</h2>
      <p class="max-w-[640px] text-sm leading-relaxed text-muted">{t('stats.sourcesText', lang)}</p>
    </section>
  </div>
</BaseLayout>
```

Con `src/data/fallback/stats.json` en `null`, solo se pintan las secciones `Writing` (siempre) y `Where the numbers come from` (siempre); `Code` y `This site` no aparecen hasta que el plan C escriba `src/data/generated/stats.json` con `github`/`lighthouse` no nulos.

- [ ] **Step 11: Rutas `/stats` y `/es/stats`**

`src/pages/stats.astro`:

```astro
---
import StatsPage from '../components/stats/StatsPage.astro';
---

<StatsPage lang="en" />
```

`src/pages/es/stats.astro`:

```astro
---
import StatsPage from '../../components/stats/StatsPage.astro';
---

<StatsPage lang="es" />
```

- [ ] **Step 12: Enlace a `/stats` desde la home**

En `src/components/home/StackStats.astro` (tal y como quedó tras la Task 4, con `const groups = getStackGroups(lang);`):

Antes:

```
const groups = getStackGroups(lang);

const counters = [
  { value: stats?.commits, label: t('stats.commits', lang) },
  { value: stats?.posts, label: t('stats.posts', lang) },
  { value: stats?.apps, label: t('stats.apps', lang) },
].filter((c): c is { value: number; label: string } => typeof c.value === 'number');

const columns: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
};
```

Después:

```
const groups = getStackGroups(lang);
const prefix = lang === 'es' ? '/es' : '';

const counters = [
  { value: stats?.commits, label: t('stats.commits', lang) },
  { value: stats?.posts, label: t('stats.posts', lang) },
  { value: stats?.apps, label: t('stats.apps', lang) },
].filter((c): c is { value: number; label: string } => typeof c.value === 'number');

const columns: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
};
```

Y en la plantilla:

Antes:

```astro
<ul class:list={['grid gap-3', columns[counters.length] ?? 'grid-cols-3']}>
  {counters.map((c) => (
    <li class="card-sm flex flex-col gap-1 p-4">
      <span class="font-mono text-[26px] font-extrabold">{c.value}</span>
      <span class="text-xs text-faint">{c.label}</span>
    </li>
  ))}
</ul>
)
```

Después:

```astro
<ul class:list={['grid gap-3', columns[counters.length] ?? 'grid-cols-3']}>
  {counters.map((c) => (
    <li class="card-sm flex flex-col gap-1 p-4">
      <span class="font-mono text-[26px] font-extrabold">{c.value}</span>
      <span class="text-xs text-faint">{c.label}</span>
    </li>
  ))}
</ul>
<a href={`${prefix}/stats`} class="text-sm font-semibold text-accent">
  {t('stats.full', lang)}
</a>
)
```

- [ ] **Step 13: Build, lint, tests**

Run: `npm run build && npm run lint && npm test`
Expected: `astro check` y `astro build` en verde; ESLint y Prettier sin errores; toda la suite de Vitest en verde, incluidas las 12 pruebas de `tests/stats.test.ts`.

Comprobar con:

```bash
grep -c 'Full stats page' dist/index.html
grep -c 'Página de stats' dist/es/index.html
grep -c 'Contributions, last 12 months' dist/stats/index.html
```

Expected: las dos primeras devuelven `1` (el enlace añadido a `StackStats.astro` en la home); la tercera devuelve `0` y ese `grep` termina con código de salida 1 (no es un fallo del paso: confirma que, con `src/data/fallback/stats.json` en `null`, la sección `Code` no se pinta en `/stats`). Al ejecutar los tres `grep` como comandos independientes, el código de salida de la tercera no interrumpe la comprobación.

- [ ] **Step 14: Commit**

```bash
git add src/lib/stats.ts src/data/fallback/stats.json src/components/stats src/components/home/StackStats.astro src/pages/stats.astro src/pages/es/stats.astro src/i18n/translations.ts tests/stats.test.ts .gitignore
git commit -m "feat(stats): add /stats page with a contribution heatmap and fallback data"
```

---

### Task 6: Isla `Timeline.tsx` con framer-motion y helper de islas para los tests

**Files:**

- Create: `src/components/islands/Timeline.tsx`, `tests/islands.ts`, `tests/fixtures/TimelineHost.astro`, `tests/timeline.test.ts`
- Modify: `src/components/home/ExperienceTimeline.astro` (reescritura)

**Interfaces:**

- Consumes: `getExperience(): Promise<ExperienceEntry[]>`, `formatPeriod(start: string, end: string | undefined, lang: Locale): string`, `isCurrent(entry: ExperienceEntry): boolean`, `hasMockExperience(entries: ExperienceEntry[]): boolean` de `src/lib/experience.ts`; `t(key, lang)` y `Locale` de `src/i18n/translations.ts`; `SectionHeading.astro` con Props `{ id, lang, titleKey, subtitle?, link?, linkLabel? }`; la ruta `/cv` que creó la Task 4; de `framer-motion` 11.18.2: `motion`, `useReducedMotion(): boolean | null`, `useScroll({ target?: RefObject<HTMLElement | null>, offset?: ScrollOffset })` que devuelve `{ scrollX, scrollY, scrollXProgress, scrollYProgress }`, la prop `whileInView` y `viewport?: { root?, once?, margin?, amount? }`.
- Produces:
  - `src/components/islands/Timeline.tsx`: `export type TimelineEntry = { period: string; title: string; summary: string; current: boolean }` y `export default function Timeline({ entries }: { entries: TimelineEntry[] })`.
  - `tests/islands.ts`: `export async function createIslandContainer()` (contenedor de la Container API con el renderer de React cargado). Lo reutilizan las Tasks 7 y 8.
  - `ExperienceTimeline.astro` mantiene sus Props `{ lang: Locale }` y la regla mock: si alguna entrada de `experience` tiene `mock: true`, no se pinta nada.

- [ ] **Step 1: Helper de islas y fixture de la timeline**

Las islas React no se pueden renderizar con `AstroContainer.create()` a secas: hace falta cargar el renderer de React. El helper centraliza eso para esta tarea y las siguientes.

`tests/islands.ts`:

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { getContainerRenderer } from '@astrojs/react/container-renderer';

export async function createIslandContainer() {
  const renderers = await loadRenderers([getContainerRenderer()]);
  return AstroContainer.create({ renderers });
}
```

La Container API no monta islas sueltas, así que cada isla necesita un componente `.astro` anfitrión. `tests/fixtures/TimelineHost.astro`:

```astro
---
import Timeline, { type TimelineEntry } from '../../src/components/islands/Timeline';

interface Props {
  entries: TimelineEntry[];
}
const { entries } = Astro.props;
---

<Timeline client:visible entries={entries} />
```

- [ ] **Step 2: Test del HTML de servidor de la isla**

Lo que se prueba es el render del servidor: que el contenido completo viaja en el HTML sin JavaScript, que el acento depende solo de `current` y que ningún elemento nace con opacidad cero.

`tests/timeline.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { createIslandContainer } from './islands';
import TimelineHost from './fixtures/TimelineHost.astro';

const entries = [
  {
    period: '2024 - now',
    title: 'Backend developer, Nortia',
    summary: 'Servicios internos.',
    current: true,
  },
  { period: '2021 - 2022', title: 'Developer, Kestrel', summary: 'Integraciones.', current: false },
];

describe('Timeline island', () => {
  it('ships every entry in the server HTML', async () => {
    const container = await createIslandContainer();
    const html = await container.renderToString(TimelineHost, { props: { entries } });
    expect(html).toContain('Backend developer, Nortia');
    expect(html).toContain('Developer, Kestrel');
    expect(html).toContain('2024 - now');
    expect(html).toContain('Servicios internos.');
  });

  it('marks only the current entry with the accent dot', async () => {
    const container = await createIslandContainer();
    const html = await container.renderToString(TimelineHost, { props: { entries } });
    expect(html).toContain('ring-accent/25');
    expect(html).toContain('border-2 border-border bg-bg');
    expect(html.match(/ring-accent\/25/g)).toHaveLength(1);
  });

  it('renders visible markup without JavaScript', async () => {
    const container = await createIslandContainer();
    const html = await container.renderToString(TimelineHost, { props: { entries } });
    expect(html).not.toContain('opacity:0');
  });
});
```

- [ ] **Step 3: Ejecutar y ver fallar**

Run: `npx vitest run tests/timeline.test.ts`

Expected: FAIL, la suite entera no carga porque el fixture importa un módulo que todavía no existe:

```text
 FAIL  tests/timeline.test.ts [ tests/timeline.test.ts ]
Error: Cannot find module '../../src/components/islands/Timeline' imported from /home/alvarotc/Documents/apps/alvarotc-web/tests/fixtures/TimelineHost.astro
 ❯ tests/fixtures/TimelineHost.astro:2:1
```

- [ ] **Step 4: Escribir `src/components/islands/Timeline.tsx`**

Tres detalles cuentan y ninguno es cosmético:

1. `initial` vale `false` mientras `mounted` sea `false`, así que el HTML del servidor sale con opacidad y posición finales. La animación de entrada solo existe en cliente.
2. La `<ol>` lleva `key={mounted ? 'live' : 'ssr'}`. Ese cambio de clave fuerza un remontaje justo después de hidratar, que es lo que permite que `initial` se aplique en cliente sin que React reutilice los nodos ya pintados.
3. El raíl de progreso usa `useScroll` con `target` y `offset`. Con `prefers-reduced-motion` activo, `scaleY` es la constante `1` y el raíl aparece lleno de golpe, sin ligarse al scroll.

El acento depende solo de `entry.current`, nunca del índice (la versión anterior pintaba de acento las dos primeras entradas y eso era una mentira visual).

```tsx
import { motion, useReducedMotion, useScroll } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

export type TimelineEntry = {
  period: string;
  title: string;
  summary: string;
  current: boolean;
};

export default function Timeline({ entries }: { entries: TimelineEntry[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.75', 'end 0.75'] });
  const scaleY = reduced ? 1 : scrollYProgress;

  return (
    <div ref={ref} className="relative">
      <div
        aria-hidden
        className="absolute bottom-3 left-[5px] top-1.5 w-0.5 bg-surface-2 md:left-[125px]"
      >
        <motion.div className="h-full w-full origin-top bg-accent" style={{ scaleY }} />
      </div>

      <ol key={mounted ? 'live' : 'ssr'}>
        {entries.map((entry) => (
          <motion.li
            key={`${entry.period} ${entry.title}`}
            className="relative grid grid-cols-1 gap-x-4 pb-10 pl-8 last:pb-0 md:grid-cols-[120px_minmax(0,1fr)] md:pl-0"
            initial={mounted && !reduced ? { opacity: 0, y: 12 } : false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <span
              className={`font-mono text-[13px] md:pr-8 ${entry.current ? 'text-accent' : 'text-faint'}`}
            >
              {entry.period}
            </span>
            <span
              aria-hidden
              className={`absolute left-0 top-1.5 h-3 w-3 rounded-full md:left-[120px] ${
                entry.current ? 'bg-accent ring-4 ring-accent/25' : 'border-2 border-border bg-bg'
              }`}
            />
            <div className="flex flex-col gap-1.5 md:pl-8">
              <h3 className="text-[17px] font-bold">{entry.title}</h3>
              <p className="max-w-[640px] text-sm leading-relaxed text-muted">{entry.summary}</p>
            </div>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
```

- [ ] **Step 5: Ejecutar y ver pasar**

Run: `npx vitest run tests/timeline.test.ts`

Expected: PASS (3 tests).

- [ ] **Step 6: Reescribir `src/components/home/ExperienceTimeline.astro`**

El `.astro` sigue siendo quien lee la colección y quien aplica el gate mock; la isla solo recibe datos planos ya traducidos y formateados. Fichero completo:

```astro
---
import SectionHeading from '../ui/SectionHeading.astro';
import Timeline, { type TimelineEntry } from '../islands/Timeline';
import { getExperience, formatPeriod, isCurrent, hasMockExperience } from '../../lib/experience';
import { t, type Locale } from '../../i18n/translations';

interface Props {
  lang: Locale;
}
const { lang } = Astro.props;
const prefix = lang === 'es' ? '/es' : '';
const all = await getExperience();
const entries = hasMockExperience(all) ? [] : all;
const items: TimelineEntry[] = entries.map((entry) => ({
  period: formatPeriod(entry.data.start, entry.data.end, lang),
  title: `${entry.data.role[lang]}, ${entry.data.company}`,
  summary: entry.data.summary[lang],
  current: isCurrent(entry),
}));
---

{items.length > 0 && (
  <SectionHeading
    id="experience"
    lang={lang}
    titleKey="experience.title"
    link={`${prefix}/cv`}
    linkLabel={t('experience.cv', lang)}
  >
    <Timeline client:visible entries={items} />
  </SectionHeading>
)}
```

El enlace `experience.cv` ("Full CV, printable" / "CV completo, imprimible") ya existe en `src/i18n/translations.ts` y la ruta `/cv` la creó la Task 4, así que no queda ningún enlace muerto.

- [ ] **Step 7: Build, lint, tests y comprobación sobre `dist/`**

Run: `npm run build && npm run lint && npm test`

Expected: build verde, `astro check` con 0 errores, Vitest todo en verde.

Mientras los cuatro YAML de `src/content/experience/` sigan con `mock: true`, la sección no se pinta y la isla no se monta en ninguna página. Eso es justo lo que hay que comprobar en `dist/`:

```bash
grep -c 'id="experience"' dist/index.html dist/es/index.html
grep -c 'astro-island' dist/index.html
grep -c 'Timeline' dist/index.html
```

Expected:

```text
dist/index.html:0
dist/es/index.html:0
0
0
```

Es decir: ninguna sección de experiencia, ninguna isla montada y ningún chunk de la timeline referenciado desde el HTML mientras el contenido sea mock. El bundle sí contiene `dist/_astro/Timeline.<hash>.js` porque Vite lo empaqueta al verlo importado, pero el navegador no lo pide nunca. La prueba de que la isla se renderiza bien es `tests/timeline.test.ts`, que no depende del contenido real.

- [ ] **Step 8: Commit**

```bash
git add src/components/islands/Timeline.tsx src/components/home/ExperienceTimeline.astro tests/islands.ts tests/fixtures/TimelineHost.astro tests/timeline.test.ts
git commit -m "feat(home): animated experience timeline as a React island with a continuous rail"
```

---

### Task 7: Buscador `search.json` y paleta de comandos

**Files:**

- Create: `src/lib/search.ts`, `src/pages/search.json.ts`, `src/components/islands/CommandPalette.tsx`, `tests/search.test.ts`, `tests/fixtures/PaletteHost.astro`, `tests/command-palette.test.ts`, y `tests/islands.ts` solo si la Task 6 no lo dejó ya creado
- Modify: `src/i18n/translations.ts`, `src/layouts/BaseLayout.astro`, `src/components/site/Nav.astro`, `tests/nav.test.ts`

**Interfaces:**

- Consumes: `t(key, lang)` y `Locale` de `src/i18n/translations.ts`; `getDescription(lang)` de `src/lib/config.ts`; `getPosts(lang): Promise<PostEntry[]>` de `src/lib/posts.ts` (Task 1); `getProjects(lang): Promise<ProjectEntry[]>` y `projectSlug(entry): string` de `src/lib/projects.ts`; `navigate(href: string, options?: Options): Promise<void>` de `astro:transitions/client`; las rutas `/about`, `/projects`, `/stats` y `/cv` que crearon las Tasks 2 a 5.
- Produces:
  - `src/lib/search.ts`: `export type SearchKind = 'page' | 'project' | 'post'`; `export type SearchItem = { kind: SearchKind; lang: Locale; title: string; text: string; url: string }`; `export function normalize(value: string): string`; `export function searchItems(items: SearchItem[], query: string, lang: Locale, limit?: number): SearchItem[]`.
  - `src/pages/search.json.ts`: `export const GET: APIRoute` que emite `dist/search.json` con todos los ítems de los dos idiomas.
  - `src/components/islands/CommandPalette.tsx`: `export default function CommandPalette({ lang }: { lang: Locale })`.
  - Evento `command-palette:open` en `document`: lo dispara el botón del Nav, lo escucha la isla.

- [ ] **Step 1: Test de la búsqueda**

`tests/search.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { normalize, searchItems, type SearchItem } from '../src/lib/search';

const item = (
  kind: SearchItem['kind'],
  lang: SearchItem['lang'],
  title: string,
  text: string,
): SearchItem => ({
  kind,
  lang,
  title,
  text,
  url: `/${kind}/${normalize(title).replace(/ /g, '-')}`,
});

const corpus: SearchItem[] = [
  item('page', 'es', 'Sobre mí', 'Desarrollador backend'),
  item('page', 'en', 'About', 'Backend developer'),
  item('project', 'es', 'Bito', 'Presupuesto offline kotlin android'),
  item('post', 'es', 'Observabilidad en el VPS', 'Grafana, Loki y Prometheus en un VPS barato'),
  item('post', 'es', 'De una idea a una APK', 'Compilar en 24 horas, kotlin'),
  item('post', 'en', 'Observability on a VPS', 'Grafana and Loki'),
];

describe('normalize', () => {
  it('lowercases, strips diacritics and collapses spaces', () => {
    expect(normalize('  Observabilidad   EN el VPS ')).toBe('observabilidad en el vps');
    expect(normalize('Sobre MÍ')).toBe('sobre mi');
    expect(normalize('Álvaro Torres')).toBe('alvaro torres');
  });
});

describe('searchItems', () => {
  it('only returns items of the requested language', () => {
    const results = searchItems(corpus, 'vps', 'es');
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Observabilidad en el VPS');
  });

  it('requires every term to match', () => {
    expect(searchItems(corpus, 'kotlin android', 'es').map((r) => r.title)).toEqual(['Bito']);
    expect(searchItems(corpus, 'kotlin swift', 'es')).toEqual([]);
  });

  it('ignores accents in the query', () => {
    expect(searchItems(corpus, 'sobre mi', 'es').map((r) => r.title)).toEqual(['Sobre mí']);
  });

  it('ranks a title match above a text-only match', () => {
    const results = searchItems(corpus, 'observabilidad', 'es');
    expect(results.map((r) => r.title)).toEqual(['Observabilidad en el VPS']);
    const grafana = searchItems(corpus, 'grafana', 'es');
    expect(grafana.map((r) => r.title)).toEqual(['Observabilidad en el VPS']);
  });

  it('puts pages first when the query is empty', () => {
    const results = searchItems(corpus, '   ', 'es');
    expect(results.map((r) => r.kind)).toEqual(['page', 'project', 'post', 'post']);
  });

  it('honours the limit', () => {
    expect(searchItems(corpus, '', 'es', 2)).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Ejecutar y ver fallar**

Run: `npx vitest run tests/search.test.ts`

Expected: FAIL, la suite no carga:

```text
 FAIL  tests/search.test.ts [ tests/search.test.ts ]
Error: Cannot find module '../src/lib/search' imported from /home/alvarotc/Documents/apps/alvarotc-web/tests/search.test.ts
```

- [ ] **Step 3: Escribir `src/lib/search.ts`**

La normalización descompone en NFD y borra las marcas combinantes con `\p{Mn}` (bandera `u`), de modo que "Sobre mí" y "sobre mi" son la misma cadena. Puntuación por término: el título que empieza por el término suma 3, el título que solo lo contiene suma 2, y el texto que lo contiene suma 1 aparte. Un término que no aparece en ninguno de los dos descarta el ítem entero.

```ts
import type { Locale } from '../i18n/translations';

export type SearchKind = 'page' | 'project' | 'post';

export type SearchItem = {
  kind: SearchKind;
  lang: Locale;
  title: string;
  text: string;
  url: string;
};

const kindOrder: Record<SearchKind, number> = { page: 0, project: 1, post: 2 };

export function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function score(item: SearchItem, terms: string[]): number {
  const title = normalize(item.title);
  const text = normalize(item.text);
  let total = 0;
  for (const term of terms) {
    if (!title.includes(term) && !text.includes(term)) return -1;
    if (title.startsWith(term)) total += 3;
    else if (title.includes(term)) total += 2;
    if (text.includes(term)) total += 1;
  }
  return total;
}

export function searchItems(
  items: SearchItem[],
  query: string,
  lang: Locale,
  limit = 8,
): SearchItem[] {
  const byKind = items
    .filter((item) => item.lang === lang)
    .sort((a, b) => kindOrder[a.kind] - kindOrder[b.kind]);
  const terms = normalize(query).split(' ').filter(Boolean);
  if (terms.length === 0) return byKind.slice(0, limit);
  return byKind
    .map((item) => ({ item, score: score(item, terms) }))
    .filter((row) => row.score >= 0)
    .sort((a, b) => b.score - a.score || kindOrder[a.item.kind] - kindOrder[b.item.kind])
    .slice(0, limit)
    .map((row) => row.item);
}
```

`Array.prototype.sort` es estable en Node, así que ordenar primero por tipo y luego por puntuación conserva el orden `page, project, post` dentro de cada empate.

- [ ] **Step 4: Ejecutar y ver pasar**

Run: `npx vitest run tests/search.test.ts`

Expected: PASS (7 tests).

- [ ] **Step 5: Claves de traducción nuevas**

En `src/i18n/translations.ts`, añadir dentro de `en`:

```
    'search.placeholder': 'Search posts, projects and pages',
    'search.empty': 'No results',
    'search.hint': 'Arrows to move, Enter to open, Escape to close',
    'search.close': 'Close',
    'search.kind.page': 'Page',
    'search.kind.project': 'Project',
    'search.kind.post': 'Post',
```

y dentro de `es`:

```
    'search.placeholder': 'Busca posts, proyectos y páginas',
    'search.empty': 'Sin resultados',
    'search.hint': 'Flechas para moverte, Intro para abrir, Escape para cerrar',
    'search.close': 'Cerrar',
    'search.kind.page': 'Página',
    'search.kind.project': 'Proyecto',
    'search.kind.post': 'Post',
```

Los tres `search.kind.*` se consultan desde la isla con una plantilla, ``t(`search.kind.${item.kind}`, lang)``. TypeScript resuelve esa plantilla a la unión de las tres claves literales, así que si falta cualquiera de ellas en `en` o en `es`, `astro check` falla. No hace falta ningún cast.

- [ ] **Step 6: Endpoint `src/pages/search.json.ts`**

Un solo fichero para los dos idiomas: la isla se descarga `/search.json` una vez y filtra por `lang` en cliente. Con `output: 'static'` Astro lo prerenderiza en `dist/search.json`.

```ts
import type { APIRoute } from 'astro';
import { t, type Locale } from '../i18n/translations';
import { getDescription } from '../lib/config';
import { getPosts } from '../lib/posts';
import { getProjects, projectSlug } from '../lib/projects';
import type { SearchItem } from '../lib/search';

const locales: Locale[] = ['en', 'es'];

const pages = [
  { key: 'nav.about', path: '/about' },
  { key: 'nav.projects', path: '/projects' },
  { key: 'nav.writing', path: '/blog' },
  { key: 'nav.stats', path: '/stats' },
  { key: 'nav.cv', path: '/cv' },
  { key: 'contact.title', path: '/#contact' },
] as const;

export const GET: APIRoute = async () => {
  const items: SearchItem[] = [];

  for (const lang of locales) {
    const prefix = lang === 'es' ? '/es' : '';

    for (const page of pages) {
      items.push({
        kind: 'page',
        lang,
        title: t(page.key, lang),
        text: getDescription(lang),
        url: `${prefix}${page.path}`,
      });
    }

    for (const project of await getProjects(lang)) {
      items.push({
        kind: 'project',
        lang,
        title: project.data.name,
        text: `${project.data.tagline} ${project.data.stack.join(' ')}`,
        url: `${prefix}/projects/${projectSlug(project)}`,
      });
    }

    for (const post of await getPosts(lang)) {
      items.push({
        kind: 'post',
        lang,
        title: post.data.title,
        text: `${post.data.description} ${post.data.tags.join(' ')}`,
        url: `${prefix}/blog/${post.id}`,
      });
    }
  }

  return new Response(JSON.stringify(items), {
    headers: { 'Content-Type': 'application/json' },
  });
};
```

- [ ] **Step 7: Fixture y test de la paleta**

Si la Task 6 ya está aplicada, `tests/islands.ts` existe y no se toca. Si no existe, crearlo con este contenido exacto:

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { getContainerRenderer } from '@astrojs/react/container-renderer';

export async function createIslandContainer() {
  const renderers = await loadRenderers([getContainerRenderer()]);
  return AstroContainer.create({ renderers });
}
```

`tests/fixtures/PaletteHost.astro`:

```astro
---
import CommandPalette from '../../src/components/islands/CommandPalette';
import type { Locale } from '../../src/i18n/translations';

interface Props {
  lang: Locale;
}
const { lang } = Astro.props;
---

<CommandPalette client:idle lang={lang} />
```

`tests/command-palette.test.ts`. La paleta nace cerrada, así que el HTML del servidor tiene que ser un `<astro-island>` vacío: ni diálogo, ni mensaje de "sin resultados", ni contenido que se vea un instante antes de hidratar.

```ts
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
```

- [ ] **Step 8: Ejecutar y ver fallar**

Run: `npx vitest run tests/command-palette.test.ts`

Expected: FAIL, la suite no carga:

```text
 FAIL  tests/command-palette.test.ts [ tests/command-palette.test.ts ]
Error: Cannot find module '../../src/components/islands/CommandPalette' imported from /home/alvarotc/Documents/apps/alvarotc-web/tests/fixtures/PaletteHost.astro
 ❯ tests/fixtures/PaletteHost.astro:2:1
```

- [ ] **Step 9: Escribir `src/components/islands/CommandPalette.tsx`**

Decisiones que el código fija y conviene no deshacer al leerlo:

- El índice se descarga con `fetch('/search.json')` la primera vez que se abre, nunca en el arranque. Si falla, `items` pasa a `[]` y la paleta muestra el mensaje vacío en vez de quedarse cargando para siempre.
- Con la paleta cerrada el componente devuelve `null`, así que el HTML del servidor y el primer render en cliente son idénticos.
- El foco queda atrapado entre el `<input>` y el botón de cerrar: `Tab` alterna entre los dos en ambos sentidos y no se escapa al resto de la página.
- El icono de lupa va inline: en islas React no se usa `Icon.astro`.

```tsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { navigate } from 'astro:transitions/client';
import { t, type Locale } from '../../i18n/translations';
import { searchItems, type SearchItem } from '../../lib/search';

export default function CommandPalette({ lang }: { lang: Locale }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<SearchItem[] | null>(null);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const results = searchItems(items ?? [], query, lang);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((value) => !value);
      } else if (event.key === 'Escape') {
        setOpen(false);
      }
    }
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('command-palette:open', onOpen);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('command-palette:open', onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = '';
      return;
    }
    document.body.style.overflow = 'hidden';
    inputRef.current?.focus();
    if (items === null) {
      fetch('/search.json')
        .then((response) => response.json())
        .then((data: unknown) => setItems(Array.isArray(data) ? (data as SearchItem[]) : []))
        .catch(() => setItems([]));
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open, items]);

  useEffect(() => setActive(0), [query]);

  function go(url: string) {
    setOpen(false);
    void navigate(url);
  }

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (results.length === 0) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((index) => (index + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((index) => (index - 1 + results.length) % results.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const item = results[active];
      if (item) go(item.url);
    }
  }

  function onDialogKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Tab') return;
    event.preventDefault();
    if (document.activeElement === closeRef.current) inputRef.current?.focus();
    else closeRef.current?.focus();
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-bg/80 px-4 pt-[12vh]"
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('nav.search', lang)}
        className="card w-full max-w-[560px] overflow-hidden"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={onDialogKeyDown}
      >
        <div className="flex items-center gap-2 border-b border-border px-4">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="shrink-0 text-faint"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls="palette-results"
            aria-activedescendant={results.length > 0 ? `palette-${active}` : undefined}
            placeholder={t('search.placeholder', lang)}
            autoComplete="off"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onInputKeyDown}
            className="h-12 flex-1 bg-transparent text-base outline-none"
          />
          <button
            ref={closeRef}
            type="button"
            aria-label={t('search.close', lang)}
            onClick={close}
            className="rounded border border-border px-1.5 py-0.5 font-mono text-[11px] text-faint"
          >
            Esc
          </button>
        </div>

        <ul id="palette-results" role="listbox" aria-label={t('nav.search', lang)}>
          {results.map((item, index) => (
            <li
              key={item.url}
              id={`palette-${index}`}
              role="option"
              aria-selected={index === active}
              onMouseEnter={() => setActive(index)}
              onClick={() => go(item.url)}
              className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 ${
                index === active ? 'bg-surface-2' : ''
              }`}
            >
              <span className="rounded-md bg-surface-2 px-1.5 text-[11px] font-bold text-muted">
                {t(`search.kind.${item.kind}`, lang)}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="text-sm font-semibold">{item.title}</span>
                <span className="line-clamp-1 text-[13px] text-muted">{item.text}</span>
              </span>
            </li>
          ))}
        </ul>

        {items !== null && results.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-muted">{t('search.empty', lang)}</p>
        )}

        <p className="border-t border-border px-4 py-2 text-[11px] text-faint">
          {t('search.hint', lang)}
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 10: Ejecutar y ver pasar**

Run: `npx vitest run tests/command-palette.test.ts tests/search.test.ts`

Expected: PASS (9 tests).

- [ ] **Step 11: Montar la paleta en `BaseLayout` y habilitar el botón del Nav**

En `src/layouts/BaseLayout.astro`, añadir el import junto a los otros componentes:

```
import Footer from '../components/site/Footer.astro';
import CommandPalette from '../components/islands/CommandPalette';
```

y montarla justo antes de cerrar `</body>`:

```
    <Footer lang={lang} currentPath={currentPath} alternatePath={alternate} />
    <CommandPalette client:idle lang={lang} />
  </body>
```

En `src/components/site/Nav.astro`, el botón pasa de estar desactivado a estar vivo. Antes:

```
      <button
        type="button"
        data-command-palette
        disabled
        aria-disabled="true"
        class="flex h-[34px] items-center gap-2 rounded-lg border border-border bg-surface pl-3 pr-2 text-[13px] text-muted"
      >
```

Después:

```
      <button
        type="button"
        data-command-palette
        class="flex h-[34px] items-center gap-2 rounded-lg border border-border bg-surface pl-3 pr-2 text-[13px] text-muted"
      >
```

Y el `<script>` del final del fichero se reescribe entero. El `bind()` actual sale antes de tiempo con un `return` cuando falta el menú móvil, y eso dejaría el botón de la paleta sin enlazar: hay que separar los dos enlaces. Antes:

```astro
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

Después:

```astro
<script>
  function bind() {
    const button = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
    const menu = document.getElementById('mobile-menu');
    if (button && menu && !button.dataset.bound) {
      button.dataset.bound = 'true';
      button.addEventListener('click', () => {
        const open = menu.hidden;
        menu.hidden = !open;
        button.setAttribute('aria-expanded', String(open));
      });
    }
    document.querySelectorAll<HTMLButtonElement>('[data-command-palette]').forEach((trigger) => {
      if (trigger.dataset.bound) return;
      trigger.dataset.bound = 'true';
      trigger.addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('command-palette:open'));
      });
    });
  }
  bind();
  document.addEventListener('astro:after-swap', bind);
</script>
```

En `tests/nav.test.ts`, el test que comprobaba que el botón estaba desactivado pasa a comprobar lo contrario. Antes:

```
  it('disables the command palette button', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Nav, {
      props: { lang: 'en', currentPath: '/' },
    });
    expect(html).toContain('aria-disabled="true"');
  });
```

Después:

```
  it('enables the command palette button', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Nav, {
      props: { lang: 'en', currentPath: '/' },
    });
    expect(html).toContain('data-command-palette');
    expect(html).not.toContain('aria-disabled');
  });
```

El resto de `tests/nav.test.ts` se deja como está; lo reescribe la Task 9.

- [ ] **Step 12: Build, lint, tests y comprobación sobre `dist/`**

Run: `npm run build && npm run lint && npm test`

Expected: build verde, `astro check` con 0 errores, Vitest todo en verde.

Tres comprobaciones sobre `dist/`, una por pieza:

```bash
head -c 140 dist/search.json
grep -c 'client="idle"' dist/index.html dist/es/index.html
grep -o 'bg-bg\\/80' dist/_astro/*.css | head -1
```

Expected:

```text
[{"kind":"page","lang":"en","title":"About","text":"Backend developer. Offline-first apps, self-hosted infrastructure, free software.","url"
dist/index.html:1
dist/es/index.html:1
dist/_astro/BaseLayout.<hash>.css:bg-bg\/80
```

La tercera es la que importa de verdad: `bg-bg/80` solo aparece en `CommandPalette.tsx` y nunca en el HTML prerenderizado, porque la paleta nace cerrada. Si Tailwind 4 no estuviera escaneando los `.tsx`, esa regla no existiría en el CSS y el fondo del overlay sería transparente en producción sin que ningún test lo notase.

Como comprobación adicional del contenido del índice:

```bash
node -e "const a=require('./dist/search.json');const c={};for(const i of a)c[i.kind+':'+i.lang]=(c[i.kind+':'+i.lang]||0)+1;console.log(JSON.stringify(c))"
```

Expected: un objeto con las seis combinaciones presentes y el mismo recuento en los dos idiomas, por ejemplo `{"page:en":6,"project:en":6,"post:en":5,"page:es":6,"project:es":6,"post:es":5}`. Los números de `project` y `post` dependen del contenido del repo; lo que se comprueba es que ninguna combinación falta y que `en` y `es` cuadran.

- [ ] **Step 13: Commit**

```bash
git add src/lib/search.ts src/pages/search.json.ts src/components/islands/CommandPalette.tsx src/layouts/BaseLayout.astro src/components/site/Nav.astro src/i18n/translations.ts tests/islands.ts tests/fixtures/PaletteHost.astro tests/command-palette.test.ts tests/search.test.ts tests/nav.test.ts
git commit -m "feat(search): static search index and a command palette island bound to the nav button"
```

---

### Task 8: Isla `ContactTerminal.tsx` con envío real al servicio de contacto

**Files:**

- Create: `src/lib/contact.ts`, `src/components/islands/ContactTerminal.tsx`, `tests/contact.test.ts`, `tests/contact-terminal.test.ts`, `tests/fixtures/ContactHost.astro`
- Modify: `site.config.ts`, `src/lib/config.ts`, `src/components/home/ContactSection.astro`, `src/styles/global.css`, `src/i18n/translations.ts`
- Test: `tests/contact.test.ts`, `tests/contact-terminal.test.ts`

**Interfaces:**

- Consumes: `t(key, lang)` y `type Locale` de `src/i18n/translations.ts` (la clave va primero); `getAuthor()` de `src/lib/config.ts`; `createIslandContainer()` de `tests/islands.ts` (lo crea la Task 6; dalo por existente).
- Produces:
  - `src/lib/config.ts`: `getContactEndpoint(): string`, `getCalLink(): string`.
  - `src/lib/contact.ts`: `type ContactFields = { from: string; subject: string; body: string }`; `type ContactFieldError = 'invalid_email' | 'subject_length' | 'body_length'`; `type ContactErrorCode = ContactFieldError | 'too_fast' | 'rate_limited' | 'network' | 'generic'`; `validateContact(fields: ContactFields): ContactFieldError | null`; `buildContactPayload(fields: ContactFields, website: string, elapsed: number): { from: string; subject: string; body: string; website: string; elapsed: number }`; `toErrorCode(serverError: unknown): ContactErrorCode`.
  - `src/components/islands/ContactTerminal.tsx`: `export default function ContactTerminal({ lang, endpoint }: { lang: Locale; endpoint: string })`.
  - Clases globales `.terminal`, `.terminal-bar`, `.terminal-muted`, `.terminal-input`, `.terminal-prompt`, `.terminal-button`, `.terminal-error` en `src/styles/global.css`.

Contrato del servicio (repo `alvarotc-contact`, verificado en `src/validate.ts` y `src/app.ts`): `POST https://contact.alvarotc.com/send` con JSON `{ from, subject, body, website, elapsed }`. `website` es el honeypot y debe ir vacío; `elapsed` son los milisegundos desde que se abrió el formulario y el servidor exige al menos 3000. El servidor recorta los tres campos y valida en este orden: email con formato, `subject` de 3 a 120 caracteres, `body` de 10 a 4000. Respuestas: `200 { ok: true }`; `400 { ok: false, error }` con `error` en `invalid_json | honeypot | too_fast | clock_skew | invalid_email | subject_length | body_length | missing_fields`; `429 { ok: false, error: 'rate_limited' }`; `502 { ok: false, error: 'send_failed' }`. CORS permite el origen `https://alvarotc.com`.

- [ ] **Step 1: Test de los helpers puros de contacto**

`tests/contact.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { buildContactPayload, toErrorCode, validateContact } from '../src/lib/contact';

const valid = { from: 'ana@example.com', subject: 'Hola', body: 'Un mensaje largo de prueba.' };

describe('validateContact', () => {
  it('accepts a well formed message', () => {
    expect(validateContact(valid)).toBeNull();
  });

  it('rejects a malformed email before anything else', () => {
    expect(validateContact({ ...valid, from: 'ana@example', subject: 'a', body: 'x' })).toBe(
      'invalid_email',
    );
    expect(validateContact({ ...valid, from: 'ana example.com' })).toBe('invalid_email');
    expect(validateContact({ ...valid, from: '' })).toBe('invalid_email');
  });

  it('checks the subject length after trimming', () => {
    expect(validateContact({ ...valid, subject: '  ab  ' })).toBe('subject_length');
    expect(validateContact({ ...valid, subject: 'abc' })).toBeNull();
    expect(validateContact({ ...valid, subject: 'a'.repeat(120) })).toBeNull();
    expect(validateContact({ ...valid, subject: 'a'.repeat(121) })).toBe('subject_length');
  });

  it('checks the body length after trimming', () => {
    expect(validateContact({ ...valid, body: '  123456789  ' })).toBe('body_length');
    expect(validateContact({ ...valid, body: '1234567890' })).toBeNull();
    expect(validateContact({ ...valid, body: 'a'.repeat(4000) })).toBeNull();
    expect(validateContact({ ...valid, body: 'a'.repeat(4001) })).toBe('body_length');
  });
});

describe('buildContactPayload', () => {
  it('trims the three fields and carries the honeypot and the elapsed time', () => {
    expect(
      buildContactPayload(
        { from: '  ana@example.com ', subject: '  Hola  ', body: '  Un mensaje largo.  ' },
        '',
        4200,
      ),
    ).toEqual({
      from: 'ana@example.com',
      subject: 'Hola',
      body: 'Un mensaje largo.',
      website: '',
      elapsed: 4200,
    });
  });
});

describe('toErrorCode', () => {
  it('passes through the codes the user can act on', () => {
    for (const code of [
      'invalid_email',
      'subject_length',
      'body_length',
      'too_fast',
      'rate_limited',
    ]) {
      expect(toErrorCode(code)).toBe(code);
    }
  });

  it('collapses everything else into generic', () => {
    expect(toErrorCode('send_failed')).toBe('generic');
    expect(toErrorCode('honeypot')).toBe('generic');
    expect(toErrorCode('clock_skew')).toBe('generic');
    expect(toErrorCode(undefined)).toBe('generic');
    expect(toErrorCode(42)).toBe('generic');
    expect(toErrorCode({ error: 'rate_limited' })).toBe('generic');
  });
});
```

- [ ] **Step 2: Ejecutar y ver fallar**

Run: `npx vitest run tests/contact.test.ts`
Expected: FAIL, `Error: Failed to load url ../src/lib/contact` / `Cannot find module '../src/lib/contact'`.

- [ ] **Step 3: Escribir `src/lib/contact.ts`**

Fichero nuevo completo:

```ts
export type ContactFields = { from: string; subject: string; body: string };

export type ContactFieldError = 'invalid_email' | 'subject_length' | 'body_length';

export type ContactErrorCode =
  ContactFieldError | 'too_fast' | 'rate_limited' | 'network' | 'generic';

export type ContactPayload = {
  from: string;
  subject: string;
  body: string;
  website: string;
  elapsed: number;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SUBJECT_MIN = 3;
const SUBJECT_MAX = 120;
const BODY_MIN = 10;
const BODY_MAX = 4000;

const PASS_THROUGH = [
  'invalid_email',
  'subject_length',
  'body_length',
  'too_fast',
  'rate_limited',
] as const;

export function validateContact(fields: ContactFields): ContactFieldError | null {
  const from = fields.from.trim();
  const subject = fields.subject.trim();
  const body = fields.body.trim();
  if (!EMAIL.test(from)) return 'invalid_email';
  if (subject.length < SUBJECT_MIN || subject.length > SUBJECT_MAX) return 'subject_length';
  if (body.length < BODY_MIN || body.length > BODY_MAX) return 'body_length';
  return null;
}

export function buildContactPayload(
  fields: ContactFields,
  website: string,
  elapsed: number,
): ContactPayload {
  return {
    from: fields.from.trim(),
    subject: fields.subject.trim(),
    body: fields.body.trim(),
    website,
    elapsed,
  };
}

export function toErrorCode(serverError: unknown): ContactErrorCode {
  if (typeof serverError !== 'string') return 'generic';
  return PASS_THROUGH.find((code) => code === serverError) ?? 'generic';
}
```

Los límites y el orden replican exactamente `parseContactRequest` del servicio, de modo que el error que se ve sin red es el mismo que devolvería el servidor.

- [ ] **Step 4: Ejecutar y ver pasar**

Run: `npx vitest run tests/contact.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Endpoint y enlace de llamada en la configuración**

En `site.config.ts`, añadir las dos claves después de `description` (antes de `author`):

Antes:

```
  description: {
    en: 'Backend developer. Offline-first apps, self-hosted infrastructure, free software.',
    es: 'Desarrollador backend. Apps offline-first, infraestructura autoalojada, software libre.',
  },

  author: {
```

Después:

```
  description: {
    en: 'Backend developer. Offline-first apps, self-hosted infrastructure, free software.',
    es: 'Desarrollador backend. Apps offline-first, infraestructura autoalojada, software libre.',
  },

  contactEndpoint: 'https://contact.alvarotc.com/send',
  calLink: 'https://cal.com/alvarotc',

  author: {
```

En `src/lib/config.ts`, añadir los dos getters después de `getDescription`:

```ts
export function getContactEndpoint(): string {
  return siteConfig.contactEndpoint;
}

export function getCalLink(): string {
  return siteConfig.calLink;
}
```

- [ ] **Step 6: Claves de traducción**

En `src/i18n/translations.ts`, dentro de `en`, borrar la línea `'contact.soon': 'Sending arrives with the next release. Use the email meanwhile.',` y añadir en su lugar:

```
    'contact.sending': 'Sending',
    'contact.sent': 'Sent. I will answer soon.',
    'contact.another': 'Send another',
    'contact.error.invalid_email': 'That email does not look right.',
    'contact.error.subject_length': 'The subject needs 3 to 120 characters.',
    'contact.error.body_length': 'The message needs 10 to 4000 characters.',
    'contact.error.too_fast': 'Too fast. Wait a second and try again.',
    'contact.error.rate_limited':
      'Too many messages from this network. Try again in an hour or use the email.',
    'contact.error.network': 'Could not reach the server. Use the email meanwhile.',
    'contact.error.generic': 'Something failed on my side. Use the email meanwhile.',
```

Y dentro de `es`, borrar la línea `'contact.soon': 'El envío llega en la próxima versión. Mientras, usa el email.',` y añadir en su lugar:

```
    'contact.sending': 'Enviando',
    'contact.sent': 'Enviado. Te contesto pronto.',
    'contact.another': 'Enviar otro',
    'contact.error.invalid_email': 'Ese email no parece correcto.',
    'contact.error.subject_length': 'El asunto necesita entre 3 y 120 caracteres.',
    'contact.error.body_length': 'El mensaje necesita entre 10 y 4000 caracteres.',
    'contact.error.too_fast': 'Demasiado rápido. Espera un segundo y vuelve a intentarlo.',
    'contact.error.rate_limited':
      'Demasiados mensajes desde esta red. Prueba en una hora o usa el email.',
    'contact.error.network': 'No se pudo contactar con el servidor. Usa el email mientras tanto.',
    'contact.error.generic': 'Algo ha fallado de mi lado. Usa el email mientras tanto.',
```

`contact.soon` se borra de los dos idiomas: `t()` indexa `translations[locale][key]`, así que una clave presente solo en uno rompe `astro check`.

- [ ] **Step 7: Clases del terminal en `global.css`**

En `src/styles/global.css`, dentro de `@layer components`, insertar el bloque justo después de la regla `.btn-primary:active, .btn-secondary:active { transform: scale(0.98); }` y antes de `.placeholder`:

```css
.terminal {
  background: #0b0d11;
  color: #e7e9ee;
  border: 1px solid #22262e;
  border-radius: 1rem;
  font-family: var(--font-mono);
}

.terminal-bar {
  background: #12151b;
  border-bottom: 1px solid #22262e;
}

.terminal-muted {
  color: #8a93a3;
}

.terminal-input {
  background: #0f1115;
  border: 1px solid #22262e;
  color: #e7e9ee;
  border-radius: 0.375rem;
  font-family: var(--font-mono);
}

.terminal-input::placeholder {
  color: #8a93a3;
}

.terminal-prompt {
  color: #5fd08a;
}

.terminal-button {
  background: #161920;
  border: 1px solid #2c313b;
  color: #e7e9ee;
  border-radius: 0.375rem;
  font-family: var(--font-mono);
}

.terminal-button:disabled {
  opacity: 0.6;
}

.terminal-error {
  color: #f0b37e;
}
```

El terminal es oscuro en los dos temas a propósito, por eso los colores son literales y no tokens. Contraste sobre `#0b0d11`: `#e7e9ee` 16.6, `#8a93a3` 6.3, `#5fd08a` 10.1, `#f0b37e` 10.6. `font-family` se repite en `.terminal-input` y `.terminal-button` porque los controles de formulario no heredan la fuente del contenedor.

- [ ] **Step 8: Test de render del servidor de la isla**

`tests/fixtures/ContactHost.astro`:

```astro
---
import ContactTerminal from '../../src/components/islands/ContactTerminal';
import type { Locale } from '../../src/i18n/translations';

interface Props {
  lang: Locale;
  endpoint: string;
}
const { lang, endpoint } = Astro.props;
---

<ContactTerminal client:visible lang={lang} endpoint={endpoint} />
```

`tests/contact-terminal.test.ts`:

```ts
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
```

- [ ] **Step 9: Ejecutar y ver fallar**

Run: `npx vitest run tests/contact-terminal.test.ts`
Expected: FAIL, `Failed to load url ../../src/components/islands/ContactTerminal` desde `tests/fixtures/ContactHost.astro`.

- [ ] **Step 10: Escribir `src/components/islands/ContactTerminal.tsx`**

Fichero nuevo completo:

```tsx
import { useRef, useState, type FormEvent } from 'react';
import { t, type Locale } from '../../i18n/translations';
import {
  buildContactPayload,
  toErrorCode,
  validateContact,
  type ContactErrorCode,
} from '../../lib/contact';

type Status = 'idle' | 'sending' | 'sent' | 'error';

interface Props {
  lang: Locale;
  endpoint: string;
}

export default function ContactTerminal({ lang, endpoint }: Props) {
  const [from, setFrom] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<ContactErrorCode | null>(null);
  const openedAt = useRef(Date.now());

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = { from, subject, body };
    const invalid = validateContact(fields);
    if (invalid) {
      setError(invalid);
      setStatus('error');
      return;
    }
    setError(null);
    setStatus('sending');
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildContactPayload(fields, website, Date.now() - openedAt.current)),
      });
      if (response.ok) {
        setFrom('');
        setSubject('');
        setBody('');
        setStatus('sent');
        return;
      }
      const payload: unknown = await response.json().catch(() => null);
      const code =
        typeof payload === 'object' && payload !== null && 'error' in payload
          ? payload.error
          : null;
      setError(toErrorCode(code));
      setStatus('error');
    } catch {
      setError('network');
      setStatus('error');
    }
  }

  function reset() {
    setError(null);
    setStatus('idle');
    openedAt.current = Date.now();
  }

  return (
    <form onSubmit={onSubmit} className="terminal flex flex-col overflow-hidden">
      <div className="terminal-bar flex items-center gap-2 px-3.5 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#2c313b]" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#2c313b]" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#2c313b]" aria-hidden="true" />
        <span className="terminal-muted ml-2 text-xs">alvarotc.com, mail</span>
      </div>
      <div className="flex flex-col gap-2.5 p-4 text-[13px] leading-relaxed">
        <p className="flex gap-2.5">
          <span className="terminal-prompt">$</span>
          <span>mail alvaro</span>
        </p>
        <fieldset disabled={status === 'sending'} className="contents">
          <div className="flex items-center gap-2.5">
            <label htmlFor="c-from" className="terminal-muted w-[60px]">
              {t('contact.from', lang)}
            </label>
            <input
              id="c-from"
              name="from"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              className="terminal-input h-[30px] flex-1 px-2.5 text-[13px]"
            />
          </div>
          <div className="flex items-center gap-2.5">
            <label htmlFor="c-subject" className="terminal-muted w-[60px]">
              {t('contact.subject', lang)}
            </label>
            <input
              id="c-subject"
              name="subject"
              type="text"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className="terminal-input h-[30px] flex-1 px-2.5 text-[13px]"
            />
          </div>
          <div className="flex items-start gap-2.5">
            <label htmlFor="c-body" className="terminal-muted w-[60px] pt-1.5">
              {t('contact.body', lang)}
            </label>
            <textarea
              id="c-body"
              name="body"
              rows={5}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              className="terminal-input flex-1 resize-y px-2.5 py-2 text-[13px]"
            />
          </div>
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="hidden"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
          />
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <p role="status" aria-live="polite" className="flex items-center gap-2.5 text-xs">
              {status === 'sent' && (
                <>
                  <span className="terminal-prompt">{t('contact.sent', lang)}</span>
                  <button
                    type="button"
                    onClick={reset}
                    className="terminal-button h-7 px-2.5 text-xs"
                  >
                    {t('contact.another', lang)}
                  </button>
                </>
              )}
              {status === 'error' && error !== null && (
                <span className="terminal-error">{t(`contact.error.${error}`, lang)}</span>
              )}
              {(status === 'idle' || status === 'sending') && (
                <span className="terminal-muted">{t('contact.note', lang)}</span>
              )}
            </p>
            {status !== 'sent' && (
              <button type="submit" className="terminal-button h-8 px-3.5 text-xs">
                {status === 'sending' ? t('contact.sending', lang) : t('contact.send', lang)} ↵
              </button>
            )}
          </div>
        </fieldset>
      </div>
    </form>
  );
}
```

Notas para el implementador:

- `<fieldset className="contents">` mantiene el `display: contents`, así que la columna de campos conserva el `gap-2.5` del contenedor y a la vez `disabled` se propaga a todos los controles mientras se envía.
- `t(\`contact.error.${error}\`, lang)`no necesita cast: el tipo literal de plantilla que produce`ContactErrorCode`es un subconjunto de`keyof typeof translations.en` porque las siete claves existen.
- El `?? null` de `response.json().catch(() => null)` cubre las respuestas sin cuerpo JSON; `toErrorCode(null)` devuelve `'generic'`.

- [ ] **Step 11: Ejecutar y ver pasar**

Run: `npx vitest run tests/contact-terminal.test.ts tests/contact.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 12: Montar la isla en `ContactSection.astro`**

`src/components/home/ContactSection.astro` completo (desaparecen el `<form>` estático, el `contact-soon` y el `calLink` hardcodeado; la tarjeta izquierda y su script de copiar se quedan igual):

```astro
---
import Icon from '../icons/Icon.astro';
import ContactTerminal from '../islands/ContactTerminal';
import { t, type Locale } from '../../i18n/translations';
import { getAuthor, getCalLink, getContactEndpoint } from '../../lib/config';

interface Props {
  lang: Locale;
}
const { lang } = Astro.props;
const { email } = getAuthor();
const calLink = getCalLink();
const endpoint = getContactEndpoint();
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
        <div class="flex items-center justify-between gap-2.5 rounded-lg border border-border bg-bg px-3 py-2.5">
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
      <a href={calLink} class="btn-primary h-10">
        {t('contact.call', lang)}
      </a>
      <div class="flex gap-3.5 text-[13px] text-accent">
        <a href="https://github.com/alvarotorresc">GitHub</a>
        <a href="https://www.linkedin.com/in/alvaro-torres-carrasco/">LinkedIn</a>
        <a href="https://x.com/torresc_alvaro">X</a>
      </div>
    </div>

    <ContactTerminal client:visible lang={lang} endpoint={endpoint} />
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

- [ ] **Step 13: Build, lint y tests**

Run: `npm run build && npm run lint && npm test`
Expected: los tres verdes. `astro check` no debe avisar de `contact.soon` en ningún sitio.

Comprobar que el terminal llega al HTML estático y que apunta al servicio:

```bash
grep -o 'name="website"' dist/index.html | wc -l
grep -o 'id="c-body"' dist/es/index.html | wc -l
grep -o 'https://contact.alvarotc.com/send' dist/es/index.html | head -1
grep -o 'contact.soon' dist/index.html | wc -l
```

Expected: `1`, `1`, `https://contact.alvarotc.com/send` y `0`. Los dos primeros prueban que la isla se renderizó entera en el servidor en las dos homes. Dos cuidados: `grep -c` no sirve porque Astro deja el HTML en muy pocas líneas y contaría líneas, no apariciones; y no se busca por nombre de clase (`terminal-input`) porque con `inlineStylesheets: 'auto'` el CSS puede acabar dentro del propio HTML y el recuento dejaría de medir el marcado.

- [ ] **Step 14: Commit**

```bash
git add src/lib/contact.ts src/lib/config.ts site.config.ts src/components/islands/ContactTerminal.tsx src/components/home/ContactSection.astro src/styles/global.css src/i18n/translations.ts tests/contact.test.ts tests/contact-terminal.test.ts tests/fixtures/ContactHost.astro
git commit -m "feat(contact): terminal island that sends through the self-hosted service"
```

---

### Task 9: Restaurar la navegación, los enlaces de la home y el test de rutas construidas

**Files:**

- Modify: `site.config.ts`, `src/lib/config.ts`, `src/components/site/Nav.astro`, `src/layouts/BaseLayout.astro`, `src/components/home/Hero.astro`, `src/components/home/About.astro`
- Test: `tests/nav.test.ts` (reescrito), `tests/build.test.ts` (reescrito)

**Interfaces:**

- Consumes: `t(key, lang)` y `type Locale`; `mirroredPath(lang, path)` de `src/lib/i18n-paths.ts`; `getExperience()` y `hasMockExperience(entries)` de `src/lib/experience.ts`.
- Produces:
  - `site.config.ts`: `export type NavItem = { key: string; href: string; requires?: 'experience' }` y `nav: NavItem[]`.
  - `src/lib/config.ts`: `getNav(): NavItem[]`.
  - `src/components/site/Nav.astro` Props: `{ lang: Locale; currentPath: string; alternatePath?: string; experienceVisible?: boolean }`.

Estado de partida (lo dejó la Task 7): el botón `data-command-palette` de `Nav.astro` ya no tiene `disabled` ni `aria-disabled="true"`, su `bind()` despacha `command-palette:open`, y `BaseLayout.astro` ya importa `CommandPalette` y lo monta con `<CommandPalette client:idle lang={lang} />` justo antes de `</body>`. Esta tarea no toca nada de eso.

Las claves `nav.experience`, `nav.cv`, `hero.cv` y `about.more` ya existen en los dos idiomas (`src/i18n/translations.ts`). **Esta tarea no añade ninguna clave de traducción.**

- [ ] **Step 1: Reescribir `tests/nav.test.ts`**

`tests/nav.test.ts` completo:

```ts
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Nav from '../src/components/site/Nav.astro';

describe('Nav', () => {
  it('renders every English link at the root', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Nav, {
      props: { lang: 'en', currentPath: '/' },
    });
    expect(html).toContain('href="/about"');
    expect(html).toContain('href="/#projects"');
    expect(html).toContain('href="/blog"');
    expect(html).toContain('href="/stats"');
    expect(html).toContain('href="/cv"');
    expect(html).toContain('href="/es/"');
    expect(html).toContain('aria-label="Toggle theme"');
  });

  it('hides the experience entry while the experience is mock', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Nav, {
      props: { lang: 'en', currentPath: '/' },
    });
    expect(html).not.toContain('#experience');
  });

  it('shows the experience entry when the caller says it is visible', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Nav, {
      props: { lang: 'en', currentPath: '/', experienceVisible: true },
    });
    expect(html).toContain('href="/#experience"');
    expect(html).toContain('Experience');
  });

  it('enables the command palette button', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Nav, {
      props: { lang: 'en', currentPath: '/' },
    });
    expect(html).toContain('data-command-palette');
    expect(html).not.toContain('aria-disabled');
  });

  it('prefixes links with /es for Spanish', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Nav, {
      props: { lang: 'es', currentPath: '/es/' },
    });
    expect(html).toContain('href="/es/about"');
    expect(html).toContain('href="/es/#projects"');
    expect(html).toContain('href="/es/cv"');
    expect(html).toContain('href="/"');
    expect(html).toContain('Sobre mí');
  });

  it('uses an explicit alternate path when the page provides one', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Nav, {
      props: {
        lang: 'en',
        currentPath: '/blog/from-an-idea',
        alternatePath: '/es/blog/de-una-idea',
      },
    });
    expect(html).toContain('href="/es/blog/de-una-idea"');
    expect(html).not.toContain('href="/es/blog/from-an-idea"');
  });
});
```

- [ ] **Step 2: Ejecutar y ver fallar**

Run: `npx vitest run tests/nav.test.ts`
Expected: FAIL en el primer test, `expected '<header ...>' to contain 'href="/about"'` (hoy el nav pinta `/#about` y no tiene ni `/stats` ni `/cv`).

- [ ] **Step 3: Nav tipado en `site.config.ts` y `src/lib/config.ts`**

En `site.config.ts`, añadir el tipo arriba del todo, antes de `export const siteConfig`:

```ts
export type NavItem = { key: string; href: string; requires?: 'experience' };
```

y sustituir el bloque `nav`:

Antes:

```
  nav: [
    { key: 'nav.about', href: '/#about' },
    { key: 'nav.projects', href: '/#projects' },
    { key: 'nav.writing', href: '/blog' },
    { key: 'nav.stats', href: '/#stats' },
  ],
```

Después:

```
  nav: [
    { key: 'nav.about', href: '/about' },
    { key: 'nav.projects', href: '/#projects' },
    { key: 'nav.experience', href: '/#experience', requires: 'experience' },
    { key: 'nav.writing', href: '/blog' },
    { key: 'nav.stats', href: '/stats' },
    { key: 'nav.cv', href: '/cv' },
  ] as NavItem[],
```

El `as NavItem[]` es necesario: sin él TypeScript infiere la unión del literal y ensancha `requires` a `string`, y el filtro de `Nav.astro` deja de comprobar nada.

En `src/lib/config.ts`, cambiar el import y anotar el retorno:

Antes:

```ts
import { siteConfig } from '../../site.config';
```

Después:

```ts
import { siteConfig, type NavItem } from '../../site.config';
```

Antes:

```ts
export function getNav() {
  return siteConfig.nav;
}
```

Después:

```ts
export function getNav(): NavItem[] {
  return siteConfig.nav;
}
```

- [ ] **Step 4: `Nav.astro` filtra la entrada de experiencia**

En `src/components/site/Nav.astro`, cambiar solo el frontmatter (el marcado y el `<script>` que dejó la Task 7 no se tocan):

Antes:

```
interface Props {
  lang: Locale;
  currentPath: string;
  alternatePath?: string;
}
const { lang, currentPath, alternatePath } = Astro.props;

const prefix = lang === 'es' ? '/es' : '';
const items = getNav().map((item) => ({
  label: t(item.key as keyof typeof translations.en, lang),
  href: `${prefix}${item.href}`,
}));
```

Después:

```
interface Props {
  lang: Locale;
  currentPath: string;
  alternatePath?: string;
  experienceVisible?: boolean;
}
const { lang, currentPath, alternatePath, experienceVisible = false } = Astro.props;

const prefix = lang === 'es' ? '/es' : '';
const items = getNav()
  .filter((item) => item.requires !== 'experience' || experienceVisible)
  .map((item) => ({
    label: t(item.key as keyof typeof translations.en, lang),
    href: `${prefix}${item.href}`,
  }));
```

- [ ] **Step 5: Ejecutar y ver pasar**

Run: `npx vitest run tests/nav.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 6: `BaseLayout.astro` calcula `experienceVisible`**

En `src/layouts/BaseLayout.astro`, añadir el import junto a los demás de `../lib`:

Antes:

```
import { getSiteName, getDescription, getAuthor } from '../lib/config';
import { mirroredPath } from '../lib/i18n-paths';
```

Después:

```
import { getSiteName, getDescription, getAuthor } from '../lib/config';
import { getExperience, hasMockExperience } from '../lib/experience';
import { mirroredPath } from '../lib/i18n-paths';
```

Añadir el cálculo justo después de `const alternateURL = new URL(alternate, Astro.site);`:

```astro
const experienceVisible = !hasMockExperience(await getExperience());
```

Y pasar el prop en el `<body>`:

Antes:

```astro
<Nav lang={lang} currentPath={currentPath} alternatePath={alternate} />
```

Después:

```astro
<Nav
  lang={lang}
  currentPath={currentPath}
  alternatePath={alternate}
  experienceVisible={experienceVisible}
/>
```

Nadie más necesita el dato: `ExperienceTimeline.astro` ya tiene su propio gate.

Con este cambio `BaseLayout.astro` pasa a leer una colección, así que deja de poder renderizarse con la Container API. Comprobado el 2026-09-20: ningún test del repo renderiza `BaseLayout` ni una página que lo envuelva (`grep -rln "BaseLayout\|layouts/" tests/` no devuelve nada), así que no hay ningún test que arreglar. Los tests nuevos de este plan tampoco deben intentarlo.

- [ ] **Step 7: Botón de CV en el hero y enlace a `/about`**

`src/components/home/Hero.astro`, frontmatter:

Antes:

```astro
const {lang} = Astro.props;
```

Después:

```astro
const {lang} = Astro.props; const prefix = lang === 'es' ? '/es' : '';
```

y el bloque de acciones:

Antes:

```astro
<div class="hero-in flex gap-3 pt-1" style="animation-delay: 180ms">
  <a href="#contact" class="btn-primary">
    {t('hero.contact', lang)}
  </a>
</div>
```

Después:

```astro
<div class="hero-in flex flex-wrap gap-3 pt-1" style="animation-delay: 180ms">
  <a href="#contact" class="btn-primary">
    {t('hero.contact', lang)}
  </a>
  <a href={`${prefix}/cv`} class="btn-secondary">
    {t('hero.cv', lang)}
  </a>
</div>
```

`src/components/home/About.astro`, frontmatter:

Antes:

```astro
const {lang} = Astro.props; const paragraphs = {}
```

Después:

```astro
const {lang} = Astro.props; const prefix = lang === 'es' ? '/es' : ''; const paragraphs = {}
```

y el cierre de la columna de texto:

Antes:

```astro
<ul class="flex flex-wrap gap-2 pt-1">
  {tags.map((key) => (
    <li class="rounded-md bg-surface-2 px-2.5 py-1 text-xs font-bold text-muted">{t(key, lang)}</li>
  ))}
</ul>
```

Después:

```astro
<ul class="flex flex-wrap gap-2 pt-1">
  {tags.map((key) => (
    <li class="rounded-md bg-surface-2 px-2.5 py-1 text-xs font-bold text-muted">{t(key, lang)}</li>
  ))}
</ul>
<a href={`${prefix}/about`} class="text-sm font-semibold text-accent">
  {t('about.more', lang)}
</a>
```

- [ ] **Step 8: Reescribir `tests/build.test.ts`**

`tests/build.test.ts` completo (sustituye el placeholder actual):

```ts
import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const dist = resolve('dist');
const built = existsSync(dist);

const routes = [
  'index.html',
  'es/index.html',
  'about/index.html',
  'es/about/index.html',
  'cv/index.html',
  'es/cv/index.html',
  'stats/index.html',
  'es/stats/index.html',
  'projects/index.html',
  'es/projects/index.html',
  'projects/bito/index.html',
  'es/projects/bito/index.html',
  'blog/index.html',
  'es/blog/index.html',
  'search.json',
  '404.html',
  'es/404/index.html',
];

const experienceDir = resolve('src/content/experience');
const experienceIsMock = readdirSync(experienceDir)
  .filter((file) => file.endsWith('.yaml'))
  .some((file) => /^mock:\s*true\s*$/m.test(readFileSync(join(experienceDir, file), 'utf8')));

describe.skipIf(!built)('built routes', () => {
  it.each(routes)('builds %s', (route) => {
    expect(existsSync(join(dist, route))).toBe(true);
  });
});

describe.skipIf(!built)('built home page', () => {
  it('has no placeholder markers left', () => {
    const html = readFileSync(join(dist, 'index.html'), 'utf8');
    expect(html).not.toContain('[placeholder]');
  });

  it('links to the experience section only when the experience is real', () => {
    const html = readFileSync(join(dist, 'index.html'), 'utf8');
    if (experienceIsMock) expect(html).not.toContain('href="/#experience"');
    else expect(html).toContain('href="/#experience"');
  });
});
```

Sin `dist/` los dos `describe` quedan saltados, así que `npm test` a secas sigue siendo verde en local. En CI el orden es build y luego test, y ahí sí corren. Comprobado el 2026-09-20 sobre Vitest 5.0.1: `describe.skipIf(...)` y `it.each([...])` funcionan tal cual en este proyecto. `projects/bito` es una ruta segura para la lista: `src/content/projects/{en,es}/bito.md` no declaran `visible`, y el schema lo deja en `z.boolean().default(true)`, así que `getProjects` los incluye.

- [ ] **Step 9: Build y ejecutar los tests contra `dist/`**

Run: `npm run build && npm test`
Expected: build verde; `tests/build.test.ts` ejecuta 19 tests y todos pasan (17 rutas más las dos aserciones de la home). Mientras los cuatro YAML de `src/content/experience/` sigan con `mock: true`, la segunda aserción comprueba la ausencia de `href="/#experience"`.

- [ ] **Step 10: Comprobar que ningún enlace interno queda muerto**

Run (bash, desde la raíz del repo, con `dist/` recién construido):

```bash
missing=0
for p in $(grep -rhoE 'href="/[^":#?]*"' dist --include='*.html' | sed 's/href="//; s/"$//' | sort -u); do
  rel="${p#/}"; [ -z "$rel" ] && rel="index.html"
  if [ -e "dist/$rel" ] || [ -e "dist/${rel%/}/index.html" ] || [ -e "dist/${rel%/}.html" ]; then :; else echo "MISSING $p"; missing=1; fi
done
[ "$missing" -eq 0 ] && echo "all internal links resolve"
```

Expected: una sola línea, `all internal links resolve`. Cualquier línea `MISSING /x` señala un enlace a una ruta que no se ha construido y hay que arreglarlo antes de seguir. Detalles del script, comprobados contra el `dist/` actual del repo: `--include='*.html'` evita que grep entre en los PNG y en los sitemaps; la clase negada excluye los anclas, así que `/#projects` nunca entra; la tercera rama (`dist/<ruta>.html`) es la que resuelve `/404/`, porque Astro emite el 404 de la raíz como `dist/404.html` y no como directorio, y el conmutador de idioma de `/es/404/` apunta ahí.

- [ ] **Step 11: Lint y tests completos**

Run: `npm run lint && npm test`
Expected: los dos verdes.

- [ ] **Step 12: Commit**

```bash
git add site.config.ts src/lib/config.ts src/components/site/Nav.astro src/layouts/BaseLayout.astro src/components/home/Hero.astro src/components/home/About.astro tests/nav.test.ts tests/build.test.ts
git commit -m "feat(nav): restore the full navigation and verify every internal link"
```

---

### Task 10: Deuda de cabecera, fuentes, assets y contenido mock

**Files:**

- Create: `src/types/global.d.ts`, `tests/og.test.ts`
- Modify: `package.json` (`@fontsource/manrope`), `src/layouts/BaseLayout.astro`, `src/components/site/ThemeToggle.astro`, `src/lib/og.ts`, `src/lib/mock-report.ts`, `src/components/home/NowCards.astro`, `src/pages/index.astro`, `src/pages/es/index.astro`, `src/styles/global.css`, `public/manifest.json`, `public/favicon.svg`
- Delete: `src/components/ui/Placeholder.astro`
- Test: `tests/og.test.ts`

**Interfaces:**

- Consumes: `getSiteName()` de `src/lib/config.ts`; `getEntry` y `getCollection` de `astro:content`; `mockEntries`/`warnMock` de `src/lib/mock-report.ts`.
- Produces:
  - `src/lib/mock-report.ts`: `reportMockContent(): Promise<void>`.
  - `src/types/global.d.ts`: `Window.__applyTheme?: (theme: 'light' | 'dark') => void`.
  - `src/lib/og.ts`: `generateOGImage(options: { title: string; subtitle?: string }): Promise<Buffer>` sin red (desaparece `generateDefaultOGImage`).

Estado de partida (lo dejó la Task 7): `BaseLayout.astro` ya importa `CommandPalette` y lo monta con `<CommandPalette client:idle lang={lang} />` antes de `</body>`; la Task 9 ya le añadió `experienceVisible`. Esta tarea solo toca el `<head>`.

- [ ] **Step 1: Instalar la fuente que usa satori y comprobar los ficheros**

Run:

```bash
npm install @fontsource/manrope@^5.3.0
ls node_modules/@fontsource/manrope/files/ | grep -E 'latin-(400|700)-normal\.woff$'
```

Expected: `npm install` añade `"@fontsource/manrope": "^5.3.0"` a `dependencies` (dependencia normal, no de desarrollo, porque la usa el build) y el `ls` imprime exactamente estas dos líneas:

```
manrope-latin-400-normal.woff
manrope-latin-700-normal.woff
```

Si el `ls` no encuentra los `.woff` (solo `.woff2`), parar y avisar: satori no lee woff2 y hay que decidir otra fuente. No improvisar con un `fetch`.

- [ ] **Step 2: Test de la imagen OG**

`tests/og.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { generateOGImage } from '../src/lib/og';

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

describe('generateOGImage', () => {
  it('reads the font from node_modules, never from a CDN', () => {
    const source = readFileSync('src/lib/og.ts', 'utf8');
    expect(source).toContain('@fontsource/manrope');
    expect(source).not.toContain('cdn.jsdelivr.net');
    expect(source).not.toContain('generateDefaultOGImage');
  });

  it('returns a PNG buffer', async () => {
    const png = await generateOGImage({ title: 'Hola', subtitle: 'Prueba' });
    expect([...png.subarray(0, 8)]).toEqual(PNG_SIGNATURE);
  }, 20000);
});
```

La firma PNG es la prueba real de que satori ha sabido parsear el `.woff`: si el fichero no fuese una fuente válida, `satori()` lanzaría antes de llegar a sharp.

- [ ] **Step 3: Ejecutar y ver fallar**

Run: `npx vitest run tests/og.test.ts`
Expected: FAIL en el primer test, `expected '...' to contain '@fontsource/manrope'` (hoy `src/lib/og.ts` descarga Plus Jakarta Sans de `cdn.jsdelivr.net`). El segundo test puede pasar o fallar según haya red; da igual, el primero ya es rojo.

- [ ] **Step 4: Reescribir `src/lib/og.ts`**

Fichero completo:

```ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import satori from 'satori';
import sharp from 'sharp';
import { getSiteName } from './config';

interface OGImageOptions {
  title: string;
  subtitle?: string;
}

const FONT_DIR = 'node_modules/@fontsource/manrope/files';

let fontRegular: Buffer | null = null;
let fontBold: Buffer | null = null;

function loadFonts(): { regular: Buffer; bold: Buffer } {
  if (!fontRegular) {
    fontRegular = readFileSync(resolve(process.cwd(), FONT_DIR, 'manrope-latin-400-normal.woff'));
  }
  if (!fontBold) {
    fontBold = readFileSync(resolve(process.cwd(), FONT_DIR, 'manrope-latin-700-normal.woff'));
  }
  return { regular: fontRegular, bold: fontBold };
}

export async function generateOGImage(options: OGImageOptions): Promise<Buffer> {
  const fonts = loadFonts();

  const svg = await satori(
    // @ts-expect-error satori accepts this format but types don't match ReactNode
    {
      type: 'div',
      props: {
        style: {
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px',
          backgroundColor: '#0f1115',
          fontFamily: 'Manrope',
          position: 'relative',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '24px',
                      fontWeight: 700,
                      color: '#4f8ef7',
                      textTransform: 'uppercase',
                      letterSpacing: '2px',
                    },
                    children: getSiteName(),
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '56px',
                      fontWeight: 700,
                      color: '#e7e9ee',
                      lineHeight: 1.2,
                      maxWidth: '900px',
                    },
                    children: options.title,
                  },
                },
                options.subtitle
                  ? {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: '24px',
                          color: '#9aa3b2',
                          marginTop: '8px',
                        },
                        children: options.subtitle,
                      },
                    }
                  : null,
              ].filter(Boolean),
            },
          },
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                bottom: '60px',
                left: '60px',
                right: '60px',
                height: '4px',
                backgroundColor: '#4f8ef7',
              },
              children: '',
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Manrope', data: fonts.regular, weight: 400, style: 'normal' },
        { name: 'Manrope', data: fonts.bold, weight: 700, style: 'normal' },
      ],
    },
  );

  return sharp(Buffer.from(svg)).png().toBuffer();
}
```

Cambios respecto al fichero anterior: `loadFonts` deja de ser `async` y de usar `fetch`; las cachés pasan de `ArrayBuffer | null` a `Buffer | null` porque eso es lo que devuelve `readFileSync`; los colores pasan a los tokens del tema oscuro actual; la barra inferior es un color sólido en vez de `linear-gradient`; y `generateDefaultOGImage` desaparece (nadie la llamaba, `grep -rn 'generateDefaultOGImage' src/` lo confirma antes de borrarla).

- [ ] **Step 5: Ejecutar y ver pasar**

Run: `npx vitest run tests/og.test.ts`
Expected: PASS (2 tests), el segundo en unos pocos segundos y sin tráfico de red.

- [ ] **Step 6: `theme-color` único gobernado por el script**

`src/types/global.d.ts` (fichero nuevo completo):

```ts
export {};

declare global {
  interface Window {
    __applyTheme?: (theme: 'light' | 'dark') => void;
  }
}
```

En `src/layouts/BaseLayout.astro`, sustituir las dos metas por una:

Antes:

```astro
<meta name="theme-color" content="#0f1115" media="(prefers-color-scheme: dark)" />
<meta name="theme-color" content="#f7f8fa" media="(prefers-color-scheme: light)" />
```

Después:

```astro
<meta name="theme-color" content="#0f1115" />
```

La meta se queda donde está, por encima del script inline: el `querySelector` del script depende de ese orden.

Y sustituir el script inline entero:

Antes:

```astro
<script is:inline>
  (function () {
    function apply() {
      var theme = 'dark';
      try {
        var stored = localStorage.getItem('theme');
        if (stored === 'light' || stored === 'dark') theme = stored;
        else theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } catch {
        /* keep default */
      }
      document.documentElement.dataset.theme = theme;
    }
    apply();
    document.addEventListener('astro:after-swap', apply);
  })();
</script>
```

Después:

```astro
<script is:inline>
  (function () {
    window.__applyTheme = function (theme) {
      document.documentElement.dataset.theme = theme;
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', theme === 'dark' ? '#0f1115' : '#f7f8fa');
    };
    function apply() {
      var theme = 'dark';
      try {
        var stored = localStorage.getItem('theme');
        if (stored === 'light' || stored === 'dark') theme = stored;
        else theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } catch {
        /* keep default */
      }
      window.__applyTheme(theme);
    }
    apply();
    document.addEventListener('astro:after-swap', apply);
  })();
</script>
```

En `src/components/site/ThemeToggle.astro`, el `<script>`:

Antes:

```
      button.addEventListener('click', () => {
        const current = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = next;
        try {
```

Después:

```
      button.addEventListener('click', () => {
        const current = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        if (typeof window.__applyTheme === 'function') window.__applyTheme(next);
        else document.documentElement.dataset.theme = next;
        try {
```

El resto del fichero (el `localStorage.setItem`, el `bind()` y el `astro:after-swap`) no cambia.

- [ ] **Step 7: Preload de la fuente latina**

En `src/layouts/BaseLayout.astro`, añadir el import al principio del frontmatter, justo debajo de los imports de fuentes:

Antes:

```astro
import '@fontsource-variable/manrope'; import '@fontsource/jetbrains-mono/400.css'; import
'@fontsource/jetbrains-mono/500.css'; import '../styles/global.css';
```

Después:

```astro
import '@fontsource-variable/manrope'; import '@fontsource/jetbrains-mono/400.css'; import
'@fontsource/jetbrains-mono/500.css'; import manropeLatin from
'@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2?url'; import
'../styles/global.css';
```

Y el `<link>` en el `<head>`, justo después del manifest:

Antes:

```astro
<link rel="manifest" href="/manifest.json" />
<link rel="canonical" href={canonicalURL} />
```

Después:

```astro
<link rel="manifest" href="/manifest.json" />
<link rel="preload" as="font" type="font/woff2" crossorigin href={manropeLatin} />
<link rel="canonical" href={canonicalURL} />
```

Dos cosas comprobadas el 2026-09-20 sobre el paquete instalado: el import profundo está permitido, porque el `exports` de `@fontsource-variable/manrope` declara `"./files/*.woff2": { "default": "./files/*.woff2" }`; y el fichero existe, `node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2`. Además, `vite.build.assetsInlineLimit: 0` en `astro.config.mjs` garantiza que la fuente se emite como fichero con hash y no se inlinea, así que el `href` del preload es la misma URL que usa el `@font-face`.

- [ ] **Step 8: Manifest y favicon**

`public/manifest.json` completo:

```json
{
  "name": "Álvaro Torres Carrasco",
  "short_name": "alvarotc",
  "description": "Backend developer. Offline-first apps, self-hosted infrastructure, free software.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f1115",
  "theme_color": "#0f1115",
  "icons": [
    {
      "src": "/favicon.svg",
      "sizes": "any",
      "type": "image/svg+xml"
    }
  ]
}
```

`public/favicon.svg` completo:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#0f1115"/>
  <text x="50" y="70" font-family="Manrope, system-ui, sans-serif" font-size="60" font-weight="700" fill="#4f8ef7" text-anchor="middle">A</text>
</svg>
```

- [ ] **Step 9: `NowCards.astro` deja de tragarse un proyecto que no existe**

En `src/components/home/NowCards.astro`, el frontmatter:

Antes:

```astro
const project = await getEntry('projects', `${lang}/${building.project}`);
```

Después:

```astro
const project = await getEntry('projects', `${lang}/${building.project}`); if (!project) throw new
Error(`now.yaml points to a missing project: ${lang}/${building.project}`);
```

Con el `throw`, los tres accesos opcionales de la tarjeta "building" quedan muertos y hay que quitarlos:

Antes:

```
    {
      project?.data.icon ? (
```

Después:

```
    {
      project.data.icon ? (
```

Antes:

```astro
<span class="text-[13px] font-bold leading-snug">{project?.data.name ?? building.project}</span>
<span class="font-mono text-xs text-muted">
  {lastCommit ? `${lastCommit.message}, ${lastCommit.when}` : (project?.data.tagline ?? '')}
</span>
```

Después:

```astro
<span class="text-[13px] font-bold leading-snug">{project.data.name}</span>
<span class="font-mono text-xs text-muted">
  {lastCommit ? `${lastCommit.message}, ${lastCommit.when}` : project.data.tagline}
</span>
```

En el `<img>` de la tarjeta, `src={project.data.icon}` sustituye a `src={project?.data.icon}` (dentro de la rama ternaria ya está garantizado que existe).

- [ ] **Step 10: `reportMockContent()` compartido por las dos homes**

`src/lib/mock-report.ts` completo:

```ts
/* eslint-disable no-console */
import { getCollection } from 'astro:content';

export function mockEntries(entries: Array<{ id: string; data: { mock?: boolean } }>): string[] {
  return entries.filter((e) => e.data.mock === true).map((e) => e.id);
}

export function warnMock(label: string, ids: string[]): void {
  if (ids.length === 0) return;
  console.warn(`[mock] ${label}: ${ids.join(', ')}`);
}

export async function reportMockContent(): Promise<void> {
  warnMock('experience', mockEntries(await getCollection('experience')));
  warnMock('now', mockEntries(await getCollection('now')));
  warnMock('interests', mockEntries(await getCollection('interests')));
}
```

El import de `astro:content` a nivel de módulo no rompe `tests/mock-report.test.ts`: el precedente está ya en el repo, `src/lib/experience.ts` importa `getCollection` de `astro:content` y `tests/experience.test.ts` importa de ese módulo sin problemas. Lo que no se puede hacer en tests es _llamar_ a `getCollection`, y `mockEntries`/`warnMock` siguen siendo puras.

En `src/pages/index.astro`, sustituir el import y las tres llamadas:

Antes:

```
import { mockEntries, warnMock } from '../lib/mock-report';
```

Después:

```astro
import {reportMockContent} from '../lib/mock-report';
```

Antes:

```astro
warnMock('experience', mockEntries(await getCollection('experience'))); warnMock('now',
mockEntries(await getCollection('now'))); warnMock('interests', mockEntries(await
getCollection('interests')));
```

Después:

```astro
await reportMockContent();
```

Tras la Task 1 la home ya lee los posts con `getPosts`, así que esas tres líneas eran el último uso de `getCollection` en el fichero: borrar también `import { getCollection } from 'astro:content';` de la primera línea del frontmatter, o ESLint fallará con `'getCollection' is defined but never used`.

En `src/pages/es/index.astro`, añadir el import y la llamada (esta home no avisaba de nada hasta ahora) y quitar igualmente el import de `getCollection` si la Task 1 lo dejó sin uso:

Antes:

```
import { getSiteName, getDescription, getAuthor } from '../../lib/config';
import { getProjects } from '../../lib/projects';
```

Después:

```
import { getSiteName, getDescription, getAuthor } from '../../lib/config';
import { getProjects } from '../../lib/projects';
import { reportMockContent } from '../../lib/mock-report';
```

y justo debajo de `const author = getAuthor();`:

```astro
await reportMockContent();
```

- [ ] **Step 11: Borrar `Placeholder.astro` y la clase `.placeholder`**

Antes de borrar, comprobar que nadie lo importa:

Run: `grep -rn "Placeholder" src/ tests/`
Expected: sin resultados (el propio fichero no contiene la palabra con mayúscula; si alguna tarea anterior lo hubiese importado, aparecería aquí y habría que quitar ese uso primero).

Run:

```bash
git rm src/components/ui/Placeholder.astro
```

Y en `src/styles/global.css`, borrar el bloque completo de `@layer components`:

```css
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
```

- [ ] **Step 12: Build, lint y tests**

Run: `npm run build && npm run lint && npm test`
Expected: los tres verdes. `astro check` no debe dar ningún error por `window.__applyTheme` (lo declara `src/types/global.d.ts`, incluido por el `"include": ["**/*"]` del `tsconfig.json`).

- [ ] **Step 13: Verificaciones sobre `dist/` y sobre las fuentes**

Run:

```bash
grep -o 'name="theme-color"' dist/index.html | wc -l
grep -roE 'manrope-latin-wght-normal\.[A-Za-z0-9_-]+\.woff2' dist | sed 's/.*://' | sort -u
grep -o 'rel="preload" as="font"' dist/index.html
grep -rn 'placeholder' src/ | grep -vE 'placeholder=|::placeholder|search\.placeholder'
```

Expected:

1. `1` (una sola meta `theme-color`; hoy da `2`). Aquí hace falta `grep -o ... | wc -l` y no `grep -c`: Astro deja el HTML en muy pocas líneas y `grep -c` cuenta líneas, así que imprimiría `1` con una meta y con dos.
2. Exactamente **una** línea, del tipo `manrope-latin-wght-normal.D1a2B3c4.woff2`: el preload y el `@font-face` apuntan al mismo fichero. Si salen dos hashes, el preload descarga una fuente que nadie usa: parar y avisar antes de commitear.
3. `rel="preload" as="font"`.
4. Sin resultados. Los únicos usos legítimos que quedan de la palabra son el atributo `placeholder=` del input del terminal, la pseudo-clase `.terminal-input::placeholder` de `global.css` y la clave `search.placeholder` de las traducciones.

- [ ] **Step 14: Commit**

El borrado de `src/components/ui/Placeholder.astro` ya quedó preparado con el `git rm` del Step 11, así que no hace falta volver a añadirlo.

```bash
git add package.json package-lock.json src/types/global.d.ts src/layouts/BaseLayout.astro src/components/site/ThemeToggle.astro src/lib/og.ts src/lib/mock-report.ts src/components/home/NowCards.astro src/pages/index.astro src/pages/es/index.astro src/styles/global.css public/manifest.json public/favicon.svg tests/og.test.ts
git commit -m "fix(head): single theme-color, local OG font, real manifest and favicon"
```

---

## Autorrevisión y decisiones de redacción

- Cobertura de la spec: rutas de la sección 4 que entran en este plan (`/about`, `/cv`, `/stats`, `/projects/[slug]`, blog nuevo) cubiertas por las Tasks 1 a 5; componentes de la sección 8 (`Timeline.tsx`, `CommandPalette.tsx`, `ContactTerminal.tsx`, `PlaygroundFrame.astro`, `CvSheet.astro`, `StatsGrid.astro`, `ContributionHeatmap.astro`) por las Tasks 2, 4, 5, 6, 7 y 8; contacto de la sección 12 por la Task 8; accesibilidad de la sección 13 (foco atrapado, Escape, flechas, controles nativos, móvil) por las Tasks 6, 7 y 8. Quedan para el plan C: `/blog/[slug].md`, `llms.txt`, `llms-full.txt`, `/rss-en.xml`, JSON-LD `dateModified` y `keywords` en posts, `fetch-data.ts` y el workflow de refresco, Lighthouse CI, CLAUDE.md y limpieza.
- La versión que muestra la cabecera de una ficha de proyecto es la del primer cambio del changelog con `date` (misma entrada que "Last release"); un cambio sin fecha no cuenta como publicado.
- El terminal de contacto es oscuro en ambos temas; sus colores son literales en `.terminal-*` y cumplen AA sobre su propio fondo. El mensaje de enviado usa `.terminal-prompt` y la nota `.terminal-muted`.
- El raíl de acento de la timeline sale del servidor con `scaleY(0)` y se rellena al hidratar; es decorativo (`aria-hidden`) y el resto de la sección (guía, puntos, fechas, texto) es visible sin JavaScript.
- Desde la Task 9, `BaseLayout.astro` lee la colección `experience` para decidir si el nav muestra Experience; por eso ningún test renderiza `BaseLayout` con la Container API (los tests de Nav le pasan `experienceVisible` a mano).
- El espejo español de la página 404 se genera como `dist/es/404/index.html` y su conmutador de idioma apunta a `/404/`; el comprobador de enlaces de la Task 9 lo admite. Arreglarlo en `mirroredPath` queda para el plan C.
- Los bloques de código que son fragmentos (no ficheros enteros) van sin etiqueta de lenguaje para que Prettier no los reformatee al pasar `npm run lint` sobre `docs/`.
