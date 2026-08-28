# Enlazado interno de FuenteAI

Este documento es la referencia única del enlazado interno del sitio: qué forma
tienen las URLs, quién enlaza a quién, qué reglas no se pueden romper y cómo
comprobarlo automáticamente.

**Si vas a tocar rutas, navegación, hreflang o bloques de enlaces, lee esto
antes.** Y después ejecuta:

```bash
npm run build && npm run links:audit
```

---

## 1. Mapa de URLs

Tres idiomas: `es` (por defecto), `sv`, `it`.

| Tipo de página | es | sv | it |
| --- | --- | --- | --- |
| Portada | `/` | `/sv` | `/it` |
| Ficha de herramienta | `/es/<slug>` | `/sv/<slug>` | `/it/<slug>` |
| Categoría | `/es/categoria/<slug>` | `/sv/categoria/<slug>` | `/it/categoria/<slug>` |
| Estáticas | `/es/acerca-de`, `/es/privacidad`, … | `/sv/…` | `/it/…` |
| Índice de guías | `/es/guias` | `/sv/guias` | `/it/guias` |
| Guía | `/es/guias/<slug>` | `/sv/guias/<slug>` | `/it/guias/<slug>` |
| Interstitial de salida | `/r?t=&p=&l=` (noindex, común a los tres) | | |

Las guías **solo se generan en el idioma en el que existe su archivo**, y el
índice de un idioma solo se genera si ese idioma tiene al menos una guía. Hoy
eso significa que existen `/es/guias` y `/es/guias/descargar-chatgpt-para-windows`
y **no existen** `/sv/guias` ni `/it/guias`. Ver §8.

### La única asimetría: la portada en español vive en `/`, no en `/es`

Es deliberada y está aislada en `homeUrl()` (`src/utils/links.ts`).

**Por qué existía el problema.** `astro.config.mjs` usa
`i18n.routing.prefixDefaultLocale: true`, así que Astro generaba también `/es`.
Su canonical apuntaba a `https://fuenteai.com` y el sitemap la excluía —o sea,
el sitio ya consideraba `/` la portada canónica— pero **todos** los enlaces
internos (logo, contador de cabecera, menú móvil, migas de pan, botón de
categoría vacía, `/r`) apuntaban a `/es`.

Medido sobre el build anterior al cambio:

```
  98 enlaces entrantes -> /es   (duplicada, excluida del sitemap)
   0 enlaces entrantes -> /     (canónica, la que está indexada)
```

La URL canónica del sitio era huérfana en su propio grafo.

**Cómo quedó.** `/es` ya no se genera (`src/pages/[lang]/index.astro` filtra
`es` en `getStaticPaths`) y `public/_redirects` la redirige 301 a `/`. Todos los
enlaces internos a la portada pasan por `homeUrl(lang)`.

**Por qué `/` y no `/es`.** `/` es la URL ya indexada y la que recibe los
enlaces externos. Mover la portada a `/es` habría obligado a redirigir la
entrada principal del sitio sin ganar nada; el resto del español sí lleva
prefijo (`/es/chatgpt`), que es lo que mantiene el mapeo hreflang 1:1.

### Los segmentos `categoria` y `guias` no se traducen

En los tres idiomas son `categoria` y `guias`. Traducirlos (`kategori`,
`guider`, `guide`) no aporta nada a Google —el idioma se declara con `hreflang`
y el contenido de la página— y sí obligaría a una tabla de traducción de rutas,
rompería URLs ya indexadas y complicaría el mapeo entre idiomas. Viven en
`CATEGORY_SEGMENT` y `GUIDES_SEGMENT` (`src/utils/links.ts`) por si algún día se
decide lo contrario.

---

## 2. Quién enlaza a quién

```
                         ┌──────────────────────────┐
    cabecera y pie ──────► en TODAS las páginas:     │
    (BaseLayout)         │  portada del idioma       │
                         │  8 categorías (menú)      │
                         │  4 legales (pie)          │
                         │  las otras 2 lenguas      │
                         └──────────────────────────┘

    PORTADA  ─┬─► las ~90 fichas del idioma      (rejilla del directorio)
              └─► las 8 categorías               ("Explora por necesidad")

    CATEGORÍA ┬─► sus fichas                     (rejilla)
              ├─► las otras 7 categorías         (chips superiores)
              └─► portada                        (miga de pan)

    GUÍAS     ┬─► índice de guías del idioma    (cabecera, solo si hay guías)
              ├─► índice ──► sus guías          (tarjetas)
              └─► guía ──► índice + portada     (miga de pan y pie de la guía)

    FICHA     ┬─► portada + categoría principal  (miga de pan)
              ├─► TODAS sus categorías           (chips "Aparece en")
              ├─► 6 alternativas                 (declaradas + relleno rotado)
              ├─► categoría principal            ("Ver todas las herramientas de…")
              ├─► 4 fichas afines                ("Sigue explorando el catálogo")
              └─► portada                        (cierre)
```

