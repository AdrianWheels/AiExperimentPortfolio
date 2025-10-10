import React, { useEffect, useMemo, useRef } from 'react'
import { useGame } from '../../context/GameContext'

const COLORS = {
  R: '#ef4444',
  A: '#f59e0b',
  Y: '#facc15',
}

const DEFAULT_OPTIONS = {
  gravity: 0.45,
  stiffness: 0.55,
  segments: 16,
  iterations: 8,
}

class Rope {
  constructor(startAnchor, endAnchor, options) {
    this.startAnchor = startAnchor
    this.endAnchor = endAnchor
    this.options = { ...DEFAULT_OPTIONS, ...options }
    this.points = []
    this._initPoints()
  }

  _initPoints() {
    const start = this.startAnchor()
    const end = this.endAnchor()
    const segments = Math.max(3, Math.floor(this.options.segments))
    this.segmentCount = segments
    this.points = []
    for (let i = 0; i <= segments; i += 1) {
      const t = i / segments
      const x = start.x + (end.x - start.x) * t
      const y = start.y + (end.y - start.y) * t
      this.points.push({ x, y, oldX: x, oldY: y })
    }
  }

  reset() {
    this._initPoints()
  }

  update() {
    if (!this.points.length) return
    const start = this.startAnchor()
    const end = this.endAnchor()
    if (!start || !end) return

    const gravity = this.options.gravity
    const iterations = Math.max(3, Math.floor(this.options.iterations || 8))
    const segments = this.segmentCount
    const targetLength = Math.hypot(end.x - start.x, end.y - start.y) / segments || 1

    const lastIndex = this.points.length - 1

    this.points.forEach((point, index) => {
      if (index === 0) {
        point.x = start.x
        point.y = start.y
        point.oldX = start.x
        point.oldY = start.y
        return
      }
      if (index === lastIndex) {
        point.x = end.x
        point.y = end.y
        point.oldX = end.x
        point.oldY = end.y
        return
      }

      const velocityX = point.x - point.oldX
      const velocityY = point.y - point.oldY

      point.oldX = point.x
      point.oldY = point.y

      point.x += velocityX
      point.y += velocityY + gravity
    })

    for (let i = 0; i < iterations; i += 1) {
      for (let j = 0; j < this.points.length - 1; j += 1) {
        const p1 = this.points[j]
        const p2 = this.points[j + 1]
        const dx = p2.x - p1.x
        const dy = p2.y - p1.y
        const distance = Math.hypot(dx, dy) || 1
        const difference = (distance - targetLength) / distance
        const offsetX = dx * 0.5 * difference
        const offsetY = dy * 0.5 * difference

        if (j > 0) {
          p1.x += offsetX
          p1.y += offsetY
        }
        if (j + 1 < lastIndex) {
          p2.x -= offsetX
          p2.y -= offsetY
        }
      }

      const first = this.points[0]
      first.x = start.x
      first.y = start.y
      first.oldX = start.x
      first.oldY = start.y

      const last = this.points[lastIndex]
      last.x = end.x
      last.y = end.y
      last.oldX = end.x
      last.oldY = end.y
    }
  }

  draw(ctx, color) {
    if (this.points.length < 2) return
    ctx.save()
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    const gradient = ctx.createLinearGradient(
      this.points[0].x,
      this.points[0].y,
      this.points[this.points.length - 1].x,
      this.points[this.points.length - 1].y,
    )
    gradient.addColorStop(0, color)
    gradient.addColorStop(1, `${color}cc`)
    ctx.strokeStyle = gradient
    ctx.beginPath()
    ctx.moveTo(this.points[0].x, this.points[0].y)
    for (let i = 1; i < this.points.length; i += 1) {
      const point = this.points[i]
      ctx.lineTo(point.x, point.y)
    }
    ctx.stroke()
    ctx.restore()
  }
}

class CableEngine {
  constructor(canvas, options = {}) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.options = { ...DEFAULT_OPTIONS, ...options }
    this.nodes = []
    this.connections = []
    this.pointer = { x: 0, y: 0 }
    this.activeDrag = null
    this.events = new Map()
    this.interactive = true
    this.dpr = window.devicePixelRatio || 1
    this.resizeObserver = null
    this.animationFrame = null
    this.portLookup = new Map()
    this.canvas.style.touchAction = 'none'

