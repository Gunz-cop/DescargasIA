# Preparación para agentes (agent readiness)

Este documento explica **qué expone FuenteAI a agentes de IA, dónde vive cada
pieza y por qué hay cosas que deliberadamente no publicamos.**

El punto de partida fue el escaneo de <https://isitagentready.com/fuenteai.com>,
que audita 21 comprobaciones repartidas en cinco categorías. Antes de estos
cambios el sitio estaba en **nivel 1 (Basic Web Presence)**: pasaba
`robots.txt` y `sitemap`, y nada más.

Léelo antes de tocar `public/_headers`, `public/robots.txt`,
`public/.well-known/`, `worker/agents/` o `src/utils/agent-content.ts`.

---

## Principio de fondo

**Una sola fuente de verdad.** Todo lo que un agente lee —`/llms.txt`,
`/api/catalog.json`, el espejo Markdown, las herramientas MCP, el agente A2A,
las herramientas WebMCP— se deriva de las mismas colecciones de contenido que
generan las fichas HTML, a través de `src/utils/agent-content.ts`.

Si el agente y la persona leyeran el sitio por caminos distintos, divergirían
en la primera edición de una ficha y el agente empezaría a citar datos que la
página ya no dice.

**Y no se declara lo que no existe.** Un documento de descubrimiento no es una
declaración de intenciones: es un endpoint que otro software va a intentar
usar. Publicar una tarjeta MCP sin servidor, o metadatos OAuth sin servidor de
autorización, no "sube la nota": rompe al cliente que se los cree. Por eso
todo lo que se publica aquí funciona de verdad, y lo que no tenemos se dice en
`/auth.md` y en la tabla del final.

---

## Arquitectura

El sitio sigue siendo un build estático de Astro desplegado como Cloudflare
Workers Assets. Lo nuevo es un Worker **delante** de los assets, que solo hace
lo que un archivo estático no puede hacer:

```
petición
   │
   ├─ /mcp   ──────────────► servidor MCP (Streamable HTTP)
   ├─ /a2a   ──────────────► agente A2A (JSON-RPC)
   ├─ Accept: text/markdown ► espejo /md/**.md
   └─ resto  ──────────────► env.ASSETS.fetch()  (el sitio de siempre)
```

Cualquier excepción del Worker cae también a `env.ASSETS.fetch(request)`: un
fallo en el código de agentes no puede tumbar la web para personas.

### Todo vive en `worker/agents/`, y eso es deliberado

| Archivo | Qué hace |
| --- | --- |
| `worker/agents/index.ts` | `tryAgentRoutes()`: única puerta de entrada. Devuelve `null` si la petición no es suya. |
| `worker/agents/catalog.ts` | Lee `/api/catalog.json` y busca en él. |
| `worker/agents/mcp.ts` | El servidor MCP. |
| `worker/agents/a2a.ts` | El agente A2A. |
| `worker/agents/markdown.ts` | La negociación de contenido. |
| `worker/agents/http.ts` | Política de `Origin` y CORS. |
| `worker/agents/types.ts` | `AgentEnv`: solo pide `ASSETS`. |
| `worker/index.ts` | Router del Worker. Sirve esta capa **y** las rutas `/api/hw/*` de la app de hardware. |

El motivo es de integración. El Worker de la app de hardware (F6/F7) ya
existía, con sus rutas `/api/hw/*`, sus bindings (`AI`, `HW_CACHE`) y su
`worker/security.ts`. Meter esta capa dentro de aquel fichero habría mezclado
dos cosas que no se parecen en el archivo más delicado del despliegue. Con esta
forma, integrarla fueron **dos líneas** en su router:

```ts
const agent = await tryAgentRoutes(request, env);
if (agent) return agent;
```

`AgentEnv` pide solo `ASSETS`, así que el `Env` grande de aquel Worker encaja
sin cambios. Ningún archivo de `worker/agents/` colisiona con los suyos. El
detalle de la convivencia está más abajo.

