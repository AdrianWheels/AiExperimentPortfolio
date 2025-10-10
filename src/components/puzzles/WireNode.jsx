import React from 'react'

export default function WireNode({ 
  id, 
  x, 
  y, 
  label, 
  color = '#00ff00', 
  inputs = ['in1'], 
  outputs = ['out1'],
  className = "",
  children
}) {
  return (
    <div
      id={`node-${id}`}
      className={`absolute bg-panel border border-border rounded-lg p-3 min-w-[120px] ${className}`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -50%)'
      }}
    >
      {/* Puertos de entrada (izquierda) */}
      <div className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col gap-2">
        {inputs.map((input, index) => (
          <div
            key={input}
            className="w-3 h-3 rounded-full border-2 border-white bg-zinc-700 hover:bg-zinc-600 cursor-pointer transition-colors"
            style={{
              borderColor: color,
              transform: `translateY(${(index - (inputs.length - 1) / 2) * 30}px)`
            }}
            title={`Input: ${input}`}
          />
        ))}
      </div>

      {/* Contenido del nodo */}
      <div className="text-center">
        <div className="text-sm font-medium text-white mb-1">{label}</div>
        {children}
      </div>

      {/* Puertos de salida (derecha) */}
      <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 flex flex-col gap-2">
        {outputs.map((output, index) => (
          <div
            key={output}
            className="w-3 h-3 rounded-full border-2 border-white bg-zinc-700 hover:bg-zinc-600 cursor-pointer transition-colors"
            style={{
              backgroundColor: color,
              transform: `translateY(${(index - (outputs.length - 1) / 2) * 30}px)`
            }}
            title={`Output: ${output}`}
          />
        ))}
      </div>

      {/* Indicador de color del nodo */}
      <div
        className="absolute top-1 right-1 w-2 h-2 rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  )
}