import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useGame } from '../../../context/GameContext'
import { SOUND_PATTERN } from './soundLogic'

const FALL_TIME_MS = 2000
const HIT_WINDOW_MS = 320
const MISS_GRACE_MS = 150
const PERFECT_MS = 80
const GOOD_MS = 150

const KEY_TO_KIND = { Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3 }

const SPEED_OPTIONS = [
  { value: 0.25, label: '0.25x' },
  { value: 0.5, label: '0.5x' },
  { value: 1, label: '1x' },
  { value: 1.5, label: '1.5x' },
  { value: 2, label: '2x' },
]

const TONE_BANK = [
  {
    id: 'alpha',
    label: 'α',
    description: 'Pulso corto',
    frequency: 320,
    gradient: 'from-sky-500 to-sky-600',
    canvasColor: '#60a5fa',
    keyLabel: '1',
  },
  {
    id: 'beta',
    label: 'β',
    description: 'Pulso grave',
    frequency: 180,
    gradient: 'from-indigo-500 to-indigo-600',
    canvasColor: '#6366f1',
    keyLabel: '2',
  },
  {
    id: 'gamma',
    label: 'γ',
    description: 'Pulso agudo',
    frequency: 520,
    gradient: 'from-purple-500 to-purple-600',
    canvasColor: '#a855f7',
    keyLabel: '3',
  },
  {
    id: 'delta',
    label: 'δ',
    description: 'Pulso largo',
    frequency: 260,
    gradient: 'from-emerald-500 to-emerald-600',
    canvasColor: '#34d399',
    keyLabel: '4',
  },
]

const TONE_INDEX = TONE_BANK.reduce((acc, tone, index) => {
  acc[tone.id] = index
  return acc
}, {})

const INITIAL_ENGINE_STATE = {
  score: 0,
  combo: 0,
  maxCombo: 0,
  counts: { perfect: 0, good: 0, ok: 0, miss: 0 },
  last: '',
  expectedKind: null,
  progress: 0,
  total: SOUND_PATTERN.length,
  keyfeed: [],
  speed: 0.25,
  autoplay: false,
  isPlaying: false,
  disabled: false,
}

class RhythmLaneEngine {
  constructor(canvas, options = {}) {
    this.c = canvas
    this.ctx = canvas.getContext('2d')
    this.options = options
    this.disabled = false
    this._raf = null
    this.chartTemplate = []
    this.chart = []

    this.w = this.c.width
    this.h = this.c.height
    this.laneY = this.h * 0.5
    this.hitX = this.w * 0.82
    this.noteR = 18

    this.speed = options.initialSpeed ?? 0.25
    this.autoplay = options.initialAutoplay ?? false
    this.resetInternals({ preserveSettings: true })

    this.handleKeyDown = this.handleKeyDown.bind(this)
    window.addEventListener('keydown', this.handleKeyDown)
    this.renderStatic()
  }

  destroy() {
    this.pause()
    window.removeEventListener('keydown', this.handleKeyDown)
  }

  resetInternals({ preserveSettings }) {
    if (!preserveSettings) {
      this.speed = this.options.initialSpeed ?? 0.25
      this.autoplay = this.options.initialAutoplay ?? false
    }
    this.isPlaying = false
    this.startedAt = 0
    this.pauseAt = 0
    this.score = 0
    this.combo = 0
    this.maxCombo = 0
    this.counts = { perfect: 0, good: 0, ok: 0, miss: 0 }
    this.keyFeed = []
    this.lastStr = ''
    this.idxNext = 0
    this.chart = this.chartTemplate.map((n) => ({ t: n.t, kind: n.kind, state: 'pending' }))
    this.emitState()
  }

  setChart(chartArray) {
    if (!Array.isArray(chartArray)) {
      this.chartTemplate = []
    } else {
      this.chartTemplate = chartArray.map((n) => ({ t: Number(n.t) || 0, kind: Number(n.kind) || 0 }))
    }
    this.resetInternals({ preserveSettings: true })
    this.renderStatic()
  }

