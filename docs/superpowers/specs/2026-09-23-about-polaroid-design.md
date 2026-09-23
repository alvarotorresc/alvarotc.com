# Spec: página /about con polaroid pegajosa (2026-09-23)

Sustituye por completo la página `/about` y `/es/about` actuales (`src/components/about/AboutPage.astro`, contenido en `src/content/about/{en,es}.md`). Maqueta aprobada por el usuario: `2026-09-23-about-polaroid-mock.dc.html` (mismo directorio; lienzo original https://claude.ai/artifact/ECByBGZqaUUc3zaqXmDyNW, artboard "2A. Polaroid"). La maqueta manda en layout y jerarquía; el copy de la maqueta contiene anécdotas inventadas y marcas `[DATO]`: NO se copia tal cual (ver "Contenido").

## Layout

- Contenedor de 1100px centrado. Cabecera a ancho completo: h1 44px/1.1 peso 800, párrafo intro 18px muted.
- Debajo, rejilla de dos columnas que dura HASTA el bloque de botones finales: texto 560px | hueco 108px | columna de 432px con la polaroid `position: sticky; top: 96px`.
- Columna de texto: una secuencia de "etapas" (`<section data-stage="…">`). Cada etapa: kicker en JetBrains Mono 13px faint (año o palabra), h2/h3 Manrope 28px peso 700, párrafos 18px/1.65. Separación entre etapas 96px, sin líneas.
- Orden de las etapas: (1) 2018 DAW IES Velázquez, (2) 2020 Z1, (3) 2022 Therapyside, (4) 2025 Soltel, (5) 2026 mis propias cosas (Bito, Quedamos, BaseCero, Huellas, enlazados a /projects/<slug> cuando la ficha exista, o a repo), (6) "Por qué lo publico todo libre" con 3 párrafos y una lista de pruebas en mono enlazadas: github.com/alvarotc, /stats, /projects/bito, (7) "Gatos, y por qué soy vegano", (8) guitarra, (9) ajedrez, (10) boxeo. Las 7-10 son la parte personal, menos importante, abajo.
- Polaroid: caja de 432px de ancho, fondo `#f4f2ec`, padding 16px 16px 64px, borde 1px `#d8d5cc`, `transform: rotate(-2deg)`, sombra `0 8px 0 rgba(0,0,0,.35)`. Dentro, la foto 400x500 (4:5, `object-fit: cover`, radio 2px). En la franja inferior, el pie en JetBrains Mono 13px `#3a3a3a` (p.ej. "2018 · IES Velázquez, Sevilla"). Detrás, una segunda polaroid `#e6e3da` girada +3deg y bajada 6px, sin foto. Debajo de la polaroid, la ficha: 4 líneas mono 13px muted, con borde izquierdo 2px accent y padding-left 12px: `año`, `lugar`, `os`, `stack` (claves alineadas en columna de 56px).
- La polaroid cambia de foto, pie y ficha al cruzar cada etapa. Mecanismo: script inline en el .astro (sin framer, sin isla) con `IntersectionObserver` sobre `[data-stage]`, `rootMargin: '-40% 0px -50% 0px'`; la etapa activa escribe `src`/`alt` del `<img>` y los textos de pie y ficha, leyéndolos de `data-*` de la propia etapa (o de un JSON inline `<script type="application/json">`). Las imágenes van precargadas por `astro:assets` (`getImage`, ancho 800, formato webp) y las URLs viajan en los `data-*`. Cambio de foto: crossfade de 200ms con `opacity` y `transition`; con `prefers-reduced-motion` el cambio es instantáneo. Sin JS, la polaroid muestra la primera foto y todo el texto sigue legible.
- Móvil (< 1024px): una columna. La polaroid deja de ser sticky y aparece una vez, a ancho completo (máx 360px, centrada a la izquierda), justo debajo de la cabecera, mostrando la foto de la etapa 5 (2026, tú hoy) y su ficha. Cada etapa con foto propia muestra además su foto en línea como polaroid pequeña (máx 280px) encima de su h2. (Alternativa más simple si complica: solo la polaroid única arriba, sin fotos por etapa; el implementador elige la simple si la doble supera 3 ficheros.)
- Cierre: botones "Contactar" (`btn-primary`, a `/#contact`) y "CV completo, imprimible" (`btn-secondary`, a `/cv`), con borde superior 1px border y padding-top 40px. Luego el footer del BaseLayout.
- Sin animaciones de entrada, sin iconos salvo los que ya use la nav, sin tarjetas.

## Contenido y datos

- Nueva estructura de la colección `about`: el `.md` deja de tener `values` (siguen usándose en la home: `src/components/home/About.astro` lee `about.data.values`; NO romper la home: mantener `values` en el schema y en los ficheros, aunque la página about no los use).
- Añadir a `aboutSchema`: `stages: z.array(stageSchema).min(1)` donde `stageSchema = { id: string, kicker: string, title: string, photo: image().optional(), photoAlt: string.optional(), caption: string.optional(), facts: { year: string, place: string, os: string, stack: string }.optional() }`. Las etapas sin `photo` heredan la última polaroid mostrada (no cambian nada). Usar `image()` del helper de schema (`({ image }) => z.object(...)`) para que `astro:assets` optimice.
- El cuerpo de cada etapa va en el frontmatter como `paragraphs: string[]` (texto plano; los enlaces se escriben `[texto](url)` y una función pequeña en `src/lib/inline-links.ts` los convierte en `<a>` escapando el resto del texto). El cuerpo Markdown del `.md` queda vacío. La etapa 6 admite además `links: {label, href}[]` opcional, que se pinta como lista en mono debajo del último párrafo.
- Fotos en `src/assets/about/*.jpg`, 4:5. Mientras el usuario no las entregue, el implementador crea placeholders de 800x1000 generados con `sharp` (ya es dependencia de Astro) en gris `#1c2029` con el nombre del fichero: `desk-2026.jpg`, `ies-2018.jpg`, `z1-2020.jpg`, `therapyside-2022.jpg`, `soltel-2025.jpg`, `linux.jpg`, `cats.jpg`, `guitar.jpg`, `chess.jpg`, `boxing.jpg`. Se generan con un script `scripts/about-placeholders.mjs` que se borra cuando lleguen las fotos reales.
- Copy: partir de los textos reales actuales de `src/content/about/es.md` y `en.md` (trayectoria y "quién soy"), repartidos en las etapas. Las anécdotas de la maqueta NO se incluyen. Donde falte un dato (distro, año Linux, servicios autoalojados, refugio, por qué vegano, Lichess) se escribe `[DATO]` literal en el YAML. Mientras haya `[DATO]`, el frontmatter lleva `mock: true` y se reutiliza el gate existente (`warnMock`): la página muestra cabecera y polaroid pero oculta las etapas, como hoy. El usuario quita `mock` al rellenar.
- Traducciones nuevas en `src/i18n/translations.ts`: `about.facts.year`, `about.facts.place`, `about.facts.os`, `about.facts.stack` (es: año/lugar/sistema/stack; en: year/place/os/stack), (es: año/lugar/sistema/stack; en: year/place/os/stack). La lista de pruebas de la etapa 6 no lleva título.
- JSON-LD `personJsonLd` se mantiene.

## Tests (vitest, Container API como en tests/about.test.ts y tests/cv.test.ts)

- `aboutSchema` acepta una etapa con foto y sin foto; rechaza `stages: []`.
- Render de `AboutPage` en es: contiene un `[data-stage]` por etapa, el `<img>` de la polaroid con `alt` de la primera etapa con foto, y el pie de esa etapa.
- Con `mock: true` no se renderizan las etapas pero sí la polaroid.
- Los `paragraphs` con `[texto](url)` producen `<a href="url">texto</a>` y escapan `<`.

## Fuera de alcance

Home, /cv, otras páginas. Las fotos reales y los datos los entrega el usuario después; la estructura debe permitir ponerlos sin tocar código.
