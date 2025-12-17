import React from 'react'

export default function WireNode({
  id,
  x,
  y,
  label,
  color = '#00ff00',
  inputs = [],
  outputs = [],
  className = "",
  children
}) {
  const isSource = outputs.length > 0;

  return (
    <div
      id={`node-${id}`}
      className={`absolute flex items-center ${className}`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -50%)',
        zIndex: 20
      }}
    >
      {/* Puertos de entrada (izquierda) */}
      {inputs.length > 0 && (
        <div className="mr-3 flex flex-col gap-2">
          {inputs.map((input, index) => (
            <div
              key={input}
              data-port-id={input}
              data-port-type="input"
              data-node-id={id}
              className="w-4 h-4 rounded-full border-2 border-white bg-black hover:bg-zinc-800 cursor-pointer transition-all shadow-[0_0_10px_rgba(0,0,0,0.5)]"
              style={{
                borderColor: color,
                boxShadow: `0 0 8px ${color}40`
              }}
              title={`Input: ${input}`}
            />
          ))}
        </div>
      )}

      {/* Contenido del nodo */}
      <div
        className={`text-sm font-bold tracking-wider whitespace-nowrap ${isSource ? 'text-left ml-2' : 'text-right mr-2'}`}
        style={{
          color: color,
          textShadow: `0 0 10px ${color}60`,
          fontFamily: 'monospace'
        }}
      >
        {label}
        {children}
      </div>

      {/* Puertos de salida (derecha) */}
      {outputs.length > 0 && (
        <div className="ml-3 flex flex-col gap-2">
          {outputs.map((output, index) => (
            <div
              key={output}
              data-port-id={output}
              data-port-type="output"
              data-node-id={id}
              className="w-4 h-4 rounded-full border-2 border-white bg-black hover:bg-zinc-800 cursor-pointer transition-all"
              style={{
                backgroundColor: color,
                borderColor: '#fff',
                boxShadow: `0 0 12px ${color}`
              }}
              title={`Output: ${output}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}