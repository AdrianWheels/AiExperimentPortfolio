import React, { useRef, useEffect, useState, useCallback } from 'react'
import { useGame } from '../../../context/GameContext'
import { evaluateSoundSequence, nextExpectedTone, SOUND_PATTERN } from './soundLogic'

// Configuración del juego tipo Guitar Hero
const FALL_TIME_MS = 3000
const HIT_WINDOW_MS = 280
const MISS_GRACE_MS = 120
const PERFECT_MS = 60
const GOOD_MS = 120

// Iconos geométricos en lugar de letras griegas
const TONE_BANK = [
  { id: 'alpha', label: '●', frequency: 320, color: '#60a5fa', key: '1' },
  { id: 'beta', label: '◆', frequency: 180, color: '#34d399', key: '2' },
  { id: 'gamma', label: '▲', frequency: 520, color: '#f472b6', key: '3' },
  { id: 'delta', label: '▬', frequency: 260, color: '#f59e0b', key: '4' },
]

// Mapeo de teclas a tipos de tonos
const KEY_TO_TONE = {
  'Digit1': 'alpha',
  'Digit2': 'beta',
  'Digit3': 'gamma',
  'Digit4': 'delta',
  'Space': 'auto'
}

export default function ResonanceSequenceEngine() {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const animationRef = useRef(null)
  const [gameEngine, setGameEngine] = useState(null)
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 120 })

  const {
    gameState,
    playTone,
    completeSoundPuzzle,
    triggerEvent,
    scheduleTimeout,
    activeChallenge,
    setPuzzleStarted,
  } = useGame()

  const solved = Boolean(gameState.puzzleProgress?.sound?.solved)

  // ResizeObserver para canvas responsive
  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect
        // Mantener aspect ratio 4:1 aproximadamente
        const height = Math.max(100, Math.min(160, width * 0.3))
        setCanvasSize({ width: Math.floor(width), height: Math.floor(height) })
      }
    })

    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  // Motor del juego Guitar Hero
  class ResonanceEngine {
    constructor(canvas, onSuccess, onFail, onProgress) {
      this.canvas = canvas
      this.ctx = canvas.getContext('2d')
      this.onSuccess = onSuccess
      this.onFail = onFail
      this.onProgress = onProgress

      this.resetState()
      this.setupGeometry()
      this.bindEvents()
    }

    resetState() {
      this.speed = 0.8
      this.isPlaying = false
      this.startedAt = 0
      this.pauseAt = 0

      this.chart = []
      this.idxNext = 0
      this.userInput = []

      this.score = 0
      this.combo = 0
      this.maxCombo = 0
      this.counts = { perfect: 0, good: 0, ok: 0, miss: 0 }
      this.lastResult = ""
      this.feedback = []
    }

    setupGeometry() {
      this.w = this.canvas.width
      this.h = this.canvas.height
      this.laneY = this.h * 0.55
      this.hitX = this.w * 0.85
      // Escalar noteRadius según el tamaño del canvas
      this.noteRadius = Math.max(16, Math.min(28, this.w * 0.05))
    }

    updateGeometry() {
      this.w = this.canvas.width
      this.h = this.canvas.height
      this.laneY = this.h * 0.55
      this.hitX = this.w * 0.85
      this.noteRadius = Math.max(16, Math.min(28, this.w * 0.05))
    }

    setChart(sequence) {
      this.chart = sequence.map((toneId, index) => ({
        t: (index + 1) * 1200,
        toneId: toneId,
        state: "pending"
      }))
      this.idxNext = 0
    }

    play() {
      if (this.isPlaying) return
      this.isPlaying = true
      const now = performance.now()

      if (!this.startedAt) {
        this.startedAt = now
      } else if (this.pauseAt) {
        const paused = now - this.pauseAt
        this.startedAt += paused
        this.pauseAt = 0
      }

      this.loop()
    }

    pause() {
      if (!this.isPlaying) return
      this.isPlaying = false
      this.pauseAt = performance.now()
      if (this.animationRef) {
        cancelAnimationFrame(this.animationRef)
        this.animationRef = null
      }
    }

    reset() {
      if (this.animationRef) {
        cancelAnimationFrame(this.animationRef)
        this.animationRef = null
      }

      const savedChart = this.chart.map(n => ({ t: n.t, toneId: n.toneId }))
      this.resetState()
      this.setChart(savedChart.map(n => n.toneId))
      this.renderStatic()
    }

    gameNow() {
      if (!this.startedAt) return 0
      return (performance.now() - this.startedAt) * this.speed
    }

    expectedNote() {
      return this.chart[this.idxNext] || null
    }

    onKey(toneId) {
      if (toneId === 'auto') {
        this.autoHit()
        return
      }

      const expected = this.expectedNote()
      if (!expected) return

      if (toneId !== expected.toneId) {
        this.feedbackPush(`${this.getKeyForTone(toneId)}≠${this.getKeyForTone(expected.toneId)}`, false)
        this.failAndRestart(`Tecla equivocada`)
        return
      }

      const dt = this.gameNow() - expected.t
      const absTime = Math.abs(dt)

      if (absTime <= HIT_WINDOW_MS) {
        this.registerHit(expected, dt)
      } else {
        const timing = dt < 0 ? `temprano ${Math.round(-dt)}ms` : `tarde ${Math.round(dt)}ms`
        this.feedbackPush(`${this.getKeyForTone(toneId)} (${timing})`, false)
        this.failAndRestart(`Fuera de ventana: ${timing}`)
      }
    }

    autoHit() {
      const expected = this.expectedNote()
      if (!expected) return

      const dt = this.gameNow() - expected.t
      if (Math.abs(dt) <= HIT_WINDOW_MS) {
        this.registerHit(expected, dt)
      }
    }

    registerHit(note, dt) {
      note.state = "hit"
      const absTime = Math.abs(dt)

      let label = "Ok"
      let points = 100
      this.counts.ok++

      if (absTime <= PERFECT_MS) {
        label = "Perfect"
        points = 300
        this.counts.perfect++
      } else if (absTime <= GOOD_MS) {
        label = "Good"
        points = 200
        this.counts.good++
      }

      this.score += points + Math.floor(this.combo * 1.5)
      this.combo++
      this.maxCombo = Math.max(this.maxCombo, this.combo)
      this.lastResult = `${label} (${Math.round(absTime)}ms)`

      const tone = TONE_BANK.find(t => t.id === note.toneId)
      if (tone) {
        playTone(tone.frequency)
      }

      this.feedbackPush(`${this.getKeyForTone(note.toneId)} ✓`, true)
      this.userInput.push(note.toneId)
      this.idxNext++

      const evaluation = evaluateSoundSequence(this.userInput, SOUND_PATTERN)

      if (evaluation.status === 'correct') {
        this.isPlaying = false
        if (this.animationRef) {
          cancelAnimationFrame(this.animationRef)
          this.animationRef = null
        }
        this.lastResult = "¡Secuencia Completada!"
        this.onSuccess()
      } else {
        this.onProgress(evaluation.progress, SOUND_PATTERN.length)
      }
    }

    failAndRestart(reason) {
      const expected = this.expectedNote()
      if (expected && expected.state === "pending") {
        expected.state = "miss"
        this.counts.miss++
      }

      this.combo = 0
      this.lastResult = `Fallo: ${reason}`
      this.userInput = []

      // Reiniciar chart
      this.chart = this.chart.map(n => ({ ...n, state: "pending" }))
      this.idxNext = 0
      this.startedAt = performance.now()

      if (!this.isPlaying) {
        this.isPlaying = true
        this.loop()
      }

      this.onFail(reason)
    }

    getKeyForTone(toneId) {
      const tone = TONE_BANK.find(t => t.id === toneId)
      return tone ? tone.key : '?'
    }

    feedbackPush(text, success) {
      this.feedback.unshift({ text, success, at: performance.now() })
      if (this.feedback.length > 6) this.feedback.pop()
    }

    loop() {
      if (!this.isPlaying) return

      this.updateGeometry()
      const ctx = this.ctx
      const w = this.w
      const h = this.h

      // Limpiar canvas
      ctx.clearRect(0, 0, w, h)

      // Renderizar carril
      this.renderLane()

      const gNow = this.gameNow()

      // Renderizar notas
      for (let i = 0; i < this.chart.length; i++) {
        const note = this.chart[i]
        if (note.state === "hit") continue

        const appearAt = note.t - FALL_TIME_MS
        if (appearAt > gNow) continue

        const progress = Math.min((gNow - appearAt) / FALL_TIME_MS, 1)
        const marginLeft = this.w * 0.05
        const x = marginLeft + progress * (this.hitX - marginLeft)

        const tone = TONE_BANK.find(t => t.id === note.toneId)
        if (!tone) continue

        ctx.globalAlpha = note.state === "miss" ? 0.3 : 1
        this.drawNote(ctx, x, this.laneY, tone)
        ctx.globalAlpha = 1
      }

      // Ghost de la próxima nota
      const next = this.expectedNote()
      if (next) {
        const tone = TONE_BANK.find(t => t.id === next.toneId)
        if (tone) {
          ctx.globalAlpha = 0.4
          this.drawNote(ctx, this.hitX, this.laneY, tone, true)
          ctx.globalAlpha = 1
        }
      }

      // Verificar miss por timeout
      const expectedNote = this.expectedNote()
      if (expectedNote) {
        const dt = gNow - expectedNote.t
        if (dt > HIT_WINDOW_MS + MISS_GRACE_MS) {
          this.feedbackPush(`${this.getKeyForTone(expectedNote.toneId)} (miss)`, false)
          this.failAndRestart("Tiempo agotado")
        }
      }

      this.animationRef = requestAnimationFrame(() => this.loop())
    }

    renderLane() {
      const ctx = this.ctx
      const w = this.w
      const h = this.h

      // 1. Background Grid / Tech lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)"
      ctx.lineWidth = 1

      // Horizontal lines (top and bottom of lane)
      const laneHeight = Math.min(40, h * 0.4)
      const topY = this.laneY - laneHeight / 2
      const bottomY = this.laneY + laneHeight / 2

      ctx.beginPath()
      ctx.moveTo(0, topY)
      ctx.lineTo(w, topY)
      ctx.moveTo(0, bottomY)
      ctx.lineTo(w, bottomY)
      ctx.stroke()

      // Vertical grid moving effect (optional, but static for now)
      ctx.setLineDash([2, 10])
      ctx.beginPath()
      for (let x = 0; x < w; x += 40) {
        ctx.moveTo(x, topY - 20)
        ctx.lineTo(x, bottomY + 20)
      }
      ctx.stroke()
      ctx.setLineDash([])

      // 2. Hit Zone (Scanner style)
      const hitSize = Math.min(30, this.noteRadius * 1.1)
      const bracketSize = Math.min(10, hitSize * 0.35)

      ctx.shadowBlur = 15
      ctx.shadowColor = "#8b5cf6"
      ctx.strokeStyle = "#8b5cf6"
      ctx.lineWidth = 2

      // Left bracket
      ctx.beginPath()
      ctx.moveTo(this.hitX - hitSize, this.laneY - hitSize + bracketSize)
      ctx.lineTo(this.hitX - hitSize, this.laneY - hitSize)
      ctx.lineTo(this.hitX - hitSize + bracketSize, this.laneY - hitSize)

      ctx.moveTo(this.hitX - hitSize, this.laneY + hitSize - bracketSize)
      ctx.lineTo(this.hitX - hitSize, this.laneY + hitSize)
      ctx.lineTo(this.hitX - hitSize + bracketSize, this.laneY + hitSize)
      ctx.stroke()

      // Right bracket
      ctx.beginPath()
      ctx.moveTo(this.hitX + hitSize, this.laneY - hitSize + bracketSize)
      ctx.lineTo(this.hitX + hitSize, this.laneY - hitSize)
      ctx.lineTo(this.hitX + hitSize - bracketSize, this.laneY - hitSize)

      ctx.moveTo(this.hitX + hitSize, this.laneY + hitSize - bracketSize)
      ctx.lineTo(this.hitX + hitSize, this.laneY + hitSize)
      ctx.lineTo(this.hitX + hitSize - bracketSize, this.laneY + hitSize)
      ctx.stroke()

      ctx.shadowBlur = 0

      // Center line (scanner beam)
      ctx.strokeStyle = "rgba(139, 92, 246, 0.3)"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(this.hitX, topY)
      ctx.lineTo(this.hitX, bottomY)
      ctx.stroke()
    }

    drawNote(ctx, x, y, tone, isGhost = false) {
      const radius = this.noteRadius
      const fontSize = Math.max(12, radius * 0.7)

      if (isGhost) {
        ctx.globalAlpha = 0.3
        ctx.strokeStyle = tone.color
        ctx.lineWidth = 2
        ctx.setLineDash([4, 4])
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.globalAlpha = 1
        return
      }

      // Trail effect
      const trailLength = radius * 2.2
      const gradient = ctx.createLinearGradient(x - trailLength, y, x, y)
      gradient.addColorStop(0, "transparent")
      gradient.addColorStop(1, tone.color)

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.moveTo(x, y - radius * 0.5)
      ctx.lineTo(x - trailLength, y)
      ctx.lineTo(x, y + radius * 0.5)
      ctx.fill()

      // Glow
      ctx.shadowColor = tone.color
      ctx.shadowBlur = 20

      // Core
      ctx.fillStyle = "#fff"
      ctx.beginPath()
      ctx.arc(x, y, radius * 0.6, 0, Math.PI * 2)
      ctx.fill()

      // Outer ring
      ctx.strokeStyle = tone.color
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.stroke()

      ctx.shadowBlur = 0

      // Symbol
      ctx.fillStyle = tone.color
      ctx.font = `bold ${fontSize}px sans-serif`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(tone.label, x, y)

      // Key hint below
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)"
      ctx.font = `${Math.max(10, fontSize * 0.6)}px monospace`
      ctx.fillText(tone.key, x, y + radius + 12)
    }

    renderStatic() {
      const ctx = this.ctx
      ctx.clearRect(0, 0, this.w, this.h)
      this.renderLane()
    }

    bindEvents() {
      window.addEventListener('keydown', (ev) => {
        if (ev.repeat) return

        if (ev.code === 'Space') {
          ev.preventDefault()
          if (this.isPlaying) {
            this.pause()
          } else {
            this.play()
          }
          return
        }

        if (ev.code === 'KeyR') {
          this.reset()
          return
        }

        const toneId = KEY_TO_TONE[ev.code]
        if (toneId) {
          this.onKey(toneId)
        }
      })
    }
  }

  // Inicializar motor del juego
  useEffect(() => {
    if (!canvasRef.current || solved) return

    const engine = new ResonanceEngine(
      canvasRef.current,
      () => {
        // Éxito - completar puzzle
        triggerEvent('sound_puzzle_complete')
        completeSoundPuzzle()
      },
      (reason) => {
        // Fallo
        triggerEvent('sound_puzzle_miss')
      },
      (current, total) => {
        // Progreso
        triggerEvent('sound_puzzle_progress', { current, total })
      }
    )

    engine.setChart(SOUND_PATTERN)
    setGameEngine(engine)

    return () => {
      if (engine.animationRef) {
        cancelAnimationFrame(engine.animationRef)
      }
    }
  }, [solved, completeSoundPuzzle, triggerEvent])

  // Actualizar geometría cuando cambia el tamaño
  useEffect(() => {
    if (gameEngine && canvasRef.current) {
      gameEngine.updateGeometry()
      if (!gameEngine.isPlaying) {
        gameEngine.renderStatic()
      }
    }
  }, [canvasSize, gameEngine])

  // Controles de UI
  const handlePlay = useCallback(() => {
    if (gameEngine) {
      gameEngine.play()
      setPuzzleStarted(true) // Notificar a KIRA que el puzzle ha comenzado
    }
  }, [gameEngine, setPuzzleStarted])

  const handlePause = useCallback(() => {
    if (gameEngine) gameEngine.pause()
  }, [gameEngine])

  const handleReset = useCallback(() => {
    if (gameEngine) gameEngine.reset()
  }, [gameEngine])

  if (solved) {
    return (
      <section className="flex flex-col gap-3 h-full p-3 sm:p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl backdrop-blur-sm">
        <header className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Resonancia</h3>
          <span className="text-[10px] uppercase tracking-wide text-success">✓ Completado</span>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-sm text-success font-medium">Sincronización Establecida</div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-3 sm:gap-4 h-full p-3 sm:p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl backdrop-blur-sm">
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-100">Resonancia</h3>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
          <span className="text-[10px] uppercase tracking-wider text-purple-400 font-medium">Activo</span>
        </div>
      </header>

      {/* Referencia de teclas - Grid responsive: 2 cols móvil, 4 cols desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {TONE_BANK.map((tone) => (
          <button
            key={tone.id}
            onClick={() => gameEngine?.onKey(tone.id)}
            className="flex flex-col items-center gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-lg bg-zinc-900/80 border border-zinc-800/50 hover:bg-zinc-800/80 active:scale-95 transition-all cursor-pointer"
          >
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg sm:text-xl font-bold border-2 transition-all hover:scale-110 active:scale-95"
              style={{
                backgroundColor: `${tone.color}20`,
                borderColor: tone.color,
                boxShadow: `0 0 15px ${tone.color}40`
              }}
            >
              <span style={{ color: tone.color }}>{tone.label}</span>
            </div>
            <span className="text-zinc-300 text-sm sm:text-base font-mono font-bold border border-zinc-700 px-2.5 py-1 rounded bg-zinc-950">{tone.key}</span>
          </button>
        ))}
      </div>

      {/* Canvas del juego - Responsive */}
      <div
        ref={containerRef}
        className="relative flex-1 min-h-[100px] sm:min-h-[120px] rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-inner"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent opacity-50"></div>
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="block w-full h-full relative z-10"
        />
      </div>

      {/* Controles simplificados */}
      <div className="flex justify-center gap-2 sm:gap-3">
        <button
          onClick={handlePlay}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs rounded-lg bg-zinc-800/50 border border-zinc-700 hover:bg-zinc-700/50 transition-colors"
          title="Iniciar (Espacio)"
        >
          <span className="text-emerald-400 text-sm">▶</span>
          <span>Play</span>
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs rounded-lg bg-zinc-800/50 border border-zinc-700 hover:bg-zinc-700/50 transition-colors"
          title="Reiniciar (R)"
        >
          <span className="text-rose-400 text-sm">↺</span>
          <span>Reset</span>
        </button>
      </div>
    </section>
  )
}