### `run_worker_first`

En `wrangler.jsonc` hay una lista explícita de rutas que pasan por el Worker
antes que por los assets. Tres detalles que cuestan una tarde si no se saben:

1. **`/mcp` y `/a2a` hay que listarlos aunque no sean archivos.** Con
   `not_found_handling: "404-page"` el router de assets responde el 404 él
   mismo y el Worker no llega a ejecutarse nunca.
2. **Las páginas HTML están en la lista** porque la negociación de contenido
   ocurre sobre URLs que **sí** son un asset. El resto de estáticos
   (`/_astro`, `/fonts`, `/md`, `/api`, `/.well-known`) se sirven sin invocar
   el Worker.
3. **`/sv/*` NO matchea `/sv`.** Cada portada de idioma necesita su entrada
   exacta además del comodín, o devuelve HTML aunque le pidan Markdown. `"/es"`
   es la única excepción: no existe como página, lo recoge el 301 de
   `public/_redirects` hacia `/`.

### La política de `Origin` de `/mcp` y `/a2a`

La spec de MCP Streamable HTTP obliga a validar `Origin` en toda conexión, para
que una página maliciosa abierta en el navegador de la víctima no pueda hacer
POST contra el servidor (DNS rebinding).

**La política no puede ser la de `worker/security.ts`** —exigir que `Origin`
sea el propio sitio— porque los clientes MCP reales (Claude Desktop, los
conectores de ChatGPT, un script) no son navegadores y **no envían `Origin` en
absoluto**: exigirlo dejaría pasar a nadie. La regla, en `worker/agents/http.ts`:

| `Origin` | Respuesta |
| --- | --- |
| ausente | Se permite. Es el cliente MCP normal. |
| igual al sitio | Se permite, y CORS devuelve **ese** origen. |
| cualquier otro | 403, sin ninguna cabecera CORS. |

Nunca se emite `Access-Control-Allow-Origin: *` en estos dos endpoints: un
comodín autorizaría a cualquier página a leer la respuesta desde el navegador
de un tercero, que es justo lo que la validación impide. Los estáticos
(`/api/*`, `/.well-known/*`, `/md/*`) sí lo llevan, y ahí es correcto: son
datos públicos sin efectos.

---

## Qué se publica y dónde

| Recurso | Se genera en | Comprobación que satisface |
| --- | --- | --- |
| `Content-Signal` en `/robots.txt` | `public/robots.txt` | `contentSignals` |
| `Agentmap` en `/robots.txt` | `public/robots.txt` | `ard` (mecanismo secundario) |
| Cabeceras `Link` | `public/_headers` | `linkHeaders` |
| `/llms.txt`, `/llms-full.txt` | `src/pages/llms*.ts` → `agent-content.ts` | — (llmstxt.org) |
| `/api/catalog.json` | `src/pages/api/catalog.json.ts` | base de todo lo demás |
| `/api/openapi.json` | `src/pages/api/openapi.json.ts` | `service-desc` del API Catalog |
| `/md/**.md` | `src/pages/md/[...path].ts` | `markdownNegotiation` |
| `/.well-known/api-catalog` | `public/` (estático) | `apiCatalog` |
| `/.well-known/ai-catalog.json` | `public/` (estático) | `ard` |
| `/.well-known/mcp/server-card.json` | `public/` (estático) | `mcpServerCard` |
| `/.well-known/agent-card.json` | `public/` (estático) | `a2aAgentCard` |
| `/.well-known/agent-skills/index.json` | `scripts/build-agent-skills-index.mjs` | `agentSkills` |
| `/auth.md` | `public/auth.md` | `authMd` |
| Herramientas `navigator.modelContext` | `src/components/WebMcp.astro` | `webMcp` |
| `POST /mcp`, `POST /a2a` | `worker/agents/` | lo que hace reales las tarjetas |

