# Blocker #88 · CSP, HSTS y configuración de Cloudflare

Estado: abierto (CSP en observación pendiente de despliegue; HSTS ya activado).

## Snapshot de auditoría inicial · 2026-08-28

Esta sección conserva el estado observado antes de las decisiones y cambios
posteriores. No describe por sí sola el estado actual.

La auditoría de producción y Cloudflare se realizó en modo de solo lectura y
está fechada en
`docs/mejora/evidencia/auditoria-issue-88-cloudflare-2026-08-28.md`.

Hechos comprobados en ese snapshot:

- `Strict-Transport-Security` y `Content-Security-Policy` no aparecen en `/`,
  `/es/ollama`, `/r`, `/llms.txt` ni `/.well-known/agent-card.json`.
- En Cloudflare, el control `Habilitar HSTS` está desactivado. También está
  desactivado `Usar siempre HTTPS`.
- La zona tiene siete registros DNS: `www.fuenteai.com`, el apex/Worker, dos
  SVCB de agentes y tres TXT; no aparecen otros hosts DNS activos.
- No hay reglas de transformación de cabeceras de solicitud o respuesta. En
  Managed Transforms están desactivados tanto `Eliminar los encabezados
  "X-Powered-by"` como `Agregar encabezados de seguridad`.
- Web Analytics está operativo y mostraba 89 visitas y 89 vistas de página en
  las últimas 24 horas; el Worker muestra registros habilitados y trazas
  deshabilitadas.
- Existe el alias estable de servicio `fuenteai.g1721m.workers.dev` y hay URLs
  ligadas a versiones, pero no se observó un alias estable de preview por
  rama separada de producción.
- Producción carga el beacon
  `static.cloudflareinsights.com/beacon.min.js` y los tres orígenes
  publicitarios documentados. El Native Banner de `/r` estaba presente antes
  de la redirección, pero no se observó el iframe creativo en esa carga; no se
  afirma monetización efectiva con esa sola prueba.

La entrevista del propietario quedó cerrada entre el 2026-08-28 y el
2026-08-29, una pregunta por vez. Las resoluciones están registradas en
`docs/mejora/decisiones.md`; la activación sigue bloqueada hasta completar los
prerrequisitos descritos abajo.

## Estado vigente · 2026-08-29

HSTS ya está activo exclusivamente en Cloudflare con el valor HTTP real
`max-age=15552000; includeSubDomains`; `preload` permanece desactivado. CSP
`report-only` está implementado en esta rama, pero aún no está publicado ni
publicado en producción. La preview versionada y su alias ya fueron validados
remotamente; el blocker continúa abierto por la observación de 30 días y la
validación posterior en producción.

### Implementación posterior · 2026-08-29

- HSTS se activó exclusivamente en Cloudflare después de comprobar el apex y
  `www` por HTTPS y revisar los registros de agentes de la zona. La cabecera
  real en `/`, `/es/ollama`, `/r`, `/llms.txt` y
  `/.well-known/agent-card.json` es `max-age=15552000; includeSubDomains`;
  `preload` permanece desactivado. El propietario aceptó expresamente este
  valor real como la opción de seis meses de Cloudflare, aunque el registro
  anterior usaba el literal `15768000`.
- La implementación de CSP `report-only` y `/api/csp-report` está en el
  worktree y pasa las pruebas locales. El propietario confirmó que `wrangler
  login` y `wrangler whoami` funcionan en su terminal. El intento inicial desde
  Codex falló con `unable to verify the first certificate`, pero el propietario
  publicó después la preview desde su terminal autenticada.
- La validación local confirmó cabecera report-only solo en HTML, `204` para
  un reporte válido, límites de 16 KiB y 30 solicitudes/minuto/IP, saneamiento
  y TTL de 30 días. No se almacenó una IP en claro ni se añadió CSP a
  `public/_headers`.

La parte verificable de #88 está implementada y medida:
`public/_headers` emite `X-Content-Type-Options`, `Referrer-Policy`,
`Permissions-Policy` y `X-Frame-Options` en todas las respuestas de assets, sin
tocar anuncios, funnel, APIs ni superficies de agentes. La evidencia completa
está en `docs/mejora/evidencia-cabeceras-2026-08-28.md`.

Lo que sigue **no se puede cerrar desde el repositorio** y no se improvisa.

## 1. Content-Security-Policy

La CSP se publica en esta etapa solo como `report-only`; el enforcement sigue
fuera de alcance. La política se limita a HTML y usa únicamente orígenes
observados en el inventario de anuncios, Insights y scripts propios.

Motivos, con evidencia:

1. Los `invoke.js` de la red publicitaria eligen sus orígenes en tiempo de
   ejecución. #91 observó `glacierfamilyvivid.com` en una sola sesión; no está
   en el código.
