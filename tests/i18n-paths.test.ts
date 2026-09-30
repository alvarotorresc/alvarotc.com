import { describe, it, expect } from 'vitest';
import { mirroredPath, pagePath } from '../src/lib/i18n-paths';

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

describe('pagePath', () => {
  it('adds a trailing slash to internal pages', () => {
    expect(pagePath('/stats')).toBe('/stats/');
    expect(pagePath('/es/projects/bito')).toBe('/es/projects/bito/');
    expect(pagePath('/blog?page=2')).toBe('/blog/?page=2');
  });

  it('leaves slashed paths, anchors, files and other urls alone', () => {
    expect(pagePath('/about/')).toBe('/about/');
    expect(pagePath('/#projects')).toBe('/#projects');
    expect(pagePath('/es/#projects')).toBe('/es/#projects');
    expect(pagePath('/rss.xml')).toBe('/rss.xml');
    expect(pagePath('/blog/post.md')).toBe('/blog/post.md');
    expect(pagePath('https://github.com/x')).toBe('https://github.com/x');
    expect(pagePath('//cdn.example.com/a')).toBe('//cdn.example.com/a');
    expect(pagePath('mailto:hello@alvarotc.com')).toBe('mailto:hello@alvarotc.com');
  });
});
