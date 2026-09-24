import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const PHONE = [400, 844];
const DESKTOP = [1280, 800];
const ICON = [256, 256];
const PROMO = [1280, 720];

const images = {
  bito: {
    icon: ICON,
    cover: PHONE,
    promo: PROMO,
    widget: PHONE,
    reminder: PHONE,
    review: PHONE,
    stats: PHONE,
    badges: PHONE,
    habi: ICON,
  },
  pokeutils: {
    icon: ICON,
    cover: DESKTOP,
    pokedex: DESKTOP,
    compare: DESKTOP,
    'egg-groups': DESKTOP,
    team: DESKTOP,
    pokemon: DESKTOP,
  },
  basecero: {
    icon: ICON,
    cover: DESKTOP,
    'cover-mobile': PHONE,
    home: PHONE,
    movements: PHONE,
    'net-worth': PHONE,
    categories: PHONE,
    period: PHONE,
    shared: PHONE,
  },
};

for (const [slug, files] of Object.entries(images)) {
  await mkdir(`src/assets/projects/${slug}`, { recursive: true });
  for (const [name, [width, height]] of Object.entries(files)) {
    const size = Math.round(Math.min(width, height) / 14);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="#1c2029"/><text x="50%" y="50%" fill="#8a93a3" font-family="monospace" font-size="${size}" text-anchor="middle">${slug}/${name}.jpg</text></svg>`;
    await sharp(Buffer.from(svg))
      .jpeg({ quality: 80 })
      .toFile(`src/assets/projects/${slug}/${name}.jpg`);
  }
}
