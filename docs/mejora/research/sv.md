# F2-SV — Research nativo y matriz de oportunidades del producto sueco

**Issue:** [#34](https://github.com/Gunz-cop/DescargasIA/issues/34)
**Producto:** `sv`
**Estado:** investigación y priorización; no autoriza todavía cambios de contenido, rutas ni indexación.
**Fecha de investigación:** 2026-08-26
**Estado de integración (2026-08-27):** F0/#35 ya se fusionó en `main` mediante el
[PR #53](https://github.com/Gunz-cop/DescargasIA/pull/53). F2-SV sigue pendiente
en este [PR #49](https://github.com/Gunz-cop/DescargasIA/pull/49) y no se considera
integrada hasta que ese PR se fusione.

## Resumen ejecutivo

El producto sueco tiene señales cualitativas suficientes para preparar cuatro
especificaciones en F3, pero no para afirmar volúmenes de búsqueda ni para
ampliar el catálogo automáticamente. Las oportunidades seleccionadas son:

1. **Guía:** `AI-transkribering på svenska` / `ai transkribering svenska`, con
   una posible ficha o mejora de la ficha de Klang como caso principal.
2. **Guía:** `AI-skrivverktyg för svenska` / `ai skriva text svenska`, separando
   generación de texto, corrección gramatical y traducción.
3. **Guía:** `köra AI lokalt` / `AI utan internet`, comparando herramientas de
   escritorio y dejando claro que descargar el primer modelo sí requiere
   conexión.
4. **Guía:** `AI-presentationer på svenska` / `ai presentation svenska`, con
   comparación de creación, exportación, plataformas y calidad del sueco.

La primera oportunidad es la más diferenciada para el mercado local: aparecen
varias páginas suecas de proveedores de transcripción, preguntas de usuarios y
una empresa sueca con una página oficial específica para transcripción en
sueco. La segunda y la cuarta tienen demanda cualitativa, pero competencia
editorial alta. La tercera tiene una brecha práctica clara —hardware, primer
modelo descargado, funcionamiento offline y diferencia entre app, modelo y servicio—
con confianza media porque no se dispone de volumen de keywords.

No se ha seleccionado ninguna herramienta nueva para publicar. Klang, DeepL,
LanguageTool, LM Studio, Ollama, Gamma y Canva ya tienen datos base o ficha
sueca y se tratan como candidatos a validar en F3, no como backlog de
traducción.

## Market brief

| Campo | Decisión de esta investigación |
| --- | --- |
| Idioma | Sueco (`sv`) |
| País objetivo | Suecia |
| Variante | Sueco de Suecia (`sv-SE`) |
| Plataformas predominantes a investigar | Web, Windows, macOS, Linux, Android, iOS; además extensiones, tiendas, GitHub y documentación cuando sean la vía real |
| Registro editorial | Neutral, directo y práctico; términos habituales de producto en sueco, sin traducir literalmente keywords españolas |
| Fecha | 2026-08-26 |

La definición de Suecia proviene del propio issue #34 y del plan maestro. No se
han inferido prioridades desde las rutas o consultas españolas.

La dependencia de entrada fue F0, issue [#35](https://github.com/Gunz-cop/DescargasIA/issues/35),
que se fusionó después de realizar esta investigación. El baseline resumido
ahora está disponible en `docs/mejora/baseline.md`, pero no conserva consultas,
países, dispositivos ni filtros de Search Console por producto; por tanto no
permite confirmar volumen de keywords suecas. Esa limitación se mantiene y no
se sustituye con estimaciones.

## Alcance y disciplina de evidencia

### Qué se pudo medir

- **Volumen confirmado:** ninguno. El baseline de F0 no contiene volumen de
  keywords ni un desglose sueco reproducible, y esta sesión no tiene una
  herramienta de keywords con volumen específico para Suecia. No se publican
  cifras de búsquedas.
- **Sugerencias de búsqueda:** consultadas en Google Autocomplete con
  `hl=sv&gl=se` el 2026-08-26. Sirven para validar formulaciones y expansiones,
  no para demostrar volumen, intención transaccional ni tendencia.
- **Evidencia cualitativa:** auditoría de resultados visibles para consultas
  suecas mediante la herramienta de búsqueda disponible en esta sesión,
  complementada con páginas oficiales, una fuente estadística sueca y
  preguntas/comentarios públicos. El buscador no expone una posición Google-SE
  reproducible; por eso se registra presencia observable, no ranking exacto.
- **Fuentes oficiales:** se verificaron las rutas oficiales de los candidatos
  cuando la página fue accesible. Una página localizada en sueco no se toma por
  sí sola como prueba de que todas las funciones o el soporte lingüístico estén
  disponibles en Suecia.

La estadística de SCB aporta contexto de mercado, no demanda SEO: en empresas
suecas con al menos diez empleados, el uso de alguna tecnología de IA subió del
25,2 % en 2024 al 35,0 % en 2025. Entre las empresas que consideraban empezar,
la falta de experiencia relevante fue el obstáculo más común (74,7 %) y las
preocupaciones por protección de datos e integridad alcanzaron el 49,1 %.
Esto respalda que las guías de decisión deben explicar plataforma, datos y
límites, pero no permite convertir esas cifras en volumen de una keyword.

## Inventario del producto sueco

El inventario del checkout base contiene **86 herramientas técnicas** y
**37 fichas localizadas en `src/content/tools/sv/`** (además de un `.gitkeep`). Las fichas localizadas
existentes son evidencia de cobertura editorial, no evidencia de demanda.

Fichas suecas existentes:

`anythingllm`, `canva`, `character-ai`, `chatgpt`, `claude-code`, `claude`,
`cursor`, `deepl`, `deepseek`, `devin-desktop`, `elevenlabs`, `flux`,
`gamma-app`, `gemini`, `gemma`, `github-copilot`, `grammarly`, `grok`,
`hailuo-ai`, `jan`, `klang`, `kling-ai`, `languagetool`, `lm-studio`,
`luma-dream-machine`, `microsoft-copilot`, `midjourney`, `notebooklm`,
`notion`, `ollama`, `perplexity`, `phind`, `replit`, `runway`, `seedance`,
`stable-diffusion` y `suno`.

Herramientas base sin ficha sueca en este inventario (49):

`adobe-firefly`, `adobe-podcast`, `aiva`, `bolt-new`, `chatpdf`, `comet`,
`comfyui`, `consensus`, `descript`, `elevenmusic`, `fathom`, `fireflies`,
`genspark`, `google-antigravity`, `google-flow`, `gpt4all`, `heygen`,
`hugging-face`, `ideogram`, `invokeai`, `kimi`, `krea-ai`, `leonardo-ai`,
`lovable`, `ltx-studio`, `macwhisper`, `manus`, `meta-ai`, `mistral-vibe`,
`msty`, `n8n`, `napkin-ai`, `open-webui`, `opencode`, `otter-ai`, `pdfgear`,
`pika`, `quillbot`, `quizlet`, `qwen-chat`, `qwen-code`, `recraft`, `scispace`,
`sora`, `synthesia`, `udio`, `v0`, `wan` y `z-ai`.

La lista anterior se usa solo para localizar posibles huecos de investigación;
no convierte cada ausencia en una oportunidad. En particular, no se ha
creado una ficha de `Skrivar`, SpeechText, Foundry Local u otro producto que no
forme parte del catálogo base.

No se detectó una ruta de guías de intención independiente bajo
`src/pages/[lang]/` en el checkout remoto. Las cuatro recomendaciones de guía
son, por tanto, propuestas para F3; crear la ruta pública requiere una decisión
posterior y está fuera de este issue.

## Consultas nativas investigadas

Las formulaciones se escribieron directamente en sueco. Las variantes no son
traducciones de consultas españolas.

| Grupo de intención | Consultas nativas candidatas |
| --- | --- |
| Acceso y descarga | `ladda ner AI-verktyg`, `ladda ner AI app`, `officiell AI-app`, `AI verktyg gratis` |
| Instalación y plataforma | `AI verktyg för Windows`, `AI app för Android`, `AI app för iPhone`, `AI-program för Mac`, `AI verktyg webbläsare` |
| Uso y tarea | `AI skriva text svenska`, `AI skriva om text svenska`, `AI sammanfatta text svenska`, `AI göra presentation svenska`, `AI skapa bilder svenska` |
| Alternativas y comparación | `bästa AI verktyg svenska`, `bästa AI för svenska texter`, `alternativ till ChatGPT svenska`, `vilken AI är bäst på svenska` |
| Privacidad, cuenta y datos | `AI utan att spara data`, `AI GDPR Sverige`, `AI verktyg integritet`, `lokal AI privat`, `måste man skapa konto AI` |
| Uso local/offline | `köra AI lokalt`, `AI utan internet`, `lokal AI Windows`, `köra språkmodell på datorn`, `ladda ner AI modell lokalt` |
| Canal y ruta | `AI transkribering svenska`, `AI transkribering svenska gratis`, `AI transkribera svenska`, `rättstavning svenska online`, `AI presentation svenska gratis`, `ChatPDF svenska`, `ladda ner Ollama`, `LM Studio download` |

### Sugerencias observadas

Endpoint consultado: `https://suggestqueries.google.com/complete/search?client=firefox&hl=sv&gl=se&q=...` — 2026-08-26.

| Consulta inicial | Sugerencias observadas | Lectura permitida |
| --- | --- | --- |
| `ai transkribering svenska` | `ai transkribering svenska`, `ai transkribering svenska gratis`, `ai transkribera svenska` | Expansión explícita hacia gratis y verbo de tarea; señal de vocabulario e intención, no volumen. |
| `ai skriva svenska` | `ai skriva text svenska`, `ai skriva om text svenska` | Diferencia entre crear texto y reescribirlo; útil para separar páginas o secciones. |
| `köra ai lokalt` | `köra ai lokalt`, `kora ai local` | Confirma la formulación sueca y una variante sin diacríticos; no confirma tamaño del mercado. |
| `ai utan internet` | `ai without internet`, `ai without data`, `local ai without internet`, `use ai without internet`, `ai without internet app` | La intención existe, pero la respuesta mezcla inglés y sueco; requiere una guía que explique qué queda offline después de descargar modelos. |
| `ai presentationer svenska` | `ai presentation svenska gratis`, `ai presentation svenska` | Expansión hacia gratis y formato singular; buena semilla de comparación. |
| `chatpdf svenska` | `chatpdf svenska` | Señal de marca + idioma, insuficiente por sí sola para priorizar una ficha. |
| `klang ai svenska` | `klang ai svenska` | Señal de marca local; acompaña, pero no reemplaza evidencia de la consulta genérica de transcripción. |
| `whisper svenska transkribering` | `whisper transkribering svenska` | Interés por una tecnología/ruta local, no necesariamente por una ficha de producto consumidor. |
| `grammarly svenska` | `grammarly svenska`, `grammarly svenska online`, `rättstavning svenska`, `rättstavning svenska online`, `grammar svenska check` | La marca lleva a una necesidad más amplia de corrección en sueco; hay que distinguir demanda por marca de demanda por tarea. |
| `notebooklm svenska` | `notebooklm svenska`, `notebooklm podcast svenska` | Señal de marca y caso de uso, pero la ficha sueca ya existe y no se observó una brecha suficiente para una nueva página. |
| `copilot svenska` | `copilot svenska`, `copilot svenska översättning`, `copilot svenska gratis`, `copilot 365 svenska`, `copilot excel svenska` | Variantes de producto, precio y ecosistema; se mantiene como consulta secundaria porque el producto ya tiene ficha. |
| `ollama svenska` | `ollama svenska` | Señal de marca + idioma; sirve para una comparación local, no prueba que Ollama sea la prioridad sueca número uno. |

Las consultas `ladda ner ai verktyg` y `bästa ai verktyg svenska` no devolvieron
sugerencias útiles en esta consulta de Autocomplete. Se conservan por la
presencia de resultados editoriales suecos dedicados, no como volumen confirmado.

## Auditoría cualitativa de SERP

**Herramienta y ajustes:** búsqueda web disponible en la sesión, consultas en
sueco, observación realizada el 2026-08-26. La herramienta no permite fijar de
forma reproducible el país del buscador ni expone posiciones Google-SE; “alta”,
“media” y “baja” describen la competencia editorial visible, no una métrica de
dificultad de keywords.

| Consulta | Intención dominante y ajuste Suecia/sueco | Presencia oficial y canal | Debilidad o riesgo observable | Competencia | Decisión |
| --- | --- | --- | --- | --- | --- |
| `ai transkribering svenska` | Resolver una tarea concreta con audio sueco; también aparecen reuniones, entrevistas y subtítulos | Klang ofrece una página oficial específica de transcripción gratis en sueco; ElevenLabs tiene página oficial de speech-to-text para sueco | Los resultados se reparten entre páginas de proveedores; comparar idioma, grabación, identificación de hablantes, app/web/API, datos y uso offline exige trabajo editorial | Media-alta | **Seleccionar guía**; evaluar Klang como ficha/caso principal en F3 |
| `ai transkribering svenska gratis` | Acceso gratuito y prueba inmediata | Klang muestra plan gratuito sin tarjeta; otros proveedores ofrecen páginas de captación | “Gratis” no prueba límites, disponibilidad regional ni ausencia de cuenta; riesgo de páginas que prometen precisión sin explicar restricciones | Alta | **Seleccionar como variante de la guía**, no como página delgada aparte |
| `ai skriva text svenska` | Generar o mejorar texto en sueco | DeepL Write tiene página oficial localizada en sueco; Claude, LanguageTool y Grammarly ya tienen ficha/base | Los resultados mezclan escritura generativa, corrector, parafraseo y traducción; las afirmaciones de “bäst på svenska” son difíciles de comparar sin prueba documentada | Alta | **Seleccionar guía** con separación de tareas y fuentes oficiales |
| `rättstavning svenska online` | Corrección ortográfica/gramatical en navegador | LanguageTool tiene ruta oficial en su dominio; DeepL Write tiene ruta web oficial | La intención puede ser de corrector tradicional, no necesariamente IA; un listado de chatbots no satisface la consulta | Alta | **Seleccionar como sección/variante** de la guía de escritura, no como ficha nueva sin research adicional |
| `köra ai lokalt` | Instalar y ejecutar modelos en el equipo | Microsoft Learn documenta Foundry Local/Windows ML; LM Studio y Ollama publican descargas y documentación oficiales | Las páginas mezclan desarrollo, modelo, runtime y aplicación; el lector puede confundir “offline” con “sin internet desde el primer paso” | Media | **Seleccionar guía** de decisión local/offline |
| `ai utan internet` | Privacidad o trabajo sin conexión | La documentación oficial de LM Studio explica qué funciona offline después de obtener un modelo; Ollama documenta la app local | Sugerencias mezclan inglés; “privado” no debe presentarse como garantía general de todas las herramientas | Media | **Seleccionar como variante** de la guía local, con límites y advertencias |
| `ai presentation svenska` | Crear diapositivas en sueco, normalmente desde una idea o documento | Gamma tiene página oficial sueca, exporta a PPT/PDF/Google Slides y describe más de 60 idiomas; Canva tiene página oficial sueca de presentaciones con funciones AI | Gamma no enumera sueco explícitamente en la lista visible de idiomas; las pruebas de calidad sueca observadas son de terceros y no deben convertirse en hechos de producto | Media-alta | **Seleccionar guía** con verificación de idioma pendiente |
| `bästa ai verktyg svenska` | Comparación general por capacidad de sueco | Varias guías suecas comparan ChatGPT, Claude, Gemini, DeepL y otros; las fichas oficiales existen para varios | SERP ya está ocupada por guías extensas; mucha información es editorial o de pruebas no reproducibles; hay que diferenciarse por canales oficiales, plataformas y límites | Alta | **Mantener como guía paraguas de segunda prioridad**, no página de cada keyword |
| `chatpdf svenska` | Usar ChatPDF en sueco o descargarlo | ChatPDF tiene interfaz/ruta oficial localizada en sueco | Solo se observó la sugerencia de marca y una página oficial; no hay evidencia suficiente de brecha editorial o de volumen para crear ficha nueva | Baja-media | **Rechazar por ahora**: señal insuficiente y producto ya disponible para una futura revisión de inventario |
| `AI-bildgenerator svenska` / `ai skapa bilder svenska` | Generación de imágenes con prompt en sueco | Bing Image Creator, Canva y otras páginas oficiales aparecen en el ecosistema | El idioma del prompt es menos decisivo que en escritura/transcripción; resultados muy competitivos y abundancia de páginas genéricas; no hay hueco sueco claro que justifique una página nueva | Alta | **Rechazar por ahora** |
| `AI video svenska` | Generación, edición o subtitulado de vídeo | HeyGen y otras plataformas tienen páginas oficiales localizadas; Runway ya tiene ficha sueca | Intención demasiado amplia y herramientas con capacidades/regiones/precios cambiantes; faltaría separar generación, avatar, subtitulado y edición | Alta | **Rechazar por ahora**; ampliar solo con brief específico |
| `grammarly svenska` | Ver si Grammarly corrige sueco o encontrar corrector | Grammarly tiene ruta oficial y ficha sueca | La búsqueda deriva a “rättstavning svenska”; el soporte oficial de Grammarly para sueco debe comprobarse antes de recomendarlo y no hay base para presentarlo como solución principal | Media-alta | **Rechazar como ficha prioritaria**; conservar como competidor en guía de escritura |
| `ladda ner ai verktyg` | Descarga genérica | No hay un canal oficial único; la consulta puede referirse a cualquier producto | Intención ambigua, sin producto identificable y sin sugerencias; una página sería un catálogo delgado o una puerta a destinos no verificables | Baja | **Rechazar** |

## Matriz de oportunidades

La columna “volumen o evidencia” conserva el tipo real de señal. Ninguna fila
usa volumen confirmado.

| Primary query | Native variants | Language/country | Volume or evidence | Trend | Observable difficulty/competition | Result weakness | Intent | Recommended page | Confidence | Sources |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `ai transkribering svenska` | `ai transkribering svenska gratis`; `ai transkribera svenska`; `whisper transkribering svenska` | Sueco / Suecia | Search suggestion + qualitative SERP: varias páginas de proveedores suecos y preguntas de usuarios sobre transcribir audio/video en sueco | No confirmado; no hay serie temporal disponible | Media-alta; varios proveedores y artículos suecos | Falta una comparación centrada en canal real, plataforma, identificación de hablantes, límites de gratis, datos y offline; las páginas de proveedor no resuelven bien la decisión entre web/app/API/local | Acceso, tarea, plataforma, privacidad y canal | **Guide:** guía de transcripción sueca; incluir ficha/caso Klang si F3 confirma el alcance | Media-alta | [Klang](https://klang.ai/sv/transkribera/); [ElevenLabs Swedish speech-to-text](https://elevenlabs.io/sv/speech-to-text/swedish); [AIkompassen, transcripción](https://aikompassen.com/artiklar/ai-transkribering-basta-verktygen/); [sugerencias Google](https://suggestqueries.google.com/complete/search?client=firefox&hl=sv&gl=se&q=ai%20transkribering%20svenska) — consultados 2026-08-26 |
| `klang ai svenska` | `klang transkribering`; `klang ai transkribering` | Sueco / Suecia | Search suggestion de marca + página oficial sueca con CTA y caso de uso específico | No confirmado | Media; la marca tiene resultados propios, pero la consulta genérica es más amplia | La ficha puede explicar web/app/canales y diferenciar `klang.ai` de nombres parecidos; la evidencia de demanda es de marca, no de volumen | Acceso y ficha de herramienta | **Tool ficha:** validar/mejorar la ficha existente de Klang, sin crear una traducción nueva | Media | [Klang, transcripción](https://klang.ai/sv/transkribera/); [sugerencias Google](https://suggestqueries.google.com/complete/search?client=firefox&hl=sv&gl=se&q=klang%20ai%20svenska) — consultados 2026-08-26 |
| `ai skriva text svenska` | `ai skriva svenska`; `ai skriva om text svenska`; `rättstavning svenska online`; `bästa ai för svenska texter` | Sueco / Suecia | Search suggestion + SERP con guías suecas de escritura y correctores; el informe de SCB confirma adopción empresarial creciente, no keyword volume | No confirmado; la fuente estadística muestra crecimiento de uso empresarial, no tendencia de búsqueda | Alta; varias guías y herramientas compiten | Los resultados mezclan chatbot, corrector pasivo, parafraseo, traducción y extensión; faltan criterios comparables y advertencias sobre datos | Tarea, comparación, privacidad, web/extensión | **Guide:** guía de escritura y corrección en sueco; usar DeepL, LanguageTool y Claude como ejemplos ya inventariados | Media | [DeepL Write en sueco](https://www.deepl.com/sv/write); [LanguageTool](https://languagetool.org/sv/); [AIkompassen, escritura sueca](https://aikompassen.com/artiklar/basta-ai-skrivverktyg-svenska-2026/); [SCB, uso de IA en empresas](https://www.scb.se/hitta-statistik/statistik-efter-amne/forskning-och-det-digitala-samhallet/det-digitala-samhallet/it-anvandning-i-foretag/pong/statistiknyhet/it-anvandning-i-foretag-2025/); [sugerencias Google](https://suggestqueries.google.com/complete/search?client=firefox&hl=sv&gl=se&q=ai%20skriva%20svenska) — consultados 2026-08-26 |
| `köra ai lokalt` | `AI utan internet`; `lokal AI Windows`; `köra språkmodell på datorn`; `ladda ner AI modell lokalt` | Sueco / Suecia | Search suggestion + SERP con documentación oficial y una guía sueca sobre LM Studio/Ollama offline | No confirmado; `ai utan internet` devuelve también variantes inglesas, por lo que la tendencia regional es incierta | Media; competencia técnica distribuida entre documentación y artículos | Se explica poco la diferencia entre programa, modelo, runtime y servidor; se omite a menudo que descargar modelos/runtimes requiere internet y que el hardware condiciona el resultado | Instalación, plataforma, offline, privacidad, canal | **Guide:** decisión local/offline; comparar LM Studio, Ollama, Jan y Open WebUI sin inventar garantías de privacidad | Media | [LM Studio download](https://lmstudio.ai/download); [LM Studio offline](https://lmstudio.ai/docs/app/offline); [Ollama Windows](https://docs.ollama.com/windows); [Microsoft Learn, local AI en Windows](https://learn.microsoft.com/sv-se/windows/ai/overview); [Notebookcheck, AI offline](https://www.notebookcheck.se/Din-egen-ChatGPT-offline-AI-utan-molnet-paa-din-baerbara-dator.1342283.0.html); [sugerencias Google](https://suggestqueries.google.com/complete/search?client=firefox&hl=sv&gl=se&q=k%C3%B6ra%20ai%20lokalt) — consultados 2026-08-26 |
| `ai presentation svenska` | `ai presentation svenska gratis`; `ai presentationer svenska`; `bästa ai för presentationer` | Sueco / Suecia | Search suggestion + varias guías suecas específicas y páginas oficiales localizadas de Gamma y Canva | No confirmado | Media-alta; varias comparativas visibles y páginas comerciales fuertes | La información disponible no separa siempre generación, edición, exportación y calidad lingüística; Gamma muestra página sueca pero su FAQ visible no enumera sueco de forma explícita | Tarea, comparación, plataformas y precio | **Guide:** comparación de presentación AI con una matriz de prompt, salida, exportación y límites; no afirmar pruebas no realizadas | Media | [Gamma sueco](https://gamma.app/sv); [Gamma pricing](https://gamma.app/sv/pricing); [Canva presentations sueco](https://www.canva.com/sv_se/skapa/presentation/); [AIkompassen, presentaciones](https://aikompassen.com/artiklar/ai-presentationer-slides/); [sugerencias Google](https://suggestqueries.google.com/complete/search?client=firefox&hl=sv&gl=se&q=ai%20presentationer%20svenska) — consultados 2026-08-26 |
| `bästa ai verktyg svenska` | `vilken AI är bäst på svenska`; `gratis AI verktyg svenska`; `AI verktyg för svenska användare` | Sueco / Suecia | Qualitative SERP: varias guías y catálogos suecos; `bästa...` no produjo sugerencias útiles en la consulta de Autocomplete | No confirmado | Alta; resultados editoriales ya extensos | Existe saturación de rankings y afirmaciones de calidad difíciles de reproducir; la oportunidad solo tiene sentido como guía de decisión basada en canales oficiales y criterios verificables | Comparación amplia y descubrimiento | **Guide:** paraguas de baja prioridad, después de las cuatro oportunidades anteriores | Media-baja | [AIkompassen, herramientas en sueco](https://aikompassen.com/artiklar/ai-verktyg-som-fungerar-pa-svenska/); [Teknikministeriet, empresas suecas](https://www.teknikministeriet.se/basta-ai-verktyg-foretag/); [AIVerktyg](https://aiverktyg.com/) — consultados 2026-08-26 |

### Candidatos importantes rechazados

| Candidato | Motivo de rechazo en esta fase |
| --- | --- |
| `ChatPDF svenska` | Solo se observó una sugerencia de marca y una interfaz oficial localizada. No hay evidencia suficiente de demanda no satisfecha ni de un hueco editorial que justifique una ficha nueva frente al catálogo base. |
| `AI-bildgenerator svenska` | Hay intención de tarea, pero el idioma pesa menos que en escritura o transcripción; la competencia es alta, las páginas oficiales ya son visibles y no apareció una brecha sueca verificable. |
| `AI video svenska` | Consulta demasiado amplia: mezcla generación, avatares, subtítulos y edición. Requiere un brief de intención propio; crear una página ahora sería ampliar alcance. |
| `grammarly svenska` como ficha principal | La sugerencia existe, pero la intención parece derivar hacia corrección sueca general y el soporte exacto de Grammarly para sueco necesita comprobación primaria. Se conserva como competidor en la guía de escritura. |
| `ladda ner ai verktyg` | No identifica una herramienta ni un canal. Sin producto concreto, una ficha no podría tener un destino oficial único y aumentaría el riesgo de página delgada o enlaces ambiguos. |
| `Foundry Local` como ficha de consumo | La documentación oficial sueca está dirigida principalmente a desarrolladores y Windows; es una ruta técnica, no una ficha de descarga general validada para el catálogo actual. Se menciona como contexto en la guía local, no como selección editorial. |
| `Skrivar` o SpeechText como fichas nuevas | Aparecen en la SERP de transcripción, pero no forman parte del catálogo base y esta fase no autoriza crear fichas ni añadir datos técnicos compartidos. Requieren verificación independiente de producto, canal, disponibilidad regional y contrato antes de F3/F4. |

## Selección y criterios para F3

Las cuatro oportunidades principales pasan el test de selección con distinta
confianza:

1. **Demanda de mercado creíble:** consultas suecas exactas o expansiones de
   Autocomplete, resultados dedicados en sueco y/o preguntas de usuarios. No se
   etiqueta ninguna como volumen.
2. **Brecha editorial verificable:** la SERP contiene proveedores o listados,
   pero no resuelve de forma consistente qué se instala, qué funciona en
   Suecia, qué canal es oficial, qué ocurre con la cuenta/datos o qué queda
   realmente offline.
3. **Tipo correcto de página:** transcripción, escritura, uso local y
   presentaciones abarcan varios productos y criterios; por eso se recomiendan
   guías. Klang se puede tratar además como ficha porque es una herramienta
   identificable con un canal oficial sueco.
4. **Hechos y destinos comprobables:** los candidatos principales tienen
   dominios oficiales verificables. Las afirmaciones de soporte lingüístico,
   precio, disponibilidad regional, privacidad y “gratis” deben volver a
   comprobarse en la spec de F3 y cerca de publicación.
5. **Valor nativo posible:** el enfoque debe escribirse directamente en sueco y
   responder al recorrido real del lector; no traducir una ficha o matriz
   española.

## Handoff propuesto a F3

Para convertir estas oportunidades en specs, cada una debe fijar:

- intención primaria y variantes, sin crear una URL por variante;
- si la salida será guía, ficha existente optimizada o descarte;
- above the fold: qué canal oficial y qué decisión debe entenderse primero;
- plataformas y tipo de canal por herramienta;
- qué significa “svenska” en cada caso: interfaz, entrada, salida, precisión o
  solo disponibilidad de una página localizada;
- límites de cuenta, gratis, exportación, modelos y conexión;
- tratamiento de datos basado en políticas o documentación primaria, sin
  convertir “local” o “GDPR” en una garantía genérica;
- enlaces internos mediante los helpers de `src/utils/links.ts` cuando exista
  una ruta pública autorizada;
- eventos de funnel definidos en F1 solo si la ruta se aprueba;
- ventana de medición y criterio de éxito para F7.

Riesgos abiertos que deben resolver F3/F4:

- el baseline de F0 no conserva un desglose sueco de Search Console por consulta,
  país, dispositivo o filtro;
- no se dispone de volumen confirmado, posición ni CTR por consulta;
- la disponibilidad y los planes de productos web cambian con frecuencia;
- las páginas localizadas de Gamma, DeepL y otras no garantizan por sí solas
  que toda la funcionalidad o el soporte lingüístico sea sueco;
- una guía local/offline debe distinguir procesamiento local de descarga,
  actualizaciones, búsqueda de modelos y funciones cloud;
- las afirmaciones de privacidad o cumplimiento requieren fuente primaria y no
  deben derivarse de la sede de una empresa o de una página comercial.

## Fuentes

### Primarias y oficiales

- [SCB — Stor ökning av AI-användningen bland företag 2025](https://www.scb.se/hitta-statistik/statistik-efter-amne/forskning-och-det-digitala-samhallet/det-digitala-samhallet/it-anvandning-i-foretag/pong/statistiknyhet/it-anvandning-i-foretag-2025/) — estadística sueca, publicada 2025-11-06; consultada 2026-08-26.
- [Klang — Transkribera ljudfiler till text](https://klang.ai/sv/transkribera/) — ruta oficial sueca de transcripción; consultada 2026-08-26.
- [ElevenLabs — Swedish speech to text](https://elevenlabs.io/sv/speech-to-text/swedish) — ruta oficial de transcripción; consultada 2026-08-26.
- [DeepL Write — sueco](https://www.deepl.com/sv/write) — página oficial localizada; consultada 2026-08-26.
- [LanguageTool](https://languagetool.org/sv/) — dominio oficial del producto, usado en el inventario; la página no pudo abrirse de forma reproducible desde el buscador de esta sesión y debe revalidarse antes de F3.
- [LM Studio — descarga](https://lmstudio.ai/download) — plataformas y descarga oficial; consultada 2026-08-26.
- [LM Studio — operación offline](https://lmstudio.ai/docs/app/offline) — separación entre funciones offline y operaciones que requieren conexión; consultada 2026-08-26.
- [Ollama — Windows](https://docs.ollama.com/windows) — instalador y requisitos oficiales de Windows; consultada 2026-08-26.
- [Microsoft Learn — local AI en Windows](https://learn.microsoft.com/sv-se/windows/ai/overview) — Foundry Local, Windows ML y distinción de escenarios; consultada 2026-08-26.
- [Gamma — sueco](https://gamma.app/sv) y [precios Gamma](https://gamma.app/sv/pricing) — presentación, exportaciones, idiomas declarados y planes; consultadas 2026-08-26.
- [Canva — presentaciones en sueco](https://www.canva.com/sv_se/skapa/presentation/) — página oficial localizada y funciones AI; consultada 2026-08-26.
- [ChatPDF — interfaz sueca](https://www.chatpdf.com/sv/application/desktop) — presencia oficial localizada observada en SERP; consultada 2026-08-26.
- [Google Autocomplete](https://suggestqueries.google.com/complete/search?client=firefox&hl=sv&gl=se&q=ai%20transkribering%20svenska) — sugerencias para el mercado/idioma, no volumen; consultada 2026-08-26. El mismo endpoint se usó con las consultas documentadas arriba.

### Secundarias y cualitativas

- [AIkompassen — AI-verktyg som fungerar på svenska](https://aikompassen.com/artiklar/ai-verktyg-som-fungerar-pa-svenska/) — comparación editorial sueca; consultada 2026-08-26.
- [AIkompassen — AI-skrivverktyg för svenska](https://aikompassen.com/artiklar/basta-ai-skrivverktyg-svenska-2026/) — SERP y distinción entre escritura y gramática; consultada 2026-08-26.
- [AIkompassen — AI-transkribering](https://aikompassen.com/artiklar/ai-transkribering-basta-verktygen/) — panorama de proveedores y terminología; consultada 2026-08-26.
- [AIkompassen — AI-presentationer](https://aikompassen.com/artiklar/ai-presentationer-slides/) — comparación sueca visible en SERP; consultada 2026-08-26.
- [Teknikministeriet — AI-verktyg för svenska företag](https://www.teknikministeriet.se/basta-ai-verktyg-foretag/) — comparación editorial y contexto de elección empresarial; consultada 2026-08-26.
- [AIVerktyg.com](https://aiverktyg.com/) — catálogo editorial sueco visible en SERP; consultado 2026-08-26.
- [Notebookcheck — AI offline en portátil](https://www.notebookcheck.se/Din-egen-ChatGPT-offline-AI-utan-molnet-paa-din-baerbara-dator.1342283.0.html) — evidencia cualitativa sobre la confusión entre local, offline y hardware; consultado 2026-08-26.
- [AIkompassen — informe AI i Sverige 2026](https://aikompassen.com/static/rapport/ai-i-sverige-2026.pdf) — fuente secundaria de contexto y comportamiento de usuarios; no se usa como volumen de búsqueda; consultado 2026-08-26.
- [Reddit /r/sweden — möten på svenska](https://www.reddit.com/r/sweden/comments/1poqgec/moten_pa_svenska/) — evidencia cualitativa de una pregunta pública sobre transcripción de reuniones; no se usa como encuesta ni métrica; consultado 2026-08-26.
