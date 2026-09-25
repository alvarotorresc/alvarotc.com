import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { youtubeWatchUrl } from '../src/lib/project-view';

const file = (lang: string, slug: string) => `src/content/projects/${lang}/${slug}.md`;
const read = (lang: string, slug: string) => readFileSync(file(lang, slug), 'utf8');
const field = (source: string, key: string) =>
  new RegExp(`^${key}: (.+)$`, 'm').exec(source)?.[1]?.trim();
const refsOf = (path: string) =>
  [...readFileSync(path, 'utf8').matchAll(/(\.\.\/[^\s'"]+\.(?:jpg|jpeg|png|webp))/g)].map((m) =>
    resolve(dirname(path), m[1]),
  );
const imageRefs = (lang: string, slug: string) => refsOf(file(lang, slug));
const COPY_KEYS = [
  'tagline',
  'intro',
  'featuresIntro',
  'screenshotsIntro',
  'label',
  'value',
  'title',
  'text',
  'alt',
  'caption',
  'note',
];
const QUOTED = String.raw`'((?:[^']|'')*)'|"((?:[^"\\]|\\.)*)"`;
const unquote = (single?: string, double?: string) =>
  single !== undefined ? single.replace(/''/g, "'") : (double ?? '').replace(/\\"/g, '"');
const copyOf = (source: string) => {
  const [, front, ...rest] = source.split(/^---$/m);
  const copy: Record<string, string[]> = {};
  for (const m of front.matchAll(
    new RegExp(String.raw`^\s*(?:- )?(\w+): (?:${QUOTED})\s*$`, 'gm'),
  )) {
    if (COPY_KEYS.includes(m[1])) (copy[m[1]] ??= []).push(unquote(m[2], m[3]));
  }
  copy.built = [...front.matchAll(new RegExp(String.raw`^ {2}- (?:${QUOTED})\s*$`, 'gm'))].map(
    (m) => unquote(m[1], m[2]),
  );
  copy.body = rest
    .join('---')
    .trim()
    .split(/\n\s*\n/);
  return copy;
};
const pngSize = (path: string) => {
  const bytes = readFileSync(path);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
};
const BITO = '../../../assets/projects/bito';

describe('bito media', () => {
  it('keeps no placeholder JPEG', () => {
    expect(readdirSync('src/assets/projects/bito').filter((f) => f.endsWith('.jpg'))).toEqual([]);
  });
});

describe.each(['es', 'en'])('bito (%s)', (lang) => {
  const source = read(lang, 'bito');

  it('is a mobile project being published', () => {
    expect(field(source, 'kind')).toBe('mobile');
    expect(field(source, 'status')).toBe('publishing');
  });

  it('carries the facts checked against the Bito repo', () => {
    expect(field(source, 'platform')).toBe('Android 8.0+');
    expect(field(source, 'license')).toBe('GPL-3.0-or-later');
    expect(field(source, 'url')).toBe('https://bito.alvarotc.com');
    expect(field(source, 'stack')).toBe('[Kotlin, Offline-first, Privacy]');
    expect(source).toMatch(
      /https:\/\/github\.com\/alvarotorresc\/bito\/releases\/download\/v1\.\d+\.\d+\/app-release\.apk/,
    );
    expect(source).not.toMatch(/v2\.0\.0|v0\.1\.0|Android 10/);
  });

  it('lists only the real releases', () => {
    expect([...source.matchAll(/version: '(v[\d.]+)'/g)].map((m) => m[1])).toEqual([
      'v1.1.0',
      'v1.0.0',
    ]);
    expect(source).toMatch(/version: 'v1\.0\.0'\n\s+date: 2026-08-26\n/);
  });

  it('dates as latest the release the download serves', () => {
    const dated = [...source.matchAll(/version: '(v[\d.]+)'\n\s+date: /g)].map((m) => m[1]);
    const served = /releases\/download\/(v[\d.]+)\//.exec(source)?.[1];
    expect(served).toBeDefined();
    expect(dated[0]).toBe(served);
  });

  it('uses the final media for its language', () => {
    expect(field(source, 'icon')).toBe(`'${BITO}/icon.png'`);
    expect(field(source, 'cover')).toBe(`'${BITO}/cover-${lang}.png'`);
    expect(field(source, 'promo')).toBe(`'${BITO}/promo-${lang}.png'`);
    expect(field(source, 'illustration')).toBe(`'${BITO}/illustration.png'`);
  });

  it('has nine features, the first three with a screen of its language', () => {
    expect(source.match(/^ {2}- title: /gm)).toHaveLength(9);
    const images = [...source.matchAll(/^ {4}image: '[^']*\/([\w-]+)\.png'$/gm)].map((m) => m[1]);
    expect(images).toEqual([
      `shot-04-widget-${lang}`,
      `shot-02-recordatorio-${lang}`,
      `shot-06-revision-${lang}`,
    ]);
  });

  it('has a horizontal promo', () => {
    const promo = imageRefs(lang, 'bito').find((ref) => ref.endsWith(`promo-${lang}.png`));
    expect(promo).toBeDefined();
    const { width, height } = pngSize(promo ?? '');
    expect(width).toBeGreaterThan(height);
  });

  it('keeps every Bito image at 400 KB or less', () => {
    imageRefs(lang, 'bito').forEach((ref) =>
      expect(statSync(ref).size, ref).toBeLessThanOrEqual(400 * 1024),
    );
  });

  it('points the video, when there is one, at YouTube or a file under public/video', () => {
    const block = /^playground:(?: \{.*\}|\n(?: {2}.+\n?)+)/m.exec(source)?.[0];
    if (block) {
      const kind = /kind: (\w+)/.exec(block)?.[1];
      const src = /src: '([^']+)'/.exec(block)?.[1];
      if (kind === 'video') {
        expect(src, block).toBeDefined();
        expect(youtubeWatchUrl(src ?? ''), block).toBeDefined();
      }
      if (kind === 'file') {
        expect(src, block).toMatch(/^\/video\/[\w-]+\.mp4$/);
        expect(existsSync(`public${src}`), block).toBe(true);
      }
    }
  });

  it('plays its own video from this site', () => {
    expect(field(source, 'playground')).toBe(
      `{ kind: file, src: '/video/bito-promo-${lang}.mp4' }`,
    );
    expect(statSync(`public/video/bito-promo-${lang}.mp4`).size).toBeLessThanOrEqual(5 * 1024 ** 2);
    expect(source).not.toMatch(/^playground:.*youtu/m);
  });

  it('has six screenshots of its language, in order', () => {
    const shots = [...source.matchAll(/^ {2}- src: '[^']*\/([\w-]+)\.png'$/gm)].map((m) => m[1]);
    expect(shots).toEqual(
      [
        '01-habitos',
        '02-recordatorio',
        '03-estadisticas',
        '04-widget',
        '05-insignias',
        '06-revision',
      ].map((shot) => `shot-${shot}-${lang}`),
    );
    expect(source).not.toMatch(/\.jpg'/);
  });

  it('introduces the screenshots itself', () => {
    expect(source).toMatch(/^screenshotsIntro: /m);
  });

  it('has no emoji', () => {
    expect(source).not.toMatch(/\p{Extended_Pictographic}/u);
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

describe('bito copy in both languages', () => {
  const es = copyOf(read('es', 'bito'));
  const en = copyOf(read('en', 'bito'));

  it('pairs every text', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(es).sort());
    Object.keys(es).forEach((key) => expect(en[key].length, key).toBe(es[key].length));
  });

  it('keeps every English text as short as or shorter than its Spanish pair', () => {
    Object.keys(es).forEach((key) =>
      es[key].forEach((text, i) =>
        expect(en[key][i].length, `${key}[${i}]: ${en[key][i]}`).toBeLessThanOrEqual(text.length),
      ),
    );
  });
});
describe('bito copy follows the glossary', () => {
  const withoutPaths = (lang: string) => read(lang, 'bito').replace(/'\.\.\/[^']+'/g, '');

  it('says logro and copia de seguridad in Spanish', () => {
    const es = withoutPaths('es');
    expect(es).not.toMatch(/insignia|backup/i);
    expect(es).toContain("caption: 'Logros'");
    expect(es).toContain("caption: 'Repaso del día'");
  });

  it('uses the app words in English', () => {
    const en = withoutPaths('en');
    expect(en).not.toMatch(/Statistics|Quantity|Sergeant|Nightly review/);
    expect(en).toContain("caption: 'Badges'");
    expect(en).toContain("caption: 'Day review'");
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
    expect(field(source, 'cover')).toContain('quedamos/promo.png');
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
