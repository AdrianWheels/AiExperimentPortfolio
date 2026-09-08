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
| `src/layouts/BaseLayout.astro` | head, SEO, hreflang, fondo de estrellas y el chatbot Kira |
| `src/content/projects/` | una ficha `.md` por proyecto e idioma (`brisca.md`, `brisca-en.md`) |
| `src/i18n/` | textos y datos; nada de cadenas sueltas en las vistas |
| `public/` | se copia tal cual a la raíz del sitio |
| `docs/` | salida del build **y** lo que Pages publica |

Añadir un proyecto es crear su `.md` en `src/content/projects/` siguiendo el
esquema de `src/content/config.ts`, más su par `-en.md`.

## Kira

El chatbot del portfolio. Usa Groq con streaming y cae a respuestas por
patrones si no hay clave. La variable es `PUBLIC_GROQ_API_KEY` y, por llevar
el prefijo `PUBLIC_`, **acaba en el bundle del cliente y es visible**: no
pongas ahí una clave que te importe.
