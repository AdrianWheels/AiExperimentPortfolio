import type { Locale } from './utils'

export const profileBase = {
  name: "Adrián Rueda Fernández",
  alias: "drilan",
  contact: {
    email: "drilan@gmail.com",
    // FormSubmit hash for the contact form (hides the naked email from scrapers).
    formSubmitId: "deb7f72640bee6e2dc2ab04bf922c1bd",
    portfolio: "https://adrianrueda.dev",
    phone: "+34 691 664 913",
    timeZone: "UTC+1 (CET)",
  },
  social: [
    { label: "LinkedIn", url: "https://www.linkedin.com/in/adrian-rueda/" },
    { label: "GitHub", url: "https://github.com/AdrianWheels" },
  ],
} as const

const i18n = {
  es: {
    tagline: "Desarrollador multiplataforma creativo",
    summary: "Buscando nuevos retos y experimentos locos. Especializado en crear experiencias digitales únicas que rompen la norma.",
    location: "Almería, España",
    availability: "Empleado en GRS — Abierto a proyectos freelance",
    highlights: [
      { title: "Game Dev & Realidad Virtual", description: "Desarrollo de videojuegos con Godot 4 y experiencias VR inmersivas con Unity y C# para aplicaciones científicas y artísticas." },
      { title: "Full Stack & SaaS", description: "Aplicaciones web completas con Next.js, React, Supabase y Prisma. Desde gestión de citas hasta plataformas de flotas." },
      { title: "Neurociencia & IA Aplicada", description: "Integración de IA generativa (Gemini, Claude) en productos y herramientas de investigación cognitiva." },
    ],
  },
  en: {
    tagline: "Creative multiplatform developer",
    summary: "Seeking new challenges and wild experiments. Specialized in crafting unique digital experiences that break the mold.",
    location: "Almería, Spain",
    availability: "Employed at GRS — Open to freelance projects",
    highlights: [
      { title: "Game Dev & Virtual Reality", description: "Video game development with Godot 4 and immersive VR experiences with Unity and C# for scientific and artistic applications." },
      { title: "Full Stack & SaaS", description: "Complete web applications with Next.js, React, Supabase, and Prisma. From appointment management to fleet platforms." },
      { title: "Neuroscience & Applied AI", description: "Integration of generative AI (Gemini, Claude) in products and cognitive research tools." },
    ],
  },
} as const

export function getProfile(locale: Locale) {
  return { ...profileBase, ...i18n[locale] }
}