  play() {
    if (this.disabled) return
    if (this.isPlaying) return
    if (!this.chart.length) return
    this.isPlaying = true
    const now = performance.now()
    if (!this.startedAt) {
      this.startedAt = now
    } else if (this.pauseAt) {
      const paused = now - this.pauseAt
      this.startedAt += paused
      this.pauseAt = 0
    }
    this.emitState()
    this.loop()
  }

  pause() {
    if (!this.isPlaying) {
      if (this.disabled) {
        this.emitState()
      }
      return
    }
    this.isPlaying = false
    this.pauseAt = performance.now()
    if (this._raf) cancelAnimationFrame(this._raf)
    this._raf = null
    this.emitState()
  }

  reset() {
    if (this._raf) cancelAnimationFrame(this._raf)
    this._raf = null
    this.resetInternals({ preserveSettings: true })
    this.renderStatic()
  }

  setSpeed(mult) {
    this.speed = mult
    this.emitState()
  }

  setAutoplay(flag) {
    this.autoplay = !!flag
    this.emitState()
  }

  setDisabled(flag) {
    this.disabled = !!flag
    if (this.disabled) {
      this.pause()
    } else {
      this.emitState()
    }
  }

  pressKind(kind) {
    if (this.disabled) return
    if (typeof kind !== 'number') return
    this.onKey(kind)
  }

  expectedNote() {
    return this.chart[this.idxNext] || null
  }

  gameNow() {
    if (!this.startedAt) return 0
    return (performance.now() - this.startedAt) * this.speed
  }

  handleKeyDown(ev) {
    if (this.disabled) return
    if (typeof this.options.isInputBlocked === 'function' && this.options.isInputBlocked()) {
      return
    }
    if (ev.repeat) return
    if (ev.code === 'Space') {
      ev.preventDefault()
      this.isPlaying ? this.pause() : this.play()
      return
    }
    if (ev.code === 'KeyR') {
      ev.preventDefault()
      this.reset()
      return
    }
    const kind = KEY_TO_KIND[ev.code]
    if (kind === undefined) return
    ev.preventDefault()
    this.onKey(kind)
  }

  onKey(kind) {
    const note = this.expectedNote()
    if (!note) return
    if (kind !== note.kind) {
      this.keyFeedPush(`${this.keyCharForKind(kind)}≠${this.keyCharForKind(note.kind)}`, false)
      this.failAndRestart(`Tecla equivocada (${this.keyCharForKind(kind)} por ${this.keyCharForKind(note.kind)})`)
      return
    }
    const dt = this.gameNow() - note.t
    const abs = Math.abs(dt)
    if (abs <= HIT_WINDOW_MS) {
      this.registerHit(note, dt)
    } else {
      const timing = dt < 0 ? `temprano ${Math.round(-dt)}ms` : `tarde ${Math.round(dt)}ms`
      this.keyFeedPush(`${this.keyCharForKind(kind)} (${timing})`, false)
      this.failAndRestart(`Fuera de ventana: ${timing}`)
    }
  }

  autoHit() {
    if (!this.autoplay) return
    if (this.disabled) return
    const note = this.expectedNote()
    if (!note) return
    const dt = this.gameNow() - note.t
    if (Math.abs(dt) <= HIT_WINDOW_MS) {
      this.registerHit(note, dt, true)
    }
  }