### La cabecera `Link` vive en el único bloque `/*` de `public/_headers`

La cabecera `Link` de descubrimiento es lo que hace que un agente que sólo pide
`GET /` se lleve las cuatro entradas legibles por máquina. Sale de
`public/_headers`, del bloque `/*`, **y ese bloque tiene que seguir siendo uno
solo**.

Las reglas de `_headers` se acumulan entre patrones **distintos** (`/*` y
`/md/*` suman), pero **dos bloques con el patrón idéntico no**: el último gana y
sustituye al anterior. En #88 se comprobó midiendo: al mover unas cabeceras
nuevas a un segundo bloque `/*`, la cabecera `Link` desapareció de todas las
respuestas del sitio y `wrangler` no dio ningún error —sólo contó una regla más.

Si añades una cabecera global, va **dentro** del bloque `/*` que ya existe. Y
después compruébalo por HTTP: `npm run build` y `wrangler dev --local`, y
`curl -sS -D - -o /dev/null http://127.0.0.1:8788/` tiene que seguir mostrando
la cabecera `Link` con las cuatro relaciones. Ver
`docs/mejora/evidencia-cabeceras-2026-08-28.md`.

Las cabeceras defensivas de #88 (`X-Content-Type-Options`, `Referrer-Policy`,
`Permissions-Policy`, `X-Frame-Options`) viven en ese mismo bloque y no alteran
CORS, `X-Robots-Tag` ni la negociación de contenido. Lo que **no** está ahí
—CSP, HSTS y endpoints de reportes— y por qué, está en
`docs/mejora/blockers/F6-security-headers-csp.md`.

### Content Signals

```
Content-Signal: search=yes, ai-input=yes, ai-train=no
```

- `search=yes` — que nos indexen y enlacen, incluidos los buscadores con IA.
- `ai-input=yes` — que nos usen como fuente citada al responder (RAG). Es
  exactamente para lo que existe este directorio.
- `ai-train=no` — que no entrenen modelos con el contenido editorial.

**Es una decisión de negocio, no técnica.** Si mañana se quiere permitir
entrenamiento, se cambia esa línea y nada más.

### El espejo Markdown

`/md/es/chatgpt.md` es la misma ficha que `/es/chatgpt`, sin el shell HTML. Se
llega de dos formas: pidiendo la URL normal con `Accept: text/markdown`, o
pidiendo el `.md` directamente.

- El nombre del archivo lo calcula `markdownPathFor()` en
  `agent-content.ts`, y `worker/agents/markdown.ts` usa una función gemela.
  **Si cambias el patrón de URLs, cambia los dos.**
- Los `.md` van con `X-Robots-Tag: noindex` (`public/_headers`) para no
  competir con el canonical de la página real. El Worker **borra** esa
  cabecera cuando sirve el Markdown bajo la URL normal, que sí es indexable.
- Solo tienen espejo las páginas que salen del catálogo: portadas, fichas y
  categorías. Las legales y el 404 se escriben a mano en `.astro` y no se
  espejan; `hasMarkdownMirror()` evita anunciar en el `<head>` un `.md` que
  daría 404.
- Los rótulos del Markdown están traducidos a los tres idiomas (`L` en
  `agent-content.ts`). Una ficha sueca con etiquetas en español es un
  documento mezclado que el agente le pasaría así al usuario.

### Las dos búsquedas del catálogo

No son la misma función a propósito:

- `searchCatalog()` — **estricta**: exige que aparezcan todos los términos. Es
  la semántica de `search_tools` en MCP, donde quien consulta ya eligió sus
  palabras clave y espera que cada filtro reste.
- `rankCatalog()` — **tolerante y ordenada por relevancia**: basta un término,
  y pesa más la coincidencia por nombre. Es lo que necesita el agente A2A, que
  recibe frases enteras ("qué herramientas hay para generar música"): con la
  estricta, la palabra "herramientas" descartaba justo las buenas.

