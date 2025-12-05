import React from 'react'

function resolveCopy(value, mode) {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value[mode] || value.normal || Object.values(value)[0] || ''
}

function ProjectLinks({ links = {} }) {
  const entries = Object.entries(links)
  if (!entries.length) return null

  return (
    <div className="mt-5 flex flex-wrap gap-2">
      {entries.map(([key, url]) => (
        <a
          key={key}
          href={url}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-sm text-zinc-200 transition-all hover:border-accent/50 hover:bg-zinc-700/50 hover:text-white"
        >
          {key}
        </a>
      ))}
    </div>
  )
}

function ProjectCard({ project, mode }) {
  const description = resolveCopy(project.description, mode)
  return (
    <article className="rounded-xl border border-zinc-700/50 bg-zinc-800/30 p-6 lg:p-8 transition-all hover:border-zinc-600/50 hover:bg-zinc-800/50">
      <header className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h4 className="text-xl font-semibold text-white">{project.name}</h4>
          <p className="text-sm text-zinc-400 mt-1">{project.role}</p>
        </div>
        <span className="rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-1.5 text-xs font-medium text-zinc-400">
          {project.year}
        </span>
      </header>
      <p className="mt-5 text-base leading-relaxed text-zinc-300">{description}</p>
      <ul className="mt-5 space-y-2 text-sm text-zinc-400">
        {(project.metrics || []).map((metric, index) => (
          <li key={`${project.id}-metric-${index}`} className="flex items-start gap-3">
            <span className="text-accent-light mt-0.5">✓</span>
            <span>{metric}</span>
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-wrap gap-2">
        {(project.tags || []).map((tag) => (
          <span
            key={`${project.id}-${tag}`}
            className="rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-1.5 text-xs text-zinc-400"
          >
            {tag}
          </span>
        ))}
      </div>
      <ProjectLinks links={project.links} />
    </article>
  )
}

export default function PortfolioProjects({ projects = [], experiments = [], mode }) {
  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Proyectos destacados</h3>
        <span className="text-xs text-zinc-500">{projects.length} casos</span>
      </div>

      <div className="mt-6 space-y-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} mode={mode} />
        ))}
        {projects.length === 0 && (
          <p className="rounded-xl border border-dashed border-zinc-700 p-6 text-sm text-zinc-500">
            Añade proyectos destacados al archivo <code className="text-zinc-400">projects.json</code>.
          </p>
        )}
      </div>

      <div className="mt-10">
        <h4 className="text-sm font-medium uppercase tracking-wider text-zinc-500 mb-4">Experimentos</h4>
        <ul className="space-y-4 text-sm">
          {experiments.map((experiment) => (
            <li key={experiment.id} className="flex items-start gap-3">
              <span className="text-accent-light mt-0.5">▹</span>
              <div>
                <p className="font-medium text-zinc-200">{experiment.title}</p>
                <p className="text-zinc-400 mt-1">{experiment.description}</p>
                {experiment.status && <p className="text-xs uppercase tracking-wider text-zinc-600 mt-1">{experiment.status}</p>}
              </div>
            </li>
          ))}
          {experiments.length === 0 && <li className="text-zinc-600">Agrega experimentos o side-projects para mostrar aquí.</li>}
        </ul>
      </div>
    </section>
  )
}
