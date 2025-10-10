import React, { useEffect, useMemo, useState } from 'react'
import { useGame } from '../../../context/GameContext'
import { CIPHER_SOLUTION, isCipherCorrect, revealCipherHint } from './cipherLogic'

export default function CipherPuzzle() {
  const { gameState, completeCipherPuzzle, triggerEvent, activeChallenge } = useGame()
  const [attempt, setAttempt] = useState('')
  const [feedback, setFeedback] = useState('idle')
  const [didAnnounce, setDidAnnounce] = useState(false)
  const [isInputFocused, setIsInputFocused] = useState(false)

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

  // Add focus hint effect to AI name when input is focused
  useEffect(() => {
    const aiNameElement = document.querySelector('[data-ai-name]')
    if (aiNameElement) {
      if (isInputFocused && !solved) {
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
  }, [isInputFocused, solved])

  const handleSubmit = (event) => {
    event.preventDefault()
    if (solved) return
    if (!attempt.trim()) return

    if (isCipherCorrect(attempt)) {
      setFeedback('success')
      completeCipherPuzzle(attempt)
    } else {
      setFeedback('error')
      triggerEvent('cipher_puzzle_miss')
    }
  }

  return (
    <section className={`bg-panel border border-border rounded-lg p-4 flex flex-col gap-4 flex-1 min-h-0 ${solved ? 'glow-success' : ''}`}>
      <header className="flex items-start justify-between gap-2">
        <div>
          <div className="text-lg font-semibold">Buffer de Cifrado</div>
          <p className="text-sm text-slate-400 mt-1">
            El nombre de la IA contiene el código de desbloqueo. Observa detenidamente su identificación.
          </p>
        </div>
        <div className="text-xs uppercase tracking-wide text-slate-500">
          {solved ? 'Descifrado' : 'Pendiente'}
        </div>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label htmlFor="cipher-input" className="text-sm text-slate-400 font-medium">
          Introduce el código del modelo de IA (sin espacios ni puntos)
        </label>
        <input
          id="cipher-input"
          type="text"
          autoComplete="off"
          value={attempt}
          onChange={(event) => setAttempt(event.target.value)}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          disabled={solved}
          className={`px-4 py-3 rounded-lg bg-zinc-900 border text-lg font-mono tracking-wide uppercase transition-colors ${
            solved
              ? 'border-emerald-500/60 text-emerald-200'
              : feedback === 'error'
              ? 'border-red-500/60 text-red-200'
              : 'border-zinc-700 focus:border-emerald-400 text-slate-100 focus:ring-2 focus:ring-emerald-400/20'
          }`}
          placeholder="Ej: MK7319"
        />
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>Tip: Revisa el nombre completo de la IA para encontrar el modelo.</span>
          <button
            type="submit"
            disabled={solved}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold disabled:bg-emerald-900 disabled:text-emerald-200 transition-colors"
          >
            Validar
          </button>
        </div>
      </form>

      <footer className="text-sm text-slate-300/90 bg-black/30 border border-zinc-800 rounded-lg px-4 py-3 font-mono">
        {solved ? (
          <span>
            Decodificación exitosa. Código revelado: <span className="font-semibold text-base">7319</span>.
          </span>
        ) : feedback === 'error' ? (
          <span>Código incorrecto. El modelo está oculto en el nombre de la IA.</span>
        ) : (
          <span>Examina cuidadosamente la identificación de A.R.I.A. El código está ahí.</span>
        )}
      </footer>
    </section>
  )
}
