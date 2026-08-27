# Diagnóstico — ruta pública para guías localizadas (`/sv/guias/<slug>`)

**Proyecto:** `docs/plan-mejora-productos-por-idioma.md`
**Producto:** común (con consecuencias separadas para `es`, `sv` e `it`)
**Rama base:** `main` (`docs/mejora/decisiones.md`, registro 2026-08-27)
**Fecha de la comprobación:** 2026-08-27
**Commit sobre el que se comprobó:** `0ccd3b0`
**Estado:** diagnóstico. **No crea rutas, guías, fichas ni cambios de
arquitectura.** Ningún archivo de `src/`, `public/`, `scripts/` o `worker/`
queda modificado por este documento.

> Este documento responde a la decisión abierta de `docs/mejora/decisiones.md`
> — «Si las guías de intención necesitan una ruta pública antes de
> desbloquearse» — con evidencia comprobada en el repositorio. **No cierra esa
> decisión**: la resolución es del propietario y debe entrar en
> `docs/mejora/decisiones.md` con fecha y motivo. Aquí se enumeran las opciones,
> lo que cada una obliga a tocar y lo que cada una arriesga.

---

## 1. Estado actual comprobado

Todo lo de esta sección se verificó ejecutando los comandos del repositorio
sobre `0ccd3b0`, con el árbol de trabajo limpio antes y después.

### 1.1 La colección `guides` existe, pero no la lee nadie

| Hecho | Evidencia |
|---|---|
| La colección está declarada | `src/content.config.ts:105-118`, `defineCollection` con `loader: glob({ pattern: '*.md', base: './src/content/guides' })` y exportada en `collections` (línea 123) |
| Su esquema es `title`, `seoTitle`, `metaDescription` (máx. 160), `category?`, `tags[]`, `datePublished`, `lastUpdated?`, `author` | `src/content.config.ts:105-118` |
| **El esquema no tiene campo de idioma** | mismo bloque: no hay `lang`, `locale` ni equivalente |
| **El patrón `*.md` no es recursivo** | `glob({ pattern: '*.md', ... })`; la colección `tools` sí usa `**/*.json` para poder anidar por idioma |
| Hay exactamente un archivo | `src/content/guides/descargar-chatgpt-para-windows.md` |
| Ese archivo está escrito en español y no lo declara | frontmatter: `title: "Cómo descargar ChatGPT gratis en su sitio oficial"`, `author: "Redacción DescargasIA"`; no hay campo de idioma |
| **Ninguna página ni utilidad hace `getCollection('guides')`** | `grep -rn "getCollection(" src` devuelve solo `toolsBase`, `tools` y `categories` (`src/utils/tools.ts:51,52,106,110`, `src/pages/[lang]/categoria/[slug].astro:13`, `src/pages/r/index.astro:10`) |

Consecuencia comprobada: la colección se valida en el build pero **no genera
ninguna página**. Es contenido muerto, no contenido despublicado.

### 1.2 No existe la ruta, y el build lo confirma

`src/pages/` completo:

```
src/pages/
├── 404.astro
├── index.astro
├── llms-full.txt.ts
├── llms.txt.ts
├── search-index.json.ts
├── [lang]/
│   ├── [slug].astro            ← ficha de herramienta
│   ├── index.astro             ← portada sv/it (es queda fuera)
│   ├── acerca-de.astro · aviso-legal.astro · cookies.astro
│   ├── privacidad.astro · puedo-correr-ia.astro
│   └── categoria/[slug].astro
├── api/{catalog.json.ts, openapi.json.ts}
├── hardware/catalog.json.ts
├── md/[...path].ts             ← espejo Markdown
└── r/index.astro               ← interstitial de salida (noindex)
```

No hay `src/pages/[lang]/guias/[slug].astro` ni ningún equivalente. Coincide
con `docs/enlazado-interno.md` §7 («Pendientes conocidos»), que ya lo documenta.

Salida real de `npx astro build` sobre `0ccd3b0`:

```
196 page(s) built in 5.23s
$ find dist -path "*guias*"      → (vacío)
```

### 1.3 Cómo funcionan hoy las rutas por idioma

