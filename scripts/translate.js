import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as deepl from 'deepl-node';
import dotenv from 'dotenv';
import { findEnglishPair, planTranslations } from './lib/translation-pairs.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env'), quiet: true });

const postsDir = path.join(__dirname, '../src/content/posts');
const postsEnDir = path.join(__dirname, '../src/content/posts-en');

const stripQuotes = (s) => s.replace(/^(['"])(.*)\1$/, '$2');

const slugify = (text) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

async function translatePost(translator, filename, { force }) {
  const content = fs.readFileSync(path.join(postsDir, filename), 'utf-8');
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (!match) {
    console.error(`skip: ${filename} has no frontmatter`);
    return;
  }

  const [, frontmatter, body] = match;
  let title = '';
  let description = '';
  const otherFrontmatter = [];

  for (const line of frontmatter.split('\n')) {
    if (line.startsWith('title:')) title = stripQuotes(line.replace('title:', '').trim());
    else if (line.startsWith('description:'))
      description = stripQuotes(line.replace('description:', '').trim());
    else if (!line.startsWith('source:')) otherFrontmatter.push(line);
  }

  console.log(`Translating: ${filename}`);

  const [titleEn, descriptionEn, bodyEn] = await Promise.all([
    translator.translateText(title, 'es', 'en-US'),
    translator.translateText(description, 'es', 'en-US'),
    translator.translateText(body.trim(), 'es', 'en-US'),
  ]);

  // Title and description go double-quoted: an unquoted "Foo: bar" is invalid YAML.
  const translatedFrontmatter = [
    `title: ${JSON.stringify(titleEn.text)}`,
    `description: ${JSON.stringify(descriptionEn.text)}`,
    ...otherFrontmatter,
    `source: ${filename.replace(/\.md$/, '')}`,
  ].join('\n');

  const enFilename =
    (force && findEnglishPair(filename, postsEnDir)) || `${slugify(titleEn.text)}.md`;
  const outputPath = path.join(postsEnDir, enFilename);

  if (!force && fs.existsSync(outputPath)) {
    throw new Error(`${enFilename} already exists; use --force to overwrite it`);
  }

  fs.writeFileSync(outputPath, `---\n${translatedFrontmatter}\n---\n\n${bodyEn.text}\n`, 'utf-8');
  console.log(`Translated → ${enFilename}`);
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');

  // Without file arguments, every Spanish post is considered (manual use).
  const requested = args.filter((a) => a !== '--force').map((f) => path.basename(f));
  const files =
    requested.length > 0
      ? requested.filter((f) => {
          if (!f.endsWith('.md') || !fs.existsSync(path.join(postsDir, f))) {
            console.error(`skip: ${f} is not a post in ${postsDir}`);
            return false;
          }
          return true;
        })
      : fs.readdirSync(postsDir).filter((f) => f.endsWith('.md'));

  const { toTranslate, skipped } = planTranslations(files, postsEnDir, { force });
  for (const { file, pair } of skipped) {
    console.error(`skip: ${file} ya tiene traducción en ${pair}`);
  }

  if (toTranslate.length === 0) return;

  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) {
    console.error(
      `DEEPL_API_KEY not found: cannot translate ${toTranslate.join(', ')}.\n` +
        'Add it to .env or export DEEPL_API_KEY=your_key_here.',
    );
    process.exit(1);
  }

  fs.mkdirSync(postsEnDir, { recursive: true });
  const translator = new deepl.Translator(apiKey);

  for (const file of toTranslate) {
    try {
      await translatePost(translator, file, { force });
    } catch (error) {
      console.error(`Error translating ${file}: ${error.message}`);
      process.exitCode = 1;
    }
  }
}

main();
