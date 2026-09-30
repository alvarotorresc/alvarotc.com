# Spec: rediseño de la ficha de proyecto (`/projects/[slug]`)

Fecha: 2026-09-24. Rama: `redesign/cv-web`. Estado: aprobada por el usuario (eligió las maquetas).

## Qué se construye

La ficha de proyecto pasa de una hoja de datos con tarjetas a una página que enseña el producto. El layout cambia según el **tipo** del proyecto, que vive en el contenido (`kind`). Las cuatro maquetas aprobadas están en `docs/superpowers/specs/2026-09-24-project-page-mockups/`:

| kind     | maqueta                           | proyectos           | bloque de medios de la cabecera                                                                              |
| -------- | --------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------ |
| `mobile` | `mobile.dc.html` (Bito)           | Bito, Quedamos      | marco de móvil grande con la captura principal, sobresale por debajo de la cabecera                          |
| `web`    | `web.dc.html` (PokeUtils)         | PokeUtils, DevTools | marco de navegador (barra con tres puntos + URL en mono) con captura 16:10, sobresale igual                  |
| `hybrid` | `hybrid.dc.html` (BaseCero)       | BaseCero, Huellas   | captura de escritorio con marco de navegador fino y un móvil pequeño superpuesto delante, abajo a la derecha |
| `cli`    | `cli.dc.html` (create-astro-blog) | create-astro-blog   | ventana de terminal con el comando y la sesión de ejemplo; no sobresale                                      |

Las maquetas son la fuente de verdad visual: tamaños, jerarquía, espaciados, orden de secciones, copy de los títulos de sección. Están en modo oscuro; el modo claro usa los mismos tokens de `src/styles/global.css`. Son de escritorio (1280): las reglas de móvil están más abajo.

## Estructura común (todas las kinds, en este orden)

1. **Cabecera partida**. Izquierda: enlace "Todos los proyectos", icono (56-64px) + nombre (h1) + tagline, `intro` (frase larga en muted), etiqueta de estado con "vX.Y.Z, fecha" de la última entrada del changelog con fecha, acciones, y lista de datos verificables como `<dl>` con filas separadas por hairline (etiqueta en muted, valor en mono cuando es verificable: versión, fecha, tamaño, URL). Derecha: el bloque de medios según `kind`. Sin tarjetas.
2. **Capturas**: título "Capturas" + subtítulo ("Pantallas de la vX en un Android real" / "en escritorio" / "instalada en el móvil"), tira horizontal con scroll y `scroll-snap`, cada captura con pie. mobile/hybrid: 9:19.5 en marco fino; web: 16:10. cli: no tiene.
3. **Qué hace**: `featuresIntro` como subtítulo; las 3 primeras features con imagen son bloques con captura pequeña + título + texto; el resto, lista de título + texto en dos columnas con hairlines. cli: se titula "Qué te da", todas en lista de dos columnas con icono de trazo opcional (no hace falta icono: sin él).
4. **Cómo lo configuras** (solo cli, si hay `steps`): `<ol>` numerado, título + texto por paso, y al final el comando `after` en mono.
5. **Por qué existe**: el cuerpo Markdown del `.md` (prose), enlace "Leer el post: <título>" si hay `post`, e `illustration` a la derecha si existe (Habi, favicon en grande, logo).
6. **Pruébalo** (si hay `playground`): mobile/hybrid → marco de móvil con botón "Cargar la app" y 3 notas al lado (textos i18n fijos por kind); web → marco de navegador a ancho completo con botón "Cargar la web" y una nota. cli: no tiene.
7. **Cómo está hecho**: lista de líneas `built` (con enlaces inline via `inlineLinks`), sin tarjetas, hairlines.
8. **Cambios**: lista `changelog` con versión en mono (la más reciente en acento), fecha y nota; enlace "Todas las versiones en GitHub" (`repo/releases`) o "en npm" (si `kind === 'cli'` y `url` contiene `npmjs.com`). Enlace "Todos los proyectos" al final.

