# Preparación para agentes (agent readiness)

Este documento explica **qué expone FuenteAI a agentes de IA, dónde vive cada
pieza y por qué hay cosas que deliberadamente no publicamos.**

El punto de partida fue el escaneo de <https://isitagentready.com/fuenteai.com>,
que audita 21 comprobaciones repartidas en cinco categorías. Antes de estos
cambios el sitio estaba en **nivel 1 (Basic Web Presence)**: pasaba
`robots.txt` y `sitemap`, y nada más.

Léelo antes de tocar `public/_headers`, `public/robots.txt`,
`public/.well-known/`, `worker/index.ts` o `src/utils/agent-content.ts`.

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
Workers Assets. Lo nuevo es un Worker **delante** de los assets
(`worker/index.ts`, declarado en `wrangler.jsonc` con `main`), que solo hace
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

### `run_worker_first`

En `wrangler.jsonc` hay una lista explícita de rutas que pasan por el Worker
antes que por los assets. Dos detalles que cuestan una tarde si no se saben:

1. **`/mcp` y `/a2a` hay que listarlos aunque no sean archivos.** Con
   `not_found_handling: "404-page"` el router de assets responde el 404 él
   mismo y el Worker no llega a ejecutarse nunca.
2. **Las páginas HTML están en la lista** porque la negociación de contenido
   ocurre sobre URLs que **sí** son un asset. El resto de estáticos
   (`/_astro`, `/fonts`, `/md`, `/api`, `/.well-known`) se sirven sin invocar
   el Worker.

`"/es"` sin barra queda fuera a propósito: lo resuelve el 301 de
`public/_redirects`.

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
| `POST /mcp`, `POST /a2a` | `worker/index.ts` | lo que hace reales las tarjetas |

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
  `agent-content.ts`, y el Worker usa una función gemela. **Si cambias el
  patrón de URLs, cambia los dos.**
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

### Las dos búsquedas del Worker

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

### DNS-AID: lo único que hay que hacer a mano

Estos registros se crean en el panel DNS de Cloudflare de `fuenteai.com`. No
pueden vivir en el repo. Publican los mismos endpoints que ya sirve el Worker:

```dns
_mcp._agents.fuenteai.com.     3600 IN HTTPS 1 fuenteai.com. alpn="h2" port=443
_a2a._agents.fuenteai.com.     3600 IN HTTPS 1 fuenteai.com. alpn="h2" port=443
_index._agents.fuenteai.com.   3600 IN TXT   "url=https://fuenteai.com/.well-known/ai-catalog.json"
_catalog._agents.fuenteai.com. 3600 IN TXT   "url=https://fuenteai.com/.well-known/ai-catalog.json"
```

Firmar la zona con DNSSEC es parte de la comprobación. Cloudflare lo activa
desde DNS → Settings → DNSSEC.

---

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