### Agent Skills

Las skills viven en `public/.well-known/agent-skills/<nombre>/SKILL.md` con
frontmatter `name` + `description`. El índice **no se escribe a mano**: lo
genera `npm run agents:skills` (encadenado en `npm run build`) calculando el
`digest` sha256 de cada archivo. Escrito a mano, el digest se queda obsoleto
en la primera edición.

**El digest depende de los finales de línea.** Se calcula sobre los bytes del
archivo, que es lo que se sirve por HTTP y lo que un cliente vuelve a hashear
para verificarlo. Con `core.autocrlf=true`, un checkout en Windows convierte
LF → CRLF y el mismo repositorio genera un índice distinto: el commiteado y el
regenerado dejan de coincidir, y un cliente que verifique el digest descarta la
skill. Dos barreras:

- `.gitattributes` fuerza `text eol=lf` en `public/.well-known/agent-skills/**`.
- El script **falla** si encuentra CRLF, porque un editor puede guardar así
  antes de que git normalice nada y el fallo sería silencioso.

Para añadir una skill: crea la carpeta con su `SKILL.md` (el `name` del
frontmatter debe coincidir con el nombre de la carpeta) y reconstruye.

---

## Qué NO se publica, y por qué

| Comprobación | Estado | Motivo |
| --- | --- | --- |
| `oauthDiscovery` | No implementada | Requiere un servidor de autorización OAuth/OIDC real. No existe ninguno para este dominio, y publicar `/.well-known/oauth-authorization-server` apuntando a uno inexistente rompe a cualquier cliente que lo lea. |
| `oauthProtectedResource` | No implementada | Declara que un recurso exige OAuth. Los nuestros son públicos y anónimos: sería falso. `/auth.md` documenta explícitamente la ausencia. |
| `webBotAuth` | No implementada (la comprobación es informativa) | Sirve para que **tu** sitio firme las peticiones que **él** envía como bot. FuenteAI no envía peticiones automatizadas a terceros, así que publicar un JWKS sería publicar una clave que no se usa. |
| `dnsAid` | Pendiente, fuera del repo | Son registros DNS, no archivos. Ver abajo. |
| `x402`, `mpp`, `ucp`, `acp`, `ap2` | No aplican | Protocolos de pago agéntico. FuenteAI no vende nada. El escáner los marca `neutral`, no `fail`. |

### DNS-AID: lo que hay que hacer a mano

Estos registros se crean en el panel DNS de Cloudflare. No pueden vivir en el
repo.

**Estado actual, comprobado:**

- DNSSEC **activo y validando** — hay `DS`, las respuestas vienen con `AD: true`
  y los `TXT` llegan firmados con `RRSIG`.
- Los dos `TXT` publicados y leídos: `ard` reporta ahora los **cuatro**
  mecanismos de descubrimiento (`well-known`, `agentmap`, `link-rel`,
  `dns-catalog`), cuando antes eran tres.
- `dnsAid` **sigue en rojo**, y es correcto: ese check **no mira los `TXT`**.
  Solo cuenta `SVCB`/`HTTPS` (`serviceRecordCount: 0`).

```dns
; Ya publicados — ganan el mecanismo dns-catalog de ARD
_index._agents    TXT  "url=https://fuenteai.com/.well-known/ai-catalog.json"
_catalog._agents  TXT  "url=https://fuenteai.com/.well-known/ai-catalog.json"
```

**Lo que falta para `dnsAid`** son los `SVCB`. Una advertencia anterior de este
documento era demasiado conservadora: decía que hacían falta claves
experimentales `keyNNNNN` sin fijar. **Esas claves son para parámetros *custom*,
que son opcionales.** El ejemplo canónico del criterio no lleva ninguno, así que
no hay nada que inventar:

