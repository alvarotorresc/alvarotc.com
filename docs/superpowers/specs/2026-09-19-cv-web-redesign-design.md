# alvarotc.com como CV en la web: diseño técnico

Fecha: 2026-09-19
Estado: aprobada por Álvaro el 2026-09-19
Maquetas aprobadas: https://claude.ai/artifact/EYTiKDiSKdrHf44jcyEnTP (artboards `Home`, `Post`, `Project`, `About`, `CV`, `Stats`)
Investigación previa: `reports/Webs personales de desarrolladores CV.md`

## 1. Objetivo

Convertir alvarotc.com, hoy una pantalla con cuatro posts y cuatro enlaces a GitHub, en un CV navegable
para empresas: quién es Álvaro, qué ha hecho, qué construye, qué escribe y cómo contactarle. Con tres
señales de identidad muy visibles: software libre, privacidad por defecto y Linux.

Referencia principal: shivypatel.com (claridad, una página, pocas animaciones bien hechas). Piezas
concretas tomadas de braydoncoyer.dev (tarjetas "Now", página de stats, about con carril central) y de
educalvolopez.com (paleta de comandos con búsqueda).

## 1b. Versiones (decidido el 2026-09-19)

Se sube a **Astro 7** antes de construir nada: Astro 7.3 (Node 22.12+, Vite 8), `@astrojs/react` 6,
`@astrojs/sitemap` 3, `@astrojs/rss` 4, Vitest 5 con `getViteConfig`, y **Tailwind 4** mediante
`@tailwindcss/vite` (los tokens se declaran en CSS con `@theme`; desaparecen `@astrojs/tailwind` y
`tailwind.config.ts`). Zod 4: `z.url()` en lugar de `z.string().url()`. El compilador de Astro 7 exige
HTML bien cerrado; el Markdown se procesa con el motor nativo (Sätteri), suficiente porque los posts no
usan plugins remark/rehype. React se mantiene en 18.

## 2. Alcance

Entra:

- Home nueva de una sola página larga con nueve secciones.
- Rutas nuevas: `/about`, `/cv`, `/stats`, `/projects/[slug]`, `/blog/[slug].md`, `/llms.txt`,
  `/llms-full.txt`. Servicio de contacto externo a la web, en el VPS.
- Colecciones de contenido nuevas: `experience`, `now`, `interests`. Proyectos unificados en una sola
  colección bilingüe.
- Datos en build: GitHub, ListenBrainz, Umami, Lighthouse.
- Tema claro y oscuro con toggle.
- Paleta de comandos con búsqueda.
- Formulario de contacto con envío real a través de un servicio propio en el VPS (repo aparte).
- Espejo completo en `/es`.

No entra:

- Comentarios, newsletter, reacciones.
- Generación de PDF en servidor (el CV se imprime desde el navegador).
- Reescritura de los posts existentes.
- Cambio de hosting o de framework.

## 3. Decisiones cerradas

| Tema                   | Decisión                                                                                                                                                         |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Estructura             | Home larga más rutas secundarias (opción 2 de tres)                                                                                                              |
| Idioma                 | Inglés en la raíz, español en `/es`, como ahora                                                                                                                  |
| Visual                 | Minimal claro y oscuro con toggle, un acento, sans limpia, pocas animaciones                                                                                     |
| Identidad              | FOSS, privacidad y Linux explícitos: etiquetas en About, tarjeta "Daily driver" con Tux, pie con "no cookies, no trackers", licencias visibles                   |
| Now                    | Reading, Daily driver, Listening (ListenBrainz, nunca Spotify), Building                                                                                         |
| Proyectos primera fila | Bito, Quedamos, Huellas                                                                                                                                          |
| Contacto               | Tarjeta (disponibilidad, email con copiar, tiempo de respuesta, reservar llamada en Cal.com) más formulario estilo terminal; envío por servicio propio en el VPS |
| Gustos                 | Sección "Off the clock" antes de Contact: guitarra eléctrica, ajedrez en Lichess, boxeo                                                                          |
| Datos de experiencia   | Aún inventados; se sustituyen cuando Álvaro los pase en bruto                                                                                                    |

## 4. Rutas

