import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = process.cwd();
const distDir = join(root, 'dist');
const vercelJsonPath = join(root, 'vercel.json');

const SKIPPED_SCRIPT_TYPES = new Set(['application/ld+json', 'importmap', 'speculationrules']);
const SCRIPT_TAG_RE = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
const STYLE_TAG_RE = /<style\b([^>]*)>([\s\S]*?)<\/style>/gi;
const HASH_TOKEN_RE = /'sha256-([A-Za-z0-9+/=]+)'/g;

/** @param {string} content */
export function hashBase64(content) {
  return createHash('sha256').update(content, 'utf8').digest('base64');
}

/** @param {string} base64 */
export function toCspHash(base64) {
  return `'sha256-${base64}'`;
}

/** @param {string} dir */
export function listHtmlFiles(dir) {
  /** @type {string[]} */
  const results = [];
  const walk = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.endsWith('.html')) results.push(full);
    }
  };
  walk(dir);
  return results.sort();
}

/**
 * Extracts every inline `<script>` (no `src`, not JSON-LD/importmap/speculation
 * rules) and `<style>` tag from an HTML document, hashing their exact content
 * the same way a browser does when matching a CSP hash-source.
 * @param {string} html
 * @param {string} file
 */
export function extractInlineAssets(html, file) {
  const scripts = [];
  for (const [, attrs, content] of html.matchAll(SCRIPT_TAG_RE)) {
    if (/\bsrc\s*=/i.test(attrs)) continue;
    const typeMatch = attrs.match(/\btype\s*=\s*"([^"]*)"/i);
    const type = typeMatch ? typeMatch[1].toLowerCase() : null;
    if (type && SKIPPED_SCRIPT_TYPES.has(type)) continue;
    scripts.push({ file, content, hash: hashBase64(content) });
  }
  const styles = [];
  for (const [, , content] of html.matchAll(STYLE_TAG_RE)) {
    styles.push({ file, content, hash: hashBase64(content) });
  }
  return { scripts, styles };
}

/** @param {string[]} values */
function uniqueInOrder(values) {
  const seen = new Set();
  const result = [];
  for (const value of values) {
    if (!seen.has(value)) {
      seen.add(value);
      result.push(value);
    }
  }
  return result;
}

/**
 * Walks `dist/**\/*.html` in path order and collects the sha256 hashes of
 * every inline script and style, deduplicated in first-seen order. That order
 * matches how the hashes already sit in `vercel.json`, so writing them back
 * out reproduces the file byte-for-byte when nothing changed.
 * @param {string} [dir]
 */
export function collectDistHashes(dir = distDir) {
  if (!existsSync(dir)) {
    throw new Error(`${dir} not found. Run \`npm run build\` first.`);
  }
  const scriptOccurrences = [];
  const styleOccurrences = [];
  for (const file of listHtmlFiles(dir)) {
    const rel = relative(dir, file);
    const html = readFileSync(file, 'utf8');
    const { scripts, styles } = extractInlineAssets(html, rel);
    scriptOccurrences.push(...scripts);
    styleOccurrences.push(...styles);
  }
  return {
    scriptOccurrences,
    styleOccurrences,
    scriptHashes: uniqueInOrder(scriptOccurrences.map((o) => o.hash)),
    styleHashes: uniqueInOrder(styleOccurrences.map((o) => o.hash)),
  };
}

/** @param {string} path */
export function readVercelConfig(path = vercelJsonPath) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

/** @param {ReturnType<typeof readVercelConfig>} config */
export function findCspHeader(config) {
  for (const block of config.headers ?? []) {
    for (const header of block.headers ?? []) {
      if (header.key === 'Content-Security-Policy') return header;
    }
  }
  throw new Error('No Content-Security-Policy header found in vercel.json');
}

/**
 * @param {string} cspValue
 * @param {string} name
 */
export function extractDirective(cspValue, name) {
  const match = cspValue.match(new RegExp(`(?:^|;)\\s*${name}\\s+([^;]*)`, 'i'));
  return match ? match[1].trim() : null;
}

