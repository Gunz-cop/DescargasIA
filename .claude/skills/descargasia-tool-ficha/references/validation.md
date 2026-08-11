# Validation

Corré estos checks antes de dar el lote por terminado.

## 1. Integridad de slugs y alternatives

Chequea que cada ficha en `tools-base` tenga su contraparte en `tools/es` (mínimo) y que ningún `alternatives` apunte a un slug inexistente:

```bash
node -e '
const fs=require("fs");
const baseDir="src/content/tools-base";
const esDir="src/content/tools/es";
const baseFiles=fs.readdirSync(baseDir).filter(f=>f.endsWith(".json"));
const esFiles=fs.readdirSync(esDir).filter(f=>f.endsWith(".json"));
const baseSlugs=new Set(baseFiles.map(f=>f.replace(".json","")));
const esSlugs=new Set(esFiles.map(f=>f.replace(".json","")));
const missingEs=[...baseSlugs].filter(s=>!esSlugs.has(s));
const missingBase=[...esSlugs].filter(s=>!baseSlugs.has(s));
const tools=baseFiles.map(f=>({slug:f.replace(".json",""),...JSON.parse(fs.readFileSync(baseDir+"/"+f,"utf8"))}));
let badAlt=[];
for(const t of tools){for(const a of t.alternatives||[]){if(!baseSlugs.has(a)) badAlt.push(t.slug+"->"+a)}}
console.log(JSON.stringify({totalBase:baseFiles.length, totalEs: esFiles.length, missingEs, missingBase, badAlt},null,2));
'
```

`missingEs`/`missingBase` y `badAlt` deberían salir vacíos. Si estás trabajando en sueco o italiano, corré la misma lógica cambiando `esDir` por `src/content/tools/sv` o `src/content/tools/it` — pero recordá que hoy esas carpetas están incompletas respecto a `es` (ver `references/multilingual.md`), así que un `missingEs`-equivalente alto ahí es esperado, no necesariamente un error tuyo.

## 2. Build

```bash
npm run build
```

**Aviso importante**: `npm run build` en este repo ejecuta `npm run shorten && astro build` (mirá `package.json`). El paso `shorten` corre `scripts/shorten-official-links.mjs`, que si `LINKZIP_ENABLED=true` en `.env` (y hay `LINKZIP_API_KEY`), va a llamar a la API real de linkzip.uk para acortar cualquier URL nueva que no esté todavía en `src/linkzip-cache.json`. Esto:

- genera enlaces cortos reales (no es un dry-run) — cada URL nueva de una plataforma o `officialWebsite` que agregues va a consumir una llamada real a la API;
- tarda un poco más por el delay entre llamadas (`LINKZIP_DELAY_MS`, 1500ms por defecto);
- si falla la API o no hay conexión, el script no rompe el build — solo loggea el error y sigue. Reportalo igual al usuario como riesgo operativo si pasa.

Si preferís no disparar la llamada real (por ejemplo, mientras iterás contenido y no querés generar enlaces cortos todavía), usá `npm run build:no-shorten`, que salta directo a `astro build`.

El build debe pasar sin errores. Revisá que las páginas nuevas (`/es/<slug>/index.html`) aparezcan en el output.

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
