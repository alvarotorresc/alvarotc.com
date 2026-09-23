import { describe, it, expect } from 'vitest';
import { escapeHtml, inlineLinks } from '../src/lib/inline-links';

describe('escapeHtml', () => {
  it('escapes the five HTML special characters', () => {
    expect(escapeHtml(`<a href="x">&'</a>`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;',
    );
  });
});

describe('inlineLinks', () => {
  it('turns [text](url) into an anchor', () => {
    expect(inlineLinks('See [Bito](/projects/bito) now.')).toBe(
      'See <a href="/projects/bito">Bito</a> now.',
    );
  });

  it('handles several links in one paragraph', () => {
    expect(inlineLinks('[a](/a) and [b](https://b.dev)')).toBe(
      '<a href="/a">a</a> and <a href="https://b.dev">b</a>',
    );
  });

  it('escapes the text around and inside links', () => {
    expect(inlineLinks('1 < 2 [x<y](/x) & done')).toBe(
      '1 &lt; 2 <a href="/x">x&lt;y</a> &amp; done',
    );
  });

  it('neutralises unsafe hrefs', () => {
    expect(inlineLinks('[bad](javascript:alert(1))')).toContain('href="#"');
  });

  it('returns escaped plain text when there are no links', () => {
    expect(inlineLinks('<b>plain</b>')).toBe('&lt;b&gt;plain&lt;/b&gt;');
  });
});
