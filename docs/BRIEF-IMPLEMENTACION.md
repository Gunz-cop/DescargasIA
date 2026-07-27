# FuenteAI — Brief de implementación · dirección "Señal nocturna"

Stack destino: **Astro + Tailwind v4 + Cloudflare Pages**.
Referencia visual: `FuenteAI Direcciones.dc.html`, opción **1a** (home + ficha) y **2a** (búsqueda, móvil, movimiento).
Idioma: español neutro. Todo el copy en minúscula descriptiva, nunca jerga técnica de marketing.

---

## 0. Promesa del producto (guía toda decisión)

1. **Fuente oficial verificada** de cada herramienta, siempre visible sin scroll en la ficha.
2. **Descubrimiento incidental**: alternativas reales al mismo peso visual que el resultado buscado, nunca como nota al pie.

Si un dato no está verificado, **no se publica**. Un error de categorización rompe la promesa central.

---

## 1. Paleta

| Token | Valor | Uso |
|---|---|---|
| `--fai-bg` | `#04120E` | fondo de página |
| `--fai-surface` | `#0A211B` | paneles y bloques de resultados |
| `--fai-card` | `rgba(232,245,240,.04)` | tarjeta sobre superficie |
| `--fai-line` | `rgba(232,245,240,.10)` | bordes |
| `--fai-signal` | `#0FBF8F` | teal de señal: enlaces, dominios verificados, hover |
| `--fai-find` | `#C6F24E` | lima "hallazgo": conteos, badge NUEVA PARA TI, CTA principal |
| `--fai-ink` | `#E8F5F0` | texto principal |
| `--fai-ink-2` | `#D8EBE4` | texto de párrafo destacado |
| `--fai-muted` | `#9BB5AD` | texto secundario |
| `--fai-muted-2` | `#7FA79B` | metadatos mono |
| `--fai-deep` | `#1B3A32` | avatar de herramienta ya conocida |

Reglas: máximo dos superficies (`bg`, `surface`). El lima es **escaso** — conteos, hallazgos y un solo CTA por vista. Los halos radiales son el único gradiente; nada de gradientes en tarjetas o botones (salvo el avatar de herramienta y el bloque de fuente oficial).

Enlaces: color `--fai-signal`, hover `--fai-find`, subrayado solo en texto corrido.

## 2. Tipografía

- Titulares e interfaz: **Space Grotesk** (400/500/700), `letter-spacing` −.02 a −.035em en tamaños ≥40px.
- Metadatos, dominios, badges, breadcrumb: **IBM Plex Mono** (400/500/600), `letter-spacing` .10–.24em, mayúsculas.
- Escala: hero 84px/.98 · H2 ficha 52px/1 · conteo grande 56px · título de sección 26px · tarjeta 17–19px · cuerpo 14–16px/1.45–1.55 · mono 11–13px.
- Móvil: hero 40px, H2 ficha 32px, cuerpo 16px. Nunca por debajo de 14px, área táctil mínima 44px.
- `text-wrap: pretty` en todo párrafo; `tabular-nums` en conteos.

Servir ambas familias autoalojadas (`woff2`, `font-display: swap`) desde `/fonts`, no desde Google Fonts, para evitar bloqueo en el edge.

## 3. Sistema de movimiento (especificación exacta)

| # | Nombre | Especificación |
|---|---|---|
| 1 | Respiración de fondo | Dos halos `radial-gradient(closest-side, …)` — teal 760×560 y lima 520×420, `filter: blur(20px)`. Bucle infinito: `opacity .55→.9`, `scale 1→1.08`, `translateY 0→−18px`. Duraciones 9 s y 12 s, `ease-in-out`, desfasados. Solo `opacity`/`transform`; `will-change: transform, opacity`. |
| 2 | Entrada en cascada | Por tarjeta: `opacity 0→1`, `translateY 12px→0`, 260 ms, `cubic-bezier(.22,1,.36,1)`, retraso `min(index*40ms, 480ms)`. Dispara con `IntersectionObserver` al 15 % de visibilidad, una sola vez. |
| 3 | Contador que sube | El conteo grande anima de `2` al total en 600 ms con easeOutExpo (`1-2^(-10t)`), `requestAnimationFrame`, `tabular-nums`. Se dispara al entrar en viewport, una sola vez. SSR/no-JS: el DOM ya contiene el número final. |
| 4 | Hover con borde vivo | `border-color: rgba(232,245,240,.10) → #0FBF8F`, `background → rgba(15,191,143,.09)`, 140 ms `ease-out`. Sin sombra ni `scale`. Foco teclado: mismo borde + `box-shadow: 0 0 0 4px rgba(15,191,143,.25)`. |
| 5 | Cursor del buscador | Barra de 2×20px en `--fai-find`, parpadeo `steps(2,end)` 1.1 s; solo cuando el input tiene foco. |
| 6 | Movimiento reducido | Con `prefers-reduced-motion: reduce`: halos estáticos al 70 % de opacidad, cascada y contador desactivados (estado final inmediato), hover solo cambia color. Ninguna información depende del movimiento. |

Presupuesto: nada de librerías de animación. CSS + ~1 KB de JS para (2) y (3), cargado con `client:visible`.

## 4. Modelo de datos y reglas de verificación

