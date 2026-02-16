import { getCollection } from 'astro:content';
import { generateOGImage } from '../../lib/og';
import type { APIRoute } from 'astro';

export async function getStaticPaths() {
  const [posts, postsEn] = await Promise.all([getCollection('posts'), getCollection('posts-en')]);
  const all = [...posts, ...postsEn];
  return all.map((post) => ({
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

  return new Response(png as unknown as BodyInit, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
