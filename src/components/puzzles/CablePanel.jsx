import React, { useEffect, useRef, useState } from 'react'
import { useGame } from '../../context/GameContext'

export default function CablePanel() {
  const { plateConnections, connectPlate, plateOpen, setPlateOpen, gameState, unlockAnimations } = useGame()
  const plateRef = useRef(null)
  const originsRef = useRef({})
  const destinationsRef = useRef({})
  const [cablePosition, setCablePosition] = useState({})
  const [dragState, setDragState] = useState({ isDragging: false, source: null, color: null })
  const canInteract = Boolean(
    gameState.puzzleProgress?.sound?.solved && gameState.puzzleProgress?.cipher?.solved,
  )
  const isPulsing = Boolean(unlockAnimations?.locks?.wiring)

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        setPlateOpen(false)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [setPlateOpen])

  useEffect(() => {
    function updatePositions() {
      const plate = plateRef.current
      if (!plate) return
      const plateRect = plate.getBoundingClientRect()
      const next = {}

      ;['R', 'A', 'Y'].forEach((key) => {
        const src = originsRef.current[key]
        const destKey = plateConnections[key]
        const dest = destKey ? destinationsRef.current[destKey] : null
        if (!src || !dest) return

        const srcRect = src.getBoundingClientRect()
        const destRect = dest.getBoundingClientRect()
        
        // Calculate center points
        const srcCenterX = srcRect.left + srcRect.width / 2 - plateRect.left
        const srcCenterY = srcRect.top + srcRect.height / 2 - plateRect.top
        const destCenterX = destRect.left + destRect.width / 2 - plateRect.left
        const destCenterY = destRect.top + destRect.height / 2 - plateRect.top
        
        next[key] = {
          x1: srcCenterX,
          y1: srcCenterY,
          x2: destCenterX,
          y2: destCenterY,
        }
      })

      setCablePosition(next)
    }

    updatePositions()
    window.addEventListener('resize', updatePositions)
    return () => window.removeEventListener('resize', updatePositions)
  }, [plateConnections])

  const handleDragStart = (event, source) => {
    if (!canInteract) return
    event.dataTransfer.setData('text/plain', source)
    const color = source === 'R' ? '#ef4444' : source === 'A' ? '#f59e0b' : '#facc15'
    setDragState({ isDragging: true, source, color })
  }

  const handleDragEnd = () => {
    setDragState({ isDragging: false, source: null, color: null })
  }

  const handleDrop = (event, target) => {
    event.preventDefault()
    if (!canInteract) return
    const source = event.dataTransfer.getData('text/plain')
    if (!source) return
    connectPlate(source, target)
    handleDragEnd()
  }

  return (
    <aside
      ref={plateRef}
      className={`bg-panel p-4 rounded-lg border border-border relative overflow-hidden flex-1 min-h-0 ${
        isPulsing ? 'glow-success unlock-pulse' : ''
      }`}
    >
      {!canInteract && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-center px-4 text-xs text-slate-300 font-mono">
          <span>Descifra el Buffer y estabiliza el sonido para acceder al panel de cables.</span>
        </div>
      )}
      <div className="flex gap-4 items-start h-full">
        <div className="w-1/2">
          <div className="mb-3 text-sm font-medium">Orígenes</div>
          <div className="flex flex-col gap-3">
            {['R', 'A', 'Y'].map((key) => {
              const isBeingDragged = dragState.isDragging && dragState.source === key
              return (
                <div
                  key={key}
                  draggable
                  onDragStart={(event) => handleDragStart(event, key)}
                  onDragEnd={handleDragEnd}
                  ref={(element) => (originsRef.current[key] = element)}
                  className={`flex items-center gap-2 cursor-grab hover:bg-zinc-800/50 p-2 rounded transition-all duration-200 ${
                    isBeingDragged ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
                  }`}
                >
                  <div
                    style={{ width: 24, height: 24, background: key === 'R' ? '#ef4444' : key === 'A' ? '#f59e0b' : '#facc15' }}
                    className={`rounded-full shadow-inner border border-white/10 transition-all duration-200 ${
                      isBeingDragged ? 'shadow-lg ring-2 ring-white/30' : ''
                    }`}
                  />
                  <div className="text-xs">Src {key}</div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="w-1/2">
          <div className="mb-3 text-sm font-medium">Destinos</div>
          <div className="flex flex-col gap-3">
            {['R', 'A', 'Y'].map((key) => {
              const isDropTarget = dragState.isDragging && dragState.source !== key
              return (
                <div
                  key={key}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => handleDrop(event, key)}
                  ref={(element) => (destinationsRef.current[key] = element)}
                  className={`flex items-center gap-2 hover:bg-zinc-800/50 p-2 rounded transition-all duration-200 ${
                    isDropTarget ? 'bg-zinc-700/70 ring-2 ring-blue-400/50' : ''
                  }`}
                >
                  <div className="text-xs">Dest {key}</div>
                  <div
                    style={{ width: 24, height: 24, background: key === 'R' ? '#ef4444' : key === 'A' ? '#f59e0b' : '#facc15' }}
                    className={`rounded-full shadow-lg border border-white/10 transition-all duration-200 ${
                      isDropTarget ? 'scale-110 shadow-xl' : 'scale-100'
                    }`}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
        {Object.entries(cablePosition).map(([key, position]) => {
          const color = plateConnections[key] === 'R' ? '#ef4444' : plateConnections[key] === 'A' ? '#f59e0b' : '#facc15'
          
          // Calculate proper curved path
          const dx = position.x2 - position.x1
          const dy = position.y2 - position.y1
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          // Create a natural curve that goes slightly downward
          const curvature = Math.min(distance * 0.4, 50)
          const cp1x = position.x1 + dx * 0.25
          const cp1y = position.y1 + curvature
          const cp2x = position.x2 - dx * 0.25
          const cp2y = position.y2 + curvature
          
          const pathD = `M ${position.x1} ${position.y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${position.x2} ${position.y2}`
          
          return (
            <g key={key}>
              {/* Cable glow/shadow */}
              <path
                d={pathD}
                stroke={color}
                strokeWidth={8}
                fill="none"
                strokeLinecap="round"
                opacity={0.2}
                filter="blur(3px)"
              />
              {/* Main cable */}
              <path
                d={pathD}
                stroke={color}
                strokeWidth={4}
                fill="none"
                strokeLinecap="round"
                opacity={0.9}
              />
              {/* Connection points */}
              <circle
                cx={position.x1}
                cy={position.y1}
                r={4}
                fill={color}
                stroke="white"
                strokeWidth={2}
                opacity={0.9}
              />
              <circle
                cx={position.x2}
                cy={position.y2}
                r={4}
                fill={color}
                stroke="white"
                strokeWidth={2}
                opacity={0.9}
              />
            </g>
          )
        })}
      </svg>

      {plateOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true">
          <div className="w-96 bg-panel p-4 rounded border border-border" tabIndex={-1}>
            <div className="flex justify-between items-center mb-2">
              <div className="font-semibold">Placa — Conectar cables</div>
              <button onClick={() => setPlateOpen(false)} className="text-sm">
                Cerrar
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="mb-1">Orígenes</div>
                <div className="flex flex-col gap-2">
                  <button className="px-2 py-1 bg-red-700 rounded" onClick={() => connectPlate('R', 'R')}>
                    Src R
                  </button>
                  <button className="px-2 py-1 bg-amber-600 rounded" onClick={() => connectPlate('A', 'A')}>
                    Src A
                  </button>
                  <button className="px-2 py-1 bg-yellow-400 rounded" onClick={() => connectPlate('Y', 'Y')}>
                    Src Y
                  </button>
                </div>
              </div>
              <div>
                <div className="mb-1">Destinos</div>
                <div className="flex flex-col gap-2">
                  <div className="px-2 py-1 bg-red-800 rounded">Dest R</div>
                  <div className="px-2 py-1 bg-amber-700 rounded">Dest A</div>
                  <div className="px-2 py-1 bg-yellow-500 rounded">Dest Y</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
