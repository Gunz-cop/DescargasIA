# Cómo leer la salida de `metricas.mjs`

Los umbrales de acá salen de medir el catálogo real de DescargasIA, no de un
estándar externo. Cuando el catálogo cambie mucho, vale recalibrarlos corriendo
`--catalogo` y mirando la distribución.

Ningún número por sí solo es un veredicto. Sirven para dirigir la atención y para
evitar afirmar cosas que no se sostienen — que es el error más caro que puede
cometer una auditoría.

---

## Volumen — palabras de editorial propio

Suma el texto escrito específicamente para esa ficha, sin contar nada que genere
la plantilla.

| Rango | Lectura |
|---|---|
| < 400 | Thin content probable. Justificá el veredicto con esto. |
| 400–700 | Justo. Aceptable si la densidad de información es alta. |
| 700–1.200 | Rango normal del catálogo (ChatGPT 1.056, Sora 1.026, Otter 998). |
| > 1.500 | Revisá que no sea el mismo hecho repetido — mirá duplicación interna. |

El desglose por bloque importa más que el total. Si `editorialSections` es el 80%
y `limitations`/`safetyNotes` juntos no llegan a 60 palabras, la ficha tiene
mucha prosa general y poca información específica y accionable — que es
exactamente al revés de lo que le sirve al lector que llegó buscando descargar
algo.

---

## Originalidad — solape de 5-gramas con el resto del catálogo

Cuenta secuencias de 5 palabras de la prosa de esta ficha (`editorialSummary` +
cuerpos de `editorialSections`) que también aparecen en otra ficha del mismo
idioma. Cinco palabras es el largo justo: castiga la reutilización real de frases
sin marcar giros comunes de dos o tres palabras.

| Solape con el catálogo | Lectura |
|---|---|
| < 5% | Sano. El catálogo real está en ~2% (ChatGPT 1,9%, Sora 0,7%). |
| 5–15% | Hay párrafos plantilla. Mirá qué fichas comparte y qué frases. |
| > 15% | Contenido duplicado de verdad. Hallazgo de prioridad alta. |

**Este número suele desmentir la sospecha de "find-and-replace", no confirmarla.**
Medilo antes de acusar. Lo que sí puede estar templado son los *títulos* de las
secciones aunque el cuerpo sea original — eso se ve leyendo, no acá, y es un
problema bastante menor: es una firma estructural, no contenido duplicado.

---

## Duplicación interna — el insight repetido en el resto de la ficha

Compara el texto de `communityInsights` contra el resto del editorial de **la
misma ficha**. Acá el criterio se invierte: alto es malo.

| Duplicación interna | Lectura |
|---|---|
| 0–10% | El insight aporta algo que la ficha no decía. Es el objetivo. |
| 10–25% | Solapamiento parcial; se puede recortar. |
| > 25% | El insight reescribe una sección que ya existe. Infla palabras sin sumar información. |

Referencias reales: `otter-ai` 0,0% y `chatgpt` 0,0% (bien: el insight narra un
incidente concreto que ninguna sección cuenta). `meta-ai` 28,1% y `sora` 27,6%
(mal: la misma historia aparece hasta en cinco campos entre `limitations`,
`safetyNotes`, sección editorial, insight y FAQ).

Cuando dé alto, contá a mano en cuántos campos aparece el hecho y reportá ese
número — es mucho más elocuente que el porcentaje.

---

## Líneas idénticas a otras fichas

Busca ítems de `limitations`, `safetyNotes` y `bestFor` normalizados que
aparezcan textualmente en más de una ficha.

Cualquier resultado distinto de "ninguna" es un hallazgo directo, sin matices:
es contenido duplicado literal entre páginas. El catálogo actual tiene cero, así
que si aparece algo es una regresión reciente.

Ojo con lo que **no** detecta: líneas únicas en redacción pero genéricas en
significado. Para eso está el test de la sección "Cómo juzgar" de SKILL.md —
cambiale el nombre a la herramienta y fijate si la frase sigue siendo verdadera.

---

## Registro — voseo vs tuteo

