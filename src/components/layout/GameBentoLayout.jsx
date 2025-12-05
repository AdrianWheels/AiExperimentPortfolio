import React from 'react'
import { useGame, MODEL } from '../../context/GameContext'
import { CableBridgeProvider, CablePanelLeft, CablePanelRight } from '../puzzles/CableBridge'
import ResonanceSequenceEngine from '../puzzles/new/ResonanceSequenceEngine'
import FrequencyControls from '../puzzles/FrequencyControls'
import HintPanel from '../narrative/HintPanel'
import KiraAvatar from '../narrative/KiraAvatar'
import ProtectedPuzzle from '../ui/ProtectedPuzzle'
import CipherPuzzle from '../puzzles/new/CipherPuzzle'
import StarryBackground from './StarryBackground'
import NewsTicker from '../ui/NewsTicker'

const GameBentoLayout = () => {
  const { setActiveView, triggerBypass, resetGame, activeChallenge } = useGame()
  const biteRadius = '100px'

  const STATUS_THEMES = {
    sound: {
      bg: 'bg-[#5b21b6]',
      gradient: 'from-[#7c3aed] to-[#4c1d95]',
      accent: 'text-purple-100'
    },
    cipher: {
      bg: 'bg-indigo-900',
      gradient: 'from-indigo-600 to-indigo-950',
      accent: 'text-indigo-100'
    },
    frequency: {
      bg: 'bg-blue-900',
      gradient: 'from-blue-600 to-blue-950',
      accent: 'text-blue-100'
    },
    wiring: {
      bg: 'bg-cyan-900',
      gradient: 'from-cyan-600 to-cyan-950',
      accent: 'text-cyan-100'
    },
    security: {
      bg: 'bg-teal-900',
      gradient: 'from-teal-600 to-teal-950',
      accent: 'text-teal-100'
    },
    free: {
      bg: 'bg-emerald-900',
      gradient: 'from-emerald-600 to-emerald-950',
      accent: 'text-emerald-100'
    }
  }

  const currentTheme = STATUS_THEMES[activeChallenge] || STATUS_THEMES.sound

  return (
    <CableBridgeProvider>
      <div className="min-h-screen text-white p-8 pb-24 font-sans flex items-center justify-center relative">
        <StarryBackground />
        <div className="relative z-10 max-w-[1600px] w-full mx-auto">
          {/* Bento Grid Container */}
          <div className="aspect-video w-full relative">
            <div className="grid grid-cols-4 grid-rows-4 gap-4 w-full h-full">
            
            {/* --- COLUMN 1 --- */}
            
            {/* 1. Secuencia Resonante (Top Left) */}
            <div className="col-start-1 row-start-1 row-span-2 bg-[#13131f] rounded-3xl p-4 flex flex-col border border-white/5 relative overflow-hidden group">
              <ProtectedPuzzle puzzleType="sound" variant="default">
                <ResonanceSequenceEngine />
              </ProtectedPuzzle>
            </div>

            {/* 6. Generate / Cipher (Bottom Left - Expanded) */}
            <div className="col-start-1 row-start-3 row-span-2 bg-[#13131f] rounded-3xl p-4 flex items-center justify-center border border-white/5 relative overflow-hidden">
               <div className="w-full h-full overflow-auto">
                  <ProtectedPuzzle puzzleType="cipher" variant="compact">
                    <CipherPuzzle />
                  </ProtectedPuzzle>
               </div>
            </div>


            {/* --- CENTER COLUMN (2 & 3) --- */}

            {/* 2. Your AI Prompt Companion -> Main Title / Status (Top Center) */}
            <div 
              className={`col-start-2 col-span-2 row-start-1 row-span-2 ${currentTheme.bg} rounded-3xl p-8 flex flex-col items-center text-center relative overflow-hidden border border-white/10 transition-colors duration-1000`}
              style={{
                maskImage: `radial-gradient(circle at 50% calc(100% + 8px), transparent ${biteRadius}, black ${biteRadius})`,
                WebkitMaskImage: `radial-gradient(circle at 50% calc(100% + 8px), transparent ${biteRadius}, black ${biteRadius})`
              }}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-b ${currentTheme.gradient} opacity-100 transition-colors duration-1000`}></div>
              
              {/* Sonar Wave Effect */}
              <div className="sonar-wave"></div>
              <div className="sonar-wave" style={{ animationDelay: '2s' }}></div>
              
              {/* Content */}
              <div className="relative z-10 flex flex-col items-center h-full pt-4">
                <div className="flex items-center gap-2 mb-2 opacity-80">
                  <span className="text-yellow-300">✨</span>
                  <span className="text-sm font-medium tracking-wide">SYSTEM STATUS</span>
                </div>
                
                <h1 className="text-5xl font-bold mb-2 tracking-tight scan-text">
                  {"Adrian Rueda".split('').map((char, i) => (
                    <span key={i} style={{ animationDelay: `${1.4 + i * 0.05}s` }}>{char === ' ' ? '\u00A0' : char}</span>
                  ))}
                </h1>
                
                <h1 className={`text-5xl font-bold mb-8 tracking-tight ${currentTheme.accent} transition-colors duration-1000 scan-text`}>
                  {"Dev".split('').map((char, i) => (
                    <span key={i} style={{ animationDelay: `${1.0 + i * 0.05}s` }}>{char}</span>
                  ))}
                </h1>
                
                {/* Decorative rings inside the card (clipped by mask) */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] border border-white/5 rounded-full pointer-events-none"></div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] border border-white/10 rounded-full pointer-events-none"></div>
              </div>
            </div>

            {/* 7. Neural Cross Wiring Left (Bottom Center Left) */}
            <div 
              className="col-start-2 row-start-3 row-span-2 bg-[#13131f] rounded-3xl p-4 flex flex-col border border-white/5 relative group overflow-hidden"
              style={{
                maskImage: `radial-gradient(circle at calc(100% + 8px) calc(0% - 8px), transparent ${biteRadius}, black ${biteRadius})`,
                WebkitMaskImage: `radial-gradient(circle at calc(100% + 8px) calc(0% - 8px), transparent ${biteRadius}, black ${biteRadius})`
              }}
            >
               <div className="w-full h-full overflow-hidden">
                 <ProtectedPuzzle puzzleType="wiring" variant="default">
                    <CablePanelLeft />
                 </ProtectedPuzzle>
               </div>
            </div>

            {/* 8. Neural Cross Wiring Right (Bottom Center Right) */}
            <div 
              className="col-start-3 row-start-3 row-span-2 bg-[#13131f] rounded-3xl p-4 flex flex-col border border-white/5 relative overflow-hidden"
              style={{
                maskImage: `radial-gradient(circle at calc(0% - 8px) calc(0% - 8px), transparent ${biteRadius}, black ${biteRadius})`,
                WebkitMaskImage: `radial-gradient(circle at calc(0% - 8px) calc(0% - 8px), transparent ${biteRadius}, black ${biteRadius})`
              }}
            >
               <div className="w-full h-full overflow-hidden">
                 <ProtectedPuzzle puzzleType="wiring" variant="default">
                    <CablePanelRight />
                 </ProtectedPuzzle>
               </div>
            </div>


            {/* --- COLUMN 4 --- */}

            {/* 3. Saltar Puzles / RRSS (Top Right) */}
            <div className="col-start-4 row-start-1 bg-[#13131f] rounded-3xl p-6 flex items-center justify-center border border-white/5">
              <div className="flex flex-col gap-3 w-full">
                 <div className="flex gap-2">
                    <button
                        onClick={triggerBypass}
                        className="flex-1 py-3 px-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-[10px] font-bold tracking-wider transition-all border border-red-500/20 hover:border-red-500/40 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] flex items-center justify-center gap-2 group"
                        title="Saltar Puzles"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                        SALTAR
                    </button>
                    <button
                        onClick={resetGame}
                        className="flex-1 py-3 px-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-xl text-[10px] font-bold tracking-wider transition-all border border-cyan-500/20 hover:border-cyan-500/40 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] flex items-center justify-center gap-2 group"
                        title="Reiniciar Juego"
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                        RESET
                    </button>
                 </div>
                 <div className="flex gap-3 justify-center">
                    <a href="https://github.com/AdrianWheels" target="_blank" rel="noreferrer" className="flex-1 py-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all border border-white/5 hover:border-white/20 flex items-center justify-center group">
                       <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400 group-hover:text-white transition-colors"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                    </a>
                    <a href="https://www.linkedin.com/in/adrian-rueda/" target="_blank" rel="noreferrer" className="flex-1 py-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all border border-white/5 hover:border-white/20 flex items-center justify-center group">
                       <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400 group-hover:text-blue-400 transition-colors"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    </a>
                 </div>
              </div>
            </div>

            {/* 4. Control Frecuencia (Middle Right - Expanded) */}
            <div className="col-start-4 row-start-2 row-span-3 bg-[#13131f] rounded-3xl p-4 flex flex-col justify-center border border-white/5 relative overflow-hidden">
               <ProtectedPuzzle puzzleType="frequency" variant="default">
                  <FrequencyControls />
               </ProtectedPuzzle>
            </div>

          </div>
          </div>

          {/* CENTRAL ORB - Imagen de KIRA */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] pointer-events-none z-50 flex items-center justify-center">
             {/* Outer Ring */}
             <div className="absolute inset-0 rounded-full border border-white/10 shadow-[0_0_30px_rgba(124,58,237,0.2)]"></div>
             
             {/* Inner Spinning Rings */}
             <div className="absolute w-[180px] h-[180px] border border-white/5 rounded-full animate-[spin_10s_linear_infinite]"></div>
             <div className="absolute w-[160px] h-[160px] border border-white/5 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
             
             {/* Circular Text */}
             <div className="absolute w-[220px] h-[220px] animate-[spin_20s_linear_infinite]">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <path id="circlePath" d="M 50, 50 m -44, 0 a 44,44 0 1,1 88,0 a 44,44 0 1,1 -88,0" fill="none" />
                  <text className="text-[5.5px] font-mono font-bold tracking-[1.5px] fill-white/40">
                    <textPath href="#circlePath" startOffset="0%">
                      ARTIFICIAL INTELLIGENCE • K.I.R.A. {MODEL} • 
                    </textPath>
                  </text>
                </svg>
             </div>

             {/* Core Orb with KiraAvatar */}
             <div className="w-32 h-32 rounded-full bg-black relative overflow-hidden shadow-[0_0_50px_rgba(139,92,246,0.6)] border border-white/20 pointer-events-auto">
                <div className="absolute inset-0 bg-gradient-to-tr from-orange-500 via-purple-600 to-blue-500 opacity-80 blur-md animate-pulse"></div>
                <div className="absolute inset-2 bg-black rounded-full overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30"></div>
                  <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 to-pink-500 blur-xl opacity-50 animate-[spin_3s_linear_infinite]"></div>
                  
                  {/* KIRA AVATAR */}
                  <div className="relative z-10 w-full h-full">
                    <KiraAvatar />
                  </div>
                </div>
             </div>
             
             {/* Floating Code Text */}
             <div className="absolute text-[8px] text-white/30 font-mono tracking-widest w-full text-center top-1/2 -translate-y-1/2 rotate-12 pointer-events-none">
                100 110101 100011
             </div>
          </div>

        </div>
      </div>
      
      {/* News Ticker - fijo en la parte inferior de la pantalla */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 max-w-[1600px] w-full px-8 z-30">
        <NewsTicker />
      </div>
    </CableBridgeProvider>
  )
}

export default GameBentoLayout
