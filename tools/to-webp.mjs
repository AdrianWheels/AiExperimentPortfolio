// Pasa las imágenes de public/ a WebP y reescribe sus rutas en src/.
// Uso: node tools/to-webp.mjs
// - Ancho máximo 1600 px, calidad 82. Borra el original.
// - Deja en paz los favicons, la og-image y la intro.
import { readdirSync, statSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs'
import { join, relative, extname } from 'node:path'
import sharp from 'sharp'

const SKIP = /(^|\/)(favicon[^/]*|apple-touch-icon\.png|icon-512\.png|og-image\.png)$|^intro\//
const RASTER = /\.(png|jpe?g)$/i

function walk(d, out = []) {
  for (const f of readdirSync(d)) {
    const p = join(d, f)
    if (statSync(p).isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

const renames = []
for (const file of walk('public')) {
  const rel = relative('public', file).replaceAll('\\', '/')
  if (!RASTER.test(rel) || SKIP.test(rel)) continue
  const out = file.slice(0, -extname(file).length) + '.webp'
  await sharp(file).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 82 }).toFile(out)
  const before = statSync(file).size, after = statSync(out).size
  unlinkSync(file)
  renames.push(['/' + rel, '/' + rel.slice(0, -extname(rel).length) + '.webp'])
  console.log(`${rel}  ${(before / 1024).toFixed(0)} KB → ${(after / 1024).toFixed(0)} KB`)
}

let touched = 0
for (const file of walk('src').filter((f) => /\.(astro|ts|tsx|jsx|md|mdx|css)$/.test(f))) {
  const text = readFileSync(file, 'utf8')
  let next = text
  for (const [from, to] of renames) next = next.split(from).join(to)
  if (next !== text) { writeFileSync(file, next); touched++ }
}
console.log(`\n${renames.length} imágenes convertidas, ${touched} ficheros de src/ actualizados`)
