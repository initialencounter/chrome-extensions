import { defineConfig } from 'wxt';
import yaml from '@maikolib/vite-plugin-yaml';
import { fileURLToPath } from 'node:url';

// See https://wxt.dev/api/config.html
export default defineConfig({
  vite: () => ({
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
        },
      },
    },
    plugins: [
      yaml(),
    ],
  }),
  modules: ['@wxt-dev/module-vue'],
  entrypointsDir: './entrypoints',
  manifest: {
    name: 'lims',
    version: '2.0.0',
    description: 'tools for own use',
    icons: {
      '48': 'icon/lims.png'
  },
    permissions: [
      'activeTab',
      'clipboardWrite',
      'scripting',
      'storage',
      'contextMenus'
    ],
    host_permissions: [
      '<all_urls>'
    ],
  },
});
