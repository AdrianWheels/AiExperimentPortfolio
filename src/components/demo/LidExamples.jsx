import React, { useState } from 'react'
import { useGame } from '../../context/GameContext'
import ProtectedPuzzle from '../ui/ProtectedPuzzle'
import PuzzleLid from '../ui/PuzzleLid'

// Ejemplos prácticos del sistema de tapas
export default function LidExamples() {
  const { gameState } = useGame()
  const [manualLidOpen, setManualLidOpen] = useState(true)

  // Componente de puzzle simulado
  const MockPuzzle = ({ title, description, color = "blue" }) => (
    <div className={`p-4 bg-${color}-900/20 border border-${color}-700 rounded-lg h-full flex flex-col justify-center`}>
      <h3 className={`text-${color}-300 font-bold text-lg mb-2`}>{title}</h3>
      <p className={`text-${color}-200 text-sm`}>{description}</p>
      <div className="mt-4 space-y-2">
        <div className={`w-full h-2 bg-${color}-700 rounded`}></div>
        <div className={`w-3/4 h-2 bg-${color}-600 rounded`}></div>
        <div className={`w-1/2 h-2 bg-${color}-500 rounded`}></div>
      </div>
    </div>
  )

  return (
    <div className="p-6 bg-zinc-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Ejemplos del Sistema de Tapas</h1>
          <p className="text-zinc-400 mb-4">
            Casos de uso prácticos y integración con el sistema de juego
          </p>
        </div>

        {/* Estado actual del juego */}
        <div className="mb-8 bg-zinc-800 p-4 rounded-lg border border-zinc-700">
          <h2 className="text-lg font-semibold text-white mb-3">🎮 Estado Actual del Juego</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-zinc-700 p-3 rounded">
              <div className="font-medium text-white">Sound Puzzle</div>
              <div className={`mt-1 ${gameState.puzzleProgress?.sound?.solved ? 'text-green-400' : 'text-red-400'}`}>
                {gameState.puzzleProgress?.sound?.solved ? '✅ Completado' : '❌ Pendiente'}
              </div>
            </div>
            <div className="bg-zinc-700 p-3 rounded">
              <div className="font-medium text-white">Cipher Puzzle</div>
              <div className={`mt-1 ${gameState.puzzleProgress?.cipher?.solved ? 'text-green-400' : 'text-red-400'}`}>
                {gameState.puzzleProgress?.cipher?.solved ? '✅ Completado' : '❌ Pendiente'}
              </div>
            </div>
            <div className="bg-zinc-700 p-3 rounded">
              <div className="font-medium text-white">Frequency Puzzle</div>
              <div className={`mt-1 ${gameState.puzzleProgress?.frequency?.solved ? 'text-green-400' : 'text-red-400'}`}>
                {gameState.puzzleProgress?.frequency?.solved ? '✅ Completado' : '❌ Pendiente'}
              </div>
            </div>
          </div>
        </div>

        {/* Ejemplos de uso automático */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">🤖 Protección Automática por Dependencias</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Frequency - Requiere Sound */}
            <div className="h-64">
              <h3 className="text-white font-medium mb-2">
                Control de Frecuencias 
                <span className="text-xs text-zinc-400 ml-2">(Requiere: Sound)</span>
              </h3>
              <ProtectedPuzzle puzzleType="frequency">
                <MockPuzzle 
                  title="Modulador Cuántico"
                  description="Controles de frecuencia avanzados para manipulación de ondas cuánticas"
                  color="purple"
                />
              </ProtectedPuzzle>
            </div>

            {/* Cables - Requiere Sound + Cipher */}
            <div className="h-64">
              <h3 className="text-white font-medium mb-2">
                Panel de Cables 
                <span className="text-xs text-zinc-400 ml-2">(Requiere: Sound + Cipher)</span>
              </h3>
              <ProtectedPuzzle 
                puzzleType="cables"
                customMessage="⚡ ALTA TENSIÓN ⚡\n\nSistema de 10,000 voltios\nSolo técnicos certificados\n\n💀 Peligro de muerte 💀"
              >
                <MockPuzzle 
                  title="Sistema Neural"
                  description="Red de conexiones avanzada para transmisión de datos neurales"
                  color="green"
                />
              </ProtectedPuzzle>
            </div>
          </div>
        </div>

        {/* Ejemplos de variantes manuales */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">🎨 Variantes Manuales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Standard */}
            <div className="h-48">
              <h4 className="text-white text-sm font-medium mb-2">Standard</h4>
              <PuzzleLid
                isLocked={true}
                variant="standard"
                hiddenMessage="Sistema básico\nAcceso restringido general\n🔒"
              >
                <MockPuzzle title="Sistema Base" description="Configuración estándar" color="blue" />
              </PuzzleLid>
            </div>

            {/* Classified */}
            <div className="h-48">
              <h4 className="text-white text-sm font-medium mb-2">Classified</h4>
              <PuzzleLid
                isLocked={true}
                variant="classified"
                hiddenMessage="📋 TOP SECRET 📋\n\nClasificación: ULTRA\nSolo ojos autorizados\n\n🕵️ Misión imposible 🕵️"
              >
                <MockPuzzle title="Archivos Secretos" description="Información clasificada" color="red" />
              </PuzzleLid>
            </div>

            {/* Maintenance */}
            <div className="h-48">
              <h4 className="text-white text-sm font-medium mb-2">Maintenance</h4>
              <PuzzleLid
                isLocked={true}
                variant="maintenance"
                hiddenMessage="🔧 REPARACIONES 🔧\n\nTiempo estimado: ∞\nTécnico: Coffee Bot 3000\n\n☕ Espere por favor..."
              >
                <MockPuzzle title="En Reparación" description="Sistema en mantenimiento" color="yellow" />
              </PuzzleLid>
            </div>

            {/* Experimental */}
            <div className="h-48">
              <h4 className="text-white text-sm font-medium mb-2">Experimental</h4>
              <PuzzleLid
                isLocked={true}
                variant="experimental"
                hiddenMessage="⚗️ LABORATORIO ACTIVO ⚗️\n\nExperimento: AI-FUSION\nEstado: CAOS CONTROLADO\n\n🧪 ¿Qué podría salir mal? 🧪"
              >
                <MockPuzzle title="Prototipo X1" description="Tecnología experimental" color="purple" />
              </PuzzleLid>
            </div>
          </div>
        </div>

        {/* Control manual */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">🎛️ Control Manual</h2>
          <div className="bg-zinc-800 p-4 rounded-lg border border-zinc-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-medium">Tapa Controlable</h3>
              <button
                onClick={() => setManualLidOpen(!manualLidOpen)}
                className={`px-4 py-2 rounded transition-colors ${
                  manualLidOpen
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {manualLidOpen ? '🔒 Bloquear' : '🔓 Desbloquear'}
              </button>
            </div>
            
            <div className="h-40">
              <PuzzleLid
                isLocked={manualLidOpen}
                onUnlock={() => setManualLidOpen(false)}
                variant="experimental"
                customMessage="🎮 DEMO INTERACTIVO 🎮\n\nEste panel se puede controlar\nmanualmente con el botón\n\n🖱️ ¡Pruébalo!"
              >
                <div className="h-full flex items-center justify-center bg-emerald-900/20 border border-emerald-700 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl mb-2">🎉</div>
                    <div className="text-emerald-300 font-bold">¡Contenido Desbloqueado!</div>
                    <div className="text-emerald-200 text-sm mt-1">
                      Sistema de control manual activo
                    </div>
                  </div>
                </div>
              </PuzzleLid>
            </div>
          </div>
        </div>

        {/* Instrucciones avanzadas */}
        <div className="bg-zinc-800 p-4 rounded-lg border border-zinc-700">
          <h2 className="text-lg font-semibold text-white mb-3">📚 Guía de Interacción Avanzada</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-zinc-300">
            <div>
              <h4 className="font-medium text-white mb-2">🖱️ Controles de Mouse</h4>
              <ul className="space-y-1">
                <li><strong>Arrastrar hacia abajo:</strong> Abrir tapa gradualmente</li>
                <li><strong>Soltar antes del 60%:</strong> Se cierra automáticamente</li>
                <li><strong>Soltar después del 60%:</strong> Se abre completamente</li>
                <li><strong>Arrastrar al 100%:</strong> La tapa se suelta y cae</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">⌨️ Controles de Teclado</h4>
              <ul className="space-y-1">
                <li><strong>Espacio/Enter:</strong> Toggle rápido abierto/cerrado</li>
                <li><strong>Flecha ↑:</strong> Abrir 5% más</li>
                <li><strong>Flecha ↓:</strong> Cerrar 5% más</li>
                <li><strong>D:</strong> Soltar tapa inmediatamente</li>
                <li><strong>R:</strong> Resetear tapa a estado inicial</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}