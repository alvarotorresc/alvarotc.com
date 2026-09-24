import { defineCollection, type SchemaContext } from 'astro:content';
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

export const projectSchema = ({ image }: SchemaContext) =>
  z.object({
    name: z.string(),
    tagline: z.string(),
    kind: z.enum(['mobile', 'web', 'hybrid', 'cli']),
    status: z.enum(['published', 'publishing', 'beta', 'development', 'design', 'archived']),
    tier: z.enum(['featured', 'lab']),
    order: z.number(),
    visible: z.boolean().default(true),
    repo: z.url().optional(),
    url: z.url().optional(),
    license: z.string().optional(),
    stack: z.array(z.string()).default([]),
    platform: z.string().optional(),
    intro: z.string().optional(),
    icon: image().optional(),
    cover: image().optional(),
    coverMobile: image().optional(),
    promo: image().optional(),
    download: z.object({ url: z.url(), label: z.string() }).optional(),
    command: z.string().optional(),
    terminal: z.array(z.string()).default([]),
    facts: z
      .array(z.object({ label: z.string(), value: z.string(), mono: z.boolean().default(false) }))
      .default([]),
    screenshots: z
      .array(z.object({ src: image(), alt: z.string(), caption: z.string() }))
      .default([]),
    screenshotsIntro: z.string().optional(),
    featuresIntro: z.string().optional(),
    features: z
      .array(z.object({ title: z.string(), text: z.string(), image: image().optional() }))
      .default([]),
    steps: z.array(z.object({ title: z.string(), text: z.string() })).default([]),
    stepsIntro: z.string().optional(),
    after: z.string().optional(),
    post: z.string().optional(),
    illustration: image().optional(),
    built: z.array(z.string()).default([]),
    playground: z.object({ kind: z.enum(['pwa', 'iframe', 'video']), src: z.url() }).optional(),
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

const nowSchema = ({ image }: SchemaContext) =>
  z.object({
    reading: z
      .array(
        z.object({
          title: z.string(),
          author: z.string(),
          cover: image().optional(),
          url: z.url().optional(),
        }),
      )
      .default([]),
    listening: z
      .array(
        z.object({
          title: z.string(),
          artist: z.string(),
          art: image().optional(),
          url: z.url().optional(),
        }),
      )
      .default([]),
    tools: z
      .array(z.object({ name: z.string(), icon: z.string().optional(), svg: image().optional() }))
      .default([]),
    building: z.object({ project: z.string() }),
    mock: z.boolean().default(false),
  });

export const interestSchema = z.object({
  icon: z.enum(['guitar', 'chess', 'boxing', 'book', 'music', 'paw']),
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
  schema: ({ image }) => nowSchema({ image }),
});

const interests = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/interests' }),
  schema: interestSchema,
});

const stageSchema = (image: SchemaContext['image']) =>
  z.object({
    id: z.string(),
    kicker: z.string(),
    title: z.string(),
    paragraphs: z.array(z.string()).min(1),
    links: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
    photo: image().optional(),
    photoAlt: z.string().optional(),
    caption: z.string().optional(),
    facts: z
      .object({ year: z.string(), place: z.string(), os: z.string(), stack: z.string() })
      .optional(),
  });

export const aboutSchema = ({ image }: SchemaContext) =>
  z.object({
    title: z.string(),
    intro: z.string(),
    values: z
      .array(
        z.object({
          icon: z.enum(['tux', 'lock', 'cat', 'megaphone']),
          title: z.string(),
          text: z.string(),
        }),
      )
      .min(1),
    stages: z.array(stageSchema(image)).min(1),
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
