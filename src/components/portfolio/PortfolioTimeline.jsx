import React from 'react'

function TimelineSection({ title, items, renderItem }) {
  if (!items.length) return null
  return (
    <section>
      <h4 className="text-sm font-medium uppercase tracking-wider text-zinc-500 mb-5">{title}</h4>
      <div className="space-y-5">
        {items.map(renderItem)}
      </div>
    </section>
  )
}

function ExperienceCard({ item }) {
  return (
    <article className="rounded-xl border border-zinc-700/50 bg-zinc-800/30 p-6">
      <header className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h4 className="text-lg font-semibold text-white">{item.role}</h4>
          <p className="text-sm text-zinc-400 mt-1">{item.company}</p>
        </div>
        <span className="text-xs font-medium text-zinc-500">{item.period}</span>
      </header>
      <p className="mt-4 text-base text-zinc-300 leading-relaxed">{item.summary}</p>
      <ul className="mt-5 space-y-2 text-sm text-zinc-400">
        {(item.achievements || []).map((achievement, index) => (
          <li key={`${item.id}-ach-${index}`} className="flex items-start gap-3">
            <span className="text-accent-light mt-0.5">▹</span>
            <span>{achievement}</span>
          </li>
        ))}
      </ul>
    </article>
  )
}

function EducationCard({ item }) {
  return (
    <article className="rounded-xl border border-zinc-700/50 bg-zinc-800/30 p-5">
      <header className="flex flex-wrap items-baseline justify-between gap-4">
        <h5 className="text-base font-semibold text-white">{item.title}</h5>
        <span className="text-xs font-medium text-zinc-500">{item.period}</span>
      </header>
      <p className="text-sm text-zinc-400 mt-1">{item.institution}</p>
      {item.details && <p className="mt-3 text-sm text-zinc-500">{item.details}</p>}
    </article>
  )
}

function CertificationTag({ item }) {
  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-sm text-zinc-400">
      {item.name} · {item.issuer} · {item.year}
    </div>
  )
}

export default function PortfolioTimeline({ timeline = [], education = [], certifications = [] }) {
  return (
    <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/20 p-6 lg:p-10">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-8">Trayectoria</h3>
      <div className="space-y-10">
        <TimelineSection title="Experiencia" items={timeline} renderItem={(item) => <ExperienceCard key={item.id} item={item} />} />
        <TimelineSection title="Formación" items={education} renderItem={(item) => <EducationCard key={item.id} item={item} />} />
        {certifications.length > 0 && (
          <section>
            <h4 className="text-sm font-medium uppercase tracking-wider text-zinc-500 mb-4">Certificaciones</h4>
            <div className="flex flex-wrap gap-3">
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
