import { getCollection } from 'astro:content';
import { generateOGImage } from '../../lib/og';
import type { APIRoute } from 'astro';

export async function getStaticPaths() {
  const posts = await getCollection('posts');
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const { post } = props as any;

  const png = await generateOGImage({
    title: post.data.title,
    subtitle: post.data.description,
  });

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
