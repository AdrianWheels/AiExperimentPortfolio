# Estado actual — mayo 2024

## Resumen ejecutivo
- La experiencia principal ya combina puzzles sonoros, de cifrado, cableado y frecuencias bajo un layout de tres columnas que alterna entre modo juego y portfolio desbloqueable según el estado global.【F:src/App.jsx†L15-L48】【F:src/context/GameContext.jsx†L77-L101】
- El contexto de juego gestiona progresión persistente, eventos narrativos y efectos audiovisuales, incluido un scheduler para diálogos y animaciones de desbloqueo por lock.【F:src/context/GameContext.jsx†L200-L471】【F:src/context/GameContext.jsx†L708-L789】

## Gameplay y progresión
- El puzzle "Secuencia Resonante" introduce una matriz de emisores interactivos con feedback visual, reproducción de tonos y validación progresiva del patrón antes de liberar el módulo de frecuencias.【F:src/components/puzzles/new/SoundPatternPuzzle.jsx†L5-L125】
- El puzzle "Buffer de Cifrado" ofrece entrada Morse, hints parciales y control de estado para capturar el código `MK7319`, marcando el candado de seguridad como resuelto al validar la traducción.【F:src/components/puzzles/new/CipherPuzzle.jsx†L5-L107】【F:src/context/GameContext.jsx†L430-L448】
- La máquina de estados implícita en `activeChallenge` define el orden recomendado de puzzles (sonido → cifrado → frecuencias → seguridad → cableado) y alimenta las ayudas contextuales que muestra la IA.【F:src/context/GameContext.jsx†L77-L85】【F:src/components/narrative/HintPanel.jsx†L11-L55】

## Sistema de pistas
- El panel lateral permite solicitar pistas con cooldown visual, histórico ordenado y contador global, reutilizando `requestHint` para registrar logs persistentes y penalizar el abuso.【F:src/components/narrative/HintPanel.jsx†L27-L94】【F:src/context/GameContext.jsx†L557-L605】
- Además del botón, el comando `hint` en el terminal acepta un objetivo opcional y devuelve confirmaciones del sistema, facilitando el acceso rápido desde la experiencia de texto.【F:src/context/GameContext.jsx†L608-L645】
- La biblioteca de pistas y los umbrales narrativos disparan reacciones específicas de A.R.I.A., reforzando la personalidad del asistente cuando el jugador depende demasiado de la ayuda.【F:src/context/GameContext.jsx†L20-L55】【F:data/aria-script.json†L300-L344】

## Feedback audiovisual y narrativa
- El hook `useSound` centraliza la reproducción de tonos, efectos de desbloqueo y errores; cada puzzle dispara estos sonidos junto con animaciones `glow-success` cuando se completa un lock.【F:src/hooks/useSound.js†L9-L49】【F:src/components/puzzles/new/SoundPatternPuzzle.jsx†L68-L125】【F:src/components/puzzles/new/CipherPuzzle.jsx†L37-L105】
- El script narrativo JSON cubre intros, reacciones por puzzle, pistas escalonadas y recordatorios de estado, manteniendo a A.R.I.A. como narradora sarcástica durante toda la partida.【F:data/aria-script.json†L180-L344】

## Portfolio desbloqueado
- Al liberar todos los locks, el estado cambia automáticamente al modo portfolio, mostrando una vista que puede alternar entre narrativa "normal" y "hackeada" con contenido en JSON (perfil, skills, proyectos y timeline).【F:src/context/GameContext.jsx†L720-L789】【F:src/components/portfolio/PortfolioView.jsx†L1-L86】
- Los componentes `PortfolioHero`, `PortfolioProjects`, `PortfolioSkills` y `PortfolioTimeline` consumen datasets dedicados, permitiendo copy alternativo según el modo seleccionado.【F:src/components/portfolio/PortfolioView.jsx†L30-L74】

## Testing y datos
- La lógica pura de los puzzles cuenta con pruebas unitarias en Vitest que validan secuencias, cálculo del siguiente tono, normalización del cifrado y progresión de hints.【F:src/components/puzzles/new/__tests__/logic.test.js†L1-L40】
- Los datasets de narrativa (`aria-script.json`) y portfolio (`data/portfolio/*.json`) viven fuera del bundle principal, lo que facilita extender contenido sin tocar componentes de React.【F:data/aria-script.json†L1-L344】【F:src/components/portfolio/PortfolioView.jsx†L1-L74】

## Próximos pasos sugeridos
- Profundizar en accesibilidad y controles de teclado para los puzzles ya implementados, además de ampliar pruebas de integración sobre el flujo de hints en el terminal.
- Completar el modo portfolio hackeado con variaciones visuales adicionales, efectos glitch persistentes y copy específico para cada sección.
