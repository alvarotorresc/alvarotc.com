# Ficha web de Bito al día (vídeo, medios finales y copia 1.1.0) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Poner al día la ficha de Bito en alvarotc.com en los dos idiomas: medios finales de la tubería de capturas y de Remotion, datos verificados (Android 8.0+, GPL-3.0-or-later, changelog real 1.1.0 y 1.0.0), tareas y copias de seguridad como características, `alt` y `caption` nuevos, y un bloque de vídeo que muestre las URL de YouTube cuando el autor las pegue.

**Architecture:** Hoy `toProjectView` descarta `playground: { kind: video }` y `ProjectPlayground` solo sabe pintar marcos de móvil y navegador, así que pegar la URL no haría nada. El plan añade primero el soporte de vídeo (normalizar la URL de YouTube en `project-view.ts` y una sección `data-section="video"` que enlaza a YouTube con el `promo` como póster, sin iframe), después copia los assets, reescribe los dos `bito.md` en dos pasos (copia y características; luego capturas con `alt`/`caption`) y borra los JPEG de relleno. La última tarea es la única que ejecuta `npm run build` y comprueba el §8 del spec en `dist/`.

**Tech Stack:** Astro 7 (SSG, `astro:assets` con salida webp), Content Collections con `projectSchema` (`src/content.config.ts`), vitest con `experimental_AstroContainer`, `sharp` (ya es dependencia) para recomprimir PNG, Prettier con `singleQuote: true` también en el frontmatter YAML.

**Spec:** `/home/alvarotc/Documents/apps/bito/docs/superpowers/specs/2026-09-25-video-producto-design.md` — este plan cubre solo §7 «Integración en web y Play» (parte web) y la línea de §8 que la verifica («`alvarotc-web`: `npm run build` sin assets por encima de 400 KB y sin verticales en `promo`»). Brief de medios: `docs/MEDIA_PROYECTOS.md` §1, §2 y §4-Bito. Fuentes de copia: `/home/alvarotc/Documents/apps/bito/docs/08-mensaje-maestro.md` (IDs citados en cada texto) y `/home/alvarotc/Documents/apps/bito/CHANGELOG.md`. El repo de Bito es de solo lectura.

## Global Constraints

- Se trabaja en un worktree que nace de `redesign/cv-web`. Todos los comandos se lanzan desde su raíz: `WT=$(git rev-parse --show-toplevel)`. La copia principal `/home/alvarotc/Documents/apps/alvarotc-web` solo se lee (es donde `to_web.py` deja sus PNG si no se le dio otra salida).
- Cada tarea toca como máximo 3 ficheros de texto (código, contenido o tests). Los PNG y JPEG que se añaden o borran son binarios y no cuentan.
- Como mucho un `npm run build` en todo el plan, en la Task 7. Las tareas 2 a 6 se comprueban con `npx vitest run <fichero>` (su `globalSetup` hace `astro sync`, no build), `npx astro check`, `npx eslint <ficheros>` y `npx prettier --check <ficheros>`.
- Commits Conventional Commits en inglés. Cada mensaje termina con estas dos líneas; sustituye el modelo por el que implementa de verdad:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
  `Claude-Session: https://claude.ai/code/session_01La2bxxwQG8rKRZhctLggti`
  El hook de husky pasa `eslint --fix` y `prettier --write` sobre lo que se commitea.
- Datos de Bito verificados en su repo (no se cambian sin volver a mirar allí): versión 1.1.0 (CHANGELOG, 2026-09-20: tareas, foco con temporizador, avisos de tareas a mediodía) y 1.0.0 (2026-08-26, primera versión pública). **No existe la v2.0.0** que decía la ficha, y la v0.1.0 tampoco está en el CHANGELOG. `minSdk 26` = **Android 8.0+**. Licencia **GPL-3.0-or-later**. APK de 4,7 MB, el de la 1.0.0 en GitHub Releases. 4 permisos, ninguno INTERNET. 0 dependencias de Google.
- La 1.1.0 aún no tiene tag ni APK. El botón de descarga sigue en `.../releases/download/v1.0.0/app-release.apk`, así que la entrada `v1.1.0` del changelog va **sin fecha** (la web la pinta como «en camino») y la `v1.0.0` es la única fechada. Así «Última versión» coincide con lo que descarga el botón. La Task 8 fecha la 1.1.0 cuando el autor la publique.
- Copia: los textos salen del mensaje maestro (el ID va en un comentario del plan, no en el fichero) y del CHANGELOG. El inglés es igual o más corto que el español en cada campo pareado. Sin emojis y sin menciones a IA. Glosario de §9: en español «logro» (nunca «insignia») y «copia de seguridad» o «copia» (nunca «backup»); «racha», «congelador», «sellar el día». Sargento, Cheerleader y Neutra no se traducen. Habi es «ella» en los rótulos, como fija el spec §2 («compañera»). El glosario §9.2 aún la da como masculino; aquí manda el spec.
- En YAML, Prettier deja comillas simples salvo que el texto lleve un apóstrofo: entonces usa comillas dobles (`"won't"`). Los bloques de este plan ya vienen así.
- Vídeo: **enlace a YouTube, no iframe**. El pie de la web dice «Sin cookies ni rastreadores» y `/privacy` dice «no usa cookies de ningún tipo, ni propias ni de terceros». Un reproductor embebido rompería las dos frases y obligaría a tocar la CSP (`frame-src`). La sección de vídeo abre `youtube.com` en otra pestaña, con el `promo` de la ficha como póster. La URL se normaliza a `https://www.youtube.com/watch?v=<ID>`, sin el parámetro de rastreo `si=`.
- Nombres y rutas de los assets finales en `src/assets/projects/bito/`: `icon.png` (1024×1024), `illustration.png` (800×800), `promo-es.png` y `promo-en.png` (1920×1080), `cover-{es,en}.png`, `shot-01-habitos-{es,en}.png`, `shot-02-recordatorio-{es,en}.png`, `shot-03-estadisticas-{es,en}.png`, `shot-04-widget-{es,en}.png`, `shot-05-insignias-{es,en}.png`, `shot-06-revision-{es,en}.png` y `feat-tareas-{es,en}.png` (todos 1080×2340). Ningún PNG de esa carpeta pasa de 400 KB: Astro copia a `dist/_astro` el original de la imagen de la tarjeta de la home (hoy `dist/_astro/cover.Wb6Qp5wU.png`, 379 KB, es el original de BaseCero).
- Fuera de alcance: `out/store/` y la ficha de Google Play, el render y la subida de los vídeos, y el icono en SVG (el spec §7 lo menciona, pero la web usa `icon.png`).

## Review Focus

1. **La URL que pega el autor no es la canónica.** YouTube comparte `https://youtu.be/ID?si=…`, y también circulan `m.youtube.com/watch?v=`, `/shorts/ID` y `youtube-nocookie.com/embed/ID`. Lo esperable es un enlace limpio a `www.youtube.com/watch?v=ID`, sin `si=`. Un host ajeno o parecido (`youtube.com.evil.com`) o un ID mal formado no pinta la sección, en vez de pintar un enlace roto. Test: Task 2, `youtubeWatchUrl`.
2. **Una app móvil con vídeo no debe seguir ofreciendo «Cargar la app».** Con `kind: video` en una ficha `mobile` sale la sección de vídeo y no el marco de móvil con las notas del APK. En una ficha `hybrid`, la barra de dirección no enseña `youtube.com`. Tests: Task 3 (`links out to YouTube instead of loading the app`) y Task 2 (`keeps the app address in the hybrid browser frame`).
3. **Un `promo` vertical o pesado.** La tarjeta de la home usa `promo` y Astro copia su original tal cual a `dist/_astro`. Un PNG de Remotion de 1920×1080 sin recomprimir puede pasar de 400 KB, y un promo vertical se pinta encogido sobre gris. Tests: Task 4 (`has a horizontal promo`, `keeps every Bito image at 400 KB or less`) y Task 7 (`find dist/_astro -size +400k`).
4. **«Última versión» contra lo que descarga el botón.** Si se fecha la 1.1.0 mientras el APK sigue siendo el de la 1.0.0, la ficha promete una versión que no entrega. Test: Task 4 (`dates as latest the release the download serves`).
5. **Copia fuera de glosario o inglés más largo.** «Insignias» es lo que había y el nombre de fichero `shot-05-insignias` invita a repetirlo. Test: Task 5 (`follows the glossary`, que quita antes las rutas). La regla de longitud la cubre Task 4 (`keeps every English text as short as or shorter than its Spanish pair`) y se vuelve a ejecutar en la Task 5.

