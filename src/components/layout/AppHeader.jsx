import React from 'react'
import { useGame } from '../../context/GameContext'
import AriaAvatar from '../narrative/AriaAvatar'

function Led({ status }) {
  return (
    <div
      className={`w-4 h-4 rounded-full transition-all duration-300 ${
        status === 'on'
          ? 'bg-emerald-400 shadow-lg shadow-emerald-500/50 ring-2 ring-emerald-300/30'
          : 'bg-red-500 shadow-lg shadow-red-500/30 ring-1 ring-red-400/20'
      }`}
    >
      <div className="w-full h-full rounded-full bg-gradient-to-tr from-white/30 to-transparent" />
    </div>
  )
}

export default function AppHeader() {
  const { gameState, handleTerminalCommand, resetGame, MODEL, setActiveView, setPortfolioMode } = useGame()
  const { portfolioUnlocked, activeView, portfolioMode } = gameState

  return (
    <header className="relative bg-panel/60 header-metal backdrop-blur-sm border-b border-border w-full" style={{ minHeight: '200px', padding: '1rem' }}>
      <div className="w-full h-full flex items-center justify-between">
        <div className="flex flex-col gap-3 w-48">
          <button
            className="text-xs px-3 py-2 bg-zinc-700 hover:bg-zinc-600 rounded transition-colors"
            onClick={() => handleTerminalCommand('bypass')}
          >
            Saltar puzzles
          </button>
          <button
            className="text-xs px-3 py-2 bg-red-700 hover:bg-red-600 rounded transition-colors"
            onClick={resetGame}
          >
            Reset Estado
          </button>
          {portfolioUnlocked && (
            <div className="mt-1 flex flex-col gap-2 rounded-lg border border-white/5 bg-black/30 p-2">
              <div className="text-[10px] uppercase tracking-[0.32em] text-slate-400">Portfolio</div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveView('game')}
                  className={`flex-1 rounded px-2 py-1 text-[11px] uppercase tracking-widest transition-colors ${
                    activeView === 'game'
                      ? 'bg-slate-700 text-slate-100'
                      : 'bg-slate-800/60 text-slate-300 hover:text-slate-100'
                  }`}
                >
                  Juego
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('portfolio')}
                  className={`flex-1 rounded px-2 py-1 text-[11px] uppercase tracking-widest transition-colors ${
                    activeView === 'portfolio'
                      ? 'bg-slate-700 text-slate-100'
                      : 'bg-slate-800/60 text-slate-300 hover:text-slate-100'
                  }`}
                >
                  Portfolio
                </button>
              </div>
              {activeView === 'portfolio' && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setPortfolioMode('normal')}
                    className={`flex-1 rounded px-2 py-1 text-[10px] uppercase tracking-[0.32em] transition-colors ${
                      portfolioMode !== 'hacked'
                        ? 'bg-slate-600 text-slate-100'
                        : 'bg-slate-800/60 text-slate-300 hover:text-slate-100'
                    }`}
                  >
                    Humano
                  </button>
                  <button
                    type="button"
                    onClick={() => setPortfolioMode('hacked')}
                    className={`flex-1 rounded px-2 py-1 text-[10px] uppercase tracking-[0.32em] transition-colors ${
                      portfolioMode === 'hacked'
                        ? 'bg-purple-700 text-purple-100'
                        : 'bg-purple-900/40 text-purple-200 hover:text-purple-100'
                    }`}
                  >
                    Hackeado
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center min-h-[160px]">
          <div className="relative mb-4">
            <div className="absolute left-1/2 -top-6 -translate-x-1/2 flex gap-3 z-10">
              {['security', 'frequency', 'wiring'].map((key) => (
                <Led key={key} status={gameState.locks[key] ? 'on' : 'off'} />
              ))}
            </div>

            <AriaAvatar />
          </div>

          <div className="text-sm text-slate-300 flex gap-2 items-center" role="status" aria-live="polite">
            A.R.I.A. <span className="text-xs text-slate-400">{MODEL}</span>
          </div>
        </div>

        <div className="w-48 text-right text-sm text-slate-300 space-y-1">
          <div>Model: {MODEL}</div>
          <div className="text-xs text-slate-400">Status: {gameState.stage}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wide">Pistas: {gameState.hintsUsed}</div>
        </div>
      </div>

      <div className="groovy-name">
        <div>Adrian</div>
        <div>Rueda</div>
      </div>
    </header>
  )
}
