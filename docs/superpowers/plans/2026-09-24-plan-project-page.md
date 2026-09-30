# Ficha de proyecto por tipo (`/projects/[slug]`) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sustituir la ficha de proyecto de tarjetas por una página que enseña el producto, con cabecera partida y bloque de medios según `kind` (`mobile`, `web`, `hybrid`, `cli`), capturas, qué hace, por qué existe, pruébalo, cómo está hecho y cambios.

**Architecture:** `projectSchema` pasa a `({ image }: SchemaContext) => z.object(...)` con `kind`, imágenes en `src/assets/projects/<slug>/` y los campos nuevos. `ProjectPage.astro` resuelve todas las imágenes con `getImage` (webp), busca el post relacionado y construye un `ProjectView` plano con `toProjectView` (`src/lib/project-view.ts`, lógica pura y testeable). Todos los componentes de la ficha (`ProjectView.astro` y sus secciones) reciben solo `view: ProjectView`, así se renderizan en tests con la Container API sin `astro:content`. El cuerpo Markdown entra como slot. Los únicos `<script>` son la carga del playground y el botón de copiar el comando.

**Tech Stack:** Astro 7 (SSG, `astro:assets`, `ClientRouter`), Tailwind 4, TypeScript strict, vitest 5 con `experimental_AstroContainer`, sharp 0.33.

**Spec:** `docs/superpowers/specs/2026-09-24-project-page-redesign.md` (maquetas para medidas y copy: `docs/superpowers/specs/2026-09-24-project-page-mockups/{mobile,web,hybrid,cli}.dc.html`).

## Global Constraints

