import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const dist = resolve('dist');
const built = existsSync(dist);

const page = (route: string) => readFileSync(join(dist, route), 'utf8');

describe.skipIf(!built)('home title', () => {
  it('uses the role and city in the English <title>', () => {
    expect(page('index.html')).toContain(
      '<title>Álvaro Torres Carrasco · Software Engineer in Seville</title>',
    );
  });

  it('uses the role and city in the Spanish <title>', () => {
    expect(page('es/index.html')).toContain(
      '<title>Álvaro Torres Carrasco · Software Engineer en Sevilla</title>',
    );
  });

  it('keeps the plain name as og:title', () => {
    expect(page('index.html')).toContain(
      '<meta property="og:title" content="Álvaro Torres Carrasco">',
    );
  });
});
