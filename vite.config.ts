import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import svgLoader from 'vite-svg-loader'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/FE_NTI/' : '/',
  plugins: [
    vue(),
    vueDevTools(),
    svgLoader(),
  ],
  resolve: {
    alias: {
      // Это стандартный способ прописать путь к папке src в Vite + TS
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      usePolling: true,
    },
  },
}))