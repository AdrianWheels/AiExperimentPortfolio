import React, { useState, useMemo } from 'react'
import projectsData from '../../../../data/portfolio/projects.json'
import ProjectModal from './ProjectModal'
import ProjectCard from './ProjectCard'
import ProjectCardCompact from './ProjectCardCompact'

// Base ID for assets
const BASE_URL = import.meta.env.BASE_URL || '/'

// Images mapping - Hardcoded for demo
const projectImages = {
  'proj-00': [
    `${BASE_URL}projects/coloreverday/coloreveryday.png`,
    `${BASE_URL}projects/coloreverday/coloreveryday-calendar.png`
  ],
  'proj-01': [
    `${BASE_URL}projects/atlas/atlascentromando.png`,
    `${BASE_URL}projects/atlas/atlasfuego.png`,
    `${BASE_URL}projects/atlas/atlasinvernadero.png`,
    `${BASE_URL}projects/atlas/atlasmanos.png`,
    `${BASE_URL}projects/atlas/Atlasnotas.png`
  ],
  'proj-02': [
    `${BASE_URL}projects/vrhat/vrhatintro.png`,
    `${BASE_URL}projects/vrhat/vrhatpiso.png`
  ],
  'proj-03': [
    `${BASE_URL}projects/jr-fisioterapia/desktop.png`,
    `${BASE_URL}projects/jr-fisioterapia/mobile.png`
  ],
  'proj-04': [
    `${BASE_URL}projects/pepa-print3d/desktop.png`,
    `${BASE_URL}projects/pepa-print3d/mobile.png`
  ],
  'proj-picturam': [
    `${BASE_URL}projects/picturam/desktop.png`,
    `${BASE_URL}projects/picturam/mobile.png`
  ],
  'proj-brisca': [
    `${BASE_URL}projects/brisca/desktop.png`,
    `${BASE_URL}projects/brisca/mobile.png`
  ],
  'proj-mementic': [
    `${BASE_URL}projects/mementic/desktop.png`
  ],
  'proj-almeriaah': [
    `${BASE_URL}projects/almeriaah/desktop.png`
  ]
}

const BentoProjects = () => {
  const [selectedProject, setSelectedProject] = useState(null)

  const featured = projectsData.featured || []
  const more = projectsData.more || []
  const totalProjects = featured.length + more.length

  // Generate staggered auto-slide delays for each featured project (3-13 seconds range)
  const autoSlideDelays = useMemo(() => {
    return featured.reduce((acc, project, index) => {
      // Stagger initial delays: 3s base + 2.5s per project + random 0-5s
      const baseDelay = 3000 + (index * 2500) + Math.random() * 5000
      acc[project.id] = baseDelay
      return acc
    }, {})
  }, [featured])

  const handleSelectProject = (project) => {
    setSelectedProject(project)
  }

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase">Projects</h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-500 border border-white/5">
            {totalProjects} TOTAL
          </span>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
          {featured.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              images={projectImages[project.id] || []}
              onSelect={handleSelectProject}
              autoSlideDelay={autoSlideDelays[project.id]}
            />
          ))}

          {more.length > 0 && (
            <>
              <div className="flex items-center gap-2 pt-2 pb-1 px-2">
                <div className="flex-1 h-px bg-white/5"></div>
                <span className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">
                  More
                </span>
                <div className="flex-1 h-px bg-white/5"></div>
              </div>

              <div className="space-y-2">
                {more.map((project) => (
                  <ProjectCardCompact
                    key={project.id}
                    project={project}
                    onSelect={handleSelectProject}
                  />
                ))}
              </div>
            </>
          )}
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
