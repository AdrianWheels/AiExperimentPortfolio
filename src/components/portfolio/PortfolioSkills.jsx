import React from 'react'

function SkillBadge({ label, level }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-1.5 text-sm text-zinc-200">
      {label}
      {level && <span className="text-xs text-zinc-500">{level}</span>}
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
    <aside className="flex h-full flex-col gap-8 rounded-xl border border-zinc-700/50 bg-zinc-800/30 p-6 lg:p-8">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-4">Skills principales</h3>
        <div className="space-y-5">
          {core.map((group) => (
            <div key={group.name}>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-3">{group.name}</p>
              <div className="flex flex-wrap gap-2">
                {(group.items || []).map((item) => (
                  <SkillBadge key={`${group.name}-${item.label}`} label={item.label} level={item.level} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-4">Toolbelt</h3>
        <div className="space-y-4">
          {toolbelt.map((stack) => (
            <article
              key={stack.title}
              className={`rounded-xl border p-5 ${
                mode === 'hacked'
                  ? 'border-purple-500/30 bg-purple-900/20'
                  : 'border-zinc-700/50 bg-zinc-900/50'
              }`}
            >
              <header className="flex items-center justify-between gap-3">
                <h4 className="font-semibold text-white">{stack.title}</h4>
                <span className="text-xs text-zinc-500">{stack.tools?.length || 0} tools</span>
              </header>
              <p className="mt-3 text-xs font-mono text-zinc-500">{(stack.tools || []).join(' • ')}</p>
              <p className="mt-3 text-sm text-zinc-300 leading-relaxed">
                {resolveCommentary(stack.commentary, mode)}
              </p>
            </article>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-4">Soft skills</h3>
        <ul className="space-y-3 text-sm text-zinc-300">
          {soft.map((skill) => (
            <li key={skill} className="flex items-center gap-3">
              <span className="text-accent-light">▹</span>
              {skill}
            </li>
          ))}
          {soft.length === 0 && <li className="text-zinc-600">Añade habilidades transversales aquí.</li>}
        </ul>
      </div>
    </aside>
  )
}
