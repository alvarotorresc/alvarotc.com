import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface Redirect {
  source: string;
  destination: string;
  permanent?: boolean;
}

const vercel = JSON.parse(readFileSync(resolve('vercel.json'), 'utf8')) as {
  redirects?: Redirect[];
};

const RENAMED = [
  ['proyectos', 'projects'],
  ['observabilidad', 'observability'],
  ['privacidad', 'privacy'],
  ['proceso', 'process'],
];

const expected = RENAMED.flatMap(([old, tag]) => [
  { source: `/blog/topic/${old}/`, destination: `/blog/topic/${tag}/`, permanent: true },
  { source: `/es/blog/tema/${old}/`, destination: `/es/blog/tema/${tag}/`, permanent: true },
]);

describe('vercel.json redirects', () => {
  it('permanently redirects the 8 renamed topic pages', () => {
    expect(vercel.redirects).toHaveLength(8);
    expect(vercel.redirects).toEqual(expect.arrayContaining(expected));
  });
});
