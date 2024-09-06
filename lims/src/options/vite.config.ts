import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import yaml from '@maikolib/vite-plugin-yaml'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    yaml(),
    vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
