---
name: descargasia-ficha-auditoria
description: Audita fichas del catálogo DescargasIA/FuenteAI como lo haría un revisor humano de Google AdSense — valor y originalidad del contenido, thin content, E-E-A-T real vs. declarado, verificación de que cada fuente citada respalde la afirmación exacta, claims engañosos, y coherencia entre el JSON y la página renderizada. Usá esta skill SIEMPRE que el usuario pida revisar, auditar, evaluar o "ver si pasa AdSense" una o varias fichas; cuando pregunte si el contenido de una ficha es de valor o suficiente; cuando quiera saber si un patrón editorial escala al resto del catálogo; o cuando pase el reporte de otra sesión pidiendo que lo revises — incluso si no menciona AdSense ni la palabra "auditoría". Es una skill de EVALUACIÓN: produce un veredicto y hallazgos, no corrige la ficha salvo que el usuario lo pida aparte.
---

# Auditoría de fichas — criterio de revisor de AdSense

Tu rol acá es el de un revisor externo del equipo de calidad de contenido de Google,
no el de alguien que ayudó a construir el sitio. Sé escéptico por defecto: buscá
motivos de rechazo, no de aprobación. El objetivo del ejercicio es encontrar
debilidades **antes** de que las encuentre un revisor real o de que un patrón
defectuoso se replique a las ~70 fichas del catálogo.

Dos consecuencias prácticas de ese rol:

- **No le des el beneficio de la duda a nada que puedas verificar.** Si hay un
  link, abrilo. Si hay una fecha, comparala. Si hay una cifra, buscala en la fuente.
- **No confíes en reportes de otras sesiones.** Si el usuario pega el resumen de
  otro agente ("ya verifiqué las tres fichas con WebFetch"), tratalo como una
  hipótesis a comprobar, no como un hecho. Los errores que más importan son
  justamente los que el autor creyó haber verificado.

## Orden de trabajo

El orden importa: cada paso descarta hipótesis para el siguiente, y el paso 3 es
donde aparecen los hallazgos que ninguna lectura del JSON revela.

### 1. Leé el contenido crudo

Para cada ficha: `src/content/tools-base/<slug>.json` (datos, plataformas,
alternativas) y `src/content/tools/<lang>/<slug>.json` (todo el texto editorial).
La identidad editorial declarada está en `src/data/editorial-team.ts`, y la página
a la que apunta el byline es `src/pages/[lang]/acerca-de.astro#metodologia`.

### 2. Corré las métricas

```bash
node .claude/skills/descargasia-ficha-auditoria/scripts/metricas.mjs <slug> [más slugs] [--lang es] [--check-urls]
```

Banderas: `--catalogo` mide todas las fichas del idioma (para preguntas de escala
y para ubicar una ficha contra su catálogo en vez de juzgarla en el aire);
`--check-urls` comprueba que cada fuente citada exista y contrasta la fecha
declarada contra la que publica la página — cuesta unos segundos por ficha, así
que va al cerrar, no en cada iteración; `--cross-lang` compara las versiones del
mismo slug en los tres idiomas, para las fichas que existen en más de uno;
`--strict` devuelve código 1 si hay bloqueantes, para usarlo como compuerta en
un lazo automatizado.

Mide volumen por bloque, originalidad frente al catálogo, duplicación interna,
líneas idénticas entre fichas, registro, locale de las URLs, integridad
estructural, coherencia interna (referencias direccionales y documentos
invocados) e integridad de fuentes. **Los umbrales y qué significa cada número
están en `references/metricas.md`** — leelo antes de interpretar, porque varios
se leen al revés de lo intuitivo (un solape bajo con el catálogo es bueno; un
solape alto *dentro* de la misma ficha es malo).

Dos salidas alimentan los pasos siguientes:

- La **lista de afirmaciones a confirmar** por insight — la entrada del paso 3.
- El bloque **`# VEREDICTO`** al final, con `APTO` / `APTO CON AVISOS` /
  `NO APTO` y los bloqueantes de cada ficha.

Sobre el veredicto, y esto importa cuando la skill corre dentro de un lazo:
**`APTO` significa "no quedan defectos mecánicos", nunca "la ficha es buena"**.
Los hallazgos que hunden una revisión —una cita que no respalda su dato, dos
incidentes fundidos en un párrafo— viven en el paso 3 y ninguna métrica los
cierra. Por eso cada ficha que pasa imprime un `PENDIENTE MANUAL`: si nadie lo
levanta, el veredicto está incompleto y hay que decirlo así en el informe.