  registerHit(note, dt, isAuto = false) {
    note.state = 'hit'
    const abs = Math.abs(dt)
    let label = 'Ok'
    let add = 100
    this.counts.ok += 1
    if (abs <= PERFECT_MS) {
      label = 'Perfect'
      add = 300
      this.counts.perfect += 1
    } else if (abs <= GOOD_MS) {
      label = 'Good'
      add = 200
      this.counts.good += 1
    }
    this.score += add + Math.floor(this.combo * 1.5)
    this.combo += 1
    this.maxCombo = Math.max(this.maxCombo, this.combo)
    this.lastStr = `${label} (${Math.round(abs)} ms)`
    this.keyFeedPush(`${this.keyCharForKind(note.kind)} ✓`, true)
    if (typeof this.options.onNote === 'function') {
      this.options.onNote(note.kind, { dt, auto: isAuto, label })
    }
    this.idxNext += 1
    if (this.idxNext >= this.chart.length) {
      this.isPlaying = false
      if (this._raf) cancelAnimationFrame(this._raf)
      this._raf = null
      this.lastStr = 'Secuencia completada. GG.'
      this.emitState()
      if (typeof this.options.onComplete === 'function') {
        this.options.onComplete()
      }
      return
    }
    if (typeof this.options.onProgress === 'function') {
      this.options.onProgress(this.idxNext, this.chart.length)
    }
    this.emitState()
  }

  failAndRestart(reason) {
    const note = this.expectedNote()
    if (note && note.state === 'pending') {
      note.state = 'miss'
      this.counts.miss += 1
    }
    this.combo = 0
    this.lastStr = `Fallo: ${reason}. Reinicio.`
    if (typeof this.options.onMiss === 'function') {
      this.options.onMiss(reason)
    }
    this.chart = this.chartTemplate.map((n) => ({ t: n.t, kind: n.kind, state: 'pending' }))
    this.idxNext = 0
    this.startedAt = performance.now()
    if (!this.isPlaying) {
      this.isPlaying = true
      this.loop()
    }
    this.emitState()
  }

  keyCharForKind(kind) {
    if (kind === 0) return '1'
    if (kind === 1) return '2'
    if (kind === 2) return '3'
    return '4'
  }

  keyFeedPush(text, ok) {
    const entry = { id: `${Date.now()}-${Math.random()}`, text, ok }
    this.keyFeed.unshift(entry)
    if (this.keyFeed.length > 8) this.keyFeed.pop()
    this.emitState()
  }

  getState() {
    const expected = this.expectedNote()
    return {
      score: this.score,
      combo: this.combo,
      maxCombo: this.maxCombo,
      counts: { ...this.counts },
      last: this.lastStr,
      expectedKind: expected ? expected.kind : null,
      progress: this.idxNext,
      total: this.chart.length,
      keyfeed: [...this.keyFeed],
      speed: this.speed,
      autoplay: this.autoplay,
      isPlaying: this.isPlaying,
      disabled: this.disabled,
    }
  }

  emitState() {
    if (typeof this.options.onStateChange === 'function') {
      this.options.onStateChange(this.getState())
    }
  }

  loop() {
    if (!this.isPlaying) return
    const ctx = this.ctx
    ctx.clearRect(0, 0, this.w, this.h)
    this.renderLane()

    const current = this.gameNow()
    for (let i = 0; i < this.chart.length; i += 1) {
      const note = this.chart[i]
      if (note.state === 'hit') continue
      const appearAt = note.t - FALL_TIME_MS
      if (appearAt > current) continue
      const prog = clamp((current - appearAt) / FALL_TIME_MS, 0, 1)
      const marginL = this.w * 0.02
      const x = marginL + prog * (this.hitX - marginL)
      const meta = TONE_BANK[note.kind] || {}
      ctx.globalAlpha = note.state === 'miss' ? 0.25 : 1
      ctx.fillStyle = meta.canvasColor || '#60a5fa'
      drawKindShape(ctx, note.kind, x, this.laneY, this.noteR)
      ctx.globalAlpha = 1
    }

    const next = this.expectedNote()
    if (next) {
      const meta = TONE_BANK[next.kind] || {}
      ctx.globalAlpha = 0.35
      ctx.fillStyle = meta.canvasColor || '#ffffff'
      drawKindShape(ctx, next.kind, this.hitX, this.laneY, this.noteR * 1.05)
      ctx.globalAlpha = 1
    }

    this.autoHit()
    const pending = this.expectedNote()
    if (pending) {
      const dt = this.gameNow() - pending.t
      if (dt > HIT_WINDOW_MS + MISS_GRACE_MS) {
        this.keyFeedPush(`${this.keyCharForKind(pending.kind)} (miss ${Math.round(dt - HIT_WINDOW_MS)}ms)`, false)
        this.failAndRestart('Se pasó la ventana')
      }
    }

    this._raf = requestAnimationFrame(() => this.loop())
  }

