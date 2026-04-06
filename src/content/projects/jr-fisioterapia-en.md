---
title: "JR Fisioterapia"
locale: en
baseSlug: "jr-fisioterapia"
year: "2025"
role: "Full Stack Developer"
description: "SaaS appointment management system for physiotherapy clinics. Features Google Calendar integration, SMS notifications via Twilio, and PWA support for mobile bookings."
problem: "Small physiotherapy clinics manage appointments by phone or WhatsApp, leading to double bookings, missed appointments, and wasted administrative time."
solution: "I developed a full SaaS system that automates appointment management with bidirectional Google Calendar sync, automatic SMS reminders, and a PWA that lets patients book from their phones."
results:
  - "Bidirectional Google Calendar synchronization"
  - "Automatic SMS notifications with Twilio"
  - "Installable PWA for mobile bookings"
  - "Admin panel with full patient management"
motivation: "My brother is a physiotherapist and was the first client. My goal is to sell this system to other professionals and support local businesses with tech tools. I'm also looking for financial independence."
challenges: "The most complex part was Google Calendar integration: permissions, Google's ecosystem, and test environments. Bidirectional sync was really challenging. With Twilio I had issues with Spanish phone numbers — barely accessible and more expensive."
learnings: "I learned that software for a real business needs far more testing than I can do alone. Also that platforms like Twilio and Supabase massively simplify the work."
context: "In production with a small number of patients (testing phase). The client uses it daily."
tags: ["Next.js", "Prisma", "Supabase", "Twilio", "PWA"]
heroImage: "/projects/jr-fisioterapia/desktop.png"
gallery:
  - "/projects/jr-fisioterapia/mobile.png"
links:
  live: "https://jorgerueda-fisio.vercel.app"
order: 2
---

## The Challenge

The clinic managed all appointments manually, with constant scheduling conflicts and patients forgetting their visits. They needed a comprehensive system that worked for both the staff and the patients.

## The Solution

I built a full-stack platform with Next.js that integrates Google Calendar for real-time availability sync. Patients receive automatic confirmation and reminder SMS messages via Twilio. Multi-role authentication enables differentiated management for admins and patients.

## Technical Details

- **Frontend:** Next.js with App Router and server-side components
- **Database:** Supabase + Prisma ORM for data management
- **Authentication:** NextAuth with admin/patient roles
- **Notifications:** Twilio for automatic SMS
- **PWA:** Service worker for mobile installation and offline use