Los tres bloques de enlaces de la ficha —chips, alternativas y "sigue
explorando"— existen porque el grafo anterior dejaba las fichas casi aisladas.

### El reparto hacia la cola larga (`src/utils/related.ts`)

El bloque de alternativas rellenaba los huecos con
`allTools.filter(misma categoría).slice(0, 6)`, siempre en el mismo orden. En
una categoría de 17 fichas eso significa que las 6 primeras se llevan todos los
enlaces y las 11 restantes ninguno. Además, 24 de las 83 herramientas del
catálogo no estaban citadas como alternativa por nadie.

Ahora el relleno **rota de forma determinista** según el slug de la ficha de
origen (`rotateBySeed`): cada ficha empieza a recorrer la lista en un punto
distinto, así que los enlaces se reparten por toda la categoría. Sigue siendo
estático —mismo HTML en cada build, sin aleatoriedad que despiste a Google— y
las alternativas declaradas a mano en `tools-base/<slug>.json` siempre van
primero, porque son la relación con más valor semántico.

**Efecto medido, enlaces internos entrantes por ficha:**

| | antes | después |
| --- | --- | --- |
| mínimo | 2 | 4 |
| media | ~3 | 11.6 |
| portada canónica `/` | 0 | 97 |

---

## 3. Reglas que no se rompen

Las comprueba `npm run links:audit`; las que no se pueden automatizar están
marcadas con ✋.

1. **Ninguna ruta interna se escribe a mano.** Todo enlace interno sale de
   `src/utils/links.ts` (`homeUrl`, `toolUrl`, `categoryUrl`, `pageUrl`,
   `directoryUrl`, `guideIndexUrl`, `guideUrl`, `redirectUrl`). Si aparece un
   `` href={`/${lang}/algo`} `` en una página, es un bug: el día que cambie el
   patrón de URLs habrá que buscarlo a mano. **Única excepción documentada:** el
   cuerpo Markdown de una guía, que no puede llamar a un helper. Ver §7.
2. **Cero enlaces a URLs no canónicas.** Un enlace interno a algo que redirige
   o que se canonicaliza a otra URL es señal que se pierde en el salto.
3. **Cero páginas indexables huérfanas.** Toda página que se genera y no es
   `noindex` recibe al menos un enlace interno.
4. **Canonical autorreferencial.** Si una página se genera, es canónica de sí
   misma. Si su canonical apunta a otro sitio, no debería generarse.
5. **hreflang autorreferencial y recíproco.** Cada versión se lista a sí misma
   además de a las demás, y si A declara a B, B declara a A. Si falta cualquiera
   de las dos, Google descarta el bloque entero.
6. **`x-default` apunta a la versión ES de ESA página**, nunca a la portada. Y
   solo se declara alternativa el idioma que realmente tiene la página
   traducida: una ficha sin traducir no se anuncia como alternativa.
7. **`/r` siempre con `rel="nofollow"`** y bloqueado en `robots.txt`. Es
   `noindex` y multiplica URLs por querystring: enlazarlo hace falta,
   rastrearlo no aporta nada.
8. ✋ **Texto de ancla descriptivo.** El ancla dice a dónde lleva: el nombre de
   la herramienta, el nombre de la categoría. Nada de "aquí", "ver más" o
   "clic". Es lo que Google usa para entender el destino.
9. ✋ **Los filtros del directorio son `<button>`, no enlaces.** Filtran en
   cliente y no crean URLs indexables. Por eso la portada tiene además el
   bloque "Explora por necesidad" con enlaces reales a las 8 categorías: sin él
   las páginas de categoría solo recibirían el enlace repetido de la cabecera,
   que Google descuenta como boilerplate.

---

## 4. Dónde se toca cada cosa

