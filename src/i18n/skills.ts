import type { Locale } from './utils'

// Tecnologías agrupadas por lo que ofrezco (los nombres no se traducen).
const groups = [
  { es: 'Web y apps', en: 'Web and apps', items: ['Next.js', 'React', 'Astro', 'TypeScript', 'Node.js', 'Supabase', 'Prisma', 'Tailwind', 'PWA', 'Twilio'] },
  { es: 'Juegos', en: 'Games', items: ['Godot', 'GDScript', 'Unity', 'C#', 'Three.js', 'Realidad virtual', 'Blender', 'Remotion'] },
  { es: 'IA y datos', en: 'AI and data', items: ['Python', 'ComfyUI', 'Whisper', 'LightGBM', 'Claude', 'Gemini', 'Ignition SCADA', 'MATLAB'] },
] as const

export function getSkillGroups(locale: Locale): { title: string; items: string[] }[] {
  return groups.map((g) => ({
    title: g[locale],
    items: g.items.map((i) => (locale === 'en' && i === 'Realidad virtual' ? 'Virtual reality' : i)),
  }))
}
