import React from 'react'
import { TARGETS } from '../../context/GameContext'
import { useGame } from '../../context/GameContext'

export default function FrequencyControls() {
  const { sliders, setSliderValue, gameState, unlockAnimations } = useGame()
  const canInteract = Boolean(gameState.puzzleProgress?.sound?.solved)
  const isPulsing = Boolean(unlockAnimations?.locks?.frequency)

  return (
    <section
      className={`bg-panel p-4 rounded-lg border border-border relative overflow-hidden ${
        isPulsing ? 'glow-success unlock-pulse' : ''
      }`}
    >
      <div className="mb-3 text-sm font-medium text-center">Controles de Frecuencia</div>
      {!canInteract && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-center px-4 text-xs text-slate-300 font-mono">
          <span>Completa la Secuencia Resonante para habilitar este módulo.</span>
        </div>
      )}
      <div className="flex gap-6 items-start justify-center h-full">
        {['f1', 'f2', 'f3'].map((key) => {
          const value = sliders[key]
          const distance = Math.abs(value - TARGETS[key])
          const proximity = Math.max(0, 1 - distance / 0.15)
          const style =
            proximity > 0.66 ? 'near' : proximity > 0.33 ? 'close' : 'far'

          return (
            <div key={key} className="flex flex-col items-center">
              <div className={`slider-rail ${style}`}>
                <input
                  aria-label={key}
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={value}
                  onChange={(event) => setSliderValue(key, parseFloat(event.target.value))}
                  disabled={!canInteract}
                  className="vertical-range"
                  style={{ height: 140 }}
                />
              </div>
              <div className="text-xs mt-2 font-medium">{key.toUpperCase()}</div>
              <div className="text-xs text-slate-400">{(value * 100).toFixed(0)}%</div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
