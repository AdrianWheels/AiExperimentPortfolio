# Fase 2 — Diagnóstico y Plan de Ejecución

## Estado actual (check)
- **Puzzles disponibles**: la vista principal solo monta `CablePanel` y `FrequencyControls`, por lo que todavía no existen pruebas adicionales antes de los locks actuales.【F:src/App.jsx†L12-L24】
- **Sistema de pistas**: el estado global contempla `hintsUsed` y un evento narrativo `frequency_hint`, pero no hay interfaz ni lógica para solicitar pistas o penalizar su uso.【F:src/context/GameContext.jsx†L23-L27】【F:src/context/GameContext.jsx†L363-L368】
- **Feedback audiovisual**: los eventos de desbloqueo generan líneas de diálogo, pero no disparan sonidos ni animaciones dedicadas más allá del texto en terminal.【F:data/aria-script.json†L84-L133】

## Objetivos de la Fase 2
1. Incorporar al menos dos puzzles previos a los locks existentes.
2. Habilitar un sistema de pistas configurable que afecte la actitud de A.R.I.A.
3. Reforzar el feedback audiovisual al desbloquear cada lock.

## Plan de trabajo propuesto

### 1. Puzzles adicionales
1. **Diseño de mecánicas**
   - Definir dos propuestas: p.ej. puzzle de patrón sonoro (slider/teclado) y puzzle de cifrado lógico (resolver frase). Documentar reglas y condiciones de victoria.
   - Establecer qué lock habilita cada puzzle y cómo se encadenan con los existentes.
2. **Arquitectura**
   - Crear carpeta `src/components/puzzles/new` con componentes autocontenidos y hooks para su lógica.
   - Extender `GameContext` con estados específicos (`soundPuzzleState`, `cipherPuzzleState`) y transiciones para marcar cada puzzle como resuelto.
3. **Integración UI**
   - Añadir sección de tutorial contextual (tooltips o mensajes en terminal) para enseñar cada puzzle.
   - Ajustar el layout principal para introducir los nuevos módulos (tabs o pasos progresivos).
4. **Validación**
   - Implementar pruebas unitarias ligeras para la lógica pura (validación de patrones/códigos) usando Vitest.
   - Añadir eventos narrativos (`events.sound_puzzle_hint`, etc.) para dar personalidad a la IA durante los nuevos retos.

### 2. Sistema de pistas
1. **Definir UX**
   - Botón o comando dedicado (`hint`) con contador visible en la interfaz.
   - Estados de disponibilidad (cooldown, límite por puzzle) definidos en el contexto.
2. **Implementación**
   - Exponer `requestHint()` en `GameContext` que incremente `hintsUsed`, seleccione la pista según puzzle activo y dispare la reacción apropiada.
   - Crear componente `HintPanel` o mensajes enriquecidos en el terminal con estilo diferenciado.
3. **Narrativa y consecuencias**
   - Ampliar `aria-script.json` con respuestas escalonadas según el número de pistas usadas.
   - Ajustar la puntuación/final opcional (p.ej. mensaje especial si `hintsUsed === 0`).

### 3. Feedback audiovisual
1. **Audio**
   - Seleccionar/crear assets de sonido cortos (unlock, error, slider).
   - Implementar utilidad `useSound` (wrapper sobre Web Audio API o librería ligera) y dispararla en `unlockSecurity`, `unlockFrequency`, `unlockWiring`.
2. **Animaciones y efectos**
   - Añadir clases CSS/Tailwind para destellos de los paneles (`animate-[unlockPulse]`, `glow-success`).
   - Activar animaciones mediante estado temporal en cada componente de puzzle (usar `setTimeout` a través del scheduler ya existente).
3. **Vibración visual**
   - Aplicar pequeñas transformaciones (`scale`, `skew`) al panel central cuando se desbloquea un lock.
   - Sincronizar con los diálogos existentes para mantener cohesión narrativa.

### 4. Entregables y milestones
- **Semana 1**: Documentar reglas de puzzles, prototipo UI estático, configurar assets de sonido.
- **Semana 2**: Implementar lógica y componentes de puzzles + flujo de pistas.
- **Semana 3**: Integrar feedback audiovisual, QA, pruebas y documentación final.

### 5. Riesgos y mitigación
- **Complejidad de puzzles**: riesgo de sobrecarga cognitiva → validar con wireframes/juego rápido antes de codificar.
- **Rendimiento de animaciones**: aplicar animaciones CSS en lugar de JS pesado; probar en dispositivos modestos.
- **Gestión de estado**: documentar transiciones en `GameContext` y, si crece demasiado, evaluar migrar a XState en Fase 3.

---
Este plan consolida el diagnóstico de brechas actuales y establece una hoja de ruta accionable para completar la Fase 2.
