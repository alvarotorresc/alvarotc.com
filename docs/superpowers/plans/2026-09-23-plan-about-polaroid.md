# Página /about con polaroid pegajosa Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sustituir `/about` y `/es/about` por una página de dos columnas: etapas de texto a la izquierda y una polaroid `sticky` a la derecha que cambia de foto, pie y ficha al cruzar cada etapa.

**Architecture:** La colección `about` gana `stages` (schema con `image()`), y los `paragraphs` se convierten a HTML seguro con `src/lib/inline-links.ts`. `AboutPage.astro` carga la entrada, resuelve las fotos con `getImage` (800px, webp) y pasa datos planos a un componente presentacional `AboutStory.astro`, que se renderiza en tests con la Container API sin tocar `astro:content`. El cambio de foto es un `<script>` en `AboutStory.astro` con `IntersectionObserver`; sin JS se ve la primera foto.

**Tech Stack:** Astro 7 (SSG, `astro:assets`, `ClientRouter`), Tailwind 4, TypeScript strict, vitest 5 con `experimental_AstroContainer`, sharp 0.33.

**Spec:** `docs/superpowers/specs/2026-09-23-about-polaroid-design.md` (maqueta solo para medidas: `docs/superpowers/specs/2026-09-23-about-polaroid-mock.dc.html`).

## Global Constraints

- Cada tarea toca como máximo 3 ficheros de código o contenido; los tests van aparte.
- Como máximo un `npm run build` por tarea; los tests se ejecutan con `npx vitest run <fichero de la tarea>`.
- Cada tarea termina en un commit Conventional Commits con el trailer `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- Sin framer-motion ni islas React en esta página: solo `<script>` en el `.astro` con `IntersectionObserver`.
- `IntersectionObserver` con `rootMargin: '-40% 0px -50% 0px'`.
- Crossfade de 200ms sobre `opacity`; con `prefers-reduced-motion: reduce` el cambio es instantáneo.
- Fotos resueltas con `getImage({ src, width: 800, format: 'webp' })`.
- Rejilla de escritorio (>= 1024px): contenedor 1100px, texto 560px, hueco 108px, columna 432px, polaroid `sticky` con `top: 96px`.
- Polaroid: fondo `#f4f2ec`, padding `16px 16px 64px`, borde `1px #d8d5cc`, `rotate(-2deg)`, sombra `0 8px 0 rgba(0,0,0,.35)`; foto 400x500 radio 2px; pie JetBrains Mono 13px `#3a3a3a`; polaroid trasera `#e6e3da` `rotate(3deg)` bajada 6px.
- Móvil (< 1024px): una sola polaroid (máx 360px) bajo la cabecera con la foto de la etapa `own-2026`; se elige la alternativa simple de la spec (sin fotos por etapa).
- Etapas separadas 96px, kicker mono 13px `text-faint`, h2 28px peso 700, párrafos 18px/1.65. Sin tarjetas, sin iconos, sin animaciones de entrada.
- `values` se mantiene en schema y ficheros: `src/components/home/About.astro` los usa.
- Copy solo a partir de los textos reales de `src/content/about/{en,es}.md` y `src/content/interests/*.yaml`; ninguna anécdota de la maqueta. Huecos como `[DATO]` literal y `mock: true` en ambos ficheros.
- GitHub real del usuario: `https://github.com/alvarotorresc` (el `github.com/alvarotc` de la spec es una errata; usar el de `site.config.ts`).
- Sin comentarios innecesarios, sin `console.log`, TypeScript strict.

---

### Task 1: Schema `stages` y `inline-links.ts`

**Files:**

- Modify: `src/content.config.ts:121-131` (`aboutSchema` y colección `about`)
- Create: `src/lib/inline-links.ts`
- Test: `tests/about.test.ts` (reescribir el bloque `aboutSchema`), `tests/inline-links.test.ts` (nuevo)

**Interfaces:**

- Consumes: `SchemaContext` de `astro:content`, `z` de `astro/zod`.
- Produces:
  - `export const aboutSchema: ({ image }: SchemaContext) => ZodObject` con campos `title`, `intro`, `values`, `stages`, `mock`.
  - Cada etapa: `{ id: string; kicker: string; title: string; paragraphs: string[]; links: { label: string; href: string }[]; photo?: ImageMetadata; photoAlt?: string; caption?: string; facts?: { year: string; place: string; os: string; stack: string } }`.
  - `src/lib/inline-links.ts`: `export function escapeHtml(text: string): string` y `export function inlineLinks(text: string): string`.

Nota: tras esta tarea el build falla hasta la Task 2 porque los `.md` aún no tienen `stages`. Esta tarea no ejecuta build.

- [ ] **Step 1: Write the failing test**

Sustituir el `describe('aboutSchema', ...)` de `tests/about.test.ts` (dejar intacto `describe('personJsonLd', ...)`) y cambiar los imports:

```ts
import { describe, it, expect } from 'vitest';
import { z } from 'astro/zod';
import type { SchemaContext } from 'astro:content';
import { aboutSchema } from '../src/content.config';
import { personJsonLd } from '../src/lib/jsonld';

const schema = aboutSchema({ image: () => z.string() } as unknown as SchemaContext);

const base = {
  title: 'Hi, I am Álvaro.',
  intro: 'Backend developer from Spain.',
  values: [{ icon: 'git-fork', title: 'Free software', text: 'If I ship it, you can read it.' }],
};

const withPhoto = {
  id: 'daw-2018',
  kicker: '2018',
  title: 'Web application development',
  paragraphs: ['Two years at IES Velázquez.'],
  photo: '../../assets/about/ies-2018.jpg',
  photoAlt: 'IES Velázquez',
  caption: '2018 · IES Velázquez, Sevilla',
  facts: { year: '2018', place: 'Sevilla', os: '[DATO]', stack: 'PHP, JavaScript' },
};

const withoutPhoto = {
  id: 'chess',
  kicker: 'Chess',
  title: 'Chess',
  paragraphs: ['On Lichess.'],
};

describe('aboutSchema', () => {
  it('defaults mock to false and links to an empty list', () => {
    const parsed = schema.parse({ ...base, stages: [withoutPhoto] });
    expect(parsed.mock).toBe(false);
    expect(parsed.stages[0].links).toEqual([]);
  });

  it('accepts a stage with a photo and a stage without one', () => {
    const parsed = schema.parse({ ...base, stages: [withPhoto, withoutPhoto] });
    expect(parsed.stages).toHaveLength(2);
    expect(parsed.stages[0].facts?.year).toBe('2018');
    expect(parsed.stages[1].photo).toBeUndefined();
  });

  it('rejects an empty stages list', () => {
    expect(() => schema.parse({ ...base, stages: [] })).toThrow();
  });

  it('rejects an entry without values', () => {
    expect(() => schema.parse({ ...base, values: [], stages: [withoutPhoto] })).toThrow();
  });
});
```

`tests/inline-links.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { escapeHtml, inlineLinks } from '../src/lib/inline-links';

describe('escapeHtml', () => {
  it('escapes the five HTML special characters', () => {
    expect(escapeHtml(`<a href="x">&'</a>`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;',
    );
  });
});

