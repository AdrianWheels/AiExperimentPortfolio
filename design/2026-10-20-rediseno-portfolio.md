# Rediseño del portfolio · adrianrueda.dev

Fecha: 2026-10-20. Boceto aprobado de la portada: `design/bocetos/portada-v3.html`
(copia del que Adrian vio y aprobó; los textos son de ejemplo).

## Por qué

Adrian dejó GRS en octubre de 2026 y ahora quiere vivir de sus juegos y de encargos
freelance. El portfolio actual no sirve para eso:

- Dice «Status: Employed» y «2023 – Presente · GRS», y a la vez «abierto a freelance».
- No hay jerarquía: seis cajas iguales, letra de 11–12 px, cajas con scroll interno y
  ninguna llamada a la acción. En móvil lo primero que se ve es un amasijo de burbujas
  de tecnologías; su nombre y su foto salen en tercer lugar.
- El estilo (degradado morado) no tiene nada que ver con su marca AW, sobria y en
  blanco y negro, ni con la intro que ya abre la web (`public/intro/aw-intro.js`).
- Las fichas de juego cuentan sus mecánicas y su tecnología en detalle. Adrian no
  quiere eso: le copian los juegos muy rápido.

## Objetivos

Quien entra debe salir con una de estas dos cosas hechas, en este orden:

1. **Ver sus juegos** (Arcanist Bastion es el foco; Brisca y el resto detrás).
2. **Contratarle como freelance** para una de dos ofertas:
   - **Webs y apps para negocios** (prueba: JR Fisioterapia y Pepa Print3D, en producción).
   - **Juegos a medida** para estudios y marcas (prueba: sus propios juegos, Atlas VR).

## No objetivos

- No es un blog ni una página de estudio con equipo, noticias o empleo.
- No se cambia el sistema de despliegue (build local a `docs/`, Pages).
- La intro AW no se toca.

## Antiobjetivos (si pasa esto, ha fallado aunque funcione)

- Que una ficha de juego explique cómo funciona por dentro (mecánicas, sistemas,
  números, arquitectura). Los juegos se enseñan como escaparate: imagen, nombre,
  una frase, género, plataforma y enlace.
- Que la portada vuelva a sentirse agobiante: más de cuatro cajas, todo al mismo
  peso o texto secundario compitiendo con el titular.
- Que se pierda «verlo todo de un vistazo» en escritorio (la portada cabe en una
  pantalla de 1440×900 sin scroll).
- Que se vea genérico o de plantilla (degradados morados, burbujas, glassmorphism por
  todas partes).

## Lo que decidió Adrian

- **Portada de una sola pantalla en cajas**, como la actual, pero con aire: cuatro
  cajas centradas (máx. ~1180 px), con margen alrededor. Boceto v3.
  - Caja protagonista (2/3 del ancho, fila de arriba): su foto en pequeño, nombre,
    «Desarrollador independiente · Almería», titular grande («Hago juegos. Y webs y
    apps que tu negocio usa cada día.»), botones **Contratar** (blanco) y **Ver
    proyectos**, y «Disponible» con punto verde. De fondo, el haz de luz con la onda
    de la W sobre un suelo de líneas en perspectiva, animado y con un leve giro al
    mover el ratón.
  - Columna alta a la derecha: **Mis juegos**. Arcanist Bastion grande, con
    «Próximamente en Steam» y botón de lista de deseos; Brisca y Atlas como enlaces
    pequeños abajo; «Todos →».
  - Dos cajas pequeñas debajo: **01 Webs y apps para negocios** y **02 Juegos a
    medida**, cada una con una frase y una prueba en miniatura.
  - Trayectoria como una línea de texto discreta al pie (2026 → Independiente ·
    2023–26 GRS · 2021–23 Univ. Almería · 2020–21 CognitivART VR) y redes + idioma.
  - Las tecnologías salen de la portada y van a «Sobre mí».
- **Estilo**: negro, líneas y el haz de luz (inspirado en basement.studio, Linear y
  Raycast); letra fina tipo Teenage Engineering (Outfit 200–400, la misma del nombre
  de la intro) con etiquetas en JetBrains Mono. Juegos en clave cinematográfica, como
  Playdead: imagen a sangre y casi nada de texto.