## Mapa de ficheros

| Fichero                                                              | Tarea   | Qué cambia                                                                                    |
| -------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------- |
| `src/assets/projects/bito/*.png`                                     | 1       | 20 PNG finales (binarios)                                                                     |
| `src/lib/project-view.ts`                                            | 2       | `youtubeWatchUrl`, `ViewPlayground` con `video`, `ResolvedImages.promo`, `ProjectView.poster` |
| `src/components/projects/ProjectMedia.astro`                         | 2       | La barra de dirección híbrida ignora un playground de vídeo                                   |
| `tests/project-view.test.ts`                                         | 2       | Tests de lo anterior                                                                          |
| `src/components/projects/ProjectPlayground.astro`                    | 3       | Sección `data-section="video"`                                                                |
| `src/i18n/translations.ts`                                           | 3       | Cuatro claves `project.watch*` en `en` y `es`                                                 |
| `tests/project-playground.test.ts`                                   | 3       | Tests de la sección                                                                           |
| `src/content/projects/es/bito.md`, `src/content/projects/en/bito.md` | 4, 5, 8 | Ficha                                                                                         |
| `tests/project-content.test.ts`                                      | 4, 5, 6 | Tests de la ficha                                                                             |
| `src/assets/projects/bito/*.jpg`, `scripts/project-placeholders.mjs` | 6       | Se borran                                                                                     |
| `tests/build.test.ts`                                                | 7       | Comprobaciones sobre `dist/`                                                                  |

`src/components/projects/ProjectPage.astro` no cambia: ya calcula `images.promo` (webp de 1240 px) y se lo pasa a `toProjectView` dentro de `images`.

---

### Task 1: Copiar los medios finales al worktree

**Files:**

- Create (binarios): `src/assets/projects/bito/{icon,illustration,promo-es,promo-en,cover-es,cover-en}.png`, `shot-0{1..6}-*-{es,en}.png`, `feat-tareas-{es,en}.png`

**Interfaces:**

- Consumes: la salida de `bito/video/shots/to_web.py` (otro plan) y de Remotion (`bito/video/out/stills/`).
- Produces: los 20 PNG con los nombres de Global Constraints, todos de 400 KB o menos. Las tareas 4 y 5 los referencian.

- [ ] **Step 1: Comprobar que las fuentes existen (si falta alguna, parar)**

```bash
WT=$(git rev-parse --show-toplevel)
SHOTS=/home/alvarotc/Documents/apps/alvarotc-web/src/assets/projects/bito
STILLS=/home/alvarotc/Documents/apps/bito/video/out/stills
SCREENS=/home/alvarotc/Documents/apps/bito/video/public/shots
missing=0
for f in \
  "$SHOTS"/cover-{es,en}.png \
  "$SHOTS"/shot-01-habitos-{es,en}.png "$SHOTS"/shot-02-recordatorio-{es,en}.png \
  "$SHOTS"/shot-03-estadisticas-{es,en}.png "$SHOTS"/shot-04-widget-{es,en}.png \
  "$SHOTS"/shot-05-insignias-{es,en}.png "$SHOTS"/shot-06-revision-{es,en}.png \
  "$STILLS"/promo-{es,en}.png "$STILLS"/icon-1024.png "$STILLS"/illustration.png \
  "$SCREENS"/{es,en}/tareas.png; do
  [ -f "$f" ] || { echo "FALTA: $f"; missing=1; }
done
[ "$missing" = 0 ] && echo "fuentes OK"
```

Expected: `fuentes OK`. Si sale alguna línea `FALTA:`, la tarea queda BLOCKED: informa al coordinador de la lista y no sigas. Si `to_web.py` escribió en otra carpeta, cambia `SHOTS` a esa carpeta y repite.

- [ ] **Step 2: Copiar con los nombres finales**

```bash
WT=$(git rev-parse --show-toplevel)
SHOTS=/home/alvarotc/Documents/apps/alvarotc-web/src/assets/projects/bito
STILLS=/home/alvarotc/Documents/apps/bito/video/out/stills
SCREENS=/home/alvarotc/Documents/apps/bito/video/public/shots
DEST="$WT/src/assets/projects/bito"
mkdir -p "$DEST"
if ! [ "$SHOTS" -ef "$DEST" ]; then
  for lang in es en; do
    cp "$SHOTS/cover-$lang.png" "$DEST/"
    for s in 01-habitos 02-recordatorio 03-estadisticas 04-widget 05-insignias 06-revision; do
      cp "$SHOTS/shot-$s-$lang.png" "$DEST/"
    done
  done
fi
cp "$STILLS/promo-es.png" "$DEST/promo-es.png"
cp "$STILLS/promo-en.png" "$DEST/promo-en.png"
cp "$STILLS/icon-1024.png" "$DEST/icon.png"
cp "$STILLS/illustration.png" "$DEST/illustration.png"
cp "$SCREENS/es/tareas.png" "$DEST/feat-tareas-es.png"
cp "$SCREENS/en/tareas.png" "$DEST/feat-tareas-en.png"
ls "$DEST"/*.png | wc -l
```

Expected: `20`.

- [ ] **Step 3: Recomprimir los PNG de más de 400 KB**

```bash
node --input-type=module -e "
import sharp from 'sharp';
import { readdirSync, statSync, writeFileSync } from 'node:fs';
const dir = 'src/assets/projects/bito';
const limit = 400 * 1024;
for (const name of readdirSync(dir).filter((f) => f.endsWith('.png'))) {
  const path = dir + '/' + name;
  for (const quality of [90, 80, 70]) {
    if (statSync(path).size <= limit) break;
    const out = await sharp(path).png({ palette: true, quality, compressionLevel: 9, effort: 10 }).toBuffer();
    writeFileSync(path, out);
    console.log(name, quality, statSync(path).size);
  }
}
"
find src/assets/projects/bito -name '*.png' -size +400k
```

Expected: el `find` no imprime nada. Si queda algún fichero, la tarea queda BLOCKED: informa del nombre y del tamaño, sin bajar la calidad por debajo de 70.

- [ ] **Step 4: Comprobar las medidas**

```bash
node --input-type=module -e "
import sharp from 'sharp';
const dir = 'src/assets/projects/bito/';
const expected = { 'icon.png': [1024, 1024], 'illustration.png': [800, 800], 'promo-es.png': [1920, 1080], 'promo-en.png': [1920, 1080] };
const phone = ['cover', 'shot-01-habitos', 'shot-02-recordatorio', 'shot-03-estadisticas', 'shot-04-widget', 'shot-05-insignias', 'shot-06-revision', 'feat-tareas'];
for (const base of phone) for (const lang of ['es', 'en']) expected[base + '-' + lang + '.png'] = [1080, 2340];
let bad = 0;
for (const [name, [w, h]] of Object.entries(expected)) {
  const { width, height } = await sharp(dir + name).metadata();
  if (width !== w || height !== h) { console.log('MAL', name, width + 'x' + height, 'esperado', w + 'x' + h); bad = 1; }
}
console.log(bad ? 'medidas con errores' : 'medidas OK');
"
```

Expected: `medidas OK`. Una medida distinta deja la tarea BLOCKED; informa, porque la corrige el plan de capturas y no esta tarea.

- [ ] **Step 5: Commit**

