import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { contrastRatio } from '../src/lib/contrast';

const css = readFileSync('src/styles/global.css', 'utf8');

function block(selector: string): Record<string, string> {
  const start = css.indexOf(selector);
  expect(start, `selector ${selector} not found`).toBeGreaterThan(-1);
  const body = css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start));
  const vars: Record<string, string> = {};
  for (const m of body.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})/g)) vars[m[1]] = m[2];
  return vars;
}

const pairs: Array<[string, string, number]> = [
  ['text', 'bg', 4.5],
  ['text-muted', 'bg', 4.5],
  ['text-faint', 'bg', 4.5],
  ['text', 'surface', 4.5],
  ['text-muted', 'surface', 4.5],
  ['text-faint', 'surface', 4.5],
  ['accent-fg', 'accent', 4.5],
  ['accent', 'bg', 4.5],
  ['ok', 'surface', 3],
  ['text-faint', 'surface-2', 4.5],
  ['text-muted', 'surface-2', 4.5],
  ['accent', 'surface-2', 4.5],
];

describe('color tokens', () => {
  for (const [selector, name] of [
    [':root {', 'light'],
    [":root[data-theme='dark'] {", 'dark'],
  ] as const) {
    const vars = block(selector);
    for (const [fg, bg, min] of pairs) {
      it(`${name}: ${fg} on ${bg} >= ${min}`, () => {
        expect(vars[fg], `missing --${fg}`).toBeDefined();
        expect(vars[bg], `missing --${bg}`).toBeDefined();
        expect(contrastRatio(vars[fg], vars[bg])).toBeGreaterThanOrEqual(min);
      });
    }
  }
});
