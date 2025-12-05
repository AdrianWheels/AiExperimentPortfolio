import React from 'react'
import { useGame } from '../../context/GameContext'
import AriaAvatar from '../narrative/AriaAvatar'
import ResonanceSequenceEngine from '../puzzles/new/ResonanceSequenceEngine'
import FrequencyControls from '../puzzles/FrequencyControls'
import Terminal from '../narrative/Terminal'
import { CableBridgeProvider, CablePanelLeft, CablePanelRight } from '../puzzles/CableBridge'

/**
 * BentoLayout - Diseño estilo PromptPal con orbe central
 * El círculo central "corta" visualmente los paneles circundantes
 */

// Card Bento base con soporte para clip-path
function BentoCard({ children, className = '', style = {} }) {
  return (
    <div className={`promptpal-card ${className}`} style={style}>
      {children}
    </div>
  )
}

// ===== PANELES INDIVIDUALES =====

// Panel 1: Secuencia Resonante (arriba izquierda)
function ResonancePanel() {
  return (
    <BentoCard className="h-full flex flex-col">
      <div className="flex items-center gap-3 mb-3">
        <span className="pp-icon pp-icon-purple">🎵</span>
        <div>
          <h3 className="text-white font-semibold text-sm leading-tight">Secuencia</h3>
          <h3 className="text-white font-semibold text-sm leading-tight">Resonante</h3>
        </div>
      </div>
      <p className="text-[10px] text-white/40 mb-1">14 days trial</p>
      <p className="text-[10px] text-white/30">after ~ $5/month</p>
      <div className="flex-1 overflow-hidden mt-3 min-h-0">
        <ResonanceSequenceEngine />
      </div>
    </BentoCard>
  )
}

