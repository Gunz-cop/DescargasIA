# Editorial Writing

## Voz

Escribí para alguien que escanea la página, desconfía de descargas falsas, y quiere llegar rápido al canal oficial correcto para su dispositivo.

Tono:

- claro, no de marketing;
- práctico;
- honesto sobre la incertidumbre (si algo no existe, decilo; si algo cambió de nombre, explicalo);
- específico de esa herramienta — nunca un párrafo que podría pegarse tal cual en otra ficha.

## Registro: tú neutro, siempre

Todo el contenido de usuario (`shortDescription`, `longDescription`, `bestFor`, `limitations`, `safetyNotes`, `editorialSummary`, `editorialSections`, `faq`) va en **tú neutro** — "puedes descargarlo", "necesitas cuenta", "si quieres compararlo con...". Nunca voseo ("podés", "tenés", "necesitás").

Esto no es una preferencia estética: se decidió así después de encontrar que el catálogo tenía los dos registros mezclados, a veces dentro del mismo archivo (`chatgpt.json`, la ficha más madura del sitio, usaba "puedes" y "sos" en el mismo párrafo). Un sitio que vende confianza y verificación no puede sonar como una traducción automática. Antes de dar una ficha por terminada, releé el texto buscando "podés/tenés/necesitás/querés/usás/sos" y cambialo a la forma con tú — no importa si la ficha de ejemplo que estás mirando como referencia todavía tiene el registro viejo, no la imites en eso.

## Estructura

Cada ficha debería responder, en algún punto del contenido:

1. ¿Qué es esta herramienta?
2. ¿Se puede descargar, o es solo web/extensión/tienda?
3. ¿Qué canal oficial conviene usar según mi plataforma?
4. ¿Qué estafas o instaladores falsos hay que evitar con esta herramienta puntual?
5. ¿Cuándo conviene elegirla?
6. ¿Con qué alternativas conviene compararla?

## SEO sin contenido delgado

Usá naturalmente frases como:

- "descargar <herramienta>";
- "<herramienta> para Windows/Mac/Android/iOS";
- "app oficial", "instalador oficial", "web oficial";
- "APK";
- "alternativas a <herramienta>";
- frases de categoría: "generador de imágenes IA", "modelo local", "asistente IA", "video IA", "agente de código".

No hagas keyword-stuffing. Metele la confusión real del usuario al texto: por qué busca esto, qué le puede salir mal, qué duda concreta tiene.

## Secciones editoriales

3-5 secciones, cada una con:

- un encabezado específico de esa herramienta (no genérico tipo "Características");
- dos párrafos cortos;
- al menos una decisión o advertencia concreta, no solo descripción.

Ideas de buenos encabezados (adaptalos, no los copies literal en cada ficha):

- "Por qué tanta gente busca descargar X"
- "X no se instala como una app tradicional" (cuando aplica)
- "Web, escritorio y móvil: qué canal usar"
- "Cómo evitar clones o instaladores falsos"
- "De [nombre anterior] a [nombre actual]" (cuando hubo un rebranding reciente)
- "Cuándo elegir X y cuándo mirar alternativas"

Evitá repetir la misma estructura literal de sección en sección de una ficha a otra — el objetivo es que cada una se sienta escrita para esa herramienta puntual, no rellenada desde una plantilla.

## FAQ

Apuntá a intención de búsqueda real y con potencial de schema FAQPage:

- "¿X tiene app oficial para Windows?"
- "¿Es seguro descargar X desde terceros?"
- "¿X funciona en español?"
- "¿Necesito cuenta para usar X?"
- "¿Existe APK oficial de X?"

Las respuestas tienen que ser concisas y no prometer de más. Si algo no está confirmado, decilo ("no se confirma un instalador oficial para Linux al momento de esta revisión") en vez de asumir que sí existe.

## Cuando la herramienta no tiene instalador o le falta una plataforma

No lo escondas ni lo minimices. Aclarálo en:

- `limitations`;
- `editorialSummary`;
- al menos un bloque de `editorialSections`;
- el FAQ;
- `safetyNotes` (si el vacío de plataforma genera riesgo de apps falsas — suele pasar).

Ejemplos reales de la primera tanda de fichas: Ideogram no tiene app oficial de Android (solo iOS + web); Udio no tiene apps móviles oficiales y en un momento pausó las descargas de audio; Open WebUI no es "instalable con un clic", requiere Docker o Python.

## `bestFor` nunca puede quedar vacío

Este es un caso donde un campo vacío no es "neutral", es activamente dañino. En `src/pages/[lang]/[slug].astro` hay un fallback: si `tool.bestFor` está vacío, el template genera automáticamente bullets del tipo "Usuarios que buscan lm studio · Usuarios que buscan local · Usuarios que buscan offline" a partir de los `tags`. Son keywords crudos renderizados como si fueran casos de uso, y es la señal más visible de contenido auto-generado que puede tener una ficha — exactamente lo que este catálogo existe para evitar.

Escribí siempre los 4 `bestFor` con casos de uso reales y específicos de la herramienta (ver `references/schema-contract.md`). Si en algún momento estás editando una ficha existente y notás que `bestFor` está vacío (le pasa a algunas fichas anteriores a esta skill: `claude`, `cursor`, `lm-studio`, `ollama` al momento de escribir esto), completalo aunque no sea el pedido original — es una corrección de bajo riesgo y alto impacto.

