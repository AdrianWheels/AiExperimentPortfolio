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
    <section className="flex flex-col h-full min-h-0">
      <header className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-accent/20 flex items-center justify-center">
            <span className="text-xs">💡</span>
          </div>
          <h2 className="text-sm font-semibold text-white">Pistas</h2>
        </div>
        <span className="text-xs text-muted">{activeLabel}</span>
      </header>

      <button
        type="button"
        onClick={handleRequest}
        disabled={!canRequest}
        className="w-full px-3 py-2 bg-accent/80 hover:bg-accent rounded-lg text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors mb-3"
      >
        {cooldown > 0
          ? `Cooldown (${formatTime(cooldown)})`
          : activeChallenge === 'free'
          ? 'Sin retos'
          : 'Solicitar'}
      </button>

      <div className="flex-1 overflow-y-auto bg-black/30 rounded-lg p-2 text-xs space-y-2 min-h-[60px] max-h-[100px]">
        {hintLog.length === 0 ? (
          <p className="text-subtle text-center py-2">Sin pistas aún</p>
        ) : (
          hintLog
            .slice()
            .reverse()
            .map((entry) => (
              <article key={entry.id} className="pb-2 border-b border-white/5 last:border-0 last:pb-0">
                <p className="text-muted leading-relaxed">{entry.text}</p>
              </article>
            ))
        )}
      </div>

      <footer className="text-xs text-subtle mt-2">
        Usadas: {gameState.hintsUsed}
      </footer>
    </section>
  )
}
