import { t, type Locale } from '../i18n/translations';
import { heatLevel, heatmapColumnStarts, heatmapWeeks, type StatsData } from './stats';
import type { WritingStats } from './stats';

const STARS_MIN = 10;
const MOST_READ_MAX = 3;

export interface SentencePart {
  text: string;
  mono?: boolean;
}

export interface HeatmapCell {
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
  date: string;
}

export interface HeatmapMonthLabel {
  label: string;
  column: number;
}

export interface HeatmapView {
  columns: HeatmapCell[][];
  monthLabels: HeatmapMonthLabel[];
  legend: string;
  ariaLabel: string;
}

export interface LanguageView {
  name: string;
  percent: string;
  isOther: boolean;
}

export interface TopicView {
  tag: string;
  count: number;
  big: boolean;
}

export interface MostReadItem {
  href: string;
  title: string;
  views: string;
}

export interface CodeView {
  githubUrl: string;
  commits: string;
  commitsLabel: string;
  contributionsHeading: string;
  contributionsIntro: SentencePart[];
  heatmap: HeatmapView;
  repos: string;
  reposLabel: string;
  reposIntro: string;
  languages: LanguageView[];
  mostActiveRepo: SentencePart[] | null;
  stars: SentencePart[] | null;
}

export interface WritingView {
  posts: string;
  postsLabel: string;
  wordsIntro: SentencePart[];
  topics: TopicView[];
  otherTopicsText: string | null;
  views: string | null;
  viewsLabel: string | null;
  viewsIntro: SentencePart[] | null;
  mostRead: MostReadItem[] | null;
}

export interface SiteView {
  cookies: string;
  cookiesLabel: string;
  thirdParty: SentencePart[];
  analyticsText: string | null;
}

export interface StatsPageView {
  lang: Locale;
  title: string;
  subtitle: string;
  lastUpdatedLabel: string | null;
  code: CodeView | null;
  writing: WritingView;
  site: SiteView;
  sourcesText: string | null;
}

function num(n: number, lang: Locale): string {
  const locale = lang === 'es' ? 'es-ES' : 'en-US';
  return n.toLocaleString(locale, { useGrouping: 'always' });
}

function sentence(template: string, values: Record<string, string>): SentencePart[] {
  const parts: SentencePart[] = [];
  const pattern = /\{(\w+)\}/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(template))) {
    if (match.index > lastIndex) parts.push({ text: template.slice(lastIndex, match.index) });
    const value = values[match[1]];
    if (value !== undefined) parts.push({ text: value, mono: true });
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < template.length) parts.push({ text: template.slice(lastIndex) });
  return parts;
}

function monthLabel(date: Date, lang: Locale): string {
  const locale = lang === 'es' ? 'es-ES' : 'en-US';
  return date.toLocaleDateString(locale, { month: 'short', timeZone: 'UTC' }).replace('.', '');
}

