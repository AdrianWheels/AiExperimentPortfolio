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

export function getLocalizedUrl(locale: Locale, path: string): string {
  if (locale === defaultLocale) return path
  return `/${locale}${path === '/' ? '' : path}`
}

export function stripLocalePrefix(path: string): string {
  for (const loc of locales) {
    if (path.startsWith(`/${loc}/`)) return path.slice(loc.length + 1)
    if (path === `/${loc}`) return '/'
  }
  return path
}

export function getContactUrl(locale: Locale): string {
  return getLocalizedUrl(locale, locale === 'es' ? '/contacto' : '/contact')
}

export function getAlternateLocaleUrl(locale: Locale, path: string): string {
  const otherLocale: Locale = locale === 'es' ? 'en' : 'es'
  const basePath = stripLocalePrefix(path)
  return getLocalizedUrl(otherLocale, basePath)
}
