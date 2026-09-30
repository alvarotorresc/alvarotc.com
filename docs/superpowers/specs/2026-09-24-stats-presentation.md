# Spec: presentación de `/stats` y de la sección "Stack y Stats" de la home

Fecha: 2026-09-24. Rama `redesign/cv-web`. Decisiones del usuario del 24 sep. Sustituye a las Tasks 9 y 10 del plan `2026-09-24-plan-stats-pipeline.md` en lo que toca a presentación; el modelo de datos (`StatsData` de `src/lib/stats.ts`, `stats.json`) es el que produce la tubería ya implementada (Tasks 1-8).

## Maquetas elegidas

- Página `/stats`: opción 2 "Editorial de datos": `docs/superpowers/specs/2026-09-24-stats-mockups/page.dc.html` (la parte superior del artboard, hasta su footer).
- Sección de la home: la parte inferior del artboard de la opción 3, bajo la franja "[sección de la home: Stack y Stats]": `docs/superpowers/specs/2026-09-24-stats-mockups/home-section-source.dc.html`. Es una tarjeta ancha con un mini heatmap (26 columnas x 7, celdas de 8px) a la izquierda y las 3 cifras a la derecha, y el stack en 4 columnas debajo, con el enlace a `/stats`.

## Lighthouse: fuera de lo público

Lighthouse se queda como puerta interna de CI (job con umbrales, ya implementado en la Task 6). NO se muestra en la página, se elimina del contrato `StatsData` (`lighthouse` desaparece), de `scripts/fetch-data.mjs`/`stats-file.mjs`, de `scripts/merge-lighthouse.mjs` (borrar) y del workflow `refresh-stats.yml` (ya no descarga el artefacto). El job de CI sigue subiendo su artefacto para consulta interna. Los tests correspondientes se adaptan.

## Página `/stats` (según page.dc.html)

- Cabecera: h1 a 56px, frase de qué es y de dónde salen los datos, "Última actualización" en mono (solo si `generatedAt`).
- Sin tarjetas. Secciones Código, Artículos y Este sitio; cada una una secuencia de filas con hairline: izquierda (columna 420px en escritorio) la cifra en JetBrains Mono (héroe 88px, secundarias 64px) con etiqueta debajo; derecha frase de contexto (18px) y gráfico.
- Gráficos: heatmap 53x7 (ya existe `ContributionHeatmap.astro`; adaptarlo a las celdas y colores de la maqueta), barra apilada de lenguajes de 12px con leyenda (top 4 + "otros"), temas con tamaño según frecuencia, "más leídos" como lista con vistas en mono. Sin medidores de Lighthouse.
- "Este sitio": 0 cookies, 0 peticiones a terceros, analítica autoalojada (solo si Umami está activo en build), y la nota de fuentes. Sin la sección "De dónde salen los números" como bloque aparte: su texto va en la cabecera o al pie de la página, gateado por `generatedAt`.
- Cifras honestas: "79 días con commits en el último año" en vez de racha; estrellas fuera si son < 10 (regla: solo mostrar `stars` cuando ≥ 10).
- Cada bloque se oculta entero cuando su fuente es `null`; nunca "[n]" en producción.
- Números con separador de miles del idioma (`toLocaleString`).
- Móvil: cifra encima del contexto, gráficos a ancho completo, heatmap con scroll horizontal y snap.

## Sección de la home (según home-section-source.dc.html)

- `StackStats.astro` se reescribe: tarjeta ancha (una sola, `card`) con mini heatmap de las últimas 26 semanas (celdas 8px, mismo `heatmapWeeks` recortado) a la izquierda y las 3 cifras a la derecha (commits este año desde `stats.json`, artículos, apps en producción), y debajo el stack en 4 columnas. Enlace a `/stats` como `btn-secondary` con flecha SVG (mismo que Proyectos y Artículos).
- Sin `stats.json` (fallback nulo): la tarjeta se queda sin heatmap y sin el contador de commits; nunca inventar.

## Bilingüe y calidad

Todo en es y en (claves `stats.*` nuevas donde haga falta). Componentes presentacionales con datos planos y tests con la Container API; comprobaciones sobre `dist/` para la página construida con datos reales (generados en local con `gh auth token`, sin commitear). Sin animaciones. Contraste AA (`text-faint` mínimo).
