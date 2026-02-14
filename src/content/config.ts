import { defineCollection, z } from 'astro:content';

const postSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  draft: z.boolean().default(false),
  image: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

const projectSchema = z.object({
  name: z.string(),
  tagline: z.string(),
  description: z.string(),
  category: z.enum(['flagship', 'lab']),
  status: z.enum(['active', 'development', 'idea', 'archived']),
  url: z.string().optional(),
  repo: z.string().optional(),
  image: z.string().optional(),
  stack: z.array(z.string()),
  featured: z.boolean().default(false),
  order: z.number().default(999),
  domain: z.string().optional(),
  startDate: z.string().optional(),
});

const posts = defineCollection({
  type: 'content',
  schema: postSchema,
});

const postsEn = defineCollection({
  type: 'content',
  schema: postSchema,
});

const projects = defineCollection({
  type: 'content',
  schema: projectSchema,
});

export const collections = {
  posts, // Spanish (source)
  'posts-en': postsEn, // English (translated)
  projects,
};
