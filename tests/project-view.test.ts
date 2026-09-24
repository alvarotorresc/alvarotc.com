import { describe, it, expect, afterEach } from 'vitest';
import { formatShortDate } from '../src/lib/utils';
import {
  changelogRows,
  displayUrl,
  factRows,
  fillParts,
  hasMedia,
  parseTerminalLine,
  playgroundNotes,
  releaseLabel,
  releasesLink,
  shotsIntro,
} from '../src/lib/project-view';
import {
  baseceroFields,
  baseceroImages,
  bitoFields,
  bitoImages,
  cliFields,
  makeView,
  pokeFields,
  pokeImages,
  sparseFields,
} from './fixtures/project-view';

const originalTz = process.env.TZ;

describe('formatShortDate', () => {
  afterEach(() => {
    if (originalTz === undefined) delete process.env.TZ;
    else process.env.TZ = originalTz;
  });

  it('formats in Spanish and English with a short month', () => {
    expect(formatShortDate(new Date('2026-08-26'), 'es')).toBe('26 ago 2026');
    expect(formatShortDate(new Date('2026-09-02'), 'es')).toBe('2 sept 2026');
    expect(formatShortDate(new Date('2026-08-26'), 'en')).toBe('Aug 26, 2026');
  });

  it('keeps the calendar day in a negative time zone', () => {
    process.env.TZ = 'America/Los_Angeles';
    expect(formatShortDate(new Date('2026-09-02'), 'es')).toBe('2 sept 2026');
  });
});

describe('displayUrl', () => {
  it('drops the protocol, www and a bare trailing slash', () => {
    expect(displayUrl('https://bito.alvarotc.com')).toBe('bito.alvarotc.com');
    expect(displayUrl('https://pokeutils.alvarotc.com/')).toBe('pokeutils.alvarotc.com');
    expect(displayUrl('https://www.npmjs.com/package/create-astro-blog')).toBe(
      'npmjs.com/package/create-astro-blog',
    );
  });

  it('keeps the trailing slash of a path', () => {
    expect(displayUrl('https://basecero.alvarotc.com/app/')).toBe('basecero.alvarotc.com/app/');
  });
});

describe('releaseLabel', () => {
  it('uses the first dated entry', () => {
    expect(releaseLabel(bitoFields.changelog, 'es')).toBe('v1.0.0, 26 ago 2026');
  });

  it('is undefined without a dated entry', () => {
    expect(releaseLabel(cliFields.changelog, 'es')).toBeUndefined();
  });
});

describe('factRows', () => {
  it('puts platform, license, last release and web before the content facts', () => {
    expect(factRows(bitoFields, 'es').map((row) => row.label)).toEqual([
      'Plataforma',
      'Licencia',
      'Última versión',
      'Web',
      'Tamaño del APK',
      'Red',
    ]);
  });

  it('keeps platform in plain text and the verifiable values in mono', () => {
    const rows = factRows(bitoFields, 'es');
    expect(rows[0].mono).toBe(false);
    expect(rows.slice(1, 4).every((row) => row.mono)).toBe(true);
    expect(rows[3].value).toBe('bito.alvarotc.com');
  });

  it('labels an npm url as npm for a cli', () => {
    const rows = factRows(cliFields, 'es');
    expect(rows[0]).toEqual({
      label: 'npm',
      value: 'npmjs.com/package/create-astro-blog',
      mono: true,
    });
  });

  it('returns nothing for a project without data', () => {
    expect(factRows({ ...sparseFields, license: undefined, url: undefined }, 'es')).toEqual([]);
  });
});

describe('changelogRows', () => {
  it('marks undated entries newer than the last release as coming', () => {
    expect(changelogRows(bitoFields.changelog, 'es')).toEqual([
      { version: 'v2.0.0', when: 'en camino', note: 'Habi como compañera.' },
      { version: 'v1.0.0', when: '26 ago 2026', note: 'Primera versión pública.' },
      { version: 'v0.1.0', when: undefined, note: 'El prototipo de 24 horas.' },
    ]);
  });

  it('leaves every row undated when nothing has a date', () => {
    expect(changelogRows(cliFields.changelog, 'en')[0].when).toBeUndefined();
  });
});

describe('releasesLink', () => {
  it('points at GitHub releases by default', () => {
    expect(releasesLink(bitoFields, 'es')).toEqual({
      href: 'https://github.com/alvarotorresc/bito/releases',
      label: 'Todas las versiones en GitHub',
    });
  });

  it('points at npm for a cli published there', () => {
    expect(releasesLink(cliFields, 'en')).toEqual({
      href: 'https://www.npmjs.com/package/create-astro-blog?activeTab=versions',
      label: 'All versions on npm',
    });
  });

  it('is undefined without repo or npm', () => {
    expect(releasesLink({ ...sparseFields, repo: undefined }, 'es')).toBeUndefined();
  });
});

