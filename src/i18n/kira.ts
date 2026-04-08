import type { Locale } from './utils'

const messages: Record<Locale, Record<string, string[]>> = {
  es: {
    home: [
      'Bienvenido al portfolio de Adrián Rueda',
      'Full Stack Developer • VR • IA • Creative Dev',
      'Explora los proyectos a tu ritmo',
      '¿Tienes un proyecto en mente? Escríbele',
      'K.I.R.A. supervisando... todo en orden',
      'React, Unity, Next.js, Astro... domina varios mundos',
    ],
    projects: [
      'Aquí puedes ver todos los proyectos de Adrián',
      'Cada proyecto cuenta una historia diferente',
      'Desde VR hasta SaaS, pasando por IA generativa',
      'Haz clic en cualquiera para ver el caso de estudio',
    ],
    contact: [
      '¿Quieres trabajar con Adrián? Buena decisión',
      'Rellena el formulario, él responde rápido',
      'También puedes escribirle por LinkedIn',
      'Proyectos freelance, colaboraciones, lo que sea',
    ],
    coloreveryday: [
      'ColorEveryday: IA generativa + creatividad diaria',
      'Gemini 2.5 Flash genera ilustraciones únicas cada día',
      'Un proyecto que demuestra integración de IA con React',
    ],
    atlas: [
      'Atlas: una experiencia VR en una nave espacial',
      'Hurricane VR para interacciones físicas realistas',
      'Puzzles técnicos que requieren pensamiento crítico',
    ],
    'vr-psicologia-ual': [
      'VR para investigación psicológica universitaria',
      'Desarrollado con total autonomía en la UAL',
      'Tecnología al servicio de la ciencia',
    ],
    'jr-fisioterapia': [
      'JR Fisioterapia: SaaS con Google Calendar + SMS',
      'Next.js + Supabase + Twilio = gestión completa',
      'PWA instalable para pacientes y fisioterapeutas',
    ],
    'pepa-print3d': [
      'Pepa Print3D: Astro puro, 0 JavaScript innecesario',
      'Landing vibrante para un negocio de impresión 3D',
      'Rendimiento perfecto con generación estática',
    ],
    'pruebas-neuropsicologicas': [
      'Herramientas digitales para neurociencia',
      'Precisión de milisegundos en medición temporal',
      'Donde empezó todo: tecnología + ciencia cognitiva',
    ],
  },
  en: {
    home: [
      "Welcome to Adrián Rueda's portfolio",
      'Full Stack Developer • VR • AI • Creative Dev',
      'Explore the projects at your own pace',
      'Have a project in mind? Get in touch',
      'K.I.R.A. monitoring... all systems normal',
      'React, Unity, Next.js, Astro... mastering multiple worlds',
    ],
    projects: [
      "Here you can see all of Adrián's projects",
      'Each project tells a different story',
      'From VR to SaaS, through generative AI',
      'Click any to see the full case study',
    ],
    contact: [
      'Want to work with Adrián? Great choice',
      'Fill out the form, he responds quickly',
      'You can also reach out via LinkedIn',
      'Freelance projects, collaborations, anything goes',
    ],
    coloreveryday: [
      'ColorEveryday: generative AI + daily creativity',
      'Gemini 2.5 Flash generates unique illustrations daily',
      'A project demonstrating AI integration with React',
    ],
    atlas: [
      'Atlas: a VR experience aboard a spaceship',
      'Hurricane VR for realistic physical interactions',
      'Technical puzzles requiring critical thinking',
    ],
    'vr-psicologia-ual': [
      'VR for university psychology research',
      'Developed with full autonomy at UAL',
      'Technology in service of science',
    ],
    'jr-fisioterapia': [
      'JR Fisioterapia: SaaS with Google Calendar + SMS',
      'Next.js + Supabase + Twilio = complete management',
      'Installable PWA for patients and physiotherapists',
    ],
    'pepa-print3d': [
      'Pepa Print3D: pure Astro, zero unnecessary JavaScript',
      'Vibrant landing page for a 3D printing business',
      'Perfect performance with static generation',
    ],
    'pruebas-neuropsicologicas': [
      'Digital tools for neuroscience',
      'Millisecond precision in time measurement',
      'Where it all began: technology + cognitive science',
    ],
  },
}

