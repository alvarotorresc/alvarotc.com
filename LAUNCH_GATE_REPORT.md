# Launch Gate — alvarotc.com

Fecha: 2026-09-24 · Alcance: L · Commit: d2ac4e2 (redesign/cv-web) · Producción: https://alvarotc.com (Vercel redirige hoy a https://www.alvarotc.com) · Staging: no hay (previews de Vercel por commit, ejemplo `alvarotc-psxqqdu5q-alvarotorrescs-projects.vercel.app`)

## Veredicto: NO LISTO

Quedan 23 bloqueantes pendientes. Los cuatro que más pesan: el endpoint del formulario de contacto no existe en DNS, el host canónico está invertido (todo apunta al apex y Vercel redirige al www), no hay cabeceras de seguridad y faltan aviso legal, política de privacidad y licencia coherente.

Nota de método: producción sirve todavía la web anterior (main 92e9da3, 7 sep). Las comprobaciones de página se han hecho sobre el build local de esta rama (`astro preview`, 80 páginas); las de dominio, TLS, cabeceras y plataforma sobre producción real, porque no cambian con el merge.

## Contexto

- Stack: Astro 7 (SSG) + React 18 islands + Tailwind 4; contenido en Content Collections; OG dinámicas con Satori; tests con Vitest (47 ficheros, 539 tests); lint ESLint + Prettier; TypeScript strict (`astro/tsconfigs/strict`).
- Infraestructura: Vercel (deploy automático desde GitHub `alvarotorresc/alvarotc.com`, repo público); dominio y DNS en Cloudflare; correo entrante con Cloudflare Email Routing; analítica Umami autoalojada en `analytics.alvarotc.com` (VPS 178.104.74.7); estado en `status.alvarotc.com` (Upptime, GitHub Pages); formulario de contacto previsto en `contact.alvarotc.com` (VPS Hetzner, según spec) que hoy no resuelve. CI: `.github/workflows/ci.yml` (lint, check, build, test, Lighthouse CI) y `refresh-stats.yml` (cron diario).
- Condiciones activas: cobra no · subidas no · OAuth no · idiomas sí (en/es) · notificaciones no · formulario público sí (contacto).
- Accesos disponibles durante la auditoría: SSH no · navegador sí (Playwright, Chromium) · `gh` autenticado sí · paneles Vercel/Cloudflare no.
- Evidencias guardadas en `launch-gate/`: `lh-*.json` (Lighthouse), `links.csv` (linkinator), `gitleaks.log`, `console.log`, capturas 375 px y 640 px.

## Resumen

| Sección               | B hechos/total                        | R hechos/total                       | NA    | HUMAN  |
| --------------------- | ------------------------------------- | ------------------------------------ | ----- | ------ |
| LEG Legal             | 2/5                                   | 0/2                                  | 1     | 1      |
| DNS Dominio y TLS     | 2/5                                   | 2/4                                  | 0     | 1      |
| PAG Páginas y enlaces | 1/7                                   | 1/2                                  | 1     | 1      |
| SEO                   | 0/3                                   | 2/3                                  | 0     | 1      |
| SEC Seguridad         | 2/4                                   | 1/2                                  | 0     | 0      |
| ABU Abuso             | 0/2                                   | 2/2                                  | 0     | 1      |
| DAT Datos             | 2/2                                   | –                                    | 0     | 0      |
| PERF Rendimiento      | 2/3                                   | 2/3                                  | 0     | 0      |
| UX Experiencia        | 0/5                                   | 2/2                                  | 1     | 2      |
| A11Y Accesibilidad    | 4/4                                   | 2/4                                  | 1     | 1      |
| INF Infraestructura   | 1/4                                   | 0/1                                  | 0     | 3      |
| OBS Observabilidad    | 1/1                                   | 1/2                                  | 0     | 0      |
| QA Calidad            | 1/3                                   | 0/2                                  | 0     | 2      |
| OPS Operativa         | 0/4                                   | 0/3                                  | 1     | 3      |
| **Total**             | **18/52** (23 PENDING, 2 NA, 9 HUMAN) | **15/32** (7 PENDING, 3 NA, 7 HUMAN) | **5** | **16** |

Las secciones AUTH y MAIL, y los ítems de otras secciones sin alcance `L`, quedan NA por "fuera de alcance: web estática sin cuentas, sin API y sin envío de correo propio".

## Acciones prioritarias

Bloqueantes PENDING ordenados por riesgo:

