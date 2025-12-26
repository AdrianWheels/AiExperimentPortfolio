import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => ({
  // Con dominio personalizado (adrianrueda.dev), siempre usar la raíz
  base: '/',
  // Build a /docs para GitHub Pages
  build: {
    outDir: 'docs',
  },
}))
