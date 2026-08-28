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
existen `/es/guias` (1 guía) y `/sv/guias` (4 guías, F4-SV/#43); **no existe**
`/it/guias`, porque no hay ninguna guía italiana. Ver §8.

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
              ├─► hasta 4 guías del idioma       (las que ya la enlazan; derivado)
              ├─► índice de guías del idioma     (solo si hay bloque de guías)
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

### Reciprocidad declarada (F5, #42)

El relleno rotado reparte, pero no expresa ninguna decisión editorial: cambia en
cuanto entra una ficha nueva en la categoría. F5 comprobó que **24 fichas** no
aparecían en el `alternatives` de ninguna otra y dependían solo de esa rotación.

La regla que las sacó de ahí no inventa relaciones: **si A ya declara a B como
alternativa, se añade A al `alternatives` de B**. La ficha padre se elige de
forma determinista entre las que la huérfana ya declara —comparte categoría,
tiene menos alternativas declaradas, desempate por el orden editorial del
array— y nunca se superan las 6 declaradas que consume `getAlternatives()`.

Dos consecuencias que conviene tener presentes antes de repetir la operación:

- **El presupuesto de enlaces por ficha es fijo** (6 alternativas + 4 "sigue
  explorando"). Declarar una relación **desplaza** un hueco del relleno, no crea
  un enlace nuevo: la media apenas se movió (11,66 → 11,67). Lo que mejora es la
  *naturaleza* del enlace, no el volumen.
- **`alternatives` es común a los tres productos.** Vive en `tools-base/`, así
  que una relación se aplica a `es`, `sv` e `it` a la vez y se materializa solo
  donde ambas fichas están traducidas. No existe un `alternatives` por idioma.

`sora` queda fuera de la regla a propósito: tiene `status: "discontinued"` y
citarlo como alternativa sería un claim falso. Ver `docs/mejora/fases/F5.md`.

### Descubrimiento de guías (F5.1, #85)

El grafo era unidireccional: la guía enlazaba hacia fichas y categorías, y
ninguna devolvía el enlace. Las cinco guías publicadas recibían **un solo
entrante**, el de su índice, que a su vez solo se enlaza desde la cabecera —y
la cabecera es boilerplate—. Ese es el diagnóstico de #83.

La ficha cierra ahora el circuito con un bloque derivado: **las guías de ESTE
idioma cuyo Markdown ya enlaza esta ficha**. No hay lista nueva que mantener.
`src/utils/guide-links.ts` invierte la relación leyendo el cuerpo de cada guía
y reconociendo exactamente dos formas de destino:

| Forma | Quién la produce | Qué se exige |
| --- | --- | --- |
| `/{lang}/{slug}` | `toolUrl()` | dos segmentos exactos, `lang` = idioma de la carpeta de la guía, `slug` en el catálogo traducido de ese idioma |
| `/r?t={slug}&…&l={lang}` | `redirectUrl()` | `l` = idioma de la guía, `t` en el catálogo traducido de ese idioma |

Todo lo demás se descarta. Tres segmentos (`/sv/categoria/…`, `/sv/guias/…`)
no encajan en el patrón; `/es/acerca-de` encaja pero no es una ficha y muere
al contrastarlo contra el catálogo. **No se usa `category`, ni `tags`, ni el
título, ni coincidencia por texto libre**: una heurística así inventaría
relaciones que nadie escribió, y el frontmatter `category` de las guías es hoy
el literal `"guias"`, que no es una categoría del catálogo (ver #83).

Dos consecuencias de diseño:

- **Es imposible generar un enlace roto.** El slug de la ficha sale del
  catálogo real y el de la guía es su nombre de archivo; la URL la construye
  `guideUrl()`. Si la lista sale vacía, el bloque no se renderiza.
- **Es imposible cruzar idiomas.** El índice está separado por idioma y la
  ficha solo consulta el suyo. Una ficha sueca no puede enlazar la guía
  española ni al revés, aunque compartan slug de herramienta.

**Efecto medido sobre `dist/`, enlaces internos entrantes por guía:**

| Guía | antes | después | desde |
| --- | --- | --- | --- |
| `/es/guias/descargar-chatgpt-para-windows` | 1 | 4 | índice + `/es/chatgpt`, `/es/claude`, `/es/gemini` |
| `/sv/guias/ai-presentation-svenska` | 1 | 3 | índice + `/sv/canva`, `/sv/gamma-app` |
| `/sv/guias/ai-skriva-text-svenska` | 1 | 3 | índice + `/sv/deepl`, `/sv/languagetool` |
| `/sv/guias/ai-transkribering-svenska` | 1 | 3 | índice + `/sv/elevenlabs`, `/sv/klang` |
| `/sv/guias/kora-ai-lokalt` | 1 | 4 | índice + `/sv/jan`, `/sv/lm-studio`, `/sv/ollama` |

Ninguna guía depende ya solo del enlace de cabecera. La media de entrantes por
ficha sube de 11,6 a 12,7 (mínimo 4, máximo 101) porque el bloque **añade**
enlaces en vez de desplazarlos: no consume el presupuesto fijo de alternativas
ni el de "sigue explorando".

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
| `src/utils/guide-links.ts` | **Inversión guía → ficha.** Módulo puro: qué destinos del Markdown de una guía cuentan como relación y cómo se indexan por idioma. |
| `src/layouts/BaseLayout.astro` | Cabecera, pie, selector de idioma, `<link rel=canonical>` y bloque hreflang. |
| `src/components/Home.astro` | Portada: rejilla del directorio + bloque "Explora por necesidad". |
| `src/components/ToolCard.astro` | Enlace de tarjeta hacia la ficha. |
| `src/pages/[lang]/[slug].astro` | Ficha: miga de pan, chips de categoría, alternativas, guías relacionadas, "sigue explorando". |
| `src/pages/[lang]/categoria/[slug].astro` | Categoría: miga de pan, chips de otras categorías, rejilla. |
| `src/pages/[lang]/index.astro` | Excluye `es` de `getStaticPaths` (la portada ES es `/`). |
| `src/utils/guides.ts` | Lectura de la colección `guides`: idioma y slug derivados del id real, qué idiomas tienen guías y en cuáles existe un slug. Memoiza el índice invertido que consume la ficha. |
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
Paginas en dist:        202
Indexables:             201
Fichas de herramienta:  155
Enlaces entrantes por ficha: min 4 | media 12.7 | max 101

AVISOS (5):
  ! /sv/guias/ai-presentation-svenska: sin hreflang="x-default"
  ! /sv/guias/ai-skriva-text-svenska: sin hreflang="x-default"
  ! /sv/guias/ai-transkribering-svenska: sin hreflang="x-default"
  ! /sv/guias/kora-ai-lokalt: sin hreflang="x-default"
  ! /it/opencode: solo 4 enlaces internos entrantes (minimo deseado 5)

Sin errores de enlazado interno.
```

Los cuatro avisos de `x-default` son **estructurales, no un fallo**: esas guías
solo existen en sueco, y la regla 6 hace que `x-default` apunte a la version ES
de esa misma pagina, que no existe. Desapareceran solos el dia que se traduzca
la guia al espanol; forzar un `x-default` hacia otra URL seria declarar una
alternativa falsa.

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

Desde F5.1 (#85) recibe además el enlace de **cada ficha que ya menciona en su
Markdown**, que es lo que la saca de depender del enlace de cabecera. La
relación se deriva, no se declara: ver §2, "Descubrimiento de guías". Los
números de antes y después están en esa misma sección.

Consecuencia práctica para quien escribe una guía nueva: **para que una ficha
enlace la guía, basta con que la guía enlace la ficha** —con `/{lang}/{slug}`
o con su botón `/r?t=…&l={lang}`— en el idioma que le corresponde. No hay que
tocar `tools-base`, ni el frontmatter, ni ninguna lista.

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
  pero un visitante sueco o italiano cae en una página en español. Sus dos
  enlaces internos sí pasan ya por los helpers (F5).
- **Un aviso permanente de cola larga.** Siempre habrá 1–2 fichas justo por
  debajo del umbral; el aviso es informativo, no un fallo. Hoy es
  `/it/opencode`: `it/programacion` solo tiene dos fichas traducidas, así que
  ninguna ficha italiana puede citarlo sin inventar la relación. Se resuelve
  traduciendo fichas de esa categoría, no tocando el grafo.
- **`src/pages/r/index.astro` escribe `href="/"` a mano**, contra la regla 1.
  No se corrigió en F5 porque `/r` está protegido y porque hoy ese enlace lleva
  a la portada española para los tres idiomas: cambiarlo por `homeUrl(lang)`
  cambiaría el comportamiento de `/r` y necesita una decisión propia.
- ~~**Las guías reciben un único enlace entrante**, el de su índice.~~
  **Resuelto en F5.1 (#85)** por la vía A del blocker #83: la ficha publica un
  bloque derivado con las guías de su idioma que ya la enlazan. Las cinco
  guías pasan de 1 a 3-4 entrantes y ninguna depende ya del enlace de
  cabecera. Ver §2, "Descubrimiento de guías", y
  `docs/mejora/blockers/F5-bloqueo-descubrimiento-de-guias.md` para el
  diagnóstico original.
- **`links:audit` sigue sin poder detectar este fallo.** Su regla 3 prohíbe
  páginas huérfanas, y una página con un solo entrante no lo es. Si mañana se
  publica una guía que no enlaza ninguna ficha de su idioma, el bloque no
  aparecerá en ninguna parte y la guía volverá a tener un único entrante. Lo
  cubre `tests/guias-fichas.test.ts` ("cada guía publicada relaciona al menos
  una ficha de su propio idioma"), que falla el build; la auditoría no.
