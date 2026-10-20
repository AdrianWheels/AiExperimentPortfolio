/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  theme: {
    extend: {
      // Marca AW: negro, blanco y grises; único acento, el verde de «Disponible».
      colors: {
        bg: '#050506',
        ink: '#f2f2f3',
        dim: '#85868e',
        faint: '#55565e',
        line: 'rgba(255,255,255,0.07)',
        line2: 'rgba(255,255,255,0.14)',
        live: '#3ddc84',
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'Cascadia Code', 'monospace'],
      },
      maxWidth: {
        page: '1180px',
        read: '680px',
      },
    },
  },
  plugins: [],
}
