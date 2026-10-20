# adrianrueda.dev

Portfolio personal de Adrián Rueda. Astro 5 con islas de React, Tailwind y
contenido en Markdown. Bilingüe: español en la raíz, inglés bajo `/en`.

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:4321
```

## Despliegue — importante

El sitio se sirve con **GitHub Pages desde la carpeta `docs/` de la rama
`main`**, con dominio propio (`docs/CNAME`). **No hay CI que construya nada**:
`docs/` es un artefacto que se genera en local y se commitea a mano.

```bash
npm run build    # escribe en docs/  (outDir en astro.config.mjs)
git add docs
git commit -m "..."
git push origin main
```

Un push sin `npm run build` previo no cambia la web publicada.

## Estructura

| Ruta | Qué es |
|---|---|
| `src/pages/` | routing por ficheros; son envoltorios de 3 líneas |
| `src/page-views/` | el markup real, compartido entre ES e EN |
| `src/layouts/BaseLayout.astro` | head, SEO, hreflang, intro de marca, cabecera y pie comunes |
| `src/lib/projects.ts` | lee las fichas por idioma y las separa por tipo |
| `public/intro/aw-intro.js` | la intro animada AW (una vez por sesión; `?intro=1` la fuerza) |
| `design/` | especificación, plan y boceto del rediseño de octubre de 2026 |
| `tools/` | `check-site.mjs` (comprobación de la build) y `to-webp.mjs` (imágenes a WebP) |
| `src/content/projects/` | una ficha `.md` por proyecto e idioma (`brisca.md`, `brisca-en.md`) |
| `src/i18n/` | textos y datos; nada de cadenas sueltas en las vistas |
| `public/` | se copia tal cual a la raíz del sitio |
| `docs/` | salida del build **y** lo que Pages publica |

Añadir un proyecto es crear su `.md` en `src/content/projects/` siguiendo el
esquema de `src/content/config.ts`, más su par `-en.md`. El campo `kind` decide
la plantilla:

- `game`: escaparate. Imagen o vídeo (`loop`), `hook`, `genre`, `platform` y
  `cta`. **No** se cuenta cómo está hecho el juego. `detail: false` lo deja sin
  ficha (Arcanist hasta que tenga página de Steam).
- `client`: caso de cliente con reto, solución y resultados.
- `own`: proyecto propio con la misma plantilla que un cliente.

Las imágenes van en WebP: suelta los PNG o JPG en `public/` y ejecuta
`node tools/to-webp.mjs`, que los convierte y reescribe las rutas.

## Comprobar antes de publicar

```bash
npx astro build --outDir .check-dist
node tools/check-site.mjs
```

Comprueba que están todas las páginas, que las imágenes son WebP, que las fichas
de juego no enseñan cómo están hechos y que la portada tiene sus cuatro cajas.
