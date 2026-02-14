import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { getSiteName, getDescription, getDomain } from '../lib/config';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async (context) => {
  const posts = (await getCollection('posts'))
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: getSiteName(),
    description: getDescription(),
    site: context.site || getDomain(),
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: `/blog/${post.slug}/`,
    })),
  });
};
