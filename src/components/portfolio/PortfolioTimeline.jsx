import React from 'react'

function TimelineSection({ title, items, renderItem }) {
  if (!items.length) return null
  return (
    <section>
      <h4 className="text-xs uppercase tracking-[0.3em] text-slate-500">{title}</h4>
      <div className="mt-4 space-y-4">
        {items.map(renderItem)}
      </div>
    </section>
  )
}

function ExperienceCard({ item }) {
  return (
    <article className="rounded-3xl border border-white/5 bg-black/30 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.45)]">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h4 className="text-lg font-semibold text-slate-100">{item.role}</h4>
          <p className="text-sm text-slate-400/90">{item.company}</p>
        </div>
        <span className="text-xs uppercase tracking-[0.24em] text-slate-400">{item.period}</span>
      </header>
      <p className="mt-3 text-sm text-slate-200/85">{item.summary}</p>
      <ul className="mt-4 space-y-2 text-sm text-slate-300/80">
        {(item.achievements || []).map((achievement, index) => (
          <li key={`${item.id}-ach-${index}`} className="flex items-start gap-2">
            <span className="mt-1 text-sky-300">▹</span>
            <span>{achievement}</span>
          </li>
        ))}
      </ul>
    </article>
  )
}

function EducationCard({ item }) {
  return (
    <article className="rounded-2xl border border-slate-600/40 bg-slate-900/40 p-5">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <h5 className="text-sm font-semibold text-slate-100">{item.title}</h5>
        <span className="text-xs uppercase tracking-[0.28em] text-slate-400">{item.period}</span>
      </header>
      <p className="text-sm text-slate-300/90">{item.institution}</p>
      {item.details && <p className="mt-2 text-xs text-slate-400/80">{item.details}</p>}
    </article>
  )
}

function CertificationTag({ item }) {
  return (
    <div className="rounded-full border border-slate-600/40 bg-slate-900/50 px-4 py-2 text-xs uppercase tracking-[0.28em] text-slate-400">
      {item.name} · {item.issuer} · {item.year}
    </div>
  )
}

export default function PortfolioTimeline({ timeline = [], education = [], certifications = [] }) {
  return (
    <div className="rounded-3xl border border-white/5 bg-black/20 p-8">
      <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Trayectoria</h3>
      <div className="mt-6 space-y-10">
        <TimelineSection title="Experiencia" items={timeline} renderItem={(item) => <ExperienceCard key={item.id} item={item} />} />
        <TimelineSection title="Formación" items={education} renderItem={(item) => <EducationCard key={item.id} item={item} />} />
        {certifications.length > 0 && (
          <section>
            <h4 className="text-xs uppercase tracking-[0.3em] text-slate-500">Certificaciones</h4>
            <div className="mt-3 flex flex-wrap gap-2">
              {certifications.map((item) => (
                <CertificationTag key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
