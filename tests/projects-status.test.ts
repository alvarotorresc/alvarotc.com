import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const dist = resolve('dist');

describe.skipIf(!existsSync(dist))('status link on the projects listing', () => {
  it.each([
    ['projects/index.html', 'Live status'],
    ['es/projects/index.html', 'Estado en tiempo real'],
  ])('%s links to the status page', (file, label) => {
    const html = readFileSync(resolve(dist, file), 'utf8');
    const main = html.split('<footer')[0];
    expect(main).toContain('href="https://status.alvarotc.com"');
    expect(main).toContain(label);
    expect(main).not.toContain('llms.txt');
  });
});