| Ruta                                               | Render   | Contenido                                                  |
| -------------------------------------------------- | -------- | ---------------------------------------------------------- |
| `/`                                                | estático | Home completa                                              |
| `/about`                                           | estático | Historia en carril central, "What I care about"            |
| `/cv`                                              | estático | Hoja A4 imprimible con `@media print`, botón de imprimir   |
| `/stats`                                           | estático | Métricas de código, escritura y web                        |
| `/projects`                                        | estático | Todos los proyectos visibles, primera fila destacada       |
| `/projects/[slug]`                                 | estático | Ficha de proyecto con galería, "Try it", stack, changelog  |
| `/blog`                                            | estático | Lista completa con filtro por etiqueta                     |
| `/blog/[slug]`                                     | estático | Post, como ahora con nuevo layout                          |
| `/blog/[slug].md`                                  | estático | Markdown fuente del post, `Content-Type: text/markdown`    |
| `/llms.txt`                                        | estático | Índice para LLMs: quién, rutas, lista de posts y proyectos |
| `/llms-full.txt`                                   | estático | Todos los posts concatenados en Markdown                   |
| `/rss.xml`, `/sitemap-index.xml`, `/og/[slug].png` | estático | Ya existen, se mantienen                                   |
| `/es/...`                                          | estático | Espejo de todas las rutas estáticas anteriores             |

La web es cien por cien estática, sin adaptador. El único endpoint dinámico, el de contacto, vive en
el VPS (sección 12) y la web lo llama por `fetch` desde la isla del formulario.

## 5. Home, sección a sección

Orden aprobado en la maqueta:

1. **Nav.** Logo, About, Projects, Experience, Writing, Stats, CV, botón Search con atajo ⌘K, cambio
   de idioma, toggle de tema. En móvil, las entradas se pliegan en un menú.
2. **Hero.** Avatar, nombre en h1, frase de posicionamiento que menciona software libre, botones "Get in
   touch" (ancla a Contact) y "Download CV" (enlace a `/cv`).
3. **About.** Dos párrafos, cuatro etiquetas (Free software, Privacy by default, Offline-first,
   Self-hosted), enlace a `/about`. Debajo, las cuatro tarjetas Now.
4. **Projects.** Bento: Bito en tarjeta grande con imagen 16:9, Quedamos en tarjeta media, Huellas en
   banda. Línea "Also: ..." con el resto y enlace a `/projects`.
5. **Experience.** Timeline vertical con línea de progreso, puntos y entradas fechadas. Enlace a `/cv`.
6. **Writing.** Último post en tarjeta grande con imagen OG, tres siguientes en lista.
7. **Stack and stats.** Stack en cuatro grupos y tres contadores con enlace a `/stats`.
8. **Off the clock.** Tres tarjetas con icono: guitarra, ajedrez, boxeo.
9. **Contact.** Tarjeta de contacto y formulario terminal.
10. **Pie.** Nota de privacidad, enlaces a Español, RSS, llms.txt y código fuente.

## 6. Modelo de contenido

Todo en `src/content/`, con el content layer de Astro (`glob` y `file` loaders) y esquemas Zod 4 en
`src/content.config.ts`. Los textos bilingües se guardan como `{ en, es }` en los datos, y como
ficheros separados por idioma en Markdown.

### 6.1 `posts` y `posts-en`

Sin cambios de esquema. Se mantiene el hook pre-commit que traduce con DeepL. Se añade `updated`
opcional para el JSON-LD.

Migración al content layer: las colecciones pasan de `src/content/config.ts` (API legacy, `type:
'content'`) a `src/content.config.ts` con `glob()`. Cambian `post.slug` por `post.id` y
`post.render()` por `render(post)` en las páginas de blog, RSS y OG. Se hace en la fase 2 y se cubre
con el test de build.

### 6.2 `projects`

Sustituye a `src/data/projects.ts` y a la colección Markdown que no se usaba. Un fichero por idioma
y proyecto: `src/content/projects/en/bito.md` y `src/content/projects/es/bito.md`, mismo slug.

```ts
{
  name: string
  tagline: string
  status: 'published' | 'beta' | 'development' | 'design' | 'archived'
  tier: 'featured' | 'lab'          // featured = primera fila
  order: number
  visible: boolean
  repo?: string
  url?: string
  license?: string                 // 'GPL-3.0', 'AGPL-3.0'
  stack: string[]
  platform?: string
  icon?: string                    // ruta en /public/projects/<slug>/
  hero?: string                    // imagen o vídeo 16:9
  gallery?: string[]
  playground?: { kind: 'pwa' | 'iframe' | 'video'; src: string }
  changelog?: { version: string; date?: string; note: string }[]
  githubRepo?: string              // 'alvarotorresc/bito', para stats en build
}
```

El cuerpo Markdown es la ficha larga ("Why it exists", "How it is built"). Huellas entra con
`status: 'design'`.

