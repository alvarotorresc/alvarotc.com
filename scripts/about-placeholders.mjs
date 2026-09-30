import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const names = [
  'desk-2026',
  'ies-2018',
  'z1-2020',
  'therapyside-2022',
  'soltel-2025',
  'linux',
  'cats',
  'guitar',
  'chess',
  'boxing',
];

await mkdir('src/assets/about', { recursive: true });

for (const name of names) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000"><rect width="100%" height="100%" fill="#1c2029"/><text x="50%" y="50%" fill="#6b7382" font-family="monospace" font-size="40" text-anchor="middle">${name}.jpg</text></svg>`;
  await sharp(Buffer.from(svg)).jpeg({ quality: 80 }).toFile(`src/assets/about/${name}.jpg`);
}
