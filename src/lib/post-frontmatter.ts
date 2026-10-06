import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface PostFrontmatter {
  id: string;
  source?: string;
  date?: string;
  tags: string[];
}

export function readPublishedPosts(dir: string): PostFrontmatter[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => ({ f, fm: readFileSync(join(dir, f), 'utf8').split('---')[1] ?? '' }))
    .filter(({ fm }) => !/^draft:\s*true\s*$/m.test(fm))
    .map(({ f, fm }) => {
      const get = (k: string) =>
        fm.match(new RegExp(`^${k}:\\s*['"]?([^'"\\n]+)`, 'm'))?.[1]?.trim();
      const tagsMatch = fm.match(/^tags:\s*\[([^\]]*)\]/m);
      const tags = tagsMatch
        ? tagsMatch[1]
            .split(',')
            .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
            .filter(Boolean)
        : [];
      return {
        id: f.replace(/\.md$/, ''),
        source: get('source'),
        date: get('updated') ?? get('date'),
        tags,
      };
    });
}
