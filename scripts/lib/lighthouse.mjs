/**
 * @typedef {{
 *   url: string;
 *   isRepresentativeRun: boolean;
 *   summary: { performance: number; accessibility: number };
 * }} ManifestEntry
 */

/**
 * @param {ManifestEntry[]} manifest
 * @param {string} pathname
 * @returns {number | null}
 */
export function representativeScore(manifest, pathname) {
  const entry = manifest.find(
    (run) => run.isRepresentativeRun && new URL(run.url).pathname === pathname,
  );
  if (!entry || typeof entry.summary.performance !== 'number') return null;
  return Math.round(entry.summary.performance * 100);
}

/**
 * @param {ManifestEntry[]} mobile
 * @param {ManifestEntry[]} desktop
 * @returns {{ performanceMobile: number; performanceDesktop: number } | null}
 */
export function lighthouseScores(mobile, desktop) {
  const performanceMobile = representativeScore(mobile, '/');
  const performanceDesktop = representativeScore(desktop, '/');
  if (performanceMobile === null || performanceDesktop === null) return null;
  return { performanceMobile, performanceDesktop };
}
