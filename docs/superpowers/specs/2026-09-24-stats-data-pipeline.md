# Spec: datos reales para `/stats` y la home

Fecha: 2026-09-24. Rama `redesign/cv-web`. Decisiones del usuario del 24 sep.

## Qué se construye

La página `/stats` (y `/es/stats`) ya sigue la maqueta aprobada (`Stats` en el lienzo de Claude Design; `src/components/stats/StatsPage.astro`) pero `src/data/fallback/stats.json` tiene `github`, `umami` y `lighthouse` a `null`, así que solo enseña los datos locales de artículos. Esta spec construye la tubería que genera `src/data/generated/stats.json` con datos reales, un refresco diario, Lighthouse CI con umbral, y la integración real de Umami. Sin nada en el navegador: todo en build o en CI.

## Fuentes y campos (contrato `StatsData` de `src/lib/stats.ts`, ya definido)

| Fuente                                                      | Campos                                                                                                                                                                                                                                                                                                                                                                            | Credencial                                                                         | Cuándo                     |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | -------------------------- |
| GitHub GraphQL (`viewer`/`user(login)` de `site.config.ts`) | `contributions` (calendario 12 meses, `{date,count}`), `commitsThisYear`, `publicRepos`, `stars` (suma de stargazers de repos públicos), `streak` (días consecutivos con contribución hasta hoy), `mostActiveRepo` (repo público con más commits en 30 días, por `defaultBranchRef.target.history(since)`), `languages` (porcentaje por bytes en repos públicos, top 4 + "other") | `GITHUB_TOKEN` (el de Actions vale para datos públicos; en local, `gh auth token`) | build en CI y cron diario  |
| Umami API v2 (`https://analytics.alvarotc.com`)             | `views30d` (pageviews 30 días del website), `mostRead` (top 3 rutas `/blog/*` o `/es/blog/*` con título resuelto desde la colección de posts)                                                                                                                                                                                                                                     | `UMAMI_API_KEY` (cabecera `x-umami-api-key`) + `UMAMI_WEBSITE_ID`                  | idem                       |
| Lighthouse CI                                               | `performanceMobile`, `performanceDesktop` de la home construida                                                                                                                                                                                                                                                                                                                   | ninguna                                                                            | job de CI en push a `main` |
| Colecciones locales                                         | posts, palabras, temas (ya existe `writingStats`)                                                                                                                                                                                                                                                                                                                                 | ninguna                                                                            | build                      |

`generatedAt`: ISO de cuándo se generó el JSON. Si una fuente falla o no hay credencial, ese bloque queda `null` y la página oculta su sección (ya lo hace), sin romper el build. El script escribe el JSON aunque solo tenga una fuente.

## Script `scripts/fetch-data.mjs` (Node 20, sin dependencias; `fetch` nativo)

- `node scripts/fetch-data.mjs` → escribe `src/data/generated/stats.json` (carpeta ignorada por git). Lee `GITHUB_TOKEN`, `UMAMI_API_KEY`, `UMAMI_WEBSITE_ID`, `UMAMI_URL` (por defecto `https://analytics.alvarotc.com`) del entorno. Registra por consola qué fuente se pudo y cuál no. Sale con 0 aunque falten fuentes; sale con 1 solo si no puede escribir el fichero.
- Lighthouse no lo hace este script: el job de CI escribe `lighthouse` en el mismo JSON después de correr (`node scripts/merge-lighthouse.mjs <manifest.json>`), o el script lo lee del artefacto si existe.
- Tests unitarios con las funciones puras (parseo de la respuesta GraphQL a `contributions`/`streak`/`languages`, parseo de Umami a `views30d`/`mostRead`, merge con nulls) con fixtures JSON en `tests/fixtures/`; sin red en tests.

## Workflows

- `.github/workflows/ci.yml`: añade un job `lighthouse` tras `build` en push a `main` (y en PR, sin bloquear): `@lhci/cli` con `autorun` sobre `dist/` (`staticDistDir`), URLs `/` y `/es/`, `preset: desktop` y móvil por separado, aserciones **performance ≥ 0.95 y accessibility = 1.0, que FALLAN el job si no se cumplen** (decisión del usuario: "si no está en 95 debe fallar"). Configuración en `lighthouserc.cjs`. Las puntuaciones se guardan en el artefacto y se mezclan en `stats.json` antes del deploy.
- `.github/workflows/refresh-stats.yml`: cron diario (`0 5 * * *`) + `workflow_dispatch`: ejecuta `fetch-data.mjs` con `secrets.GITHUB_TOKEN`, `UMAMI_API_KEY`, `UMAMI_WEBSITE_ID`, y dispara el deploy de Vercel con un **deploy hook** (`secrets.VERCEL_DEPLOY_HOOK`) pasando el JSON… Como Vercel construye desde el repo, el JSON no llega: decisión → el workflow **commitea `src/data/generated/stats.json`** en `main` con un usuario bot (`chore(stats): refresh data`) solo si cambió, y ese push dispara el deploy normal de Vercel. Por tanto `src/data/generated/` deja de estar ignorado y el build de Vercel lo lee tal cual. El build local y el de PR siguen usando el fallback si el generado no existe.
- El usuario configura en GitHub: `UMAMI_API_KEY`, `UMAMI_WEBSITE_ID` (cuando dé de alta la web en Umami) y permisos de escritura del workflow (`permissions: contents: write`). `GITHUB_TOKEN` es automático.

## Umami en la web

- Tracking: `BaseLayout.astro` inyecta `<script defer src="https://analytics.alvarotc.com/script.js" data-website-id={id}>` solo si `PUBLIC_UMAMI_WEBSITE_ID` existe en el entorno de build; sin él, nada. Sin cookies (Umami no las usa): la frase del pie se mantiene solo cuando el script está presente; si no, el pie dice "Sin cookies ni rastreadores. Código bajo AGPL."
- `.env.example` documenta las cuatro variables.

## Cambios en la página

- Quitar de la maqueta y de la página (si estuvieran) las tarjetas "RSS subscribers, estimated", "deploys since the redesign" y "pull requests to other projects". Añadir "JavaScript en la home" solo si es trivial medir en build el peso de los `<script>` de `dist/index.html`; si no, fuera.
- La sección "De dónde salen los números" solo se muestra cuando `generatedAt` no es null (deuda del plan B), y su texto describe lo que de verdad ocurre (Action diaria + Lighthouse en CI).
- Home: `StackStats.astro` (contadores commits / posts / apps) lee `commitsThisYear` de `stats.json` cuando existe; si no, oculta ese contador en vez de inventar.
- Bilingüe: todas las etiquetas nuevas en es y en.

## Fuera de alcance

ListenBrainz (el usuario no lo usa), estrellas por proyecto en las fichas (se puede añadir después leyendo el mismo JSON), Umami para las otras webs.
