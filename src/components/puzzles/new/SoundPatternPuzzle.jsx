import React, { useEffect, useMemo, useState } from 'react'
import { useGame } from '../../../context/GameContext'
import { evaluateSoundSequence, nextExpectedTone, SOUND_PATTERN } from './soundLogic'

const TONE_BANK = [
  { id: 'alpha', label: 'α', description: 'Pulso corto', frequency: 320, color: 'from-sky-500 to-sky-600' },
  { id: 'beta', label: 'β', description: 'Pulso grave', frequency: 180, color: 'from-indigo-500 to-indigo-600' },
  { id: 'gamma', label: 'γ', description: 'Pulso agudo', frequency: 520, color: 'from-purple-500 to-purple-600' },
  { id: 'delta', label: 'δ', description: 'Pulso largo', frequency: 260, color: 'from-emerald-500 to-emerald-600' },
]

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

  const solved = Boolean(gameState.puzzleProgress?.sound?.solved)
  const remainingSteps = SOUND_PATTERN.length - input.length
  const nextTone = useMemo(() => nextExpectedTone(input), [input])

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

  const handleTonePress = (tone) => {
    if (solved) return
    const normalized = tone.id
    playTone(tone.frequency)
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
      completeSoundPuzzle()
      setInput([])
    } else {
      setFeedback('progress')
    }
  }

  return (
    <section
      className={`bg-panel border border-border rounded-lg p-4 flex flex-col gap-3 transition-shadow ${
        solved ? 'glow-success' : ''
      }`}
    >
      <header className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">Secuencia Resonante</div>
          <p className="text-xs text-slate-400 mt-1">
            Pulsa los emisores en el orden correcto para estabilizar el canal de audio.
          </p>
        </div>
        <div className="text-[11px] uppercase tracking-wide text-slate-500">
          {solved ? 'Calibrado' : 'Pendiente'}
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3">
        {TONE_BANK.map((tone) => {
          const isNext = !solved && nextTone === tone.id
          return (
            <button
              key={tone.id}
              type="button"
              onClick={() => handleTonePress(tone)}
              className={`relative overflow-hidden rounded-lg border border-white/10 px-3 py-4 text-left transition-all ${
                solved
                  ? 'bg-emerald-800/40 text-emerald-100'
                  : 'bg-zinc-900/60 hover:bg-zinc-800/60 text-slate-100'
              } ${isNext ? 'ring-2 ring-emerald-400/70' : ''}`}
            >
              <div
                className={`absolute inset-0 opacity-80 bg-gradient-to-br ${tone.color}`}
                aria-hidden="true"
              />
              <div className="relative z-10 flex flex-col gap-1">
                <span className="text-xl font-bold font-mono">{tone.label}</span>
                <span className="text-xs text-slate-200/80">{tone.description}</span>
              </div>
            </button>
          )
        })}
      </div>

      <footer className="text-xs text-slate-300/90 bg-black/30 border border-zinc-800 rounded px-3 py-2 font-mono">
        {solved ? (
          <span>Canal estabilizado. Frecuencias desbloqueadas.</span>
        ) : feedback === 'error' ? (
          <span>Secuencia incorrecta detectada. Reintentando…</span>
        ) : feedback === 'progress' ? (
          <span>Capturando patrón… faltan {remainingSteps} pulso{remainingSteps === 1 ? '' : 's'}.</span>
        ) : (
          <span>Escucha el eco del arranque. Prioriza el pulso indicado en el terminal.</span>
        )}
      </footer>
    </section>
  )
}
