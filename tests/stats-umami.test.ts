import { describe, it, expect } from 'vitest';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  umamiRange,
  umamiHeaders,
  parseViews,
  blogPath,
  frontmatter,
  loadPostTitles,
  mostRead,
  fetchUmami,
} from '../scripts/lib/umami.mjs';

const fixture = (name: string) =>
  JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8'));
const metrics = fixture('umami-metrics.json');
const now = new Date('2026-09-24T12:00:00Z');

const titles = new Map([
  ['/es/blog/vps-observabilidad-completa/', 'Cómo monté mi VPS con observabilidad completa'],
  ['/blog/new-website-new-direction/', 'New website, new direction'],
  ['/es/blog/de-una-idea-a-una-apk-en-24h/', 'De una idea a una APK en 24h'],
  ['/es/blog/nueva-web-nuevo-rumbo/', 'Nueva web, nuevo rumbo'],
  ['/blog/from-an-idea-to-an-apk-in-24-hours/', 'From an idea to an APK in 24 hours'],
]);

describe('umamiRange', () => {
  it('covers the last 30 days in epoch milliseconds', () => {
    expect(umamiRange(now)).toEqual({ startAt: '1787659200000', endAt: '1790251200000' });
  });
});

describe('umamiHeaders', () => {
  it('sends the key as a bearer token and as x-umami-api-key', () => {
    expect(umamiHeaders('umami_abc')).toEqual({
      Accept: 'application/json',
      Authorization: 'Bearer umami_abc',
      'x-umami-api-key': 'umami_abc',
    });
  });
});

describe('parseViews', () => {
  it('reads the flat v3 shape', () => {
    expect(parseViews(fixture('umami-stats-v3.json'))).toBe(1342);
  });

  it('reads the v2 value/prev shape', () => {
    expect(parseViews(fixture('umami-stats-v2.json'))).toBe(1342);
  });

  it('coerces a bigint serialised as a string', () => {
    expect(parseViews({ pageviews: '87' })).toBe(87);
  });

  it('throws when pageviews is missing', () => {
    expect(() => parseViews({} as { pageviews: number })).toThrow();
  });
});

describe('blogPath', () => {
  it('normalises post paths to the trailing slash form', () => {
    expect(blogPath('/blog/new-website-new-direction')).toBe('/blog/new-website-new-direction/');
    expect(blogPath('/es/blog/nueva-web-nuevo-rumbo/')).toBe('/es/blog/nueva-web-nuevo-rumbo/');
    expect(blogPath('/blog/from-an-idea-to-an-apk-in-24-hours/?ref=hn')).toBe(
      '/blog/from-an-idea-to-an-apk-in-24-hours/',
    );
  });

  it('rejects markdown twins and non blog paths', () => {
    expect(blogPath('/es/blog/nueva-web-nuevo-rumbo.md')).toBeNull();
    expect(blogPath('/stats/')).toBeNull();
    expect(blogPath('/blog/topic/astro/')).toBeNull();
  });
});

describe('frontmatter', () => {
  it('reads a single quoted title with a colon', () => {
    const md = "---\ntitle: 'BaseCero: tu dinero no vive aquí'\ndraft: false\n---\n\nBody";
    expect(frontmatter(md)).toEqual({ title: 'BaseCero: tu dinero no vive aquí', draft: false });
  });

  it('unescapes a doubled single quote', () => {
    const md = "---\ntitle: 'BaseCero: Your money doesn''t sit there'\n---\n";
    expect(frontmatter(md)?.title).toBe("BaseCero: Your money doesn't sit there");
  });

  it('reads double quoted and plain titles', () => {
    expect(frontmatter('---\ntitle: "A \\"quoted\\" word"\n---\n')?.title).toBe('A "quoted" word');
    expect(frontmatter('---\ntitle: Plain title\n---\n')?.title).toBe('Plain title');
  });

  it('flags drafts and ignores files without frontmatter', () => {
    expect(frontmatter("---\ntitle: 'Wip'\ndraft: true\n---\n")?.draft).toBe(true);
    expect(frontmatter('# No frontmatter')).toBeNull();
  });
});

describe('loadPostTitles', () => {
  it('maps both collections to their public paths and skips drafts', () => {
    const root = mkdtempSync(join(tmpdir(), 'titles-'));
    mkdirSync(join(root, 'src/content/posts'), { recursive: true });
    mkdirSync(join(root, 'src/content/posts-en'), { recursive: true });
    writeFileSync(join(root, 'src/content/posts/hola.md'), "---\ntitle: 'Hola'\n---\n");
    writeFileSync(
      join(root, 'src/content/posts/borrador.md'),
      "---\ntitle: 'Borrador'\ndraft: true\n---\n",
    );
    writeFileSync(join(root, 'src/content/posts-en/hello.md'), "---\ntitle: 'Hello'\n---\n");
    expect(loadPostTitles(root)).toEqual(
      new Map([
        ['/es/blog/hola/', 'Hola'],
        ['/blog/hello/', 'Hello'],
      ]),
    );
  });
});

describe('mostRead', () => {
  it('merges path variants, drops unknown paths and keeps the top 3', () => {
    expect(mostRead(metrics, titles)).toEqual([
      {
        path: '/es/blog/vps-observabilidad-completa/',
        title: 'Cómo monté mi VPS con observabilidad completa',
        views: 215,
      },
      { path: '/blog/new-website-new-direction/', title: 'New website, new direction', views: 150 },
      {
        path: '/es/blog/de-una-idea-a-una-apk-en-24h/',
        title: 'De una idea a una APK en 24h',
        views: 140,
      },
    ]);
  });

  it('is empty when no post was read', () => {
    expect(mostRead([{ x: '/', y: 10 }], titles)).toEqual([]);
  });
});

describe('fetchUmami', () => {
  const base = {
    apiKey: 'umami_abc',
    websiteId: 'site-1',
    baseUrl: 'https://analytics.example.com/',
    now,
    titles,
  };

  it('reads stats and path metrics', async () => {
    const urls: string[] = [];
    const fetchImpl = async (url: string) => {
      urls.push(url);
      const body = url.includes('/stats?') ? fixture('umami-stats-v3.json') : metrics;
      return new Response(JSON.stringify(body), { status: 200 });
    };
    const umami = await fetchUmami({ ...base, fetchImpl: fetchImpl as unknown as typeof fetch });
    expect(urls[0]).toBe(
      'https://analytics.example.com/api/websites/site-1/stats?startAt=1787659200000&endAt=1790251200000',
    );
    expect(urls[1]).toContain('/api/websites/site-1/metrics?');
    expect(urls[1]).toContain('type=path');
    expect(umami.views30d).toBe(1342);
    expect(umami.mostRead).toHaveLength(3);
  });

  it('falls back to type=url on Umami v2', async () => {
    const urls: string[] = [];
    const fetchImpl = async (url: string) => {
      urls.push(url);
      if (url.includes('type=path')) return new Response('{}', { status: 400 });
      const body = url.includes('/stats?') ? fixture('umami-stats-v2.json') : metrics;
      return new Response(JSON.stringify(body), { status: 200 });
    };
    const umami = await fetchUmami({ ...base, fetchImpl: fetchImpl as unknown as typeof fetch });
    expect(urls[2]).toContain('type=url');
    expect(umami.views30d).toBe(1342);
  });

  it('throws when the key is rejected', async () => {
    const fetchImpl = async () => new Response('{}', { status: 401 });
    await expect(
      fetchUmami({ ...base, fetchImpl: fetchImpl as unknown as typeof fetch }),
    ).rejects.toThrow('401');
  });
});