| Archivo | Responsabilidad |
| --- | --- |
| `src/utils/links.ts` | **Forma de todas las URLs internas** y construcción de hreflang (`buildAlternates`). Punto único de cambio. |
| `src/utils/related.ts` | Reparto de enlaces entre fichas: alternativas y "sigue explorando". |
| `src/layouts/BaseLayout.astro` | Cabecera, pie, selector de idioma, `<link rel=canonical>` y bloque hreflang. |
| `src/components/Home.astro` | Portada: rejilla del directorio + bloque "Explora por necesidad". |
| `src/components/ToolCard.astro` | Enlace de tarjeta hacia la ficha. |
| `src/pages/[lang]/[slug].astro` | Ficha: miga de pan, chips de categoría, alternativas, "sigue explorando". |
| `src/pages/[lang]/categoria/[slug].astro` | Categoría: miga de pan, chips de otras categorías, rejilla. |
| `src/pages/[lang]/index.astro` | Excluye `es` de `getStaticPaths` (la portada ES es `/`). |
| `src/utils/guides.ts` | Lectura de la colección `guides`: idioma y slug derivados del id real, qué idiomas tienen guías y en cuáles existe un slug. |
| `src/pages/[lang]/guias/index.astro` | Índice de guías del idioma. Solo se genera si ese idioma tiene guías. |
| `src/pages/[lang]/guias/[slug].astro` | Guía: miga de pan, cuerpo Markdown renderizado, JSON-LD `Article`, vuelta al índice. |
| `scripts/satteri-guide-links.mjs` | Plugin hast que fuerza `rel="nofollow"` en los enlaces a `/r` escritos dentro del Markdown de una guía. |
| `public/robots.txt` | Bloqueo de `/r` y de los parámetros del filtro; declaración del sitemap. |
| `public/_redirects` | `301 /es → /`. |
| `astro.config.mjs` | Filtro del sitemap (fuera `/es` y `/r`). |
| `scripts/audit-catalog.mjs` | Integridad del contenido fuente: base sin traducir, slugs de `alternatives` inexistentes, categorías fantasma, cobertura por idioma. |
| `scripts/audit-internal-links.mjs` | Auditoría del grafo de enlaces sobre el build. |

---

## 5. Las dos auditorías

```bash
npm run build             # encadena las dos, en orden
npm run catalog:audit     # integridad del contenido fuente (rapida, sin build)
npm run links:audit       # grafo de enlaces sobre el dist/ existente
```

Son dos porque miran cosas distintas, y una no puede ver lo de la otra:

| | `catalog:audit` | `links:audit` |
| --- | --- | --- |
| Mira | `src/content/` | `dist/` |
| Cuándo | antes de compilar | después de compilar |
| Detecta | contenido que **no llega a existir** | enlaces, canonical y hreflang |

La distinción importa. Si una ficha de `tools-base/` no tiene traducción,
`getTranslatedTools()` hace `return null` y la ficha no se renderiza **en
ningún idioma**, sin error de Astro. Como no se genera ninguna página, tampoco
se rompe ningún enlace: `links:audit` no puede verlo. Lo mismo con un slug mal
escrito en `alternatives`, que `getAlternatives()` descarta en silencio.

Las dos salen con **código 1** ante un error duro, así que rompen el build y,
con él, el deploy. Los **avisos** no rompen nada: son señales de calidad.

Salida esperada hoy de `links:audit`:

```
--- Auditoria de enlazado interno ---
Paginas en dist:        197
Indexables:             196
Fichas de herramienta:  155
Enlaces entrantes por ficha: min 4 | media 12.6 | max 101

AVISOS (2):
  ! /it/adobe-podcast: solo 4 enlaces internos entrantes (minimo deseado 5)
  ! /it/opencode: solo 4 enlaces internos entrantes (minimo deseado 5)

Sin errores de enlazado interno.
```

`/{lang}/guias` no entra en el recuento de "fichas de herramienta": aunque su
ruta tenga dos segmentos, no es una ficha. Está en `RESERVED`
(`scripts/audit-internal-links.mjs`), junto a las páginas legales.

### Qué significa cada error de `catalog:audit`

