import { useState, useEffect, useRef } from 'react'

type Tier = 'featured' | 'more'

interface Project {
  slug: string
  title: string
  year: string
  description: string
  tags: string[]
  images: string[]
  tier?: Tier
}

interface Props {
  projects: Project[]
  locale?: string
  headerTitle?: string
  activeLabel?: string
  ctaText?: string
  projectsBasePath?: string
}

function ProjectCard({ project, ctaText = 'Ver proyecto →', projectsBasePath = '/projects' }: { project: Project; ctaText?: string; projectsBasePath?: string }) {
  const [isHovered, setIsHovered] = useState(false)
  const [isAutoSliding, setIsAutoSliding] = useState(false)
  const isHoveredRef = useRef(false)

  const primaryImage = project.images[0] || null
  const hasImages = project.images.length > 0

  // Auto-slide with staggered timing
  useEffect(() => {
    if (!hasImages) return

    const baseDelay = 3000 + Math.random() * 10000

    const triggerAutoSlide = () => {
      if (!isHoveredRef.current) {
        setIsAutoSliding(true)
        setTimeout(() => setIsAutoSliding(false), 1200)
      }
    }

    const initialDelay = setTimeout(triggerAutoSlide, baseDelay)
    const interval = setInterval(triggerAutoSlide, baseDelay + 8000 + Math.random() * 5000)

    return () => {
      clearTimeout(initialDelay)
      clearInterval(interval)
    }
  }, [hasImages])

  const showImageSlide = isHovered || isAutoSliding

  return (
    <a
      href={`${projectsBasePath}/${project.slug}`}
      className="project-card-container group"
      onMouseEnter={() => { setIsHovered(true); isHoveredRef.current = true }}
      onMouseLeave={() => { setIsHovered(false); isHoveredRef.current = false }}
    >
      <div className="project-card-content">
        <div className="project-card-content-inner">
          <div className="project-card-header">
            <h4 className="project-card-title">{project.title}</h4>
            <span className="project-card-year">{project.year}</span>
          </div>
          <p className="project-card-description">{project.description}</p>
          <div className="project-card-tags">
            {project.tags.slice(0, 3).map(tag => (
              <span key={tag} className="project-card-tag">{tag}</span>
            ))}
          </div>
          <div className="project-card-cta">
            <span className="text-xs text-purple-400 font-medium">{ctaText}</span>
          </div>
        </div>
      </div>

      {hasImages && (
        <div className={`project-card-image-slide ${showImageSlide ? 'active' : ''}`}>
          <img
            src={primaryImage!}
            alt={project.title}
            className="project-card-image"
            loading="lazy"
          />
          <div className="project-card-image-gradient" />
          <div className="project-card-image-label">
            <h4 className="project-card-static-title">{project.title}</h4>
          </div>
        </div>
      )}
    </a>
  )
}

function ProjectCardCompact({ project, projectsBasePath = '/projects' }: { project: Project; projectsBasePath?: string }) {
  return (
    <a
      href={`${projectsBasePath}/${project.slug}`}
      className="block w-full text-left rounded-xl px-3 py-2.5 bg-white/[0.025] hover:bg-white/[0.06] border border-white/5 hover:border-purple-500/30 transition-colors duration-200 group"
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <h4 className="text-sm font-semibold text-gray-200 group-hover:text-white truncate">
          {project.title}
        </h4>
        <span className="text-[10px] font-mono text-gray-500 shrink-0">
          {project.year}
        </span>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        {project.tags.slice(0, 2).map(tag => (
          <span
            key={tag}
            className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5"
          >
            {tag}
          </span>
        ))}
        <span className="ml-auto text-[10px] text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
          →
        </span>
      </div>
    </a>
  )
}

export default function ProjectCardIsland({ projects, headerTitle = 'Projects', activeLabel = 'ACTIVE', ctaText = 'Ver proyecto →', projectsBasePath = '/projects' }: Props) {
  const featured = projects.filter(p => p.tier !== 'more')
  const more = projects.filter(p => p.tier === 'more')

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase">{headerTitle}</h3>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-500 border border-white/5">
          {projects.length} {activeLabel}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        {featured.map((project) => (
          <ProjectCard key={project.slug} project={project} ctaText={ctaText} projectsBasePath={projectsBasePath} />
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
                <ProjectCardCompact key={project.slug} project={project} projectsBasePath={projectsBasePath} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
