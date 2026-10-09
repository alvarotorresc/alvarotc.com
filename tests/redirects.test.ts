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
  trailingSlash?: boolean;
};

const RENAMED = [
  ['proyectos', 'projects'],
  ['observabilidad', 'observability'],
  ['privacidad', 'privacy'],
  ['proceso', 'process'],
];

const topics = RENAMED.flatMap(([old, tag]) => [
  { source: `/blog/topic/${old}/`, destination: `/blog/topic/${tag}/`, permanent: true },
  { source: `/es/blog/tema/${old}/`, destination: `/es/blog/tema/${tag}/`, permanent: true },
]);

const cv = [
  { source: '/cv/', destination: '/cv/Alvaro_Torres_Carrasco_CV_EN.pdf', permanent: false },
  { source: '/es/cv/', destination: '/cv/Alvaro_Torres_Carrasco_CV_ES.pdf', permanent: false },
];

const expected = [...topics, ...cv];

describe('vercel.json redirects', () => {
  it('permanently redirects every renamed topic page in both languages', () => {
    expect(vercel.redirects).toEqual(expect.arrayContaining(topics));
  });

  it('sends the old CV pages to the PDF of their language', () => {
    expect(vercel.redirects).toEqual(expect.arrayContaining(cv));
  });

  it('normalises /cv to /cv/ before redirecting', () => {
    expect(vercel.trailingSlash).toBe(true);
  });

  it('has no other redirects', () => {
    expect(vercel.redirects).toHaveLength(expected.length);
  });
});
