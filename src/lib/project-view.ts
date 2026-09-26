import { t, statusLabel, type Locale } from '../i18n/translations';
import { formatShortDate } from './utils';
import { tone, type StatusTone } from './projects';

export type ProjectKind = 'mobile' | 'web' | 'hybrid' | 'cli';

export interface Fact {
  label: string;
  value: string;
  mono: boolean;
}

export interface Step {
  title: string;
  text: string;
}

export interface Shot {
  src: string;
  full: string;
  alt: string;
  caption: string;
}

export interface Feature {
  title: string;
  text: string;
  image?: string;
  full?: string;
}

export interface Tool {
  name: string;
  text: string;
  image?: string;
  full?: string;
  href?: string;
}

export interface ChangelogRow {
  version: string;
  when?: string;
  note: string;
}

export interface NotePart {
  text: string;
  mono?: boolean;
  href?: string;
}

export interface Note {
  title?: string;
  parts: NotePart[];
}

export interface LinkRef {
  href: string;
  label: string;
}

export interface ReleaseEntry {
  version: string;
  date?: Date;
  note: string;
}

export type PlaygroundKind = 'pwa' | 'iframe' | 'video' | 'file';

export interface ViewPlayground {
  kind: PlaygroundKind;
  src: string;
}

export interface ProjectFields {
  kind: ProjectKind;
  name: string;
  tagline: string;
  intro?: string;
  status: string;
  platform?: string;
  license?: string;
  url?: string;
  repo?: string;
  download?: { url: string; label: string };
  command?: string;
  terminal: string[];
  facts: Fact[];
  screenshots: { alt: string; caption: string }[];
  screenshotsIntro?: string;
  featuresIntro?: string;
  features: { title: string; text: string }[];
  toolsIntro?: string;
  tools: { name: string; text: string; href?: string }[];
  steps: Step[];
  stepsIntro?: string;
  after?: string;
  playground?: { kind: PlaygroundKind; src: string };
  built: string[];
  changelog: ReleaseEntry[];
}

export interface ResolvedImages {
  icon?: string;
  cover?: string;
  coverMobile?: string;
  illustration?: string;
  promo?: string;
  screenshots: string[];
  screenshotsFull: string[];
  features: (string | undefined)[];
  featuresFull: (string | undefined)[];
  tools: (string | undefined)[];
  toolsFull: (string | undefined)[];
}

export interface ProjectView {
  lang: Locale;
  kind: ProjectKind;
  name: string;
  tagline: string;
  intro?: string;
  statusLabel: string;
  tone: StatusTone;
  release?: string;
  icon?: string;
  cover?: string;
  coverMobile?: string;
  illustration?: string;
  poster?: string;
  url?: string;
  address?: string;
  repo?: string;
  platform?: string;
  download?: { url: string; label: string };
  command?: string;
  terminal: string[];
  facts: Fact[];
  screenshots: Shot[];
  screenshotsIntro?: string;
  featuresIntro?: string;
  features: Feature[];
  toolsIntro?: string;
  tools: Tool[];
  steps: Step[];
  stepsIntro?: string;
  after?: string;
  post?: LinkRef;
  playground?: ViewPlayground;
  built: string[];
  changelog: ChangelogRow[];
  releases?: LinkRef;
  allProjects: string;
}

export type TerminalLine =
  | { kind: 'blank' }
  | { kind: 'command'; text: string }
  | { kind: 'answer'; label: string; value: string }
  | { kind: 'output'; text: string };

const isNpm = (fields: ProjectFields) =>
  fields.kind === 'cli' && Boolean(fields.url?.includes('npmjs.com'));

export function displayUrl(url: string): string {
  return url
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/^([^/]+)\/$/, '$1');
}

const YOUTUBE_ID = /^[\w-]{11}$/;
const YOUTUBE_PATH = /^\/(?:embed|shorts|live)\/([^/]+)/;

function parseUrl(url: string): URL | undefined {
  try {
    return new URL(url);
  } catch {
    return undefined;
  }
}

