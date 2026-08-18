# Validation

Corré estos checks antes de dar el lote por terminado.

## 1. Integridad del catálogo

```bash
npm run catalog:audit
```

Sale con código 1 si algo del contenido no va a renderizarse. Detecta lo que Astro deja pasar en silencio: una ficha de `tools-base` sin ninguna traducción (`getTranslatedTools()` hace `return null` y no se publica en ningún idioma), un `tools/<lang>/<slug>.json` sin su base (se ignora entero), un slug de `alternatives` inexistente (`getAlternatives()` lo descarta sin avisar) y categorías que no están en `CATEGORIES` de `src/utils/brand.ts`.

Los avisos van agrupados y **no** son errores; `npm run catalog:audit -- --verbose` los lista completos. Los tres grupos que importan al cerrar un lote:

- **Relaciones editoriales que se pierden por falta de traducción**: la alternativa que elegiste no existe en ese idioma. El bloque no queda corto —el relleno rotado lo completa— pero tu pareja editorial se pierde ahí. Aceptalo explícitamente o elegí una alternativa que sí exista en ese locale.
- **Fichas que nadie cita en `alternatives`**: dependen solo del relleno rotado para recibir enlaces internos. Si acabás de crear una, citala desde 2-3 fichas afines.
- **Categorías con poca cobertura**: menos de 6 fichas traducidas en un idioma. Es la lista de qué conviene traducir a continuación.

No hace falta enlazar nada a mano: el enlazado interno se deriva del catálogo. Ver `docs/enlazado-interno.md`.

## 2. Build

```bash
npm run build
```

`npm run build` encadena cuatro pasos (mirá `package.json`): `shorten`, `catalog:audit`, `astro build` y `links:audit`. Las dos auditorías salen con código 1 ante un error duro, así que un build que pasa significa que ninguna ficha falló en silencio y que no se rompió ningún enlace interno, canonical ni hreflang.

**Aviso importante sobre `shorten`**: El paso `shorten` corre `scripts/shorten-official-links.mjs`, que si `LINKZIP_ENABLED=true` en `.env` (y hay `LINKZIP_API_KEY`), va a llamar a la API real de linkzip.uk para acortar cualquier URL nueva que no esté todavía en `src/linkzip-cache.json`. Esto:

- genera enlaces cortos reales (no es un dry-run) — cada URL nueva de una plataforma o `officialWebsite` que agregues va a consumir una llamada real a la API;
- tarda un poco más por el delay entre llamadas (`LINKZIP_DELAY_MS`, 1500ms por defecto);
- si falla la API o no hay conexión, el script no rompe el build — solo loggea el error y sigue. Reportalo igual al usuario como riesgo operativo si pasa.

Si preferís no disparar la llamada real (por ejemplo, mientras iterás contenido y no querés generar enlaces cortos todavía), usá `npm run build:no-shorten`, que salta el acortador pero mantiene las dos auditorías.

Si `shorten` sí generó enlaces cortos nuevos, `src/linkzip-cache.json` queda modificado: **hay que commitearlo**. Si no, cada build de CI vuelve a pedir enlaces nuevos para las mismas URLs y genera duplicados en cada deploy.

El build debe pasar sin errores. Revisá que las páginas nuevas (`/es/<slug>/index.html`) aparezcan en el output, y leé el resumen de `links:audit`: informa el mínimo, la media y el máximo de enlaces internos entrantes por ficha, y avisa de las que quedan por debajo del umbral.

## 3. Chequeo de duplicados

Buscá el mismo producto bajo distintos slugs:

- mismo `name`;
- mismo `officialWebsite`;
- misma marca con un slug ligeramente distinto.

Si ya existe un duplicado, actualizá la ficha más completa en vez de crear una segunda.

## 4. Previsualización local

Levantá el servidor de desarrollo con el Browser tool (`preview_start` con `name: "fuenteai-dev"`, definido en `.claude/launch.json`) y navegá a 1-2 fichas nuevas.

**Gotcha real que ya pasó**: si el puerto 4321 (el default de Astro) está ocupado por otro proceso, `preview_start` puede fallar o asignar un puerto de proxy (ej. 51291) que **Astro nunca usa** — porque Astro no lee la variable de entorno `PORT`, elige su propio puerto libre incrementando desde 4321 (ej. termina en 4322) y lo anuncia en sus logs, no en la respuesta del tool.

Si `preview_start` falla por puerto ocupado:

1. Agregá `"autoPort": true` a la config correspondiente en `.claude/launch.json` (no mates procesos ajenos sin confirmar con el usuario).
2. Volvé a llamar `preview_start`.
3. **Confirmá el puerto real** con `preview_logs` — buscá la línea `Local http://localhost:XXXX/` en la salida de Astro. Ese es el puerto verdadero, no necesariamente el que devolvió `preview_start`.
4. Navegá directo a `http://localhost:<puerto real>/es/<slug>` con `navigate`, usando el `tabId` de la pestaña ya abierta.

Una vez ahí, verificá con `get_page_text` y `read_console_messages` (sin errores) que la ficha renderiza bien — screenshots pueden fallar si el panel del navegador no está desplegado del lado del usuario; en ese caso, la verificación por texto es suficiente y no bloquea el trabajo.

## 5. Revisión manual mínima

En al menos una ficha nueva y en la home, confirmá:

- el título y el CTA son claros;
- las tarjetas de plataforma muestran canales reales, no genéricos;
- el contenido editorial largo aparece debajo del área de decisión rápida;
- el FAQ es visible;
- las fuentes oficiales se renderizan;
- la tarjeta se ve bien en mobile (nombre reconocible, CTA claro, dominio visible).
