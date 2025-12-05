import React, { useEffect, useMemo, useState } from 'react'
import { useGame } from '../../../context/GameContext'
import { CIPHER_SOLUTION, isCipherCorrect, revealCipherHint } from './cipherLogic'
import useSound from '../../../hooks/useSound'

export default function CipherPuzzle() {
  const { gameState, completeCipherPuzzle, triggerEvent, activeChallenge } = useGame()
  const [attempt, setAttempt] = useState('')
  const [feedback, setFeedback] = useState('idle')
  const [didAnnounce, setDidAnnounce] = useState(false)
  const { playTone } = useSound()

  const solved = Boolean(gameState.puzzleProgress?.cipher?.solved)
  const hintLevel = gameState.puzzleProgress?.cipher?.hints ?? 0
  const reveal = useMemo(() => revealCipherHint(hintLevel, CIPHER_SOLUTION), [hintLevel])

  useEffect(() => {
    if (solved) return
    if (didAnnounce) return
    if (activeChallenge !== 'cipher') return
    triggerEvent('cipher_puzzle_intro')
    setDidAnnounce(true)
  }, [activeChallenge, didAnnounce, solved, triggerEvent])

  // Highlight hint when puzzle is active and unsolved
  useEffect(() => {
    const aiNameElement = document.querySelector('[data-ai-name]')
    if (aiNameElement) {
      if (activeChallenge === 'cipher' && !solved) {
        aiNameElement.classList.add('hint-glow')
      } else {
        aiNameElement.classList.remove('hint-glow')
      }
    }
    return () => {
      const aiNameElement = document.querySelector('[data-ai-name]')
      if (aiNameElement) {
        aiNameElement.classList.remove('hint-glow')
      }
    }
  }, [activeChallenge, solved])

  const handleSubmit = () => {
    if (solved) return
    if (!attempt.trim()) return

    if (isCipherCorrect(attempt)) {
      setFeedback('success')
      playTone(880, 0.1, 'sine')
      setTimeout(() => playTone(1100, 0.2, 'sine'), 100)
      completeCipherPuzzle(attempt)
    } else {
      setFeedback('error')
      playTone(150, 0.3, 'sawtooth')
      triggerEvent('cipher_puzzle_miss')
      setTimeout(() => setFeedback('idle'), 500)
      setAttempt('')
    }
  }

  const handleKeypad = (key) => {
    if (solved) return

    if (key === 'C') {
      setAttempt('')
      playTone(300, 0.1, 'square')
      return
    }

    if (key === 'ENTER') {
      handleSubmit()
      return
    }

    if (attempt.length < 4) {
      setAttempt((prev) => prev + key)
      // Different tone for each key for "juice"
      playTone(400 + parseInt(key) * 50, 0.1, 'sine')
    } else {
      playTone(200, 0.1, 'sawtooth') // Error/Full tone
    }
  }

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'ENTER']

  return (
    <section className={`flex flex-col gap-3 h-full ${solved ? 'glow-success' : ''}`}>
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-accent/20 flex items-center justify-center">
            <span className="text-xs">🔐</span>
          </div>
          <h3 className="text-sm font-semibold text-white">Cifrado</h3>
        </div>
        <span className={`text-[10px] uppercase tracking-wide ${solved ? 'text-success' : 'text-muted'}`}>
          {solved ? '✓' : 'Pendiente'}
        </span>
      </header>

      <div className="flex flex-col gap-3 flex-1">
        {/* Display */}
        <div
          className={`relative h-12 bg-black/40 rounded-lg border flex items-center justify-center overflow-hidden transition-colors ${
            solved
              ? 'border-success/50 text-success shadow-[0_0_15px_rgba(16,185,129,0.2)]'
              : feedback === 'error'
              ? 'border-error/60 text-error animate-shake bg-error/10'
              : 'border-white/10 text-white'
          }`}
        >
          <span className="font-mono text-2xl tracking-[0.5em] font-bold z-10">
            {attempt.padEnd(4, '·')}
          </span>
          {/* Scanline effect */}
          {!solved && <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-[20%] w-full animate-scanline pointer-events-none" />}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2 flex-1">
          {keys.map((key) => (
            <button
              key={key}
              onClick={() => handleKeypad(key)}
              disabled={solved}
              className={`
                relative rounded-lg font-mono font-bold text-lg transition-all active:scale-95
                flex items-center justify-center
                ${
                  key === 'ENTER'
                    ? 'bg-purple-glow/20 text-purple-300 border border-purple-glow/30 hover:bg-purple-glow/30 hover:border-purple-glow/50'
                    : key === 'C'
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                    : 'bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20'
                }
                ${solved ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {key === 'ENTER' ? '⏎' : key}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] text-subtle">Busca en el nombre de KIRA</span>
          {solved && <span className="text-[10px] text-success font-mono">ACCESO CONCEDIDO</span>}
        </div>
      </div>
    </section>
  )
}
