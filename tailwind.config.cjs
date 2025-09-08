module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Colores principales del tema
        bgStart: '#0b0d12',
        bgEnd: '#0f172a',
        panel: '#0f172a',
        panel2: '#111827',
        border: '#1f2937',
        text: '#e5e7eb',
        muted: '#94a3b8',
        
        // Colores de estado
        success: '#22c55e',
        error: '#ef4444',
        warning: '#f59e0b',
        
        // Colores metálicos para componentes especiales
        gunmetal: {
          1: '#5a6469',
          2: '#2f3639',
          highlight: 'rgba(255,255,255,0.06)'
        }
      },
      
      fontFamily: {
        'futuristic': ['Baloo 2', 'Fredoka One', 'Poppins', 'system-ui', 'sans-serif']
      },
      
      animation: {
        'led-blink': 'ledBlink 0.14s ease-in-out',
        'avatar-pulse': 'avatarPulse 2s ease-in-out infinite'
      }
    }
  },
  plugins: []
}
