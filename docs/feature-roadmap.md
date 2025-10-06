# Plan de Evolución para el Portfolio Gamificado

## 1. Radiografía del estado actual

### 1.1 Arquitectura técnica
- **Stack**: Vite + React 18 + Tailwind CSS + PostCSS.
- **Entrada**: `src/main.jsx` monta el componente `App` e importa los estilos globales (`styles.css`, `components.css`).
- **Componentización**: Toda la experiencia está contenida en un único componente de página (`App.jsx`), lo que dificulta escalar comportamientos complejos.
- **Persistencia**: Se usa `localStorage` para memorizar el progreso del jugador mediante la clave `genio_state` y métodos utilitarios `loadState`/`saveState`【F:src/App.jsx†L8-L34】.

### 1.2 Mecánica de juego disponible
- **Bloqueos**: Hay tres locks (`security`, `frequency`, `wiring`) que definen el estado general (`Trapped`, `Partial`, `Free`). El cambio de estado dispara la secuencia de "twist" cuando se libera el genio.【F:src/App.jsx†L52-L89】
- **Interacciones**:
  - Terminal de texto con comandos (`help`, `locks`, `unlock security --code=XXXX`, `freq open`, `plate open`, `bypass`).【F:src/App.jsx†L96-L126】
  - Control deslizante triple para ajustar frecuencias con tolerancia definida por `TARGETS` y `TOL`.【F:src/App.jsx†L40-L51】【F:src/App.jsx†L269-L311】
  - Panel de cables (drag & drop) que compara conexiones esperadas `R`, `A`, `Y`.【F:src/App.jsx†L132-L170】
- **UI/UX**: Panel central con avatar, leds, animación de rejilla y terminal que se pre-puebla desde `data/startup.txt` con log de arranque de A.R.I.A.【F:src/App.jsx†L172-L224】【F:data/startup.txt†L1-L39】

### 1.3 Contenido del portfolio
- `data/assistant.json` solo contiene dos proyectos placeholder sin campos biográficos, estudios o skills.【F:data/assistant.json†L1-L7】
- No existe aún una vista diferenciada "normal" vs "hackeada", ni toggles para cambiarlas.

### 1.4 Identidad narrativa
- A.R.I.A. habla de forma neutral; todavía no se refleja el tono cínico/irónico solicitado.
- No se han implementado diálogos ramificados, voces ni reacciones dinámicas de la IA según el progreso.

## 2. Gaps principales vs. visión objetivo
1. **Experiencia dual**: Falta todo el modo portfolio tradicional y su contraparte "hackeada" con estética UV/Jinx.
2. **Juego introductorio**: El onboarding del juego es básico; carece de narrativa, cinemática inicial, pistas contextuales y feedback emocional.
3. **Personalidad de la IA**: Requiere un sistema de diálogo/monólogo con respuestas irónicas y adaptativas.
4. **Gestión de estados**: Necesitamos un orquestador que sincronice progreso, desbloqueo del portfolio y toggle manual.
5. **Contenido real**: Hay que integrar datos del dueño (imagen, bio, estudios, skills, proyectos) en formatos reutilizables.
6. **Accesibilidad y localización**: No hay soporte multidioma ni ayudas de accesibilidad para puzzles o narrativa.

## 3. Principios guía para el desarrollo
- **Separación de escenas**: Desacoplar "Juego" y "Portfolio" en rutas/estados diferenciados para modularidad.
- **State machine explícita**: Modelar la progresión (Intro → Tutorial → Puzzle 1… → Victoria → Portfolio Hackeado) con XState o reducer centralizado.
- **Sistema de contenido declarativo**: JSON/YAML para portfolio y guion del diálogo, consumido por componentes reutilizables.
- **Experiencia audiovisual**: Utilizar Tailwind + CSS custom para efectos Jinx, considerar WebGL/simple shaders para glow UV.
- **Testing narrativo**: Snapshot de guiones y validación de comandos para asegurar coherencia tras iteraciones.

