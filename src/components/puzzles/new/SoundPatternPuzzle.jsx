import React, { useEffect, useMemo, useState, useRef } from 'react'
import { useGame } from '../../../context/GameContext'
import { evaluateSoundSequence, nextExpectedTone, SOUND_PATTERN } from './soundLogic'

const TONE_BANK = [
  { id: 'alpha', label: '●', frequency: 320, color: 'bg-sky-500', borderColor: 'border-sky-300' },
  { id: 'beta', label: '◆', frequency: 180, color: 'bg-indigo-500', borderColor: 'border-indigo-300' },
  { id: 'gamma', label: '▲', frequency: 520, color: 'bg-purple-500', borderColor: 'border-purple-300' },
  { id: 'delta', label: '▬', frequency: 260, color: 'bg-emerald-500', borderColor: 'border-emerald-300' },
]

// Secuencia lineal que debe completar el usuario (basada en ● → ▬ → ▲ → ◆)
const SEQUENCE_PATTERN = [
  { type: 'alpha', symbol: '●' },
  { type: 'delta', symbol: '▬' },
  { type: 'gamma', symbol: '▲' },
  { type: 'beta', symbol: '◆' },
]

// Distancia entre elementos en la línea (en porcentaje)
const ELEMENT_SPACING = 35 // Separación optimizada para una sola línea