```dns
_mcp._agents          SVCB  1 fuenteai.com. alpn="mcp" port=443 mandatory=alpn,port
_a2a._agents          SVCB  1 fuenteai.com. alpn="a2a" port=443 mandatory=alpn,port
```

En el panel de Cloudflare el tipo `SVCB` pide **Prioridad** (`1`), **Destino**
(`fuenteai.com`) y **Valor** (`alpn="mcp" port=443 mandatory=alpn,port`).

Dos cosas que siguen siendo honestamente inciertas, y por eso se publica y se
mide en vez de darlo por hecho:

1. **`alpn="mcp"` y `alpn="a2a"` no son ALPN reales de TLS.** Ningún servidor
   negocia con ellos: son etiquetas de descubrimiento, y así los usa el ejemplo
   del propio criterio.
2. **La ruta no cabe en el registro.** `SVCB` apunta a host y puerto, no a
   `/mcp`. Ahí sí haría falta un `keyNNNNN`, y ahí sí no se inventa: el agente
   encuentra la ruta por el manifiesto ARD, que es a lo que apuntan los `TXT`.

Tras publicarlos, escanear y leer `details.serviceRecordCount` y
`details.dnssecValidated` — este último sigue reportando `false` pese a que
DNSSEC valida, probablemente porque lo evalúa sobre las respuestas `SVCB`, que
hoy no existen.

## Convivencia con el Worker de la app de hardware

**Ya integrado.** Un solo Worker sirve dos capas que no comparten estado,
bindings ni rutas:

```
petición
   │
   ├─ tryAgentRoutes()  ──► /mcp, /a2a, Accept: text/markdown   (worker/agents/)
   ├─ /api/hw/*         ──► parse, gpu-lookup, explain          (F6/F7)
   └─ resto             ──► env.ASSETS.fetch() + Vary: Accept
```

La capa de agentes va primero porque devuelve `null` en cuanto la petición no
es suya, así que no puede interferir con nada de lo de abajo. `AgentEnv` pide
solo `ASSETS` —con la misma firma que declara el `Env` de hardware— para que
ese `Env` encaje sin modificarlo.

Tres cosas que la integración tuvo que resolver, y que conviene no deshacer:

1. **`/api/hw/*` está en `run_worker_first`.** Sin esa entrada la API de
   hardware **no funciona**: con `not_found_handling: "404-page"` el router de
   assets responde 405 y el Worker no llega a ejecutarse. Comprobado quitando
   la línea: `POST /api/hw/parse` pasa de `200` a `405`.
2. **El router de hardware filtra por `/api/hw/`, no por `/api/`.** El sitio
   publica además `/api/catalog.json` y `/api/openapi.json`, que son assets
   estáticos: el prefijo ancho los convertía en un 405 por GET.
3. **La contención del cuerpo consumido vive en `tryAgentRoutes()`**, no en el
   router. `handleMcp` y `handleA2a` leen el cuerpo de la petición; si dejaran
   escapar una excepción, cualquier `env.ASSETS.fetch(request)` posterior
   lanzaría *"Cannot reconstruct a Request with a used body"* y convertiría un
   error manejable en un 500 sin cuerpo. Al contenerlo dentro del módulo que
   consume el cuerpo, ningún router que integre esta capa tiene que saberlo.
4. **Los cuerpos JSON-RPC están acotados a 64 KiB.** `/mcp` y `/a2a` rechazan
   antes de parsear un `Content-Length` excesivo y vuelven a contar el stream,
   porque esa cabecera puede faltar o mentir. También exigen JSON y la forma
   mínima de JSON-RPC 2.0; MCP rechaza lotes y valida sus cabeceras de
   negociación y versión.

### Cadena de build

```
catalog:audit → hw:audit → npm test → agents:skills → astro build → test:build → links:audit
```

