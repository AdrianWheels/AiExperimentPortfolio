import React, { useRef, useEffect, useState, useCallback, createContext, useContext } from 'react'
import { useGame } from '../../context/GameContext'

/**
 * Sistema completo de cables con física visual
 * Incluye: Provider, paneles de origen/destino, y SVG con física
 */

const CABLE_COLORS = {
  FURY: '#dc2626',
  JOY: '#fbbf24',
  SADNESS: '#7c3aed',
  FEAR: '#065f46',
  LOVE: '#ec4899',
  CALM: '#0ea5e9',
  ENVY: '#16a34a'
}

const SOURCES = [
  { id: 'FURY', label: 'Fu2Y_R4g3', color: CABLE_COLORS.FURY },
  { id: 'JOY', label: 'J0y_H4pp1', color: CABLE_COLORS.JOY },
  { id: 'SADNESS', label: 'S4dn3ss_7', color: CABLE_COLORS.SADNESS },
  { id: 'FEAR', label: 'F34r_X9', color: CABLE_COLORS.FEAR },
  { id: 'LOVE', label: 'L0v3_Amp4', color: CABLE_COLORS.LOVE },
  { id: 'CALM', label: 'C4lm_Z3n', color: CABLE_COLORS.CALM },
  { id: 'ENVY', label: '3nvy_Gr33n', color: CABLE_COLORS.ENVY },
]

const TARGETS = [
  { id: 'FEAR', label: 'T4rg3t_F34r', color: CABLE_COLORS.FEAR },
  { id: 'CALM', label: 'T4rg3t_C4lm', color: CABLE_COLORS.CALM },
  { id: 'ENVY', label: 'T4rg3t_3nvy', color: CABLE_COLORS.ENVY },
  { id: 'LOVE', label: 'T4rg3t_L0v3', color: CABLE_COLORS.LOVE },
  { id: 'SADNESS', label: 'T4rg3t_S4d', color: CABLE_COLORS.SADNESS },
  { id: 'JOY', label: 'T4rg3t_J0y', color: CABLE_COLORS.JOY },
  { id: 'FURY', label: 'T4rg3t_Fu2Y', color: CABLE_COLORS.FURY },
]

// Contexto para comunicación del sistema de cables
const CableBridgeContext = createContext(null)

export function useCableBridge() {
  return useContext(CableBridgeContext)
}

// Física del cable con Verlet integration
class CablePhysics {
  constructor(startX, startY, endX, endY, segments = 10) {
    this.segments = segments
    this.gravity = 0.5
    this.friction = 0.97
    this.stiffness = 0.85

    this.points = []
    this.oldPoints = []

    for (let i = 0; i <= segments; i++) {
      const t = i / segments
      const x = startX + (endX - startX) * t
      const y = startY + (endY - startY) * t + Math.sin(t * Math.PI) * 40
      this.points.push({ x, y })
      this.oldPoints.push({ x, y })
    }

    const dist = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2))
    this.segmentLength = dist / segments
  }

  setEndpoints(startX, startY, endX, endY) {
    this.points[0].x = startX
    this.points[0].y = startY
    this.points[this.points.length - 1].x = endX
    this.points[this.points.length - 1].y = endY
  }

  update() {
    // Verlet integration
    for (let i = 1; i < this.points.length - 1; i++) {
      const p = this.points[i]
      const old = this.oldPoints[i]

      const vx = (p.x - old.x) * this.friction
      const vy = (p.y - old.y) * this.friction

      old.x = p.x
      old.y = p.y

      p.x += vx
      p.y += vy + this.gravity
    }

    // Distance constraints
    for (let iter = 0; iter < 4; iter++) {
      for (let i = 0; i < this.points.length - 1; i++) {
        const p1 = this.points[i]
        const p2 = this.points[i + 1]

        const dx = p2.x - p1.x
        const dy = p2.y - p1.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist === 0) continue

        const diff = (this.segmentLength - dist) / dist
        const offsetX = dx * diff * 0.5 * this.stiffness
        const offsetY = dy * diff * 0.5 * this.stiffness

        if (i > 0) {
          p1.x -= offsetX
          p1.y -= offsetY
        }
        if (i < this.points.length - 2) {
          p2.x += offsetX
          p2.y += offsetY
        }
      }
    }
  }

  getPath() {
    if (this.points.length < 2) return ''

    let d = `M ${this.points[0].x} ${this.points[0].y}`

    for (let i = 1; i < this.points.length - 1; i++) {
      const p = this.points[i]
      const next = this.points[i + 1]
      const midX = (p.x + next.x) / 2
      const midY = (p.y + next.y) / 2
      d += ` Q ${p.x} ${p.y} ${midX} ${midY}`
    }

    const last = this.points[this.points.length - 1]
    d += ` L ${last.x} ${last.y}`

    return d
  }
}