- `astro.config.mjs`: `i18n.defaultLocale: 'es'`, `locales: ['es','sv','it']`,
  `prefixDefaultLocale: true`, `trailingSlash: 'never'`, `output: 'static'`.
- `src/utils/links.ts` es la **fuente única de la forma de las URLs**
  (`LANGS`, `ROOT_LANG`, `langPrefix`, `homeUrl`, `toolUrl`, `categoryUrl`,
  `pageUrl`, `hardwareUrl`, `directoryUrl`, `redirectUrl`, `absolute`,
  `buildAlternates`, `CATEGORY_SEGMENT`). **No existe ningún `guideUrl`.**
- Única asimetría: la portada `es` vive en `/`, no en `/es`
  (`homeUrl`, `src/pages/[lang]/index.astro` filtra `es`, `public/_redirects`
  hace `301 /es → /`). El resto del español sí lleva prefijo.
- El segmento `categoria` **no se traduce** en ningún idioma, y `pageUrl`
  mantiene también los slugs estáticos en español (`acerca-de`,
  `puedo-correr-ia`). El motivo declarado es mantener el mapeo hreflang 1:1 sin
  tabla de traducción de rutas.
- Patrón de `getStaticPaths`: las páginas estáticas iteran
  `Object.keys(languages)` (`src/pages/[lang]/acerca-de.astro:7-11`); la ficha
  itera idioma × `getTranslatedTools(lang)`, que **devuelve solo lo traducido**
  (`src/utils/tools.ts:50-70`, `if (!localized) return null`).

Precedente relevante para guías por idioma: `tools` resuelve el idioma por
prefijo del `id` (`entry.id.startsWith('es/')`, slug = `id.split('/').slice(1)`)
gracias a que su glob es `**/*.json` sobre `src/content/tools/`. La colección
`guides` **no tiene ese mecanismo hoy**.

### 1.4 Canonical, hreflang, sitemap y enlazado

| Pieza | Dónde | Comportamiento comprobado |
|---|---|---|
| `<link rel="canonical">` | `src/layouts/BaseLayout.astro:108` | Por defecto `Astro.url.href`; es autorreferencial salvo que la página pase `canonicalUrl` |
| hreflang | `BaseLayout.astro:125-131` + `buildAlternates()` (`links.ts`) | `hreflangMap = {es:'es-ES', sv:'sv-SE', it:'it-IT'}`; cada página pasa un `pathFor(lang)` que devuelve `null` si no existe traducción |
| `x-default` | `BaseLayout.astro:131` | Solo se emite si hay alternativa `es` **de esa misma página**; si no existe ES, no se inventa |
| Selector de idioma | `BaseLayout.astro:70-78` | Usa `alternates`; si la página no existe en el idioma destino enlaza su portada |
| Sitemap | `astro.config.mjs` (`@astrojs/sitemap`) | `filter` excluye `/es`, `/ir/` y `/r`; `serialize` solo **añade `lastmod`** a URLs que el build ya generó |
| Fechas del sitemap | `scripts/get-sitemap-dates.mjs:36-56` | **Ya calcula claves `https://fuenteai.com/{lang}/guias/{slug}` para `es`, `sv` e `it`** a partir de los `.md` de `src/content/guides/` |
| Espejo Markdown | `src/utils/agent-content.ts:164-177` (`hasMarkdownMirror`) | Solo portada, fichas y categorías. Una ruta de 3 segmentos solo se reconoce si el segundo es `categoria` |
| Tarjeta OG | `src/utils/links.ts` (`defaultOgImageUrl`) + `scripts/build-og-images.mjs:241-244` | La tarjeta por idioma ya está descrita como compartida por «portadas, categorias y **guias**» |
| robots / headers | `public/robots.txt`, `public/_headers` | No mencionan guías; no bloquearían ni permitirían nada específico |

Detalle importante y comprobado: las claves de guías de
`get-sitemap-dates.mjs` **hoy no producen ninguna URL fantasma**, porque
`serialize` solo actúa sobre páginas que el build generó. Verificado:

```
$ grep -o "<loc>" dist/sitemap-0.xml | wc -l   → 194
$ grep -o "guias"  dist/sitemap-0.xml | wc -l  → 0
$ grep -o "fuenteai.com/es</loc>" dist/sitemap-0.xml | wc -l → 0
```

