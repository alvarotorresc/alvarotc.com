import type { Locale } from '../i18n/translations';

export function mirroredPath(lang: Locale, currentPath: string): string {
  if (lang === 'es') return currentPath.replace(/^\/es(?=\/|$)/, '') || '/';
  return currentPath === '/' ? '/es/' : `/es${currentPath}`;
}
