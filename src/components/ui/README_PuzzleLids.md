# Sistema de Tapas Modular

Un sistema avanzado de protección visual para puzzles que simula tapas físicas con bisagras, física realista y mensajes ocultos personalizables.

## 🎯 Características Principales

### 🔧 Motor de Física Realista
- **Canvas 2D**: Renderizado optimizado con efectos visuales avanzados
- **Animaciones Fluidas**: Apertura/cierre suave con easing natural
- **Física de Caída**: Las tapas se desprenden y caen con gravedad realista
- **Interacción Intuitiva**: Arrastrar, teclas y controles múltiples

### 🎨 Variantes Visuales
- **Standard**: Tapa básica de acceso restringido
- **Classified**: Documentos clasificados con tema rojo
- **Maintenance**: Equipos en mantenimiento con tema amarillo
- **Experimental**: Prototipos con tema púrpura

### 💬 Mensajes Ocultos Dinámicos
- **Colección Extensa**: Más de 16 mensajes únicos categorizados
- **Humor y Referencias**: Bromas, referencias geek y easter eggs
- **Mensajes Personalizados**: Soporte para contenido específico
- **Variantes por Tema**: Mensajes adaptados a cada variante

## 🗂️ Estructura del Sistema

```
src/
├── components/
│   ├── ui/
│   │   ├── PuzzleLid.jsx          # Componente base del sistema
│   │   └── ProtectedPuzzle.jsx    # Wrapper automático para puzzles
│   └── demo/
│       └── LidShowcase.jsx        # Demostración completa
├── hooks/
│   └── usePuzzleLids.js           # Lógica de mensajes y dependencias
```

## 🚀 Uso Básico

### Protección Automática de Puzzles

```jsx
import ProtectedPuzzle from './components/ui/ProtectedPuzzle'
import MyPuzzleComponent from './MyPuzzleComponent'

// Protección automática basada en dependencias
<ProtectedPuzzle puzzleType="frequency">
  <MyPuzzleComponent />
</ProtectedPuzzle>
```

### Tapa Manual Personalizada

```jsx
import PuzzleLid from './components/ui/PuzzleLid'

<PuzzleLid
  isLocked={true}
  onUnlock={() => console.log('¡Desbloqueado!')}
  variant="classified"
  hiddenMessage="Mensaje personalizado\nCon múltiples líneas"
>
  <div>Contenido protegido</div>
</PuzzleLid>
```

## 🎛️ Configuración y Props

### PuzzleLid Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `isLocked` | Boolean | `true` | Si la tapa está activa |
| `onUnlock` | Function | `() => {}` | Callback al abrir completamente |
| `children` | ReactNode | - | Contenido protegido |
| `lidText` | String | "ACCESO RESTRINGIDO" | Texto en la tapa |
| `hiddenMessage` | String | Auto | Mensaje oculto al abrir |
| `customMessage` | String | null | Mensaje personalizado multilínea |
| `variant` | String | "standard" | Variante visual |
| `className` | String | "" | Clases CSS adicionales |

### Variantes Disponibles

- **`standard`**: Gris/azul, acceso restringido general
- **`classified`**: Rojo/negro, documentos clasificados
- **`maintenance`**: Amarillo/negro, mantenimiento
- **`experimental`**: Púrpura/azul, proyectos experimentales

## 🎮 Controles Interactivos

### Mouse/Touch
- **Arrastrar hacia abajo**: Abrir la tapa gradualmente
- **Soltar**: Auto-snap a cerrada (< 60%) o abierta (≥ 60%)

### Teclado
- **Espacio/Enter**: Toggle rápido abierto/cerrado
- **↑/↓**: Ajuste gradual +5%/-5%
- **D**: Desprender tapa (física de caída)
- **R**: Reset completo a estado inicial

## 🔗 Sistema de Dependencias

### Configuración Automática

```javascript
const dependencies = {
  sound: [],                    // Sin dependencias
  cipher: [],                   // Sin dependencias  
  frequency: ['sound'],         // Requiere sound
  cables: ['sound', 'cipher'],  // Requiere ambos
}
```

### Uso con GameContext

```jsx
// Verifica automáticamente el estado del juego
const isUnlocked = checkDependencies('frequency', gameState)

// Aplica variante automática según dependencias
const variant = getPuzzleVariant('cables', gameState)
```

## 💡 Mensajes Ocultos

### Categorías Disponibles

#### 🔐 Cipher
- Binario y códigos
- Referencias de programación
- Jokes técnicos