// ============ PROVIDER PRINCIPAL ============
export function CableBridgeProvider({ children }) {
  const containerRef = useRef(null)
  const cablesRef = useRef({})
  const sourceRefs = useRef({})
  const targetRefs = useRef({})
  const animationRef = useRef(null)

  const [dragging, setDragging] = useState(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [, forceRender] = useState(0)

  const { plateConnections, connectPlate, gameState } = useGame()

  const canInteract = Boolean(
    gameState.puzzleProgress?.sound?.solved && gameState.puzzleProgress?.cipher?.solved
  )

  // Registrar refs de nodos
  const registerSource = useCallback((id, element) => {
    if (element) sourceRefs.current[id] = element
    else delete sourceRefs.current[id]
  }, [])

  const registerTarget = useCallback((id, element) => {
    if (element) targetRefs.current[id] = element
    else delete targetRefs.current[id]
  }, [])

  // Obtener posición relativa al container
  const getPos = useCallback((element, side = 'center') => {
    if (!element || !containerRef.current) return null
    const rect = element.getBoundingClientRect()
    const containerRect = containerRef.current.getBoundingClientRect()

    let x = rect.left - containerRect.left + rect.width / 2
    if (side === 'right') x = rect.right - containerRect.left
    if (side === 'left') x = rect.left - containerRect.left

    return { x, y: rect.top - containerRect.top + rect.height / 2 }
  }, [])

  // Iniciar drag
  const startDrag = useCallback((sourceId, event) => {
    if (!canInteract) return
    event.preventDefault()

    const el = sourceRefs.current[sourceId]
    const pos = getPos(el, 'center') // Changed to 'center'

    if (pos && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect()
      setDragging({
        sourceId,
        startX: pos.x,
        startY: pos.y,
        color: CABLE_COLORS[sourceId]
      })
      setMousePos({
        x: event.clientX - containerRect.left,
        y: event.clientY - containerRect.top
      })
    }
  }, [canInteract, getPos])

  // Mouse move
  const handleMouseMove = useCallback((e) => {
    if (!dragging || !containerRef.current) return
    const containerRect = containerRef.current.getBoundingClientRect()
    setMousePos({
      x: e.clientX - containerRect.left,
      y: e.clientY - containerRect.top
    })
  }, [dragging])

  // Mouse up - conectar
  const handleMouseUp = useCallback(() => {
    if (!dragging) return

    let closestTarget = null
    let minDist = 40

    Object.entries(targetRefs.current).forEach(([targetId, el]) => {
      const pos = getPos(el, 'center') // Changed to 'center'
      if (pos) {
        const dist = Math.sqrt(
          Math.pow(mousePos.x - pos.x, 2) +
          Math.pow(mousePos.y - pos.y, 2)
        )
        if (dist < minDist) {
          minDist = dist
          closestTarget = targetId
        }
      }
    })

    if (closestTarget) {
      connectPlate(dragging.sourceId, closestTarget)
    }

    setDragging(null)
  }, [dragging, mousePos, getPos, connectPlate])

  // Actualizar cables según conexiones
  useEffect(() => {
    Object.entries(plateConnections).forEach(([sourceId, targetId]) => {
      if (!targetId) return

      const sourceEl = sourceRefs.current[sourceId]
      const targetEl = targetRefs.current[targetId]

      if (sourceEl && targetEl) {
        const startPos = getPos(sourceEl, 'center') // Changed to 'center'
        const endPos = getPos(targetEl, 'center') // Changed to 'center'

        if (startPos && endPos) {
          const key = `${sourceId}-${targetId}`
          if (!cablesRef.current[key]) {
            cablesRef.current[key] = new CablePhysics(
              startPos.x, startPos.y,
              endPos.x, endPos.y,
              10
            )
            cablesRef.current[key].color = CABLE_COLORS[sourceId]
          }
        }
      }
    })

    // Eliminar cables desconectados
    Object.keys(cablesRef.current).forEach(key => {
      const [sourceId, targetId] = key.split('-')
      if (plateConnections[sourceId] !== targetId) {
        delete cablesRef.current[key]
      }
    })
  }, [plateConnections, getPos])

  // Loop de animación
  useEffect(() => {
    const animate = () => {
      Object.entries(cablesRef.current).forEach(([key, cable]) => {
        const [sourceId, targetId] = key.split('-')
        const sourceEl = sourceRefs.current[sourceId]
        const targetEl = targetRefs.current[targetId]

        if (sourceEl && targetEl) {
          const startPos = getPos(sourceEl, 'center') // Changed to 'center'
          const endPos = getPos(targetEl, 'center') // Changed to 'center'

          if (startPos && endPos) {
            cable.setEndpoints(startPos.x, startPos.y, endPos.x, endPos.y)
            cable.update()
          }
        }
      })

      forceRender(n => n + 1)
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationRef.current)
  }, [getPos])

  // Path para cable siendo arrastrado
  const getDraggingPath = () => {
    if (!dragging) return ''
    const { startX, startY } = dragging
    const { x: endX, y: endY } = mousePos
    const midX = (startX + endX) / 2
    const sag = Math.min(80, Math.abs(endX - startX) * 0.3 + 30)
    const midY = Math.max(startY, endY) + sag
    return `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`
  }

  const contextValue = {
    registerSource,
    registerTarget,
    startDrag,
    dragging,
    canInteract
  }

  return (
    <CableBridgeContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        className="cable-bridge-container"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setDragging(null)}
        style={{ position: 'relative' }}
      >
        {children}

        {/* SVG overlay para cables */}
        <svg
          className="cable-bridge-svg"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 100
          }}
        >
          <defs>
            <filter id="cable-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Cables conectados */}
          {Object.entries(cablesRef.current).map(([key, cable]) => (
            <g key={key}>
              <path
                d={cable.getPath()}
                fill="none"
                stroke={cable.color}
                strokeWidth="10"
                strokeLinecap="round"
                opacity="0.3"
                filter="url(#cable-glow)"
              />
              <path
                d={cable.getPath()}
                fill="none"
                stroke={cable.color}
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d={cable.getPath()}
                fill="none"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </g>
          ))}

          {/* Cable siendo arrastrado */}
          {dragging && (
            <g>
              <path
                d={getDraggingPath()}
                fill="none"
                stroke={dragging.color}
                strokeWidth="8"
                strokeLinecap="round"
                opacity="0.4"
                filter="url(#cable-glow)"
              />
              <path
                d={getDraggingPath()}
                fill="none"
                stroke={dragging.color}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="10 5"
              />
              <circle
                cx={mousePos.x}
                cy={mousePos.y}
                r="8"
                fill={dragging.color}
                opacity="0.8"
              />
            </g>
          )}
        </svg>
      </div>
    </CableBridgeContext.Provider>
  )
}

