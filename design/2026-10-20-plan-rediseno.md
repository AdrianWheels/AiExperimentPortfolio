# Rediseño del portfolio · plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rehacer adrianrueda.dev con la portada de una pantalla aprobada (boceto v3), fichas de juego como escaparate, página «Sobre mí», contenido al día y sin peso muerto.

**Architecture:** Mismo Astro 5 + Tailwind + contenido en Markdown. Se cambian tokens de estilo, layout y vistas; el esquema de proyectos gana `kind` y campos de escaparate. Una comprobación estática (`tools/check-site.mjs`) sobre una build de prueba hace de batería de tests.

**Tech Stack:** Astro 5, Tailwind 3, sharp (WebP), Godot 4.5 (capturas de Arcanist), Vite (capturas de SurvivorTD).

**Spec:** `design/2026-10-20-rediseno-portfolio.md` · boceto aprobado `design/bocetos/portada-v3.html`

## Global Constraints

- Letra: Outfit 200–500 (titulares 200–300, énfasis 400) y JetBrains Mono para etiquetas (10.5–11.5 px, mayúsculas, tracking .09–.1em).
- Colores: fondo `#050506`, texto `#f2f2f3`, tenue `#85868e`, más tenue `#55565e`, líneas `rgba(255,255,255,.07)` / `.14`. Sin morado. Único acento: el punto verde de «Disponible» (`#3ddc84`).
- Portada en escritorio: cabe en 1440×900 sin scroll; contenedor máx. 1180 px; 4 cajas.
- Fichas de juego: nunca muestran problem/solution/results/challenges/learnings ni etiquetas de tecnología.
- Todas las imágenes del sitio en WebP (salvo el favicon SVG/PNG y la intro).
- Nada de cadenas sueltas en vistas: textos en `src/i18n/` o en los `.md`. ES en la raíz, EN bajo `/en`.
- No tocar `public/intro/aw-intro.js` ni su `<script>` en `BaseLayout.astro`.
- **No ejecutar `npm run build` sobre `docs/` ni hacer push**: las comprobaciones usan `npx astro build --outDir .check-dist`. Publicar es decisión de Adrian.
- Commits sin Co-Authored-By.

## Review Focus

- Una ficha `.md` sin `kind` (o un proyecto `-en.md` sin su par): la build no debe romper; `kind` por defecto `client`. → test en Tarea 3.
- Juego sin `cta.url` (Arcanist hasta que exista Steam): botón «Próximamente en Steam» sin enlace, no un `<a href="undefined">`. → test en Tarea 3.
- Navegación con transiciones de Astro (`ViewTransitions`): el haz de la portada no debe duplicar bucles de animación al volver a la portada. → comprobación en Tarea 5.
- «Reducir movimiento»: el haz se pinta una vez, quieto. → comprobación en Tarea 5.
- Móvil a 375 px: sin scroll horizontal, orden tú → juegos → ofertas → pie. → comprobación en Tarea 5 y 8.

---

### Task 1: Comprobación estática del sitio (la batería de tests)

**Files:**
- Create: `tools/check-site.mjs`
- Modify: `.gitignore` (añadir `.check-dist/`)

**Interfaces:**
- Produces: `node tools/check-site.mjs [dir=.check-dist]` → sale con código 1 y lista de fallos, 0 si todo pasa.

- [ ] **Step 1: Escribir las comprobaciones** (cada una imprime su nombre y PASS/FAIL):
  - existen `index.html`, `en/index.html`, `projects/index.html`, `en/projects/index.html`, `sobre-mi/index.html`, `en/about/index.html`, `contacto/index.html`, `en/contact/index.html`;
  - ningún HTML contiene `/Employed|Empleado en GRS|Presente|Present\b/` en la trayectoria ni la palabra `kira` (sin distinguir mayúsculas);
  - no existe `para-maria/` ni `kira_images/` en la salida;
  - ningún `src=`/`href=`/`url(` de HTML apunta a `.png`/`.jpg`/`.jpeg` salvo `favicon-*.png` y `apple-touch-icon.png`;
  - el `<head>` de `index.html` enlaza `/favicon.svg`;
  - en `projects/<slug>/index.html` de cada juego (`atlas`, `brisca`, `survivortd`) no aparecen las cabeceras de `ui.ts` de reto/solución/resultados ni la clase `tag-tech`;
  - `index.html` contiene exactamente 4 elementos `[data-tile]`.
