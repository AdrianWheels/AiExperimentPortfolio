import React, { useEffect, useRef, useState } from 'react'
import { useGame } from '../../context/GameContext'
import WireSystem from './WireSystem'
import WireNode from './WireNode'

export default function CablePanel() {
  const { plateConnections, connectPlate, plateOpen, setPlateOpen, gameState, unlockAnimations } = useGame()
  const plateRef = useRef(null)
  const [nodes] = useState([
    {
      id: 'src-R',
      x: 80,
      y: 80,
      label: 'Src R',
      color: '#ef4444',
      inputs: [],
      outputs: ['out1']
    },
    {
      id: 'src-A',
      x: 80,
      y: 140,
      label: 'Src A',
      color: '#f59e0b',
      inputs: [],
      outputs: ['out1']
    },
    {
      id: 'src-Y',
      x: 80,
      y: 200,
      label: 'Src Y',
      color: '#facc15',
      inputs: [],
      outputs: ['out1']
    },
    {
      id: 'dest-R',
      x: 220,
      y: 80,
      label: 'Dest R',
      color: '#ef4444',
      inputs: ['in1'],
      outputs: []
    },
    {
      id: 'dest-A',
      x: 220,
      y: 140,
      label: 'Dest A',
      color: '#f59e0b',
      inputs: ['in1'],
      outputs: []
    },
    {
      id: 'dest-Y',
      x: 220,
      y: 200,
      label: 'Dest Y',
      color: '#facc15',
      inputs: ['in1'],
      outputs: []
    }
  ])
  
  const [connections, setConnections] = useState([])
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

  // Sincronizar conexiones con el estado del juego
  useEffect(() => {
    const newConnections = Object.entries(plateConnections)
      .filter(([source, target]) => target)
      .map(([source, target]) => ({
        from: {
          node: `src-${source}`,
          port: 'out1'
        },
        to: {
          node: `dest-${target}`,
          port: 'in1'
        }
      }))
    
    setConnections(newConnections)
  }, [plateConnections])

  const handleConnect = (connection) => {
    if (!canInteract) return
    
    // Extraer el tipo de fuente y destino de los IDs de nodos
    const sourceType = connection.from.node.replace('src-', '')
    const targetType = connection.to.node.replace('dest-', '')
    
    connectPlate(sourceType, targetType)
  }

  const handleDisconnect = (connection) => {
    if (!canInteract) return
    
    const sourceType = connection.from.node.replace('src-', '')
    connectPlate(sourceType, null)
  }

  return (
    <aside
      ref={plateRef}
      className={`bg-panel p-4 rounded-lg border border-border relative overflow-hidden flex-1 min-h-0 ${
        isPulsing ? 'glow-success unlock-pulse' : ''
      }`}
    >
      {!canInteract && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-center px-4 text-xs text-slate-300 font-mono z-20">
          <span>Descifra el Buffer y estabiliza el sonido para acceder al panel de cables.</span>
        </div>
      )}
      
      <div className="relative w-full h-full" style={{ minHeight: '280px' }}>
        {/* Nodos del sistema de cables */}
        {nodes.map(node => (
          <WireNode
            key={node.id}
            id={node.id}
            x={node.x}
            y={node.y}
            label={node.label}
            color={node.color}
            inputs={node.inputs}
            outputs={node.outputs}
            className={!canInteract ? 'opacity-50' : ''}
          />
        ))}
        
        {/* Sistema de cables con física */}
        <WireSystem
          nodes={nodes}
          connections={connections}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          interactive={canInteract}
          physics={{
            gravity: 0.15,
            stiffness: 0.9,
            segments: 12
          }}
        />
        
        {/* Instrucciones */}
        <div className="absolute bottom-2 left-2 text-xs text-slate-400 font-mono">
          {canInteract ? 'Arrastra desde puertos de salida (●) a puertos de entrada (○)' : 'Panel bloqueado'}
        </div>
      </div>

      {plateOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-30" role="dialog" aria-modal="true">
          <div className="w-96 bg-panel p-4 rounded border border-border" tabIndex={-1}>
            <div className="flex justify-between items-center mb-2">
              <div className="font-semibold">Placa — Conectar cables</div>
              <button onClick={() => setPlateOpen(false)} className="text-sm hover:text-accent transition-colors">
                Cerrar
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="mb-2 text-sm font-medium">Orígenes</div>
                <div className="flex flex-col gap-2">
                  <button 
                    className="px-3 py-2 bg-red-700 hover:bg-red-600 rounded transition-colors text-sm" 
                    onClick={() => connectPlate('R', 'R')}
                  >
                    Src R
                  </button>
                  <button 
                    className="px-3 py-2 bg-amber-600 hover:bg-amber-500 rounded transition-colors text-sm" 
                    onClick={() => connectPlate('A', 'A')}
                  >
                    Src A
                  </button>
                  <button 
                    className="px-3 py-2 bg-yellow-500 hover:bg-yellow-400 rounded transition-colors text-sm" 
                    onClick={() => connectPlate('Y', 'Y')}
                  >
                    Src Y
                  </button>
                </div>
              </div>
              <div>
                <div className="mb-2 text-sm font-medium">Destinos</div>
                <div className="flex flex-col gap-2">
                  <div className="px-3 py-2 bg-red-800 rounded text-sm opacity-60">Dest R</div>
                  <div className="px-3 py-2 bg-amber-700 rounded text-sm opacity-60">Dest A</div>
                  <div className="px-3 py-2 bg-yellow-600 rounded text-sm opacity-60">Dest Y</div>
                </div>
              </div>
            </div>
            <div className="mt-4 text-xs text-slate-400">
              Conexiones actuales: {Object.keys(plateConnections).filter(k => plateConnections[k]).length}/3
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