// ============ PANEL IZQUIERDO - SOURCES ============
export function CablePanelLeft() {
  const { plateConnections, gameState } = useGame()
  const bridgeCtx = useCableBridge()

  const canInteract = Boolean(
    gameState.puzzleProgress?.sound?.solved && gameState.puzzleProgress?.cipher?.solved
  )

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-lg bg-accent/20 flex items-center justify-center">
          <span className="text-xs">⚡</span>
        </div>
        <h3 className="text-sm font-semibold text-white">Origen</h3>
      </div>

      {!canInteract && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10 rounded-xl">
          <p className="text-xs text-muted text-center px-2">Descifra + Sonido</p>
        </div>
      )}

      <div className="flex-1 flex flex-col gap-1">
        {SOURCES.map((source) => {
          const isConnected = plateConnections[source.id]
          const isDragging = bridgeCtx?.dragging?.sourceId === source.id

          return (
            <div
              key={source.id}
              onMouseDown={(e) => bridgeCtx?.startDrag(source.id, e)}
              className={`
                flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all text-xs select-none
                ${canInteract ? 'cursor-grab active:cursor-grabbing' : 'cursor-not-allowed'}
                ${isDragging ? 'bg-white/20 scale-105' : 'hover:bg-white/5'}
                ${isConnected ? 'opacity-60' : ''}
              `}
            >
              <div
                ref={(el) => bridgeCtx?.registerSource(source.id, el)}
                className={`
                  w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center
                  ${isDragging ? 'scale-125 shadow-lg' : ''}
                `}
                style={{
                  backgroundColor: isConnected ? source.color : 'transparent',
                  borderColor: source.color,
                  boxShadow: isDragging ? `0 0 12px ${source.color}` : 'none'
                }}
              >
                <span className="text-[8px]">●</span>
              </div>
              <span className="font-mono text-muted truncate flex-1">{source.label}</span>
            </div>
          )
        })}
      </div>

      <div className="text-[10px] text-subtle mt-2 text-center">
        Arrastra desde ● al destino
      </div>
    </div>
  )
}

