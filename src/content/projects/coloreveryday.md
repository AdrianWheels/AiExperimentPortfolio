---
title: "ColorEveryday"
locale: es
year: "2025"
role: "Full Stack Developer"
description: "Plataforma web interactiva que genera diariamente ilustraciones únicas mediante IA (Gemini 2.5 Flash) para colorear. Un calendario digital creativo desarrollado con React y Tailwind."
problem: "Los usuarios buscan actividades creativas diarias pero carecen de inspiración constante. Las apps de coloreado existentes ofrecen diseños estáticos y repetitivos."
solution: "Desarrollé una plataforma que usa Gemini 2.5 Flash para generar ilustraciones únicas cada día, presentadas en un calendario interactivo. El usuario puede colorear directamente en el navegador con una interfaz intuitiva construida en React."
results:
  - "Generación diaria automática de ilustraciones con IA"
  - "Interfaz interactiva de coloreado en el navegador"
  - "Calendario visual con historial de creaciones"
  - "Integración directa con Gemini 2.5 Flash API"
motivation: "Quería explorar la IA generativa de imágenes y me pareció buena idea combinar dibujos para colorear con la web. El mundo del arte me inspira a crear experiencias creativas accesibles."
challenges: "El mayor reto fue construir todo el sistema sin base de datos, aunque al final la añadí para monetizar. Mantener todo gratuito y funcional fue más complejo de lo esperado."
learnings: "Aprendí mucho sobre generación de imágenes con IA y alternativas a bases de datos convencionales. Hoy lo diseñaría pensando en la base de datos y el premium desde el principio."
context: "Proyecto en solitario, en desarrollo activo con 2-3 meses de trabajo a tiempo parcial. 9 usuarios registrados; los que entran se quedan bastante tiempo."
tags: ["React", "Tailwind", "Gemini 2.5 Flash", "AI"]
heroImage: "/projects/coloreverday/coloreveryday.png"
gallery:
  - "/projects/coloreverday/coloreveryday-calendar.png"
order: 3
---

## El Reto

Crear una experiencia de coloreado digital que fuera fresca cada día, evitando la monotonía de las apps tradicionales que dependen de bibliotecas estáticas de diseños.

## La Solución

Integré Gemini 2.5 Flash como motor generativo para crear ilustraciones diarias únicas. La arquitectura combina React para la interfaz de coloreado interactiva con un sistema de calendario que mantiene el historial de creaciones del usuario.

## Detalles Técnicos

- **Frontend:** React con Tailwind para una UI responsive y fluida
- **IA Generativa:** Gemini 2.5 Flash para generar prompts e ilustraciones
- **Interactividad:** Canvas API para el sistema de coloreado en tiempo real
- **Persistencia:** Almacenamiento local del historial de creaciones
