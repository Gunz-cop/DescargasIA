---
name: descargasia-tool-ficha
description: Investiga tendencias reales de herramientas de IA y crea o actualiza fichas del catálogo de DescargasIA/FuenteAI (repo Astro) en src/content/tools-base y src/content/tools/<lang>, verificando canales oficiales sin inventar datos, validando integridad de slugs/alternatives, corriendo el build y levantando el servidor local para previsualizar. Usa esta skill SIEMPRE que el usuario pida crear fichas nuevas, agregar herramientas de IA al sitio, buscar tendencias (incluyendo "revisar Hugging Face" o "ver qué está trending"), investigar qué herramientas faltan en el catálogo, escribir o mejorar contenido editorial de una ficha existente, o generar contenido en sueco/italiano para el catálogo — incluso si el usuario no menciona la palabra "skill" ni el nombre exacto del archivo.
---

# DescargasIA Tool Ficha

Esta skill reproduce el flujo completo que se usó para crear las primeras 25 fichas del catálogo (dos tandas: una de tendencias generales, otra descubierta a través de Hugging Face). Ese flujo funcionó bien — build limpio, contenido único, sin datos inventados — así que el objetivo aquí es que cualquier sesión futura pueda repetirlo sin tener que redescubrir cada paso desde cero.

## Por qué esta skill existe

Sin ella, cada sesión nueva tiene que releer `AGENTS.md`, descubrir que el schema real no coincide con lo que podría suponerse, aprender a mano las reglas de "no inventar URLs", y reconstruir el flujo de validación. Con ella, ese conocimiento queda empaquetado y la sesión puede ir directo a investigar y escribir.

## Antes de empezar: el schema real es la fuente de verdad, no esta skill

El schema del catálogo puede cambiar. **Siempre leé `src/content.config.ts` al empezar**, no asumas que `references/schema-contract.md` sigue siendo exacto — está para orientarte rápido, pero si hay una discrepancia entre ese archivo y `content.config.ts`, gana `content.config.ts`, y conviene actualizar la referencia después.

## Primeros pasos

1. Leé `AGENTS.md` (principios del proyecto, reglas de no-mirrors/no-APKs).
2. Leé `src/content.config.ts` para confirmar el schema vigente de las colecciones `toolsBase`, `tools`, `categories`.
3. Leé 2-3 fichas maduras de ejemplo: `src/content/tools-base/chatgpt.json` + `src/content/tools/es/chatgpt.json` (y si el pedido es sobre sueco/italiano, mirá también qué hay en `src/content/tools/sv/` — ver `references/multilingual.md`).
4. Leé `docs/ux-tool-pages.md` y `docs/ux-home-cards.md` si existen — definen cómo se renderiza la ficha y qué evitar (páginas delgadas, contenido duplicado, CTAs engañosos).
5. Leé las referencias de esta skill según la etapa en la que estés:
   - `references/workflow.md` — el proceso completo, paso a paso.
   - `references/schema-contract.md` — campos exactos del JSON (con la separación real tools-base / tools/lang).
   - `references/editorial-writing.md` — cómo escribir el contenido para que no sea "página delgada" ni contenido duplicado.
   - `references/source-policy.md` — qué cuenta como fuente oficial y qué evitar.
   - `references/validation.md` — checks antes de dar por terminado el trabajo, incluyendo el gotcha del puerto al levantar el servidor local.
   - `references/multilingual.md` — cómo funciona hoy la cobertura por idioma (es/sv/it) y qué implica agregar una ficha en sueco o italiano.

## No negociables (aprendidos en la práctica, no solo en teoría)

