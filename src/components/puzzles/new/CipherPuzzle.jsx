import React, { useEffect, useMemo, useState } from 'react'
import { useGame } from '../../../context/GameContext'
import { CIPHER_SOLUTION, isCipherCorrect, revealCipherHint } from './cipherLogic'

export default function CipherPuzzle() {
  const { gameState, completeCipherPuzzle, triggerEvent, activeChallenge } = useGame()
  const [attempt, setAttempt] = useState('')
  const [feedback, setFeedback] = useState('idle')
  const [didAnnounce, setDidAnnounce] = useState(false)

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
    <section className={`bg-panel border border-border rounded-lg p-4 flex flex-col gap-4 ${solved ? 'glow-success' : ''}`}>
      <header className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-semibold">Buffer de Cifrado</div>
          <p className="text-xs text-slate-400 mt-1">
            Traduce la transmisión de seguridad. La respuesta revela el código de desbloqueo.
          </p>
        </div>
        <div className="text-[11px] uppercase tracking-wide text-slate-500">
          {solved ? 'Descifrado' : 'Pendiente'}
        </div>
      </header>

      <div className="bg-black/30 border border-zinc-800 rounded p-3 text-xs font-mono text-slate-200 leading-relaxed">
        <div className="text-slate-400 uppercase tracking-widest text-[10px] mb-2">Entrada en bruto</div>
        <p className="whitespace-pre-line">
          {"-- -.- / --... ...-- .---- ----.\nFrecuencia espejo indica que los guiones separan bloques."}
        </p>
        {hintLevel > 0 && (
          <p className="mt-3 text-emerald-300">
            Prefijo confirmado: <span className="font-semibold">{reveal}</span>
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <label htmlFor="cipher-input" className="text-xs text-slate-400">
          Introduce la traducción (sin espacios)
        </label>
        <input
          id="cipher-input"
          type="text"
          autoComplete="off"
          value={attempt}
          onChange={(event) => setAttempt(event.target.value)}
          disabled={solved}
          className={`px-3 py-2 rounded bg-zinc-900 border text-sm font-mono tracking-wide uppercase transition-colors ${
            solved
              ? 'border-emerald-500/60 text-emerald-200'
              : feedback === 'error'
              ? 'border-red-500/60 text-red-200'
              : 'border-zinc-700 focus:border-emerald-400 text-slate-100'
          }`}
          placeholder="Ej: MK7319"
        />
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Tip: Traducir Morse → letras y dígitos.</span>
          <button
            type="submit"
            disabled={solved}
            className="px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold disabled:bg-emerald-900 disabled:text-emerald-200"
          >
            Validar
          </button>
        </div>
      </form>

      <footer className="text-xs text-slate-300/90 bg-black/30 border border-zinc-800 rounded px-3 py-2 font-mono">
        {solved ? (
          <span>
            Decodificación exitosa. Código revelado: <span className="font-semibold">7319</span>.
          </span>
        ) : feedback === 'error' ? (
          <span>Traducción incorrecta. Verifica la agrupación de símbolos.</span>
        ) : (
          <span>Escucha cómo A.R.I.A. comenta cada pista. Ella odia admitirlo, pero quiere que avances.</span>
        )}
      </footer>
    </section>
  )
}