export default function SoundPatternPuzzle() {
  const {
    gameState,
    playTone,
    completeSoundPuzzle,
    triggerEvent,
    scheduleTimeout,
    activeChallenge,
  } = useGame()

  const [input, setInput] = useState([])
  const [feedback, setFeedback] = useState('idle')
  const [didAnnounce, setDidAnnounce] = useState(false)
  const [timelinePosition, setTimelinePosition] = useState(0)
  const timelineRef = useRef(null)
  const animationRef = useRef(null)

  const solved = Boolean(gameState.puzzleProgress?.sound?.solved)
  const remainingSteps = SOUND_PATTERN.length - input.length
  const nextTone = useMemo(() => nextExpectedTone(input), [input])

  // Animación de la línea de tiempo - movimiento continuo
  useEffect(() => {
    if (solved) return

    const animate = () => {
      setTimelinePosition(prev => {
        const next = prev + 0.2 // Velocidad más lenta (era 0.4)
        return next > 120 ? -40 : next // Portal más amplio: sale completamente por la derecha antes de reaparecer
      })
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [solved])

  useEffect(() => {
    if (solved) return
    if (didAnnounce) return
    if (activeChallenge !== 'sound') return
    triggerEvent('sound_puzzle_intro')
    setDidAnnounce(true)
  }, [activeChallenge, didAnnounce, solved, triggerEvent])

  useEffect(() => {
    if (feedback === 'idle') return
    return scheduleTimeout(() => setFeedback('idle'), 900)
  }, [feedback, scheduleTimeout])

  const handleTimingPress = () => {
    if (solved) return

    // Verificar si algún elemento de la secuencia está en la zona objetivo
    let hitElement = null
    let isInTimingZone = false

    for (let i = 0; i < SEQUENCE_PATTERN.length; i++) {
      const elementPosition = (timelinePosition + (i * ELEMENT_SPACING)) % (120 + 40)
      if (elementPosition > 100) continue // Elemento fuera de pantalla

      const distanceFromTarget = Math.abs(elementPosition - 50) // 50% es el centro
      if (distanceFromTarget < 12) { // Zona de tolerancia
        hitElement = SEQUENCE_PATTERN[i]
        isInTimingZone = true
        break
      }
    }

    if (!isInTimingZone) {
      setFeedback('timing')
      return
    }

    // Verificar si es el elemento correcto según la secuencia esperada
    const expectedTone = nextTone
    if (!hitElement || expectedTone !== hitElement.type) {
      setFeedback('error')
      setInput([])
      triggerEvent('sound_puzzle_miss')
      return
    }

    // Reproducir el sonido correspondiente
    const tone = TONE_BANK.find(t => t.id === hitElement.type)
    if (tone) {
      playTone(tone.frequency)
    }

    const normalized = hitElement.type
    const next = [...input, normalized]
    const evaluation = evaluateSoundSequence(next)

    if (evaluation.status === 'incorrect') {
      setFeedback('error')
      setInput([])
      triggerEvent('sound_puzzle_miss')
      return
    }

    setInput(next)

    if (evaluation.status === 'correct') {
      setFeedback('success')
      // Play the complete sequence when solved
      SOUND_PATTERN.forEach((toneId, index) => {
        scheduleTimeout(() => {
          const tone = TONE_BANK.find(t => t.id === toneId)
          if (tone) {
            playTone(tone.frequency)
          }
        }, index * 300) // Play each tone with 300ms delay
      })
      completeSoundPuzzle()
      setInput([])
    } else {
      setFeedback('progress')
    }
  }

  // Agregar soporte para teclas (opcional)
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.code === 'Space' || event.key === ' ') {
        event.preventDefault()
        handleTimingPress()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleTimingPress])

  return (
    <section
      className={`bg-panel border border-border rounded-lg p-4 flex flex-col gap-3 flex-1 min-h-0 transition-shadow ${solved ? 'glow-success' : ''
        }`}
    >
      <header className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">Secuencia Resonante</div>
          <p className="text-xs text-slate-400 mt-1">
            Presiona cuando cada elemento pase por la zona verde. Orden: ● → ▬ → ▲ → ◆
          </p>
        </div>
        <div className="text-[11px] uppercase tracking-wide text-slate-500">
          {solved ? 'Calibrado' : 'Pendiente'}
        </div>
      </header>

      {/* Referencia visual de elementos */}
      {!solved && (
        <div className="flex justify-center gap-4 py-2 bg-black/20 rounded border border-zinc-700">
          {TONE_BANK.map((tone) => (
            <div key={tone.id} className="flex items-center gap-1 text-xs">
              <div className={`w-4 h-4 ${tone.color} ${tone.borderColor} border-2 rounded-full flex items-center justify-center text-white text-[10px] font-bold`}>
                {tone.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Línea de tiempo estilo Guitar Hero de una sola pista */}
      {!solved && (
        <div className="relative bg-black/50 border border-zinc-700 rounded-lg h-20 overflow-hidden">
          {/* Línea base */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-zinc-600 transform -translate-y-1/2" />

          {/* Elementos que se mueven en la línea de tiempo */}
          {SEQUENCE_PATTERN.map((element, index) => {
            const elementPosition = (timelinePosition + (index * ELEMENT_SPACING)) % (120 + 40)

            // Solo mostrar si está dentro de la pantalla
            if (elementPosition > 100) return null

            const tone = TONE_BANK.find(t => t.id === element.type)
            const isInTargetZone = Math.abs(elementPosition - 50) < 12

            return (
              <div
                key={`${element.type}-${index}`}
                className={`absolute top-1/2 w-10 h-10 transform -translate-y-1/2 transition-all duration-100 ${isInTargetZone ? 'scale-125 z-10' : 'scale-100 z-0'
                  }`}
                style={{ left: `calc(${elementPosition}% - 20px)` }}
              >
                <div className={`w-full h-full ${tone?.color || 'bg-gray-500'} ${tone?.borderColor || 'border-gray-400'} border-3 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg ${isInTargetZone ? 'shadow-white/50' : ''
                  }`}>
                  {element.symbol}
                </div>
              </div>
            )
          })}

          {/* Zona de objetivo - centro de la línea */}
          <div className="absolute left-1/2 top-0 bottom-0 w-24 transform -translate-x-1/2 bg-emerald-400/20 border-x-2 border-emerald-400/60">
            <div className="absolute left-1/2 top-1/2 w-3 h-3 bg-emerald-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
        </div>
      )}

      {/* Botón de timing central */}
      {!solved && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleTimingPress}
            className="px-8 py-4 bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold rounded-lg border-2 border-emerald-400 shadow-lg transform transition-all duration-150 hover:scale-105 active:scale-95"
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-lg">⚡</span>
              <span className="text-sm">ACTIVAR</span>
              <span className="text-xs opacity-75">(Espacio)</span>
            </div>
          </button>
        </div>
      )}

      {/* Feedback de estado */}
      {feedback !== 'idle' && (
        <div className={`text-center text-sm font-medium ${feedback === 'success' ? 'text-emerald-400' :
          feedback === 'error' ? 'text-red-400' :
            feedback === 'timing' ? 'text-yellow-400' :
              'text-blue-400'
          }`}>
          {feedback === 'success' && '✓ Resonancia establecida'}
          {feedback === 'error' && '✗ Elemento incorrecto'}
          {feedback === 'timing' && '⚠ Timing incorrecto'}
          {feedback === 'progress' && '→ Continúa...'}
        </div>
      )}

      <footer className="text-xs text-slate-300/90 bg-black/30 border border-zinc-800 rounded px-3 py-2 font-mono">
        {solved ? (
          <span>Canal estabilizado. Frecuencias desbloqueadas.</span>
        ) : feedback === 'error' ? (
          <span>Elemento incorrecto. La secuencia se ha reiniciado.</span>
        ) : feedback === 'timing' ? (
          <span>Timing incorrecto. Presiona cuando el elemento esté en la zona verde.</span>
        ) : feedback === 'progress' ? (
          <span>Elemento capturado. Faltan {remainingSteps} elemento{remainingSteps === 1 ? '' : 's'}: {nextTone || 'ninguno'}.</span>
        ) : (
          <span>Presiona ACTIVAR cuando cada elemento pase por la zona verde. Secuencia: ● → ▬ → ▲ → ◆</span>
        )}
      </footer>
    </section>
  )
}