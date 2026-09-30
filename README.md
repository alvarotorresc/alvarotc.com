# alvarotc.com

> Mi espacio personal en internet. Portfolio, proyectos y blog sobre desarrollo de software.

[![Deploy](https://img.shields.io/badge/deploy-vercel-black)](https://alvarotc.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 👋 Sobre esta web

Este es mi hub personal donde comparto mi trabajo como desarrollador de software. Aquí encontrarás:

- **Proyectos**: Mis aplicaciones activas (Flagship) y experimentos (Lab)
- **Blog**: Artículos sobre desarrollo web, tecnología y programación
- **Bilingüe**: Todo el contenido disponible en español e inglés

## 🚀 Proyectos destacados

### Flagship

- **Quedamos** — App social para organizar planes con amigos
- **Guitar App** — Herramientas para guitarristas con Web Audio API
- **Libroteca** — _Próximamente_

### Lab

- **create-astro-blog** — CLI para crear blogs con Astro
- **PokeUtils** — Utilidades Pokémon con vanilla JavaScript
- **DevTools** — Suite de herramientas para desarrolladores

## ✨ Características

- 🌍 Contenido bilingüe (ES/EN) con traducción automática
- 🌙 Diseño minimalista dark mode
- ⚡ Rendimiento optimizado (Lighthouse 95+)
- 📱 Completamente responsive
- 🔍 SEO optimizado con sitemap y structured data
- 📝 Blog con RSS feed

## 🛠️ Stack técnico

Astro 5 · React · TypeScript · Tailwind CSS · Vercel

## 💻 Desarrollo local

```bash
# Clonar e instalar
git clone https://github.com/alvarotorresc/alvarotc-web.git
cd alvarotc-web
npm install

# Desarrollo
npm run dev          # → http://localhost:4321

# Traducción
npm run translate    # Traduce posts ES → EN con DeepL

# Build
npm run build        # Build de producción
npm run preview      # Preview del build
```

## 📄 Crear un post

1. Escribe en español en `src/content/posts/mi-post.md`
2. Haz commit → el hook traduce automáticamente a inglés
3. Tu post estará en `/blog/my-post` (EN) y `/es/blog/mi-post` (ES)

## Licencia

El código fuente se publica bajo la [licencia MIT](./LICENSE).

Los textos, las imágenes y el contenido del blog son © Álvaro Torres Carrasco, todos los derechos reservados salvo indicación en contrario.
