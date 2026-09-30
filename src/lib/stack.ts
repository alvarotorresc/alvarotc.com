import type { Locale } from '../i18n/translations';

export type StackGroup = { label: string; items: string[] };

export function getStackGroups(lang: Locale): StackGroup[] {
  return [
    { label: 'Backend', items: ['Python, Django', 'Node, NestJS, TypeScript', 'Java 17'] },
    {
      label: lang === 'es' ? 'Datos' : 'Data',
      items: ['PostgreSQL, Oracle', 'MongoDB, Redis', 'Celery'],
    },
    { label: 'Infra', items: ['Linux, Docker', 'AWS, Hetzner', 'GitHub Actions, Jenkins'] },
    { label: 'Frontend', items: ['React, Astro', 'Angular', 'Tailwind, Capacitor'] },
  ];
}
