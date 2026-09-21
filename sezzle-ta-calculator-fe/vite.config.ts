/// <reference types="vitest/config" />
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    port: 4080,
    strictPort: true,
  },
  preview: {
    port: 4080,
    strictPort: true,
  },
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      // Scoped to the pure logic layer (digit/number formatting, the BE API
      // client) that unit tests actually exercise — component/UI behavior
      // is verified by hand in a real browser instead (see Planning/epics.md
      // and the root README's Testing & coverage section).
      include: ['src/lib/**/*.ts'],
    },
  },
})
