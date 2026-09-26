import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';

export default function clientInteraction(): AstroIntegration {
  return {
    name: 'client:interaction',
    hooks: {
      'astro:config:setup': ({ addClientDirective }) => {
        addClientDirective({
          name: 'interaction',
          entrypoint: fileURLToPath(new URL('../directives/interaction.ts', import.meta.url)),
        });
      },
    },
  };
}
