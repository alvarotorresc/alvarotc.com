import type { Locale } from '../i18n/translations';

/** Public CV PDF of each language, served from public/cv/. */
export function cvPdfPath(lang: Locale): string {
  return `/cv/Alvaro_Torres_Carrasco_CV_${lang === 'es' ? 'ES' : 'EN'}.pdf`;
}
