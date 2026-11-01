
import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import { resolve } from 'node:path';
import manifest from './manifest.json';

export default defineConfig({
  plugins: [crx({ manifest })],

  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/popup.html'),
      },
    },
  },
});
