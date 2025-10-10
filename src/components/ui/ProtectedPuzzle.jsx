import React, { useEffect, useState } from 'react'
import { useGame } from '../../context/GameContext'
import PuzzleLid from './PuzzleLid'

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
  const [wasLocked, setWasLocked] = useState(true)

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
      wasLocked,
      isUnlocking,
      gameState: {
        progress: gameState?.puzzleProgress,
        locks: gameState?.locks
      }
    })
    
    if (isUnlocked && wasLocked && !isUnlocking) {
      console.log(`🎮 [${puzzleType}] 🚀 Iniciando secuencia de desbloqueo automático...`)
      setIsUnlocking(true)
      // Delay para que se vea la animación de apertura
      setTimeout(() => {
        console.log(`🎮 [${puzzleType}] ✅ Desbloqueo completado!`)
        setIsUnlocking(false)
        setWasLocked(false)
        triggerEvent('puzzle_auto_unlocked', { puzzleType, variant })
        console.log(`� [${puzzleType}] Puzzle desbloqueado automáticamente!`)
      }, 1000) // Tiempo para que se vea la animación de apertura
    }
  }, [isUnlocked, wasLocked, isUnlocking, puzzleType, variant, triggerEvent, gameState])

  // Si está desbloqueado y no está en proceso de desbloqueo, mostrar directamente
  if (isUnlocked && !isUnlocking && !wasLocked) {
    return children
  }

  // Mostrar tapa mientras está bloqueado o en proceso de desbloqueo
  return (
    <PuzzleLid
      isLocked={true} // Siempre bloqueado mientras se muestra la tapa
      variant={variant}
      className={className}
      forceOpen={isUnlocking} // Forzar apertura cuando se está desbloqueando
    >
      <div className="flex items-center justify-center h-full min-h-[200px] text-slate-400">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <div className="text-sm">
            {customMessage || getDependencyMessage(puzzleType)}
          </div>
        </div>
      </div>
    </PuzzleLid>
  )
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