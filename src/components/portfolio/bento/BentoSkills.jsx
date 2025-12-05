import React from 'react'
import skillsData from '../../../../data/portfolio/skills.json'

const BentoSkills = () => {
  // Flatten all core skills into one list for the cloud
  const allSkills = skillsData.core.flatMap(category => category.items)

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase">Core Skills</h3>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-purple-500 opacity-50">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>

      <div className="flex flex-wrap content-start gap-2 overflow-y-auto custom-scrollbar pr-1">
        {allSkills.map((skill, index) => (
          <span 
            key={index}
            className="px-2.5 py-1.5 bg-white/5 hover:bg-purple-500/20 border border-white/5 hover:border-purple-500/30 rounded-lg text-[11px] text-gray-300 transition-all cursor-default"
          >
            {skill.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export default BentoSkills
