import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://nanan.motekreatif.com',
  output: 'static',
  build: { inlineStylesheets: 'auto' },
  devToolbar: { enabled: false },
  // font tidak di-inline jadi data: URI, supaya lolos CSP font-src 'self'
  vite: { build: { assetsInlineLimit: 0 } },
});
