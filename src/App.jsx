import React from 'react'
import { GameProvider } from './context/GameContext'
import { CableBridgeProvider, CablePanelLeft, CablePanelRight } from './components/puzzles/CableBridge'
import FrequencyControls from './components/puzzles/FrequencyControls'
import ResonanceSequenceEngine from './components/puzzles/new/ResonanceSequenceEngine'
import CipherPuzzle from './components/puzzles/new/CipherPuzzle'

import IntroCinematic from './components/narrative/IntroCinematic'
import TelemetryPrompt from './components/narrative/TelemetryPrompt'
import PortfolioView from './components/portfolio/PortfolioView'
import ProtectedPuzzle from './components/ui/ProtectedPuzzle'
import KiraAvatar from './components/narrative/KiraAvatar'
import BentoScene from './components/layout/BentoScene'
import BentoLayout from './components/layout/BentoLayout'
import BentoClone from './components/test/BentoClone'
import GameBentoLayout from './components/layout/GameBentoLayout'
import { useGame } from './context/GameContext'



function RootLayout() {
  const { gameState } = useGame()
  const isPortfolio = gameState.activeView === 'portfolio'
  const isBentoScene = gameState.activeView === 'bento-scene'

  return (
    <div className="min-h-screen bg-gradient-to-b from-bgStart to-bgEnd text-text font-sans antialiased">
      <main className="min-h-screen">
        {isPortfolio ? (
          <PortfolioView />
        ) : isBentoScene ? (
          <BentoScene />
        ) : (
          <GameBentoLayout />
        )}
      </main>
      {!isPortfolio && <IntroCinematic />}
      {!isPortfolio && <TelemetryPrompt />}
    </div>
  )
}

export default function App() {
  // Simple manual routing for test page
  if (typeof window !== 'undefined' && window.location.pathname === '/test') {
    return <BentoClone />
  }

  return (
    <GameProvider>
      <RootLayout />
    </GameProvider>
  )
}