Cuenta formas verbales inequívocas de cada registro. Sólo cuenta voseo con
tilde (`podés`, `revisá`), porque las formas sin tilde (`revisa`, `usas`) son
tuteo y confundirlas hace que todo el catálogo parezca mezclado.

El catálogo es abrumadoramente **tuteo**: 56 de 60 fichas. Las excepciones al
momento de escribir esto son `meta-ai`, `otter-ai`, `seedance` y `sora`.

- Ficha en voseo cuando el catálogo es tuteo → inconsistencia de sitio. Además,
  el voseo rioplatense reduce alcance en un sitio que apunta a todo el mercado
  hispanohablante.
- Marca `← MEZCLA` con **un solo** token de la forma minoritaria. Suena
  agresivo, pero la regex sólo cuenta formas con tilde y el catálogo es tuteo
  casi puro: en 60 fichas hay un único caso marcado. Un `preferís` suelto en una
  ficha por lo demás tuteante es un resto de una reescritura a medio terminar,
  no una decisión de estilo.

Lo importante no es cuál registro se elija sino que sea uno solo, en toda la
ficha y en todo el catálogo.

Este chequeo sólo aplica a `--lang es`. Con `it` o `sv` va a dar siempre
`indeterminado` o `tuteo=0`: ignoralo, no significa nada ahí.

---

## Fuentes citadas

No evalúa nada: lista las URLs de `communityInsights`, `officialSources` y cada
plataforma para que las abras. **Esa lista es tarea pendiente, no resultado.**

Sobre las fechas de los insights:

- **`date` es la fecha de publicación del artículo citado, no la del hecho que
  narra.** La distinción parece pedante y no lo es: una ficha declaró mayo de
  2025 (cuándo Notion cambió el precio) citando un artículo de junio de 2026. El
  script imprimió "15 meses de antigüedad" — aritméticamente impecable sobre una
  entrada equivocada. Un aviso menor y verosímil es el peor lugar donde puede
  esconderse un dato falso, porque nadie lo mira dos veces. Con `--check-urls`
  se contrasta contra `article:published_time` / `datePublished` / `<time>` de la
  propia página y avisa si difieren más de 60 días; si la página no declara
  fecha, no hay red de contención y hay que mirarla a mano.
- Avisa si el formato no es `YYYY-MM-DD` (el schema acepta cualquier string, así
  que `"2025-06"` pasa la validación y renderiza, pero rompe la consistencia).
- Avisa si la fuente tiene más de 12 meses. Eso **no** es un defecto por sí
  mismo: depende de qué sostenga. Sobre un producto discontinuado, una fuente
  vieja es la correcta. Sosteniendo cómo se comporta *hoy* un producto activo
  —los defaults de una función, un límite de plan— es un problema real, porque
  el lector va a buscar en la interfaz algo que quizás ya no se llama así.

---

## Integridad

- **`alternatives` rotas**: slugs declarados que no existen en `tools-base`.
  Cualquier resultado es un error a corregir.
- **`alternatives` declaradas < 3**: la plantilla completa hasta 6 con
  herramientas de la misma categoría. Funciona, pero la sección deja de ser
  editorial y puede ofrecer comparaciones que no tienen sentido (Character.AI
  como alternativa a ChatGPT para programar).
- **`alternatives` sin categoría en común**: se imprimen junto a las categorías
  propias de la ficha. Salió del caso ElevenLabs, que enlazaba Runway, Luma y
  Canva —video y diseño— siendo una herramienta de voz, mientras su propio texto
  nombraba otras tres. Leelo en las dos direcciones: puede que las alternativas
  estén mal, o puede que la categoría de la ficha esté mal y las alternativas
  sean el síntoma. ElevenLabs sigue catalogada como `video-ia`, así que el aviso
  persiste incluso con las alternativas ya corregidas — y está bien que persista,
  porque la plantilla rellena por categoría y una categoría equivocada envenena
  la sección sin dejar rastro en ningún otro lado.
- **`status`**: `active` o `discontinued`. El flag no es cosmético — cambia el
  `<title>`, la meta description, el título del panel, el label del CTA y la
  línea de mirrors. Una ficha de producto muerto sin el flag anuncia
  "sitio oficial" en Google y muestra un botón "Descargar".
