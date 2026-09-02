export interface Project {
  name: string;
  description: { es: string; en: string };
  repo?: string;
  url?: string;
  category: 'flagship' | 'lab';
  visible: boolean;
  featured: boolean;
  order: number;
}

// Los cinco primeros coinciden con los repos fijados en github.com/alvarotorresc.
export const projects: Project[] = [
  {
    name: 'Bito',
    description: {
      es: 'Hábitos que se quedan. App de hábitos para Android, offline-first: sin cuentas ni nube',
      en: 'Habits that stick. Offline-first habit tracker for Android: no accounts, no cloud',
    },
    repo: 'https://github.com/alvarotorresc/bito',
    url: 'https://bito.alvarotc.com',
    category: 'flagship',
    visible: true,
    featured: true,
    order: 1,
  },
  {
    name: 'Quedamos',
    description: {
      es: 'Coordina quedadas con tu grupo: disponibilidad compartida, planes y votaciones',
      en: 'Coordinate meetups with your group: shared availability, plans and votes',
    },
    repo: 'https://github.com/alvarotorresc/quedamos-app',
    url: 'https://quedamos.alvarotc.com',
    category: 'flagship',
    visible: true,
    featured: true,
    order: 2,
  },
  {
    name: 'BaseCero',
    description: {
      es: 'Tu dinero, desde cero. Finanzas personales que viven enteras en tu dispositivo',
      en: 'Your money, from scratch. Personal finance that lives entirely on your device',
    },
    repo: 'https://github.com/alvarotorresc/basecero',
    url: 'https://basecero.alvarotc.com',
    category: 'flagship',
    visible: true,
    featured: true,
    order: 3,
  },
  {
    name: 'PokeUtils',
    description: {
      es: 'Tu guía Pokémon retro: análisis competitivo, crianza y Pokédex completa',
      en: 'Your retro Pokémon guide: competitive analysis, breeding tools and a full Pokédex',
    },
    repo: 'https://github.com/alvarotorresc/PokeUtils',
    url: 'https://pokeutils.alvarotc.com',
    category: 'lab',
    visible: true,
    featured: true,
    order: 4,
  },
  {
    name: 'create-astro-blog',
    description: {
      es: 'Crea un blog con Astro, personalizable, con un solo comando',
      en: 'Create a customizable Astro blog with one command',
    },
    repo: 'https://github.com/alvarotorresc/create-astro-blog',
    url: 'https://www.npmjs.com/package/create-astro-blog',
    category: 'lab',
    visible: true,
    featured: true,
    order: 5,
  },
  // Ocultos desde 2026-09-02: fuera de los cinco fijados. visible: true para recuperarlos.
  {
    name: 'DevTools Suite',
    description: {
      es: 'UUID generator, hash calculator, JWT decoder y más',
      en: 'UUID generator, hash calculator, JWT decoder and more',
    },
    repo: 'https://github.com/alvarotorresc/devtools',
    url: 'https://devtools.alvarotc.com',
    category: 'lab',
    visible: false,
    featured: false,
    order: 6,
  },
  {
    name: 'Swiss Knife',
    description: {
      es: 'Randomizador, ruleta, amigo invisible y más utilidades',
      en: 'Randomizer, wheel, secret santa and more utilities',
    },
    repo: 'https://github.com/alvarotorresc/swiss-knife',
    category: 'lab',
    visible: false,
    featured: false,
    order: 7,
  },
  {
    name: 'Sin Herencia',
    description: {
      es: 'Blog político semanal con análisis generacional',
      en: 'Weekly political blog with generational analysis',
    },
    repo: 'https://github.com/alvarotorresc/sinherencia',
    url: 'https://sinherencia.com',
    category: 'flagship',
    visible: false,
    featured: false,
    order: 8,
  },
  // Set visible: true when ready
  {
    name: 'Guitar App',
    description: {
      es: 'Herramientas para guitarristas con Web Audio API',
      en: 'Guitar tools with Web Audio API',
    },
    category: 'flagship',
    visible: false,
    featured: false,
    order: 10,
  },
  {
    name: 'Libroteca',
    description: {
      es: 'El producto principal del ecosistema',
      en: 'The main product of the ecosystem',
    },
    category: 'flagship',
    visible: false,
    featured: false,
    order: 11,
  },
];

export function getVisibleProjects() {
  return projects.filter((p) => p.visible).sort((a, b) => a.order - b.order);
}

export function getFeaturedProjects() {
  return projects.filter((p) => p.visible && p.featured).sort((a, b) => a.order - b.order);
}
