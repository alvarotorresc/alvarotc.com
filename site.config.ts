export type NavItem = { key: string; href: string; requires?: 'experience' };

export const siteConfig = {
  name: 'Álvaro Torres Carrasco',
  tagline: 'Backend developer',
  domain: 'https://alvarotc.com',
  description: {
    en: 'Backend developer. Offline-first apps, self-hosted infrastructure, free software.',
    es: 'Desarrollador backend. Apps offline-first, infraestructura autoalojada, software libre.',
  },

  contactEndpoint: 'https://contact.alvarotc.com/send',
  calLink: 'https://cal.com/alvarotc',

  author: {
    name: 'Álvaro Torres Carrasco',
    email: 'hello@alvarotc.com',
    github: 'alvarotorresc',
    linkedin: 'alvaro-torres-carrasco',
    twitter: 'torresc_alvaro',
    devto: 'alvarotorresc',
  },

  nav: [
    { key: 'nav.about', href: '/about' },
    { key: 'nav.projects', href: '/#projects' },
    { key: 'nav.experience', href: '/#experience', requires: 'experience' },
    { key: 'nav.writing', href: '/blog' },
    { key: 'nav.stats', href: '/stats' },
    { key: 'nav.cv', href: '/cv' },
  ] as NavItem[],

  social: [
    { platform: 'github', url: 'https://github.com/alvarotorresc' },
    { platform: 'linkedin', url: 'https://www.linkedin.com/in/alvaro-torres-carrasco/' },
    { platform: 'twitter', url: 'https://x.com/torresc_alvaro' },
    { platform: 'devto', url: 'https://dev.to/alvarotorresc' },
  ],
};
