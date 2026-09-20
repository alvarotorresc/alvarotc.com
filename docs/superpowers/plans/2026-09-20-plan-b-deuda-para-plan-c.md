# Deuda diferida del plan B (para el plan C)

Plan B cerrado el 2026-09-20 en `redesign/cv-web` (06c5724). Revisión final: 0 críticos, 5 importantes (arreglados en 06c5724), 19 menores diferidos. Todo lo de abajo es candidato al plan C o a la oleada que salga de la revisión manual del usuario.

## Del plan C por diseño (spec §4 y §11)

- `/rss-en.xml` y, mientras tanto, la tarjeta de suscripción solo se pinta en español. El pie sigue enlazando `/rss.xml` (solo español) desde todas las páginas.
- `/llms.txt`, `/llms-full.txt` y `/blog/[slug].md`.
- Datos reales en build (GitHub, ListenBrainz, Umami, Lighthouse) con fallbacks; hasta entonces `stats.sourcesText` afirma infraestructura que no existe: gatear esa sección con `stats.generatedAt`.
- Rama `stats.github`/`lighthouse` de `StatsPage.astro` nunca renderizada aún: construir con datos no nulos y comprobar que `{num(...)} {t('stats.commits30d')}` conserva el espacio.

## Menores de la revisión final

1. `.terminal-input` borde `#22262e` sobre `#0b0d11` es 1.28:1 (WCAG 1.4.11 pide 3:1); aclarar bordes de los controles del terminal.
2. La paleta no vacía la consulta al cerrar (`setQuery('')`).
3. Las 6 entradas `page` de `search.json` comparten el mismo `text` (`getDescription`) y desplazan a los posts; darles texto propio.
4. Toggle de tema sin `aria-pressed` ni etiqueta que indique el estado.
5. Nav sin `aria-current` y `<nav>` de cabecera sin `aria-label` (los posts añaden dos `<nav>` más).
6. Botón ⌘K sin `aria-keyshortcuts` ni `aria-haspopup="dialog"`; el `<kbd>⌘K</kbd>` se muestra también a usuarios de Ctrl+K.
7. Títulos de post en `/blog` son `<span>`, no encabezados.
8. Filtro de tags: el contador "N posts" se queda obsoleto y no hay `aria-live`.
9. Dominio hardcodeado en `src/lib/jsonld.ts` (usar `getDomain()`; la variante EN sin barra final) y dos veces en `CvSheet.astro`.
10. Ternario `status → tone` repetido en `ProjectBento`, `ProjectCard` y `ProjectPage` (extraer `statusTone`); `rel="noopener"` en 4 anclas internas de `ProjectBento`.
11. `manifest.json` solo con icono SVG (faltan PNG 192/512); `favicon.svg` usa `font-family` Manrope que no puede cargar.
12. `tests/cv.test.ts` asserta el texto fuente de `CvSheet.astro` y `global.css` en vez de renderizar.
13. `writingStats` castea `posts as unknown as PostEntry[]`; ensanchar el parámetro de `tagCounts`.
14. Convención de barra final mixta (nav `/about`, alternates `/es/about/`, search.json `/about`) y sin `trailingSlash` en `astro.config.mjs` ni `vercel.json`: decidir política.
15. `@page` sin `size: A4`.
16. `PostNav` `aria-label` siempre "Previous / Next" aunque solo haya una tarjeta.
17. `reports/` y `research_notes/` sin trackear ni ignorar.
18. `/es/404/` canónica autorreferente (no existe `/404/`); `BaseLayout` no tiene prop `noindex`. Vercel solo sirve `404.html` (inglés) como página de error.
19. Heatmap: `<title>{count}</title>` sin fecha ni unidad y sin leyenda; bajo `svg role="img"` los títulos por celda no llegan a AT.

## Menores de las revisiones por tarea (aceptados como Defer por la revisión final)

- `blog/[slug]` `hasTranslation = Boolean(post.data.source)` no comprueba que exista el post ES.
- `Tag.astro` `href` sin uso.
- `ProjectPage` `lastRelease` asume changelog ordenado de nuevo a viejo; sin test de contenedor.
- `AboutPage` h1 largo vs `<title>` corto (revisar en la revisión manual).
- `loadStats` sin mensaje claro si el JSON está mal.
- Timeline: `<ol key>` remonta tras hidratar (posible parpadeo) y el raíl decorativo queda en `scaleY(0)` sin JS.
- Paleta: sin reintento si falla la carga de `search.json`.
- Formulario: sin guardia cliente de 3000 ms; el éxito confía en `response.ok` sin leer `body.ok`.
- `hero.cv` dice "Download CV" pero enlaza la página `/cv` imprimible.
- Chequeo de enlaces muertos manual, no un test; `build.test.ts` solo comprueba la lista de rutas del brief.
- `og.ts` lanza ENOENT crudo si falta la fuente.

## Fuera del rango, con ticket

- `.github/workflows/ci.yml` fija Node 20 mientras `package.json` exige >= 22.12.
- `hreflang` sin entrada autorreferente en cada página.
- Servicio de contacto: 4 minors aparcados en `alvarotc-contact` (log en `app.onError`, README paso 3 copia `.env.example`, `closeIdleConnections`, `32KiB` en Caddy).
