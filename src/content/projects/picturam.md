---
title: "Picturam"
locale: es
year: "2026"
role: "Full Stack & AI Engineer"
description: "PWA que traduce voz en imágenes semánticas al instante para asistir la comunicación con personas mayores con sordera, analfabetismo o dificultades verbales. Pipeline dual-mode (GPU local o cloud) con caché de dos capas."
problem: "Las personas mayores con sordera, analfabetismo o problemas de comprensión verbal pierden gran parte de lo que les dicen cuidadores, terapeutas o familiares. El lenguaje hablado es un canal frágil que no siempre llega."
solution: "Construí una PWA que captura la voz, la transcribe con Whisper, extrae el concepto clave con un LLM y genera una imagen semántica que acompaña a la frase. El servidor orquesta dos modos intercambiables — GPU local (faster-whisper + Ollama + ComfyUI) o cloud (Deepgram + Gemini + fal.ai) — y un caché de dos capas elimina trabajo redundante."
results:
  - "Pipeline dual-mode local (RTX 4080) o cloud, intercambiable por config"
  - "Caché L1 (frase exacta) + L2 (concepto) reduce latencia 10-50x en repeticiones"
  - "Latencia típica ~200-300ms cached, 2-5s en generación nueva"
  - "Casos de uso: residencias, logopedia, comunicación familiar"
motivation: "Quería empujar el caso de uso social de los modelos generativos: en lugar de imágenes decorativas, imágenes que sirvan a alguien que no puede oír o leer. Y de paso experimentar con un pipeline que pueda correr en mi GPU local o en cloud sin cambiar la app."
challenges: "Lo más difícil fue mantener latencias usables en un pipeline con 3 modelos en serie (STT → LLM → image). La caché de dos capas y el matching fuzzy de personas conocidas fueron las dos decisiones que hicieron viable el modo conversacional."
learnings: "Aprendí a diseñar abstracciones de proveedor (STT/LLM/image) intercambiables sin acoplarse al SDK concreto, y que en escenarios reales (residencia con wifi inestable) el offline-first deja de ser opcional."
context: "Proyecto más activo del portfolio en 2026 (44 commits en 60 días). MVP técnico sólido pendiente de elegir hito comercial: demo abierta, piloto en residencia, o API para terceros."
tags: ["React", "Node.js", "Whisper", "ComfyUI", "AI"]
heroImage: "/projects/picturam/desktop.png"
gallery:
  - "/projects/picturam/mobile.png"
order: 2
tier: featured
---

## El Reto

Las personas mayores con sordera, analfabetismo o problemas cognitivos a menudo entienden mejor una imagen que una explicación verbal. Faltaba una herramienta que, en tiempo real, tradujera lo que un cuidador o familiar quería decir a una representación visual que la persona pudiera procesar.

## La Solución

Construí una PWA con dos componentes: un cliente React 19 + Vite que captura audio por WebSocket, y un servidor Node + Express + WebSocket que orquesta un pipeline de tres pasos (transcripción, extracción de concepto, generación de imagen). Cada paso tiene un proveedor local y otro cloud intercambiables por configuración. Dos capas de caché — frase exacta y concepto extraído — evitan regenerar imágenes ya vistas, lo que reduce la latencia entre 10 y 50 veces en uso conversacional.

## Detalles Técnicos

- **Frontend:** React 19 + Vite 8 + TypeScript, PWA instalable
- **Backend:** Node 20 + Express 5 + WebSocket
- **STT:** faster-whisper (local, Python Flask) o Deepgram (cloud)
- **LLM:** Ollama (local) o Gemini (cloud) para extracción de concepto
- **Imagen:** ComfyUI con Flux Schnell / SDXL Turbo (local) o fal.ai (cloud)
- **BD:** InsForge (blob storage + metadatos)
- **Personas:** Matching fuzzy por alias para overlay de avatares conocidos
