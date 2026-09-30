#!/usr/bin/env node
// Generates or removes fake blog posts (es + en) for testing /blog pagination locally.
// Usage:
//   node scripts/mock-posts.mjs 30       -> creates 30 mock posts in each locale
//   node scripts/mock-posts.mjs --clean  -> removes all zz-mock-* files in both locales

import { readdirSync, writeFileSync, unlinkSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ES_DIR = join(ROOT, 'src/content/posts');
const EN_DIR = join(ROOT, 'src/content/posts-en');

const TAGS = [
  'docker',
  'foss',
  'self-hosted',
  'vps',
  'android',
  'astro',
  'privacidad',
  'kotlin',
  'devops',
  'homelab',
  'caddy',
  'observabilidad',
  'pwa',
  'local-first',
  'producto',
];

const TOPICS = [
  ['paginación con Docker', 'pagination with Docker'],
  ['despliegue en VPS', 'VPS deployment'],
  ['self-hosting con Caddy', 'self-hosting with Caddy'],
  ['observabilidad casera', 'homemade observability'],
  ['una app FOSS para Android', 'a FOSS app for Android'],
  ['privacidad por diseño', 'privacy by design'],
  ['islas en Astro', 'islands in Astro'],
  ['backups automatizados', 'automated backups'],
  ['un homelab minimalista', 'a minimal homelab'],
  ['local-first de verdad', 'actually local-first'],
];

function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function pickTags(seed) {
  const count = 2 + (seed % 3); // 2-4
  const start = seed % TAGS.length;
  const picked = [];
  for (let i = 0; i < count; i++) {
    picked.push(TAGS[(start + i) % TAGS.length]);
  }
  return picked;
}

function randomDate(seed) {
  // Spread across 2024-01-01 .. 2026-12-31
  const startYear = 2024;
  const spanDays = 3 * 365;
  const dayOffset = (seed * 37) % spanDays;
  const d = new Date(startYear, 0, 1);
  d.setDate(d.getDate() + dayOffset);
  return d.toISOString().slice(0, 10);
}

function body(topicEs, topicEn, n, lang) {
  if (lang === 'es') {
    return `Este es un artículo de prueba generado automáticamente para comprobar la paginación del blog. Trata, en teoría, sobre ${topicEs}, aunque el contenido real no importa: lo que importa es que exista suficiente texto para calcular un tiempo de lectura razonable y que el índice de encabezados tenga algo que mostrar.

## Primer punto sobre ${topicEs}

Aquí iría una explicación detallada, pero como esto es contenido de prueba número ${n}, basta con un par de frases que ocupen espacio. El objetivo es simular un post real con estructura real: introducción, un par de secciones y una conclusión breve.

## Segundo punto sobre ${topicEs}

Esta segunda sección repite el patrón para que el lector de prueba vea que el artículo tiene profundidad. No hay nada que aprender aquí, solo texto de relleno para validar que la paginación, el conteo de artículos y las páginas de tema funcionan correctamente con muchos posts.`;
  }
  return `This is an automatically generated test article to check the blog's pagination. It is nominally about ${topicEn}, although the actual content doesn't matter: what matters is having enough text for a reasonable reading time and headings for the table of contents to show.

## First point about ${topicEn}

A detailed explanation would go here, but since this is test content number ${n}, a couple of filler sentences will do. The goal is to simulate a real post with real structure: an intro, a couple of sections and a short conclusion.

## Second point about ${topicEn}

This second section repeats the pattern so the test reader can see the article has some depth. There is nothing to learn here, just filler text to validate that pagination, the post count and topic pages work correctly with many posts.`;
}

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function generate(count) {
  ensureDir(ES_DIR);
  ensureDir(EN_DIR);

  for (let i = 1; i <= count; i++) {
    const seed = i;
    const [topicEs, topicEn] = TOPICS[(seed - 1) % TOPICS.length];
    const titleEs = `Artículo de prueba ${pad(i)}: ${topicEs}`;
    const titleEn = `Test article ${pad(i)}: ${topicEn}`;
    const slugEs = slugify(titleEs.replace(/^Artículo de prueba \d+: /, `mock-${pad(i)}-`));
    const date = randomDate(seed);
    const tags = pickTags(seed);
    const descEs = `Post de prueba número ${pad(i)} generado para comprobar la paginación del blog con muchos artículos.`;
    const descEn = `Test post number ${pad(i)} generated to check blog pagination with many articles.`;

    const esFile = `zz-mock-${pad(i)}-${slugEs}.md`;
    const enFile = `zz-mock-${pad(i)}-${slugEs}.md`;

    const esFrontmatter = [
      '---',
      `title: '${titleEs.replace(/'/g, "''")}'`,
      `description: '${descEs.replace(/'/g, "''")}'`,
      `date: ${date}`,
      'draft: false',
      `tags: [${tags.map((t) => `'${t}'`).join(', ')}]`,
      '---',
      '',
    ].join('\n');

    const enFrontmatter = [
      '---',
      `title: '${titleEn.replace(/'/g, "''")}'`,
      `description: '${descEn.replace(/'/g, "''")}'`,
      `date: ${date}`,
      'draft: false',
      `tags: [${tags.map((t) => `'${t}'`).join(', ')}]`,
      `source: ${slugEs}`,
      '---',
      '',
    ].join('\n');

    writeFileSync(join(ES_DIR, esFile), esFrontmatter + body(topicEs, topicEn, i, 'es') + '\n');
    writeFileSync(join(EN_DIR, enFile), enFrontmatter + body(topicEs, topicEn, i, 'en') + '\n');
  }

  console.log(`Generated ${count} mock posts in src/content/posts and src/content/posts-en.`);
}

function clean() {
  for (const dir of [ES_DIR, EN_DIR]) {
    if (!existsSync(dir)) continue;
    const files = readdirSync(dir).filter((f) => f.startsWith('zz-mock-'));
    for (const f of files) unlinkSync(join(dir, f));
    console.log(`Removed ${files.length} mock files from ${dir}`);
  }
}

const arg = process.argv[2];

if (arg === '--clean') {
  clean();
} else {
  const count = Number.parseInt(arg, 10);
  if (!Number.isInteger(count) || count <= 0) {
    console.error('Usage: node scripts/mock-posts.mjs <count> | --clean');
    process.exit(1);
  }
  generate(count);
}
