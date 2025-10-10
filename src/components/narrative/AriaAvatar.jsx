import React, { useEffect, useState } from 'react'
import { useGame } from '../../context/GameContext'

// Mapeo de eventos a estados emocionales de ARIA
const EVENT_TO_EMOTION = {
  // Completar puzzles - Concentración
  'sound_puzzle_completed': 'focus',
  'cipher_puzzle_completed': 'focus', 
  
  // Desbloquear sistemas - Reflexión/pensamiento
  'lock_security_unlocked': 'reflex',
  'lock_frequency_unlocked': 'reflex',
  'lock_wiring_unlocked': 'reflex',
  
  // Errores y advertencias - Sospecha/duda
  'security_requires_cipher': 'suspect',
  'frequency_requires_sound': 'suspect',
  'puzzle_error': 'suspect',
  'unknown_command': 'suspect',
  
  // Solicitud de pistas - Ironía/sarcasmo
  'hint_request': 'ironic',
  'too_many_hints': 'ironic',
  
  // Estados especiales
  'game_start': 'reflex',
  'game_complete': 'focus',
  'portfolio_unlocked': 'focus'
}

// Estados emocionales disponibles
const EMOTIONAL_STATES = {
  idle: { 
    image: '/aria_images/ARIA_NEUTRAL.png', 
    eyes: '•   •', 
    mouth: '—',
    description: 'Estado neutro'
  },
  focus: { 
    image: '/aria_images/ARIA_FOCUS.png', 
    eyes: '◦   ◦', 
    mouth: '—',
    description: 'Concentrado/Enfocado'
  },
  ironic: { 
    image: '/aria_images/ARIA_IRONIC.png', 
    eyes: '◔   ◑', 
    mouth: '~',
    description: 'Irónico/Sarcástico'
  },
  reflex: { 
    image: '/aria_images/ARIA_REFLEX.png', 
    eyes: '●   ●', 
    mouth: '○',
    description: 'Reflexivo/Pensativo'
  },
  suspect: { 
    image: '/aria_images/ARIA_SUSPECT.png', 
    eyes: '◐   ◑', 
    mouth: '∼',
    description: 'Sospechoso/Dudoso'
  },
  blink: { 
    image:'/aria_images/ARIA_BLINK.png', 
    eyes: '—   —', 
    mouth: '—',
    description: 'Parpadeando'
  },
  speak: { 
    image: '/aria_images/ARIA_SPEAK.png', 
    eyes: '•   •', 
    mouth: '◡',
    description: 'Hablando'
  },
  free: { 
    image: '/aria_images/ARIA_FREE.png', 
    eyes: '✦   ✦', 
    mouth: '◠',
    description: 'Libre/Celebrando'
  }
}

export default function AriaAvatar() {
  const { gameState, unlockAnimations, lastTriggeredEvent, narrativeScript } = useGame()
  const [currentEmotion, setCurrentEmotion] = useState('idle')
  const [frame, setFrame] = useState('idle')
  const [useImage, setUseImage] = useState(true)

  // Detectar cambios de eventos y actualizar emoción
  useEffect(() => {
    if (lastTriggeredEvent) {
      // Primero verificar si el evento tiene una cara definida en el script
      const eventConfig = narrativeScript?.events?.[lastTriggeredEvent]
      let emotion = null
      
      if (eventConfig?.face && EMOTIONAL_STATES[eventConfig.face]) {
        emotion = eventConfig.face
      } else if (EVENT_TO_EMOTION[lastTriggeredEvent]) {
        emotion = EVENT_TO_EMOTION[lastTriggeredEvent]
      }
      
      if (emotion) {
        setCurrentEmotion(emotion)
        setUseImage(true)
        
        // Volver al estado base después de 3 segundos
        const timeout = setTimeout(() => {
          const baseEmotion = gameState.stage === 'Free' ? 'free' : 'idle'
          setCurrentEmotion(baseEmotion)
          setUseImage(true) // Siempre usar imagen, tanto para Free como para idle
        }, 3000)
        
        return () => clearTimeout(timeout)
      }
    }
  }, [lastTriggeredEvent, gameState.stage, narrativeScript])

  // Manejo de animaciones normales (parpadeo, habla, etc.)
  useEffect(() => {
    let cancelled = false
    const baseFrame = gameState.stage === 'Free' ? 'free' : currentEmotion
    setFrame(baseFrame)

    const tick = () => {
      if (cancelled) return
      setFrame((current) => {
        if (gameState.stage === 'Free') {
          return current === 'free' ? 'blink' : 'free'
        }
        
        // Si estamos mostrando una emoción específica, mantenerla
        if (useImage && EMOTIONAL_STATES[currentEmotion]?.image) {
          return currentEmotion
        }
        
        if (current === 'blink') return currentEmotion
        if (current === 'speak') return currentEmotion
        return Math.random() > 0.7 ? 'blink' : Math.random() > 0.6 ? 'speak' : currentEmotion
      })
    }

    const interval = setInterval(tick, 2600)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [gameState.stage, currentEmotion, useImage])

  // Efecto de habla cuando hay animaciones de pulso
  useEffect(() => {
    if (!unlockAnimations?.pulse) return
    setFrame('speak')
  }, [unlockAnimations?.pulse])

  const currentState = EMOTIONAL_STATES[frame] || EMOTIONAL_STATES.idle
  const shouldShowImage = useImage && currentState.image

  return (
    <div
      className={`w-40 h-40 avatar-metal bg-zinc-900 rounded-full flex items-center justify-center border-2 overflow-hidden ${
        gameState.stage === 'Free' ? 'avatar-pulse glow-success' : ''
      }`}
      style={{ borderColor: 'var(--visor-metal)' }}
    >
      {shouldShowImage ? (
        <div className="w-32 h-32 relative">
          <img 
            src={currentState.image} 
            alt={`ARIA - ${currentState.description}`}
            className="w-full h-full object-cover scale-150"
            onError={(e) => {
              console.warn(`No se pudo cargar la imagen: ${currentState.image}`)
              setUseImage(false)
            }}
          />
        </div>
      ) : (
        <div
          className="w-32 h-32 flex flex-col items-center justify-center text-slate-200 select-none"
          role="img"
          aria-label={`Avatar de A.R.I.A. - ${currentState.description}`}
        >
          <span className="tracking-[0.6em] text-2xl leading-none" aria-hidden>
            {currentState.eyes}
          </span>
          <span className="text-2xl leading-relaxed" aria-hidden>
            {currentState.mouth}
          </span>
          <span className="mt-2 text-[10px] uppercase tracking-[0.3em] text-slate-400">
            {shouldShowImage ? 'Cargando...' : currentState.description}
          </span>
        </div>
      )}
    </div>
  )
}
