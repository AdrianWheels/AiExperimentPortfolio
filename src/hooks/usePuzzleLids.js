import { useState, useCallback } from 'react'

// Colección de mensajes ocultos divertidos
const HIDDEN_MESSAGES = {
  cipher: [
    "01001000 01101111 01101100 01100001 👋",
    "¿Sabías que los programadores\nno lloran? Solo hacen debug... 🥲",
    "// TODO: Hacer algo épico aquí\n// FIXME: Ya es épico",
    "Konami Code: ↑↑↓↓←→←→BA\n(No funciona aquí, pero es bonito)",
  ],
  frequency: [
    "La frecuencia del café es\n420.69 Hz ☕",
    "♪ Never gonna give you up ♪\n♪ Never gonna let you down ♪",
    "Sintonizando Radio Nostalgia...\n📻 *ruido de estática*",
    "Frequency: 133.7 MHz\nCall sign: W4NT3D-H4CK3R",
  ],
  cables: [
    "Cable rojo: Peligro\nCable azul: Más peligro\nCable verde: ¿Qué podría salir mal?",
    "⚠️ ADVERTENCIA ⚠️\nNo tocar cables con lengua\n(Es broma, no hay cables reales)",
    "Matrix loading...\n▓▓▓▓▓▓▓░░░ 70%\n*Pills not included*",
    "Red cable goes to... red thing?\nBlue cable goes to... confusion?\n🤷‍♂️",
  ],
  sound: [
    "🎵 Do-Re-Mi-Fa-Sol-La-Si 🎵\nSonidos del alma digital",
    "*Sonidos de dial-up*\nBEEP BOOP BEEP BOOOOP\n¿Nostalgia level 100?",
    "Patrón de sonido detectado:\n📢 QUACK QUACK QUACK 🦆",
    "Echo... echo... echo...\n¿Hay alguien ahí?\n*cricket sounds*",
  ]
}

// Mensajes por variante de tapa
const VARIANT_MESSAGES = {
  standard: "Sistema en mantenimiento...\nVuelve en 5 minutos ⏰",
  classified: "📋 DOCUMENTO CLASIFICADO 📋\nNivel de seguridad: GAMMA\nAcceso denegado",
  maintenance: "🔧 FUERA DE SERVICIO 🔧\nReparaciones en progreso\nDisculpe las molestias",
  experimental: "⚗️ PROTOTIPO ACTIVO ⚗️\nProceder con precaución\nResultados no garantizados"
}

export function useHiddenMessages() {
  const [unlockedPuzzles, setUnlockedPuzzles] = useState(new Set())

  const getRandomMessage = useCallback((puzzleType) => {
    const messages = HIDDEN_MESSAGES[puzzleType] || HIDDEN_MESSAGES.cipher
    return messages[Math.floor(Math.random() * messages.length)]
  }, [])

  const getVariantMessage = useCallback((variant) => {
    return VARIANT_MESSAGES[variant] || VARIANT_MESSAGES.standard
  }, [])

  const unlockPuzzle = useCallback((puzzleId) => {
    setUnlockedPuzzles(prev => new Set([...prev, puzzleId]))
  }, [])

  const isPuzzleUnlocked = useCallback((puzzleId) => {
    return unlockedPuzzles.has(puzzleId)
  }, [unlockedPuzzles])

  const resetAllLocks = useCallback(() => {
    setUnlockedPuzzles(new Set())
  }, [])

  return {
    getRandomMessage,
    getVariantMessage,
    unlockPuzzle,
    isPuzzleUnlocked,
    resetAllLocks,
    unlockedCount: unlockedPuzzles.size
  }
}

// Hook para gestionar el estado de los puzzles con sus dependencias
export function usePuzzleDependencies() {
  const dependencies = {
    sound: [], // Sin dependencias - siempre disponible
    cipher: [], // Sin dependencias - siempre disponible  
    frequency: ['sound'], // Requiere sound completado
    cables: ['sound', 'cipher'], // Requiere sound Y cipher completados
  }

  const checkDependencies = useCallback((puzzleType, gameState) => {
    const required = dependencies[puzzleType] || []
    
    return required.every(dep => {
      switch (dep) {
        case 'sound':
          return gameState.puzzleProgress?.sound?.solved
        case 'cipher':
          return gameState.puzzleProgress?.cipher?.solved
        case 'frequency':
          return gameState.puzzleProgress?.frequency?.solved
        default:
          return false
      }
    })
  }, [])

  const getPuzzleVariant = useCallback((puzzleType, gameState) => {
    const isUnlocked = checkDependencies(puzzleType, gameState)
    
    if (isUnlocked) return null // Sin tapa
    
    // Diferentes variantes según el tipo de puzzle
    switch (puzzleType) {
      case 'frequency':
        return 'experimental'
      case 'cables':
        return 'classified'
      default:
        return 'maintenance'
    }
  }, [checkDependencies])

  return {
    checkDependencies,
    getPuzzleVariant,
    dependencies
  }
}