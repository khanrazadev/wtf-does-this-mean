
import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import { fileURLToPath } from 'node:url';
import manifest from './manifest.json';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [crx({ manifest })],

  build: {
    rollupOptions: {
      input: {
        popup: `${rootDir}src/popup/popup.html`,
      },
    },
  },
});