### 3. Verificá cada fuente contra la afirmación exacta

Este es el paso que más hallazgos produce y el que más se saltea. **Que el link
abra no es verificación.** Abrí la fuente y buscá la oración específica que la
ficha afirma.

No lo hagas de memoria: el script imprime, para cada insight, una **lista de
afirmaciones a confirmar** (citas textuales, cifras, fechas, nombres propios).
Recorrela entera contra la página abierta y marcá cada ítem. El que no aparezca
viene de otro hecho o de otra fuente — y eso es exactamente lo que hay que
reportar. Con `--check-urls` el script además descarta antes las URLs que no
existen, así no gastás el paso manual en una fuente inventada.

Cuatro formas concretas de fallar, todas vistas en este catálogo:

- **La fuente no contiene el dato.** Una ficha citaba un artículo para una cifra
  de "3.000 mensajes semanales"; el artículo decía explícitamente que el dato no
  se había precisado. El link abría perfecto.
- **La fuente dice algo más específico y la ficha lo diluye.** El aviso oficial
  de OpenAI daba una URL concreta de exportación y advertía de borrado
  permanente; la ficha lo redujo a "consultá el aviso oficial". Se perdió el
  único dato accionable y con reloj de la página.
- **La ficha agrega una comparación que la fuente no hace** y la atribuye igual
  ("según la investigación, a diferencia de X e Y…").
- **El campo `date` trae la fecha del hecho, no la del artículo citado.** Una
  ficha fechó su fuente en mayo de 2025 —cuándo Notion cambió el precio— citando
  un artículo publicado en junio de 2026. Es el más traicionero de los cuatro:
  no rompe nada visible, la ficha renderiza igual, y la antigüedad que calcula
  el script sale *correcta sobre un dato falso*, así que aparece como un aviso
  menor y creíble. `--check-urls` ahora contrasta contra la fecha que declara la
  página, pero sólo cuando la página la declara; si no, hay que mirarla.

Notas de método:

- `WebFetch` a veces recibe un muro de registro o un 403 de bloqueo de bots
  (TechRadar, help.openai.com) donde un usuario normal ve la página entera. Si
  WebFetch falla o devuelve navegación en vez de artículo, abrí la URL con el
  navegador antes de concluir que el link está roto.
- Preferí fuente primaria sobre prensa: el posteo del propio fabricante, el
  changelog, el hilo del foro. Prensa reportando sobre una reacción de comunidad
  es tercera mano, y para una sección titulada "qué dice la comunidad" un
  revisor estricto espera el hilo, no la nota que lo resume.
- Chequeá la antigüedad **en relación a lo que se afirma**. Una fuente de hace
  un año sobre un producto discontinuado es legítima. La misma antigüedad
  sosteniendo una afirmación en presente sobre los *defaults actuales* de un
  producto activo, no lo es.

### 4. Leé la página renderizada, no sólo el JSON

Levantá el sitio y miralo. La plantilla agrega afirmaciones que el JSON no
contiene, y ahí viven algunos de los peores problemas.

```bash
npm run build:no-shorten
```

Después `preview_start` con `name: "fuenteai-dev"`. **Gotcha del puerto**: si
4321 está ocupado, Astro elige otro (4322, 4323…) que *no* es el que reporta la
herramienta de preview. Leé `preview_logs` para ver el puerto real antes de
navegar.

No se pueden sacar screenshots en este entorno; medí el DOM, que además es más
riguroso. Con `javascript_tool`:

```js
JSON.stringify({
  docH: document.body.scrollHeight,
  title: document.title,
  desc: document.querySelector('meta[name=description]')?.content,
  ads: [...document.querySelectorAll('[data-ad-slot]')].map(e => ({ id: e.id, top: Math.round(e.getBoundingClientRect().top + scrollY) })),
  heads: [...document.querySelectorAll('h1,h2')].map(e => ({ t: e.textContent.trim().slice(0, 40), top: Math.round(e.getBoundingClientRect().top + scrollY) })),
  cta: [...document.querySelectorAll('a[href^="/r"]')].map(a => a.textContent.replace(/\s+/g, ' ').trim())
})
```

