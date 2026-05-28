---
title: "Brisca"
locale: en
baseSlug: "brisca"
year: "2026"
role: "Game Developer & Engine Designer"
description: "A roguelike card game with a Spanish deck, 1v1 vs AI, inspired by Balatro. 100% deterministic TypeScript engine with a headless sim harness that runs thousands of runs to balance thresholds and rank talismans."
problem: "Traditional Spanish card games rarely go beyond the casual one-off match. Balatro proved roguelike loops can inject variety and math into a familiar deck, but no project had taken that formula to Brisca."
solution: "I built a full roguelike with 12 matches per run across 3 taverns with bosses, 30 talismans across 3 rarities, a pre-boss shop and Balatro-style scoring (chips × mult). The engine is pure TypeScript without React, simulable headlessly — that enables a sim harness running thousands of runs to detect dead talismans, broken combos and trivial thresholds."
results:
  - "100% deterministic engine (mulberry32 PRNG), simulable headlessly"
  - "30 talismans with a parametric hook system (onTrickResolve, onMatchStart...)"
  - "Sim harness with 10 scenarios: thresholds, combos, fairness, economy"
  - "3D card rendering with React Three Fiber + react-spring"
motivation: "I wanted a project where game design was measurable, not just intuitive. Brisca was ideal because I've known it forever and its rules (40-card deck, fixed lead, trump suit) are simple but enable deep strategic layers."
challenges: "The hardest part was separating the pure engine from the render layer so the same logic could run both in a real match (with React Three Fiber animations + Zustand) and in a 10,000-run sim with no DOM or framework. Plus rebalancing talismans from data — the sim would say 'El Avaro never fires' and I'd have to dig into the hook."
learnings: "I learned that a sim harness is the best game design tool you can have: it turns debatable intuitions ('this talisman is OP') into quantitative facts ('synergy 452 vs baseline 310'). And that the cost of keeping the reducer pure pays itself off the moment you need to test it at scale."
context: "Playable end-to-end: 12 matches, rewards, shop, 3 bosses with traps, 30 talismans with curated traditional art. Meta-progression and final balance pass pending after sim reports."
tags: ["Astro", "React Three Fiber", "TypeScript", "Zustand"]
heroImage: "/projects/brisca/desktop.png"
gallery:
  - "/projects/brisca/mobile.png"
order: 3
tier: featured
---

## The Challenge

Take the roguelike formula from Balatro and apply it to a traditional Spanish card game. Brisca has simple rules but a fixed lead, a trump suit and priority ordering that make it perfect for added layers: talismans that modify scoring, bosses with rule-breaking traps, an economy with a pre-boss shop.

## The Solution

I split the project into three independent layers: pure engine (TypeScript with no React or three.js, deterministic reducer), client state (Zustand for run and match) and render (React Three Fiber for 3D cards + DOM for HUD). That separation enables the sim harness: 10 different scenarios that run thousands of runs to detect objective balance problems. Talismans are declared as parametric hooks on top of the scoring engine.

## Technical Details

- **Framework:** Astro 6 + React 19 + TypeScript
- **Engine:** Pure TypeScript, deterministic reducer, mulberry32 PRNG
- **State:** Zustand (runStore + matchStore + settingsStore)
- **3D render:** React Three Fiber + react-spring for card animations
- **Tests:** Vitest (96 tests) + sim harness across 10 scenarios
- **Art:** Generation pipeline with ComfyUI + a custom curation server
