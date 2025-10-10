import React from 'react'

function SkillBadge({ label, level }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] uppercase tracking-[0.26em] text-slate-200/90">
      {label}
      {level && <span className="text-[9px] uppercase tracking-[0.3em] text-slate-400/80">{level}</span>}
    </span>
  )
}

function resolveCommentary(commentary, mode) {
  if (!commentary) return ''
  if (typeof commentary === 'string') return commentary
  return commentary[mode] || commentary.normal || ''
}

export default function PortfolioSkills({ core = [], toolbelt = [], soft = [], mode, className = '' }) {
  const isHacked = mode === 'hacked'
  const cardTone = isHacked
    ? 'border-purple-500/50 bg-gradient-to-b from-purple-950/60 via-slate-950/50 to-black text-violet-100'
    : 'border-slate-500/40 bg-gradient-to-b from-slate-950/60 via-slate-900/50 to-slate-950 text-slate-100'

  return (
    <aside
      className={`relative flex h-full flex-col overflow-hidden rounded-3xl border px-6 py-8 shadow-[0_24px_70px_rgba(15,23,42,0.5)] transition-transform duration-300 hover:-translate-y-1 ${cardTone} ${className}`}
    >
      <div className="relative z-10 flex h-full flex-col gap-6">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-300/80">Ecosistema de skills</h3>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500/80">Stack híbrido diseño + código</p>
        </div>

        <div className="space-y-4">
          {core.map((group) => (
            <div key={group.name} className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400/80">{group.name}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(group.items || []).map((item) => (
                  <SkillBadge key={`${group.name}-${item.label}`} label={item.label} level={item.level} />
                ))}
              </div>
            </div>
          ))}
          {core.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-600/40 p-4 text-xs uppercase tracking-[0.28em] text-slate-500/80">
              Añade grupos de skills principales.
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h4 className="text-xs uppercase tracking-[0.3em] text-slate-400/80">Toolbelt</h4>
          {(toolbelt || []).map((stack) => (
            <article
              key={stack.title}
              className={`rounded-2xl border px-4 py-3 text-sm shadow-[0_18px_40px_rgba(15,23,42,0.45)] ${
                isHacked
                  ? 'border-purple-500/30 bg-purple-900/30 hover:border-purple-300/60'
                  : 'border-slate-600/30 bg-slate-950/40 hover:border-sky-400/50'
              } transition-colors duration-300`}
            >
              <header className="flex items-center justify-between gap-3">
                <h4 className="font-semibold text-slate-100">{stack.title}</h4>
                <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400/80">{stack.tools?.length || 0} tools</span>
              </header>
              <p className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-400/80">{(stack.tools || []).join(' • ')}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-200/80">
                {resolveCommentary(stack.commentary, mode)}
              </p>
            </article>
          ))}
          {toolbelt.length === 0 && (
            <p className="rounded-2xl border border-dashed border-slate-600/40 p-4 text-xs uppercase tracking-[0.28em] text-slate-500/80">
              Añade stacks técnicos y creativos en <code>skills.json</code>.
            </p>
          )}
        </div>

        <div className="mt-auto">
          <h4 className="text-xs uppercase tracking-[0.3em] text-slate-400/80">Soft skills</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-200/85">
            {soft.map((skill) => (
              <li key={skill} className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-sky-400" />
                {skill}
              </li>
            ))}
            {soft.length === 0 && (
              <li className="text-xs uppercase tracking-[0.28em] text-slate-500/80">Añade habilidades transversales aquí.</li>
            )}
          </ul>
        </div>
      </div>

      <div
        className={`pointer-events-none absolute inset-0 opacity-55 ${
          isHacked
            ? 'bg-[radial-gradient(circle_at_20%_0%,rgba(192,132,252,0.35),transparent_55%),radial-gradient(circle_at_80%_100%,rgba(236,72,153,0.3),transparent_55%)]'
            : 'bg-[radial-gradient(circle_at_20%_0%,rgba(56,189,248,0.25),transparent_55%),radial-gradient(circle_at_80%_100%,rgba(16,185,129,0.22),transparent_55%)]'
        }`}
      />
    </aside>
  )
}
