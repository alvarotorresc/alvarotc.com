import type { Locale } from '../i18n/translations';

const LABELS: Record<Locale, Record<string, string>> = {
  en: {
    finanzas: 'finance',
    producto: 'product',
  },
  es: {
    process: 'proceso',
    observability: 'observabilidad',
    privacy: 'privacidad',
    projects: 'proyectos',
  },
};

export function tagLabel(slug: string, lang: Locale): string {
  return LABELS[lang][slug] ?? slug;
}
