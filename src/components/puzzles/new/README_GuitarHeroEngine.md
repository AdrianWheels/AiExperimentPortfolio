# Motor Guitar Hero para Secuencia Resonante

## Descripción General

Implementación avanzada del puzzle "Secuencia Resonante" usando un motor tipo Guitar Hero con física realista, timing preciso y sistema de puntuación completo. Este sistema reemplaza la implementación original con un motor más sofisticado y entretenido.

## Características Principales

### 🎮 Motor Guitar Hero Completo
- **Canvas 2D**: Renderizado optimizado con hardware acceleration
- **Física Realista**: Notas que se mueven suavemente por el carril
- **Timing Preciso**: Ventanas de hit configurables (Perfect/Good/Ok/Miss)
- **Sistema de Puntuación**: Score, combos y multiplicadores
- **Feedback Visual**: Efectos visuales y indicadores de estado

### 🎵 Sistema de Notas Mejorado
- **Notas Animadas**: Se mueven horizontalmente hacia la zona de impacto
- **Indicadores Visuales**: Cada nota tiene color, símbolo y tecla asignada
- **Ghost Notes**: Previsualización de la próxima nota esperada
- **Estados Múltiples**: Pending, Hit, Miss con efectos visuales diferenciados

### ⌨️ Controles Avanzados
- **Teclas Individuales**: 1, 2, 3, 4 para cada tipo de nota
- **Autoplay**: Espacio para hit automático en la zona
- **Controles de Juego**: Play/Pause (Espacio), Reset (R)
- **Feedback Inmediato**: Respuesta visual y auditiva instantánea

### 📊 Sistema de Métricas
- **Precisión**: Perfect (≤60ms), Good (≤120ms), Ok (≤280ms)
- **Puntuación**: 300/200/100 puntos base + multiplicador de combo
- **Estadísticas**: Tracking completo de hits, misses y accuracy
- **Combos**: Sistema de racha con multiplicadores

## Configuración del Motor

```javascript
// Timing Configuration
const FALL_TIME_MS = 3000    // Tiempo que tarda una nota en llegar
const HIT_WINDOW_MS = 280    // Ventana total de hit
const MISS_GRACE_MS = 120    // Gracia antes de forzar miss
const PERFECT_MS = 60        // Ventana perfect
const GOOD_MS = 120          // Ventana good
```

### Mapeo de Teclas
- **Tecla 1**: Alpha (α) - Pulso corto - Azul - ●
- **Tecla 2**: Beta (β) - Pulso grave - Verde - ◆  
- **Tecla 3**: Gamma (γ) - Pulso agudo - Rosa - ▲
- **Tecla 4**: Delta (δ) - Pulso largo - Naranja - ▬

### Secuencia Objetivo
El patrón sigue siendo: **α → δ → γ → β** (Teclas: 1 → 4 → 3 → 2)

## Arquitectura del Sistema

### Clase ResonanceEngine
Motor principal del juego que maneja:
- **Estado del juego**: Playing, paused, timing
- **Chart management**: Carga y gestión de secuencias
- **Input handling**: Procesamiento de teclas y timing
- **Renderizado**: Loop de animación con Canvas 2D
- **Scoring**: Cálculo de puntuación y combos

### Métodos Principales
```javascript
// Control del juego
engine.play()           // Iniciar/reanudar
engine.pause()          // Pausar
engine.reset()          // Reiniciar

// Configuración
engine.setChart(notes)  // Cargar secuencia
engine.setSpeed(mult)   // Velocidad (0.25x - 2x)

// Input
engine.onKey(toneId)    // Procesar input de tecla
engine.autoHit()        // Hit automático
```

### Sistema de Estados
- **Notas**: `pending` → `hit` | `miss`
- **Juego**: `idle` → `playing` → `paused` | `completed`
- **Timing**: Cálculo preciso con `performance.now()`

## Integración con el Juego

### Callbacks del Motor
```javascript
const engine = new ResonanceEngine(
  canvas,
  onSuccess: () => completeSoundPuzzle(),    // Puzzle completado
  onFail: (reason) => triggerEvent('miss'),  // Fallo detectado  
  onProgress: (current, total) => {...}      // Progreso actualizado
)
```

### Sincronización con Estado Global
- Respeta el estado `solved` del contexto del juego
- Triggerea eventos para integración con otros sistemas
- Mantiene compatibilidad con el sistema de sonidos existente

## Mejoras Respecto al Sistema Original

### ✅ Ventajas del Motor Guitar Hero

1. **Precisión Superior**: Timing basado en milisegundos vs detección básica
2. **Feedback Rico**: Múltiples tipos de respuesta (Perfect/Good/Ok/Miss)
3. **Experiencia Gamificada**: Score, combos, estadísticas
4. **Rendimiento Optimizado**: Canvas 2D vs manipulación DOM
5. **Extensibilidad**: Fácil agregar nuevas características

### 📈 Métricas de Mejora

- **Precisión de Timing**: ±280ms → ±60ms para Perfect
- **Feedback Visual**: 4 tipos vs 2 tipos
- **Fluidez**: 60 FPS constante vs animaciones CSS variables
- **Complejidad**: Sistema completo vs implementación básica

### 🎯 Casos de Uso

- **Principiantes**: Ventana de hit amplia (280ms)
- **Avanzados**: Buscar Perfect hits (60ms)
- **Speedrun**: Modo con velocidad aumentada
- **Práctica**: Reset rápido y feedback detallado

## Personalización y Extensiones

### Configuración de Dificultad
```javascript
// Fácil
{ FALL_TIME_MS: 4000, HIT_WINDOW_MS: 400, PERFECT_MS: 100 }

// Medio (actual)
{ FALL_TIME_MS: 3000, HIT_WINDOW_MS: 280, PERFECT_MS: 60 }

// Difícil
{ FALL_TIME_MS: 2000, HIT_WINDOW_MS: 200, PERFECT_MS: 40 }
```

### Extensiones Posibles
- **Multi-lane**: Múltiples carriles simultáneos
- **Hold Notes**: Notas largas mantenidas
- **Sequence Variations**: Patrones aleatorios
- **Achievement System**: Logros y desbloqueos
- **Replay System**: Grabación y reproducción

## Conclusión

El motor Guitar Hero elevala experiencia del puzzle "Secuencia Resonante" de un simple juego de timing a una experiencia interactiva completa con mecánicas de juego profundas, feedback rico y alta rejugabilidad. Mantiene la esencia del puzzle original mientras proporciona una base sólida para futuras expansiones.