/** @param {string | null} directiveValue */
export function extractHashesFromDirective(directiveValue) {
  if (!directiveValue) return [];
  return [...directiveValue.matchAll(HASH_TOKEN_RE)].map((m) => m[1]);
}

/** @param {string} cspValue */
export function getCspHashes(cspValue) {
  return {
    scriptHashes: extractHashesFromDirective(extractDirective(cspValue, 'script-src')),
    styleHashes: extractHashesFromDirective(extractDirective(cspValue, 'style-src')),
  };
}

/**
 * Rebuilds a directive's value, keeping every non-hash source expression in
 * place and appending the freshly computed hashes after them.
 * @param {string} directiveValue
 * @param {string[]} newHashesBase64
 */
export function replaceDirectiveHashes(directiveValue, newHashesBase64) {
  const nonHashTokens = directiveValue
    .split(/\s+/)
    .filter((token) => token.length > 0 && !/^'sha256-[A-Za-z0-9+/=]+'$/.test(token));
  return [...nonHashTokens, ...newHashesBase64.map(toCspHash)].join(' ');
}

/**
 * @param {string} cspValue
 * @param {{ scriptHashes: string[]; styleHashes: string[] }} hashes
 */
export function buildUpdatedCsp(cspValue, { scriptHashes, styleHashes }) {
  let updated = cspValue;
  for (const [name, hashes] of [
    ['script-src', scriptHashes],
    ['style-src', styleHashes],
  ]) {
    const match = updated.match(new RegExp(`(?:^|;)\\s*${name}\\s+([^;]*)`, 'i'));
    if (!match) continue;
    const oldDirectiveValue = match[1];
    const start = match.index + (match[0].length - oldDirectiveValue.length);
    const newDirectiveValue = replaceDirectiveHashes(oldDirectiveValue, hashes);
    updated =
      updated.slice(0, start) + newDirectiveValue + updated.slice(start + oldDirectiveValue.length);
  }
  return updated;
}

/**
 * Replaces only the Content-Security-Policy header's `value` string inside
 * `vercel.json`'s raw text, leaving formatting and every other key untouched.
 * @param {string} newCspValue
 * @param {string} path
 */
export function writeVercelJsonCsp(newCspValue, path = vercelJsonPath) {
  const raw = readFileSync(path, 'utf8');
  const match = raw.match(/("key":\s*"Content-Security-Policy",\s*"value":\s*")([^"]*)(")/);
  if (!match) throw new Error('Could not locate the Content-Security-Policy value in vercel.json');
  const updatedRaw =
    raw.slice(0, match.index) +
    match[1] +
    newCspValue +
    match[3] +
    raw.slice(match.index + match[0].length);
  const changed = updatedRaw !== raw;
  if (changed) writeFileSync(path, updatedRaw);
  return { changed, raw: updatedRaw };
}

/** @param {{ write?: boolean }} [options] */
export function regenerateCspHashes({ write = false } = {}) {
  const { scriptHashes, styleHashes } = collectDistHashes();
  const config = readVercelConfig();
  const header = findCspHeader(config);
  const newValue = buildUpdatedCsp(header.value, { scriptHashes, styleHashes });
  const result = {
    scriptHashes,
    styleHashes,
    currentValue: header.value,
    newValue,
    changed: false,
  };
  if (write) result.changed = writeVercelJsonCsp(newValue).changed;
  return result;
}

function main() {
  const write = process.argv.includes('--write');
  let result;
  try {
    result = regenerateCspHashes({ write });
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
    return;
  }
  console.log('script-src hashes:');
  for (const hash of result.scriptHashes) console.log(`  ${toCspHash(hash)}`);
  console.log('style-src hashes:');
  for (const hash of result.styleHashes) console.log(`  ${toCspHash(hash)}`);
  if (write) {
    console.log(result.changed ? '\nvercel.json updated.' : '\nvercel.json already up to date.');
  }
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) main();
