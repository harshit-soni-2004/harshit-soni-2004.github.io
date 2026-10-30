/**
 * Deployment-related settings. The public URL is read from VITE_SITE_URL (see .env) so that
 * Open Graph tags in index.html and the app agree.
 */
export const siteUrl: string = (import.meta.env.VITE_SITE_URL as string | undefined) ?? '';

/** Resolve a /public asset path against Vite's `base` (needed for GitHub Pages sub-paths). */
export function asset(path: string): string {
  if (/^(https?:|mailto:|data:)/.test(path)) return path;
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}
