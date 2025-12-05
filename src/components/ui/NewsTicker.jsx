import React, { useState, useEffect, useRef } from 'react'
import { useGame } from '../../context/GameContext'

const NewsTicker = () => {
  const { gameState } = useGame()
  const isPortfolio = gameState?.activeView === 'portfolio'
  const [currentIndex, setCurrentIndex] = useState(0)
  const [position, setPosition] = useState(100) // Empieza fuera por la derecha (100%)
  const containerRef = useRef(null)
  const animationRef = useRef(null)

  // Mensajes diferentes según la vista activa
  const gameMessages = [
    'ALERTA: Sistemas comprometidos',
    'KIRA analizando datos...',
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

  // Animación de scroll continuo
  useEffect(() => {
    const speed = 0.15 // Velocidad de scroll
    let lastTime = performance.now()
    
    const animate = (currentTime) => {
      const deltaTime = currentTime - lastTime
      lastTime = currentTime
      
      setPosition(prev => {
        const newPos = prev - (speed * deltaTime / 16) // Normalizar a 60fps
        
        // Cuando el texto sale completamente por la izquierda, reiniciar
        if (newPos < -80) {
          setTimeout(() => {
            setCurrentIndex(i => (i + 1) % messages.length)
          }, 0)
          return 100
        }
        return newPos
      })
      animationRef.current = requestAnimationFrame(animate)
    }
    
    animationRef.current = requestAnimationFrame(animate)
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [messages.length])

  // Reset cuando cambia la vista
  useEffect(() => {
    setCurrentIndex(0)
    setPosition(100)
  }, [isPortfolio])

  // Calcular estado de cada letra basado en su posición
  const getLetterStyle = (letterIndex, totalLetters) => {
    // Zona visible: 10% - 90% del contenedor
    const fadeZoneSize = 12 // porcentaje de cada lado para fade
    
    // Estimar posición de la letra (asumiendo texto uniforme)
    const letterSpacing = 60 / totalLetters // ~60% del ancho para el texto completo
    const letterPos = position + (letterIndex * letterSpacing / totalLetters * 30)
    
    // Zona derecha (entrando): > 88%
    if (letterPos > 88) {
      const fadeProgress = Math.min(1, (letterPos - 88) / fadeZoneSize)
      return {
        opacity: 1 - fadeProgress,
        filter: `blur(${fadeProgress * 4}px)`,
        transform: 'scale(1)'
      }
    }
    
    // Zona izquierda (saliendo/destrucción): < 12%
    if (letterPos < 12) {
      const destroyProgress = Math.min(1, (12 - letterPos) / fadeZoneSize)
      return {
        opacity: 1 - destroyProgress,
        filter: `blur(${destroyProgress * 6}px)`,
        transform: `translateY(${destroyProgress * 15 * (Math.random() > 0.5 ? 1 : -1)}px) scale(${1 - destroyProgress * 0.5})`,
        color: destroyProgress > 0.5 ? 'rgba(255,255,255,0.3)' : 'white'
      }
    }
    
    // Zona visible normal
    return {
      opacity: 1,
      filter: 'blur(0)',
      transform: 'scale(1)'
    }
  }

  return (
    <div 
      ref={containerRef}
      className="w-full h-16 overflow-hidden relative"
    >
      {/* Texto del ticker - scroll horizontal */}
      <div className="absolute inset-0 flex items-center overflow-visible">
        <span 
          key={currentIndex}
          className="text-4xl md:text-5xl font-bold text-white tracking-wide whitespace-nowrap flex absolute"
          style={{
            left: `${position}%`,
            fontFamily: "'Glitch Slap', sans-serif"
          }}
        >
          {currentMessage.split('').map((char, i) => {
            const style = getLetterStyle(i, currentMessage.length)
            
            return (
              <span
                key={i}
                className="inline-block transition-none"
                style={style}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            )
          })}
        </span>
      </div>
    </div>
  )
}

export default NewsTicker
