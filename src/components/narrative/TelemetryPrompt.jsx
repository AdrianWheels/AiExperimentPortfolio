import React from 'react'
import { useGame } from '../../context/GameContext'

export default function TelemetryPrompt() {
  const { gameState, setTelemetryOptIn } = useGame()

  if (gameState.telemetryOptIn) return null

  return (
    <div className="fixed bottom-4 right-4 bg-panel p-3 rounded border border-border text-sm">
      <div className="mb-2">¿Permitir telemetría anónima? (opt‑in)</div>
      <div className="flex gap-2 justify-end">
        <button className="px-2 py-1 bg-zinc-700 rounded" onClick={() => setTelemetryOptIn(false)}>
          No
        </button>
        <button className="px-2 py-1 bg-emerald-600 rounded" onClick={() => setTelemetryOptIn(true)}>
          Sí, permitir
        </button>
      </div>
    </div>
  )
}