| Mensaje | Qué pasó | Cómo se arregla |
| --- | --- | --- |
| `sin ninguna traducción` | Hay `tools-base/<slug>.json` pero ningún `tools/<lang>/<slug>.json`. La ficha no existe en el sitio. | Escribir al menos la versión ES. |
| `no existe tools-base/<slug>.json` | Hay copy localizado sin datos base. Se ignora entero. | Crear la ficha base, o borrar el JSON localizado. |
| `alternatives apunta a X` | Slug inexistente. Se descarta al renderizar sin avisar. | Corregir el slug en `tools-base/`. |
| `la categoría X no está en CATEGORIES` | Categoría que no existe en `brand.ts`. La ficha no sale en ninguna página de categoría. | Usar un slug válido, o dar de alta la categoría. |
| `se genera pero nadie la enlaza` | Categoría con JSON en `content/categories/` que falta en `CATEGORIES`. | Añadirla a `CATEGORIES` en `brand.ts`. |

Sus avisos van agrupados por clase con un par de ejemplos; `npm run catalog:audit -- --verbose` los lista todos. Los tres grupos:

- **Relaciones editoriales que se pierden por falta de traducción.** La alternativa existe en `tools-base/` pero no en ese idioma. El bloque no queda vacío —el relleno rotado lo completa— pero se pierde la relación que eligió el equipo.
- **Fichas que nadie cita en `alternatives`.** Dependen solo del relleno rotado. Se arregla citándolas desde fichas afines.
- **Categorías con poca cobertura.** Menos de `MIN_PER_CATEGORY` fichas traducidas en un idioma: bloques de alternativas cortos y página de categoría pobre. Es la lista de qué traducir a continuación.

### Qué significa cada error de `links:audit`

| Mensaje | Qué pasó | Cómo se arregla |
| --- | --- | --- |
| `enlace interno roto -> X` | Se enlaza una ruta que el build no genera. | Corregir el enlace, o generar la página. |
| `enlaza a X, que es una redirección` | El enlace pasa por `_redirects`. | Enlazar al destino final, vía helper de `links.ts`. |
| `página indexable HUÉRFANA` | Se genera pero nadie la enlaza. | Enlazarla desde donde corresponda, o marcarla `noindex`. |
| `el canonical apunta a X` | La página se genera pero se canonicaliza a otra. | O deja de generarse, o su canonical es ella misma. |
| `falta la autorreferencia hreflang` | El bloque hreflang no se lista a sí mismo. | Usar `buildAlternates()`, que la incluye por construcción. |
| `hreflang no recíproco con X` | A declara a B pero B no declara a A. | Ver por qué difieren; suele ser una traducción que falta. |
| `enlace a /r sin rel="nofollow"` | Enlace de salida sin nofollow. | Añadir `rel="nofollow noopener noreferrer"`. |
| `solo N enlaces entrantes` (aviso) | Ficha en la cola larga del grafo. | Citarla como `alternatives` en fichas afines de `tools-base/`. |

El umbral de aviso es `MIN_INLINKS` en `scripts/audit-internal-links.mjs`.

---

## 6. Recetas

**Ficha nueva (o 40).** No hay que tocar nada del enlazado, ni volver a este
documento: el grafo se deriva del catálogo, así que cada ficha entra sola en la
portada, en su categoría, en el reparto rotado, en el sitemap y en el hreflang.
Lo único manual que aporta valor es citarla en el campo `alternatives` de 2–3
fichas afines de `tools-base/` — las declaradas siempre van primero. Después,
`npm run build`: si algo quedó a medias, las auditorías lo dicen con nombre y
apellido en vez de publicarse en silencio.

**Traducción nueva de una ficha existente.** Basta con crear
`src/content/tools/<lang>/<slug>.json`: el hreflang la detecta sola
(`getTranslatedTool` decide qué idiomas se declaran alternativos).

**Categoría nueva.** Añadirla a `CATEGORIES` en `src/utils/brand.ts` (con las
tres traducciones) y crear `src/content/categories/<slug>.json`. Entra sola en
la cabecera, en el bloque "Explora por necesidad", en los chips de categoría y
en las migas de pan.

**Guía nueva.** Crear `src/content/guides/<lang>/<slug>.md` con el frontmatter
del esquema (`src/content.config.ts`). No hay que tocar rutas ni enlaces: el
índice del idioma la lista sola, el hreflang detecta en qué idiomas existe ese
slug, el sitemap le pone `lastmod` desde `lastUpdated`/`datePublished` y la
cabecera del idioma empieza a mostrar el enlace al índice en cuanto hay una
guía. Si es la primera guía de un idioma, ese `/{lang}/guias` empieza a
generarse en el mismo build.