Acciones de la cabecera por kind:

- mobile: `download` (principal, "Descargar APK" + tamaño), "Código en GitHub", `url` como botón secundario con el dominio.
- web: "Abrir la web" (principal, a `url`), "Código en GitHub".
- hybrid: "Abrir la app" (principal, a `url`), "Código en GitHub", dominio de `url`.
- cli: bloque con `command` en mono + botón "Copiar el comando" (isla mínima o `<script>` inline con `navigator.clipboard`, con estado "Copiado"), "Código en GitHub", "Ver en npm" (a `url`).

Filas del `<dl>`: automáticas (Plataforma si `platform`, Licencia si `license`, Última versión si hay changelog con fecha, Web/npm si `url`) + las de `facts` del contenido, en ese orden. Nada de estrellas de GitHub hasta el plan C (no inventar).

## Modelo de datos (`projectSchema` en `src/content.config.ts`)

Cambios sobre el esquema actual:

```ts
kind: z.enum(['mobile', 'web', 'hybrid', 'cli']),            // obligatorio
status: z.enum(['published', 'publishing', 'beta', 'development', 'design', 'archived']),
intro: z.string().optional(),                                   // frase larga bajo la tagline
icon: image().optional(),                                       // antes string
cover: image().optional(),                                      // captura principal de la cabecera (y del bento de la home)
coverMobile: image().optional(),                                // hybrid: la captura del móvil superpuesto
download: z.object({ url: z.url(), label: z.string() }).optional(), // { url: APK, label: '4,7 MB' }
command: z.string().optional(),                                 // cli
terminal: z.array(z.string()).default([]),                      // cli: líneas de la sesión de ejemplo
facts: z.array(z.object({ label: z.string(), value: z.string(), mono: z.boolean().default(false) })).default([]),
screenshots: z.array(z.object({ src: image(), alt: z.string(), caption: z.string() })).default([]), // sustituye a gallery
screenshotsIntro: z.string().optional(),
featuresIntro: z.string().optional(),
features: z.array(z.object({ title: z.string(), text: z.string(), image: image().optional() })).default([]),
steps: z.array(z.object({ title: z.string(), text: z.string() })).default([]), // cli
after: z.string().optional(),                                   // cli: comando tras los pasos
post: z.string().optional(),                                    // slug del post relacionado (sin prefijo de idioma)
illustration: image().optional(),
built: z.array(z.string()).default([]),                         // líneas de "Cómo está hecho", admiten [texto](url)
```

Se eliminan `hero` y `gallery`. Se mantienen `name, tagline, status, tier, order, visible, repo, url, license, stack, platform, playground, changelog, githubRepo, mock`. El esquema usa `({ image }: SchemaContext) => z.object(...)` como ya hace `aboutSchema`. `image()` exige rutas relativas a `src/assets/`: las imágenes de proyectos van en `src/assets/projects/<slug>/`.

`statusLabel` y el `tone` de la etiqueta: `publishing` → "En publicación" / "Publishing", tono `warn` como beta. Extraer `tone(status)` a `src/lib/projects.ts` (ahora está duplicado en ProjectCard, ProjectBento y ProjectPage).

## Home y tarjetas

`ProjectBento.astro` y `ProjectCard.astro` dejan de leer `hero` (string en `public/`) y pasan a `cover` con `<Image>` de `astro:assets`. Los PNG de `public/projects/` (todos de 0 bytes) se borran. Si un proyecto no tiene `cover`, la tarjeta se queda solo con texto como ahora.

## Contenido

Los 7 proyectos (es + en) llevan `kind`. Datos reales confirmados por el usuario y GitHub (2026-09-24):