### 6.3 `experience`

`src/content/experience/*.yaml`, un fichero por puesto o titulación.

```ts
{
  kind: 'work' | 'education' | 'certification'
  company: string
  role: { en: string; es: string }
  location?: string
  start: string                    // 'YYYY-MM'
  end?: string                     // ausente = actual
  summary: { en: string; es: string }
  highlights?: { en: string[]; es: string[] }
  stack?: string[]
  url?: string
}
```

Alimenta la timeline de la home, la página `/cv` y el JSON-LD de Person. Hasta que lleguen los
datos reales, los ficheros llevan `mock: true` y la build avisa por consola si queda alguno.

### 6.4 `now`

`src/content/now.yaml`, editado a mano:

```yaml
reading: { title, author, progress, cover } # progress 0..100
dailyDriver: { distro, kernel, selfHosted: [] }
building: { project: slug } # el último commit se resuelve en build
```

`listening` no va aquí: se obtiene en build desde ListenBrainz.

### 6.5 `interests`

`src/content/interests.yaml`: lista de tres o más `{ icon, title: {en, es}, text: {en, es} }`.

## 7. Datos generados en build

Script `scripts/fetch-data.ts` ejecutado en `prebuild`. Escribe JSON en `src/data/generated/`
(gitignorado) con fallback a los últimos valores conocidos en `src/data/fallback/` (versionados)
para que la build nunca falle por una API caída.

| Fuente              | Qué                                                                                                                                        | Auth            | Uso                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------- | -------------------- |
| GitHub GraphQL      | contribuciones 12 meses, commits del año, repos públicos, stars, racha, último commit del proyecto activo, stars y última release por repo | `GITHUB_TOKEN`  | Now, Projects, Stats |
| ListenBrainz API    | último listen del usuario                                                                                                                  | ninguna         | Now                  |
| Umami API           | vistas 30 días, posts más leídos                                                                                                           | `UMAMI_API_KEY` | Stats                |
| Lighthouse CI       | puntuaciones móvil y escritorio del último run                                                                                             | artefacto de CI | Stats                |
| Colecciones locales | recuento de posts, palabras, etiquetas                                                                                                     | ninguna         | Stats, llms.txt      |

Refresco: un workflow `refresh.yml` con `schedule` diario que llama al deploy hook de Vercel. Cada
build ejecuta el script. Nada se calcula en el navegador.

## 8. Componentes

Regla: Astro estático por defecto. Isla React solo cuando hay estado en cliente.

| Componente                                     | Tipo                      | Notas                                                                                                                                             |
| ---------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Nav.astro`                                    | estático + script vanilla | menú móvil y toggle de tema sin React                                                                                                             |
| `ThemeToggle.astro`                            | script inline en `<head>` | lee `localStorage` y `prefers-color-scheme` antes del primer paint para evitar flash                                                              |
| `Hero.astro`                                   | estático                  | entrada escalonada con CSS `animation-delay`                                                                                                      |
| `NowCards.astro`                               | estático                  | datos de `now.yaml` y JSON generado                                                                                                               |
| `ProjectBento.astro`                           | estático                  |                                                                                                                                                   |
| `Timeline.tsx`                                 | isla, `client:visible`    | Framer Motion: `whileInView` por entrada y `useScroll` para la barra de progreso. Con `prefers-reduced-motion` renderiza estático                 |
| `CommandPalette.tsx`                           | isla, `client:idle`       | ⌘K y Ctrl+K. Índice `search.json` generado en build (posts, proyectos, secciones). Búsqueda por subcadena con puntuación simple, sin dependencias |
| `ContactTerminal.tsx`                          | isla, `client:visible`    | estado del formulario, envío por `fetch` a `https://contact.alvarotc.com` (VPS), estados enviando, enviado y error                                |
| `CopyEmail.astro`                              | script vanilla            | `navigator.clipboard`                                                                                                                             |
| `PlaygroundFrame.astro`                        | script vanilla            | carga el iframe solo al pulsar "Load the playground"                                                                                              |
| `CvSheet.astro`                                | estático                  | usado por `/cv` y `/es/cv`, con `@media print`                                                                                                    |
| `StatsGrid.astro`, `ContributionHeatmap.astro` | estático                  | heatmap como SVG inline generado en build                                                                                                         |

Framer Motion ya está en `package.json`. Se usa solo en `Timeline.tsx`. `vite.ssr.noExternal` ya
lo cubre.

## 9. Sistema visual

