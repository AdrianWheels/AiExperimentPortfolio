import React from 'react'

function ContactItem({ label, value, url }) {
  if (!value) return null
  const baseClass =
    'inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-200 transition-colors'

  if (url) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className={`${baseClass} hover:border-sky-400/60 hover:text-sky-200`}>
        {label}
      </a>
    )
  }

  return <span className={baseClass}>{label}</span>
}

export default function PortfolioHero({
  name,
  alias,
  tagline,
  summary,
  location,
  availability,
  contact = {},
  social = [],
  mode,
  className = '',
}) {
  const isHacked = mode === 'hacked'
  const cardTone = isHacked
    ? 'border-purple-500/50 bg-gradient-to-br from-purple-950/70 via-slate-950/60 to-black text-violet-100'
    : 'border-slate-500/40 bg-gradient-to-br from-slate-950/70 via-slate-900/60 to-slate-950 text-slate-100'

  return (
    <section
      className={`relative flex h-full flex-col overflow-hidden rounded-3xl border px-8 py-10 shadow-[0_30px_80px_rgba(15,23,42,0.55)] transition-transform duration-300 hover:-translate-y-1 ${cardTone} ${className}`}
    >
      <div
        className={`pointer-events-none absolute inset-0 opacity-70 mix-blend-screen ${
          isHacked
            ? 'bg-[radial-gradient(circle_at_20%_20%,rgba(192,132,252,0.4),transparent_55%),radial-gradient(circle_at_80%_0%,rgba(56,189,248,0.3),transparent_60%),radial-gradient(circle_at_50%_80%,rgba(236,72,153,0.35),transparent_60%)]'
            : 'bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.3),transparent_55%),radial-gradient(circle_at_80%_0%,rgba(125,211,252,0.25),transparent_60%),radial-gradient(circle_at_50%_80%,rgba(16,185,129,0.28),transparent_60%)]'
        }`}
      />

      <div className="relative z-10 flex h-full flex-col">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-300/70">{tagline}</p>
          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <h2 className="text-4xl font-semibold tracking-tight text-white drop-shadow-[0_10px_30px_rgba(15,23,42,0.6)]">
              {name}
            </h2>
            {alias && isHacked && (
              <span className="rounded-full border border-purple-400/40 bg-purple-900/40 px-3 py-1 text-xs uppercase tracking-[0.28em] text-purple-200">
                {alias}
              </span>
            )}
          </div>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-200/90">{summary}</p>
        </div>

        <div className="mt-8 grid gap-4 text-sm text-slate-200/80 sm:grid-cols-2">
          {location && (
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4 shadow-inner shadow-black/40">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400/80">Ubicación</p>
              <p className="mt-2 text-sm font-medium text-slate-100">{location}</p>
            </div>
          )}
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4 shadow-inner shadow-black/40">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400/80">Disponibilidad</p>
            {availability && <p className="mt-2 text-sm font-medium text-slate-100">{availability}</p>}
            {contact.timeZone && <p className="mt-1 text-xs text-slate-300/80">Zona horaria: {contact.timeZone}</p>}
          </div>
        </div>

        <div className="mt-auto pt-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h3 className="text-[11px] uppercase tracking-[0.32em] text-slate-400/80">Contacto directo</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                <ContactItem label="Email" value={contact.email} url={contact.email ? `mailto:${contact.email}` : null} />
                <ContactItem label="Portfolio" value={contact.portfolio} url={contact.portfolio} />
                <ContactItem label="Tel" value={contact.phone} />
              </div>
            </div>
            <div>
              <h3 className="text-[11px] uppercase tracking-[0.32em] text-slate-400/80">Redes</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {social.map((item) => (
                  <a
                    key={`${item.label}-${item.url}`}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-200 transition-colors hover:border-sky-400/60 hover:text-sky-200"
                  >
                    {item.label}
                  </a>
                ))}
                {social.length === 0 && (
                  <span className="text-xs uppercase tracking-[0.24em] text-slate-400">Añade perfiles relevantes</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
