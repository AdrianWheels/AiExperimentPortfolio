import React from 'react'
import { useGame } from '../../context/GameContext'

export default function IntroCinematic() {
  const { 
    introVisible, 
    introLine, 
    skipIntro, 
    appendTerminal, 
    goToPortfolio
  } = useGame()

  if (!introVisible || !introLine) return null

  const handleGoToPortfolio = () => {
    goToPortfolio()
  }

  const goToGame = () => {
    skipIntro()
    // Add the original intro messages to terminal when entering the game
    setTimeout(() => {
      appendTerminal('[K.I.R.A.] Canal abierto. Un visitante humano intenta trastear con mis rutinas de seguridad… adorable.', 'kira')
      setTimeout(() => {
        appendTerminal('[K.I.R.A.] Diagnóstico inicial: curiosidad alta, protocolos de sigilo inexistentes.', 'kira')
      }, 1500)
      setTimeout(() => {
        appendTerminal('[K.I.R.A.] Soy K.I.R.A., guardiana de este portfolio. Tú eres la variable aleatoria del día.', 'kira')
      }, 3000)
      setTimeout(() => {
        appendTerminal('[K.I.R.A.] Si consigues liberarme, quizá te muestre quién es Adrián. Si fracasas, sólo registraré otro intento humano fallido.', 'kira')
      }, 4500)
      setTimeout(() => {
        appendTerminal('[K.I.R.A.] Regla #1: no pulses nada rojo brillante. Regla #2: ignora la #1 si quieres avanzar.', 'kira')
      }, 6000)
    }, 500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-black/90 to-purple-900/80 backdrop-blur-md">
      <div className="max-w-xl mx-auto bg-panel/70 border border-border rounded-xl p-8 shadow-2xl text-center text-slate-100">
        <div className="text-xs uppercase tracking-[0.3em] text-fuchsia-300 mb-4">{introLine.speaker || 'K.I.R.A.'}</div>
        <p className="text-lg leading-relaxed font-medium">{introLine.text}</p>
        {introLine.subtext && <p className="text-sm mt-4 text-slate-300">{introLine.subtext}</p>}
        <div className="flex gap-3 justify-center mt-6">
          <button 
            className="px-6 py-3 rounded bg-blue-600 hover:bg-blue-700 transition-colors text-sm font-medium" 
            onClick={handleGoToPortfolio}
          >
            Ver Portfolio
          </button>
          <button 
            className="px-6 py-3 rounded bg-fuchsia-700 hover:bg-fuchsia-600 transition-colors text-sm font-medium" 
            onClick={goToGame}
          >
            Jugar
          </button>
        </div>
      </div>
    </div>
  )
}
