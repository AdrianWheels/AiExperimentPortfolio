import React from 'react'
import experienceData from '../../../../data/portfolio/experience.json'

const BentoTimeline = () => {
  return (
    <div className="h-full flex flex-col relative">
      <div className="flex items-center gap-2 mb-4 px-2">
        <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase">Timeline</h3>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
        {experienceData.timeline.map((item) => (
          <div key={item.id} className="relative pl-4 border-l border-white/10">
            <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#13131f] border border-purple-500/50"></div>
            
            <div className="mb-1">
              <span className="text-[10px] font-mono text-purple-400">{item.period}</span>
              <h4 className="text-sm font-bold text-white">{item.role}</h4>
              <p className="text-xs text-gray-400">{item.company}</p>
            </div>
            
            <p className="text-[11px] text-gray-500 leading-relaxed">
              {item.summary}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BentoTimeline
