import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const dist = resolve('dist');
const built = existsSync(dist);

const routes = [
  'index.html',
  'es/index.html',
  'about/index.html',
  'es/about/index.html',
  'cv/Alvaro_Torres_Carrasco_CV_EN.pdf',
  'cv/Alvaro_Torres_Carrasco_CV_ES.pdf',
  'privacy/index.html',
  'es/privacy/index.html',
  'legal/index.html',
  'es/legal/index.html',
  'projects/index.html',
  'es/projects/index.html',
  'projects/bito/index.html',
  'es/projects/bito/index.html',
  'projects/pokeutils/index.html',
  'es/projects/pokeutils/index.html',
  'projects/devtools/index.html',
  'es/projects/devtools/index.html',
  'projects/cheesy/index.html',
  'es/projects/cheesy/index.html',
  'projects/basecero/index.html',
  'es/projects/basecero/index.html',
  'projects/quedamos/index.html',
  'es/projects/huellas/index.html',
  'blog/index.html',
  'es/blog/index.html',
  'search.json',
  '404.html',
  'llms.txt',
  'llms-full.txt',
  'es/llms-full.txt',
  'blog/new-website-new-direction.md',
  'es/blog/nueva-web-nuevo-rumbo.md',
];

const experienceDir = resolve('src/content/experience');
const experienceIsMock = readdirSync(experienceDir)
  .filter((file) => file.endsWith('.yaml'))
  .some((file) => /^mock:\s*true\s*$/m.test(readFileSync(join(experienceDir, file), 'utf8')));

describe.skipIf(!built)('built routes', () => {
  it.each(routes)('builds %s', (route) => {
    expect(existsSync(join(dist, route))).toBe(true);
  });
});

describe.skipIf(!built)('built home page', () => {
  it('has no placeholder markers left', () => {
    const html = readFileSync(join(dist, 'index.html'), 'utf8');
    expect(html).not.toContain('[placeholder]');
  });

  it('links to the experience section only when the experience is real', () => {
    const html = readFileSync(join(dist, 'index.html'), 'utf8');
    if (experienceIsMock) expect(html).not.toContain('href="/#experience"');
    else expect(html).toContain('href="/#experience"');
  });
});

const page = (route: string) => readFileSync(join(dist, route), 'utf8');

