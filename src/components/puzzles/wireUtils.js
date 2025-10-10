// Utilidades para el sistema de cables

export class CablePhysics {
  constructor(options = {}) {
    this.gravity = options.gravity || 0.3
    this.stiffness = options.stiffness || 0.8
    this.damping = options.damping || 0.99
    this.iterations = options.iterations || 3
  }

  // Aplicar física Verlet a un conjunto de puntos
  updatePoints(points, oldPoints, constraints, fixedPoints = []) {
    // Actualizar posiciones con inercia y gravedad
    for (let i = 0; i < points.length; i++) {
      if (fixedPoints.includes(i)) continue

      const point = points[i]
      const oldPoint = oldPoints[i]
      
      const velX = (point.x - oldPoint.x) * this.damping
      const velY = (point.y - oldPoint.y) * this.damping
      
      oldPoint.x = point.x
      oldPoint.y = point.y
      
      point.x += velX
      point.y += velY + this.gravity
    }
    
    // Aplicar restricciones múltiples veces para estabilidad
    for (let iteration = 0; iteration < this.iterations; iteration++) {
      for (const constraint of constraints) {
        const p1 = points[constraint.p1]
        const p2 = points[constraint.p2]
        
        const dx = p2.x - p1.x
        const dy = p2.y - p1.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance > 0) {
          const difference = constraint.restLength - distance
          const percent = difference / distance / 2
          const offsetX = dx * percent * this.stiffness
          const offsetY = dy * percent * this.stiffness
          
          // Solo mover puntos que no estén fijos
          if (!fixedPoints.includes(constraint.p1)) {
            p1.x -= offsetX
            p1.y -= offsetY
          }
          if (!fixedPoints.includes(constraint.p2)) {
            p2.x += offsetX
            p2.y += offsetY
          }
        }
      }
    }
  }
}

export class ConnectionManager {
  constructor() {
    this.connections = new Map()
    this.listeners = []
  }

  addConnection(id, connection) {
    this.connections.set(id, connection)
    this.emit('connect', { id, connection })
  }

  removeConnection(id) {
    const connection = this.connections.get(id)
    if (connection) {
      this.connections.delete(id)
      this.emit('disconnect', { id, connection })
    }
  }

  getConnection(id) {
    return this.connections.get(id)
  }

  getAllConnections() {
    return Array.from(this.connections.values())
  }

  hasConnection(fromNode, fromPort, toNode, toPort) {
    return Array.from(this.connections.values()).some(conn =>
      conn.from.node === fromNode &&
      conn.from.port === fromPort &&
      conn.to.node === toNode &&
      conn.to.port === toPort
    )
  }

  getConnectionsForNode(nodeId) {
    return Array.from(this.connections.values()).filter(conn =>
      conn.from.node === nodeId || conn.to.node === nodeId
    )
  }

  clear() {
    this.connections.clear()
    this.emit('clear')
  }

  on(event, callback) {
    this.listeners.push({ event, callback })
  }

  off(event, callback) {
    this.listeners = this.listeners.filter(
      listener => listener.event !== event || listener.callback !== callback
    )
  }

  emit(event, data) {
    this.listeners
      .filter(listener => listener.event === event)
      .forEach(listener => listener.callback(data))
  }

  // Serializar conexiones para guardar estado
  serialize() {
    return JSON.stringify(Array.from(this.connections.entries()))
  }

  // Deserializar conexiones desde estado guardado
  deserialize(data) {
    try {
      const entries = JSON.parse(data)
      this.connections = new Map(entries)
      this.emit('deserialize')
    } catch (error) {
      console.error('Error deserializando conexiones:', error)
    }
  }
}

export class NodeValidator {
  static validateNode(node) {
    const required = ['id', 'x', 'y', 'label']
    for (const field of required) {
      if (!(field in node)) {
        throw new Error(`Nodo inválido: falta el campo '${field}'`)
      }
    }
    
    if (typeof node.x !== 'number' || typeof node.y !== 'number') {
      throw new Error('Las coordenadas del nodo deben ser números')
    }
    
    return true
  }

  static validateConnection(connection) {
    const required = ['from', 'to']
    for (const field of required) {
      if (!(field in connection)) {
        throw new Error(`Conexión inválida: falta el campo '${field}'`)
      }
    }
    
    const fromRequired = ['node', 'port']
    const toRequired = ['node', 'port']
    
    for (const field of fromRequired) {
      if (!(field in connection.from)) {
        throw new Error(`Conexión inválida: falta el campo 'from.${field}'`)
      }
    }
    
    for (const field of toRequired) {
      if (!(field in connection.to)) {
        throw new Error(`Conexión inválida: falta el campo 'to.${field}'`)
      }
    }
    
    return true
  }
}

export const WireSystemUtils = {
  // Calcular distancia entre dos puntos
  distance(p1, p2) {
    return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2)
  },

  // Calcular el punto medio entre dos puntos
  midpoint(p1, p2) {
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2
    }
  },

  // Interpolar entre dos puntos
  lerp(p1, p2, t) {
    return {
      x: p1.x + (p2.x - p1.x) * t,
      y: p1.y + (p2.y - p1.y) * t
    }
  },

  // Generar puntos a lo largo de una línea
  generateLinePoints(start, end, segments) {
    const points = []
    for (let i = 0; i <= segments; i++) {
      const t = i / segments
      points.push(this.lerp(start, end, t))
    }
    return points
  },

  // Calcular posición del puerto en un nodo
  getPortPosition(node, port, type, index = 0, totalPorts = 1) {
    const offsetY = (index - (totalPorts - 1) / 2) * 30
    
    if (type === 'input') {
      return {
        x: node.x - 60, // Lado izquierdo del nodo
        y: node.y + offsetY
      }
    } else {
      return {
        x: node.x + 60, // Lado derecho del nodo
        y: node.y + offsetY
      }
    }
  },

  // Generar color aleatorio para cables
  randomColor() {
    const colors = [
      '#ef4444', '#f59e0b', '#eab308', '#22c55e',
      '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  },

  // Validar si un puerto puede conectarse a otro
  canConnect(fromNode, fromPort, toNode, toPort, existingConnections = []) {
    // No conectar un nodo consigo mismo
    if (fromNode.id === toNode.id) return false
    
    // Verificar que el puerto de origen sea de salida y el destino de entrada
    const fromHasOutput = fromNode.outputs && fromNode.outputs.includes(fromPort)
    const toHasInput = toNode.inputs && toNode.inputs.includes(toPort)
    
    if (!fromHasOutput || !toHasInput) return false
    
    // Verificar que no exista ya una conexión igual
    const exists = existingConnections.some(conn =>
      conn.from.node === fromNode.id &&
      conn.from.port === fromPort &&
      conn.to.node === toNode.id &&
      conn.to.port === toPort
    )
    
    return !exists
  }
}

export default {
  CablePhysics,
  ConnectionManager,
  NodeValidator,
  WireSystemUtils
}