import { getAuthor, getDomain } from './config';
import type { Locale } from '../i18n/translations';
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
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: posts.map((post, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: post.url,
        name: post.headline,
      })),
    },
  };
}
