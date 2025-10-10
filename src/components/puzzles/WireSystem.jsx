import React, { useRef, useEffect, useState, useCallback } from 'react'
import { CablePhysics, WireSystemUtils } from './wireUtils'

// Sistema de cables con física Verlet implementado en React
export default function WireSystem({ 
  nodes = [], 
  connections = [], 
  onConnect = () => {}, 
  onDisconnect = () => {},
  physics = { gravity: 0.3, stiffness: 0.8, segments: 8 },
  interactive = true,
  className = ""
}) {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const wiresRef = useRef([])
  const draggingRef = useRef({ active: false, wire: null, startNode: null, startPort: null })
  const nodesRef = useRef([])
  const physicsEngine = useRef(new CablePhysics(physics))

  // Estado para forzar re-render cuando sea necesario
  const [, forceUpdate] = useState({})

  // Clase para simular cables con física Verlet mejorada
  class Wire {
    constructor(x1, y1, x2, y2, color = '#00ff00', segments = physics.segments) {
      this.segments = segments
      this.points = []
      this.oldPoints = []
      this.constraints = []
      this.color = color
      this.connected = false
      this.id = Math.random().toString(36).substr(2, 9)
      
      // Usar utilidades para generar puntos
      const startPoint = { x: x1, y: y1 }
      const endPoint = { x: x2, y: y2 }
      const linePoints = WireSystemUtils.generateLinePoints(startPoint, endPoint, segments)
      
      this.points = linePoints.map(p => ({ ...p }))
      this.oldPoints = linePoints.map(p => ({ ...p }))
      
      // Crear restricciones entre puntos adyacentes
      for (let i = 0; i < segments; i++) {
        const distance = WireSystemUtils.distance(this.points[i], this.points[i + 1])
        this.constraints.push({ 
          p1: i, 
          p2: i + 1, 
          restLength: distance 
        })
      }
    }

    update() {
      // Usar el motor de física para actualizar puntos
      const fixedPoints = [0, this.points.length - 1] // Extremos fijos
      physicsEngine.current.updatePoints(
        this.points, 
        this.oldPoints, 
        this.constraints, 
        fixedPoints
      )
    }

    setEndpoints(x1, y1, x2, y2) {
      // Fijar extremos del cable
      this.points[0].x = x1
      this.points[0].y = y1
      this.points[this.points.length - 1].x = x2
      this.points[this.points.length - 1].y = y2
    }

    draw(ctx) {
      ctx.save()
      
      // Configurar estilo del cable
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      
      // Dibujar sombra/glow
      ctx.shadowColor = this.color
      ctx.shadowBlur = 12
      ctx.lineWidth = 8
      ctx.strokeStyle = this.color + '30'
      
      ctx.beginPath()
      ctx.moveTo(this.points[0].x, this.points[0].y)
      
      // Usar curvas suaves para conectar puntos
      if (this.points.length > 2) {
        for (let i = 1; i < this.points.length - 1; i++) {
          const current = this.points[i]
          const next = this.points[i + 1]
          const controlPoint = WireSystemUtils.midpoint(current, next)
          ctx.quadraticCurveTo(current.x, current.y, controlPoint.x, controlPoint.y)
        }
        ctx.lineTo(this.points[this.points.length - 1].x, this.points[this.points.length - 1].y)
      } else {
        for (let i = 1; i < this.points.length; i++) {
          ctx.lineTo(this.points[i].x, this.points[i].y)
        }
      }
      
      ctx.stroke()
      
      // Dibujar cable principal
      ctx.shadowBlur = 2
      ctx.lineWidth = 4
      ctx.strokeStyle = this.color
      ctx.stroke()
      
      // Dibujar conectores en los extremos
      ctx.shadowBlur = 0
      this.drawConnector(ctx, this.points[0], 6)
      this.drawConnector(ctx, this.points[this.points.length - 1], 6)
      
      ctx.restore()
    }

    drawConnector(ctx, point, radius) {
      // Conector con gradiente
      const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius)
      gradient.addColorStop(0, this.color)
      gradient.addColorStop(1, this.color + '80')
      
      ctx.fillStyle = gradient
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      
      ctx.beginPath()
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    }
  }

  // Función mejorada para encontrar el nodo y puerto más cercano a una posición
  const findNearestPort = useCallback((x, y, radius = 25) => {
    for (const node of nodesRef.current) {
      if (!node.element) continue
      
      const nodeRect = node.element.getBoundingClientRect()
      const canvasRect = canvasRef.current.getBoundingClientRect()
      
      // Calcular posiciones de puertos usando utilidades
      const outputs = node.data.outputs || []
      const inputs = node.data.inputs || []
      
      // Verificar puertos de salida
      for (let i = 0; i < outputs.length; i++) {
        const portPos = WireSystemUtils.getPortPosition(
          { x: nodeRect.left - canvasRect.left + nodeRect.width / 2, 
            y: nodeRect.top - canvasRect.top + nodeRect.height / 2 },
          outputs[i], 
          'output', 
          i, 
          outputs.length
        )
        
        if (WireSystemUtils.distance({ x, y }, portPos) < radius) {
          return {
            node: node.data,
            port: outputs[i],
            type: 'output',
            x: portPos.x,
            y: portPos.y
          }
        }
      }
      
      // Verificar puertos de entrada
      for (let i = 0; i < inputs.length; i++) {
        const portPos = WireSystemUtils.getPortPosition(
          { x: nodeRect.left - canvasRect.left + nodeRect.width / 2, 
            y: nodeRect.top - canvasRect.top + nodeRect.height / 2 },
          inputs[i], 
          'input', 
          i, 
          inputs.length
        )
        
        if (WireSystemUtils.distance({ x, y }, portPos) < radius) {
          return {
            node: node.data,
            port: inputs[i],
            type: 'input',
            x: portPos.x,
            y: portPos.y
          }
        }
      }
    }
    return null
  }, [])

  // Manejar eventos del mouse
  const handleMouseDown = useCallback((e) => {
    if (!interactive) return
    
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const port = findNearestPort(x, y)
    if (port && port.type === 'output') {
      draggingRef.current = {
        active: true,
        wire: new Wire(port.x, port.y, x, y, port.node.color || '#00ff00'),
        startNode: port.node,
        startPort: port.port,
        startX: port.x,
        startY: port.y
      }
    }
  }, [findNearestPort, interactive])

  const handleMouseMove = useCallback((e) => {
    if (!draggingRef.current.active) return
    
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    draggingRef.current.wire.setEndpoints(
      draggingRef.current.startX,
      draggingRef.current.startY,
      x,
      y
    )
  }, [])

  const handleMouseUp = useCallback((e) => {
    if (!draggingRef.current.active) return
    
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const targetPort = findNearestPort(x, y)
    
    if (targetPort && targetPort.type === 'input' && 
        WireSystemUtils.canConnect(
          draggingRef.current.startNode, 
          draggingRef.current.startPort, 
          targetPort.node, 
          targetPort.port, 
          connections
        )) {
      
      // Crear conexión exitosa
      draggingRef.current.wire.setEndpoints(
        draggingRef.current.startX,
        draggingRef.current.startY,
        targetPort.x,
        targetPort.y
      )
      draggingRef.current.wire.connected = true
      wiresRef.current.push(draggingRef.current.wire)
      
      onConnect({
        from: {
          node: draggingRef.current.startNode.id,
          port: draggingRef.current.startPort
        },
        to: {
          node: targetPort.node.id,
          port: targetPort.port
        }
      })
    }
    
    draggingRef.current = { active: false, wire: null, startNode: null, startPort: null }
  }, [findNearestPort, onConnect, connections])

  // Actualizar referencias de nodos cuando cambien las props
  useEffect(() => {
    nodesRef.current = nodes.map(node => ({
      data: node,
      element: document.getElementById(`node-${node.id}`)
    })).filter(n => n.element)
  }, [nodes])

  // Crear cables para conexiones existentes
  useEffect(() => {
    wiresRef.current = []
    
    connections.forEach(connection => {
      const fromNode = nodesRef.current.find(n => n.data.id === connection.from.node)
      const toNode = nodesRef.current.find(n => n.data.id === connection.to.node)
      
      if (fromNode && toNode) {
        const fromRect = fromNode.element.getBoundingClientRect()
        const toRect = toNode.element.getBoundingClientRect()
        const canvasRect = canvasRef.current?.getBoundingClientRect()
        
        if (canvasRect) {
          const fromX = fromRect.left - canvasRect.left + fromRect.width
          const fromY = fromRect.top - canvasRect.top + fromRect.height / 2
          const toX = toRect.left - canvasRect.left
          const toY = toRect.top - canvasRect.top + toRect.height / 2
          
          const wire = new Wire(fromX, fromY, toX, toY, fromNode.data.color || '#00ff00')
          wire.connected = true
          wiresRef.current.push(wire)
        }
      }
    })
  }, [connections])

  // Loop de animación
  useEffect(() => {
    const animate = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Actualizar y dibujar todos los cables
      wiresRef.current.forEach(wire => {
        wire.update()
        wire.draw(ctx)
      })
      
      // Dibujar cable siendo arrastrado
      if (draggingRef.current.active && draggingRef.current.wire) {
        draggingRef.current.wire.update()
        draggingRef.current.wire.draw(ctx)
      }
      
      animationRef.current = requestAnimationFrame(animate)
    }
    
    animate()
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Configurar eventos del canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseDown, handleMouseMove, handleMouseUp])

  // Redimensionar canvas
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      
      const container = canvas.parentElement
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
    }
    
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-auto ${className}`}
      style={{ zIndex: 10 }}
    />
  )
}