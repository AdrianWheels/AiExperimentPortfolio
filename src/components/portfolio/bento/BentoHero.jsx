import React from 'react'
import profileData from '../../../../data/portfolio/profile.json'

const BentoHero = () => {
  return (
    <div className="relative z-10 flex flex-col items-center h-full pt-8 text-center">
      <div className="flex items-center gap-2 mb-4 opacity-80">
        <span className="text-yellow-300 animate-pulse">✨</span>
        <span className="text-xs font-medium tracking-[0.2em] text-purple-200">SYSTEM ARCHITECT</span>
      </div>

      <h1 className="text-5xl font-bold mb-2 tracking-tight text-white">
        {profileData.name.split(' ')[0]}
      </h1>
      <h1 className="text-5xl font-bold mb-4 tracking-tight text-purple-200">
        {profileData.name.split(' ').slice(1).join(' ')}
      </h1>

      <p className="text-sm text-purple-100 max-w-[80%] leading-relaxed font-medium mb-2">
        {profileData.tagline.normal}
      </p>
      <p className="text-xs text-purple-200/60 max-w-[85%] leading-relaxed font-light italic">
        "Buscando nuevos retos y experimentos locos"
      </p>

      {/* Decorative rings */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] border border-white/5 rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] border border-white/10 rounded-full pointer-events-none"></div>
    </div>
  )
}

export default BentoHero
