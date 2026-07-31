import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: './',
  build: { outDir: 'dist' },
  server: { port: 3015, host: '0.0.0.0', strictPort: true },
})
