import React, { useEffect, useState } from 'react'
import { useGame } from '../../context/GameContext'
import SecurityOverlay from './SecurityOverlay'
import CompletionOverlay from './CompletionOverlay'

/**
 * ProtectedPuzzle - Sistema de tapas automático
 * Las tapas se quitan SOLO cuando se resuelven los puzzles necesarios
 * NO hay interacción manual para abrir tapas
 */
export default function ProtectedPuzzle({ 
  puzzleType, 
  variant = 'matrix', 
  className = '',
  customMessage,
  children 
}) {
  const { gameState, triggerEvent } = useGame()
  const [isUnlocking, setIsUnlocking] = useState(false)
  // Usar useRef para trackear el estado anterior de isUnlocked
  const prevUnlockedRef = React.useRef(null)

  // Check if puzzle is solved
  const isSolved = React.useMemo(() => {
    return gameState?.puzzleProgress?.[puzzleType]?.solved === true
  }, [puzzleType, gameState?.puzzleProgress])

  // Lógica de dependencias según el diseño original corregido
  const isUnlocked = React.useMemo(() => {
    const progress = gameState?.puzzleProgress || {}
    const locks = gameState?.locks || {}
    
    console.log(`🔍 [${puzzleType}] Evaluating dependencies:`, {
      progress,
      locks,
      puzzleType
    })
    
    switch (puzzleType) {
      case 'sound':
        // Sound siempre está disponible (puzzle inicial)
        console.log(`✅ [${puzzleType}] Always unlocked (initial puzzle)`)
        return true
        
      case 'frequency':
        // Frequency se desbloquea cuando sound está resuelto
        const frequencyUnlocked = progress.sound?.solved === true
        console.log(`🔍 [${puzzleType}] Unlocked: ${frequencyUnlocked} (sound.solved: ${progress.sound?.solved})`)
        return frequencyUnlocked
        
      case 'cipher': 
        // Cipher se desbloquea cuando frequency está desbloqueado
        const cipherUnlocked = locks.frequency === true
        console.log(`🔍 [${puzzleType}] Unlocked: ${cipherUnlocked} (locks.frequency: ${locks.frequency})`)
        return cipherUnlocked
        
      case 'cables':
      case 'wiring':
        // Cables se desbloquea cuando cipher está resuelto
        const cablesUnlocked = progress.cipher?.solved === true
        console.log(`🔍 [${puzzleType}] Unlocked: ${cablesUnlocked} (cipher.solved: ${progress.cipher?.solved})`)
        return cablesUnlocked
        
      default:
        console.log(`❌ [${puzzleType}] Unknown puzzle type`)
        return false
    }
  }, [puzzleType, gameState?.puzzleProgress, gameState?.locks])

  // Efecto para animación de desbloqueo automático
  useEffect(() => {
    console.log(`🎮 [${puzzleType}] Estado cambió:`, {
      isUnlocked,
      prevUnlocked: prevUnlockedRef.current,
      isUnlocking,
      gameState: {
        progress: gameState?.puzzleProgress,
        locks: gameState?.locks
      }
    })
    
    // Solo animar si cambió de bloqueado a desbloqueado (no en el mount inicial)
    const wasLockedBefore = prevUnlockedRef.current === false
    const justUnlocked = isUnlocked && wasLockedBefore && !isUnlocking
    
    if (justUnlocked) {
      console.log(`🎮 [${puzzleType}] 🚀 Iniciando secuencia de desbloqueo automático...`)
      setIsUnlocking(true)
      // Delay para que se vea la animación de apertura
      setTimeout(() => {
        console.log(`🎮 [${puzzleType}] ✅ Desbloqueo completado!`)
        setIsUnlocking(false)
        triggerEvent('puzzle_auto_unlocked', { puzzleType, variant })
        console.log(`🔓 [${puzzleType}] Puzzle desbloqueado automáticamente!`)
      }, 1000) // Tiempo para que se vea la animación de apertura
    }
    
    // Actualizar ref después de procesar
    prevUnlockedRef.current = isUnlocked
  }, [isUnlocked, isUnlocking, puzzleType, variant, triggerEvent, gameState])

  // Si está desbloqueado y no está en proceso de desbloqueo, mostrar directamente
  if (isUnlocked && !isUnlocking) {
    return (
      <div className={`relative w-full h-full ${className}`}>
        {isSolved && (
          <CompletionOverlay 
            label={getPuzzleLabel(puzzleType)}
            message="SYSTEM OPTIMIZED"
          />
        )}
        {children}
      </div>
    )
  }

  // Mostrar tapa mientras está bloqueado o en proceso de desbloqueo
  return (
    <div className={`relative w-full h-full ${className}`}>
      <SecurityOverlay
        isLocked={true} // Siempre bloqueado mientras se muestra la tapa
        forceOpen={isUnlocking} // Forzar apertura cuando se está desbloqueando
        label={getPuzzleLabel(puzzleType)}
        message={customMessage || getDependencyMessage(puzzleType)}
      />
      
      {/* Contenido ofuscado debajo */}
      <div className={`w-full h-full transition-all duration-1000 ${
        isUnlocking ? 'opacity-100 blur-0 grayscale-0' : 'opacity-30 blur-sm grayscale'
      }`}>
        {children}
      </div>
    </div>
  )
}

function getPuzzleLabel(type) {
  switch(type) {
    case 'frequency': return 'FREQUENCY_MOD';
    case 'cipher': return 'CIPHER_ENGINE';
    case 'cables': 
    case 'wiring': return 'POWER_GRID';
    default: return 'SYSTEM_MODULE';
  }
}

function getDependencyMessage(puzzleType) {
  switch (puzzleType) {
    case 'frequency':
      return 'Requiere: Secuencia Resonante completada'
    case 'cipher':
      return 'Requiere: Prueba de Frecuencias completada'
    case 'cables':
    case 'wiring':
      return 'Requiere: Buffer de Cifrado completado'
    default:
      return 'Puzzle bloqueado'
  }
}