import React, { useState } from 'react'
import PuzzleLid from '../ui/PuzzleLid'

// Componente de demostración para todas las variantes de tapas
export default function LidShowcase() {
  const [states, setStates] = useState({
    standard: true,
    classified: true,
    maintenance: true,
    experimental: true
  })

  const toggleLid = (variant) => {
    setStates(prev => ({
      ...prev,
      [variant]: !prev[variant]
    }))
  }

  const resetAll = () => {
    setStates({
      standard: true,
      classified: true,
      maintenance: true,
      experimental: true
    })
  }

  const variants = [
    {
      type: 'standard',
      title: 'Tapa Estándar',
      description: 'Acceso restringido básico',
      hiddenMessage: "¡Sorpresa! 🎉\nEste es el mensaje oculto\nestándar del sistema.",
      content: (
        <div className="p-4 bg-blue-900/20 border border-blue-700 rounded">
          <h3 className="text-blue-300 font-bold mb-2">Contenido Estándar</h3>
          <p className="text-blue-200 text-sm">Este es el contenido que estaba oculto bajo la tapa estándar.</p>
          <div className="mt-2 w-full h-2 bg-blue-700 rounded"></div>
        </div>
      )
    },
    {
      type: 'classified',
      title: 'Tapa Clasificada',
      description: 'Documentos de alta seguridad',
      hiddenMessage: "📋 DOCUMENTO ULTRASECRETO 📋\n\nNivel: OMEGA\nOjos solamente: ADMIN\n\n🕵️ Esto nunca pasó 🕵️",
      content: (
        <div className="p-4 bg-red-900/20 border border-red-700 rounded">
          <h3 className="text-red-300 font-bold mb-2">⚠️ CLASIFICADO ⚠️</h3>
          <p className="text-red-200 text-sm">Información altamente sensible que requiere autorización especial.</p>
          <div className="mt-2 grid grid-cols-3 gap-1">
            <div className="h-2 bg-red-700 rounded"></div>
            <div className="h-2 bg-red-600 rounded"></div>
            <div className="h-2 bg-red-500 rounded"></div>
          </div>
        </div>
      )
    },
    {
      type: 'maintenance',
      title: 'Tapa de Mantenimiento',
      description: 'Equipos fuera de servicio',
      hiddenMessage: "🔧 MANTENIMIENTO PROGRAMADO 🔧\n\nTiempo estimado: ∞ horas\nTécnico asignado: ERROR 404\n\n☕ Tómese un café mientras tanto",
      content: (
        <div className="p-4 bg-yellow-900/20 border border-yellow-700 rounded">
          <h3 className="text-yellow-300 font-bold mb-2">🔧 En Mantenimiento</h3>
          <p className="text-yellow-200 text-sm">Sistema en reparación. Por favor, sea paciente.</p>
          <div className="mt-2 flex gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse delay-100"></div>
            <div className="w-3 h-3 bg-yellow-300 rounded-full animate-pulse delay-200"></div>
          </div>
        </div>
      )
    },
    {
      type: 'experimental',
      title: 'Tapa Experimental',
      description: 'Prototipos y proyectos beta',
      hiddenMessage: "⚗️ LABORATORIO ACTIVO ⚗️\n\nExperimento: AI-PORTFOLIO-v2.1\nEstado: FUNCIONANDO™\n\n🧪 Resultados no garantizados",
      content: (
        <div className="p-4 bg-purple-900/20 border border-purple-700 rounded">
          <h3 className="text-purple-300 font-bold mb-2">🧪 Experimental</h3>
          <p className="text-purple-200 text-sm">Tecnología de vanguardia en fase de pruebas.</p>
          <div className="mt-2 w-full bg-purple-800 rounded-full h-2">
            <div className="bg-purple-500 h-2 rounded-full w-3/4 animate-pulse"></div>
          </div>
        </div>
      )
    }
  ]

  return (
    <div className="p-6 bg-zinc-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Sistema de Tapas Modular</h1>
          <p className="text-zinc-400 mb-4">
            Demostración de todas las variantes disponibles del sistema de protección de puzzles
          </p>
          <button
            onClick={resetAll}
            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded transition-colors"
          >
            🔄 Resetear Todas las Tapas
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {variants.map((variant) => (
            <div key={variant.type} className="space-y-4">
              {/* Información de la variante */}
              <div className="bg-zinc-800 p-4 rounded-lg border border-zinc-700">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-white">{variant.title}</h3>
                  <button
                    onClick={() => toggleLid(variant.type)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      states[variant.type]
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {states[variant.type] ? '🔒 Bloquear' : '🔓 Desbloquear'}
                  </button>
                </div>
                <p className="text-zinc-400 text-sm">{variant.description}</p>
                <div className="mt-2 text-xs text-zinc-500">
                  Estado: {states[variant.type] ? 'Protegido con tapa' : 'Accesible'}
                </div>
              </div>

              {/* Tapa y contenido */}
              <div className="h-64 relative">
                <PuzzleLid
                  isLocked={states[variant.type]}
                  onUnlock={() => toggleLid(variant.type)}
                  variant={variant.type}
                  hiddenMessage={variant.hiddenMessage}
                  className="w-full h-full"
                >
                  <div className="w-full h-full flex items-center justify-center bg-zinc-800 border border-zinc-600 rounded-lg">
                    {variant.content}
                  </div>
                </PuzzleLid>
              </div>
            </div>
          ))}
        </div>

        {/* Instrucciones */}
        <div className="mt-8 bg-zinc-800 p-4 rounded-lg border border-zinc-700">
          <h3 className="text-lg font-semibold text-white mb-2">📖 Instrucciones</h3>
          <div className="text-zinc-300 text-sm space-y-1">
            <p><strong>Arrastra</strong> hacia abajo para abrir las tapas</p>
            <p><strong>Tecla D:</strong> Soltar la tapa (se cae y desaparece)</p>
            <p><strong>Tecla R:</strong> Resetear tapa individual</p>
            <p><strong>Espacio/Enter:</strong> Toggle rápido abierto/cerrado</p>
            <p><strong>Flechas ↑↓:</strong> Abrir/cerrar gradualmente</p>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="mt-4 bg-zinc-800 p-4 rounded-lg border border-zinc-700">
          <h3 className="text-lg font-semibold text-white mb-2">📊 Estado del Sistema</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {variants.map((variant) => (
              <div key={variant.type} className="space-y-1">
                <div className="text-xs text-zinc-400 uppercase">{variant.type}</div>
                <div className={`text-sm font-bold ${
                  states[variant.type] ? 'text-red-400' : 'text-green-400'
                }`}>
                  {states[variant.type] ? '🔒 LOCKED' : '🔓 OPEN'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}