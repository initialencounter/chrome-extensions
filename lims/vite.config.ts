import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    rollupOptions: {
      input: {
        utils: resolve(__dirname, 'src/content-script/utils.ts'),
        query: resolve(__dirname, 'src/content-script/query.ts'),
        hotkey: resolve(__dirname, 'src/content-script/hotkey.ts'),
        pek2sek: resolve(__dirname, 'src/content-script/pek2sek.ts'),
        background: resolve(__dirname, 'src/background/index.ts'),
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
