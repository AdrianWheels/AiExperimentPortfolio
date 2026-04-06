---
title: "ColorEveryday"
locale: en
baseSlug: "coloreveryday"
year: "2025"
role: "Full Stack Developer"
description: "Interactive web platform that generates unique AI-powered illustrations daily (Gemini 2.5 Flash) for coloring. A creative digital calendar built with React and Tailwind."
problem: "Users seek daily creative activities but lack a constant source of inspiration. Existing coloring apps offer static, repetitive designs."
solution: "I built a platform that uses Gemini 2.5 Flash to generate unique illustrations every day, presented in an interactive calendar. Users can color directly in the browser through an intuitive React-based interface."
results:
  - "Automatic daily AI-generated illustrations"
  - "Interactive in-browser coloring interface"
  - "Visual calendar with creation history"
  - "Direct integration with the Gemini 2.5 Flash API"
motivation: "I wanted to explore generative AI for images and thought combining coloring drawings with the web was a great idea. My wife is an artist and inspires me to create things related to art."
challenges: "The biggest challenge was building the entire system without a database, though I eventually added one for monetization. Keeping everything free and functional was harder than expected."
learnings: "I learned a lot about AI image generation and alternatives to conventional databases. Today I'd design it with the database and premium model in mind from day one."
context: "Solo project, actively in development with 2-3 months of part-time work. 9 registered users; those who visit tend to stay for a long time."
tags: ["React", "Tailwind", "Gemini 2.5 Flash", "AI"]
heroImage: "/projects/coloreverday/coloreveryday.png"
gallery:
  - "/projects/coloreverday/coloreveryday-calendar.png"
order: 3
---

## The Challenge

Create a digital coloring experience that feels fresh every day, avoiding the monotony of traditional apps that rely on static design libraries.

## The Solution

I integrated Gemini 2.5 Flash as the generative engine to create unique daily illustrations. The architecture combines React for the interactive coloring interface with a calendar system that maintains the user's creation history.

## Technical Details

- **Frontend:** React with Tailwind for a responsive and fluid UI
- **Generative AI:** Gemini 2.5 Flash for prompt and illustration generation
- **Interactivity:** Canvas API for real-time coloring
- **Persistence:** Local storage for creation history