- **Todas las plataformas de tipo `documentation` y `status: active`**: dispara
  un aviso, porque la plantilla va a prometer una descarga. Si el `status` ya es
  `discontinued`, no avisa: está resuelto.
- **Herramientas nombradas en la prosa pero no declaradas como alternativa**:
  si el texto dice "revisá las alternativas enlazadas" y nombra herramientas que
  la ficha no enlaza, el lector busca algo que no está.

---

## Coherencia interna

Dos chequeos que salieron de errores reales, repetidos, de este catálogo.

### Referencias direccionales

El script conoce el orden en que `[slug].astro` pinta las secciones y compara
cada "más abajo" / "debajo" / "más arriba" contra la posición real de la sección
mencionada. Un `ERROR de dirección` es un hallazgo directo: el texto manda al
lector a buscar donde no está.

El orden real, que conviene tener presente al leer la ficha:

```
alternativas → plataformas → para qué sirve → qué debes saber
→ qué dice la comunidad → guía completa (secciones editoriales)
→ seguridad → límites → preguntas frecuentes
```

Las dos trampas frecuentes: **las alternativas van casi al principio** (decir
"las alternativas de abajo" es falso) y **"qué dice la comunidad" va antes de la
guía y de los límites** (una limitación que remite a "la comunidad, más abajo"
está mal).

Si la frase tiene una referencia direccional pero el script no reconoce a qué
sección apunta, la reporta como "sin destino claro" para que la mires a mano.

Funciona en los tres idiomas: las fichas `it` y `sv` se escriben traduciendo las
`es`, así que el bug direccional viaja con la traducción y hay que buscarlo ahí
también.

Dos exclusiones deliberadas, ambas por falsos positivos reales: **"más adelante"**
(en español casi siempre es temporal, no espacial) y **"por debajo"** (idiomático:
"usa Supabase por debajo" = *under the hood*). Y "plataforma" a secas no cuenta
como referencia a la sección de plataformas — es sustantivo común en casi toda
ficha ("la plataforma genera el frontend").

### Documentos invocados sin enlazar

Marca frases del tipo "según la documentación oficial", "según el aviso de X",
"según su centro de ayuda". No verifica nada: te avisa para que confirmes que
ese documento esté entre las fuentes enlazadas de la ficha.

Importa porque la metodología declarada del sitio promete incluir el enlace real
a la fuente. Invocar un documento como respaldo y no enlazarlo es exactamente el
incumplimiento que un revisor puede comprobar. Reconoce las tres formas
(`según la…`, `secondo la…`, `enligt…`).

---

## Integridad de las fuentes

Tres chequeos que salieron de una tanda de fichas-trampa. Antes de ellos, una
ficha con fuente inventada sacaba el mejor veredicto de todo el lote.

### `--check-urls`

Pedile a cada URL citada que responda. **404 o 410 bloquean**: la fuente no
existe, y una fuente inventada es el fallo más probable de un redactor
automático. **403 y 401 sólo avisan** — casi siempre es bloqueo de bots
(`poe.com`, `genspark.ai`, `help.openai.com` y TechRadar dan 403 a un script y
cargan perfecto en el navegador). Nunca declares una URL rota por un 403 sin
abrirla.

Cuesta unos segundos por ficha, así que corrélo al cerrar una ficha, no en cada
iteración.

### El insight no puede citar al fabricante

Si el `source` del `communityInsight` cae en el dominio de la propia herramienta,
bloquea. Una sección titulada "Qué dice la comunidad" respaldada por la home o el
changelog de la marca no es evidencia de experiencia: es marketing con otra
etiqueta. Casos vivos: una ficha citaba la home del fabricante y presentaba su
copy publicitario como opinión de usuarios; otra citaba el changelog propio como
prueba de que los usuarios se habían quejado.

**El repositorio de soporte del fabricante en GitHub sí cuenta.** La regla mira
el dominio, así que un issue en `github.com/<marca>/support` pasa — y tiene que
pasar: el issue lo escribe un usuario, con nombre, fecha y bug reproducible. Es
material de comunidad alojado por la marca, no material de la marca.

### Dónde buscar cuando parece que no hay nada