Tokens en `src/styles/global.css` como custom properties, expuestos a Tailwind 4 en un bloque
`@theme` y con una variante `dark` definida con `@custom-variant` sobre `[data-theme='dark']`.

| Token          | Claro     | Oscuro    |
| -------------- | --------- | --------- |
| `--bg`         | `#f7f8fa` | `#0f1115` |
| `--surface`    | `#ffffff` | `#161920` |
| `--surface-2`  | `#eef0f4` | `#1c2029` |
| `--border`     | `#dfe2e8` | `#22262e` |
| `--text`       | `#16181d` | `#e7e9ee` |
| `--text-muted` | `#4b5160` | `#9aa3b2` |
| `--text-faint` | `#6b7280` | `#6b7382` |
| `--accent`     | `#2f6fe4` | `#4f8ef7` |
| `--accent-fg`  | `#ffffff` | `#0b1020` |
| `--ok`         | `#1a7f4b` | `#5fd08a` |

Tipografía: Manrope (400, 500, 600, 700, 800) y JetBrains Mono (400, 500), autoalojadas en
`public/fonts/` con `font-display: swap`. Se retira el enlace a Google Fonts. Se retiran la fuente
monoespaciada global y el acento rojo actuales.

Radios: 8 px en controles, 12 px en tarjetas pequeñas, 16 px en tarjetas grandes. Sin sombras
difusas ni glow. Sin degradados salvo la barra de progreso.

Animación: entrada del hero con CSS, timeline con Motion, transición entre páginas con el
`ClientRouter` que ya existe. Todo respeta `prefers-reduced-motion`.

Iconos: `@tabler/icons-react` en islas y SVG inline copiado de Tabler en componentes Astro. Tux: el
logo oficial de Linux (Larry Ewing, licencia libre) como SVG en `public/`.

## 10. Internacionalización

- Inglés en la raíz, español en `/es`, detección por prefijo como ahora en `BaseLayout`.
- Cadenas de interfaz en `src/i18n/translations.ts`, ampliadas.
- Contenido: posts por colección, proyectos por carpeta, experiencia y now con campos `{ en, es }`.
- Cada página de `/es` es un fichero espejo que importa el mismo componente con `lang="es"`.
- `hreflang` y `alternate` ya existen; se comprueba en las rutas nuevas.

## 11. SEO y LLMs

- HTML completo sin JavaScript para todo el contenido. Las islas solo añaden interacción.
- JSON-LD: `Person` en la home y en `/about` (con `sameAs` a GitHub, LinkedIn, X), `BlogPosting`
  en posts (ya existe, se añade `dateModified` y `keywords`), `SoftwareApplication` en proyectos.
- `/llms.txt` con el formato de llmstxt.org: título, resumen, secciones con enlaces a cada post y
  proyecto. `/llms-full.txt` con los posts en Markdown.
- `/blog/[slug].md` sirve el Markdown fuente. Cada post enlaza a su versión Markdown.
- Sitemap, RSS, OG y canonical se mantienen. RSS pasa a incluir también los posts en inglés en un
  feed separado `/rss-en.xml`, o el feed actual se hace bilingüe. Decisión: dos feeds.
- `robots.txt` permite todo. Umami ya es sin cookies.

## 12. Contacto

Principio: ningún tercero lee el mensaje. La web es estática; el contacto es un servicio propio.

- **Dirección.** `hello@alvarotc.com` se crea en Cloudflare Email Routing (el dominio ya está en
  Cloudflare) reenviando al buzón de Proton de Álvaro. Cloudflare reenvía, no almacena buzón.
- **Servicio.** Repo aparte `alvarotc-contact`: servicio Node mínimo (Hono o Fastify) en un
  contenedor Docker en el VPS de Hetzner, detrás de Caddy en `contact.alvarotc.com`, junto a la API de
  Quedamos y Umami. Un solo endpoint `POST /send`. CORS limitado a `https://alvarotc.com`.
- **Contrato.** JSON `{ from, subject, body, website, t }`. `website` es el honeypot y debe llegar
  vacío. `t` es el timestamp de apertura del formulario; se descartan envíos en menos de tres
  segundos. Validación: email con formato, subject de 3 a 120 caracteres, body de 10 a 4000.
  Respuesta `{ ok: true }` o `{ ok: false, error }`. Límite de 5 envíos por IP y hora en memoria.