- Cada tarea toca como máximo 3 ficheros de código o contenido; los tests (incluido `tests/fixtures/project-view.ts`) van aparte. Los JPG que genera el script y los PNG que se borran de `public/projects/` son binarios y no cuentan. Por esta regla el plan tiene 14 tareas: los 14 `.md` de proyectos más el script necesitan 6 tareas de contenido.
- Como máximo un `npm run build` por tarea; solo la Task 14 lo ejecuta. El resto valida con `npx vitest run <ficheros de la tarea>`.
- Cada tarea termina en un commit Conventional Commits con el trailer `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- El hook de husky pasa `eslint --fix` y `prettier --write` sobre lo que se commitea; los bloques de código del plan ya están en formato Prettier salvo los fragmentos que se insertan en ficheros existentes.
- Componentes presentacionales: reciben datos planos (`view: ProjectView`, URLs de imagen ya resueltas con `getImage`) y no importan `astro:content` ni `astro:assets`. Solo `ProjectPage.astro` (y la home) tocan colecciones e imágenes.
- Sin framer-motion ni islas React. Solo `<script>` en `.astro` para cargar el playground (`ProjectPlayground.astro`) y copiar el comando (`ProjectActions.astro`), enlazados con `bind()` + `document.addEventListener('astro:after-swap', bind)` como `ShareButtons.astro`.
- Sin animaciones de entrada ni hover lifts en la ficha.
- Tests de la guarda con `describe.skipIf(!process.env.RELEASE_CHECK)`. La guarda solo mira `.md` de `src/content/projects/` sin `visible: false`.
- Copy solo desde la spec y las maquetas; huecos como `[DATO]` literal. Inglés en `src/content/projects/en/`, español en `es/`.
- `status: publishing` tiene tono `warn` (la spec manda sobre el verde de la maqueta).
- Fechas cortas con `toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })`: `26 ago 2026`, `2 sept 2026`, `Aug 26, 2026`, `Sep 2, 2026` (valores medidos con el Node del repo).
- Imágenes: `getImage({ src, width, format: 'webp' })` con anchos: icono 144, cover 780 (`mobile`) o 1240 (`web`/`hybrid`), coverMobile 400, capturas 400 (`mobile`/`hybrid`) u 800 (`web`), imagen de feature 288, ilustración 320.
- Cabecera a dos columnas desde `lg` (1024px) para `mobile` (medios 390px, hueco 80px) e `hybrid` (520px, hueco 64px), y desde `xl` (1280px) para `web` (620px, hueco 48px) y `cli` (620px, hueco 56px); por debajo, una columna con el texto primero.
- Medidas de la maqueta: h1 72px peso 800 tracking -0.04em (cli 44px), tagline 26px/600, intro 16px muted máx 560px, `<dl>` filas de 44px con hairline y etiqueta de 180px, títulos de sección 22px/700, secciones con `py-14` y `border-t`, móvil del hero 390x800 radio 56 padding 12, móvil pequeño 200x420, móvil del playground 290x600, navegador con barra de 40px (fino: 32px), terminal 620x400 con barra de 36px.
- Móvil (< 768px): marco de móvil del hero a 260px centrado sin sobresalir; `hybrid` enseña solo el móvil pequeño a 260px si hay `coverMobile`; navegador y terminal a ancho completo; tira de capturas con `scroll-snap-type: x mandatory` y 16px de gutter; playground de móvil a 300px, de navegador con alto 520px.
- Los marcos de dispositivo son decorativos: `aria-hidden="true"` en muescas, botones laterales, puntos y barra; la captura lleva `alt` real.
- Contraste: textos pequeños en `text-faint` (#8a93a3 en oscuro), nunca #6b7382.
- Sin estrellas de GitHub ni descargas de npm (plan C). Sin `<video>`: un `playground` de `kind: 'video'` no se pinta.
- Sin comentarios innecesarios, sin `console.log`, TypeScript strict (los tests también pasan por `astro check`).
- Entre la Task 1 y la Task 7 el contenido no valida (falta `kind`), y entre la Task 12 y la Task 13 la ficha antigua importa un componente borrado: el servidor de :4321 puede fallar en `/projects/*` en esos tramos. Ninguna tarea antes de la 14 ejecuta build.

## Review Focus

1. Proyecto visible y casi vacío (Quedamos, Huellas: sin `cover`, capturas, features, `built` ni changelog con fecha): la ficha debe verse con cabecera de texto, "Por qué existe" y el enlace "Todos los proyectos", sin títulos huérfanos ni hueco de medios. Tests: Task 8 (`hasMedia`/`overhangs` falsos), Task 10 (cabecera sin `data-media`), Task 13 (`ProjectView` disperso).
2. `cover` sin capturas: el marco no debe sobresalir sobre "Qué hace" (no hay tira con `pt-[120px]` que lo absorba). Test: Task 8 (`overhangs` exige capturas) y Task 10 (sin clase `-mb-[152px]`).
3. Fechas de `z.coerce.date('2026-09-02')` en husos negativos: deben salir `2 sept 2026`, no `1 sept`. Test: Task 8 con `process.env.TZ = 'America/Los_Angeles'`.
4. Notas del playground con datos que faltan (sin `download` o sin `platform`): la nota se omite entera, sin `<span>` mono vacío. Test: Task 8 (`playgroundNotes`) y Task 12.
5. Proyectos ocultos (`visible: false`: create-astro-blog, DevTools) con `[DATO]`: no generan ruta y no rompen la guarda `RELEASE_CHECK`. Tests: Task 7 (la guarda filtra por `visible`) y Task 14 (el build no tiene `projects/create-astro-blog/index.html`).

---

### Task 1: Schema de proyectos, `tone()` y traducciones nuevas

**Files:**

- Modify: `src/content.config.ts:26-52` (`projectSchema` pasa a función y la colección `projects` la usa)
- Modify: `src/lib/projects.ts` (añadir `StatusTone` y `tone` al final)
- Modify: `src/i18n/translations.ts:56-71` (bloque `project.*`/`status.*` en `en`) y `:225-240` (mismo bloque en `es`)
- Test: `tests/schemas.test.ts` (reescribir `describe('projectSchema')`), `tests/project-page.test.ts` (borrar su `describe('projectSchema')` y el import), `tests/projects.test.ts` (añadir `tone` y traducciones)

**Interfaces:**

- Consumes: `SchemaContext` de `astro:content`, `z` de `astro/zod`.
- Produces:
  - `export const projectSchema: ({ image }: SchemaContext) => ZodObject` con los campos de la spec más `stepsIntro?: string`.
  - `src/lib/projects.ts`: `export type StatusTone = 'ok' | 'warn' | 'neutral'` y `export function tone(status: string): StatusTone`.
  - Claves i18n (en `en` y `es`): `status.publishing`, `project.web`, `project.npm`, `project.download`, `project.openWeb`, `project.openApp`, `project.npmLink`, `project.copy`, `project.copied`, `project.terminalTitle`, `project.coverAlt`, `project.coverMobileAlt`, `project.screenshots`, `project.shotsIntro.mobile`, `project.shotsIntro.web`, `project.shotsIntro.hybrid`, `project.features`, `project.featuresCli`, `project.steps`, `project.after`, `project.why`, `project.readPost`, `project.tryApp`, `project.tryWeb`, `project.loadApp`, `project.loadWeb`, `project.note.loads.title`, `project.note.loads.text`, `project.note.mobile.tap.title`, `project.note.mobile.tap.text`, `project.note.mobile.apk.title`, `project.note.mobile.apk.text`, `project.note.hybrid.local.title`, `project.note.hybrid.local.text`, `project.note.hybrid.install.title`, `project.note.hybrid.install.text`, `project.note.web`, `project.note.webLink`, `project.built`, `project.upcoming`, `project.releasesGithub`, `project.releasesNpm`. Las plantillas usan `{name}`, `{version}`, `{title}`, `{size}`, `{platform}`, `{src}`, `{link}`.

- [ ] **Step 1: Write the failing test**

En `tests/schemas.test.ts`, cambiar los imports y sustituir el `describe('projectSchema', ...)` (dejar intacto `describe('postSchema', ...)`):

```ts
import { describe, it, expect } from 'vitest';
import { z } from 'astro/zod';
import type { SchemaContext } from 'astro:content';
import { postSchema, projectSchema } from '../src/content.config';
```

```ts
const project = projectSchema({ image: () => z.string() } as unknown as SchemaContext);

const minimal = {
  name: 'Bito',
  tagline: 'Habits',
  kind: 'mobile',
  status: 'published',
  tier: 'featured',
  order: 1,
};

describe('projectSchema', () => {
  it('defaults the lists and visibility', () => {
    const p = project.parse(minimal);
    expect(p.visible).toBe(true);
    expect(p.stack).toEqual([]);
    expect(p.changelog).toEqual([]);
    expect(p.terminal).toEqual([]);
    expect(p.facts).toEqual([]);
    expect(p.screenshots).toEqual([]);
    expect(p.features).toEqual([]);
    expect(p.steps).toEqual([]);
    expect(p.built).toEqual([]);
  });

  it('requires a kind', () => {
    const withoutKind: Record<string, unknown> = { ...minimal };
    delete withoutKind.kind;
    expect(() => project.parse(withoutKind)).toThrow();
  });

  it('accepts the publishing status', () => {
    expect(project.parse({ ...minimal, status: 'publishing' }).status).toBe('publishing');
  });

  it('rejects an unknown status', () => {
    expect(() => project.parse({ ...minimal, status: 'live' })).toThrow();
  });

  it('coerces a changelog entry date into a Date', () => {
    const p = project.parse({
      ...minimal,
      changelog: [{ version: 'v1.0.0', date: '2026-08-26', note: 'First release.' }],
    });
    expect(p.changelog[0].date).toBeInstanceOf(Date);
  });

  it('defaults a fact to not mono', () => {
    const p = project.parse({ ...minimal, facts: [{ label: 'Red', value: 'Sin permiso de red' }] });
    expect(p.facts[0].mono).toBe(false);
  });

  it('accepts the cli fields and the media fields', () => {
    const p = project.parse({
      ...minimal,
      kind: 'cli',
      command: 'npx create-astro-blog my-blog',
      terminal: ['$ npx create-astro-blog my-blog'],
      steps: [{ title: 'Dominio', text: 'Para el SEO.' }],
      stepsIntro: 'Seis preguntas.',
      after: 'cd my-blog && npm run dev',
      download: { url: 'https://example.com/app.apk', label: '4,7 MB' },
      screenshots: [
        { src: '../../../assets/projects/bito/widget.jpg', alt: 'Widget', caption: 'Widget' },
      ],
      features: [{ title: 'Widget', text: 'Un toque.' }],
    });
    expect(p.kind).toBe('cli');
    expect(p.steps).toHaveLength(1);
    expect(p.features[0].image).toBeUndefined();
  });

  it('drops the removed hero and gallery fields', () => {
    const p = project.parse({ ...minimal, hero: '/projects/x.png', gallery: ['/a.png'] });
    expect(p).not.toHaveProperty('hero');
    expect(p).not.toHaveProperty('gallery');
  });
});
```

En `tests/project-page.test.ts`, borrar la línea `import { projectSchema } from '../src/content.config';` y el bloque `describe('projectSchema', ...)` completo (líneas 58-70). En la fixture `project()` de ese fichero, sustituir `gallery: [],` por `kind: 'mobile',`.

En `tests/projects.test.ts`, cambiar el import y añadir al final:

```ts
import { projectSlug, projectLang, sortProjects, tone } from '../src/lib/projects';
import { statusLabel, translations } from '../src/i18n/translations';
```

```ts
describe('tone', () => {
  it('maps each status to a tag tone', () => {
    expect(tone('published')).toBe('ok');
    expect(tone('publishing')).toBe('warn');
    expect(tone('beta')).toBe('warn');
    expect(tone('development')).toBe('neutral');
    expect(tone('design')).toBe('neutral');
    expect(tone('archived')).toBe('neutral');
  });
});

describe('project translations', () => {
  it('labels the publishing status', () => {
    expect(statusLabel('publishing', 'es')).toBe('En publicación');
    expect(statusLabel('publishing', 'en')).toBe('Publishing');
  });

  it('translates every project key into Spanish', () => {
    const keys = Object.keys(translations.en).filter((key) => key.startsWith('project.'));
    expect(keys.length).toBeGreaterThan(40);
    keys.forEach((key) => expect(translations.es).toHaveProperty([key]));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/schemas.test.ts tests/project-page.test.ts tests/projects.test.ts`
Expected: FAIL: `projectSchema is not a function`, `tone is not a function`, `statusLabel('publishing')` devuelve `undefined`.

- [ ] **Step 3: Write minimal implementation**

En `src/content.config.ts`, sustituir `projectSchema` y `projects` (líneas 26-52) por:

```ts
export const projectSchema = ({ image }: SchemaContext) =>
  z.object({
    name: z.string(),
    tagline: z.string(),
    kind: z.enum(['mobile', 'web', 'hybrid', 'cli']),
    status: z.enum(['published', 'publishing', 'beta', 'development', 'design', 'archived']),
    tier: z.enum(['featured', 'lab']),
    order: z.number(),
    visible: z.boolean().default(true),
    repo: z.url().optional(),
    url: z.url().optional(),
    license: z.string().optional(),
    stack: z.array(z.string()).default([]),
    platform: z.string().optional(),
    intro: z.string().optional(),
    icon: image().optional(),
    cover: image().optional(),
    coverMobile: image().optional(),
    download: z.object({ url: z.url(), label: z.string() }).optional(),
    command: z.string().optional(),
    terminal: z.array(z.string()).default([]),
    facts: z
      .array(z.object({ label: z.string(), value: z.string(), mono: z.boolean().default(false) }))
      .default([]),
    screenshots: z
      .array(z.object({ src: image(), alt: z.string(), caption: z.string() }))
      .default([]),
    screenshotsIntro: z.string().optional(),
    featuresIntro: z.string().optional(),
    features: z
      .array(z.object({ title: z.string(), text: z.string(), image: image().optional() }))
      .default([]),
    steps: z.array(z.object({ title: z.string(), text: z.string() })).default([]),
    stepsIntro: z.string().optional(),
    after: z.string().optional(),
    post: z.string().optional(),
    illustration: image().optional(),
    built: z.array(z.string()).default([]),
    playground: z.object({ kind: z.enum(['pwa', 'iframe', 'video']), src: z.url() }).optional(),
    changelog: z
      .array(z.object({ version: z.string(), date: z.coerce.date().optional(), note: z.string() }))
      .default([]),
    githubRepo: z.string().optional(),
    mock: z.boolean().default(false),
  });

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: projectSchema,
});
```

Al final de `src/lib/projects.ts`:

```ts
export type StatusTone = 'ok' | 'warn' | 'neutral';

export function tone(status: string): StatusTone {
  if (status === 'published') return 'ok';
  if (status === 'publishing' || status === 'beta') return 'warn';
  return 'neutral';
}
```

En `src/i18n/translations.ts`, bloque `en`: justo después de `'project.screenshot': 'Screenshot',` añadir:

```ts
    'project.web': 'Web',
    'project.npm': 'npm',
    'project.download': 'Download APK',
    'project.openWeb': 'Open the site',
    'project.openApp': 'Open the app',
    'project.npmLink': 'View on npm',
    'project.copy': 'Copy the command',
    'project.copied': 'Copied',
    'project.terminalTitle': '~/projects',
    'project.coverAlt': 'Main screen of {name}',
    'project.coverMobileAlt': '{name} installed on a phone',
    'project.screenshots': 'Screenshots',
    'project.shotsIntro.mobile': 'Screens from {version} on a real Android phone.',
    'project.shotsIntro.web': 'Screens from {version} on desktop.',
    'project.shotsIntro.hybrid': '{version} installed on a phone.',
    'project.features': 'What it does',
    'project.featuresCli': 'What you get',
    'project.steps': 'How you set it up',
    'project.after': 'Then:',
    'project.why': 'Why it exists',
    'project.readPost': 'Read the post: {title}',
    'project.tryApp': 'The whole app, right here, in a phone frame. Nothing to install.',
    'project.tryWeb': 'The whole site, right here.',
    'project.loadApp': 'Load the app',
    'project.loadWeb': 'Load the site',
    'project.note.loads.title': 'It loads when you ask',
    'project.note.loads.text': 'Until you press the button, the page does not download the app.',
    'project.note.mobile.tap.title': 'Tap a habit to log it',
    'project.note.mobile.tap.text':
      'Everything starts with that gesture. Streaks and history come from there.',
    'project.note.mobile.apk.title': 'On your phone, with the APK',
    'project.note.mobile.apk.text': '{size} from GitHub Releases, for {platform}.',
    'project.note.hybrid.local.title': 'What you enter stays in your browser',
    'project.note.hybrid.local.text': 'There is no server to receive it and no account to create.',
    'project.note.hybrid.install.title': 'On your phone, as an app',
    'project.note.hybrid.install.text':
      'Open {src} and add it to your home screen. It works offline.',
    'project.note.web':
      'Until you press the button, this page does not download it. You can also {link}.',
    'project.note.webLink': 'open it at its own address',
    'project.built': 'How it is built',
    'project.upcoming': 'coming',
    'project.releasesGithub': 'All versions on GitHub',
    'project.releasesNpm': 'All versions on npm',
    'status.publishing': 'Publishing',
```

Bloque `es`: justo después de `'project.screenshot': 'Captura',` añadir:

```ts
    'project.web': 'Web',
    'project.npm': 'npm',
    'project.download': 'Descargar APK',
    'project.openWeb': 'Abrir la web',
    'project.openApp': 'Abrir la app',
    'project.npmLink': 'Ver en npm',
    'project.copy': 'Copiar el comando',
    'project.copied': 'Copiado',
    'project.terminalTitle': '~/proyectos',
    'project.coverAlt': 'Pantalla principal de {name}',
    'project.coverMobileAlt': '{name} instalada en el móvil',
    'project.screenshots': 'Capturas',
    'project.shotsIntro.mobile': 'Pantallas de la {version} en un Android real.',
    'project.shotsIntro.web': 'Pantallas de la {version} en escritorio.',
    'project.shotsIntro.hybrid': 'La {version} instalada en el móvil.',
    'project.features': 'Qué hace',
    'project.featuresCli': 'Qué te da',
    'project.steps': 'Cómo lo configuras',
    'project.after': 'Después:',
    'project.why': 'Por qué existe',
    'project.readPost': 'Leer el post: {title}',
    'project.tryApp':
      'La app entera, aquí mismo, en un marco de móvil. No hace falta instalar nada.',
    'project.tryWeb': 'La web entera, aquí mismo.',
    'project.loadApp': 'Cargar la app',
    'project.loadWeb': 'Cargar la web',
    'project.note.loads.title': 'Se carga cuando tú lo pides',
    'project.note.loads.text': 'Hasta que pulsas el botón, la página no descarga la app.',
    'project.note.mobile.tap.title': 'Toca un hábito para registrarlo',
    'project.note.mobile.tap.text':
      'Todo parte de ese gesto. Las rachas y el historial salen de ahí.',
    'project.note.mobile.apk.title': 'En tu móvil, con el APK',
    'project.note.mobile.apk.text': '{size} desde GitHub Releases, para {platform}.',
    'project.note.hybrid.local.title': 'Lo que apuntes se queda en tu navegador',
    'project.note.hybrid.local.text': 'No hay servidor que lo reciba ni cuenta que crear.',
    'project.note.hybrid.install.title': 'En tu móvil, como una app',
    'project.note.hybrid.install.text':
      'Abre {src} y añádela a la pantalla de inicio. Funciona sin conexión.',
    'project.note.web':
      'Hasta que pulsas el botón, esta página no la descarga. También puedes {link}.',
    'project.note.webLink': 'abrirla en su dirección',
    'project.built': 'Cómo está hecho',
    'project.upcoming': 'en camino',
    'project.releasesGithub': 'Todas las versiones en GitHub',
    'project.releasesNpm': 'Todas las versiones en npm',
    'status.publishing': 'En publicación',
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/schemas.test.ts tests/project-page.test.ts tests/projects.test.ts`
Expected: PASS (`postSchema` 3, `projectSchema` 8, `ProjectCard` 1, `PlaygroundFrame` 2, `projects helpers` 2, `tone` 1, `project translations` 2).

- [ ] **Step 5: Commit**

```bash
git add src/content.config.ts src/lib/projects.ts src/i18n/translations.ts tests/schemas.test.ts tests/project-page.test.ts tests/projects.test.ts
git commit -m "feat(projects): kind-aware schema, publishing status and shared tone

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: Placeholders de imagen y contenido de Bito

**Files:**

- Create: `scripts/project-placeholders.mjs` (genera JPG en `src/assets/projects/{bito,pokeutils,basecero}/`; los JPG son binarios y no cuentan)
- Modify: `src/content/projects/es/bito.md` (reescritura completa), `src/content/projects/en/bito.md` (reescritura completa)
- Test: `tests/project-content.test.ts` (nuevo)

**Interfaces:**

- Consumes: `projectSchema` de la Task 1; `sharp`.
- Produces:
  - JPG etiquetados, fondo `#1c2029`, texto `#8a93a3`: móvil 400x844, escritorio 1280x800, icono 256x256. Nombres: `bito/{icon,cover,widget,reminder,review,stats,badges,habi}.jpg`, `pokeutils/{icon,cover,pokedex,compare,egg-groups,team,pokemon}.jpg`, `basecero/{icon,cover,cover-mobile,home,movements,net-worth,categories,period,shared}.jpg`. Todos pesan menos de 20 KB (medido: 1280x800 unos 16 KB).
  - Helpers de test en `tests/project-content.test.ts` que las Tasks 3-7 reutilizan: `file(lang, slug)`, `read(lang, slug)`, `field(source, key)`, `refsOf(path)`, `imageRefs(lang, slug)`.
  - Bito con `kind: mobile`, `status: publishing`, `download`, `facts`, 5 capturas, 7 features (3 con imagen), `illustration`, `built`, changelog con `v1.0.0` fechada `2026-08-26`. Sin `post`.

- [ ] **Step 1: Write the failing test**

`tests/project-content.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const file = (lang: string, slug: string) => `src/content/projects/${lang}/${slug}.md`;
const read = (lang: string, slug: string) => readFileSync(file(lang, slug), 'utf8');
const field = (source: string, key: string) =>
  new RegExp(`^${key}: (.+)$`, 'm').exec(source)?.[1]?.trim();
const refsOf = (path: string) =>
  [...readFileSync(path, 'utf8').matchAll(/(\.\.\/[^\s'"]+\.(?:jpg|jpeg|png|webp))/g)].map((m) =>
    resolve(dirname(path), m[1]),
  );
const imageRefs = (lang: string, slug: string) => refsOf(file(lang, slug));

const placeholders: Record<string, string[]> = {
  bito: ['icon', 'cover', 'widget', 'reminder', 'review', 'stats', 'badges', 'habi'],
  pokeutils: ['icon', 'cover', 'pokedex', 'compare', 'egg-groups', 'team', 'pokemon'],
  basecero: [
    'icon',
    'cover',
    'cover-mobile',
    'home',
    'movements',
    'net-worth',
    'categories',
    'period',
    'shared',
  ],
};

describe('project placeholders', () => {
  it.each(Object.entries(placeholders))('%s has its placeholder images', (slug, names) => {
    names.forEach((name) =>
      expect(existsSync(`src/assets/projects/${slug}/${name}.jpg`), name).toBe(true),
    );
  });
});

describe.each(['es', 'en'])('bito (%s)', (lang) => {
  const source = read(lang, 'bito');

  it('is a mobile project being published', () => {
    expect(field(source, 'kind')).toBe('mobile');
    expect(field(source, 'status')).toBe('publishing');
  });

  it('keeps the data confirmed by the user', () => {
    expect(field(source, 'platform')).toBe('Android 10+');
    expect(field(source, 'license')).toBe('GPL-3.0');
    expect(field(source, 'url')).toBe('https://bito.alvarotc.com');
    expect(field(source, 'stack')).toBe('[Kotlin, Offline-first, Privacy]');
    expect(source).toContain(
      'https://github.com/alvarotorresc/bito/releases/download/v1.0.0/app-release.apk',
    );
    expect(source).toMatch(/date: 2026-08-26/);
  });

  it('has five screenshots and seven features', () => {
    expect(source.match(/^ {2}- src: /gm)).toHaveLength(5);
    expect(source.match(/^ {2}- title: /gm)).toHaveLength(7);
  });

  it('drops hero and gallery and has no post yet', () => {
    expect(source).not.toMatch(/^(hero|gallery|post):/m);
  });

  it('points only at images that exist', () => {
    const refs = imageRefs(lang, 'bito');
    expect(refs.length).toBeGreaterThan(0);
    refs.forEach((ref) => expect(existsSync(ref), ref).toBe(true));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/project-content.test.ts`
Expected: FAIL: no existen los JPG, `kind` es `undefined` y `status` es `published`.

- [ ] **Step 3: Write minimal implementation**

`scripts/project-placeholders.mjs`:

```js
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const PHONE = [400, 844];
const DESKTOP = [1280, 800];
const ICON = [256, 256];

const images = {
  bito: {
    icon: ICON,
    cover: PHONE,
    widget: PHONE,
    reminder: PHONE,
    review: PHONE,
    stats: PHONE,
    badges: PHONE,
    habi: ICON,
  },
  pokeutils: {
    icon: ICON,
    cover: DESKTOP,
    pokedex: DESKTOP,
    compare: DESKTOP,
    'egg-groups': DESKTOP,
    team: DESKTOP,
    pokemon: DESKTOP,
  },
  basecero: {
    icon: ICON,
    cover: DESKTOP,
    'cover-mobile': PHONE,
    home: PHONE,
    movements: PHONE,
    'net-worth': PHONE,
    categories: PHONE,
    period: PHONE,
    shared: PHONE,
  },
};

for (const [slug, files] of Object.entries(images)) {
  await mkdir(`src/assets/projects/${slug}`, { recursive: true });
  for (const [name, [width, height]] of Object.entries(files)) {
    const size = Math.round(Math.min(width, height) / 14);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="#1c2029"/><text x="50%" y="50%" fill="#8a93a3" font-family="monospace" font-size="${size}" text-anchor="middle">${slug}/${name}.jpg</text></svg>`;
    await sharp(Buffer.from(svg))
      .jpeg({ quality: 80 })
      .toFile(`src/assets/projects/${slug}/${name}.jpg`);
  }
}
```

Ejecutar: `node scripts/project-placeholders.mjs`

`src/content/projects/es/bito.md` (completo):

```md
---
name: Bito
tagline: Registra un hábito en un toque, sin cuentas ni nube.
intro: 'La app de hábitos que no te roba tiempo. Vive entera en tu móvil: sin cuentas, sin nube, ni una línea a internet.'
kind: mobile
status: publishing
tier: featured
order: 1
repo: https://github.com/alvarotorresc/bito
url: https://bito.alvarotc.com
license: GPL-3.0
platform: Android 10+
stack: [Kotlin, Offline-first, Privacy]
githubRepo: alvarotorresc/bito
icon: '../../../assets/projects/bito/icon.jpg'
cover: '../../../assets/projects/bito/cover.jpg'
download:
  url: https://github.com/alvarotorresc/bito/releases/download/v1.0.0/app-release.apk
  label: '4,7 MB'
facts:
  - { label: 'Tamaño del APK', value: '4,7 MB', mono: true }
  - { label: 'Red', value: 'Sin permiso de red' }
screenshots:
  - src: '../../../assets/projects/bito/widget.jpg'
    alt: 'Widget en la pantalla de inicio'
    caption: 'Widget'
  - src: '../../../assets/projects/bito/reminder.jpg'
    alt: 'Recordatorio con botón de registrar'
    caption: 'Recordatorio'
  - src: '../../../assets/projects/bito/review.jpg'
    alt: 'Revisión nocturna'
    caption: 'Revisión nocturna'
  - src: '../../../assets/projects/bito/stats.jpg'
    alt: 'Estadísticas con mapa de calor y récords'
    caption: 'Estadísticas'
  - src: '../../../assets/projects/bito/badges.jpg'
    alt: 'Insignias'
    caption: 'Insignias'
featuresIntro: 'Tres formas de registrar, dos sin abrir la app.'
features:
  - title: 'Desde la pantalla de inicio'
    text: 'El widget registra el hábito con un toque. No hace falta abrir la app.'
    image: '../../../assets/projects/bito/widget.jpg'
  - title: 'Desde el recordatorio'
    text: 'La notificación trae su propio botón. Lo pulsas y queda hecho.'
    image: '../../../assets/projects/bito/reminder.jpg'
  - title: 'Al final del día'
    text: 'La revisión nocturna: una sola pantalla para cerrar el día.'
    image: '../../../assets/projects/bito/review.jpg'
  - title: 'Rachas que no castigan'
    text: 'Congeladores para días imposibles y registro con fecha atrás.'
  - title: 'Más que marcar sí o no'
    text: 'Cantidades (8 vasos de agua), duraciones (20 min de lectura) y cosas que dejar (un día más sin fumar).'
  - title: 'Recordatorios con voz'
    text: 'Eliges la voz, y el tono cambia según la hora.'
  - title: 'Estadísticas reales'
    text: 'Mapas de calor, récords e insignias.'
illustration: '../../../assets/projects/bito/habi.jpg'
built:
  - 'Kotlin, para Android 10+.'
  - 'Offline-first: todos los datos viven en el móvil.'
  - 'Sin permiso de red. La app no puede llamar a casa.'
  - 'Exporta a un fichero plano que es tuyo.'
  - 'Software libre bajo GPL-3.0, código en [github.com/alvarotorresc/bito](https://github.com/alvarotorresc/bito).'
changelog:
  - { version: 'v2.0.0', note: 'Habi como compañera, fichas de tienda y widget.' }
  - {
      version: 'v1.0.0',
      date: 2026-08-26,
      note: 'Primera versión pública. Registro en un toque, rachas, exportar a fichero.',
    }
  - { version: 'v0.1.0', note: 'El prototipo de 24 horas.' }
---

Todas las apps de hábitos que probé pedían una cuenta, luego una suscripción, luego mis datos. Bito pide un toque. Guarda todo en el móvil, exporta a un fichero plano y no llama a casa.

Hice la primera versión en un día para probar la idea, y lo conté. La segunda añade a Habi, una compañera que anima sin dar la lata, y es la que va a las tiendas.
```

`src/content/projects/en/bito.md` (completo):

```md
---
name: Bito
tagline: Log a habit in one tap, without accounts or cloud.
intro: 'The habit app that does not steal your time. It lives entirely on your phone: no accounts, no cloud, not a single line to the internet.'
kind: mobile
status: publishing
tier: featured
order: 1
repo: https://github.com/alvarotorresc/bito
url: https://bito.alvarotc.com
license: GPL-3.0
platform: Android 10+
stack: [Kotlin, Offline-first, Privacy]
githubRepo: alvarotorresc/bito
icon: '../../../assets/projects/bito/icon.jpg'
cover: '../../../assets/projects/bito/cover.jpg'
download:
  url: https://github.com/alvarotorresc/bito/releases/download/v1.0.0/app-release.apk
  label: '4.7 MB'
facts:
  - { label: 'APK size', value: '4.7 MB', mono: true }
  - { label: 'Network', value: 'No network permission' }
screenshots:
  - src: '../../../assets/projects/bito/widget.jpg'
    alt: 'Widget on the home screen'
    caption: 'Widget'
  - src: '../../../assets/projects/bito/reminder.jpg'
    alt: 'Reminder with a log button'
    caption: 'Reminder'
  - src: '../../../assets/projects/bito/review.jpg'
    alt: 'Nightly review'
    caption: 'Nightly review'
  - src: '../../../assets/projects/bito/stats.jpg'
    alt: 'Stats with a heatmap and records'
    caption: 'Stats'
  - src: '../../../assets/projects/bito/badges.jpg'
    alt: 'Badges'
    caption: 'Badges'
featuresIntro: 'Three ways to log, two without opening the app.'
features:
  - title: 'From the home screen'
    text: 'The widget logs the habit with one tap. No need to open the app.'
    image: '../../../assets/projects/bito/widget.jpg'
  - title: 'From the reminder'
    text: 'The notification brings its own button. Tap it and it is done.'
    image: '../../../assets/projects/bito/reminder.jpg'
  - title: 'At the end of the day'
    text: 'The nightly review: one screen to close the day.'
    image: '../../../assets/projects/bito/review.jpg'
  - title: 'Streaks that do not punish'
    text: 'Freezes for impossible days and logging with a past date.'
  - title: 'More than yes or no'
    text: 'Amounts (8 glasses of water), durations (20 min of reading) and things to quit (one more day without smoking).'
  - title: 'Reminders with a voice'
    text: 'You pick the voice, and the tone changes with the time of day.'
  - title: 'Real stats'
    text: 'Heatmaps, records and badges.'
illustration: '../../../assets/projects/bito/habi.jpg'
built:
  - 'Kotlin, for Android 10+.'
  - 'Offline-first: all data lives on the phone.'
  - 'No network permission. The app cannot phone home.'
  - 'Exports to a plain file that is yours.'
  - 'Free software under GPL-3.0, code at [github.com/alvarotorresc/bito](https://github.com/alvarotorresc/bito).'
changelog:
  - { version: 'v2.0.0', note: 'Habi as a companion, store listings and widget.' }
  - {
      version: 'v1.0.0',
      date: 2026-08-26,
      note: 'First public release. One-tap logging, streaks, export to file.',
    }
  - { version: 'v0.1.0', note: 'The 24 hour prototype.' }
---

Every habit tracker I tried asked for an account, then a subscription, then my data. Bito asks for one tap. It stores everything on the phone, exports to a plain file, and does not phone home.

I built the first version in a day to prove the idea, and wrote about it. The second version adds Habi, a small companion that nudges without nagging, and is the one going to the stores.
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/project-content.test.ts`
Expected: PASS (`project placeholders` 3, `bito (es)` 5, `bito (en)` 5).

- [ ] **Step 5: Commit**

```bash
git add scripts/project-placeholders.mjs src/assets/projects src/content/projects/es/bito.md src/content/projects/en/bito.md tests/project-content.test.ts
git commit -m "feat(projects): placeholder images and the new Bito content

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: Contenido de PokeUtils

**Files:**

- Modify: `src/content/projects/es/pokeutils.md` (reescritura completa), `src/content/projects/en/pokeutils.md` (reescritura completa)
- Test: `tests/project-content.test.ts` (añadir un `describe.each`)

**Interfaces:**

- Consumes: JPG de `src/assets/projects/pokeutils/` (Task 2); helpers `read`, `field`, `imageRefs` del test.
- Produces: PokeUtils con `kind: web`, `status: published`, sin `license` y sin `playground`, changelog `v1.0.0` fechada `2026-08-28` con nota `[DATO]`, 3 capturas 16:10, 7 features (3 con imagen), `illustration` = icono.

- [ ] **Step 1: Write the failing test**

Añadir al final de `tests/project-content.test.ts`:

```ts
describe.each(['es', 'en'])('pokeutils (%s)', (lang) => {
  const source = read(lang, 'pokeutils');

  it('is a published web project', () => {
    expect(field(source, 'kind')).toBe('web');
    expect(field(source, 'status')).toBe('published');
    expect(field(source, 'stack')).toBe('[JavaScript, SPA]');
  });

  it('has no license, no playground and no hero', () => {
    expect(source).not.toMatch(/^(license|playground|hero|gallery):/m);
  });

  it('dates v1.0.0 and leaves its note as [DATO]', () => {
    expect(source).toMatch(/version: 'v1\.0\.0', date: 2026-08-28, note: '\[DATO\]'/);
  });

  it('has three screenshots and seven features', () => {
    expect(source.match(/^ {2}- src: /gm)).toHaveLength(3);
    expect(source.match(/^ {2}- title: /gm)).toHaveLength(7);
  });

  it('points only at images that exist', () => {
    imageRefs(lang, 'pokeutils').forEach((ref) => expect(existsSync(ref), ref).toBe(true));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/project-content.test.ts`
Expected: FAIL: `kind` es `undefined`, `stack` es `[Vanilla JS, SPA]`, existe `hero:`.

- [ ] **Step 3: Write minimal implementation**

`src/content/projects/es/pokeutils.md` (completo):

```md
---
name: PokeUtils
tagline: 'Tu guía Pokémon retro: análisis competitivo, crianza y Pokédex completa.'
intro: 'Si juegas competitivo, aquí sabes si tu equipo aguanta ese ataque. Si crías, con quién cruza cada uno. Y si solo vienes a consultar la dex, está entera, en español, y no te pide una cuenta.'
kind: web
status: published
tier: lab
order: 5
repo: https://github.com/alvarotorresc/PokeUtils
url: https://pokeutils.alvarotc.com
stack: [JavaScript, SPA]
githubRepo: alvarotorresc/PokeUtils
icon: '../../../assets/projects/pokeutils/icon.jpg'
cover: '../../../assets/projects/pokeutils/cover.jpg'
facts:
  - { label: 'Idiomas', value: 'Español e inglés' }
  - { label: 'Cuentas', value: 'Sin cuentas ni anuncios' }
screenshots:
  - src: '../../../assets/projects/pokeutils/pokedex.jpg'
    alt: 'Pokédex con filtros'
    caption: 'Pokédex'
  - src: '../../../assets/projects/pokeutils/compare.jpg'
    alt: 'Comparador con cuatro Pokémon'
    caption: 'Comparador'
  - src: '../../../assets/projects/pokeutils/egg-groups.jpg'
    alt: 'Grupos huevo'
    caption: 'Grupos huevo'
featuresIntro: 'Preparar un equipo, criar sin adivinar y consultar la dex.'
features:
  - title: 'Tu equipo'
    text: 'Hasta seis. Ves qué tipos lo amenazan y qué cobertura le falta.'
    image: '../../../assets/projects/pokeutils/team.jpg'
  - title: 'Cría'
    text: 'Con quién cruza cada uno: 15 grupos huevo y las cinco reglas de cría de verdad.'
    image: '../../../assets/projects/pokeutils/egg-groups.jpg'
  - title: 'La dex'
    text: 'Entera y en español, con filtros que quedan en la URL. Sin fricción.'
    image: '../../../assets/projects/pokeutils/pokemon.jpg'
  - title: 'Todos los Pokémon'
    text: '1025 Pokémon y 326 formas.'
  - title: 'Un buscador para todo'
    text: 'Cruza 1351 Pokémon, 937 movimientos, 313 habilidades y 1848 objetos.'
  - title: 'Comparador'
    text: 'Hasta cuatro Pokémon, uno al lado del otro.'
  - title: '16 herramientas'
    text: 'Pokédex, ficha de cada Pokémon, grupos huevo, movimientos y más.'
illustration: '../../../assets/projects/pokeutils/icon.jpg'
built:
  - 'JavaScript sin framework.'
  - 'Una SPA con rutas #/: cada vista y cada filtro tienen su URL.'
  - 'Sin cuentas y sin anuncios.'
  - 'En español y en inglés.'
  - 'Licencia [DATO], código en [github.com/alvarotorresc/PokeUtils](https://github.com/alvarotorresc/PokeUtils).'
changelog:
  - { version: 'v1.0.0', date: 2026-08-28, note: '[DATO]' }
---

Una SPA en JavaScript sin framework, hecha para aprender la plataforma.

[DATO: segundo párrafo]
```

`src/content/projects/en/pokeutils.md` (completo):

```md
---
name: PokeUtils
tagline: 'Your retro Pokémon guide: competitive analysis, breeding and a full Pokédex.'
intro: 'If you play competitive, here you find out whether your team survives that attack. If you breed, who pairs with whom. And if you just want to check the dex, it is complete, in Spanish, and it does not ask you for an account.'
kind: web
status: published
tier: lab
order: 5
repo: https://github.com/alvarotorresc/PokeUtils
url: https://pokeutils.alvarotc.com
stack: [JavaScript, SPA]
githubRepo: alvarotorresc/PokeUtils
icon: '../../../assets/projects/pokeutils/icon.jpg'
cover: '../../../assets/projects/pokeutils/cover.jpg'
facts:
  - { label: 'Languages', value: 'Spanish and English' }
  - { label: 'Accounts', value: 'No accounts, no ads' }
screenshots:
  - src: '../../../assets/projects/pokeutils/pokedex.jpg'
    alt: 'Pokédex with filters'
    caption: 'Pokédex'
  - src: '../../../assets/projects/pokeutils/compare.jpg'
    alt: 'Comparison of four Pokémon'
    caption: 'Comparison'
  - src: '../../../assets/projects/pokeutils/egg-groups.jpg'
    alt: 'Egg groups'
    caption: 'Egg groups'
featuresIntro: 'Build a team, breed without guessing and check the dex.'
features:
  - title: 'Your team'
    text: 'Up to six. You see which types threaten it and what coverage it lacks.'
    image: '../../../assets/projects/pokeutils/team.jpg'
  - title: 'Breeding'
    text: 'Who pairs with whom: 15 egg groups and the five real breeding rules.'
    image: '../../../assets/projects/pokeutils/egg-groups.jpg'
  - title: 'The dex'
    text: 'Complete and in Spanish, with filters that stay in the URL. No friction.'
    image: '../../../assets/projects/pokeutils/pokemon.jpg'
  - title: 'Every Pokémon'
    text: '1025 Pokémon and 326 forms.'
  - title: 'One search for everything'
    text: 'Covers 1351 Pokémon, 937 moves, 313 abilities and 1848 items.'
  - title: 'Comparison'
    text: 'Up to four Pokémon, side by side.'
  - title: '16 tools'
    text: 'Pokédex, a page for each Pokémon, egg groups, moves and more.'
illustration: '../../../assets/projects/pokeutils/icon.jpg'
built:
  - 'JavaScript with no framework.'
  - 'A SPA with #/ routes: every view and every filter has its URL.'
  - 'No accounts and no ads.'
  - 'In Spanish and English.'
  - 'License [DATO], code at [github.com/alvarotorresc/PokeUtils](https://github.com/alvarotorresc/PokeUtils).'
changelog:
  - { version: 'v1.0.0', date: 2026-08-28, note: '[DATO]' }
---

A vanilla JavaScript single-page app, no framework, built to learn the platform.

[DATO: second paragraph]
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/project-content.test.ts`
Expected: PASS (13 de la Task 2 + 10 de PokeUtils).

- [ ] **Step 5: Commit**

```bash
git add src/content/projects/es/pokeutils.md src/content/projects/en/pokeutils.md tests/project-content.test.ts
git commit -m "feat(projects): PokeUtils content for the web layout

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: Contenido de BaseCero

**Files:**

- Modify: `src/content/projects/es/basecero.md` (reescritura completa), `src/content/projects/en/basecero.md` (reescritura completa)
- Test: `tests/project-content.test.ts` (añadir un `describe.each`)

**Interfaces:**

- Consumes: JPG de `src/assets/projects/basecero/` (Task 2); helpers del test.
- Produces: BaseCero con `kind: hybrid`, `license: MIT`, `platform`, `cover` (escritorio) y `coverMobile`, `playground` pwa en `https://basecero.alvarotc.com/app/`, 4 capturas 9:19.5, 7 features (3 con imagen), changelog `v1.0.0` fechada `2026-09-02` con nota `[DATO]`.

- [ ] **Step 1: Write the failing test**

Añadir al final de `tests/project-content.test.ts`:

```ts
describe.each(['es', 'en'])('basecero (%s)', (lang) => {
  const source = read(lang, 'basecero');

  it('is a published hybrid project under MIT', () => {
    expect(field(source, 'kind')).toBe('hybrid');
    expect(field(source, 'status')).toBe('published');
    expect(field(source, 'license')).toBe('MIT');
    expect(field(source, 'url')).toBe('https://basecero.alvarotc.com');
  });

  it('embeds the app as a pwa playground', () => {
    expect(source).toContain(
      "playground: { kind: pwa, src: 'https://basecero.alvarotc.com/app/' }",
    );
  });

  it('has a desktop cover and a phone cover', () => {
    expect(field(source, 'cover')).toContain('basecero/cover.jpg');
    expect(field(source, 'coverMobile')).toContain('basecero/cover-mobile.jpg');
  });

  it('dates v1.0.0 and leaves its note as [DATO]', () => {
    expect(source).toMatch(/version: 'v1\.0\.0', date: 2026-09-02, note: '\[DATO\]'/);
  });

  it('has four screenshots and seven features', () => {
    expect(source.match(/^ {2}- src: /gm)).toHaveLength(4);
    expect(source.match(/^ {2}- title: /gm)).toHaveLength(7);
  });

  it('points only at images that exist', () => {
    imageRefs(lang, 'basecero').forEach((ref) => expect(existsSync(ref), ref).toBe(true));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/project-content.test.ts`
Expected: FAIL: `kind` es `undefined`, `license` es `GPL-3.0`.

- [ ] **Step 3: Write minimal implementation**

`src/content/projects/es/basecero.md` (completo):

```md
---
name: BaseCero
tagline: Tu dinero, desde cero. Finanzas personales que viven enteras en tu dispositivo.
intro: 'Una web que se instala como app en el móvil y funciona sin conexión. Sin servidor, sin cuentas, sin telemetría.'
kind: hybrid
status: published
tier: lab
order: 4
repo: https://github.com/alvarotorresc/basecero
url: https://basecero.alvarotc.com
license: MIT
platform: 'Navegador, en escritorio y móvil'
stack: [Local-first, TypeScript]
githubRepo: alvarotorresc/basecero
icon: '../../../assets/projects/basecero/icon.jpg'
cover: '../../../assets/projects/basecero/cover.jpg'
coverMobile: '../../../assets/projects/basecero/cover-mobile.jpg'
playground: { kind: pwa, src: 'https://basecero.alvarotc.com/app/' }
facts:
  - { label: 'Se instala como app', value: 'PWA, sin conexión' }
  - { label: 'Datos', value: 'En tu dispositivo, sin servidor' }
screenshots:
  - src: '../../../assets/projects/basecero/home.jpg'
    alt: 'Inicio, con el disponible del periodo'
    caption: 'Inicio'
  - src: '../../../assets/projects/basecero/movements.jpg'
    alt: 'Lista de movimientos'
    caption: 'Movimientos'
  - src: '../../../assets/projects/basecero/net-worth.jpg'
    alt: 'Patrimonio con neto, cuentas y pasivos'
    caption: 'Patrimonio'
  - src: '../../../assets/projects/basecero/categories.jpg'
    alt: 'Gasto por categoría con límites'
    caption: 'Gasto por categoría'
featuresIntro: 'Cuentas que siguen tu nómina, no el calendario.'
features:
  - title: 'De nómina a nómina'
    text: 'Los periodos van de una nómina a la siguiente, no del 1 al 30. Con los recurrentes, ves el disponible real hasta el próximo cobro.'
    image: '../../../assets/projects/basecero/period.jpg'
  - title: 'Gastos compartidos'
    text: 'En las dos direcciones: lo que debes y lo que te deben. Cuando se salda, pulsas Liquidar.'
    image: '../../../assets/projects/basecero/shared.jpg'
  - title: 'Patrimonio'
    text: 'El neto, tus cuentas, los pasivos y los objetivos, en una sola vista.'
    image: '../../../assets/projects/basecero/net-worth.jpg'
  - title: 'Registrar rápido'
    text: 'Una pantalla con cinco tipos de apunte.'
  - title: 'Categorías con límites'
    text: '41 categorías en dos niveles, todas editables, y el gasto de cada una frente a su límite.'
  - title: 'Importa el CSV del banco'
    text: 'El de N26 se reconoce solo.'
  - title: 'Español e inglés'
    text: 'Con la moneda y el formato que elijas.'
illustration: '../../../assets/projects/basecero/icon.jpg'
built:
  - 'JavaScript, sin servidor.'
  - 'Local-first: todos los datos viven en tu dispositivo.'
  - 'PWA instalable, funciona sin conexión.'
  - 'Sin cuentas y sin telemetría.'
  - 'Exporta a un fichero plano que es tuyo.'
  - 'Software libre bajo MIT, código en [github.com/alvarotorresc/basecero](https://github.com/alvarotorresc/basecero).'
changelog:
  - { version: 'v1.0.0', date: 2026-09-02, note: '[DATO]' }
---

Finanzas personales local-first. Sin servidor, sin cuenta, exportación a fichero plano.

Para quien lleva sus gastos a mano y quiere seguir siendo dueño de sus datos.
```

`src/content/projects/en/basecero.md` (completo):

```md
---
name: BaseCero
tagline: Your money, from scratch. Personal finance that lives entirely on your device.
intro: 'A website that installs as an app on your phone and works offline. No server, no accounts, no telemetry.'
kind: hybrid
status: published
tier: lab
order: 4
repo: https://github.com/alvarotorresc/basecero
url: https://basecero.alvarotc.com
license: MIT
platform: 'Browser, on desktop and mobile'
stack: [Local-first, TypeScript]
githubRepo: alvarotorresc/basecero
icon: '../../../assets/projects/basecero/icon.jpg'
cover: '../../../assets/projects/basecero/cover.jpg'
coverMobile: '../../../assets/projects/basecero/cover-mobile.jpg'
playground: { kind: pwa, src: 'https://basecero.alvarotc.com/app/' }
facts:
  - { label: 'Installs as an app', value: 'PWA, works offline' }
  - { label: 'Data', value: 'On your device, no server' }
screenshots:
  - src: '../../../assets/projects/basecero/home.jpg'
    alt: 'Home, with what is left for the period'
    caption: 'Home'
  - src: '../../../assets/projects/basecero/movements.jpg'
    alt: 'List of transactions'
    caption: 'Transactions'
  - src: '../../../assets/projects/basecero/net-worth.jpg'
    alt: 'Net worth with total, accounts and liabilities'
    caption: 'Net worth'
  - src: '../../../assets/projects/basecero/categories.jpg'
    alt: 'Spending by category with limits'
    caption: 'Spending by category'
featuresIntro: 'Accounts that follow your payslip, not the calendar.'
features:
  - title: 'Payslip to payslip'
    text: 'Periods run from one payslip to the next, not from the 1st to the 30th. With recurring items, you see what is really left until the next payday.'
    image: '../../../assets/projects/basecero/period.jpg'
  - title: 'Shared expenses'
    text: 'Both ways: what you owe and what you are owed. When it is settled, you tap Settle.'
    image: '../../../assets/projects/basecero/shared.jpg'
  - title: 'Net worth'
    text: 'Your total, your accounts, liabilities and goals, in a single view.'
    image: '../../../assets/projects/basecero/net-worth.jpg'
  - title: 'Quick entry'
    text: 'One screen with five kinds of entry.'
  - title: 'Categories with limits'
    text: '41 categories on two levels, all editable, and the spending of each one against its limit.'
  - title: 'Imports your bank CSV'
    text: 'The N26 one is recognised automatically.'
  - title: 'Spanish and English'
    text: 'With the currency and format you choose.'
illustration: '../../../assets/projects/basecero/icon.jpg'
built:
  - 'JavaScript, no server.'
  - 'Local-first: all data lives on your device.'
  - 'Installable PWA, works offline.'
  - 'No accounts and no telemetry.'
  - 'Exports to a plain file that is yours.'
  - 'Free software under MIT, code at [github.com/alvarotorresc/basecero](https://github.com/alvarotorresc/basecero).'
changelog:
  - { version: 'v1.0.0', date: 2026-09-02, note: '[DATO]' }
---

Local-first personal finance. No server, no account, plain file export.

For people who track their spending by hand and want to stay the owners of their data.
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/project-content.test.ts`
Expected: PASS (23 previos + 12 de BaseCero).

- [ ] **Step 5: Commit**

```bash
git add src/content/projects/es/basecero.md src/content/projects/en/basecero.md tests/project-content.test.ts
git commit -m "feat(projects): BaseCero content for the hybrid layout

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 5: Contenido de create-astro-blog

**Files:**

- Modify: `src/content/projects/es/create-astro-blog.md` (reescritura completa), `src/content/projects/en/create-astro-blog.md` (reescritura completa)
- Test: `tests/project-content.test.ts` (añadir un `describe.each`)

**Interfaces:**

- Consumes: helpers del test.
- Produces: create-astro-blog con `kind: cli`, `visible: false`, `command`, 13 líneas de `terminal` (`''` es una línea en blanco; `$ ` comando; `✔ etiqueta › valor` respuesta; el resto salida), `facts` con versión, Node y licencia en `[DATO]`, 8 features sin imagen, `stepsIntro`, 6 `steps`, `after`, 4 líneas `built`, changelog `[DATO]` sin fecha. Sin imágenes.

- [ ] **Step 1: Write the failing test**

Añadir al final de `tests/project-content.test.ts`:

```ts
describe.each(['es', 'en'])('create-astro-blog (%s)', (lang) => {
  const source = read(lang, 'create-astro-blog');

  it('is a hidden cli project', () => {
    expect(field(source, 'kind')).toBe('cli');
    expect(field(source, 'visible')).toBe('false');
    expect(field(source, 'command')).toBe('npx create-astro-blog my-blog');
    expect(field(source, 'after')).toBe("'cd my-blog && npm run dev'");
  });

  it('keeps version, license and Node as [DATO]', () => {
    expect(source).toMatch(/value: '\[DATO\]', mono: true/);
    expect(source).not.toMatch(/^(license|hero|gallery):/m);
  });

  it('has the terminal session, eight features and six steps', () => {
    expect(source.match(/^ {2}- '\$ /gm)).toHaveLength(2);
    expect(source.match(/^ {2}- '✔ /gm)).toHaveLength(7);
    expect(source.match(/^ {2}- title: /gm)).toHaveLength(14);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/project-content.test.ts`
Expected: FAIL: `kind` y `command` son `undefined`.

- [ ] **Step 3: Write minimal implementation**

`src/content/projects/es/create-astro-blog.md` (completo):

```md
---
name: create-astro-blog
tagline: Crea un blog con Astro, personalizable, con un solo comando.
kind: cli
status: published
tier: lab
order: 6
visible: false
repo: https://github.com/alvarotorresc/create-astro-blog
url: https://www.npmjs.com/package/create-astro-blog
stack: [Node, CLI, Astro]
githubRepo: alvarotorresc/create-astro-blog
command: npx create-astro-blog my-blog
terminal:
  - '$ npx create-astro-blog my-blog'
  - ''
  - '✔ Blog name: › My Blog'
  - '✔ Tagline: › Notas de backend y software libre'
  - '✔ Domain (for SEO): › https://my-blog.com'
  - '✔ Color theme: › Ocean'
  - '✔ Enable multi-language (ES/EN)? › yes'
  - '✔ Enable newsletter? › yes'
  - '✔ Newsletter provider: › Buttondown'
  - ''
  - 'Installing dependencies...'
  - 'Done! Your blog is ready.'
  - '$ cd my-blog && npm run dev'
facts:
  - { label: 'Última versión', value: '[DATO]', mono: true }
  - { label: 'Node', value: '[DATO]', mono: true }
  - { label: 'Licencia', value: '[DATO]', mono: true }
featuresIntro: 'Un blog estático con Astro 5, listo para escribir el primer post.'
features:
  - title: 'Blog estático con Astro 5'
    text: 'Páginas generadas en el build. Se despliega en cualquier hosting estático.'
  - title: 'Cinco temas de color o el tuyo'
    text: 'Wine, ocean, forest, sunset y minimal, o un color en hexadecimal.'
  - title: 'Español e inglés'
    text: 'Multiidioma con traducción automática por DeepL.'
  - title: 'Newsletter'
    text: 'Con Buttondown, Brevo o Mailchimp.'
  - title: 'Imágenes OG en el build'
    text: 'Cada post sale con su imagen para redes, sin diseñarla a mano.'
  - title: 'Modo claro y oscuro'
    text: 'El lector elige cómo lo lee.'
  - title: 'RSS'
    text: 'Feed listo para quien lee con lector.'
  - title: 'Vercel Analytics'
    text: 'Visitas sin montar nada aparte si despliegas en Vercel.'
stepsIntro: 'El CLI hace seis preguntas y lo guarda todo en blog.config.ts. Si luego cambias de idea, editas ese fichero.'
steps:
  - title: 'Nombre y tagline'
    text: 'El nombre sale del directorio y lo puedes cambiar.'
  - title: 'Dominio'
    text: 'Para las URL canónicas y el SEO.'
  - title: 'Tema de color'
    text: 'wine, ocean, forest, sunset, minimal o custom con tu hexadecimal.'
  - title: 'Redes'
    text: 'Twitter, Instagram y LinkedIn. Todas opcionales.'
  - title: 'Multiidioma'
    text: 'Español e inglés. La traducción automática pide una clave de DeepL.'
  - title: 'Newsletter'
    text: 'Si la quieres, eliges proveedor: Buttondown, Brevo o Mailchimp.'
after: 'cd my-blog && npm run dev'
built:
  - 'Un CLI en Node que se ejecuta con npx, sin instalar nada.'
  - 'Genera un blog con Astro 5.'
  - 'Tus respuestas quedan en blog.config.ts, un fichero que lees y editas.'
  - 'Código en [github.com/alvarotorresc/create-astro-blog](https://github.com/alvarotorresc/create-astro-blog).'
changelog:
  - { version: '[DATO]', note: '[DATO]' }
---

[DATO: por qué existe, primer párrafo]

[DATO: segundo párrafo]
```

`src/content/projects/en/create-astro-blog.md` (completo):

```md
---
name: create-astro-blog
tagline: Create a customizable Astro blog with one command.
kind: cli
status: published
tier: lab
order: 6
visible: false
repo: https://github.com/alvarotorresc/create-astro-blog
url: https://www.npmjs.com/package/create-astro-blog
stack: [Node, CLI, Astro]
githubRepo: alvarotorresc/create-astro-blog
command: npx create-astro-blog my-blog
terminal:
  - '$ npx create-astro-blog my-blog'
  - ''
  - '✔ Blog name: › My Blog'
  - '✔ Tagline: › Backend notes and free software'
  - '✔ Domain (for SEO): › https://my-blog.com'
  - '✔ Color theme: › Ocean'
  - '✔ Enable multi-language (ES/EN)? › yes'
  - '✔ Enable newsletter? › yes'
  - '✔ Newsletter provider: › Buttondown'
  - ''
  - 'Installing dependencies...'
  - 'Done! Your blog is ready.'
  - '$ cd my-blog && npm run dev'
facts:
  - { label: 'Latest version', value: '[DATO]', mono: true }
  - { label: 'Node', value: '[DATO]', mono: true }
  - { label: 'License', value: '[DATO]', mono: true }
featuresIntro: 'A static blog with Astro 5, ready for your first post.'
features:
  - title: 'Static blog with Astro 5'
    text: 'Pages generated at build time. Deploys to any static host.'
  - title: 'Five colour themes or your own'
    text: 'Wine, ocean, forest, sunset and minimal, or a hex colour.'
  - title: 'Spanish and English'
    text: 'Multi-language with automatic translation through DeepL.'
  - title: 'Newsletter'
    text: 'With Buttondown, Brevo or Mailchimp.'
  - title: 'OG images at build time'
    text: 'Every post ships with its social image, without designing it by hand.'
  - title: 'Light and dark mode'
    text: 'The reader chooses how to read it.'
  - title: 'RSS'
    text: 'A feed ready for people who read with a reader.'
  - title: 'Vercel Analytics'
    text: 'Visits without setting anything else up if you deploy on Vercel.'
stepsIntro: 'The CLI asks six questions and saves everything in blog.config.ts. If you change your mind later, you edit that file.'
steps:
  - title: 'Name and tagline'
    text: 'The name comes from the directory and you can change it.'
  - title: 'Domain'
    text: 'For canonical URLs and SEO.'
  - title: 'Colour theme'
    text: 'wine, ocean, forest, sunset, minimal or custom with your hex colour.'
  - title: 'Social links'
    text: 'Twitter, Instagram and LinkedIn. All optional.'
  - title: 'Multi-language'
    text: 'Spanish and English. Automatic translation needs a DeepL key.'
  - title: 'Newsletter'
    text: 'If you want one, you pick the provider: Buttondown, Brevo or Mailchimp.'
after: 'cd my-blog && npm run dev'
built:
  - 'A Node CLI you run with npx, nothing to install.'
  - 'Generates a blog with Astro 5.'
  - 'Your answers end up in blog.config.ts, a file you read and edit.'
  - 'Code at [github.com/alvarotorresc/create-astro-blog](https://github.com/alvarotorresc/create-astro-blog).'
changelog:
  - { version: '[DATO]', note: '[DATO]' }
---

[DATO: why it exists, first paragraph]

[DATO: second paragraph]
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/project-content.test.ts`
Expected: PASS (35 previos + 6 de create-astro-blog).

- [ ] **Step 5: Commit**

```bash
git add src/content/projects/es/create-astro-blog.md src/content/projects/en/create-astro-blog.md tests/project-content.test.ts
git commit -m "feat(projects): create-astro-blog content for the cli layout

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 6: `kind` en Quedamos, Huellas y DevTools (es)

**Files:**

- Modify: `src/content/projects/es/quedamos.md` (frontmatter), `src/content/projects/es/huellas.md` (frontmatter), `src/content/projects/es/devtools.md` (frontmatter)
- Test: `tests/project-content.test.ts` (añadir un `describe.each`)

**Interfaces:**

- Consumes: `projectSchema` de la Task 1.
- Produces: Quedamos `kind: mobile`, Huellas `kind: hybrid`, DevTools `kind: web`; sin `hero`/`gallery`. El resto del contenido no cambia.

- [ ] **Step 1: Write the failing test**

Añadir al final de `tests/project-content.test.ts`:

```ts
const kinds: [string, string][] = [
  ['quedamos', 'mobile'],
  ['huellas', 'hybrid'],
  ['devtools', 'web'],
];

describe.each(kinds)('%s (es)', (slug, kind) => {
  it(`is a ${kind} project without hero`, () => {
    const source = read('es', slug);
    expect(field(source, 'kind')).toBe(kind);
    expect(source).not.toMatch(/^(hero|gallery):/m);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/project-content.test.ts`
Expected: FAIL: los tres `kind` son `undefined` y `quedamos` tiene `hero:`.

- [ ] **Step 3: Write minimal implementation**

`src/content/projects/es/quedamos.md`: añadir `kind: mobile` justo debajo de la línea `tagline:` y borrar la línea `hero: /projects/quedamos.png`. El frontmatter queda:

```md
---
name: Quedamos
tagline: Coordina quedadas con tu grupo, disponibilidad compartida, planes y votaciones.
kind: mobile
status: beta
tier: featured
order: 2
repo: https://github.com/alvarotorresc/quedamos-app
url: https://quedamos.alvarotc.com
license: AGPL-3.0
stack: [React, Ionic, Capacitor, NestJS, Prisma, Supabase]
githubRepo: alvarotorresc/quedamos-app
---
```

`src/content/projects/es/huellas.md`: añadir `kind: hybrid` justo debajo de `tagline:`. El frontmatter queda:

```md
---
name: Huellas
tagline: Una plataforma para reunir mascotas perdidas con sus familias.
kind: hybrid
status: design
tier: featured
order: 3
repo: https://github.com/alvarotorresc/huellas
license: AGPL-3.0
stack: [Next.js, Expo, NestJS, PostGIS]
githubRepo: alvarotorresc/huellas
---
```

`src/content/projects/es/devtools.md`: añadir `kind: web` justo debajo de `tagline:`. El frontmatter queda:

```md
---
name: DevTools
tagline: Generador de UUID, calculadora de hash, decodificador de JWT y más.
kind: web
status: published
tier: lab
order: 7
visible: false
repo: https://github.com/alvarotorresc/devtools
url: https://devtools.alvarotc.com
---
```

Los cuerpos Markdown no se tocan.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/project-content.test.ts`
Expected: PASS (41 previos + 3).

- [ ] **Step 5: Commit**

```bash
git add src/content/projects/es/quedamos.md src/content/projects/es/huellas.md src/content/projects/es/devtools.md tests/project-content.test.ts
git commit -m "feat(projects): kind for Quedamos, Huellas and DevTools in Spanish

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 7: `kind` en Quedamos, Huellas y DevTools (en) y guarda `RELEASE_CHECK`

**Files:**

- Modify: `src/content/projects/en/quedamos.md` (frontmatter), `src/content/projects/en/huellas.md` (frontmatter), `src/content/projects/en/devtools.md` (frontmatter)
- Test: `tests/project-content.test.ts` (añadir el `describe.each` en inglés, el barrido de los 14 ficheros y la guarda)

**Interfaces:**

- Consumes: todo el contenido de las Tasks 2-6.
- Produces: los 14 `.md` validan contra `projectSchema`. Guarda `projects release guard` (solo con `RELEASE_CHECK=1`) sobre los 10 ficheros visibles: sin `[DATO]` y con cada imagen referenciada por encima de 20000 bytes.

- [ ] **Step 1: Write the failing test**

En `tests/project-content.test.ts`, ampliar los imports:

```ts
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
```

Y añadir al final:

```ts
describe.each(kinds)('%s (en)', (slug, kind) => {
  it(`is a ${kind} project without hero`, () => {
    const source = read('en', slug);
    expect(field(source, 'kind')).toBe(kind);
    expect(source).not.toMatch(/^(hero|gallery):/m);
  });
});

const allFiles = ['es', 'en'].flatMap((lang) =>
  readdirSync(`src/content/projects/${lang}`).map((name) => `src/content/projects/${lang}/${name}`),
);
const visibleFiles = allFiles.filter(
  (path) => !/^visible:\s*false\s*$/m.test(readFileSync(path, 'utf8')),
);
describe('every project file', () => {
  it.each(allFiles)('%s has a kind and no hero or gallery', (path) => {
    const source = readFileSync(path, 'utf8');
    expect(source).toMatch(/^kind: (mobile|web|hybrid|cli)$/m);
    expect(source).not.toMatch(/^(hero|gallery):/m);
  });

  it('leaves the hidden projects out of the release guard', () => {
    expect(allFiles).toHaveLength(14);
    expect(visibleFiles).toHaveLength(10);
    expect(visibleFiles.some((path) => path.endsWith('create-astro-blog.md'))).toBe(false);
    expect(visibleFiles.some((path) => path.endsWith('devtools.md'))).toBe(false);
  });
});

describe.skipIf(!process.env.RELEASE_CHECK)('projects release guard', () => {
  it.each(visibleFiles)('%s has no [DATO] left', (path) => {
    expect(readFileSync(path, 'utf8')).not.toContain('[DATO]');
  });

  it.each(visibleFiles)('%s ships real images, not placeholders', (path) => {
    refsOf(path).forEach((ref) => expect(statSync(ref).size, ref).toBeGreaterThan(20000));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/project-content.test.ts`
Expected: FAIL: los tres `kind` en inglés son `undefined` y el barrido falla en `en/quedamos.md`, `en/huellas.md`, `en/devtools.md`. La guarda aparece como `skipped`.

- [ ] **Step 3: Write minimal implementation**

`src/content/projects/en/quedamos.md`: añadir `kind: mobile` debajo de `tagline:` y borrar `hero: /projects/quedamos.png`. El frontmatter queda:

```md
---
name: Quedamos
tagline: Coordinate meetups with your group, shared availability, plans and votes.
kind: mobile
status: beta
tier: featured
order: 2
repo: https://github.com/alvarotorresc/quedamos-app
url: https://quedamos.alvarotc.com
license: AGPL-3.0
stack: [React, Ionic, Capacitor, NestJS, Prisma, Supabase]
githubRepo: alvarotorresc/quedamos-app
---
```

`src/content/projects/en/huellas.md`:

```md
---
name: Huellas
tagline: A platform to reunite lost pets with their families.
kind: hybrid
status: design
tier: featured
order: 3
repo: https://github.com/alvarotorresc/huellas
license: AGPL-3.0
stack: [Next.js, Expo, NestJS, PostGIS]
githubRepo: alvarotorresc/huellas
---
```

`src/content/projects/en/devtools.md`:

```md
---
name: DevTools
tagline: UUID generator, hash calculator, JWT decoder and more.
kind: web
status: published
tier: lab
order: 7
visible: false
repo: https://github.com/alvarotorresc/devtools
url: https://devtools.alvarotc.com
---
```

Los cuerpos Markdown no se tocan.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/project-content.test.ts`
Expected: PASS (44 previos + 3 + 15 del barrido), guarda `skipped`.

Run: `RELEASE_CHECK=1 npx vitest run tests/project-content.test.ts`
Expected: FAIL a propósito: `[DATO]` en `pokeutils.md` y `basecero.md`, y todas las imágenes de Bito, PokeUtils y BaseCero por debajo de 20000 bytes. Quedamos y Huellas pasan. Esto confirma que la guarda funciona; no se arregla ahora.

- [ ] **Step 5: Commit**

```bash
git add src/content/projects/en/quedamos.md src/content/projects/en/huellas.md src/content/projects/en/devtools.md tests/project-content.test.ts
git commit -m "test(projects): kind in every project and a release guard for placeholders

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 8: Fecha corta y modelo plano `ProjectView`

**Files:**

- Modify: `src/lib/utils.ts` (añadir `formatShortDate` tras `formatDate`, línea 7)
- Create: `src/lib/project-view.ts`
- Test: `tests/project-view.test.ts` (nuevo), `tests/fixtures/project-view.ts` (nuevo, fixtures que usan las Tasks 9-13)

**Interfaces:**

- Consumes: `t`, `statusLabel`, `Locale` de `src/i18n/translations.ts`; `tone`, `StatusTone` de `src/lib/projects.ts` (Task 1).
- Produces:
  - `src/lib/utils.ts`: `export function formatShortDate(date: Date, locale?: string): string`.
  - `src/lib/project-view.ts`: tipos `ProjectKind`, `Fact`, `Step`, `Shot`, `Feature`, `ChangelogRow`, `NotePart`, `Note`, `LinkRef`, `ReleaseEntry`, `ViewPlayground`, `ProjectFields`, `ResolvedImages`, `ProjectView`, `TerminalLine`; funciones `displayUrl(url)`, `releaseLabel(changelog, lang)`, `factRows(fields, lang)`, `changelogRows(changelog, lang)`, `releasesLink(fields, lang)`, `shotsIntro(fields, lang)`, `parseTerminalLine(line)`, `fillParts(template, vars)`, `playgroundNotes(view)`, `hasMedia(view)`, `overhangs(view)`, `toProjectView(fields, images, lang, post?)`.
  - `tests/fixtures/project-view.ts`: `bitoFields`, `bitoImages`, `pokeFields`, `pokeImages`, `baseceroFields`, `baseceroImages`, `cliFields`, `sparseFields`, `noImages`, y `makeView(fields, images?, lang?, post?)`.

- [ ] **Step 1: Write the failing test**

`tests/fixtures/project-view.ts`:

```ts
import {
  toProjectView,
  type LinkRef,
  type ProjectFields,
  type ProjectView,
  type ResolvedImages,
} from '../../src/lib/project-view';
import type { Locale } from '../../src/i18n/translations';

export const noImages: ResolvedImages = { screenshots: [], features: [] };

export const bitoFields: ProjectFields = {
  kind: 'mobile',
  name: 'Bito',
  tagline: 'Registra un hábito en un toque, sin cuentas ni nube.',
  intro: 'La app de hábitos que no te roba tiempo.',
  status: 'publishing',
  platform: 'Android 10+',
  license: 'GPL-3.0',
  url: 'https://bito.alvarotc.com',
  repo: 'https://github.com/alvarotorresc/bito',
  download: {
    url: 'https://github.com/alvarotorresc/bito/releases/download/v1.0.0/app-release.apk',
    label: '4,7 MB',
  },
  terminal: [],
  facts: [
    { label: 'Tamaño del APK', value: '4,7 MB', mono: true },
    { label: 'Red', value: 'Sin permiso de red', mono: false },
  ],
  screenshots: [
    { alt: 'Widget en la pantalla de inicio', caption: 'Widget' },
    { alt: 'Recordatorio con botón de registrar', caption: 'Recordatorio' },
  ],
  featuresIntro: 'Tres formas de registrar, dos sin abrir la app.',
  features: [
    { title: 'Desde la pantalla de inicio', text: 'El widget registra el hábito con un toque.' },
    { title: 'Desde el recordatorio', text: 'La notificación trae su propio botón.' },
    { title: 'Al final del día', text: 'La revisión nocturna.' },
    { title: 'Rachas que no castigan', text: 'Congeladores para días imposibles.' },
  ],
  steps: [],
  playground: { kind: 'pwa', src: 'https://bito.alvarotc.com' },
  built: [
    'Kotlin, para Android 10+.',
    'Código en [github.com/alvarotorresc/bito](https://github.com/alvarotorresc/bito).',
  ],
  changelog: [
    { version: 'v2.0.0', note: 'Habi como compañera.' },
    { version: 'v1.0.0', date: new Date('2026-08-26'), note: 'Primera versión pública.' },
    { version: 'v0.1.0', note: 'El prototipo de 24 horas.' },
  ],
};

export const bitoImages: ResolvedImages = {
  icon: '/_astro/bito-icon.webp',
  cover: '/_astro/bito-cover.webp',
  illustration: '/_astro/habi.webp',
  screenshots: ['/_astro/widget.webp', '/_astro/reminder.webp'],
  features: ['/_astro/widget.webp', '/_astro/reminder.webp', '/_astro/review.webp', undefined],
};

export const pokeFields: ProjectFields = {
  kind: 'web',
  name: 'PokeUtils',
  tagline: 'Tu guía Pokémon retro: análisis competitivo, crianza y Pokédex completa.',
  status: 'published',
  url: 'https://pokeutils.alvarotc.com',
  repo: 'https://github.com/alvarotorresc/PokeUtils',
  terminal: [],
  facts: [{ label: 'Idiomas', value: 'Español e inglés', mono: false }],
  screenshots: [{ alt: 'Pokédex con filtros', caption: 'Pokédex' }],
  features: [{ title: 'Tu equipo', text: 'Hasta seis.' }],
  steps: [],
  playground: { kind: 'iframe', src: 'https://pokeutils.alvarotc.com' },
  built: [],
  changelog: [{ version: 'v1.0.0', date: new Date('2026-08-28'), note: '[DATO]' }],
};

export const pokeImages: ResolvedImages = {
  icon: '/_astro/poke-icon.webp',
  cover: '/_astro/poke-cover.webp',
  screenshots: ['/_astro/pokedex.webp'],
  features: ['/_astro/team.webp'],
};

export const baseceroFields: ProjectFields = {
  kind: 'hybrid',
  name: 'BaseCero',
  tagline: 'Tu dinero, desde cero.',
  status: 'published',
  platform: 'Navegador, en escritorio y móvil',
  license: 'MIT',
  url: 'https://basecero.alvarotc.com',
  repo: 'https://github.com/alvarotorresc/basecero',
  terminal: [],
  facts: [],
  screenshots: [{ alt: 'Lista de movimientos', caption: 'Movimientos' }],
  features: [{ title: 'Patrimonio', text: 'El neto en una sola vista.' }],
  steps: [],
  playground: { kind: 'pwa', src: 'https://basecero.alvarotc.com/app/' },
  built: [],
  changelog: [{ version: 'v1.0.0', date: new Date('2026-09-02'), note: '[DATO]' }],
};

export const baseceroImages: ResolvedImages = {
  cover: '/_astro/basecero-desktop.webp',
  coverMobile: '/_astro/basecero-phone.webp',
  screenshots: ['/_astro/movements.webp'],
  features: ['/_astro/net-worth.webp'],
};

export const cliFields: ProjectFields = {
  kind: 'cli',
  name: 'create-astro-blog',
  tagline: 'Crea un blog con Astro, personalizable, con un solo comando.',
  status: 'published',
  url: 'https://www.npmjs.com/package/create-astro-blog',
  repo: 'https://github.com/alvarotorresc/create-astro-blog',
  command: 'npx create-astro-blog my-blog',
  terminal: [
    '$ npx create-astro-blog my-blog',
    '',
    '✔ Blog name: › My Blog',
    'Installing dependencies...',
  ],
  facts: [{ label: 'Node', value: '[DATO]', mono: true }],
  screenshots: [],
  featuresIntro: 'Un blog estático con Astro 5.',
  features: [
    { title: 'Blog estático con Astro 5', text: 'Páginas generadas en el build.' },
    { title: 'RSS', text: 'Feed listo para quien lee con lector.' },
  ],
  steps: [
    { title: 'Nombre y tagline', text: 'El nombre sale del directorio.' },
    { title: 'Dominio', text: 'Para las URL canónicas y el SEO.' },
  ],
  stepsIntro: 'El CLI hace seis preguntas.',
  after: 'cd my-blog && npm run dev',
  built: [],
  changelog: [{ version: '[DATO]', note: '[DATO]' }],
};

export const sparseFields: ProjectFields = {
  kind: 'mobile',
  name: 'Quedamos',
  tagline: 'Coordina quedadas con tu grupo.',
  status: 'beta',
  license: 'AGPL-3.0',
  url: 'https://quedamos.alvarotc.com',
  repo: 'https://github.com/alvarotorresc/quedamos-app',
  terminal: [],
  facts: [],
  screenshots: [],
  features: [],
  steps: [],
  built: [],
  changelog: [],
};

export function makeView(
  fields: ProjectFields,
  images: ResolvedImages = noImages,
  lang: Locale = 'es',
  post?: LinkRef,
): ProjectView {
  return toProjectView(fields, images, lang, post);
}
```

`tests/project-view.test.ts`:

```ts
import { describe, it, expect, afterEach } from 'vitest';
import { formatShortDate } from '../src/lib/utils';
import {
  changelogRows,
  displayUrl,
  factRows,
  fillParts,
  hasMedia,
  overhangs,
  parseTerminalLine,
  playgroundNotes,
  releaseLabel,
  releasesLink,
  shotsIntro,
} from '../src/lib/project-view';
import {
  baseceroFields,
  baseceroImages,
  bitoFields,
  bitoImages,
  cliFields,
  makeView,
  pokeFields,
  pokeImages,
  sparseFields,
} from './fixtures/project-view';

const originalTz = process.env.TZ;

describe('formatShortDate', () => {
  afterEach(() => {
    if (originalTz === undefined) delete process.env.TZ;
    else process.env.TZ = originalTz;
  });

  it('formats in Spanish and English with a short month', () => {
    expect(formatShortDate(new Date('2026-08-26'), 'es')).toBe('26 ago 2026');
    expect(formatShortDate(new Date('2026-09-02'), 'es')).toBe('2 sept 2026');
    expect(formatShortDate(new Date('2026-08-26'), 'en')).toBe('Aug 26, 2026');
  });

  it('keeps the calendar day in a negative time zone', () => {
    process.env.TZ = 'America/Los_Angeles';
    expect(formatShortDate(new Date('2026-09-02'), 'es')).toBe('2 sept 2026');
  });
});

describe('displayUrl', () => {
  it('drops the protocol, www and a bare trailing slash', () => {
    expect(displayUrl('https://bito.alvarotc.com')).toBe('bito.alvarotc.com');
    expect(displayUrl('https://pokeutils.alvarotc.com/')).toBe('pokeutils.alvarotc.com');
    expect(displayUrl('https://www.npmjs.com/package/create-astro-blog')).toBe(
      'npmjs.com/package/create-astro-blog',
    );
  });

  it('keeps the trailing slash of a path', () => {
    expect(displayUrl('https://basecero.alvarotc.com/app/')).toBe('basecero.alvarotc.com/app/');
  });
});

describe('releaseLabel', () => {
  it('uses the first dated entry', () => {
    expect(releaseLabel(bitoFields.changelog, 'es')).toBe('v1.0.0, 26 ago 2026');
  });

  it('is undefined without a dated entry', () => {
    expect(releaseLabel(cliFields.changelog, 'es')).toBeUndefined();
  });
});

describe('factRows', () => {
  it('puts platform, license, last release and web before the content facts', () => {
    expect(factRows(bitoFields, 'es').map((row) => row.label)).toEqual([
      'Plataforma',
      'Licencia',
      'Última versión',
      'Web',
      'Tamaño del APK',
      'Red',
    ]);
  });

  it('keeps platform in plain text and the verifiable values in mono', () => {
    const rows = factRows(bitoFields, 'es');
    expect(rows[0].mono).toBe(false);
    expect(rows.slice(1, 4).every((row) => row.mono)).toBe(true);
    expect(rows[3].value).toBe('bito.alvarotc.com');
  });

  it('labels an npm url as npm for a cli', () => {
    const rows = factRows(cliFields, 'es');
    expect(rows[0]).toEqual({
      label: 'npm',
      value: 'npmjs.com/package/create-astro-blog',
      mono: true,
    });
  });

  it('returns nothing for a project without data', () => {
    expect(factRows({ ...sparseFields, license: undefined, url: undefined }, 'es')).toEqual([]);
  });
});

describe('changelogRows', () => {
  it('marks undated entries newer than the last release as coming', () => {
    expect(changelogRows(bitoFields.changelog, 'es')).toEqual([
      { version: 'v2.0.0', when: 'en camino', note: 'Habi como compañera.' },
      { version: 'v1.0.0', when: '26 ago 2026', note: 'Primera versión pública.' },
      { version: 'v0.1.0', when: undefined, note: 'El prototipo de 24 horas.' },
    ]);
  });

  it('leaves every row undated when nothing has a date', () => {
    expect(changelogRows(cliFields.changelog, 'en')[0].when).toBeUndefined();
  });
});

describe('releasesLink', () => {
  it('points at GitHub releases by default', () => {
    expect(releasesLink(bitoFields, 'es')).toEqual({
      href: 'https://github.com/alvarotorresc/bito/releases',
      label: 'Todas las versiones en GitHub',
    });
  });

  it('points at npm for a cli published there', () => {
    expect(releasesLink(cliFields, 'en')).toEqual({
      href: 'https://www.npmjs.com/package/create-astro-blog?activeTab=versions',
      label: 'All versions on npm',
    });
  });

  it('is undefined without repo or npm', () => {
    expect(releasesLink({ ...sparseFields, repo: undefined }, 'es')).toBeUndefined();
  });
});

describe('shotsIntro', () => {
  it('builds the default subtitle per kind from the last release', () => {
    expect(shotsIntro(bitoFields, 'es')).toBe('Pantallas de la v1.0.0 en un Android real.');
    expect(shotsIntro(pokeFields, 'es')).toBe('Pantallas de la v1.0.0 en escritorio.');
    expect(shotsIntro(baseceroFields, 'en')).toBe('v1.0.0 installed on a phone.');
  });

  it('prefers the content subtitle and has none for a cli', () => {
    expect(shotsIntro({ ...bitoFields, screenshotsIntro: 'Otra.' }, 'es')).toBe('Otra.');
    expect(shotsIntro(cliFields, 'es')).toBeUndefined();
  });
});

describe('parseTerminalLine', () => {
  it('recognises blank, command, answer and output lines', () => {
    expect(parseTerminalLine('')).toEqual({ kind: 'blank' });
    expect(parseTerminalLine('$ npx create-astro-blog my-blog')).toEqual({
      kind: 'command',
      text: 'npx create-astro-blog my-blog',
    });
    expect(parseTerminalLine('✔ Blog name: › My Blog')).toEqual({
      kind: 'answer',
      label: 'Blog name:',
      value: 'My Blog',
    });
    expect(parseTerminalLine('  Installing dependencies...')).toEqual({
      kind: 'output',
      text: 'Installing dependencies...',
    });
  });
});

describe('fillParts', () => {
  it('splits a template into text and value parts', () => {
    expect(fillParts('{size} desde GitHub.', { size: { text: '4,7 MB', mono: true } })).toEqual([
      { text: '4,7 MB', mono: true },
      { text: ' desde GitHub.' },
    ]);
  });

  it('returns undefined when a value is missing', () => {
    expect(fillParts('{size} para {platform}.', { size: { text: '4,7 MB' } })).toBeUndefined();
  });
});

describe('playgroundNotes', () => {
  it('gives a mobile app three notes with the APK size and platform in mono', () => {
    const notes = playgroundNotes(makeView(bitoFields, bitoImages));
    expect(notes.map((note) => note.title)).toEqual([
      'Toca un hábito para registrarlo',
      'Se carga cuando tú lo pides',
      'En tu móvil, con el APK',
    ]);
    expect(notes[2].parts).toEqual([
      { text: '4,7 MB', mono: true },
      { text: ' desde GitHub Releases, para ' },
      { text: 'Android 10+', mono: true },
      { text: '.' },
    ]);
  });

  it('drops the APK note when the download is missing', () => {
    const notes = playgroundNotes(makeView({ ...bitoFields, download: undefined }));
    expect(notes).toHaveLength(2);
  });

  it('links the hybrid install note to the playground address', () => {
    const notes = playgroundNotes(makeView(baseceroFields, baseceroImages));
    expect(notes).toHaveLength(3);
    expect(notes[2].parts[1]).toEqual({
      text: 'basecero.alvarotc.com/app/',
      mono: true,
      href: 'https://basecero.alvarotc.com/app/',
    });
  });

  it('gives the web one untitled note with a link to the site', () => {
    const notes = playgroundNotes(makeView(pokeFields, pokeImages));
    expect(notes).toHaveLength(1);
    expect(notes[0].title).toBeUndefined();
    expect(notes[0].parts).toContainEqual({
      text: 'abrirla en su dirección',
      href: 'https://pokeutils.alvarotc.com',
    });
  });

  it('is empty without a playground', () => {
    expect(playgroundNotes(makeView(sparseFields))).toEqual([]);
  });
});

describe('hasMedia and overhangs', () => {
  it('overhang needs a cover and screenshots', () => {
    const bito = makeView(bitoFields, bitoImages);
    expect(hasMedia(bito)).toBe(true);
    expect(overhangs(bito)).toBe(true);
    const coverOnly = makeView(
      { ...bitoFields, screenshots: [] },
      { ...bitoImages, screenshots: [] },
    );
    expect(hasMedia(coverOnly)).toBe(true);
    expect(overhangs(coverOnly)).toBe(false);
  });

  it('a sparse project has no media and no overhang', () => {
    const sparse = makeView(sparseFields);
    expect(hasMedia(sparse)).toBe(false);
    expect(overhangs(sparse)).toBe(false);
  });

  it('a cli has media only with a terminal session and never overhangs', () => {
    const cli = makeView(cliFields);
    expect(hasMedia(cli)).toBe(true);
    expect(overhangs(cli)).toBe(false);
    expect(hasMedia(makeView({ ...cliFields, terminal: [] }))).toBe(false);
  });
});

describe('toProjectView', () => {
  it('flattens a project into plain data', () => {
    const view = makeView(bitoFields, bitoImages);
    expect(view.statusLabel).toBe('En publicación');
    expect(view.tone).toBe('warn');
    expect(view.release).toBe('v1.0.0, 26 ago 2026');
    expect(view.address).toBe('bito.alvarotc.com');
    expect(view.screenshots[0]).toEqual({
      src: '/_astro/widget.webp',
      alt: 'Widget en la pantalla de inicio',
      caption: 'Widget',
    });
    expect(view.features[3].image).toBeUndefined();
    expect(view.allProjects).toBe('/es/projects');
  });

  it('links to the English project list', () => {
    expect(makeView(bitoFields, bitoImages, 'en').allProjects).toBe('/projects');
  });

  it('drops a video playground', () => {
    const view = makeView({
      ...bitoFields,
      playground: { kind: 'video', src: 'https://x.dev/a.mp4' },
    });
    expect(view.playground).toBeUndefined();
  });

  it('keeps an empty project empty', () => {
    const view = makeView(sparseFields);
    expect(view.release).toBeUndefined();
    expect(view.changelog).toEqual([]);
    expect(view.screenshotsIntro).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/project-view.test.ts`
Expected: FAIL: `Cannot find module '../src/lib/project-view'` y `formatShortDate` no exportada.

- [ ] **Step 3: Write minimal implementation**

En `src/lib/utils.ts`, después de `formatDate` (línea 7):

```ts
export function formatShortDate(date: Date, locale: string = 'es'): string {
  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
```

`src/lib/project-view.ts`:

```ts
import { t, statusLabel, type Locale } from '../i18n/translations';
import { formatShortDate } from './utils';
import { tone, type StatusTone } from './projects';

export type ProjectKind = 'mobile' | 'web' | 'hybrid' | 'cli';

export interface Fact {
  label: string;
  value: string;
  mono: boolean;
}

export interface Step {
  title: string;
  text: string;
}

export interface Shot {
  src: string;
  alt: string;
  caption: string;
}

export interface Feature {
  title: string;
  text: string;
  image?: string;
}

export interface ChangelogRow {
  version: string;
  when?: string;
  note: string;
}

export interface NotePart {
  text: string;
  mono?: boolean;
  href?: string;
}

export interface Note {
  title?: string;
  parts: NotePart[];
}

export interface LinkRef {
  href: string;
  label: string;
}

export interface ReleaseEntry {
  version: string;
  date?: Date;
  note: string;
}

export interface ViewPlayground {
  kind: 'pwa' | 'iframe';
  src: string;
}

export interface ProjectFields {
  kind: ProjectKind;
  name: string;
  tagline: string;
  intro?: string;
  status: string;
  platform?: string;
  license?: string;
  url?: string;
  repo?: string;
  download?: { url: string; label: string };
  command?: string;
  terminal: string[];
  facts: Fact[];
  screenshots: { alt: string; caption: string }[];
  screenshotsIntro?: string;
  featuresIntro?: string;
  features: { title: string; text: string }[];
  steps: Step[];
  stepsIntro?: string;
  after?: string;
  playground?: { kind: 'pwa' | 'iframe' | 'video'; src: string };
  built: string[];
  changelog: ReleaseEntry[];
}

export interface ResolvedImages {
  icon?: string;
  cover?: string;
  coverMobile?: string;
  illustration?: string;
  screenshots: string[];
  features: (string | undefined)[];
}

export interface ProjectView {
  lang: Locale;
  kind: ProjectKind;
  name: string;
  tagline: string;
  intro?: string;
  statusLabel: string;
  tone: StatusTone;
  release?: string;
  icon?: string;
  cover?: string;
  coverMobile?: string;
  illustration?: string;
  url?: string;
  address?: string;
  repo?: string;
  platform?: string;
  download?: { url: string; label: string };
  command?: string;
  terminal: string[];
  facts: Fact[];
  screenshots: Shot[];
  screenshotsIntro?: string;
  featuresIntro?: string;
  features: Feature[];
  steps: Step[];
  stepsIntro?: string;
  after?: string;
  post?: LinkRef;
  playground?: ViewPlayground;
  built: string[];
  changelog: ChangelogRow[];
  releases?: LinkRef;
  allProjects: string;
}

export type TerminalLine =
  | { kind: 'blank' }
  | { kind: 'command'; text: string }
  | { kind: 'answer'; label: string; value: string }
  | { kind: 'output'; text: string };

const isNpm = (fields: ProjectFields) =>
  fields.kind === 'cli' && Boolean(fields.url?.includes('npmjs.com'));

export function displayUrl(url: string): string {
  return url
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/^([^/]+)\/$/, '$1');
}

function latestRelease(changelog: ReleaseEntry[]): ReleaseEntry | undefined {
  return changelog.find((entry) => entry.date);
}

export function releaseLabel(changelog: ReleaseEntry[], lang: Locale): string | undefined {
  const last = latestRelease(changelog);
  return last?.date ? `${last.version}, ${formatShortDate(last.date, lang)}` : undefined;
}

export function factRows(fields: ProjectFields, lang: Locale): Fact[] {
  const rows: Fact[] = [];
  if (fields.platform) {
    rows.push({ label: t('project.platform', lang), value: fields.platform, mono: false });
  }
  if (fields.license) {
    rows.push({ label: t('project.license', lang), value: fields.license, mono: true });
  }
  const release = releaseLabel(fields.changelog, lang);
  if (release) rows.push({ label: t('project.lastRelease', lang), value: release, mono: true });
  if (fields.url) {
    rows.push({
      label: t(isNpm(fields) ? 'project.npm' : 'project.web', lang),
      value: displayUrl(fields.url),
      mono: true,
    });
  }
  return [...rows, ...fields.facts];
}

export function changelogRows(changelog: ReleaseEntry[], lang: Locale): ChangelogRow[] {
  const firstDated = changelog.findIndex((entry) => entry.date);
  return changelog.map((entry, i) => ({
    version: entry.version,
    when: entry.date
      ? formatShortDate(entry.date, lang)
      : i < firstDated
        ? t('project.upcoming', lang)
        : undefined,
    note: entry.note,
  }));
}

export function releasesLink(fields: ProjectFields, lang: Locale): LinkRef | undefined {
  if (isNpm(fields) && fields.url) {
    return { href: `${fields.url}?activeTab=versions`, label: t('project.releasesNpm', lang) };
  }
  if (fields.repo) {
    return { href: `${fields.repo}/releases`, label: t('project.releasesGithub', lang) };
  }
  return undefined;
}

export function shotsIntro(fields: ProjectFields, lang: Locale): string | undefined {
  if (fields.screenshotsIntro) return fields.screenshotsIntro;
  const kind = fields.kind;
  if (kind === 'cli') return undefined;
  const last = latestRelease(fields.changelog);
  if (!last) return undefined;
  return t(`project.shotsIntro.${kind}` as const, lang).replace('{version}', last.version);
}

export function parseTerminalLine(line: string): TerminalLine {
  if (line.trim() === '') return { kind: 'blank' };
  if (line.startsWith('$ ')) return { kind: 'command', text: line.slice(2) };
  const answer = /^✔ (.+?) › (.*)$/.exec(line);
  if (answer) return { kind: 'answer', label: answer[1], value: answer[2] };
  return { kind: 'output', text: line.trim() };
}

export function fillParts(
  template: string,
  vars: Record<string, NotePart | undefined>,
): NotePart[] | undefined {
  const parts: NotePart[] = [];
  for (const piece of template.split(/(\{\w+\})/)) {
    if (!piece) continue;
    const name = /^\{(\w+)\}$/.exec(piece)?.[1];
    if (!name) {
      parts.push({ text: piece });
      continue;
    }
    const value = vars[name];
    if (!value) return undefined;
    parts.push(value);
  }
  return parts;
}

export function playgroundNotes(view: ProjectView): Note[] {
  const { lang, playground } = view;
  if (!playground) return [];
  if (view.kind === 'web') {
    const parts = fillParts(t('project.note.web', lang), {
      link: view.url ? { text: t('project.note.webLink', lang), href: view.url } : undefined,
    });
    return parts ? [{ parts }] : [];
  }
  const loads: Note = {
    title: t('project.note.loads.title', lang),
    parts: [{ text: t('project.note.loads.text', lang) }],
  };
  if (view.kind === 'mobile') {
    const apk = fillParts(t('project.note.mobile.apk.text', lang), {
      size: view.download ? { text: view.download.label, mono: true } : undefined,
      platform: view.platform ? { text: view.platform, mono: true } : undefined,
    });
    return [
      {
        title: t('project.note.mobile.tap.title', lang),
        parts: [{ text: t('project.note.mobile.tap.text', lang) }],
      },
      loads,
      ...(apk ? [{ title: t('project.note.mobile.apk.title', lang), parts: apk }] : []),
    ];
  }
  if (view.kind === 'hybrid') {
    const install = fillParts(t('project.note.hybrid.install.text', lang), {
      src: { text: displayUrl(playground.src), mono: true, href: playground.src },
    });
    return [
      {
        title: t('project.note.hybrid.local.title', lang),
        parts: [{ text: t('project.note.hybrid.local.text', lang) }],
      },
      loads,
      ...(install ? [{ title: t('project.note.hybrid.install.title', lang), parts: install }] : []),
    ];
  }
  return [];
}

export function hasMedia(view: ProjectView): boolean {
  return view.kind === 'cli' ? view.terminal.length > 0 : Boolean(view.cover);
}

export function overhangs(view: ProjectView): boolean {
  return view.kind !== 'cli' && Boolean(view.cover) && view.screenshots.length > 0;
}

export function toProjectView(
  fields: ProjectFields,
  images: ResolvedImages,
  lang: Locale,
  post?: LinkRef,
): ProjectView {
  const prefix = lang === 'es' ? '/es' : '';
  const playground =
    fields.playground && fields.playground.kind !== 'video'
      ? { kind: fields.playground.kind, src: fields.playground.src }
      : undefined;
  return {
    lang,
    kind: fields.kind,
    name: fields.name,
    tagline: fields.tagline,
    intro: fields.intro,
    statusLabel: statusLabel(fields.status, lang),
    tone: tone(fields.status),
    release: releaseLabel(fields.changelog, lang),
    icon: images.icon,
    cover: images.cover,
    coverMobile: images.coverMobile,
    illustration: images.illustration,
    url: fields.url,
    address: fields.url ? displayUrl(fields.url) : undefined,
    repo: fields.repo,
    platform: fields.platform,
    download: fields.download,
    command: fields.command,
    terminal: fields.terminal,
    facts: factRows(fields, lang),
    screenshots: fields.screenshots.map((shot, i) => ({
      src: images.screenshots[i] ?? '',
      alt: shot.alt,
      caption: shot.caption,
    })),
    screenshotsIntro: shotsIntro(fields, lang),
    featuresIntro: fields.featuresIntro,
    features: fields.features.map((feature, i) => ({
      title: feature.title,
      text: feature.text,
      image: images.features[i],
    })),
    steps: fields.steps,
    stepsIntro: fields.stepsIntro,
    after: fields.after,
    post,
    playground,
    built: fields.built,
    changelog: changelogRows(fields.changelog, lang),
    releases: releasesLink(fields, lang),
    allProjects: `${prefix}/projects`,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/project-view.test.ts tests/projects.test.ts`
Expected: PASS (todos los `describe` de `project-view`, más los 5 de `projects`).

- [ ] **Step 5: Commit**

```bash
git add src/lib/utils.ts src/lib/project-view.ts tests/project-view.test.ts tests/fixtures/project-view.ts
git commit -m "feat(projects): flat project view model with release, facts and notes

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 9: Marcos de móvil, navegador y terminal

**Files:**

- Create: `src/components/projects/DeviceFrame.astro`, `src/components/projects/BrowserFrame.astro`, `src/components/projects/TerminalFrame.astro`
- Test: `tests/project-frames.test.ts` (nuevo)

**Interfaces:**

- Consumes: `parseTerminalLine` de `src/lib/project-view.ts` (Task 8).
- Produces:
  - `DeviceFrame.astro` Props `{ size: 'hero' | 'small' | 'play'; src?: string; alt?: string }`; raíz `data-frame="device" data-size={size}`; con `src` pinta `<img class="device-img">`, sin `src` pinta el slot por defecto dentro de `.device-screen`. Tamaños: hero 390x800 (260px de ancho en móvil), small 200x420 (260px en móvil), play 290x600 (300px en móvil).
  - `BrowserFrame.astro` Props `{ size: 'hero' | 'thin' | 'play'; address: string; src?: string; alt?: string }`; raíz `data-frame="browser" data-size={size}`; barra `aria-hidden` con tres puntos y la dirección en mono; pantalla 16:10 en hero y thin, 700px de alto en play (520px en móvil); slot igual que el móvil.
  - `TerminalFrame.astro` Props `{ title: string; lines: string[] }`; raíz `data-frame="terminal"`; clases de línea `term-gap`, `term-faint`, `term-ok`, `term-value`, `term-out`; cuerpo con `white-space: nowrap` y `overflow-x: auto`.

- [ ] **Step 1: Write the failing test**

`tests/project-frames.test.ts`:

```ts
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
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/project-frames.test.ts`
Expected: FAIL: `Cannot find module '../src/components/projects/DeviceFrame.astro'`.

- [ ] **Step 3: Write minimal implementation**

`src/components/projects/DeviceFrame.astro`:

```astro
---
interface Props {
  size: 'hero' | 'small' | 'play';
  src?: string;
  alt?: string;
}
const { size, src, alt = '' } = Astro.props;
---

<div data-frame="device" data-size={size} class:list={['device', `device-${size}`]}>
  {
    size === 'hero' && (
      <>
        <span class="device-key device-key-1" aria-hidden="true" />
        <span class="device-key device-key-2" aria-hidden="true" />
      </>
    )
  }
  <div class="device-screen">
    <span class="device-notch" aria-hidden="true"></span>
    {
      src ? (
        <img
          src={src}
          alt={alt}
          loading={size === 'hero' ? 'eager' : 'lazy'}
          decoding="async"
          class="device-img"
        />
      ) : (
        <slot />
      )
    }
  </div>
</div>

<style>
  .device {
    position: relative;
    box-sizing: border-box;
    background: #0b0d11;
    border: 1px solid #2c313b;
  }
  .device-hero {
    width: 390px;
    aspect-ratio: 390 / 800;
    padding: 12px;
    border-radius: 56px;
    box-shadow:
      0 48px 96px rgba(0, 0, 0, 0.55),
      0 0 0 6px #161920;
  }
  .device-small {
    width: 200px;
    aspect-ratio: 200 / 420;
    padding: 7px;
    border-radius: 32px;
    box-shadow:
      0 40px 80px rgba(0, 0, 0, 0.6),
      0 0 0 5px #161920;
  }
  .device-play {
    width: 290px;
    aspect-ratio: 290 / 600;
    padding: 10px;
    border-radius: 44px;
  }
  .device-screen {
    position: relative;
    display: flex;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: var(--surface-2);
  }
  .device-hero .device-screen {
    border-radius: 44px;
  }
  .device-small .device-screen {
    border-radius: 25px;
  }
  .device-play .device-screen {
    border-radius: 34px;
  }
  .device-notch {
    position: absolute;
    left: 50%;
    z-index: 1;
    transform: translateX(-50%);
    background: #0b0d11;
  }
  .device-hero .device-notch {
    top: 14px;
    width: 96px;
    height: 28px;
    border-radius: 14px;
  }
  .device-small .device-notch {
    top: 9px;
    width: 52px;
    height: 15px;
    border-radius: 8px;
  }
  .device-play .device-notch {
    top: 12px;
    width: 72px;
    height: 22px;
    border-radius: 11px;
  }
  .device-key {
    position: absolute;
    right: -9px;
    width: 3px;
    border-radius: 2px;
    background: #2c313b;
  }
  .device-key-1 {
    top: 168px;
    height: 72px;
  }
  .device-key-2 {
    top: 260px;
    height: 44px;
  }
  .device-img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .device-screen :global(iframe) {
    width: 100%;
    height: 100%;
    border: 0;
  }
  @media (max-width: 767px) {
    .device-hero,
    .device-small {
      width: 260px;
      padding: 8px;
      border-radius: 40px;
    }
    .device-hero .device-screen,
    .device-small .device-screen {
      border-radius: 32px;
    }
    .device-small {
      aspect-ratio: 390 / 800;
    }
    .device-play {
      width: 300px;
    }
  }
</style>
```

`src/components/projects/BrowserFrame.astro`:

```astro
---
interface Props {
  size: 'hero' | 'thin' | 'play';
  address: string;
  src?: string;
  alt?: string;
}
const { size, address, src, alt = '' } = Astro.props;
---

<div data-frame="browser" data-size={size} class:list={['browser', `browser-${size}`]}>
  <div class="browser-bar" aria-hidden="true">
    <span class="browser-dots"><span></span><span></span><span></span></span>
    <span class="browser-address">{address}</span>
    <span class="browser-spacer"></span>
  </div>
  <div class="browser-screen">
    {
      src ? (
        <img
          src={src}
          alt={alt}
          loading={size === 'play' ? 'lazy' : 'eager'}
          decoding="async"
          class="browser-img"
        />
      ) : (
        <slot />
      )
    }
  </div>
</div>

<style>
  .browser {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    width: 100%;
    overflow: hidden;
    border-radius: 12px;
    background: #0b0d11;
    border: 1px solid #2c313b;
  }
  .browser-hero {
    max-width: 620px;
    box-shadow:
      0 48px 96px rgba(0, 0, 0, 0.55),
      0 0 0 6px #161920;
  }
  .browser-thin {
    max-width: 520px;
    box-shadow: 0 32px 72px rgba(0, 0, 0, 0.5);
  }
  .browser-play {
    height: 700px;
  }
  .browser-bar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: 16px;
    height: 40px;
    padding: 0 14px;
    border-bottom: 1px solid #22262e;
    background: #161920;
  }
  .browser-thin .browser-bar {
    gap: 12px;
    height: 32px;
    padding: 0 12px;
    background: transparent;
  }
  .browser-dots {
    display: flex;
    flex-shrink: 0;
    gap: 7px;
  }
  .browser-dots span {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #2c313b;
  }
  .browser-thin .browser-dots {
    gap: 6px;
  }
  .browser-thin .browser-dots span {
    width: 8px;
    height: 8px;
  }
  .browser-address {
    display: block;
    flex: 1;
    min-width: 0;
    height: 26px;
    overflow: hidden;
    border-radius: 6px;
    background: #0f1115;
    font-family: var(--font-mono);
    font-size: 12px;
    line-height: 26px;
    color: #9aa3b2;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .browser-play .browser-address {
    max-width: 520px;
    margin: 0 auto;
  }
  .browser-thin .browser-address {
    height: 20px;
    padding: 0 10px;
    border-radius: 5px;
    background: #161920;
    font-size: 11px;
    line-height: 20px;
    color: #8a93a3;
    text-align: left;
  }
  .browser-spacer {
    flex-shrink: 0;
    width: 51px;
  }
  .browser-thin .browser-spacer {
    display: none;
  }
  .browser-screen {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--surface-2);
  }
  .browser-hero .browser-screen,
  .browser-thin .browser-screen {
    aspect-ratio: 16 / 10;
  }
  .browser-play .browser-screen {
    flex: 1;
  }
  .browser-img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .browser-screen :global(iframe) {
    width: 100%;
    height: 100%;
    border: 0;
  }
  @media (max-width: 767px) {
    .browser-play {
      height: 520px;
    }
  }
</style>
```

`src/components/projects/TerminalFrame.astro`:

```astro
---
import { parseTerminalLine } from '../../lib/project-view';

interface Props {
  title: string;
  lines: string[];
}
const { title, lines } = Astro.props;
const parsed = lines.map(parseTerminalLine);
---

<div data-frame="terminal" class="term">
  <div class="term-bar">
    <span class="term-dot" aria-hidden="true"></span>
    <span class="term-dot" aria-hidden="true"></span>
    <span class="term-dot" aria-hidden="true"></span>
    <span class="term-title">{title}</span>
  </div>
  <div class="term-body">
    {
      parsed.map((line) =>
        line.kind === 'blank' ? (
          <div class="term-gap" aria-hidden="true" />
        ) : line.kind === 'command' ? (
          <div>
            <span class="term-faint">$ </span>
            {line.text}
          </div>
        ) : line.kind === 'answer' ? (
          <div>
            <span class="term-ok">✔</span> {line.label} <span class="term-faint">›</span>{' '}
            <span class="term-value">{line.value}</span>
          </div>
        ) : (
          <div class="term-out">{line.text}</div>
        ),
      )
    }
  </div>
</div>

<style>
  .term {
    box-sizing: border-box;
    width: 100%;
    max-width: 620px;
    overflow: hidden;
    border-radius: 12px;
    background: #0b0d11;
    border: 1px solid #2c313b;
    box-shadow: 0 48px 96px rgba(0, 0, 0, 0.55);
    font-family: var(--font-mono);
    font-size: 14px;
    color: #e7e9ee;
  }
  .term-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 36px;
    padding: 0 14px;
    border-bottom: 1px solid #22262e;
    background: #12151b;
  }
  .term-dot {
    width: 11px;
    height: 11px;
    border-radius: 50%;
    background: #2c313b;
  }
  .term-title {
    margin-left: 12px;
    font-size: 12px;
    color: #8a93a3;
  }
  .term-body {
    min-height: 364px;
    padding: 20px 24px;
    overflow-x: auto;
    line-height: 1.6;
    white-space: nowrap;
  }
  .term-gap {
    height: 12px;
  }
  .term-faint {
    color: #8a93a3;
  }
  .term-ok {
    color: #5fd08a;
  }
  .term-value {
    color: #8ab4ff;
  }
  .term-out {
    padding-left: 2ch;
    color: #9aa3b2;
  }
  @media (max-width: 767px) {
    .term-body {
      min-height: 0;
      padding: 16px;
      font-size: 13px;
    }
  }
</style>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/project-frames.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/projects/DeviceFrame.astro src/components/projects/BrowserFrame.astro src/components/projects/TerminalFrame.astro tests/project-frames.test.ts
git commit -m "feat(projects): phone, browser and terminal frames

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 10: Cabecera partida con acciones y bloque de medios

**Files:**

- Create: `src/components/projects/ProjectHeader.astro`, `src/components/projects/ProjectMedia.astro`, `src/components/projects/ProjectActions.astro`
- Test: `tests/project-header.test.ts` (nuevo)

**Interfaces:**

- Consumes: `ProjectView`, `hasMedia`, `overhangs`, `displayUrl` (Task 8); `DeviceFrame`, `BrowserFrame`, `TerminalFrame` (Task 9); `Tag` de `src/components/ui/Tag.astro` (`tone: 'neutral' | 'ok' | 'warn'`); `t`; fixtures de `tests/fixtures/project-view.ts`.
- Produces:
  - `ProjectHeader.astro` Props `{ view: ProjectView }`: `<header data-kind>`, h1, tagline, intro, `Tag` + `<span data-release-label>`, `ProjectActions`, `<dl>` de `view.facts`, y `ProjectMedia` si `hasMedia(view)`.
  - `ProjectMedia.astro` Props `{ view: ProjectView }`: `data-media="mobile|web|hybrid|cli"`; sobresale con `-mb-[152px]` (en `lg` o `xl` según kind) solo si `overhangs(view)`.
  - `ProjectActions.astro` Props `{ view: ProjectView }`: enlaces con `data-action="download|open|repo|site|npm"`; en `cli`, bloque `data-command` con `<button data-copy-command data-copied-label>` y `<span data-copy-label>`; `<script>` de copiar.

- [ ] **Step 1: Write the failing test**

`tests/project-header.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import ProjectHeader from '../src/components/projects/ProjectHeader.astro';
import type { ProjectView } from '../src/lib/project-view';
import {
  baseceroFields,
  baseceroImages,
  bitoFields,
  bitoImages,
  cliFields,
  makeView,
  pokeFields,
  pokeImages,
  sparseFields,
} from './fixtures/project-view';

async function render(view: ProjectView) {
  const container = await AstroContainer.create();
  return container.renderToString(ProjectHeader, { props: { view } });
}

describe('ProjectHeader, mobile', () => {
  it('shows name, tagline, intro, status and last release', async () => {
    const html = await render(makeView(bitoFields, bitoImages));
    expect(html).toMatch(/<h1[^>]*>Bito<\/h1>/);
    expect(html).toContain('Registra un hábito en un toque');
    expect(html).toContain('La app de hábitos que no te roba tiempo.');
    expect(html).toContain('En publicación');
    expect(html).toContain('v1.0.0, 26 ago 2026');
    expect(html).toContain('href="/es/projects"');
  });

  it('shows the cover in a phone frame lifted over the fold', async () => {
    const html = await render(makeView(bitoFields, bitoImages));
    expect(html).toContain('data-media="mobile"');
    expect(html).toContain('data-frame="device"');
    expect(html).toContain('alt="Pantalla principal de Bito"');
    expect(html).toContain('lg:-mb-[152px]');
  });

  it('offers the APK first, then GitHub, then the site', async () => {
    const html = await render(makeView(bitoFields, bitoImages));
    const download = html.indexOf('data-action="download"');
    const repo = html.indexOf('data-action="repo"');
    const site = html.indexOf('data-action="site"');
    expect(download).toBeGreaterThan(-1);
    expect(download).toBeLessThan(repo);
    expect(repo).toBeLessThan(site);
    expect(html).toContain('Descargar APK');
    expect(html).toContain('app-release.apk');
    expect(html).toContain('Código en GitHub');
  });

  it('lists the facts in order', async () => {
    const html = await render(makeView(bitoFields, bitoImages));
    const labels = ['Plataforma', 'Licencia', 'Última versión', 'Web', 'Tamaño del APK', 'Red'];
    const positions = labels.map((label) => html.indexOf(`>${label}</dt>`));
    positions.forEach((position) => expect(position).toBeGreaterThan(-1));
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });

  it('does not lift a cover when there are no screenshots', async () => {
    const html = await render(
      makeView({ ...bitoFields, screenshots: [] }, { ...bitoImages, screenshots: [] }),
    );
    expect(html).toContain('data-media="mobile"');
    expect(html).not.toContain('-mb-[152px]');
  });

  it('translates the labels to English', async () => {
    const html = await render(makeView(bitoFields, bitoImages, 'en'));
    expect(html).toContain('Download APK');
    expect(html).toContain('Source on GitHub');
    expect(html).toContain('Aug 26, 2026');
    expect(html).toContain('href="/projects"');
  });
});

describe('ProjectHeader, web', () => {
  it('opens the site as the main action inside a browser frame', async () => {
    const html = await render(makeView(pokeFields, pokeImages));
    expect(html).toContain('data-media="web"');
    expect(html).toContain('data-frame="browser"');
    expect(html).toContain('data-action="open"');
    expect(html).toContain('Abrir la web');
    expect(html).not.toContain('data-action="download"');
    expect(html).not.toContain('data-action="site"');
    expect(html).toContain('xl:-mb-[152px]');
  });
});

describe('ProjectHeader, hybrid', () => {
  it('puts the small phone over the thin browser', async () => {
    const html = await render(makeView(baseceroFields, baseceroImages));
    expect(html).toContain('data-media="hybrid"');
    expect(html).toContain('data-size="thin"');
    expect(html).toContain('data-size="small"');
    expect(html).toContain('basecero.alvarotc.com/app/');
    expect(html).toContain('alt="BaseCero instalada en el móvil"');
    expect(html).toContain('Abrir la app');
    expect(html).toContain('data-action="site"');
  });
});

describe('ProjectHeader, cli', () => {
  it('offers the command with a copy button and shows the terminal', async () => {
    const html = await render(makeView(cliFields));
    expect(html).toContain('data-copy-command="npx create-astro-blog my-blog"');
    expect(html).toContain('data-copied-label="Copiado"');
    expect(html).toContain('Copiar el comando');
    expect(html).toContain('data-action="npm"');
    expect(html).toContain('Ver en npm');
    expect(html).toContain('data-media="cli"');
    expect(html).toContain('~/proyectos');
    expect(html).not.toContain('-mb-[152px]');
    expect(html).not.toContain('<img');
  });
});

describe('ProjectHeader, sparse', () => {
  it('renders only the text column for a project without media', async () => {
    const html = await render(makeView(sparseFields));
    expect(html).not.toContain('data-media=');
    expect(html).not.toContain('grid-cols-[minmax(0,1fr)_');
    expect(html).not.toContain('data-release-label');
    expect(html).toContain('Beta');
    expect(html).toContain('data-action="repo"');
    expect(html).not.toContain('data-action="download"');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/project-header.test.ts`
Expected: FAIL: `Cannot find module '../src/components/projects/ProjectHeader.astro'`.

- [ ] **Step 3: Write minimal implementation**

`src/components/projects/ProjectActions.astro`:

```astro
---
import { t } from '../../i18n/translations';
import type { ProjectView } from '../../lib/project-view';

interface Props {
  view: ProjectView;
}
const { view } = Astro.props;
const { lang, kind } = view;

const icons = {
  download: '<path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 21h14"/>',
  code: '<path d="M8 7l-5 5 5 5"/><path d="M16 7l5 5-5 5"/>',
  globe:
    '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/>',
  external:
    '<path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
};
const openLabel =
  kind === 'web'
    ? t('project.openWeb', lang)
    : kind === 'hybrid'
      ? t('project.openApp', lang)
      : undefined;
const openIcon = kind === 'web' ? icons.globe : icons.external;
---

<div class="mt-7 flex flex-col gap-2.5">
  {
    kind === 'cli' && view.command && (
      <div
        data-command
        class="flex h-11 max-w-full self-start overflow-hidden rounded-lg border border-border bg-surface"
      >
        <code class="flex min-w-0 items-center overflow-x-auto whitespace-nowrap px-3.5 font-mono text-[13px]">
          {view.command}
        </code>
        <button
          type="button"
          data-copy-command={view.command}
          data-copied-label={t('project.copied', lang)}
          class="inline-flex shrink-0 items-center gap-2 bg-accent px-4 text-sm font-bold text-accent-fg"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
            set:html={icons.copy}
          />
          <span data-copy-label aria-live="polite">
            {t('project.copy', lang)}
          </span>
        </button>
      </div>
    )
  }
  <div class="flex flex-wrap gap-2.5">
    {
      kind === 'mobile' && view.download && (
        <a
          href={view.download.url}
          rel="noopener"
          data-action="download"
          class="btn-primary gap-2.5"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
            set:html={icons.download}
          />
          <span>{t('project.download', lang)}</span>
          <span class="font-mono text-xs font-medium">{view.download.label}</span>
        </a>
      )
    }
    {
      openLabel && view.url && (
        <a href={view.url} rel="noopener" data-action="open" class="btn-primary gap-2.5">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
            set:html={openIcon}
          />
          <span>{openLabel}</span>
        </a>
      )
    }
    {
      view.repo && (
        <a href={view.repo} rel="noopener" data-action="repo" class="btn-secondary gap-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
            set:html={icons.code}
          />
          <span>{t('project.source', lang)}</span>
        </a>
      )
    }
    {
      (kind === 'mobile' || kind === 'hybrid') && view.url && view.address && (
        <a href={view.url} rel="noopener" data-action="site" class="btn-secondary gap-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
            set:html={icons.globe}
          />
          <span>{view.address}</span>
        </a>
      )
    }
    {
      kind === 'cli' && view.url && (
        <a href={view.url} rel="noopener" data-action="npm" class="btn-secondary gap-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
            set:html={icons.external}
          />
          <span>{t('project.npmLink', lang)}</span>
        </a>
      )
    }
  </div>
</div>

<script>
  function bindCopy() {
    document.querySelectorAll<HTMLButtonElement>('[data-copy-command]').forEach((button) => {
      if (button.dataset.bound) return;
      button.dataset.bound = 'true';
      button.addEventListener('click', async () => {
        const label = button.querySelector<HTMLElement>('[data-copy-label]');
        const original = label?.textContent ?? '';
        try {
          await navigator.clipboard.writeText(button.dataset.copyCommand ?? '');
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
  bindCopy();
  document.addEventListener('astro:after-swap', bindCopy);
</script>
```

`src/components/projects/ProjectMedia.astro`:

```astro
---
import DeviceFrame from './DeviceFrame.astro';
import BrowserFrame from './BrowserFrame.astro';
import TerminalFrame from './TerminalFrame.astro';
import { t } from '../../i18n/translations';
import { displayUrl, overhangs, type ProjectView } from '../../lib/project-view';

interface Props {
  view: ProjectView;
}
const { view } = Astro.props;
const { lang, name } = view;
const coverAlt = t('project.coverAlt', lang).replace('{name}', name);
const phoneAlt = t('project.coverMobileAlt', lang).replace('{name}', name);
const lift = overhangs(view)
  ? {
      mobile: 'lg:relative lg:z-[1] lg:-mb-[152px]',
      hybrid: 'lg:relative lg:z-[1] lg:-mb-[152px]',
      web: 'xl:relative xl:z-[1] xl:-mb-[152px]',
      cli: '',
    }[view.kind]
  : '';
const appAddress = view.playground ? displayUrl(view.playground.src) : (view.address ?? '');
---

{
  view.kind === 'mobile' && view.cover && (
    <div data-media="mobile" class:list={['flex justify-center lg:block', lift]}>
      <DeviceFrame size="hero" src={view.cover} alt={coverAlt} />
    </div>
  )
}
{
  view.kind === 'web' && view.cover && (
    <div data-media="web" class:list={['min-w-0 xl:self-end', lift]}>
      <BrowserFrame size="hero" address={view.address ?? ''} src={view.cover} alt={coverAlt} />
    </div>
  )
}
{
  view.kind === 'hybrid' && view.cover && (
    <div
      data-media="hybrid"
      class:list={['min-w-0 lg:relative lg:h-[620px] lg:w-[520px] lg:self-end', lift]}
    >
      <div
        class:list={[
          'lg:absolute lg:left-0 lg:top-0 lg:w-[520px]',
          view.coverMobile && 'hidden md:block',
        ]}
      >
        <BrowserFrame size="thin" address={appAddress} src={view.cover} alt={coverAlt} />
      </div>
      {view.coverMobile && (
        <div class="flex justify-center md:hidden lg:absolute lg:-right-10 lg:bottom-0 lg:block">
          <DeviceFrame size="small" src={view.coverMobile} alt={phoneAlt} />
        </div>
      )}
    </div>
  )
}
{
  view.kind === 'cli' && view.terminal.length > 0 && (
    <div data-media="cli" class="min-w-0 xl:mt-6 xl:self-start">
      <TerminalFrame title={t('project.terminalTitle', lang)} lines={view.terminal} />
    </div>
  )
}
```

`src/components/projects/ProjectHeader.astro`:

```astro
---
import Tag from '../ui/Tag.astro';
import ProjectActions from './ProjectActions.astro';
import ProjectMedia from './ProjectMedia.astro';
import { t } from '../../i18n/translations';
import { hasMedia, type ProjectView } from '../../lib/project-view';

interface Props {
  view: ProjectView;
}
const { view } = Astro.props;
const media = hasMedia(view);
const columns = {
  mobile: 'lg:grid-cols-[minmax(0,1fr)_390px] lg:gap-x-20',
  hybrid: 'lg:grid-cols-[minmax(0,1fr)_520px] lg:gap-x-16',
  web: 'xl:grid-cols-[minmax(0,1fr)_620px] xl:gap-x-12',
  cli: 'xl:grid-cols-[minmax(0,1fr)_620px] xl:gap-x-14',
}[view.kind];
const iconSize = view.kind === 'web' ? 56 : 72;
---

<header data-kind={view.kind} class="pb-14 pt-8 lg:pt-12">
  <div class:list={['grid grid-cols-1 gap-y-10', media && columns]}>
    <div class="flex min-w-0 flex-col pt-6">
      <a href={view.allProjects} class="self-start text-[13px] font-semibold text-accent">
        {t('projects.all', view.lang)}
      </a>
      <div class="mt-7 flex items-center gap-4 sm:gap-5">
        {
          view.icon && view.kind !== 'cli' && (
            <img
              src={view.icon}
              alt=""
              width={iconSize}
              height={iconSize}
              class:list={[
                'shrink-0 object-cover',
                view.kind === 'web' ? 'rounded-[14px]' : 'rounded-[18px]',
              ]}
            />
          )
        }
        <h1
          class:list={[
            'min-w-0 break-words font-extrabold leading-none tracking-[-0.04em]',
            view.kind === 'cli' ? 'text-[32px] sm:text-[44px]' : 'text-[44px] sm:text-[72px]',
          ]}
        >
          {view.name}
        </h1>
      </div>
      <p class="mt-5 text-xl font-semibold leading-[1.3] tracking-[-0.02em] sm:text-[26px]">
        {view.tagline}
      </p>
      {
        view.intro && (
          <p class="mt-3 max-w-[560px] text-base leading-[1.6] text-muted">{view.intro}</p>
        )
      }
      <div class="mt-5 flex flex-wrap items-center gap-3">
        <Tag tone={view.tone}>{view.statusLabel}</Tag>
        {
          view.release && (
            <span data-release-label class="font-mono text-[13px] text-muted">
              {view.release}
            </span>
          )
        }
      </div>
      <ProjectActions view={view} />
      {
        view.facts.length > 0 && (
          <dl class="mt-9 flex max-w-[560px] flex-col">
            {view.facts.map((fact) => (
              <div class="grid min-h-11 grid-cols-[140px_minmax(0,1fr)] items-center gap-3 border-t border-border py-2 sm:grid-cols-[180px_minmax(0,1fr)]">
                <dt class="text-[13px] text-muted">{fact.label}</dt>
                <dd class:list={['break-words text-sm', fact.mono && 'font-mono']}>{fact.value}</dd>
              </div>
            ))}
          </dl>
        )
      }
    </div>
    {media && <ProjectMedia view={view} />}
  </div>
</header>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/project-header.test.ts`
Expected: PASS (10 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/projects/ProjectHeader.astro src/components/projects/ProjectMedia.astro src/components/projects/ProjectActions.astro tests/project-header.test.ts
git commit -m "feat(projects): split header with kind-specific media and actions

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 11: Capturas, qué hace (con pasos de cli) y por qué existe

**Files:**

- Create: `src/components/projects/ProjectScreens.astro`, `src/components/projects/ProjectFeatures.astro`, `src/components/projects/ProjectWhy.astro`
- Test: `tests/project-sections.test.ts` (nuevo)

**Interfaces:**

- Consumes: `ProjectView`, `overhangs` (Task 8); `t`; fixtures.
- Produces:
  - `ProjectScreens.astro` Props `{ view }`: `<section data-section="screens">` solo si hay capturas; tira `.shots` con `scroll-snap-type: x mandatory`; cada `<figure>` con `<img class="shot-img shot-tall|shot-wide">` y `<figcaption>`; `lg:pt-[120px]` (o `xl:` en `web`) si `overhangs(view)`.
  - `ProjectFeatures.astro` Props `{ view }`: `<section data-section="features">` si hay features, con bloques `data-feature="block"` (las 3 primeras con imagen; nunca en `cli`) y el resto `data-feature="item"` en dos columnas; `<section data-section="steps">` si hay `steps`, con `<ol>` numerado y `after` en `<code>`.
  - `ProjectWhy.astro` Props `{ view }` + slot por defecto (el cuerpo Markdown): `<section data-section="why">`, enlace `data-post-link` si `view.post`, `<img data-illustration>` si `view.illustration`.

- [ ] **Step 1: Write the failing test**

`tests/project-sections.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import ProjectScreens from '../src/components/projects/ProjectScreens.astro';
import ProjectFeatures from '../src/components/projects/ProjectFeatures.astro';
import ProjectWhy from '../src/components/projects/ProjectWhy.astro';
import {
  bitoFields,
  bitoImages,
  cliFields,
  makeView,
  pokeFields,
  pokeImages,
  sparseFields,
} from './fixtures/project-view';

describe('ProjectScreens', () => {
  it('renders a snapping strip of tall captioned screenshots', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectScreens, {
      props: { view: makeView(bitoFields, bitoImages) },
    });
    expect(html).toContain('data-section="screens"');
    expect(html).toContain('>Capturas</h2>');
    expect(html).toContain('Pantallas de la v1.0.0 en un Android real.');
    expect(html.match(/<figure/g)).toHaveLength(2);
    expect(html).toContain('alt="Widget en la pantalla de inicio"');
    expect(html).toMatch(/<figcaption[^>]*>Widget<\/figcaption>/);
    expect(html).toContain('shot-tall');
    expect(html).toContain('lg:pt-[120px]');
  });

  it('uses wide 16:10 screenshots for the web', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectScreens, {
      props: { view: makeView(pokeFields, pokeImages) },
    });
    expect(html).toContain('shot-wide');
    expect(html).toContain('xl:pt-[120px]');
  });

  it('renders nothing without screenshots', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectScreens, {
      props: { view: makeView(sparseFields) },
    });
    expect(html).not.toContain('data-section="screens"');
  });
});

describe('ProjectFeatures', () => {
  it('shows up to three features with an image as blocks and the rest as a list', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectFeatures, {
      props: { view: makeView(bitoFields, bitoImages) },
    });
    expect(html).toContain('>Qué hace</h2>');
    expect(html).toContain('Tres formas de registrar, dos sin abrir la app.');
    expect(html.match(/data-feature="block"/g)).toHaveLength(3);
    expect(html.match(/data-feature="item"/g)).toHaveLength(1);
    expect(html).toContain('src="/_astro/review.webp"');
    expect(html).not.toContain('data-section="steps"');
  });

  it('lists every cli feature under "Qué te da" and numbers the steps', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectFeatures, {
      props: { view: makeView(cliFields) },
    });
    expect(html).toContain('>Qué te da</h2>');
    expect(html).not.toContain('data-feature="block"');
    expect(html.match(/data-feature="item"/g)).toHaveLength(2);
    expect(html).toContain('data-section="steps"');
    expect(html).toContain('>Cómo lo configuras</h2>');
    expect(html).toContain('El CLI hace seis preguntas.');
    expect(html.match(/data-step=/g)).toHaveLength(2);
    expect(html).toContain('Después:');
    expect(html).toContain('cd my-blog &amp;&amp; npm run dev');
  });

  it('renders nothing without features or steps', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectFeatures, {
      props: { view: makeView(sparseFields) },
    });
    expect(html).not.toContain('<section');
  });
});

describe('ProjectWhy', () => {
  it('renders the markdown body, the post link and the illustration', async () => {
    const container = await AstroContainer.create();
    const view = makeView(bitoFields, bitoImages, 'es', {
      href: '/es/blog/de-una-idea-a-una-apk-en-24h',
      label: 'De una idea a una APK en 24 horas',
    });
    const html = await container.renderToString(ProjectWhy, {
      props: { view },
      slots: { default: '<p>Todas las apps de hábitos que probé pedían una cuenta.</p>' },
    });
    expect(html).toContain('>Por qué existe</h2>');
    expect(html).toContain('Todas las apps de hábitos que probé pedían una cuenta.');
    expect(html).toContain('href="/es/blog/de-una-idea-a-una-apk-en-24h"');
    expect(html).toContain('Leer el post: De una idea a una APK en 24 horas');
    expect(html).toContain('data-illustration');
    expect(html).toContain('src="/_astro/habi.webp"');
  });

  it('skips the post link and the illustration when there are none', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectWhy, {
      props: { view: makeView(sparseFields) },
      slots: { default: '<p>Beta privada.</p>' },
    });
    expect(html).toContain('data-section="why"');
    expect(html).not.toContain('data-post-link');
    expect(html).not.toContain('data-illustration');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/project-sections.test.ts`
Expected: FAIL: `Cannot find module '../src/components/projects/ProjectScreens.astro'`.

- [ ] **Step 3: Write minimal implementation**

`src/components/projects/ProjectScreens.astro`:

```astro
---
import { t } from '../../i18n/translations';
import { overhangs, type ProjectView } from '../../lib/project-view';

interface Props {
  view: ProjectView;
}
const { view } = Astro.props;
const wide = view.kind === 'web';
const clearance = overhangs(view) ? (wide ? 'xl:pt-[120px]' : 'lg:pt-[120px]') : '';
---

{
  view.screenshots.length > 0 && (
    <section
      data-section="screens"
      class="grid grid-cols-1 gap-y-6 border-t border-border pb-12 pt-10 md:grid-cols-[200px_minmax(0,1fr)] md:gap-x-10"
    >
      <div class="flex flex-col gap-2 md:pt-10">
        <h2 class="text-[22px] font-bold tracking-[-0.02em]">
          {t('project.screenshots', view.lang)}
        </h2>
        {view.screenshotsIntro && (
          <p class="text-sm leading-[1.6] text-muted">{view.screenshotsIntro}</p>
        )}
      </div>
      <div class:list={['shots -mx-4 min-w-0 overflow-x-auto px-4 md:mx-0 md:px-0', clearance]}>
        <ul class="flex w-max gap-5">
          {view.screenshots.map((shot) => (
            <li class="shot">
              <figure class="flex flex-col gap-2.5">
                <img
                  src={shot.src}
                  alt={shot.alt}
                  loading="lazy"
                  decoding="async"
                  class:list={['shot-img', wide ? 'shot-wide' : 'shot-tall']}
                />
                <figcaption class="text-[13px] text-muted">{shot.caption}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

<style>
  .shots {
    scroll-snap-type: x mandatory;
    scroll-padding-inline: 16px;
  }
  .shot {
    scroll-snap-align: start;
  }
  .shot-img {
    display: block;
    object-fit: cover;
    background: var(--surface-2);
    border: 1px solid var(--border);
  }
  .shot-tall {
    width: 200px;
    aspect-ratio: 9 / 19.5;
    border-radius: 24px;
  }
  .shot-wide {
    width: 400px;
    aspect-ratio: 16 / 10;
    border-radius: 12px;
  }
  @media (max-width: 767px) {
    .shot-wide {
      width: 300px;
    }
  }
</style>
```

`src/components/projects/ProjectFeatures.astro`:

```astro
---
import { t } from '../../i18n/translations';
import type { ProjectView } from '../../lib/project-view';

interface Props {
  view: ProjectView;
}
const { view } = Astro.props;
const { lang } = view;
const cli = view.kind === 'cli';
const wide = view.kind === 'web';
const blocks = cli ? [] : view.features.filter((feature) => feature.image).slice(0, 3);
const items = view.features.filter((feature) => !blocks.includes(feature));
---

{
  view.features.length > 0 && (
    <section data-section="features" class="flex flex-col gap-8 border-t border-border py-14">
      <div class="flex flex-col gap-2">
        <h2 class="text-[22px] font-bold tracking-[-0.02em]">
          {t(cli ? 'project.featuresCli' : 'project.features', lang)}
        </h2>
        {view.featuresIntro && <p class="text-base text-muted">{view.featuresIntro}</p>}
      </div>
      {blocks.length > 0 && (
        <div class="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {blocks.map((feature) => (
            <div
              data-feature="block"
              class="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5"
            >
              <img
                src={feature.image}
                alt={feature.title}
                loading="lazy"
                decoding="async"
                class:list={['feature-img', wide ? 'feature-wide' : 'feature-tall']}
              />
              <div class="flex flex-col gap-2 sm:pt-1">
                <h3 class="text-[17px] font-bold tracking-[-0.01em]">{feature.title}</h3>
                <p class="text-sm leading-[1.6] text-muted">{feature.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {items.length > 0 && (
        <ul class="grid grid-cols-1 md:grid-cols-2 md:gap-x-20">
          {items.map((feature) => (
            <li data-feature="item" class="flex flex-col gap-1.5 border-t border-border py-[18px]">
              <span class="text-[15px] font-bold">{feature.title}</span>
              <span class="text-sm leading-[1.6] text-muted">{feature.text}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
{
  view.steps.length > 0 && (
    <section
      data-section="steps"
      class="grid grid-cols-1 gap-8 border-t border-border py-14 md:grid-cols-[320px_minmax(0,1fr)] md:gap-x-20"
    >
      <div class="flex flex-col gap-2 md:pt-2">
        <h2 class="text-[22px] font-bold tracking-[-0.02em]">{t('project.steps', lang)}</h2>
        {view.stepsIntro && <p class="text-base leading-[1.6] text-muted">{view.stepsIntro}</p>}
      </div>
      <div class="flex max-w-[640px] flex-col">
        <ol class="flex flex-col">
          {view.steps.map((step, i) => (
            <li
              data-step={i + 1}
              class="grid grid-cols-[32px_minmax(0,1fr)] border-t border-border py-[18px] last:border-b"
            >
              <span class="text-[15px] font-bold text-faint">{i + 1}</span>
              <div class="flex flex-col gap-1.5">
                <span class="text-[15px] font-bold">{step.title}</span>
                <span class="text-sm leading-[1.6] text-muted">{step.text}</span>
              </div>
            </li>
          ))}
        </ol>
        {view.after && (
          <p class="flex flex-wrap items-center gap-3 pt-5">
            <span class="text-sm text-muted">{t('project.after', lang)}</span>
            <code class="rounded-md border border-border bg-surface px-2.5 py-1.5 font-mono text-[13px]">
              {view.after}
            </code>
          </p>
        )}
      </div>
    </section>
  )
}

<style>
  .feature-img {
    flex-shrink: 0;
    object-fit: cover;
    background: var(--surface-2);
    border: 1px solid var(--border);
  }
  .feature-tall {
    width: 100px;
    aspect-ratio: 100 / 217;
    border-radius: 16px;
  }
  .feature-wide {
    width: 144px;
    aspect-ratio: 16 / 10;
    border-radius: 8px;
  }
</style>
```

`src/components/projects/ProjectWhy.astro`:

```astro
---
import { t } from '../../i18n/translations';
import type { ProjectView } from '../../lib/project-view';

interface Props {
  view: ProjectView;
}
const { view } = Astro.props;
const { lang } = view;
---

<section
  data-section="why"
  class="grid grid-cols-1 gap-6 border-t border-border py-14 lg:grid-cols-12 lg:gap-x-6"
>
  <h2 class="text-[22px] font-bold tracking-[-0.02em] lg:col-span-3">{t('project.why', lang)}</h2>
  <div class="flex flex-col gap-4 lg:col-span-7">
    <div class="prose why-body"><slot /></div>
    {
      view.post && (
        <a
          data-post-link
          href={view.post.href}
          class="self-start text-sm font-semibold text-accent"
        >
          {t('project.readPost', lang).replace('{title}', view.post.label)}
        </a>
      )
    }
  </div>
  {
    view.illustration && (
      <img
        data-illustration
        src={view.illustration}
        alt=""
        loading="lazy"
        decoding="async"
        class="h-40 w-40 rounded-xl object-contain lg:col-span-2"
      />
    )
  }
</section>

<style>
  .why-body {
    font-size: 17px;
  }
  .why-body :global(p:last-child) {
    margin-bottom: 0;
  }
</style>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/project-sections.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/projects/ProjectScreens.astro src/components/projects/ProjectFeatures.astro src/components/projects/ProjectWhy.astro tests/project-sections.test.ts
git commit -m "feat(projects): screenshots strip, features, cli steps and why sections

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 12: Pruébalo, cómo está hecho y cambios

**Files:**

- Create: `src/components/projects/ProjectPlayground.astro`, `src/components/projects/ProjectHistory.astro`
- Delete: `src/components/projects/PlaygroundFrame.astro` (su `<script>` pasa a `ProjectPlayground.astro`)
- Test: `tests/project-playground.test.ts` (nuevo), `tests/project-page.test.ts` (borrar el import de `PlaygroundFrame` y su `describe`)

**Interfaces:**

- Consumes: `ProjectView`, `playgroundNotes`, `displayUrl`, `NotePart` (Task 8); `DeviceFrame`, `BrowserFrame` (Task 9); `inlineLinks` de `src/lib/inline-links.ts`; `t`; fixtures.
- Produces:
  - `ProjectPlayground.astro` Props `{ view }`: `<section data-section="playground">` solo si `view.playground`; en `mobile`/`hybrid` un `DeviceFrame size="play"` con `<button data-playground-load data-src data-title>` "Cargar la app" y las notas `data-note`; en `web` un `BrowserFrame size="play"` con "Cargar la web" y una nota. `<script>` que sustituye el botón por un `<iframe sandbox="allow-scripts allow-same-origin allow-forms">`.
  - `ProjectHistory.astro` Props `{ view }`: `<section data-section="history">` siempre (lleva el enlace "Todos los proyectos"); lista `data-built` con `inlineLinks`; filas `data-release` (la primera con `text-accent`); enlace `data-releases`.

Nota: tras esta tarea `ProjectPage.astro` (antiguo) importa un fichero borrado hasta la Task 13. Esta tarea no ejecuta build.

- [ ] **Step 1: Write the failing test**

`tests/project-playground.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import ProjectPlayground from '../src/components/projects/ProjectPlayground.astro';
import ProjectHistory from '../src/components/projects/ProjectHistory.astro';
import type { ProjectView } from '../src/lib/project-view';
import {
  baseceroFields,
  baseceroImages,
  bitoFields,
  bitoImages,
  cliFields,
  makeView,
  pokeFields,
  pokeImages,
  sparseFields,
} from './fixtures/project-view';

async function playground(view: ProjectView) {
  const container = await AstroContainer.create();
  return container.renderToString(ProjectPlayground, { props: { view } });
}

async function history(view: ProjectView) {
  const container = await AstroContainer.create();
  return container.renderToString(ProjectHistory, { props: { view } });
}

describe('ProjectPlayground', () => {
  it('loads a mobile app on demand inside a phone frame with three notes', async () => {
    const html = await playground(makeView(bitoFields, bitoImages));
    expect(html).toContain('data-section="playground"');
    expect(html).toContain('data-size="play"');
    expect(html).toContain('data-playground-load');
    expect(html).toContain('data-src="https://bito.alvarotc.com"');
    expect(html).toContain('Cargar la app');
    expect(html).toContain('La app entera, aquí mismo, en un marco de móvil.');
    expect(html.match(/data-note/g)).toHaveLength(3);
    expect(html).toMatch(/font-mono[^"]*"[^>]*>4,7 MB<\/span>/);
    expect(html).not.toContain('<iframe');
  });

  it('links the hybrid install note to the app address', async () => {
    const html = await playground(makeView(baseceroFields, baseceroImages));
    expect(html).toContain('href="https://basecero.alvarotc.com/app/"');
    expect(html).toContain('basecero.alvarotc.com/app/</a>');
  });

  it('loads a website inside a full-width browser frame with one note', async () => {
    const html = await playground(makeView(pokeFields, pokeImages));
    expect(html).toContain('data-frame="browser"');
    expect(html).toContain('Cargar la web');
    expect(html).toContain('La web entera, aquí mismo.');
    expect(html.match(/data-note/g)).toHaveLength(1);
    expect(html).toContain('abrirla en su dirección');
  });

  it('renders nothing without a playground', async () => {
    expect(await playground(makeView(sparseFields))).not.toContain('<section');
    expect(await playground(makeView(cliFields))).not.toContain('<section');
  });
});

describe('ProjectHistory', () => {
  it('lists the built lines with safe inline links', async () => {
    const html = await history(makeView(bitoFields, bitoImages));
    expect(html).toContain('>Cómo está hecho</h2>');
    expect(html).toContain(
      '<a href="https://github.com/alvarotorresc/bito">github.com/alvarotorresc/bito</a>',
    );
  });

  it('shows the changelog with the newest entry in the accent colour', async () => {
    const html = await history(makeView(bitoFields, bitoImages));
    expect(html).toContain('>Cambios</h2>');
    expect(html.match(/data-release(?!s)/g)).toHaveLength(3);
    expect(html).toMatch(/text-accent[^>]*>v2\.0\.0, en camino</);
    expect(html).toContain('v1.0.0, 26 ago 2026');
    expect(html).toMatch(/>v0\.1\.0</);
    expect(html).toContain('href="https://github.com/alvarotorresc/bito/releases"');
    expect(html).toContain('Todas las versiones en GitHub');
  });

  it('points a cli at npm', async () => {
    const html = await history(makeView(cliFields));
    expect(html).toContain('Todas las versiones en npm');
    expect(html).toContain('?activeTab=versions');
  });

  it('keeps only the link back to all projects when there is nothing else', async () => {
    const html = await history(makeView(sparseFields));
    expect(html).toContain('data-section="history"');
    expect(html).not.toContain('<h2');
    expect(html).not.toContain('data-releases');
    expect(html).toContain('href="/es/projects"');
    expect(html).toContain('Todos los proyectos');
  });
});

describe('PlaygroundFrame', () => {
  it('is gone', () => {
    expect(existsSync('src/components/projects/PlaygroundFrame.astro')).toBe(false);
  });
});
```

En `tests/project-page.test.ts`, borrar la línea `import PlaygroundFrame from '../src/components/projects/PlaygroundFrame.astro';` y el bloque `describe('PlaygroundFrame', ...)` completo.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/project-playground.test.ts tests/project-page.test.ts`
Expected: FAIL: `Cannot find module '../src/components/projects/ProjectPlayground.astro'`.

- [ ] **Step 3: Write minimal implementation**

`src/components/projects/ProjectPlayground.astro`:

```astro
---
import DeviceFrame from './DeviceFrame.astro';
import BrowserFrame from './BrowserFrame.astro';
import { t } from '../../i18n/translations';
import {
  displayUrl,
  playgroundNotes,
  type NotePart,
  type ProjectView,
} from '../../lib/project-view';

interface Props {
  view: ProjectView;
}
const { view } = Astro.props;
const { lang, playground } = view;
const notes = playgroundNotes(view);
const phone = view.kind === 'mobile' || view.kind === 'hybrid';
const web = view.kind === 'web';
const play = '<path d="M7 4l13 8-13 8z"/>';
const partClass = (part: NotePart) =>
  [part.href && 'font-semibold text-accent', part.mono && 'font-mono text-[13px]']
    .filter(Boolean)
    .join(' ');
---

{
  playground && phone && (
    <section
      data-section="playground"
      class="grid grid-cols-1 gap-10 border-t border-border py-14 md:grid-cols-[320px_minmax(0,1fr)] md:gap-x-20"
    >
      <div class="flex justify-center md:block">
        <DeviceFrame size="play">
          <button
            type="button"
            data-playground-load
            data-src={playground.src}
            data-title={view.name}
            class="btn-primary gap-2"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
              set:html={play}
            />
            <span>{t('project.loadApp', lang)}</span>
          </button>
        </DeviceFrame>
      </div>
      <div class="flex flex-col md:pt-2">
        <h2 class="text-[22px] font-bold tracking-[-0.02em]">{t('project.try', lang)}</h2>
        <p class="mb-8 mt-2 max-w-[520px] text-base leading-[1.6] text-muted">
          {t('project.tryApp', lang)}
        </p>
        <ul class="flex max-w-[560px] flex-col">
          {notes.map((note) => (
            <li
              data-note
              class="flex flex-col gap-1.5 border-t border-border py-[18px] last:border-b"
            >
              {note.title && <span class="text-[15px] font-bold">{note.title}</span>}
              <span class="text-sm leading-[1.6] text-muted">
                {note.parts.map((part) =>
                  part.href ? (
                    <a href={part.href} rel="noopener" class={partClass(part)}>
                      {part.text}
                    </a>
                  ) : part.mono ? (
                    <span class={partClass(part)}>{part.text}</span>
                  ) : (
                    part.text
                  ),
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
{
  playground && web && (
    <section data-section="playground" class="flex flex-col gap-8 border-t border-border py-14">
      <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-10">
        <div class="flex flex-col gap-2">
          <h2 class="text-[22px] font-bold tracking-[-0.02em]">{t('project.try', lang)}</h2>
          <p class="max-w-[620px] text-base leading-[1.6] text-muted">
            {t('project.tryWeb', lang)}
          </p>
        </div>
        {notes.map((note) => (
          <p data-note class="max-w-[360px] text-sm leading-[1.6] text-muted md:text-right">
            {note.parts.map((part) =>
              part.href ? (
                <a href={part.href} rel="noopener" class={partClass(part)}>
                  {part.text}
                </a>
              ) : (
                part.text
              ),
            )}
          </p>
        ))}
      </div>
      <BrowserFrame size="play" address={displayUrl(playground.src)}>
        <button
          type="button"
          data-playground-load
          data-src={playground.src}
          data-title={view.name}
          class="btn-primary gap-2"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
            set:html={play}
          />
          <span>{t('project.loadWeb', lang)}</span>
        </button>
      </BrowserFrame>
    </section>
  )
}

<script>
  function bindPlayground() {
    document.querySelectorAll<HTMLButtonElement>('[data-playground-load]').forEach((button) => {
      if (button.dataset.bound) return;
      button.dataset.bound = 'true';
      button.addEventListener('click', () => {
        const iframe = document.createElement('iframe');
        iframe.src = button.dataset.src ?? '';
        iframe.title = button.dataset.title ?? '';
        iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms');
        iframe.className = 'h-full w-full border-0';
        button.replaceWith(iframe);
      });
    });
  }
  bindPlayground();
  document.addEventListener('astro:after-swap', bindPlayground);
</script>
```

`src/components/projects/ProjectHistory.astro`:

```astro
---
import { t } from '../../i18n/translations';
import { inlineLinks } from '../../lib/inline-links';
import type { ProjectView } from '../../lib/project-view';

interface Props {
  view: ProjectView;
}
const { view } = Astro.props;
const { lang } = view;
const hasChangelog = view.changelog.length > 0;
---

<section
  data-section="history"
  class="grid grid-cols-1 gap-12 border-t border-border py-14 md:grid-cols-2 md:gap-x-20"
>
  {
    view.built.length > 0 && (
      <div class="flex flex-col gap-5">
        <h2 class="text-[22px] font-bold tracking-[-0.02em]">{t('project.built', lang)}</h2>
        <ul
          data-built
          class="built flex list-disc flex-col gap-2.5 pl-[18px] text-[15px] leading-[1.6]"
        >
          {view.built.map((line) => (
            <li set:html={inlineLinks(line)} />
          ))}
        </ul>
      </div>
    )
  }
  <div class="flex flex-col gap-5">
    {
      hasChangelog && (
        <>
          <h2 class="text-[22px] font-bold tracking-[-0.02em]">{t('project.changelog', lang)}</h2>
          <ol class="flex flex-col">
            {view.changelog.map((row, i) => (
              <li
                data-release
                class="grid grid-cols-1 gap-1 border-t border-border py-3.5 last:border-b sm:grid-cols-[170px_minmax(0,1fr)] sm:gap-4"
              >
                <span
                  class:list={['font-mono text-[13px]', i === 0 ? 'text-accent' : 'text-muted']}
                >
                  {row.when ? `${row.version}, ${row.when}` : row.version}
                </span>
                <span class="text-sm leading-[1.6]">{row.note}</span>
              </li>
            ))}
          </ol>
        </>
      )
    }
    <div class="flex flex-wrap gap-6">
      {
        hasChangelog && view.releases && (
          <a
            data-releases
            href={view.releases.href}
            rel="noopener"
            class="text-[13px] font-semibold text-accent"
          >
            {view.releases.label}
          </a>
        )
      }
      <a href={view.allProjects} class="text-[13px] font-semibold text-accent">
        {t('projects.all', lang)}
      </a>
    </div>
  </div>
</section>

<style>
  .built :global(a) {
    font-family: var(--font-mono);
    font-size: 14px;
    color: var(--accent);
  }
</style>
```

Ejecutar: `git rm src/components/projects/PlaygroundFrame.astro`

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/project-playground.test.ts tests/project-page.test.ts`
Expected: PASS (`ProjectPlayground` 4, `ProjectHistory` 4, `PlaygroundFrame` 1, `ProjectCard` 1).

- [ ] **Step 5: Commit**

```bash
git add src/components/projects/ProjectPlayground.astro src/components/projects/ProjectHistory.astro tests/project-playground.test.ts tests/project-page.test.ts
git commit -m "feat(projects): on-demand playground, built notes and changelog sections

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 13: `ProjectView` compuesto y `ProjectPage` con imágenes resueltas

**Files:**

- Create: `src/components/projects/ProjectView.astro`
- Modify: `src/components/projects/ProjectPage.astro` (reescritura completa)
- Modify: `src/i18n/translations.ts` (borrar `project.tryText`, `project.load`, `project.changelogFull`, `project.screenshot` en `en` y en `es`)
- Test: `tests/project-page.test.ts` (añadir `describe('ProjectView')` y la comprobación de claves retiradas)

**Interfaces:**

- Consumes: `ProjectHeader` (Task 10), `ProjectScreens`, `ProjectFeatures`, `ProjectWhy` (Task 11), `ProjectPlayground`, `ProjectHistory` (Task 12); `toProjectView`, `LinkRef` (Task 8); `getImage` de `astro:assets`; `getEntry`, `render` de `astro:content`; `projectSlug`, `ProjectEntry`; `getAuthor` de `src/lib/config.ts`; `BaseLayout` (props `title`, `description`, `image`, `lang`, `alternatePath`, `jsonLd`).
- Produces:
  - `ProjectView.astro` Props `{ view: ProjectView }` + slot por defecto (cuerpo Markdown): `<div class="container-page" data-project={kind}>` con cabecera, capturas, qué hace/pasos, por qué existe, pruébalo y cambios, en ese orden.
  - `ProjectPage.astro` Props `{ lang: Locale; project: ProjectEntry }` (sin cambios para `src/pages/projects/[slug].astro` y `src/pages/es/projects/[slug].astro`). Lanza un error si `post` apunta a un post que no existe.

- [ ] **Step 1: Write the failing test**

En `tests/project-page.test.ts`, añadir estos imports debajo de los existentes:

```ts
import ProjectView from '../src/components/projects/ProjectView.astro';
import { translations } from '../src/i18n/translations';
import { bitoFields, bitoImages, cliFields, makeView, sparseFields } from './fixtures/project-view';
```

Y estos bloques al final del fichero:

```ts
const order = (html: string, sections: string[]) =>
  sections.map((name) => html.indexOf(name === 'header' ? '<header' : `data-section="${name}"`));

describe('ProjectView', () => {
  it('renders every section of a full project in the spec order', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectView, {
      props: { view: makeView(bitoFields, bitoImages) },
      slots: { default: '<p>Bito pide un toque.</p>' },
    });
    const positions = order(html, [
      'header',
      'screens',
      'features',
      'why',
      'playground',
      'history',
    ]);
    positions.forEach((position) => expect(position).toBeGreaterThan(-1));
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
    expect(html).toContain('Bito pide un toque.');
    expect(html).toContain('data-project="mobile"');
  });

  it('puts the cli steps between the features and the why', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectView, {
      props: { view: makeView(cliFields) },
      slots: { default: '<p>[DATO]</p>' },
    });
    const positions = order(html, ['features', 'steps', 'why', 'history']);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
    expect(html).not.toContain('data-section="screens"');
    expect(html).not.toContain('data-section="playground"');
  });

  it('keeps a sparse project to header, why and the way back', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectView, {
      props: { view: makeView(sparseFields) },
      slots: { default: '<p>Beta privada con un grupo de amigos.</p>' },
    });
    expect(html).toContain('<header');
    expect(html).toContain('data-section="why"');
    expect(html).toContain('data-section="history"');
    ['screens', 'features', 'steps', 'playground'].forEach((name) =>
      expect(html).not.toContain(`data-section="${name}"`),
    );
    expect(html).not.toContain('data-media=');
  });

  it('speaks English on the English page', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectView, {
      props: { view: makeView(bitoFields, bitoImages, 'en') },
      slots: { default: '<p>Bito asks for one tap.</p>' },
    });
    expect(html).toContain('>Screenshots</h2>');
    expect(html).toContain('>Why it exists</h2>');
    expect(html).toContain('>How it is built</h2>');
  });
});

describe('retired project translations', () => {
  it.each(['project.tryText', 'project.load', 'project.changelogFull', 'project.screenshot'])(
    '%s is gone',
    (key) => {
      expect(translations.en).not.toHaveProperty([key]);
      expect(translations.es).not.toHaveProperty([key]);
    },
  );
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/project-page.test.ts`
Expected: FAIL: `Cannot find module '../src/components/projects/ProjectView.astro'` y las 4 claves siguen existiendo.

- [ ] **Step 3: Write minimal implementation**

`src/components/projects/ProjectView.astro`:

```astro
---
import ProjectHeader from './ProjectHeader.astro';
import ProjectScreens from './ProjectScreens.astro';
import ProjectFeatures from './ProjectFeatures.astro';
import ProjectWhy from './ProjectWhy.astro';
import ProjectPlayground from './ProjectPlayground.astro';
import ProjectHistory from './ProjectHistory.astro';
import type { ProjectView } from '../../lib/project-view';

interface Props {
  view: ProjectView;
}
const { view } = Astro.props;
---

<div class="container-page" data-project={view.kind}>
  <ProjectHeader view={view} />
  <ProjectScreens view={view} />
  <ProjectFeatures view={view} />
  <ProjectWhy view={view}><slot /></ProjectWhy>
  <ProjectPlayground view={view} />
  <ProjectHistory view={view} />
</div>
```

`src/components/projects/ProjectPage.astro` (completo):

```astro
---
import type { ImageMetadata } from 'astro';
import { getEntry, render } from 'astro:content';
import { getImage } from 'astro:assets';
import BaseLayout from '../../layouts/BaseLayout.astro';
import ProjectView from './ProjectView.astro';
import type { Locale } from '../../i18n/translations';
import { getAuthor } from '../../lib/config';
import { projectSlug, type ProjectEntry } from '../../lib/projects';
import { toProjectView, type LinkRef } from '../../lib/project-view';

interface Props {
  lang: Locale;
  project: ProjectEntry;
}
const { lang, project } = Astro.props;
const prefix = lang === 'es' ? '/es' : '';
const slug = projectSlug(project);
const alternatePath = `${lang === 'es' ? '' : '/es'}/projects/${slug}/`;
const data = project.data;

async function webp(src: ImageMetadata, width: number): Promise<string> {
  return (await getImage({ src, width, format: 'webp' })).src;
}

async function optional(src: ImageMetadata | undefined, width: number) {
  return src ? webp(src, width) : undefined;
}

const shotWidth = data.kind === 'web' ? 800 : 400;
const images = {
  icon: await optional(data.icon, 144),
  cover: await optional(data.cover, data.kind === 'mobile' ? 780 : 1240),
  coverMobile: await optional(data.coverMobile, 400),
  illustration: await optional(data.illustration, 320),
  screenshots: await Promise.all(data.screenshots.map((shot) => webp(shot.src, shotWidth))),
  features: await Promise.all(data.features.map((feature) => optional(feature.image, 288))),
};

async function findPost(id: string): Promise<LinkRef> {
  const entry = lang === 'es' ? await getEntry('posts', id) : await getEntry('posts-en', id);
  if (!entry) throw new Error(`Project ${project.id} points to a missing post: ${id}`);
  return { href: `${prefix}/blog/${entry.id}`, label: entry.data.title };
}

const post = data.post ? await findPost(data.post) : undefined;
const view = toProjectView(data, images, lang, post);

const author = getAuthor();
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: data.name,
  description: data.intro ?? data.tagline,
  applicationCategory: 'DeveloperApplication',
  ...(data.platform && { operatingSystem: data.platform }),
  ...(data.url && { url: data.url }),
  ...(data.repo && { codeRepository: data.repo }),
  ...(data.license && { license: data.license }),
  author: { '@type': 'Person', name: author.name },
};

const { Content } = await render(project);
---

<BaseLayout
  title={data.name}
  description={data.tagline}
  image={images.cover}
  lang={lang}
  alternatePath={alternatePath}
  jsonLd={jsonLd}
>
  <ProjectView view={view}>
    <Content />
  </ProjectView>
</BaseLayout>
```

En `src/i18n/translations.ts`, borrar en `en` las entradas `'project.tryText'` (las dos líneas), `'project.load'`, `'project.changelogFull'` y `'project.screenshot'`, y las mismas cuatro en `es`. Comprobar que nada más las usa:

Run: `grep -rn "project\.\(tryText\|load\|changelogFull\|screenshot\)'" src`
Expected: sin resultados.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/project-page.test.ts tests/projects.test.ts`
Expected: PASS (`ProjectCard` 1, `ProjectView` 4, `retired project translations` 4, y los 5 de `projects`).

- [ ] **Step 5: Commit**

```bash
git add src/components/projects/ProjectView.astro src/components/projects/ProjectPage.astro src/i18n/translations.ts tests/project-page.test.ts
git commit -m "feat(projects): compose the kind-aware project page from a flat view

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 14: Home con `cover`, adiós a `public/projects/*.png`, build final y revisión en móvil

**Files:**

- Modify: `src/components/home/ProjectBento.astro:1-23` (frontmatter: imports y `tone`), `:41-47`, `:69-75`, `:95`, `:106-112` (imágenes; números de línea del fichero original)
- Modify: `src/components/projects/ProjectCard.astro:1-27` (imports, `tone` e imagen)
- Modify: `src/components/home/NowCards.astro:187-195` (`icon` es ahora `ImageMetadata`)
- Delete: `public/projects/*.png` (7 PNG de 0 bytes, binarios)
- Test: `tests/project-page.test.ts` (añadir `describe('home project media')` y un caso a `ProjectCard`), `tests/build.test.ts` (rutas nuevas y `describe('built project pages')`)

**Interfaces:**

- Consumes: `tone` de `src/lib/projects.ts` (Task 1); `cover`/`icon` como `ImageMetadata` (Task 1); `Image` de `astro:assets`; todo lo anterior para el build.
- Produces: la home y `/projects` leen `cover` con `<Image>` y el `tone` compartido; `dist/` con las fichas nuevas.

- [ ] **Step 1: Write the failing test**

En `tests/project-page.test.ts`, añadir `import { existsSync, readFileSync } from 'node:fs';` a los imports, este caso dentro de `describe('ProjectCard', ...)`:

```ts
it('shows the publishing status in the warn tone and no image without a cover', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(ProjectCard, {
    props: { lang: 'es', project: project({ status: 'publishing' }), featured: true },
  });
  expect(html).toContain('En publicación');
  expect(html).toContain('text-amber-600');
  expect(html).not.toContain('<img');
});
```

y este bloque al final:

```ts
describe('home project media', () => {
  it('no longer ships the empty project PNGs', () => {
    expect(existsSync('public/projects')).toBe(false);
  });

  it.each(['src/components/home/ProjectBento.astro', 'src/components/projects/ProjectCard.astro'])(
    '%s reads the cover and the shared tone',
    (path) => {
      const source = readFileSync(path, 'utf8');
      expect(source).not.toContain('data.hero');
      expect(source).toContain('data.cover');
      expect(source).not.toMatch(/const tone =/);
    },
  );

  it('renders the Now card icon as an optimised image', () => {
    const source = readFileSync('src/components/home/NowCards.astro', 'utf8');
    expect(source).toMatch(/<Image\s+src=\{project\.data\.icon\}/);
  });
});
```

En `tests/build.test.ts`, añadir a `routes` (después de `'es/projects/bito/index.html',`):

```ts
  'projects/pokeutils/index.html',
  'es/projects/pokeutils/index.html',
  'projects/basecero/index.html',
  'es/projects/basecero/index.html',
  'projects/quedamos/index.html',
  'es/projects/huellas/index.html',
```

y al final del fichero:

```ts
const page = (route: string) => readFileSync(join(dist, route), 'utf8');

describe.skipIf(!built)('built project pages', () => {
  it('renders Bito as a mobile page with webp images', () => {
    const html = page('es/projects/bito/index.html');
    expect(html).toContain('data-project="mobile"');
    expect(html).toContain('data-media="mobile"');
    expect(html).toContain('Descargar APK');
    expect(html).toMatch(/data-frame="device"[\s\S]*?src="[^"]+\.webp"/);
    expect(html).toContain('application/ld+json');
  });

  it('renders PokeUtils as a web page', () => {
    const html = page('projects/pokeutils/index.html');
    expect(html).toContain('data-media="web"');
    expect(html).toContain('Open the site');
    expect(html).not.toContain('data-section="playground"');
  });

  it('renders BaseCero as a hybrid page with its playground', () => {
    const html = page('es/projects/basecero/index.html');
    expect(html).toContain('data-media="hybrid"');
    expect(html).toContain('data-playground-load');
    expect(html).toContain('basecero.alvarotc.com/app/');
  });

  it('renders Quedamos without a media block', () => {
    const html = page('projects/quedamos/index.html');
    expect(html).not.toContain('data-media=');
    expect(html).toContain('data-section="why"');
  });

  it('does not build the hidden projects', () => {
    expect(existsSync(join(dist, 'projects/create-astro-blog/index.html'))).toBe(false);
    expect(existsSync(join(dist, 'es/projects/devtools/index.html'))).toBe(false);
  });

  it('shows the Bito cover on the home without the old PNGs', () => {
    const html = page('es/index.html');
    expect(html).not.toMatch(/\/projects\/[\w-]+\.png/);
    expect(html).toContain('alt="Bito"');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/project-page.test.ts tests/build.test.ts`
Expected: FAIL: `public/projects` existe, los componentes leen `data.hero` y definen su `tone`, la tarjeta pinta `text-muted` en vez del tono `warn`. Los tests de `dist/` fallan o se saltan según el `dist/` que haya.

- [ ] **Step 3: Write minimal implementation**

`src/components/home/ProjectBento.astro`, frontmatter completo (líneas 1-23 del original, hasta el `---` de cierre incluido):

```astro
---
import { Image } from 'astro:assets';
import Tag from '../ui/Tag.astro';
import { t, statusLabel, type Locale } from '../../i18n/translations';
import {
  getFeaturedProjects,
  getLabProjects,
  projectSlug,
  tone,
  type ProjectEntry,
} from '../../lib/projects';

interface Props {
  lang: Locale;
}
const { lang } = Astro.props;
const prefix = lang === 'es' ? '/es' : '';

const [big, mid, band] = await getFeaturedProjects(lang);
const lab = await getLabProjects(lang);

const href = (p: ProjectEntry) => `${prefix}/projects/${projectSlug(p)}`;
---
```

Sustituir la imagen de `big` (bloque `{big.data.hero && (...)}`, líneas 41-47 del original):

```astro
{
  big.data.cover && (
    <Image
      src={big.data.cover}
      alt={big.data.name}
      width={960}
      class="aspect-video w-full rounded-[10px] object-cover"
    />
  )
}
```

La de `mid` (bloque `{mid.data.hero && (...)}`, líneas 69-75 del original):

```astro
{
  mid.data.cover && (
    <Image
      src={mid.data.cover}
      alt={mid.data.name}
      width={480}
      class="h-[200px] w-full rounded-[10px] object-cover"
    />
  )
}
```

En `band`, la línea 95 pasa a `band.data.cover && 'md:grid-cols-[minmax(0,1fr)_340px]',` y la imagen (líneas 106-112):

```astro
{
  band.data.cover && (
    <Image
      src={band.data.cover}
      alt={band.data.name}
      width={680}
      class="h-[120px] w-full rounded-[10px] object-cover"
    />
  )
}
```

`src/components/projects/ProjectCard.astro`, líneas 1-27 (frontmatter e imagen) pasan a:

```astro
---
import { Image } from 'astro:assets';
import Tag from '../ui/Tag.astro';
import { t, statusLabel, type Locale } from '../../i18n/translations';
import { projectSlug, tone, type ProjectEntry } from '../../lib/projects';

interface Props {
  lang: Locale;
  project: ProjectEntry;
  featured?: boolean;
}
const { lang, project, featured = false } = Astro.props;
const prefix = lang === 'es' ? '/es' : '';
const slug = projectSlug(project);
---

<div class="card flex flex-col gap-3 p-5">
  {
    featured && project.data.cover && (
      <Image
        src={project.data.cover}
        alt={project.data.name}
        width={640}
        class="aspect-video w-full rounded-[10px] object-cover"
      />
    )
  }
</div>
```

El resto de `ProjectCard.astro` (desde `<a href={`${prefix}/projects/${slug}`}`) no cambia.

`src/components/home/NowCards.astro`, líneas 187-195 (desde `project.data.icon ? (` hasta `) : (`; el `Image` ya está importado en la línea 3):

```astro
project.data.icon ? (
<Image
  src={project.data.icon}
  alt=""
  width={48}
  height={48}
  class="h-12 w-12 rounded-lg object-cover"
/>
) : (
```

Borrar los PNG: `git rm public/projects/*.png`

Build y comprobaciones:

Run: `npm run build`
Expected: `astro check` sin errores (incluye los tests TypeScript) y build OK.

Run: `npx vitest run`
Expected: PASS de toda la suite; solo se saltan las guardas `RELEASE_CHECK`.

Run: `npm run lint`
Expected: sin errores. Si Prettier se queja, `npx prettier --write` sobre los ficheros concretos que nombre.

Revisión en el navegador con Playwright contra el servidor que ya corre en `http://localhost:4321` (herramientas `browser_resize`, `browser_navigate`, `browser_evaluate`, `browser_take_screenshot`, `browser_click`):

1. `browser_resize` a 375x812. Para `/es/projects/bito`, `/es/projects/pokeutils`, `/es/projects/basecero` y `/projects/quedamos`: `browser_navigate`, `browser_evaluate` con `() => document.documentElement.scrollWidth` (debe ser `<= 375`) y captura. Comprobar: texto antes que medios, móvil de 260px centrado sin sobresalir, navegador a ancho completo, tira de capturas con scroll propio y 16px de gutter, bloques de "Qué hace" a una columna con la imagen encima.
2. En `/es/projects/basecero` a 375px: pulsar "Cargar la app" con `browser_click` y comprobar con `browser_evaluate` que hay un `iframe` dentro de `[data-section="playground"]` y que el marco mide 300px de ancho.
3. `browser_resize` a 1280x900 y capturas de las tres fichas; compararlas con `mobile.dc.html`, `web.dc.html` y `hybrid.dc.html`: cabecera partida, el marco cruza el borde de la cabecera y la tira de capturas empieza debajo sin taparse.
4. Ficha cli: poner `visible: true` temporalmente en `src/content/projects/es/create-astro-blog.md`, abrir `/es/projects/create-astro-blog` a 375px (el terminal hace scroll dentro, la página no: `scrollWidth <= 375`) y a 1280px (comparar con `cli.dc.html`), pulsar "Copiar el comando" y comprobar que la etiqueta pasa a "Copiado". Revertir con `git checkout src/content/projects/es/create-astro-blog.md`.
5. Repetir una captura en modo claro (`browser_evaluate` con `() => document.documentElement.setAttribute('data-theme', 'light')`) de `/es/projects/bito` para comprobar que los tokens funcionan.

Si algo falla, arreglarlo en como mucho 3 ficheros de los ya tocados en este plan, repetir `npx vitest run` (no otro build) e incluirlos en el commit.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/project-page.test.ts tests/build.test.ts`
Expected: PASS, con `built routes`, `built home page` y `built project pages` ejecutados (no saltados).

- [ ] **Step 5: Commit**

```bash
git add src/components/home/ProjectBento.astro src/components/projects/ProjectCard.astro src/components/home/NowCards.astro public/projects tests/project-page.test.ts tests/build.test.ts
git commit -m "feat(projects): home cards read the optimised cover, old PNGs removed

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

## Autorrevisión

**Cobertura de la spec:**

- `kind` obligatorio, `status: publishing`, `intro`, `icon`/`cover`/`coverMobile`/`illustration` como `image()`, `download`, `command`, `terminal`, `facts`, `screenshots` (sustituye a `gallery`), `screenshotsIntro`, `featuresIntro`, `features` con imagen opcional, `steps`, `after`, `post`, `built`; fuera `hero` y `gallery`; esquema con `({ image }: SchemaContext)`: Task 1.
- `publishing` → "En publicación"/"Publishing", tono `warn`, `tone()` único en `src/lib/projects.ts`: Tasks 1, 13 (ficha) y 14 (tarjetas y bento).
- Cabecera partida: "Todos los proyectos", icono + h1 + tagline, `intro`, estado con "vX.Y.Z, fecha", acciones por kind, `<dl>` con filas automáticas en orden (Plataforma, Licencia, Última versión, Web/npm) y luego `facts`, valores verificables en mono: Tasks 8 (`factRows`, `releaseLabel`) y 10.
- Bloque de medios por kind (móvil grande, navegador con URL mono y 16:10, escritorio fino con móvil pequeño delante, terminal que no sobresale) y el vuelo sobre la cabecera: Tasks 9 y 10.
- Capturas con subtítulo por kind, `scroll-snap`, pie, 9:19.5 o 16:10, sin capturas en cli: Tasks 8 (`shotsIntro`) y 11.
- Qué hace: 3 bloques con imagen y lista en dos columnas; cli "Qué te da" todo en lista: Task 11. Cómo lo configuras con `<ol>` y `after`: Task 11.
- Por qué existe con prose, "Leer el post: <título>" e ilustración: Tasks 11 y 13 (`findPost`).
- Pruébalo: móvil con "Cargar la app" y 3 notas, navegador con "Cargar la web" y una nota, carga al pulsar: Tasks 8 (`playgroundNotes`) y 12.
- Cómo está hecho con `inlineLinks` y Cambios con versión en mono, la más reciente en acento, enlace a GitHub Releases o npm y "Todos los proyectos": Tasks 8 (`changelogRows`, `releasesLink`) y 12.
- Home y tarjetas con `cover` e `<Image>`, PNG de `public/projects/` borrados: Task 14.
- Contenido de los 7 proyectos es + en con los datos confirmados; `[DATO]` donde toca; Bito sin `post`: Tasks 2-7.
- Script de placeholders con los tamaños de la maqueta: Task 2. Guarda `RELEASE_CHECK` sobre proyectos visibles: Task 7.
- Móvil (< 768px): marcos a 260px, navegador y terminal a ancho completo con scroll interno, tira con snap y gutter de 16px, bloques a una columna, playground a 300px o 520px de alto: Tasks 9-12 y revisión de la Task 14.
- Accesibilidad: adornos `aria-hidden`, `alt` reales, textos pequeños en `text-faint`/`text-muted`, sin animaciones, JS solo para playground y copiar: Tasks 9, 10 y 12.
- Tests con la Container API y comprobaciones del HTML construido en `tests/build.test.ts`: Tasks 9-14.

**Desviaciones deliberadas:**

- 14 tareas en lugar de 8-11: el límite de 3 ficheros por tarea obliga a 6 tareas para los 14 `.md` y el script.
- Las notas del playground son i18n fijo por kind con huecos (`{size}`, `{platform}`, `{src}`, `{link}`) que se rellenan con datos del proyecto; una nota se omite si falta su dato. La nota 1 de `mobile` usa el copy de Bito de la maqueta ("Toca un hábito para registrarlo").
- `stepsIntro` es un campo nuevo, opcional, para el subtítulo de "Cómo lo configuras" de la maqueta cli, que no tenía sitio en el esquema de la spec.
- PokeUtils y Bito no llevan `playground` (la spec solo se lo da a BaseCero); la variante web del playground queda cubierta por tests de Container.
- Plataforma sin mono (no es verificable según la lista de la spec); licencia, versión, URL y tamaño sí.
- La lista de features va a dos columnas en todos los kinds (texto de la spec) aunque las maquetas mobile/web/hybrid la dibujan a cuatro.
- La cabecera se parte en dos columnas desde 1024px (`mobile`, `hybrid`) o 1280px (`web`, `cli`) para que 620px de medios no aplasten el texto en portátiles pequeños.
- Nota v2.0.0 de Bito con el copy de la maqueta; v1.0.0 conserva la nota actual, como pide la spec.
- Efecto lateral no pedido por la spec: el contador de apps de la home (`src/pages/index.astro:19` y `src/pages/es/index.astro:19`) solo cuenta `status === 'published'`, así que Bito en `publishing` baja la cifra de 3 a 2. No se toca; decidirlo con el usuario en la revisión.

**Verificación del plan:** se aplicaron las 14 tareas en una copia del repo en el scratchpad: `npx vitest run` con `dist/` dio 339 tests en verde (22 saltados, las guardas `RELEASE_CHECK`), `npm run build` terminó con `astro check` a 0 errores, y `eslint` salió limpio.

**Placeholders del plan:** ninguno de tipo TBD/TODO. Los `[DATO]` son contenido intencionado que rellena el usuario y que la guarda `RELEASE_CHECK` bloquea.

**Consistencia de nombres:** `projectSchema` (función), `tone`/`StatusTone`, `formatShortDate`, `ProjectFields`, `ResolvedImages`, `ProjectView`, `LinkRef`, `NotePart`, `Note`, `toProjectView`, `factRows`, `releaseLabel`, `changelogRows`, `releasesLink`, `shotsIntro`, `playgroundNotes`, `fillParts`, `parseTerminalLine`, `displayUrl`, `hasMedia`, `overhangs`; fixtures `bitoFields`/`bitoImages`, `pokeFields`/`pokeImages`, `baseceroFields`/`baseceroImages`, `cliFields`, `sparseFields`, `noImages`, `makeView`; marcas DOM `data-frame`, `data-size`, `data-media`, `data-action`, `data-copy-command`, `data-copied-label`, `data-copy-label`, `data-section="screens|features|steps|why|playground|history"`, `data-feature="block|item"`, `data-step`, `data-note`, `data-release`, `data-releases`, `data-built`, `data-post-link`, `data-illustration`, `data-release-label`, `data-project`, `data-playground-load`. Se usan igual en todas las tareas y tests.
