# Blocker #88 · CSP, HSTS y configuración de Cloudflare

Estado: abierto.

La parte verificable de #88 está implementada y medida:
`public/_headers` emite `X-Content-Type-Options`, `Referrer-Policy`,
`Permissions-Policy` y `X-Frame-Options` en todas las respuestas de assets, sin
tocar anuncios, funnel, APIs ni superficies de agentes. La evidencia completa
está en `docs/mejora/evidencia-cabeceras-2026-08-28.md`.

Lo que sigue **no se puede cerrar desde el repositorio** y no se improvisa.

## 1. Content-Security-Policy

No se escribe una CSP porque no se puede escribir una correcta desde aquí, y una
incompleta apaga los anuncios —que #87 fijó como fuente de monetización que no
se retira.

Motivos, con evidencia:

1. Los `invoke.js` de la red publicitaria eligen sus orígenes en tiempo de
   ejecución. #91 observó `glacierfamilyvivid.com` en una sola sesión; no está
   en el código.
2. Producción inyecta `static.cloudflareinsights.com/beacon.min.js`, que no
   está en el repositorio (#91).
3. Hay cinco bloques de script inline ejecutables
   (`BaseLayout.astro` ×2, `WebMcp.astro`, `r/index.astro`, `AdSlot.astro`);
   tres llevan datos de build, así que su hash cambia por página. Una CSP
   viable hoy exigiría `'unsafe-inline'`, que vacía buena parte de la
   directiva.
4. Cerrar el inventario requiere observar reportes reales de producción.

### Orden de trabajo si se autoriza

1. Decidir dónde se reciben los reportes (`report-to`/`Reporting-Endpoints`) y
   levantarlo. **Sin esto no se avanza**: `report-only` sin destino no produce
   evidencia y una cabecera con un endpoint que no responde es peor que
   ninguna.
2. Publicar `Content-Security-Policy-Report-Only` con una política amplia y
   recoger violaciones **durante un periodo con tráfico real**, incluidos los
   creativos que rotan.
3. Cerrar el inventario de orígenes con esos reportes, no con `grep`.
4. Decidir qué hacer con los inline: hashes por página, `nonce` (exige generar
   la cabecera en el Worker, no en `_headers`) o mantener `'unsafe-inline'`
   documentado como límite consciente.
5. Sólo entonces, enforcement — y con una vuelta atrás preparada.

### Decisión necesaria del propietario

- ¿Se autoriza levantar un endpoint de reportes y quién lo opera?
- ¿Se acepta el riesgo de que una fase de enforcement pueda degradar ingresos
  publicitarios, y con qué criterio se revierte?
- ¿Se acepta `'unsafe-inline'` como estado final si los hashes por página
  resultan inviables, o se refactorizan los cinco inline?

## 2. Strict-Transport-Security

No se activa. `https://fuenteai.com` no era alcanzable desde la sesión de #88
(`curl: (56) CONNECT tunnel failed, response 403`), así que no se pudo observar
si la zona ya la emite, con qué `max-age`, ni si hay subdominios que dejarían de
servirse por HTTP.

HSTS es de las pocas cabeceras que un error deja clavada en los navegadores que
ya la recibieron. Activarla a ciegas desde `_headers` no es hardening, es una
apuesta.

### Decisión necesaria

Alguien con acceso a producción y al panel de Cloudflare debe comprobar y
documentar:

1. si la zona ya emite HSTS y con qué valor;
2. si todos los subdominios en uso sirven HTTPS;
3. `max-age` inicial, y si se quiere `includeSubDomains` o `preload` —`preload`
   es prácticamente irreversible;
4. dónde se declara: `public/_headers` o configuración de zona. Declararla en
   los dos sitios con valores distintos es una fuente de confusión garantizada.

## 3. Configuración de Cloudflare fuera del repositorio

No hay skill de Cloudflare en el entorno de esta sesión y no se consultó el
panel. Queda sin verificar, y **no se infiere**:

- qué inyecta `static.cloudflareinsights.com/beacon.min.js` y si está activado a
  propósito (afecta a cualquier CSP futura y ya lo describen las políticas
  ES/SV/IT tras #91);
- si existen Transform Rules o Managed Transforms que añadan o quiten cabeceras
  de respuesta. Si las hay, pueden duplicar o contradecir lo que declara
  `public/_headers`, y dos cabeceras `Content-Security-Policy` en una misma
  respuesta se intersecan, no se sustituyen;
- si hay una URL de preview estable donde probar cabeceras antes de producción.
  Hoy no la hay en el repositorio.

## 4. `frame-ancestors`

`X-Frame-Options: SAMEORIGIN` cubre hoy el anti-framing. Su equivalente moderno,
`frame-ancestors`, exige emitir una cabecera `Content-Security-Policy` y por
tanto entra con el contrato de CSP del punto 1, no antes.

## 5. Comprobación pendiente tras el despliegue

Las cabeceras se midieron contra `wrangler dev --local`. El proxy de egreso de
la sesión bloquea los dominios publicitarios, así que **no está demostrado que
los creativos se pinten y moneticen en producción con estas cabeceras**. Tras
desplegar hay que comprobar en producción, en móvil y escritorio:

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