describe.skipIf(!built)('built CV links', () => {
  it('no longer builds the /cv/ pages', () => {
    expect(existsSync(join(dist, 'cv/index.html'))).toBe(false);
    expect(existsSync(join(dist, 'es/cv/index.html'))).toBe(false);
  });

  it('links each home to the PDF of its language', () => {
    expect(page('index.html')).toContain('href="/cv/Alvaro_Torres_Carrasco_CV_EN.pdf"');
    expect(page('index.html')).not.toContain('href="/cv/"');
    expect(page('es/index.html')).toContain('href="/cv/Alvaro_Torres_Carrasco_CV_ES.pdf"');
    expect(page('es/index.html')).not.toContain('href="/es/cv/"');
  });

  it('makes the hero CV button download the PDF', () => {
    for (const [route, file] of [
      ['index.html', 'Alvaro_Torres_Carrasco_CV_EN.pdf'],
      ['es/index.html', 'Alvaro_Torres_Carrasco_CV_ES.pdf'],
    ] as const) {
      const link = page(route)
        .match(/<a[^>]*btn-secondary[^>]*>/g)
        ?.find((a) => a.includes(file));
      expect(link).toBeDefined();
      expect(link).toMatch(/\sdownload(?=[\s>=])/);
    }
  });

  it('lists the PDF of each language in search.json', () => {
    const json = page('search.json');
    expect(json).toContain('"/cv/Alvaro_Torres_Carrasco_CV_EN.pdf"');
    expect(json).toContain('"/cv/Alvaro_Torres_Carrasco_CV_ES.pdf"');
    expect(json).not.toContain('"/cv/"');
  });

  it('drops /cv/ from the sitemap', () => {
    const xml = readFileSync(join(dist, 'sitemap-0.xml'), 'utf8');
    expect(xml).not.toMatch(/alvarotc\.com\/(?:es\/)?cv\//);
  });
});

describe.skipIf(!built)('built project pages', () => {
  it('renders the Bito page with the 1.3.0 copy and six screens', () => {
    const html = page('es/projects/bito/index.html');
    expect(html).toContain('Android 8.0+');
    expect(html).toContain('GPL-3.0-or-later');
    expect(html).toContain('Repaso del día');
    expect(html).not.toContain('v2.0.0');
    expect(html.match(/<img[^>]+class="[^"]*shot-img/g)).toHaveLength(6);
  });

  it('renders the 1.3.0 Bito page with five image blocks and four dated releases', () => {
    for (const [route, size] of [
      ['es/projects/bito/index.html', /\d+,\d MB/],
      ['projects/bito/index.html', /\d+\.\d MB/],
    ] as const) {
      const html = page(route);
      expect(html.match(/data-feature="block"/g), route).toHaveLength(5);
      expect(html.match(/data-feature="item"/g), route).toHaveLength(5);
      expect(html.match(/<li[^>]*\sdata-release[\s>]/g), route).toHaveLength(4);
      ['v1.3.0, ', 'v1.2.0, ', 'v1.1.0, ', 'v1.0.0, '].forEach((row) =>
        expect(html, route).toContain(row),
      );
      expect(html, route).toMatch(size);
      expect(html, route).toContain('releases/download/v1.3.0/app-release.apk');
    }
  });

  it('shows the horizontal Bito promo on each home', () => {
    expect(page('es/index.html')).toMatch(/\/_astro\/promo-es\.[\w-]+\.webp/);
    expect(page('index.html')).toMatch(/\/_astro\/promo-en\.[\w-]+\.webp/);
  });

  it('keeps every emitted asset at 400 KB or less', () => {
    const heavy = readdirSync(join(dist, '_astro')).filter(
      (file) => readFileSync(join(dist, '_astro', file)).length > 400 * 1024,
    );
    expect(heavy).toEqual([]);
  });

  it('renders Bito as a mobile page with webp images', () => {
    const html = page('es/projects/bito/index.html');
    expect(html).toContain('data-project="mobile"');
    expect(html).toContain('data-media="mobile"');
    expect(html).toContain('Descargar APK');
    expect(html).toMatch(/data-frame="device"[\s\S]*?src="[^"]+\.webp"/);
    expect(html).toContain('application/ld+json');
  });

  it('plays the Bito video natively from this site in each language', () => {
    [
      ['es/projects/bito/index.html', 'es'],
      ['projects/bito/index.html', 'en'],
    ].forEach(([route, lang]) => {
      const html = page(route);
      expect(html, route).toMatch(/<video[^>]*\scontrols/);
      expect(html, route).toContain(
        `<source src="/video/bito-promo-${lang}.mp4" type="video/mp4">`,
      );
      expect(html, route).not.toContain('data-video-link');
      expect(existsSync(join(dist, `video/bito-promo-${lang}.mp4`)), lang).toBe(true);
    });
  });

  it('renders PokeUtils as a web page', () => {
    const html = page('projects/pokeutils/index.html');
    expect(html).toContain('data-media="web"');
    expect(html).toContain('Open PokeUtils');
    expect(html).not.toContain('data-section="playground"');
  });

  it('renders DevTools as a web page with its 52 tools', () => {
    [
      ['projects/devtools/index.html', 'Open DevTools'],
      ['es/projects/devtools/index.html', 'data-media="web"'],
    ].forEach(([route, text]) => {
      const html = page(route);
      expect(html, route).toContain('data-media="web"');
      expect(html, route).toContain(text);
      expect(html.match(/role="tab"/g), route).toHaveLength(52);
    });
  });

  it('renders Cheesy as a web page with six image blocks and its two releases', () => {
    [
      ['projects/cheesy/index.html', 'Open Cheesy'],
      ['es/projects/cheesy/index.html', 'GPL-3.0'],
    ].forEach(([route, text]) => {
      const html = page(route);
      expect(html, route).toContain('data-media="web"');
      expect(html, route).toContain(text);
      expect(html.match(/data-feature="block"/g), route).toHaveLength(6);
      expect(html.match(/data-feature="item"/g), route).toHaveLength(7);
      expect(html.match(/<img[^>]+class="[^"]*shot-img/g), route).toHaveLength(11);
      expect(html.match(/<li[^>]*\sdata-release[\s>]/g), route).toHaveLength(2);
      expect(html, route).toContain('v0.2.0');
      expect(html, route).toContain('v0.1.0');
      expect(html, route).toContain('github.com/alvarotorresc/cheesy/releases');
      expect(html, route).not.toContain('role="tab"');
    });
  });

  it('renders BaseCero as a hybrid page with its playground', () => {
    const html = page('es/projects/basecero/index.html');
    expect(html).toContain('data-media="hybrid"');
    expect(html).toContain('data-playground-load');
    expect(html).toContain('basecero.alvarotc.com/app/');
  });

  it('renders Quedamos as a hybrid page with screens and features', () => {
    const html = page('projects/quedamos/index.html');
    expect(html).toContain('data-media="hybrid"');
    expect(html).toContain('data-section="why"');
    ['screens', 'features'].forEach((section) =>
      expect(html).toContain(`data-section="${section}"`),
    );
    ['steps', 'playground'].forEach((section) =>
      expect(html).not.toContain(`data-section="${section}"`),
    );
  });

  it('does not build the hidden projects', () => {
    expect(existsSync(join(dist, 'projects/create-astro-blog/index.html'))).toBe(false);
  });

  it('shows the Bito cover on the home without the old PNGs', () => {
    const html = page('es/index.html');
    expect(html).not.toMatch(/\/projects\/[\w-]+\.png/);
    expect(html).toContain('alt="Bito"');
  });
});

