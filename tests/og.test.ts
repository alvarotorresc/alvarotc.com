import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { generateOGImage } from '../src/lib/og';

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

describe('generateOGImage', () => {
  it('reads the font from node_modules, never from a CDN', () => {
    const source = readFileSync('src/lib/og.ts', 'utf8');
    expect(source).toContain('@fontsource/manrope');
    expect(source).not.toContain('cdn.jsdelivr.net');
    expect(source).not.toContain('generateDefaultOGImage');
  });

  it('returns a PNG buffer', async () => {
    const png = await generateOGImage({ title: 'Hola', subtitle: 'Prueba' });
    expect([...png.subarray(0, 8)]).toEqual(PNG_SIGNATURE);
  }, 20000);
});
