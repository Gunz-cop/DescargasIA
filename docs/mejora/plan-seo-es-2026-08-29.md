# Plan SEO priorizado del producto español — 2026-08-29

> Etapa de planificación previa a F7 ([#47](https://github.com/Gunz-cop/DescargasIA/issues/47)).
> **Este documento no cambia ninguna ficha, ruta, `hreflang` ni línea de
> código.** Propone qué cambiar, en qué orden, cómo se mediría y qué no puede
> medirse hoy. Cada acción necesita una spec aprobada antes de ejecutarse.

## 0. Contrato de este documento

| Campo | Valor |
|---|---|
| Producto | `es` únicamente |
| Fuente de datos | **Google Search Console y sólo Google Search Console.** No se usa Bing, no existe export de Bing en el repositorio |
| Evidencia de rendimiento | `docs/mejora/evidencia/gsc-2026-08-28/`, ingerida en el [PR #92](https://github.com/Gunz-cop/DescargasIA/pull/92) (fusionado) |
| Corte | Propiedad `fuenteai.com`, tipo de búsqueda `Web`, **2026-06-19 → 2026-08-26** (69 días), **sin ningún filtro** de página, consulta, país, dispositivo ni apariencia |
| Evidencia de estructura | Build del árbol en `ae8eed5` y `scripts/audit-internal-links.mjs` sobre `dist/` (§5) |
| Evidencia cualitativa de SERP | `docs/mejora/research/es.md` §3, fechada 2026-08-27, **no repetida aquí** |
| Autoridad | Ninguna. Es una propuesta para Codex y para las specs de F3-ES y F7 |

### Reglas que este documento se impone

1. **Ninguna consulta se atribuye a ninguna página.** El export no contiene el
   cruce consulta × página. Las consultas de §6 se leen como consultas de la
   propiedad completa —que incluye `sv` e `it`— y nunca como demanda de una
   ficha.
2. **Ninguna página tiene tendencia.** La única serie temporal del export es de
   propiedad. Cualquier fila que necesitase tendencia queda marcada como **no
   medida**.
3. **Ningún país se atribuye a `/es/*`.** La tabla de países es de propiedad
   completa.
4. **Impresión, clic, CTR y posición se mantienen separados.** No se convierte
   una impresión en demanda, ni una posición media en la posición que ve una
   persona.
5. **Un dato que falta se declara**, en §11 y en
   `docs/mejora/blockers/F7-ES-datos-faltantes-plan-seo.md`. No se estima, no se
   prorratea, no se rellena por analogía.

---

## 1. Cifras de partida, recalculadas sobre los CSV

Todas salen de sumar `docs/mejora/evidencia/gsc-2026-08-28/`. Se repiten aquí
para que el resto del documento no dependa de memoria.

| Medida | Valor |
|---|---|
| Propiedad, serie diaria | 6.531 impresiones · 47 clics · CTR 0,72 % |
| Tabla de páginas, todas las filas | 135 filas · 6.582 impresiones · 47 clics |
| `/es/*` con esquema `https` | **84 URLs · 6.066 impresiones · 41 clics · CTR 0,68 %** |
| `/es/*` con esquema `http` | 2 URLs · 31 impresiones · 0 clics (§7.4) |
| De esas 84: fichas y estáticas | 79 URLs · 6.049 impresiones · 41 clics |
| De esas 84: categorías | 5 URLs · 17 impresiones · 0 clics |
| Fichas `es` en el árbol | 86 · de ellas **9 sin ninguna impresión** en los 69 días |
| Tabla de consultas | 920 filas · 3.618 impresiones · 13 clics |

La diferencia entre 6.582 (páginas) y 6.531 (serie diaria) es la que declara el
README de la evidencia: una misma impresión puede implicar más de una URL. **No
se reconcilia.** Los porcentajes de este documento se calculan siempre contra la
base que se nombra en la misma frase.

---

## 2. Páginas con más impresiones

Las diez `/es/*` con más impresiones del periodo:

| # | Página | Impresiones | Clics | CTR | Posición media |
|---|---|---|---|---|---|
| 1 | `/es/gamma-app` | 591 | 0 | 0 % | 24,71 |
| 2 | `/es/cursor` | 552 | 1 | 0,18 % | 27,21 |
| 3 | `/es/jan` | 527 | 9 | 1,71 % | 8,28 |
| 4 | `/es/perplexity` | 328 | 0 | 0 % | 44,39 |
| 5 | `/es/grok` | 317 | 5 | 1,58 % | 24,32 |
| 6 | `/es/ollama` | 317 | 1 | 0,32 % | 18,15 |
| 7 | `/es/lm-studio` | 270 | 3 | 1,11 % | 24,62 |
| 8 | `/es/character-ai` | 264 | 1 | 0,38 % | 10,86 |
| 9 | `/es/sora` | 155 | 2 | 1,29 % | 24,51 |
| 10 | `/es/qwen-chat` | 136 | 2 | 1,47 % | 8,20 |

**Concentración:** estas diez URLs son el **57,0 %** de las impresiones `/es/*`
(3.457 de 6.066) y el **58,5 %** de los clics (24 de 41). Seis páginas más
superan las 100 impresiones: `anythingllm` 134, `z-ai` 123, `google-flow` 111,
`qwen-code` 104, `ideogram` 104, `deepseek` 103.

**Reparto por banda de posición media de página.** Base: las 84 URLs `/es/*` con esquema `https`, las 2 con esquema `http` y la portada `/` — 87 filas y 6.234 impresiones:

| Banda de posición media | URLs | Impresiones | Clics |
|---|---|---|---|
| [0, 3) | 1 | 2 | 0 |
| [3, 10) | 15 | 978 | 14 |
| [10, 20) | 19 | 1.259 | 6 |
| [20, 50) | 44 | 3.742 | 25 |
| [50, …) | 8 | 253 | 0 |

**Lectura:** el 60,0 % de esas impresiones (3.742 de 6.234) ocurre en páginas cuya
posición media está entre 20 y 50 —segunda y tercera página de resultados—. Ahí
un CTR bajo es lo esperado y **no es evidencia de un título o una descripción
malos**. Es el hallazgo que más condiciona el resto del plan: para la mayoría
del volumen, la palanca es la posición, no el fragmento de la SERP.

`sora` merece una nota: su ficha declara `status: "discontinued"` y su título ya
no usa la plantilla del catálogo. Recibe 155 impresiones y 2 clics. Cualquier
acción sobre ella tiene que respetar la decisión de F5 de no citarla como
alternativa; no se propone trabajo editorial sobre esta ficha.

---

## 3. Páginas con impresiones y cero clics

**62 de las 84 URLs `/es/*` no recibieron ningún clic** en los 69 días. Suman
**2.719 impresiones**, el 44,8 % de las de `/es/*`. Las diez primeras
concentran 1.667 de esas 2.719.

| Página | Impresiones | Posición media | Interpretación |
|---|---|---|---|
| `/es/gamma-app` | 591 | 24,71 | Posición explica el cero |
| `/es/perplexity` | 328 | 44,39 | Posición explica el cero |
| `/es/z-ai` | 123 | 16,66 | **Candidata de CTR** |
| `/es/google-flow` | 111 | 24,81 | Posición explica el cero |
| `/es/ideogram` | 104 | 55,91 | Posición explica el cero |
| `/es/deepseek` | 103 | 41,91 | Posición explica el cero |
| `/es/kling-ai` | 80 | 31,31 | Posición explica el cero |
| `/es/github-copilot` | 79 | 37,32 | Posición explica el cero |
| `/es/stable-diffusion` | 75 | 11,60 | **Candidata de CTR** |
| `/es/mistral-vibe` | 73 | 8,67 | **Candidata de CTR** |

### 3.1 La distinción que hay que hacer antes de tocar nada

«Impresiones y cero clics» no es un diagnóstico. Son dos casos distintos:

- **Cero clics con posición media alejada** (`gamma-app` 24,71, `perplexity`
  44,39, `ideogram` 55,91, `deepseek` 41,91). Reescribir el título de una
  página que se muestra de media en el puesto 44 no cambia nada medible.
  Es un problema de posición, y este export no dice por qué.
- **Cero clics con posición media cercana**: `z-ai` (16,66), `stable-diffusion`
  (11,60), `mistral-vibe` (8,67), `hugging-face` (48 impresiones, 8,52). Son
  **319 impresiones** en total. Es el único grupo donde el fragmento de la SERP
  es una hipótesis razonable.

### 3.2 Por qué ese grupo tampoco demuestra un problema de CTR

Con 73 impresiones y el CTR medio de `/es/*` (0,68 %), el número esperado de
clics es **0,5**. Observar cero no distingue una página con problema de una
página normal con poco volumen. Lo mismo vale para las otras tres.

**Conclusión honesta: no hay ninguna página `/es/*` en la que este export
demuestre un problema de CTR.** Lo que sí hay son cuatro candidatas plausibles
y un motivo estructural, medible sobre el árbol y no sobre el export, para
revisar título y descripción en todo el catálogo (§7).

---

## 4. Páginas con mejor relación clics/impresiones

Con 41 clics en 69 días, el CTR de una página con pocas impresiones es ruido:
`/es/heygen` marca 25 % porque tuvo 1 clic sobre 4 impresiones. Sólo se leen
las páginas con **≥ 100 impresiones**:

| Página | Impresiones | Clics | CTR | Posición media |
|---|---|---|---|---|
| `/es/anythingllm` | 134 | 4 | 2,99 % | 22,07 |
| `/es/jan` | 527 | 9 | 1,71 % | 8,28 |
| `/es/grok` | 317 | 5 | 1,58 % | 24,32 |
| `/es/qwen-chat` | 136 | 2 | 1,47 % | 8,20 |
| `/es/lm-studio` | 270 | 3 | 1,11 % | 24,62 |
| `/es/qwen-code` | 104 | 1 | 0,96 % | 13,74 |
| `/es/character-ai` | 264 | 1 | 0,38 % | 10,86 |
| `/es/ollama` | 317 | 1 | 0,32 % | 18,15 |
| `/es/cursor` | 552 | 1 | 0,18 % | 27,21 |
| `/es/gamma-app`, `/es/perplexity`, `/es/z-ai`, `/es/google-flow`, `/es/ideogram`, `/es/deepseek` | — | 0 | 0 % | — |

**`/es/jan` es la página que más clics aporta del producto español: 9 de 41
(22 %)**, con la mejor posición media del grupo de volumen (8,28). `jan`,
`grok`, `anythingllm` y `lm-studio` juntas son 21 de los 41 clics.

Dos observaciones y sus límites:

- **`/es/character-ai`, `/es/ollama` y `/es/cursor` desentonan**: 1.133
  impresiones combinadas y 3 clics. `character-ai` está además en posición
  media 10,86, la tercera mejor del grupo de volumen. Es la anomalía más
  llamativa del corte. **No se explica con este export**, y en particular no se
  puede comprobar contra qué consultas aparece.
- La posición media **mezcla países y dispositivos**. A nivel de propiedad, el
  export separa Ordenador (4.809 impresiones, CTR 0,54 %, posición 28,08) de
  Móviles (1.678, CTR 1,19 %, posición 12,91). Esa diferencia **es de la
  propiedad completa** y no puede trasladarse a ninguna página.

---

## 5. Enlazado interno útil según el grafo real

Medido ejecutando `astro build` sobre el árbol de `ae8eed5` y contando enlaces
`<a href>` internos en `dist/`. `npm run links:audit` sobre ese mismo build:
**203 páginas, 202 indexables, 156 fichas, entrantes por ficha min 4 / media
12,7 / max 101, 0 errores y 6 avisos** —cuatro de `hreflang` en guías `sv` y
dos de fichas `it` por debajo del mínimo—. Ninguno afecta a `/es/*`.

### 5.1 El presupuesto de enlaces está invertido respecto al volumen

| Grupo de URLs `/es/*` | Entrantes internos | Impresiones del periodo |
|---|---|---|
| 15 URLs de cabecera y pie (8 categorías, 4 legales, `/es/guias`, `/es/acerca-de`, `/es/puedo-correr-ia`) | **101 cada una** | **22 en total** |
| `/es/gamma-app` — la URL con más impresiones del sitio | **9** | **591** |
| `/es/grok`, `/es/ideogram`, `/es/deepseek` | 7 cada una | 524 en total |

Las diez URLs `/es/*` con ≥ 100 impresiones y entrantes por debajo de la media
del sitio (12,7):

| Página | Impresiones | Clics | Posición | Entrantes |
|---|---|---|---|---|
| `/es/gamma-app` | 591 | 0 | 24,71 | 9 |
| `/es/jan` | 527 | 9 | 8,28 | 11 |
| `/es/grok` | 317 | 5 | 24,32 | 7 |
| `/es/character-ai` | 264 | 1 | 10,86 | 10 |
| `/es/sora` | 155 | 2 | 24,51 | 8 |
| `/es/qwen-chat` | 136 | 2 | 8,20 | 11 |
| `/es/google-flow` | 111 | 0 | 24,81 | 8 |
| `/es/qwen-code` | 104 | 1 | 13,74 | 10 |
| `/es/ideogram` | 104 | 0 | 55,91 | 7 |
| `/es/deepseek` | 103 | 0 | 41,91 | 7 |

**Esto es una asimetría observada, no una causa demostrada.** No existe serie
por URL, así que nada en este export dice que más enlaces internos hayan movido
o vayan a mover una posición. Lo que sí es un hecho del árbol: el enlace
interno más repetido del sitio español va a páginas que no reciben búsquedas.

### 5.2 La restricción que hace que casi nada de esto sea accionable

`docs/enlazado-interno.md` lo mide y lo dice: **el presupuesto de enlaces por
ficha es fijo** —6 alternativas + 4 «sigue explorando»—. Declarar una relación
nueva **desplaza** un hueco del relleno rotado; no crea un enlace. La media
apenas se movió (11,66 → 11,67) cuando F5 declaró 24 relaciones. Y
`alternatives` vive en `tools-base/`, así que es **común a `es`, `sv` e `it`**:
no se puede reordenar el grafo español sin tocar los otros dos productos.

Además, cabecera y pie son *boilerplate*: no se propone quitar categorías del
menú para redirigir enlaces a fichas. Sería un cambio de navegación con
consecuencias de UX que este documento no ha evaluado.

### 5.3 El único mecanismo que **añade** enlaces sin desplazar ninguno

El bloque de guías de F5.1 (#85). `docs/enlazado-interno.md` mide su efecto:
la media de entrantes por ficha subió de 11,6 a 12,7 porque **añade** enlaces
en vez de consumir el presupuesto fijo.

En español ese mecanismo está prácticamente apagado: **existe una sola guía**,
`/es/guias/descargar-chatgpt-para-windows`, y el bloque derivado aparece en
`/es/chatgpt`, `/es/claude` y `/es/gemini`. Esas tres páginas suman **62
impresiones** del periodo (`chatgpt` 32, `gemini` 30, `claude` **0**). Ninguna
de las diez URLs de §2 recibe un solo enlace por esa vía.

Frente a esto, `/sv/*` tiene cuatro guías y 290 impresiones totales; el
producto con más volumen es el que menos usa el único mecanismo aditivo del
grafo.

**Es la mejor oportunidad de enlazado interno del producto español**, y depende
de escribir contenido nuevo —una guía—, no de reconfigurar enlaces. La fila 6
de la matriz de `research/es.md` (guía de intención sobre IA local) ya es
exactamente ese candidato, y ya está priorizada allí.

---

## 6. Diferencias entre volumen observado y demanda no atribuible

Esta sección existe para que ninguna fase posterior confunda «lo que el export
enseña» con «lo que la gente busca».

| Hueco | Magnitud medida | Qué implica |
|---|---|---|
| Impresiones sin consulta en el export | **2.913 de 6.531 (44,6 %)** | La tabla de consultas cubre el 55,4 % de las impresiones. Search Console omite consultas de bajo volumen y limita la tabla a 1.000 filas |
| Clics sin consulta en el export | **34 de 47 (72,3 %)** | La mayoría de los clics del sitio no tiene consulta identificable |
| Impresiones de `/es/*` atribuibles a una consulta | **0 de 6.066 (0 %)** | No existe el cruce consulta × página. Ninguna cifra de este documento puede convertirse en «esta consulta trae impresiones a esta ficha» |
| Impresiones con tendencia por página | **0** | La única serie diaria es de propiedad |
| Impresiones con país atribuible a `/es/*` | **0** | La tabla de países es de propiedad e incluye `sv` e `it` |
| Apariencia en búsquedas | **0 filas** | El CSV viene vacío. No se sabe si alguna ficha aparece en un resultado enriquecido |
| Enlaces externos registrados | **0 filas** | `Latest links` viene vacío. Ninguna lectura de autoridad entrante es posible |

### 6.1 Lo que sí puede decirse de la tabla de consultas, con su etiqueta

Estas son consultas **de la propiedad completa**, que incluye `sv` e `it`. Se
listan como contexto de qué tipo de cadena llega al sitio, y **no se asignan a
ninguna URL**:

| Consulta | Impresiones | Clics | Posición media |
|---|---|---|---|
| `cursor` | 242 | 0 | 24,52 |
| `gamma app` | 241 | 0 | 23,22 |
| `jan ia` | 117 | 2 | 6,65 |
| `grok` | 103 | 1 | 30,75 |
| `jan ai` | 86 | 1 | 8,27 |
| `gamma` | 67 | 0 | 35,43 |
| `lm studio` | 66 | 1 | 38,73 |
| `ollama` | 57 | 0 | 32,09 |
| `charter ia` | 55 | 0 | 6,20 |
| `jan.ia` | 50 | 1 | 6,82 |

Reparto de la tabla de consultas por banda de posición media:

| Banda | Consultas | Impresiones | Clics |
|---|---|---|---|
| [0, 3) | 5 | 6 | 1 |
| [3, 10) | 131 | 716 | 6 |
| [10, 20) | 93 | 226 | 1 |
| [20, 50) | 357 | 1.976 | 3 |
| [50, …) | 334 | 694 | 2 |

Y el peso del léxico transaccional dentro de esa tabla truncada:

| Patrón en la consulta | Consultas | Impresiones | Clics |
|---|---|---|---|
| `descarga`/`descargar` | 48 | 181 | 0 |
| `gratis` | 47 | 180 | 0 |
| `español` | 52 | 199 | 3 |
| `apk` | 9 | 29 | 0 |
| `oficial` | 8 | 24 | 0 |
| `windows` | 7 | 10 | 0 |
| `qué es` / `que es` | 24 | 67 | 0 |

**Este cuadro no autoriza ninguna conclusión sobre intención de las fichas
`es`.** Sirve para una sola cosa: dejar constancia de que el vocabulario
transaccional que `research/es.md` §3 auditó cualitativamente **sí aparece** en
la tabla de consultas de la propiedad, con volúmenes pequeños y sin ningún
clic. No dice de qué idioma ni de qué URL viene.

### 6.2 El crecimiento de base, que es el mayor riesgo de interpretación

| Ventana | Impresiones | Clics |
|---|---|---|
| Últimos 14 días (2026-08-13 → 08-26) | 4.346 | 36 |
| 14 previos (2026-07-30 → 08-12) | 915 | 9 |
| Últimos 28 días (2026-07-30 → 08-26) | 5.261 | 45 |
| 28 previos (2026-07-02 → 07-29) | 985 | 2 |

La serie crece de forma sostenida: 64 impresiones el 2026-08-06 y 493 el
2026-08-26. En paralelo, la cobertura pasó de 20 a 160 páginas válidas entre el
2026-06-29 y el 2026-08-20.

**Consecuencia operativa:** cualquier comparación antes/después que mire sólo
la cifra tratada verá una subida, la haga el cambio o no. Todo experimento de
§8 lleva grupo de control por esa razón, y no por rigor decorativo.

---

## 7. Qué puede mejorarse sin crear claims no demostrados

Medido sobre el árbol de `ae8eed5`, no sobre el export. Son hechos del
repositorio, comprobables sin Search Console.

### 7.1 Descripciones que Google va a recortar

`description` de las 86 fichas `es`: mínimo 133, máximo **209**, media 164,2
caracteres. **37 superan los 160**; **11 superan los 180**.

Quince de esas fichas tienen además ≥ 50 impresiones, y suman **2.355
impresiones** del periodo:

`cursor` (187 car., 552 impr.) · `perplexity` (191, 328) · `ollama` (196, 317) ·
`character-ai` (185, 264) · `qwen-chat` (165, 136) · `google-flow` (186, 111) ·
`qwen-code` (162, 104) · `deepseek` (165, 103) · `stable-diffusion` (207, 75) ·
`mistral-vibe` (209, 73) · `notebooklm` (176, 71) · `devin-desktop` (161, 66) ·
`adobe-podcast` (169, 55) · `napkin-ai` (172, 50) · `google-antigravity` (180, 50).

En muchas de ellas la frase recortada es precisamente la que aporta el valor
del producto: `ollama` cierra con «*otro portal que lo sirva es una
redistribución*»; `cursor`, con «*las copias «Full» o «Portable» que circulan
no son espejos, son software alterado*»; `stable-diffusion`, con la
desambiguación entre modelo, interfaz y servicio.

**Recortar no inventa nada**: reordena texto que ya está escrito y verificado.
Es el cambio de menor riesgo del plan.

> Google no garantiza usar la `description` declarada, y el recorte depende del
> ancho en píxeles, no del número de caracteres. Los 160 son una convención de
> trabajo, no un umbral medido en este export.

### 7.2 Títulos indistinguibles entre sí

**79 de los 86 títulos `es` terminan exactamente igual**: `— sitio oficial y 6
alternativas verificadas | FuenteAI`. Las 7 excepciones son `sora` y `phind`
(descontinuados) y cinco fichas con 4 o 5 alternativas.

Longitud: mínimo 56, máximo 84, media 65 caracteres. **76 de 86 pasan de 60**;
8 pasan de 70. El sufijo se lleva unos 45 caracteres de cada título, así que lo
que distingue una ficha de otra son los primeros ~20.

Dos observaciones adicionales, que **no** son propuestas de este documento:

- La cifra del título es la del `alternatives` renderizado. Si una spec futura
  cambia el número de alternativas, el título cambia solo.
- «alternativas **verificadas**» es una afirmación editorial que este documento
  no ha comprobado. Si una spec toca los títulos, conviene que
  `descargasia-ficha-auditoria` la evalúe; no se propone retirarla aquí.

### 7.3 Profundidad de las páginas con volumen

`research/es.md` §2.2 midió 45 de 86 fichas con `longDescription` de menos de
400 caracteres. Cruzado con impresiones, las cortas **con volumen** son:

| Página | Impresiones | Clics | `longDescription` | FAQ | Secciones |
|---|---|---|---|---|---|
| `/es/anythingllm` | 134 | 4 | 177 car. | 4 | 3 |
| `/es/gamma-app` | 591 | 0 | 318 car. | 3 | 3 |
| `/es/lm-studio` | 270 | 3 | 339 car. | 4 | 5 |
| `/es/google-flow` | 111 | 0 | 350 car. | 4 | 3 |
| `/es/jan` | 527 | 9 | 364 car. | 3 | 3 |

Las cuatro fichas más profundas del grupo de cabeza —`perplexity` 982,
`ollama` 933, `cursor` 908, `character-ai` 604— son, precisamente, tres de las
que peor convierten (§4). **La extensión no explica el CTR en este corte**, y
esta tabla no debe leerse como «alargar el texto trae clics». Sirve para lo que
`research/es.md` ya decía: dice dónde mirar.

Las 15 fichas de cabeza tienen todas **una sola entrada de
`communityInsights`**.

### 7.4 Dos URLs `http://` en la tabla de páginas

El export contiene `http://fuenteai.com/es/lm-studio` (14 impresiones, posición
media 8,29) y `http://fuenteai.com/es/categoria/modelos-locales` (17
impresiones, 26,47) como **filas separadas** de sus equivalentes `https`.

`grep` sobre el `dist/` completo: **cero apariciones** de `http://fuenteai.com`
en cualquier HTML o en el sitemap. El sitio no emite esas URLs; son un resto
que Google conserva.

Llama la atención que la variante `http` de `lm-studio` marque posición media
8,29 y la `https` 24,62, pero **son dos medias sobre dos conjuntos de
impresiones distintos y no se comparan**. Lo único accionable sería comprobar
que `http://fuenteai.com/es/*` redirige 301 a `https`; **esta sesión no puede
comprobarlo** (§9).

### 7.5 Tres URLs con impresiones que no están en la tabla de indexadas

`/es/categoria/asistentes-ia`, `/es/klang` y `/es/microsoft-copilot` tienen
impresiones en la ventana de rendimiento y no aparecen entre las 81 URLs `es`
de `cobertura-validas-urls.csv`. Las dos tablas tienen fechas distintas
—cobertura al 2026-08-20, rendimiento hasta el 2026-08-26—, lo que es una
explicación plausible y **no comprobable con este export**. Queda anotado como
**no explicado**, no como error.

### 7.6 Lo que NO puede escribirse

- Que una consulta trae tráfico a una ficha.
- Que una ficha «sube», «baja» o «tiene tendencia».
- Que España, México o Perú son el país de `/es/*`.
- Que una ficha aparece en un resultado enriquecido (el CSV está vacío).
- Cualquier afirmación de privacidad, cumplimiento normativo o seguridad: lo
  prohíben `AGENTS.md` y el descarte de la fila 8 de `research/es.md` §5.
- Un dato de canal oficial sin reverificar. `research/es.md` §6 obliga a
  reverificar `platforms[]` antes de escribir sobre canales; el `lastChecked`
  de las fichas de cabeza es 2026-08-12.

---

## 8. Tabla priorizada

Escala: impacto, riesgo y esfuerzo en Bajo / Medio / Alto. «Evidencia» dice
sobre qué se apoya la acción. «Medible» dice si el resultado puede leerse con
la evidencia que hoy existe o que puede pedirse.

| # | Acción propuesta | Impacto potencial | Evidencia disponible | Riesgo | Esfuerzo | Medible | Prioridad |
|---|---|---|---|---|---|---|---|
| **P1** | Recortar a ≤ 160 caracteres las 15 `description` largas con ≥ 50 impresiones, conservando la frase de valor | Medio — 2.355 impresiones afectadas | **Alta y del árbol**: longitudes medidas; impresiones del export | **Bajo** — reordena texto ya verificado | Bajo | Sí, con export por página a 28 días y grupo de control | **1** |
| **P2** | Diferenciar el título de las 10 fichas de §2: adelantar lo distintivo y acortar el sufijo común | Medio-alto — 3.457 impresiones | Media: 79/86 títulos idénticos (árbol). **Ningún dato de consulta por página** | Medio — el título es la señal más visible; un cambio malo se paga rápido | Bajo-medio | Sí, mismo diseño que P1 | **2** |
| **P3** | Escribir la guía de intención de IA local (fila 6 de `research/es.md`) y dejar que el bloque derivado enlace `jan`, `lm-studio`, `ollama`, `anythingllm`, `gpt4all` | Alto — único mecanismo que **añade** enlazado interno; toca 4 de las 10 páginas de §2 | Media: efecto del mecanismo medido en `enlazado-interno.md`; volumen de las fichas destino, del export | Medio — contenido nuevo; exige verificar canales | **Alto** | Parcial: los entrantes se miden en `dist/`; el efecto SEO no es aislable | **3** |
| **P4** | Auditar `/es/gamma-app` con el método de SERP de `research/es.md` §3 | Alto si la auditoría encuentra hueco — 591 impresiones, 0 clics | **Ninguna sobre esta consulta.** La fila 12 sigue «sin decisión» | Bajo (es investigación) | Medio | No aplica: produce evidencia, no cambio | **4** |
| **P5** | Auditar `/es/character-ai`, `/es/ollama` y `/es/cursor`: 1.133 impresiones y 3 clics, con `character-ai` en posición media 10,86 | Alto si aparece una causa | Media: la anomalía está medida; la causa no | Bajo (investigación) | Medio | No aplica | **5** |
| **P6** | Profundizar `longDescription` y FAQ de `gamma-app`, `jan`, `lm-studio`, `anythingllm`, `google-flow` | Medio — 1.633 impresiones; **efecto no demostrado por este corte** | Baja para el efecto; alta para el diagnóstico de extensión | Medio-alto — es donde más fácil se cuela un claim | Alto | Débil: no se distingue de P1/P2 si se hace a la vez | **6** |
| **P7** | Comprobar y, si procede, corregir la redirección `http://fuenteai.com/es/*` → `https` | Bajo — 31 impresiones, 0 clics | Alta sobre el síntoma; **nula sobre el estado real en producción** | Bajo | Bajo | Sí, en la tabla de páginas del siguiente corte | **7** |
| **P8** | Revisar las 4 candidatas de CTR de §3.1 (`z-ai`, `stable-diffusion`, `mistral-vibe`, `hugging-face`) | Bajo — 319 impresiones | **Débil**: cero clics es indistinguible de ruido a ese volumen (§3.2) | Bajo | Bajo | **No** con el volumen actual | **8** |
| **P9** | Reordenar `alternatives` para dar entrantes a las fichas de §5.1 | Bajo — desplaza enlaces, no los crea | Alta sobre la restricción (`enlazado-interno.md`) | **Alto** — `alternatives` es común a `es`, `sv` e `it` | Medio | No | **Descartado ahora** |
| **P10** | Cualquier acción sobre las 6 páginas de §3 con posición media > 30 | Nulo a corto plazo | Alta sobre la causa: es posición, no fragmento | Bajo | — | No | **Descartado ahora** |

### 8.1 Por qué P9 y P10 se descartan y qué los reabriría

- **P9**: `docs/enlazado-interno.md` mide que declarar una relación desplaza un
  hueco del relleno rotado en lugar de crear un enlace (media 11,66 → 11,67), y
  `alternatives` vive en `tools-base/`, común a los tres idiomas. Cambiar el
  grafo español tocaría `sv` e `it` sin evidencia de ninguno de los dos. Lo
  reabriría un mecanismo aditivo por idioma, o una decisión de catálogo de
  Codex.
- **P10**: una página que se muestra de media en el puesto 44 no cambia de
  resultado porque se le reescriba el título. Lo reabriría un export filtrado
  que mostrara qué consultas la traen, o una mejora de posición por otra vía.

---

## 9. Propuesta de experimentos

### 9.1 El diseño, y por qué lleva control

§6.2 lo obliga: la propiedad multiplicó por 4,75 sus impresiones entre dos
ventanas de 14 días consecutivas. Un antes/después de la página tratada mide
el crecimiento del sitio, no el cambio.

El README de la evidencia establece qué comparación es legítima hoy: *«el corte
por página de esta ventana sí es comparable contra otro corte por página de la
misma longitud, siempre que el export futuro se tome con el mismo tipo de
búsqueda (`Web`) y sin filtros, o con los mismos filtros»*.

Sobre eso se construye lo único medible sin pedir datos nuevos:

> **Diferencia de diferencias sobre la tabla de páginas.** Grupo tratado y
> grupo de control, emparejados por banda de impresiones y banda de posición
> media (§2), medidos en dos cortes de la **misma longitud** con los **mismos
> filtros**. El crecimiento del sitio afecta a los dos grupos.

Requisitos que no son negociables para que el experimento valga:

1. Un solo experimento activo por página. Nada de P1 y P2 sobre la misma ficha.
2. Grupo de control declarado **por escrito antes** de publicar, con su lista de
   URLs. Elegirlo después es elegir el resultado.
3. Ninguna otra publicación de fichas `es` en la ventana. Una ficha nueva
   cambia el reparto de impresiones del sitio.
4. El corte «después» se toma con `Web`, sin filtros, y con la misma longitud de
   ventana que el «antes».

### 9.2 Los tres experimentos

| | **E1 — descripción** | **E2 — título** | **E3 — guía y enlazado** |
|---|---|---|---|
| Acción | P1 sobre las 15 `description` > 160 car. con ≥ 50 impresiones | P2 sobre 5 de las 10 páginas de §2, elegidas por sorteo declarado; las otras 5 son control | P3: publicar la guía de IA local |
| Tratado | 15 URLs · 2.355 impresiones en la ventana base | 5 URLs de las 10 de §2 | Las fichas que la guía enlace |
| Control | Las `description` ≤ 160 car. con ≥ 50 impresiones, sin tocar | Las otras 5 de §2 | Fichas de `modelos-locales` no enlazadas por la guía |
| Métrica primaria | CTR de página, tratado vs control | CTR de página, tratado vs control | Entrantes internos en `dist/` (determinista) |
| Métricas de control | Impresiones y posición media, para descartar que el cambio venga de posición | Igual | Impresiones y CTR de las fichas destino |
| Lectura a **14 días** | **Regresión, no CTR**: canonical, `hreflang`, `links:audit`, URLs válidas y no indexadas, ningún destino roto | Igual | Igual + la guía indexada |
| Lectura a **28 días** | Comparación primaria | Comparación primaria | Comparación exploratoria |
| Ampliación | A 56 días si el control varía más que la diferencia observada | Igual | Siempre: el efecto de un enlace no se lee en 28 días |

### 9.3 Qué potencia tiene esto, dicho antes de empezar

El grupo tratado de **E1** recibió 2.355 impresiones en 69 días. Dos lecturas
del mismo dato:

- **Al ritmo medio de la ventana** (34 impresiones/día): unas **955
  impresiones** en 28 días. Con CTR 0,7 % eso son ~7 clics; hace falta llegar a
  ~2 % (~19 clics) para que la diferencia se distinga del azar.
- **Al ritmo de los últimos 14 días**, y **suponiendo** que este grupo conserve
  su cuota de impresiones del sitio —*una suposición, no una medida: no existe
  serie por URL*—: unas **3.100 impresiones** en 28 días, ~22 clics al CTR
  actual frente a ~43 si se duplica.

En los dos escenarios la conclusión es la misma y conviene escribirla ahora:
**este montaje sólo puede detectar efectos grandes, del orden de duplicar el
CTR.** Una mejora del 20 % será indistinguible del ruido, y no debe reportarse
como éxito ni como fracaso. E2 tiene aún menos volumen por rama.

**E3 no tiene lectura estadística.** Su métrica primaria —enlaces entrantes en
`dist/`— es determinista y se comprueba en el build. El efecto en búsqueda
queda declarado como **no medible** con la evidencia actual.

### 9.4 Orden y calendario

| Fase | Duración | Contenido |
|---|---|---|
| 0 | Antes de publicar | Corte «antes»: guardar `rendimiento-paginas.csv` de la ventana de referencia, ya versionado. Declarar por escrito tratados y controles de E1 y E2 |
| 1 | Días 0–28 | **E1** en solitario. E2 no se lanza sobre las mismas páginas |
| 2 | Día 14 | Chequeo de regresión de E1 (no se lee CTR) |
| 3 | Día 28 | Lectura de E1. Corte nuevo de 28 días, mismos filtros |
| 4 | Días 28–56 | **E2**, con el resultado de E1 ya cerrado |
| 5 | En paralelo desde el día 0 | **E3**, que no comparte páginas con E1 ni E2 y se lee en el build |

P4 y P5 (auditorías de SERP) no son experimentos y pueden ejecutarse en
cualquier momento: producen evidencia, no cambian el sitio.

---

## 10. Criterios de aceptación

### 10.1 De este documento

- [x] Sólo se usa Google Search Console; no aparece ningún dato de Bing.
- [x] Ninguna consulta se atribuye a ninguna página.
- [x] Impresiones, clics, CTR y posición se presentan por separado en cada tabla.
- [x] Cada cifra procede de sumar los CSV de `docs/mejora/evidencia/gsc-2026-08-28/` o de medir el árbol en `ae8eed5`, y dice cuál de las dos.
- [x] Ninguna afirmación de tendencia por página; §6 declara las cuatro atribuciones imposibles.
- [x] Los datos que faltan están en §11 y en el blocker, no rellenados por analogía.
- [x] No se modifica ninguna ficha, ruta, `hreflang` ni código.

### 10.2 De cada acción, antes de ejecutarse

Ninguna acción de §8 se ejecuta sin cumplir las cuatro:

1. **Spec aprobada** por Codex, con archivos propios y protegidos, según la
   matriz de `docs/mejora/decisiones.md`. El contenido de `src/content/tools/es/`
   pertenece a F4-ES.
2. **Canales reverificados** contra la fuente oficial si la acción toca una
   frase sobre canal, plataforma o disponibilidad (`research/es.md` §6).
3. **Grupo de control declarado por escrito** antes de publicar, si la acción
   entra en un experimento.
4. **Validaciones en verde**: `npm run build` —que encadena `catalog:audit`,
   `hw:audit`, `npm test`, `agents:skills` y `links:audit`— y `git diff --check`.

### 10.3 De cada experimento, al leerlo

1. El corte «después» declara periodo, tipo de búsqueda y filtros, y tiene la
   **misma longitud** que el «antes».
2. Se reporta tratado **y** control. Un resultado sin control no se reporta.
3. Se distingue explícitamente **evidencia de causalidad**. Ninguna conclusión
   se apoya en un pico aislado (`#47`).
4. Si la diferencia observada es menor que la variación del grupo de control, el
   resultado se reporta como **no concluyente**, y eso es un resultado válido.
5. No se mezclan `es`, `sv` e `it` en la misma cifra.
6. Los clics hacia la fuente oficial (`/r`) **no** se mezclan con los clics de
   Google: `/r` no está en Search Console, es Cloudflare y pertenece a F1.
7. Cada paso siguiente se convierte en una spec SDD, no en una instrucción
   informal.

---

## 11. Datos que faltan

Detalle y preguntas concretas en
`docs/mejora/blockers/F7-ES-datos-faltantes-plan-seo.md`.

| # | Dato | Estado | Qué desbloquearía | Registro |
|---|---|---|---|---|
| D1 | Consultas filtradas por página `/es/` | **Ausente** | Decir qué consulta trae impresiones a una ficha. Hoy: 0 % de las impresiones `/es/*` es atribuible | [#50](https://github.com/Gunz-cop/DescargasIA/issues/50), abierto |
| D2 | Cruce consulta × país o página × país | **Ausente** | Cerrar el alcance geográfico de `es`, hoy declarado y no ratificado | #50 · `decisiones.md`, decisión abierta |
| D3 | Serie temporal por URL | **Ausente** | Medir una ficha en el tiempo. Sin esto, todo experimento depende de un grupo de control | #50 |
| D4 | Apariencia en búsquedas | **Export vacío** | Saber si alguna ficha sale en resultado enriquecido | Evidencia GSC, README |
| D5 | Enlaces externos | **Export vacío (0 filas)** | Cualquier lectura de autoridad entrante | Evidencia GSC, README |
| D6 | Lista de URLs de las 90 no indexadas | **Ausente** | Saber cuáles de los 52 `noindex` son deliberados y cuáles no | Este documento |
| D7 | Estado real de `http://fuenteai.com/es/*` en producción | **No medido** | P7. La sesión no alcanza el dominio; ya ocurrió en [#88](https://github.com/Gunz-cop/DescargasIA/issues/88) (`CONNECT tunnel failed, 403`) | Este documento §7.4 |
| D8 | Por qué 3 URLs con impresiones no están en la tabla de indexadas | **No explicado** | Descartar un problema de indexación | Este documento §7.5 |
| D9 | Export de Cloudflare con sus filtros | **Ausente** | Separar clics de Google de salidas por `/r` (`#47`) | `baseline.md`, sección Cloudflare · F1 |
| D10 | Volumen de mercado por consulta | **Ausente** | Priorizar por demanda y no por riesgo observado | `research/es.md` §1.2 |
| D11 | Quién actualiza esta evidencia y cada cuánto | **Sin dueño** | Que exista un «después» comparable para §9 | #50, segunda mitad de la pregunta original |

**D11 es el que bloquea el plan entero.** Sin un corte posterior tomado con la
misma ventana y los mismos filtros, ningún experimento de §9 se puede leer, por
bien diseñado que esté.

---

## 12. Qué NO hace este documento

- No cambia ninguna ficha, título, `description`, ruta, `canonical`, `hreflang`
  ni línea de código.
- No crea `docs/mejora/seguimiento.md`: es propiedad de F7 (#47) y este
  documento no escribe las conclusiones de esa fase.
- No edita `baseline.md`, `decisiones.md`, `evidencias.md` ni `research/es.md`:
  pertenecen a F0, a la ingesta de evidencia y a F2-ES.
- No cierra la decisión abierta del alcance geográfico de `es`.
- No cierra #50 ni el blocker de F7.
- No propone retirar la afirmación «alternativas verificadas» de los títulos:
  lo señala en §7.2 para que lo evalúe quien corresponda.
- No usa datos de Bing, porque no existen en este repositorio.