2. Producción inyecta `static.cloudflareinsights.com/beacon.min.js`, que no
   está en el repositorio (#91).
3. Los scripts propios fueron extraídos a módulos externos; el inventario del
   `dist` del 2026-08-29 no contiene scripts ejecutables inline. Los bloques
   JSON-LD y `application/json` son datos y no se ejecutan.
4. Cerrar el inventario requiere observar reportes reales de producción.

### Orden de trabajo para despliegue y observación

1. Publicar el Worker con `/api/csp-report` y verificar en una URL versionada
   que el endpoint responde, sanea y limita los reportes.
2. Publicar `Content-Security-Policy-Report-Only` con una política amplia y
   recoger violaciones **durante un periodo con tráfico real**, incluidos los
   creativos que rotan.
3. Cerrar el inventario de orígenes con esos reportes, no con `grep`.
4. Refactorizar los cinco inline autorizados: extraer lo que sea estable,
   evaluar hashes para bloques deterministas y nonces solo si el Worker puede
   generarlos y propagarlos correctamente. No se acepta `'unsafe-inline'` como
   estado final sin una imposibilidad técnica documentada y una nueva decisión
   del propietario.
5. Sólo entonces, enforcement — y con una vuelta atrás preparada.

### Resoluciones de la entrevista

- Se autoriza una fase CSP `report-only`, sin enforcement inicial.
- Los reportes se reciben exactamente en `/api/csp-report`, un endpoint propio
  del Worker existente. El propietario humano opera el endpoint; la IA solo
  apoya análisis y documentación.
- El propietario humano será el operador inicial; la IA solo apoyará el análisis
  y la documentación.
- No se almacenará el cuerpo crudo completo: solo datos mínimos saneados durante
  los 30 días de observación, con eliminación al finalizar.
- El acceso será privado y exclusivo del propietario humano; no habrá exposición
  pública ni acceso automático de la IA.
- El endpoint tendrá un máximo de 16 KiB por solicitud y 30 solicitudes por
  minuto por IP, sin almacenar la IP; responderá `204` a reportes válidos y
  rechazará entradas inválidas.
- Cloudflare Insights permanecerá activo durante los 30 días de observación
  `report-only`.
- Se autoriza publicar temporalmente la rama en una URL versionada de
  Cloudflare con `X-Robots-Tag: noindex` para validación antes de producción.
- `Content-Security-Policy-Report-Only` se emitirá desde el Worker únicamente
  en respuestas HTML; no se añadirá a `public/_headers`.
- Se observarán 30 días completos antes de valorar enforcement.
- No se acepta degradación del funnel ni de la estructura de anuncios. Se
  toleran fallos aislados de creatives externos que no sean causados por CSP.
- Se revertirá inmediatamente ante el primer fallo confirmado del funnel o de
  un slot publicitario crítico atribuible a CSP.
- Se autoriza refactorizar los cinco scripts inline; `unsafe-inline` no queda
  aprobado como estado final.

## 2. Strict-Transport-Security

La configuración se activó en Cloudflare el 2026-08-29, después de la
validación de los hosts en uso. La respuesta de producción confirma:
`Strict-Transport-Security: max-age=15552000; includeSubDomains`.
`preload` permanece desactivado. Cloudflare no ofrece el literal `15768000` en
el selector; el propietario aceptó el valor real de su opción «6 meses».

HSTS es de las pocas cabeceras que un error deja clavada en los navegadores que
ya la recibieron. Activarla a ciegas desde `_headers` no es hardening, es una
apuesta.

### Resolución de la entrevista y prerrequisitos

El propietario autorizó HSTS en Cloudflare, no en `public/_headers`, con la
opción de seis meses e `includeSubDomains`. La implementación real es
`max-age=15552000`; `preload` queda condicionado a ampliar primero a 12 meses
y validar todos los subdominios. No se activó `preload`.

Antes de activarlo, la siguiente etapa debe comprobar y documentar:

1. si la zona ya emite HSTS y con qué valor;
2. si todos los subdominios en uso sirven HTTPS;
3. que la configuración aplicada coincide con la opción de seis meses y
   `includeSubDomains` aprobada;
4. que `preload` permanece desactivado hasta cumplir su condición;
5. que no existe una segunda declaración contradictoria en
   `public/_headers`.

## 3. Configuración de Cloudflare fuera del repositorio

La skill de Cloudflare se cargó y el panel se consultó con autorización
explícita de solo lectura. La evidencia fechada está en
`docs/mejora/evidencia/auditoria-issue-88-cloudflare-2026-08-28.md`.

Cloudflare Insights permanece activo por decisión del propietario. El endpoint
de reportes CSP será operado por el propietario humano. La superficie de
preview está autorizada como URL versionada y ya fue publicada y validada.
La URL versionada y el alias son los únicos destinos no productivos usados en
esta etapa; ambos devolvieron `X-Robots-Tag: noindex`.

No se observó ninguna Transform Rule ni Managed Transform de cabeceras de
respuesta activa. La regla activa encontrada es una redirección de `www` al
apex y no modifica cabeceras. Si en el futuro aparece una política CSP en la
zona, habrá que medir la respuesta final porque una segunda CSP se intersecta
con la del Worker/assets.

## 4. `frame-ancestors`

`X-Frame-Options: SAMEORIGIN` cubre hoy el anti-framing. Su equivalente moderno,
`frame-ancestors`, exige emitir una cabecera `Content-Security-Policy` y por
tanto entra con el contrato de CSP del punto 1, no antes.

## 5. Propuesta exacta para la etapa de despliegue y observación

1. Mantener sin cambios `public/_headers` durante esta auditoría.
2. Mantener en Cloudflare la opción de HSTS de seis meses (`15552000`),
   `includeSubDomains` y `preload` desactivado.
3. Publicar el Worker con el receptor first-party de reportes CSP y verificar
   en la URL versionada el saneamiento, límite de tamaño, limitación de
   frecuencia, almacenamiento, acceso y retención.
4. Publicar `Content-Security-Policy-Report-Only` amplia y explícita, basada en
   los orígenes reales observados (anuncios, Insights, scripts y destinos
   necesarios), y comprobar que el receptor recibe reportes válidos.
5. Durante 30 días, inventariar violaciones por ruta, origen, script y efecto
   sobre anuncios/funnel; cubrir escritorio, móvil, portada, ficha y `/r`.
6. Refactorizar los cinco scripts inline autorizados, priorizando extracción a
   archivos externos y usando hashes/nonces cuando su ciclo de vida lo permita.
   Repetir la auditoría de origen después de cada cambio relevante.
7. Proponer enforcement solo con evidencia de los 30 días, sin degradación
   crítica y con rollback probado. El cambio debe poder revertirse de inmediato
   si falla el funnel o un slot publicitario crítico.

## 6. Criterios de aceptación de la siguiente etapa

- HSTS aparece desde Cloudflare con la opción real de seis meses
  (`15552000`) e `includeSubDomains`; `preload` sigue apagado y no hay duplicado en
  `public/_headers`.
- El endpoint CSP rechaza cuerpos demasiado grandes, limita abuso, sanea datos
  y documenta retención y acceso; una prueba controlada confirma recepción de
  reportes sin exponer datos sensibles.
- `Content-Security-Policy-Report-Only` se observa en producción sin convertir
  advertencias en bloqueos y sin anunciar un receptor inexistente.
- Se conserva un inventario fechado de reportes durante 30 días completos,
  incluidos cambios de creatives publicitarios.
- Los cinco scripts inline quedan extraídos, con hashes o nonces verificables;
  no se usa `unsafe-inline` como estado final.
- Portada, ficha y `/r` mantienen el funnel y la estructura de anuncios; los
  fallos aislados de creatives externos quedan separados de fallos causados
  por CSP.
- La reversión ante el primer fallo crítico confirmado está probada y no
  requiere una operación destructiva.
- Las cabeceras defensivas existentes y la cabecera `Link` de descubrimiento
  permanecen presentes en las superficies auditadas.

La etapa no puede darse por cerrada mientras falten la URL versionada, la
observación de 30 días y la validación remota del endpoint.

## 7. Comprobación pendiente tras el despliegue

Las cabeceras del PR se midieron contra `wrangler dev --local`; esta auditoría
posterior sí alcanzó producción. Aun así, el proxy/navegador no demuestra por sí
solo la monetización efectiva de cada creativo rotatorio. Tras cualquier
despliegue hay que comprobar en producción, en móvil y escritorio:

1. que portada, ficha y `/r` siguen mostrando anuncios;
2. que las cuatro cabeceras aparecen en portada, ficha, `/r` y las superficies
   de agentes;
3. que la cabecera `Link` de descubrimiento sigue presente;
4. que no aparecen errores de política en consola.

Si algo se rompe, el cambio es una sola línea de `public/_headers` por cabecera:
la vuelta atrás es quitar la línea, no revertir código.

## Lo que este blocker NO afirma

No se declara cumplimiento legal, conformidad normativa ni «sitio seguro» por
haber añadido cuatro cabeceras. Son mitigaciones concretas contra riesgos
concretos, y su alcance es el que describe
`docs/mejora/evidencia-cabeceras-2026-08-28.md`.
