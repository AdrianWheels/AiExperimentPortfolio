import React from 'react'
import StarryBackground from '../../layout/StarryBackground'
import BentoHero from './BentoHero'
import BentoProjects from './BentoProjects'
import BentoSkills from './BentoSkills'
import BentoTimeline from './BentoTimeline'
import BentoAbout from './BentoAbout'
import BentoSocials from './BentoSocials'
import KiraMessageBoard from '../../ui/KiraMessageBoard'
import NavToggle from '../../ui/NavToggle'

const PortfolioBentoLayout = () => {
  const biteRadius = '100px'
  const BASE_URL = import.meta.env.BASE_URL || '/'

  return (
    <div className="shared-layout-container bg-[#0a0a12] overflow-hidden">
      <StarryBackground />

      {/* MOBILE STICKY HEADER - Solo visible en móvil/tablet */}
      <div className="mobile-sticky-header md:hidden">
        {/* Avatar del usuario */}
        <div className="mobile-header-avatar">
          <img
            src={`${BASE_URL}me.jpg`}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Navegación y controles - toggle único + iconos */}
        <div className="mobile-header-nav">
          <NavToggle variant="mobile" />
        </div>

        {/* Social links compactos */}
        <div className="flex gap-2">
          <BentoSocials compact />
        </div>
      </div>

      {/* CSS for Mobile Mask Reset */}
      <style>{`
        @media (max-width: 768px) {
          .mobile-mask-reset {
            -webkit-mask-image: none !important;
            mask-image: none !important;
          }
        }
      `}</style>

      {/* Main Container - Aspect Video on Desktop, Auto on Mobile */}
      <div className="shared-layout-inner md:aspect-video flex flex-col md:block relative">

        {/* Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-4 gap-4 w-full h-full">

          {/* --- COLUMN 1 --- */}

          {/* Top Left: Skills */}
          <div className="md:col-start-1 md:row-start-1 md:row-span-2 bg-[#13131f] rounded-3xl p-4 flex flex-col border border-white/5 relative overflow-hidden group h-64 md:h-auto">
            <BentoSkills />
          </div>

          {/* Bottom Left: About */}
          <div className="md:col-start-1 md:row-start-3 md:row-span-2 bg-[#13131f] rounded-3xl p-4 flex flex-col border border-white/5 relative overflow-hidden h-64 md:h-auto">
            <BentoAbout />
          </div>


          {/* --- CENTER COLUMN (2 & 3) --- */}

          {/* Top Center: Hero */}
          <div
            className="md:col-start-2 md:col-span-2 md:row-start-1 md:row-span-2 bg-[#5b21b6] rounded-3xl p-4 flex flex-col items-center text-center relative overflow-hidden border border-white/10 h-80 md:h-auto mobile-mask-reset"
            style={{
              maskImage: `radial-gradient(circle at 50% calc(100% + 8px), transparent ${biteRadius}, black ${biteRadius})`,
              WebkitMaskImage: `radial-gradient(circle at 50% calc(100% + 8px), transparent ${biteRadius}, black ${biteRadius})`
            }}
          >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#7c3aed] to-[#4c1d95] opacity-100"></div>
            <BentoHero />
          </div>

          {/* Bottom Center: Timeline (Merged) */}
          <div
            className="md:col-start-2 md:col-span-2 md:row-start-3 md:row-span-2 bg-[#13131f] rounded-3xl p-4 flex flex-col border border-white/5 relative group overflow-hidden h-80 md:h-auto mobile-mask-reset"
            style={{
              maskImage: `radial-gradient(circle at 50% -8px, transparent ${biteRadius}, black ${biteRadius})`,
              WebkitMaskImage: `radial-gradient(circle at 50% -8px, transparent ${biteRadius}, black ${biteRadius})`
            }}
          >
            <BentoTimeline />
          </div>


          {/* --- COLUMN 4 --- */}

          {/* Top Right: NavToggle + Socials - Oculto en móvil porque está en el header */}
          <div className="hidden md:flex md:col-start-4 md:row-start-1 bg-[#13131f] rounded-3xl p-4 flex-col items-center justify-center gap-3 border border-white/5 h-32 md:h-auto">
            <NavToggle />
            <div className="w-12 h-px bg-white/10"></div>
            <BentoSocials />
          </div>

          {/* Right Column: Projects */}
          <div className="md:col-start-4 md:row-start-2 md:row-span-3 bg-[#13131f] rounded-3xl p-4 flex flex-col border border-white/5 relative overflow-hidden h-96 md:h-auto">
            <BentoProjects />
          </div>

        </div>

        {/* CENTRAL ORB - User Photo */}
        {/* Mobile: Oculto (foto en header sticky). Desktop: Centrado absolutamente */}
        <div className="
            hidden md:flex
            md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[200px] md:h-[200px] 
            pointer-events-none items-center justify-center
        ">
          {/* Outer Ring */}
          <div className="absolute inset-0 rounded-full border border-white/10 shadow-[0_0_30px_rgba(124,58,237,0.2)]"></div>

          {/* Inner Spinning Rings */}
          <div className="absolute w-[90%] h-[90%] border border-white/5 rounded-full animate-[spin_10s_linear_infinite]"></div>
          <div className="absolute w-[80%] h-[80%] border border-white/5 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>

          {/* Core Orb with Photo */}
          <div className="w-[65%] h-[65%] rounded-full bg-black relative overflow-hidden shadow-[0_0_50px_rgba(139,92,246,0.6)] border border-white/20 pointer-events-auto">
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-500 via-purple-600 to-blue-500 opacity-80 blur-md animate-pulse"></div>
            <div className="absolute inset-1 bg-black rounded-full overflow-hidden flex items-center justify-center">
              <img
                src={`${BASE_URL}me.jpg`}
                alt="Profile"
                className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-500"
              />
            </div>
          </div>
        </div>

      </div>

      {/* KIRA Message Board - fijo en la parte inferior de la pantalla */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 max-w-[1600px] w-full px-8 z-30">
        <KiraMessageBoard />
      </div>
    </div>
  )
}

export default PortfolioBentoLayout
