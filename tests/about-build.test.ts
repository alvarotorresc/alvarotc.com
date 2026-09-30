import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';

const read = (path: string) => readFileSync(path, 'utf8');

describe.skipIf(!existsSync('dist/es/about/index.html'))('about build output', () => {
  it.each(['dist/about/index.html', 'dist/es/about/index.html'])(
    '%s ships the sticky polaroid with a webp photo',
    (path) => {
      const html = read(path);
      expect(html).toContain('data-polaroid="sticky"');
      expect(html).toMatch(/data-polaroid-img[^>]*src="[^"]+\.webp"/);
      expect(html).toContain('application/ld+json');
    },
  );

  it.each(['dist/index.html', 'dist/es/index.html'])('%s still renders the values', (path) => {
    const html = read(path);
    expect(html).toMatch(/Free software|Software libre/);
    expect(html).toMatch(/Building in public|Construir en público/);
  });
});
