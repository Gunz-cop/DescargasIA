# Workflow

## 1. Inventario

- Listá `src/content/tools-base/*.json` para saber qué existe.
- Detectá duplicados por nombre normalizado o dominio oficial (ej. no crear "mistral-vibe" si ya existe algo apuntando a `mistral.ai`).
- Confirmá que las `alternatives` que vayas a usar apunten a slugs existentes.
- Preferí actualizar una ficha existente antes que crear un slug duplicado.

## 2. Descubrimiento

Hay dos modos, según lo que pida el usuario:

**Modo tendencias generales**: `WebSearch` con términos como "mejores herramientas de IA <año actual> trending", desglosado por categoría si hace falta (asistentes, programación, video, imagen, música, traducción, productividad) para no sesgar todo hacia un solo tipo de herramienta.

**Modo Hugging Face** (cuando el usuario lo pide explícitamente, o cuando ya agotaste la señal de búsqueda general): andá a `huggingface.co/models?sort=trending` y `huggingface.co/spaces?sort=trending` con el Browser tool o `WebFetch`. Esto te va a mostrar sobre todo checkpoints de modelos crudos y demos técnicas — la mayoría no son "herramientas" fichables directamente (son pesos de modelo para desarrolladores, no productos de consumo). Usalo así:

- Identificá qué **laboratorios/compañías** aparecen repetido en la lista de tendencias (ej. en agosto 2026 esto mostró fuerte actividad de Alibaba/Qwen, Moonshot/Kimi, MiniMax, Zhipu/Z.ai — la señal cambia con el tiempo, no asumas que sigue siendo así).
- Para cada laboratorio que te llame la atención, buscá si tiene un **producto de consumo real** con canal oficial propio (una app de chat, una web de generación de video, un CLI de código instalable) — eso es lo fichable, no el checkpoint crudo.
- Evitá fichar finetunes comunitarios raros, modelos marcados "uncensored"/NSFW-adjacent, o cualquier cosa sin una compañía/organización clara detrás. Esta skill es para un catálogo público de descargas oficiales, no para catalogar cada checkpoint de Hugging Face.
- **Nunca copies texto de una model card o un README de Hugging Face al contenido editorial.** Es señal de descubrimiento, no fuente de redacción.

En cualquiera de los dos modos, cruzá cada candidato contra el inventario del paso 1 antes de seguir.

## 3. Verificación por herramienta

Para cada herramienta candidata:

- Encontrá el sitio web oficial (el dominio de la marca, no un agregador).
- Para cada plataforma relevante (web, Windows, Mac, Linux, Android, iOS), verificá si existe de verdad un canal oficial y de qué tipo es: instalador de escritorio, tienda oficial, app web, solo extensión, solo GitHub, solo documentación, o no existe.
- Usá `WebSearch` para encontrar el candidato y `WebFetch` sobre la página oficial de la marca cuando necesites confirmar un dato puntual (ej. "¿tiene app de escritorio o solo web?").
- **Cuando no puedas confirmar un ID exacto de app** (número de App Store, nombre de paquete de Google Play) con una fuente que lo mencione explícitamente y de forma consistente entre varias búsquedas, no lo inventes. Dos salidas seguras:
  1. Usá como URL la página oficial de descargas de la marca (tipo `official-site`), que internamente ya enlaza a la tienda correcta.
  2. Omití esa plataforma directamente si no hay ninguna evidencia de que exista.
- Prestá atención a **rebrandings recientes** — pasó dos veces en la tanda original (Windsurf → Devin Desktop, Le Chat → Vibe by Mistral). Si ves señales de que una marca cambió de nombre, verificá cuál es el nombre y dominio vigente, y usá ese para `officialWebsite`, pero mencioná el nombre anterior en `longDescription` o en una sección editorial porque la gente todavía busca así.
- Registrá `officialSources`: el sitio oficial y cualquier página que usaste para decidir la disponibilidad por plataforma.

## 4. Clasificación

- Usá las categorías que ya existen en `src/content/categories/*.json`. No inventes una categoría angosta para una sola herramienta salvo pedido explícito del usuario.
- Si una herramienta cruza dos categorías de forma genuina (ej. una app de generación de imágenes que también es "modelo local" por correr en tu propia máquina), es válido asignarle dos — hay precedente (`stable-diffusion.json`).

## 5. Redacción

Para cada herramienta, creá:

- `src/content/tools-base/<slug>.json` — ver `references/schema-contract.md`.
- `src/content/tools/<lang>/<slug>.json` — ver `references/schema-contract.md` y `references/editorial-writing.md` para el tono y la estructura.

Contenido mínimo por ficha editorial:

- `bestFor`: 4 casos de uso concretos.
- `limitations`: 3 límites o advertencias prácticas.
- `editorialSummary`: 1 párrafo único.
- `editorialSections`: 3-5 secciones, cada una con encabezado específico y dos párrafos.
- `faq`: 4 preguntas apuntando a intención de búsqueda real.
- `safetyNotes`: advertencias concretas, no genéricas.

Si la herramienta no tiene instalador de escritorio o app móvil real para alguna plataforma que la gente suele buscar, aclarálo explícitamente (ver `references/source-policy.md`, sección "No-Installer Clarifications").

## 5.5. Investigación de comunidad (opcional, solo si hay fuente real)

Buscá con `WebSearch` algo concreto y verificable reportado por usuarios reales (Reddit, Discord público, issues de GitHub, foros oficiales): un límite, un bug, un truco de uso. Ver `references/editorial-writing.md` para cómo buscarlo y qué cuenta como fuente válida.

Si encontrás algo con fuente real, agregalo a `communityInsights` con el link. **Si no encontrás nada verificable, dejá `communityInsights` como `[]` y seguí** — nunca completes este campo con una generalización sin fuente citable.

Antes de escribir el `text` final, hacé `WebFetch` sobre la URL exacta que vas a citar y confirmá con una cita textual que el dato específico (cifra, nombre, cita) está realmente ahí — no te quedes con el resumen que dio `WebSearch`. Ver `references/editorial-writing.md` para el caso real donde esto falló.

## 6. Validación

Ver `references/validation.md` para el detalle completo. En resumen:

1. Chequeo de integridad de slugs/alternatives (script de Node incluido en `validation.md`).
2. `npm run build` — atención, esto también corre `npm run shorten` (LinkZip) antes del build de Astro; ver el aviso en `validation.md` antes de correrlo si no querés generar enlaces cortos reales.
3. Levantar el servidor local y navegar a 1-2 fichas nuevas para confirmar que renderizan bien, sin errores de consola.

## 7. Integración visual (rara vez necesario)

- `src/components/ToolCard.astro` usa un sistema de dos estados de color (no hay color por marca) — no hace falta tocarlo para una ficha nueva.
- No agregues logos oficiales sin política de uso de marca documentada; usá monogramas/iniciales.
- No cambies la arquitectura de páginas (`src/pages/[lang]/[slug].astro`, `[lang]/categoria/[slug].astro`) a menos que el schema lo requiera.
