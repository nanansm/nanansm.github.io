import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://nanansm.github.io',
  output: 'static',
  build: { inlineStylesheets: 'auto' },
  devToolbar: { enabled: false },
});
