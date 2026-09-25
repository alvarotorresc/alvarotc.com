import type { Locale } from '../i18n/translations';

export function mirroredPath(lang: Locale, currentPath: string): string {
  if (lang === 'es') return currentPath.replace(/^\/es(?=\/|$)/, '') || '/';
  return currentPath === '/' ? '/es/' : `/es${currentPath}`;
}

export function pagePath(href: string): string {
  const match = href.match(/^(\/(?!\/)[^?#]*)(.*)$/);
  if (!match) return href;
  const [, path, rest] = match;
  if (path.endsWith('/') || /\.[a-z0-9]+$/i.test(path)) return href;
  return `${path}/${rest}`;
}
