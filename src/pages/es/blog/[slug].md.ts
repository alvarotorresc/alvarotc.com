import type { APIRoute } from 'astro';
import { getDomain } from '../../../lib/config';
import { getPosts, htmlPath, findTranslation, type PostEntry } from '../../../lib/posts';
import { buildPostMarkdown } from '../../../lib/llms';

export async function getStaticPaths() {
  const [postsEn, postsEs] = await Promise.all([getPosts('en'), getPosts('es')]);
  return postsEs.map((post) => ({
    params: { slug: post.id },
    props: { post, postsEn, postsEs },
  }));
}

export const GET: APIRoute = async ({ props, site }) => {
  const { post, postsEn, postsEs } = props as {
    post: PostEntry;
    postsEn: PostEntry[];
    postsEs: PostEntry[];
  };
  const baseSite = site || getDomain();
  const translation = findTranslation(post, 'es', postsEn, postsEs);

  const text = buildPostMarkdown({
    title: post.data.title,
    description: post.data.description,
    date: post.data.date,
    updated: post.data.updated,
    tags: post.data.tags,
    canonical: new URL(htmlPath(post, 'es'), baseSite).toString(),
    language: 'es',
    alternate: translation ? new URL(htmlPath(translation, 'en'), baseSite).toString() : undefined,
    body: post.body ?? '',
  });

  return new Response(text, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
};
