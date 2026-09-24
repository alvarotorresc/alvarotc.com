import rss from '@astrojs/rss';
import { getSiteName, getDescription, getDomain } from '../../lib/config';
import { getPosts } from '../../lib/posts';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async (context) => {
  const posts = await getPosts('es');
  const site = context.site || getDomain();

  return rss({
    title: getSiteName(),
    description: getDescription('es'),
    site,
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    customData: `<language>es</language><atom:link href="${new URL('/es/rss.xml', site)}" rel="self" type="application/rss+xml"/>`,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: `/es/blog/${post.id}/`,
    })),
  });
};