- [ ] **Step 2: Ejecutarla sobre la build actual y ver que falla**
  Run: `npx astro build --outDir .check-dist && node tools/check-site.mjs`
  Expected: FAIL (sobre-mi no existe, aparece «Employed», kira, para-maria, PNG…).
- [ ] **Step 3: Commit** — `chore(check): comprobación estática del sitio`

### Task 2: Quitar el peso muerto, WebP y favicon AW

**Files:**
- Delete: `src/components/kira/`, `src/i18n/kira.ts`, `public/kira/`, `public/kira_images/`, `public/para-maria/`, `public/VisorGreen.png`, `public/VisorRed.png`, `public/me-old.jpg`, `public/base.css`, `public/tailwind.css`, `public/favicon.png`, `src/assets/`, `.verify-*.png`
- Move: `CUESTIONARIO_PROYECTOS.md` → `design/`
- Modify: `src/layouts/BaseLayout.astro` (quitar Kira), `src/i18n/index.ts` (quitar export de kira), `.env.example` (quitar `PUBLIC_GROQ_API_KEY`), `package.json` (quitar `lucide-react`, `vitest`, `vite`, scripts `dev:old`/`build:old`), `src/components/layout/BaseHead.astro` (favicons)
- Create: `tools/to-webp.mjs`, `public/favicon.svg`, `public/favicon-32.png`, `public/apple-touch-icon.png` (180), `public/icon-512.png`

**Interfaces:**
- Produces: `node tools/to-webp.mjs` — convierte todo `public/**/*.{png,jpg,jpeg}` (excepto favicons) a `.webp` (calidad 82, ancho máx. 1600 px), borra el original y reescribe las rutas en `src/**/*.{astro,ts,tsx,md}`.
- Produces: favicon = monograma AW blanco sobre negro con esquinas redondeadas (las rutas `A_PATH`, `A_BAR`, `WAVE`, `CLIP` de `public/intro/aw-intro.js`).

- [ ] **Step 1:** Borrar y mover lo de la lista; `npm uninstall lucide-react vitest vite`; quitar scripts.
- [ ] **Step 2:** Escribir `tools/to-webp.mjs` con `sharp` y ejecutarlo. Comprobar: `find public -name "*.png" -o -name "*.jpg"` solo lista favicons.
- [ ] **Step 3:** Crear `favicon.svg` y generar los PNG con sharp desde el SVG; enlazarlos en `BaseHead.astro`.
- [ ] **Step 4:** Run: `npx astro build --outDir .check-dist && node tools/check-site.mjs` → pasan las comprobaciones de kira, para-maria, PNG y favicon (el resto sigue fallando).
- [ ] **Step 5: Commit** — `chore: quitar Kira, la página de María y el peso muerto; imágenes a WebP; favicon AW`

### Task 3: Esquema y contenido

**Files:**
- Modify: `src/content/config.ts`, `src/content/projects/*.md`, `src/i18n/experience.ts`, `src/i18n/profile.ts`, `src/i18n/ui.ts`
- Create: `src/content/projects/arcanist-bastion.md` + `-en.md`, `src/content/projects/survivortd.md` + `-en.md`, `src/content/projects/skipping-rules.md` + `-en.md` (`kind: own`, `links.live: https://www.youtube.com/@SkippingRules`, logo de `D:/Proyectos/BG-Rules/branding/skiping-rules/` en WebP)

**Interfaces:**
- Produces (esquema): `kind: z.enum(['game','client','own']).default('client')`, `hook: z.string().optional()`, `genre: z.string().optional()`, `platform: z.string().optional()`, `cta: z.object({ label: z.string(), url: z.string().optional() }).optional()`, `credit: z.string().optional()`, `detail: z.boolean().default(true)`. En juegos, `problem`, `solution` y `results` pasan a opcionales (`z.string().optional()`, `z.array(z.string()).default([])`).
- Produces: `getTimeline(locale)` empieza por `{ id:'exp-new', role:'Independiente' | 'Independent', company:'Estudio propio y freelance' | 'Own studio & freelance', period:'2026 →' }`; GRS `period: '2023 — 2026'`.
- Produces: `profileBase.social` gana `{ label: 'YouTube · Skipping Rules', url: 'https://www.youtube.com/@SkippingRules' }` (sale en el Footer).
- Produces: `profile.availability` = «Disponible para proyectos freelance» / «Available for freelance projects»; se borran `about.status`/`about.employed` de `ui.ts`.

