import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { TARGETS } from '../../context/GameContext'
import { useGame } from '../../context/GameContext'

// Configuración de los sliders
const SLIDER_KEYS = ['f1', 'f2', 'f3']
const SLIDER_LABELS = { f1: 'α', f2: 'β', f3: 'γ' }
const SLIDER_COLORS = {
  f1: { color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.2)' },
  f2: { color: '#34d399', bg: 'rgba(52, 211, 153, 0.2)' },
  f3: { color: '#f472b6', bg: 'rgba(244, 114, 182, 0.2)' }
}

// Paso de ajuste fino
const FINE_STEP = 0.025

export default function FrequencyControls() {
  const { sliders, setSliderValue, validateFrequency, gameState, unlockAnimations } = useGame()
  const canInteract = Boolean(gameState.puzzleProgress?.sound?.solved)
  const isPulsing = Boolean(unlockAnimations?.locks?.frequency)
  const solved = Boolean(gameState.puzzleProgress?.frequency?.solved)

  const [dragging, setDragging] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const containerRefs = useRef({})
  const horizontalRefs = useRef({})

  // Detectar tamaño de pantalla
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Calcular proximidad de cada slider - memoizado para rendimiento
  const proximities = useMemo(() => {
    return SLIDER_KEYS.reduce((acc, key) => {
      const value = sliders[key]
      const target = TARGETS[key]
      const distance = Math.abs(value - target)
      acc[key] = Math.max(0, 1 - distance / 0.15)
      return acc
    }, {})
  }, [sliders])

  // Handlers optimizados con useCallback
  const handlePointerDown = useCallback((e, key) => {
    if (!canInteract) return
    setDragging(key)

    // Calcular valor según orientación
    const ref = isMobile ? horizontalRefs.current[key] : containerRefs.current[key]
    if (!ref) return

    const rect = ref.getBoundingClientRect()
    let percentage

    if (isMobile) {
      // Horizontal: izquierda = 0, derecha = 1
      percentage = (e.clientX - rect.left) / rect.width
    } else {
      // Vertical: abajo = 0, arriba = 1
      percentage = (rect.bottom - e.clientY) / rect.height
    }

    percentage = Math.max(0, Math.min(1, percentage))
    setSliderValue(key, percentage)
    e.currentTarget.setPointerCapture(e.pointerId)
  }, [canInteract, isMobile, setSliderValue])

  const handlePointerMove = useCallback((e, key) => {
    if (dragging !== key) return

    const ref = isMobile ? horizontalRefs.current[key] : containerRefs.current[key]
    if (!ref) return

    const rect = ref.getBoundingClientRect()
    let percentage

    if (isMobile) {
      percentage = (e.clientX - rect.left) / rect.width
    } else {
      percentage = (rect.bottom - e.clientY) / rect.height
    }

    percentage = Math.max(0, Math.min(1, percentage))
    setSliderValue(key, percentage)
  }, [dragging, isMobile, setSliderValue])

  const handlePointerUp = useCallback(() => {
    if (dragging) {
      validateFrequency()
      setDragging(null)
    }
  }, [dragging, validateFrequency])

  // Ajuste fino con botones (+/-)
  const handleAdjust = useCallback((key, direction) => {
    if (!canInteract) return
    const currentValue = sliders[key]
    const newValue = Math.max(0, Math.min(1, currentValue + (direction * FINE_STEP)))
    setSliderValue(key, newValue)
    validateFrequency()
  }, [canInteract, sliders, setSliderValue, validateFrequency])

  // Estado resuelto
  if (solved) {
    return (
      <section className="flex flex-col gap-3 h-full p-3 sm:p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl backdrop-blur-sm">
        <header className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Frecuencia</h3>
          <span className="text-[10px] uppercase tracking-wide text-success">✓ Calibrado</span>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-sm text-success font-medium">Señal Estabilizada</div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      className={`flex flex-col gap-3 sm:gap-4 h-full p-3 sm:p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl backdrop-blur-sm ${isPulsing ? 'glow-success unlock-pulse' : ''
        }`}
    >
      {/* Header */}
      <header className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-purple-glow/20 flex items-center justify-center">
            <span className="text-xs">📡</span>
          </div>
          <h3 className="text-sm font-bold text-zinc-100">Frecuencia</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          <span className="text-[10px] uppercase tracking-wider text-blue-400 font-medium">
            {canInteract ? 'Activo' : 'Bloqueado'}
          </span>
        </div>
      </header>

      {/* Overlay de bloqueo */}
      {!canInteract && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 text-center px-4 text-xs text-muted font-mono rounded-lg backdrop-blur-sm">
          <span>Completa Secuencia Resonante primero</span>
        </div>
      )}

      {/* MOBILE: Layout horizontal con sliders y botones */}
      <div className="sm:hidden flex flex-col gap-3 flex-1">
        {SLIDER_KEYS.map((key) => {
          const value = sliders[key]
          const proximity = proximities[key]
          const colors = SLIDER_COLORS[key]

          return (
            <div key={key} className="flex items-center gap-2">
              {/* Label */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold border-2"
                style={{
                  backgroundColor: colors.bg,
                  borderColor: colors.color,
                  boxShadow: proximity > 0.8 ? `0 0 15px ${colors.color}` : 'none'
                }}
              >
                <span style={{ color: colors.color }}>{SLIDER_LABELS[key]}</span>
              </div>

              {/* Botón - */}
              <button
                onClick={() => handleAdjust(key, -1)}
                disabled={!canInteract}
                className="w-8 h-8 rounded-lg bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:bg-zinc-700 hover:text-white active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-lg font-bold">−</span>
              </button>

              {/* Slider horizontal */}
              <div
                ref={el => horizontalRefs.current[key] = el}
                className={`relative flex-1 h-10 bg-black/40 rounded-xl overflow-hidden border border-white/10 cursor-pointer touch-none ${!canInteract ? 'opacity-50 cursor-not-allowed' : 'hover:border-white/30'
                  }`}
                onPointerDown={(e) => handlePointerDown(e, key)}
                onPointerMove={(e) => handlePointerMove(e, key)}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              >
                {/* Segmented overlay */}
                <div
                  className="absolute inset-0 z-10 pointer-events-none"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(to right, transparent 0px, transparent 12px, rgba(0,0,0,0.6) 12px, rgba(0,0,0,0.6) 14px)',
                  }}
                />

                {/* Fill Bar */}
                <div
                  className="absolute top-0 bottom-0 left-0 transition-all duration-75 ease-out"
                  style={{
                    width: `${value * 100}%`,
                    backgroundColor: proximity > 0.8 ? '#34d399' : proximity > 0.5 ? colors.color : `${colors.color}60`,
                    boxShadow: proximity > 0.5 ? `0 0 15px ${proximity > 0.8 ? '#34d399' : colors.color}80` : 'none'
                  }}
                >
                  {/* Thumb */}
                  <div
                    className="absolute right-0 top-0 bottom-0 w-1.5 bg-white shadow-[0_0_8px_white] z-20"
                  />
                </div>
              </div>

              {/* Botón + */}
              <button
                onClick={() => handleAdjust(key, 1)}
                disabled={!canInteract}
                className="w-8 h-8 rounded-lg bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:bg-zinc-700 hover:text-white active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-lg font-bold">+</span>
              </button>

              {/* Value */}
              <div className={`w-12 text-right text-xs font-mono transition-colors duration-200 ${proximity > 0.8 ? 'text-success font-bold' :
                  proximity > 0.5 ? 'text-blue-400 font-semibold' :
                    'text-zinc-500'
                }`}>
                {(value * 100).toFixed(0)}%
              </div>
            </div>
          )
        })}
      </div>

      {/* DESKTOP: Layout vertical con sliders altos */}
      <div className="hidden sm:flex flex-1 items-center justify-center gap-6 px-4 min-h-0">
        {SLIDER_KEYS.map((key) => {
          const value = sliders[key]
          const proximity = proximities[key]
          const colors = SLIDER_COLORS[key]

          return (
            <div key={key} className="flex flex-col items-center gap-3 h-full justify-center py-2">
              {/* Value Display */}
              <div className={`text-xs font-mono transition-colors duration-200 ${proximity > 0.8 ? 'text-success font-bold' :
                  proximity > 0.5 ? 'text-purple-glow font-semibold' :
                    'text-subtle'
                }`}>
                {(value * 100).toFixed(0)}%
              </div>

              {/* Vertical Bar Container */}
              <div
                ref={el => containerRefs.current[key] = el}
                className={`relative w-14 flex-1 bg-black/40 rounded-2xl overflow-hidden border border-white/10 cursor-pointer group touch-none ${!canInteract ? 'opacity-50 cursor-not-allowed' : 'hover:border-white/30'
                  }`}
                onPointerDown={(e) => handlePointerDown(e, key)}
                onPointerMove={(e) => handlePointerMove(e, key)}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              >
                {/* Segmented Overlay */}
                <div
                  className="absolute inset-0 z-10 pointer-events-none"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 8px, rgba(0,0,0,0.7) 8px, rgba(0,0,0,0.7) 10px)',
                  }}
                />

                {/* Fill Bar */}
                <div
                  className="absolute bottom-0 left-0 right-0 transition-all duration-75 ease-out"
                  style={{
                    height: `${value * 100}%`,
                    backgroundColor: proximity > 0.8 ? '#34d399' : proximity > 0.5 ? colors.color : `${colors.color}40`,
                    boxShadow: proximity > 0.5 ? `0 0 20px ${proximity > 0.8 ? '#34d399' : colors.color}80` : 'none'
                  }}
                >
                  {/* Thumb */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-white shadow-[0_0_10px_white] z-20" />
                </div>
              </div>

              {/* Label with icon */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-base font-bold border-2 transition-all"
                style={{
                  backgroundColor: colors.bg,
                  borderColor: colors.color,
                  boxShadow: proximity > 0.8 ? `0 0 12px ${colors.color}` : 'none'
                }}
              >
                <span style={{ color: colors.color }}>{SLIDER_LABELS[key]}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Instrucciones en móvil */}
      <div className="sm:hidden text-center text-[10px] text-zinc-500 shrink-0">
        Desliza o usa +/− para ajustar
      </div>
    </section>
  )
}
