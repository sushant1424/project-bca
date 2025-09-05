import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build',
    rollupOptions: {
      output: {
        entryFileNames: `assets/app-${Date.now()}-[hash].js`,
        chunkFileNames: `assets/chunk-${Date.now()}-[hash].js`,
        assetFileNames: `assets/asset-${Date.now()}-[hash].[ext]`
      }
    }
  },
  server: {
    port: 5174,
    host: true
  },
  preview: {
    port: 4173,
    host: true
  }
})