export function youtubeWatchUrl(url: string): string | undefined {
  const parsed = parseUrl(url);
  if (!parsed) return undefined;
  const host = parsed.hostname.replace(/^(?:www|m)\./, '');
  let id: string | null | undefined;
  if (host === 'youtu.be') id = parsed.pathname.slice(1);
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    id =
      parsed.pathname === '/watch'
        ? parsed.searchParams.get('v')
        : YOUTUBE_PATH.exec(parsed.pathname)?.[1];
  }
  return id && YOUTUBE_ID.test(id) ? `https://www.youtube.com/watch?v=${id}` : undefined;
}

function viewPlayground(playground: ProjectFields['playground']): ViewPlayground | undefined {
  if (!playground) return undefined;
  if (playground.kind !== 'video') return { kind: playground.kind, src: playground.src };
  const src = youtubeWatchUrl(playground.src);
  return src ? { kind: 'video', src } : undefined;
}

function latestRelease(changelog: ReleaseEntry[]): ReleaseEntry | undefined {
  return changelog.find((entry) => entry.date);
}

export function releaseLabel(changelog: ReleaseEntry[], lang: Locale): string | undefined {
  const last = latestRelease(changelog);
  return last?.date ? `${last.version}, ${formatShortDate(last.date, lang)}` : undefined;
}

export function factRows(fields: ProjectFields, lang: Locale): Fact[] {
  const rows: Fact[] = [];
  if (fields.platform) {
    rows.push({ label: t('project.platform', lang), value: fields.platform, mono: false });
  }
  if (fields.license) {
    rows.push({ label: t('project.license', lang), value: fields.license, mono: true });
  }
  const release = releaseLabel(fields.changelog, lang);
  if (release) rows.push({ label: t('project.lastRelease', lang), value: release, mono: true });
  if (fields.url) {
    rows.push({
      label: t(isNpm(fields) ? 'project.npm' : 'project.web', lang),
      value: displayUrl(fields.url),
      mono: true,
    });
  }
  return [...rows, ...fields.facts];
}

export function changelogRows(changelog: ReleaseEntry[], lang: Locale): ChangelogRow[] {
  const firstDated = changelog.findIndex((entry) => entry.date);
  return changelog.map((entry, i) => ({
    version: entry.version,
    when: entry.date
      ? formatShortDate(entry.date, lang)
      : i < firstDated
        ? t('project.upcoming', lang)
        : undefined,
    note: entry.note,
  }));
}

export function releasesLink(fields: ProjectFields, lang: Locale): LinkRef | undefined {
  if (isNpm(fields) && fields.url) {
    return { href: `${fields.url}?activeTab=versions`, label: t('project.releasesNpm', lang) };
  }
  if (fields.repo) {
    return { href: `${fields.repo}/releases`, label: t('project.releasesGithub', lang) };
  }
  return undefined;
}

export function shotsIntro(fields: ProjectFields, lang: Locale): string | undefined {
  if (fields.screenshotsIntro) return fields.screenshotsIntro;
  const kind = fields.kind;
  if (kind === 'cli') return undefined;
  const last = latestRelease(fields.changelog);
  if (!last) return undefined;
  return t(`project.shotsIntro.${kind}` as const, lang).replace('{version}', last.version);
}

export function parseTerminalLine(line: string): TerminalLine {
  if (line.trim() === '') return { kind: 'blank' };
  if (line.startsWith('$ ')) return { kind: 'command', text: line.slice(2) };
  const answer = /^✔ (.+?) › (.*)$/.exec(line);
  if (answer) return { kind: 'answer', label: answer[1], value: answer[2] };
  return { kind: 'output', text: line.trim() };
}

export function fillParts(
  template: string,
  vars: Record<string, NotePart | undefined>,
): NotePart[] | undefined {
  const parts: NotePart[] = [];
  for (const piece of template.split(/(\{\w+\})/)) {
    if (!piece) continue;
    const name = /^\{(\w+)\}$/.exec(piece)?.[1];
    if (!name) {
      parts.push({ text: piece });
      continue;
    }
    const value = vars[name];
    if (!value) return undefined;
    parts.push(value);
  }
  return parts;
}

