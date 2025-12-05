import React, { useState, useEffect, useRef } from 'react'
import { useGame } from '../../context/GameContext'

const NewsTicker = () => {
  const { gameState } = useGame()
  const isPortfolio = gameState?.activeView === 'portfolio'
  const [currentIndex, setCurrentIndex] = useState(0)
  const [phase, setPhase] = useState('entering') // 'entering', 'visible', 'exiting'
  const [exitingLetterIndex, setExitingLetterIndex] = useState(0)
  const containerRef = useRef(null)

  // Mensajes diferentes según la vista activa
  const gameMessages = [
    'ALERTA: Sistemas comprometidos',
    'ARIA analizando datos...',
    'Frecuencias calibrándose',
    'Transmisión interceptada',
    'Nivel de acceso: OPERADOR',
    'Sistemas reiniciándose'
  ]

  const portfolioMessages = [
    'Bienvenido a mi portfolio',
    'Full Stack Developer',
    'React & Three.js',
    '¿Tienes un proyecto?',
    'Explora mis proyectos'
  ]

  const messages = isPortfolio ? portfolioMessages : gameMessages
  const currentMessage = messages[currentIndex]

  useEffect(() => {
    if (phase === 'entering') {
      const timer = setTimeout(() => setPhase('visible'), 1000)
      return () => clearTimeout(timer)
    } else if (phase === 'visible') {
      const timer = setTimeout(() => {
        setPhase('exiting')
        setExitingLetterIndex(0)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [phase])

  // Efecto de salida letra por letra
  useEffect(() => {
    if (phase === 'exiting') {
      if (exitingLetterIndex < currentMessage.length) {
        const timer = setTimeout(() => {
          setExitingLetterIndex(prev => prev + 1)
        }, 30) // 30ms entre cada letra
        return () => clearTimeout(timer)
      } else {
        // Todas las letras han salido, pasar al siguiente mensaje
        const timer = setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % messages.length)
          setPhase('entering')
          setExitingLetterIndex(0)
        }, 200)
        return () => clearTimeout(timer)
      }
    }
  }, [phase, exitingLetterIndex, currentMessage.length, messages.length])

  // Reset cuando cambia la vista
  useEffect(() => {
    setCurrentIndex(0)
    setPhase('entering')
    setExitingLetterIndex(0)
  }, [isPortfolio])

  return (
    <div 
      ref={containerRef}
      className="w-full h-16 overflow-hidden relative"
    >
      {/* Máscara de gradiente para fade en los bordes */}
      <div className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: 'linear-gradient(to right, rgba(10,10,18,1) 0%, transparent 5%, transparent 95%, rgba(10,10,18,1) 100%)'
        }}
      />
      
      {/* Texto del ticker - letra por letra */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span 
          key={currentIndex}
          className="text-4xl md:text-5xl font-bold text-white tracking-wide whitespace-nowrap flex"
        >
          {currentMessage.split('').map((char, i) => {
            const isExiting = phase === 'exiting' && i < exitingLetterIndex
            const isEntering = phase === 'entering'
            
            return (
              <span
                key={i}
                className={`inline-block transition-all ${
                  isExiting ? 'animate-letter-exit' : 
                  isEntering ? 'animate-letter-enter' : ''
                }`}
                style={{
                  animationDelay: isEntering ? `${i * 30}ms` : '0ms',
                  opacity: isExiting ? 0 : 1
                }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            )
          })}
        </span>
      </div>

      {/* Estilos de animación */}
      <style>{`
        @keyframes letter-enter {
          0% { 
            opacity: 0;
            transform: translateX(20px) translateY(10px);
            filter: blur(4px);
          }
          100% { 
            opacity: 1;
            transform: translateX(0) translateY(0);
            filter: blur(0);
          }
        }
        
        @keyframes letter-exit {
          0% { 
            opacity: 1;
            transform: translateX(0) translateY(0) scale(1);
            filter: blur(0);
          }
          30% {
            transform: translateX(-5px) translateY(-5px) scale(1.1);
            filter: blur(1px);
          }
          60% {
            opacity: 0.5;
            transform: translateX(-15px) translateY(10px) scale(0.8);
            filter: blur(3px);
          }
          100% { 
            opacity: 0;
            transform: translateX(-30px) translateY(-20px) scale(0.3);
            filter: blur(8px);
          }
        }
        
        .animate-letter-enter {
          animation: letter-enter 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        
        .animate-letter-exit {
          animation: letter-exit 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
      `}</style>
    </div>
  )
}

export default NewsTicker
