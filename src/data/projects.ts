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

export const projects: Project[] = [
  {
    name: 'Sin Herencia',
    description: {
      es: 'Blog político semanal con análisis generacional',
      en: 'Weekly political blog with generational analysis',
    },
    repo: 'https://github.com/alvarotorresc/sinherencia',
    url: 'https://sinherencia.com',
    category: 'flagship',
    visible: true,
    featured: true,
    order: 1,
  },
  {
    name: 'Quedamos',
    description: {
      es: 'App social para organizar planes con amigos',
      en: 'Social app to organize plans with friends',
    },
    repo: 'https://github.com/alvarotorresc/quedamos-app',
    url: 'https://quedamos-app-mobile.vercel.app',
    category: 'flagship',
    visible: true,
    featured: true,
    order: 2,
  },
  {
    name: 'PokeUtils',
    description: {
      es: 'Utilidades Pokémon con vanilla JavaScript',
      en: 'Pokémon utilities with vanilla JavaScript',
    },
    repo: 'https://github.com/alvarotorresc/PokeUtils',
    url: 'https://pokeutils.alvarotc.com',
    category: 'lab',
    visible: true,
    featured: true,
    order: 3,
  },
  {
    name: 'DevTools Suite',
    description: {
      es: 'UUID generator, hash calculator, JWT decoder y más',
      en: 'UUID generator, hash calculator, JWT decoder and more',
    },
    repo: 'https://github.com/alvarotorresc/devtools',
    url: 'https://devtools.alvarotc.com',
    category: 'lab',
    visible: true,
    featured: true,
    order: 4,
  },
  {
    name: 'Swiss Knife',
    description: {
      es: 'Randomizador, ruleta, amigo invisible y más utilidades',
      en: 'Randomizer, wheel, secret santa and more utilities',
    },
    repo: 'https://github.com/alvarotorresc/swiss-knife',
    category: 'lab',
    visible: true,
    featured: true,
    order: 5,
  },
  {
    name: 'create-astro-blog',
    description: {
      es: 'CLI scaffolder para crear blogs con Astro',
      en: 'CLI scaffolder to create blogs with Astro',
    },
    repo: 'https://github.com/alvarotorresc/create-astro-blog',
    url: 'https://www.npmjs.com/package/create-astro-blog',
    category: 'lab',
    visible: true,
    featured: false,
    order: 6,
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