```bash
git add src/assets/projects/bito/*.png
git commit -m "chore(bito): add the final media for the project page

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01La2bxxwQG8rKRZhctLggti"
```

---

### Task 2: El modelo de vista conserva el vídeo de YouTube

**Files:**

- Modify: `src/lib/project-view.ts`
- Modify: `src/components/projects/ProjectMedia.astro:15`
- Test: `tests/project-view.test.ts`

**Interfaces:**

- Produces:
  - `export function youtubeWatchUrl(url: string): string | undefined`: devuelve `https://www.youtube.com/watch?v=<ID>` o `undefined`.
  - `export interface ViewPlayground { kind: 'pwa' | 'iframe' | 'video'; src: string }`: con `video`, `src` ya viene normalizada.
  - `ResolvedImages.promo?: string` y `ProjectView.poster?: string` (el webp del `promo`, lo usa la Task 3).
  - `playgroundNotes(view)` devuelve `[]` si el playground es de vídeo.

- [ ] **Step 1: Escribir los tests que fallan**

En `tests/project-view.test.ts`, añade `youtubeWatchUrl,` a la lista de imports de `'../src/lib/project-view'` (en orden alfabético, detrás de `shotsIntro,`) y añade estos dos imports detrás del bloque de imports de fixtures:

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import ProjectMedia from '../src/components/projects/ProjectMedia.astro';
```

Sustituye el test `it('drops a video playground', …)` entero por:

```ts
it('keeps a YouTube video as a clean watch link', () => {
  const view = makeView({
    ...bitoFields,
    playground: { kind: 'video', src: 'https://youtu.be/dQw4w9WgXcQ?si=Tr4ck3rT0k3n' },
  });
  expect(view.playground).toEqual({
    kind: 'video',
    src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  });
});

it('drops a video that is not on YouTube', () => {
  const view = makeView({
    ...bitoFields,
    playground: { kind: 'video', src: 'https://x.dev/a.mp4' },
  });
  expect(view.playground).toBeUndefined();
});

it('passes the promo through as the video poster', () => {
  const view = makeView(bitoFields, { ...bitoImages, promo: '/_astro/promo.webp' });
  expect(view.poster).toBe('/_astro/promo.webp');
  expect(makeView(bitoFields, bitoImages).poster).toBeUndefined();
});
```

Al final del fichero, añade:

```ts
describe('youtubeWatchUrl', () => {
  const clean = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

  it.each([
    'https://youtu.be/dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ?si=abc123',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=5s',
    'https://youtube.com/watch?v=dQw4w9WgXcQ',
    'https://m.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://www.youtube.com/shorts/dQw4w9WgXcQ',
    'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
  ])('normalizes %s', (url) => {
    expect(youtubeWatchUrl(url)).toBe(clean);
  });

  it.each([
    'https://youtu.be/',
    'https://www.youtube.com/watch?v=short',
    'https://www.youtube.com/playlist?list=PL123',
    'https://evil.com/watch?v=dQw4w9WgXcQ',
    'https://youtube.com.evil.com/watch?v=dQw4w9WgXcQ',
    'not a url',
  ])('rejects %s', (url) => {
    expect(youtubeWatchUrl(url)).toBeUndefined();
  });
});

describe('video playground side effects', () => {
  const video = { kind: 'video' as const, src: 'https://youtu.be/dQw4w9WgXcQ' };

  it('gives a video no playground notes', () => {
    expect(playgroundNotes(makeView({ ...bitoFields, playground: video }, bitoImages))).toEqual([]);
  });

  it('keeps the app address in the hybrid browser frame', async () => {
    const container = await AstroContainer.create();
    const view = makeView({ ...baseceroFields, playground: video }, baseceroImages);
    const html = await container.renderToString(ProjectMedia, { props: { view } });
    expect(html).toContain('data-media="hybrid"');
    expect(html).toContain('basecero.alvarotc.com');
    expect(html).not.toContain('youtube.com');
  });
});
```

- [ ] **Step 2: Ejecutar y ver que fallan**

Run: `npx vitest run tests/project-view.test.ts`
Expected: FAIL. `youtubeWatchUrl` no se exporta (`is not a function`), `view.playground` es `undefined` y `view.poster` no existe.

- [ ] **Step 3: Implementar en `src/lib/project-view.ts`**

Cambia la interfaz `ViewPlayground`:

```ts
export interface ViewPlayground {
  kind: 'pwa' | 'iframe' | 'video';
  src: string;
}
```

En `ResolvedImages`, añade detrás de `illustration?: string;`:

```ts
  promo?: string;
```

En `ProjectView`, añade detrás de `illustration?: string;`:

```ts
  poster?: string;
```

Detrás de la función `displayUrl`, añade:

```ts
const YOUTUBE_ID = /^[\w-]{11}$/;
const YOUTUBE_PATH = /^\/(?:embed|shorts|live)\/([^/]+)/;

function parseUrl(url: string): URL | undefined {
  try {
    return new URL(url);
  } catch {
    return undefined;
  }
}

export function youtubeWatchUrl(url: string): string | undefined {
  const parsed = parseUrl(url);
  if (!parsed) return undefined;
  const host = parsed.hostname.replace(/^(?:www|m)\./, '');
  let id: string | null | undefined;
  if (host === 'youtu.be') id = parsed.pathname.slice(1);
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    id =
      parsed.pathname === '/watch'
        ? parsed.searchParams.get('v')
        : YOUTUBE_PATH.exec(parsed.pathname)?.[1];
  }
  return id && YOUTUBE_ID.test(id) ? `https://www.youtube.com/watch?v=${id}` : undefined;
}

function viewPlayground(playground: ProjectFields['playground']): ViewPlayground | undefined {
  if (!playground) return undefined;
  if (playground.kind !== 'video') return { kind: playground.kind, src: playground.src };
  const src = youtubeWatchUrl(playground.src);
  return src ? { kind: 'video', src } : undefined;
}
```

En `playgroundNotes`, cambia la primera guarda:

```ts
if (!playground || playground.kind === 'video') return [];
```

En `toProjectView`, borra el bloque `const playground = fields.playground && fields.playground.kind !== 'video' ? … : undefined;`. En el objeto que devuelve, cambia `playground,` por `playground: viewPlayground(fields.playground),` y añade detrás de `illustration: images.illustration,`:

```ts
    poster: images.promo,
```

- [ ] **Step 4: Proteger la barra de dirección híbrida**

En `src/components/projects/ProjectMedia.astro`, sustituye la línea 15:

```ts
const appAddress =
  view.playground && view.playground.kind !== 'video'
    ? displayUrl(view.playground.src)
    : (view.address ?? '');
