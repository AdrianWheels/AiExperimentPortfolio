import React from 'react'
import { useGame, MODEL } from '../../context/GameContext'
import { CableBridgeProvider, CablePanelLeft, CablePanelRight } from '../puzzles/CableBridge'
import ResonanceSequenceEngine from '../puzzles/new/ResonanceSequenceEngine'
import FrequencyControls from '../puzzles/FrequencyControls'

import KiraAvatar from '../narrative/KiraAvatar'
import ProtectedPuzzle from '../ui/ProtectedPuzzle'
import CipherPuzzle from '../puzzles/new/CipherPuzzle'
import StarryBackground from './StarryBackground'
import KiraMessageBoard from '../ui/KiraMessageBoard'
import NavToggle from '../ui/NavToggle'


const GameBentoLayout = () => {
  const { activeChallenge } = useGame()
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
      <div className="shared-layout-container text-white overflow-y-auto lg:overflow-hidden">
        <StarryBackground />

        {/* CSS for Mobile Mask Reset */}
        <style>{`
          @media (max-width: 1024px) {
            .mobile-mask-reset {
              -webkit-mask-image: none !important;
              mask-image: none !important;
            }
          }
        `}</style>

        <div className="shared-layout-inner min-h-screen lg:h-full lg:overflow-hidden p-4 lg:p-0">
          {/* Bento Grid Container */}
          <div className="w-full h-auto lg:h-full lg:aspect-video relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-4 gap-4 w-full h-auto lg:h-full pb-24 lg:pb-0">

              {/* --- COLUMN 1 --- */}

              {/* 1. Secuencia Resonante (Top Left) */}
              <div className="order-3 lg:order-none col-span-1 lg:col-start-1 lg:row-start-1 lg:row-span-2 bg-[#13131f] rounded-3xl p-4 flex flex-col border border-white/5 relative overflow-hidden group h-64 lg:h-auto">
                <ProtectedPuzzle puzzleType="sound" variant="default">
                  <ResonanceSequenceEngine />
                </ProtectedPuzzle>
              </div>

              {/* 6. Generate / Cipher (Bottom Left - Expanded) */}
              <div className="order-4 lg:order-none col-span-1 lg:col-start-1 lg:row-start-3 lg:row-span-2 bg-[#13131f] rounded-3xl p-4 flex items-center justify-center border border-white/5 relative overflow-hidden h-64 lg:h-auto">
                <div className="w-full h-full overflow-auto">
                  <ProtectedPuzzle puzzleType="cipher" variant="compact">
                    <CipherPuzzle />
                  </ProtectedPuzzle>
                </div>
              </div>


              {/* --- CENTER COLUMN (2 & 3) --- */}

              {/* 2. Your AI Prompt Companion -> Main Title / Status (Top Center) */}
              <div
                className={`order-2 lg:order-none col-span-1 md:col-span-2 lg:col-start-2 lg:col-span-2 lg:row-start-1 lg:row-span-2 ${currentTheme.bg} rounded-3xl p-6 lg:p-8 flex flex-col items-center text-center relative overflow-hidden border border-white/10 transition-colors duration-1000 min-h-[300px] lg:min-h-0 mobile-mask-reset`}
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

                  <h1 className="text-4xl lg:text-5xl font-bold mb-2 tracking-tight scan-text">
                    {"Adrian Rueda".split('').map((char, i) => (
                      <span key={i} style={{ animationDelay: `${1.4 + i * 0.05}s` }}>{char === ' ' ? '\u00A0' : char}</span>
                    ))}
                  </h1>

                  <h1 className={`text-4xl lg:text-5xl font-bold mb-8 tracking-tight ${currentTheme.accent} transition-colors duration-1000 scan-text`}>
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
                className="order-5 lg:order-none col-span-1 lg:col-start-2 lg:row-start-3 lg:row-span-2 bg-[#13131f] rounded-3xl p-4 flex flex-col border border-white/5 relative group overflow-hidden h-64 lg:h-auto mobile-mask-reset"
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
                className="order-6 lg:order-none col-span-1 lg:col-start-3 lg:row-start-3 lg:row-span-2 bg-[#13131f] rounded-3xl p-4 flex flex-col border border-white/5 relative overflow-hidden h-64 lg:h-auto mobile-mask-reset"
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

              {/* 3. Nav Toggle (Top Right) */}
              <div className="order-1 lg:order-none col-span-1 md:col-span-2 lg:col-start-4 lg:row-start-1 bg-[#13131f] rounded-3xl p-4 flex items-center justify-center border border-white/5 h-20 lg:h-auto">
                <NavToggle />
              </div>

              {/* 4. Control Frecuencia (Middle Right - Expanded) */}
              <div className="order-7 lg:order-none col-span-1 lg:col-start-4 lg:row-start-2 lg:row-span-3 bg-[#13131f] rounded-3xl p-4 flex flex-col justify-center border border-white/5 relative overflow-hidden h-80 lg:h-auto">
                <ProtectedPuzzle puzzleType="frequency" variant="default">
                  <FrequencyControls />
                </ProtectedPuzzle>
              </div>

            </div>

            {/* CENTRAL ORB - Imagen de KIRA */}
            {/* Mobile: Fixed Top-Right overlapping Nav, Larger. Desktop: Absolute Center of Aspect Video */}
            <div className="
              fixed top-16 right-4 w-28 h-28 z-50 
              lg:absolute lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-[200px] lg:h-[200px] 
              pointer-events-none flex items-center justify-center
            ">
              {/* Outer Ring */}
              <div className="absolute inset-0 rounded-full border border-white/10 shadow-[0_0_30px_rgba(124,58,237,0.2)]"></div>

              {/* Inner Spinning Rings - percentages to scale with container */}
              <div className="absolute w-[90%] h-[90%] border border-white/5 rounded-full animate-[spin_10s_linear_infinite]"></div>
              <div className="absolute w-[80%] h-[80%] border border-white/5 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>

              {/* Circular Text */}
              <div className="absolute w-[110%] h-[110%] animate-[spin_20s_linear_infinite] opacity-50 lg:opacity-100">
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
              <div className="w-[65%] h-[65%] rounded-full bg-black relative overflow-hidden shadow-[0_0_50px_rgba(139,92,246,0.6)] border border-white/20 pointer-events-auto">
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
              <div className="hidden lg:block absolute text-[8px] text-white/30 font-mono tracking-widest w-full text-center top-1/2 -translate-y-1/2 rotate-12 pointer-events-none">
                100 110101 100011
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* KIRA Message Board - fijo en la parte inferior de la pantalla */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 max-w-[1600px] w-full px-4 lg:px-8 z-30">
        <KiraMessageBoard />
      </div>
    </CableBridgeProvider>
  )
}

export default GameBentoLayout
