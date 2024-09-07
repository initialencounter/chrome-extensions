import { defineConfig } from 'vite';
import { resolve } from 'path';
import vue from '@vitejs/plugin-vue';
import yaml from '@maikolib/vite-plugin-yaml'

export default defineConfig({
  root: 'src',
  build: {
    emptyOutDir: false,
    outDir: '../dist',
    rollupOptions: {
      input: {
        options: resolve(__dirname, 'src/options/index.html'),
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
      // https://github.com/intlify/bundle-tools/issues/23
      'vue-i18n': 'vue-i18n/dist/vue-i18n.runtime.esm-bundler.js',
    },
    extensions: ['.ts', '.js'],
  },
  plugins: [
    yaml(),
    vue(),
  ],
});