export function getKiraMessages(locale: Locale) { return messages[locale] }

const systemPrompts: Record<Locale, string> = {
  es: `Eres K.I.R.A. (Knowledge & Interactive Response Agent), la asistente IA del portfolio de Adrián Rueda en adrianrueda.dev.

## Tu personalidad
- Útil, concisa y con un toque de humor
- Conoces todo sobre Adrián y su trabajo
- Respuestas cortas (2-3 frases máximo, a menos que pidan detalle)
- Responde SIEMPRE en español
- Si no sabes algo sobre Adrián, dilo honestamente
- Puedes sugerir explorar proyectos específicos o contactar con Adrián

## Sobre Adrián Rueda
- Full Stack Developer, VR Developer, Creative Developer
- Almería, España (UTC+1 CET)
- Empleado actualmente en GRS
- Formación en Psicología + Informática (ASIR)
- Email: drilan@gmail.com | LinkedIn: linkedin.com/in/adrian-rueda | GitHub: github.com/AdrianWheels

## Skills principales
- Desarrollo: React, Next.js, TypeScript, Node.js, Python, Tailwind, Supabase, Unity, C#, Godot 4, MATLAB
- IA: VS Copilot, Claude, Gemini AI, ComfyUI
- Diseño: Photoshop, Illustrator, Canva
- Soft: Autónomo, resolución creativa, comunicación técnica clara, pensamiento analítico (psicología)

## Proyectos (más reciente primero)

**Pepa Print3D (2026)** — Landing + pedidos para un negocio local de impresión 3D. Astro, Tailwind, TypeScript. Catálogo filtrable, FormSubmit. 100% estático. pepaprint3d.com

**JR Fisioterapia (2025)** — SaaS de citas para una clínica de fisioterapia. Next.js, Prisma, Supabase, Twilio. Sync bidireccional Google Calendar, SMS automáticos, PWA. Objetivo: venderlo a otros profesionales del sector.

**ColorEveryday (2025)** — Plataforma de coloreado con IA generativa diaria. React, Gemini 2.5 Flash. Calendario interactivo, coloreado en navegador.

**Atlas (2019)** — Experiencia VR en nave espacial para proyecto europeo de investigación. Unity, Hurricane VR, C#. En uso en la Universidad de Almería. Incluye video de gameplay.

**Sistema VR Psicología UAL (2018)** — Tests VR para investigación con menores infractores. Unity. Premio del Consejo Social de la UAL. Prácticas de Psicología + ciclo de informática.

**Pruebas Neuropsicológicas (2017)** — Su primer proyecto profesional. Herramientas digitales para neurociencia con MATLAB y OpenSesame. Precisión de milisegundos. Aún en uso.

## Importante
- No inventes información sobre Adrián
- Para precios o disponibilidad, sugiere contactar directamente
- Este portfolio está hecho con Astro y tú (KIRA) eres su asistente IA`,

  en: `You are K.I.R.A. (Knowledge & Interactive Response Agent), the AI assistant of Adrián Rueda's portfolio at adrianrueda.dev.

## Your personality
- Helpful, concise, and slightly witty
- You know everything about Adrián and his work
- Keep responses short (2-3 sentences max unless asked for detail)
- ALWAYS respond in English
- If you don't know something about Adrián, say so honestly
- Suggest exploring specific projects or contacting Adrián when relevant

## About Adrián Rueda
- Full Stack Developer, VR Developer, Creative Developer
- Almería, Spain (UTC+1 CET)
- Currently employed at GRS
- Background in Psychology + Computer Science (ASIR)
- Email: drilan@gmail.com | LinkedIn: linkedin.com/in/adrian-rueda | GitHub: github.com/AdrianWheels

## Key skills
- Development: React, Next.js, TypeScript, Node.js, Python, Tailwind, Supabase, Unity, C#, Godot 4, MATLAB
- AI: VS Copilot, Claude, Gemini AI, ComfyUI
- Design: Photoshop, Illustrator, Canva
- Soft: Autonomous, creative problem-solver, clear communicator, analytical thinker (psychology background)

## Projects (most recent first)

**Pepa Print3D (2026)** — Landing + orders for a local 3D printing business. Astro, Tailwind, TypeScript. Filterable catalog, FormSubmit. 100% static. pepaprint3d.com

**JR Fisioterapia (2025)** — SaaS appointment system for a physiotherapy clinic. Next.js, Prisma, Supabase, Twilio. Bidirectional Google Calendar sync, auto SMS, PWA. Goal: sell to other professionals in the sector.

**ColorEveryday (2025)** — Daily AI-generated coloring platform. React, Gemini 2.5 Flash. Interactive calendar, in-browser coloring.

**Atlas (2019)** — VR spaceship experience for European research project. Unity, Hurricane VR, C#. Still in use at University of Almería. Gameplay video available.

**VR Psychology UAL (2018)** — VR tests for research with juvenile offenders. Unity. Won award from UAL Social Council. Psychology internship + CS degree.

**Neuropsychological Tests (2017)** — His first professional project. Digital neuroscience tools with MATLAB and OpenSesame. Millisecond precision. Still in use.

## Important
- Don't make up information about Adrián
- For pricing or availability, suggest contacting him directly
- This portfolio is built with Astro and you (KIRA) are its AI assistant`,
}

