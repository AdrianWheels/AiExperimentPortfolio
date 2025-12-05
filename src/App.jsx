import React from 'react'
import { GameProvider } from './context/GameContext'
import { CableBridgeProvider, CablePanelLeft, CablePanelRight } from './components/puzzles/CableBridge'
import FrequencyControls from './components/puzzles/FrequencyControls'
import ResonanceSequenceEngine from './components/puzzles/new/ResonanceSequenceEngine'
import CipherPuzzle from './components/puzzles/new/CipherPuzzle'
import HintPanel from './components/narrative/HintPanel'
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

// Componente para card Bento individual
function BentoCard({ children, className = '', variant = 'default' }) {
  const variants = {
    default: 'bento-card',
    elevated: 'bento-card-elevated',
    subtle: 'bento-card-subtle',
  }
  return (
    <div className={`${variants[variant]} ${className}`}>
      {children}
    </div>
  )
}


// Card de controles rápidos + RRSS (combinado)
function ControlsCard() {
  const { setActiveView, triggerBypass } = useGame()
  
  return (
    <BentoCard className="flex flex-col h-full">
      <div className="bento-icon bento-icon-orange mb-3">
        <span>⚡</span>
      </div>
      <h3 className="text-base font-semibold text-white mb-1">Controles</h3>
      <p className="text-xs text-muted mb-3">Accesos rápidos</p>
      
      <div className="flex flex-col gap-2 mb-4">
        <button
          onClick={() => setActiveView('portfolio')}
          className="bento-cta text-sm py-2"
        >
          🎯 Portfolio
        </button>
        <button
          onClick={triggerBypass}
          className="text-xs px-3 py-2 rounded-full bg-card-elevated hover:bg-card-hover text-muted hover:text-white transition-colors"
        >
          Saltar puzzles
        </button>
      </div>
      
      {/* RRSS integradas */}
      <div className="mt-auto pt-3 border-t border-white/5">
        <p className="text-xs text-muted mb-2">Conecta</p>
        <div className="flex gap-2">
          <a
            href="https://github.com/AdrianWheels"
            target="_blank"
            rel="noreferrer"
            className="w-9 h-9 rounded-xl bg-card-elevated hover:bg-card-hover flex items-center justify-center text-muted hover:text-white transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
          <a
            href="https://www.linkedin.com/in/adrian-rueda/"
            target="_blank"
            rel="noreferrer"
            className="w-9 h-9 rounded-xl bg-card-elevated hover:bg-card-hover flex items-center justify-center text-muted hover:text-white transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
        </div>
      </div>
    </BentoCard>
  )
}

// Panel central grande de Neural Link con KIRA - CIRCULAR con texto SVG
function NeuralLinkPanel() {
  const { gameState } = useGame()
  
  return (
    <div className="h-full flex items-center justify-center p-2">
      {/* Contenedor circular */}
      <div className="kira-round-bento">
        {/* SVG de texto circular */}
        <svg className="kira-circular-text-svg" viewBox="0 0 200 200">
          <defs>
            {/* Path para texto superior */}
            <path 
              id="kiraTextTop" 
              d="M 25, 100 A 75,75 0 0,1 175,100"
              fill="none"
            />
            {/* Path para texto inferior */}
            <path 
              id="kiraTextBottom" 
              d="M 175, 100 A 75,75 0 0,1 25,100"
              fill="none"
            />
          </defs>
          
          {/* Texto superior */}
          <text className="kira-circular-text">
            <textPath href="#kiraTextTop" startOffset="50%" textAnchor="middle">
              NEURAL LINK ACTIVE
            </textPath>
          </text>
          
          {/* Texto inferior */}
          <text className="kira-circular-text">
            <textPath href="#kiraTextBottom" startOffset="50%" textAnchor="middle">
              • K.I.R.A. SYSTEM •
            </textPath>
          </text>
        </svg>
        
        {/* Anillos exteriores */}
        <div className="kira-round-ring kira-round-ring-outer" />
        <div className="kira-round-ring kira-round-ring-middle" />
        <div className="kira-round-ring kira-round-ring-inner" />
        
        {/* Core con KIRA */}
        <div className="kira-round-core">
          <div className="kira-round-avatar">
            <KiraAvatar size="large" />
          </div>
        </div>
        
        {/* Glow effect */}
        <div className="kira-round-glow" />
      </div>
    </div>
  )
}

function GamePanels() {
  return (
    <CableBridgeProvider>
      <div className="bento-layout">
        {/* Grid Bento Cuadrado - 4x3 */}
        <div className="bento-grid-square">
          {/* FILA 1 */}
          {/* [0] Resonancia */}
          <div className="bento-resonance">
            <BentoCard className="h-full">
              <ResonanceSequenceEngine />
            </BentoCard>
          </div>
          
          {/* [1] Cables Izquierda (sources) */}
          <div className="bento-cables-left">
            <BentoCard className="h-full">
              <CablePanelLeft />
            </BentoCard>
          </div>
          
          {/* [2] Cables Derecha (targets) */}
          <div className="bento-cables-right">
            <BentoCard className="h-full">
              <CablePanelRight />
            </BentoCard>
          </div>
          
          {/* [3] Controles + RRSS */}
          <div className="bento-controls">
            <ControlsCard />
          </div>
          
          {/* FILA 2 */}
          {/* [4] Pistas */}
          <div className="bento-hints">
            <BentoCard className="h-full">
              <HintPanel />
            </BentoCard>
          </div>
          
          {/* [5-6] Neural Link Central (2 columnas) */}
          <div className="bento-neural">
            <NeuralLinkPanel />
          </div>
          
          {/* [7] Frecuencia */}
          <div className="bento-frequency">
            <BentoCard className="h-full">
              <ProtectedPuzzle puzzleType="frequency" variant="cyber">
                <FrequencyControls />
              </ProtectedPuzzle>
            </BentoCard>
          </div>
          
          {/* FILA 3 */}
          {/* [8] Cifrado (debajo de pistas) */}
          <div className="bento-cipher">
            <BentoCard className="h-full">
              <ProtectedPuzzle puzzleType="cipher" variant="quantum">
                <CipherPuzzle />
              </ProtectedPuzzle>
            </BentoCard>
          </div>
        </div>
      </div>
    </CableBridgeProvider>
  )
}

function RootLayout() {
  const { gameState } = useGame()
  const isPortfolio = gameState.activeView === 'portfolio'
  const isBentoScene = gameState.activeView === 'bento-scene'
  
  // Use the new GameBentoLayout for the main game view
  // We can toggle this with a flag or just replace GamePanels
  const useNewLayout = true 

  return (
    <div className="min-h-screen bg-gradient-to-b from-bgStart to-bgEnd text-text font-sans antialiased">
      <main className="min-h-screen">
        {isPortfolio ? (
          <PortfolioView />
        ) : useNewLayout ? (
          <GameBentoLayout />
        ) : isBentoScene ? (
          <BentoScene />
        ) : (
          <GamePanels />
        )}
      </main>
      {!isPortfolio && !useNewLayout && <TelemetryPrompt />}
      {!isPortfolio && !useNewLayout && <IntroCinematic />}
      {/* Note: IntroCinematic and TelemetryPrompt might need to be integrated into GameBentoLayout or handled differently if they are overlays */}
      {useNewLayout && <IntroCinematic />}
      {useNewLayout && <TelemetryPrompt />}
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
