import React, { useEffect, useRef, useState, useLayoutEffect } from 'react'
import { useGame } from '../../context/GameContext'
import WireSystem from './WireSystem'
import WireNode from './WireNode'

export default function CablePanel() {
  const { plateConnections, connectPlate, plateOpen, setPlateOpen, gameState, unlockAnimations } = useGame()
  const containerRef = useRef(null)
  
  // Definición base de nodos
  const baseNodes = [
    // Nodos de origen
    { id: 'src-FURY', label: 'Fu2Y_R4g3', color: '#dc2626', inputs: [], outputs: ['out1'] },
    { id: 'src-JOY', label: 'J0y_H4pp1', color: '#fbbf24', inputs: [], outputs: ['out1'] },
    { id: 'src-SADNESS', label: 'S4dn3ss_7', color: '#7c3aed', inputs: [], outputs: ['out1'] },
    { id: 'src-FEAR', label: 'F34r_X9', color: '#065f46', inputs: [], outputs: ['out1'] },
    { id: 'src-LOVE', label: 'L0v3_Amp4', color: '#ec4899', inputs: [], outputs: ['out1'] },
    { id: 'src-CALM', label: 'C4lm_Z3n', color: '#0ea5e9', inputs: [], outputs: ['out1'] },
    { id: 'src-ENVY', label: '3nvy_Gr33n', color: '#16a34a', inputs: [], outputs: ['out1'] },
    // Nodos de destino
    { id: 'dest-FEAR', label: 'T4rg3t_F34r', color: '#065f46', inputs: ['in1'], outputs: [] },
    { id: 'dest-CALM', label: 'T4rg3t_C4lm', color: '#0ea5e9', inputs: ['in1'], outputs: [] },
    { id: 'dest-ENVY', label: 'T4rg3t_3nvy', color: '#16a34a', inputs: ['in1'], outputs: [] },
    { id: 'dest-LOVE', label: 'T4rg3t_L0v3', color: '#ec4899', inputs: ['in1'], outputs: [] },
    { id: 'dest-SADNESS', label: 'T4rg3t_S4d', color: '#7c3aed', inputs: ['in1'], outputs: [] },
    { id: 'dest-JOY', label: 'T4rg3t_J0y', color: '#fbbf24', inputs: ['in1'], outputs: [] },
    { id: 'dest-FURY', label: 'T4rg3t_Fu2Y', color: '#dc2626', inputs: ['in1'], outputs: [] }
  ]

  const [nodes, setNodes] = useState([])

  // Actualizar posiciones basado en dimensiones
  useLayoutEffect(() => {
    if (!containerRef.current) return
    
    const updateNodes = () => {
      const { clientWidth, clientHeight } = containerRef.current
      
      const paddingY = 80
      const availableHeight = clientHeight - paddingY * 2
      const stepY = availableHeight / 6 // 7 items, 6 spaces
      
      const newNodes = baseNodes.map((node, index) => {
        const isSource = node.id.startsWith('src-')
        const idx = index % 7
        
        return {
          ...node,
          // Posicionar en los extremos absolutos
          x: isSource ? 80 : clientWidth - 80, 
          y: paddingY + idx * stepY,
          // Invertir dirección flex para que los puertos queden hacia afuera
          // Source: Port Left (Outer) - Text Right
          // Dest: Text Left - Port Right (Outer)
          className: 'flex-row-reverse'
        }
      })
      setNodes(newNodes)
    }

    const observer = new ResizeObserver(updateNodes)
    observer.observe(containerRef.current)
    updateNodes()
    
    return () => observer.disconnect()
  }, [])
  
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

  // Calcular conexiones correctas para feedback visual
  const correctConnections = Object.entries(plateConnections).filter(([source, target]) => {
    if (!target) return false
    const map = {
      FURY: 'FEAR',
      JOY: 'CALM',
      SADNESS: 'ENVY',
      FEAR: 'LOVE',
      LOVE: 'SADNESS',
      CALM: 'JOY',
      ENVY: 'FURY'
    }
    return map[source] === target
  }).length

  return (
    <aside
      ref={containerRef}
      className={`relative overflow-hidden flex-1 min-h-0 ${
        isPulsing ? 'glow-success unlock-pulse' : ''
      }`}
    >
      {!canInteract && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-center px-4 text-xs text-muted font-mono z-20 rounded-lg">
          <span>Descifra Buffer + Sonido</span>
        </div>
      )}
      
      <div className="flex items-center gap-2 mb-3 absolute top-2 left-2 z-10 pointer-events-none">
        <div className="w-6 h-6 rounded-lg bg-accent/20 flex items-center justify-center">
          <span className="text-xs">🔌</span>
        </div>
        <h3 className="text-sm font-semibold text-white">Cables</h3>
        {canInteract && (
          <span className={`text-xs font-mono ml-2 px-2 py-0.5 rounded ${correctConnections === 7 ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-muted'}`}>
            {correctConnections}/7
          </span>
        )}
      </div>
      
      <div className="relative w-full h-full">
        {/* Paneles de fondo para dar estructura visual */}
        <div className="absolute left-4 top-12 bottom-4 w-48 bg-black/40 rounded-xl border border-white/5 backdrop-blur-sm" />
        <div className="absolute right-4 top-12 bottom-4 w-48 bg-black/40 rounded-xl border border-white/5 backdrop-blur-sm" />

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
            className={`${!canInteract ? 'opacity-50' : ''} ${node.className || ''}`}
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
        <div className="absolute bottom-1 left-1 text-[10px] text-subtle font-mono">
          {canInteract ? 'Drag ● → ○' : 'Bloqueado'}
        </div>
      </div>

      {plateOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-30" role="dialog" aria-modal="true">
          <div className="w-[500px] max-h-[80vh] overflow-y-auto bg-card p-4 rounded-xl border border-white/5" tabIndex={-1}>
            <div className="flex justify-between items-center mb-2">
              <div className="font-semibold text-white">Neural Matrix</div>
              <button onClick={() => setPlateOpen(false)} className="text-sm text-muted hover:text-white transition-colors">
                Cerrar
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
