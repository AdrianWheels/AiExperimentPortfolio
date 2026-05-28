---
title: "Mementic"
locale: en
baseSlug: "mementic"
year: "2026"
role: "Backend Developer"
description: "An indexer and phrase search engine for YouTube videos. Ingests playlists or keywords, transcribes with Whisper when subtitles are missing, and returns the exact clip (start/end) that contains the searched phrase with fuzzy trigram search."
problem: "Remembering exactly which video and which minute a phrase was said in is nearly impossible. YouTube search is by title and description, not by spoken content, and memes/quotes get lost across thousands of hours of footage."
solution: "I built a FastAPI service that ingests YouTube playlists or keywords, downloads subtitles when they exist and, when they don't, generates them with Whisper. Every segment is indexed in PostgreSQL with timestamps. A combined exact + fuzzy (trigram) search returns the video, the clip and the exact seconds where someone said it."
results:
  - "FastAPI + SQLAlchemy + PostgreSQL pipeline with idempotent ingestion"
  - "Whisper STT fallback when YouTube subtitles are missing"
  - "Exact + fuzzy (trigram) search with per-segment timestamps"
  - "Clip download by time range through a REST endpoint"
motivation: "I got tired of hunting for specific memes and quotes on YouTube without knowing where they were. If Shazam can identify a song from 5 seconds, the same should be possible for spoken quotes."
challenges: "Idempotent ingestion was the main challenge: a playlist may contain deleted videos, subtitles that change, or no subtitles at all, and you have to decide when to invoke Whisper (expensive) or trust the scraper's data. Fuzzy search required aggressive text normalization and a Postgres trigram index."
learnings: "I learned to design ingestion pipelines that can run a thousand times without duplicating anything, and to use PostgreSQL beyond basic CRUD (extensions like pg_trgm completely change what's possible)."
context: "Functional MVP with a YouTube-embed frontend and a clip download endpoint. Pending: LAN access, ingestion of the first real playlist, and a duplicates dashboard."
tags: ["Python", "FastAPI", "Whisper", "PostgreSQL"]
heroImage: "/projects/mementic/desktop.png"
order: 7
tier: more
---

## The Challenge

Spoken quotes and video memes are unrecoverable: nobody remembers which 47-minute video contains the exact line they're looking for. YouTube indexes by title and description, not by spoken content.

## The Solution

I designed a FastAPI pipeline that takes playlists or keywords, downloads subtitles when they exist and, when they don't, generates them with Whisper. Every segment (with start_sec and end_sec) is indexed in PostgreSQL. Search combines exact matching with trigram similarity and returns clips ranked by relevance. The `/clip/{id}?start=X&end=Y` endpoint lets you download exactly those seconds.

## Technical Details

- **Framework:** FastAPI with full type-safety (Pydantic + type hints)
- **DB:** PostgreSQL with the pg_trgm extension for fuzzy search
- **STT:** Whisper as a fallback when YouTube has no subtitles
- **Ingestion:** SQLAlchemy + idempotent pipeline with deduplication
- **API:** REST endpoints for search, ingest, download and video status
- **Frontend:** Static SPA served by FastAPI with YouTube embeds