1. **ABU-03 / UX-06** El formulario de contacto envía a `https://contact.alvarotc.com/send` (`site.config.ts:12`) y ese host no tiene registro DNS (`dig +short contact.alvarotc.com` vacío, `curl` código 000). Todo visitante que escriba recibirá "error de red". Arreglo: desplegar el worker del VPS descrito en `docs/superpowers/specs/2026-09-19-cv-web-redesign-design.md:284`, crear el registro A/CNAME y verificar honeypot y rate limit contra él antes del merge.
2. **DNS-02 / PAG-05 / SEO-03** Vercel tiene `www` como dominio principal (`https://alvarotc.com` → 308 → `https://www.alvarotc.com/`), pero `astro.config.mjs` fija `site: 'https://alvarotc.com'`: las 80 canonicals, las 40 URLs del sitemap, el `Sitemap:` de robots.txt, los `hreflang`, las OG y los enlaces absolutos (`.md`, feeds) redirigen todos. Arreglo: en Vercel → Domains, marcar `alvarotc.com` como principal y `www` como redirección (mantiene Upptime, config y contenido tal cual). Alternativa: cambiar `site` a `https://www.alvarotc.com`.
3. **SEC-01** Producción solo envía `strict-transport-security`. Faltan CSP, `X-Content-Type-Options`, `X-Frame-Options`/`frame-ancestors`, `Referrer-Policy`, `Permissions-Policy` y `Cross-Origin-Opener-Policy`. Arreglo: crear `vercel.json` con `headers` para `/(.*)`. Para la CSP hay un script inline de tema en `src/layouts/BaseLayout.astro:144` (hash SHA-256 o mover a fichero) y hay que permitir `script-src https://analytics.alvarotc.com`, `connect-src https://contact.alvarotc.com https://analytics.alvarotc.com` y `/_vercel/insights`.
4. **LEG-01 / LEG-02 / PAG-10** No existe aviso legal ni política de privacidad (grep de `aviso legal|privacidad|privacy|legal-notice` en `src/pages` sin resultados) y el pie (`src/components/site/Footer.astro:65-71`) solo enlaza idioma, RSS, llms.txt y código. El formulario recoge email y mensaje y los manda a un VPS, y hay analítica (Umami) y hosting (Vercel) como destinatarios. Arreglo: páginas `/legal/` y `/privacy/` en ambos idiomas (titular, contacto, datos del formulario, finalidad, conservación, Umami sin cookies, Vercel y Hetzner como encargados) y enlaces en el pie. Si se considera web personal sin actividad económica, LEG-01 puede pasar a NA por decisión de producto; LEG-02 no, porque hay formulario.
5. **LEG-05 / OPS-08 / PAG-07** Tres afirmaciones públicas contradictorias: el pie dice "Source under AGPL" (`src/i18n/translations.ts:25-27`), `README.md:71` dice "MIT — ver LICENSE" y no hay fichero `LICENSE` (`ls LICENSE*` vacío). Además el enlace "Source" del pie apunta a `github.com/alvarotorresc/alvarotc-web`, que devuelve 404 (el repo es `alvarotorresc/alvarotc.com`); linkinator lo cuenta roto en las 108 páginas rastreadas. Arreglo: elegir licencia, añadir `LICENSE`, alinear pie y README, corregir el href en `Footer.astro:69` y añadir `©` con año y titular.
6. **SEO-02** `public/og-default.png` tiene 0 bytes (así desde el primer commit, `d33c3e1`; en producción `content-length: 0`). Es la imagen OG de la home, proyectos, about, cv y stats; solo los posts generan la suya con Satori (10 PNG de 1200×630 en `dist/og/`). Arreglo: generar la portada por defecto con el mismo endpoint de Satori o guardar un PNG real de 1200×630.
7. **SEO-06 / UX-09** Placeholders `[DATO]` visibles en HTML publicado: `about/`, `es/about/`, `projects/quedamos/`, `projects/huellas/` y sus versiones `es/` (fuente: `src/content/projects/{es,en}/{quedamos,huellas,create-astro-blog}.md`; polaroids de About con fotos de relleno). Arreglo: rellenar los datos o retirar esas secciones antes del merge.
8. **SEC-11** `npm audit --audit-level=high`: 16 altas (cadena de `@lhci/cli`, `sharp` 0.33 con CVE de libvips, `deepl-node` → `adm-zip`/`axios`/`form-data`, `picomatch`); todas de build o herramientas, ninguna llega al navegador. No hay `.github/dependabot.yml` ni Renovate y Dependabot security updates está desactivado en GitHub (`gh api … security_and_analysis`). Arreglo: `npm audit fix`, subir `sharp` a ^0.35 y `@lhci/cli` a la última, añadir `dependabot.yml` (npm semanal, github-actions) y activar security updates.
9. **DNS-06** SPF termina en `~all` (softfail) y DMARC es `p=none`. Arreglo en Cloudflare DNS: `v=spf1 include:_spf.mx.cloudflare.net -all` y `v=DMARC1; p=quarantine; rua=…` (subir a `reject` tras dos semanas sin falsos positivos). No hay DKIM porque no se envía correo desde el dominio.
10. **PAG-06** Faltan `apple-touch-icon.png` (180 px) y el manifest (`public/manifest.json`) solo trae `favicon.svg`, sin iconos 192 y 512 `maskable`. Arreglo: generar los PNG y añadirlos al manifest.
11. **SEO-01** 6 títulos de post superan 60 caracteres (hasta 128 en el de FreshRSS) y 5 descripciones superan 155 (hasta 213); la descripción de la home se repite en 3 páginas por idioma. Arreglo: quitar el sufijo " | Álvaro Torres Carrasco" en posts largos o acortar títulos, recortar descripciones y dar descripción propia a 404 y stats.
12. **PERF-02** En `/projects/` la imagen LCP lleva `loading="lazy"` (Lighthouse `lcp-lazy-loaded` = 0) y `dist/_astro/cover.Wb6Qp5wU.png` pesa 379 KB (usada en `projects/basecero/` y `es/projects/`). Arreglo: primera tarjeta con `loading="eager"` y `fetchpriority="high"`; pasar la portada de BaseCero por `<Image format="webp">`.
13. **QA-04** `npm run lint` sale con código 1: Prettier marca 12 ficheros (`astro.config.mjs` y las maquetas HTML de `docs/superpowers/specs/*`). ESLint y `astro check` limpios. Arreglo: `npm run format` o añadir `docs/superpowers/**/*.html` a `.prettierignore`.
14. **QA-11** Warning de consola en `/about/` y en los posts: la fuente `manrope-latin-wght-normal.*.woff2` se precarga (`BaseLayout.astro`) pero Chrome la marca como no usada en esas páginas. Arreglo: revisar si el preload debe ser condicional o retirarlo; en la home no aparece.
15. **INF-10** No hay documento de continuidad (`grep -rliE "continuidad|bus factor|accesos" docs/ *.md` vacío). Arreglo: `docs/CONTINUIDAD.md` con la lista de proveedores del ítem INF-09 y dónde están las credenciales.
16. **OPS-01** No hay runbook (`ls RUNBOOK.md docs/runbook* docs/ops*` vacío; README solo tiene desarrollo local). Arreglo: `RUNBOOK.md` con despliegue (Vercel desde main), rollback (Vercel → Deployments → Promote), restauración (contenido en git, `stats.json` regenerable), rotación de `DEEPL_API_KEY`, `UMAMI_API_KEY`, `STATS_GITHUB_TOKEN`, token de Telegram y env de Vercel, mantenimiento (Vercel redirect temporal), logs (Vercel Logs, Caddy en el VPS) y contactos.

