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
    <div className="mt-4 flex flex-wrap gap-2">
      {entries.map(([key, url]) => (
        <a
          key={key}
          href={url}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-slate-500/30 px-3 py-1 text-xs uppercase tracking-widest text-slate-200/90 transition-colors hover:border-sky-400/60 hover:text-sky-200"
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
    <article className="rounded-3xl border border-white/5 bg-black/30 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.45)] transition-transform hover:-translate-y-1">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h4 className="text-lg font-semibold text-slate-100">{project.name}</h4>
          <p className="text-sm text-slate-400/80">{project.role}</p>
        </div>
        <span className="rounded-full border border-slate-500/30 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-400">
          {project.year}
        </span>
      </header>
      <p className="mt-4 text-sm leading-relaxed text-slate-200/85">{description}</p>
      <ul className="mt-4 space-y-2 text-sm text-slate-300/80">
        {(project.metrics || []).map((metric, index) => (
          <li key={`${project.id}-metric-${index}`} className="flex items-start gap-2">
            <span className="mt-1 text-sky-300">✱</span>
            <span>{metric}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap gap-2">
        {(project.tags || []).map((tag) => (
          <span
            key={`${project.id}-${tag}`}
            className="rounded-full border border-slate-600/40 bg-slate-800/40 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-slate-300"
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
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Proyectos destacados</h3>
        <span className="text-xs uppercase tracking-[0.3em] text-slate-500">{projects.length} casos</span>
      </div>

      <div className="mt-4 space-y-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} mode={mode} />
        ))}
        {projects.length === 0 && (
          <p className="rounded-2xl border border-dashed border-slate-500/30 p-6 text-sm text-slate-400">
            Añade proyectos destacados al archivo <code>projects.json</code>.
          </p>
        )}
      </div>

      <div className="mt-8">
        <h4 className="text-xs uppercase tracking-[0.3em] text-slate-500">Experimentos</h4>
        <ul className="mt-3 space-y-2 text-sm text-slate-300/80">
          {experiments.map((experiment) => (
            <li key={experiment.id} className="flex items-start gap-3">
              <span className="text-sky-300">▹</span>
              <div>
                <p className="font-medium text-slate-100/90">{experiment.title}</p>
                <p className="text-xs text-slate-400/90">{experiment.description}</p>
                {experiment.status && <p className="text-xs uppercase tracking-[0.28em] text-slate-500">{experiment.status}</p>}
              </div>
            </li>
          ))}
          {experiments.length === 0 && <li className="text-slate-500">Agrega experimentos o side-projects para mostrar aquí.</li>}
        </ul>
      </div>
    </section>
  )
}
