import {
  toProjectView,
  type LinkRef,
  type ProjectFields,
  type ProjectView,
  type ResolvedImages,
} from '../../src/lib/project-view';
import type { Locale } from '../../src/i18n/translations';

export const noImages: ResolvedImages = {
  screenshots: [],
  screenshotsFull: [],
  features: [],
  featuresFull: [],
  tools: [],
  toolsFull: [],
};

export const bitoFields: ProjectFields = {
  kind: 'mobile',
  name: 'Bito',
  tagline: 'Registra un hábito en un toque, sin cuentas ni nube.',
  intro: 'La app de hábitos que no te roba tiempo.',
  status: 'publishing',
  platform: 'Android 10+',
  license: 'GPL-3.0',
  url: 'https://bito.alvarotc.com',
  repo: 'https://github.com/alvarotorresc/bito',
  download: {
    url: 'https://github.com/alvarotorresc/bito/releases/download/v1.0.0/app-release.apk',
    label: '4,7 MB',
  },
  terminal: [],
  facts: [
    { label: 'Tamaño del APK', value: '4,7 MB', mono: true },
    { label: 'Red', value: 'Sin permiso de red', mono: false },
  ],
  screenshots: [
    { alt: 'Widget en la pantalla de inicio', caption: 'Widget' },
    { alt: 'Recordatorio con botón de registrar', caption: 'Recordatorio' },
  ],
  featuresIntro: 'Tres formas de registrar, dos sin abrir la app.',
  features: [
    { title: 'Desde la pantalla de inicio', text: 'El widget registra el hábito con un toque.' },
    { title: 'Desde el recordatorio', text: 'La notificación trae su propio botón.' },
    { title: 'Al final del día', text: 'La revisión nocturna.' },
    { title: 'Rachas que no castigan', text: 'Congeladores para días imposibles.' },
  ],
  steps: [],
  playground: { kind: 'pwa', src: 'https://bito.alvarotc.com' },
  tools: [],
  built: [
    'Kotlin, para Android 10+.',
    'Código en [github.com/alvarotorresc/bito](https://github.com/alvarotorresc/bito).',
  ],
  changelog: [
    { version: 'v2.0.0', note: 'Habi como compañera.' },
    { version: 'v1.0.0', date: new Date('2026-08-26'), note: 'Primera versión pública.' },
    { version: 'v0.1.0', note: 'El prototipo de 24 horas.' },
  ],
};

export const bitoImages: ResolvedImages = {
  icon: '/_astro/bito-icon.webp',
  cover: '/_astro/bito-cover.webp',
  illustration: '/_astro/habi.webp',
  screenshots: ['/_astro/widget.webp', '/_astro/reminder.webp'],
  screenshotsFull: ['/_astro/widget-full.webp', '/_astro/reminder-full.webp'],
  features: ['/_astro/widget.webp', '/_astro/reminder.webp', '/_astro/review.webp', undefined],
  featuresFull: [
    '/_astro/widget-full.webp',
    '/_astro/reminder-full.webp',
    '/_astro/review-full.webp',
    undefined,
  ],
  tools: [],
  toolsFull: [],
};

export const pokeFields: ProjectFields = {
  kind: 'web',
  name: 'PokeUtils',
  tagline: 'Tu guía Pokémon retro: análisis competitivo, crianza y Pokédex completa.',
  status: 'published',
  url: 'https://pokeutils.alvarotc.com',
  repo: 'https://github.com/alvarotorresc/PokeUtils',
  terminal: [],
  facts: [{ label: 'Idiomas', value: 'Español e inglés', mono: false }],
  screenshots: [{ alt: 'Pokédex con filtros', caption: 'Pokédex' }],
  features: [{ title: 'Tu equipo', text: 'Hasta seis.' }],
  steps: [],
  playground: { kind: 'iframe', src: 'https://pokeutils.alvarotc.com' },
  toolsIntro: 'Cada herramienta en su dirección.',
  tools: [
    { name: 'Tabla de tipos', group: 'Datos', text: 'Efectividad por tipo.' },
    {
      name: 'Pokédex',
      group: 'Pokédex',
      text: 'Los 1025 Pokémon.',
      href: 'https://pokeutils.alvarotc.com/#/pokedex',
    },
  ],
  built: [],
  changelog: [{ version: 'v1.0.0', date: new Date('2026-08-28'), note: '[DATO]' }],
};

