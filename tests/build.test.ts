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
  'blog/index.html',
  'es/blog/index.html',
  'search.json',
  '404.html',
  'es/404/index.html',
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
