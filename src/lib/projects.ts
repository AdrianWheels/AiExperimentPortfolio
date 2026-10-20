import { getCollection, type CollectionEntry } from 'astro:content'
import { getLocalizedUrl, type Locale } from '../i18n'

export type Project = CollectionEntry<'projects'> & { base: string; url: string | null }

/** Proyectos del idioma, ordenados por `order`, con su slug base y su URL (null si no tiene ficha). */
export async function getProjects(locale: Locale): Promise<Project[]> {
  const all = await getCollection('projects', (p) => p.data.locale === locale)
  return all
    .sort((a, b) => a.data.order - b.data.order)
    .map((p) => {
      const base = p.slug.replace(/-en$/, '')
      return { ...p, base, url: p.data.detail ? getLocalizedUrl(locale, `/projects/${base}`) : null }
    })
}

export const byKind = (list: Project[], kind: 'game' | 'client' | 'own') => list.filter((p) => p.data.kind === kind)