```

- [ ] **Step 5: Ejecutar tests y tipos**

Run: `npx vitest run tests/project-view.test.ts tests/project-playground.test.ts tests/project-header.test.ts`
Expected: PASS (los dos últimos no cambian: comprueban que nada se rompió).

Run: `npx astro check && npx eslint src/lib/project-view.ts src/components/projects/ProjectMedia.astro tests/project-view.test.ts`
Expected: `0 errors` y ESLint sin salida.

- [ ] **Step 6: Commit**

```bash
git add src/lib/project-view.ts src/components/projects/ProjectMedia.astro tests/project-view.test.ts
git commit -m "feat(projects): keep youtube video playgrounds as clean watch links

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01La2bxxwQG8rKRZhctLggti"
```

---

### Task 3: Sección de vídeo en la ficha

**Files:**

- Modify: `src/components/projects/ProjectPlayground.astro`
- Modify: `src/i18n/translations.ts:95` (en) y `:366` (es)
- Test: `tests/project-playground.test.ts`

**Interfaces:**

- Consumes: `view.playground` con `kind: 'video'` y `src` normalizada, y `view.poster?: string` (Task 2).
- Produces: `<section data-section="video">` con un `<a data-video-link target="_blank" rel="noopener noreferrer">` que apunta a `playground.src`. Con vídeo, no se pinta `data-section="playground"`. Claves nuevas: `project.watch`, `project.watchText`, `project.watchLink`, `project.watchNote`.

- [ ] **Step 1: Escribir los tests que fallan**

Al final de `tests/project-playground.test.ts`, añade:

```ts
describe('ProjectPlayground with a video', () => {
  const video = { kind: 'video' as const, src: 'https://youtu.be/dQw4w9WgXcQ?si=abc' };
  const withPoster = { ...bitoImages, promo: '/_astro/promo.webp' };

  it('links out to YouTube instead of loading the app', async () => {
    const html = await playground(makeView({ ...bitoFields, playground: video }, withPoster));
    expect(html).toContain('data-section="video"');
    expect(html).toContain('href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('src="/_astro/promo.webp"');
    expect(html).toContain('Ver en YouTube');
    expect(html).toContain('Esta página no carga nada de YouTube.');
    expect(html).not.toContain('data-section="playground"');
    expect(html).not.toContain('data-playground-load');
    expect(html).not.toContain('Cargar la app');
    expect(html).not.toContain('<iframe');
  });

  it('works without a poster', async () => {
    const html = await playground(makeView({ ...bitoFields, playground: video }, bitoImages));
    expect(html).toContain('data-video-link');
    expect(html).not.toContain('<img');
  });

  it('speaks English', async () => {
    const html = await playground(makeView({ ...bitoFields, playground: video }, withPoster, 'en'));
    expect(html).toContain('Watch on YouTube');
    expect(html).toContain('This page loads nothing from YouTube.');
  });

  it('shows nothing for a video that is not on YouTube', async () => {
    const html = await playground(
      makeView({ ...bitoFields, playground: { kind: 'video', src: 'https://x.dev/a.mp4' } }),
    );
    expect(html).not.toContain('data-section=');
  });
});
```

- [ ] **Step 2: Ejecutar y ver que fallan**

Run: `npx vitest run tests/project-playground.test.ts`
Expected: FAIL en los tres primeros tests nuevos: hoy la ficha móvil con vídeo pinta `data-section="playground"` con «Cargar la app», y el texto de YouTube no existe. El cuarto ya pasa gracias a la Task 2.

- [ ] **Step 3: Añadir las claves de traducción**

En `src/i18n/translations.ts`, bloque `en`, detrás de `'project.loadWeb': 'Load the site',`:

```ts
    'project.watch': 'Watch it',
    'project.watchText': 'The app in under a minute.',
    'project.watchLink': 'Watch on YouTube',
    'project.watchNote':
      'It opens youtube.com in a new tab. This page loads nothing from YouTube.',
```

En el bloque `es`, detrás de `'project.loadWeb': 'Cargar la web',`:

```ts
    'project.watch': 'Míralo',
    'project.watchText': 'La app en menos de un minuto.',
    'project.watchLink': 'Ver en YouTube',
    'project.watchNote':
      'Se abre youtube.com en otra pestaña. Esta página no carga nada de YouTube.',
```

- [ ] **Step 4: Pintar la sección**

En `src/components/projects/ProjectPlayground.astro`, sustituye:

```ts
const phone = view.kind === 'mobile' || view.kind === 'hybrid';
const web = view.kind === 'web';
```

por:

```ts
const video = playground?.kind === 'video';
const phone = !video && (view.kind === 'mobile' || view.kind === 'hybrid');
const web = !video && view.kind === 'web';
```

Justo antes de la etiqueta `<script>`, detrás de la llave que cierra el bloque `playground && web`, añade:

```astro
{playground && video && (
  <section data-section="video" class="flex flex-col gap-6 border-t border-border py-14">
    <div class="flex flex-col gap-2">
      <h2 class="text-[22px] font-bold tracking-[-0.02em]">{t('project.watch', lang)}</h2>
      <p class="max-w-[620px] text-base leading-[1.6] text-muted">{t('project.watchText', lang)}</p>
    </div>
    <a
      data-video-link
      href={playground.src}
      target="_blank"
      rel="noopener noreferrer"
      class="relative flex aspect-video w-full max-w-[960px] items-center justify-center overflow-hidden rounded-xl border border-border bg-surface-2"
    >
      {view.poster && (
        <img
          src={view.poster}
          alt=""
          loading="lazy"
          decoding="async"
          class="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <span class="btn-primary relative gap-2">
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
        <span>{t('project.watchLink', lang)}</span>
      </span>
    </a>
    <p data-note class="max-w-[620px] text-sm leading-[1.6] text-muted">
      {t('project.watchNote', lang)}
    </p>
  </section>
)}
```

El `<script>` del componente no se toca: si cambiara, cambiaría su hash en la CSP de `vercel.json`.

- [ ] **Step 5: Ejecutar tests, tipos y formato**

Run: `npx vitest run tests/project-playground.test.ts tests/translations.test.ts tests/project-view.test.ts`
Expected: PASS.

Run: `npx astro check && npx eslint src/components/projects/ProjectPlayground.astro src/i18n/translations.ts tests/project-playground.test.ts && npx prettier --write src/components/projects/ProjectPlayground.astro src/i18n/translations.ts tests/project-playground.test.ts`
Expected: `0 errors`, ESLint sin salida y Prettier formatea sin error (el hook de husky haría lo mismo al commitear).

- [ ] **Step 6: Commit**

```bash
git add src/components/projects/ProjectPlayground.astro src/i18n/translations.ts tests/project-playground.test.ts
git commit -m "feat(projects): link a project video out to youtube with the promo as poster

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01La2bxxwQG8rKRZhctLggti"
```

---

### Task 4: Ficha de Bito al día (datos, características, medios)

**Files:**

- Modify: `src/content/projects/es/bito.md`
- Modify: `src/content/projects/en/bito.md`
- Test: `tests/project-content.test.ts` (bloque `describe.each(['es', 'en'])('bito (%s)', …)` y cabecera de helpers)

**Interfaces:**

- Consumes: los PNG de la Task 1.
- Produces: dos fichas con `platform: Android 8.0+`, `license: GPL-3.0-or-later`, el changelog `v1.1.0` (sin fecha) y `v1.0.0` (2026-08-26), 9 características (las 4 primeras con imagen de su idioma), `icon.png`, `cover-{lang}.png`, `promo-{lang}.png` e `illustration.png`, y una línea comentada `# playground:` para la Task 8. En esta tarea las `screenshots` siguen siendo las 5 JPEG antiguas; las cambia la Task 5. El helper `copyOf(source)` lo reutiliza la Task 5.

- [ ] **Step 1: Escribir los tests que fallan**

En `tests/project-content.test.ts`, añade detrás de los imports de `node:*`:

```ts
import { youtubeWatchUrl } from '../src/lib/project-view';
```

Detrás de la línea `const imageRefs = …`, añade los helpers:

```ts
const COPY_KEYS = [
  'tagline',
  'intro',
  'featuresIntro',
  'screenshotsIntro',
  'label',
  'value',
  'title',
  'text',
  'alt',
  'caption',
  'note',
];
const QUOTED = String.raw`'((?:[^']|'')*)'|"((?:[^"\\]|\\.)*)"`;
const unquote = (single?: string, double?: string) =>
  single !== undefined ? single.replace(/''/g, "'") : (double ?? '').replace(/\\"/g, '"');
const copyOf = (source: string) => {
  const [, front, ...rest] = source.split(/^---$/m);
  const copy: Record<string, string[]> = {};
  for (const m of front.matchAll(
    new RegExp(String.raw`^\s*(?:- )?(\w+): (?:${QUOTED})\s*$`, 'gm'),
  )) {
    if (COPY_KEYS.includes(m[1])) (copy[m[1]] ??= []).push(unquote(m[2], m[3]));
  }
  copy.built = [...front.matchAll(new RegExp(String.raw`^ {2}- (?:${QUOTED})\s*$`, 'gm'))].map(
    (m) => unquote(m[1], m[2]),
  );
  copy.body = rest
    .join('---')
    .trim()
    .split(/\n\s*\n/);
  return copy;
};
const pngSize = (path: string) => {
  const bytes = readFileSync(path);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
};
const BITO = '../../../assets/projects/bito';
```

Sustituye el bloque entero `describe.each(['es', 'en'])('bito (%s)', (lang) => { … });` por:

```ts
describe.each(['es', 'en'])('bito (%s)', (lang) => {
  const source = read(lang, 'bito');

  it('is a mobile project being published', () => {
    expect(field(source, 'kind')).toBe('mobile');
    expect(field(source, 'status')).toBe('publishing');
  });

  it('carries the facts checked against the Bito repo', () => {
    expect(field(source, 'platform')).toBe('Android 8.0+');
    expect(field(source, 'license')).toBe('GPL-3.0-or-later');
    expect(field(source, 'url')).toBe('https://bito.alvarotc.com');
    expect(field(source, 'stack')).toBe('[Kotlin, Offline-first, Privacy]');
    expect(source).toMatch(
      /https:\/\/github\.com\/alvarotorresc\/bito\/releases\/download\/v1\.\d+\.\d+\/app-release\.apk/,
    );
    expect(source).not.toMatch(/v2\.0\.0|v0\.1\.0|Android 10/);
  });

  it('lists only the real releases', () => {
    expect([...source.matchAll(/version: '(v[\d.]+)'/g)].map((m) => m[1])).toEqual([
      'v1.1.0',
      'v1.0.0',
    ]);
    expect(source).toMatch(/version: 'v1\.0\.0'\n\s+date: 2026-08-26\n/);
  });

  it('dates as latest the release the download serves', () => {
    const dated = [...source.matchAll(/version: '(v[\d.]+)'\n\s+date: /g)].map((m) => m[1]);
    const served = /releases\/download\/(v[\d.]+)\//.exec(source)?.[1];
    expect(served).toBeDefined();
    expect(dated[0]).toBe(served);
  });

  it('uses the final media for its language', () => {
    expect(field(source, 'icon')).toBe(`'${BITO}/icon.png'`);
    expect(field(source, 'cover')).toBe(`'${BITO}/cover-${lang}.png'`);
    expect(field(source, 'promo')).toBe(`'${BITO}/promo-${lang}.png'`);
    expect(field(source, 'illustration')).toBe(`'${BITO}/illustration.png'`);
  });

  it('has nine features, the first four with a screen of its language', () => {
    expect(source.match(/^ {2}- title: /gm)).toHaveLength(9);
    const images = [...source.matchAll(/^ {4}image: '[^']*\/([\w-]+)\.png'$/gm)].map((m) => m[1]);
    expect(images).toEqual([
      `shot-04-widget-${lang}`,
      `shot-02-recordatorio-${lang}`,
      `shot-06-revision-${lang}`,
      `feat-tareas-${lang}`,
    ]);
  });

  it('has a horizontal promo', () => {
    const promo = imageRefs(lang, 'bito').find((ref) => ref.endsWith(`promo-${lang}.png`));
    expect(promo).toBeDefined();
    const { width, height } = pngSize(promo ?? '');
    expect(width).toBeGreaterThan(height);
  });

  it('keeps every Bito image at 400 KB or less', () => {
    imageRefs(lang, 'bito').forEach((ref) =>
      expect(statSync(ref).size, ref).toBeLessThanOrEqual(400 * 1024),
    );
  });

  it('points the video, when there is one, at YouTube', () => {
    const line = /^playground: (.+)$/m.exec(source)?.[1];
    if (line) {
      const src = /^\{ kind: video, src: '([^']+)' \}$/.exec(line)?.[1];
      expect(src, line).toBeDefined();
      expect(youtubeWatchUrl(src ?? ''), line).toBeDefined();
    }
  });

  it('has no emoji', () => {
    expect(source).not.toMatch(/\p{Extended_Pictographic}/u);
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

describe('bito copy in both languages', () => {
  const es = copyOf(read('es', 'bito'));
  const en = copyOf(read('en', 'bito'));

  it('pairs every text', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(es).sort());
    Object.keys(es).forEach((key) => expect(en[key].length, key).toBe(es[key].length));
  });

  it('keeps every English text as short as or shorter than its Spanish pair', () => {
    Object.keys(es).forEach((key) =>
      es[key].forEach((text, i) =>
        expect(en[key][i].length, `${key}[${i}]: ${en[key][i]}`).toBeLessThanOrEqual(text.length),
      ),
    );
  });
});
```

`statSync` y `readdirSync` ya se importan en la cabecera del fichero. Deja el bloque `describe('project placeholders', …)` tal cual: lo retira la Task 6.

- [ ] **Step 2: Ejecutar y ver que fallan**

Run: `npx vitest run tests/project-content.test.ts`
Expected: FAIL en `bito (es)` y `bito (en)`: sale `Android 10+`, `GPL-3.0`, `v2.0.0`, siete características y `promo.jpg`.

- [ ] **Step 3: Reescribir `src/content/projects/es/bito.md`**

Contenido completo del fichero. Fuentes de la copia: `intro` = `descriptor`; `featuresIntro` = `promesa.subtitulo`; características 1 a 3 = `promesa.widget`, `promesa.notificacion` y `promesa.repaso`; la 4 sale del CHANGELOG [1.1.0]; la 5, de `backups.cuerpo`, `backups.legible` y `backups.cifrado`; de la 6 a la 9 = `hace.rachas`, `hace.tipos`, `hace.recordatorios` y `hace.logros`; `built` = §12.1 a §12.3 y `cripto.*`.

```markdown
---
name: Bito
tagline: 'Registra un hábito en un toque, sin cuentas ni nube.'
intro: 'La app de hábitos que no te roba tiempo. Vive entera en tu móvil: sin cuentas, sin nube y sin una sola línea que salga a internet.'
kind: mobile
status: publishing
tier: featured
order: 1
repo: https://github.com/alvarotorresc/bito
url: https://bito.alvarotc.com
license: GPL-3.0-or-later
platform: Android 8.0+
stack: [Kotlin, Offline-first, Privacy]
githubRepo: alvarotorresc/bito
icon: '../../../assets/projects/bito/icon.png'
cover: '../../../assets/projects/bito/cover-es.png'
promo: '../../../assets/projects/bito/promo-es.png'
# playground: { kind: video, src: 'URL de YouTube del vídeo en español' }
download:
  url: https://github.com/alvarotorresc/bito/releases/download/v1.0.0/app-release.apk
  label: '4,7 MB'
facts:
  - label: 'Tamaño del APK'
    value: '4,7 MB'
    mono: true
  - label: 'Permisos de Android'
    value: '4, ninguno es internet'
  - label: 'Dependencias de Google'
    value: '0'
    mono: true
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
featuresIntro: 'Tres maneras de registrar. Dos de ellas ni siquiera te piden abrir la app.'
features:
  - title: 'Desde la pantalla de inicio'
    text: 'El widget enseña lo de hoy y se registra con un toque, sin entrar en ninguna parte. Y si solo te importa un hábito, hay un widget pequeño para él solo.'
    image: '../../../assets/projects/bito/shot-04-widget-es.png'
  - title: 'Desde la notificación'
    text: 'El recordatorio llega con el botón puesto. Lo pulsas y queda apuntado sin desbloquear nada más.'
    image: '../../../assets/projects/bito/shot-02-recordatorio-es.png'
  - title: 'En el repaso de la noche'
    text: 'Una pantalla al final del día para cerrar lo que quedó suelto. Sellas el día y se acabó.'
    image: '../../../assets/projects/bito/shot-06-revision-es.png'
  - title: 'Tareas con plazo y foco'
    text: 'La llamada, el papeleo, el correo. Cada tarea con su plazo, un primer paso si te ayuda a arrancar y un temporizador de 5, 10 o 25 minutos con Habi al lado.'
    image: '../../../assets/projects/bito/feat-tareas-es.png'
  - title: 'Copias de seguridad que son tuyas'
    text: 'Cada copia lleva todo y va a la carpeta que tú elijas. En claro es un JSON que abres con el bloc de notas; con contraseña, no la abre nadie, ni siquiera Bito.'
  - title: 'Rachas que no te castigan'
    text: 'Fallar un día no borra un mes. Hay congeladores para los días imposibles y puedes apuntar hacia atrás cuando te acuerdes tarde.'
  - title: 'Cantidades, duraciones y cosas que dejar'
    text: 'Ocho vasos de agua, veinte minutos de lectura o un día más sin fumar. Cada tipo se registra como pide su forma.'
  - title: 'Recordatorios con la voz que elijas'
    text: 'El aviso cambia de tono según la hora del día y según a quién le hayas dado la voz. Por la mañana plantea el día; por la noche te ayuda a cerrarlo.'
  - title: 'Logros y estadísticas de verdad'
    text: 'Mapas de calor, récords y logros que se ganan solos. Los números están para que veas cómo vas, no para presumir en ningún sitio.'
illustration: '../../../assets/projects/bito/illustration.png'
built:
  - 'Kotlin 2.1 y Jetpack Compose, para Android 8.0 o superior.'
  - 'Offline-first: todos los datos viven en el móvil.'
  - '4 permisos, y ninguno es internet. La app no puede llamar a casa.'
  - '0 dependencias de Google Play Services. Funciona igual en GrapheneOS.'
  - 'Copias cifradas con Argon2id y AES-256-GCM cuando les pones contraseña.'
  - 'Software libre bajo GPL-3.0-or-later, código en [github.com/alvarotorresc/bito](https://github.com/alvarotorresc/bito).'
changelog:
  - version: 'v1.1.0'
    note: 'Tareas con plazo, foco con temporizador y avisos de tareas a mediodía.'
  - version: 'v1.0.0'
    date: 2026-08-26
    note: 'La primera versión para compartir. Widget de un solo hábito, avisos con la voz de Habi, sonido y vibración al registrar.'
---

Todas las apps de hábitos que probé pedían una cuenta, luego una suscripción, luego mis datos. Bito pide un toque. Guarda todo en el móvil, hace copias de seguridad en la carpeta que tú elijas y no llama a casa.

Hice el primer prototipo en un día para probar la idea, y lo conté. Por el camino llegó Habi, una compañera que anima sin dar la lata. La 1.1.0 añade tareas y un temporizador para empezarlas, y es la que va a Google Play.
```

- [ ] **Step 4: Reescribir `src/content/projects/en/bito.md`**

```markdown
---
name: Bito
tagline: 'Log a habit in one tap, without accounts or cloud.'
intro: "The habit app that won't steal your time. Lives entirely on your phone: no accounts, no cloud, not one line out to the internet."
kind: mobile
status: publishing
tier: featured
order: 1
repo: https://github.com/alvarotorresc/bito
url: https://bito.alvarotc.com
license: GPL-3.0-or-later
platform: Android 8.0+
stack: [Kotlin, Offline-first, Privacy]
githubRepo: alvarotorresc/bito
icon: '../../../assets/projects/bito/icon.png'
cover: '../../../assets/projects/bito/cover-en.png'
promo: '../../../assets/projects/bito/promo-en.png'
# playground: { kind: video, src: 'YouTube URL of the English video' }
download:
  url: https://github.com/alvarotorresc/bito/releases/download/v1.0.0/app-release.apk
  label: '4.7 MB'
facts:
  - label: 'APK size'
    value: '4.7 MB'
    mono: true
  - label: 'Permissions'
    value: '4, none for internet'
  - label: 'Google dependencies'
    value: '0'
    mono: true
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
featuresIntro: "Three ways to log it. Two of them don't even ask you to open the app."
features:
  - title: 'From the home screen'
    text: "The widget shows today and logs with one tap, no need to go anywhere. Care about just one habit? There's a small widget just for it."
    image: '../../../assets/projects/bito/shot-04-widget-en.png'
  - title: 'From the notification'
    text: "The reminder comes with the button built in. Tap it and it's logged, nothing else to unlock."
    image: '../../../assets/projects/bito/shot-02-recordatorio-en.png'
  - title: 'In the evening review'
    text: "One screen at day's end to close out what's left. Seal the day and that's it."
    image: '../../../assets/projects/bito/shot-06-revision-en.png'
  - title: 'Tasks, deadlines, focus'
    text: 'The call, the paperwork, the email. Each task gets a deadline, a first step if it helps, and a 5, 10 or 25 minute timer with Habi beside you.'
    image: '../../../assets/projects/bito/feat-tareas-en.png'
  - title: 'Backups that are yours'
    text: "Every backup carries everything and goes to the folder you pick. Plain, it's a JSON you open in Notepad; with a password, nobody opens it, not even Bito."
  - title: "Streaks that don't punish"
    text: "Missing a day doesn't erase a month. Freezers cover the impossible days, and you can backdate an entry when you remember late."
  - title: 'Amounts, durations, and things to quit'
    text: 'Eight glasses of water, twenty minutes of reading, or one more day without smoking. Each type logs its own way.'
  - title: 'Reminders in the voice you pick'
    text: 'The nudge changes tone by time of day and by which voice you picked. Mornings, it sets up the day; nights, it helps close it.'
  - title: 'Real badges, real stats'
    text: "Heatmaps, records, and badges that earn themselves. The numbers are there to show how you're doing, not to show off anywhere."
illustration: '../../../assets/projects/bito/illustration.png'
built:
  - 'Kotlin 2.1 and Jetpack Compose, for Android 8.0 or later.'
  - 'Offline-first: all data lives on the phone.'
  - '4 permissions, none for internet. The app cannot phone home.'
  - '0 Google Play Services dependencies. Works the same on GrapheneOS.'
  - 'Backups encrypted with Argon2id and AES-256-GCM with a password.'
  - 'Free software under GPL-3.0-or-later, code at [github.com/alvarotorresc/bito](https://github.com/alvarotorresc/bito).'
changelog:
  - version: 'v1.1.0'
    note: 'Tasks with deadlines, a focus timer and midday task reminders.'
  - version: 'v1.0.0'
    date: 2026-08-26
    note: "The first version to share. Single-habit widget, reminders in Habi's voice, sound and haptics on log."
---

Every habit tracker I tried asked for an account, then a subscription, then my data. Bito asks for one tap. It keeps everything on the phone, backs up to the folder you pick, and does not phone home.

I built the first prototype in a day to prove the idea, and wrote about it. Along the way came Habi, a companion who nudges without nagging. 1.1.0 adds tasks and a timer to start them, and is the one going to Google Play.
```

- [ ] **Step 5: Formato, tests y tipos del contenido**

Run: `npx prettier --write src/content/projects/es/bito.md src/content/projects/en/bito.md && git diff --stat`
Expected: Prettier puede reajustar el ancho, pero no cambia comillas ni orden. Si cambió comillas, vuelve a ejecutar los tests, que aceptan los dos estilos.

Run: `npx vitest run tests/project-content.test.ts tests/i18n-paths.test.ts`
Expected: PASS, incluidos `bito copy in both languages` y `has a horizontal promo`.

Run: `npx astro check`
Expected: `0 errors`. El esquema valida `image()` contra los ficheros reales, así que una ruta mal escrita sale aquí.

- [ ] **Step 6: Commit**

```bash
git add src/content/projects/es/bito.md src/content/projects/en/bito.md tests/project-content.test.ts
git commit -m "feat(bito): bring the project page up to 1.1.0 with tasks, backups and final media

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01La2bxxwQG8rKRZhctLggti"
```

---

### Task 5: Capturas nuevas con `alt` y `caption` bilingües

**Files:**

- Modify: `src/content/projects/es/bito.md` (bloque `screenshots:` y nueva clave `screenshotsIntro:`)
- Modify: `src/content/projects/en/bito.md` (ídem)
- Test: `tests/project-content.test.ts`

**Interfaces:**

- Consumes: `copyOf` (Task 4) y los PNG `shot-0N-*-{lang}.png` (Task 1).
- Produces: seis capturas por idioma, en el orden del brief (hábitos, recordatorio, estadísticas, widget, logros, repaso), con `alt` que describe lo que se ve (datos de la demo: usuaria Lucía, «Beber agua» con 130 días de racha, logros hasta la racha de 30 días y la semana perfecta) y `caption` con el nombre que la pantalla tiene en la app.

- [ ] **Step 1: Mirar las capturas antes de escribir**

Abre con la herramienta Read `src/assets/projects/bito/shot-0{1..6}-*-es.png` y las seis `-en.png`. Comprueba que se ve lo que dicen los `alt` del Step 4: en `shot-01` el hábito y la racha de 130 días, en `shot-05` la racha de 30 y la semana perfecta, y en `shot-06` el botón «Sellar el día» / «Seal the day». Si el hábito inglés no se llama «Drink water», usa el nombre que salga en la captura. Si una captura no muestra algo que el `alt` afirma, quita esa parte del `alt` en los dos idiomas. El inglés tiene que seguir igual o más corto.

- [ ] **Step 2: Escribir los tests que fallan**

Dentro de `describe.each(['es', 'en'])('bito (%s)', …)` de `tests/project-content.test.ts`, añade:

```ts
it('has six screenshots of its language, in order', () => {
  const shots = [...source.matchAll(/^ {2}- src: '[^']*\/([\w-]+)\.png'$/gm)].map((m) => m[1]);
  expect(shots).toEqual(
    [
      '01-habitos',
      '02-recordatorio',
      '03-estadisticas',
      '04-widget',
      '05-insignias',
      '06-revision',
    ].map((shot) => `shot-${shot}-${lang}`),
  );
  expect(source).not.toMatch(/\.jpg'/);
});

it('introduces the screenshots itself', () => {
  expect(source).toMatch(/^screenshotsIntro: /m);
});
```

Detrás de `describe('bito copy in both languages', …)`, añade:

```ts
describe('bito copy follows the glossary', () => {
  const withoutPaths = (lang: string) => read(lang, 'bito').replace(/'\.\.\/[^']+'/g, '');

  it('says logro and copia de seguridad in Spanish', () => {
    const es = withoutPaths('es');
    expect(es).not.toMatch(/insignia|backup/i);
    expect(es).toContain("caption: 'Logros'");
    expect(es).toContain("caption: 'Repaso del día'");
  });

  it('uses the app words in English', () => {
    const en = withoutPaths('en');
    expect(en).not.toMatch(/Statistics|Quantity|Sergeant|Nightly review/);
    expect(en).toContain("caption: 'Badges'");
    expect(en).toContain("caption: 'Daily review'");
  });
});
```

- [ ] **Step 3: Ejecutar y ver que fallan**

Run: `npx vitest run tests/project-content.test.ts`
Expected: FAIL. Siguen las 5 JPEG, no hay `screenshotsIntro`, sale «Insignias» en español y «Nightly review» en inglés.

- [ ] **Step 4: Sustituir el bloque de capturas en los dos ficheros**

En `src/content/projects/es/bito.md`, sustituye desde `screenshots:` hasta la última línea `caption:` de ese bloque (justo antes de `featuresIntro:`) por:

```yaml
screenshotsIntro: 'La 1.1.0 en Android, con los datos de una usuaria de demostración.'
screenshots:
  - src: '../../../assets/projects/bito/shot-01-habitos-es.png'
    alt: 'Detalle del hábito Beber agua, con una racha de 130 días y el calendario del mes lleno'
    caption: 'Detalle del hábito'
  - src: '../../../assets/projects/bito/shot-02-recordatorio-es.png'
    alt: 'Persiana de notificaciones con un recordatorio de Bito y su botón para registrar sin abrir la app'
    caption: 'Recordatorio'
  - src: '../../../assets/projects/bito/shot-03-estadisticas-es.png'
    alt: 'Estadísticas con el mapa de calor de los hábitos y los números del mes'
    caption: 'Estadísticas'
  - src: '../../../assets/projects/bito/shot-04-widget-es.png'
    alt: 'Widget de Bito en la pantalla de inicio con los hábitos de hoy'
    caption: 'Widget'
  - src: '../../../assets/projects/bito/shot-05-insignias-es.png'
    alt: 'Pantalla de logros con los ganados, entre ellos la racha de 30 días y la semana perfecta'
    caption: 'Logros'
  - src: '../../../assets/projects/bito/shot-06-revision-es.png'
    alt: 'Repaso del día con los hábitos pendientes y el botón Sellar el día'
    caption: 'Repaso del día'
```

En `src/content/projects/en/bito.md`, el mismo tramo por:

```yaml
screenshotsIntro: "1.1.0 on Android, with a demo user's data."
screenshots:
  - src: '../../../assets/projects/bito/shot-01-habitos-en.png'
    alt: 'Drink water habit detail, with a 130-day streak and a full month calendar'
    caption: 'Habit detail'
  - src: '../../../assets/projects/bito/shot-02-recordatorio-en.png'
    alt: 'Notification shade with a Bito reminder and its button to log without opening the app'
    caption: 'Reminder'
  - src: '../../../assets/projects/bito/shot-03-estadisticas-en.png'
    alt: "Stats with the habits heatmap and the month's numbers"
    caption: 'Stats'
  - src: '../../../assets/projects/bito/shot-04-widget-en.png'
    alt: "Bito widget on the home screen with today's habits"
    caption: 'Widget'
  - src: '../../../assets/projects/bito/shot-05-insignias-en.png'
    alt: 'Badges screen with the ones earned, including the 30-day streak and the perfect week'
    caption: 'Badges'
  - src: '../../../assets/projects/bito/shot-06-revision-en.png'
    alt: 'Daily review with the pending habits and the Seal the day button'
    caption: 'Daily review'
```

- [ ] **Step 5: Formato y tests**

Run: `npx prettier --write src/content/projects/es/bito.md src/content/projects/en/bito.md && npx vitest run tests/project-content.test.ts`
Expected: PASS, incluidos `keeps every English text as short as or shorter than its Spanish pair` y `bito copy follows the glossary`.

Run: `npx astro check`
Expected: `0 errors`.

- [ ] **Step 6: Commit**

```bash
git add src/content/projects/es/bito.md src/content/projects/en/bito.md tests/project-content.test.ts
git commit -m "feat(bito): six real screenshots with bilingual alt text and captions

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01La2bxxwQG8rKRZhctLggti"
```

---

### Task 6: Borrar los JPEG de relleno y su generador

**Files:**

- Delete (binarios): `src/assets/projects/bito/{badges,cover,habi,icon,promo,reminder,review,stats,widget}.jpg`
- Delete: `scripts/project-placeholders.mjs` (solo genera esos JPEG de Bito y ningún `package.json` script lo llama)
- Test: `tests/project-content.test.ts` (bloque `placeholders` y `describe('project placeholders', …)`)

**Interfaces:**

- Consumes: las fichas de las tareas 4 y 5, que ya no referencian ningún `.jpg`.
- Produces: `src/assets/projects/bito/` solo con los 20 PNG.

- [ ] **Step 1: Confirmar que nadie los usa**

Run: `grep -rn "projects/bito/[a-z]*\.jpg" src scripts; grep -rn "project-placeholders" src scripts tests package.json`
Expected: la primera búsqueda no devuelve nada en `src/` y solo la propia `scripts/project-placeholders.mjs` (su plantilla SVG); la segunda, nada. `tests/schemas.test.ts` tiene rutas `bito/widget.jpg` y `bito/promo.jpg` como cadenas que el esquema parsea con un `image()` de mentira. No leen ficheros, así que no se tocan.

- [ ] **Step 2: Cambiar el test para que falle**

En `tests/project-content.test.ts`, borra la constante `placeholders` y el bloque `describe('project placeholders', …)`, y pon en su lugar:

```ts
describe('bito media', () => {
  it('keeps no placeholder JPEG', () => {
    expect(readdirSync('src/assets/projects/bito').filter((f) => f.endsWith('.jpg'))).toEqual([]);
  });
});
```

Run: `npx vitest run tests/project-content.test.ts -t "bito media"`
Expected: FAIL, con los 9 `.jpg` listados.

- [ ] **Step 3: Borrar**

```bash
git rm src/assets/projects/bito/{badges,cover,habi,icon,promo,reminder,review,stats,widget}.jpg scripts/project-placeholders.mjs
```

- [ ] **Step 4: Tests**

Run: `npx vitest run tests/project-content.test.ts && npx astro check`
Expected: PASS y `0 errors`.

- [ ] **Step 5: Commit**

```bash
git add tests/project-content.test.ts
git commit -m "chore(bito): drop the placeholder jpegs and their generator

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01La2bxxwQG8rKRZhctLggti"
```

---

### Task 7: Build y verificación del spec §8

**Files:**

- Test: `tests/build.test.ts` (bloque `describe.skipIf(!built)('built project pages', …)`)
- Modify, solo si la CSP lo pide en el Step 4: `vercel.json`

**Interfaces:**

- Consumes: todo lo anterior.
- Produces: `dist/` sin ningún fichero de más de 400 KB en `dist/_astro` y la home con el promo horizontal de Bito.

- [ ] **Step 1: Añadir las comprobaciones sobre `dist/`**

Dentro de `describe.skipIf(!built)('built project pages', …)` de `tests/build.test.ts`, añade:

```ts
it('renders the Bito page with the 1.1.0 copy and six screens', () => {
  const html = page('es/projects/bito/index.html');
  expect(html).toContain('Android 8.0+');
  expect(html).toContain('GPL-3.0-or-later');
  expect(html).toContain('Repaso del día');
  expect(html).not.toContain('v2.0.0');
  expect(html.match(/<img[^>]+class="[^"]*shot-img/g)).toHaveLength(6);
});

it('shows the horizontal Bito promo on each home', () => {
  expect(page('es/index.html')).toMatch(/\/_astro\/promo-es\.[\w-]+\.webp/);
  expect(page('index.html')).toMatch(/\/_astro\/promo-en\.[\w-]+\.webp/);
});

it('keeps every emitted asset at 400 KB or less', () => {
  const heavy = readdirSync(join(dist, '_astro')).filter(
    (file) => readFileSync(join(dist, '_astro', file)).length > 400 * 1024,
  );
  expect(heavy).toEqual([]);
});
```

- [ ] **Step 2: Build (el único del plan)**

Run: `npm run build`
Expected: termina sin errores (`astro check` con `0 errors` y `astro build` con `Complete!`).

- [ ] **Step 3: Comprobación del spec §8**

Run: `find dist/_astro -size +400k`
Expected: no imprime nada. Si imprime un fichero, mira qué es antes de tocar nada. Un `.png` o `.jpg` es el original de una imagen de tarjeta: recomprímelo con el Step 3 de la Task 1. Un `.js` o una fuente no tiene que ver con este plan: informa como BLOCKED con el nombre y el tamaño.

Run: `ls dist/_astro | grep -E '^(promo|cover)-(es|en)\.' ; ls -la dist/_astro/promo-*.png 2>/dev/null`
Expected: aparecen los webp de `promo-es` y `promo-en`. Si Astro copió los originales `promo-*.png`, pesan 400 KB o menos (lo garantiza la Task 1).

- [ ] **Step 4: Tests sobre la build**

Run: `npx vitest run tests/build.test.ts tests/csp.test.ts`
Expected: PASS. Si `csp.test.ts` falla por un hash de script o de estilo (este plan no toca scripts inline, pero Astro puede reordenar estilos), ejecuta `node scripts/csp-hashes.mjs --write`, repite el comando y añade `vercel.json` al commit.

- [ ] **Step 5: Suite completa y lint**

Run: `npm test && npm run lint`
Expected: PASS y lint sin errores.

- [ ] **Step 6: Commit**

```bash
git add tests/build.test.ts
git commit -m "test(bito): check the built page, the promo on the home and the 400 kb budget

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01La2bxxwQG8rKRZhctLggti"
```

Si el Step 4 cambió `vercel.json`, añádelo a ese mismo `git add`.

---

### Task 8: Cuando el autor pegue las URL (y cuando publique la 1.1.0)

La hace el autor o un agente con las URL delante. No forma parte de la ejecución del plan.

**Files:**

- Modify: `src/content/projects/es/bito.md`
- Modify: `src/content/projects/en/bito.md`

- [ ] **Step 1: Vídeo, una línea por fichero**

En `es/bito.md`, sustituye la línea `# playground: { kind: video, src: 'URL de YouTube del vídeo en español' }` por `playground: { kind: video, src: '<URL del vídeo ES tal como la da YouTube>' }`. En `en/bito.md`, la línea `# playground: …` por `playground: { kind: video, src: '<URL del vídeo EN>' }`. Vale cualquier forma de URL de YouTube: la web la normaliza y le quita el `si=`.

- [ ] **Step 2: Cuando exista el tag `v1.1.0` con su APK**

En los dos ficheros: añade `date: 2026-09-20` (o la fecha real del tag) bajo `- version: 'v1.1.0'`, cambia `v1.0.0` por `v1.1.0` en `download.url`, y actualiza `label` y el `value` de «Tamaño del APK» / «APK size» con el tamaño real del APK nuevo (coma decimal en español, punto en inglés). El test `dates as latest the release the download serves` obliga a hacer las dos cosas a la vez.

- [ ] **Step 3: Comprobar y commit**

Run: `npx vitest run tests/project-content.test.ts && npx astro check`
Expected: PASS y `0 errors`.

```bash
git add src/content/projects/es/bito.md src/content/projects/en/bito.md
git commit -m "feat(bito): add the product video to the project page"
```

(Usa `feat(bito): point the download at 1.1.0` para el Step 2. Si lo commitea un agente, añade las dos líneas de trailer de Global Constraints.)

---

## Self-review

- **Cobertura del spec §7 (parte web).** «Las URL van a `playground: { kind: video, src }`»: Task 2, Task 3 (la web las muestra) y Task 8 (pegarlas). «Android 8.0+, changelog real (1.1.0, 1.0.0)»: Task 4. «Tareas y copias de seguridad como características»: Task 4, características 4 y 5. «`alt` y `caption` nuevos»: Task 5. «Todos los assets del brief en `src/assets/projects/bito/`» (icono 1024, cover, promo, seis capturas, `illustration.png` 800×800, imagen de característica): Task 1, con nombres por idioma para cover, promo y capturas, como fija el encargo. Excepción declarada: el icono en SVG no se usa en la web. «Miniatura: el feature graphic» es de YouTube y Play, fuera de este repo.
- **Cobertura del spec §8 (web).** «`npm run build` sin assets por encima de 400 KB»: Task 7, Steps 2 y 3 (`find dist/_astro -size +400k`), además del test `keeps every emitted asset at 400 KB or less` y el control previo en Task 1 y Task 4. «Sin verticales en `promo`»: Task 4 (`has a horizontal promo`, leyendo el IHDR) y Task 7 (`shows the horizontal Bito promo on each home`).
- **Placeholders.** Las únicas marcas a rellenar están en la Task 8 y son las URL que solo tiene el autor. En la ficha, la línea comentada `# playground:` es documentación del sitio donde van.
- **Consistencia de nombres.** `youtubeWatchUrl`, `ViewPlayground.kind: 'video'`, `ResolvedImages.promo` y `ProjectView.poster` se definen en la Task 2 y se usan igual en la Task 3. `data-section="video"` y `data-video-link` coinciden en componente y tests. `copyOf`, `pngSize` y `BITO` se definen en la Task 4 y se reutilizan en la 5.
- **Review Focus.** Cada línea tiene su test en la tarea dueña: 1 → Task 2; 2 → Tasks 2 y 3; 3 → Tasks 4 y 7; 4 → Task 4; 5 → Tasks 4 y 5.
