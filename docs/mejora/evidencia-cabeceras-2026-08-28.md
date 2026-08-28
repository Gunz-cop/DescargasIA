# Evidencia de cabeceras de seguridad · 2026-08-28

Auditoría e implementación de #88 (deuda detectada por #45). Worktree aislado,
rama `codex/issue-88-security-hardening`, partiendo de `origin/main` en
`e7ebff3` (`fix(#91): alinear privacidad y anuncios`).

Este documento **no declara cumplimiento legal ni conformidad con ninguna
norma**. Describe qué cabeceras emite el sitio, por qué se eligieron esas y no
otras, y qué queda fuera del alcance de lo que se puede verificar desde este
repositorio.

## Método y entorno

Todas las comprobaciones se hicieron contra `wrangler dev --local` en
`http://127.0.0.1:8788` después de `npm ci` y `npm run build`, que es el mismo
montaje con el que #88 reprodujo el hallazgo (Worker de `worker/index.ts`
delante de `dist/` con las reglas de `public/_headers`).

- `curl -sS -D - -o /dev/null <URL>` para cada superficie.
- Chromium con Playwright a 1280×800 y a 360×740 para anuncios, funnel y
  desbordamiento horizontal.

### Limitación del entorno: producción no es alcanzable

`https://fuenteai.com` está bloqueado por el proxy de egreso de esta sesión:

```
curl: (56) CONNECT tunnel failed, response 403
```

Por eso **no hay ninguna medición de producción en este documento**. Todo lo que
depende de producción —HSTS, la inyección de `static.cloudflareinsights.com` que
#91 observó, cualquier regla de zona o Transform Rule de Cloudflare— queda sin
verificar y está recogido en
`docs/mejora/blockers/F6-security-headers-csp.md`.

### Los tres entornos no son intercambiables

| Entorno | Cómo se levanta | Qué demuestra | Qué NO demuestra |
|---|---|---|---|
| Astro dev (`npm run dev`) | Servidor de Vite | El HTML y los scripts que genera el código | Nada sobre `public/_headers`: Vite no aplica ese archivo |
| Local tipo producción (`npm run build` + `wrangler dev --local`) | Worker + assets + `_headers` | Que las reglas de `_headers` se parsean y qué cabecera recibe cada ruta | Nada que añada la red de Cloudflare por configuración de zona |
| Producción (`https://fuenteai.com`) | Cloudflare | Lo anterior más lo que inyecta la zona | — (no medible desde aquí) |

No hay una URL de preview externa configurada en el repositorio; la limitación
ya estaba escrita en `docs/mejora/evidencia-privacidad-anuncios-2026-08-28.md`
y sigue igual.

No existe una skill de Cloudflare en este entorno (las disponibles son
`agent-readiness`, `descargasia-ficha-auditoria`, `descargasia-tool-ficha`,
`sdd-fases` y `verificar-upgrade`). No se ha consultado el panel de Cloudflare
ni se ha inferido su configuración.

## 1. Estado anterior (auditoría)

Confirmado el hallazgo de #88 sobre `e7ebff3`. Ninguna respuesta servida por los
assets llevaba cabecera defensiva:

