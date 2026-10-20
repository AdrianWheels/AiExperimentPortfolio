// Comprobación estática de una build del sitio (por defecto .check-dist).
// Uso: npx astro build --outDir .check-dist && node tools/check-site.mjs
// Sale con código 1 si falla alguna comprobación.
// og-image.png se permite: las vistas previas de redes sociales no siempre aceptan WebP.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const dir = process.argv[2] || '.check-dist'
const results = []
const check = (name, ok, detail = '') => results.push({ name, ok, detail })

function walk(d, out = []) {
  for (const f of readdirSync(d)) {
    const p = join(d, f)
    if (statSync(p).isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}
const read = (p) => readFileSync(join(dir, p), 'utf8')

if (!existsSync(dir)) {
  console.error(`No existe ${dir}. Construye antes: npx astro build --outDir ${dir}`)
  process.exit(1)
}
const files = walk(dir)
const htmls = files.filter((f) => f.endsWith('.html'))

const PAGES = ['index.html', 'en/index.html', 'projects/index.html', 'en/projects/index.html',
  'sobre-mi/index.html', 'en/about/index.html', 'contacto/index.html', 'en/contact/index.html']
const missing = PAGES.filter((p) => !existsSync(join(dir, p)))
check('existen todas las páginas', missing.length === 0, missing.join(', '))

const stale = []
const kira = []
for (const f of htmls) {
  const html = readFileSync(f, 'utf8')
  if (/Employed|Empleado en GRS|Presente|\bPresent\b/.test(html)) stale.push(relative(dir, f))
  if (/kira/i.test(html)) kira.push(relative(dir, f))
}
check('sin «Employed» ni «Presente» en la trayectoria', stale.length === 0, stale.slice(0, 5).join(', '))
check('sin rastro de Kira', kira.length === 0, kira.slice(0, 5).join(', '))

check('sin la página de María', !existsSync(join(dir, 'para-maria')))
check('sin las imágenes de Kira', !existsSync(join(dir, 'kira_images')))

const ALLOWED = /(favicon-\d+\.png|apple-touch-icon\.png|icon-512\.png|og-image\.png)$/
const raster = []
for (const f of htmls) {
  const html = readFileSync(f, 'utf8')
  for (const m of html.matchAll(/(?:src|href|srcset|content)=["']([^"']+\.(?:png|jpe?g))(?:\?[^"']*)?["']|url\(([^)]+\.(?:png|jpe?g))\)/gi)) {
    const url = (m[1] || m[2]).trim()
    if (!ALLOWED.test(url)) raster.push(`${relative(dir, f)} → ${url}`)
  }
}
check('las imágenes son WebP (salvo favicons)', raster.length === 0, raster.slice(0, 5).join(' | '))

const home = existsSync(join(dir, 'index.html')) ? read('index.html') : ''
check('la portada enlaza /favicon.svg', /<link[^>]+href=["']\/favicon\.svg["']/.test(home))
const tiles = (home.match(/data-tile/g) || []).length
check('la portada tiene 4 cajas', tiles === 4, `encontradas ${tiles}`)

const GAMES = ['atlas', 'brisca', 'survivortd']
const LEAKS = ['El Reto', 'La Solución', 'Resultados', 'The Challenge', 'The Solution', 'Results', 'tag-tech']
const leaks = []
for (const g of GAMES) {
  for (const base of ['projects', 'en/projects']) {
    const p = join(dir, base, g, 'index.html')
    if (!existsSync(p)) { leaks.push(`${base}/${g} no existe`); continue }
    const html = readFileSync(p, 'utf8')
    for (const l of LEAKS) if (html.includes(l)) leaks.push(`${base}/${g}: ${l}`)
  }
}
check('las fichas de juego no cuentan cómo están hechos', leaks.length === 0, leaks.slice(0, 6).join(' | '))

const undef = htmls.filter((f) => /href=["']undefined["']/.test(readFileSync(f, 'utf8'))).map((f) => relative(dir, f))
check('ningún enlace a «undefined»', undef.length === 0, undef.join(', '))

let failed = 0
for (const r of results) {
  if (!r.ok) failed++
  console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.ok || !r.detail ? '' : `  (${r.detail})`}`)
}
console.log(`\n${results.length - failed}/${results.length} comprobaciones pasan`)
process.exit(failed ? 1 : 0)
