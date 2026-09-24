# Spec: rediseño del listado de artículos (`/blog` y `/es/blog`)

Fecha: 2026-09-24. Rama `redesign/cv-web`. Elegido por el usuario: opción 1 "Lista pura" (`2026-09-24-blog-index-mockups/list.dc.html`) más un filtro oculto tras un botón en la cabecera, con el panel de temas de la opción 2 (`topics-rail.dc.html`, bloque "Temas") y el botón de la opción 5 (`topics-button.dc.html`, "Filtrar por tema").

## Motivo

La página actual pone 24 píldoras de tags con contador en tres filas antes de la lista. "Lo importante son los artículos."

## Layout (escritorio, 1280)

- Cabecera de página: h1 "Artículos" / "Writing", recuento "N artículos" / "N articles" (número en mono), y a la derecha dos botones `btn-secondary` de 40px con icono de trazo: "Filtrar por tema" / "Filter by topic" (icono filtro + caret) y "RSS" (icono rss, enlace al feed del idioma).
- El panel de temas está oculto por defecto. Se abre bajo la cabecera, alineado a la derecha, como un bloque de 2 o 3 columnas con "Todos" marcado y todos los temas como texto con su contador en mono alineado a la derecha (como el bloque "Temas" de topics-rail), y un enlace "Quitar filtro" cuando hay uno activo. Sin JS debe seguir funcionando la apertura: usar `<details>`/`<summary>` con el `summary` estilado como el botón (caret gira al abrir), o un botón con `aria-expanded` + `hidden` con fallback abierto sin JS. Preferido: `<details>`.
- El filtrado mantiene el mecanismo actual de `TagFilter.astro` (client-side sobre `data-tags`, recuento actualizado) pero con la nueva presentación; al filtrar, el botón muestra el tema activo ("Tema: docker") y el recuento cambia ("2 artículos"). Sin animaciones más allá del caret.
- Lista: el artículo más reciente abre en grande (título 34px/800, descripción 18px), el resto en filas con hairline (título 24px/700, descripción 16px muted). Rejilla con columna izquierda de 160px para fecha y tiempo de lectura en mono (`text-faint`), y bajo cada título los tags del artículo como enlaces en mono pequeño muted separados por espacios (activan el mismo filtro). Al final "N de N" en mono (o "N de M" con filtro).
- Se elimina la sección "Temas" del final de la maqueta: el botón la sustituye.
- Los títulos de artículo son encabezados reales (`h2`) con el enlace dentro (deuda del plan B).

## Móvil (< 768px)

Cabecera apilada: título y recuento, luego los dos botones a ancho completo o en fila si caben. Panel de temas a una columna. Lista a una columna: fecha y tiempo en una línea pequeña encima del título.

## Bilingüe

Todo en es y en, mismas claves i18n (`writing.filter`, `writing.clearFilter`, `writing.topics`, `writing.all`, `writing.countOf`, etc.). El botón RSS enlaza al feed del idioma: `/rss.xml` (en) y `/es/rss.xml` (es); el feed español existe hoy en `/rss.xml`, el inglés no: los feeds bilingües son una tarea aparte de esta misma ronda (ver plan de deuda del blog), así que hasta entonces ambos botones enlazan a `/rss.xml`.

## Fuera de alcance

El layout del post, la home, los feeds, llms.txt.