- **No inventes URLs.** Si no podés confirmar el ID exacto de una app en la App Store o el paquete de Google Play, no lo inventes: usá la página oficial de descargas de la marca como destino (funciona igual de bien para el usuario) u omití esa plataforma. Pasó varias veces en la sesión original (Udio, Ideogram en Android, AIVA en iOS) — mejor una plataforma de menos que un enlace roto o falso.
- **No copies texto de Hugging Face ni de ningún model card/README de terceros.** Hugging Face es excelente como señal de qué está en tendencia (`huggingface.co/models?sort=trending`, `/spaces?sort=trending`), pero el contenido editorial de cada ficha tiene que ser redactado desde cero. Copiar texto ajeno genera contenido duplicado y es exactamente lo que Google penaliza — y lo que este catálogo existe para evitar.
- **Verificá antes de escribir, no después.** Usá `WebSearch`/`WebFetch` para cada URL de plataforma antes de ponerla en el JSON. Si una marca cambió de nombre recientemente (pasó con Windsurf → Devin Desktop, y con Le Chat → Vibe by Mistral), usá el nombre y dominio vigentes, y mencioná el nombre anterior en el contenido editorial porque la gente todavía lo busca así.
- **Si algo no tiene instalador real, decilo.** No fuerces una app de escritorio o móvil que no existe. Aclarálo en `limitations`, `editorialSummary`, al menos una sección editorial, el FAQ y `safetyNotes` — es el mismo patrón que ya usa el catálogo para Midjourney o GitHub Copilot.
- **`alternatives` debe apuntar a slugs que existen de verdad.** Cruzá contra los slugs actuales (`ls src/content/tools-base`) antes de cerrar el lote, no confíes en la memoria de qué existía en una sesión anterior.
- **`bestFor` nunca va vacío.** Si queda `[]`, el sitio renderiza automáticamente bullets de keywords crudos ("Usuarios que buscan X") — es la señal de contenido basura más visible que puede tener una ficha. Ver `references/editorial-writing.md`.
- **Todo el contenido en español va en tú neutro, nunca voseo.** "Puedes", no "podés". El catálogo tenía los dos registros mezclados (incluso dentro de la misma ficha) antes de que se detectara esto — no repitas el error, y si ves voseo en una ficha que estás tocando, corregilo de paso. Ver `references/editorial-writing.md`.
- **`communityInsights` solo con fuente real y verificable.** Cada insight de "qué dice la comunidad" (bug, límite, truco de uso reportado) necesita un `source` real encontrado con `WebSearch` (hilo de Reddit, Discord, foro oficial). Si no aparece nada verificable para una herramienta, no se agrega el campo ni se generaliza sin link — la sección se omite del render cuando el array queda vacío. Nunca inventar ni parafrasear "se dice que..." sin fuente citable. Ver `references/editorial-writing.md`.
- **`WebFetch` el cuerpo real de la fuente antes de citar un dato específico de `communityInsights`.** Pasó en la práctica: `WebSearch` devolvió un resumen con una cifra y una mención a Reddit que el artículo citado no contenía — la ficha terminó con un link que no sustentaba lo que afirmaba. No confíes en el resumen de `WebSearch` para datos puntuales (cifras, citas, nombres); confirmalo abriendo la URL exacta con `WebFetch` antes de escribirlo. Si `WebFetch` devuelve solo navegación/paywall, cambiá de fuente. Ver `references/editorial-writing.md`.
- **No se fabrica una identidad de autor persona física.** La autoría de las fichas es de equipo editorial ("Redacción FuenteAI", definido en `src/data/editorial-team.ts`), reflejada como `Organization` en el JSON-LD — nunca como `Person` con nombre/foto/credenciales inventadas.
- **Si el producto está discontinuado, marcalo con `status: "discontinued"` en `tools-base` — no le prometas una descarga.** Pasó con Sora: el template arma el título, el botón CTA y el aviso de "espejo no autorizado" asumiendo que hay algo vigente para descargar. El flag cambia esas tres cosas automáticamente (ver `[slug].astro`). Sin el flag, la ficha se contradice sola (un botón que dice "Descargar" arriba de un texto que explica que no hay nada para descargar) — es un problema de "oferta de descarga engañosa", más grave que thin content.
- **Una fuente vieja no prueba un comportamiento actual.** Si el único respaldo de un `communityInsight` tiene varios años (ej. un hilo de 2022 sobre un producto que sigue activo hoy), no lo presentes como si describiera el default vigente del producto — los nombres de funciones y las pantallas de configuración cambian. Verificá con una búsqueda actual si el nombre/mecanismo sigue igual (pasó con "OtterPilot", renombrado a "Otter Notetaker") y aclará en el propio texto que la fuente es antigua. Si el producto ya no existe (como Sora), es al revés: ahí sí es honesto citar información de antes del cierre para explicar qué pasó.
- **No repitas el mismo hecho casi palabra por palabra en `limitations`, `safetyNotes`, `editorialSections`, `communityInsights` y `faq`.** Un hecho puntual (ej. un incidente de privacidad) puede aparecer en varios campos, pero cada uno debe aportar un ángulo distinto (una advertencia corta en `safetyNotes`, el relato completo con fuente en `communityInsights`, consejos prácticos de qué hacer en `editorialSections`) en vez de parafrasear lo mismo cinco veces — eso infla el conteo de palabras sin agregar información, que es la definición operativa de relleno.
- **No le atribuyas a la fuente citada una comparación que no verificaste ahí.** Si el texto de un `communityInsight` dice "a diferencia de X, que hace Y" y esa comparación no está confirmada en la fuente que citaste (aunque sea un hecho que creas cierto), sacala del insight — o verificala aparte y dejala como observación editorial tuya, no atribuida a "según la investigación".
- **Si un campo dice "más arriba" o "más abajo" para referirse a otra sección de la misma ficha, verificá el orden real de render, no el orden en que escribiste el JSON.** `communityInsights` se renderiza junto al resumen editorial, ANTES de `editorialSections`; `limitations` y `safetyNotes` se renderizan después de `editorialSections`. Pasó dos veces en la práctica (Meta AI y Sora) escribir "más abajo" en un campo que en realidad renderiza después de lo que citaba — quedaba apuntando en la dirección equivocada. Mirá el orden real en `src/pages/[lang]/[slug].astro` antes de usar una palabra direccional.
- **`officialSources` tiene que incluir cada documento que el propio texto de la ficha menciona por nombre o URL.** Si `safetyNotes` o una sección editorial le dice al lector "revisá la configuración X en el Help Center" o cita una URL concreta (ej. `sora.chatgpt.com/sunset`, un artículo de help center), esa fuente tiene que estar en `officialSources` — no alcanza con que la hayas usado para investigar, tiene que quedar trazable desde la ficha misma.

