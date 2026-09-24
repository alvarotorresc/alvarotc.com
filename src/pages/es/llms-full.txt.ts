import type { APIRoute } from 'astro';
import { getDomain, getSiteName, getDescription } from '../../lib/config';
import { getPosts, htmlPath } from '../../lib/posts';
import { formatLlmsFull } from '../../lib/llms';

export const GET: APIRoute = async (context) => {
  const site = context.site || getDomain();
  const posts = await getPosts('es');

  const text = formatLlmsFull(
    posts.map((post) => ({
      title: post.data.title,
      url: new URL(htmlPath(post, 'es'), site).toString(),
      date: post.data.date,
      updated: post.data.updated,
      tags: post.data.tags,
      description: post.data.description,
      body: post.body ?? '',
      lang: 'es',
    })),
    { name: getSiteName(), summary: getDescription('es'), lang: 'es' },
  );

  return new Response(text, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
};
