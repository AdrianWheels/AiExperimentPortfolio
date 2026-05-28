---
title: "Brisca"
locale: es
year: "2026"
role: "Game Developer & Engine Designer"
description: "Roguelike de cartas con baraja española 1v1 contra IA, inspirado en Balatro. Motor 100% determinista en TypeScript puro con sim harness headless que corre miles de runs para balancear thresholds y rankear talismanes."
problem: "Los juegos de cartas tradicionales españoles tienen poco recorrido más allá de la partida puntual. Balatro demostró que el roguelike puede inyectar variedad y matemática a una baraja conocida, pero ningún proyecto había llevado esa fórmula a la Brisca."
solution: "Construí un roguelike completo con 12 matches por run repartidos en 3 tabernas con jefes, 30 talismanes en 3 rarezas, tienda pre-boss y scoring estilo Balatro (fichas × mult). El motor es puro TypeScript sin React, simulable headless — eso permite un sim harness que corre miles de runs para detectar talismanes muertos, combos rotos y thresholds triviales."
results:
  - "Motor 100% determinista (mulberry32 PRNG) simulable headless"
  - "30 talismanes con hook system parametrizable (onTrickResolve, onMatchStart...)"
  - "Sim harness con 10 escenarios: thresholds, combos, fairness, economy"
  - "Renderizado 3D de cartas con React Three Fiber + react-spring"
motivation: "Quería un proyecto donde el game design fuera medible, no solo intuitivo. La Brisca era ideal porque la conozco desde siempre y porque sus reglas (40 cartas, baza fija, palo de triunfo) son simples pero permiten capas estratégicas profundas."
challenges: "Lo más complejo fue separar el motor puro de la capa de render para que la misma lógica pudiera correr en una partida real (con animaciones React Three Fiber + Zustand) y en un sim de 10.000 runs sin DOM ni framework. Y rebalancear talismanes con datos: el sim me decía 'El Avaro nunca dispara' y había que mirar el hook."
learnings: "Aprendí que un sim harness es la mejor herramienta de game design que puedes tener: convierte intuiciones discutibles ('este talismán es OP') en hechos cuantitativos ('synergy 452 vs baseline 310'). Y que el coste de mantener pureza en el reducer se paga en cuanto necesitas testarlo a escala."
context: "Jugable de extremo a extremo: 12 matches, recompensas, tienda, 3 jefes con trampas, 30 talismanes con arte castizo curado. Pendiente meta-progresión y rebalance final tras los reportes del sim."
tags: ["Astro", "React Three Fiber", "TypeScript", "Zustand"]
heroImage: "/projects/brisca/desktop.png"
gallery:
  - "/projects/brisca/mobile.png"
order: 3
tier: featured
---

## El Reto

Llevar la fórmula roguelike de Balatro a un juego de cartas tradicional español. La Brisca tiene reglas simples pero baza fija, palo de triunfo y orden de prioridades que la hacen perfecta para añadir capas: talismanes que modifican scoring, jefes con trampas que rompen reglas, economía con tienda pre-boss.

## La Solución

Separé el proyecto en tres capas independientes: motor puro (TypeScript sin React ni three.js, reducer determinista), estado cliente (Zustand para run y match) y render (React Three Fiber para cartas 3D + DOM para HUD). Esa separación permite el sim harness: 10 escenarios diferentes que corren miles de runs para detectar problemas de balance objetivos. Los talismanes se declaran como hooks parametrizables sobre el motor de scoring.

## Detalles Técnicos

- **Framework:** Astro 6 + React 19 + TypeScript
- **Motor:** TypeScript puro, reducer determinista, PRNG mulberry32
- **Estado:** Zustand (runStore + matchStore + settingsStore)
- **Render 3D:** React Three Fiber + react-spring para animaciones de cartas
- **Tests:** Vitest (96 tests) + sim harness en 10 escenarios
- **Arte:** Pipeline de generación con ComfyUI + curation server propio
