---
title: 'Nueva web, nuevo rumbo'
description: 'He reconstruido mi web personal desde cero. Aquí cuento por qué, qué decisiones he tomado y qué viene después.'
date: 2026-02-16
draft: false
tags: ['meta', 'web', 'astro', 'proyectos']
---

## La web anterior estaba muerta

Mi web personal llevaba más de dos años con Next.js 12, un diseño que nunca terminé de pulir y cero contenido real. Era una landing page estática que no contaba nada sobre mí ni sobre lo que hago. Cada vez que alguien me pedía un portfolio o un enlace profesional, sentía una mezcla de vergüenza y pereza. Vergüenza porque sabía que no me representaba, y pereza porque tocar aquel código significaba lidiar con dependencias obsoletas y decisiones técnicas que ya no compartía.

Así que hace unas semanas decidí que había llegado el momento de tirarlo todo y empezar limpio.

## Por qué Astro y no Next.js

La decisión fue más fácil de lo que pensaba. Mi web personal no necesita SSR, no necesita API routes, no necesita un runtime de React en cada página. Lo que necesita es:

- **Rendimiento extremo**: HTML estático, cero JavaScript innecesario
- **Markdown para escribir**: sin CMS, sin base de datos, solo archivos
- **Flexibilidad para interactividad puntual**: donde la necesite, puedo montar un componente React

Astro 5 encaja perfectamente. El concepto de _islands architecture_ me permite tener animaciones con Framer Motion solo donde tiene sentido, mientras el resto de la página es HTML puro. El resultado es una web que carga en milisegundos.

## Las decisiones de diseño

Quería algo que reflejara cómo trabajo: directo, sin adornos innecesarios, funcional. Me inspiré en las webs personales de desarrolladores que admiro: minimalistas, con buen contraste y tipografía cuidada.

La paleta es intencionadamente contenida. Un fondo casi negro, texto claro y un único color de acento: electric indigo. No hay gradientes llamativos ni efectos por todas partes. Los pocos detalles visuales que hay, como el glow sutil en hover o las animaciones de entrada, están ahí para dar vida sin distraer.

La estructura es deliberadamente simple: quién soy, qué escribo, qué construyo. Tres secciones, sin menú de navegación complejo. Si alguien llega a mi web, en cinco segundos sabe a qué me dedico y puede explorar mis proyectos.

## Bilingüe desde el primer día

Una de las cosas que más me interesaba era tener la web en español e inglés. No como un _nice to have_, sino como algo estructural. El sistema que he montado traduce los posts automáticamente usando DeepL en el momento del build. Escribo en español, la máquina traduce, yo reviso, y ambas versiones se despliegan juntas.

Esto me permite escribir sin fricción en mi idioma nativo y tener alcance internacional sin duplicar trabajo.

## Lo que viene: construir en público

Esta web no es solo un portfolio. A partir de ahora quiero usarla como un diario de desarrollo. Tengo varios productos en distintas fases:

- **Quedamos**, una app social para organizar planes con amigos, que ya está en beta con un grupo reducido de testers
- **DevTools Suite**, un conjunto de herramientas para desarrolladores que uso yo mismo todos los días
- **Swiss Knife**, una app Android con utilidades cotidianas que estoy preparando para Play Store
- Y otros proyectos más ambiciosos que todavía están en fase de idea

Mi intención es ir contando aquí cómo los construyo. No tutoriales genéricos, sino decisiones reales: por qué elijo una tecnología sobre otra, cómo resuelvo problemas concretos, qué funciona y qué no. El tipo de contenido que a mí me habría gustado encontrar cuando empecé.

## El stack completo

Por si te interesa el detalle técnico, esto es lo que hay bajo el capó:

- **Astro 5** con generación estática
- **React** solo para componentes interactivos (islands)
- **Tailwind CSS** con custom properties para el tema
- **TypeScript** en modo estricto
- **Framer Motion** para animaciones, con respeto por `prefers-reduced-motion`
- **Satori + Sharp** para generar imágenes Open Graph dinámicas por cada post
- **Vercel** para hosting con deploy automático en cada push
- **GitHub Actions** para CI: lint, type checking, build y tests antes de mergear

Todo el código es open source. Si te interesa cómo está hecho, el repositorio está enlazado en cada proyecto de la web.

## Siguiente paso

Escribir. Publicar. Iterar. La web ya está donde quería que estuviera. Ahora toca llenarla de contenido real y seguir construyendo productos. Si algo de lo que hago te interesa, quédate por aquí. Esto acaba de empezar.
