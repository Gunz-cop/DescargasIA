# Auditoría de producción y Cloudflare · issue #88 · 2026-08-28

Auditoría de solo lectura realizada el 2026-08-28 entre las 17:08 y las
17:24 CST (UTC−06:00), desde el worktree
`codex/issue-88-security-audit`, basado en `origin/main` en `d4aacb2`.

No se modificaron cabeceras, reglas, DNS, Workers, Analytics ni despliegues.
Esta evidencia no declara cumplimiento legal ni conformidad normativa.

## Producción HTTP

Se solicitaron `GET`/cabeceras con `curl.exe -sS -D - -o NUL`:

- `https://fuenteai.com/`
- `https://fuenteai.com/es/ollama`
- `https://fuenteai.com/r?t=ollama&p=web&l=es`
- `https://fuenteai.com/llms.txt`
- `https://fuenteai.com/.well-known/agent-card.json`
- `https://www.fuenteai.com/` y `http://www.fuenteai.com/`

Las cinco primeras respondieron `HTTP/1.1 200 OK`, salvo que `www` responde
`301 Moved Permanently` hacia `https://fuenteai.com/`. El apex HTTP respondió
`200 OK` en esta medición; no se deduce de eso ninguna política de HSTS.

En `/`, `/es/ollama`, `/r`, `/llms.txt` y `/.well-known/agent-card.json` se
observaron:

```text
permissions-policy: geolocation=(), microphone=(), camera=()
referrer-policy: strict-origin-when-cross-origin
x-content-type-options: nosniff
x-frame-options: SAMEORIGIN
```

No se observó `Strict-Transport-Security` ni `Content-Security-Policy` en
ninguna de esas respuestas. Cloudflare añadió `Report-To` y `Nel` con destino
`a.nel.cloudflare.com`; esa cabecera corresponde a la telemetría NEL de
Cloudflare y no demuestra un endpoint de reportes CSP.

## Orígenes y funcionamiento observado

En HTML de producción, el navegador observó:

- `https://www.highperformanceformat.com/61f98306735e1c9df254c5d978e24994/invoke.js`
  en portada y ficha.
- `https://www.highperformanceformat.com/1bdd21d4821614421dcf647bc99a473e/invoke.js`
  en el slot intermedio de la ficha.
- `https://pl30788864.effectivecpmnetwork.com/fa1e8876d85c18dfb461e25de7b492d5/invoke.js`
  en `/r`.
- `https://static.cloudflareinsights.com/beacon.min.js/v3d52b47920f24c319d37e2661827c42b1787588026925`
  en producción, ausente del repositorio.

Los tres `invoke.js` publicitarios respondieron `HTTP 200` desde esta sesión.
La portada mostró un slot visible; la ficha mostró tres slots y conservó el
slot lazy tras desplazamiento. `/r` mostró el Native Banner y el flujo de
redirección a `ollama.com`; tras 1,5 segundos la navegación ya había salido de
`/r`, por lo que no se afirma que el iframe creativo se haya pintado en esa
carga concreta. No se observó un error de consola del navegador en esa prueba.

Los scripts inline ejecutables observados incluyen el cargador de anuncios, el
registro WebMCP, la eliminación de `no-js`, la gestión de menús y la lógica de
`/r`; algunos incorporan datos generados por página. No se añade CSP sobre esta
base incompleta.

## Cloudflare, leído en el panel

### HSTS y hosts

En `SSL/TLS → Certificados de perímetro`, el control visible es `Habilitar
HSTS`; no está habilitado. El control `Usar siempre HTTPS` también aparece
desactivado. La zona muestra certificados activos para `*.fuenteai.com` y
`fuenteai.com`, pero la existencia del certificado wildcard no prueba que cada
subdominio tenga un servicio operativo.

La tabla DNS muestra exactamente siete registros: `www.fuenteai.com` como CNAME
proxied al apex; el apex como Worker `fuenteai`; los TXT de verificación y
catálogo de agentes; y los SVCB `_mcp._agents.fuenteai.com` y
`_a2a._agents.fuenteai.com`. No aparecen otros hosts DNS activos en la zona.

Esto aporta evidencia para decidir `includeSubDomains`, pero no toma esa
decisión por el propietario.

### Transform Rules y Managed Transforms

En `Rules → Información general`:

- `Reglas de transformación de encabezados de solicitudes`: ninguna creada.
- `Reglas de transformación de encabezados de respuestas`: ninguna creada.
- Existe una regla activa de redirección de `www.fuenteai.com` al apex; no es
  una regla de cabeceras.

En `Transformaciones administradas`, `Eliminar los encabezados
"X-Powered-by"` y `Agregar encabezados de seguridad` aparecen deshabilitados.
No se observó una transformación administrada activa que modifique cabeceras
de respuesta.

### Insights y preview

En `Análisis web → Web Analytics` hay datos para `fuenteai.com` en las últimas
24 horas: 89 visitas y 89 vistas de página en el panel observado. El panel
muestra además datos de Core Web Vitals. En el Worker `fuenteai`, la vista de
información general muestra `Registros de Workers` habilitados y `Trazas de
Workers` deshabilitadas. Esto demuestra que Web Analytics está operativo y que
la distribución inyecta el beacon observado; no identifica por sí solo el
responsable editorial de esa activación.

El Worker expone el alias estable de servicio
`https://fuenteai.g1721m.workers.dev/` y el dominio personalizado
`https://fuenteai.com/`. El historial también expone URLs ligadas a versiones,
por ejemplo `https://a8a0db2d-fuenteai.g1721m.workers.dev/`, que respondió
`200 OK` y `X-Robots-Tag: noindex`. Son URLs de versión, no un alias estable
de preview por rama. En el panel y en el repositorio no se observó una URL de
preview estable separada de producción.

## Resoluciones posteriores a la auditoría

La entrevista del propietario, realizada una pregunta por vez el 2026-08-28,
resolvió lo siguiente: HSTS se autoriza después de la auditoría y solo en
Cloudflare, con `max-age=15768000` e `includeSubDomains`; `preload` queda
condicionado a 12 meses y validación de todos los subdominios. CSP se autoriza
solo en `report-only`, con un endpoint first-party del Worker y 30 días de
observación. No se acepta degradación del funnel ni de la estructura de
anuncios, se permite tolerar fallos aislados de creatives externos no causados
por CSP y se autoriza rollback inmediato ante el primer fallo crítico
confirmado. Se autoriza refactorizar los cinco scripts inline; `unsafe-inline`
no queda aprobado como estado final.

Siguen sin decidirse el operador del endpoint CSP, su almacenamiento/retención
y la continuidad de Cloudflare Insights. Tampoco se observó un alias estable de
preview por rama; debe acordarse una superficie de prueba antes de implementar.
