import React from 'react'

export default function PortfolioHighlights({ highlights = [], mode, className = '' }) {
  const isHacked = mode === 'hacked'
  const cardTone = isHacked
    ? 'border-purple-500/50 bg-purple-950/40 text-violet-100'
    : 'border-slate-500/40 bg-slate-900/40 text-slate-100'

  return (
    <section
      className={`relative flex h-full flex-col overflow-hidden rounded-3xl border px-6 py-8 shadow-[0_20px_60px_rgba(15,23,42,0.5)] transition-transform duration-300 hover:-translate-y-1 ${cardTone} ${className}`}
    >
      <div className="relative z-10 flex h-full flex-col">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-300/80">Highlights</h3>
          <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500/80">
            Instantáneas de impacto y aportes clave
          </p>
        </div>

        <div className="mt-6 grid flex-1 gap-4">
          {highlights.map((highlight) => (
            <article
              key={highlight.title}
              className={`group rounded-2xl border px-4 py-3 shadow-[0_20px_40px_rgba(15,23,42,0.45)] ${
                isHacked
                  ? 'border-purple-500/30 bg-purple-900/30 hover:border-purple-300/60'
                  : 'border-slate-600/30 bg-slate-950/40 hover:border-sky-400/50'
              } transition-colors duration-300`}
            >
              <h4 className="text-sm font-semibold text-slate-100">{highlight.title}</h4>
              <p className="mt-2 text-sm leading-relaxed text-slate-300/85">{highlight.description}</p>
            </article>
          ))}
          {highlights.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-600/40 p-4 text-sm text-slate-400/80">
              Añade logros y diferenciales en <code>profile.json</code>.
            </div>
          )}
        </div>
      </div>

      <div
        className={`pointer-events-none absolute inset-0 opacity-60 ${
          isHacked
            ? 'bg-[radial-gradient(circle_at_85%_20%,rgba(192,132,252,0.35),transparent_55%),radial-gradient(circle_at_15%_80%,rgba(236,72,153,0.3),transparent_60%)]'
            : 'bg-[radial-gradient(circle_at_85%_20%,rgba(56,189,248,0.28),transparent_55%),radial-gradient(circle_at_15%_80%,rgba(16,185,129,0.24),transparent_60%)]'
        }`}
      />
    </section>
  )
}
