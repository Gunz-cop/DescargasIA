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
| Interstitial de salida | `/r?t=&p=&l=` (noindex, común a los tres) | | |

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

### El segmento `categoria` no se traduce

En los tres idiomas es `categoria`. Traducirlo (`kategori`, `categoria`) no
aporta nada a Google —el idioma se declara con `hreflang` y el contenido de la
página— y sí obligaría a una tabla de traducción de rutas, rompería URLs ya
indexadas y complicaría el mapeo entre idiomas. Vive en `CATEGORY_SEGMENT`
(`src/utils/links.ts`) por si algún día se decide lo contrario.

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
   `directoryUrl`, `redirectUrl`). Si aparece un `` href={`/${lang}/algo`} `` en
   una página, es un bug: el día que cambie el patrón de URLs habrá que
   buscarlo a mano.
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
| `public/robots.txt` | Bloqueo de `/r` y de los parámetros del filtro; declaración del sitemap. |
| `public/_redirects` | `301 /es → /`. |
| `astro.config.mjs` | Filtro del sitemap (fuera `/es` y `/r`). |
| `scripts/audit-internal-links.mjs` | Auditoría automática de todo lo anterior. |

---

## 5. La auditoría

```bash
npm run build          # ya encadena links:audit al final
npm run links:audit    # o suelto, sobre el dist/ existente
```

Sale con **código 1** si hay un error duro, así que rompe el build y el deploy.
Los **avisos** no rompen nada: son señales de calidad, no de corrección.

Salida esperada hoy:

```
--- Auditoria de enlazado interno ---
Paginas en dist:        179
Indexables:             178
Fichas de herramienta:  139
Enlaces entrantes por ficha: min 4 | media 11.6 | max 28

AVISOS (1):
  ! /it/grammarly: solo 4 enlaces internos entrantes (minimo deseado 5)

Sin errores de enlazado interno.
```

### Qué significa cada error

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

**Ficha nueva.** No hay que tocar nada del enlazado: entra sola en la portada,
en su categoría, en el reparto rotado y en el sitemap. Para subirla del mínimo,
cítala en el campo `alternatives` de 2–3 fichas afines de `tools-base/` — las
declaradas siempre van primero. Después, `npm run build` y mirar el aviso.

**Traducción nueva de una ficha existente.** Basta con crear
`src/content/tools/<lang>/<slug>.json`: el hreflang la detecta sola
(`getTranslatedTool` decide qué idiomas se declaran alternativos).

**Categoría nueva.** Añadirla a `CATEGORIES` en `src/utils/brand.ts` (con las
tres traducciones) y crear `src/content/categories/<slug>.json`. Entra sola en
la cabecera, en el bloque "Explora por necesidad", en los chips de categoría y
en las migas de pan.

**Idioma nuevo.** Añadirlo a `languages` (`src/i18n/ui.ts`), a `i18n.locales`
(`astro.config.mjs`), a `LANGS` (`src/utils/links.ts`), a `Lang`
(`src/utils/brand.ts`), a `hreflangMap` y `ogLocaleMap` (`BaseLayout.astro`) y a
`HREFLANG_BY_LANG` (`scripts/audit-internal-links.mjs`). El resto es automático.

**Sección nueva de páginas.** Añadir su constructor de URL a `links.ts` **antes**
de escribir la página, y darle al menos un enlace entrante desde una página que
ya se enlace bien (portada, categoría o ficha). Si no, la auditoría la marcará
huérfana.

---

## 7. Pendientes conocidos

- **`src/content/guides/` no tiene ruta.** La colección `guides` existe en
  `content.config.ts` y `scripts/get-sitemap-dates.mjs` ya calcula fechas para
  `/{lang}/guias/{slug}`, pero no hay `src/pages/[lang]/guias/[slug].astro`, así
  que la guía que hay ahí no se publica. Cuando se cree la sección, tendrá que
  entrar en este documento: desde dónde se enlaza y a dónde enlaza.
- **`/404` está solo en español** y con clases de un sistema de diseño anterior
  (`brand-*` en vez de `fai-*`). No afecta al enlazado indexable —es `noindex`—
  pero un visitante sueco o italiano cae en una página en español.
- **Un aviso permanente de cola larga.** Siempre habrá 1–2 fichas justo por
  debajo del umbral; el aviso es informativo, no un fallo.
