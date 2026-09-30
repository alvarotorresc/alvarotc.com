import type { APIRoute } from 'astro';
import { t, type Locale } from '../i18n/translations';
import { getDescription } from '../lib/config';
import { getPosts } from '../lib/posts';
import { getProjects, projectSlug } from '../lib/projects';
import type { SearchItem } from '../lib/search';

const locales: Locale[] = ['en', 'es'];

const pages = [
  { key: 'nav.about', path: '/about/' },
  { key: 'nav.projects', path: '/projects/' },
  { key: 'nav.writing', path: '/blog/' },
  { key: 'nav.cv', path: '/cv/' },
  { key: 'contact.title', path: '/#contact' },
] as const;

export const GET: APIRoute = async () => {
  const items: SearchItem[] = [];

  for (const lang of locales) {
    const prefix = lang === 'es' ? '/es' : '';

    for (const page of pages) {
      items.push({
        kind: 'page',
        lang,
        title: t(page.key, lang),
        text: getDescription(lang),
        url: `${prefix}${page.path}`,
      });
    }

    for (const project of await getProjects(lang)) {
      items.push({
        kind: 'project',
        lang,
        title: project.data.name,
        text: `${project.data.tagline} ${project.data.stack.join(' ')}`,
        url: `${prefix}/projects/${projectSlug(project)}/`,
      });
    }

    for (const post of await getPosts(lang)) {
      items.push({
        kind: 'post',
        lang,
        title: post.data.title,
        text: `${post.data.description} ${post.data.tags.join(' ')}`,
        url: `${prefix}/blog/${post.id}/`,
      });
    }
  }

  return new Response(JSON.stringify(items), {
    headers: { 'Content-Type': 'application/json' },
  });
};
