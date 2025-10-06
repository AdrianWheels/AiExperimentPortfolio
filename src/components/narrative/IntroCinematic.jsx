import React from 'react'
import { useGame } from '../../context/GameContext'

export default function IntroCinematic() {
  const { introVisible, introLine, advanceIntro, skipIntro } = useGame()

  if (!introVisible || !introLine) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-black/90 to-purple-900/80 backdrop-blur-md">
      <div className="max-w-xl mx-auto bg-panel/70 border border-border rounded-xl p-8 shadow-2xl text-center text-slate-100">
        <div className="text-xs uppercase tracking-[0.3em] text-fuchsia-300 mb-4">{introLine.speaker || 'A.R.I.A.'}</div>
        <p className="text-lg leading-relaxed font-medium">{introLine.text}</p>
        {introLine.subtext && <p className="text-sm mt-4 text-slate-300">{introLine.subtext}</p>}
        <div className="flex gap-3 justify-center mt-6">
          <button className="px-4 py-2 rounded bg-fuchsia-700 hover:bg-fuchsia-600 transition-colors text-sm" onClick={advanceIntro}>
            Continuar
          </button>
          <button className="px-4 py-2 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors text-sm" onClick={skipIntro}>
            Saltar intro
          </button>
        </div>
      </div>
    </div>
  )
}
