import rss from '@astrojs/rss';
import { getSiteName, getDescription, getDomain } from '../lib/config';
import { getPosts } from '../lib/posts';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async (context) => {
  const posts = await getPosts('es');

  return rss({
    title: getSiteName(),
    description: getDescription('es'),
    site: context.site || getDomain(),
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: `/es/blog/${post.id}/`,
    })),
  });
};
