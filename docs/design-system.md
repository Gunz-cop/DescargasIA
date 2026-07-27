# Sistema de Diseno — "Senal nocturna"

Direccion visual vigente de FuenteAI. Implementa `docs/BRIEF-IMPLEMENTACION.md`
sobre la arquitectura existente (Astro + Tailwind v4 + Cloudflare Pages,
rutas `/[lang]/...`, contenido en content collections, es + sv).

Referencia visual: `docs/fuenteai-referencia-visual.html`, opcion **1a** para
home y ficha, **2a** para busqueda, movil y movimiento. Las opciones 1b y 1c
estan descartadas.

## Promesa que guia cada decision

1. La **fuente oficial verificada** de cada herramienta, siempre visible sin
   scroll en la ficha.
2. **Descubrimiento incidental**: las alternativas pesan lo mismo que el
   resultado buscado, nunca son una nota al pie.

Si un dato no esta verificado, no se publica.

## §1 Paleta

Definida en `src/styles/global.css` y expuesta a Tailwind como `fai-*`.

| Token | Valor | Uso |
|---|---|---|
| `--fai-bg` | `#04120E` | fondo de pagina |
| `--fai-surface` | `#0A211B` | paneles y bloques de resultados |
| `--fai-card` | `rgba(232,245,240,.04)` | tarjeta sobre superficie |
| `--fai-line` | `rgba(232,245,240,.10)` | bordes |
| `--fai-signal` | `#0FBF8F` | enlaces, dominios verificados, hover |
| `--fai-find` | `#C6F24E` | conteos, hallazgos, un solo CTA por vista |
| `--fai-ink` / `--fai-ink-2` | `#E8F5F0` / `#D8EBE4` | texto |
| `--fai-muted` / `--fai-muted-2` | `#9BB5AD` / `#7FA79B` | secundario y metadatos |
| `--fai-deep` | `#1B3A32` | avatar de herramienta ya conocida |

Reglas que no se negocian:

- Maximo dos superficies (`bg` y `surface`).
- El lima es **escaso**: conteos, hallazgos y un solo CTA por vista.
- Los halos radiales son el unico gradiente. Nada de gradientes en tarjetas ni
  botones, salvo el avatar de herramienta y el bloque de fuente oficial.
- Enlaces en `signal`, hover en `find`, subrayado solo en texto corrido.

Los nombres antiguos `brand-*` siguen existiendo como alias mapeados a esta
paleta, para que las paginas legales y el interstitial `/r` no queden fuera del
sistema. No usarlos en codigo nuevo.

Contraste sobre `#04120E`, medido: ink 17.1 · ink-2 15.4 · muted 8.8 ·
muted-2 7.2 · signal 8.1 · find 14.8. Todo por encima de AA.

## §2 Tipografia

Dos familias **autoalojadas** en `public/fonts` (subconjuntos latin y
latin-ext, `font-display: swap`), servidas desde el edge. Nunca desde Google
Fonts: bloquea el render. Se generan con `src/styles/fonts.css`.

- **Space Grotesk** (400/500/700) — titulares e interfaz.
- **IBM Plex Mono** (400/500/600) — metadatos, dominios, badges, breadcrumb.

Utilidades: `.fai-hero` · `.fai-h2` · `.fai-count` · `.fai-section-title` ·
`.fai-card-title` · `.fai-mono` · `.fai-mono-sm` · `.fai-domain`.

En movil: hero 40px, H2 de ficha 32px, cuerpo 16px, **nada de prosa por debajo
de 14px** y area tactil minima de 44px. Los rotulos mono suben a 12-13px en
movil: van en mayusculas y con tracking amplio, asi que leen por encima de su
cuerpo.

`text-wrap: pretty` en todo `<p>`; `tabular-nums` en conteos.

## §3 Movimiento

Sin librerias. CSS mas una isla de ~0,5 KB gz (`src/components/Motion.astro`)
para la cascada y el contador. Los numeros son exactos, no aproximados:

1. **Respiracion de fondo** — halos teal 760x560 (9 s) y lima 520x420 (12 s),
   `blur(20px)`, `opacity .55→.9`, `scale 1→1.08`, `translateY 0→-18px`,
   `ease-in-out`, desfasados. Solo `opacity`/`transform`.
2. **Entrada en cascada** — 260 ms `cubic-bezier(.22,1,.36,1)`, retraso
   `min(index*40ms, 480ms)`, `IntersectionObserver` al 15 %, una sola vez.
3. **Contador** — de 2 al total en 600 ms con easeOutExpo, `requestAnimationFrame`.
   El DOM ya trae el numero final: sin JS no se pierde nada.
4. **Hover con borde vivo** — 140 ms `ease-out`, sin sombra ni `scale`.
   Foco de teclado: mismo borde mas `box-shadow: 0 0 0 4px rgba(15,191,143,.25)`.
5. **Cursor del buscador** — barra de 2x20px en lima, `steps(2,end)` 1,1 s,
   solo con foco.
6. **Movimiento reducido** — halos estaticos al 70 %, cascada y contador en su
   estado final inmediato, hover solo cambia color.

Cuidado con un detalle que ya rompio una vez: cuando un elemento es a la vez
`.fai-live` y `.fai-rise`, las dos reglas compiten por `transition` y gana la
cascada, dejando el hover en 260 ms. Por eso existe la regla combinada
`.fai-live.fai-rise.is-in`, que da a cada propiedad su duracion.

## §6 Componentes

- `BaseLayout.astro` — Shell: halos, cabecera con contador derivado del
  catalogo, pie de confianza de tres columnas (cero clones / revisado cada
  semana / sin patrocinios).
- `Directory.astro` — buscador, chips de necesidad, titular con conteo y
  rejilla. Estado en la URL (`?q=`, `?cat=`, `?plat=`, `?precio=`).
- `ToolCard.astro` — avatar, nombre, one-liner de 2 lineas con altura minima y
  **pie en columna**: dominio y badge en lineas separadas, `gap: 9px`,
  `white-space: nowrap`. El dominio es la prueba de confianza: no se trunca ni
  se parte. Prohibido el pie en fila con `space-between`; a 253px de columna
  parte ambos textos.
- Rejilla `.fai-grid`: 4 columnas ≥1200px · 3 ≥900 · 2 ≥620 · 1 abajo.
- Ficha: bloque de **fuente oficial verificada** en el primer viewport y las
  alternativas **inmediatamente despues del encabezado**, antes del detalle,
  la FAQ o las precauciones. Ese orden es la promesa del producto, no una
  preferencia de maquetacion.

## Conteos

Todos se derivan del catalogo con `filter().length`. Ninguno se escribe a
mano: ni los chips, ni el titular, ni el contador de la cabecera. Si un numero
aparece en pantalla, sale de `src/content/`.

## Pendiente del §4

El catalogo todavia no tiene `needs`, `capabilities`, `knownBy`, `verifiedBy`,
`openSource` ni `runsOffline`. Consecuencias vivas en el codigo:

- Las necesidades se resuelven con las `categories` actuales.
- `ToolCard` acepta `variant="find" | "known"` pero **no pinta badge por
  defecto**: afirmar "ya la conocias" sobre las 26 fichas seria inventar un
  dato sobre el visitante.
- La franja de adyacencia del §5 no se renderiza, que es justo lo que manda el
  §5.4 cuando ninguna necesidad supera el umbral.

## Antes de publicar

```bash
npm run build
```
