import { ui, type UIKey } from './ui'

export type Locale = 'es' | 'en'
export const defaultLocale: Locale = 'es'
export const locales: Locale[] = ['es', 'en']

export function getLocaleFromUrl(url: URL): Locale {
  const [, maybeLang] = url.pathname.split('/')
  if (locales.includes(maybeLang as Locale)) return maybeLang as Locale
  return defaultLocale
}

export function t(locale: Locale, key: UIKey): string {
  return ui[locale]?.[key] ?? ui[defaultLocale][key]
}

// Rutas que cambian de nombre según el idioma (la clave es la ruta española).
const ROUTES_EN: Record<string, string> = { '/contacto': '/contact', '/sobre-mi': '/about' }
const ROUTES_ES: Record<string, string> = Object.fromEntries(Object.entries(ROUTES_EN).map(([es, en]) => [en, es]))

function translatePath(path: string, table: Record<string, string>): string {
  const slash = path.length > 1 && path.endsWith('/')
  const bare = slash ? path.slice(0, -1) : path
  const hit = table[bare]
  return hit ? hit + (slash ? '/' : '') : path
}

/** Ruta española (base) → ruta en `locale`. Acepta también rutas inglesas sin prefijo. */
export function getLocalizedUrl(locale: Locale, path: string): string {
  const base = translatePath(path, ROUTES_ES)
  if (locale === defaultLocale) return base
  const en = translatePath(base, ROUTES_EN)
  return `/${locale}${en === '/' ? '' : en}`
}

/** Quita el prefijo de idioma y devuelve la ruta española equivalente. */
export function stripLocalePrefix(path: string): string {
  for (const loc of locales) {
    if (path.startsWith(`/${loc}/`)) return translatePath(path.slice(loc.length + 1), ROUTES_ES)
    if (path === `/${loc}`) return '/'
  }
  return path
}

export function getContactUrl(locale: Locale): string {
  return getLocalizedUrl(locale, '/contacto')
}

export function getAlternateLocaleUrl(locale: Locale, path: string): string {
  const otherLocale: Locale = locale === 'es' ? 'en' : 'es'
  const basePath = stripLocalePrefix(path)
  return getLocalizedUrl(otherLocale, basePath)
}
