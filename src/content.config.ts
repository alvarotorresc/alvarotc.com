import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

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
    .array(z.object({ version: z.string(), date: z.coerce.date().optional(), note: z.string() }))
    .default([]),
  githubRepo: z.string().optional(),
  mock: z.boolean().default(false),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: projectSchema,
});

const localized = z.object({ en: z.string(), es: z.string() });
const localizedList = z.object({ en: z.array(z.string()), es: z.array(z.string()) });

export const experienceSchema = z.object({
  kind: z.enum(['work', 'education', 'certification']),
  company: z.string(),
  role: localized,
  location: z.string().optional(),
  start: z.string().regex(/^\d{4}-\d{2}$/),
  end: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .optional(),
  summary: localized,
  highlights: localizedList.optional(),
  stack: z.array(z.string()).default([]),
  url: z.url().optional(),
  mock: z.boolean().default(false),
});

export const nowSchema = z.object({
  reading: z.object({
    title: z.string(),
    author: z.string(),
    progress: z.number().min(0).max(100),
    cover: z.string().optional(),
  }),
  dailyDriver: z.object({
    distro: z.string(),
    kernel: z.string().optional(),
    selfHosted: z.array(z.string()).default([]),
  }),
  building: z.object({ project: z.string() }),
  listenbrainzUser: z.string().optional(),
  mock: z.boolean().default(false),
});

export const interestSchema = z.object({
  icon: z.enum(['guitar', 'chess', 'boxing', 'book', 'music']),
  order: z.number(),
  title: localized,
  text: localized,
  mock: z.boolean().default(false),
});

const experience = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/experience' }),
  schema: experienceSchema,
});

const now = defineCollection({
  loader: glob({ pattern: 'now.yaml', base: './src/content/now' }),
  schema: nowSchema,
});

const interests = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/interests' }),
  schema: interestSchema,
});

export const aboutSchema = z.object({
  title: z.string(),
  intro: z.string(),
  values: z.array(z.object({ title: z.string(), text: z.string() })).min(1),
  mock: z.boolean().default(false),
});

const about = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/about' }),
  schema: aboutSchema,
});

export const collections = {
  posts,
  'posts-en': postsEn,
  projects,
  experience,
  now,
  interests,
  about,
};
