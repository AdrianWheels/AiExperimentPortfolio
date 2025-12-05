import React, { useState, useRef } from 'react'
import { TARGETS } from '../../context/GameContext'
import { useGame } from '../../context/GameContext'

export default function FrequencyControls() {
  const { sliders, setSliderValue, validateFrequency, gameState, unlockAnimations } = useGame()
  const canInteract = Boolean(gameState.puzzleProgress?.sound?.solved)
  const isPulsing = Boolean(unlockAnimations?.locks?.frequency)
  
  const [dragging, setDragging] = useState(null)
  const containerRefs = useRef({})

  const handlePointerDown = (e, key) => {
    if (!canInteract) return
    setDragging(key)
    updateValue(e, key)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e, key) => {
    if (dragging === key) {
      updateValue(e, key)
    }
  }

  const handlePointerUp = (e) => {
    if (dragging) {
      validateFrequency()
      setDragging(null)
    }
  }

  const updateValue = (e, key) => {
    const ref = containerRefs.current[key]
    if (!ref) return
    
    const rect = ref.getBoundingClientRect()
    const height = rect.height
    const bottom = rect.bottom
    const clientY = e.clientY
    
    let percentage = (bottom - clientY) / height
    percentage = Math.max(0, Math.min(1, percentage))
    
    setSliderValue(key, percentage)
  }

  return (
    <section
      className={`relative overflow-hidden w-full h-full flex flex-col ${
        isPulsing ? 'glow-success unlock-pulse' : ''
      }`}
    >
      <div className="flex items-center gap-2 mb-2 shrink-0">
        <div className="w-6 h-6 rounded-lg bg-purple-glow/20 flex items-center justify-center">
          <span className="text-xs">📡</span>
        </div>
        <h3 className="text-sm font-semibold text-white">Frecuencia</h3>
      </div>
      
      {!canInteract && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 text-center px-4 text-xs text-muted font-mono rounded-lg backdrop-blur-sm">
          <span>Completa Secuencia Resonante primero</span>
        </div>
      )}
      
      <div className="flex-1 flex items-center justify-center gap-6 px-4">
        {['f1', 'f2', 'f3'].map((key) => {
          const value = sliders[key]
          const target = TARGETS[key]
          const distance = Math.abs(value - target)
          const proximity = Math.max(0, 1 - distance / 0.15)
          
          return (
            <div key={key} className="flex flex-col items-center gap-3 h-full justify-center py-2">
              {/* Value Display */}
              <div className={`text-xs font-mono transition-colors duration-200 ${
                proximity > 0.8 ? 'text-success font-bold' : 
                proximity > 0.5 ? 'text-purple-glow font-semibold' : 
                'text-subtle'
              }`}>
                {(value * 100).toFixed(0)}%
              </div>

              {/* Vertical Bar Container */}
              <div 
                ref={el => containerRefs.current[key] = el}
                className={`relative w-16 flex-1 bg-black/40 rounded-2xl overflow-hidden border border-white/10 cursor-pointer group touch-none ${
                  !canInteract ? 'opacity-50 cursor-not-allowed' : 'hover:border-white/30'
                }`}
                onPointerDown={(e) => handlePointerDown(e, key)}
                onPointerMove={(e) => handlePointerMove(e, key)}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              >
                {/* Segmented Overlay (creates the gaps) */}
                <div className="absolute inset-0 z-10 pointer-events-none" 
                     style={{ 
                       backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 6px, rgba(0,0,0,0.8) 6px, rgba(0,0,0,0.8) 8px)',
                       backgroundSize: '100% 100%' 
                     }} 
                />

                {/* Fill Bar */}
                <div 
                  className={`absolute bottom-0 left-0 right-0 transition-all duration-100 ease-out ${
                     proximity > 0.8 ? 'bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.6)]' : 
                     proximity > 0.5 ? 'bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.6)]' : 
                     'bg-purple-900/60'
                  }`}
                  style={{ height: `${value * 100}%` }}
                >
                   {/* Top Glow (Thumb) */}
                   <div className="absolute top-0 left-0 right-0 h-1 bg-white shadow-[0_0_10px_white] z-20" />
                </div>
              </div>

              {/* Label */}
              <div className="text-[10px] text-subtle font-mono uppercase tracking-wider">
                {key.toUpperCase()}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