## Tareas para una persona

- **DNS-01** Entrar en Cloudflare Registrar y confirmar renovación automática activa y tarjeta válida para `alvarotc.com` (caduca 2027-04-25, transfer lock ya activo).
- **PAG-11 / OPS-02** Cuando exista `contact.alvarotc.com`, enviar un mensaje desde el formulario y otro a `hello@alvarotc.com` y confirmar que ambos llegan al buzón que se revisa a diario. El compromiso "I usually answer within two days" ya está publicado (`translations.ts:233`).
- **ABU-05** Confirmar alertas de gasto en Vercel, Hetzner, Cloudflare y DeepL (free tier) y que GitHub Actions no tiene minutos de pago en juego (repo público).
- **UX-12** Recorrer home, un proyecto, un post y el formulario en un iPhone y un Android físicos, vertical y horizontal, con teclado abierto. Capturas orientativas en `launch-gate/home-es-375.png` y `project-bito-375.png` (sin scroll horizontal a 375 px).
- **UX-13** Abrir las mismas páginas en Firefox y Safari de escritorio con la consola abierta: cero errores esperados. Solo se ha probado Chromium.
- **SEO-05** Confirmar en Search Console (el TXT `google-site-verification` ya está en DNS) y en Bing Webmaster que el sitemap `https://alvarotc.com/sitemap-index.xml` está enviado sin errores, tras arreglar DNS-02.
- **LEG-12** El nombre es el personal y el dominio propio; confirmar que los handles `alvarotorresc` (GitHub), `alvaro-torres-carrasco` (LinkedIn) y `torresc_alvaro` (X) son tuyos. No hace falta búsqueda en TMview.
- **INF-08** Confirmar en Cloudflare la alerta de caducidad del dominio. El certificado lo renueva Vercel (emitido 2026-08-20, caduca 2026-11-18).
- **INF-09** Confirmar 2FA en Cloudflare, Vercel, GitHub, Hetzner, Umami, DeepL y Telegram, con correo de recuperación válido.
- **INF-13** Escribir en el runbook el coste mensual estimado (Vercel, Hetzner, dominio) y activar alerta al 120 % donde se pueda.
- **A11Y-06** Recorrer home y formulario con Orca o VoiceOver sin mirar la pantalla.
- **QA-06** Revisar el PR de `redesign/cv-web` → `main` (150 commits) con la lista OWASP a mano antes de mergear; el CI solo corre en `main` y en PRs, así que abrir el PR también dispara lint, tests y Lighthouse CI por primera vez para esta rama.
- **QA-09** En DevTools, throttling "Slow 3G" y CPU 4x sobre home y un post: comprobar que el texto aparece antes que las islas.
- **OPS-10** El día del lanzamiento: Upptime en verde, mensaje de prueba recibido, `stats.json` refrescado por el cron, consola limpia en producción.
- **OPS-11** Recordatorio mensual de `npm outdated` (hoy hay majors pendientes: React 19, framer-motion 13, @astrojs/react 7, TypeScript 7) y revisión semanal de Umami el primer mes.

