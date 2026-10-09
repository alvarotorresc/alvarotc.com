export type NavItem = { key: string; href: string; requires?: 'experience' };

export const siteConfig = {
  name: 'Álvaro Torres Carrasco',
  tagline: 'Software Engineer',
  domain: 'https://alvarotc.com',
  description: {
    en: 'Software Engineer in Seville. Backend, offline-first apps, self-hosted infrastructure and free software.',
    es: 'Software Engineer en Sevilla. Backend, apps offline-first, infraestructura autoalojada y software libre.',
  },

  contactEndpoint: 'https://contact.alvarotc.com/send',

  author: {
    name: 'Álvaro Torres Carrasco',
    email: 'hello@alvarotc.com',
    github: 'alvarotorresc',
    linkedin: 'alvaro-torres-carrasco',
    twitter: 'torresc_alvaro',
    devto: 'alvarotorresc',
  },

  nav: [
    { key: 'nav.about', href: '/about/' },
    { key: 'nav.projects', href: '/projects/' },
    { key: 'nav.experience', href: '/#experience', requires: 'experience' },
    { key: 'nav.writing', href: '/blog/' },
    // href is ignored: Nav.astro links to the PDF through cvPdfPath(lang)
    { key: 'nav.cv', href: '/cv/' },
  ] as NavItem[],

  social: [
    { platform: 'github', url: 'https://github.com/alvarotorresc' },
    { platform: 'linkedin', url: 'https://www.linkedin.com/in/alvaro-torres-carrasco/' },
    { platform: 'twitter', url: 'https://x.com/torresc_alvaro' },
    { platform: 'devto', url: 'https://dev.to/alvarotorresc' },
  ],
};
