import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// Multi-page static site, deployed to https://nazeeh-pullat.github.io (user site => base '/').
export default defineConfig({
  base: '/',
  build: {
    target: 'es2020',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        works: resolve(__dirname, 'works.html'),
        project: resolve(__dirname, 'project.html'),
      },
    },
  },
});
