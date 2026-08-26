# Hito: FuenteAI, del nivel 1 al nivel 5 de preparación para agentes

Registro de qué se hizo, qué costó, qué falló y qué sigue abierto. La guía
operativa del sitio está en `docs/agent-readiness.md`; el método reutilizable en
otro repo, en `.claude/skills/agent-readiness/`.

**Fecha del cierre:** 26 de agosto de 2026.
**Medida:** las 21 comprobaciones de [isitagentready.com](https://isitagentready.com).

| | Antes | Producción hoy |
|---|---|---|
| Nivel | 1 — Basic Web Presence | **5 — Agent-Native** |
| Puntuación | — | **81 / 100** (13 de 16 aplicables) |
| En verde | 3 | 13 |
| En fallo | 13 | 3 |
| Neutrales / no aplican | 6 | 6 |

**Se alcanzó el techo honesto.** El escáner devuelve `nextLevel: null` —no hay
un nivel 6— y las **tres** comprobaciones que quedan en rojo son el trío OAuth,
que solo se pasa teniendo autenticación real o inventando un servidor que no
existe. No hay ninguna acción pendiente que suba la puntuación sin mentir.

Discoverability, Content y Bot Access Control están al **100%**.

### Sobre los perfiles del escáner

La interfaz permite escanear con perfiles reducidos. Con el perfil **Content
Site** —7 de 20 comprobaciones— el sitio marca **86**.

Ese número **no es una mejora, es otro examen**: apaga entera la categoría *API,
Auth, MCP & Skill Discovery*, que es justo donde está el trabajo (MCP, agent
card, api-catalog, agent skills, WebMCP, ARD). Subir de 75 a 86 se consigue no
mirando lo que hace distinto al sitio.

**El número que se reporta es el del escaneo completo.** Si en algún sitio
aparece el 86, tiene que ir con la etiqueta de escaneo parcial.

Reproducible en cualquier momento:

```bash
node .claude/skills/agent-readiness/scripts/scan.mjs https://fuenteai.com
```

---

## Qué se publicó

Todo derivado de las mismas colecciones de contenido que generan el HTML, a
través de `src/utils/agent-content.ts`.

**Sin runtime** — `Content-Signal` y `Agentmap` en `robots.txt`; cabeceras
`Link` con cuatro relaciones registradas; `/llms.txt` y `/llms-full.txt`;
`/api/catalog.json` (las 147 fichas de los tres idiomas, con `safetyNotes` y
`faq`) y su OpenAPI 3.1; `/.well-known/api-catalog`, `ai-catalog.json`,
`mcp/server-card.json`, `agent-card.json` y `agent-skills/index.json`;
`/auth.md`; dos Agent Skills reales.

**Con runtime**, en `worker/agents/` — servidor MCP en `/mcp` con
`search_tools`, `get_tool` y `list_categories`; agente A2A en `/a2a`;
negociación `Accept: text/markdown` sobre 174 espejos generados en build.

**En la página** — WebMCP con dos herramientas sobre el catálogo, y los enlaces
de descubrimiento en el `<head>`.

---

## Lo que no pasa, y por qué

Tres comprobaciones en rojo, y son la misma decisión repetida. Se documentan
además `a2aAgentCard` y `dnsAid`, que estuvieron en rojo y ya no lo están,
porque lo que costó resolverlas es lo que más se repite; y `webBotAuth`, que no
aplica aunque sea neutral y no penalice.

### `oauthDiscovery` y `oauthProtectedResource` — decisión

Exigen un servidor de autorización OAuth/OIDC real. No existe para este dominio.
Publicar esos documentos apuntando a uno inexistente rompe a cualquier cliente
que los siga. **No se van a implementar mientras el sitio no tenga cuentas.**

### `authMd` — techo del criterio

`/auth.md` existe, responde 200 y declara honestamente que el acceso es público
y anónimo. El escáner lo marca `fail` de todas formas:

> auth.md exists but OAuth Protected Resource Metadata was not found

Su criterio publicado dice que un documento autocontenido es válido cuando no
hay OAuth, pero su implementación exige además la metadata OAuth o un flujo de
registro completo. **Un sitio público sin cuentas no puede pasar esta
comprobación sin inventar un endpoint de registro.** Se pierde a conciencia.

### `a2aAgentCard` — corregido y desplegado

Falló en producción con:

> Invalid A2A Agent Card: Missing or empty required field "supportedInterfaces"

**Causa**: el commit `6294d43` renombró `supportedInterfaces` a
`additionalInterfaces` en `public/.well-known/agent-card.json`, y dejó un test
que fijaba `supportedInterfaces === undefined` con el comentario *"pertenece al
Agent Card 1.0"*.

Ese razonamiento tiene la mitad correcta y la mitad al revés. Verificado contra
la spec:

- **La versión publicada actual de A2A es 1.0.0**, no la 0.3.
- En 1.0.0, `supportedInterfaces` es un campo **obligatorio** del AgentCard:
  *"Ordered list of supported interfaces. The first entry is preferred"* (§4.4.1,
  y §8.3.1 se titula literalmente "Supported Interfaces Declaration").
- Cada entrada es `{url, protocolBinding, protocolVersion}` — el campo es
  `protocolBinding`, no `transport`.
- `additionalInterfaces` y `preferredTransport` **no aparecen ni una vez** en la
  spec de 1.0: son de la 0.3.

Es decir: el escáner no está siendo caprichoso, está siguiendo la spec vigente,
y el cambio movió la tarjeta del campo actual a uno heredado.

**Corregido así**: el documento adopta la forma de A2A 1.0 con
`supportedInterfaces`, y **conserva** `url`, `preferredTransport` y
`additionalInterfaces`. Describen el mismo endpoint, y la spec pide ignorar los
campos no reconocidos (§5.7), así que mantenerlos no rompe a nadie y sirve a los
clientes que aún leen la 0.3.

El `protocolVersion` de la interfaz declara **`0.3`**, que es lo que el agente
habla de verdad. Poner `1.0` sería prometer el `tenant` de §8.3.2 y demás, que
no implementa: la forma del documento se actualiza, la promesa no se infla.

`tests/agents/agent-card.test.mjs` blinda ahora las dos formas y que apunten al
mismo endpoint.

### `dnsAid` — resuelto

Pasó. `DNS for AI Discovery (DNS-AID) discovery record found at
_a2a._agents.fuenteai.com`, con `serviceRecordCount: 2` y `dnssecValidated:
true`.

Lo que costó fue una lectura equivocada del criterio por parte de esta sesión,
y vale la pena registrarla porque es la trampa que más tiempo consumió:

1. **El check no mira los registros `TXT`.** Solo cuenta `SVCB`/`HTTPS`. Los
   `TXT` sirven —le dan a `ard` su cuarto mecanismo de descubrimiento,
   `dns-catalog`— pero no mueven `dnsAid`.
2. **La advertencia sobre las claves `keyNNNNN` era demasiado conservadora.** Se
   leyó como un bloqueo, y son para parámetros *custom*, que son opcionales. El
   ejemplo canónico del criterio no lleva ninguno.

Lo publicado, siguiendo ese ejemplo al pie de la letra:

```dns
_mcp._agents  SVCB  1 fuenteai.com. alpn="mcp" port=443 mandatory=alpn,port
_a2a._agents  SVCB  1 fuenteai.com. alpn="a2a" port=443 mandatory=alpn,port
_index._agents    TXT  "url=https://fuenteai.com/.well-known/ai-catalog.json"
_catalog._agents  TXT  "url=https://fuenteai.com/.well-known/ai-catalog.json"
```

Más DNSSEC activo, que el check exige y ahora valida.

Dos cosas siguen siendo ciertas y conviene no olvidarlas: `alpn="mcp"` no es un
ALPN real de TLS sino una etiqueta de descubrimiento —así lo usa el ejemplo
oficial—, y la ruta `/mcp` no cabe en un `SVCB`, que apunta a host y puerto. El
agente la encuentra por el manifiesto ARD, que es a lo que apuntan los `TXT`.

### `webBotAuth` — no aplica

Sirve para firmar las peticiones que el sitio **envía** como bot. FuenteAI no
envía ninguna. La comprobación es informativa y no afecta al nivel.

---

## La validación con cinco IAs

Con el sitio ya en producción se auditó con **ChatGPT, Claude, DeepSeek, Qwen y
Gemini**, en conversaciones nuevas y sin contexto previo, con el prompt de
`.claude/skills/agent-readiness/templates/prompt-auditoria.md`.

**Las cinco concluyeron que no hay ningún impedimento técnico observable** para
encontrar, recuperar, navegar y comprender el sitio. ChatGPT añadió el dato más
fuerte: su buscador ya devolvía fichas individuales del dominio —Canva,
LanguageTool, Manus, Stable Diffusion, Midjourney, NotebookLM, Adobe Firefly,
Gamma— sin haberlas abierto antes.

Qwen fue la única que recuperó y verificó toda la superficie nueva: `llms.txt`,
`llms-full.txt`, `ai-catalog.json`, `api/catalog.json`, `mcp/server-card.json` y
los JSON-LD de las fichas.

### La mitad del valor estuvo en descartar falsos positivos

**Tres de las cinco reportaron fallos que no existían.** Verificados con `curl`:

| Reporte | Realidad | Causa |
|---|---|---|
| «No hay JSON-LD» (Gemini, DeepSeek) | Hay `SoftwareApplication`, `FAQPage`, `BreadcrumbList`, `Offer`, `Organization` | Su extractor descarta `<script>` |
| «`sitemap-index.xml` da error de conexión» (DeepSeek) | HTTP 200, XML válido, 189 URLs | Restricción de su herramienta |
| «`robots.txt` y sitemap inaccesibles» (Gemini) | HTTP 200 los dos | ídem |
| «`lastmod` único para todo el sitio» (Qwen, DeepSeek) | Fechas granulares por URL | Leyeron el índice, no el sitemap hijo |

Creerlos habría llevado a añadir JSON-LD que ya existía y a "arreglar" un
sitemap que funcionaba.

### Los hallazgos reales

- **`/sitemap.xml` devolvía 404.** Solo existe `sitemap-index.xml`, bien
  declarado en `robots.txt`. Tres de cinco tropezaron con esto. **Corregido**
  con un 301 en `public/_redirects`, con test que comprueba además que el
  destino es el mismo sitemap que declara `robots.txt`.
- **`og:image` genérica** en todas las fichas. No afecta al parsing por agentes;
  sí a cómo se ve el sitio compartido. **No corregido, y no es una línea**:
  ninguna de las 86 fichas tiene `screenshotUrl`, así que hacen falta imágenes
  generadas en build (satori/sharp o equivalente). Es un proyecto pequeño, no
  una corrección.

### Lo que la auditoría no demuestra

Ninguna de las cinco pudo afirmar que el sitio vaya a ser **citado**. Eso
depende de ranking y autoridad comparativa, no de accesibilidad. Dos añadieron
una advertencia que conviene tener presente: para *"¿cómo descargo X?"*, el
sistema preferirá la fuente primaria salvo que la ficha aporte síntesis,
curación o verificación que el sitio del fabricante no tiene.

**La preparación técnica hace elegible. Lo que hace citable es el trabajo
editorial.** Esa es la conclusión operativa del hito.

---

## Lo que costó, y lo que enseñó

Ocho trampas, ninguna documentada en los estándares. Están todas en
`.claude/skills/agent-readiness/references/implementacion.md`. Las tres que más
tiempo costaron:

1. **`not_found_handling: "404-page"` impide que el Worker se ejecute.** El
   router de assets responde el 404 él mismo. Efecto colateral: se descubrió que
   las rutas `/api/hw/*` de la app de hardware llevaban tiempo sin llegar al
   Worker por lo mismo, sin que nadie lo hubiera notado.
2. **La red de seguridad se caía sola.** `env.ASSETS.fetch(request)` en un
   `catch`, sobre una petición cuyo cuerpo ya se consumió, lanza *"Cannot
   reconstruct a Request with a used body"* y convierte un error manejable en un
   500 sin cuerpo.
3. **La política de `Origin` del proyecto no servía para MCP.** Exigir que
   `Origin` sea el propio sitio deja fuera a todos los clientes MCP reales, que
   no son navegadores y no envían `Origin`.

### Sobre el proceso

El trabajo pasó por **tres rondas de revisión** con una sesión auditora
independiente antes de aprobarse. Las tres encontraron fallos reales que la
sesión implementadora no había visto: la negociación Markdown incompleta en `/sv` e
`/it`, la falta de validación de `Origin`, WebMCP navegando a traducciones
inexistentes, y un digest no determinista entre Windows y Linux.

Dos observaciones que valen para el próximo proyecto:

- **La sesión que escribe el código no puede ser la que declara que funciona.**
  Es la misma lección que llevó a `ci.yml` en el proyecto de fases.
- **Reverificar encuentra lo que revisar no encuentra.** Los dos fallos más
  graves (la red de seguridad y la lectura sin proteger del catálogo)
  aparecieron al *ejecutar* las correcciones, no al leerlas. Ninguna de las
  revisiones los había detectado.

---

## Estado y pendientes

| Pendiente | Coste | Efecto |
|---|---|---|
| Dar de alta el servidor MCP en registros | Bajo | Sin esto, `/mcp` recibe cero llamadas |
| `og:image` por ficha | Proyecto pequeño | Representación en redes; no afecta a agentes |

**Ninguno de los dos sube la puntuación**, y eso es el final del camino: 81/100
es el techo, y el trío OAuth no está en la lista porque no es un pendiente sino
una decisión. Pasarlo exigiría autenticación real o inventar un servidor que no
existe, y eso rompería a los clientes que se lo creyeran.

Dar de alta el MCP es lo único que decide si esa capa llega a servir de algo:
nadie descubre un servidor MCP por accidente.
