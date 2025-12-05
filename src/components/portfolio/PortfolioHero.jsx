import React from 'react'

function ContactItem({ label, value, url }) {
  if (!value) return null
  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="text-sm text-zinc-200 hover:text-accent-light transition-colors"
      >
        {label}: {value}
      </a>
    )
  }

  return (
    <p className="text-sm text-zinc-200">
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
  onModeToggle,
  onBackToGame,
}) {
  const isHacked = mode === 'hacked'
  
  return (
    <section className="grid gap-8 lg:gap-12 lg:grid-cols-[2fr_1fr]">
      <div>
        <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
          {/* Imagen de perfil */}
          <div className="flex-shrink-0">
            <div className={`w-28 h-28 lg:w-36 lg:h-36 rounded-2xl border-2 overflow-hidden shadow-lg ${
              isHacked ? 'border-purple-400/50' : 'border-zinc-600/50'
            }`}>
              <img 
                src={isHacked ? '/aria_images/ARIA_FREE.png' : '/me.jpg'}
                alt={isHacked ? 'K.I.R.A. Libre' : 'Foto de perfil'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.warn(`No se pudo cargar la imagen: ${e.target.src}`)
                  e.target.style.display = 'none'
                }}
              />
            </div>
          </div>
          
          {/* Información básica */}
          <div className="flex-1">
            <div className="flex flex-wrap items-baseline gap-3">
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white">{name}</h1>
              {alias && mode === 'hacked' && (
                <span className="rounded-lg border border-purple-400/40 bg-purple-900/40 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-purple-200">
                  {alias}
                </span>
              )}
            </div>
            <p className="mt-3 text-lg lg:text-xl text-zinc-300">{tagline}</p>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-6 lg:p-8">
          <p className="text-base lg:text-lg leading-relaxed text-zinc-200">{summary}</p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-zinc-400">
            {location && <span className="flex items-center gap-2"><span>📍</span> {location}</span>}
            {availability && <span className="flex items-center gap-2"><span>🗓</span> {availability}</span>}
            {contact.timeZone && <span className="flex items-center gap-2"><span>🌐</span> {contact.timeZone}</span>}
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-500">Contacto</h3>
            <div className="flex flex-col gap-2">
              <ContactItem label="Email" value={contact.email} url={contact.email ? `mailto:${contact.email}` : null} />
              <ContactItem label="Portfolio" value={contact.portfolio} url={contact.portfolio} />
              <ContactItem label="Tel" value={contact.phone} />
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-500">Redes</h3>
            <div className="flex flex-wrap gap-2">
              {social.map((item) => (
                <a
                  key={`${item.label}-${item.url}`}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-sm text-zinc-200 transition-all hover:border-accent/50 hover:bg-zinc-700/50 hover:text-white"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        {/* Botones de control */}
        <div className="mb-8 flex flex-col gap-3">
          <button
            onClick={onModeToggle}
            className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
              isHacked
                ? 'border-purple-400/50 bg-purple-900/30 text-purple-200 hover:bg-purple-800/40'
                : 'border-zinc-600 bg-zinc-800/50 text-zinc-200 hover:bg-zinc-700/50'
            }`}
          >
            {isHacked ? '🤖 Modo K.I.R.A.' : '👤 Modo Humano'}
          </button>
          
          <button
            onClick={onBackToGame}
            className="w-full px-4 py-3 rounded-xl border border-accent/40 bg-accent/10 text-accent-light hover:bg-accent/20 text-sm font-medium transition-all duration-200"
          >
            🎮 Volver al Juego
          </button>
        </div>

        <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-500 mb-4">Puntos clave</h3>
        <div className="grid gap-4">
          {highlights.map((highlight) => (
            <article
              key={highlight.title}
              className={`rounded-xl border p-5 ${
                mode === 'hacked'
                  ? 'border-purple-500/30 bg-purple-900/20'
                  : 'border-zinc-700/50 bg-zinc-800/30'
              }`}
            >
              <h4 className="text-base font-semibold text-white">{highlight.title}</h4>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{highlight.description}</p>
            </article>
          ))}
          {highlights.length === 0 && (
            <p className="rounded-xl border border-dashed border-zinc-700 p-5 text-sm text-zinc-500">
              Próximamente más detalles.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
