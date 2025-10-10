import React, { useState } from 'react'
import SoundPatternPuzzle from './SoundPatternPuzzle'
import ResonanceSequenceEngine from './ResonanceSequenceEngine'

export default function ResonanceComparison() {
  const [useGuitarHero, setUseGuitarHero] = useState(true)

  return (
    <div className="bg-panel border border-border rounded-lg p-4 flex flex-col gap-3 flex-1 min-h-0">
      {/* Selector de motor */}
      <div className="flex items-center justify-between bg-black/20 rounded p-2 border border-zinc-700">
        <span className="text-sm font-medium">Motor de Juego:</span>
        <div className="flex gap-2">
          <button
            onClick={() => setUseGuitarHero(false)}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              !useGuitarHero 
                ? 'bg-blue-600 text-white' 
                : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
            }`}
          >
            Original (Timeline)
          </button>
          <button
            onClick={() => setUseGuitarHero(true)}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              useGuitarHero 
                ? 'bg-emerald-600 text-white' 
                : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
            }`}
          >
            Guitar Hero Engine
          </button>
        </div>
      </div>

      {/* Información del motor activo */}
      <div className="text-xs text-slate-400 bg-black/10 rounded p-2">
        {useGuitarHero ? (
          <div>
            <strong>Motor Guitar Hero:</strong> Sistema avanzado con física, timing preciso, 
            scoring, combos y feedback detallado. Basado en Canvas 2D para mayor rendimiento.
            <div className="mt-1">
              <span className="text-emerald-400">✓ Física realista</span> | 
              <span className="text-emerald-400"> ✓ Timing preciso</span> | 
              <span className="text-emerald-400"> ✓ Sistema de puntuación</span> |
              <span className="text-emerald-400"> ✓ Feedback visual avanzado</span>
            </div>
          </div>
        ) : (
          <div>
            <strong>Motor Original:</strong> Sistema básico con timeline simple y detección de timing. 
            Basado en CSS y elementos DOM.
            <div className="mt-1">
              <span className="text-blue-400">• Timeline CSS</span> | 
              <span className="text-blue-400"> • Timing básico</span> | 
              <span className="text-blue-400"> • Feedback simple</span>
            </div>
          </div>
        )}
      </div>

      {/* Renderizar el componente seleccionado */}
      <div className="flex-1 min-h-0">
        {useGuitarHero ? (
          <ResonanceSequenceEngine />
        ) : (
          <SoundPatternPuzzle />
        )}
      </div>
    </div>
  )
}