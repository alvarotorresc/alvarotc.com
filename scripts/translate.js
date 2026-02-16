import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as deepl from 'deepl-node';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

const DEEPL_API_KEY = process.env.DEEPL_API_KEY;

if (!DEEPL_API_KEY) {
  console.error('❌ DEEPL_API_KEY not found in environment variables');
  console.log('Add it to .env file or export it:');
  console.log('export DEEPL_API_KEY=your_key_here');
  process.exit(1);
}

const translator = new deepl.Translator(DEEPL_API_KEY);

const postsDir = path.join(__dirname, '../src/content/posts');
const postsEnDir = path.join(__dirname, '../src/content/posts-en');

// Create posts-en directory if it doesn't exist
if (!fs.existsSync(postsEnDir)) {
  fs.mkdirSync(postsEnDir, { recursive: true });
}

async function translatePost(filename) {
  const filePath = path.join(postsDir, filename);
  const content = fs.readFileSync(filePath, 'utf-8');

  // Extract frontmatter and body
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    console.log(`⚠️  Skipping ${filename} - no frontmatter found`);
    return;
  }

  const [, frontmatter, body] = match;

  // Parse frontmatter
  const lines = frontmatter.split('\n');
  let title = '';
  let description = '';
  let otherFrontmatter = [];

  // Strip surrounding quotes from YAML values
  const stripQuotes = (s) => s.replace(/^(['"])(.*)\1$/, '$2');

  for (const line of lines) {
    if (line.startsWith('title:')) {
      title = stripQuotes(line.replace('title:', '').trim());
    } else if (line.startsWith('description:')) {
      description = stripQuotes(line.replace('description:', '').trim());
    } else {
      otherFrontmatter.push(line);
    }
  }

  console.log(`📝 Translating: ${filename}`);

  // Translate title, description, and body from Spanish to English
  const [titleEn, descriptionEn, bodyEn] = await Promise.all([
    translator.translateText(title, 'es', 'en-US'),
    translator.translateText(description, 'es', 'en-US'),
    translator.translateText(body.trim(), 'es', 'en-US'),
  ]);

  // Build translated frontmatter
  const translatedFrontmatter = [
    `title: ${titleEn.text}`,
    `description: ${descriptionEn.text}`,
    ...otherFrontmatter,
  ].join('\n');

  // Build translated content — use double quotes for description to avoid YAML issues with apostrophes
  const safeDescription = descriptionEn.text.replace(/"/g, '\\"');
  const translatedFrontmatterSafe = [
    `title: ${titleEn.text}`,
    `description: "${safeDescription}"`,
    ...otherFrontmatter.filter((l) => !l.startsWith('description:')),
  ].join('\n');

  const translatedContent = `---\n${translatedFrontmatterSafe}\n---\n\n${bodyEn.text}\n`;

  // Generate English slug from translated title
  const enSlug = titleEn.text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  const enFilename = `${enSlug}.md`;

  const outputPath = path.join(postsEnDir, enFilename);
  fs.writeFileSync(outputPath, translatedContent, 'utf-8');

  console.log(`✅ Translated → ${enFilename}`);
}

async function main() {
  console.log('🌍 Starting translation process...\n');

  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith('.md'));

  for (const file of files) {
    try {
      await translatePost(file);
    } catch (error) {
      console.error(`❌ Error translating ${file}:`, error.message);
    }
  }

  console.log('\n✨ Translation complete!');
  console.log(`Translated ${files.length} posts from Spanish to English`);
}

main();