    this.api = {
      addNode: (config) => this.addNode(config),
      connect: (outNode, outPort, inNode, inPort) =>
        this.connect(outNode, outPort, inNode, inPort, { emit: true }),
      getConnections: () => this.getConnections(),
      setOptions: (options) => this.setOptions(options),
      serialize: () => this.serialize(),
      deserialize: (state) => this.deserialize(state),
      reset: () => this.reset(),
      clear: () => this.clear(),
      on: (event, handler) => this.on(event, handler),
      off: (event, handler) => this.off(event, handler),
    }

    this.handlePointerDown = this.handlePointerDown.bind(this)
    this.handlePointerMove = this.handlePointerMove.bind(this)
    this.handlePointerUp = this.handlePointerUp.bind(this)

    this.bindEvents()
    this.resize()
    this.loop()
  }

  bindEvents() {
    this.canvas.addEventListener('pointerdown', this.handlePointerDown)
    window.addEventListener('pointermove', this.handlePointerMove)
    window.addEventListener('pointerup', this.handlePointerUp)
    window.addEventListener('pointercancel', this.handlePointerUp)

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.resize())
      const parent = this.canvas.parentElement || this.canvas
      this.resizeObserver.observe(parent)
    } else {
      window.addEventListener('resize', this.resize)
    }
  }

  destroy() {
    cancelAnimationFrame(this.animationFrame)
    this.canvas.removeEventListener('pointerdown', this.handlePointerDown)
    window.removeEventListener('pointermove', this.handlePointerMove)
    window.removeEventListener('pointerup', this.handlePointerUp)
    window.removeEventListener('pointercancel', this.handlePointerUp)
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    } else {
      window.removeEventListener('resize', this.resize)
    }
    this.events.clear()
    this.connections = []
    this.nodes = []
  }

  setInteractionEnabled(enabled) {
    this.interactive = Boolean(enabled)
    if (!enabled) {
      this.activeDrag = null
    }
  }

  getSize() {
    const rect = this.canvas.getBoundingClientRect()
    return { width: rect.width, height: rect.height }
  }

  resize = () => {
    const rect = this.canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    this.dpr = dpr
    const width = Math.max(1, Math.floor(rect.width * dpr))
    const height = Math.max(1, Math.floor(rect.height * dpr))
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width
      this.canvas.height = height
    }
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    this.updateNodeLayout()
    this.connections.forEach((connection) => connection.rope.reset())
  }

  updateNodeLayout() {
    const { width, height } = this.getSize()
    this.nodes.forEach((node) => {
      if (node.relative) {
        node.x = node.relative.x * width - node.width / 2
        node.y = node.relative.y * height - node.height / 2
      }
      const portCount = Math.max(node.outputs.length, node.inputs.length, 1)
      const spacing = node.height / (portCount + 1)
      node.outputs.forEach((port, index) => {
        port.x = node.x + node.width
        port.y = node.y + spacing * (index + 1)
      })
      node.inputs.forEach((port, index) => {
        port.x = node.x
        port.y = node.y + spacing * (index + 1)
      })
    })
  }

  addNode(config) {
    const size = this.getSize()
    const width = config.width || 180
    const height = config.height || Math.max(config.outputs?.length || 0, config.inputs?.length || 0, 1) * 60 + 40
    const node = {
      id: config.id,
      label: config.label || config.id,
      x: config.x ?? 0,
      y: config.y ?? 0,
      width,
      height,
      outputs: (config.outputs || []).map((port) => ({
        id: port.id,
        label: port.label || port.id,
        color: port.color || '#22d3ee',
        type: 'out',
        nodeId: config.id,
        x: 0,
        y: 0,
      })),
      inputs: (config.inputs || []).map((port) => ({
        id: port.id,
        label: port.label || port.id,
        color: port.color || '#22d3ee',
        type: 'in',
        nodeId: config.id,
        x: 0,
        y: 0,
      })),
      relative: config.relative
        ? { x: config.relative.x, y: config.relative.y }
        : {
            x: size.width ? (config.x ?? width / 2) / size.width : 0,
            y: size.height ? (config.y ?? height / 2) / size.height : 0,
          },
    }

    this.nodes.push(node)
    node.outputs.forEach((port) => {
      this.portLookup.set(`${node.id}:out:${port.id}`, port)
    })
    node.inputs.forEach((port) => {
      this.portLookup.set(`${node.id}:in:${port.id}`, port)
    })
    this.updateNodeLayout()
    return node
  }

  removeConnectionBySource(portKey) {
    const index = this.connections.findIndex((connection) => connection.sourceKey === portKey)
    if (index >= 0) {
      this.connections.splice(index, 1)
    }
  }

  connect(outNodeId, outPortId, inNodeId, inPortId, { emit = true } = {}) {
    const outPort = this.portLookup.get(`${outNodeId}:out:${outPortId}`)
    const inPort = this.portLookup.get(`${inNodeId}:in:${inPortId}`)
    if (!outPort || !inPort) return null

    const sourceKey = `${outNodeId}:out:${outPortId}`
    this.removeConnectionBySource(sourceKey)

    const rope = new Rope(
      () => ({ x: outPort.x, y: outPort.y }),
      () => ({ x: inPort.x, y: inPort.y }),
      this.options,
    )

    const connection = {
      id: `${outNodeId}:${outPortId}->${inNodeId}:${inPortId}`,
      sourceKey,
      targetKey: `${inNodeId}:in:${inPortId}`,
      from: outPort,
      to: inPort,
      rope,
    }

    this.connections.push(connection)
    if (emit) {
      this.emit('connect', {
        id: connection.id,
        from: { node: outNodeId, port: outPortId, color: outPort.color },
        to: { node: inNodeId, port: inPortId, color: inPort.color },
      })
    }
    return connection
  }

  syncConnections(mapping) {
    const desired = new Map()
    Object.entries(mapping || {}).forEach(([sourcePort, targetPort]) => {
      if (!targetPort) return
      desired.set(sourcePort, targetPort)
    })

    this.connections = this.connections.filter((connection) => {
      const portId = connection.from.id
      const expected = desired.get(portId)
      if (!expected || connection.to.id !== expected) {
        return false
      }
      return true
    })

    desired.forEach((targetPort, sourcePort) => {
      const outEntry = [...this.portLookup.entries()].find(([, port]) => port.type === 'out' && port.id === sourcePort)
      const inEntry = [...this.portLookup.entries()].find(([, port]) => port.type === 'in' && port.id === targetPort)
      if (!outEntry || !inEntry) return
      const [outKey] = outEntry
      const [inKey] = inEntry
      const [outNodeId, , outPortId] = outKey.split(':')
      const [inNodeId, , inPortId] = inKey.split(':')
      const existing = this.connections.find(
        (connection) =>
          connection.from.nodeId === outNodeId &&
          connection.from.id === outPortId &&
          connection.to.nodeId === inNodeId &&
          connection.to.id === inPortId,
      )
      if (!existing) {
        this.connect(outNodeId, outPortId, inNodeId, inPortId, { emit: false })
      }
    })
  }

  handlePointerDown(event) {
    if (!this.interactive) return
    const rect = this.canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const port = this.findPortAt(x, y, 'out')
    if (!port) return
    event.preventDefault()
    this.activeDrag = {
      port,
      rope: new Rope(
        () => ({ x: port.x, y: port.y }),
        () => this.pointer,
        this.options,
      ),
    }
    this.pointer.x = x
    this.pointer.y = y
    this.canvas.setPointerCapture?.(event.pointerId)
  }

  handlePointerMove(event) {
    const rect = this.canvas.getBoundingClientRect()
    this.pointer.x = event.clientX - rect.left
    this.pointer.y = event.clientY - rect.top
  }

  handlePointerUp(event) {
    if (!this.activeDrag) return
    const rect = this.canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const targetPort = this.findPortAt(x, y, 'in')
    const { port } = this.activeDrag
    if (targetPort) {
      this.connect(port.nodeId, port.id, targetPort.nodeId, targetPort.id, { emit: true })
    }
    this.activeDrag = null
    this.canvas.releasePointerCapture?.(event.pointerId)
  }

  findPortAt(x, y, kind) {
    const radius = 14
    for (const node of this.nodes) {
      const ports = kind === 'in' ? node.inputs : node.outputs
      for (const port of ports) {
        const dx = x - port.x
        const dy = y - port.y
        if (dx * dx + dy * dy <= radius * radius) {
          return port
        }
      }
    }
    return null
  }

  loop = () => {
    this.draw()
    this.animationFrame = requestAnimationFrame(this.loop)
  }

  draw() {
    const { width, height } = this.getSize()
    this.ctx.clearRect(0, 0, width, height)
    this.connections.forEach((connection) => {
      connection.rope.update()
      connection.rope.draw(this.ctx, connection.from.color)
    })
    if (this.activeDrag) {
      this.activeDrag.rope.update()
      this.activeDrag.rope.draw(this.ctx, this.activeDrag.port.color)
    }
    this.drawNodes()
  }

  drawNodes() {
    const ctx = this.ctx
    this.nodes.forEach((node) => {
      ctx.save()
      ctx.fillStyle = 'rgba(17, 24, 39, 0.85)'
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(node.x, node.y, node.width, node.height, 12)
      } else {
        const radius = 12
        const r = Math.min(radius, node.width / 2, node.height / 2)
        ctx.moveTo(node.x + r, node.y)
        ctx.lineTo(node.x + node.width - r, node.y)
        ctx.quadraticCurveTo(node.x + node.width, node.y, node.x + node.width, node.y + r)
        ctx.lineTo(node.x + node.width, node.y + node.height - r)
        ctx.quadraticCurveTo(
          node.x + node.width,
          node.y + node.height,
          node.x + node.width - r,
          node.y + node.height,
        )
        ctx.lineTo(node.x + r, node.y + node.height)
        ctx.quadraticCurveTo(node.x, node.y + node.height, node.x, node.y + node.height - r)
        ctx.lineTo(node.x, node.y + r)
        ctx.quadraticCurveTo(node.x, node.y, node.x + r, node.y)
        ctx.closePath()
      }
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = 'rgba(226, 232, 240, 0.9)'
      ctx.font = '600 14px "JetBrains Mono", monospace'
      ctx.textBaseline = 'top'
      ctx.fillText(node.label, node.x + 16, node.y + 16)

      const renderPorts = (ports, alignRight) => {
        ctx.font = '500 12px "JetBrains Mono", monospace'
        ports.forEach((port) => {
          ctx.fillStyle = port.color
          ctx.beginPath()
          ctx.arc(port.x, port.y, 8, 0, Math.PI * 2)
          ctx.fill()
          ctx.strokeStyle = 'rgba(15, 23, 42, 0.8)'
          ctx.lineWidth = 1
          ctx.stroke()

          ctx.fillStyle = 'rgba(226, 232, 240, 0.85)'
          ctx.textBaseline = 'middle'
          ctx.textAlign = alignRight ? 'right' : 'left'
          const offset = alignRight ? -16 : 16
          ctx.fillText(port.label, port.x + offset, port.y)
        })
      }

      renderPorts(node.inputs, false)
      renderPorts(node.outputs, true)
      ctx.restore()
    })
  }

  on(event, handler) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set())
    }
    this.events.get(event).add(handler)
  }

  off(event, handler) {
    if (!event) {
      this.events.clear()
      return
    }
    const handlers = this.events.get(event)
    if (handlers) {
      handlers.delete(handler)
      if (!handlers.size) {
        this.events.delete(event)
      }
    }
  }

  emit(event, payload) {
    const handlers = this.events.get(event)
    if (!handlers) return
    handlers.forEach((handler) => handler(payload))
  }

  getConnections() {
    return this.connections.map((connection) => ({
      id: connection.id,
      from: { node: connection.from.nodeId, port: connection.from.id },
      to: { node: connection.to.nodeId, port: connection.to.id },
    }))
  }

  setOptions(options) {
    this.options = { ...this.options, ...options }
    this.connections.forEach((connection) => connection.rope.reset())
  }

  serialize() {
    return {
      nodes: this.nodes.map((node) => ({ id: node.id, label: node.label })),
      connections: this.getConnections(),
      options: this.options,
    }
  }

  deserialize(state) {
    if (!state) return
    this.options = { ...this.options, ...(state.options || {}) }
    this.connections = []
    ;(state.connections || []).forEach((connection) => {
      this.connect(connection.from.node, connection.from.port, connection.to.node, connection.to.port, { emit: false })
    })
  }

  reset() {
    this.connections = []
  }

  clear() {
    this.reset()
    this.nodes = []
    this.portLookup.clear()
  }

  getAPI() {
    return this.api
  }
}