  renderLane() {
    const ctx = this.ctx
    const laneH = 28
    ctx.fillStyle = '#121826'
    ctx.fillRect(0, this.laneY - laneH / 2, this.w, laneH)

    ctx.strokeStyle = '#21314a'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 10])
    ctx.beginPath()
    for (let x = 0; x < this.w; x += 40) {
      ctx.moveTo(x, this.laneY - laneH / 2 - 10)
      ctx.lineTo(x, this.laneY + laneH / 2 + 10)
    }
    ctx.stroke()
    ctx.setLineDash([])

    ctx.strokeStyle = '#475569'
    ctx.lineWidth = 3
    ctx.strokeRect(this.hitX - 22, this.laneY - laneH, 44, laneH * 2)
  }

  renderStatic() {
    this.ctx.clearRect(0, 0, this.w, this.h)
    this.renderLane()
  }
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}

function drawKindShape(ctx, kind, x, y, r) {
  ctx.beginPath()
  if (kind === 0) {
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
    return
  }
  if (kind === 1) {
    ctx.rect(x - r, y - r, r * 2, r * 2)
    ctx.fill()
    return
  }
  if (kind === 2) {
    ctx.moveTo(x, y - r)
    ctx.lineTo(x + r, y + r)
    ctx.lineTo(x - r, y + r)
    ctx.closePath()
    ctx.fill()
    return
  }
  ctx.moveTo(x, y - r)
  ctx.lineTo(x + r, y)
  ctx.lineTo(x, y + r)
  ctx.lineTo(x - r, y)
  ctx.closePath()
  ctx.fill()
}

function buildChart(pattern) {
  const baseTime = 1500
  const step = 800
  return pattern
    .map((toneId, index) => {
      const kind = TONE_INDEX[toneId]
      if (kind == null) return null
      return { t: baseTime + step * index, kind }
    })
    .filter(Boolean)
}