## 4. Roadmap propuesto

### Fase 1 — Fundamentos narrativos y de arquitectura
1. **Refactor en módulos**
   - Crear layout base y separar componentes (`Header`, `Terminal`, `PuzzlePanel`, `FrequencyControls`, `CablePanel`).
   - Implementar contexto global (`GameContext`) o máquina de estados para orquestar progresión.
2. **Guion y personalidad de A.R.I.A.**
   - Definir script en JSON/Markdown con escenas, triggers y tono irónico.
   - Añadir sistema de diálogos en pantalla (bocadillos, overlay o terminal enriquecido) con temporización.
3. **Intro cinemática**
   - Pantalla inicial con animación que presente la premisa y la "IA mala".
   - Opción de "Saltar intro".

### Fase 2 — Gameplay ampliado
1. **Puzzles adicionales**
   - Diseñar al menos dos pruebas nuevas (p.ej. patrón de sonido, lógica de cifrado) para antes de los locks actuales.
   - Integrar pistas dinámicas y consecuencias por fallos (comentarios sarcásticos de la IA).
2. **Sistema de pistas**
   - Contador de hints (`hintsUsed`) ya existe en el estado; implementar UI y feedback que degrade la actitud de la IA.
3. **Feedback audiovisual**
   - Sonidos, vibración (via CSS) y efectos lumínicos cuando se desbloquea cada lock.

### Fase 3 — Portfolio dual
1. **Contenido base**
   - Crear estructura de datos para: bio, foto, estudios, timeline, skills con niveles, proyectos con links.
   - Diseñar componentes reusables (`BioCard`, `ProjectGrid`, `SkillsRadar`...).
2. **Modo normal vs hackeado**
   - Layout base elegante y minimalista para modo normal.
   - Skin "hackeada": filtros UV, glitch, reemplazo de avatar por IA, copy alternativo escrito por la IA.
   - Implementar toggle UI (visible tras completar juego, con opción de debug en modo desarrollo).
3. **Persistencia de desbloqueo**
   - Guardar en `localStorage` el acceso al modo hackeado; permitir que el juego lo establezca automáticamente tras victoria.

### Fase 4 — Pulido y extensiones
1. **Localización**
   - Preparar infraestructura i18n (es/en). Añadir frases sarcásticas adaptadas al idioma.
2. **Accesibilidad**
   - Soporte teclado completo, descripciones ARIA para puzzles, modo alto contraste.
3. **Analítica y telemetría**
   - Implementar `telemetryOptIn` real con envío de eventos (Mock/Segment).【F:src/App.jsx†L330-L341】
4. **Optimización y pruebas**
   - Tests unitarios para lógica de puzzles y state machine.
   - Tests de snapshot para vistas del portfolio.

## 5. Próximas acciones concretas (sprint inicial)
1. **Documentar guion**: Taller con el autor para definir tono y frases de la IA.
2. **Diseñar wireframes**: Sketch de la intro, juego y dos versiones del portfolio (normal/hackeada).
3. **Refactor inicial**: Separar `App.jsx` en componentes y crear un `GameStateProvider` mínimo.
4. **Plan de contenido**: Solicitar assets (foto del dueño, info académica, lista de skills/proyectos) y preparar estructura JSON.
5. **Spike visual**: Prototipo rápido del efecto UV/Jinx para validar viabilidad con CSS/WebGL.

## 6. Indicadores de éxito
- Jugadores entienden la premisa y completan el juego en <5 minutos promedio.
- Tono de la IA es consistente y memorable según feedback de usuarios.
- Portfolio hackeado aumenta el tiempo de permanencia y se percibe como recompensa clara.
- Código modular permite añadir puzzles/diálogos sin tocar la lógica central.

---
Este roadmap proporciona una hoja de ruta escalonada que prioriza la experiencia narrativa y la diferenciación visual del portfolio, sin perder de vista la mantenibilidad técnica.