function buildHeatmap(
  allContributions: { date: string; count: number }[],
  lang: Locale,
  now: Date,
): HeatmapView {
  const weeks = heatmapWeeks(allContributions, now);
  const starts = heatmapColumnStarts(now);
  const max = Math.max(1, ...weeks.flat());
  const columns: HeatmapCell[][] = weeks.map((week, w) =>
    week.map((count, d) => ({
      count,
      level: heatLevel(count, max),
      date: new Date(starts[w].getTime() + d * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    })),
  );

  const monthLabels: HeatmapMonthLabel[] = [];
  let lastMonth = -1;
  starts.forEach((start, i) => {
    const month = start.getUTCMonth();
    if (month !== lastMonth) {
      monthLabels.push({ label: monthLabel(start, lang), column: i });
      lastMonth = month;
    }
  });

  const activeDays = allContributions.filter((c) => c.count > 0).length;
  const totalContributions = allContributions.reduce((sum, c) => sum + c.count, 0);
  const maxDay = Math.max(0, ...allContributions.map((c) => c.count));

  return {
    columns,
    monthLabels,
    legend: t('stats.heatmapLegend', lang),
    ariaLabel: sentence(t('stats.heatmapAria', lang), {
      days: num(activeDays, lang),
      total: num(totalContributions, lang),
      max: num(maxDay, lang),
    })
      .map((p) => p.text)
      .join(''),
  };
}

function buildLanguages(
  languages: { name: string; percent: number }[],
  lang: Locale,
): LanguageView[] {
  return languages.map((l) => ({
    name: l.name === 'other' ? t('stats.otherLanguage', lang) : l.name,
    percent: `${l.percent}`,
    isOther: l.name === 'other',
  }));
}

function buildCode(
  github: NonNullable<StatsData['github']>,
  lang: Locale,
  now: Date,
  githubUrl: string,
): CodeView {
  const activeDays = github.contributions.filter((c) => c.count > 0).length;
  const totalContributions = github.contributions.reduce((sum, c) => sum + c.count, 0);
  const maxDay = Math.max(0, ...github.contributions.map((c) => c.count));

  return {
    githubUrl,
    commits: num(github.commitsThisYear, lang),
    commitsLabel: t('stats.commits', lang),
    contributionsHeading: t('stats.contributions', lang),
    contributionsIntro: sentence(t('stats.contributionsText', lang), {
      total: num(totalContributions, lang),
      days: num(activeDays, lang),
      max: num(maxDay, lang),
    }),
    heatmap: buildHeatmap(github.contributions, lang, now),
    repos: num(github.publicRepos, lang),
    reposLabel: t('stats.repos', lang),
    reposIntro: t('stats.reposText', lang),
    languages: buildLanguages(github.languages, lang),
    mostActiveRepo: github.mostActiveRepo
      ? sentence(t('stats.mostActiveText', lang), {
          name: github.mostActiveRepo.name,
          commits: num(github.mostActiveRepo.commits30d, lang),
        })
      : null,
    stars:
      github.stars >= STARS_MIN
        ? sentence(t('stats.starsText', lang), { stars: num(github.stars, lang) })
        : null,
  };
}

function buildWriting(writing: WritingStats, umami: StatsData['umami'], lang: Locale): WritingView {
  const bigTopics = writing.topics.filter((topic) => topic.count > 1);
  const otherTopics = writing.topics.length - bigTopics.length;

  return {
    posts: num(writing.posts, lang),
    postsLabel: t('stats.postsTwoLangs', lang),
    wordsIntro: sentence(t('stats.wordsText', lang), { words: num(writing.words, lang) }),
    topics: bigTopics.map((topic) => ({ ...topic, big: true })),
    otherTopicsText:
      otherTopics > 0
        ? sentence(t('stats.otherTopicsText', lang), { count: num(otherTopics, lang) })
            .map((p) => p.text)
            .join('')
        : null,
    views: umami ? num(umami.views30d, lang) : null,
    viewsLabel: umami ? t('stats.views', lang) : null,
    viewsIntro: umami ? sentence(t('stats.viewsText', lang), {}) : null,
    mostRead:
      umami && umami.mostRead.length > 0
        ? umami.mostRead.slice(0, MOST_READ_MAX).map((page) => ({
            href: page.path,
            title: page.title,
            views: sentence(t('stats.viewsCount', lang), { views: num(page.views, lang) })
              .map((p) => p.text)
              .join(''),
          }))
        : null,
  };
}

function buildSite(analytics: boolean, lang: Locale): SiteView {
  return {
    cookies: '0',
    cookiesLabel: t('stats.cookies', lang),
    thirdParty: sentence(t('stats.thirdPartyText', lang), { n: '0' }),
    analyticsText: analytics ? t('stats.analyticsText', lang) : null,
  };
}

export interface BuildStatsViewInput {
  stats: StatsData;
  writing: WritingStats;
  lang: Locale;
  now: Date;
  githubUrl: string;
  analytics: boolean;
}

export function buildStatsView({
  stats,
  writing,
  lang,
  now,
  githubUrl,
  analytics,
}: BuildStatsViewInput): StatsPageView {
  return {
    lang,
    title: t('stats.title', lang),
    subtitle: t('stats.subtitle', lang),
    lastUpdatedLabel: stats.generatedAt
      ? new Date(stats.generatedAt).toLocaleString(lang === 'es' ? 'es-ES' : 'en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
          timeZone: 'UTC',
        })
      : null,
    code: stats.github ? buildCode(stats.github, lang, now, githubUrl) : null,
    writing: buildWriting(writing, stats.umami, lang),
    site: buildSite(analytics, lang),
    sourcesText: stats.generatedAt ? t('stats.sourcesText', lang) : null,
  };
}