## Investigación de comunidad (`communityInsights`)

Este campo existe para la "E" de Experiencia de E-E-A-T: como no probamos cada herramienta de primera mano, salimos a buscar evidencia real de gente que sí la usó, en vez de fingir experiencia propia.

Cómo buscarla:

- `WebSearch` dirigido, no genérico: `"<herramienta> reddit bug"`, `"<herramienta> reddit límite"`, `"<herramienta> discord problema"`, `"<herramienta> issues github"`, o el subreddit/foro oficial de la herramienta si existe uno conocido.
- Buscá algo concreto y verificable: un límite real (cuota, censura, rendimiento), un bug reportado, un truco de uso no obvio, una comparación que la propia comunidad hace con una alternativa. No busques opiniones genéricas tipo "es buena/mala".

Qué cuenta como fuente válida (mismo criterio que `references/source-policy.md` aplica a los canales de descarga: primaria, real, verificable):

- un hilo de Reddit, un post de Discord (si es público/indexado), un issue de GitHub, un foro oficial de la herramienta — con URL que se pueda abrir y confirmar.
- **no** cuenta: memoria propia sin fuente, foros de spam/SEO, respuestas generadas por IA dentro del propio hilo, generalizaciones tipo "muchos usuarios dicen que..." sin un link puntual detrás.

Regla no negociable: **si no encontrás una fuente real y verificable para una herramienta dada, no completes `communityInsights`.** Dejalo como `[]` (el default del schema) y seguí con el resto de la ficha. No generalices, no inventes un hilo plausible, no parafrasees sin link. Una ficha sin esta sección es mejor que una con un dato fabricado — es exactamente el tipo de "confianza fabricada" que Google penaliza en E-E-A-T.

Formato de cada insight: `text` en prosa propia (no pegado literal del foro), `source` con la URL real, `sourceLabel` opcional para dar contexto legible ("Hilo en r/ChatGPT", "Issue en GitHub"), `date` opcional con la fecha del post citado (no la fecha de hoy).

### `WebFetch` el cuerpo real antes de citar un dato específico — no confíes en el resumen de `WebSearch`

Esto pasó en la práctica y produjo un P0 real: se citó un artículo cuya URL sí era correcta, pero el **resumen que devolvió `WebSearch` incluía datos (una cifra, una mención a Reddit) que el artículo mismo no contenía** — probablemente agregados o parafraseados de otras fuentes en el proceso de resumen. La ficha terminó afirmando algo con un link que, al abrirlo, no lo sustentaba. Un revisor humano que abre el link para verificar encuentra exactamente eso, y es peor que no citar nada.

Regla: antes de escribir cualquier `text` de `communityInsights` que incluya un dato específico (una cifra, un nombre, una fecha, una cita textual), hacé `WebFetch` sobre la URL exacta que vas a usar como `source` y pedile al modelo que confirme con una cita textual que el dato está ahí. Si `WebFetch` devuelve contenido truncado o solo navegación/paywall (pasa seguido con sitios que bloquean bots, ej. TechRadar), **no uses esa URL** — buscá una fuente alternativa que sí se pueda leer completa (foros oficiales tipo `community.openai.com`, GitHub issues, BleepingComputer y medios similares suelen ser fetcheables; sitios con muro de suscripción agresivo no).

Si el dato numérico específico no se puede confirmar así, no lo incluyas — quedate con la parte del insight que sí está confirmada (ver ejemplo real: se pudo confirmar "OpenAI subió el límite a 3.000 mensajes semanales", pero no "el límite anterior era de 200" ni "la reacción fue en Reddit", así que esas dos afirmaciones se sacaron del texto en vez de dejarlas sin verificar).

### La conclusión del insight no debería caducar

Si el `text` termina con una instrucción atada al valor exacto citado (ej. "revisá que tu límite sea de 3.000 mensajes"), se vuelve falso en cuanto la cifra cambie de nuevo — y en herramientas de IA los límites/precios cambian seguido. Preferí cerrar con una conclusión que siga siendo cierta aunque el número puntual quede desactualizado (ej. "estos límites cambian con cierta frecuencia, así que no asumas que un tope es fijo"). El dato puntual va en el cuerpo con su fecha (`date`); la conclusión no debería depender de que ese dato siga vigente.

### No hagas afirmaciones espaciales sobre la propia página sin verificar el render

Si el texto editorial dice algo como "revisá las alternativas enlazadas arriba/abajo/al comienzo de esta página", verificá contra el orden real de secciones en `src/pages/[lang]/[slug].astro` (o abrí la página renderizada) antes de asumir dónde queda eso — el orden de secciones puede cambiar entre sesiones. Mismo cuidado aplica a nombrar herramientas específicas como alternativas en el texto: solo mencionés por nombre las que estén en el array `alternatives` de `tools-base/<slug>.json` (las que se autocompletan por categoría pueden variar), para no prometerle al lector un enlace que la página no tiene.

## Herramientas técnicas / self-hosted (Docker, CLI, pip)

Cuando la herramienta no es una app tradicional (agentes de terminal como Qwen Code, interfaces self-hosted como Open WebUI, motores locales como ComfyUI en Linux), no finjas que hay un instalador de un clic. Explicá honestamente el nivel de fricción técnica real y para quién tiene sentido — esto evita generar expectativas falsas y es exactamente el tipo de "confusión real del usuario" que la voz editorial de este catálogo busca resolver.