- [ ] **Step 1:** Ampliar el esquema.
- [ ] **Step 2:** Juegos: `atlas`, `brisca`, `survivortd`, `arcanist-bastion` con `kind: game`, `hook`, `genre`, `platform`, `cta`. Brisca y Atlas: borrar `problem`, `solution`, `results`, `motivation`, `challenges`, `learnings`, `context` y el cuerpo técnico. Arcanist: `detail: false`, `cta: { label: 'Próximamente en Steam' }` sin `url`, `order: 0`. SurvivorTD: `credit: 'Homenaje a Tower Survivors, de Nethalythic'`, sin `cta.url`. Hooks de una frase, sin mecánicas (Adrian los revisará).
- [ ] **Step 3:** `vr-psicologia-ual` y `pruebas-neuropsicologicas`: `kind: client` (por defecto). Brisca: `tier: more`.
- [ ] **Step 4:** Trayectoria y disponibilidad como en Interfaces.
- [ ] **Step 5:** Run: build + check → pasa la comprobación «Employed/Presente»; la build no rompe con fichas sin `kind`.
- [ ] **Step 6: Commit** — `feat(contenido): juegos como escaparate, trayectoria y disponibilidad al día`

### Task 4: Capturas de los juegos

**Files:**
- Create: `public/projects/arcanist-bastion/*.webp` (3–5), `public/projects/survivortd/*.webp` (2–3); opcional `public/projects/arcanist-bastion/loop.webm` (≤ 4 MB, 6–10 s, sin audio)

- [ ] **Step 1:** Arcanist (`D:/Proyectos/Arcanist Bastion`, Godot 4.5): lanzar el juego, jugar una oleada y capturar planos atractivos (batalla con efectos, vista de la isla). Nada de menús de diseño, árboles de mejoras ni números de balance. Seguir la skill `godot-qa-y-capturas`.
- [ ] **Step 2:** SurvivorTD (`D:/Proyectos/SurvivorTD`, `npm run dev` → :5174): capturas de partida con torres y oleadas en pantalla.
- [ ] **Step 3:** Pasar a WebP (≤ 1600 px) y referenciar en los `.md` (`heroImage`, `gallery`).
- [ ] **Step 4:** Enseñar las capturas a Adrian antes de dar la tarea por hecha.
- [ ] **Step 5: Commit** — `feat(juegos): capturas de Arcanist Bastion y SurvivorTD`

### Task 5: Sistema visual, layout y portada

**Files:**
- Modify: `tailwind.config.mjs` (tokens de Global Constraints; fuera `purple*`, `accent`), `src/styles/global.css`, `src/components/layout/BaseHead.astro` (Google Fonts Outfit + JetBrains Mono), `src/layouts/BaseLayout.astro` (sin `StarryBackground`), `src/components/layout/Header.astro` (nav: marca AW · Juegos · Proyectos · Sobre mí · botón Hablemos), `src/components/layout/Footer.astro` (trayectoria resumida + redes + idioma), `src/page-views/HomeView.astro`
- Create: `src/components/home/HeroTile.astro`, `GamesTile.astro`, `OfferTile.astro`, `src/components/home/Beam.astro` (canvas + script del haz)
- Delete: `src/components/home/Bento*.astro`, `src/components/ui/SkillBubbles.tsx`, `src/components/layout/StarryBackground.jsx`, `SubpageNav.astro` si queda sin uso

**Interfaces:**
- Consumes: `getProfile`, `getTimeline`, colección `projects` con `kind`, `order`.
- Produces: cada caja lleva `data-tile`. `Beam.astro` sin props; respeta `prefers-reduced-motion` (un fotograma quieto), corta su bucle en `astro:before-swap` y no arranca dos veces.

