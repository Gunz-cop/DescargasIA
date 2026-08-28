# Research nativo del producto español (F2-ES)

> Issue #38 · fase F2-ES · fecha de investigación: **2026-08-27**.
> **Actualizado el 2026-08-28** con la ingesta del export de Search Console del
> issue #50 (§1.2, §4.2 y §7). La investigación de SERP de la §3 no se ha
> repetido: conserva su fecha y su etiqueta original.
> Documento de investigación. **No modifica ningún JSON de contenido ni activa
> ninguna ruta.** Las selecciones que contiene son candidatas para F3-ES; no son
> decisiones de publicación.

---

## 1. Market brief

| Campo | Valor declarado |
|---|---|
| Producto lingüístico | `es` |
| Alcance geográfico **declarado** | Hispanohablante multi-país, con **España como mercado de referencia** para el registro editorial y **México / Cono Sur como mercados secundarios observados** |
| Variante del español | Español neutro con léxico peninsular donde hay divergencia (`descargar` y `ordenador/PC` como forma principal; se admite `computadora` en sinónimos, nunca `bajar` como término principal) |
| Plataformas predominantes que asume el producto | Windows, Android, iOS, macOS y Linux (Linux solo en el clúster de modelos locales) |
| Registro editorial | Tuteo, tono informativo y verificador, sin marketing ni promesas de seguridad |
| Fecha de investigación | 2026-08-27 |
| Investigador | Sesión de ejecución del issue #38 |

### 1.1 Por qué se declara alcance multi-país y qué limita

El alcance multi-país **no** se elige por conveniencia: se declara porque la
evidencia disponible en esta sesión **no está segmentada por país**, y fingir un
recorte nacional sería inventar un filtro que no se aplicó.

Consecuencias, que F3-ES debe respetar:

- ninguna fila de la matriz de la sección 4 puede presentarse como demanda de
  España, de México o de ningún país concreto;
- cualquier afirmación posterior que necesite un país (precios locales,
  disponibilidad regional de una app, referencias legales) exige una consulta
  nueva y segmentada, no una lectura de este documento;
- el léxico se resuelve por variante declarada arriba, no por país observado.

Esta declaración **cierra parcialmente** la decisión abierta «Alcance geográfico
inicial de `es`» de `docs/mejora/decisiones.md`: fija la variante y el registro,
y deja pendiente de Codex la ratificación del alcance multi-país frente a un
recorte por país, que solo puede decidirse con una fuente segmentada.

### 1.2 Límites de evidencia de esta sesión

