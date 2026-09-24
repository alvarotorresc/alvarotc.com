import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const file = (lang: string, slug: string) => `src/content/projects/${lang}/${slug}.md`;
const read = (lang: string, slug: string) => readFileSync(file(lang, slug), 'utf8');
const field = (source: string, key: string) =>
  new RegExp(`^${key}: (.+)$`, 'm').exec(source)?.[1]?.trim();
const refsOf = (path: string) =>
  [...readFileSync(path, 'utf8').matchAll(/(\.\.\/[^\s'"]+\.(?:jpg|jpeg|png|webp))/g)].map((m) =>
    resolve(dirname(path), m[1]),
  );
const imageRefs = (lang: string, slug: string) => refsOf(file(lang, slug));

const placeholders: Record<string, string[]> = {
  bito: ['icon', 'cover', 'widget', 'reminder', 'review', 'stats', 'badges', 'habi'],
};

describe('project placeholders', () => {
  it.each(Object.entries(placeholders))('%s has its placeholder images', (slug, names) => {
    names.forEach((name) =>
      expect(existsSync(`src/assets/projects/${slug}/${name}.jpg`), name).toBe(true),
    );
  });
});

describe.each(['es', 'en'])('bito (%s)', (lang) => {
  const source = read(lang, 'bito');

  it('is a mobile project being published', () => {
    expect(field(source, 'kind')).toBe('mobile');
    expect(field(source, 'status')).toBe('publishing');
  });

  it('keeps the data confirmed by the user', () => {
    expect(field(source, 'platform')).toBe('Android 10+');
    expect(field(source, 'license')).toBe('GPL-3.0');
    expect(field(source, 'url')).toBe('https://bito.alvarotc.com');
    expect(field(source, 'stack')).toBe('[Kotlin, Offline-first, Privacy]');
    expect(source).toContain(
      'https://github.com/alvarotorresc/bito/releases/download/v1.0.0/app-release.apk',
    );
    expect(source).toMatch(/date: 2026-08-26/);
  });

  it('has five screenshots and seven features', () => {
    expect(source.match(/^ {2}- src: /gm)).toHaveLength(5);
    expect(source.match(/^ {2}- title: /gm)).toHaveLength(7);
  });

  it('drops hero and gallery and has no post yet', () => {
    expect(source).not.toMatch(/^(hero|gallery|post):/m);
  });

  it('points only at images that exist', () => {
    const refs = imageRefs(lang, 'bito');
    expect(refs.length).toBeGreaterThan(0);
    refs.forEach((ref) => expect(existsSync(ref), ref).toBe(true));
  });
});

describe.each(['es', 'en'])('pokeutils (%s)', (lang) => {
  const source = read(lang, 'pokeutils');

  it('is a published web project', () => {
    expect(field(source, 'kind')).toBe('web');
    expect(field(source, 'status')).toBe('published');
    expect(field(source, 'stack')).toBe('[JavaScript, SPA]');
  });

  it('has no license, no playground and no hero', () => {
    expect(source).not.toMatch(/^(license|playground|hero|gallery):/m);
  });

  it('dates v1.0.0 with a real changelog note', () => {
    expect(source).toMatch(/version: 'v1\.0\.0',\s*\n?\s*date: 2026-08-28,/);
    expect(source).not.toContain('[DATO]');
  });

  it('has three screenshots and seven features', () => {
    expect(source.match(/^ {2}- src: /gm)).toHaveLength(3);
    expect(source.match(/^ {2}- title: /gm)).toHaveLength(7);
  });

  it('points only at images that exist', () => {
    imageRefs(lang, 'pokeutils').forEach((ref) => expect(existsSync(ref), ref).toBe(true));
  });
});

describe.each(['es', 'en'])('basecero (%s)', (lang) => {
  const source = read(lang, 'basecero');

  it('is a published hybrid project under MIT', () => {
    expect(field(source, 'kind')).toBe('hybrid');
    expect(field(source, 'status')).toBe('published');
    expect(field(source, 'license')).toBe('MIT');
    expect(field(source, 'url')).toBe('https://basecero.alvarotc.com');
  });

  it('embeds the app as a pwa playground', () => {
    expect(source).toContain(
      "playground: { kind: pwa, src: 'https://basecero.alvarotc.com/app/' }",
    );
  });

  it('has a desktop cover and a phone cover', () => {
    expect(field(source, 'cover')).toContain('basecero/cover.png');
    expect(field(source, 'coverMobile')).toContain(`basecero/home-${lang}.webp`);
  });

  it('dates v1.0.0 with a real changelog note', () => {
    expect(source).toMatch(/version: 'v1\.0\.0',\s*\n?\s*date: 2026-09-02,/);
    expect(source).not.toContain('[DATO]');
  });

  it('has four screenshots and seven features', () => {
    expect(source.match(/^ {2}- src: /gm)).toHaveLength(4);
    expect(source.match(/^ {2}- title: /gm)).toHaveLength(7);
  });

  it('points only at images that exist', () => {
    imageRefs(lang, 'basecero').forEach((ref) => expect(existsSync(ref), ref).toBe(true));
  });
});

describe.each(['es', 'en'])('create-astro-blog (%s)', (lang) => {
  const source = read(lang, 'create-astro-blog');

  it('is a hidden cli project', () => {
    expect(field(source, 'kind')).toBe('cli');
    expect(field(source, 'visible')).toBe('false');
    expect(field(source, 'command')).toBe('npx create-astro-blog my-blog');
    expect(field(source, 'after')).toBe("'cd my-blog && npm run dev'");
  });

  it('has real version, license and Node facts', () => {
    expect(field(source, 'license')).toBe('MIT');
    expect(source).toMatch(/value: '1\.0\.0', mono: true/);
    expect(source).toMatch(/value: '>=18\.0\.0', mono: true/);
    expect(source).toMatch(/value: 'MIT', mono: true/);
    expect(source).toMatch(/version: 'v1\.0\.0', note: '\[DATO\]'/);
    expect(source).not.toMatch(/^(hero|gallery):/m);
  });

  it('has the terminal session, eight features and six steps', () => {
    expect(source.match(/^ {2}- '\$ /gm)).toHaveLength(2);
    expect(source.match(/^ {2}- '✔ /gm)).toHaveLength(7);
    expect(source.match(/^ {2}- title: /gm)).toHaveLength(14);
  });
});

describe.each(['es', 'en'])('huellas (%s)', (lang) => {
  const source = read(lang, 'huellas');

  it('is a hybrid project in design', () => {
    expect(field(source, 'kind')).toBe('hybrid');
    expect(field(source, 'status')).toBe('design');
  });

  it('has no image fields', () => {
    expect(imageRefs(lang, 'huellas')).toHaveLength(0);
    expect(source).not.toMatch(
      /^(icon|cover|coverMobile|promo|illustration|url|download|playground):/m,
    );
  });

  it('has at least eight features and four built lines', () => {
    expect(source.match(/^ {2}- title: /gm)?.length ?? 0).toBeGreaterThanOrEqual(8);
    expect(source.match(/^ {2}- '/gm)?.length ?? 0).toBeGreaterThanOrEqual(4);
  });

  it('does not use Next.js, Expo or NestJS', () => {
    const stack = field(source, 'stack') ?? '';
    expect(stack).not.toMatch(/Next\.js|Expo|NestJS/);
  });
});

describe.each(['es', 'en'])('quedamos (%s)', (lang) => {
  const source = read(lang, 'quedamos');

  it('is a beta hybrid project under MIT', () => {
    expect(field(source, 'kind')).toBe('hybrid');
    expect(field(source, 'status')).toBe('beta');
    expect(field(source, 'license')).toBe('MIT');
    expect(field(source, 'url')).toBe('https://quedamos.alvarotc.com');
  });

  it('downloads the Android release without a size', () => {
    expect(source).toMatch(/download:\s*\{\s*/);
    expect(source).toContain(
      "url: 'https://github.com/alvarotorresc/quedamos-app/releases/latest'",
    );
    expect(source).toContain("label: 'Android 6.0+'");
  });

  it('has a desktop cover and a phone cover', () => {
    expect(field(source, 'cover')).toContain('quedamos/calendario.jpg');
    expect(field(source, 'coverMobile')).toContain('quedamos/grupo.jpg');
  });

  it('has ten dated changelog entries', () => {
    expect(source.match(/version: 'v\d+\.\d+\.\d+'/g)).toHaveLength(10);
    expect(source.match(/date: \d{4}-\d{2}-\d{2}/g)).toHaveLength(10);
  });

  it('has six screenshots and nine features', () => {
    expect(source.match(/^ {2}- src: /gm)).toHaveLength(6);
    expect(source.match(/^ {2}- title: /gm)).toHaveLength(9);
  });

  it('points only at images that exist', () => {
    const refs = imageRefs(lang, 'quedamos');
    expect(refs.length).toBeGreaterThan(0);
    refs.forEach((ref) => expect(existsSync(ref), ref).toBe(true));
  });
});

const kinds: [string, string][] = [
  ['huellas', 'hybrid'],
  ['devtools', 'web'],
];

describe.each(kinds)('%s (es)', (slug, kind) => {
  it(`is a ${kind} project without hero`, () => {
    const source = read('es', slug);
    expect(field(source, 'kind')).toBe(kind);
    expect(source).not.toMatch(/^(hero|gallery):/m);
  });
});

describe.each(kinds)('%s (en)', (slug, kind) => {
  it(`is a ${kind} project without hero`, () => {
    const source = read('en', slug);
    expect(field(source, 'kind')).toBe(kind);
    expect(source).not.toMatch(/^(hero|gallery):/m);
  });
});

const allFiles = ['es', 'en'].flatMap((lang) =>
  readdirSync(`src/content/projects/${lang}`).map((name) => `src/content/projects/${lang}/${name}`),
);
const visibleFiles = allFiles.filter(
  (path) => !/^visible:\s*false\s*$/m.test(readFileSync(path, 'utf8')),
);
describe('every project file', () => {
  it.each(allFiles)('%s has a kind and no hero or gallery', (path) => {
    const source = readFileSync(path, 'utf8');
    expect(source).toMatch(/^kind: (mobile|web|hybrid|cli)$/m);
    expect(source).not.toMatch(/^(hero|gallery):/m);
  });

  it('leaves the hidden projects out of the release guard', () => {
    expect(allFiles).toHaveLength(14);
    expect(visibleFiles).toHaveLength(10);
    expect(visibleFiles.some((path) => path.endsWith('create-astro-blog.md'))).toBe(false);
    expect(visibleFiles.some((path) => path.endsWith('devtools.md'))).toBe(false);
  });
});

describe.skipIf(!process.env.RELEASE_CHECK)('projects release guard', () => {
  it.each(visibleFiles)('%s has no [DATO] left', (path) => {
    expect(readFileSync(path, 'utf8')).not.toContain('[DATO]');
  });

  it.each(visibleFiles)('%s ships real images, not placeholders', (path) => {
    refsOf(path).forEach((ref) => expect(statSync(ref).size, ref).toBeGreaterThan(20000));
  });
});
