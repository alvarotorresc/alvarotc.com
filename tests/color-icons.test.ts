import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import ColorIcon from '../src/components/icons/color/ColorIcon.astro';
import { colorIconNames } from '../src/components/icons/color/tints';

describe.each(colorIconNames)('ColorIcon %s', (name) => {
  it('renders an svg marked as decorative', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ColorIcon, { props: { name } });
    expect(html).toContain('<svg');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('focusable="false"');
  });
});
