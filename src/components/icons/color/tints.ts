export const colorIconNames = [
  'tux',
  'lock',
  'cat',
  'megaphone',
  'construction',
  'guitar',
  'chess',
  'boxing',
  'leaf',
  'gradcap',
  'rocket',
  'chat',
  'server',
  'dice',
] as const;

export type ColorIconName = (typeof colorIconNames)[number];

/**
 * The icon's key color from the mockup, used to derive the 10% tint behind
 * it: `color-mix(in srgb, <tint> 10%, var(--bg))`. This reproduces the exact
 * fixed hexes from the mockup in dark mode and the equivalent in light mode.
 */
export const colorIconTint: Record<ColorIconName, string> = {
  tux: '#f2b64e',
  lock: '#4f8ef7',
  cat: '#f08a4b',
  megaphone: '#a78bfa',
  construction: '#f2b64e',
  guitar: '#f08a4b',
  chess: '#a78bfa',
  boxing: '#e5645a',
  leaf: '#5fd08a',
  gradcap: '#4f8ef7',
  rocket: '#f08a4b',
  chat: '#a78bfa',
  server: '#5fd08a',
  dice: '#e5645a',
};
