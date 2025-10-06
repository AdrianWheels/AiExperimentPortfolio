import React, { useEffect, useState } from 'react'
import { useGame } from '../../context/GameContext'

const EXPRESSIONS = {
  idle: { eyes: '•   •', mouth: '—' },
  blink: { eyes: '—   —', mouth: '—' },
  speak: { eyes: '•   •', mouth: '◡' },
  free: { eyes: '✦   ✦', mouth: '◠' },
}

export default function AriaAvatar() {
  const { gameState, unlockAnimations } = useGame()
  const [frame, setFrame] = useState('idle')

  useEffect(() => {
    let cancelled = false
    const baseFrame = gameState.stage === 'Free' ? 'free' : 'idle'
    setFrame(baseFrame)

    const tick = () => {
      if (cancelled) return
      setFrame((current) => {
        if (gameState.stage === 'Free') {
          return current === 'free' ? 'blink' : 'free'
        }
        if (current === 'blink') return 'idle'
        if (current === 'speak') return 'idle'
        return Math.random() > 0.7 ? 'blink' : Math.random() > 0.6 ? 'speak' : 'idle'
      })
    }

    const interval = setInterval(tick, 2600)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [gameState.stage])

  useEffect(() => {
    if (!unlockAnimations?.pulse) return
    setFrame('speak')
  }, [unlockAnimations?.pulse])

  return (
    <div
      className={`w-40 h-40 avatar-metal bg-zinc-900 rounded-full flex items-center justify-center border-2 ${
        gameState.stage === 'Free' ? 'avatar-pulse glow-success' : ''
      }`}
      style={{ borderColor: 'var(--visor-metal)' }}
    >
      <div
        className="w-32 h-32 flex flex-col items-center justify-center text-slate-200 select-none"
        role="img"
        aria-label="Avatar provisional de A.R.I.A."
      >
        <span className="tracking-[0.6em] text-2xl leading-none" aria-hidden>
          {(EXPRESSIONS[frame] ?? EXPRESSIONS.idle).eyes}
        </span>
        <span className="text-2xl leading-relaxed" aria-hidden>
          {(EXPRESSIONS[frame] ?? EXPRESSIONS.idle).mouth}
        </span>
        <span className="mt-2 text-[10px] uppercase tracking-[0.3em] text-slate-400">Sprite pendiente</span>
      </div>
    </div>
  )
}
