import React, { useRef, useEffect, useState, useCallback } from 'react'
import { useGame } from '../../../context/GameContext'
import { evaluateSoundSequence, nextExpectedTone, SOUND_PATTERN } from './soundLogic'

// Configuración del juego tipo Guitar Hero
const FALL_TIME_MS = 3000
const HIT_WINDOW_MS = 280
const MISS_GRACE_MS = 120
const PERFECT_MS = 60
const GOOD_MS = 120

const TONE_BANK = [
  { id: 'alpha', label: 'α', description: 'Pulso corto', frequency: 320, color: '#60a5fa', symbol: '●', key: '1' },
  { id: 'beta', label: 'β', description: 'Pulso grave', frequency: 180, color: '#34d399', symbol: '◆', key: '2' },
  { id: 'gamma', label: 'γ', description: 'Pulso agudo', frequency: 520, color: '#f472b6', symbol: '▲', key: '3' },
  { id: 'delta', label: 'δ', description: 'Pulso largo', frequency: 260, color: '#f59e0b', symbol: '▬', key: '4' },
]

// Mapeo de teclas a tipos de tonos
const KEY_TO_TONE = { 
  'Digit1': 'alpha', 
  'Digit2': 'beta', 
  'Digit3': 'gamma', 
  'Digit4': 'delta',
  'Space': 'auto' // Para auto-hit en la zona
}

export default function ResonanceSequenceEngine() {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const [gameEngine, setGameEngine] = useState(null)
  
  const {
    gameState,
    playTone,
    completeSoundPuzzle,
    triggerEvent,
    scheduleTimeout,
    activeChallenge,
  } = useGame()

  const solved = Boolean(gameState.puzzleProgress?.sound?.solved)

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
      
      // Estado del juego
      this.chart = []
      this.idxNext = 0
      this.userInput = []
      
      // Métricas
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
      this.laneY = this.h * 0.6  // Carril horizontal
      this.hitX = this.w * 0.85  // Zona de impacto a la derecha
      this.noteRadius = 20
    }

    setChart(sequence) {
      // Convertir la secuencia del patrón a chart con tiempos
      this.chart = sequence.map((toneId, index) => ({
        t: (index + 1) * 1200, // 1.2 segundos entre notas
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
      
      // Reproducir sonido
      const tone = TONE_BANK.find(t => t.id === note.toneId)
      if (tone) {
        playTone(tone.frequency)
      }
      
      this.feedbackPush(`${this.getKeyForTone(note.toneId)} ✓`, true)
      this.userInput.push(note.toneId)
      this.idxNext++
      
      // Verificar progreso
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
        
        // Renderizar nota
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
      
      // Carril principal
      const laneHeight = 32
      ctx.fillStyle = "#1a202c"
      ctx.fillRect(0, this.laneY - laneHeight/2, w, laneHeight)
      
      // Líneas de guía
      ctx.strokeStyle = "#2d3748"
      ctx.lineWidth = 1
      ctx.setLineDash([6, 12])
      ctx.beginPath()
      for (let x = 0; x < w; x += 50) {
        ctx.moveTo(x, this.laneY - laneHeight/2 - 15)
        ctx.lineTo(x, this.laneY + laneHeight/2 + 15)
      }
      ctx.stroke()
      ctx.setLineDash([])
      
      // Zona de impacto
      ctx.strokeStyle = "#48bb78"
      ctx.lineWidth = 4
      ctx.strokeRect(this.hitX - 28, this.laneY - laneHeight, 56, laneHeight * 2)
      
      // Indicador central
      ctx.fillStyle = "#48bb78"
      ctx.beginPath()
      ctx.arc(this.hitX, this.laneY, 4, 0, Math.PI * 2)
      ctx.fill()
    }

    drawNote(ctx, x, y, tone, isGhost = false) {
      const radius = this.noteRadius
      
      // Sombra/glow
      if (!isGhost) {
        ctx.shadowColor = tone.color
        ctx.shadowBlur = 12
      }
      
      // Nota principal
      ctx.fillStyle = tone.color
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
      
      // Borde
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 3
      ctx.stroke()
      
      // Símbolo
      ctx.shadowBlur = 0
      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 16px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(tone.symbol, x, y)
      
      // Tecla
      ctx.font = "bold 12px sans-serif"
      ctx.fillText(tone.key, x, y + 35)
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

  // Controles de UI
  const handlePlay = useCallback(() => {
    if (gameEngine) gameEngine.play()
  }, [gameEngine])

  const handlePause = useCallback(() => {
    if (gameEngine) gameEngine.pause()
  }, [gameEngine])

  const handleReset = useCallback(() => {
    if (gameEngine) gameEngine.reset()
  }, [gameEngine])

  if (solved) {
    return (
      <section className="bg-panel border border-border rounded-lg p-4 flex flex-col gap-3 flex-1 min-h-0 glow-success">
        <header className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Secuencia Resonante</div>
            <p className="text-xs text-emerald-400">✓ Calibrado y estabilizado</p>
          </div>
          <div className="text-[11px] uppercase tracking-wide text-emerald-400">
            Completado
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">🎵</div>
            <div className="text-sm text-emerald-400 font-medium">
              Resonancia Establecida
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Canal de frecuencias desbloqueado
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-panel border border-border rounded-lg p-4 flex flex-col gap-3 flex-1 min-h-0">
      <header className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">Secuencia Resonante — Motor Guitar Hero</div>
          <p className="text-xs text-slate-400 mt-1">
            Presiona las teclas correctas cuando las notas lleguen a la zona verde
          </p>
        </div>
        <div className="text-[11px] uppercase tracking-wide text-slate-500">
          Motor Activo
        </div>
      </header>

      {/* Referencia de teclas */}
      <div className="flex justify-center gap-2 py-2 bg-black/20 rounded border border-zinc-700">
        {TONE_BANK.map((tone) => (
          <div key={tone.id} className="flex flex-col items-center gap-1 text-xs px-2">
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-white/20"
              style={{ backgroundColor: tone.color }}
            >
              {tone.symbol}
            </div>
            <span className="text-slate-300">{tone.key}</span>
            <span className="text-slate-500 text-[10px]">{tone.label}</span>
          </div>
        ))}
      </div>

      {/* Canvas del juego */}
      <div className="relative bg-black/50 border border-zinc-700 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          width={600}
          height={140}
          className="block w-full h-full"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>

      {/* Controles */}
      <div className="flex justify-center gap-2">
        <button
          onClick={handlePlay}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors text-sm"
        >
          Play
        </button>
        <button
          onClick={handlePause}
          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors text-sm"
        >
          Pause
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors text-sm"
        >
          Reset
        </button>
      </div>

      {/* Información de estado */}
      <div className="text-xs text-slate-300 bg-black/30 border border-zinc-800 rounded px-3 py-2 font-mono">
        <div className="flex justify-between items-center">
          <span>Secuencia objetivo: α → δ → γ → β</span>
          <span>Teclas: 1, 4, 3, 2 | Espacio: Play/Pause | R: Reset</span>
        </div>
        <div className="mt-1 text-slate-400">
          Motor Guitar Hero activo. Presiona las teclas cuando las notas lleguen a la zona verde.
        </div>
      </div>
    </section>
  )
}