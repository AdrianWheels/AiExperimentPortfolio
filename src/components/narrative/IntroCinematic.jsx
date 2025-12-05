import React from 'react'
import { useGame } from '../../context/GameContext'

export default function IntroCinematic() {
  const { 
    introVisible, 
    introLine, 
    skipIntro, 
    goToPortfolio
  } = useGame()

  if (!introVisible || !introLine) return null

  const handleGoToPortfolio = () => {
    goToPortfolio()
  }

  const goToGame = () => {
    skipIntro()
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
