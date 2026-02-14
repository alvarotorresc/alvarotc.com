# alvarotc.com — Web Personal

> Hub central del ecosistema de Álvaro Torres Carrasco. Portfolio, proyectos y blog técnico.

[![CI](https://github.com/alvarotorresc/alvarotc-web/actions/workflows/ci.yml/badge.svg)](https://github.com/alvarotorresc/alvarotc-web/actions)
[![Deploy](https://img.shields.io/badge/deploy-vercel-black)](https://alvarotc.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

![Screenshot](./public/screenshot.png)

## Qué es

Web personal de Álvaro Torres Carrasco, Full Stack Developer. Muestra proyectos activos (Flagship y Lab), blog técnico, experiencia y habilidades. Diseño futurista minimalista con dark mode por defecto, animaciones sutiles y rendimiento óptimo.

## Tech Stack

- **Framework**: Astro 5
- **UI Components**: React (islands architecture)
- **Styling**: Tailwind CSS + CSS custom properties
- **Animations**: Framer Motion (solo en React islands)
- **Typography**: Plus Jakarta Sans, JetBrains Mono
- **Build**: TypeScript strict mode
- **Testing**: Vitest
- **Hosting**: Vercel
- **Analytics**: Vercel Analytics

## Desarrollo local

### Requisitos previos

- Node.js >= 20.0.0
- npm (viene con Node.js)

### Instalación

```bash
# Clonar el repo
git clone https://github.com/alvarotorresc/alvarotc-web.git
cd alvarotc-web

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El sitio estará disponible en `http://localhost:4321`

### Variables de entorno

No se requieren variables de entorno para desarrollo local. Para producción con analytics:

| Variable              | Descripción            | Requerido |
| --------------------- | ---------------------- | --------- |
| `VERCEL_ANALYTICS_ID` | ID de Vercel Analytics | No        |

## Scripts disponibles

| Comando           | Descripción                             |
| ----------------- | --------------------------------------- |
| `npm run dev`     | Servidor de desarrollo con hot reload   |
| `npm run build`   | Build de producción (con type checking) |
| `npm run preview` | Preview del build localmente            |
| `npm run lint`    | ESLint + Prettier check                 |
| `npm run format`  | Formatear código con Prettier           |
| `npm test`        | Ejecutar tests con Vitest               |
| `npm run astro`   | CLI de Astro                            |

## Arquitectura

### Estructura del proyecto

```
alvarotc-web/
├── src/
│   ├── components/
│   │   ├── layout/          # Header, Footer, ThemeToggle
│   │   ├── home/            # Componentes homepage (Hero, Stats, Skills)
│   │   ├── blog/            # PostCard, ShareButtons
│   │   ├── projects/        # ProjectGrid, ProjectCard
│   │   ├── about/           # Timeline, Experience
│   │   └── ui/              # Componentes reutilizables
│   ├── content/
│   │   ├── posts/           # Blog posts (.md)
│   │   └── projects/        # Proyectos (.md)
│   ├── layouts/             # BaseLayout, PageLayout, BlogPostLayout
│   ├── pages/               # Rutas de la app
│   ├── lib/                 # Utils, config, OG generation
│   └── styles/              # Global CSS + tema
├── public/                  # Assets estáticos
└── tests/                   # Tests con Vitest
```

### Estrategia de rendimiento

- **Islands Architecture**: React solo se carga donde se necesita (`client:visible`, `client:load`)
- **Animaciones condicionales**: Framer Motion solo en componentes interactivos
- **Respeto a `prefers-reduced-motion`**: Todas las animaciones se desactivan automáticamente
- **OG images cacheadas**: Generación dinámica con cache infinito
- **CSS custom properties**: Tema sin JavaScript flash

### Content Collections

Dos colecciones principales:

- **posts**: Blog posts con title, description, date, tags, image
- **projects**: Proyectos con category (flagship/lab), status, stack, urls

## Roadmap

- [x] Homepage con hero animado
- [x] Página About con timeline
- [x] Sistema de proyectos con Content Collections
- [x] Blog con markdown, RSS y OG images
- [x] Dark/light theme toggle
- [x] Responsive completo
- [ ] Newsletter integration (Buttondown)
- [ ] Búsqueda en blog
- [ ] Tags filtering en blog
- [ ] Analytics dashboard

## Licencia

MIT — ver [LICENSE](./LICENSE)