## Detalle por sección

### Legal y cumplimiento

- **LEG-01** `PENDING` — Sin página de aviso legal ni enlace en el pie (`grep -riE "aviso.?legal|legal-notice" src/` sin resultados en páginas; `Footer.astro:65-71`). Ver acción 4.
- **LEG-02** `PENDING` — Sin política de privacidad. Datos recogidos: email, asunto y mensaje del formulario (`ContactTerminal.tsx:116-140`), enviados a `contact.alvarotc.com`; destinatarios: Vercel (hosting y Vercel Analytics), Hetzner (worker y Umami). Ver acción 4.
- **LEG-03** `DONE` — Con navegador en contexto limpio sobre la home: `document.cookie` vacío, `localStorage` y `sessionStorage` vacíos, cero hosts de terceros en `performance.getEntriesByType('resource')`. En producción, `curl -sI` sin `set-cookie`. Umami es autoalojado y sin cookies; Vercel Analytics no usa cookies. No hace falta banner.
- **LEG-05** `PENDING` — Ver acción 5.
- **LEG-06** `DONE` — `npx license-checker --summary --production`: MIT 285, ISC 15, Apache-2.0 10, MPL-2.0 8, BSD 11, OFL-1.1 3 (Manrope y JetBrains Mono vía fontsource), CC0 2, LGPL-3.0-or-later 4 (solo `@img/sharp-libvips-*`, binario de build, no se distribuye), CC-BY-4.0 1 (`caniuse-lite`, datos). Sin GPL/AGPL/SSPL. Iconos: `simple-icons` (CC0) y SVG propios en `src/components/icons/`. Ninguno exige atribución en la web.
- **LEG-11** `NA` — Condición no cumplida: no es comercio electrónico ni servicio B2C.
- **LEG-12** `HUMAN` — Ver tareas.

### Dominio, DNS y TLS

