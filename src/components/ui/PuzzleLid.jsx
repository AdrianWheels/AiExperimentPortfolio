import React, { useRef, useEffect, useState, useCallback } from 'react'

// Sistema de tapas modular para ocultar puzzles
export default function PuzzleLid({ 
  isLocked = true,
  onUnlock = () => {},
  children,
  lidText = "ACCESO RESTRINGIDO",
  hiddenMessage = "Nada que ver aquí... 👀",
  customMessage = null,
  variant = "standard", // "standard", "classified", "maintenance", "experimental"
  className = "",
  forceOpen = false // Para forzar apertura automática
}) {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const [lidEngine, setLidEngine] = useState(null)
  const [dimensions, setDimensions] = useState({ width: 400, height: 300 })

  // Observar cambios de tamaño del contenedor padre
  useEffect(() => {
    if (!canvasRef.current) return

    const updateDimensions = () => {
      const parent = canvasRef.current.parentElement
      if (parent) {
        const rect = parent.getBoundingClientRect()
        setDimensions({ 
          width: Math.max(200, rect.width), 
          height: Math.max(150, rect.height) 
        })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    
    // Observer para cambios en el contenedor padre
    const resizeObserver = new ResizeObserver(updateDimensions)
    if (canvasRef.current.parentElement) {
      resizeObserver.observe(canvasRef.current.parentElement)
    }

    return () => {
      window.removeEventListener('resize', updateDimensions)
      resizeObserver.disconnect()
    }
  }, [])

  // Configuración de variantes
  const variants = {
    standard: {
      lidColor: '#3b4353',
      lidColorSecondary: '#2e3543',
      backgroundColor: '#242b36',
      borderColor: '#0f1318',
      screwColor: '#c7ccd6',
      textColor: '#dce4f0',
      lidText: lidText || "ACCESO RESTRINGIDO",
      hingeColor: '#1b212b'
    },
    classified: {
      lidColor: '#4a3535',
      lidColorSecondary: '#3d2e2e',
      backgroundColor: '#362424',
      borderColor: '#1a0f0f',
      screwColor: '#d6c7c7',
      textColor: '#f0dce4',
      lidText: lidText || "CLASIFICADO",
      hingeColor: '#2b1b1b'
    },
    maintenance: {
      lidColor: '#4a4235',
      lidColorSecondary: '#3d372e',
      backgroundColor: '#362f24',
      borderColor: '#1a160f',
      screwColor: '#d6d0c7',
      textColor: '#f0eadc',
      lidText: lidText || "MANTENIMIENTO",
      hingeColor: '#2b251b'
    },
    experimental: {
      lidColor: '#353b4a',
      lidColorSecondary: '#2e343d',
      backgroundColor: '#242936',
      borderColor: '#0f131a',
      screwColor: '#c7cdd6',
      textColor: '#dce4f0',
      lidText: lidText || "EXPERIMENTAL",
      hingeColor: '#1b1f2b'
    }
  }

  const config = variants[variant] || variants.standard

  // Motor de la tapa
  class LidEngine {
    constructor(canvas) {
      this.canvas = canvas
      this.ctx = canvas.getContext('2d')
      this.setupState()
      this.setupGeometry()
      this.bindEvents()
      this.lastTime = performance.now()
    }

    setupState() {
      this.angleTarget = 0 // 0 = cerrada, 100 = abierta
      this.angle = 0
      this.detached = false
      this.dragging = false
      this.startY = 0
      this.startAngle = 0
      
      // Física para cuando se suelta la tapa
      this.body = {
        x: 0, y: 0, angle: 0,
        vx: 0, vy: 0, va: 0,
        alive: false
      }
      this.gravity = 120 // px/s²
    }

    setupGeometry() {
      this.w = this.canvas.width
      this.h = this.canvas.height
      // Panel que cubre todo el contenido - margen reducido para maximizar espacio
      this.panel = {
        x: 4,
        y: 4,
        w: this.w - 8,
        h: this.h - 8,
        r: 8
      }
    }

    setAngleTarget(value) {
      this.angleTarget = this.clamp(value, 0, 100)
    }

    clamp(v, a, b) {
      return Math.max(a, Math.min(b, v))
    }

    snap() {
      // Auto-snap a cerrada o abierta
      this.setAngleTarget(this.angleTarget >= 60 ? 100 : 0)
    }

    detachLid() {
      if (this.detached) return
      
      // Calcular posición de la tapa cuando se suelta
      const rad = (this.angle / 100) * (Math.PI / 2)
      const cx = this.panel.x + this.panel.w / 2
      const hy = this.panel.y
      
      this.body.x = cx
      this.body.y = hy + this.panel.h / 2
      this.body.angle = -rad
      this.body.vx = 20 * Math.sin(rad) + (Math.random() - 0.5) * 30
      this.body.vy = -10 + Math.random() * 20
      this.body.va = 0.8 * (Math.random() < 0.5 ? -1 : 1)
      this.body.alive = true
      
      this.detached = true
      
      // Callback de desbloqueo SOLO si es un desprendimiento real (no tecla D de placeholder)
      if (this.angle >= 98) {
        setTimeout(() => {
          onUnlock()
        }, 500)
      }
    }

    forceDetach() {
      // Método para forzar desprendimiento sin desbloquear (tecla D)
      if (this.detached) return
      
      const rad = (this.angle / 100) * (Math.PI / 2)
      const cx = this.panel.x + this.panel.w / 2
      const hy = this.panel.y
      
      this.body.x = cx
      this.body.y = hy + this.panel.h / 2
      this.body.angle = -rad
      this.body.vx = 40 * Math.sin(rad) + (Math.random() - 0.5) * 60 // Más velocidad
      this.body.vy = -30 + Math.random() * 20 // Más impulso hacia arriba
      this.body.va = 1.5 * (Math.random() < 0.5 ? -1 : 1) // Más rotación
      this.body.alive = true
      
      this.detached = true
      // NO llamar onUnlock() aquí - es solo efecto visual
    }

    reset() {
      this.detached = false
      this.body.alive = false
      this.angle = 0
      this.angleTarget = 0
      this.dragging = false
    }

    update(dt) {
      // Manejar apertura forzada
      if (forceOpen && !this.detached && this.angleTarget < 100) {
        this.setAngleTarget(100)
      }
      
      if (this.detached && this.body.alive) {
        // Física de caída libre con gravedad más fuerte
        this.body.vy += this.gravity * 1.5 * dt // Gravedad más fuerte
        this.body.x += this.body.vx * dt
        this.body.y += this.body.vy * dt
        this.body.angle += this.body.va * dt
        this.body.va *= 0.995
        
        // Desaparecer cuando sale de pantalla (más allá del viewport completo)
        if (this.body.y - this.panel.h / 2 > window.innerHeight + 100) {
          this.body.alive = false
        }
      } else if (!this.detached) {
        // Animación suave hacia el target
        const t = 0.15 // Animación más rápida
        this.angle += (this.angleTarget - this.angle) * t
        
        // Auto-detach cuando se abre completamente (solo si no es forzado)
        if (!this.dragging && !forceOpen && this.angleTarget >= 99 && this.angle > 98) {
          this.detachLid()
        }
      }
    }

    draw() {
      this.ctx.clearRect(0, 0, this.w, this.h)
      
      // Fondo con gradiente
      this.drawBackground()
      
      // Contenido interior (si la tapa está abierta o desprendida)
      if (this.detached || this.angle > 10) {
        this.drawInterior()
      }
      
      // Dibujar la tapa
      if (this.detached && this.body.alive) {
        this.drawDetachedLid()
      } else if (!this.detached) {
        this.drawLid()
      }
    }

    drawBackground() {
      const gradient = this.ctx.createRadialGradient(
        this.w * 0.6, this.h * 0.25, 40,
        this.w * 0.6, this.h * 0.25, 300
      )
      gradient.addColorStop(0, '#1c2330')
      gradient.addColorStop(1, '#0a0e14')
      
      this.ctx.fillStyle = gradient
      this.ctx.fillRect(0, 0, this.w, this.h)
    }

    drawInterior() {
      // Marco del panel
      this.roundedRect(
        this.panel.x - 4, this.panel.y - 4,
        this.panel.w + 8, this.panel.h + 8,
        this.panel.r + 2
      )
      this.ctx.fillStyle = '#12161d'
      this.ctx.fill()
      
      // Panel interior
      this.ctx.save()
      this.ctx.beginPath()
      this.roundedRect(this.panel.x, this.panel.y, this.panel.w, this.panel.h, this.panel.r)
      this.ctx.clip()
      
      // Gradiente del panel
      const panelGradient = this.ctx.createLinearGradient(
        this.panel.x, this.panel.y,
        this.panel.x, this.panel.y + this.panel.h
      )
      panelGradient.addColorStop(0, '#242b36')
      panelGradient.addColorStop(0.55, '#1f2530')
      panelGradient.addColorStop(1, '#181d26')
      
      this.ctx.fillStyle = panelGradient
      this.ctx.fill()
      
      // Mensaje oculto
      this.drawHiddenContent()
      
      this.ctx.restore()
    }

    drawHiddenContent() {
      const centerX = this.panel.x + this.panel.w / 2
      const centerY = this.panel.y + this.panel.h / 2
      
      // Fondo brillante sutil
      const glowGradient = this.ctx.createRadialGradient(
        centerX, centerY, 20,
        centerX, centerY, 120
      )
      glowGradient.addColorStop(0, 'rgba(98, 202, 255, 0.15)')
      glowGradient.addColorStop(1, 'transparent')
      
      this.ctx.fillStyle = glowGradient
      this.ctx.fillRect(this.panel.x, this.panel.y, this.panel.w, this.panel.h)
      
      // Mensaje principal
      this.ctx.fillStyle = config.textColor
      this.ctx.font = 'bold 14px system-ui, Segoe UI'
      this.ctx.textAlign = 'center'
      this.ctx.textBaseline = 'middle'
      
      if (customMessage) {
        // Mensaje personalizado con múltiples líneas
        const lines = customMessage.split('\n')
        lines.forEach((line, index) => {
          this.ctx.fillText(
            line,
            centerX,
            centerY - (lines.length - 1) * 12 + index * 24
          )
        })
      } else {
        this.ctx.fillText(hiddenMessage, centerX, centerY)
      }
      
      // Detalles decorativos
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
      this.ctx.fillRect(this.panel.x + 20, this.panel.y + 20, 40, 4)
      this.ctx.fillRect(this.panel.x + 20, this.panel.y + 30, 60, 4)
      this.ctx.fillRect(this.panel.w - 80, this.panel.y + 20, 50, 4)
    }

    drawLid() {
      const cx = this.panel.x + this.panel.w / 2
      const hy = this.panel.y
      const openness = this.clamp(this.angle / 100, 0, 1)
      
      // Sombra dinámica
      const shadowDrop = 10 + 40 * openness
      const shadowBlur = 18 + 28 * openness
      const shadowAlpha = 0.25 + 0.3 * openness
      
      this.ctx.save()
      this.ctx.shadowColor = `rgba(0,0,0,${shadowAlpha})`
      this.ctx.shadowBlur = shadowBlur
      this.ctx.shadowOffsetY = shadowDrop
      
      // Transformar para rotación desde la bisagra
      this.ctx.translate(cx, hy)
      this.ctx.rotate(-this.angle * Math.PI / 180)
      this.ctx.translate(-this.panel.w / 2, 0)
      
      this.paintLid(this.panel.w, this.panel.h, this.panel.r, openness)
      this.ctx.restore()
      
      // Bisagra
      this.drawHinge()
    }

    drawDetachedLid() {
      this.ctx.save()
      this.ctx.shadowColor = 'rgba(0,0,0,0.4)'
      this.ctx.shadowBlur = 20
      this.ctx.shadowOffsetY = 15
      
      this.ctx.translate(this.body.x, this.body.y)
      this.ctx.rotate(this.body.angle)
      this.ctx.translate(-this.panel.w / 2, -this.panel.h / 2)
      
      this.paintLid(this.panel.w, this.panel.h, this.panel.r, 1)
      this.ctx.restore()
    }

    paintLid(w, h, r, openness) {
      // Cuerpo de la tapa
      this.roundedRect(0, 0, w, h, r)
      
      const lidGradient = this.ctx.createLinearGradient(0, 0, 0, h)
      lidGradient.addColorStop(0, config.lidColor)
      lidGradient.addColorStop(0.6, config.lidColorSecondary)
      lidGradient.addColorStop(1, config.backgroundColor)
      
      this.ctx.fillStyle = lidGradient
      this.ctx.fill()
      
      // Borde
      this.ctx.lineWidth = 1
      this.ctx.strokeStyle = config.borderColor
      this.ctx.stroke()
      
      // Marco interior
      this.roundedRect(8, 8, w - 16, h - 16, r - 4)
      this.ctx.strokeStyle = 'rgba(0,0,0,0.45)'
      this.ctx.stroke()
      
      // Tornillos
      this.drawScrew(12, 12)
      this.drawScrew(w - 24, 12)
      this.drawScrew(12, h - 24)
      this.drawScrew(w - 24, h - 24)
      
      // Texto de estado
      this.ctx.fillStyle = config.textColor
      this.ctx.font = 'bold 12px system-ui, Segoe UI'
      this.ctx.textAlign = 'right'
      this.ctx.textBaseline = 'bottom'
      this.ctx.fillText(
        openness > 0.5 ? 'ABIERTO' : config.lidText,
        w - 12,
        h - 12
      )
    }

    drawScrew(x, y) {
      this.ctx.save()
      this.ctx.translate(x, y)
      
      // Cuerpo del tornillo
      this.ctx.beginPath()
      this.ctx.arc(6, 6, 6, 0, Math.PI * 2)
      
      const screwGradient = this.ctx.createRadialGradient(4, 4, 2, 6, 6, 6)
      screwGradient.addColorStop(0, config.screwColor)
      screwGradient.addColorStop(0.6, '#7a8392')
      screwGradient.addColorStop(1, '#4a505a')
      
      this.ctx.fillStyle = screwGradient
      this.ctx.fill()
      
      this.ctx.strokeStyle = 'rgba(0,0,0,0.6)'
      this.ctx.lineWidth = 1
      this.ctx.stroke()
      
      // Ranura del tornillo
      this.ctx.beginPath()
      this.ctx.moveTo(2, 6)
      this.ctx.lineTo(10, 6)
      this.ctx.strokeStyle = 'rgba(0,0,0,0.55)'
      this.ctx.stroke()
      
      this.ctx.restore()
    }

    drawHinge() {
      // Bisagra horizontal
      this.roundedRect(
        this.panel.x + this.panel.w * 0.1,
        this.panel.y - 6,
        this.panel.w * 0.8,
        12,
        6
      )
      
      const hingeGradient = this.ctx.createLinearGradient(
        this.panel.x, this.panel.y - 6,
        this.panel.x, this.panel.y + 6
      )
      hingeGradient.addColorStop(0, '#0d1116')
      hingeGradient.addColorStop(1, config.hingeColor)
      
      this.ctx.fillStyle = hingeGradient
      this.ctx.fill()
    }

    roundedRect(x, y, w, h, r) {
      const radius = Math.min(r, w / 2, h / 2)
      this.ctx.beginPath()
      this.ctx.moveTo(x + radius, y)
      this.ctx.arcTo(x + w, y, x + w, y + h, radius)
      this.ctx.arcTo(x + w, y + h, x, y + h, radius)
      this.ctx.arcTo(x, y + h, x, y, radius)
      this.ctx.arcTo(x, y, x + w, y, radius)
      this.ctx.closePath()
    }

    bindEvents() {
      // Sin eventos de interacción manual
      // Las tapas se abren automáticamente cuando isLocked = false
      
      // Cleanup function
      this.cleanup = () => {
        // Sin eventos que limpiar
      }
    }

    loop() {
      const now = performance.now()
      let dt = (now - this.lastTime) / 1000
      
      if (!isFinite(dt) || dt <= 0) dt = 1/60
      if (dt > 0.05) dt = 0.05
      
      this.lastTime = now
      
      this.update(dt)
      this.draw()
      
      if (this.body.alive || !this.detached) {
        requestAnimationFrame(() => this.loop())
      }
    }

    start() {
      this.loop()
    }

    destroy() {
      if (this.cleanup) this.cleanup()
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }

  // Inicializar el motor cuando el canvas esté listo
  useEffect(() => {
    if (!canvasRef.current || !isLocked) return

    const engine = new LidEngine(canvasRef.current)
    setLidEngine(engine)
    engine.start()

    return () => {
      engine.destroy()
    }
  }, [isLocked, dimensions]) // Reiniciar cuando cambien las dimensiones

  // Efecto para manejar forceOpen
  useEffect(() => {
    if (forceOpen && lidEngine && !lidEngine.detached) {
      // Forzar apertura inmediata cuando forceOpen se activa
      lidEngine.setAngleTarget(100)
    }
  }, [forceOpen, lidEngine])

  // Si no está bloqueado, mostrar el contenido directamente
  if (!isLocked) {
    return children
  }

  return (
    <div className={`relative ${className}`} style={{ overflow: 'visible' }}>
      {/* Canvas de la tapa - Dimensiones adaptables */}
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0 w-full h-full z-10"
        style={{ 
          imageRendering: 'crisp-edges',
          overflow: 'visible',
          pointerEvents: 'none' // Sin interacción manual
        }}
        aria-label="Puzzle protegido - Se abre al resolver dependencias"
      />
      
      {/* Contenido oculto */}
      <div className="relative z-0 w-full h-full">
        {children}
      </div>
      
      {/* Instrucciones */}
      <div className="absolute bottom-2 right-2 z-20 text-xs text-slate-400 bg-black/70 px-2 py-1 rounded opacity-80">
        🔒 Resuelve puzzles para desbloquear
      </div>
    </div>
  )
}