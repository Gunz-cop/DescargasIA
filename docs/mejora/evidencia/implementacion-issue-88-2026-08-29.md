# Evidencia de implementación de #88 · 2026-08-29

Fecha de corte: 2026-08-29 13:25:13 CST (`-06:00`). Worktree:
`codex/issue-88-security-audit`, basado en `origin/main`
`d4aacb20bafc3448aca05f0a8e73d9eca60a0514`.

## Cambios implementados en el worktree

- `worker/csp-report.ts`: receptor first-party en `/api/csp-report`, con
  aceptación de los formatos CSP legado y Reporting API, saneamiento de campos,
  límite de 16 KiB, límite best-effort de 30 solicitudes/minuto/IP, respuesta
  `204` válida y TTL de 30 días en el KV existente `HW_CACHE`.
- `worker/csp.ts` y `worker/index.ts`: `Content-Security-Policy-Report-Only`
  únicamente para respuestas HTML del Worker; no se añadió CSP a
  `public/_headers`.
- `src/scripts/`: scripts propios extraídos de Astro, incluidos anuncios,
  navegación, WebMCP, filtros, movimiento, redirección y eventos de ficha.
  El build usa `assetsInlineLimit: 0` para conservarlos como módulos externos.
- `wrangler.jsonc`: `/api/csp-report` y `/r` pasan por el Worker antes de
  `ASSETS`.

No se retiraron anuncios y no se modificaron APIs, canonical, hreflang ni
robots.

## Pruebas reproducibles

`npm ci`: OK, 0 vulnerabilidades reportadas por npm.

`npm test`: OK — 137 tests MJS pasan, 1 skip existente del test de build y 83
tests TypeScript pasan.

`npm run build`: OK — catalog audit, hardware audit, tests, skills, Astro
build de 204 páginas, 12 tests de build y links audit sin errores. Persisten
seis avisos de enlazado ya existentes: cuatro `x-default` en guías suecas y
dos fichas italianas con cuatro enlaces entrantes.

`npm run agents:skills`: OK.

`git diff --check`: OK en el worktree antes del commit local.

Inventario del `dist` generado: `INLINE_EXECUTABLE=0`; los únicos bloques
inline son datos JSON-LD/JSON no ejecutables.

## Worker local

Con `wrangler dev --local --port 8787`, el 2026-08-29:

- `/`, `/es/ollama` y `/r` respondieron `200` con
  `Content-Security-Policy-Report-Only` y la cabecera `Link` de descubrimiento.
- `/llms.txt` y `/.well-known/agent-card.json` respondieron `200`, con CORS
  abierto según el contrato existente y sin CSP report-only por no ser HTML.
- Un POST válido a `/api/csp-report` respondió `204`, `Cache-Control: no-store`
  y `X-Content-Type-Options: nosniff`, sin `Access-Control-Allow-Origin`.
- Las pruebas del endpoint cubren JSON inválido, content-type inválido, tamaño
  excedido, método inválido y el límite de 30 solicitudes.

## Pruebas de interfaz local

En `127.0.0.1:8787`, con viewport 1280×800 y 360×740, portada, ficha
`/es/ollama` y `/r?t=ollama&p=linux&l=es` conservaron sus slots publicitarios,
el funnel de ficha y el botón de destino del redirect. El ancho del body no
excedió el viewport y no se capturaron errores ni advertencias de consola en
esas cargas.

## Producción y Cloudflare

Medición HTTP de `https://fuenteai.com` el 2026-08-29, después de guardar HSTS
en Cloudflare:

`Strict-Transport-Security: max-age=15552000; includeSubDomains`

La misma cabecera apareció en `/`, `/es/ollama`, `/r`, `/llms.txt` y
`/.well-known/agent-card.json`. `preload` no apareció. `Link` permaneció en las
cinco respuestas. `/llms.txt` y la tarjeta de agente conservaron
`Access-Control-Allow-Origin: *`; no apareció `X-Robots-Tag` en esas dos rutas.
No se observó aún `Content-Security-Policy-Report-Only` en producción porque
el Worker de esta rama no se ha publicado.

HSTS se configuró solo en Cloudflare. Cloudflare no ofrece el literal
`15768000`; su opción visible «6 meses» emitió `15552000` (180 días). El
propietario aceptó expresamente mantener ese valor real. `preload` sigue
condicionado a 12 meses y validación futura de subdominios.

Transform Rules y Managed Transforms se revisaron en Cloudflare: no se observó
una transformación activa de cabeceras de solicitud o respuesta; los controles
de eliminar `X-Powered-by` y agregar encabezados de seguridad estaban
desactivados. Web Analytics/Insights permaneció activo.

## Bloqueo de preview remoto

`wrangler deploy --dry-run` terminó correctamente y mostró las bindings
existentes, sin publicar. El propietario confirmó que `wrangler login` y
`wrangler whoami` funcionan en su terminal interactiva. Desde el proceso de
Codex, una nueva llamada a `wrangler whoami` sigue fallando al contactar la
API por el proxy corporativo. Error exacto observado desde Codex:

`fetch failed`

precedido por `A fetch request failed, likely due to a connectivity issue` y el
aviso `unable to verify the first certificate`. Por ello no se creó una URL
versionada desde esta sesión y no se puede afirmar evidencia remota de CSP,
consola o anuncios de esta implementación.

Para completar el upload, el propietario debe ejecutar en una terminal
interactiva autenticada, dentro de este worktree:

```text
npx wrangler@latest whoami
npx wrangler@latest versions upload --preview-alias issue-88-csp
```

No se solicita ni se versiona ningún token. El upload debe devolver la URL de
preview versionada; después hay que comprobar que la preview lleva
`X-Robots-Tag: noindex` antes de continuar con la validación remota y el PR.

## Reversión

- CSP report-only: retirar el wrapper `withCspReportOnly` o desplegar la versión
  anterior del Worker; la respuesta deja de incluir la cabecera y no se bloquea
  contenido.
- Endpoint: retirar su ruta de `run_worker_first` y el handler del Worker; no
  se borra el KV existente.
- Scripts: restaurar los call sites Astro y retirar los módulos extraídos en un
  commit reversible; no afecta a datos del catálogo.
- HSTS: se revierte desde la configuración de HSTS de Cloudflare, no desde
  `public/_headers`. Los navegadores que ya recibieron HSTS conservan su
  max-age, por lo que cualquier reversión debe coordinarse con soporte HTTPS
  continuo.

No se cierra #88 ni #45: faltan la URL versionada, la evidencia remota de
`report-only`, el período de observación de 30 días y la validación de
reversión ante fallos críticos.
