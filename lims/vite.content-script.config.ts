import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src',
  build: {
    emptyOutDir: false,
    outDir: '../dist',
    rollupOptions: {
      input: {
        utils: resolve(__dirname, 'src/content-script/utils.ts'),
        query: resolve(__dirname, 'src/content-script/query.ts'),
        hotkey: resolve(__dirname, 'src/content-script/hotkey.ts'),
        entrust: resolve(__dirname, 'src/content-script/entrust.ts'),
        entrustMain: resolve(__dirname, 'src/content-script/entrustMain.ts'),
        verify: resolve(__dirname, 'src/content-script/verify.ts'),
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
  plugins: [
  ],
});
