import type { Locale } from '../i18n/translations';

const EN_LABELS: Record<string, string> = {
  proceso: 'process',
  observabilidad: 'observability',
  privacidad: 'privacy',
  finanzas: 'finance',
  producto: 'product',
  proyectos: 'projects',
};

export function tagLabel(slug: string, lang: Locale): string {
  if (lang === 'en' && slug in EN_LABELS) return EN_LABELS[slug];
  return slug;
}
