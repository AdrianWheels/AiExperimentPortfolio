import React from 'react'

function SkillBadge({ label, level }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-600/40 bg-slate-800/40 px-3 py-1 text-xs text-slate-200">
      {label}
      {level && <span className="text-[10px] uppercase tracking-wide text-slate-400">{level}</span>}
    </span>
  )
}

function resolveCommentary(commentary, mode) {
  if (!commentary) return ''
  if (typeof commentary === 'string') return commentary
  return commentary[mode] || commentary.normal || ''
}

export default function PortfolioSkills({ core = [], toolbelt = [], soft = [], mode }) {
  return (
    <aside className="flex h-full flex-col gap-6 rounded-3xl border border-white/5 bg-black/30 p-6">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Skills principales</h3>
        <div className="mt-3 space-y-3">
          {core.map((group) => (
            <div key={group.name}>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{group.name}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(group.items || []).map((item) => (
                  <SkillBadge key={`${group.name}-${item.label}`} label={item.label} level={item.level} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Toolbelt</h3>
        <div className="mt-3 space-y-4">
          {toolbelt.map((stack) => (
            <article
              key={stack.title}
              className={`rounded-2xl border px-4 py-3 text-sm shadow-[0_16px_30px_rgba(15,23,42,0.45)] ${
                mode === 'hacked'
                  ? 'border-purple-500/30 bg-purple-900/30'
                  : 'border-slate-600/30 bg-slate-900/40'
              }`}
            >
              <header className="flex items-center justify-between gap-3">
                <h4 className="font-semibold text-slate-100">{stack.title}</h4>
                <span className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{stack.tools?.length || 0} tools</span>
              </header>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">{(stack.tools || []).join(' • ')}</p>
              <p className="mt-3 text-sm text-slate-200/80">
                {resolveCommentary(stack.commentary, mode)}
              </p>
            </article>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Soft skills</h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-300/90">
          {soft.map((skill) => (
            <li key={skill} className="flex items-center gap-2">
              <span className="text-sky-300">▹</span>
              {skill}
            </li>
          ))}
          {soft.length === 0 && <li className="text-slate-500">Añade habilidades transversales aquí.</li>}
        </ul>
      </div>
    </aside>
  )
}
