import type { Locale } from '../i18n/translations';

export type StackGroup = { label: string; items: string[] };

export function getStackGroups(lang: Locale): StackGroup[] {
  return [
    { label: 'Backend', items: ['TypeScript, Node', 'NestJS, PostgreSQL', 'Prisma, Redis'] },
    { label: 'Infra', items: ['Linux, Docker, Caddy', 'Hetzner, Cloudflare', 'GitHub Actions'] },
    { label: 'Frontend', items: ['React, Astro', 'Tailwind', 'Capacitor'] },
    {
      label: lang === 'es' ? 'Servicios' : 'Services',
      items: ['Supabase, Vercel', 'Firebase Cloud Messaging', 'Umami'],
    },
  ];
}
