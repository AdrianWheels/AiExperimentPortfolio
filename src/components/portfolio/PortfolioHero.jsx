import React from 'react'

function ContactItem({ label, value, url }) {
  if (!value) return null
  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="text-sm text-slate-200 hover:text-sky-300 transition-colors"
      >
        {label}: {value}
      </a>
    )
  }

  return (
    <p className="text-sm text-slate-200">
      {label}: {value}
    </p>
  )
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
  highlights = [],
  mode,
}) {
  return (
    <section className="grid gap-8 lg:grid-cols-[2fr_1fr]">
      <div>
        <div className="flex flex-wrap items-baseline gap-3">
          <h2 className="text-3xl font-semibold tracking-tight text-white">{name}</h2>
          {alias && mode === 'hacked' && (
            <span className="rounded-full border border-purple-400/40 bg-purple-900/40 px-3 py-1 text-xs uppercase tracking-[0.2em] text-purple-200">
              {alias}
            </span>
          )}
        </div>
        <p className="mt-2 text-lg text-slate-200/90">{tagline}</p>

        <div className="mt-6 rounded-2xl border border-white/5 bg-black/30 p-6 shadow-inner shadow-black/40">
          <p className="text-base leading-relaxed text-slate-100/90">{summary}</p>
          <div className="mt-4 grid gap-2 text-sm text-slate-300/80 sm:grid-cols-2">
            {location && <span className="font-medium text-slate-200">📍 {location}</span>}
            {availability && <span className="text-slate-300">🗓 {availability}</span>}
            {contact.timeZone && <span className="text-slate-300">🌐 Zona horaria: {contact.timeZone}</span>}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-[0.28em] text-slate-400">Contacto</h3>
            <div className="flex flex-col gap-1">
              <ContactItem label="Email" value={contact.email} url={contact.email ? `mailto:${contact.email}` : null} />
              <ContactItem label="Portfolio" value={contact.portfolio} url={contact.portfolio} />
              <ContactItem label="Tel" value={contact.phone} />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-[0.28em] text-slate-400">Redes</h3>
            <div className="flex flex-wrap gap-2">
              {social.map((item) => (
                <a
                  key={`${item.label}-${item.url}`}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-slate-500/30 px-3 py-1 text-xs uppercase tracking-wider text-slate-200/90 transition-colors hover:border-sky-400/60 hover:text-sky-200"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xs uppercase tracking-[0.3em] text-slate-400">Puntos clave</h3>
        <div className="mt-3 grid gap-3">
          {highlights.map((highlight) => (
            <article
              key={highlight.title}
              className={`rounded-2xl border ${
                mode === 'hacked'
                  ? 'border-purple-500/40 bg-purple-900/30'
                  : 'border-slate-600/40 bg-slate-800/40'
              } p-4 shadow-[0_18px_40px_rgba(15,23,42,0.45)]`}
            >
              <h4 className="text-sm font-semibold text-slate-100">{highlight.title}</h4>
              <p className="mt-1 text-sm text-slate-300/90">{highlight.description}</p>
            </article>
          ))}
          {highlights.length === 0 && (
            <p className="rounded-xl border border-dashed border-slate-500/40 p-4 text-sm text-slate-400">
              Próximamente más detalles.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