// ============ PANEL DERECHO - TARGETS ============
export function CablePanelRight() {
  const { plateConnections, gameState } = useGame()
  const bridgeCtx = useCableBridge()

  const canInteract = Boolean(
    gameState.puzzleProgress?.sound?.solved && gameState.puzzleProgress?.cipher?.solved
  )

  const getConnectedSource = (targetId) => {
    return Object.entries(plateConnections).find(([src, tgt]) => tgt === targetId)?.[0]
  }

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-lg bg-purple-glow/20 flex items-center justify-center">
          <span className="text-xs">🎯</span>
        </div>
        <h3 className="text-sm font-semibold text-white">Destino</h3>
      </div>

      {!canInteract && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10 rounded-xl">
          <p className="text-xs text-muted text-center px-2">Descifra + Sonido</p>
        </div>
      )}

      <div className="flex-1 flex flex-col gap-1">
        {TARGETS.map((target) => {
          const connectedSource = getConnectedSource(target.id)
          const isDropTarget = bridgeCtx?.dragging && !connectedSource

          return (
            <div
              key={target.id}
              className={`
                flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg transition-all text-xs
                ${isDropTarget ? 'bg-purple-glow/20 ring-1 ring-purple-glow/40 scale-105' : 'hover:bg-white/5'}
              `}
            >
              <div className="flex items-center gap-2 flex-1 overflow-hidden">
                <span className="font-mono text-muted truncate">{target.label}</span>
                {connectedSource && (
                  <span
                    className="text-[10px] font-mono"
                    style={{ color: CABLE_COLORS[connectedSource] }}
                  >
                    ← {connectedSource.slice(0, 3)}
                  </span>
                )}
              </div>

              <div
                ref={(el) => bridgeCtx?.registerTarget(target.id, el)}
                className={`
                  w-4 h-4 rounded-full border-2 border-dashed transition-all flex items-center justify-center shrink-0
                  ${isDropTarget ? 'animate-pulse border-solid' : ''}
                `}
                style={{
                  backgroundColor: connectedSource ? CABLE_COLORS[connectedSource] : 'transparent',
                  borderColor: target.color
                }}
              >
                <span className="text-[8px]">○</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="text-[10px] text-subtle mt-2 text-center">
        Suelta sobre ○ para conectar
      </div>
    </div>
  )
}

export default CableBridgeProvider
