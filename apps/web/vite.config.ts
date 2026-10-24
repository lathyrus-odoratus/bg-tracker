import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// 和 .env.example 的 PORT 一致
const serverUrl = 'http://localhost:3180'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    port: 5180,
    strictPort: true,
    proxy: {
      '/api': serverUrl,
      '/auth': serverUrl,
    },
  },
  test: {
    environment: 'happy-dom',
  },
})
