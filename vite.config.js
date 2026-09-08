import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => ({
  // Con dominio personalizado (adrianrueda.dev), siempre usar la raíz
  base: '/',
  // Build a /docs para GitHub Pages
  build: {
    outDir: 'docs',
  },
  // Strip console.log/warn/info/debug en production (mantiene console.error)
  esbuild: {
    pure: mode === 'production' ? ['console.log', 'console.info', 'console.debug', 'console.warn'] : [],
  },
}))
