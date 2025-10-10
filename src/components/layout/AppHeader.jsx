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
    <header className="relative bg-panel/60 header-metal backdrop-blur-sm border-b border-border w-full" style={{ minHeight: '140px', padding: '0.5rem', paddingTop: '1rem' }}>
      <div className="w-full h-full flex items-center justify-between">
        <div className="flex flex-col gap-2 w-40">
          <button
            className="text-xs px-2 py-1 bg-blue-700 hover:bg-blue-600 rounded transition-colors"
            onClick={() => setActiveView('portfolio')}
          >
            Ir al portfolio
          </button>
          <button
            className="text-xs px-2 py-1 bg-zinc-700 hover:bg-zinc-600 rounded transition-colors"
            onClick={() => handleTerminalCommand('bypass')}
          >
            Saltar puzzles
          </button>
          <button
            className="text-xs px-2 py-1 bg-red-700 hover:bg-red-600 rounded transition-colors"
            onClick={resetGame}
          >
            Reset Estado
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center min-h-[100px]">
          <div className="relative mb-2">
            {/* LEDs en forma de X alrededor del avatar */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 z-10">
              {/* Lado superior izquierdo */}
              <div className="absolute -top-4 -left-4">
                <Led status={gameState.puzzleProgress?.sound?.solved ? 'on' : 'off'} />
              </div>
              {/* Lado superior derecho */}
              <div className="absolute -top-4 -right-4">
                <Led status={gameState.puzzleProgress?.cipher?.solved ? 'on' : 'off'} />
              </div>
              {/* Lado inferior izquierdo */}
              <div className="absolute -bottom-4 -left-4">
                <Led status={gameState.locks?.frequency ? 'on' : 'off'} />
              </div>
              {/* Lado inferior derecho */}
              <div className="absolute -bottom-4 -right-4">
                <Led status={gameState.locks?.wiring ? 'on' : 'off'} />
              </div>
            </div>

            <AriaAvatar />
          </div>

          <div className="text-sm text-slate-300 flex gap-2 items-center" role="status" aria-live="polite">
            <span data-ai-name>A.R.I.A. <span className="text-xs text-slate-400">{MODEL}</span></span>
          </div>
        </div>

        <div className="w-40 text-right text-sm text-slate-300 space-y-1">
          <div className="text-xs">Model: {MODEL}</div>
          <div className="text-xs text-slate-400">Status: {gameState.stage}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wide">Pistas: {gameState.hintsUsed}</div>
          
          {/* Social Media Links */}
          <div className="flex justify-end gap-2 mt-3">
            <a
              href="https://github.com/AdrianWheels"
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-full border border-slate-500/30 flex items-center justify-center text-xs text-slate-200/90 transition-colors hover:border-sky-400/60 hover:text-sky-200"
              title="GitHub"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/in/adrian-rueda/"
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-full border border-slate-500/30 flex items-center justify-center text-xs text-slate-200/90 transition-colors hover:border-sky-400/60 hover:text-sky-200"
              title="LinkedIn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="groovy-name">
        <div>Adrian</div>
        <div>Rueda</div>
      </div>
    </header>
  )
}
