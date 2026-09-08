import type { Locale } from './utils'

// Skill labels are the same in both languages (tech names)
export const coreSkills = [
  { name: "Desarrollo", nameEn: "Development", items: [
    "React", "Next.js", "TypeScript", "Node.js", "Python", "Tailwind",
    "Supabase", "Godot 4", "C#", "Unity", "Ignition Automation", "MATLAB",
  ]},
  { name: "IA & Herramientas", nameEn: "AI & Tools", items: [
    "VS Copilot", "Claude", "Gemini AI", "ComfyUI", "GitHub",
  ]},
  { name: "Diseño", nameEn: "Design", items: [
    "Canva", "Adobe Photoshop", "Adobe Illustrator",
  ]},
]

const i18n = {
  es: {
    soft: [
      "Autonomía y autogestión",
      "Resolución creativa de problemas",
      "Comunicación técnica clara",
      "Adaptabilidad tecnológica",
      "Pensamiento analítico (formación en psicología)",
    ],
  },
  en: {
    soft: [
      "Self-management & autonomy",
      "Creative problem-solving",
      "Clear technical communication",
      "Technology adaptability",
      "Analytical thinking (psychology background)",
    ],
  },
} as const

export function getSoftSkills(locale: Locale) { return i18n[locale].soft }
export function getCategoryName(category: typeof coreSkills[number], locale: Locale) {
  return locale === 'en' ? category.nameEn : category.name
}