export const pokeImages: ResolvedImages = {
  icon: '/_astro/poke-icon.webp',
  cover: '/_astro/poke-cover.webp',
  screenshots: ['/_astro/pokedex.webp'],
  screenshotsFull: ['/_astro/pokedex-full.webp'],
  features: ['/_astro/team.webp'],
  featuresFull: ['/_astro/team-full.webp'],
  tools: ['/_astro/types.webp', undefined],
  toolsFull: ['/_astro/types-full.webp', undefined],
};

export const baseceroFields: ProjectFields = {
  kind: 'hybrid',
  name: 'BaseCero',
  tagline: 'Tu dinero, desde cero.',
  status: 'published',
  platform: 'Navegador, en escritorio y móvil',
  license: 'MIT',
  url: 'https://basecero.alvarotc.com',
  repo: 'https://github.com/alvarotorresc/basecero',
  terminal: [],
  facts: [],
  screenshots: [{ alt: 'Lista de movimientos', caption: 'Movimientos' }],
  features: [{ title: 'Patrimonio', text: 'El neto en una sola vista.' }],
  steps: [],
  playground: { kind: 'pwa', src: 'https://basecero.alvarotc.com/app/' },
  tools: [],
  built: [],
  changelog: [{ version: 'v1.0.0', date: new Date('2026-09-02'), note: '[DATO]' }],
};

export const baseceroImages: ResolvedImages = {
  cover: '/_astro/basecero-desktop.webp',
  coverMobile: '/_astro/basecero-phone.webp',
  screenshots: ['/_astro/movements.webp'],
  screenshotsFull: ['/_astro/movements-full.webp'],
  features: ['/_astro/net-worth.webp'],
  featuresFull: ['/_astro/net-worth-full.webp'],
  tools: [],
  toolsFull: [],
};

export const cliFields: ProjectFields = {
  kind: 'cli',
  name: 'create-astro-blog',
  tagline: 'Crea un blog con Astro, personalizable, con un solo comando.',
  status: 'published',
  url: 'https://www.npmjs.com/package/create-astro-blog',
  repo: 'https://github.com/alvarotorresc/create-astro-blog',
  command: 'npx create-astro-blog my-blog',
  terminal: [
    '$ npx create-astro-blog my-blog',
    '',
    '✔ Blog name: › My Blog',
    'Installing dependencies...',
  ],
  facts: [{ label: 'Node', value: '[DATO]', mono: true }],
  screenshots: [],
  featuresIntro: 'Un blog estático con Astro 5.',
  features: [
    { title: 'Blog estático con Astro 5', text: 'Páginas generadas en el build.' },
    { title: 'RSS', text: 'Feed listo para quien lee con lector.' },
  ],
  steps: [
    { title: 'Nombre y tagline', text: 'El nombre sale del directorio.' },
    { title: 'Dominio', text: 'Para las URL canónicas y el SEO.' },
  ],
  stepsIntro: 'El CLI hace seis preguntas.',
  after: 'cd my-blog && npm run dev',
  tools: [],
  built: [],
  changelog: [{ version: '[DATO]', note: '[DATO]' }],
};

export const sparseFields: ProjectFields = {
  kind: 'mobile',
  name: 'Quedamos',
  tagline: 'Coordina quedadas con tu grupo.',
  status: 'beta',
  license: 'AGPL-3.0',
  url: 'https://quedamos.alvarotc.com',
  repo: 'https://github.com/alvarotorresc/quedamos-app',
  terminal: [],
  facts: [],
  screenshots: [],
  features: [],
  steps: [],
  tools: [],
  built: [],
  changelog: [],
};

export function makeView(
  fields: ProjectFields,
  images: ResolvedImages = noImages,
  lang: Locale = 'es',
  post?: LinkRef,
): ProjectView {
  return toProjectView(fields, images, lang, post);
}
