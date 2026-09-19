import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

export const postSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  draft: z.boolean().default(false),
  image: z.string().optional(),
  tags: z.array(z.string()).default([]),
  source: z.string().optional(),
});

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: postSchema,
});

const postsEn = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts-en' }),
  schema: postSchema,
});

export const projectSchema = z.object({
  name: z.string(),
  tagline: z.string(),
  status: z.enum(['published', 'beta', 'development', 'design', 'archived']),
  tier: z.enum(['featured', 'lab']),
  order: z.number(),
  visible: z.boolean().default(true),
  repo: z.url().optional(),
  url: z.url().optional(),
  license: z.string().optional(),
  stack: z.array(z.string()).default([]),
  platform: z.string().optional(),
  icon: z.string().optional(),
  hero: z.string().optional(),
  gallery: z.array(z.string()).default([]),
  playground: z.object({ kind: z.enum(['pwa', 'iframe', 'video']), src: z.string() }).optional(),
  changelog: z
    .array(z.object({ version: z.string(), date: z.string().optional(), note: z.string() }))
    .default([]),
  githubRepo: z.string().optional(),
  mock: z.boolean().default(false),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: projectSchema,
});

export const collections = {
  posts,
  'posts-en': postsEn,
  projects,
};
