import { describe, it, expect } from 'vitest';
import {
  breadcrumbJsonLd,
  projectsPageJsonLd,
  sectionBreadcrumbJsonLd,
  serializeJsonLd,
} from '../src/lib/jsonld';

describe('serializeJsonLd', () => {
  it('escapes < so a value cannot close the script tag', () => {
    const node = { name: '</script><script>alert(1)</script>' };
    const out = serializeJsonLd(node);
    expect(out).not.toContain('</script>');
    expect(out).not.toContain('<');
    expect(JSON.parse(out)).toEqual(node);
  });
});

describe('breadcrumbJsonLd', () => {
  it('numbers the crumbs from 1 and links each one', () => {
    expect(
      breadcrumbJsonLd([
        { name: 'Inicio', url: 'https://alvarotc.com/es/' },
        { name: 'Artículos', url: 'https://alvarotc.com/es/blog/' },
      ]),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://alvarotc.com/es/' },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Artículos',
          item: 'https://alvarotc.com/es/blog/',
        },
      ],
    });
  });
});

describe('sectionBreadcrumbJsonLd', () => {
  const names = (jsonLd: Record<string, any>) =>
    jsonLd.itemListElement.map((item: Record<string, string>) => [item.name, item.item]);

  it('goes Inicio → Artículos → page in Spanish', () => {
    const page = { name: 'Un post', url: 'https://alvarotc.com/es/blog/un-post/' };
    expect(names(sectionBreadcrumbJsonLd('es', 'blog', page))).toEqual([
      ['Inicio', 'https://alvarotc.com/es/'],
      ['Artículos', 'https://alvarotc.com/es/blog/'],
      ['Un post', 'https://alvarotc.com/es/blog/un-post/'],
    ]);
  });

  it('goes Home → Projects → page in English', () => {
    const page = { name: 'Bito', url: 'https://alvarotc.com/projects/bito/' };
    expect(names(sectionBreadcrumbJsonLd('en', 'projects', page))).toEqual([
      ['Home', 'https://alvarotc.com/'],
      ['Projects', 'https://alvarotc.com/projects/'],
      ['Bito', 'https://alvarotc.com/projects/bito/'],
    ]);
  });
});

describe('projectsPageJsonLd', () => {
  const jsonLd = projectsPageJsonLd({
    lang: 'es',
    title: 'Proyectos',
    description: 'Lo que construyo',
    url: 'https://alvarotc.com/es/projects/',
    projects: [
      { name: 'Bito', url: 'https://alvarotc.com/es/projects/bito/' },
      { name: 'Huellas', url: 'https://alvarotc.com/es/projects/huellas/' },
    ],
  }) as Record<string, any>;

  it('is a CollectionPage of the Spanish site', () => {
    expect(jsonLd).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Proyectos',
      description: 'Lo que construyo',
      url: 'https://alvarotc.com/es/projects/',
      inLanguage: 'es',
      isPartOf: { '@type': 'WebSite', url: 'https://alvarotc.com/es/' },
    });
  });

  it('lists the projects in order', () => {
    expect(jsonLd.mainEntity['@type']).toBe('ItemList');
    expect(jsonLd.mainEntity.itemListElement).toEqual([
      {
        '@type': 'ListItem',
        position: 1,
        url: 'https://alvarotc.com/es/projects/bito/',
        name: 'Bito',
      },
      {
        '@type': 'ListItem',
        position: 2,
        url: 'https://alvarotc.com/es/projects/huellas/',
        name: 'Huellas',
      },
    ]);
  });
});
