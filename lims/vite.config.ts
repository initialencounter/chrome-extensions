import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    rollupOptions: {
      input: {
        utils: resolve(__dirname, 'src/ts/utils.ts'),
        query: resolve(__dirname, 'src/ts/query.ts'),
        hotkey: resolve(__dirname, 'src/ts/hotkey.ts'),
        pek2sek: resolve(__dirname, 'src/ts/pek2sek.ts'),
        background: resolve(__dirname, 'src/ts/background.ts'),
      },
      output: {
        entryFileNames: 'js/[name].js',
      },
    },
    minify: false,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
    extensions: ['.ts', '.js'],
  },
  plugins: [],
});
