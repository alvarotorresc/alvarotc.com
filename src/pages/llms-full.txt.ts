import type { APIRoute } from 'astro';
import { getDomain } from '../lib/config';
import { getPosts, htmlPath } from '../lib/posts';
import { formatLlmsFull } from '../lib/llms';

export const GET: APIRoute = async (context) => {
  const site = context.site || getDomain();
  const posts = await getPosts('en');

  const text = formatLlmsFull(
    posts.map((post) => ({
      title: post.data.title,
      url: new URL(htmlPath(post, 'en'), site).toString(),
      date: post.data.date,
      updated: post.data.updated,
      tags: post.data.tags,
      description: post.data.description,
      body: post.body ?? '',
    })),
  );

  return new Response(text, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
};
