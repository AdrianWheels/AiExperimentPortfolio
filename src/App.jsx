import React from 'react'
import { GameProvider, useGame } from './context/GameContext'

import IntroCinematic from './components/narrative/IntroCinematic'
import PortfolioView from './components/portfolio/PortfolioView'
import BentoScene from './components/layout/BentoScene'
import BentoClone from './components/test/BentoClone'
import GameBentoLayout from './components/layout/GameBentoLayout'



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