- [ ] **Step 1:** Tokens y fuentes.
- [ ] **Step 2:** Header y Footer.
- [ ] **Step 3:** Portada como el boceto v3: protagonista (cols 1–2), juegos (col 3, dos filas: el juego de menor `order` con `kind: game` en grande; los dos siguientes como enlaces), dos ofertas (textos en `ui.ts`), pie con trayectoria.
- [ ] **Step 4:** Comprobar en el navegador: 1440×900 sin scroll; 375 px sin scroll horizontal y en orden; ir a /projects y volver no duplica el bucle (`performance` estable); con `prefers-reduced-motion` el haz está quieto; la intro AW sigue saliendo con `?intro=1`.
- [ ] **Step 5:** Run: build + check → pasa «4 data-tile».
- [ ] **Step 6: Commit** — `feat(portada): portada de una pantalla con el estilo nuevo`

### Task 6: Lista de proyectos y fichas

**Files:**
- Modify: `src/page-views/ProjectsListView.astro`, `src/page-views/ProjectDetailView.astro`, `src/layouts/ProjectLayout.astro`, `src/pages/projects/[...slug].astro` + `src/pages/en/projects/[...slug].astro` (no generar ruta si `detail: false`)
- Create: `src/components/projects/GameCard.astro`, `ClientCard.astro`, `GameDetail.astro`, `ClientDetail.astro`
- Delete: `src/components/ui/ProjectCardIsland.tsx` si queda sin uso

**Interfaces:**
- Consumes: esquema de la Tarea 3.
- Produces: `/projects` con `<section id="juegos">` (GameCard, cinematográficas, crédito si existe) `<section id="trabajos">` (ClientCard con captura en marco oscuro) y `<section id="propios">` (`kind: own`, misma ClientCard con «Ver el canal»); `tier: more` al final en lista compacta. GameCard sin `cta.url` → `<span>` con la etiqueta, no `<a>`.

- [ ] **Step 1:** Tarjetas y lista.
- [ ] **Step 2:** `GameDetail` (imagen o vídeo a sangre, nombre, hook, género, plataforma, CTA, galería, crédito) y `ClientDetail` (captura grande, reto, solución, resultados, una columna de 16–17 px).
- [ ] **Step 3:** Run: build + check → pasan las comprobaciones de fichas de juego.
- [ ] **Step 4:** Capturas a 1440 y 375 de `/projects`, una ficha de juego y una de cliente.
- [ ] **Step 5: Commit** — `feat(proyectos): juegos como escaparate y trabajos de cliente`

### Task 7: Sobre mí y Contacto

**Files:**
- Create: `src/pages/sobre-mi.astro`, `src/pages/en/about.astro`, `src/page-views/AboutView.astro`
- Modify: `src/page-views/ContactView.astro`, `src/i18n/skills.ts` (tres grupos: web y apps · juegos · IA y datos), `src/i18n/ui.ts`, `src/i18n/utils.ts` (rutas de «Sobre mí» en ambos idiomas para hreflang)

**Interfaces:**
- Produces: `getSkillGroups(locale) → { title: string, items: string[] }[]` (3 grupos).

- [ ] **Step 1:** AboutView: bio corta (de `profile.summary`, reescrita sin «experimentos locos»), trayectoria completa, formación, tecnologías por grupos en etiquetas sobrias.
- [ ] **Step 2:** Contacto con el estilo nuevo: formulario FormSubmit igual, enlace «Escríbeme» (mailto) y LinkedIn, «Disponible para proyectos freelance».
- [ ] **Step 3:** Run: build + check → todo PASS.
- [ ] **Step 4: Commit** — `feat: página Sobre mí y contacto con el estilo nuevo`

### Task 8: Repaso final

- [ ] **Step 1:** Run: `npx astro build --outDir .check-dist && node tools/check-site.mjs` → todo PASS; tamaño de `.check-dist` frente al `docs/` actual (debe bajar mucho).
- [ ] **Step 2:** Capturas 1440×900 y 375×812 de todas las páginas, ES y EN; nada de morado ni de texto de 11 px en contenido.
- [ ] **Step 3:** Actualizar `README.md` (sin Kira, nueva estructura, `tools/`).
- [ ] **Step 4: Commit** — `docs: README al día tras el rediseño`
- [ ] **Step 5:** Enseñar a Adrian y pedirle permiso para `npm run build` + commit de `docs/` + push. Recordarle que `para-maria` sigue en el historial de git del repo público.
