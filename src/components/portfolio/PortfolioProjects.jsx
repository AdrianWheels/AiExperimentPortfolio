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
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-slate-200 transition-colors hover:border-sky-400/60 hover:text-sky-200"
        >
          {key}
        </a>
      ))}
    </div>
  )
}

function ProjectCard({ project, mode, accent }) {
  const description = resolveCopy(project.description, mode)
  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border px-5 py-4 shadow-[0_18px_40px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-1 ${accent}`}
    >
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h4 className="text-base font-semibold text-slate-100">{project.name}</h4>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400/80">{project.role}</p>
        </div>
        <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-slate-200/90">
          {project.year}
        </span>
      </header>
      <p className="mt-3 text-sm leading-relaxed text-slate-200/85">{description}</p>
      <ul className="mt-4 space-y-2 text-xs text-slate-300/80">
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
            className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-slate-200/90"
          >
            {tag}
          </span>
        ))}
      </div>
      <ProjectLinks links={project.links} />
    </article>
  )
}

export default function PortfolioProjects({ projects = [], experiments = [], mode, className = '' }) {
  const isHacked = mode === 'hacked'
  const cardTone = isHacked
    ? 'border-purple-500/50 bg-gradient-to-br from-purple-950/50 via-slate-950/40 to-black text-violet-100'
    : 'border-slate-500/40 bg-gradient-to-br from-slate-950/60 via-slate-900/50 to-slate-950 text-slate-100'

  const projectAccent = isHacked
    ? 'border-purple-500/30 bg-purple-950/40 hover:border-purple-300/60'
    : 'border-slate-600/30 bg-slate-950/40 hover:border-sky-400/60'

  return (
    <section
      className={`relative flex h-full flex-col overflow-hidden rounded-3xl border px-6 py-8 shadow-[0_28px_70px_rgba(15,23,42,0.55)] transition-transform duration-300 hover:-translate-y-1 ${cardTone} ${className}`}
    >
      <div className="relative z-10 flex h-full flex-col">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-300/80">Proyectos destacados</h3>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500/80">{projects.length} casos seleccionados</p>
          </div>
          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-slate-300/80">
            Roadmap vivo
          </span>
        </header>

        <div className="mt-6 grid flex-1 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} mode={mode} accent={projectAccent} />
          ))}
          {projects.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-600/40 p-6 text-sm text-slate-400/80">
              Añade proyectos destacados al archivo <code>projects.json</code>.
            </div>
          )}
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-5">
          <h4 className="text-xs uppercase tracking-[0.3em] text-slate-400/80">Laboratorio & experimentos</h4>
          <ul className="mt-3 space-y-3 text-sm text-slate-200/85">
            {experiments.map((experiment) => (
              <li key={experiment.id} className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-sky-400" />
                <div>
                  <p className="font-medium text-slate-100/90">{experiment.title}</p>
                  <p className="text-xs text-slate-400/90">{experiment.description}</p>
                  {experiment.status && (
                    <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-slate-500">{experiment.status}</p>
                  )}
                </div>
              </li>
            ))}
            {experiments.length === 0 && (
              <li className="text-xs uppercase tracking-[0.3em] text-slate-500/80">
                Agrega experimentos o side-projects para mostrar aquí.
              </li>
            )}
          </ul>
        </div>
      </div>

      <div
        className={`pointer-events-none absolute inset-0 opacity-50 ${
          isHacked
            ? 'bg-[radial-gradient(circle_at_10%_10%,rgba(192,132,252,0.4),transparent_55%),radial-gradient(circle_at_80%_90%,rgba(236,72,153,0.35),transparent_55%)]'
            : 'bg-[radial-gradient(circle_at_10%_10%,rgba(56,189,248,0.3),transparent_55%),radial-gradient(circle_at_80%_90%,rgba(16,185,129,0.25),transparent_55%)]'
        }`}
      />
    </section>
  )
}
