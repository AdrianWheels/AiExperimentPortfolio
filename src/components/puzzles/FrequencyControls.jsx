import React from 'react'
import { TARGETS } from '../../context/GameContext'
import { useGame } from '../../context/GameContext'

export default function FrequencyControls() {
  const { sliders, setSliderValue, validateFrequency, gameState, unlockAnimations } = useGame()
  const canInteract = Boolean(gameState.puzzleProgress?.sound?.solved)
  const isPulsing = Boolean(unlockAnimations?.locks?.frequency)

  const handleSliderRelease = () => {
    if (canInteract) {
      validateFrequency()
    }
  }

  return (
    <section
      className={`bg-panel p-4 rounded-lg border border-border relative overflow-hidden flex-1 min-h-0 ${
        isPulsing ? 'glow-success unlock-pulse' : ''
      }`}
    >
      <div className="mb-3 text-sm font-medium text-center">Controles de Frecuencia</div>
      {!canInteract && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-center px-4 text-xs text-slate-300 font-mono">
          <span>Completa la Secuencia Resonante para habilitar este módulo.</span>
        </div>
      )}
      <div className="flex flex-col gap-10 items-center justify-center h-full">
        {['f1', 'f2', 'f3'].map((key) => {
          const value = sliders[key]
          const target = TARGETS[key]
          const distance = Math.abs(value - target)
          const proximity = Math.max(0, 1 - distance / 0.15)
          const style =
            proximity > 0.66 ? 'near' : proximity > 0.33 ? 'close' : 'far'
            
          // Calcular la opacidad del brillo verde basada en la proximidad
          const greenOpacity = Math.min(proximity * 1.5, 1)

          return (
            <div key={key} className="frequency-slider-container">
              <div className="flex items-center gap-4 w-full">
                <div className="text-sm font-semibold w-8 text-slate-300">{key.toUpperCase()}</div>
                <div className="flex-1 relative">
                  <input
                    aria-label={key}
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={value}
                    onInput={(event) => setSliderValue(key, parseFloat(event.target.value))}
                    onMouseUp={handleSliderRelease}
                    onTouchEnd={handleSliderRelease}
                    disabled={!canInteract}
                    className={`frequency-slider ${style}`}
                  />
                </div>
                <div className={`text-sm w-12 font-mono transition-colors duration-200 ${
                  proximity > 0.8 ? 'text-emerald-300 font-bold' : 
                  proximity > 0.5 ? 'text-blue-400 font-semibold' : 
                  'text-slate-400'
                }`}>
                  {(value * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
