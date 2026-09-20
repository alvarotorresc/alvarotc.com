import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { getStackGroups } from '../src/lib/stack';

describe('getStackGroups', () => {
  it('returns four groups for Spanish, with a translated services label', () => {
    const groups = getStackGroups('es');
    expect(groups).toHaveLength(4);
    expect(groups.map((g) => g.label)).toEqual(['Backend', 'Infra', 'Frontend', 'Servicios']);
  });

  it('returns four groups for English, with an English services label', () => {
    const groups = getStackGroups('en');
    expect(groups).toHaveLength(4);
    expect(groups.map((g) => g.label)).toEqual(['Backend', 'Infra', 'Frontend', 'Services']);
  });

  it('gives every group at least one item', () => {
    for (const group of getStackGroups('en')) {
      expect(group.items.length).toBeGreaterThan(0);
    }
  });
});

describe('CV print styles', () => {
  const css = readFileSync('src/styles/global.css', 'utf8');

  it('defines a print media block that resets tokens to light and targets the cv sheet', () => {
    expect(css).toContain('@media print');
    expect(css).toContain('.cv-sheet');
  });

  it('hides the header, footer and any .no-print element when printing', () => {
    const start = css.indexOf('@media print');
    const block = css.slice(start, css.indexOf('@page', start) + 200);
    expect(block).toContain('header');
    expect(block).toContain('footer');
    expect(block).toContain('.no-print');
  });
});

describe('CvSheet markup', () => {
  const sheet = readFileSync('src/components/cv/CvSheet.astro', 'utf8');

  it('avoids header and footer tags, which the print rules hide unconditionally', () => {
    // global.css hides every <header> and <footer> in the document when printing
    // (it targets the site Nav and Footer). CvSheet must not use those tags for its
    // own name/contact band or its "Generated from..." band, or they vanish on paper.
    expect(sheet).not.toContain('<header');
    expect(sheet).not.toContain('<footer');
  });

  it('gives the sheet a real heading outline: one h1 for the name, h2 for each section', () => {
    // The five section labels (Experience, Projects, Skills, Education, Writing) must be
    // <h2>, not <span>, so assistive tech, reader modes and PDF extraction see a real outline.
    const sectionLabel =
      '<h2 class="text-[11px] font-bold uppercase tracking-[0.04em] text-faint">';
    expect(sheet).not.toContain(
      '<span class="text-[11px] font-bold uppercase tracking-[0.04em] text-faint">',
    );
    expect(sheet.split(sectionLabel).length - 1).toBe(5);
  });
});
