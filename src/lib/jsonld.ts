import { getAuthor, getDomain } from './config';
import { t, type Locale } from '../i18n/translations';
import type { PostEntry } from './posts';
import { tagLabel } from './tags';

function personUrl(lang: Locale): string {
  return lang === 'es' ? `${getDomain()}/es/` : `${getDomain()}/`;
}

function personSameAs(author: ReturnType<typeof getAuthor>): string[] {
  return [
    `https://github.com/${author.github}`,
    `https://www.linkedin.com/in/${author.linkedin}/`,
    `https://x.com/${author.twitter}`,
  ];
}

export function serializeJsonLd(node: unknown): string {
  return JSON.stringify(node).replace(/</g, '\\u003c');
}

export function personJsonLd(lang: Locale): Record<string, unknown> {
  const author = getAuthor();
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    url: personUrl(lang),
    email: `mailto:${author.email}`,
    jobTitle: 'Software Engineer',
    sameAs: personSameAs(author),
  };
}

interface BlogPostingArgs {
  post: PostEntry;
  lang: Locale;
  url: string;
  image: string;
  wordCount: number;
  readingTimeMinutes: number;
}

export function blogPostingJsonLd({
  post,
  lang,
  url,
  image,
  wordCount,
  readingTimeMinutes,
}: BlogPostingArgs): Record<string, unknown> {
  const author = getAuthor();
  const domain = getDomain();
  const person = {
    '@type': 'Person',
    name: author.name,
    url: personUrl(lang),
    sameAs: personSameAs(author),
  };
  const { title, description, date, updated, tags } = post.data;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    datePublished: date.toISOString(),
    dateModified: (updated ?? date).toISOString(),
    keywords: tags.map((tag) => tagLabel(tag, lang)).join(', '),
    inLanguage: lang,
    wordCount,
    timeRequired: `PT${readingTimeMinutes}M`,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    image,
    author: person,
    publisher: person,
    isPartOf: {
      '@type': 'Blog',
      '@id': `${domain}${lang === 'es' ? '/es' : ''}/blog/`,
    },
  };
}

interface Link {
  name: string;
  url: string;
}

function itemList(items: Link[]): Record<string, unknown> {
  return {
    '@type': 'ItemList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: item.url,
      name: item.name,
    })),
  };
}

interface CollectionPageArgs {
  lang: Locale;
  title: string;
  description: string;
  url: string;
  posts: { headline: string; url: string }[];
}

export function collectionPageJsonLd({
  lang,
  title,
  description,
  url,
  posts,
}: CollectionPageArgs): Record<string, unknown> {
  const domain = getDomain();
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url,
    inLanguage: lang,
    isPartOf: {
      '@type': 'Blog',
      '@id': `${domain}${lang === 'es' ? '/es' : ''}/blog/`,
    },
    mainEntity: itemList(posts.map((post) => ({ name: post.headline, url: post.url }))),
  };
}

interface ProjectsPageArgs {
  lang: Locale;
  title: string;
  description: string;
  url: string;
  projects: Link[];
}

export function projectsPageJsonLd({
  lang,
  title,
  description,
  url,
  projects,
}: ProjectsPageArgs): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url,
    inLanguage: lang,
    isPartOf: { '@type': 'WebSite', url: personUrl(lang) },
    mainEntity: itemList(projects),
  };
}

export function breadcrumbJsonLd(crumbs: Link[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

export function sectionBreadcrumbJsonLd(
  lang: Locale,
  section: 'blog' | 'projects',
  page: Link,
): Record<string, unknown> {
  return breadcrumbJsonLd([
    { name: t('nav.home', lang), url: personUrl(lang) },
    {
      name: t(section === 'blog' ? 'writing.title' : 'projects.title', lang),
      url: `${personUrl(lang)}${section}/`,
    },
    page,
  ]);
}
