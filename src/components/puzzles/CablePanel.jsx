import React, { useEffect, useRef, useState } from 'react'
import { useGame } from '../../context/GameContext'

export default function CablePanel() {
  const { plateConnections, connectPlate, plateOpen, setPlateOpen } = useGame()
  const plateRef = useRef(null)
  const originsRef = useRef({})
  const destinationsRef = useRef({})
  const [cablePosition, setCablePosition] = useState({})

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
        next[key] = {
          x1: srcRect.right - plateRect.left - 8,
          y1: srcRect.top + srcRect.height / 2 - plateRect.top,
          x2: destRect.left - plateRect.left + 8,
          y2: destRect.top + destRect.height / 2 - plateRect.top,
        }
      })

      setCablePosition(next)
    }

    updatePositions()
    window.addEventListener('resize', updatePositions)
    return () => window.removeEventListener('resize', updatePositions)
  }, [plateConnections])

  const handleDrop = (event, target) => {
    event.preventDefault()
    const source = event.dataTransfer.getData('text/plain')
    if (!source) return
    connectPlate(source, target)
  }

  return (
    <aside ref={plateRef} className="bg-panel p-4 rounded-lg border border-border relative">
      <div className="flex gap-4 items-start h-full">
        <div className="w-1/2">
          <div className="mb-3 text-sm font-medium">Orígenes</div>
          <div className="flex flex-col gap-3">
            {['R', 'A', 'Y'].map((key) => (
              <div
                key={key}
                draggable
                onDragStart={(event) => event.dataTransfer.setData('text/plain', key)}
                ref={(element) => (originsRef.current[key] = element)}
                className="flex items-center gap-2 cursor-grab hover:bg-zinc-800/50 p-2 rounded transition-colors"
              >
                <div
                  style={{ width: 24, height: 24, background: key === 'R' ? '#ef4444' : key === 'A' ? '#f59e0b' : '#facc15' }}
                  className="rounded-full shadow-inner border border-white/10"
                />
                <div className="text-xs">Src {key}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-1/2">
          <div className="mb-3 text-sm font-medium">Destinos</div>
          <div className="flex flex-col gap-3">
            {['R', 'A', 'Y'].map((key) => (
              <div
                key={key}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => handleDrop(event, key)}
                ref={(element) => (destinationsRef.current[key] = element)}
                className="flex items-center gap-2 hover:bg-zinc-800/50 p-2 rounded transition-colors"
              >
                <div className="text-xs">Dest {key}</div>
                <div
                  style={{ width: 24, height: 24, background: key === 'R' ? '#ef4444' : key === 'A' ? '#f59e0b' : '#facc15' }}
                  className="rounded-full shadow-lg border border-white/10"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
        {Object.entries(cablePosition).map(([key, position]) => (
          <line
            key={key}
            x1={position.x1}
            y1={position.y1}
            x2={position.x2}
            y2={position.y2}
            stroke={
              plateConnections[key] === 'R'
                ? '#ef4444'
                : plateConnections[key] === 'A'
                ? '#f59e0b'
                : '#facc15'
            }
            strokeWidth={4}
            strokeLinecap="round"
          />
        ))}
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
