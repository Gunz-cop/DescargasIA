# Evidencia de privacidad y anuncios · 2026-08-28

## Alcance y método

Auditoría ejecutada desde el worktree de #91, con `origin/main` en
`17ea604dddfd11907f1edc03f5e05147fcb969af`, el 28 de agosto de 2026. Se
comparó el código fuente con el HTML servido por `http://127.0.0.1:4321/`
(Astro dev) y `https://fuenteai.com/` (producción). La observación de
producción se hizo con navegador, sin iniciar sesión ni enviar formularios.

Comandos y comprobaciones reproducibles:

- `rg -n -i 'document\\.cookie|localStorage|sessionStorage|indexedDB|set-cookie' src worker public scripts tests`
- `rg -n 'highperformanceformat|effectivecpmnetwork' src worker public scripts tests`
- inspección DOM de `/`, `/es/chatgpt` y `/r?t=chatgpt&l=es`, antes y después de
  llevar el scroll al final;
- inspección DOM de `/es/privacidad`, `/es/cookies`, `/sv/privacidad`,
  `/sv/cookies`, `/it/privacidad` e `/it/cookies`;
- `curl.exe -sS -D - -o NUL <URL>` contra la portada y cada URL de script
  publicitario.

## Integraciones verificables

| Integración observable | Uso en código | Cuándo se solicita | Resultado observado |
|---|---|---|---|
| `www.highperformanceformat.com/61f98306735e1c9df254c5d978e24994/invoke.js` | Banner `320×50` | `eager` en portada y parte superior de fichas; `IntersectionObserver` en slots inferiores de fichas | El navegador creó un iframe `about:blank` de `320×50` en portada y en la parte superior de la ficha. |
| `www.highperformanceformat.com/1bdd21d4821614421dcf647bc99a473e/invoke.js` | Banner `300×250` | `IntersectionObserver`, margen de `300px`, en mitad de la ficha | No estaba insertado en la primera inspección de la ficha; apareció después de desplazar la página. |
| `pl30788864.effectivecpmnetwork.com/fa1e8876d85c18dfb461e25de7b492d5/invoke.js` | Native Banner | `eager` en `/r` | El `script[src]` quedó presente en `/r`; no se observó un iframe del creativo en esa carga concreta. |
| `static.cloudflareinsights.com/beacon.min.js` | Script observado en producción | Inyectado en la respuesta de producción; no está definido en el repositorio | Apareció en portada, ficha, `/r` y páginas legales de producción; no apareció en Astro dev local. |

El creativo cargado en una inspección de la ficha expuso además un enlace a
`glacierfamilyvivid.com`. Es un destino dinámico observado en esa sesión, no
una atribución estable del proveedor ni una afirmación sobre los datos que
recibe. El navegador también registró mensajes de `accounts.google.com/gsi/client`
en la consola durante una carga de producción; no se pudo demostrar desde el
repositorio qué relación tiene con el creativo y por eso no se clasifica como
proveedor publicitario.

## Páginas y orden de carga

- Portada `/`: `ad-home-top`, banner `320×50`, `eager`; el script se insertó
  durante el render inicial tanto en local como en producción.
- Ficha `/es/chatgpt`: `ad-tool-top-chatgpt` (`eager`) se cargó en la primera
  pantalla. `ad-tool-native-chatgpt` y `ad-tool-mid-chatgpt` reservaron espacio
  sin pedir inicialmente el script; tras desplazar la página, ambos cargaron el
  banner configurado.
- Redirección `/r?t=chatgpt&l=es`: `ad-redirect-native` usa Native Banner con
  carga `eager`.
- Las páginas `/[lang]/privacidad` y `/[lang]/cookies` no incluyen slots de
  publicidad propios; la política describe las integraciones que sí aparecen
  en el resto del sitio.

## Cookies, almacenamiento y consentimiento

La búsqueda estática no encontró escritura propia de cookies. La única lectura
de almacenamiento de la aplicación está en `src/pages/r/index.astro`, donde
`localStorage.getItem('theme')` selecciona el tema si existe. No se encontraron
usos propios de `sessionStorage` ni `indexedDB`.

Las respuestas directas de los tres `invoke.js` devolvieron `HTTP/1.1 200 OK`
con `Content-Type: application/javascript` y, en esa prueba sin contexto de
navegador, `Content-Length: 0`; no apareció una cabecera `Set-Cookie` en la
salida inspeccionada. Eso no demuestra el comportamiento del script dentro del
navegador ni el de solicitudes posteriores.

No se encontró una CMP, un aviso de consentimiento ni una función propia para
aceptar o rechazar anuncios en el código ni en las páginas locales o de
producción revisadas. En consecuencia no existe un antes/después de
consentimiento que pueda medirse honestamente: las integraciones `eager` se
insertan sin depender de una señal propia de consentimiento y las `lazy` se
insertan cuando el slot se acerca al viewport.

## Diferencias entre entornos

- **Local dev:** incluye clientes y toolbar de Vite/Astro y carga los scripts de
  anuncios desde los dominios configurados.
- **Preview:** no había una URL externa de preview configurada en el repositorio.
  La comprobación de preview local debe hacerse con `npm run build` seguido de
  `npm run preview`; su HTML generado no es una prueba de la inyección que
  realiza Cloudflare en producción.
- **Producción:** sirve URLs de assets compilados y añadió
  `static.cloudflareinsights.com/beacon.min.js`, ausente en el código del
  repositorio y en Astro dev.

## Limitaciones y decisión pendiente

Esta auditoría no tiene acceso a paneles, logs ni contratos de los proveedores,
por lo que no puede establecer qué datos reciben, conservan, comparten o usan,
si emplean cookies o identificadores adicionales, ni la duración de ningún
almacenamiento. La herramienta de navegador utilizada no expone una traza de
red cruda y, por seguridad, no se inspeccionaron perfiles, cookies ni
`localStorage` del navegador. El contenido publicitario puede variar por
región, momento, red o bloqueo del navegador.

Queda pendiente una decisión del propietario con revisión legal y datos
verificados del proveedor: jurisdicciones aplicables, si se necesita
consentimiento previo, proveedor/configuración de una CMP, y qué configuración
publicitaria se autoriza. Este documento no declara cumplimiento legal. El
blocker asociado está en
`docs/mejora/blockers/F6.1-privacy-ads-consent.md`.
