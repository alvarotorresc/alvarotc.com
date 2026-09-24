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
  'cv/index.html',
  'es/cv/index.html',
  'stats/index.html',
  'es/stats/index.html',
  'projects/index.html',
  'es/projects/index.html',
  'projects/bito/index.html',
  'es/projects/bito/index.html',
  'projects/pokeutils/index.html',
  'es/projects/pokeutils/index.html',
  'projects/basecero/index.html',
  'es/projects/basecero/index.html',
  'projects/quedamos/index.html',
  'es/projects/huellas/index.html',
  'blog/index.html',
  'es/blog/index.html',
  'search.json',
  '404.html',
  'es/404/index.html',
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

describe.skipIf(!built)('built project pages', () => {
  it('renders Bito as a mobile page with webp images', () => {
    const html = page('es/projects/bito/index.html');
    expect(html).toContain('data-project="mobile"');
    expect(html).toContain('data-media="mobile"');
    expect(html).toContain('Descargar APK');
    expect(html).toMatch(/data-frame="device"[\s\S]*?src="[^"]+\.webp"/);
    expect(html).toContain('application/ld+json');
  });

  it('renders PokeUtils as a web page', () => {
    const html = page('projects/pokeutils/index.html');
    expect(html).toContain('data-media="web"');
    expect(html).toContain('Open the site');
    expect(html).not.toContain('data-section="playground"');
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
    expect(existsSync(join(dist, 'es/projects/devtools/index.html'))).toBe(false);
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

  it('shows the English label for a Spanish-slugged tag on its EN topic page', () => {
    const html = page('blog/topic/proceso/index.html');
    expect(html).toContain('>process<');
    expect(html).not.toContain('>proceso<');
    expect(html).toContain('Articles about process');
  });

  it('keeps the Spanish label on the matching ES topic page', () => {
    const html = page('es/blog/tema/proceso/index.html');
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
  it('pairs post and topic alternates with xhtml:link, and sets lastmod', () => {
    const xml = readFileSync(join(dist, 'sitemap-0.xml'), 'utf8');
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');

    const postEntry = xml.match(
      /<url>\s*<loc>https:\/\/alvarotc\.com\/blog\/new-website-new-direction\/<\/loc>[\s\S]*?<\/url>/,
    );
    expect(postEntry).not.toBeNull();
    expect((postEntry![0].match(/xhtml:link/g) ?? []).length).toBe(3);
    expect(postEntry![0]).toContain('<lastmod>');

    const topicEntry = xml.match(
      /<url>\s*<loc>https:\/\/alvarotc\.com\/blog\/topic\/docker\/<\/loc>[\s\S]*?<\/url>/,
    );
    expect(topicEntry).not.toBeNull();
    expect(topicEntry![0]).toContain('/es/blog/tema/docker/');
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
