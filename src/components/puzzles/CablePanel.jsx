import React, { useEffect, useRef, useState } from 'react'
import { useGame } from '../../context/GameContext'
import WireSystem from './WireSystem'
import WireNode from './WireNode'

export default function CablePanel() {
  const { plateConnections, connectPlate, plateOpen, setPlateOpen, gameState, unlockAnimations } = useGame()
  const plateRef = useRef(null)
  const [nodes] = useState([
    // Nodos de origen - extremo izquierdo absoluto
    {
      id: 'src-FURY',
      x: 10,
      y: 50,
      label: 'Fu2Y_R4g3',
      color: '#dc2626', // Rojo intenso
      inputs: [],
      outputs: ['out1']
    },
    {
      id: 'src-JOY',
      x: 15,
      y: 90,
      label: 'J0y_H4pp1',
      color: '#fbbf24', // Amarillo brillante
      inputs: [],
      outputs: ['out1']
    },
    {
      id: 'src-SADNESS',
      x: 5,
      y: 130,
      label: 'S4dn3ss_7',
      color: '#7c3aed', // Morado profundo
      inputs: [],
      outputs: ['out1']
    },
    {
      id: 'src-FEAR',
      x: 20,
      y: 170,
      label: 'F34r_X9',
      color: '#065f46', // Verde oscuro
      inputs: [],
      outputs: ['out1']
    },
    {
      id: 'src-LOVE',
      x: 0,
      y: 210,
      label: 'L0v3_Amp4',
      color: '#ec4899', // Rosa intenso
      inputs: [],
      outputs: ['out1']
    },
    {
      id: 'src-CALM',
      x: 25,
      y: 250,
      label: 'C4lm_Z3n',
      color: '#0ea5e9', // Azul sereno
      inputs: [],
      outputs: ['out1']
    },
    {
      id: 'src-ENVY',
      x: 12,
      y: 290,
      label: '3nvy_Gr33n',
      color: '#16a34a', // Verde ácido
      inputs: [],
      outputs: ['out1']
    },
    // Nodos de destino - extremo derecho absoluto
    {
      id: 'dest-FEAR',
      x: 580,
      y: 50,
      label: 'T4rg3t_F34r',
      color: '#065f46',
      inputs: ['in1'],
      outputs: []
    },
    {
      id: 'dest-CALM',
      x: 590,
      y: 90,
      label: 'T4rg3t_C4lm',
      color: '#0ea5e9',
      inputs: ['in1'],
      outputs: []
    },
    {
      id: 'dest-ENVY',
      x: 570,
      y: 130,
      label: 'T4rg3t_3nvy',
      color: '#16a34a',
      inputs: ['in1'],
      outputs: []
    },
    {
      id: 'dest-LOVE',
      x: 600,
      y: 170,
      label: 'T4rg3t_L0v3',
      color: '#ec4899',
      inputs: ['in1'],
      outputs: []
    },
    {
      id: 'dest-SADNESS',
      x: 575,
      y: 210,
      label: 'T4rg3t_S4d',
      color: '#7c3aed',
      inputs: ['in1'],
      outputs: []
    },
    {
      id: 'dest-JOY',
      x: 595,
      y: 250,
      label: 'T4rg3t_J0y',
      color: '#fbbf24',
      inputs: ['in1'],
      outputs: []
    },
    {
      id: 'dest-FURY',
      x: 585,
      y: 290,
      label: 'T4rg3t_Fu2Y',
      color: '#dc2626',
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
      
      <div className="relative w-full h-full" style={{ minHeight: '340px' }}>
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
            gravity: 0.3,
            stiffness: 0.75,
            segments: 25
          }}
        />
        
        {/* Instrucciones */}
        <div className="absolute bottom-2 left-2 text-xs text-slate-400 font-mono">
          {canInteract ? 'Neural cross-wiring: drag from output ports (●) to input ports (○)' : 'Neural matrix locked'}
        </div>
      </div>

      {plateOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-30" role="dialog" aria-modal="true">
          <div className="w-[500px] max-h-[80vh] overflow-y-auto bg-panel p-4 rounded border border-border" tabIndex={-1}>
            <div className="flex justify-between items-center mb-2">
              <div className="font-semibold">Neural Matrix — Cross-Wiring Protocol</div>
              <button onClick={() => setPlateOpen(false)} className="text-sm hover:text-accent transition-colors">
                Close
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="mb-2 text-sm font-medium">Neural Sources</div>
                <div className="flex flex-col gap-1">
                  <button 
                    className="px-2 py-1 bg-red-700 hover:bg-red-600 rounded transition-colors text-xs" 
                    onClick={() => connectPlate('FURY', 'FEAR')}
                  >
                    🔥 Fu2Y_R4g3 → F34r
                  </button>
                  <button 
                    className="px-2 py-1 bg-yellow-600 hover:bg-yellow-500 rounded transition-colors text-xs" 
                    onClick={() => connectPlate('JOY', 'CALM')}
                  >
                    😊 J0y_H4pp1 → C4lm
                  </button>
                  <button 
                    className="px-2 py-1 bg-purple-700 hover:bg-purple-600 rounded transition-colors text-xs" 
                    onClick={() => connectPlate('SADNESS', 'ENVY')}
                  >
                    😢 S4dn3ss_7 → 3nvy
                  </button>
                  <button 
                    className="px-2 py-1 bg-green-800 hover:bg-green-700 rounded transition-colors text-xs" 
                    onClick={() => connectPlate('FEAR', 'LOVE')}
                  >
                    😰 F34r_X9 → L0v3
                  </button>
                  <button 
                    className="px-2 py-1 bg-pink-700 hover:bg-pink-600 rounded transition-colors text-xs" 
                    onClick={() => connectPlate('LOVE', 'SADNESS')}
                  >
                    💖 L0v3_Amp4 → S4d
                  </button>
                  <button 
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded transition-colors text-xs" 
                    onClick={() => connectPlate('CALM', 'JOY')}
                  >
                    🧘 C4lm_Z3n → J0y
                  </button>
                  <button 
                    className="px-2 py-1 bg-green-600 hover:bg-green-500 rounded transition-colors text-xs" 
                    onClick={() => connectPlate('ENVY', 'FURY')}
                  >
                    😈 3nvy_Gr33n → Fu2Y
                  </button>
                </div>
              </div>
              <div>
                <div className="mb-2 text-sm font-medium">Target Nodes</div>
                <div className="flex flex-col gap-1 text-xs">
                  <div className="px-2 py-1 bg-green-900 rounded opacity-60">🎯 T4rg3t_F34r</div>
                  <div className="px-2 py-1 bg-blue-800 rounded opacity-60">🎯 T4rg3t_C4lm</div>
                  <div className="px-2 py-1 bg-green-800 rounded opacity-60">🎯 T4rg3t_3nvy</div>
                  <div className="px-2 py-1 bg-pink-900 rounded opacity-60">🎯 T4rg3t_L0v3</div>
                  <div className="px-2 py-1 bg-purple-900 rounded opacity-60">🎯 T4rg3t_S4d</div>
                  <div className="px-2 py-1 bg-yellow-800 rounded opacity-60">🎯 T4rg3t_J0y</div>
                  <div className="px-2 py-1 bg-red-900 rounded opacity-60">🎯 T4rg3t_Fu2Y</div>
                </div>
              </div>
            </div>
            <div className="mt-4 text-xs text-slate-400">
              Neural links established: {Object.keys(plateConnections).filter(k => plateConnections[k]).length}/7
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Establish cross-neural pathways to achieve emotional equilibrium in the AI system.
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