```ts
type Tool = {
  slug: string;
  name: string;
  oneLiner: string;            // qué hace, en lenguaje de persona no técnica
  officialUrl: string;         // dominio del creador
  repoUrl?: string;            // repositorio oficial, si existe
  verifiedAt: string;          // ISO, revisión humana
  verifiedBy: string;
  pricing: 'gratis' | 'freemium' | 'pago';
  openSource: boolean;
  runsOffline: boolean;
  platforms: ('web'|'win'|'mac'|'linux'|'ios'|'android'|'cli')[];
  capabilities: string[];      // etiquetas atómicas: 'doc-qa','ocr','rag-local','chat','tts'…
  needs: string[];             // slugs de necesidad — SOLO si la capacidad principal la cubre
  knownBy: 'alta' | 'media' | 'baja';   // decide el badge "nueva para ti"
  warnings?: string[];         // clones y espejos conocidos
};
```

**Regla de categorización (la que se rompió):** una herramienta entra en una necesidad solo si esa necesidad es una **función principal documentada** por el creador, no una función secundaria. Ejemplo corregido: *LM Studio* es un ejecutor de modelos locales (`needs: ['correr-modelos-local','chat-privado']`); **no** pertenece a `analizar-pdfs` aunque permita adjuntar archivos. Para `analizar-pdfs` el conjunto verificado es: AnythingLLM, NotebookLM, Kotaemon, Docling, ChatPDF, Marker, MinerU, PrivateGPT, Open WebUI, GPT4All, Msty.

Validación en build (falla el build si no pasa):
- toda `need` declarada existe en el catálogo de necesidades;
- toda herramienta tiene `officialUrl` con HTTPS y `verifiedAt` de menos de 90 días;
- ninguna herramienta aparece en más de 3 necesidades sin justificación en `capabilities`;
- el conteo mostrado por necesidad se calcula del catálogo, nunca se escribe a mano.

## 5. Adyacencia semántica ("también podrías querer")

No es copy. Se calcula en build:

1. Similitud de Jaccard entre los conjuntos `capabilities` de dos necesidades.
2. Se muestran las necesidades con **J ≥ 0.25**, ordenadas por J descendente, máximo 2.
3. Desempate con señal de comportamiento (búsquedas encadenadas del mismo visitante, si hay analítica; si no, orden por catálogo).
4. **Si ninguna supera el umbral, la franja no se renderiza.** Nunca se rellena con una necesidad al azar.
5. El texto se genera de plantilla con datos reales: `«{share} de quienes buscan {tool} quieren {needA} o {needB}. Hay {n} y {m} herramientas para eso.»` — `share` solo si hay analítica real; si no, se usa la variante sin porcentaje.

## 6. Componentes (Astro)

- `Shell.astro` — fondo, halos, header, footer de confianza (tres columnas: cero clones / revisado cada semana / sin patrocinios).
- `SearchBar.astro` + isla `Search.tsx` — búsqueda por nombre y por necesidad, `↵` buscar, `Esc` limpiar, resultados prerenderizados con índice estático (Pagefind o índice JSON propio); sin llamada a servidor.
- `ToolCard.astro` — avatar (gradiente teal→verde para hallazgo, `--fai-deep` para conocida), nombre, one-liner de 2 líneas con altura mínima y, en el pie, **dominio y badge en líneas separadas** (columna, `gap: 9px`, `white-space: nowrap`): el dominio nunca se trunca ni se parte —es la prueba de confianza— y el badge `NUEVA PARA TI` / `ya la conocías` nunca rompe a dos líneas. Prohibido el pie en fila con `space-between`: a 253px de columna parte ambos textos.
- `ResultGrid.astro` — 4 columnas ≥1200px · 3 ≥900 · 2 ≥620 · 1 abajo. Última celda del bloque = tarjeta `+N` en lima punteado.
- `CountHeadline.astro` — conteo grande + subtítulo «la mayoría conoce 2 → te faltan N».
- `OfficialSource.astro` — bloque destacado con `officialUrl`, botón Descargar, `repoUrl`, fecha de revisión y aviso de espejos. **Siempre above the fold en la ficha.**
- `Alternatives.astro` — 6 alternativas en 3 columnas, colocadas **inmediatamente después del encabezado de la ficha**, antes de detalles, FAQ o precauciones.
- `NeedChips.astro` — chips de necesidad; la activa en lima con `box-shadow: 0 0 40px rgba(198,242,78,.35)`.
- `AdjacencyStrip.astro` — franja inferior, condicional según §5.

## 7. Rutas y SEO

- `/` home por necesidad · `/necesidad/[slug]` · `/herramienta/[slug]` (destino SEO principal) · `/verificacion`.
- Prerender total (`output: 'static'`), desplegado en Cloudflare Pages; islas solo para búsqueda, cascada y contador.
- En la ficha: `<title>{Nombre} — sitio oficial y {n} alternativas verificadas`, `description` con el one-liner + dominio oficial, JSON-LD `SoftwareApplication` con `url` oficial + `sameAs` del repo, y `BreadcrumbList`. El H1 es el nombre de la herramienta; el bloque de fuente oficial va en el primer viewport.
- `og:image` generado en build sobre fondo `#04120E` con nombre + dominio verificado.

## 8. Accesibilidad

Contraste mínimo AA sobre `#04120E` (texto secundario `#9BB5AD` cumple en ≥14px). Badges nunca comunican solo por color: llevan texto. Foco visible en todo elemento interactivo. Áreas táctiles ≥44px. La franja de adyacencia y las alternativas son navegables por teclado en orden lógico.
