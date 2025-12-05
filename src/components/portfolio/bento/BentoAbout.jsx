import React from 'react'
import profileData from '../../../../data/portfolio/profile.json'

const BentoAbout = () => {
  return (
    <div className="h-full flex flex-col justify-center p-2">
      <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">About</h3>
      
      <p className="text-sm text-gray-300 leading-relaxed mb-4">
        {profileData.summary.normal}
      </p>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white/5 rounded-lg p-2 border border-white/5">
          <span className="block text-[10px] text-gray-500 uppercase tracking-wider">Location</span>
          <span className="text-xs text-white">{profileData.location}</span>
        </div>
        <div className="bg-white/5 rounded-lg p-2 border border-white/5">
          <span className="block text-[10px] text-gray-500 uppercase tracking-wider">Status</span>
          <span className="text-xs text-orange-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
            Employed
          </span>
        </div>
      </div>
    </div>
  )
}

export default BentoAbout
