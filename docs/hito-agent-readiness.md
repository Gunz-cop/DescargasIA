# Hito: FuenteAI, del nivel 1 al nivel 4 de preparación para agentes

Registro de qué se hizo, qué costó, qué falló y qué sigue abierto. La guía
operativa del sitio está en `docs/agent-readiness.md`; el método reutilizable en
otro repo, en `.claude/skills/agent-readiness/`.

**Fecha del cierre:** 26 de agosto de 2026.
**Medida:** las 21 comprobaciones de [isitagentready.com](https://isitagentready.com).

| | Antes | Después |
|---|---|---|
| Nivel | 1 — Basic Web Presence | **4 — Agent-Integrated** |
| En verde | 3 | **11** |
| En fallo | 13 | 5 |
| Neutrales / no aplican | 6 | 6 |

De las 5 que siguen en rojo, **una es un fallo corregible** y las otras cuatro
son decisiones tomadas a conciencia o cosas que no aplican. El detalle, abajo.

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

Las cinco comprobaciones en rojo: dos son una decisión de arquitectura, una es
un techo del propio criterio, una es un fallo corregible y una vive fuera del
repo. Se añade `webBotAuth`, que no aplica, aunque es neutral y no penaliza.

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

### `a2aAgentCard` — regresión, y es corregible

Falla con:

> Invalid A2A Agent Card: Missing or empty required field "supportedInterfaces"

**Causa localizada**: el commit `6294d43` ("endurecer endpoints de agentes")
renombró `supportedInterfaces` a `additionalInterfaces` en
`public/.well-known/agent-card.json`. El cambio es defendible —la spec A2A 0.3
usa `additionalInterfaces` junto a `url`/`preferredTransport`— pero el escáner
exige literalmente `supportedInterfaces`.

**Arreglo**: publicar los dos campos. Describen el mismo endpoint real, así que
no hay nada falso en ello. **Es la única de las cinco que sube el nivel a cambio
de una línea.** Pendiente.

### `dnsAid` — fuera del repo y sin validar

Registros DNS bajo `_agents.fuenteai.com` más DNSSEC. El criterio pide claves
experimentales `keyNNNNN` cuyo número no está fijado en ningún sitio público
verificable, e inventarlo sería el dato falso que este trabajo evita. Los
valores propuestos y el procedimiento seguro —publicar solo los `TXT` primero y
leer la evidencia del escáner— están en `docs/agent-readiness.md`.

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

- **`/sitemap.xml` devuelve 404.** Solo existe `sitemap-index.xml`, correctamente
  declarado en `robots.txt`. Tres de cinco tropezaron con esto. Un 301 lo
  resuelve y evita el falso negativo en cualquier auditoría futura. Pendiente.
- **`og:image` genérica** en todas las fichas. No afecta al parsing por agentes;
  sí a la representación en redes. Pendiente.

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
| Añadir `supportedInterfaces` al agent card | Una línea | Recupera `a2aAgentCard` |
| 301 de `/sitemap.xml` → `/sitemap-index.xml` | Una línea | Evita el falso 404 |
| `og:image` por ficha | Medio | Representación en redes |
| DNS-AID: publicar los `TXT` y escanear | Fuera del repo | Posible `dnsAid` |
| Dar de alta el servidor MCP en registros | Bajo | Sin esto, `/mcp` recibe cero llamadas |

Ese último punto es el que decide si la capa 5 sirve de algo. Nadie descubre un
servidor MCP por accidente.