describe.skipIf(!built)('blog index and topic pages: hreflang, description and JSON-LD', () => {
  it('declares self-referential en/es/x-default hreflang on /blog/', () => {
    const html = page('blog/index.html');
    expect(html).toContain(
      '<link rel="alternate" hreflang="en" href="https://alvarotc.com/blog/">',
    );
    expect(html).toContain(
      '<link rel="alternate" hreflang="x-default" href="https://alvarotc.com/blog/">',
    );
  });

  it('declares self-referential en/es/x-default hreflang on /es/blog/', () => {
    const html = page('es/blog/index.html');
    expect(html).toContain(
      '<link rel="alternate" hreflang="es" href="https://alvarotc.com/es/blog/">',
    );
    expect(html).toContain(
      '<link rel="alternate" hreflang="x-default" href="https://alvarotc.com/blog/">',
    );
  });

  it('gives /blog/topic/docker/ its own meta description, distinct from the site default', () => {
    const html = page('blog/topic/docker/index.html');
    const match = html.match(/<meta name="description" content="([^"]*)">/);
    expect(match).not.toBeNull();
    expect(match![1]).toContain('docker');
    expect(match![1]).not.toBe(
      'Software Engineer. I build robust, scalable software. A firm believer in free software and privacy. I also like writing about it.',
    );
  });

  it('shows the English label on the EN topic page', () => {
    const html = page('blog/topic/process/index.html');
    expect(html).toContain('>process<');
    expect(html).not.toContain('>proceso<');
    expect(html).toContain('Articles about process');
  });

  it('shows the Spanish label on the matching ES topic page', () => {
    const html = page('es/blog/tema/process/index.html');
    expect(html).toContain('>proceso<');
  });

  it('has no rel=prev/next in <head> when there is only one page', () => {
    const html = page('blog/index.html');
    const head = html.slice(0, html.indexOf('</head>'));
    expect(head).not.toContain('rel="prev"');
    expect(head).not.toContain('rel="next"');
  });

  it('emits a CollectionPage JSON-LD on the blog index', () => {
    const html = page('blog/index.html');
    const match = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
    expect(match).not.toBeNull();
    const jsonLd = JSON.parse(match![1]);
    expect(jsonLd['@type']).toBe('CollectionPage');
    expect(jsonLd.mainEntity['@type']).toBe('ItemList');
  });

  it('links to posts with a trailing slash from the listing', () => {
    const html = page('blog/index.html');
    expect(html).not.toMatch(/href="\/blog\/[a-z0-9-]+"[^/]/);
  });
});

describe.skipIf(!built)('sitemap', () => {
  it('pairs post alternates with xhtml:link, and sets lastmod', () => {
    const xml = readFileSync(join(dist, 'sitemap-0.xml'), 'utf8');
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');

    const postEntry = xml.match(
      /<url>\s*<loc>https:\/\/alvarotc\.com\/blog\/new-website-new-direction\/<\/loc>[\s\S]*?<\/url>/,
    );
    expect(postEntry).not.toBeNull();
    expect((postEntry![0].match(/xhtml:link/g) ?? []).length).toBe(3);
    expect(postEntry![0]).toContain('<lastmod>');
  });
});

describe.skipIf(!built)('built blog topic and pagination routes', () => {
  it('builds the docker topic page in both languages with its 2 articles', () => {
    expect(existsSync(join(dist, 'blog/topic/docker/index.html'))).toBe(true);
    expect(existsSync(join(dist, 'es/blog/tema/docker/index.html'))).toBe(true);
    const en = page('blog/topic/docker/index.html');
    const es = page('es/blog/tema/docker/index.html');
    expect((en.match(/<article/g) ?? []).length).toBe(2);
    expect((es.match(/<article/g) ?? []).length).toBe(2);
  });

  it('does not build a second page when there are not enough posts to fill it', () => {
    expect(existsSync(join(dist, 'blog/2/index.html'))).toBe(false);
    expect(existsSync(join(dist, 'es/blog/2/index.html'))).toBe(false);
  });
});

describe.skipIf(!built)('built home accessibility', () => {
  it('keeps dt and dd as direct children of the dl groups', () => {
    expect(page('index.html')).not.toMatch(/<span[^>]*>\s*<dt/);
    expect(page('es/index.html')).not.toMatch(/<span[^>]*>\s*<dt/);
  });

  it('does not repeat the tool name in the logo alt text', () => {
    expect(page('index.html')).not.toContain('alt="Kitty"');
  });
});

describe.skipIf(!built)('404 page', () => {
  it('is a single root page that carries both languages, since Vercel only serves /404.html', () => {
    expect(existsSync(join(dist, 'es/404/index.html'))).toBe(false);
    const html = readFileSync(join(dist, '404.html'), 'utf8');
    expect(html).toContain('Page not found');
    expect(html).toContain('Página no encontrada');
    expect(html).toMatch(/data-404-lang="es"[^>]*hidden/);
    expect(html).toContain('noindex');
  });
});