- **Freelance**: solo las dos ofertas de arriba.
- **Juegos**: escaparate, sin pistas de diseño.

## Lo que decide quien lo construya (llamadas mías, marcadas)

- **[Mi llamada] Páginas restantes, mismo lenguaje que la portada:**
  - `/projects` → dos bloques: **Juegos** (tarjetas cinematográficas grandes) y
    **Trabajos para clientes** (tarjetas con captura en marco oscuro). Los proyectos
    `tier: more` quedan al final en una lista compacta.
  - Ficha de **trabajo de cliente** (JR, Pepa, ColorEveryday, Almería AH, Mementic,
    Picturam…): sí cuenta reto, solución y resultados; es lo que vende la oferta 01.
    Captura grande arriba, texto a 16–17 px, una columna legible.
  - Ficha de **juego** (Brisca, Atlas, Arcanist cuando exista): escaparate. Imagen o
    vídeo a sangre, nombre, frase, género, plataforma, enlace. **No** se muestran
    `problem`, `solution`, `results`, `challenges`, `learnings` ni las etiquetas de
    tecnología. Hace falta un campo nuevo en el esquema (`kind: 'game' | 'client'`)
    y uno opcional `hook` (la frase).
  - **Sobre mí** (página nueva, `/sobre-mi` y `/en/about`): bio corta, trayectoria
    completa y tecnologías agrupadas (web y apps · juegos · IA y datos) en etiquetas
    sobrias, sin burbujas.
  - **Contacto**: misma estética; el formulario sigue por FormSubmit; se añade un
    enlace directo «Escríbeme» (mailto) y LinkedIn. Disponibilidad: «Disponible para
    proyectos freelance».
- **[Mi llamada] Móvil**: las cajas se apilan en orden tú → juegos → ofertas → pie.
  El titular baja a ~36 px. Nada de scroll interno.
- **[Mi llamada] Fondo**: se retira el cielo de estrellas (`StarryBackground`) en todas
  las páginas; el haz solo vive en la caja protagonista. Con «reducir movimiento», el
  haz se pinta quieto.
- **[Mi llamada] Contenido que cambia ya**: fuera «Employed»; GRS «2023 – 2026» sin
  más explicación; nueva entrada «2026 → Independiente · estudio propio y freelance».
- **[Mi llamada] Brisca y Atlas**: sus fichas se recortan a escaparate (las secciones
  técnicas se quitan del `.md`, no solo se ocultan).
- **[Mi llamada] Inglés**: todo lo nuevo se traduce; `/en` mantiene la misma estructura.
- **[Mi llamada] Esquema**: además de `kind` y `hook`, campos opcionales `genre`,
  `platform` y `cta` (`{ label, url }`) para las tarjetas de juego.
- **[Mi llamada] Arcanist Bastion**: entra como ficha `kind: game` sin página de
  detalle hasta que haya arte y Steam; en `/projects` sale primera en «Juegos» como
  tarjeta «Próximamente».
- **[Mi llamada] `vr-psicologia-ual` y `pruebas-neuropsicologicas`**: `kind: client`
  (encargos reales para la Universidad); conservan reto, solución y resultados.
- **[Mi llamada] Navegación**: Juegos → `/projects#juegos`, Proyectos → `/projects`,
  Sobre mí → `/sobre-mi`, y el botón «Hablemos» → `/contacto`. Igual en `/en`.
- **[Mi llamada]** Ancho de lectura, tamaños, espaciado y animaciones de entrada
  (sobrias, sin rebotes) los decide quien lo construya dentro del estilo aprobado.

## Quitar el peso muerto (pedido por Adrian)

Medido el 2026-10-20. Se borra (de `public/`, del repo y, al reconstruir, de `docs/`):

- **Ficheros sin referencias**: `public/VisorGreen.png` y `public/VisorRed.png`
  (3,8 MB), `public/me-old.jpg`, `public/base.css`, `public/tailwind.css`, toda
  `src/assets/` (copias de imágenes que nadie importa) y las capturas `.verify-*.png`
  de la raíz (4 MB, sin seguimiento en git).
