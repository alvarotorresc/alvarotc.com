import { execFileSync } from 'node:child_process';
import { buildArgs, LANGS } from './lib/cv-args.mjs';

const isPrivate = process.argv.includes('--private');
const contact = isPrivate ? { phone: process.env.CV_PHONE, email: process.env.CV_EMAIL } : null;

for (const lang of LANGS) {
  const args = buildArgs(lang, contact);
  console.log(`rendercv ${lang}${isPrivate ? ' (private copy, cv/out/)' : ' (public/cv/)'}`);
  try {
    execFileSync('uvx', args, { stdio: 'inherit' });
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      console.error('uvx not found. Install uv: https://docs.astral.sh/uv/');
      process.exit(1);
    }
    throw error;
  }
}