`agents:skills` va **antes** de `astro build`: genera un archivo en `public/`
que Astro copia a `dist/`. En `.github/workflows/ci.yml` hay además un paso que
lo regenera y falla si el índice commiteado estaba desactualizado — un
`SKILL.md` editado sin reconstruir deja el digest mintiendo, y un cliente que
lo verifique descarta la skill.

### Los tests de esta capa

En `tests/agents/`, con `node:test` como el resto del proyecto. Cubren lo que
falló de verdad, no lo que es fácil de probar:

| Fichero | Qué blinda |
| --- | --- |
| `origin.test.mjs` | Los tres casos de `Origin` en `/mcp` y `/a2a`, incluido que el 403 no lleve CORS y que el 200 no devuelva `*`. |
| `markdown.test.mjs` | Las 7 rutas con espejo, portadas incluidas; que el `noindex` no viaje con la URL negociada; que un `Accept` de navegador no dispare Markdown. |
| `catalogo-ilegible.test.mjs` | Un catálogo caído sale como fallo JSON-RPC en MCP y A2A, y no impide el handshake. |
| `cuerpo-consumido.test.mjs` | Que ninguna excepción escape de `/mcp` ni `/a2a` tras leer el cuerpo. |
| `cuerpo-json.test.mjs` | Tipo de contenido, límite real del stream, forma JSON-RPC, mensaje único, `Accept` y versión MCP. |
| `agent-card.test.mjs` | Que el Agent Card sea coherente con A2A 0.3 y declare su interfaz JSON-RPC con los campos correctos. |
| `catalogo-campos.test.mjs` | `safetyNotes` y `faq` presentes y no vacíos en todas las fichas publicadas. |
| `run-worker-first.test.mjs` | La cobertura de `run_worker_first`, que es un fallo de configuración que ningún test de runtime detecta. |

Los módulos del Worker se importan con extensión `.ts` explícita porque Node
los ejecuta directamente (type stripping nativo); esbuild los resuelve igual.

`catalogo-campos.test.mjs` corre **dos veces**, y por un motivo concreto:
`npm test` va antes de `astro build`, así que en un árbol limpio la parte que
mira `dist/api/catalog.json` se saltaba y no se repetía — en CI no llegaba a
ejecutarse nunca. Ahora `npm run test:build` la relanza después del build con
el evento de npm `test:build` (con `REQUIRE_BUILD=1` como alternativa), y en
ese modo la ausencia del catálogo deja de ser un
`skip` y pasa a ser un fallo: un build que dejara de emitirlo habría pasado la
comprobación en silencio.

## Verificar

El escáner audita el sitio **en producción**, así que estos cambios no se
pueden validar hasta después del deploy.

En local, con el sitio construido:

```bash
npm run build
npx wrangler dev --port 8788 --local

curl -sI http://127.0.0.1:8788/ | grep -i link
curl -s -H 'Accept: text/markdown' http://127.0.0.1:8788/es/chatgpt | head
curl -s -X POST http://127.0.0.1:8788/mcp -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
curl -s -X POST http://127.0.0.1:8788/a2a -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"message/send","params":{"message":{"kind":"message","role":"user","messageId":"m","parts":[{"kind":"text","text":"transcribir audio en local"}]}}}'
```

Ya desplegado, el escaneo completo:

```bash
curl -s -X POST https://isitagentready.com/api/scan \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://fuenteai.com","enabledChecks":["robotsTxt","sitemap","linkHeaders","dnsAid","markdownNegotiation","robotsTxtAiRules","contentSignals","webBotAuth","apiCatalog","oauthDiscovery","oauthProtectedResource","authMd","mcpServerCard","a2aAgentCard","agentSkills","webMcp","ard","x402","mpp","ucp","acp"]}'
```

La respuesta trae `level`, `levelName` y, por cada comprobación, `status`,
`message` y la evidencia (URL pedida, código y qué se concluyó). La interfaz
web de isitagentready.com hace exactamente esta petición desde el navegador.