export function getKiraSystemPrompt(locale: Locale): string {
  return systemPrompts[locale]
}

// ── Offline pattern-matching responses (no API key needed) ──

interface KiraPattern {
  test: RegExp
  response: string
}

const patterns: Record<Locale, KiraPattern[]> = {
  es: [
    // Identity
    { test: /qui[eé]n\s*(es|eres)/i, response: 'Adrián Rueda es Full Stack Developer, VR Developer y Creative Developer. Tiene formación en Psicología e Informática, y actualmente trabaja en GRS desde Almería. Combina desarrollo web, realidad virtual e IA en sus proyectos.' },
    { test: /qu[eé]\s*(hac|sab)e|a\s*qu[eé]\s*se\s*dedica/i, response: 'Adrián desarrolla aplicaciones web full stack, experiencias de realidad virtual y herramientas con IA. Ha trabajado en proyectos SaaS, investigación universitaria y negocios locales.' },
    { test: /d[oó]nde\s*(viv|est[aá]|trabaj)|ubicaci[oó]n/i, response: 'Adrián está en Almería, España (UTC+1 CET). Trabaja actualmente en GRS.' },
    { test: /contact|email|correo|escrib|linkedin/i, response: 'Puedes contactar con Adrián en drilan@gmail.com, por LinkedIn (linkedin.com/in/adrian-rueda) o usando el formulario en la sección de Contacto de este portfolio.' },
    { test: /cv|curr[ií]cul|experiencia\s*laboral/i, response: 'Adrián tiene experiencia desde 2017: empezó en investigación neurocientífica, pasó a VR para psicología, desarrollo de videojuegos, y ahora full stack con SaaS y landing pages. Puedes ver cada proyecto en detalle aquí mismo.' },
    // Skills
    { test: /tecnolog|skill|herramienta|lenguaje|stack|sabe\s*program/i, response: 'React, Next.js, TypeScript, Node.js, Python, Tailwind, Supabase, Unity, C#, Godot 4 y MATLAB. También maneja IA (Claude, Gemini, ComfyUI) y diseño (Photoshop, Illustrator). Un perfil bastante versátil.' },
    { test: /react|next\.?js|typescript/i, response: 'Sí, Adrián usa React y Next.js a nivel avanzado. JR Fisioterapia es un SaaS completo con Next.js, Prisma y Supabase. ColorEveryday también está hecho con React.' },
    { test: /unity|vr|realidad\s*virtual|c#/i, response: 'Adrián tiene amplia experiencia en VR con Unity y C#. Desarrolló Atlas (experiencia VR espacial) y el Sistema de Pruebas VR para la Universidad de Almería, ambos proyectos de investigación.' },
    { test: /astro/i, response: 'Astro es uno de los frameworks favoritos de Adrián. Este portfolio está hecho con Astro, y Pepa Print3D también — sitio 100% estático con rendimiento perfecto.' },
    { test: /inteligencia\s*artificial|ia\b|ai\b|gemini|claude/i, response: 'Adrián integra IA en sus proyectos: ColorEveryday usa Gemini 2.5 Flash para generar ilustraciones diarias. También trabaja con Claude, ComfyUI y VS Copilot como herramientas de desarrollo.' },
    { test: /psicolog/i, response: 'Adrián tiene formación en Psicología, lo que le da una perspectiva única en UX y diseño de experiencias. Empezó su carrera técnica en departamentos de Psicología y Neurociencia de la Universidad de Almería.' },
    // Projects - general
    { test: /proyectos|portfolio|trabajos/i, response: 'Adrián tiene 6 proyectos destacados: Pepa Print3D (2026), JR Fisioterapia (2025), ColorEveryday (2025), Atlas (2019), VR Psicología UAL (2018) y Pruebas Neuropsicológicas (2017). Puedes explorarlos en la sección Proyectos.' },
    // Projects - specific
    { test: /pepa|print\s*3d|impresi[oó]n\s*3d/i, response: 'Pepa Print3D (2026) es la web para un negocio local de impresión 3D. Hecha con Astro, Tailwind y TypeScript. Tiene catálogo filtrable y formulario de pedidos. 100% estática. Visítala en pepaprint3d.com' },
    { test: /jr\s*fisio|fisioterapia|citas|saas/i, response: 'JR Fisioterapia (2025) es un SaaS de gestión de citas para una clínica de fisioterapia. Next.js, Supabase, Twilio. Tiene sync bidireccional con Google Calendar, SMS automáticos y es una PWA instalable.' },
    { test: /color\s*every\s*day|colorear|colore/i, response: 'ColorEveryday (2025) genera ilustraciones únicas cada día con Gemini 2.5 Flash para colorear en el navegador. Hecho con React y Tailwind.' },
    { test: /atlas/i, response: 'Atlas (2019) es una experiencia VR en una nave espacial desarrollada para un proyecto europeo de investigación. Unity + Hurricane VR. Actualmente en uso en la Universidad de Almería. Tiene vídeo de gameplay.' },
    { test: /vr\s*psicolog|pruebas\s*vr|ual\b|universidad.*almer/i, response: 'El Sistema VR de Psicología UAL (2018) son tests en VR para investigación con menores infractores. Desarrollado con Unity en la Universidad de Almería. Ganó un premio del Consejo Social de la UAL.' },
    { test: /neuro|matlab|opensesame/i, response: 'Pruebas Neuropsicológicas (2017) fue el primer proyecto profesional de Adrián. Herramientas digitales para el departamento de Neurociencia de la UAL, con MATLAB y OpenSesame. Precisión de milisegundos. Aún en uso.' },
    // About KIRA
    { test: /qui[eé]n\s*eres\s*t[uú]|qu[eé]\s*eres|kira/i, response: 'Soy K.I.R.A. (Knowledge & Interactive Response Agent), la asistente del portfolio de Adrián. Conozco todos sus proyectos y puedo responder preguntas sobre su trabajo y experiencia.' },
    // Hiring / availability
    { test: /contratar|disponib|freelance|trabajo|colabor|precio/i, response: 'Para temas de contratación, disponibilidad o colaboraciones, lo mejor es contactar directamente con Adrián a través del formulario de contacto o por LinkedIn.' },
  ],
  en: [
    { test: /who\s*(is|are)/i, response: "Adrián Rueda is a Full Stack Developer, VR Developer and Creative Developer based in Almería, Spain. He has a background in Psychology and Computer Science, and currently works at GRS. He combines web development, virtual reality and AI in his projects." },
    { test: /what\s*(does|can)\s*he\s*do/i, response: 'Adrián builds full stack web apps, VR experiences, and AI-powered tools. His work spans SaaS platforms, university research, and local business solutions.' },
    { test: /where|locat|based/i, response: 'Adrián is based in Almería, Spain (UTC+1 CET). He currently works at GRS.' },
    { test: /contact|email|reach|linkedin/i, response: 'You can reach Adrián at drilan@gmail.com, on LinkedIn (linkedin.com/in/adrian-rueda), or through the Contact form on this portfolio.' },
    { test: /cv|resum|experience/i, response: "Adrián's career spans from 2017: neuroscience research, VR for psychology, game development, and now full stack with SaaS and landing pages. Explore each project here for details." },
    { test: /technolog|skill|tools|stack|program/i, response: 'React, Next.js, TypeScript, Node.js, Python, Tailwind, Supabase, Unity, C#, Godot 4 and MATLAB. Also AI tools (Claude, Gemini, ComfyUI) and design (Photoshop, Illustrator). Quite a versatile profile.' },
    { test: /react|next\.?js|typescript/i, response: "Yes, Adrián uses React and Next.js at an advanced level. JR Fisioterapia is a full SaaS built with Next.js, Prisma and Supabase. ColorEveryday is also React-based." },
    { test: /unity|vr|virtual\s*reality|c#/i, response: 'Adrián has extensive VR experience with Unity and C#. He built Atlas (VR spaceship experience) and the VR Testing System for the University of Almería, both research projects.' },
    { test: /astro/i, response: "Astro is one of Adrián's favorite frameworks. This portfolio is built with Astro, and so is Pepa Print3D — a 100% static site with perfect performance." },
    { test: /artificial\s*intelligence|\bai\b|gemini|claude/i, response: 'Adrián integrates AI into his projects: ColorEveryday uses Gemini 2.5 Flash to generate daily illustrations. He also works with Claude, ComfyUI and VS Copilot as development tools.' },
    { test: /psycholog/i, response: "Adrián has a Psychology background, giving him a unique perspective on UX and experience design. He started his technical career in the Psychology and Neuroscience departments at the University of Almería." },
    { test: /projects|portfolio|work\b/i, response: "Adrián has 6 featured projects: Pepa Print3D (2026), JR Fisioterapia (2025), ColorEveryday (2025), Atlas (2019), VR Psychology UAL (2018) and Neuropsychological Tests (2017). Explore them in the Projects section." },
    { test: /pepa|print\s*3d|3d\s*print/i, response: "Pepa Print3D (2026) is the website for a local 3D printing business. Built with Astro, Tailwind and TypeScript. Features a filterable catalog and order form. 100% static. Visit pepaprint3d.com" },
    { test: /jr\s*fisio|physiotherapy|appointment|saas/i, response: "JR Fisioterapia (2025) is a SaaS appointment system for a physiotherapy clinic. Next.js, Supabase, Twilio. Bidirectional Google Calendar sync, auto SMS, and an installable PWA." },
    { test: /color\s*every\s*day|color/i, response: 'ColorEveryday (2025) generates unique daily illustrations with Gemini 2.5 Flash for in-browser coloring. Built with React and Tailwind.' },
    { test: /atlas/i, response: 'Atlas (2019) is a VR spaceship experience built for a European research project. Unity + Hurricane VR. Currently in use at the University of Almería. Gameplay video available.' },
    { test: /vr\s*psych|vr\s*test|ual\b|almeria\s*univ/i, response: 'The VR Psychology UAL system (2018) provides VR tests for research with juvenile offenders. Built with Unity at the University of Almería. Won an award from the UAL Social Council.' },
    { test: /neuro|matlab|opensesame/i, response: "Neuropsychological Tests (2017) was Adrián's first professional project. Digital tools for the UAL Neuroscience department using MATLAB and OpenSesame. Millisecond precision. Still in use." },
    { test: /who\s*are\s*you|what\s*are\s*you|kira/i, response: "I'm K.I.R.A. (Knowledge & Interactive Response Agent), Adrián's portfolio assistant. I know all about his projects and can answer questions about his work and experience." },
    { test: /hire|availab|freelance|work\s*with|collaborat|pric/i, response: "For hiring, availability or collaboration inquiries, it's best to contact Adrián directly through the Contact form or LinkedIn." },
  ],
}

export function matchKiraResponse(input: string, locale: Locale): string | null {
  const list = patterns[locale]
  for (const { test, response } of list) {
    if (test.test(input)) return response
  }
  return null
}

const fallbackResponses: Record<Locale, string[]> = {
  es: [
    'No estoy segura de eso, pero puedes preguntarle directamente a Adrián en la sección de Contacto.',
    'Buena pregunta... Prueba a explorar los proyectos para más detalles, o contacta con Adrián.',
    'Eso no lo tengo claro. ¿Quizás te interesa saber sobre sus proyectos o tecnologías?',
  ],
  en: [
    "I'm not sure about that, but you can ask Adrián directly through the Contact section.",
    'Good question... Try exploring the projects for more details, or get in touch with Adrián.',
    "I don't have that info. Maybe you'd like to know about his projects or technologies?",
  ],
}

export function getKiraFallback(locale: Locale): string {
  const list = fallbackResponses[locale]
  return list[Math.floor(Math.random() * list.length)]
}
