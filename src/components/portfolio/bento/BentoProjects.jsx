import React, { useState } from 'react'
import projectsData from '../../../../data/portfolio/projects.json'
import ProjectModal from './ProjectModal'

const BentoProjects = () => {
  const [selectedProject, setSelectedProject] = useState(null)

  return (
    <>
      <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase">Projects</h3>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-500 border border-white/5">
          {projectsData.featured.length} ACTIVE
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        {projectsData.featured.map((project) => (
          <div 
            key={project.id}
            onClick={() => setSelectedProject(project)}
            className="group bg-white/5 hover:bg-white/10 rounded-xl p-4 border border-white/5 hover:border-purple-500/30 transition-all cursor-pointer"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors">
                {project.name}
              </h4>
              <span className="text-[10px] text-gray-500 font-mono">{project.year}</span>
            </div>
            
            <p className="text-[11px] text-gray-400 leading-relaxed mb-3 line-clamp-3">
              {project.description.normal}
            </p>
            
            <div className="flex flex-wrap gap-1.5">
              {project.tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-black/20 text-gray-500 border border-white/5">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
    <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </>
  )
}

export default BentoProjects
