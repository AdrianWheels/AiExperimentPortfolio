import { defineCollection, z } from 'astro:content'

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    year: z.string(),
    role: z.string(),
    description: z.string(),
    problem: z.string(),
    solution: z.string(),
    results: z.array(z.string()),
    tags: z.array(z.string()),
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
    locale: z.enum(['es', 'en']).default('es'),
    baseSlug: z.string().optional(),
  }),
})

export const collections = { projects }