- **Bito** (`mobile`): status `publishing`; stack `[Kotlin, Offline-first, Privacy]`; platform `Android 10+`; license `GPL-3.0`; url `https://bito.alvarotc.com`; repo `https://github.com/alvarotorresc/bito`; download `{ url: 'https://github.com/alvarotorresc/bito/releases/download/v1.0.0/app-release.apk', label: '4,7 MB' }`; changelog: `v1.0.0` fecha `2026-08-26` (nota actual), `v2.0.0` sin fecha ("en camino"), `v0.1.0` sin fecha. Copy de intro, facts, features, built: el de `mobile.dc.html` (es) traducido al inglés en `en/`. Post: `[DATO]` hasta que el usuario diga el slug (dejar sin `post`).
- **PokeUtils** (`web`): status `published`; changelog `v1.0.0` fecha `2026-08-28` nota `[DATO]`; stack `[JavaScript, SPA]`; copy de `web.dc.html`. Licencia: dejar sin `license` (GitHub no la declara).
- **BaseCero** (`hybrid`): status `published`; license `MIT`; changelog `v1.0.0` fecha `2026-09-02` nota `[DATO]`; url `https://basecero.alvarotc.com`; playground `{ kind: 'pwa', src: 'https://basecero.alvarotc.com/app/' }`; copy de `hybrid.dc.html`.
- **create-astro-blog** (`cli`, sigue `visible: false`): command `npx create-astro-blog my-blog`; copy de `cli.dc.html`; versión, licencia y Node como `[DATO]` en los sitios donde la maqueta los pone.
- **Quedamos** (`mobile`), **Huellas** (`hybrid`), **DevTools** (`web`): solo se añade `kind` y se retiran `hero`/`gallery`. El resto del contenido se queda como está hasta que el usuario lo pase.

Marcadores `[DATO]` permitidos a propósito para revisar en preview, como en `/about`. La guarda `RELEASE_CHECK=1` de `tests/about-content.test.ts` se extiende a proyectos: falla si algún `.md` de `src/content/projects/` visible contiene `[DATO]` o si alguna imagen referenciada pesa menos de 20 KB.

Placeholders de imagen: un script `scripts/project-placeholders.mjs` (mismo patrón que `scripts/about-placeholders.mjs`) genera JPG etiquetados en `src/assets/projects/<slug>/` para Bito, PokeUtils y BaseCero con los tamaños de la maqueta (móvil 400x844, escritorio 1280x800, icono 256x256), para poder revisar el layout antes de tener las fotos.

## Móvil (< 768px)

- Cabecera a una columna: texto primero, medios después. mobile/hybrid: marco de móvil de 260px centrado sin sobresalir; web: navegador a ancho completo; cli: terminal a ancho completo con scroll horizontal en las líneas largas.
- Tira de capturas: scroll horizontal nativo con `scroll-snap-type: x mandatory`, 16px de gutter, sin scroll de página horizontal.
- "Qué hace": bloques a una columna, la imagen encima del texto. La lista de dos columnas pasa a una.
- Playground: el marco de móvil a 300px de ancho; el de navegador a ancho completo con alto 520px.
- Sin animaciones. El único comportamiento con JS es la carga del playground al pulsar y el botón de copiar.

## Accesibilidad y calidad

- Contraste AA: textos pequeños en `--text-faint` (#8a93a3), nunca #6b7382.
- Marcos de dispositivo son decorativos: `aria-hidden` en los adornos, la captura lleva `alt` real.
- `<video>` no se usa en esta iteración (no hay vídeo aún); `cover` es siempre imagen.
- TypeScript strict, sin `console.log`, sin comentarios innecesarios, Conventional Commits.
- Tests con la Container API (`experimental_AstroContainer`), como `tests/project-page.test.ts`, más comprobaciones del HTML construido en `tests/build.test.ts` si ya hay un patrón allí.

## Fuera de alcance

Vídeo promo, estrellas de GitHub y descargas de npm (plan C), datos reales de Quedamos/Huellas/DevTools, fotos reales.
