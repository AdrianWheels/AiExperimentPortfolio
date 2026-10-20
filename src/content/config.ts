import { defineCollection, z } from 'astro:content'

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    year: z.string(),
    role: z.string(),
    description: z.string(),
    problem: z.string().optional(),
    solution: z.string().optional(),
    results: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    // game = escaparate (sin contar cómo está hecho); client = caso de cliente; own = proyecto propio.
    kind: z.enum(['game', 'client', 'own']).default('client'),
    hook: z.string().optional(),
    genre: z.string().optional(),
    platform: z.string().optional(),
    cta: z.object({ label: z.string(), url: z.string().optional() }).optional(),
    credit: z.string().optional(),
    // Vídeo corto en bucle, sin audio (WebM), para la tarjeta del juego.
    loop: z.string().optional(),
    // false = sin página de detalle (p. ej. Arcanist hasta que tenga arte y Steam).
    detail: z.boolean().default(true),
    heroImage: z.string(),
    gallery: z.array(z.string()).optional(),
    links: z.object({
      live: z.string().optional(),
      github: z.string().optional(),
      video: z.string().optional(),
    }).optional(),
    motivation: z.string().optional(),
    challenges: z.string().optional(),
    learnings: z.string().optional(),
    context: z.string().optional(),
    order: z.number(),
    tier: z.enum(['featured', 'more']).default('featured'),
    locale: z.enum(['es', 'en']).default('es'),
    baseSlug: z.string().optional(),
  }),
})

export const collections = { projects }