- **Dependencias y scripts sin uso**: `lucide-react` (nadie la importa), `vitest`
  (no hay tests), `vite` como dependencia directa (Astro ya la trae) y los scripts
  `dev:old` / `build:old` de la v1.
- **Componentes que el rediseño deja huérfanos**: `SkillBubbles`, `StarryBackground`,
  los `Bento*` de la portada vieja y lo que deje de usarse (comprobar con búsqueda,
  no a ojo).
- **Imágenes pesadas**: `public/projects/` pesa 23 MB (Atlas 12 MB, vrhat 8 MB) y
  `favicon.png` 1,1 MB. Se pasan a WebP o AVIF a un tamaño razonable (≤ 1600 px de
  ancho; el favicon a 32/180/512 px) y se usan con `<Image>` de Astro donde se pueda.
- **Kira, el chatbot, entero** (decidido por Adrian): `src/components/kira/`,
  `src/i18n/kira.ts`, `public/kira/`, `public/kira_images/` (15 MB), su montaje en
  `BaseLayout.astro` y la variable `PUBLIC_GROQ_API_KEY` de `.env.example`.
- **La página de María** (decidido por Adrian; era privada, para su cumpleaños):
  `public/para-maria/` y `docs/para-maria/`.
- **Todas las imágenes a WebP** (decidido por Adrian).
- **Favicon**: el monograma AW nuevo (SVG + PNG 32/180/512), sustituye a `favicon.png`.
- **Se queda**: `CNAME`, `robots.txt`, `public/data/`, `public/font/`, `public/intro/`.
- `CUESTIONARIO_PROYECTOS.md`: es material de trabajo de Adrian; se mueve a `design/`
  en vez de borrarlo.

## Restricciones

- Astro 5 + islas de React + Tailwind, contenido en `src/content/projects/*.md`,
  textos en `src/i18n/`. Nada de cadenas sueltas en las vistas.
- Despliegue manual: `npm run build` escribe en `docs/` y se commitea. **No publicar
  sin el visto bueno de Adrian.**
- La intro AW se carga síncrona al principio de `<body>` y debe seguir funcionando.
- Las imágenes de proyectos existentes están en `public/projects/<slug>/`.

## Juegos que se enseñan (decidido por Adrian)

- **Arcanist Bastion** (protagonista): capturas atractivas hechas por nosotros del
  juego real (o un vídeo corto en bucle), sin enseñar menús de diseño ni números.
- **Atlas VR**: sus capturas existentes, en WebP.
- **Brisca**: fuera de la portada y de «Juegos» (no está publicada ni cerca); su ficha
  se queda como proyecto en la lista, recortada a escaparate.
- **SurvivorTD**: Adrian lo quiere enseñar. Es un homenaje a Tower Survivors
  (Nethalythic) con datos del mapa original. **[Mi llamada]** sale solo como capturas
  de su versión, con crédito «Homenaje a Tower Survivors, de Nethalythic», sin enlace
  jugable, hasta que Adrian tenga permiso del autor.

## Skipping Rules (decidido por Adrian)

Canal de YouTube https://www.youtube.com/@SkippingRules: tutoriales de juegos de mesa
producidos con un sistema propio (guion, animación con Remotion, locución, subtítulos,
varios idiomas), con ALK DEViation. Contenido evergreen, sin trampas. Se enseña:

- En el pie de todas las páginas, junto a LinkedIn y GitHub: «YouTube · Skipping Rules».
- En `/projects`, bloque «Proyectos propios» (`kind: own`): logo o miniatura, una frase,
  «con ALK DEViation», botón «Ver el canal». Aquí sí se cuenta cómo está hecho (es lo
  que vende): la ficha usa la plantilla de cliente.
- No entra en las cuatro cajas de la portada.
- Logo: `D:/Proyectos/BG-Rules/branding/skiping-rules/`.

## Pendiente de Adrian (no bloquea empezar)

- Arte clave y frase de gancho de Arcanist Bastion; enlace de Steam cuando exista
  (la página va a revisión el 2026-11-20). Hasta entonces, el hueco usa un fondo
  atmosférico neutro y el botón dice «Próximamente en Steam» sin enlace.
