import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readPublishedPosts } from '../src/lib/post-frontmatter';

let dir: string;

beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), 'posts-'));
  writeFileSync(
    join(dir, 'published.md'),
    "---\ntitle: 'A'\ndate: 2026-09-01\nupdated: 2026-09-10\nsource: 'origen'\ndraft: false\ntags: ['web', \"vps\"]\n---\nBody\n",
  );
  writeFileSync(
    join(dir, 'borrador.md'),
    "---\ntitle: 'B'\ndate: 2026-09-02\ndraft: true\ntags: ['web']\n---\nBody\n",
  );
  writeFileSync(join(dir, 'notes.txt'), 'ignored');
});

afterAll(() => rmSync(dir, { recursive: true, force: true }));

describe('readPublishedPosts', () => {
  it('skips drafts and reads id, source, date and tags', () => {
    expect(readPublishedPosts(dir)).toEqual([
      { id: 'published', source: 'origen', date: '2026-09-10', tags: ['web', 'vps'] },
    ]);
  });
});
