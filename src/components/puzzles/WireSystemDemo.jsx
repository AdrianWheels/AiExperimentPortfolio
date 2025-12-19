import React, { useState } from 'react'
import WireSystem from './WireSystem'
import WireNode from './WireNode'
import { debug } from '../../utils/debug'

// Componente de demostración del sistema de cables avanzado
export default function WireSystemDemo() {
  const [connections, setConnections] = useState([])
  const [nodes] = useState([
    {
      id: 'input1',
      x: 100,
      y: 100,
      label: 'Input A',
      color: '#3b82f6',
      inputs: [],
      outputs: ['data', 'signal']
    },
    {
      id: 'input2',
      x: 100,
      y: 200,
      label: 'Input B',
      color: '#ef4444',
      inputs: [],
      outputs: ['value']
    },
    {
      id: 'processor',
      x: 300,
      y: 150,
      label: 'Processor',
      color: '#10b981',
      inputs: ['in1', 'in2', 'control'],
      outputs: ['result', 'status']
    },
    {
      id: 'output1',
      x: 500,
      y: 120,
      label: 'Output X',
      color: '#f59e0b',
      inputs: ['final'],
      outputs: []
    },
    {
      id: 'output2',
      x: 500,
      y: 180,
      label: 'Output Y',
      color: '#8b5cf6',
      inputs: ['final'],
      outputs: []
    },
    {
      id: 'monitor',
      x: 300,
      y: 280,
      label: 'Monitor',
      color: '#06b6d4',
      inputs: ['status_in'],
      outputs: []
    }
  ])

  const handleConnect = (connection) => {
    // Evitar conexiones duplicadas
    const exists = connections.some(conn =>
      conn.from.node === connection.from.node &&
      conn.from.port === connection.from.port &&
      conn.to.node === connection.to.node &&
      conn.to.port === connection.to.port
    )

    if (!exists) {
      setConnections(prev => [...prev, connection])
      debug.log('Nueva conexión:', connection)
    }
  }

  const handleDisconnect = (connection) => {
    setConnections(prev =>
      prev.filter(conn =>
        !(conn.from.node === connection.from.node &&
          conn.from.port === connection.from.port &&
          conn.to.node === connection.to.node &&
          conn.to.port === connection.to.port)
      )
    )
    debug.log('Conexión eliminada:', connection)
  }

  const clearAllConnections = () => {
    setConnections([])
  }

  const getConnectionsCount = () => connections.length

  return (
    <div className="w-full h-full bg-zinc-900 rounded-lg border border-zinc-700 p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-semibold">Sistema de Cables Avanzado</h3>
        <div className="flex gap-2">
          <span className="text-sm text-zinc-400">
            Conexiones: {getConnectionsCount()}
          </span>
          <button
            onClick={clearAllConnections}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
          >
            Limpiar
          </button>
        </div>
      </div>

      <div className="relative bg-zinc-800 rounded border border-zinc-600" style={{ height: '400px' }}>
        {/* Nodos del sistema */}
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
          >
            {/* Contenido personalizado para algunos nodos */}
            {node.id === 'processor' && (
              <div className="text-xs text-zinc-300 mt-1">
                CPU: 45%
              </div>
            )}
            {node.id === 'monitor' && (
              <div className="text-xs text-zinc-300 mt-1">
                Status: OK
              </div>
            )}
          </WireNode>
        ))}

        {/* Sistema de cables con física */}
        <WireSystem
          nodes={nodes}
          connections={connections}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          interactive={true}
          physics={{
            gravity: 0.2,
            stiffness: 0.85,
            segments: 10
          }}
        />

        {/* Instrucciones */}
        <div className="absolute bottom-2 right-2 text-xs text-zinc-500 bg-zinc-800/80 px-2 py-1 rounded">
          Arrastra desde ● a ○ para conectar
        </div>
      </div>

      {/* Lista de conexiones activas */}
      {connections.length > 0 && (
        <div className="mt-4 p-3 bg-zinc-800 rounded border border-zinc-600">
          <h4 className="text-sm font-medium text-white mb-2">Conexiones Activas:</h4>
          <div className="space-y-1">
            {connections.map((conn, index) => (
              <div key={index} className="text-xs text-zinc-300 flex justify-between items-center">
                <span>
                  {conn.from.node}:{conn.from.port} → {conn.to.node}:{conn.to.port}
                </span>
                <button
                  onClick={() => handleDisconnect(conn)}
                  className="text-red-400 hover:text-red-300 ml-2"
                  title="Desconectar"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}