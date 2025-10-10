import React from 'react'
import { GameProvider } from './context/GameContext'
import AppHeader from './components/layout/AppHeader'
import Terminal from './components/narrative/Terminal'
import CablePanel from './components/puzzles/CablePanel'
import FrequencyControls from './components/puzzles/FrequencyControls'
import SoundPatternPuzzle from './components/puzzles/new/SoundPatternPuzzle'
import CipherPuzzle from './components/puzzles/new/CipherPuzzle'
import HintPanel from './components/narrative/HintPanel'
import IntroCinematic from './components/narrative/IntroCinematic'
import TelemetryPrompt from './components/narrative/TelemetryPrompt'
import PortfolioView from './components/portfolio/PortfolioView'
import { useGame } from './context/GameContext'

function GamePanels() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[350px_1fr_350px] gap-3 h-full">
      <div className="flex flex-col gap-2 h-full">
        <SoundPatternPuzzle />
        <CablePanel />
      </div>
      <div className="flex flex-col gap-2 h-full">
        <Terminal />
        <HintPanel />
      </div>
      <div className="flex flex-col gap-2 h-full">
        <FrequencyControls />
        <CipherPuzzle />
      </div>
    </div>
  )
}

function RootLayout() {
  const { gameState } = useGame()
  const isPortfolio = gameState.activeView === 'portfolio'

  return (
    <div className={`h-screen flex flex-col bg-gradient-to-b from-bgStart to-bgEnd text-text font-sans w-full ${isPortfolio ? 'overflow-auto' : 'overflow-hidden'}`}>
      {!isPortfolio && <AppHeader />}
      <main className={`${isPortfolio ? 'flex-1' : 'flex-1 p-2 min-h-0'}`}>
        <div className={`${isPortfolio ? 'w-full' : 'max-w-[1400px] mx-auto h-full'}`}>
          {isPortfolio ? <PortfolioView /> : <GamePanels />}
        </div>
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
