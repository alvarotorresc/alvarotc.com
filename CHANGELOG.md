# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Este proyecto sigue [Versionado Semántico](https://semver.org/lang/es/).

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