describe('inlineLinks', () => {
  it('turns [text](url) into an anchor', () => {
    expect(inlineLinks('See [Bito](/projects/bito) now.')).toBe(
      'See <a href="/projects/bito">Bito</a> now.',
    );
  });

  it('handles several links in one paragraph', () => {
    expect(inlineLinks('[a](/a) and [b](https://b.dev)')).toBe(
      '<a href="/a">a</a> and <a href="https://b.dev">b</a>',
    );
  });

  it('escapes the text around and inside links', () => {
    expect(inlineLinks('1 < 2 [x<y](/x) & done')).toBe(
      '1 &lt; 2 <a href="/x">x&lt;y</a> &amp; done',
    );
  });

  it('neutralises unsafe hrefs', () => {
    expect(inlineLinks('[bad](javascript:alert(1))')).toContain('href="#"');
  });

  it('returns escaped plain text when there are no links', () => {
    expect(inlineLinks('<b>plain</b>')).toBe('&lt;b&gt;plain&lt;/b&gt;');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/about.test.ts tests/inline-links.test.ts`
Expected: FAIL: `aboutSchema is not a function` y `Cannot find module '../src/lib/inline-links'`.

- [ ] **Step 3: Write minimal implementation**

`src/lib/inline-links.ts`:

```ts
const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;
const SAFE_HREF = /^(https?:\/\/|\/|#|mailto:)/;

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ESCAPES[c] ?? c);
}

export function inlineLinks(text: string): string {
  let html = '';
  let last = 0;
  for (const match of text.matchAll(LINK)) {
    const [whole, label, href] = match;
    html += escapeHtml(text.slice(last, match.index));
    const safe = SAFE_HREF.test(href) ? href : '#';
    html += `<a href="${escapeHtml(safe)}">${escapeHtml(label)}</a>`;
    last = match.index + whole.length;
  }
  return html + escapeHtml(text.slice(last));
}
```

En `src/content.config.ts`, sustituir el bloque `aboutSchema` + `about` por:

```ts
const stageSchema = (image: SchemaContext['image']) =>
  z.object({
    id: z.string(),
    kicker: z.string(),
    title: z.string(),
    paragraphs: z.array(z.string()).min(1),
    links: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
    photo: image().optional(),
    photoAlt: z.string().optional(),
    caption: z.string().optional(),
    facts: z
      .object({ year: z.string(), place: z.string(), os: z.string(), stack: z.string() })
      .optional(),
  });

export const aboutSchema = ({ image }: SchemaContext) =>
  z.object({
    title: z.string(),
    intro: z.string(),
    values: z.array(z.object({ icon: z.string(), title: z.string(), text: z.string() })).min(1),
    stages: z.array(stageSchema(image)).min(1),
    mock: z.boolean().default(false),
  });

const about = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/about' }),
  schema: aboutSchema,
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/about.test.ts tests/inline-links.test.ts`
Expected: PASS (4 tests `aboutSchema`, 2 `personJsonLd`, 6 `inline-links`).

- [ ] **Step 5: Commit**

```bash
git add src/content.config.ts src/lib/inline-links.ts tests/about.test.ts tests/inline-links.test.ts
git commit -m "feat(about): stages schema and safe inline links

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: Placeholders de fotos y contenido en etapas

**Files:**

- Create: `scripts/about-placeholders.mjs` (genera 10 JPG en `src/assets/about/`, salida binaria, no cuenta como fichero editado)
- Modify: `src/content/about/es.md` (reescritura completa), `src/content/about/en.md` (reescritura completa)
- Test: `tests/about-content.test.ts` (nuevo)

**Interfaces:**

- Consumes: `aboutSchema` de la Task 1; `sharp`.
- Produces: `src/assets/about/{desk-2026,ies-2018,z1-2020,therapyside-2022,soltel-2025,linux,cats,guitar,chess,boxing}.jpg` (800x1000); entradas `about/es` y `about/en` con 10 etapas de ids `daw-2018`, `z1-2020`, `therapyside-2022`, `soltel-2025`, `own-2026`, `free-software`, `cats`, `guitar`, `chess`, `boxing`, cuerpo Markdown vacío y `mock: true`.

- [ ] **Step 1: Write the failing test**

`tests/about-content.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';

const ids = [
  'daw-2018',
  'z1-2020',
  'therapyside-2022',
  'soltel-2025',
  'own-2026',
  'free-software',
  'cats',
  'guitar',
  'chess',
  'boxing',
];
const photos = [
  'desk-2026',
  'ies-2018',
  'z1-2020',
  'therapyside-2022',
  'soltel-2025',
  'linux',
  'cats',
  'guitar',
  'chess',
  'boxing',
];

describe.each(['es', 'en'])('about/%s.md', (lang) => {
  const source = readFileSync(`src/content/about/${lang}.md`, 'utf8');
  const body = source.split(/^---$/m)[2] ?? '';

  it('lists the ten stages in order', () => {
    const found = [...source.matchAll(/^ {2}- id: ([\w-]+)$/gm)].map((m) => m[1]);
    expect(found).toEqual(ids);
  });

  it('keeps the values used by the home page', () => {
    expect(source).toContain('values:');
  });

  it('stays mock while it has [DATO] gaps', () => {
    expect(source).toContain('[DATO]');
    expect(source).toContain('mock: true');
  });

  it('has an empty markdown body', () => {
    expect(body.trim()).toBe('');
  });

  it('contains none of the invented mock anecdotes', () => {
    expect(source).not.toMatch(
      /portátil de segunda mano|second-hand laptop|conversación incómoda|awkward conversation/,
    );
  });
});

describe('about placeholders', () => {
  it.each(photos)('%s.jpg exists', (name) => {
    expect(existsSync(`src/assets/about/${name}.jpg`)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/about-content.test.ts`
Expected: FAIL: los ids no coinciden, falta `mock: true` y no existen los JPG.

- [ ] **Step 3: Write minimal implementation**

`scripts/about-placeholders.mjs`:

```js
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const names = [
  'desk-2026',
  'ies-2018',
  'z1-2020',
  'therapyside-2022',
  'soltel-2025',
  'linux',
  'cats',
  'guitar',
  'chess',
  'boxing',
];

await mkdir('src/assets/about', { recursive: true });

for (const name of names) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000"><rect width="100%" height="100%" fill="#1c2029"/><text x="50%" y="50%" fill="#6b7382" font-family="monospace" font-size="40" text-anchor="middle">${name}.jpg</text></svg>`;
  await sharp(Buffer.from(svg)).jpeg({ quality: 80 }).toFile(`src/assets/about/${name}.jpg`);
}
```

Ejecutar: `node scripts/about-placeholders.mjs`

`src/content/about/es.md` (completo):

```md
---
title: 'Hola, soy Álvaro. Me gusta el software que respeta a quien lo usa.'
intro: 'Software engineer en Sevilla. Esta es la versión larga: quién soy, de dónde vengo y qué hago cuando cierro el portátil.'
values:
  - icon: git-fork
    title: 'Software libre'
    text: 'Todo lo que publico tiene el código abierto. Puedes leerlo, compilarlo y bifurcarlo.'
  - icon: shield-check
    title: 'Privacidad y seguridad'
    text: 'Sin cuentas cuando no hacen falta, sin rastreadores, y los datos protegidos por diseño.'
  - icon: paw
    title: 'Los animales'
    text: 'Vegano y voluntario en refugios de gatos. Huellas nace de ahí.'
  - icon: pen-line
    title: 'Construir en público'
    text: 'Documento el proceso en el blog, en vídeo y en redes. Qué funcionó, qué se rompió, y por qué.'
stages:
  - id: daw-2018
    kicker: '2018'
    title: 'Desarrollo de Aplicaciones Web'
    paragraphs:
      - 'Dos años de ciclo superior en el IES Velázquez de Sevilla. Por el camino, la certificación de algoritmos y estructuras de datos de freeCodeCamp y el Codefest de Everis, donde descubrí que me gustaba más la parte del servidor que la pantalla.'
    photo: ../../assets/about/ies-2018.jpg
    photoAlt: 'Placeholder: IES Velázquez, Sevilla'
    caption: '2018 · IES Velázquez, Sevilla'
    facts:
      year: '2018'
      place: 'Sevilla'
      os: '[DATO]'
      stack: '[DATO]'
  - id: z1-2020
    kicker: '2020'
    title: 'Z1 Digital Studio'
    paragraphs:
      - 'Primer trabajo. Productos digitales para clientes de Estados Unidos y Canadá en energía, seguridad y redes sociales. Python y Django, Node y TypeScript, APIs REST y GraphQL, Docker en AWS.'
      - 'Aprendí a entregar en equipo, con Scrum o Kanban según el cliente, y que los tests no son opcionales.'
    photo: ../../assets/about/z1-2020.jpg
    photoAlt: 'Placeholder: Z1 Digital Studio'
    caption: '2020 · Z1 Digital Studio'
    facts:
      year: '2020'
      place: '[DATO]'
      os: '[DATO]'
      stack: 'Python, Django, Node, TypeScript'
  - id: therapyside-2022
    kicker: '2022'
    title: 'Therapyside'
    paragraphs:
      - 'Backend de una plataforma de terapia online con más de cinco mil usuarios activos al día. Migré el proyecto de Python 2.7 a 3.7, llevé los websockets a Django Channels, rehice las notificaciones sobre Celery y Redis y monté la estructura de tests.'
      - 'Soporte diario con el equipo de operaciones. Aquí aprendí que aburrido es una virtud.'
    photo: ../../assets/about/therapyside-2022.jpg
    photoAlt: 'Placeholder: Therapyside'
    caption: '2022 · Therapyside'
    facts:
      year: '2022'
      place: '[DATO]'
      os: '[DATO]'
      stack: 'Python, Django Channels, Celery, Redis'
  - id: soltel-2025
    kicker: '2025'
    title: 'Soltel'
    paragraphs:
      - 'Microservicios en Java 17 y Node 22 que hablan entre sí y con agentes externos, Angular en el front, Oracle y MongoDB detrás.'
      - 'Un sistema de baremación de expedientes con Drools construido desde cero.'
    photo: ../../assets/about/soltel-2025.jpg
    photoAlt: 'Placeholder: Soltel'
    caption: '2025 · Soltel'
    facts:
      year: '2025'
      place: '[DATO]'
      os: '[DATO]'
      stack: 'Java 17, Node 22, Angular, Drools'
  - id: own-2026
    kicker: '2026'
    title: 'Mis propias cosas'
    paragraphs:
      - '[Bito](/es/projects/bito), [Quedamos](/es/projects/quedamos), [BaseCero](/es/projects/basecero) y ahora [Huellas](/es/projects/huellas). Todo software libre, con las decisiones escritas en el blog.'
      - 'Construyo en público. Documento el proceso en el blog, en vídeo y en redes: qué funcionó, qué se rompió y por qué. No tutoriales, sino decisiones.'
    photo: ../../assets/about/desk-2026.jpg
    photoAlt: 'Placeholder: mi mesa en 2026'
    caption: '2026 · Sevilla'
    facts:
      year: '2026'
      place: 'Sevilla'
      os: '[DATO]'
      stack: '[DATO]'
  - id: free-software
    kicker: 'Principios'
    title: 'Por qué lo publico todo libre'
    paragraphs:
      - 'Construyo las partes de un producto que nadie ve hasta que fallan: APIs, modelos de datos, colas, despliegues. Llevo más de cinco años haciéndolo en producción.'
      - 'Lo que más me interesa es que lo que construyo se pueda usar sin tener que fiarse de nadie. Por eso todo lo que publico es software libre: puedes leerlo, compilarlo y bifurcarlo.'
      - 'Y por eso mis aplicaciones funcionan sin cuenta cuando no hace falta una, sin rastreadores y con los datos protegidos por diseño. Autoalojo [DATO].'
    links:
      - label: 'github.com/alvarotorresc'
        href: 'https://github.com/alvarotorresc'
      - label: '/stats'
        href: '/es/stats'
      - label: '/projects/bito'
        href: '/es/projects/bito'
    photo: ../../assets/about/linux.jpg
    photoAlt: 'Placeholder: escritorio Linux'
    caption: '[DATO] · desde [DATO]'
    facts:
      year: '[DATO]'
      place: 'Sevilla'
      os: '[DATO]'
      stack: '[DATO]'
  - id: cats
    kicker: 'Gatos'
    title: 'Gatos, y por qué soy vegano'
    paragraphs:
      - 'Soy vegano y me importan los animales. [DATO]'
      - 'Colaboro con refugios de gatos en Sevilla desde 2024 ([DATO]), y de esa experiencia sale [Huellas](/es/projects/huellas), la plataforma para reunir mascotas perdidas con sus familias que estoy construyendo ahora.'
    photo: ../../assets/about/cats.jpg
    photoAlt: 'Placeholder: gatos del refugio'
    caption: 'Refugio · Sevilla'
    facts:
      year: '2024'
      place: 'Sevilla'
      os: '-'
      stack: '-'
  - id: guitar
    kicker: 'Guitarra'
    title: 'Guitarra eléctrica'
    paragraphs:
      - 'Sobre todo rock y blues, mal grabado en Linux con Ardour.'
    photo: ../../assets/about/guitar.jpg
    photoAlt: 'Placeholder: guitarra eléctrica'
    caption: 'Rock y blues · Ardour'
    facts:
      year: '[DATO]'
      place: 'Sevilla'
      os: '[DATO]'
      stack: 'Ardour'
  - id: chess
    kicker: 'Ajedrez'
    title: 'Ajedrez'
    paragraphs:
      - 'En Lichess, que también es software libre. Siempre listo para una partida: [DATO].'
    photo: ../../assets/about/chess.jpg
    photoAlt: 'Placeholder: tablero de ajedrez'
    caption: 'Lichess · [DATO]'
    facts:
      year: '[DATO]'
      place: 'Lichess'
      os: '[DATO]'
      stack: '-'
  - id: boxing
    kicker: 'Boxeo'
    title: 'Boxeo'
    paragraphs:
      - 'Unas cuantas sesiones a la semana. El único sitio donde no pienso en colas.'
    photo: ../../assets/about/boxing.jpg
    photoAlt: 'Placeholder: guantes de boxeo'
    caption: 'Boxeo · Sevilla'
    facts:
      year: '[DATO]'
      place: 'Sevilla'
      os: '-'
      stack: '-'
mock: true
---
```

`src/content/about/en.md` (completo, mismas claves, rutas sin `/es`):

```md
---
title: 'Hi, I am Álvaro. I like software that respects the person using it.'
intro: 'Software engineer in Seville. This is the long version: who I am, where I come from and what I do when I close the laptop.'
values:
  - icon: git-fork
    title: 'Free software'
    text: 'Everything I publish is open source. You can read it, build it and fork it.'
  - icon: shield-check
    title: 'Privacy and security'
    text: 'No accounts when they are not needed, no trackers, and data protected by design.'
  - icon: paw
    title: 'Animals'
    text: 'Vegan and volunteer at cat shelters. Huellas comes from there.'
  - icon: pen-line
    title: 'Building in public'
    text: 'I document the process on the blog, on video and on social media. What worked, what broke, why.'
stages:
  - id: daw-2018
    kicker: '2018'
    title: 'Web application development'
    paragraphs:
      - 'A two-year vocational degree at IES Velázquez in Seville. Along the way, the freeCodeCamp algorithms and data structures certification and the Everis Codefest, where I found out I cared more about the server than the screen.'
    photo: ../../assets/about/ies-2018.jpg
    photoAlt: 'Placeholder: IES Velázquez, Seville'
    caption: '2018 · IES Velázquez, Seville'
    facts:
      year: '2018'
      place: 'Seville'
      os: '[DATO]'
      stack: '[DATO]'
  - id: z1-2020
    kicker: '2020'
    title: 'Z1 Digital Studio'
    paragraphs:
      - 'First job. Digital products for clients in the US and Canada in energy, security and social networks. Python and Django, Node and TypeScript, REST and GraphQL APIs, Docker on AWS.'
      - 'I learned to ship as a team, Scrum or Kanban depending on the client, and that tests are not optional.'
    photo: ../../assets/about/z1-2020.jpg
    photoAlt: 'Placeholder: Z1 Digital Studio'
    caption: '2020 · Z1 Digital Studio'
    facts:
      year: '2020'
      place: '[DATO]'
      os: '[DATO]'
      stack: 'Python, Django, Node, TypeScript'
  - id: therapyside-2022
    kicker: '2022'
    title: 'Therapyside'
    paragraphs:
      - 'The backend of an online therapy platform with more than five thousand daily active users. I migrated the project from Python 2.7 to 3.7, moved the websockets to Django Channels, rebuilt notifications on Celery and Redis and set up the test suite.'
      - 'Daily support with the operations team. This is where I learned that boring is a feature.'
    photo: ../../assets/about/therapyside-2022.jpg
    photoAlt: 'Placeholder: Therapyside'
    caption: '2022 · Therapyside'
    facts:
      year: '2022'
      place: '[DATO]'
      os: '[DATO]'
      stack: 'Python, Django Channels, Celery, Redis'
  - id: soltel-2025
    kicker: '2025'
    title: 'Soltel'
    paragraphs:
      - 'Microservices in Java 17 and Node 22 that talk to each other and to external agents, Angular on the front, Oracle and MongoDB behind.'
      - 'A case-scoring system with Drools, built from scratch.'
    photo: ../../assets/about/soltel-2025.jpg
    photoAlt: 'Placeholder: Soltel'
    caption: '2025 · Soltel'
    facts:
      year: '2025'
      place: '[DATO]'
      os: '[DATO]'
      stack: 'Java 17, Node 22, Angular, Drools'
  - id: own-2026
    kicker: '2026'
    title: 'My own things'
    paragraphs:
      - '[Bito](/projects/bito), [Quedamos](/projects/quedamos), [BaseCero](/projects/basecero) and now [Huellas](/projects/huellas). All free software, with the decisions written down on the blog.'
      - 'I build in public. I document the process on the blog, on video and on social media: what worked, what broke and why. Decisions, not tutorials.'
    photo: ../../assets/about/desk-2026.jpg
    photoAlt: 'Placeholder: my desk in 2026'
    caption: '2026 · Seville'
    facts:
      year: '2026'
      place: 'Seville'
      os: '[DATO]'
      stack: '[DATO]'
  - id: free-software
    kicker: 'Principles'
    title: 'Why I publish everything as free software'
    paragraphs:
      - 'I build the parts of a product that nobody sees until they break: APIs, data models, queues, deploys. I have been doing it in production for more than five years.'
      - 'What interests me most is that what I build can be used without having to trust anyone. That is why everything I publish is free software: you can read it, build it and fork it.'
      - 'And that is why my apps work without an account when none is needed, with no trackers and with data protected by design. I self-host [DATO].'
    links:
      - label: 'github.com/alvarotorresc'
        href: 'https://github.com/alvarotorresc'
      - label: '/stats'
        href: '/stats'
      - label: '/projects/bito'
        href: '/projects/bito'
    photo: ../../assets/about/linux.jpg
    photoAlt: 'Placeholder: Linux desktop'
    caption: '[DATO] · since [DATO]'
    facts:
      year: '[DATO]'
      place: 'Seville'
      os: '[DATO]'
      stack: '[DATO]'
  - id: cats
    kicker: 'Cats'
    title: 'Cats, and why I am vegan'
    paragraphs:
      - 'I am vegan and I care about animals. [DATO]'
      - 'I have volunteered at cat shelters in Seville since 2024 ([DATO]), and that experience is where [Huellas](/projects/huellas) comes from, the platform to reunite lost pets with their families that I am building now.'
    photo: ../../assets/about/cats.jpg
    photoAlt: 'Placeholder: shelter cats'
    caption: 'Shelter · Seville'
    facts:
      year: '2024'
      place: 'Seville'
      os: '-'
      stack: '-'
  - id: guitar
    kicker: 'Guitar'
    title: 'Electric guitar'
    paragraphs:
      - 'Mostly rock and blues, badly recorded on Linux with Ardour.'
    photo: ../../assets/about/guitar.jpg
    photoAlt: 'Placeholder: electric guitar'
    caption: 'Rock and blues · Ardour'
    facts:
      year: '[DATO]'
      place: 'Seville'
      os: '[DATO]'
      stack: 'Ardour'
  - id: chess
    kicker: 'Chess'
    title: 'Chess'
    paragraphs:
      - 'On Lichess, which is free software too. Always up for a game: [DATO].'
    photo: ../../assets/about/chess.jpg
    photoAlt: 'Placeholder: chess board'
    caption: 'Lichess · [DATO]'
    facts:
      year: '[DATO]'
      place: 'Lichess'
      os: '[DATO]'
      stack: '-'
  - id: boxing
    kicker: 'Boxing'
    title: 'Boxing'
    paragraphs:
      - 'A few sessions a week. The only place where I do not think about queues.'
    photo: ../../assets/about/boxing.jpg
    photoAlt: 'Placeholder: boxing gloves'
    caption: 'Boxing · Seville'
    facts:
      year: '[DATO]'
      place: 'Seville'
      os: '-'
      stack: '-'
mock: true
---
```

La página actual (`AboutPage.astro`) sigue compilando: no usa `stages`, y con `mock: true` oculta el cuerpo vacío.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/about-content.test.ts`
Expected: PASS.

Run: `npm run build`
Expected: build OK, con el aviso `[mock] about: es` (o `en`) en consola; sin errores de schema ni de imágenes.

- [ ] **Step 5: Commit**

```bash
git add scripts/about-placeholders.mjs src/assets/about src/content/about/es.md src/content/about/en.md tests/about-content.test.ts
git commit -m "feat(about): split the about content into stages with placeholder photos

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: Modelo de etapas resueltas y traducciones de la ficha

**Files:**

- Create: `src/lib/about-stages.ts`
- Modify: `src/i18n/translations.ts` (bloque `en` tras `'about.tag.selfhosted'` línea ~39; bloque `es` tras la línea ~204)
- Test: `tests/about-stages.test.ts` (nuevo)

**Interfaces:**

- Consumes: nada de Astro (módulo puro).
- Produces (`src/lib/about-stages.ts`):
  - `export interface StageFacts { year: string; place: string; os: string; stack: string }`
  - `export interface Polaroid { src: string; alt: string; caption: string; facts: StageFacts }`
  - `export interface StoryStage { id: string; kicker: string; title: string; paragraphs: string[]; links: { label: string; href: string }[]; polaroid?: Polaroid }`
  - `export interface RawStage { id: string; kicker: string; title: string; paragraphs: string[]; links: { label: string; href: string }[]; photoAlt?: string; caption?: string; facts?: StageFacts }`
  - `export function toStoryStage(stage: RawStage, src: string | undefined): StoryStage`
  - `export function firstPolaroid(stages: StoryStage[]): Polaroid | undefined`
  - `export function polaroidFor(stages: StoryStage[], id: string): Polaroid | undefined` (la de `id` si tiene foto; si no, `firstPolaroid`)
  - Traducciones: `about.facts.year`, `about.facts.place`, `about.facts.os`, `about.facts.stack`.

- [ ] **Step 1: Write the failing test**

`tests/about-stages.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { toStoryStage, firstPolaroid, polaroidFor, type RawStage } from '../src/lib/about-stages';
import { t } from '../src/i18n/translations';

const facts = { year: '2018', place: 'Sevilla', os: '[DATO]', stack: 'PHP' };

const raw = (id: string, extra: Partial<RawStage> = {}): RawStage => ({
  id,
  kicker: id,
  title: id,
  paragraphs: ['p'],
  links: [],
  ...extra,
});

describe('toStoryStage', () => {
  it('builds a polaroid when the stage has a photo', () => {
    const stage = toStoryStage(
      raw('daw', { photoAlt: 'IES', caption: '2018 · IES', facts }),
      '/a.webp',
    );
    expect(stage.polaroid).toEqual({ src: '/a.webp', alt: 'IES', caption: '2018 · IES', facts });
  });

  it('leaves the polaroid empty when there is no photo', () => {
    expect(toStoryStage(raw('chess'), undefined).polaroid).toBeUndefined();
  });

  it('fills missing alt, caption and facts with empty strings', () => {
    const stage = toStoryStage(raw('x'), '/x.webp');
    expect(stage.polaroid).toEqual({
      src: '/x.webp',
      alt: '',
      caption: '',
      facts: { year: '', place: '', os: '', stack: '' },
    });
  });
});

describe('firstPolaroid and polaroidFor', () => {
  const stages = [
    toStoryStage(raw('intro'), undefined),
    toStoryStage(raw('daw', { caption: 'first' }), '/daw.webp'),
    toStoryStage(raw('own-2026', { caption: 'today' }), '/desk.webp'),
  ];

  it('returns the first stage that has a photo', () => {
    expect(firstPolaroid(stages)?.src).toBe('/daw.webp');
  });

  it('returns the polaroid of the requested stage', () => {
    expect(polaroidFor(stages, 'own-2026')?.caption).toBe('today');
  });

  it('falls back to the first polaroid when the stage has none', () => {
    expect(polaroidFor(stages, 'intro')?.src).toBe('/daw.webp');
  });
});

describe('about fact labels', () => {
  it('translates the four fact keys', () => {
    expect(
      ['year', 'place', 'os', 'stack'].map((k) =>
        t(`about.facts.${k}` as 'about.facts.year', 'es'),
      ),
    ).toEqual(['año', 'lugar', 'sistema', 'stack']);
    expect(t('about.facts.os', 'en')).toBe('os');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/about-stages.test.ts`
Expected: FAIL: `Cannot find module '../src/lib/about-stages'`.

- [ ] **Step 3: Write minimal implementation**

`src/lib/about-stages.ts`:

```ts
export interface StageFacts {
  year: string;
  place: string;
  os: string;
  stack: string;
}

export interface Polaroid {
  src: string;
  alt: string;
  caption: string;
  facts: StageFacts;
}

export interface StoryStage {
  id: string;
  kicker: string;
  title: string;
  paragraphs: string[];
  links: { label: string; href: string }[];
  polaroid?: Polaroid;
}

export interface RawStage {
  id: string;
  kicker: string;
  title: string;
  paragraphs: string[];
  links: { label: string; href: string }[];
  photoAlt?: string;
  caption?: string;
  facts?: StageFacts;
}

const EMPTY_FACTS: StageFacts = { year: '', place: '', os: '', stack: '' };

export function toStoryStage(stage: RawStage, src: string | undefined): StoryStage {
  const { id, kicker, title, paragraphs, links } = stage;
  if (!src) return { id, kicker, title, paragraphs, links };
  return {
    id,
    kicker,
    title,
    paragraphs,
    links,
    polaroid: {
      src,
      alt: stage.photoAlt ?? '',
      caption: stage.caption ?? '',
      facts: stage.facts ?? EMPTY_FACTS,
    },
  };
}

export function firstPolaroid(stages: StoryStage[]): Polaroid | undefined {
  return stages.find((s) => s.polaroid)?.polaroid;
}

export function polaroidFor(stages: StoryStage[], id: string): Polaroid | undefined {
  return stages.find((s) => s.id === id)?.polaroid ?? firstPolaroid(stages);
}
```

En `src/i18n/translations.ts`, bloque `en`, justo después de `'about.tag.selfhosted': 'Self-hosted',`:

```ts
    'about.facts.year': 'year',
    'about.facts.place': 'place',
    'about.facts.os': 'os',
    'about.facts.stack': 'stack',
```

Bloque `es`, justo después de `'about.tag.selfhosted': 'Autoalojado',`:

```ts
    'about.facts.year': 'año',
    'about.facts.place': 'lugar',
    'about.facts.os': 'sistema',
    'about.facts.stack': 'stack',
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/about-stages.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/about-stages.ts src/i18n/translations.ts tests/about-stages.test.ts
git commit -m "feat(about): resolved stage model and fact labels

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: Layout de dos columnas con polaroid estática

**Files:**

- Create: `src/components/about/Polaroid.astro`, `src/components/about/AboutStory.astro`
- Modify: `src/components/about/AboutPage.astro` (reescritura completa)
- Test: `tests/about-page.test.ts` (nuevo)

**Interfaces:**

- Consumes: `StoryStage`, `Polaroid`, `toStoryStage`, `firstPolaroid`, `polaroidFor` de `src/lib/about-stages.ts`; `inlineLinks` de `src/lib/inline-links.ts`; `t`, `Locale`; `getImage` de `astro:assets`; `getEntry` de `astro:content`; `warnMock`, `mockEntries`; `personJsonLd`.
- Produces:
  - `Polaroid.astro` Props: `{ polaroid: Polaroid; lang: Locale; variant: 'sticky' | 'mobile' }`. Marca `data-polaroid={variant}`, `<img data-polaroid-img>`, `<p data-polaroid-caption>`, `<dd data-fact="year|place|os|stack">`.
  - `AboutStory.astro` Props: `{ lang: Locale; title: string; intro: string; stages: StoryStage[]; mock: boolean }`. Cada etapa es `<section data-stage={id}>` con `data-photo`, `data-alt`, `data-caption`, `data-year`, `data-place`, `data-os`, `data-stack` cuando tiene polaroid.

- [ ] **Step 1: Write the failing test**

`tests/about-page.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import AboutStory from '../src/components/about/AboutStory.astro';
import type { StoryStage } from '../src/lib/about-stages';

const stages: StoryStage[] = [
  {
    id: 'daw-2018',
    kicker: '2018',
    title: 'Desarrollo de Aplicaciones Web',
    paragraphs: ['Dos años en el IES Velázquez.'],
    links: [],
    polaroid: {
      src: '/_astro/ies-2018.webp',
      alt: 'IES Velázquez',
      caption: '2018 · IES Velázquez, Sevilla',
      facts: { year: '2018', place: 'Sevilla', os: '[DATO]', stack: 'PHP' },
    },
  },
  {
    id: 'own-2026',
    kicker: '2026',
    title: 'Mis propias cosas',
    paragraphs: ['[Bito](/es/projects/bito) y 1 < 2.'],
    links: [],
    polaroid: {
      src: '/_astro/desk-2026.webp',
      alt: 'Mi mesa',
      caption: '2026 · Sevilla',
      facts: { year: '2026', place: 'Sevilla', os: '[DATO]', stack: '[DATO]' },
    },
  },
  {
    id: 'free-software',
    kicker: 'Principios',
    title: 'Por qué lo publico todo libre',
    paragraphs: ['Uno.', 'Dos.', 'Tres.'],
    links: [{ label: '/stats', href: '/es/stats' }],
  },
];

async function render(mock: boolean) {
  const container = await AstroContainer.create();
  return container.renderToString(AboutStory, {
    props: { lang: 'es', title: 'Hola, soy Álvaro.', intro: 'Intro.', stages, mock },
  });
}

describe('AboutStory', () => {
  it('renders one data-stage section per stage', async () => {
    const html = await render(false);
    expect(html.match(/data-stage="/g)).toHaveLength(3);
  });

  it('shows the first photo stage in the sticky polaroid', async () => {
    const html = await render(false);
    const sticky = html.slice(html.indexOf('data-polaroid="sticky"'));
    expect(sticky).toContain('src="/_astro/ies-2018.webp"');
    expect(sticky).toContain('alt="IES Velázquez"');
    expect(sticky).toContain('2018 · IES Velázquez, Sevilla');
  });

  it('shows the 2026 stage in the mobile polaroid', async () => {
    const html = await render(false);
    const mobile = html.slice(html.indexOf('data-polaroid="mobile"'));
    expect(mobile).toContain('src="/_astro/desk-2026.webp"');
  });

  it('renders the fact labels in Spanish', async () => {
    const html = await render(false);
    expect(html).toContain('sistema');
    expect(html).toContain('data-fact="stack"');
  });

  it('turns inline links into anchors and escapes the rest', async () => {
    const html = await render(false);
    expect(html).toContain('<a href="/es/projects/bito">Bito</a> y 1 &lt; 2.');
  });

  it('lists the proof links in mono without a heading', async () => {
    const html = await render(false);
    expect(html).toContain('href="/es/stats"');
  });

  it('carries the polaroid data on stages that have a photo', async () => {
    const html = await render(false);
    expect(html).toContain('data-photo="/_astro/desk-2026.webp"');
    expect(html).toContain('data-caption="2026 · Sevilla"');
  });

  it('hides the stages but keeps the polaroid when mock', async () => {
    const html = await render(true);
    expect(html).not.toContain('data-stage="');
    expect(html).toContain('data-polaroid="sticky"');
  });

  it('links the closing buttons to contact and the CV', async () => {
    const html = await render(false);
    expect(html).toContain('href="/es/#contact"');
    expect(html).toContain('href="/es/cv"');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/about-page.test.ts`
Expected: FAIL: `Cannot find module '../src/components/about/AboutStory.astro'`.

- [ ] **Step 3: Write minimal implementation**

`src/components/about/Polaroid.astro`:

```astro
---
import type { Polaroid } from '../../lib/about-stages';
import { t, type Locale } from '../../i18n/translations';

interface Props {
  polaroid: Polaroid;
  lang: Locale;
  variant: 'sticky' | 'mobile';
}
const { polaroid, lang, variant } = Astro.props;
const keys = ['year', 'place', 'os', 'stack'] as const;
---

<figure data-polaroid={variant} class="polaroid-figure">
  <div class="relative">
    <div class="polaroid-back" aria-hidden="true"></div>
    <div class="polaroid-front">
      <img
        data-polaroid-img
        src={polaroid.src}
        alt={polaroid.alt}
        width="400"
        height="500"
        loading={variant === 'sticky' ? 'eager' : 'lazy'}
        decoding="async"
        class="polaroid-img"
      />
      <p data-polaroid-caption class="polaroid-caption">{polaroid.caption}</p>
    </div>
  </div>
  <dl class="polaroid-facts">
    {
      keys.map((key) => (
        <div class="flex">
          <dt class="w-14 shrink-0">{t(`about.facts.${key}` as const, lang)}</dt>
          <dd data-fact={key}>{polaroid.facts[key]}</dd>
        </div>
      ))
    }
  </dl>
</figure>

<style>
  .polaroid-figure {
    margin: 0;
    width: 100%;
  }
  .polaroid-back {
    position: absolute;
    inset: 0;
    background: #e6e3da;
    transform: translateY(6px) rotate(3deg);
  }
  .polaroid-front {
    position: relative;
    background: #f4f2ec;
    padding: 16px 16px 64px;
    border: 1px solid #d8d5cc;
    transform: rotate(-2deg);
    box-shadow: 0 8px 0 rgba(0, 0, 0, 0.35);
  }
  .polaroid-img {
    display: block;
    width: 100%;
    aspect-ratio: 4 / 5;
    object-fit: cover;
    border-radius: 2px;
  }
  .polaroid-caption {
    position: absolute;
    left: 16px;
    right: 16px;
    bottom: 22px;
    margin: 0;
    font-family: var(--font-mono);
    font-size: 13px;
    color: #3a3a3a;
  }
  .polaroid-facts {
    margin: 40px 0 0;
    padding-left: 12px;
    border-left: 2px solid var(--accent);
    font-family: var(--font-mono);
    font-size: 13px;
    line-height: 1.7;
    color: var(--text-muted);
  }
</style>
```

`src/components/about/AboutStory.astro`:

```astro
---
import PolaroidCard from './Polaroid.astro';
import { firstPolaroid, polaroidFor, type StoryStage } from '../../lib/about-stages';
import { inlineLinks } from '../../lib/inline-links';
import { t, type Locale } from '../../i18n/translations';

interface Props {
  lang: Locale;
  title: string;
  intro: string;
  stages: StoryStage[];
  mock: boolean;
}
const { lang, title, intro, stages, mock } = Astro.props;
const prefix = lang === 'es' ? '/es' : '';
const sticky = firstPolaroid(stages);
const mobile = polaroidFor(stages, 'own-2026');
---

<div class="container-page">
  <div class="about-story mx-auto flex max-w-[1100px] flex-col">
    <header class="max-w-[760px] pb-12 pt-14 lg:pb-20 lg:pt-[88px]">
      <h1 class="text-[34px] font-extrabold leading-[1.1] tracking-[-0.02em] lg:text-[44px]">
        {title}
      </h1>
      <p class="mt-6 max-w-[620px] text-lg leading-[1.65] text-muted">{intro}</p>
    </header>

    <div class="about-grid">
      <div class="about-text">
        {
          !mock &&
            stages.map((stage) => (
              <section
                data-stage={stage.id}
                data-photo={stage.polaroid?.src}
                data-alt={stage.polaroid?.alt}
                data-caption={stage.polaroid?.caption}
                data-year={stage.polaroid?.facts.year}
                data-place={stage.polaroid?.facts.place}
                data-os={stage.polaroid?.facts.os}
                data-stack={stage.polaroid?.facts.stack}
                class="about-stage"
              >
                <p class="font-mono text-[13px] text-faint">{stage.kicker}</p>
                <h2 class="mt-2 text-[28px] font-bold leading-[1.2]">{stage.title}</h2>
                <div class="mt-5 flex flex-col gap-5">
                  {stage.paragraphs.map((p) => (
                    <p class="about-paragraph text-lg leading-[1.65]" set:html={inlineLinks(p)} />
                  ))}
                </div>
                {stage.links.length > 0 && (
                  <ul class="mt-5 flex flex-col gap-1 font-mono text-[13px]">
                    {stage.links.map((link) => (
                      <li>
                        <a href={link.href} class="text-accent">
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))
        }
      </div>

      {
        sticky && (
          <aside class="about-aside">
            <div class="about-sticky">
              <PolaroidCard polaroid={sticky} lang={lang} variant="sticky" />
            </div>
          </aside>
        )
      }
      {
        mobile && (
          <div class="about-mobile">
            <PolaroidCard polaroid={mobile} lang={lang} variant="mobile" />
          </div>
        )
      }
    </div>

    <div class="mb-16 mt-16 flex flex-wrap gap-3 border-t border-border pt-10">
      <a href={`${prefix}/#contact`} class="btn-primary">{t('hero.contact', lang)}</a>
      <a href={`${prefix}/cv`} class="btn-secondary">{t('experience.cv', lang)}</a>
    </div>
  </div>
</div>

<style>
  .about-grid {
    display: grid;
    grid-template-columns: 560px 432px;
    column-gap: 108px;
    align-items: start;
  }
  .about-text {
    display: flex;
    flex-direction: column;
    gap: 96px;
  }
  .about-aside {
    align-self: stretch;
  }
  .about-sticky {
    position: sticky;
    top: 96px;
  }
  .about-mobile {
    display: none;
  }
  .about-paragraph :global(a) {
    color: var(--accent);
    text-decoration: underline;
    text-underline-offset: 3px;
  }
</style>
```

`src/components/about/AboutPage.astro` (completo):

```astro
---
import { getEntry } from 'astro:content';
import { getImage } from 'astro:assets';
import BaseLayout from '../../layouts/BaseLayout.astro';
import AboutStory from './AboutStory.astro';
import { t, type Locale } from '../../i18n/translations';
import { mockEntries, warnMock } from '../../lib/mock-report';
import { personJsonLd } from '../../lib/jsonld';
import { toStoryStage } from '../../lib/about-stages';

interface Props {
  lang: Locale;
}
const { lang } = Astro.props;

const entry = await getEntry('about', lang);
if (!entry) throw new Error(`Missing src/content/about/${lang}.md`);
warnMock('about', mockEntries([entry]));

const { title, intro, mock } = entry.data;
const stages = await Promise.all(
  entry.data.stages.map(async (stage) => {
    const image = stage.photo
      ? await getImage({ src: stage.photo, width: 800, format: 'webp' })
      : undefined;
    return toStoryStage(stage, image?.src);
  }),
);
---

<BaseLayout
  title={t('about.title', lang)}
  description={intro}
  lang={lang}
  jsonLd={personJsonLd(lang)}
>
  <AboutStory lang={lang} title={title} intro={intro} stages={stages} mock={mock} />
</BaseLayout>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/about-page.test.ts`
Expected: PASS (9 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/about/Polaroid.astro src/components/about/AboutStory.astro src/components/about/AboutPage.astro tests/about-page.test.ts
git commit -m "feat(about): two-column story layout with a sticky polaroid

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 5: Cambio de foto con IntersectionObserver y crossfade

**Files:**

- Modify: `src/components/about/AboutStory.astro` (añadir `<script>` al final y regla de transición en `<style>`)
- Test: `tests/about-page.test.ts` (añadir un `describe`)

**Interfaces:**

- Consumes: marcas de la Task 4: `[data-polaroid="sticky"]`, `[data-polaroid-img]`, `[data-polaroid-caption]`, `[data-fact]`, `section[data-stage]` con `data-photo|alt|caption|year|place|os|stack`.
- Produces: función de módulo `initAboutPolaroid(): () => void` (devuelve el `disconnect`), registrada en `astro:page-load` y limpiada en `astro:before-swap` (el sitio usa `ClientRouter`).

- [ ] **Step 1: Write the failing test**

Añadir al final de `tests/about-page.test.ts`:

```ts
import { readFileSync } from 'node:fs';

describe('AboutStory polaroid script', () => {
  const source = readFileSync('src/components/about/AboutStory.astro', 'utf8');

  it('observes the stages with the spec rootMargin', () => {
    expect(source).toContain('IntersectionObserver');
    expect(source).toContain("rootMargin: '-40% 0px -50% 0px'");
    expect(source).toContain('[data-stage]');
  });

  it('crossfades in 200ms and skips it with reduced motion', () => {
    expect(source).toContain('transition: opacity 200ms');
    expect(source).toContain('prefers-reduced-motion: reduce');
  });

  it('re-initialises on client navigation and uses no islands', () => {
    expect(source).toContain('astro:page-load');
    expect(source).toContain('astro:before-swap');
    expect(source).not.toContain('client:');
    expect(source).not.toContain('framer-motion');
  });
});
```

(Mover el `import { readFileSync }` arriba, junto al resto de imports.)

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/about-page.test.ts`
Expected: FAIL en los 3 tests nuevos (`IntersectionObserver` no aparece).

- [ ] **Step 3: Write minimal implementation**

En el `<style>` de `AboutStory.astro`, añadir:

```css
.about-sticky :global([data-polaroid-img]) {
  transition: opacity 200ms ease;
}
@media (prefers-reduced-motion: reduce) {
  .about-sticky :global([data-polaroid-img]) {
    transition: none;
  }
}
```

Al final de `AboutStory.astro`, tras `</style>`:

```astro
<script>
  const FACTS = ['year', 'place', 'os', 'stack'] as const;

  function initAboutPolaroid(): () => void {
    const root = document.querySelector<HTMLElement>('[data-polaroid="sticky"]');
    const img = root?.querySelector<HTMLImageElement>('[data-polaroid-img]');
    const caption = root?.querySelector<HTMLElement>('[data-polaroid-caption]');
    if (!root || !img || !caption) return () => {};

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    let current = img.getAttribute('src');
    let timer: number | undefined;

    const apply = (photo: string, data: DOMStringMap) => {
      img.src = photo;
      img.alt = data.alt ?? '';
      caption.textContent = data.caption ?? '';
      for (const key of FACTS) {
        const field = root.querySelector<HTMLElement>(`[data-fact="${key}"]`);
        if (field) field.textContent = data[key] ?? '';
      }
    };

    const show = (stage: HTMLElement) => {
      const data = stage.dataset;
      const photo = data.photo;
      if (!photo || photo === current) return;
      current = photo;
      window.clearTimeout(timer);
      if (reduce.matches) {
        apply(photo, data);
        img.style.opacity = '1';
        return;
      }
      img.style.opacity = '0';
      timer = window.setTimeout(() => {
        apply(photo, data);
        img.style.opacity = '1';
      }, 200);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) show(entry.target as HTMLElement);
        }
      },
      { rootMargin: '-40% 0px -50% 0px' },
    );
    document.querySelectorAll<HTMLElement>('[data-stage]').forEach((s) => observer.observe(s));

    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }

  let cleanup: () => void = () => {};
  document.addEventListener('astro:page-load', () => {
    cleanup();
    cleanup = initAboutPolaroid();
  });
  document.addEventListener('astro:before-swap', () => cleanup());
</script>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/about-page.test.ts`
Expected: PASS (12 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/about/AboutStory.astro tests/about-page.test.ts
git commit -m "feat(about): swap the polaroid photo as each stage scrolls in

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 6: Responsive móvil (< 1024px)

**Files:**

- Modify: `src/components/about/AboutStory.astro` (bloque `<style>`)
- Test: `tests/about-page.test.ts` (añadir un `describe`)

**Interfaces:**

- Consumes: clases `.about-grid`, `.about-text`, `.about-aside`, `.about-mobile` de la Task 4.
- Produces: en < 1024px una columna; `.about-aside` oculto (el observer no tiene efecto visible); `.about-mobile` visible, máx 360px, pegado a la izquierda y colocado antes del texto con `order: -1`.

- [ ] **Step 1: Write the failing test**

Añadir al final de `tests/about-page.test.ts`:

```ts
describe('AboutStory mobile layout', () => {
  const source = readFileSync('src/components/about/AboutStory.astro', 'utf8');

  it('collapses to one column below 1024px with a single 360px polaroid first', () => {
    const start = source.indexOf('@media (max-width: 1023px)');
    expect(start).toBeGreaterThan(-1);
    const block = source.slice(start, source.indexOf('</style>', start));
    expect(block).toContain('grid-template-columns: 1fr');
    expect(block).toContain('max-width: 360px');
    expect(block).toContain('order: -1');
    expect(block).toMatch(/\.about-aside\s*{\s*display: none;/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/about-page.test.ts`
Expected: FAIL: `start` es `-1`.

- [ ] **Step 3: Write minimal implementation**

En el `<style>` de `AboutStory.astro`, antes de las reglas de `prefers-reduced-motion`:

```css
@media (max-width: 1023px) {
  .about-grid {
    grid-template-columns: 1fr;
    row-gap: 56px;
  }
  .about-text {
    gap: 64px;
  }
  .about-aside {
    display: none;
  }
  .about-mobile {
    display: block;
    order: -1;
    width: 100%;
    max-width: 360px;
    padding-inline: 8px;
  }
}
```

El `padding-inline: 8px` evita que la rotación de la polaroid provoque scroll horizontal a 375px.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/about-page.test.ts`
Expected: PASS (13 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/about/AboutStory.astro tests/about-page.test.ts
git commit -m "feat(about): single-column layout with one polaroid on mobile

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 7: Build completo, home intacta y limpieza

**Files:**

- Modify: ninguno salvo que la verificación falle (máx. 3 ficheros de los ya tocados).
- Test: `tests/about-build.test.ts` (nuevo, lee `dist/`)

**Interfaces:**

- Consumes: `dist/about/index.html`, `dist/es/about/index.html`, `dist/index.html`, `dist/es/index.html` generados por `npm run build`.
- Produces: nada nuevo.

- [ ] **Step 1: Write the failing test**

`tests/about-build.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';

const read = (path: string) => readFileSync(path, 'utf8');

describe.skipIf(!existsSync('dist/es/about/index.html'))('about build output', () => {
  it.each(['dist/about/index.html', 'dist/es/about/index.html'])(
    '%s ships the sticky polaroid with a webp photo',
    (path) => {
      const html = read(path);
      expect(html).toContain('data-polaroid="sticky"');
      expect(html).toMatch(/data-polaroid-img[^>]*src="[^"]+\.webp"/);
      expect(html).toContain('application/ld+json');
    },
  );

  it.each(['dist/index.html', 'dist/es/index.html'])('%s still renders the values', (path) => {
    const html = read(path);
    expect(html).toMatch(/Free software|Software libre/);
    expect(html).toMatch(/Building in public|Construir en público/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `rm -rf dist && npx vitest run tests/about-build.test.ts`
Expected: los tests se saltan (`skipped`) porque no hay `dist/`; esto confirma que dependen del build.

- [ ] **Step 3: Write minimal implementation**

Run: `npm run build`
Expected: `astro check` sin errores, build OK, avisos `[mock] about: en` y `[mock] about: es`.

Run: `npm run lint`
Expected: sin errores. Si Prettier se queja de los ficheros de las Tasks 1-6, ejecutar `npx prettier --write` sobre esos ficheros concretos.

Comprobación manual con `npx astro preview`: `/es/about` a 1280px (polaroid pegajosa a la derecha), a 375px (una polaroid arriba, sin scroll horizontal), y con `mock: false` temporal en `es.md` para ver el cambio de foto al hacer scroll; revertir ese cambio antes del commit.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/about-build.test.ts`
Expected: PASS (4 tests, ninguno saltado).

- [ ] **Step 5: Commit**

```bash
git add tests/about-build.test.ts
git commit -m "test(about): check the built about pages and the home values

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

Si hubo arreglos de lint o formato, añadir esos ficheros al mismo commit.

---

## Autorrevisión

**Cobertura de la spec:**

- Layout 1100px, cabecera 44px/800, rejilla 560 | 108 | 432, sticky `top: 96px`: Task 4.
- Etapas `<section data-stage>` con kicker mono 13px, h2 28px/700, párrafos 18px/1.65, separación 96px: Task 4.
- Orden de las 10 etapas y enlaces de proyectos a `/projects/<slug>` (las cuatro fichas existen en `src/content/projects/en`): Task 2.
- Etapa 6 con 3 párrafos y lista mono de pruebas sin título: Tasks 2 y 4.
- Polaroid con medidas, colores, rotaciones, sombra, polaroid trasera y ficha con borde accent y claves de 56px (`w-14`): Task 4.
- Cambio de foto, pie y ficha con `IntersectionObserver` y `rootMargin` de la spec, datos en `data-*`, URLs de `getImage` a 800px webp, crossfade 200ms, reduced motion instantáneo, sin JS primera foto: Tasks 4 y 5.
- Móvil: se aplica la alternativa simple permitida por la spec (una polaroid con la foto de 2026, máx 360px): Task 6.
- Cierre con `btn-primary` a `/#contact` y `btn-secondary` a `/cv`, borde superior y `pt-10`: Task 4.
- Schema `stages` con `image()`, `paragraphs`, `links`, `values` conservado: Task 1. Home intacta verificada: Task 7.
- `inline-links.ts` con escape: Task 1.
- Placeholders 800x1000 `#1c2029` con script `scripts/about-placeholders.mjs`: Task 2.
- Copy real, sin anécdotas, `[DATO]` y `mock: true` con `warnMock`: Task 2; con `mock` se ocultan las etapas y se mantiene la polaroid: Task 4.
- Traducciones `about.facts.*`: Task 3. JSON-LD conservado: Tasks 4 y 7.
- Tests de la spec: schema con y sin foto y `stages: []` (Task 1); render es con `[data-stage]`, `alt` y pie (Task 4); mock (Task 4); enlaces y escape de `<` (Tasks 1 y 4).

**Desviaciones deliberadas:** `AboutPage.astro` delega en `AboutStory.astro` para poder renderizarlo en tests sin `astro:content`; el `<script>` vive en ese componente (sigue siendo script en `.astro`, sin isla). El enlace de GitHub usa `alvarotorresc`, el real de `site.config.ts`. Entre las Tasks 1 y 2 el build está roto (los `.md` aún no tienen `stages`); la Task 1 no ejecuta build.

**Placeholders del plan:** ninguno de tipo TBD/TODO. Los `[DATO]` son contenido intencionado que rellena el usuario.

**Consistencia de nombres:** `aboutSchema` (función), `StoryStage`, `Polaroid`, `RawStage`, `StageFacts`, `toStoryStage`, `firstPolaroid`, `polaroidFor`, `inlineLinks`, `escapeHtml`; marcas DOM `data-stage`, `data-polaroid="sticky|mobile"`, `data-polaroid-img`, `data-polaroid-caption`, `data-fact`, `data-photo|alt|caption|year|place|os|stack`; clases `.about-grid`, `.about-text`, `.about-aside`, `.about-sticky`, `.about-mobile`; id de etapa móvil `own-2026`. Se usan igual en todas las tareas y tests.
