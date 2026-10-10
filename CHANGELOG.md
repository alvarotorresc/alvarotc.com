# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Este proyecto sigue [Versionado Semántico](https://semver.org/lang/es/).

## [Sin publicar]

### Cambiado

- Ficha de Cheesy actualizada a su versión 0.4.0.

## [1.1.0] - 2026-10-09

### Añadido

- CV en PDF optimizado para ATS, en español y en inglés, generado con RenderCV desde `cv/cv.es.yaml` y `cv/cv.en.yaml`: una página, una columna y títulos de sección legibles por los analizadores. `npm run cv` regenera los PDF públicos y `npm run cv:private` crea en local una copia con teléfono y correo personal, fuera de git.
- Posts de presentación y técnico de DevTools, en los dos idiomas, enlazados con su ficha de proyecto.
- Datos estructurados: `BreadcrumbList` en posts, temas y fichas, `CollectionPage` con `ItemList` en la página de proyectos y `applicationCategory` propia por proyecto.
- Verificación de Bing Webmaster Tools.

### Cambiado

- `/cv/` y `/es/cv/` redirigen al PDF de su idioma, y todos los enlaces al CV (home, Sobre mí, menú, experiencia, terminal, 404, buscador y `llms.txt`) apuntan al PDF. El botón de la home lo descarga.
- SEO: título de la home con rol y ciudad, descripción propia de la página de proyectos, el menú enlaza a `/projects/`, etiquetas del blog con slug en inglés (con redirecciones desde las antiguas) y los temas solo se indexan a partir de cuatro posts.
- Las páginas legales salen del índice y del sitemap.
- La portada del último post de la home carga en diferido (Lighthouse móvil de 0,94 a 0,99).
- Ficha de Cheesy actualizada a su versión 0.2.0.
- README nuevo en español e inglés.
- La rama `main` solo admite cambios por PR con CI y Lighthouse en verde.

### Corregido

- Textos reales en los enlaces de iconos y en el enlace al código del pie.
- `<` escapado en el JSON-LD serializado, el repositorio de cada proyecto en `sameAs` y los borradores fuera del recuento de temas del sitemap.
- La imagen OG de los posts usa siempre la plantilla generada.

### Eliminado

- La página `/cv/` imprimible, sus componentes y sus textos, sustituidos por el PDF.

## [1.0.0] - 2026-10-01

Rediseño completo del sitio (rama `redesign/cv-web`).

### Añadido

- Home rediseñada: hero, sección "Sobre mí", timeline de experiencia animado, bento de proyectos, stack/stats con mapa de calor y sección "Fuera del teclado".
- Página `/about` en dos columnas con una fotografía ("polaroid") y un icono de color por etapa biográfica.
- Fichas de proyecto por tipo (móvil, web, híbrido, CLI) con capturas, notas de versión y un playground embebible.
- Blog bilingüe (ES/EN) con feeds RSS por idioma, `llms.txt`/`llms-full.txt`, versión Markdown de cada artículo, paginación estática y páginas de tema.
- Cifras y mapa de calor de contribuciones en la home, alimentados por una tubería diaria (GitHub + Umami) vía GitHub Actions.
- Página 404 bilingüe con forma de diagnóstico de compilador: señala el tramo de la dirección que no existe y sugiere la página más parecida.
- Página `/cv` imprimible generada a partir de los datos de experiencia y proyectos.
- Formulario de contacto (isla React con estética de terminal) contra un servicio propio autoalojado, con honeypot y tiempo mínimo de relleno contra spam.
- Buscador con índice estático y paleta de comandos.
- Modo oscuro/claro con `prefers-color-scheme`, tipografía autoalojada (Manrope, JetBrains Mono) y animaciones que respetan `prefers-reduced-motion`.
- Pie de página con iconos sociales y enlace a `llms.txt`.
- Páginas de aviso legal y política de privacidad en ambos idiomas, enlazadas desde el pie junto con la página de estado y el copyright.
- Cabeceras de seguridad y Content-Security-Policy por hash vía `vercel.json`, `security.txt` y barra final obligatoria.
- Imagen OG por defecto, `apple-touch-icon` e iconos del manifest generados por script.
- Licencia MIT, Dependabot semanal, runbook y documento de continuidad.

### Cambiado

- Migración a Astro 7, Vitest 5 y Tailwind 4, y a la capa de contenido (Content Layer) de Astro 5.

### Eliminado

- "Swiss Knife" y un proyecto archivado del listado de proyectos.

> **Nota**: la versión 0.1.0 (más abajo) era la web anterior. Antes de etiquetar la 1.0.0 quedan las tareas del dueño listadas en `docs/LANZAMIENTO_PENDIENTE.md` (DNS del formulario, dominio principal en Vercel, datos reales de proyectos y About).

## [0.1.0]

Web anterior de alvarotc.com, sustituida por el rediseño de 1.0.0. Sin registro de cambios detallado.
