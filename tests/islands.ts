import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { getContainerRenderer } from '@astrojs/react/container-renderer';

export async function createIslandContainer() {
  const renderers = await loadRenderers([getContainerRenderer()]);
  return AstroContainer.create({ renderers });
}