describe('shotsIntro', () => {
  it('builds the default subtitle per kind from the last release', () => {
    expect(shotsIntro(bitoFields, 'es')).toBe('Pantallas de la v1.0.0 en un Android real.');
    expect(shotsIntro(pokeFields, 'es')).toBe('Pantallas de la v1.0.0 en escritorio.');
    expect(shotsIntro(baseceroFields, 'en')).toBe('v1.0.0 installed on a phone.');
  });

  it('prefers the content subtitle and has none for a cli', () => {
    expect(shotsIntro({ ...bitoFields, screenshotsIntro: 'Otra.' }, 'es')).toBe('Otra.');
    expect(shotsIntro(cliFields, 'es')).toBeUndefined();
  });
});

describe('parseTerminalLine', () => {
  it('recognises blank, command, answer and output lines', () => {
    expect(parseTerminalLine('')).toEqual({ kind: 'blank' });
    expect(parseTerminalLine('$ npx create-astro-blog my-blog')).toEqual({
      kind: 'command',
      text: 'npx create-astro-blog my-blog',
    });
    expect(parseTerminalLine('✔ Blog name: › My Blog')).toEqual({
      kind: 'answer',
      label: 'Blog name:',
      value: 'My Blog',
    });
    expect(parseTerminalLine('  Installing dependencies...')).toEqual({
      kind: 'output',
      text: 'Installing dependencies...',
    });
  });
});

describe('fillParts', () => {
  it('splits a template into text and value parts', () => {
    expect(fillParts('{size} desde GitHub.', { size: { text: '4,7 MB', mono: true } })).toEqual([
      { text: '4,7 MB', mono: true },
      { text: ' desde GitHub.' },
    ]);
  });

  it('returns undefined when a value is missing', () => {
    expect(fillParts('{size} para {platform}.', { size: { text: '4,7 MB' } })).toBeUndefined();
  });
});

describe('playgroundNotes', () => {
  it('gives a mobile app three notes with the APK size and platform in mono', () => {
    const notes = playgroundNotes(makeView(bitoFields, bitoImages));
    expect(notes.map((note) => note.title)).toEqual([
      'Toca un hábito para registrarlo',
      'Se carga cuando tú lo pides',
      'En tu móvil, con el APK',
    ]);
    expect(notes[2].parts).toEqual([
      { text: '4,7 MB', mono: true },
      { text: ' desde GitHub Releases, para ' },
      { text: 'Android 10+', mono: true },
      { text: '.' },
    ]);
  });

  it('drops the APK note when the download is missing', () => {
    const notes = playgroundNotes(makeView({ ...bitoFields, download: undefined }));
    expect(notes).toHaveLength(2);
  });

  it('links the hybrid install note to the playground address', () => {
    const notes = playgroundNotes(makeView(baseceroFields, baseceroImages));
    expect(notes).toHaveLength(3);
    expect(notes[2].parts[1]).toEqual({
      text: 'basecero.alvarotc.com/app/',
      mono: true,
      href: 'https://basecero.alvarotc.com/app/',
    });
  });

  it('gives the web one untitled note with a link to the site', () => {
    const notes = playgroundNotes(makeView(pokeFields, pokeImages));
    expect(notes).toHaveLength(1);
    expect(notes[0].title).toBeUndefined();
    expect(notes[0].parts).toContainEqual({
      text: 'abrirla en su dirección',
      href: 'https://pokeutils.alvarotc.com',
    });
  });

  it('is empty without a playground', () => {
    expect(playgroundNotes(makeView(sparseFields))).toEqual([]);
  });
});

describe('hasMedia', () => {
  it('a mobile or web project has media whenever it has a cover', () => {
    const bito = makeView(bitoFields, bitoImages);
    expect(hasMedia(bito)).toBe(true);
    const coverOnly = makeView(
      { ...bitoFields, screenshots: [] },
      { ...bitoImages, screenshots: [] },
    );
    expect(hasMedia(coverOnly)).toBe(true);
  });

  it('a sparse project has no media', () => {
    expect(hasMedia(makeView(sparseFields))).toBe(false);
  });

  it('a cli has media only with a terminal session', () => {
    const cli = makeView(cliFields);
    expect(hasMedia(cli)).toBe(true);
    expect(hasMedia(makeView({ ...cliFields, terminal: [] }))).toBe(false);
  });
});

describe('toProjectView', () => {
  it('flattens a project into plain data', () => {
    const view = makeView(bitoFields, bitoImages);
    expect(view.statusLabel).toBe('En publicación');
    expect(view.tone).toBe('warn');
    expect(view.release).toBe('v1.0.0, 26 ago 2026');
    expect(view.address).toBe('bito.alvarotc.com');
    expect(view.screenshots[0]).toEqual({
      src: '/_astro/widget.webp',
      alt: 'Widget en la pantalla de inicio',
      caption: 'Widget',
    });
    expect(view.features[3].image).toBeUndefined();
    expect(view.allProjects).toBe('/es/projects');
  });

  it('links to the English project list', () => {
    expect(makeView(bitoFields, bitoImages, 'en').allProjects).toBe('/projects');
  });

  it('drops a video playground', () => {
    const view = makeView({
      ...bitoFields,
      playground: { kind: 'video', src: 'https://x.dev/a.mp4' },
    });
    expect(view.playground).toBeUndefined();
  });

  it('keeps an empty project empty', () => {
    const view = makeView(sparseFields);
    expect(view.release).toBeUndefined();
    expect(view.changelog).toEqual([]);
    expect(view.screenshotsIntro).toBeUndefined();
  });
});
