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
