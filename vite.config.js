import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => ({
  // En producción (build), usar el path de GitHub Pages
  // En desarrollo (dev), usar la raíz para evitar problemas de rutas
  base: mode === 'production' ? '/AiExperimentPortfolio/' : '/',
}))