| Fuente prevista por el issue | Estado real en esta sesión | Efecto |
|---|---|---|
| Google Search Console (consultas y tendencia del producto `es`) | **Disponible desde el 2026-08-28** (#50): export de propiedad `fuenteai.com`, tipo de búsqueda `Web`, 2026-06-19 a 2026-08-26, **sin ningún filtro de página, consulta, país o dispositivo**. Evidencia derivada en `docs/mejora/evidencia/gsc-2026-08-28/` | Aporta **volumen confirmado por página**, incluidas 86 URLs `/es/*` (§4.2). **No** aporta consultas atribuibles a `/es/*`, ni tendencia por página, ni país por producto lingüístico: el export es agregado por dimensión, sin cruces |
| Cloudflare Web Analytics | No accesible; F0 conserva agregados de comportamiento | No se usa para seleccionar oportunidades: F0 ya decidió que Cloudflare aporta comportamiento, no selección |
| Herramienta de keywords con volumen por mercado | No disponible | Sin volumen confirmado en todo el documento |
| Auditoría observable de SERP en español | **Disponible y ejecutada** (sección 3) | Es la base de evidencia real de este documento |

La auditoría de SERP se ejecutó con un buscador cuya geolocalización **no es
española ni latinoamericana**, con consultas redactadas en español nativo. Eso
la hace válida como **evidencia cualitativa de la calidad y del tipo de
resultado que compite en español**, y **no** válida como muestra del
posicionamiento exacto que ve un usuario en Madrid o en Monterrey. Cada
observación de la sección 3 se etiqueta en consecuencia.

El blocker de la sección 7 (issue #50) está **parcialmente resuelto**: el
export entregado el 2026-08-28 aporta volumen por página, pero no el desglose
por consulta y ruta que pedía la pregunta original. Lo que sigue faltando está
acotado en la §7.

---

## 2. Inventario del producto español existente

Medido sobre el árbol del repositorio en la fecha de investigación.

| Medida | Valor |
|---|---|
| Fichas en `src/content/tools-base/` | 86 |
| Fichas editoriales en `src/content/tools/es/` | 86 |
| Slugs de `tools-base` **sin** contraparte en `es/` | **0** |
| Slugs en `es/` sin base | 0 |
| Guías en `src/content/guides/` | 1 (`descargar-chatgpt-para-windows.md`) |
| Fichas en `sv/` · `it/` (solo como referencia de tamaño, no de contenido) | 37 · 24 |

Reparto por categoría de `tools-base`: `asistentes-ia` 17,
`productividad-presentaciones-ia` 16, `video-ia` 15, `generacion-imagenes` 14,
`modelos-locales` 13, `programacion` 12, `musica-ia` 6,
`traduccion-redaccion-ia` 5.

### 2.1 El hallazgo estructural que cambia la fase

**El producto español no tiene un problema de cobertura, tiene un problema de
profundidad.** Las diez hipótesis del issue —Character AI, Mistral Vibe, Stable
Diffusion, Open WebUI, Hugging Face, Cursor, Gamma, Ollama, LM Studio y
Perplexity— **ya tienen ficha en `es/` y ficha base**. Ninguna es una ficha
nueva que crear.

Esto invalida, para `es`, el patrón de F2-SV y F2-IT (donde la matriz es
principalmente una lista de fichas ausentes) y obliga a que la matriz de la
sección 4 mida otra cosa: **dónde la SERP española deja un hueco que la ficha
existente no está cubriendo**.

### 2.2 Profundidad editorial observable

Medida sobre los campos de `src/content/tools/es/*.json`:

| Señal | Fichas afectadas |
|---|---|
| `longDescription` de menos de 400 caracteres | **45 de 86** |
| Menos de 4 entradas de `faq` | 6 de 86 |
| Menos de 3 `editorialSections` | 1 de 86 |
| `communityInsights` con una sola entrada | mayoría del catálogo |

Es una medida de extensión, **no de calidad**: una ficha corta puede ser
correcta. Sirve para priorizar dónde mirar, no para concluir que 45 fichas son
deficientes. La evaluación de calidad corresponde a la skill
`descargasia-ficha-auditoria`, no a esta fase.

### 2.3 Datos de canal oficial

Revisados los `platforms[].lastChecked` de las fichas base de las diez
hipótesis: todas marcan `2026-08-12` (Cursor, además, `2026-08-15`). El
renombrado de Mistral (`Le Chat` → `Vibe by Mistral`) **ya está recogido** en
`tools-base/mistral-vibe.json`. No se detectó dato de canal obsoleto en las
hipótesis. No se revisaron los 76 slugs restantes en esta fase.

---

## 3. Auditoría observable de SERP

Método: consultas en español nativo, agrupadas por clúster de intención,
ejecutadas el 2026-08-27. Se registra lo observado en la primera página.
**Etiqueta de evidencia de toda esta sección: evidencia cualitativa.**
Limitación de geolocalización: sección 1.2.

### 3.1 Acceso / descarga — `descargar Ollama para Windows`

Resultados observados en primera página: portales de descarga de terceros
([OnWorks](https://www.onworks.net/software/windows/app-ollama),
[Uptodown](https://ollama.en.uptodown.com/windows),
[Malavida](https://www.malavida.com/en/soft/ollama/)) conviviendo con blogs
españoles de tecnología
([SoftZone](https://www.softzone.es/programas/lenguajes/ollama/)) y tutoriales.

- **Intención dominante:** descargar un instalador.
- **Presencia del canal oficial:** `ollama.com` no aparece como resultado
  destacado propio en la primera página observada; los blogs lo citan dentro
  del texto.
- **Riesgo de clon / mirror: alto.** Tres de los siete resultados son portales
  que redistribuyen el binario fuera del canal oficial. Es exactamente el
  patrón que el proyecto existe para corregir.
- **Frescura:** Malavida ofrece «Ollama 0.5», versión antigua respecto a la
  distribución oficial actual.
- **Hueco editorial verificado:** ninguno de los resultados observados separa
  con claridad *instalador oficial* de *redistribución*.

### 3.2 Acceso / descarga — `Character AI descargar app oficial gratis`

Resultados observados: **siete de siete son portales de APK o de descarga de
terceros** (APKCombo, Popsilla, Malavida, Softonic, Aptoide, DivxLand) más una
ficha de App Store de **una aplicación distinta** (`Janitor AI`).

- **Riesgo de clon / APK: máximo del conjunto auditado.** La consulta incluye
  literalmente la palabra «oficial» y aun así la primera página no devuelve el
  canal oficial.
- **Confusión de destino:** el resultado de tienda oficial que aparece es de
  otro producto.
- **Hueco editorial verificado:** alto y directamente alineado con la propuesta
  de valor de DescargasIA.

### 3.3 Acceso / descarga — `descargar Cursor editor IA español instalar Windows`

Resultados observados: guías españolas legítimas
([AINow](https://ainow.es/how-to/instalar-cursor-ide)), agregadores, y **dos
resultados de software pirateado** («Cursor AI Full + Portable Español Mega»,
`artistapirata.tienda` y `artistapirata.app`).

- **Riesgo de instalador modificado: alto.** No son mirrors: son builds
  alteradas distribuidas como «Full/Portable».
- **Dato desactualizado observado:** varios resultados siguen dirigiendo a
  `cursor.sh` junto a `cursor.com`.
- **Hueco editorial verificado:** medio-alto; hay competencia editorial
  española real y correcta, pero convive con distribución alterada.

### 3.4 Plataforma / canal — `descargar Perplexity app oficial para Windows y Android`

Resultados observados: agregadores de descarga (Gizmodo, Softonic, Uptodown),
un **portal de APK «Premium»** (`perplexity-apk.systemtutos.com`) y una ficha
de App Store de un producto no oficial («Perplexity AI: Ask Guide Pro»).

- **Confusión de canal:** la consulta presupone un `.exe` de Windows. El
  contenido en español no aclara de forma consistente cuál es el canal real de
  escritorio.
- **Riesgo de clon: alto**, tanto por APK «Premium» como por app de tienda de
  tercero que usa la marca.
- **Hueco editorial verificado:** alto. Es el caso canónico de «la respuesta
  correcta es explicar el canal, no ofrecer una descarga».
- **Nota de verificación pendiente:** el estado exacto de la aplicación de
  escritorio de Perplexity **no se verificó contra el canal oficial en esta
  sesión** y no se afirma aquí. La ficha base declara `windows` de tipo
  `app-store`. F3-ES debe verificarlo en `perplexity.ai` antes de escribir una
  sola frase sobre escritorio.

### 3.5 Uso local / offline — `cómo usar IA sin conexión a internet en mi PC`

Resultados observados: blogs españoles de calidad razonable
([Geeknetic](https://www.geeknetic.es/Guia/2809/Chatbots-IA-Sin-Conexion-Como-instalar-GPT4ALL-y-Jan-en-Tu-PC.html),
[Blogthinkbig](https://blogthinkbig.com/instalar-inteligencia-artificial-en-tu-pc)),
un producto comercial que se posiciona en la consulta
([OfflinAI](https://offlinai.com/es/)) y contenido genérico.

- **Intención dominante:** informativa, no transaccional. **No es una consulta
  de ficha.**
- **Competencia editorial: media-alta.** Hay contenido español correcto.
- **Debilidad observada:** los resultados enumeran herramientas pero **no
  resuelven la pregunta previa** —qué modelo aguanta *mi* equipo—, que es donde
  el usuario se atasca de verdad.
- **Activo interno relevante:** el proyecto ya tiene la app de compatibilidad
  de hardware (`docs/app-compatibilidad-ia.md`). Este clúster es el punto de
  entrada natural hacia ella.

### 3.6 Uso local / offline — `descargar LM Studio español requisitos qué modelo puedo usar`

Resultados observados: blogs técnicos en español con contenido específico y
razonablemente actual (SoftZone, Lignux, Toni Domenech, PromptQuorum).

- **Riesgo de clon: bajo.** No se observaron portales de redistribución.
- **Competencia editorial: alta.** Es el clúster mejor cubierto en español de
  todos los auditados.
- **Debilidad observada:** las cifras de requisitos que circulan («16 GB de RAM,
  6 GB de VRAM») se presentan como umbral único, sin relación con el modelo y
  la cuantización concretos.

### 3.7 Alternativas / privacidad — `alternativas a ChatGPT que respeten la privacidad de mis datos`

Resultados observados: consultoras de protección de datos
([Grupo Atico34](https://protecciondatos-lopd.com/empresas/alternativas-a-chatgpt/)),
prensa económica, listados SEO y páginas de producto que se posicionan como
comparativa neutral ([alternativaachatgpt.com](https://alternativaachatgpt.com/),
[Berzerk](https://www.berzerk.es/blog/alternativas-europeas-chatgpt)).

- **Competencia editorial: alta**, y con incentivo comercial visible: varias
  «comparativas neutrales» son páginas de un producto propio.
- **Riesgo para el proyecto: alto.** El clúster arrastra afirmaciones legales
  (RGPD, cifrado, «zero-knowledge») que DescargasIA **no puede verificar ni
  firmar**. AGENTS.md prohíbe expresamente los claims de seguridad no
  verificables.
- **Conclusión:** hay demanda cualitativa evidente, pero el ángulo dominante es
  el que el proyecto no debe tomar.

### 3.8 Alternativas / imagen local — `descargar Stable Diffusion gratis en español`

Resultados observados: tutoriales y blogs, un portal tipo
`stable-diffusion.programas-gratis.net`, un emulador Android
([LDPlayer](https://www.ldplayer.net/apps/stable-diffusion-on-pc.html)) y guías
centradas en **AUTOMATIC1111**.

- **Confusión de destino: alta.** «Stable Diffusion» se usa indistintamente
  para el modelo, para la interfaz web y para servicios en la nube. Un resultado
  propone instalarlo mediante un emulador de Android en PC, que no es un canal
  razonable.
- **Frescura: mala.** El material español gira alrededor de AUTOMATIC1111 y
  descargar un ZIP de GitHub con el botón «Code».
- **Hueco editorial verificado:** alto en la **desambiguación** (modelo ≠
  interfaz ≠ servicio); medio en la instalación, ya cubierta por tutoriales.

### 3.9 Tipo de canal — `descargar Open WebUI español instalar sin Docker`

Resultados observados: **páginas de `translate.google.com` traduciendo la
documentación oficial inglesa**, un repositorio de instalador no oficial de un
tercero, proveedores de GPU y vídeos.

- **Contenido nativo en español: prácticamente inexistente.** Lo que se
  posiciona es traducción automática de documentación inglesa.
- **Riesgo:** el instalador «nativo sin Docker» mejor posicionado es de un
  tercero, no del proyecto.
- **Demanda:** sin evidencia. Es una consulta técnica de nicho y **la ausencia
  de competencia no es, por sí sola, una oportunidad** (regla de selección de
  `localized-research.md`).

### 3.10 Acceso sin instalación — `IA sin instalar nada en el navegador`

Resultados observados: agregadores de «100+ herramientas gratis sin registro»
(`freeanonymousai.com`, `homiwork.com`, `nation.ai`) y listados genéricos.

- **Calidad observada: baja.** Granjas de listados sin verificación de canal.
- **Riesgo:** el clúster premia el volumen de enlaces, no la verificación.
  Competir con su propio formato desviaría al producto de su tesis.

### 3.11 Marca y renombrado — `Mistral Vibe qué es descargar`

Resultados observados: fichas de App Store que conviven bajo dos nombres
(«Vibe by Mistral (ex-Le Chat)» y «Mistral Vibe (ex-Le Chat)»), un agregador de
descargas y prensa tecnológica hispanohablante.

- **Canal oficial: presente**, a través de la ficha de App Store del propio
  editor.
- **Ambigüedad de nombre: alta.** El contenido en español sigue mezclando la
  marca antigua y la nueva, y una parte del material sobre escritorio procede de
  medios secundarios.
- **Riesgo de clon: bajo** en lo observado.
- **Hueco editorial verificado:** medio, y concentrado en el nombre, no en el
  canal.

---

## 4. Matriz de oportunidades

Etiquetas de evidencia según `references/localized-research.md`.

La tabla de abajo conserva la investigación del 2026-08-27 **sin retocar**: sus
columnas «Evidencia y etiqueta» y «Tendencia» describen lo que se sabía ese
día. El volumen medido llegó después, con el export del 2026-08-28, y se añade
en **§4.2** como una capa separada y fechada. Se leen juntas: §4 dice dónde
falla la SERP española, §4.2 dice cuánta impresión recibe hoy la página que
tendría que arreglarlo.

La columna «Tendencia» sigue diciendo **«No medida» en todas las filas**, y eso
no cambia con el export: la serie diaria de Search Console es de propiedad
completa, no está desglosada por URL, así que ninguna página de esta matriz
tiene tendencia demostrable.

| # | Consulta principal | Variantes nativas | Idioma/país | Evidencia y etiqueta | Tendencia | Dificultad observable | Debilidad del resultado | Intención | Página recomendada | Confianza | Fuentes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `character ai descargar app oficial` | `character ai apk oficial`, `character ai descargar gratis`, `character ai para PC` | es · multi-país | Evidencia cualitativa: 7/7 resultados son portales APK/terceros; el único resultado de tienda es de otro producto (§3.2) | No medida | Baja en calidad, alta en volumen de páginas | Canal oficial ausente; confusión de destino con `Janitor AI`; riesgo de APK | Transaccional | **Reforzar ficha existente** `es/character-ai` (canal oficial y desambiguación de apps homónimas) | Alta | §3.2 · 2026-08-27 |
| 2 | `descargar perplexity para windows` | `perplexity app oficial`, `perplexity apk`, `perplexity escritorio` | es · multi-país | Evidencia cualitativa: APK «Premium» + app de tienda de tercero usando la marca (§3.4) | No medida | Media | La consulta presupone un `.exe`; el contenido español no aclara el canal real | Transaccional con premisa errónea | **Reforzar ficha existente** `es/perplexity`, previa verificación del canal de escritorio | Alta | §3.4 · 2026-08-27 |
| 3 | `descargar ollama para windows` | `instalar ollama windows`, `ollama español`, `ollama sin conexión` | es · multi-país | Evidencia cualitativa: 3/7 portales de redistribución; una versión antigua ofrecida como actual (§3.1) | No medida | Media | Nadie separa instalador oficial de redistribución; versión obsoleta visible | Transaccional | **Reforzar ficha existente** `es/ollama` | Alta | §3.1 · 2026-08-27 |
| 4 | `descargar cursor para windows` | `cursor ide español`, `instalar cursor`, `cursor editor IA` | es · multi-país | Evidencia cualitativa: dos resultados de builds «Full + Portable» alteradas; dominio `cursor.sh` aún circulando (§3.3) | No medida | Media-alta (hay competencia española correcta) | Distribución alterada convive con guías legítimas | Transaccional | **Reforzar ficha existente** `es/cursor` | Media-alta | §3.3 · 2026-08-27 |
| 5 | `stable diffusion descargar español` | `instalar stable diffusion PC`, `stable diffusion gratis`, `automatic1111 español` | es · multi-país | Evidencia cualitativa: confusión modelo/interfaz/servicio; propuesta de emulador Android; material anclado en AUTOMATIC1111 (§3.8) | No medida | Media | Frescura mala y destino ambiguo | Transaccional + informativa | **Reforzar ficha existente** `es/stable-diffusion`, con foco en desambiguación | Media | §3.8 · 2026-08-27 |
| 6 | `qué IA puedo usar sin conexión en mi PC` | `IA local sin internet`, `chatbot offline español`, `IA privada en mi ordenador` | es · multi-país | Evidencia cualitativa: contenido español existente que enumera herramientas sin resolver la pregunta de capacidad del equipo (§3.5, §3.6) | No medida | Media-alta | Nadie conecta «qué herramienta» con «qué aguanta mi equipo» | Informativa, transversal a varias fichas | **Guía de intención** enlazada a la app de compatibilidad de hardware y a las fichas de `modelos-locales` | Media | §3.5 · §3.6 · 2026-08-27 |
| 7 | `descargar lm studio` | `lm studio requisitos`, `lm studio español`, `qué modelo cargar en lm studio` | es · multi-país | Evidencia cualitativa: clúster bien cubierto en español; sin portales de redistribución (§3.6) | No medida | **Alta** | Requisitos presentados como umbral único, sin relación con modelo ni cuantización | Transaccional | **Mantener** ficha existente; sin trabajo prioritario en F3-ES | Media | §3.6 · 2026-08-27 |
| 8 | `alternativas a chatgpt privacidad` | `IA que no guarde mis datos`, `alternativa europea a chatgpt`, `IA RGPD` | es · multi-país | Evidencia cualitativa: demanda visible, competencia alta y comercialmente interesada (§3.7) | No medida | Alta | El ángulo dominante exige claims legales/de seguridad | Informativa/comercial | **Descartar en F3-ES** (motivo en §5) | Alta (sobre el descarte) | §3.7 · 2026-08-27 |
| 9 | `open webui instalar sin docker` | `open webui español`, `interfaz para ollama` | es · multi-país | Evidencia cualitativa: solo traducción automática de documentación inglesa; instalador de tercero (§3.9) | No medida | Baja | Sin contenido nativo, pero **sin evidencia de demanda** | Técnica de nicho | **Descartar en F3-ES** (motivo en §5) | Media | §3.9 · 2026-08-27 |
| 10 | `herramientas de IA sin instalar nada` | `IA online gratis sin registro`, `IA en el navegador` | es · multi-país | Evidencia cualitativa: dominado por granjas de listados sin verificación (§3.10) | No medida | Baja en calidad, alta en saturación | Formato incompatible con la tesis del proyecto | Informativa genérica | **Descartar en F3-ES** (motivo en §5) | Media | §3.10 · 2026-08-27 |
| 11 | `mistral vibe descargar` / `le chat mistral` | `vibe mistral español`, `le chat descargar`, `mistral app` | es · multi-país | Evidencia cualitativa: convive la marca antigua (`Le Chat`) con la nueva (`Vibe`) en resultados y tiendas (§3.11) | No medida | Baja-media | Ambigüedad de nombre tras el renombrado | Transaccional | **Reforzar ficha existente** `es/mistral-vibe` cubriendo el nombre antiguo como sinónimo | Media | 2026-08-27 |
| 12 | `hugging face descargar` / `gamma presentaciones IA` | — | es · multi-país | **Sin auditoría propia en esta sesión** | — | — | — | — | **Sin decisión.** No se selecciona ni se descarta | Nula | — |

### 4.1 Tipo de página por fila

- **Ficha nueva: ninguna.** El catálogo `es` cubre los 86 slugs base (§2.1).
- **Refuerzo de ficha existente:** filas 1, 2, 3, 4, 5, 11.
- **Guía de intención:** fila 6, y solo ella.
- **Mantener sin trabajo:** fila 7.
- **Descarte:** filas 8, 9, 10.
- **Sin decisión por falta de auditoría:** fila 12.

### 4.2 Volumen confirmado por página (Search Console, 2026-08-28)

Fuente: `docs/mejora/evidencia/gsc-2026-08-28/rendimiento-paginas.csv`.
Propiedad `fuenteai.com`, tipo de búsqueda `Web`, **2026-06-19 a 2026-08-26**,
sin filtro de página, consulta, país ni dispositivo. Los cuatro valores de cada
fila son los del export, sin redondear.

Etiqueta aplicable: **volumen confirmado de página**. No es volumen de mercado
de la consulta, y no es tendencia.

| # de §4 | Página `/es/*` | Impresiones | Clics | CTR | Posición media | Etiqueta |
|---|---|---|---|---|---|---|
| 1 | `es/character-ai` | 264 | 1 | 0,38% | 10,86 | Volumen confirmado de página |
| 2 | `es/perplexity` | 328 | 0 | 0% | 44,39 | Volumen confirmado de página |
| 3 | `es/ollama` | 317 | 1 | 0,32% | 18,15 | Volumen confirmado de página |
| 4 | `es/cursor` | 552 | 1 | 0,18% | 27,21 | Volumen confirmado de página |
| 5 | `es/stable-diffusion` | 75 | 0 | 0% | 11,60 | Volumen confirmado de página |
| 6 | — (guía de intención propuesta) | — | — | — | — | **Dato ausente**: la página no existe todavía |
| 7 | `es/lm-studio` | 270 | 3 | 1,11% | 24,62 | Volumen confirmado de página |
| 8 | — (descartada, sin página propia) | — | — | — | — | **Dato ausente** |
| 9 | `es/open-webui` | 64 | 1 | 1,56% | 13,23 | Volumen confirmado de página |
| 10 | — (descartada, sin página propia) | — | — | — | — | **Dato ausente** |
| 11 | `es/mistral-vibe` | 73 | 0 | 0% | 8,67 | Volumen confirmado de página |
| 12 | `es/gamma-app` | 591 | 0 | 0% | 24,71 | Volumen confirmado de página |
| 12 | `es/hugging-face` | 48 | 0 | 0% | 8,52 | Volumen confirmado de página |

#### Qué cambia y qué no cambia en la matriz

1. **La fila 12 deja de ser la menos informada y pasa a ser la de más
   impresiones.** `es/gamma-app` es la URL con más impresiones de todo el sitio
   (591) y tiene **cero clics** en el periodo. Sigue **sin decisión**: no hay
   auditoría de SERP propia para esa consulta y este export no la sustituye.
   Lo que aporta es una razón medida para auditarla antes que otras.
2. **La fila 2 (`es/perplexity`) tiene el peor puesto del grupo** —328
   impresiones en posición media 44,39, sin ningún clic—, lo que es coherente
   con la debilidad descrita en §3.4, pero **no la demuestra**: la posición
   media mezcla países y dispositivos.
3. **La fila 4 (`es/cursor`) es la segunda del sitio en impresiones** (552) con
   un solo clic. Refuerza su prioridad 2 en §6 con un dato, no con una
   impresión de sesión.
4. **La fila 9 (`es/open-webui`) sigue descartada.** 64 impresiones y posición
   13,23 no son evidencia de demanda del mercado: son impresiones de una página
   que ya existe. El motivo del descarte en §5 no depende de este número.
5. **Las filas 6, 8 y 10 no tienen dato y no pueden tenerlo**: dos son
   descartes sin página propia y la tercera es una página que aún no existe.
   No se les asigna volumen por analogía con ninguna otra fila.

#### Páginas con volumen que esta matriz no cubre

El export destapa dos URLs `/es/*` que concentran clics y que **no aparecen en
la matriz** porque no se auditaron el 2026-08-27:

| Página | Impresiones | Clics | CTR | Posición media |
|---|---|---|---|---|
| `es/jan` | 527 | 9 | 1,71% | 8,28 |
| `es/grok` | 317 | 5 | 1,58% | 24,32 |

Entre las dos suman **14 de los 41 clics** de `/es/*` del periodo. No se
convierten en filas de la matriz en este documento: una fila necesita auditoría
de SERP propia, y esta sesión no la ha hecho. Quedan anotadas como **candidatas
con volumen confirmado y sin auditoría**, para la próxima iteración de F2-ES o
para F7.

#### Lo que este export no autoriza a escribir

- **Ninguna consulta de `rendimiento-consultas.csv` es volumen de una ficha.**
  El export no cruza consulta con página. `cursor` aparece con 242 impresiones
  como consulta y `es/cursor` con 552 como página: son dos medidas distintas de
  dos tablas distintas y **no se suman, no se dividen y no se atribuyen** la
  una a la otra.
- **La tabla de consultas está truncada**: 920 filas que suman 3.618 de las
  6.531 impresiones de la propiedad. No es el universo de consultas del sitio.
- **España (1.879 impresiones, 15 clics) no es el país de `/es/*`.** La tabla
  de países es de propiedad completa e incluye `sv` e `it`. El alcance
  multi-país declarado en §1.1 sigue igual de declarado y sigue sin cerrarse.
- **Ninguna de estas páginas tiene tendencia.** La única serie temporal del
  export es de propiedad.

---

## 5. Motivos de descarte

| Candidato | Motivo del descarte | Qué lo reabriría |
|---|---|---|
| `alternativas a chatgpt privacidad` (fila 8) | El ángulo que domina la SERP exige afirmar cumplimiento normativo, cifrado o tratamiento de datos de terceros. AGENTS.md y `source-policy.md` prohíben claims de seguridad no verificables, y DescargasIA no está en posición de firmarlos. Competir con consultoras de protección de datos con contenido más flojo sería peor que no competir | Un ángulo reformulado que solo describa hechos verificables del canal oficial (si la herramienta permite uso local, si exige cuenta), sin valoración legal |
| `open webui instalar sin docker` (fila 9) | Baja competencia **sin evidencia de demanda**. La regla de selección es explícita: baja competencia sin demanda no es una oportunidad. Además la propia documentación oficial marca la instalación sin Docker como no soportada, así que una guía nuestra invitaría a un camino que el proyecto upstream no respalda | Evidencia de demanda de una fuente segmentada, o soporte oficial de esa vía de instalación |
| `herramientas de IA sin instalar nada` (fila 10) | El formato ganador es la granja de listados sin verificación de canal. Entrar exige o bien copiar ese formato —que contradice la tesis del producto— o bien publicar algo que no compite | Un recorte por intención concreta (una tarea, no un listado) con evidencia propia |
| Fichas nuevas del catálogo | No hay ningún slug base sin ficha `es`. Crear una ficha nueva en F3-ES implicaría **añadir primero una herramienta a `tools-base`**, que es una decisión de catálogo fuera del alcance de esta fase | Una decisión de catálogo tomada por Codex |
| `hugging face`, `gamma` (fila 12) | **No es un descarte**: es ausencia de auditoría. No se investigaron en esta sesión y no se emite juicio | Auditoría de SERP propia |

---

## 6. Recomendación de secuencia para F3-ES

Sin autoridad de decisión: es una propuesta para Codex.

1. **Prioridad 1 — riesgo de clon con canal oficial ausente:** filas 1, 2
   (Character AI y Perplexity). Son los dos casos donde la SERP española falla
   exactamente en lo que el producto sabe hacer.
2. **Prioridad 2 — redistribución y builds alteradas:** filas 3, 4 (Ollama y
   Cursor).
3. **Prioridad 3 — desambiguación:** filas 5, 11 (Stable Diffusion y el
   renombrado de Mistral).
4. **Prioridad 4 — única página nueva propuesta:** fila 6, la guía de intención
   sobre IA local, como puente hacia la app de compatibilidad de hardware. Su
   publicación depende de la decisión abierta «si las guías de intención
   necesitan una ruta pública antes de desbloquearse» (`decisiones.md`), que
   esta fase **no** cierra.

Antes de escribir una sola línea sobre canales, F3-ES debe **reverificar los
`platforms[]` contra la fuente oficial** de cada herramienta que toque. El
`lastChecked` de `2026-08-12` autoriza a priorizar, no a afirmar.

---

## 7. Riesgos y bloqueos

| Riesgo | Efecto | Mitigación aplicada en este documento |
|---|---|---|
| Search Console sin cruce consulta × página | No se puede afirmar demanda de mercado por consulta para ninguna ficha | §4.2 etiqueta el volumen como «de página», nunca de consulta; blocker acotado (abajo) |
| Ausencia de serie temporal por URL | Ninguna afirmación de tendencia por página es posible | La columna «Tendencia» sigue en «No medida» en las doce filas |
| SERP auditada sin geolocalización hispanohablante | Las posiciones observadas no son las del usuario objetivo | Toda la sección 3 se etiqueta como evidencia cualitativa; se declara la limitación |
| Alcance multi-país sin evidencia segmentada | Riesgo de escribir para un país usando señal de otro | Declarado en 1.1; se prohíbe explícitamente atribuir cualquier fila a un país |
| Dato de canal con `lastChecked` de 2026-08-12 | Un canal puede haber cambiado | F3-ES obligada a reverificar (§6) |
| Estado del escritorio de Perplexity no verificado | Riesgo de afirmar algo falso sobre un `.exe` | Marcado explícitamente como pendiente en §3.4 |

**Blocker parcialmente resuelto (2026-08-28):** el export de Google Search
Console se entregó en el [issue #50](https://github.com/Gunz-cop/DescargasIA/issues/50)
y está ingerido en `docs/mejora/evidencia/gsc-2026-08-28/`.

Resuelto: **volumen confirmado por página** para 86 URLs `/es/*` (§4.2), y
tendencia de propiedad para F1/F7 (serie diaria 2026-06-19 → 2026-08-26).

**Sigue faltando**, y por eso #50 no se cierra:

1. un export **filtrado por página `/es/`** con su tabla de consultas, que es lo
   único que permitiría decir «esta consulta trae impresiones a esta ficha»;
2. el cruce **consulta × país**, sin el cual el alcance multi-país de §1.1
   sigue declarado y no ratificado;
3. una serie temporal **por URL**, sin la cual F7 no puede medir el antes y el
   después de una ficha concreta, solo el de la propiedad entera.

Los tres se piden como un export nuevo con el filtro aplicado en Search
Console. No se deducen de este.

---

## 8. Verificación de los criterios de aceptación del issue #38

| Criterio | Estado | Dónde se comprueba |
|---|---|---|
| No hay traducciones literales presentadas como demanda | Cumplido | Todas las consultas de §3 se redactaron en español nativo; no se reutilizó ninguna consulta de `sv.md` ni de `it.md`, ni sus selecciones |
| Cada selección tiene evidencia, confianza y fuentes | Cumplido | Columnas «Evidencia y etiqueta», «Confianza» y «Fuentes» de §4 |
| Cada descarte importante tiene motivo | Cumplido | §5 |
| Se diferencia tendencia, volumen confirmado, sugerencia y evidencia cualitativa | Cumplido | §4 etiqueta cada fila como evidencia cualitativa; §4.2 separa el volumen confirmado de página (2026-08-28) y enumera las filas sin dato; la tendencia sigue declarada como no medida en ambas |
| No se modifica ningún JSON de contenido ni se activa ninguna ruta | Cumplido | El único archivo que crea esta fase es este documento |
