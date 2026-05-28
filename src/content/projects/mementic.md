---
title: "Mementic"
locale: es
year: "2026"
role: "Backend Developer"
description: "Indexador y buscador de frases en vídeos de YouTube. Ingesta playlists o keywords, transcribe con Whisper cuando no hay subtítulos, y devuelve el clip exacto (start/end) que contiene la frase buscada con búsqueda fuzzy por trigramas."
problem: "Recordar exactamente en qué vídeo y minuto se dijo una frase es prácticamente imposible. Las búsquedas de YouTube son por título y descripción, no por contenido hablado, y los memes/citas se pierden entre miles de horas de vídeo."
solution: "Construí un servicio FastAPI que ingiere playlists o keywords de YouTube, descarga subtítulos cuando existen y, si no, los genera con Whisper. Cada segmento se indexa en PostgreSQL con timestamps. Una búsqueda combinada exacta + fuzzy (trigramas) devuelve el vídeo, el clip y los segundos exactos donde alguien lo dijo."
results:
  - "Pipeline FastAPI + SQLAlchemy + PostgreSQL con ingesta idempotente"
  - "Whisper STT cuando no hay subtítulos disponibles en YouTube"
  - "Búsqueda exacta + fuzzy (trigramas) con timestamps por segmento"
  - "Descarga de clips por rango temporal vía endpoint REST"
motivation: "Me harté de buscar memes y citas concretas en YouTube sin saber dónde estaban. Si Shazam puede identificar una canción de 5 segundos, debería poder hacer lo mismo con citas habladas."
challenges: "La ingesta idempotente fue el reto principal: una playlist puede tener vídeos eliminados, subtítulos que cambian o que no existen y hay que decidir cuándo invocar Whisper (costoso) o aceptar el dato del scraper. La búsqueda fuzzy necesitó normalización agresiva del texto y un índice trigram en Postgres."
learnings: "Aprendí a diseñar un pipeline de ingestión que se puede ejecutar mil veces sin duplicar nada, y a usar PostgreSQL más allá del CRUD básico (extensiones como pg_trgm cambian completamente lo que se puede hacer)."
context: "MVP funcional con frontend embed de YouTube y endpoint de descarga de clips. Pendiente acceso LAN, ingesta de la primera playlist real y dashboard de duplicados."
tags: ["Python", "FastAPI", "Whisper", "PostgreSQL"]
heroImage: "/projects/mementic/desktop.png"
order: 7
tier: more
---

## El Reto

Las citas habladas y los memes en vídeo son irrecuperables: nadie recuerda en qué vídeo de 47 minutos se dijo exactamente lo que buscas. YouTube indexa por título y descripción, no por contenido hablado.

## La Solución

Diseñé un pipeline en FastAPI que recibe playlists o keywords, descarga subtítulos cuando existen, y si no, los genera con Whisper. Cada segmento (con start_sec y end_sec) se indexa en PostgreSQL. La búsqueda combina coincidencia exacta con similitud por trigramas y devuelve los clips ordenados por relevancia. El endpoint `/clip/{id}?start=X&end=Y` permite descargar exactamente esos segundos.

## Detalles Técnicos

- **Framework:** FastAPI con type-safety completa (Pydantic + type hints)
- **BD:** PostgreSQL con extensión pg_trgm para búsqueda fuzzy
- **STT:** Whisper como fallback cuando no hay subtítulos en YouTube
- **Ingesta:** SQLAlchemy + pipeline idempotente con deduplicación
- **API:** Endpoints REST para search, ingest, download y video status
- **Frontend:** SPA estática servida por FastAPI con embed de YouTube
