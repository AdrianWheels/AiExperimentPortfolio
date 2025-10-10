# Sistema de Cables Avanzado

Un sistema de cables interactivo con física realista implementado en React, basado en el concepto del wire-system con física Verlet.

## Características

- **Física Realista**: Los cables se comportan como objetos físicos con gravedad y flexibilidad
- **Interactividad**: Arrastra desde puertos de salida a puertos de entrada para crear conexiones
- **Validación**: Previene conexiones inválidas y duplicadas
- **Personalizable**: Configura física, colores, y comportamiento
- **Rendimiento**: Optimizado con Canvas 2D y requestAnimationFrame

## Componentes Principales

### WireSystem
El componente principal que maneja la simulación física y el renderizado de cables.

```jsx
import WireSystem from './components/puzzles/WireSystem'

<WireSystem
  nodes={nodes}
  connections={connections}
  onConnect={handleConnect}
  onDisconnect={handleDisconnect}
  interactive={true}
  physics={{
    gravity: 0.2,
    stiffness: 0.85,
    segments: 10
  }}
/>
```

### WireNode
Componente para crear nodos con puertos de entrada y salida.

```jsx
import WireNode from './components/puzzles/WireNode'

<WireNode
  id="node1"
  x={100}
  y={100}
  label="Procesador"
  color="#3b82f6"
  inputs={['in1', 'in2']}
  outputs={['out1', 'result']}
/>
```

## Propiedades

### WireSystem Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `nodes` | Array | `[]` | Array de objetos nodo |
| `connections` | Array | `[]` | Array de conexiones existentes |
| `onConnect` | Function | `() => {}` | Callback cuando se crea una conexión |
| `onDisconnect` | Function | `() => {}` | Callback cuando se elimina una conexión |
| `interactive` | Boolean | `true` | Si permite interacción del usuario |
| `physics` | Object | Ver abajo | Configuración de física |
| `className` | String | `""` | Clases CSS adicionales |

### Physics Object

```javascript
{
  gravity: 0.3,     // Fuerza de gravedad aplicada a los cables
  stiffness: 0.8,   // Rigidez de las restricciones del cable
  segments: 8       // Número de segmentos del cable (más = más flexible)
}
```

### Node Object

```javascript
{
  id: 'unique-id',        // ID único del nodo
  x: 100,                 // Posición X
  y: 100,                 // Posición Y
  label: 'Node Label',    // Etiqueta mostrada
  color: '#3b82f6',       // Color del nodo y cables
  inputs: ['in1', 'in2'], // Array de puertos de entrada
  outputs: ['out1']       // Array de puertos de salida
}
```

### Connection Object

```javascript
{
  from: {
    node: 'node-id',      // ID del nodo de origen
    port: 'port-name'     // Nombre del puerto de salida
  },
  to: {
    node: 'target-id',    // ID del nodo destino
    port: 'port-name'     // Nombre del puerto de entrada
  }
}
```

## Ejemplo de Uso Completo

```jsx
import React, { useState } from 'react'
import WireSystem from './components/puzzles/WireSystem'
import WireNode from './components/puzzles/WireNode'

function MyWireApp() {
  const [connections, setConnections] = useState([])
  
  const nodes = [
    {
      id: 'input',
      x: 100, y: 100,
      label: 'Input',
      color: '#3b82f6',
      inputs: [],
      outputs: ['data']
    },
    {
      id: 'processor',
      x: 300, y: 100,
      label: 'Processor',
      color: '#10b981',
      inputs: ['in'],
      outputs: ['result']
    },
    {
      id: 'output',
      x: 500, y: 100,
      label: 'Output',
      color: '#ef4444',
      inputs: ['final'],
      outputs: []
    }
  ]

  const handleConnect = (connection) => {
    setConnections(prev => [...prev, connection])
    console.log('Nueva conexión:', connection)
  }

  const handleDisconnect = (connection) => {
    setConnections(prev => 
      prev.filter(conn => 
        !(conn.from.node === connection.from.node && 
          conn.from.port === connection.from.port &&
          conn.to.node === connection.to.node && 
          conn.to.port === connection.to.port)
      )
    )
  }

  return (
    <div className="relative w-full h-96 bg-zinc-900 rounded">
      {nodes.map(node => (
        <WireNode
          key={node.id}
          {...node}
        />
      ))}
      
      <WireSystem
        nodes={nodes}
        connections={connections}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        physics={{
          gravity: 0.15,
          stiffness: 0.9,
          segments: 12
        }}
      />
    </div>
  )
}
```

## Utilidades Disponibles

El archivo `wireUtils.js` proporciona clases y funciones útiles:

- **CablePhysics**: Motor de física Verlet
- **ConnectionManager**: Gestión de conexiones con eventos
- **NodeValidator**: Validación de nodos y conexiones
- **WireSystemUtils**: Funciones de utilidad matemática

## Integración con tu Aplicación

El sistema se integra fácilmente en el `CablePanel` existente:

1. Los nodos se definen como objetos con posiciones y puertos
2. Las conexiones se sincronizan con el estado del juego
3. Los eventos `onConnect` actualizan el estado global
4. La física hace que los cables se vean y sientan naturales

## Personalización

### Colores y Estilos
- Cada nodo puede tener su propio color
- Los cables heredan el color del nodo de origen
- Los puertos se renderizan con indicadores visuales claros

### Física y Comportamiento
- Ajusta `gravity` para cables más o menos caídos
- Modifica `stiffness` para cables más rígidos o flexibles
- Cambia `segments` para mayor o menor detalle en la curvatura

### Validación de Conexiones
- Solo permite conexiones de salida a entrada
- Previene conexiones del nodo consigo mismo
- Evita conexiones duplicadas

## Rendimiento

- Usa Canvas 2D para renderizado eficiente
- Animación con `requestAnimationFrame`
- Optimizaciones en los cálculos de física
- Gestión eficiente de eventos de mouse

Este sistema proporciona una experiencia de usuario rica y realista para conectar elementos en tu aplicación de portfolio interactivo.