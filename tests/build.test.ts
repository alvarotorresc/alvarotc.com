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