Es decir: el script **presupone** un mapeo 1:1 de la guía española a los tres
idiomas, pero ese presupuesto está inerte y **no ha sido validado por ninguna
decisión**.

### 1.5 Reglas de enlazado que una ruta nueva tendría que cumplir

`docs/enlazado-interno.md` §3 y §6, y `scripts/audit-internal-links.mjs`:

1. Ninguna ruta interna se escribe a mano: todo sale de `src/utils/links.ts`.
2. **Cero páginas indexables huérfanas** — y esto es un **error duro** que
   rompe el build (`audit-internal-links.mjs`, bloque «Huérfanas y cola larga»:
   `página indexable HUÉRFANA (0 enlaces internos entrantes)` → `process.exit(1)`).
3. Canonical autorreferencial (error duro si apunta a otra ruta).
4. hreflang autorreferencial y recíproco (error duro). Si una página **no emite
   ningún** `<link rel="alternate">`, el auditor la salta entera
   (`if (page.noindex || page.alternates.length === 0) continue`).
5. Falta de `x-default` → **aviso**, no error.
6. §6 «Sección nueva de páginas»: *añadir su constructor de URL a `links.ts`
   **antes** de escribir la página, y darle al menos un enlace entrante desde
   una página que ya se enlace bien.*

Detalle del auditor con efecto colateral: `isToolRoute` es
`^\/(es|sv|it)\/[^/]+$` menos `RESERVED` (`acerca-de`, `aviso-legal`,
`privacidad`, `cookies`). Una guía en `/{lang}/guias/<slug>` (3 segmentos) **no**
se contaría como ficha; pero un **índice** `/{lang}/guias` (2 segmentos) **sí**
se contabilizaría como ficha de herramienta y entraría en el cálculo de
`MIN_INLINKS` y en las estadísticas del informe.

### 1.6 Estado de validación actual (línea base reproducible)

Ejecutado en esta sesión sobre `0ccd3b0`, sin modificar nada:

```
$ npm run catalog:audit   → "Catalogo integro." (avisos de cobertura, 0 errores)
$ npm test                → 65 tests, 61 pass, 0 fail, 4 skip
$ npx astro build         → 196 page(s) built
$ npm run links:audit     → Paginas 195 | Indexables 194 | Fichas 155
                            AVISOS (2): /it/adobe-podcast, /it/opencode (4 inlinks)
                            "Sin errores de enlazado interno."
$ git status --short      → (vacío)
```

`npm run build` completo no se ejecutó a propósito: su primer paso es
`npm run shorten` (`scripts/shorten-official-links.mjs`), que **escribe sobre
el contenido**, y `agents:skills` escribe en `public/.well-known/`. Ambos
habrían modificado archivos versionados, y este encargo es de solo lectura. Los
eslabones que sí son de lectura (`catalog:audit`, `npm test`, `astro build`,
`links:audit`) se corrieron enteros y están arriba.

### 1.7 Lo que ya está especificado y espera esta decisión

