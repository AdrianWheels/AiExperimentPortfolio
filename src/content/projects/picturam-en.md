---
title: "Picturam"
locale: en
baseSlug: "picturam"
year: "2026"
role: "Full Stack & AI Engineer"
description: "A PWA that translates speech into semantic images in real time, helping communication with elderly people who are deaf, illiterate or have verbal comprehension difficulties. Dual-mode pipeline (local GPU or cloud) with a two-layer cache."
problem: "Elderly people with hearing loss, illiteracy or comprehension problems miss much of what caregivers, therapists or family members tell them. Spoken language is a fragile channel that doesn't always reach the listener."
solution: "I built a PWA that captures the voice, transcribes it with Whisper, extracts the key concept with an LLM and generates a semantic image to accompany the sentence. The server orchestrates two interchangeable modes — local GPU (faster-whisper + Ollama + ComfyUI) or cloud (Deepgram + Gemini + fal.ai) — and a two-layer cache eliminates redundant work."
results:
  - "Dual-mode pipeline: local GPU (RTX 4080) or cloud, config-swappable"
  - "Two-layer cache (exact phrase + concept) cuts latency 10-50x on repeats"
  - "Typical latency ~200-300ms cached, 2-5s on fresh generation"
  - "Use cases: care homes, speech therapy, family communication"
motivation: "I wanted to push the social use case of generative models: instead of decorative images, images that serve someone who can't hear or read. And along the way, experiment with a pipeline that could run on my local GPU or on cloud without changing the app."
challenges: "The hardest part was keeping usable latency on a pipeline with three models in series (STT → LLM → image). The two-layer cache and fuzzy matching of known people were the two decisions that made the conversational mode viable."
learnings: "I learned to design provider abstractions (STT/LLM/image) that can be swapped without coupling to a specific SDK, and that in real scenarios (a care home with flaky wifi) offline-first stops being optional."
context: "Most active project in my portfolio in 2026 (44 commits in 60 days). Technically solid MVP, pending a commercial milestone: open demo, care-home pilot, or third-party API."
tags: ["React", "Node.js", "Whisper", "ComfyUI", "AI"]
heroImage: "/projects/picturam/desktop.png"
gallery:
  - "/projects/picturam/mobile.png"
order: 2
tier: featured
---

## The Challenge

Elderly people with hearing loss, illiteracy or cognitive issues often understand an image better than a verbal explanation. There was no tool that, in real time, translated what a caregiver or family member wanted to say into a visual representation the person could actually process.

## The Solution

I built a PWA with two pieces: a React 19 + Vite client that captures audio over WebSocket, and a Node + Express + WebSocket server that orchestrates a three-step pipeline (transcription, concept extraction, image generation). Each step has a local and a cloud provider, swappable by config. Two cache layers — exact phrase and extracted concept — avoid regenerating images that have already been seen, cutting latency by 10-50x in conversational use.

## Technical Details

- **Frontend:** React 19 + Vite 8 + TypeScript, installable PWA
- **Backend:** Node 20 + Express 5 + WebSocket
- **STT:** faster-whisper (local, Python Flask) or Deepgram (cloud)
- **LLM:** Ollama (local) or Gemini (cloud) for concept extraction
- **Image:** ComfyUI with Flux Schnell / SDXL Turbo (local) or fal.ai (cloud)
- **DB:** InsForge (blob storage + metadata)
- **People:** Fuzzy alias matching for overlay of known avatars
