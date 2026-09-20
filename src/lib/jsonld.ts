import { getAuthor } from './config';
import type { Locale } from '../i18n/translations';

export function personJsonLd(lang: Locale): Record<string, unknown> {
  const author = getAuthor();
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    url: lang === 'es' ? 'https://alvarotc.com/es/' : 'https://alvarotc.com',
    email: `mailto:${author.email}`,
    jobTitle: lang === 'es' ? 'Desarrollador backend' : 'Backend developer',
    sameAs: [
      `https://github.com/${author.github}`,
      `https://www.linkedin.com/in/${author.linkedin}/`,
      `https://x.com/${author.twitter}`,
    ],
  };
}
