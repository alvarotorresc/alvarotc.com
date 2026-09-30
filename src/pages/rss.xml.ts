import rss from '@astrojs/rss';
import { getSiteName, getDescription, getDomain } from '../lib/config';
import { getPosts } from '../lib/posts';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async (context) => {
  const posts = await getPosts('en');
  const site = context.site || getDomain();
  const channelLink = new URL('/blog/', site);

  return rss({
    title: `${getSiteName()} · Writing`,
    description: getDescription('en'),
    site,
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    customData: `<language>en</language><link>${channelLink}</link><atom:link href="${new URL('/rss.xml', site)}" rel="self" type="application/rss+xml"/>`,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: `/blog/${post.id}/`,
    })),
  });
};
