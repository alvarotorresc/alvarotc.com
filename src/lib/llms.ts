import { tagLabel } from './tags';

export type LlmsLink = { title: string; url: string; description?: string };

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function formatLlmsTxt(opts: {
  name: string;
  summary: string;
  articlesEn: LlmsLink[];
  articlesEs: LlmsLink[];
  projects: LlmsLink[];
  pages: LlmsLink[];
  feeds: LlmsLink[];
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
    section('Articles', opts.articlesEn),
    section('Artículos (Español)', opts.articlesEs),
    section('Projects', opts.projects),
    section('Pages', opts.pages),
    section('Feeds', opts.feeds),
  ].filter((block) => block !== '');

  return blocks.join('\n\n').concat('\n');
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
    `# ${entry.title}`,
    '',
    `URL: ${entry.url}`,
    `Date: ${isoDate(entry.date)}`,
    `Updated: ${isoDate(entry.updated ?? entry.date)}`,
    `Tags: ${entry.tags.map((tag) => tagLabel(tag, entry.lang)).join(', ')}`,
    `Description: ${entry.description}`,
  ].join('\n');
  return `${header}\n\n${entry.body.trim()}\n`;
}

export function formatLlmsFull(entries: LlmsFullEntry[]): string {
  return entries.map(formatLlmsFullEntry).join('\n---\n\n');
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