## Flujo resumido (el detalle está en `references/workflow.md`)

1. **Inventario** — listá los slugs actuales, evitá duplicados por dominio oficial o nombre normalizado.
2. **Descubrimiento** — según lo que pida el usuario: tendencias generales por `WebSearch`, o señal de Hugging Face (trending models/spaces) para identificar qué compañías/productos investigar. Cruzá cada candidato contra el catálogo existente.
3. **Verificación por herramienta** — sitio oficial, canal por plataforma (web/windows/mac/linux/android/ios), modelo de precios, si requiere cuenta. Todo con fuente verificable, no memoria.
4. **Clasificación** — usá las categorías que ya existen en `src/content/categories/*.json`; no inventes una categoría nueva para una sola herramienta salvo que el usuario lo pida explícitamente.
5. **Redacción** — `tools-base/<slug>.json` (datos técnicos, compartido entre idiomas) + `tools/<lang>/<slug>.json` (editorial, específico del idioma). Ver `references/schema-contract.md` y `references/editorial-writing.md`.
6. **Validación** — chequeo de integridad de slugs/alternatives, `npm run build` (ojo: dispara el shortener de LinkZip si está habilitado — ver `references/validation.md`), y previsualización local.
7. **Cierre** — resumen al usuario: fichas creadas/actualizadas, aclaraciones de "sin instalador" si aplican, resultado del build, riesgos u omisiones (plataformas no confirmadas, enlaces externos que fallaron).

## Handoff

Al terminar un lote, resumí siempre:

- qué fichas se crearon o actualizaron, y en qué categoría quedaron;
- aclaraciones importantes de "no tiene instalador" o "no tiene app oficial en tal plataforma";
- resultado del build (`npm run build`) y de la previsualización local;
- cualquier dato que no pudiste verificar con confianza (y por eso lo omitiste, en vez de inventarlo).
