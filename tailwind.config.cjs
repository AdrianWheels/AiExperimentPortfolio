module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Colores Bento - Fondo oscuro profundo
        bgStart: '#0a0a0f',
        bgEnd: '#0d0d1a',
        
        // Superficies de cards
        card: {
          DEFAULT: '#12121a',
          elevated: '#1a1a24',
          hover: '#1f1f2a',
        },
        
        // Bordes sutiles
        border: '#1f1f2e',
        borderLight: '#2a2a3d',
        
        // Texto
        text: '#ffffff',
        muted: '#8b8b9e',
        subtle: '#5a5a6e',
        
        // Acentos - Naranja/Coral para CTAs
        accent: {
          DEFAULT: '#f97316',
          light: '#fb923c',
          dark: '#ea580c',
        },
        
        // Púrpura para elementos hero
        purple: {
          glow: '#8b5cf6',
          DEFAULT: '#7c3aed',
          dark: '#5b21b6',
        },
        'purple-glow': '#8b5cf6',
        
        // Estados
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',
      },
      
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'monospace'],
      },
      
      fontSize: {
        'xs': ['0.8125rem', { lineHeight: '1.5' }],
        'sm': ['0.875rem', { lineHeight: '1.5' }],
        'base': ['1rem', { lineHeight: '1.6' }],
        'lg': ['1.125rem', { lineHeight: '1.6' }],
        'xl': ['1.25rem', { lineHeight: '1.5' }],
        '2xl': ['1.5rem', { lineHeight: '1.4' }],
        '3xl': ['1.875rem', { lineHeight: '1.3' }],
        '4xl': ['2.25rem', { lineHeight: '1.2' }],
        '5xl': ['3rem', { lineHeight: '1.1' }],
      },
      
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      
      boxShadow: {
        'bento': '0 0 0 1px rgba(255,255,255,0.03), 0 4px 24px rgba(0,0,0,0.3)',
        'bento-hover': '0 0 0 1px rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.4)',
        'glow-purple': '0 0 60px rgba(139, 92, 246, 0.3)',
        'glow-orange': '0 0 30px rgba(249, 115, 22, 0.4)',
      },
      
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
      },
      
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 60px rgba(139, 92, 246, 0.3), 0 0 120px rgba(139, 92, 246, 0.1)' },
          '50%': { boxShadow: '0 0 80px rgba(139, 92, 246, 0.5), 0 0 160px rgba(139, 92, 246, 0.2)' },
        },
      },
    }
  },
  plugins: []
}