export default function SoundPatternPuzzle() {
  const {
    gameState,
    playTone,
    completeSoundPuzzle,
    triggerEvent,
    scheduleTimeout,
    activeChallenge,
  } = useGame()

  const canvasRef = useRef(null)
  const engineRef = useRef(null)
  const solvedRef = useRef(false)

  const [engineState, setEngineState] = useState(INITIAL_ENGINE_STATE)
  const [feedback, setFeedback] = useState('idle')
  const [didAnnounce, setDidAnnounce] = useState(false)

  const solved = Boolean(gameState.puzzleProgress?.sound?.solved)
  solvedRef.current = solved

  const remainingSteps = Math.max(SOUND_PATTERN.length - engineState.progress, 0)
  const expectedTone = useMemo(() => {
    if (engineState.expectedKind == null) return null
    return TONE_BANK[engineState.expectedKind]
  }, [engineState.expectedKind])

  const accuracy = useMemo(() => {
    const { perfect, good, ok } = engineState.counts
    const hits = perfect + good + ok
    if (!hits) return 0
    const weighted = perfect * 1 + good * 0.7 + ok * 0.4
    return Math.round((weighted / hits) * 100)
  }, [engineState.counts])

  useEffect(() => {
    if (feedback === 'idle') return
    return scheduleTimeout(() => setFeedback('idle'), 900)
  }, [feedback, scheduleTimeout])

  useEffect(() => {
    if (solved) return
    if (didAnnounce) return
    if (activeChallenge !== 'sound') return
    triggerEvent('sound_puzzle_intro')
    setDidAnnounce(true)
  }, [activeChallenge, didAnnounce, solved, triggerEvent])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const engine = new RhythmLaneEngine(canvas, {
      initialSpeed: 0.25,
      onStateChange: (state) => {
        setEngineState((prev) => ({ ...prev, ...state }))
      },
      onNote: (kind, meta) => {
        const tone = TONE_BANK[kind]
        if (tone) {
          playTone(tone.frequency)
        }
        if (!solvedRef.current && !meta.auto) {
          setFeedback('progress')
        }
      },
      onProgress: () => {
        if (!solvedRef.current) setFeedback('progress')
      },
      onComplete: () => {
        if (!solvedRef.current) {
          setFeedback('success')
          completeSoundPuzzle()
        }
      },
      onMiss: () => {
        if (!solvedRef.current) {
          triggerEvent('sound_puzzle_miss')
          setFeedback('error')
        }
      },
      isInputBlocked: () => solvedRef.current,
    })

    engine.setChart(buildChart(SOUND_PATTERN))
    engineRef.current = engine
    setEngineState((prev) => ({ ...prev, ...engine.getState() }))

    return () => {
      engine.options.onStateChange = null
      engine.destroy()
      engineRef.current = null
    }
  }, [completeSoundPuzzle, playTone, triggerEvent])

  useEffect(() => {
    if (!engineRef.current) return
    engineRef.current.setDisabled(solved)
  }, [solved])

  const handlePlay = () => {
    engineRef.current?.play()
  }

  const handlePause = () => {
    engineRef.current?.pause()
  }

  const handleReset = () => {
    engineRef.current?.reset()
    if (!solved) setFeedback('idle')
  }

  const handleSpeedChange = (event) => {
    const value = Number(event.target.value)
    engineRef.current?.setSpeed(value)
    setEngineState((prev) => ({ ...prev, speed: value }))
  }

  const handleAutoplayToggle = (event) => {
    const checked = event.target.checked
    engineRef.current?.setAutoplay(checked)
    setEngineState((prev) => ({ ...prev, autoplay: checked }))
  }

  const handleManualPress = (kind) => {
    engineRef.current?.pressKind(kind)
  }

  const statusText = solved
    ? 'Canal estabilizado. Frecuencias desbloqueadas.'
    : feedback === 'error'
    ? 'Secuencia incorrecta detectada. Reintentando…'
    : feedback === 'progress'
    ? `Capturando patrón… faltan ${remainingSteps} pulso${remainingSteps === 1 ? '' : 's'}.`
    : feedback === 'success'
    ? 'Secuencia replicada. Canal asegurado.'
    : 'Escucha el eco del arranque. Prioriza el pulso indicado en el terminal.'

  return (
    <section
      className={`bg-panel border border-border rounded-lg p-4 flex flex-col gap-4 transition-shadow ${
        solved ? 'glow-success' : ''
      }`}
    >
      <header className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">Secuencia Resonante</div>
          <p className="text-xs text-slate-400 mt-1">
            Replica el patrón temporal pulsando las teclas asignadas cuando el símbolo alcance la zona de impacto.
          </p>
        </div>
        <div className="text-[11px] uppercase tracking-wide text-slate-500">
          {solved ? 'Calibrado' : 'Pendiente'}
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="relative rounded-xl border border-white/5 bg-black/40 p-3 shadow-inner">
          <canvas
            ref={canvasRef}
            width={640}
            height={360}
            className="w-full max-w-full rounded-lg border border-white/10 bg-[#0b0f17]"
          />
        </div>

        <aside className="flex flex-col gap-3 rounded-xl border border-white/5 bg-black/35 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handlePlay}
              className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-500/20 disabled:opacity-60"
              disabled={solved}
            >
              Play
            </button>
            <button
              type="button"
              onClick={handlePause}
              className="rounded-lg border border-slate-500/40 bg-slate-500/10 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-500/20"
            >
              Pause
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-100 transition hover:bg-amber-500/20"
            >
              Reset
            </button>
            <label className="ml-auto flex items-center gap-2 text-xs text-slate-300">
              <input
                type="checkbox"
                checked={engineState.autoplay}
                onChange={handleAutoplayToggle}
                className="h-3.5 w-3.5 rounded border border-slate-500/60 bg-black"
              />
              Autoplay
            </label>
          </div>

          <label className="flex flex-col gap-1 text-xs text-slate-300">
            Velocidad
            <select
              value={engineState.speed}
              onChange={handleSpeedChange}
              className="rounded-lg border border-slate-600/60 bg-slate-900 px-2 py-1 text-xs text-slate-100"
            >
              {SPEED_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-200">
            <div className="rounded-lg border border-white/10 bg-black/40 p-2">
              <span className="block text-slate-400">Score</span>
              <strong className="text-sm">{engineState.score}</strong>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/40 p-2">
              <span className="block text-slate-400">Combo</span>
              <strong className="text-sm">{engineState.combo}</strong>
              <span className="block text-[10px] text-slate-500">Max {engineState.maxCombo}</span>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/40 p-2">
              <span className="block text-slate-400">Accuracy</span>
              <strong className="text-sm">{accuracy}%</strong>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/40 p-2">
              <span className="block text-slate-400">Estado</span>
              <span className="text-xs text-slate-200/90">
                {engineState.isPlaying ? 'Reproduciendo' : 'Detenido'}
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-black/40 p-2 text-[11px] text-slate-200">
            <span className="block text-slate-400">Último</span>
            <span>{engineState.last || '—'}</span>
          </div>

          <div className="rounded-lg border border-white/10 bg-black/40 p-2 text-[11px] text-slate-200">
            {expectedTone ? (
              <span>
                Esperada: <strong>{expectedTone.label}</strong> · tecla {expectedTone.keyLabel}
              </span>
            ) : (
              <span>Esperada: — (completado)</span>
            )}
          </div>

          <div className="rounded-lg border border-white/10 bg-black/40 p-2 text-[11px] text-slate-200">
            <span className="block text-slate-400">Pulsaciones</span>
            <span className="flex flex-wrap gap-1">
              {engineState.keyfeed.length === 0 ? (
                <span className="text-slate-500">—</span>
              ) : (
                engineState.keyfeed.map((entry) => (
                  <span
                    key={entry.id}
                    className={`rounded px-1 ${entry.ok ? 'text-emerald-300 bg-emerald-500/10' : 'text-rose-300 bg-rose-500/10'}`}
                  >
                    {entry.text}
                  </span>
                ))
              )}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-left">
            {TONE_BANK.map((tone, index) => {
              const isNext = !solved && engineState.expectedKind === index
              return (
                <button
                  key={tone.id}
                  type="button"
                  onClick={() => handleManualPress(index)}
                  disabled={solved}
                  className={`relative overflow-hidden rounded-lg border px-2 py-3 text-left transition ${
                    solved
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'
                      : 'border-white/10 bg-zinc-900/60 hover:bg-zinc-800/60 text-slate-100'
                  } ${isNext ? 'ring-2 ring-emerald-400/70' : ''}`}
                >
                  <div
                    className={`absolute inset-0 opacity-70 bg-gradient-to-br ${tone.gradient}`}
                    aria-hidden="true"
                  />
                  <div className="relative z-10 flex flex-col gap-1">
                    <span className="text-lg font-bold font-mono">{tone.label}</span>
                    <span className="text-[11px] text-slate-100/80">{tone.description}</span>
                    <span className="text-[10px] text-slate-200/80">Tecla {tone.keyLabel}</span>
                  </div>
                </button>
              )
            })}
          </div>

          <p className="text-[11px] text-slate-400">
            Atajos: <span className="rounded border border-slate-600/60 bg-slate-900 px-1">1-4</span> para pulsos,{' '}
            <span className="rounded border border-slate-600/60 bg-slate-900 px-1">Espacio</span> Play/Pause,{' '}
            <span className="rounded border border-slate-600/60 bg-slate-900 px-1">R</span> Reset.
          </p>
        </aside>
      </div>

      <footer className="text-xs text-slate-300/90 bg-black/30 border border-zinc-800 rounded px-3 py-2 font-mono">
        {statusText}
      </footer>
    </section>
  )
}
