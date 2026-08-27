# Le pedí a cinco IAs que auditaran mi web. Tres me reportaron fallos que no existían.

> **Destino:** Medium (publicación original). Sindicar después a LinkedIn, Tumblr,
> dev.to (con canonical) y Menéame. Cuando exista la ruta pública de guías en
> fuenteai.com, mover el original al dominio propio y dejar Medium con
> `rel=canonical` apuntando a casa.
>
> **Subtítulo sugerido:** Lo que aprendí preparando un sitio para que los agentes
> de IA lo lean — y por qué la mitad del trabajo fue descartar falsos positivos.

---

Durante las últimas semanas he estado haciendo algo que hace tres años no habría
tenido ningún sentido: preparar una web para que la lean máquinas que no son
Googlebot.

No hablo de SEO. Hablo de que cuando alguien le pregunta a ChatGPT, a Claude o a
Perplexity "¿de dónde me descargo esta herramienta sin acabar en un clon con
malware?", hay una cadena de decisiones técnicas que determina si tu sitio es
siquiera **elegible** para aparecer en esa respuesta. Y esa cadena está
razonablemente bien documentada, pero repartida en media docena de estándares que
casi nadie ha implementado a la vez.

Este es el registro de haberlo hecho en [FuenteAI](https://fuenteai.com), un
catálogo de herramientas de IA en tres idiomas, y de lo que salió mal por el
camino. Si vas a hacer lo mismo, te ahorro unas cuantas horas.

## La parte aburrida: qué hay que publicar

El estándar de facto para medir esto ahora mismo es
[isitagentready.com](https://isitagentready.com), que corre 21 comprobaciones
sobre un dominio. El sitio empezó en **nivel 1 de 5** — "Basic Web Presence", es
decir, tienes HTML y poco más — con 3 comprobaciones en verde y 13 en rojo.

Lo que hubo que publicar para moverlo:

**Sin runtime**, todo generado en build desde las mismas colecciones de contenido
que producen el HTML:

- `Content-Signal` y `Agentmap` en `robots.txt` — declaras explícitamente qué
  puede hacer un bot con tu contenido, en lugar de dejarlo a interpretación.
- Cabeceras `Link` con cuatro relaciones registradas en IANA.
- `/llms.txt` y `/llms-full.txt`.
- Un catálogo JSON de todas las fichas con su OpenAPI 3.1.
- `/.well-known/api-catalog`, `ai-catalog.json`, `mcp/server-card.json`,
  `agent-card.json`, `agent-skills/index.json`.
- Un espejo Markdown de cada página, servido por negociación de contenido:
  `Accept: text/markdown` y recibes el texto limpio en vez de tener que parsear
  el DOM.

**Con runtime**, en un Worker de Cloudflare: un servidor MCP con tres
herramientas (`search_tools`, `get_tool`, `list_categories`), y un agente A2A.

**En la propia página**: WebMCP, que le da al asistente que corre *dentro* del
navegador dos herramientas sobre el catálogo.

La regla que mantuvo esto sano: **lo que lee un agente sale de la misma fuente que
lee una persona.** Un único módulo deriva el `llms.txt`, el catálogo JSON, el
espejo Markdown y las herramientas MCP de las mismas colecciones que generan las
fichas HTML. En el momento en que tienes dos fuentes de verdad, tienes una
desactualizada, y la desactualizada será siempre la que leen las máquinas porque
nadie la mira.

Resultado: **nivel 5 de 5, 81/100**, con Discoverability, Content y Bot Access
Control al 100%.

## La parte interesante: tres comprobaciones que no voy a pasar nunca

Quedan tres en rojo, y son la misma decisión repetida tres veces.

`oauthDiscovery` y `oauthProtectedResource` exigen un servidor de autorización
OAuth real. El sitio es público y anónimo, no tiene cuentas, y no existe tal
servidor. Podría publicar los documentos apuntando a un endpoint inventado y
subiría la puntuación — y rompería a cualquier cliente que se los creyera y los
siguiera.

La tercera es más divertida. `/auth.md` existe, responde 200 y declara
honestamente que el acceso es público y anónimo. El escáner lo marca en rojo de
todas formas:

> auth.md exists but OAuth Protected Resource Metadata was not found

Su criterio publicado dice que un documento autocontenido es válido cuando no hay
OAuth. Su implementación exige además la metadata OAuth. Un sitio público sin
cuentas **no puede pasar esta comprobación sin inventarse un endpoint de
registro.**

Menciono esto porque es donde acaba siempre este tipo de trabajo: llega un punto
en el que subir el número y decir la verdad dejan de ser lo mismo. Y hay que
decidir. Yo decidí quedarme en 81 y documentar por qué, que es una respuesta
peor para un tuit y mejor para cualquiera que se fíe de los documentos que
publico.

## Y ahora la parte que no esperaba

Con el sitio ya en producción, lo audité con **cinco IAs** — ChatGPT, Claude,
DeepSeek, Qwen y Gemini — en conversaciones nuevas, sin contexto previo, con el
mismo prompt: entra, recupera, navega, dime qué te impide entenderme.

Las cinco concluyeron que no había impedimento técnico observable. Muy bien. Pero
al verificar sus informes con `curl`, uno por uno, apareció esto:

| Lo que reportaron | La realidad | Por qué |
|---|---|---|
| «No hay JSON-LD» (Gemini, DeepSeek) | Hay `SoftwareApplication`, `FAQPage`, `BreadcrumbList`, `Offer`, `Organization` | Su extractor descarta los `<script>` |
| «El sitemap da error de conexión» (DeepSeek) | HTTP 200, XML válido, 189 URLs | Restricción de su propia herramienta |
| «`robots.txt` y sitemap inaccesibles» (Gemini) | HTTP 200 los dos | Ídem |
| «`lastmod` único para todo el sitio» (Qwen, DeepSeek) | Fechas granulares por URL | Leyeron el índice, no el sitemap hijo |

**Tres de las cinco reportaron fallos que no existían.** Y no son alucinaciones
de las llamativas: son informes plausibles, bien redactados, con la estructura
correcta, que describen limitaciones de la herramienta de navegación del modelo
como si fueran defectos del sitio auditado.

Si me llego a creer esos informes, habría añadido JSON-LD que ya estaba puesto y
habría "arreglado" un sitemap que funcionaba perfectamente. Dos tardes de trabajo
para empeorar un sitio sano.

La conclusión operativa es incómoda y creo que se generaliza a casi todo el uso
serio de estos modelos como auditores: **una IA que no puede acceder a un recurso
y una IA que ha encontrado un recurso defectuoso producen exactamente el mismo
informe.** El modelo no distingue entre "esto no existe" y "yo no lo alcanzo",
porque desde su punto de vista son la misma observación. Verificar cada hallazgo
contra la fuente no es desconfianza, es parte del método.

Dicho eso: **la otra mitad sí valió la pena.**

- `/sitemap.xml` devolvía 404. Solo existía `sitemap-index.xml`, correctamente
  declarado en `robots.txt` — pero tres de las cinco tropezaron igual, porque
  probaron la ruta convencional antes de leer el `robots.txt`. Corregido con un
  301 y un test que además comprueba que el destino sea el mismo sitemap que
  declara el `robots.txt`.
- La `og:image` era genérica en todas las fichas. No afecta al parsing por
  agentes; sí a cómo se ve el sitio cuando alguien lo comparte. Sigue pendiente,
  y no es una línea de código: hacen falta imágenes generadas en build.

Y el dato que más me gustó, aportado por ChatGPT sin que se lo pidiera: su
buscador ya devolvía fichas individuales del dominio — Canva, LanguageTool,
Stable Diffusion, NotebookLM, Adobe Firefly — sin haberlas abierto en esa
conversación.

## Tres trampas que me costaron tiempo real

Ninguna está documentada en los estándares. Van gratis:

**1. Una configuración de 404 puede impedir que tu Worker se ejecute.** Con
`not_found_handling: "404-page"`, el router de assets de Cloudflare responde el
404 él mismo y tu código nunca llega a correr. Efecto colateral del
descubrimiento: unas rutas de API llevaban meses sin llegar al Worker por lo
mismo, y nadie lo había notado.

**2. La red de seguridad se caía sola.** Llamar a `env.ASSETS.fetch(request)`
dentro de un `catch`, sobre una petición cuyo cuerpo ya se consumió, lanza
*"Cannot reconstruct a Request with a used body"*. Es decir: el manejador de
errores convertía un error manejable en un 500 sin cuerpo. El fallback que te
protege es código de producción y necesita sus propios tests.

**3. Tu política de CORS probablemente no sirve para MCP.** Exigir que el
`Origin` sea tu propio sitio deja fuera a todos los clientes MCP reales, que no
son navegadores y no envían `Origin` en absoluto.

Bonus de proceso, y esta es la que más me ha marcado: el trabajo pasó por tres
rondas de revisión con una sesión de IA auditora independiente antes de darse por
bueno, y las tres encontraron fallos reales que la sesión que escribió el código
no había visto. Pero los dos fallos más graves — la red de seguridad y una
lectura sin proteger — no aparecieron **revisando**, sino **ejecutando** las
correcciones. Leer el código no basta. La sesión que escribe el código no puede
ser la que declara que funciona.

## La conclusión que no me esperaba

Le pregunté a las cinco si, con todo esto hecho, el sitio sería **citado** por
un asistente ante una pregunta real.

Ninguna pudo afirmarlo. Y dos añadieron la misma advertencia: para una pregunta
del tipo *"¿cómo descargo X?"*, el sistema va a preferir la fuente primaria — la
web del fabricante — salvo que tu página aporte síntesis, curación o verificación
que el fabricante no tiene.

Eso es, creo, lo único que hay que llevarse de todo este trabajo:

**La preparación técnica te hace elegible. Lo que te hace citable es el trabajo
editorial.**

Todo lo de arriba — llms.txt, MCP, A2A, los `.well-known`, el espejo Markdown —
es condición necesaria y no es condición suficiente. Es quitar los obstáculos
para que te lean. Que valga la pena leerte es otro proyecto entero, y ese no se
resuelve publicando ficheros.

---

*El método completo, con la matriz de qué aplica según el tipo de sitio, las ocho
trampas y el escáner ejecutable, está empaquetado como una Agent Skill
reutilizable. Si quieres ver la superficie resultante en producción, está toda
abierta: [fuenteai.com/llms.txt](https://fuenteai.com/llms.txt) y
[fuenteai.com/.well-known/agent-card.json](https://fuenteai.com/.well-known/agent-card.json)
son los dos puntos de entrada.*