export default function CablePanel() {
  const { plateConnections, connectPlate, plateOpen, setPlateOpen, gameState, unlockAnimations } = useGame()
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const engineRef = useRef(null)

  const canInteract = Boolean(
    gameState.puzzleProgress?.sound?.solved && gameState.puzzleProgress?.cipher?.solved,
  )
  const isPulsing = Boolean(unlockAnimations?.locks?.wiring)

  const nodesDefinition = useMemo(
    () => [
      {
        id: 'sources',
        label: 'Orígenes',
        relative: { x: 0.2, y: 0.5 },
        outputs: [
          { id: 'R', label: 'Src R', color: COLORS.R },
          { id: 'A', label: 'Src A', color: COLORS.A },
          { id: 'Y', label: 'Src Y', color: COLORS.Y },
        ],
        inputs: [],
      },
      {
        id: 'destinations',
        label: 'Destinos',
        relative: { x: 0.8, y: 0.5 },
        outputs: [],
        inputs: [
          { id: 'R', label: 'Dest R', color: COLORS.R },
          { id: 'A', label: 'Dest A', color: COLORS.A },
          { id: 'Y', label: 'Dest Y', color: COLORS.Y },
        ],
      },
    ],
    [],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const engine = new CableEngine(canvas, DEFAULT_OPTIONS)
    engineRef.current = engine

    nodesDefinition.forEach((node) => engine.addNode(node))

    const api = engine.getAPI()
    window.Cables = api

    return () => {
      if (window.Cables === api) {
        delete window.Cables
      }
      engine.destroy()
      engineRef.current = null
    }
  }, [nodesDefinition])

  useEffect(() => {
    const engine = engineRef.current
    if (!engine) return undefined

    const handler = ({ from, to }) => {
      connectPlate(from.port, to.port)
    }

    engine.on('connect', handler)
    return () => {
      engine.off('connect', handler)
    }
  }, [connectPlate])

  useEffect(() => {
    const engine = engineRef.current
    if (!engine) return
    engine.setInteractionEnabled(canInteract)
  }, [canInteract])

  useEffect(() => {
    const engine = engineRef.current
    if (!engine) return
    engine.syncConnections(plateConnections)
  }, [plateConnections])

  return (
    <aside
      ref={containerRef}
      className={`bg-panel p-4 rounded-lg border border-border relative overflow-hidden ${
        isPulsing ? 'glow-success unlock-pulse' : ''
      }`}
    >
      {!canInteract && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-center px-4 text-xs text-slate-300 font-mono z-10">
          <span>
            Descifra el Buffer y estabiliza el sonido para acceder al panel de cables.
          </span>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Panel de cableado inercial</h3>
          <button
            type="button"
            onClick={() => setPlateOpen(true)}
            className="text-xs uppercase tracking-wide text-slate-300 hover:text-white transition"
          >
            Manual
          </button>
        </div>

        <canvas
          ref={canvasRef}
          className="w-full h-72 bg-gradient-to-br from-slate-900/80 via-slate-900/70 to-slate-950/80 rounded-lg border border-slate-700/60"
        />

        <p className="text-xs text-slate-300/80 font-mono">
          Arrastra un cable desde un origen hasta el destino con el mismo color. El cable se ajustará con física
          ligera para simular el peso de la fibra.
        </p>
      </div>

      {plateOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-30" role="dialog" aria-modal="true">
          <div className="w-full max-w-md bg-panel p-5 rounded-lg border border-border shadow-lg" tabIndex={-1}>
            <div className="flex justify-between items-center mb-3">
              <div className="font-semibold">Manual de la placa</div>
              <button onClick={() => setPlateOpen(false)} className="text-sm text-slate-200 hover:text-white transition">
                Cerrar
              </button>
            </div>
            <ul className="text-xs text-slate-300 space-y-2 font-mono">
              <li>1. Selecciona un puerto de salida (Src) para generar un cable virtual.</li>
              <li>2. Arrastra hasta el puerto de destino compatible (Dest) del mismo color.</li>
              <li>3. Si sueltas el cable lejos de un destino válido, la conexión se descartará.</li>
              <li>4. Cuando los tres cables coincidan, el bloqueo WIRING se liberará automáticamente.</li>
            </ul>
          </div>
        </div>
      )}
    </aside>
  )
}
