import { describe, it, expect } from 'vitest';
import { mirroredPath } from '../src/lib/i18n-paths';

describe('mirroredPath', () => {
  it('prefixes English paths with /es', () => {
    expect(mirroredPath('en', '/')).toBe('/es/');
    expect(mirroredPath('en', '/about')).toBe('/es/about');
    expect(mirroredPath('en', '/#projects')).toBe('/es/#projects');
  });

  it('strips the /es prefix from Spanish paths', () => {
    expect(mirroredPath('es', '/es/')).toBe('/');
    expect(mirroredPath('es', '/es')).toBe('/');
    expect(mirroredPath('es', '/es/about')).toBe('/about');
    expect(mirroredPath('es', '/es/#projects')).toBe('/#projects');
  });

  it('does not touch paths that merely start with es', () => {
    expect(mirroredPath('en', '/essays')).toBe('/es/essays');
  });
});