- `docs/mejora/specs/sv.md` (F3-SV, issue #39): **cuatro** guías suecas
  **BLOQUEADAS** — `ai transkribering svenska`, `ai skriva text svenska`,
  `köra ai lokalt`, `ai presentation svenska`. Su «Contrato de entrada» cita
  literalmente que `docs/enlazado-interno.md` §7 confirma que no hay ruta, y su
  contrato de salida dice: *«Si Codex desbloquea la ruta pública, deberá abrir
  una fase/issue previo para ruta, SEO, enlazado y sitemap. Solo después podrá
  F4-SV redactar las guías.»*
- `docs/mejora/specs/it.md`: guías G1–G3 (`ia-locale-privacy`,
  `ollama-vs-lm-studio`, `strumenti-ai-freelance`) **BLOQUEADAS** por la misma
  decisión.
- `docs/mejora/specs/es.md`: fila 6 del research (`qué IA puedo usar sin
  conexión en mi PC`) **bloqueada** por lo mismo (línea 48 y 80).

Total: **ocho** guías especificadas y detenidas por una sola decisión abierta.

---

## 2. Propuesta de arquitectura

Lo que sigue son opciones con sus consecuencias técnicas comprobadas. **No se
elige ninguna aquí.**

### 2.1 Lo que es común a cualquier opción

Sea cual sea la forma final, el orden que impone `docs/enlazado-interno.md` §6
no cambia:

1. **Primero** el constructor de URL en `src/utils/links.ts`
   (p. ej. `GUIDES_SEGMENT` + `guideUrl(lang, slug)`), nunca una ruta a mano.
2. **Después** la página `src/pages/[lang]/guias/[slug].astro`, con
   `getStaticPaths` que itere idioma × guías **realmente existentes en ese
   idioma** — el mismo patrón `return null` que `getTranslatedTools`.
3. **A la vez**, al menos un enlace entrante desde una página ya bien enlazada
   (portada, categoría o ficha). Sin él, `links:audit` marca huérfana y **falla
   el build**.
4. `alternates` construidos con `buildAlternates(origin, (l) => existe(l) ? guideUrl(l, slug) : null)`,
   nunca una lista fija de tres idiomas.
5. El segmento: el precedente del repositorio (`categoria`, `acerca-de`,
   `puedo-correr-ia`) es **no traducir el segmento**; `guias` sería coherente
   con eso, y `docs/mejora/specs/sv.md` ya lo nombra así. Es una decisión del
   propietario, no una consecuencia técnica forzosa.

### 2.2 Dimensión de idioma en la colección — tres formas posibles

| Opción | Forma | Qué obliga a tocar | Consecuencia |
|---|---|---|---|
| **A. Subdirectorio por idioma** (paralelo a `tools/`) | `src/content/guides/<lang>/<slug>.md` | `content.config.ts`: `pattern` de `*.md` → `**/*.md`; **mover** el `.md` actual a `es/`; `get-sitemap-dates.mjs` (hoy asume plano) | Es el precedente que ya existe en el repositorio y el que `getTranslatedTools` demuestra. Permite una guía sueca sin equivalente española. Mueve un archivo existente |
| **B. Campo `lang` en el frontmatter** | `src/content/guides/<slug>.md` con `lang: 'sv'` | `content.config.ts`: añadir `lang` al esquema; añadirlo al `.md` actual | No mueve archivos, pero colisiona con el slug: dos idiomas no pueden compartir nombre de archivo, y el slug de URL habría que derivarlo aparte |
| **C. Colección por idioma** (`guidesEs`, `guidesSv`, `guidesIt`) | tres `defineCollection` | `content.config.ts` | Máxima separación entre productos lingüísticos, pero triplica el esquema y se aparta del patrón de `tools` |

Nota sobre A y B: si una guía sueca no tiene equivalente en español, `x-default`
**no se emite** (`BaseLayout.astro:131` solo lo emite si hay alternativa `es`) y
`links:audit` genera un **aviso**, no un error. Ese comportamiento es el
correcto según §3.6 de `docs/enlazado-interno.md` («solo se declara alternativa
el idioma que realmente tiene la página traducida»), pero conviene que la
decisión lo asuma explícitamente.

### 2.3 Alcance de idiomas de la primera ruta — dos formas posibles

| Opción | Qué publica | Consecuencia |
|---|---|---|
| **1. Ruta genérica `[lang]/guias/[slug]` de una vez** | Los tres idiomas comparten plantilla | Una sola plantilla, pero cualquier fase de contenido de cualquier idioma queda habilitada a la vez |
| **2. Ruta genérica, contenido habilitado por idioma** | La plantilla existe; `getStaticPaths` solo emite lo que hay escrito en ese idioma | Es lo que ya hace la ficha; `/sv/guias/<slug>` puede existir sin que exista `/es/guias/<slug>` |

La opción 2 es la que respeta literalmente la regla de
`docs/mejora/decisiones.md` de que `es`, `sv` e `it` son productos separados:
la infraestructura se comparte, el contenido no se hereda.

### 2.4 El archivo español que ya está en la colección

`src/content/guides/descargar-chatgpt-para-windows.md` es una decisión aparte
de la ruta. Al crear la ruta, ese archivo pasa de contenido muerto a **página
publicable en español** salvo que se decida lo contrario. Opciones: publicarlo
tal cual, revisarlo antes de publicarlo, o excluirlo. **No se decide aquí**, y
la spec de F3-ES no lo cubre.

### 2.5 Enlace entrante — el punto que no admite «se ve luego»

Es requisito de build, no de estilo. Candidatos que ya se enlazan bien:

- la portada del idioma (`src/components/Home.astro`), que ya tiene un bloque
  «Explora por necesidad»;
- las fichas relacionadas (`src/pages/[lang]/[slug].astro`);
- la cabecera/pie (`BaseLayout.astro`) — pero §3.9 de `docs/enlazado-interno.md`
  advierte que Google descuenta el enlace repetido de cabecera como
  boilerplate, así que un enlace de nav **no sustituye** a un enlace en cuerpo.

Cualquiera de ellos implica tocar un archivo común compartido con otros
productos lingüísticos. Es el punto de contacto que hay que negociar en la
spec.

### 2.6 Superficies para agentes — pendiente, no automático

`AGENTS.md` fija: *«Lo que lee un agente sale de la misma fuente que lee una
persona»*. Hoy `hasMarkdownMirror` (`agent-content.ts:164-177`) devuelve `false`
para una ruta de 3 segmentos cuyo segundo no sea `categoria`, y
`src/pages/md/[...path].ts` solo itera portadas, fichas y categorías. Es decir:
**una guía publicada sería visible para personas e invisible para agentes**
salvo que se decida ampliar el espejo, `llms.txt` y el catálogo JSON. Es una
decisión con coste propio; no se resuelve solo creando la ruta.

---

## 3. Archivos propios y protegidos de una futura fase de ruta

Lista derivada de la evidencia de §1, no de una suposición. La fase concreta
debe repetirla en su spec.

### 3.1 Candidatos a «archivos que posee»

| Archivo | Cambio que exigiría |
|---|---|
| `src/utils/links.ts` | Añadir `GUIDES_SEGMENT` y `guideUrl(lang, slug)`. **Requisito previo** a escribir la página (§6 de `enlazado-interno.md`) |
| `src/pages/[lang]/guias/[slug].astro` | Archivo nuevo: `getStaticPaths`, canonical autorreferencial, `alternates` vía `buildAlternates`, render del Markdown |
| `src/content.config.ts` | Solo si se elige la opción A (`**/*.md`) o B (campo `lang`) de §2.2 |
| `scripts/get-sitemap-dates.mjs` | Corregir el presupuesto de mapeo 1:1 a tres idiomas (líneas 36-56) para que solo emita fechas de guías que existan en ese idioma |
| Un archivo de enlace entrante — **exactamente uno**, elegido en la spec | `src/components/Home.astro` o `src/pages/[lang]/[slug].astro` |
| `src/i18n/ui.ts` | Solo si la sección necesita etiquetas nuevas (título de sección, miga de pan) |
| `docs/enlazado-interno.md` | §7 dice literalmente que, cuando se cree la sección, «tendrá que entrar en este documento: desde dónde se enlaza y a dónde enlaza» |
| `docs/mejora/decisiones.md` | Registrar la decisión cerrada con fecha y motivo. **Propiedad del propietario, no de la sesión ejecutora** |

### 3.2 Candidatos a PROTEGIDOS

- `src/content/tools/es/`, `src/content/tools/sv/`, `src/content/tools/it/` y
  `src/content/tools-base/` — la fase de ruta no escribe contenido.
- `src/content/guides/**` — la fase de ruta **no redacta guías**; escribirlas es
  F4-SV / F4-ES / F4-IT con alcance aprobado (`specs/sv.md`, «Fuera de alcance»).
- `docs/mejora/specs/es.md`, `docs/mejora/specs/sv.md`, `docs/mejora/specs/it.md`
  y `docs/mejora/research/*.md` — propiedad de sus fases (matriz de
  `decisiones.md`).
- `public/robots.txt`, `public/_headers`, `public/.well-known/` — protegidos por
  `AGENTS.md` y por la fila F5 de la matriz de `decisiones.md`.
- `astro.config.mjs` — el `filter` del sitemap no necesita cambiar: una guía
  indexable **debe** entrar en el sitemap. Tocarlo sería señal de que algo se
  está excluyendo sin decisión.
- `worker/`, `src/utils/agent-content.ts`, `src/pages/md/[...path].ts`,
  `src/pages/llms*.ts` — salvo que la decisión de §2.6 se cierre a favor de
  ampliar las superficies de agentes, en cuyo caso son de otra fase con
  criterios propios.
- `scripts/audit-internal-links.mjs` y `scripts/audit-catalog.mjs` — **no se
  ajusta el auditor para que pase la ruta nueva.** Si el auditor falla, falla
  la ruta.
- `package.json`, `package-lock.json`, `.github/workflows/`.

---

## 4. Criterios SDD de aceptación propuestos

Redactados para que salgan 0/1 o sean `[manual]` reproducibles, según
`docs/mejora/templates/spec-fase.md`. Se proponen para que el propietario los
apruebe o los corrija; **no están ejecutados**, porque la ruta no existe.

### 4.1 Automáticos

- [ ] `node -e "const s=require('fs').readFileSync('src/utils/links.ts','utf8');process.exit(/export function guideUrl\(/.test(s)?0:1)"` sale 0: el constructor de URL existe antes que la página.
- [ ] `node -e "const fs=require('fs');const p='src/pages/[lang]/guias/[slug].astro';const s=fs.readFileSync(p,'utf8');process.exit(/guideUrl/.test(s)&&/buildAlternates/.test(s)?0:1)"` sale 0: la página usa el helper y construye hreflang con `buildAlternates`, no a mano.
- [ ] `grep -rnE 'href=\{?"?/(es|sv|it)/guias/' src/ ; test $? -eq 1` sale 0: ninguna ruta de guía escrita a mano en el código.
- [ ] `npm run catalog:audit` sale 0.
- [ ] `npm test` sale 0 y el número de tests es ≥ el de la línea base (65) — la fase añade tests, no los quita.
- [ ] `npm run build` sale 0 **entero**, incluidos `astro build`, `test:build` y `links:audit`.
- [ ] `npm run links:audit` sale 0 y su informe **no** contiene la cadena `HUÉRFANA` (el enlace entrante existe de verdad).
- [ ] `node -e "const fs=require('fs');const g=fs.readdirSync('dist/sv/guias');process.exit(g.length>0?0:1)"` sale 0 si la decisión habilita `sv`: la ruta sueca se genera.
- [ ] `node -e "const fs=require('fs');const h=fs.readFileSync('dist/sv/guias/<slug>/index.html','utf8');process.exit(h.includes('<link rel=\"canonical\" href=\"https://fuenteai.com/sv/guias/<slug>\"')?0:1)"` sale 0: canonical autorreferencial.
- [ ] `node -e "const fs=require('fs');const x=fs.readFileSync('dist/sitemap-0.xml','utf8');process.exit(x.includes('/sv/guias/<slug>')?0:1)"` sale 0: la guía publicada entra en el sitemap.
- [ ] `node -e "const fs=require('fs');const x=fs.readFileSync('dist/sitemap-0.xml','utf8');const m=x.match(/<loc>[^<]*\/guias\/[^<]*<\/loc>/g)||[];const d=fs.existsSync('dist/es/guias')?1:0;process.exit(m.length===<n esperado>?0:1)"` sale 0: **no hay URL de guía en el sitemap sin página generada** — cierra el presupuesto 1:1 de `get-sitemap-dates.mjs`.
- [ ] Test nuevo en `tests/`: para cada guía generada, todo `hreflang` declarado apunta a una ruta que existe en `dist/` y es recíproca. (Duplica a propósito una comprobación de `links:audit` a nivel de unidad, para que falle antes del build completo.)

### 4.2 Manuales

- [ ] `[manual]` **Separación entre productos lingüísticos:** 1. generar el build; 2. abrir `dist/sv/guias/<slug>/index.html`; 3. resultado esperado: todo el texto visible está en sueco, `<html lang="sv">`, y ninguna cadena procede de `src/content/guides/` en español.
- [ ] `[manual]` **Ausencia de traducción:** 1. publicar una guía en un solo idioma; 2. inspeccionar su bloque `<link rel="alternate">`; 3. resultado esperado: se lista a sí misma, no lista idiomas inexistentes, y si no hay versión ES **no** se emite `x-default` (aviso aceptado, no error).
- [ ] `[manual]` **Enlace entrante real:** 1. buscar en `dist/` qué páginas enlazan la guía; 2. resultado esperado: al menos un enlace desde el **cuerpo** de una página ya bien enlazada, no solo desde cabecera o pie (§3.9 de `docs/enlazado-interno.md`).
- [ ] `[manual]` **Superficies para agentes:** 1. pedir `/md/sv/guias/<slug>.md`; 2. resultado esperado: **el declarado por la decisión de §2.6**. Si se decidió no ampliar el espejo, la página no debe anunciar `<link rel="alternate" type="text/markdown">` (hoy `hasMarkdownMirror` ya devuelve `false`, así que el comportamiento por defecto es coherente).
- [ ] `[manual]` **Diff acotado:** 1. `git diff --name-only main...HEAD`; 2. resultado esperado: solo los archivos declarados como propios en la spec; ningún archivo de `src/content/tools/`, `public/` ni `scripts/audit-*`.

---

## 5. Riesgos y decisiones pendientes

### 5.1 Riesgos

| Riesgo | Evidencia que lo detecta | Nota |
|---|---|---|
| **Contenido español servido bajo URL sueca.** `get-sitemap-dates.mjs:46-53` ya asume que una guía se mapea a los tres idiomas. Si la ruta se crea sin dimensión de idioma en la colección, `/sv/guias/descargar-chatgpt-para-windows` renderizaría español con `<html lang="sv">` | El criterio manual §4.2 «Separación entre productos lingüísticos»; ningún test automático actual lo vería | Es el riesgo con más consecuencias: rompe a la vez la separación de productos de `decisiones.md` y la coherencia idioma/contenido que Google evalúa |
| **URL en el sitemap sin página generada.** Hoy es inocuo porque `serialize` solo toca páginas existentes; deja de serlo si alguien usa esas claves como fuente de URLs | El criterio automático de conteo de `/guias/` en el sitemap | Comprobado hoy: 0 apariciones de `guias` en `dist/sitemap-0.xml` |
| **Página huérfana → build roto.** Toda página indexable necesita ≥1 enlace entrante | `links:audit`, error duro `process.exit(1)` | No es un riesgo de SEO diferido: la primera fase que cree la ruta sin enlace no llega a desplegar |
| **hreflang no recíproco.** Si una guía declara alternativa a un idioma que no la tiene, es error duro | `links:audit`, bloque hreflang | Se evita usando `buildAlternates` con `pathFor` que devuelva `null` |
| **Thin content por variante de búsqueda.** `docs/mejora/specs/sv.md`, regla común 7, y `docs/plan-mejora-productos-por-idioma.md:71` prohíben una página por variante | Revisión editorial; ningún script lo detecta | La ruta habilita ocho guías a la vez (§1.7): el riesgo escala con la decisión |
| **Canibalización con las fichas.** Una guía «köra ai lokalt» compite con las fichas suecas de `ollama`, `lm-studio` y `jan`, ya indexadas | Search Console (#50), que **hoy no aporta datos** | Los tres runtimes tienen ficha; la spec sueca lo asume pero no lo mide |
| **Un índice `/{lang}/guias` se contaría como ficha** en el auditor (`isToolRoute` casa rutas de 2 segmentos) | Informe de `links:audit`: cambia el conteo «Fichas de herramienta» y el aviso `MIN_INLINKS` | Solo aplica si se decide crear índice además de detalle |
| **Guías invisibles para agentes** pese al principio de `AGENTS.md` | `hasMarkdownMirror` devuelve `false`; `md/[...path].ts` no las itera | §2.6. No es un fallo del build, es una incoherencia de producto |
| **Se toca un archivo común para desbloquear un idioma.** El enlace entrante y `links.ts` son compartidos por `es`, `sv` e `it` | Matriz de propietarios de `decisiones.md`; el criterio manual de diff acotado | La regla de bloqueo de `decisiones.md` dice: si una fase necesita editar un protegido, la spec está mal cortada |
| **Publicar el `.md` español existente sin revisión editorial** al crear la ruta | El criterio de diff y el conteo de páginas del build (196 → 196+n) | §2.4. Nadie ha decidido su destino |

### 5.2 Decisiones pendientes — todas del propietario

1. **¿Se crea la ruta pública de guías?** Es la decisión abierta literal de
   `docs/mejora/decisiones.md`. Bloquea ocho guías especificadas (§1.7).
2. **¿Qué forma toma la dimensión de idioma?** A (subdirectorio), B (campo
   `lang`) o C (colecciones separadas) — §2.2.
3. **¿El segmento se traduce o se mantiene `guias` en los tres idiomas?**
   El precedente del repositorio es no traducirlo; la spec sueca ya escribe
   `guias`.
4. **¿La ruta habilita los tres idiomas o solo el que tenga contenido escrito?**
   §2.3.
5. **¿Qué pasa con `descargar-chatgpt-para-windows.md`?** §2.4.
6. **¿Desde dónde se enlaza la primera guía?** §2.5. Determina qué archivo
   común deja de estar protegido y para qué fase.
7. **¿Se amplían las superficies para agentes (espejo Markdown, `llms.txt`,
   catálogo JSON) a las guías?** §2.6.
8. **¿Se amplía el contrato de eventos de F1 para guías?**
   `docs/mejora/specs/sv.md`, regla común 6, prohíbe inventar `guide_view`;
   `specs/it.md:483` menciona `guida_view` como pendiente. Sin ampliación
   autorizada, una guía se publica sin métrica de funnel propia y eso debe
   reportarse.
9. **¿Se abre una fase/issue de ruta antes de F4-SV?** El contrato de salida de
   `docs/mejora/specs/sv.md` lo exige explícitamente.

---

## 6. Blocker

**No se puede pasar de esta propuesta a una implementación con la información
disponible en el repositorio.** El blocker es de decisión, no de acceso ni de
herramientas: el build, los tests y las auditorías funcionan y están en verde
(§1.6).

**Blocker concreto:**

> La decisión «Si las guías de intención necesitan una ruta pública antes de
> desbloquearse» sigue abierta en `docs/mejora/decisiones.md` («Decisiones
> abiertas», responsable **F3/Codex**), y ninguna de las nueve preguntas de §5.2
> tiene respuesta registrada en el repositorio.

**Por qué bloquea de verdad, y no es una formalidad:**

1. `docs/mejora/decisiones.md` dice: *«No se rellenan estas celdas con un
   proveedor, país, URL o credencial inventados. La decisión cerrada debe entrar
   aquí con fecha y motivo antes de que la fase bloqueada la use.»*
2. `docs/mejora/specs/sv.md`, «Fuera de alcance», prohíbe *«cerrar el bloqueo
   por iniciativa propia»* y exige *«una fase/issue de ruta antes de que F4-SV
   pueda redactar»*.
3. `docs/mejora/decisiones.md` cierra la sección «Límites por producto» con:
   *«Las rutas, canonical, hreflang, robots y el selector de idioma no se
   cambian como consecuencia de F0. Si una fase los necesita, debe tener una
   autorización explícita y criterios propios.»* La ruta de guías toca rutas,
   canonical y hreflang a la vez.

**Qué desbloquea qué, en orden:**

| Para desbloquear | Hace falta |
|---|---|
| Redactar la spec de la fase de ruta | Respuesta a §5.2.1 (¿se crea?) registrada en `decisiones.md` con fecha y motivo |
| Cerrar «Archivos que posee» de esa fase | Respuestas a §5.2.2, §5.2.3, §5.2.4 y §5.2.6 |
| Ejecutar la fase de ruta | La fase/issue previa que exige `specs/sv.md`, con sus criterios propios |
| F4-SV (redactar las cuatro guías suecas) | La ruta fusionada en `main` + §5.2.5 y §5.2.8 resueltas |
| Declarar éxito SEO medido de una guía | Search Console (#50), que hoy no aporta entradas |

**Lo que esta sesión no hizo, a propósito:** no creó rutas, guías, fichas,
helpers ni cambios de arquitectura; no cerró ninguna decisión abierta; no editó
`docs/mejora/decisiones.md` ni ninguna spec; no ejecutó `npm run build`
completo porque su primer eslabón escribe sobre contenido versionado.
