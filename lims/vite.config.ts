import { defineConfig } from 'vite';
import { resolve } from 'path';
import vue from '@vitejs/plugin-vue';
import yaml from '@maikolib/vite-plugin-yaml'

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    rollupOptions: {
      input: {
        utils: resolve(__dirname, 'src/content-script/utils.ts'),
        query: resolve(__dirname, 'src/content-script/query.ts'),
        hotkey: resolve(__dirname, 'src/content-script/hotkey.ts'),
        entrust: resolve(__dirname, 'src/content-script/entrust.ts'),
        background: resolve(__dirname, 'src/background/index.ts'),
        options: resolve(__dirname, 'src/options/index.html'),
        popup: resolve(__dirname, 'src/popup/index.html'),
        entrustMain: resolve(__dirname, 'src/content-script/entrustMain.ts'),
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
    yaml(),
    vue(),
  ],
});
