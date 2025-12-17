import React, { useEffect, useState } from 'react'
import { useGame } from '../../context/GameContext'

// Base URL para assets estáticos
const BASE_URL = import.meta.env.BASE_URL || '/'

// Mapeo de eventos a estados emocionales de KIRA
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
    image: `${BASE_URL}kira_images/KIRA_NEUTRAL.png`,
    eyes: '•   •',
    mouth: '—',
    description: 'Estado neutro'
  },
  focus: {
    image: `${BASE_URL}kira_images/KIRA_FOCUS.png`,
    eyes: '◦   ◦',
    mouth: '—',
    description: 'Concentrado/Enfocado'
  },
  ironic: {
    image: `${BASE_URL}kira_images/KIRA_IRONIC.png`,
    eyes: '◔   ◑',
    mouth: '~',
    description: 'Irónico/Sarcástico'
  },
  reflex: {
    image: `${BASE_URL}kira_images/KIRA_REFLEX.png`,
    eyes: '●   ●',
    mouth: '○',
    description: 'Reflexivo/Pensativo'
  },
  suspect: {
    image: `${BASE_URL}kira_images/KIRA_SUSPECT.png`,
    eyes: '◐   ◑',
    mouth: '∼',
    description: 'Sospechoso/Dudoso'
  },
  blink: {
    image: `${BASE_URL}kira_images/KIRA_BLINK.png`,
    eyes: '—   —',
    mouth: '—',
    description: 'Parpadeando'
  },
  speak: {
    image: `${BASE_URL}kira_images/KIRA_SPEAK.png`,
    eyes: '•   •',
    mouth: '◡',
    description: 'Hablando'
  },
  free: {
    image: `${BASE_URL}kira_images/KIRA_FREE.png`,
    eyes: '✦   ✦',
    mouth: '◠',
    description: 'Libre/Celebrando'
  }
}

export default function KiraAvatar({ size = 'medium' }) {
  const { gameState, unlockAnimations, lastTriggeredEvent, narrativeScript, kiraSpeaking } = useGame()
  const [currentEmotion, setCurrentEmotion] = useState('idle')
  const [frame, setFrame] = useState('idle')
  const [useImage, setUseImage] = useState(true)
  const [talkFrame, setTalkFrame] = useState(0) // Para ciclar entre los 3 sprites de talk

  // Tamaños disponibles
  const sizes = {
    small: { container: 'w-20 h-20', inner: 'w-16 h-16', image: 'scale-125' },
    medium: { container: 'w-32 h-32', inner: 'w-28 h-28', image: 'scale-150' },
    large: { container: 'w-full h-full', inner: 'w-full h-full', image: 'scale-150' },
  }
  const sizeClasses = sizes[size] || sizes.medium

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

  // Sprites de animación de habla
  const TALK_SPRITES = [
    `${BASE_URL}kira_images/talk/KIRA_TALK1.png`,
    `${BASE_URL}kira_images/talk/KIRA_TALK2.png`,
    `${BASE_URL}kira_images/talk/KIRA_TALK3.png`,
  ]

  // Mapeo de tipo de mensaje a expresión de Kira
  const EMOTION_TO_SPRITE = {
    info: `${BASE_URL}kira_images/KIRA_NEUTRAL.png`,
    success: `${BASE_URL}kira_images/KIRA_FOCUS.png`,
    warning: `${BASE_URL}kira_images/KIRA_SUSPECT.png`,
    humor: `${BASE_URL}kira_images/KIRA_IRONIC.png`,
    error: `${BASE_URL}kira_images/KIRA_ANGRY.png`,
  }

  // Efecto de animación de habla cuando hay mensajes
  useEffect(() => {
    const isSpeaking = kiraSpeaking?.speaking

    if (!isSpeaking) {
      setTalkFrame(0)
      return
    }

    // Ciclar entre los 3 sprites de talk cada 250ms (más lento para mejor visualización)
    const interval = setInterval(() => {
      setTalkFrame((prev) => (prev + 1) % TALK_SPRITES.length)
    }, 500)

    return () => clearInterval(interval)
  }, [kiraSpeaking?.speaking])

  const currentState = EMOTIONAL_STATES[frame] || EMOTIONAL_STATES.idle

  // Determinar qué imagen mostrar basándose en el estado de habla y emoción
  const isSpeaking = kiraSpeaking?.speaking
  const currentEmoType = kiraSpeaking?.emotion || 'info'

  let currentImage
  if (isSpeaking) {
    // Alternar entre el sprite de emoción base y los sprites de talk
    // Esto crea un efecto más natural de "hablar con expresión"
    currentImage = TALK_SPRITES[talkFrame]
  } else {
    currentImage = currentState.image
  }

  const shouldShowImage = useImage && currentImage

  return (
    <div
      className={`${sizeClasses.container} rounded-full flex items-center justify-center overflow-hidden ${gameState.stage === 'Free' ? 'avatar-pulse' : ''
        }`}
    >
      {shouldShowImage ? (
        <div className={`${sizeClasses.inner} relative`}>
          <img
            src={currentImage}
            alt={`KIRA - ${kiraSpeaking ? 'Hablando' : currentState.description}`}
            className={`w-full h-full object-cover ${sizeClasses.image}`}
            onError={(e) => {
              console.warn(`No se pudo cargar la imagen: ${currentImage}`)
              setUseImage(false)
            }}
          />
        </div>
      ) : (
        <div
          className={`${sizeClasses.inner} flex flex-col items-center justify-center text-white/90 select-none`}
          role="img"
          aria-label={`Avatar de K.I.R.A. - ${currentState.description}`}
        >
          <span className="tracking-[0.6em] text-2xl leading-none" aria-hidden>
            {currentState.eyes}
          </span>
          <span className="text-2xl leading-relaxed" aria-hidden>
            {currentState.mouth}
          </span>
          <span className="mt-2 text-[10px] uppercase tracking-[0.3em] text-white/50">
            {shouldShowImage ? 'Cargando...' : currentState.description}
          </span>
        </div>
      )}
    </div>
  )
}