export function playgroundNotes(view: ProjectView): Note[] {
  const { lang, playground } = view;
  if (!playground || playground.kind === 'video' || playground.kind === 'file') return [];
  if (view.kind === 'web') {
    const parts = fillParts(t('project.note.web', lang), {
      link: view.url ? { text: t('project.note.webLink', lang), href: view.url } : undefined,
    });
    return parts ? [{ parts }] : [];
  }
  const loads: Note = {
    title: t('project.note.loads.title', lang),
    parts: [{ text: t('project.note.loads.text', lang) }],
  };
  if (view.kind === 'mobile') {
    const apk = fillParts(t('project.note.mobile.apk.text', lang), {
      size: view.download ? { text: view.download.label, mono: true } : undefined,
      platform: view.platform ? { text: view.platform, mono: true } : undefined,
    });
    return [
      {
        title: t('project.note.mobile.tap.title', lang),
        parts: [{ text: t('project.note.mobile.tap.text', lang) }],
      },
      loads,
      ...(apk ? [{ title: t('project.note.mobile.apk.title', lang), parts: apk }] : []),
    ];
  }
  if (view.kind === 'hybrid') {
    const install = fillParts(t('project.note.hybrid.install.text', lang), {
      src: { text: displayUrl(playground.src), mono: true, href: playground.src },
    });
    return [
      {
        title: t('project.note.hybrid.local.title', lang),
        parts: [{ text: t('project.note.hybrid.local.text', lang) }],
      },
      loads,
      ...(install ? [{ title: t('project.note.hybrid.install.title', lang), parts: install }] : []),
    ];
  }
  return [];
}

export function hasMedia(view: ProjectView): boolean {
  return view.kind === 'cli' ? view.terminal.length > 0 : Boolean(view.cover);
}

export function featureBlocks<T extends { image?: unknown }>(
  kind: ProjectKind,
  features: T[],
): T[] {
  if (kind === 'cli') return [];
  return features.filter((feature) => feature.image).slice(0, 3);
}

export function hasLightbox(view: ProjectView): boolean {
  return (
    view.screenshots.length > 0 ||
    featureBlocks(view.kind, view.features).length > 0 ||
    view.tools.some((tool) => tool.image)
  );
}

export function toProjectView(
  fields: ProjectFields,
  images: ResolvedImages,
  lang: Locale,
  post?: LinkRef,
): ProjectView {
  const prefix = lang === 'es' ? '/es' : '';
  return {
    lang,
    kind: fields.kind,
    name: fields.name,
    tagline: fields.tagline,
    intro: fields.intro,
    statusLabel: statusLabel(fields.status, lang),
    tone: tone(fields.status),
    release: releaseLabel(fields.changelog, lang),
    icon: images.icon,
    cover: images.cover,
    coverMobile: images.coverMobile,
    illustration: images.illustration,
    poster: images.promo,
    url: fields.url,
    address: fields.url ? displayUrl(fields.url) : undefined,
    repo: fields.repo,
    platform: fields.platform,
    download: fields.download,
    command: fields.command,
    terminal: fields.terminal,
    facts: factRows(fields, lang),
    screenshots: fields.screenshots.map((shot, i) => ({
      src: images.screenshots[i] ?? '',
      full: images.screenshotsFull[i] ?? '',
      alt: shot.alt,
      caption: shot.caption,
    })),
    screenshotsIntro: shotsIntro(fields, lang),
    featuresIntro: fields.featuresIntro,
    features: fields.features.map((feature, i) => ({
      title: feature.title,
      text: feature.text,
      image: images.features[i],
      full: images.featuresFull[i],
    })),
    toolsIntro: fields.toolsIntro,
    tools: fields.tools.map((tool, i) => ({
      name: tool.name,
      text: tool.text,
      image: images.tools[i],
      full: images.toolsFull[i],
      href: tool.href,
    })),
    steps: fields.steps,
    stepsIntro: fields.stepsIntro,
    after: fields.after,
    post,
    playground: viewPlayground(fields.playground),
    built: fields.built,
    changelog: changelogRows(fields.changelog, lang),
    releases: releasesLink(fields, lang),
    allProjects: `${prefix}/projects/`,
  };
}
