---
title: "JR Fisioterapia"
locale: es
year: "2025"
role: "Full Stack Developer"
description: "Sistema SaaS de gestión de citas para clínicas de fisioterapia. Integrado con Google Calendar, notificaciones SMS vía Twilio y soporte PWA para reservas móviles."
problem: "Las clínicas de fisioterapia pequeñas gestionan citas por teléfono o WhatsApp, generando dobles reservas, olvidos de pacientes y pérdida de tiempo administrativo."
solution: "Desarrollé un sistema SaaS completo que automatiza la gestión de citas con sincronización bidireccional con Google Calendar, recordatorios SMS automáticos y una PWA que permite a los pacientes reservar desde el móvil."
results:
  - "Sincronización bidireccional con Google Calendar"
  - "Notificaciones SMS automáticas con Twilio"
  - "PWA instalable para reservas móviles"
  - "Panel admin con gestión completa de pacientes"
motivation: "Mi hermano es fisioterapeuta y fue el primer cliente. Mi idea es vender este sistema a otros profesionales y apoyar el comercio local con herramientas tecnológicas. También busco independizarme económicamente."
challenges: "Lo más complejo fue la integración con Google Calendar: permisos, ecosistema de Google y sistemas de prueba. La sincronización bidireccional me costó bastante. Con Twilio tuve problemas con números españoles, poco accesibles y más caros."
learnings: "Aprendí que el software para un negocio real necesita muchísimo testing, más del que puedo hacer solo. También que usar plataformas como Twilio y Supabase simplifica enormemente el trabajo."
context: "En producción con pocos pacientes (fase de pruebas). El cliente lo usa a diario."
tags: ["Next.js", "Prisma", "Supabase", "Twilio", "PWA"]
heroImage: "/projects/jr-fisioterapia/desktop.png"
gallery:
  - "/projects/jr-fisioterapia/mobile.png"
links:
  live: "https://jorgerueda-fisio.vercel.app"
order: 2
---

## El Reto

La clínica gestionaba todas las citas manualmente, con conflictos constantes de horarios y pacientes que olvidaban sus citas. Se necesitaba un sistema integral que funcionara tanto para el equipo como para los pacientes.

## La Solución

Construí una plataforma full-stack con Next.js que integra Google Calendar para sincronización de disponibilidad en tiempo real. Los pacientes reciben SMS automáticos de confirmación y recordatorio vía Twilio. La autenticación multi-rol permite gestión diferenciada para admin y pacientes.

## Detalles Técnicos

- **Frontend:** Next.js con App Router y componentes server-side
- **Base de datos:** Supabase + Prisma ORM para gestión de datos
- **Autenticación:** NextAuth con roles admin/paciente
- **Notificaciones:** Twilio para SMS automáticos
- **PWA:** Service worker para instalación en móvil y uso offline