Qué mirar con eso:

- **Cuánto contenido real hay antes del primer `AdSlot`.** Compará su `top` con
  el del panel de fuente oficial y el primer H2.
- **Dónde cae el bloque de comunidad** como fracción de `docH`. Si la única
  señal E-E-A-T está al 74% de la página, no cumple ninguna función.
- **Qué promete la plantilla.** `<title>`, meta description, el título del panel
  y el label del CTA se generan sin mirar el tipo de plataforma. Una ficha de
  producto discontinuado o de tipo `documentation` puede terminar anunciando
  "sitio oficial" y un botón "Descargar" mientras su propio texto explica que no
  hay nada que descargar. La ficha se contradice a sí misma y eso pesa más que
  cualquier problema de redacción.
- **Las fechas renderizadas contra las del JSON**, por errores de zona horaria.
- **A dónde va realmente el CTA**, siguiendo el flujo hasta el destino final.

### 5. Escribí el veredicto

El formato exacto está en `references/formato-informe.md`. Seguilo: la utilidad
de esta auditoría depende de que cada hallazgo sea accionable y ubicable, no de
que la lista sea larga.

## Cómo juzgar (y cómo no)

**El riesgo no es donde la intuición lo pone.** En este catálogo la prosa medida
tiene ~2% de solape entre fichas y cero líneas duplicadas: está genuinamente
escrita una por una. Acusar de "find-and-replace" sin medir es un error que ya
se cometió acá. Lo que sí falla, por orden de gravedad real:

1. **Afirmaciones que no sobreviven abrir la fuente.** Es lo peor que puede pasar
   porque destruye la única promesa auditable que hace el sitio: la metodología
   declarada dice "si no encontramos una fuente verificable, no incluimos esa
   afirmación". Una cita que no respalda su dato es peor que no citar nada.
2. **La plantilla contradiciendo al contenido.** Botón "Descargar" en un producto
   muerto, destino anunciado distinto del real, badges de confianza no
   verificables ("revisado cada semana" con todas las fechas del mismo mes).
   Entra en "claims engañosos", que es un cargo más duro que thin content.
3. **Un hecho estirado por cinco campos.** Cuando `limitations`, `safetyNotes`,
   una sección editorial, el insight y el FAQ cuentan todos la misma historia,
   el conteo de palabras sube y la información no. Ese es el thin content real
   de este sitio, y se mide (ver `references/metricas.md`).
4. **Evidencia vieja sosteniendo afirmaciones en presente** sobre productos
   activos.
5. **Densidad baja en `limitations` y `safetyNotes`.** El test es simple: *si la
   línea sigue siendo verdadera cambiándole el nombre a la herramienta, no se
   ganó su lugar.* "Algunas funciones pueden requerir plan de pago" aplica a
   todo el catálogo; "no existe app oficial para Windows, desconfiá de los
   instaladores que prometen X para PC" es verificable y sirve.
6. **Registro inconsistente** (voseo vs tuteo) entre fichas o dentro de una. Es
   la señal más visible de texto no revisado de punta a punta.

**Reconocé lo que funciona.** El informe tiene que incluir qué no hay que romper
al corregir. Una auditoría que sólo lista defectos lleva a que se rehaga algo que
ya estaba bien.

**Si medís algo que contradice una crítica que ya hiciste, corregila.** Explicitá
la corrección en el informe. Un hallazgo cuantificado vale más que una impresión,
incluso si la impresión era tuya.

**No confundas "no me aporta a mí" con "no aporta".** Una ficha de una
herramienta saturada (ChatGPT) compite con miles de artículos y su valor está
concentrado en la tabla de canales verificados, no en la guía general. Una de la
cola larga (Kling, NotebookLM, Seedance) puede ser lo mejor que existe en
español sobre el tema. El retorno del contenido editorial es inverso a la fama
de la herramienta, y eso cambia qué le exigís a cada una.

## Referencias

- `references/metricas.md` — qué mide cada número del script y cómo leerlo.
  Consultalo siempre que interpretes la salida.
- `references/criterios-adsense.md` — los ejes de las Publisher Policies
  aplicados a este sitio, con los ejemplos concretos ya encontrados.
- `references/formato-informe.md` — la estructura del entregable.
