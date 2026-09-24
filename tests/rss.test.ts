import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const dist = resolve('dist');
const built = existsSync(dist);

const enFeed = () => readFileSync(resolve(dist, 'rss.xml'), 'utf8');
const esFeed = () => readFileSync(resolve(dist, 'es/rss.xml'), 'utf8');

const enTitles = [
  'BaseCero: Your money doesn&apos;t have to sit on someone else&apos;s server',
  'Set up a service on your VPS today and move it to your homelab tomorrow: FreshRSS with Docker and Caddy',
  'From an idea to an APK in 24 hours',
  'How I Set Up My VPS with Full Observability for Less Than €5/Month',
  'New website, new direction',
];

const esTitles = [
  'BaseCero: tu dinero no tiene por qué vivir en el servidor de nadie',
  'Monta un servicio en tu VPS hoy y múdalo a tu homelab mañana: FreshRSS con Docker y Caddy',
  'De una idea a una APK en 24h',
  'Cómo monté mi VPS con observabilidad completa por menos de 5€/mes',
  'Nueva web, nuevo rumbo',
];

describe.skipIf(!built)('/rss.xml (English feed)', () => {
  it('has 5 items', () => {
    expect([...enFeed().matchAll(/<item>/g)]).toHaveLength(5);
  });

  it('only contains English post titles', () => {
    const xml = enFeed();
    for (const title of enTitles) expect(xml).toContain(title);
    for (const title of esTitles) expect(xml).not.toContain(title);
  });

  it('declares English language and a self atom link', () => {
    const xml = enFeed();
    expect(xml).toContain('<language>en</language>');
    expect(xml).toContain('<atom:link href="https://alvarotc.com/rss.xml" rel="self"');
  });

  it('links to /blog/, not /es/blog/', () => {
    const xml = enFeed();
    expect(xml).toContain('https://alvarotc.com/blog/');
    expect(xml).not.toContain('/es/blog/');
  });
});

describe.skipIf(!built)('/es/rss.xml (Spanish feed)', () => {
  it('has 5 items', () => {
    expect([...esFeed().matchAll(/<item>/g)]).toHaveLength(5);
  });

  it('only contains Spanish post titles', () => {
    const xml = esFeed();
    for (const title of esTitles) expect(xml).toContain(title);
    for (const title of enTitles) expect(xml).not.toContain(title);
  });

  it('declares Spanish language and a self atom link', () => {
    const xml = esFeed();
    expect(xml).toContain('<language>es</language>');
    expect(xml).toContain('<atom:link href="https://alvarotc.com/es/rss.xml" rel="self"');
  });

  it('links to /es/blog/', () => {
    const xml = esFeed();
    expect(xml).toContain('https://alvarotc.com/es/blog/');
  });
});

describe.skipIf(!built)('both feeds', () => {
  it('have the same number of items', () => {
    const enCount = [...enFeed().matchAll(/<item>/g)].length;
    const esCount = [...esFeed().matchAll(/<item>/g)].length;
    expect(enCount).toBe(esCount);
  });
});
