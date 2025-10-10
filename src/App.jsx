import React from 'react'
import { GameProvider } from './context/GameContext'
import AppHeader from './components/layout/AppHeader'
import Terminal from './components/narrative/Terminal'
import CablePanel from './components/puzzles/CablePanel'
import FrequencyControls from './components/puzzles/FrequencyControls'
import ResonanceSequenceEngine from './components/puzzles/new/ResonanceSequenceEngine'
import CipherPuzzle from './components/puzzles/new/CipherPuzzle'
import HintPanel from './components/narrative/HintPanel'
import IntroCinematic from './components/narrative/IntroCinematic'
import TelemetryPrompt from './components/narrative/TelemetryPrompt'
import PortfolioView from './components/portfolio/PortfolioView'
import ProtectedPuzzle from './components/ui/ProtectedPuzzle'
import { useGame } from './context/GameContext'

function GamePanels() {
  return (
    <div className="grid grid-cols-3 gap-1 h-full w-full">
      {/* Columna Izquierda */}
      <div className="grid grid-rows-2 gap-1 h-full">
        <ResonanceSequenceEngine />
        <ProtectedPuzzle puzzleType="cables" variant="industrial">
          <CablePanel />
        </ProtectedPuzzle>
      </div>
      
      {/* Columna Central */}
      <div className="grid grid-rows-2 gap-1 h-full">
        <Terminal />
        <HintPanel />
      </div>
      
      {/* Columna Derecha */}
      <div className="grid grid-rows-2 gap-1 h-full">
        <ProtectedPuzzle puzzleType="frequency" variant="cyber">
          <FrequencyControls />
        </ProtectedPuzzle>
        <ProtectedPuzzle puzzleType="cipher" variant="quantum">
          <CipherPuzzle />
        </ProtectedPuzzle>
      </div>
    </div>
  )
}

function RootLayout() {
  const { gameState } = useGame()
  const isPortfolio = gameState.activeView === 'portfolio'

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-bgStart to-bgEnd text-text font-sans">
      {!isPortfolio && <AppHeader />}
      <main className="flex-1 min-h-0">
        {isPortfolio ? <PortfolioView /> : <GamePanels />}
      </main>
      {!isPortfolio && <TelemetryPrompt />}
      {!isPortfolio && <IntroCinematic />}
    </div>
  )
}

export default function App() {
  return (
    <GameProvider>
      <RootLayout />
    </GameProvider>
  )
}
