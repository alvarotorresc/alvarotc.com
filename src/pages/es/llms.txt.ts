import type { APIRoute } from 'astro';
import { getDomain } from '../../lib/config';
import { buildLlmsTxt } from '../../lib/llms';

export const GET: APIRoute = async (context) => {
  const site = context.site || getDomain();
  const text = await buildLlmsTxt('es', site);
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