- **Entrega.** Proton Mail Bridge en un contenedor del mismo VPS (imagen comunitaria, plan Proton de
  pago, inicio de sesión con 2FA una sola vez, volumen persistente para la sesión). El servicio envía
  con nodemailer por SMTP a Bridge en `localhost:1025` dentro de la red Docker; Bridge entrega por la
  API de Proton desde la cuenta de Álvaro hacia su propio buzón, con `reply-to` al remitente. Sin
  terceros en el camino. Cada correo lleva el asunto con prefijo `[contact form]` y la cabecera
  `X-Contact-Source: alvarotc.com`, para los filtros y etiquetas de Proton. Comprobado el 2026-09-19: Hetzner bloquea el puerto 25 de salida en este VPS,
  así que la entrega directa a los MX queda descartada salvo que se abra por ticket.
- **Salud.** El servicio expone `GET /health` que comprueba que Bridge responde; Upptime lo vigila
  como al resto de servicios del VPS.
- Sin base de datos, sin cookies, sin logs del cuerpo del mensaje (solo fecha, resultado y hash de IP
  para el límite).
- Botón "Book a 20 min call" en la tarjeta de contacto, enlace a la página pública de Cal.com de
  Álvaro, sin embed. Cal.com es software libre; se puede autoalojar en el VPS más adelante sin tocar
  la web.

## 13. Accesibilidad y móvil

- Contraste AA en ambos temas; los pares se comprueban en un test unitario sobre los tokens.
- Todos los controles son elementos nativos (`button`, `a`, `input`, `label`).
- Paleta de comandos con foco atrapado, `Escape` cierra, navegación con flechas.
- Móvil: nav en menú, bento en una columna, timeline con fechas encima, `/cv` con la hoja a ancho
  completo, formulario terminal en una columna.

## 14. Limpieza

- Borrar `src/data/projects.ts` y `src/content/projects/*.md` antiguos.
- Borrar `src/components/ProjectCard.astro` actual y `LanguageToggle.astro` si el nav los sustituye.
- Retirar Google Fonts de `BaseLayout`.
- Actualizar `site.config.ts` (nav) y `src/i18n/translations.ts`.
- Reescribir `CLAUDE.md` al final para que describa lo que existe.

## 15. Tests y verificación

- Vitest: esquemas de contenido con fixtures, `fetch-data.ts` con respuestas grabadas y fallback,
  generador de `search.json`, contraste de tokens, y el
  `tests/build.test.ts` existente ampliado a las rutas nuevas (existencia de `/cv`, `/stats`,
  `/llms.txt`, `/blog/<slug>.md`, `/es/cv`).
- CI: lint, `astro check`, build y test como ahora, más Lighthouse CI en `main` con umbrales
  (performance 95, accesibilidad 100). Su salida alimenta `/stats`.
- Manual antes de cerrar: ambos temas, ambos idiomas, impresión de `/cv` a PDF, envío real de
  contacto, `prefers-reduced-motion`.

## 16. Datos pendientes de Álvaro

- Experiencia y formación reales (empresa, puesto, fechas, lugar, dos o tres frases, stack).
- Libro actual, distro y servicios autoalojados, usuario de ListenBrainz.
- Texto largo de `/about` (etapas) o notas en bruto para redactarlo.
- Gustos: años tocando, rating de Lichess, sesiones de boxeo, o dejar sin cifras.
- Imágenes: foto o avatar, icono y capturas de Bito y Quedamos, vídeo promo de Bito, concepto de
  Huellas.
- `GITHUB_TOKEN` y `UMAMI_API_KEY` en Vercel. Para el servicio de contacto: sesión de Proton Bridge
  iniciada en el VPS, la regla de Email Routing en Cloudflare para `hello@alvarotc.com`, y el enlace
  público de Cal.com.

## 17. Fases de implementación (para el plan)

1. Base: tokens, fuentes, tema, nav, pie, `BaseLayout` nuevo. Home vacía con las secciones.
2. Contenido: colecciones `projects`, `experience`, `now`, `interests`, migración de datos, borrado
   de lo antiguo.
3. Home estática: hero, about, now, bento, writing, stack, off the clock, contacto sin envío.
4. Islas: timeline, paleta de comandos, formulario con API.
5. Páginas: `/projects/[slug]`, `/about`, `/cv`, `/stats`, `/blog` nuevo layout.
6. Datos en build: `fetch-data.ts`, fallbacks, workflow de refresco, Lighthouse CI.
7. SEO y LLMs: JSON-LD, `llms.txt`, Markdown por post, feeds.
8. Espejo `/es` y traducciones.
9. Limpieza, CLAUDE.md, verificación manual y lanzamiento.
