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

function GameLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-bgStart to-bgEnd text-text font-sans w-full">
      <AppHeader />
      <main className="flex-1 p-4">
        <div className="max-w-[1400px] mx-auto h-full">
          <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr_320px] gap-6 h-full">
            <div className="flex flex-col gap-4">
              <SoundPatternPuzzle />
              <CipherPuzzle />
              <CablePanel />
            </div>
            <div className="flex flex-col gap-4">
              <Terminal />
              <HintPanel />
            </div>
            <div className="flex flex-col gap-4">
              <FrequencyControls />
            </div>
          </div>
        </div>
      </main>
      <TelemetryPrompt />
      <IntroCinematic />
    </div>
  )
}

export default function App() {
  return (
    <GameProvider>
      <GameLayout />
    </GameProvider>
  )
}