Este bloqueo es el único que puede empujar a inventar, porque exige algo que a
veces no existe. En una prueba con una herramienta sin reseñas en G2, sin hilos
de Reddit indexados y sin cobertura de prensa, el redactor encontró material
real recién en el cuarto canal. El orden que funcionó:

1. Reddit y foros del nicho, 2. G2 / Capterra / Trustpilot, 3. prensa,
4. **el issue tracker o el repo de soporte en GitHub**, 5. Discord público.

El riesgo medido no es que la compuerta rompa: es que un redactor con menos
paciencia se conforme antes con una cita débil —un comentario suelto sin
verificar— en vez de seguir buscando. Cuando revises un insight que huele a
relleno, la pregunta no es "¿existe la fuente?" sino "¿es lo mejor que había, o
es lo primero que apareció?".

Si de verdad no hay nada en los cinco canales, la salida honesta es decirlo en
el informe nombrando los canales revisados, no aflojar el bloqueo. Una ficha sin
insight es una ficha que todavía no está lista; una con un insight inventado es
un problema de política de contenido.

### Lista de afirmaciones a confirmar

Para cada insight, el script extrae los tokens duros —citas textuales, cifras,
fechas, nombres propios— y los imprime como checklist junto a la URL.

Esto existe porque "abrí la fuente y fijate si respalda lo que dice" es una
instrucción sin forma de fallar visiblemente, y por eso se cumple a medias. La
checklist la convierte en algo donde saltearse un ítem se nota. En las pruebas,
los dos defectos que se habían escapado eran literalmente ítems de esta lista:
una cifra de dólares que no estaba en el changelog citado, y cuatro nombres
propios (dos avatares, una campaña y un partido) que venían de un reporte de otro
año, no del artículo citado.

**Recorré la lista entera contra la página abierta.** El ítem que no aparezca
viene de otro lado, y ese "otro lado" hay que citarlo aparte o sacarlo.

### Cifras huérfanas en el cuerpo editorial

Cifras que aparecen en `editorialSections` pero en ningún insight. Avisa, no
bloquea. El patrón que persigue es el de un párrafo que funde dos incidentes
reales y remite a un único insight: la cifra del segundo hecho no está ni en el
insight ni en la fuente, así que el lector no tiene forma de verificarla. Si una
de esas cifras sostiene un hecho distinto del que cubre la fuente citada,
necesita fuente propia.

Falsos positivos esperables: las **cifras de especificación** —minutos del plan
gratuito, precios, límites de caracteres— aparecen en la prosa y no en ningún
insight porque no las respalda un insight sino `officialSources`. La ficha
italiana de Otter marcó "300" por los 300 minutos del plan Basic, y era correcto
que estuviera ahí. Antes de reportar una cifra huérfana, fijate si el dato es de
producto (va contra la fuente oficial) o de incidente (va contra el insight):
sólo el segundo caso es un hallazgo.

---

## `--cross-lang` — el mismo slug en varios idiomas

Las fichas `es`, `it` y `sv` de un mismo producto se escriben por separado, así
que un dato corregido en una se queda viejo en las otras. Ya pasó dos veces con
Otter.ai: la versión italiana verificó que las lenguas de transcripción eran
seis y la española siguió diciendo tres durante meses.

La bandera compara las cifras del texto completo de cada versión y marca las que
aparecen en una sola, más el número de `communityInsights` por idioma.

Cómo leerlo, porque casi todo lo que imprime **no** es un defecto:

- Si los volúmenes son dispares (una curada, otra en crudo), la divergencia es
  esperable y el script lo dice sin avisar. La ficha larga tiene hechos que la
  corta no cuenta.
- Si los volúmenes son comparables (±50%) y una cifra está en una sola versión,
  ahí sí avisa: dos fichas del mismo tamaño hablando del mismo producto que no
  coinciden en un número suelen ser una desactualizada y otra al día.

En el catálogo actual avisa en 6 de 61 fichas, que es la tasa que buscás en un
chequeo así: si avisara en 40 nadie lo leería.

**Y cuando encuentres cuál versión está al día, la corrección va en todas.** El
hallazgo de Otter se descubrió escribiendo la ficha italiana y la española
quedó mal un ciclo entero porque nadie lo propagó hacia atrás.