- **DNS-01** `HUMAN` — `whois`: caducidad 2027-04-25 (>11 meses), `clientTransferProhibited`, registrador Cloudflare. Renovación automática y tarjeta: panel.
- **DNS-02** `PENDING` — `http://alvarotc.com` → 308 `https://alvarotc.com/`; `http://www` → 308 `https://www…/`; `https://alvarotc.com` → 308 `https://www.alvarotc.com/`; `https://www` → 200. Canónica efectiva = www, canónica declarada = apex. Ver acción 2.
- **DNS-03** `DONE` — `openssl s_client`: emisor Let's Encrypt, válido 2026-08-20 → 2026-11-18 (>20 días; la fecha de emisión demuestra una renovación ya realizada por Vercel). `curl --tls-max 1.1` rechazado. HTTP/2 activo.
- **DNS-04** `DONE` — `strict-transport-security: max-age=63072000` (2 años) sin `includeSubDomains`, correcto porque conviven subdominios en otras infraestructuras.
- **DNS-05** `PENDING` — `dig +short CAA alvarotc.com` vacío. Arreglo: `CAA 0 issue "letsencrypt.org"` (Vercel emite con Let's Encrypt); comprobar en la documentación de Vercel si añade otra CA antes de publicar el registro.
- **DNS-06** `PENDING` — TXT: `v=spf1 include:_spf.mx.cloudflare.net ~all`; `_dmarc`: `p=none` con `rua` a un buzón personal. Ver acción 9.
- **DNS-07** `DONE` — Subdominios conocidos: `www` → Vercel (200), `analytics` → 178.104.74.7 (200), `status` → GitHub Pages (200), `contact` → sin registro (ver ABU-03); `api`, `app`, `staging`, `mail`, `docs`, `dev`, `preview` sin registro. Ningún CNAME a servicio dado de baja. Revisión humana recomendada: exportar la zona desde Cloudflare para confirmar que no hay más.
- **DNS-08** `PENDING` — `/.well-known/security.txt` devuelve 404. Arreglo: `public/.well-known/security.txt` con `Contact: mailto:hello@alvarotc.com`, `Expires` a un año y `Preferred-Languages: es, en`.
- **DNS-09** `DONE` — Último preview de Vercel (GitHub Deployments API): `HTTP/2 200` con `x-robots-tag: noindex`. Los previews son públicos pero no indexables; opcional activar Deployment Protection en Vercel.

### Páginas, rutas y enlaces

- **PAG-01** `DONE` — Producción: `curl -sI https://www.alvarotc.com/esta-ruta-no-existe-…` → `HTTP/2 404`. Build: `dist/404.html` con enlace a inicio (`src/pages/404.astro:14`). Nota: `src/pages/es/404.astro` se compila a `es/404/index.html`, que Vercel nunca sirve como 404 (solo usa `/404.html`, en inglés); valorar detectar `/es/` en la 404 única o retirar la página.
- **PAG-02** `NA` — Fuera de alcance: sitio estático sin app ni proxy propio; los errores de plataforma los sirve Vercel.
- **PAG-05** `PENDING` — `robots.txt` incluye `Sitemap: https://alvarotc.com/sitemap-index.xml` y `sitemap-0.xml` tiene 40 URLs con `xhtml:link` en/es/x-default, pero todas en el apex, que redirige (DNS-02). Se resuelve con la acción 2; re-verificar con el bucle de curl del checklist tras el deploy.
- **PAG-06** `PENDING` — Producción: `favicon.ico` 200, `favicon.svg` 200, `apple-touch-icon.png` 404, `manifest.webmanifest`/`site.webmanifest` 404 (el enlazado es `/manifest.json`, presente). Manifest sin iconos 192/512 maskable. `theme-color` presente (`BaseLayout.astro:105`). Ver acción 10.
- **PAG-07** `PENDING` — `npx linkinator http://127.0.0.1:4399/ --recurse` (excluidos mailto, LinkedIn y X): 576 enlaces. Rotos reales: `https://github.com/alvarotorresc/alvarotc-web` (404, en las 108 páginas). Los demás 404 son URLs absolutas a `alvarotc.com` de páginas que producción aún no tiene (about, cv, projects/_, stats, topic/_, `.md`) y desaparecen al desplegar la rama. Ver acción 5.
- **PAG-08** `DONE` — En el build hay 10 `target="_blank"` y 0 sin `noopener`; en el DOM de la home, 0 sin `noopener`.
- **PAG-09** `PENDING` — Producción sirve `/blog` y `/blog/` con 200 sin redirección (Astro `trailingSlash: 'ignore'` + Vercel por defecto). Canonical presente en las 80 páginas, con barra final. Arreglo: `vercel.json` con `"trailingSlash": true` para 308 de `/blog` → `/blog/`.
- **PAG-10** `PENDING` — `grep -ciE "aviso legal|privacidad|cookies|términos|contacto"` en `index.html`, `404.html` y `es/index.html` = 2 (solo "contacto" y la frase de privacidad, sin enlaces). Depende de LEG-01/02.
- **PAG-11** `HUMAN` — Canal localizado: `mailto:hello@alvarotc.com` en pie y sección Contacto; formulario hacia `contact.alvarotc.com/send` (hoy sin DNS). Ver tareas.

### Buscadores y compartir

- **SEO-01** `PENDING` — `lang` correcto en 80/80 (40 en, 40 es). Sin títulos vacíos. Ver acción 11 para longitudes y repeticiones.
- **SEO-02** `PENDING` — Etiquetas OG y Twitter completas (`BaseLayout.astro:126-142`, `twitter:card summary_large_image`), `og:image` absoluta https. Posts: 10 PNG de 1200×630 en `dist/og/`. Portada por defecto vacía (0 bytes). Ver acción 6. Revisión humana tras el arreglo: previsualizar en WhatsApp o Slack.
- **SEO-03** `DONE` — `<link rel="canonical">` en 80/80 páginas, todas https; `hreflang` en, es y x-default en la home y en posts emparejados (`astro.config.mjs` `alternatesFor`). Host apex pendiente de DNS-02.
- **SEO-04** `DONE` — `jq` parsea el JSON-LD de la home (`@type: Person`, `url: https://alvarotc.com/`) y de los posts (`BlogPosting`). Recomendación HUMAN: pasar una URL por Rich Results Test.
- **SEO-05** `HUMAN` — TXT `google-site-verification` presente en DNS. Ver tareas.
- **SEO-06** `PENDING` — Ver acción 7. Sin lorem ipsum; sin imágenes con nombre de stock en `public/` (`favicon.*`, `logo.svg`, `og-default.png`, `robots.txt`, `screenshot.png`, `manifest.json`).

### Seguridad de la aplicación

- **SEC-01** `PENDING` — `curl -sI https://www.alvarotc.com`: solo `strict-transport-security`. Lighthouse `csp-xss`: "No CSP found in enforcement mode". Ver acción 3.
- **SEC-10** `DONE` — `gitleaks detect --log-opts=--all` (Docker): 169 commits, "no leaks found" (`launch-gate/gitleaks.log`). `git check-ignore .env` → `.env`. Ningún `.env`, `.pem` ni `.key` en el historial. GitHub: `secret_scanning: enabled`, `secret_scanning_push_protection: enabled`.
- **SEC-11** `PENDING` — `package-lock.json` commiteado. Ver acción 8. `npm outdated`: majors pendientes en react, react-dom, framer-motion, @astrojs/react, @vercel/analytics, eslint, typescript.
- **SEC-12** `DONE` — Producción: `.env`, `.git/HEAD`, `.git/config`, `backup.sql`, `.DS_Store` → 404. Build: 0 ficheros `.map`, 0 `sourceMappingURL`. Sin flags de debug (sitio estático).
- **SEC-14** `DONE` — En el HTML del build, 0 `<script>`/`<link>` a orígenes externos; el único script remoto es `https://analytics.alvarotc.com/script.js` (subdominio propio, solo si `PUBLIC_UMAMI_WEBSITE_ID` está definido) y `/_vercel/insights/script.js` (mismo origen).
- **SEC-20** `PENDING` — No hay informe ZAP/nuclei en el repo. Arreglo: `docker run --rm -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py -t <URL del preview de Vercel> -I` y guardar el informe en `launch-gate/`.

### Abuso, límites y costes

- **ABU-03** `PENDING` — Cliente: honeypot `name="website"` con `tabindex=-1`, `autocomplete=off`, dentro de contenedor `aria-hidden` y fuera de flujo (`offsetParent === null`), más tiempo transcurrido (`ContactTerminal.tsx:23-28,153-160`; `src/lib/contact.ts:47-55`). Servidor: no verificable, `contact.alvarotc.com` no resuelve. Ver acción 1; tras desplegar, 20 envíos en un minuto desde un preview deben rechazarse al final.
- **ABU-05** `HUMAN` — Proveedores de pago por uso deducidos: Vercel, Hetzner, Cloudflare (registro), DeepL API (free), GitHub Actions. Ver tareas.
- **ABU-08** `DONE` — `robots.txt` presente. `curl -sI -A ""` → 200 (no se bloquea UA vacío; Vercel aporta mitigación DDoS por defecto y el sitio es estático). Revisión humana recomendada: Vercel → Firewall a las 48 h del lanzamiento.
- **ABU-09** `DONE` — Producción: `x-vercel-cache: HIT`, `age: 45125`, `cache-control: public, max-age=0, must-revalidate` en HTML; todo generado en build.

### Datos, privacidad y backups

- **DAT-05** `DONE` — El único formulario pide email (`type="email"`, `autocomplete="email"`), asunto y mensaje (`ContactTerminal.tsx:116-140`). Ningún campo de teléfono, DNI ni dirección. Cada dato debe aparecer en LEG-02.
- **DAT-07** `DONE` — Umami autoalojado sin cookies, cargado solo con `PUBLIC_UMAMI_WEBSITE_ID` (`BaseLayout.astro:59,172-177`); Vercel Analytics sin cookies. `grep -rnE "umami\.track|va\.track|track\("` en `src/` sin resultados: no hay eventos personalizados. Navegador: 0 cookies, 0 peticiones a terceros. El pie declara "Sin cookies ni rastreadores".

### Rendimiento

- **PERF-01** `DONE` (sobre el build local, no sobre producción) — Lighthouse móvil simulado, `launch-gate/lh-{home,es,projects}.json`: performance 99/99/99; LCP 1883/1955/1728 ms; CLS 0,000; TBT 0 ms; FCP 1656/1654/1503 ms. CI repite la medida con umbral 0,95 (`lighthouserc.cjs`).
- **PERF-02** `PENDING` — 124 `<img>` webp, 12 png, 6 svg; `modern-image-formats`, `unsized-images` y `offscreen-images` sin ahorro; `uses-responsive-images` 0,5 (11–14 KiB). 76 `<img>` sin atributo `width` en HTML (imágenes de proyecto dimensionadas por CSS; Lighthouse no las marca). Ver acción 12.
- **PERF-03** `DONE` — Fontsource woff2 por subsets, `font-display: swap` (18 reglas), preload de Manrope latin (`BaseLayout.astro`). Home: 3 ficheros de fuente (25, 21 y 22 KB), 2 familias. Ver QA-11 por el warning de preload en `/about/`.
- **PERF-04** `DONE` — Producción: `content-encoding: br`; HTML `cache-control: public, max-age=0, must-revalidate`; asset `/_astro/*.js` → `cache-control: public, max-age=31536000, immutable`.
- **PERF-05** `PENDING` — Lighthouse home: 13 scripts, 70 KB transferidos (`client.CTDgkbZx.js` de React 43 KB, cargado por `CommandPalette client:idle`, más `translations` 7 KB). Supera los 50 KB de landing; peso total 255 KiB. Arreglo: cargar CommandPalette con `client:visible`/al pulsar la tecla, o convertir `translations` en import por idioma.
- **PERF-06** `DONE` — `HTTP/2 200`; CDN de Vercel (`x-vercel-id: cdg1::…`, `x-vercel-cache`).

### Experiencia: estados, copies y formularios

- **UX-06** `PENDING` — Cliente correcto: `fieldset disabled={status === 'sending'}` (`ContactTerminal.tsx:111`) evita el doble envío, los valores se conservan en error, error junto al formulario, `autocomplete="email"`. No verificable de extremo a extremo hasta que exista el endpoint (ABU-03).
- **UX-09** `PENDING` — Paridad de claves i18n en/es: 238 = 238, ninguna huérfana. Sin `undefined`, `NaN` ni `[object Object]` en el HTML. Bloquea por los `[DATO]` de SEO-06. Juicio humano pendiente sobre tono y ortografía (no se ha pasado corrector).
- **UX-10** `NA` — Condición no cumplida: no se cobra.
- **UX-11** `DONE` — Paridad 238/238; sin claves crudas en el HTML servido; layout sin desborde a 375 px en en y es.
- **UX-12** `HUMAN` — Capturas `launch-gate/home-es-375.png`, `project-bito-375.png`; `scrollWidth` 360 ≤ 375 en home, /es/, proyecto, about y post. Ver tareas.
- **UX-13** `HUMAN` — Solo Chromium probado (5 páginas): sin errores propios (ver QA-11). Ver tareas.
- **UX-16** `DONE` — Oscuro por defecto con `prefers-color-scheme` y toggle persistido (`BaseLayout.astro:144-165`); `theme-color` cambia con el tema (`#0f1115` / `#f7f8fa`); captura `launch-gate/home-640-dark.png` (fondo `rgb(15,17,21)`).

### Accesibilidad

- **A11Y-01** `DONE` — Tab desde la home enfoca "Skip to content" con `outline: solid 2px rgb(79,142,247)`. `outline-none` solo en los `<input>` de `HeroTerminal.tsx:251` y `CommandPalette.tsx:152`, dentro de contenedores con estilo propio. CommandPalette `role="dialog"` con cierre por Escape y restauración de foco (`CommandPalette.tsx:22,42`). Revisión humana recomendada: recorrido completo con Tab en el formulario.
- **A11Y-02** `DONE` — Lighthouse accesibilidad 100/100/100; `color-contrast` sin fallos. Existe `tests/contrast.test.ts`.
- **A11Y-03** `DONE` — `label`, `button-name`, `image-alt`, `link-name` sin fallos. 0 `<img>` sin atributo `alt` (26 con `alt` vacío, decorativas); 0 botones-icono sin `aria-label`; enlaces sociales del pie con `aria-label` (`Footer.astro:79`).
- **A11Y-04** `DONE` — Home: 1 `<main>`, 1 `<nav>`, 1 `<footer>`, 2 `<header>` (página y sección), 1 `<h1>`; 1 `<h1>` y 1 `<main>` en las 5 páginas comprobadas; secuencia de encabezados en un post 1-2-2-3-3-3-3-2… sin saltos.
- **A11Y-05** `DONE` — `prefers-reduced-motion` en 10 ficheros y regla presente en el CSS servido; `useReducedMotion` en las islas; sin `<video>`.
- **A11Y-06** `HUMAN` — Ver tareas.
- **A11Y-07** `DONE` — `<meta name="viewport" content="width=device-width, initial-scale=1.0">` sin `user-scalable`/`maximum-scale`. A 640 px: `scrollWidth` 625 ≤ 640. 11 `font-size` en px, todos en cromo decorativo (marcos de terminal/navegador, polaroid, etiquetas del heatmap).
- **A11Y-08** `NA` — Condición no cumplida (ver LEG-11).

### Infraestructura y despliegue

- **INF-03** `DONE` — Vercel despliega desde GitHub: deployment `Production` ref `92e9da3` = `origin/main` HEAD, y producción sirve ese build. CI (`ci.yml`): lint, `astro check`, build, test y Lighthouse CI móvil y escritorio. Aviso: CI solo se dispara en `main` y en PRs a `main`; `redesign/cv-web` no tiene ninguna ejecución (`gh run list --branch redesign/cv-web` vacío).
- **INF-08** `HUMAN` — Ver tareas (certificado gestionado por Vercel, con renovación demostrada; dominio en Cloudflare).
- **INF-09** `HUMAN` — Lista de proveedores en tareas.
- **INF-10** `PENDING` — Ver acción 15.
- **INF-13** `HUMAN` — Ver tareas.

### Observabilidad y alertas

- **OBS-01** `DONE` — Upptime (`alvarotorresc/upptime`, `.upptimerc.yml`): monitoriza `https://alvarotc.com` cada 5 minutos (`*/5 * * * *`) con notificación Telegram; `status.alvarotc.com` responde 200 ("Alvaro TC Status"). Revisión humana recomendada: provocar una alerta de prueba. Cuando exista `contact.alvarotc.com`, añadirlo al monitor.
- **OBS-06** `PENDING` — Existe `status.alvarotc.com` pero no está enlazado (`grep -ciE "status\.|estado del servicio"` en la home = 0). Arreglo: enlace en el pie y en la 404.
- **OBS-08** `DONE` — Producción actual carga `analytics.alvarotc.com/script.js` (1 coincidencia), así que la variable `PUBLIC_UMAMI_WEBSITE_ID` está en Vercel. Exclusión del tráfico propio: no documentada; recomendación HUMAN: `localStorage.setItem('umami.disabled', '1')` en los navegadores propios y anotarlo en el runbook.

### Calidad y pruebas

- **QA-01** `DONE` — `gh run list --branch main`: últimos 4 runs `success` (último 2026-09-07). Local: 47 ficheros, 539 tests pasados, 22 omitidos. Flujo crítico (contacto) cubierto en `tests/contact.test.ts:35-67` y `tests/contact-terminal.test.ts`; build cubierto en `tests/build.test.ts`.
- **QA-04** `PENDING` — Ver acción 13. `tsconfig.json` extiende `astro/tsconfigs/strict`. Supresiones: 1 `@ts-expect-error` justificado (`src/lib/og.ts:31`) y 1 `eslint-disable no-console` en `src/lib/mock-report.ts:1` (script de desarrollo). No hay código de auth ni pagos.
- **QA-06** `HUMAN` — 150 commits `main..HEAD`. Ver tareas.
- **QA-09** `HUMAN` — Ver tareas.
- **QA-11** `PENDING` — 5 páginas en Chromium (`launch-gate/console.log`): 1 error por página, `/_vercel/insights/script.js` 404, artefacto del preview local (el script solo existe en Vercel); 1 warning en `/about/` y en los posts por el preload de fuente. Ver acción 14. Cero peticiones 4xx/5xx propias, cero violaciones de CSP (no hay CSP).

### Operativa, soporte y lanzamiento

- **OPS-01** `PENDING` — Ver acción 16.
- **OPS-02** `HUMAN` — Canal publicado (email y formulario) y compromiso escrito ("I usually answer within two days"). Ver tareas.
- **OPS-07** `PENDING` — `git tag` vacío, sin `CHANGELOG.md`, `package.json` en 0.1.0 y sin versión visible. Arreglo: tag `v1.0.0` al mergear y `CHANGELOG.md` mínimo.
- **OPS-08** `PENDING` — Afirmaciones de la landing: "Sin cookies ni rastreadores" cumplida (LEG-03); "Código bajo AGPL" incumplida (sin LICENSE, README dice MIT); enlace "Source" roto; proyectos con `[DATO]`; formulario sin backend. Ver acciones 1, 5 y 7.
- **OPS-09** `NA` — Fuera de alcance: web personal sin producto con usuarios que necesiten FAQ.
- **OPS-10** `HUMAN` — Ver tareas.
- **OPS-11** `HUMAN` — Ver tareas; Dependabot inactivo (SEC-11).

### Fuera de alcance (NA)

AUTH-01…AUTH-n, MAIL-01…MAIL-n, ABU-01/02/04/06/07, DAT-01…04/06, PAG-03/04/12/13, SEC-02…09/13/15…19, PERF-07…, UX-01…05/07/08/14/15, INF-01/02/04…07/11/12, OBS-02…05/07, QA-02/03/05/07/08/10, OPS-03…06: `NA` — fuera de alcance: web estática sin cuentas, sin API, sin base de datos y sin envío de correo propio.

## Resumen legible por máquina

```yaml
launch_gate:
  project: alvarotc.com
  date: 2026-09-24
  scope: L
  commit: d2ac4e2
  branch: redesign/cv-web
  verdict: NO_LISTO
  blocking: { done: 18, pending: 23, na: 2, human: 9, total: 52 }
  recommended: { done: 15, pending: 7, na: 3, human: 7, total: 32 }
  pending_blocking_ids:
    [
      ABU-03,
      DNS-02,
      SEC-01,
      LEG-01,
      LEG-02,
      PAG-10,
      LEG-05,
      PAG-07,
      SEO-02,
      SEO-06,
      UX-09,
      SEC-11,
      DNS-06,
      PAG-05,
      PAG-06,
      SEO-01,
      PERF-02,
      UX-06,
      QA-04,
      QA-11,
      INF-10,
      OPS-01,
      OPS-08,
    ]
  pending_recommended_ids: [DNS-05, DNS-08, PAG-09, SEC-20, PERF-05, OBS-06, OPS-07]
  human_ids:
    [
      DNS-01,
      PAG-11,
      ABU-05,
      UX-12,
      UX-13,
      INF-08,
      INF-09,
      OPS-02,
      OPS-10,
      LEG-12,
      SEO-05,
      A11Y-06,
      INF-13,
      QA-06,
      QA-09,
      OPS-11,
    ]
```