| Superficie | Cabeceras observadas antes | ¿Defensivas? |
|---|---|---|
| `/` | `Content-Type`, `Cache-Control`, `ETag`, `Link`, `Vary: Accept` | No |
| `/es/ollama` | idem | No |
| `/r?t=ollama&p=web&l=es` | `Content-Type`, `Cache-Control`, `ETag`, `Link` | No |
| `/api/catalog.json` | + `Access-Control-Allow-Origin: *`, `Cache-Control: public, max-age=3600` | No |
| `/llms.txt`, `/llms-full.txt`, `/md/*`, `/.well-known/*` | + CORS abierto; `/md/*` además `X-Robots-Tag: noindex` | No |
| `POST /api/hw/parse` (control positivo) | `Cache-Control: no-store`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: same-origin`, `Permissions-Policy: …` | **Sí** |
| `POST /mcp` | `Vary: Origin`, cabeceras CORS propias | No |

La asimetría tiene una causa concreta: las cabeceras de `/api/hw/*` las pone
`withSecurityHeaders()` en `worker/security.ts`, y esa función sólo envuelve las
respuestas que genera el Worker. Todo lo demás sale de `env.ASSETS.fetch()`, que
sólo aplica `public/_headers`. **`_headers` era el único punto donde podía
añadirse una cabecera a las respuestas HTML**, y no tenía ninguna.

## 2. Inventario de scripts, orígenes y superficies

### Scripts inline propios

| Archivo | Qué hace | Bloquearía una CSP sin `unsafe-inline`/hash |
|---|---|---|
| `src/layouts/BaseLayout.astro` | JSON-LD (`type="application/ld+json"`, no ejecutable) | No |
| `src/layouts/BaseLayout.astro` | quita `no-js` del `<html>` | Sí |
| `src/layouts/BaseLayout.astro` | cierre de menús `<details>` | Sí |
| `src/components/WebMcp.astro` | registra herramientas WebMCP (`navigator.modelContext`) | Sí |
| `src/pages/r/index.astro` | selección de tema antes del primer pintado | Sí |
| `src/pages/r/index.astro` | `<script type="application/json">` con `toolsDb` | No (no ejecutable) |
| `src/components/AdSlot.astro` | `atOptions = …` y el cargador `IntersectionObserver` de los slots lazy | Sí |

Son siete bloques inline, cinco de ellos ejecutables, y tres de esos cinco
llevan datos generados en build (`define:vars`), así que su hash cambia con el
contenido de cada página.

### Orígenes de terceros

| Origen | De dónde sale | Cargado en |
|---|---|---|
| `www.highperformanceformat.com` | `src/components/AdSlot.astro` | Portada (eager) y ficha (1 eager + 2 lazy) |
| `pl30788864.effectivecpmnetwork.com` | `src/components/AdSlot.astro` | `/r` (Native Banner, eager) |
| `static.cloudflareinsights.com` | **No está en el repositorio.** Observado en producción por #91 | Producción |
| `linkzip.uk` | `src/linkzip-cache.json`, destino de navegación de `/r` | Navegación, no subrecurso |

`https://schema.org` y `https://webmachinelearning.github.io` aparecen en el
código como identificadores de vocabulario y de especificación; no se solicitan.

**El inventario no está cerrado y no puede estarlo desde aquí.** #91 ya observó
que un creativo servido en una sola sesión expuso `glacierfamilyvivid.com`, un
destino dinámico que no está en el código, y registró mensajes de
`accounts.google.com/gsi/client` en consola sin poder atribuirlos. Los `invoke.js`
de una red publicitaria eligen en tiempo de ejecución qué cargar.

### `<iframe>`

No hay ninguno propio: `grep '<iframe'` sobre `src/` y `public/` no devuelve
nada. Los que existen en la página los **crea el script del anunciante** (#91
observó un iframe `320×50` en portada y ficha). `AdSlot.astro` los contiene con
alto fijo y `overflow-hidden` para que no empujen el layout.

### Superficies de agentes

`/llms.txt`, `/llms-full.txt`, `/md/*`, `/api/catalog.json`,
`/api/openapi.json`, `/.well-known/*`, `/mcp` y `/a2a`, más la cabecera `Link`
de descubrimiento que `_headers` emite en todo el sitio. Ver
`docs/agent-readiness.md`.

## 3. Hallazgo del proceso: dos bloques `/*` no se suman

La primera versión del cambio puso las cabeceras defensivas en un **segundo**
bloque `/*`, dejando intacto el bloque `/*` que ya emitía la cabecera `Link`.

Resultado medido: las cuatro cabeceras defensivas aparecieron, y **la cabecera
`Link` de descubrimiento desapareció de todas las respuestas del sitio**. De 19
superficies probadas, ninguna la conservaba salvo la negociación Markdown, que
la reescribe en el Worker. `wrangler` no avisó: pasó de «12 valid header rules»
a «13» sin error.

La regla real es que la acumulación vale entre patrones **distintos** (`/*` y
`/md/*` sí suman); dos bloques con el patrón idéntico no: el último gana. El
comentario de cabecera de `public/_headers` decía «las reglas se acumulan», que
es cierto pero incompleto, y esa lectura habría roto en silencio el
descubrimiento por cabecera para agentes.

Corrección aplicada: **un único bloque `/*`** con `Link` y las cuatro cabeceras
juntas, y el aviso escrito en el propio archivo para quien añada la siguiente.

## 4. Contrato adoptado

En `public/_headers`, bloque `/*`, aplicable a toda respuesta servida por los
assets:

```
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
X-Frame-Options: SAMEORIGIN
```

**`X-Content-Type-Options: nosniff`.** Toda respuesta del sitio declara su
`Content-Type` —las rutas sin extensión lo declaran explícitamente más abajo en
el mismo archivo— así que nada depende del sniffing. Comprobado que los tipos
que un `nosniff` podría hacer fallar siguen siendo correctos:
`/_astro/*.js` → `text/javascript; charset=utf-8`, `/_astro/*.css` →
`text/css; charset=utf-8`, `/fonts/*.woff2` → `font/woff2`. Es la misma cabecera
que ya emitía `worker/security.ts`.

**`Referrer-Policy: strict-origin-when-cross-origin`.** Coincide con el valor
por defecto de los navegadores actuales: hacerla explícita no recorta nada
respecto a lo que el sitio envía hoy, sólo deja de depender del navegador. Se
descartaron `same-origin` y `no-referrer` —el valor que usa la API— porque
dejarían sin `Referer` al destino oficial al que sale `/r` (hoy vía
`linkzip.uk`) y a las peticiones de la red publicitaria. Cambiarlo a un valor
más restrictivo es **una decisión de monetización**, no de hardening, y no se
toma aquí.

**`Permissions-Policy: geolocation=(), microphone=(), camera=()`.** Lista corta
y deliberada: son tres capacidades que el sitio no usa en ningún punto y que
ningún formato de banner necesita para renderizar. **Se deja intacto todo lo que
sí podría afectar al negocio**: no se declaran `attribution-reporting`,
`browsing-topics` ni `interest-cohort` (medición publicitaria) ni `webgpu`, que
usa `src/lib/browser/detect.ts` para detectar la GPU en la app de hardware.
Añadir una lista larga «por completitud» es exactamente cómo se apaga un ingreso
sin enterarse. Es la misma trinca que ya usaba `worker/security.ts`.

**`X-Frame-Options: SAMEORIGIN`.** El sitio no se enmarca a sí mismo en ningún
punto, así que `SAMEORIGIN` no restringe nada que exista hoy y deja margen si
algún día se enmarca a sí mismo. La cabecera gobierna **quién puede enmarcar a
FuenteAI**, no lo que FuenteAI enmarca: los iframes que crea el script del
anunciante dentro de la página no se ven afectados, y así se comprobó. Su
equivalente moderno, `frame-ancestors`, exige emitir una cabecera
`Content-Security-Policy` y queda dentro del contrato de CSP del blocker.

`worker/security.ts` **no se toca**: `/api/hw/*` conserva su propio juego, más
estricto (`X-Frame-Options: DENY`, `Referrer-Policy: same-origin`,
`Cache-Control: no-store`), porque es una API que nadie debe enmarcar ni cachear.
`public/_headers` no alcanza a esas respuestas.

### Lo que deliberadamente NO se añade

| Cabecera | Motivo |
|---|---|
| `Content-Security-Policy` | Ver §5 |
| `Content-Security-Policy-Report-Only` | Sin un sitio donde observar los reportes no produce evidencia; sería una cabecera decorativa |
| `report-to` / `report-uri` / `Reporting-Endpoints` | No existe endpoint de reportes en este repositorio. No se declara uno que no responda |
| `Strict-Transport-Security` | No verificable desde local ni preview, y su `max-age` no se revierte fácil. Se decide sobre producción real |
| `Cross-Origin-Opener-Policy`, `Cross-Origin-Embedder-Policy` | `COEP` rompería la carga de los creativos de terceros; `COOP` afecta a ventanas abiertas desde el anuncio. Ninguna es necesaria hoy y ambas tocan la monetización |

## 5. Por qué no hay CSP

No es que falte tiempo: **no se puede escribir una lista de permitidos correcta
desde este repositorio**, y una CSP incompleta apaga los anuncios.

1. Los `invoke.js` de la red publicitaria deciden en tiempo de ejecución qué
   orígenes cargar. #91 ya observó uno (`glacierfamilyvivid.com`) que no está en
   el código, en una sola sesión.
2. Producción inyecta `static.cloudflareinsights.com/beacon.min.js`, que tampoco
   está en el repositorio y cuyo origen depende de la configuración de la zona.
3. Los cinco scripts inline ejecutables obligarían a `'unsafe-inline'` (que
   vacía buena parte del valor de la directiva) o a hashes; tres de ellos llevan
   datos de build, así que su hash cambia por página.
4. Cerrar el inventario exige observar reportes reales de producción, y hoy no
   hay dónde observarlos.

Escribir una CSP aquí sería inventarla. Queda en
`docs/mejora/blockers/F6-security-headers-csp.md` con el orden de trabajo
—endpoint de reportes primero, report-only después, enforcement al final— y las
decisiones que hay que tomar antes.

## 6. Verificación posterior al cambio

`wrangler dev --local` con el `dist/` recién construido: «✨ Parsed 12 valid
header rules» (mismo número que antes: el bloque `/*` sigue siendo uno solo).

**21 superficies probadas por HTTP** — `/`, `/es/ollama`, `/sv`, `/it/chatgpt`,
`/es/hardware`, `/r?t=ollama&p=web&l=es`, `/api/catalog.json`,
`/api/openapi.json`, `/llms.txt`, `/llms-full.txt`, `/md/es/ollama.md`,
`/.well-known/api-catalog`, `/.well-known/ai-catalog.json`,
`/.well-known/agent-card.json`, `/.well-known/mcp/server-card.json`,
`/robots.txt`, `/og/default-es.png`, `/auth.md`, `/sitemap-index.xml`, `/` con
`Accept: text/markdown` y una URL inexistente (404):

- 21/21 con las cuatro cabeceras del contrato, el 404 incluido;
- 20/21 conservan la cabecera `Link` de descubrimiento. La excepción es la
  negociación Markdown, donde el Worker la sustituye por
  `Link: <…>; rel="canonical"`; ese comportamiento **ya existía antes del
  cambio** y no lo introduce esta rama;
- CORS abierto intacto en `/llms.txt`, `/llms-full.txt`, `/md/*`,
  `/api/catalog.json`, `/auth.md` y las cinco rutas `/.well-known/*` probadas;
- `X-Robots-Tag: noindex` intacto en `/md/*`;
- `POST /api/hw/parse` con `Origin` ajeno sigue devolviendo `403
  origin_not_allowed` con su juego propio de cabeceras, sin cambios;
- `POST /mcp` responde `200` con sus cabeceras CORS propias, sin cambios.

No se ha modificado `public/robots.txt`, ningún canonical, ningún `hreflang`,
`src/utils/agent-content.ts` ni `worker/agents/`.

### Anuncios y funnel, en navegador real

Chromium, a 1280×800 y a 360×740, con resultado **idéntico en ambos**:

| Comprobación | Resultado |
|---|---|
| Peticiones a hosts publicitarios | `www.highperformanceformat.com` y `pl30788864.effectivecpmnetwork.com` — el navegador **sí las emite** |
| Portada | 1 slot, 1 `script[src]` de anuncio insertado en el render inicial |
| Ficha `/es/ollama` | 3 slots; 1 script eager al cargar; 3 tras desplazar → los slots lazy siguen disparando |
| `/r` | Native Banner presente; destino «ollama.com»; cuenta atrás corriendo; botón a `https://linkzip.uk/a7x7x`; caja de error oculta; `<html lang>` = `es` |
| `/r` con `t=no-existe` | muestra la caja de error, como debe |
| Eventos de funnel (`fuenteai:funnel`) | `ficha_view:ollama:web` y `redirect_start:ollama:web` |
| Peticiones propias fallidas | ninguna |
| Desbordamiento horizontal | ninguno, ni en portada ni en ficha, a 360 px |

Los únicos errores de consola son `net::ERR_TUNNEL_CONNECTION_FAILED` contra los
hosts publicitarios: **el proxy de egreso de esta sesión bloquea esos dominios**.
Ese error es precisamente la prueba que interesa —el navegador intentó la
conexión de red y falló en el túnel—; una cabecera que bloqueara el anuncio
habría impedido que la petición saliera y habría dado un error de política, no
de túnel. Aun así, **que el creativo se pinte y monetice en producción no queda
demostrado aquí**; queda como comprobación pendiente tras el despliegue,
recogida en el blocker.

## 7. Comprobación reproducible

`tests/security-headers.test.mjs` lee `public/_headers` como contrato y entra en
la suite de `npm test`, que `npm run build` encadena. Fija lo que debe estar y,
sobre todo, lo que no puede aparecer sin cerrar antes el blocker: una CSP, una
CSP report-only, un `report-to`/`report-uri`, HSTS, un `Referrer-Policy` que
deje al destino sin origen, o una `Permissions-Policy` que toque
`attribution-reporting`, `browsing-topics`, `interest-cohort` o `webgpu`.
También comprueba que la cabecera `Link` de descubrimiento sigue en el archivo y
que `worker/security.ts` conserva su juego propio.

Es una prueba de contrato sobre el archivo, no una comprobación HTTP: la
comprobación HTTP es la de §6 y hay que repetirla a mano contra
`wrangler dev --local` si se toca `public/_headers` o el enrutado del Worker.

## 8. Lo que este documento no demuestra

- Nada sobre producción: no fue alcanzable desde esta sesión.
- Que los creativos publicitarios se pinten y moneticen tras el despliegue.
- El inventario completo de orígenes que carga la red publicitaria.
- Ninguna afirmación de cumplimiento legal o normativo.