// Panel 2: Pistas / 12K Users
function HintsPanel() {
  return (
    <BentoCard className="h-full flex flex-col justify-center items-center text-center">
      <span className="text-2xl font-bold text-white mb-0.5">12K</span>
      <p className="text-[10px] text-white/40 mb-1.5">happy users</p>
      <div className="flex -space-x-2">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-2 border-[#12121a]"></div>
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-red-500 border-2 border-[#12121a] flex items-center justify-center">
          <span className="text-[8px]">✨</span>
        </div>
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 border-2 border-[#12121a]"></div>
      </div>
    </BentoCard>
  )
}

// Panel 3: Portfolio Button
function PortfolioButton() {
  const { setActiveView } = useGame()
  return (
    <BentoCard className="h-full flex items-center justify-center">
      <button 
        onClick={() => setActiveView('portfolio')}
        className="pp-cta-button"
      >
        <span>🎯</span>
        <span>Portfolio</span>
      </button>
    </BentoCard>
  )
}

// Panel 4: Icono pequeño (arriba derecha)
function IconPanel() {
  return (
    <BentoCard className="h-full flex items-center justify-center">
      <div className="pp-icon pp-icon-purple">
        <span>✨</span>
      </div>
    </BentoCard>
  )
}

// Panel 5: Stats 25M
function StatsPanel() {
  return (
    <BentoCard className="h-full flex flex-col justify-center items-center">
      <span className="text-4xl font-bold text-white">25M</span>
      <div className="flex items-center gap-1 text-[10px] text-white/40 mt-2">
        <span className="w-0.5 h-3 bg-orange-500 rounded-sm"></span>
        <span>created prompts</span>
        <span className="w-0.5 h-3 bg-orange-500 rounded-sm"></span>
      </div>
    </BentoCard>
  )
}

// Panel 6: Saltar puzzles + RRSS
function ControlsPanel() {
  const { handleTerminalCommand } = useGame()
  return (
    <BentoCard className="h-full flex flex-col">
      <h4 className="text-white font-semibold text-xs mb-0.5">saltar puzzles</h4>
      <p className="text-[10px] text-white/40 mb-2">rrss</p>
      <button
        onClick={() => handleTerminalCommand('bypass')}
        className="text-[10px] px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors mb-auto"
      >
        Skip all
      </button>
      <div className="flex gap-2 mt-2">
        <a href="https://github.com/AdrianWheels" target="_blank" rel="noreferrer"
          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </a>
        <a href="https://www.linkedin.com/in/adrian-rueda/" target="_blank" rel="noreferrer"
          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        </a>
      </div>
    </BentoCard>
  )
}

// Panel 7: Control Frecuencia
function FrequencyPanel() {
  return (
    <BentoCard className="h-full flex flex-col">
      <h4 className="text-white font-semibold text-xs mb-0.5">control</h4>
      <p className="text-[10px] text-white/40 mb-2">frecuencia</p>
      <div className="flex-1 min-h-0">
        <FrequencyControls compact />
      </div>
    </BentoCard>
  )
}

// Panel 8: Neural cross wiring left
function CablesLeftPanel() {
  return (
    <BentoCard className="h-full flex flex-col items-center justify-center text-center">
      <span className="pp-icon-small pp-icon-orange mb-2">🔌</span>
      <h4 className="text-white font-medium text-xs">neural cross</h4>
      <h4 className="text-white font-medium text-xs">wiring left</h4>
      <p className="text-[9px] text-white/40 mt-1">Conexiones con branching.</p>
    </BentoCard>
  )
}

// Panel 9: Neural cross wiring right
function CablesRightPanel() {
  return (
    <BentoCard className="h-full flex flex-col items-center justify-center text-center">
      <span className="pp-icon-small pp-icon-cyan mb-2">🔗</span>
      <h4 className="text-white font-medium text-xs">neural cross</h4>
      <h4 className="text-white font-medium text-xs">wiring right</h4>
      <p className="text-[9px] text-white/40 mt-1">Precisión con keywords.</p>
    </BentoCard>
  )
}

// Panel 10: Consola / Templates
function ConsolePanel() {
  return (
    <BentoCard className="h-full flex flex-col">
      <h4 className="text-white font-semibold text-xs mb-0.5">consola</h4>
      <p className="text-[10px] text-white/40 mb-2">Terminal interactiva.</p>
      <div className="flex-1 rounded-lg bg-black/20 p-2 overflow-hidden">
        <div className="flex items-center gap-1 mb-2">
          <span className="px-1.5 py-0.5 bg-orange-500/20 text-orange-400 text-[9px] rounded">14 days trial</span>
        </div>
        <div className="flex flex-wrap gap-1">
          <span className="text-[8px] px-1 py-0.5 bg-white/5 rounded text-white/50">Rewrite</span>
          <span className="text-[8px] px-1 py-0.5 bg-purple-500/20 rounded text-purple-300">PDF</span>
          <span className="text-[8px] px-1 py-0.5 bg-white/5 rounded text-white/50">PNG</span>
          <span className="text-[8px] px-1 py-0.5 bg-white/5 rounded text-white/50">JPG</span>
        </div>
        <div className="flex gap-1 mt-2">
          <div className="w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center">
            <span className="text-[8px]">📷</span>
          </div>
          <div className="w-5 h-5 rounded bg-red-500/20 flex items-center justify-center">
            <span className="text-[8px]">🎬</span>
          </div>
        </div>
      </div>
    </BentoCard>
  )
}

// ===== PANEL CENTRAL CON KIRA =====
function CentralOrb() {
  return (
    <div className="pp-central">
      {/* Fondo púrpura */}
      <div className="pp-central-bg">
        <div className="pp-central-header">
          <span className="pp-central-logo">✨ PromptPal</span>
          <h2 className="pp-central-title">Your AI Prompt</h2>
          <h2 className="pp-central-title">Companion</h2>
        </div>
      </div>
      
      {/* Círculo central que sobresale */}
      <div className="pp-orb">
        {/* Texto binario rotatorio */}
        <svg className="pp-orb-text-ring" viewBox="0 0 300 300">
          <defs>
            <path 
              id="textRing" 
              d="M 150,150 m -125,0 a 125,125 0 1,1 250,0 a 125,125 0 1,1 -250,0"
              fill="none"
            />
          </defs>
          <text>
            <textPath href="#textRing" className="pp-orb-binary">
              ✦ 1 0 1 0 1 0 ✦ 1 0 0 0 1 1 ✦ 1 0 0 1 0 1 1 0 ✦ 0 ✦ 1 0 1 0 1 0 ✦ 0 1 1 0 1 ✦ 1 0 0 1 0 ✦ 1 0 0 1 1 0 1 ✦ 1 0 1 0 1
            </textPath>
          </text>
        </svg>
        
        {/* Glow exterior */}
        <div className="pp-orb-glow"></div>
        
        {/* Anillos decorativos */}
        <div className="pp-orb-ring-outer"></div>
        <div className="pp-orb-ring-inner"></div>
        
        {/* Core con avatar */}
        <div className="pp-orb-core">
          <AriaAvatar size="large" />
        </div>
      </div>
    </div>
  )
}

// ===== LAYOUT PRINCIPAL =====
export default function BentoLayout() {
  return (
    <CableBridgeProvider>
      <div className="pp-layout">
        <div className="pp-grid">
          {/* Posiciones del grid con nombres de área */}
          <div className="pp-area-resonance"><ResonancePanel /></div>
          <div className="pp-area-central"><CentralOrb /></div>
          <div className="pp-area-icon"><IconPanel /></div>
          <div className="pp-area-stats"><StatsPanel /></div>
          <div className="pp-area-hints"><HintsPanel /></div>
          <div className="pp-area-controls"><ControlsPanel /></div>
          <div className="pp-area-frequency"><FrequencyPanel /></div>
          <div className="pp-area-generate"><PortfolioButton /></div>
          <div className="pp-area-cables-left"><CablesLeftPanel /></div>
          <div className="pp-area-cables-right"><CablesRightPanel /></div>
          <div className="pp-area-console"><ConsolePanel /></div>
        </div>
      </div>
    </CableBridgeProvider>
  )
}
