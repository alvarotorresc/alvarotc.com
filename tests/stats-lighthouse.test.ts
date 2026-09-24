import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { representativeScore, lighthouseScores } from '../scripts/lib/lighthouse.mjs';

const fixture = (name: string) =>
  JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8'));
const mobile = fixture('lighthouse-mobile.json');
const desktop = fixture('lighthouse-desktop.json');

describe('representativeScore', () => {
  it('takes the median run of the home page, not the best one', () => {
    expect(representativeScore(mobile, '/')).toBe(96);
  });

  it('reads other pages by pathname regardless of the port', () => {
    expect(representativeScore(mobile, '/es/')).toBe(93);
  });

  it('is null when the page was not audited', () => {
    expect(representativeScore(mobile, '/stats/')).toBeNull();
  });
});

describe('lighthouseScores', () => {
  it('combines the mobile and desktop home scores', () => {
    expect(lighthouseScores(mobile, desktop)).toEqual({
      performanceMobile: 96,
      performanceDesktop: 100,
    });
  });

  it('is null when one of the manifests has no home run', () => {
    expect(lighthouseScores(mobile, [])).toBeNull();
  });
});
