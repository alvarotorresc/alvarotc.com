import type { Locale } from '../i18n/translations';
import { t } from '../i18n/translations';
import { tagLabel } from './tags';
import { getSiteName, getDescription } from './config';
import { getPosts, markdownPath } from './posts';
import { getProjects, projectSlug } from './projects';

export type LlmsLink = { title: string; url: string; description?: string };
export type LlmsSection = { label: string; links: LlmsLink[] };

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function formatLlmsTxt(opts: {
  name: string;
  summary: string;
  sections: LlmsSection[];
}): string {
  const section = (title: string, links: LlmsLink[]): string => {
    if (links.length === 0) return '';
    const items = links
      .map((link) =>
        link.description
          ? `- [${link.title}](${link.url}): ${link.description}`
          : `- [${link.title}](${link.url})`,
      )
      .join('\n');
    return `## ${title}\n\n${items}`;
  };

  const blocks = [
    `# ${opts.name}`,
    `> ${opts.summary}`,
    ...opts.sections.map((s) => section(s.label, s.links)),
  ].filter((block) => block !== '');

  return blocks.join('\n\n').concat('\n');
}

function otherLang(lang: Locale): Locale {
  return lang === 'en' ? 'es' : 'en';
}

function langName(lang: Locale): string {
  return lang === 'en' ? 'English' : 'Español';
}

export async function buildLlmsTxt(lang: Locale, site: string | URL): Promise<string> {
  const secondary = otherLang(lang);
  const prefix = lang === 'es' ? '/es' : '';

  const [primaryPosts, secondaryPosts, projects] = await Promise.all([
    getPosts(lang),
    getPosts(secondary),
    getProjects(lang),
  ]);

  const toArticleLink = (post: Awaited<ReturnType<typeof getPosts>>[number], l: Locale) => ({
    title: post.data.title,
    url: new URL(markdownPath(post, l), site).toString(),
    description: post.data.description,
  });

  const pages: LlmsLink[] = [
    { title: t('nav.about', lang), url: new URL(`${prefix}/about/`, site).toString() },
    { title: t('nav.cv', lang), url: new URL(`${prefix}/cv/`, site).toString() },
    { title: t('nav.stats', lang), url: new URL(`${prefix}/stats/`, site).toString() },
    { title: t('nav.projects', lang), url: new URL(`${prefix}/projects/`, site).toString() },
  ];

  const feeds: LlmsLink[] = [
    {
      title: `RSS (${langName(lang)})`,
      url: new URL(lang === 'es' ? '/es/rss.xml' : '/rss.xml', site).toString(),
    },
    {
      title: `RSS (${langName(secondary)})`,
      url: new URL(secondary === 'es' ? '/es/rss.xml' : '/rss.xml', site).toString(),
    },
    {
      title: `llms-full.txt (${langName(lang)})`,
      url: new URL(lang === 'es' ? '/es/llms-full.txt' : '/llms-full.txt', site).toString(),
    },
    {
      title: `llms-full.txt (${langName(secondary)})`,
      url: new URL(secondary === 'es' ? '/es/llms-full.txt' : '/llms-full.txt', site).toString(),
    },
    {
      title: `llms.txt (${langName(secondary)})`,
      url: new URL(secondary === 'es' ? '/es/llms.txt' : '/llms.txt', site).toString(),
    },
  ];

  const primaryLabel = lang === 'en' ? 'Articles' : 'Artículos';
  const secondaryLabel = secondary === 'en' ? 'Articles (English)' : 'Artículos (Español)';
  const projectsLabel = lang === 'en' ? 'Projects' : 'Proyectos';
  const pagesLabel = lang === 'en' ? 'Pages' : 'Páginas';
  const feedsLabel = 'Feeds';

  return formatLlmsTxt({
    name: getSiteName(),
    summary: getDescription(lang),
    sections: [
      { label: primaryLabel, links: primaryPosts.map((post) => toArticleLink(post, lang)) },
      {
        label: secondaryLabel,
        links: secondaryPosts.map((post) => toArticleLink(post, secondary)),
      },
      {
        label: projectsLabel,
        links: projects.map((project) => ({
          title: project.data.name,
          url: new URL(`${prefix}/projects/${projectSlug(project)}/`, site).toString(),
          description: project.data.tagline,
        })),
      },
      { label: pagesLabel, links: pages },
      { label: feedsLabel, links: feeds },
    ],
  });
}

export type LlmsFullEntry = {
  title: string;
  url: string;
  date: Date;
  updated?: Date;
  tags: string[];
  description: string;
  body: string;
  lang: 'en' | 'es';
};

function formatLlmsFullEntry(entry: LlmsFullEntry): string {
  const header = [
    `## ${entry.title}`,
    '',
    `URL: ${entry.url}`,
    `Date: ${isoDate(entry.date)}`,
    `Updated: ${isoDate(entry.updated ?? entry.date)}`,
    `Tags: ${entry.tags.map((tag) => tagLabel(tag, entry.lang)).join(', ')}`,
    `Description: ${entry.description}`,
  ].join('\n');
  return `${header}\n\n${entry.body.trim()}\n`;
}

export function formatLlmsFull(
  entries: LlmsFullEntry[],
  doc: { name: string; summary: string; lang: 'en' | 'es' },
): string {
  const languageLine = doc.lang === 'es' ? 'Idioma: Español' : 'Language: English';
  const header = [`# ${doc.name}`, `> ${doc.summary}`, languageLine].join('\n\n');
  const body = entries.map(formatLlmsFullEntry).join('\n\n');
  return `${header}\n\n${body}\n`;
}

export type PostMarkdownInput = {
  title: string;
  description: string;
  date: Date;
  updated?: Date;
  tags: string[];
  canonical: string;
  language: 'en' | 'es';
  alternate?: string;
  body: string;
};

export function buildPostMarkdown(input: PostMarkdownInput): string {
  const lines = [
    '---',
    `title: ${JSON.stringify(input.title)}`,
    `description: ${JSON.stringify(input.description)}`,
    `date: ${JSON.stringify(isoDate(input.date))}`,
    `updated: ${JSON.stringify(isoDate(input.updated ?? input.date))}`,
    `tags: [${input.tags.map((tag) => JSON.stringify(tagLabel(tag, input.language))).join(', ')}]`,
    `canonical: ${JSON.stringify(input.canonical)}`,
    `language: ${JSON.stringify(input.language)}`,
  ];
  if (input.alternate) lines.push(`alternate: ${JSON.stringify(input.alternate)}`);
  lines.push('---', '', input.body.trim(), '');
  return lines.join('\n');
}
