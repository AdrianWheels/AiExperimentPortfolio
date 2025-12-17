import React, { useState, useMemo } from 'react'
import projectsData from '../../../../data/portfolio/projects.json'
import ProjectModal from './ProjectModal'
import ProjectCard from './ProjectCard'

// Images mapping - Hardcoded for demo
const projectImages = {
  'proj-00': [
    '/projects/coloreverday/coloreveryday.png',
    '/projects/coloreverday/coloreveryday-calendar.png'
  ],
  'proj-01': [
    '/projects/atlas/atlascentromando.png',
    '/projects/atlas/atlasfuego.png',
    '/projects/atlas/atlasinvernadero.png',
    '/projects/atlas/atlasmanos.png',
    '/projects/atlas/Atlasnotas.png'
  ],
  'proj-02': [
    '/projects/vrhat/vrhatintro.png',
    '/projects/vrhat/vrhatpiso.png'
  ]
}

const BentoProjects = () => {
  const [selectedProject, setSelectedProject] = useState(null)

  // Generate staggered auto-slide delays for each project (3-13 seconds range)
  const autoSlideDelays = useMemo(() => {
    return projectsData.featured.reduce((acc, project, index) => {
      // Stagger initial delays: 3s base + 2.5s per project + random 0-5s
      const baseDelay = 3000 + (index * 2500) + Math.random() * 5000
      acc[project.id] = baseDelay
      return acc
    }, {})
  }, [])

  const handleSelectProject = (project) => {
    setSelectedProject(project)
  }

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
            <ProjectCard
              key={project.id}
              project={project}
              images={projectImages[project.id] || []}
              onSelect={handleSelectProject}
              autoSlideDelay={autoSlideDelays[project.id]}
            />
          ))}
        </div>
      </div>
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        projectImages={projectImages}
      />
    </>
  )
}

export default BentoProjects

