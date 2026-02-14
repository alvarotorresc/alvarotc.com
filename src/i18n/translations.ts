export const translations = {
  en: {
    'site.title': 'Alvaro Torres Carrasco',
    'site.tagline': 'Software Developer',
    'nav.writing': 'Writing',
    'nav.projects': 'Projects',
    'nav.viewAll': 'View all',
    'nav.back': 'Back',
    'footer.allPosts': 'All posts',
    'footer.allProjects': 'All projects',
    'post.minRead': 'min read',
    'lang.spanish': 'Español',
    'lang.english': 'English',
  },
  es: {
    'site.title': 'Alvaro Torres Carrasco',
    'site.tagline': 'Desarrollador de Software',
    'nav.writing': 'Escritos',
    'nav.projects': 'Proyectos',
    'nav.viewAll': 'Ver todos',
    'nav.back': 'Volver',
    'footer.allPosts': 'Todos los posts',
    'footer.allProjects': 'Todos los proyectos',
    'post.minRead': 'min de lectura',
    'lang.spanish': 'Español',
    'lang.english': 'English',
  },
};

export type Locale = 'en' | 'es';

export function t(key: keyof typeof translations.en, locale: Locale = 'en'): string {
  return translations[locale][key] || translations.en[key];
}
