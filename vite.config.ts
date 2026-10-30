import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * `base` must match the URL path the site is served from.
 *  - GitHub Pages project site (https://<user>.github.io/<repo>/): '/<repo>/'
 *  - GitHub Pages user site (https://<user>.github.io/), Vercel, Netlify: '/'
 *
 * The GitHub Actions workflow sets BASE_PATH automatically, so you rarely need to edit this.
 * Locally (dev / preview) it defaults to '/'.
 */
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    target: 'es2020',
    // Never inline fonts as base64 into CSS; let the browser fetch only the subsets it needs.
    assetsInlineLimit: (file) => (/\.(woff2?|ttf)$/.test(file) ? false : undefined),
    // The three.js chunk is large but lazy-loaded after first paint (see components/Background.tsx).
    chunkSizeWarningLimit: 1100,
    rollupOptions: {
      output: {
        // three core has no dependencies, so isolating it can't pull React into the lazy chunk.
        manualChunks: (id) => (id.includes('node_modules/three/') ? 'three' : undefined),
      },
    },
  },
});
