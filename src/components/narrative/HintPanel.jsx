import React, { useEffect, useMemo, useState } from 'react'
import { useGame } from '../../context/GameContext'

function formatTime(ms) {
  if (ms <= 0) return 'Disponible'
  const seconds = Math.ceil(ms / 1000)
  return `${seconds}s`
}

export default function HintPanel() {
  const { gameState, requestHint, activeChallenge } = useGame()
  const [cooldown, setCooldown] = useState(0)
  const labels = useMemo(
    () => ({
      sound: 'Secuencia resonante',
      cipher: 'Buffer de cifrado',
      frequency: 'Módulo de frecuencias',
      wiring: 'Panel de cables',
      security: 'Candado de seguridad',
      free: 'Sistema liberado',
    }),
    [],
  )
  const activeLabel = labels[activeChallenge] ?? 'Sistema'
  const canRequest = cooldown <= 0 && activeChallenge !== 'free'

  useEffect(() => {
    const update = () => {
      const diff = Math.max(0, (gameState.hintCooldownUntil ?? 0) - Date.now())
      setCooldown(diff)
    }
    update()
    const id = setInterval(update, 500)
    return () => clearInterval(id)
  }, [gameState.hintCooldownUntil])

  const handleRequest = () => {
    requestHint()
  }

  const hintLog = Array.isArray(gameState.hintLog) ? gameState.hintLog : []

  return (
    <section className="bg-panel border border-border rounded-lg p-4 flex flex-col gap-3 min-h-[220px]">
      <header className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">Canal de Pistas</div>
          <p className="text-xs text-slate-400 mt-1">
            Solicita ayuda contextual. A.R.I.A. ajusta su actitud según el número de pistas usadas.
          </p>
        </div>
        <div className="text-[11px] uppercase tracking-wide text-slate-500 text-right leading-tight">
          {activeLabel}
        </div>
      </header>

      <button
        type="button"
        onClick={handleRequest}
        disabled={!canRequest}
        className="self-start px-3 py-2 bg-violet-600 hover:bg-violet-500 rounded text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {cooldown > 0
          ? `En cooldown (${formatTime(cooldown)})`
          : activeChallenge === 'free'
          ? 'Sin retos activos'
          : 'Solicitar pista'}
      </button>

      <div className="flex-1 overflow-y-auto bg-black/30 border border-zinc-800 rounded p-3 text-xs text-slate-200 space-y-2">
        {hintLog.length === 0 ? (
          <p className="text-slate-500 text-xs">
            Aún no has pedido pistas. Mantén la racha para impresionar a A.R.I.A.
          </p>
        ) : (
          hintLog
            .slice()
            .reverse()
            .map((entry) => (
              <article key={entry.id} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400 uppercase">
                  <span>{entry.puzzleLabel}</span>
                  <span>Nivel {entry.level}</span>
                </div>
                <p>{entry.text}</p>
              </article>
            ))
        )}
      </div>

      <footer className="text-[11px] text-slate-500 uppercase tracking-wide">
        Pistas usadas: {gameState.hintsUsed}
      </footer>
    </section>
  )
}
