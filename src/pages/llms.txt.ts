import type { APIRoute } from 'astro';
import { getSiteName, getDescription, getDomain } from '../lib/config';
import { getPosts, markdownPath } from '../lib/posts';
import { getProjects, projectSlug } from '../lib/projects';
import { formatLlmsTxt } from '../lib/llms';

export const GET: APIRoute = async (context) => {
  const site = context.site || getDomain();
  const [postsEn, postsEs, projectsEn] = await Promise.all([
    getPosts('en'),
    getPosts('es'),
    getProjects('en'),
  ]);

  const text = formatLlmsTxt({
    name: getSiteName(),
    summary: getDescription('en'),
    articlesEn: postsEn.map((post) => ({
      title: post.data.title,
      url: new URL(markdownPath(post, 'en'), site).toString(),
      description: post.data.description,
    })),
    articlesEs: postsEs.map((post) => ({
      title: post.data.title,
      url: new URL(markdownPath(post, 'es'), site).toString(),
      description: post.data.description,
    })),
    projects: projectsEn.map((project) => ({
      title: project.data.name,
      url: new URL(`/projects/${projectSlug(project)}/`, site).toString(),
      description: project.data.tagline,
    })),
    pages: [
      { title: 'About', url: new URL('/about/', site).toString() },
      { title: 'CV', url: new URL('/cv/', site).toString() },
      { title: 'Stats', url: new URL('/stats/', site).toString() },
      { title: 'Projects', url: new URL('/projects/', site).toString() },
    ],
    feeds: [
      { title: 'RSS (English)', url: new URL('/rss.xml', site).toString() },
      { title: 'RSS (Español)', url: new URL('/es/rss.xml', site).toString() },
      { title: 'llms-full.txt (English)', url: new URL('/llms-full.txt', site).toString() },
      { title: 'llms-full.txt (Español)', url: new URL('/es/llms-full.txt', site).toString() },
    ],
  });

  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