#### 📻 Frequency  
- Referencias de radio
- Música y sonido
- Nostalgia tecnológica

#### 🔌 Cables
- Advertencias de seguridad
- Referencias de Matrix
- Humor eléctrico

#### 🎵 Sound
- Patrones musicales
- Sonidos retro
- Easter eggs de audio

### Mensajes por Variante

```javascript
const VARIANT_MESSAGES = {
  standard: "Sistema en mantenimiento...\nVuelve en 5 minutos ⏰",
  classified: "📋 DOCUMENTO CLASIFICADO 📋\nNivel: GAMMA\nAcceso denegado",
  maintenance: "🔧 FUERA DE SERVICIO 🔧\nReparaciones en progreso",
  experimental: "⚗️ PROTOTIPO ACTIVO ⚗️\nProceder con precaución"
}
```

## 🎨 Personalización Visual

### Colores por Variante

Cada variante tiene su paleta completa:
- **Tapa**: Color principal y secundario
- **Marco**: Color de fondo y bordes
- **Tornillos**: Gradientes metálicos
- **Texto**: Color y legibilidad optimizada
- **Bisagra**: Color complementario

### Efectos Visuales

- **Sombras Dinámicas**: Cambian según ángulo de apertura
- **Gradientes**: Múltiples gradientes para profundidad
- **Tornillos Realistas**: Con ranuras y efectos metálicos
- **Glow Interior**: Iluminación sutil del contenido

## 🏗️ Integración en el Juego

### Aplicación Automática

```jsx
// En App.jsx - Protección automática aplicada
<ProtectedPuzzle puzzleType="frequency">
  <FrequencyControls />
</ProtectedPuzzle>

<ProtectedPuzzle 
  puzzleType="cables"
  customMessage="🔌 PANEL NEURAL 🔌\nAutorización DELTA requerida"
>
  <CablePanel />
</ProtectedPuzzle>
```

### Eventos del Sistema

```javascript
// Eventos disparados automáticamente
triggerEvent('puzzle_lid_opened', { 
  puzzleType: 'frequency', 
  variant: 'experimental' 
})
```

## 🔧 Extensibilidad

### Agregar Nuevas Variantes

```javascript
// En PuzzleLid.jsx
const variants = {
  // ... existentes
  nuclear: {
    lidColor: '#654321',
    lidColorSecondary: '#543210',
    backgroundColor: '#432100',
    borderColor: '#210000',
    screwColor: '#ffaa00',
    textColor: '#ffcc44',
    lidText: "☢️ RADIACTIVO ☢️",
    hingeColor: '#332200'
  }
}
```

### Nuevos Tipos de Mensaje

```javascript
// En usePuzzleLids.js
const HIDDEN_MESSAGES = {
  // ... existentes
  newPuzzle: [
    "Nuevo mensaje 1",
    "Nuevo mensaje 2\nCon múltiples líneas",
    "Nuevo mensaje 3 🚀"
  ]
}
```

## 🎪 Demostración

Para ver todas las variantes en acción:

```jsx
import LidShowcase from './components/demo/LidShowcase'

// Componente completo de demostración
<LidShowcase />
```

Incluye:
- ✅ Todas las variantes lado a lado
- ✅ Controles de toggle individual
- ✅ Reset global
- ✅ Instrucciones interactivas
- ✅ Estadísticas en tiempo real

## 🎯 Casos de Uso

### 1. Progresión de Puzzles
Ocultar puzzles hasta que se cumplan dependencias específicas.

### 2. Narrativa Inmersiva  
Crear sensación de desbloquear equipos reales con física convincente.

### 3. Easter Eggs
Mostrar mensajes divertidos que añaden personalidad al juego.

### 4. Feedback Visual
Indicar claramente qué puzzles están disponibles y cuáles no.

### 5. Gamificación
Hacer que el desbloqueo sea parte de la experiencia de juego.

## 🚀 Ventajas del Sistema

1. **Modular**: Aplicar a cualquier componente fácilmente
2. **Automático**: Dependencias gestionadas automáticamente
3. **Inmersivo**: Física realista y efectos convincentes
4. **Personalizable**: Variantes, mensajes y colores configurables
5. **Performante**: Canvas 2D optimizado para animaciones fluidas
6. **Accesible**: Múltiples métodos de interacción
7. **Extensible**: Fácil agregar nuevas variantes y características

El sistema de tapas transforma la experiencia de desbloqueo de puzzles de un simple cambio de estado a una interacción física satisfactoria que refuerza la narrativa del juego y añade un elemento lúdico único.