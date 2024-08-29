import { defineConfig } from 'vite';
import { resolve } from 'path';

// 使用 Vite 插件复制静态文件
// const copyTargets = [
//   {
//     src: 'src/manifest.json',
//     dest: ''
//   },
//   {
//     src: 'src/assets',
//     dest: 'assets'
//   }
// ];

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    rollupOptions: {
      input: {
        utils: resolve(__dirname, 'src/ts/utils.ts'),
        query: resolve(__dirname, 'src/ts/query.ts'),
        import_template: resolve(__dirname, 'src/ts/import_template.ts'),
        hotkey: resolve(__dirname, 'src/ts/hotkey.ts'),
      },
      output: {
        entryFileNames: 'js/[name].js',
      },
    },
    minify: 'terser',
    terserOptions: {
      format: {
        comments: false,
      },
    },
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
    extensions: ['.ts', '.js'],
  },
  plugins: [],
});