**Idioma nuevo.** Añadirlo a `languages` (`src/i18n/ui.ts`), a `i18n.locales`
(`astro.config.mjs`), a `LANGS` (`src/utils/links.ts`), a `Lang`
(`src/utils/brand.ts`), a `hreflangMap` y `ogLocaleMap` (`BaseLayout.astro`) y a
`HREFLANG_BY_LANG` (`scripts/audit-internal-links.mjs`). El resto es automático.

**Sección nueva de páginas.** Añadir su constructor de URL a `links.ts` **antes**
de escribir la página, y darle al menos un enlace entrante desde una página que
ya se enlace bien (portada, categoría o ficha). Si no, la auditoría la marcará
huérfana.

---

## 7. La sección de guías

### Convención de contenido

```
src/content/guides/<lang>/<slug>.md
```

El loader de `guides` es un glob **recursivo** (`**/*.md`), así que el id del
documento es la ruta relativa sin extensión: `es/descargar-chatgpt-para-windows`.
De ahí salen el idioma y el slug (`src/utils/guides.ts`). El idioma **no** se
lee del frontmatter a propósito: si se leyera, un error de copia publicaría una
guía en español bajo `/sv/`. Con la carpeta como fuente de verdad eso es
imposible — si no hay archivo, no hay página.

Un documento cuyo id no sea `<lang>/<slug>` con un idioma conocido se descarta
en silencio, igual que hace `getTranslatedTools()` con una ficha sin traducir.
`tests/guias-rutas.test.mjs` falla si aparece un `.md` suelto en la raíz de
`src/content/guides/` o una carpeta con un idioma desconocido.

### Enlaces entrantes

El índice de guías del idioma se enlaza desde la **cabecera** (menú de
escritorio y menú móvil), y solo cuando ese idioma tiene guías: si no las
tiene, el índice no se genera y enlazarlo sería un enlace roto. La condición
vive en `BaseLayout.astro` (`guidesIndex`). Cada guía recibe su enlace del
índice, y devuelve dos: la miga de pan y el botón de vuelta del pie, ambos
construidos con `guideIndexUrl()`.

### Índices vacíos

**Un idioma sin guías no publica índice.** Un `/sv/guias` vacío sería una
página indexable sin contenido y, por construcción, huérfana: `links:audit` la
marcaría. Si algún día se quisiera publicar el índice antes que las guías,
tendría que ser `noindex` y con una decisión escrita en
`docs/mejora/decisiones.md`; hoy no la hay.

### hreflang y sitemap

`buildAlternates()` recibe la lista de idiomas en los que ese slug existe de
verdad (`getLangsForGuideSlug`, o el mapa que arma `getStaticPaths`), así que
una guía solo en español declara una única alternativa: ella misma, más el
`x-default` que apunta a la versión ES. `scripts/get-sitemap-dates.mjs` recorre
las carpetas localizadas y pone `lastmod` solo en la URL del idioma cuyo
archivo existe — antes copiaba la fecha de la guía española a `/sv/guias/…` e
`/it/guias/…`, URLs que ni siquiera se generan.

### El cuerpo Markdown

La guía se renderiza con el mecanismo oficial de Astro Content
(`render(entry)` + `<Content />`), nunca con `set:html` sobre el Markdown
crudo. El estilo del cuerpo es `.fai-guide-body` (`src/styles/global.css`).

**La única excepción a la regla 1 vive aquí.** El cuerpo de una guía es
Markdown y no puede llamar a los helpers de `links.ts`: sus enlaces internos se
escriben literales. Eso obliga a dos cosas:

- Los enlaces a `/r` los marca `scripts/satteri-guide-links.mjs`, un plugin
  hast enganchado al procesador Sätteri en `astro.config.mjs`. La regla 7
  (`rel="nofollow"` en `/r`) se cumple sin depender de quien escriba la guía.
- Los enlaces a fichas y secciones se escriben con el patrón documentado en §1
  (`/es/<slug>`), y `links:audit` los rompe si el destino no existe. Es la red
  de seguridad: no hay helper, pero sí auditoría.

---

## 8. Pendientes conocidos

- **`/404` está solo en español** y con clases de un sistema de diseño anterior
  (`brand-*` en vez de `fai-*`). No afecta al enlazado indexable —es `noindex`—
  pero un visitante sueco o italiano cae en una página en español.
- **Un aviso permanente de cola larga.** Siempre habrá 1–2 fichas justo por
  debajo del umbral; el aviso es informativo, no un fallo.
