import React from 'react'

function TimelineSection({ title, items, renderItem, mode }) {
  if (!items.length) return null
  return (
    <section>
      <h4 className="text-xs uppercase tracking-[0.32em] text-slate-400/80">{title}</h4>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {items.map((item, index) => renderItem(item, index, mode))}
      </div>
    </section>
  )
}

function ExperienceCard({ item, mode }) {
  const isHacked = mode === 'hacked'
  const accent = isHacked
    ? 'border-purple-500/40 bg-purple-950/30 hover:border-purple-300/60'
    : 'border-slate-600/40 bg-slate-950/40 hover:border-sky-400/60'

  return (
    <article
      className={`group relative overflow-hidden rounded-3xl border px-6 py-5 shadow-[0_20px_50px_rgba(15,23,42,0.5)] transition-transform duration-300 hover:-translate-y-1 ${accent}`}
    >
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h4 className="text-lg font-semibold text-slate-100">{item.role}</h4>
          <p className="text-sm text-slate-400/85">{item.company}</p>
        </div>
        <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-slate-300/80">
          {item.period}
        </span>
      </header>
      <p className="mt-3 text-sm leading-relaxed text-slate-200/85">{item.summary}</p>
      <ul className="mt-4 space-y-2 text-xs text-slate-300/80">
        {(item.achievements || []).map((achievement, index) => (
          <li key={`${item.id}-ach-${index}`} className="flex items-start gap-3">
            <span className="mt-1 h-2 w-2 rounded-full bg-sky-400" />
            <span>{achievement}</span>
          </li>
        ))}
      </ul>
    </article>
  )
}

function EducationCard({ item, mode }) {
  const isHacked = mode === 'hacked'
  const accent = isHacked
    ? 'border-purple-500/30 bg-purple-950/30'
    : 'border-slate-600/30 bg-slate-950/40'

  return (
    <article className={`rounded-2xl border px-5 py-4 shadow-[0_16px_40px_rgba(15,23,42,0.45)] ${accent}`}>
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <h5 className="text-sm font-semibold text-slate-100">{item.title}</h5>
        <span className="text-[11px] uppercase tracking-[0.28em] text-slate-400/80">{item.period}</span>
      </header>
      <p className="text-sm text-slate-300/85">{item.institution}</p>
      {item.details && <p className="mt-2 text-xs text-slate-400/80">{item.details}</p>}
    </article>
  )
}

function CertificationTag({ item, mode }) {
  const isHacked = mode === 'hacked'
  const accent = isHacked
    ? 'border-purple-500/30 bg-purple-900/30 text-purple-200'
    : 'border-slate-600/30 bg-slate-950/40 text-slate-300/80'

  return (
    <div className={`rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.3em] ${accent}`}>
      {item.name} · {item.issuer} · {item.year}
    </div>
  )
}

export default function PortfolioTimeline({ timeline = [], education = [], certifications = [], mode, className = '' }) {
  const isHacked = mode === 'hacked'
  const cardTone = isHacked
    ? 'border-purple-500/50 bg-gradient-to-br from-purple-950/60 via-slate-950/50 to-black text-violet-100'
    : 'border-slate-500/40 bg-gradient-to-br from-slate-950/60 via-slate-900/50 to-slate-950 text-slate-100'

  return (
    <div
      className={`relative flex h-full flex-col overflow-hidden rounded-3xl border px-8 py-10 shadow-[0_32px_80px_rgba(15,23,42,0.55)] transition-transform duration-300 hover:-translate-y-1 ${cardTone} ${className}`}
    >
      <div className="relative z-10">
        <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-300/80">Trayectoria</h3>
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500/80">Historia profesional y formación</p>

        <div className="mt-8 space-y-12">
          <TimelineSection
            title="Experiencia"
            items={timeline}
            mode={mode}
            renderItem={(item, index, itemMode) => <ExperienceCard key={item.id ?? `exp-${index}`} item={item} mode={itemMode} />}
          />
          <TimelineSection
            title="Formación"
            items={education}
            mode={mode}
            renderItem={(item, index, itemMode) => <EducationCard key={item.id ?? `edu-${index}`} item={item} mode={itemMode} />}
          />
          {certifications.length > 0 && (
            <section>
              <h4 className="text-xs uppercase tracking-[0.32em] text-slate-400/80">Certificaciones</h4>
              <div className="mt-4 flex flex-wrap gap-2">
                {certifications.map((item, index) => (
                  <CertificationTag key={item.id ?? `cert-${index}`} item={item} mode={mode} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <div
        className={`pointer-events-none absolute inset-0 opacity-55 ${
          isHacked
            ? 'bg-[radial-gradient(circle_at_10%_10%,rgba(192,132,252,0.35),transparent_55%),radial-gradient(circle_at_90%_90%,rgba(236,72,153,0.3),transparent_55%)]'
            : 'bg-[radial-gradient(circle_at_10%_10%,rgba(56,189,248,0.26),transparent_55%),radial-gradient(circle_at_90%_90%,rgba(16,185,129,0.2),transparent_55%)]'
        }`}
      />
    </div>
  )
}
