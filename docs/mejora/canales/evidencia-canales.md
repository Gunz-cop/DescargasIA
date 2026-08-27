# Registro de verificación de canales oficiales

**Decisión que lo crea:** [#56](https://github.com/Gunz-cop/DescargasIA/issues/56),
comentario de Codex del 2026-08-27 — **vía 3**.
**Anotada en:** `docs/mejora/decisiones.md`, registro 2026-08-27.
**Propietario:** Codex / el propietario del proyecto. **Nadie más escribe aquí.**
**Estado:** **vacío**. 0 de 30 filas verificadas.
**Bloquea:** F4-ES ([#44](https://github.com/Gunz-cop/DescargasIA/issues/44)),
F4-SV ([#43](https://github.com/Gunz-cop/DescargasIA/issues/43)) y
F4-IT ([#46](https://github.com/Gunz-cop/DescargasIA/issues/46)).

> Este archivo es el **soporte** de la evidencia, no la evidencia. Lo creó una
> sesión ejecutora que **no tiene acceso de red a ningún dominio oficial**
> (diagnóstico: `docs/mejora/blockers/F4-ES-bloqueo-verificacion-de-canal.md`).
> Todas las columnas de observación están vacías a propósito. Ninguna sesión
> ejecutora puede rellenarlas.

---

## Por qué existe

La regla común 3 de `docs/mejora/specs/es.md` es condición de arranque de F4:
antes de escribir una frase sobre canales hay que abrir cada URL de
`platforms` y comprobar que sigue siendo el canal oficial del editor y que el
`type` declarado coincide con lo que hay al otro lado. Las sesiones ejecutoras
no pueden hacerlo. La vía 3 traslada esa comprobación a Codex/propietario, que
la deja aquí fechada y versionada, y las sesiones escriben **contra esta tabla
y solo contra ella**.

`platforms` vive en `src/content/tools-base/`, que es común a los tres
productos lingüísticos. Por eso este registro es **por `slug` + plataforma, no
por idioma**: una fila verificada sirve a `es`, `sv` e `it` a la vez. La
columna «Producto» solo indica qué fases están esperando esa fila.

## Contrato de uso

**Quién escribe.** Solo Codex o el propietario, abriendo la URL. Una sesión
ejecutora que rellene una celda está falsificando evidencia.

**Qué puede hacer una sesión de F4 con esto.**

- Escribir sobre una plataforma **solo si su fila está en estado `verificado`**,
  y solo dentro de lo que la fila anota. Si la fila dice que el editor
  observado es X y el tipo observado es `app-store`, el copy no puede prometer
  un instalador.
- Ante `no coincide`: **no escribe sobre esa plataforma** y escala como
  decisión de catálogo. No corrige `tools-base` ni maquilla el copy para que
  la contradicción no se note.
- Ante `no verificable` o `pendiente`: **no escribe sobre esa plataforma**. La
  ausencia de fila verificada no autoriza a afirmar nada, ni a favor ni en
  contra: no se puede convertir en «no existe instalador» (regla común 4 de la
  spec madre).
- **No copia esta tabla dentro de una ficha.** La cita en el PR de su lote.

**Qué no cuenta como verificación.** Un resultado de búsqueda, un resumen de un
tercero, una respuesta HTTP sin ver la página, el `lastChecked` de `tools-base`
o la memoria de un modelo. Las señales de terceros se pueden conservar en
«Señales sin verificar», nunca en la tabla.

## Columnas

| Columna | Qué va | Quién la rellena |
|---|---|---|
| Slug | Slug de `src/content/tools-base/` | Ya rellenada |
| Producto | Fases que esperan esta fila | Ya rellenada |
| Plataforma | Clave de `platforms` | Ya rellenada |
| Tipo declarado | `type` que hoy declara `tools-base` | Ya rellenada |
| `lastChecked` | Sello actual de `tools-base`. **Autoriza a priorizar, no a afirmar** | Ya rellenada |
| URL declarada | `platforms.<plataforma>.url` | Ya rellenada |
| URL final observada | Dónde acabó tras redirecciones. Si no redirige, se repite la declarada | Codex |
| Fecha/hora | Momento de la comprobación, con zona horaria | Codex |
| Editor observado | Marca o editor que figura en el destino, transcrito | Codex |
| Tipo observado | Qué es realmente el destino, en el vocabulario de `src/content.config.ts` | Codex |
| Región/tienda | País y tienda cuando el destino dependa de ello | Codex |
| Fuente | Dónde se lee lo anotado, verificable por un tercero | Codex |
| Estado | `verificado` · `no coincide` · `no verificable` · `pendiente` | Codex |

**Vocabulario de `Tipo observado`**, el mismo que valida el esquema:
`official-site`, `app-store`, `web-app`, `documentation`, `official-installer`,
`github-repo`, `package-manager`.

**Vocabulario de `Estado`:**

- `verificado` — la URL abrió, el editor es el del producto y el tipo observado
  **coincide** con el declarado. Es el único estado que autoriza a escribir.
- `no coincide` — abrió, pero el editor o el tipo no son los declarados.
  Escala como decisión de catálogo sobre `tools-base`. **No** lo arregla F4.
- `no verificable` — no se pudo abrir o el destino no permite afirmar quién
  publica. Se anota el motivo en «Fuente».
- `pendiente` — nadie lo ha comprobado todavía. Estado inicial de todas.

## Vigencia — **decisión abierta, no la fija este documento**

Una verificación caduca: el canal puede cambiar entre la comprobación y la
publicación, y ese riesgo ya está listado en las specs hijas de F3-ES.

Este documento **no fija** un plazo, porque no le corresponde. La pregunta para
Codex es: **¿cuántos días vale una fila `verificado` antes de tener que
repetirse?** Propuesta razonada, para aceptar o cambiar: **30 días**, que es el
corte intermedio que las specs ya usan para detectar regresiones, y
reverificación obligatoria de las filas del lote al abrir su PR, que es lo que
la spec madre ya pide en sus riesgos conocidos. Hasta que se cierre, cada lote
declara en su PR la fecha de las filas que usó y deja que el revisor juzgue.

## Comprobador de la tabla

Verifica que ninguna fila esté a medias y devuelve qué slugs están listos para
escribirse. Por defecto lee este mismo archivo, así que no puede
desincronizarse de él; acepta una ruta por argumento para poder ejecutarse
igual sobre una fixture:

```bash
node -e "
const fs=require('fs');
const RUTA=process.argv[1]||'docs/mejora/canales/evidencia-canales.md';
const filas=fs.readFileSync(RUTA,'utf8')
  .split('\n').filter(l=>/^\| \`[a-z0-9-]+\` \|/.test(l))
  .map(l=>l.split('|').slice(1,-1).map(c=>c.trim().replace(/\`/g,'')));
const OBS=[6,7,8,9,10,11], EST=12;
let mal=0; const listos={};
for(const f of filas){
  const [slug,,plat]=f, estado=f[EST];
  if(!['verificado','no coincide','no verificable','pendiente'].includes(estado)){
    console.log('estado invalido :: '+slug+'/'+plat+' :: '+estado); mal++; continue;
  }
  const vacias=OBS.filter(i=>!f[i]||f[i]==='—').length;
  if(estado==='verificado'&&vacias){ console.log('verificado incompleto :: '+slug+'/'+plat); mal++; }
  if(estado!=='pendiente'&&vacias===OBS.length){ console.log('sin evidencia :: '+slug+'/'+plat); mal++; }
  if(estado==='verificado')(listos[slug]=listos[slug]||[]).push(plat);
}
console.log('filas: '+filas.length+' | listas para escribir: '+Object.entries(listos).map(([s,p])=>s+'('+p.join(',')+')').join(' ')||'ninguna');
process.exit(mal?1:0)"
```

**Qué comprueba y qué no.** Comprueba que el estado pertenezca al vocabulario,
que ninguna fila `verificado` deje columnas de observación vacías y que
ninguna fila salga de `pendiente` sin aportar evidencia; e imprime qué
`slug`/plataforma están habilitados para escribir. **No comprueba** que lo
anotado sea cierto —eso lo garantiza quien abre la URL y firma la fila— ni que
el tipo observado sea coherente con el declarado, porque una fila
`no coincide` es precisamente la que debe diferir. Salida 0 hoy, con las 30
filas en `pendiente`, es correcta: significa «vacío y bien formado», no
«verificado».

**Prueba con dato inválido**, sobre una fixture en el directorio temporal del
sistema y sin tocar el repositorio, como exige la regla común 9 de
`docs/mejora/specs/es.md`:

```bash
node -e "const fs=require('fs'),os=require('os'),p=require('path');
const t=fs.readFileSync('docs/mejora/canales/evidencia-canales.md','utf8')
  .replace(/(\| \`ollama\` \|[^\n]*\`)pendiente(\` \|)/,'\$1verificado\$2');
const out=p.join(os.tmpdir(),'canales-invalida.md');fs.writeFileSync(out,t);console.log(out)"
```

Marca una fila como `verificado` dejando sus columnas de observación vacías e
imprime la ruta. Ejecutar **el mismo comprobador** con esa ruta como argumento
debe salir **1** e imprimir `verificado incompleto :: ollama/…`. Si saliera 0,
el comprobador no sirve. Después: `rm "$(node -e "const os=require('os'),p=require('path');console.log(p.join(os.tmpdir(),'canales-invalida.md'))")"`.

## Tabla

Orden: alfabético por slug, y dentro del slug el de `platforms`.

| Slug | Producto | Plataforma | Tipo declarado | `lastChecked` | URL declarada | URL final observada | Fecha/hora | Editor observado | Tipo observado | Región/tienda | Fuente | Estado |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `character-ai` | `es` | `web` | `web-app` | 2026-08-12 | https://character.ai | — | — | — | — | — | — | `pendiente` |
| `character-ai` | `es` | `android` | `app-store` | 2026-08-12 | https://play.google.com/store/apps/details?id=ai.character.app | — | — | — | — | — | — | `pendiente` |
| `character-ai` | `es` | `ios` | `app-store` | 2026-08-12 | https://apps.apple.com/us/app/character-ai-chat-talk-text/id1671705818 | — | — | — | — | — | — | `pendiente` |
| `cursor` | `es` · `it` | `web` | `official-site` | 2026-08-12 | https://cursor.com | — | — | — | — | — | — | `pendiente` |
| `cursor` | `es` · `it` | `windows` | `official-installer` | 2026-08-15 | https://cursor.com/downloads | — | — | — | — | — | — | `pendiente` |
| `cursor` | `es` · `it` | `mac` | `official-installer` | 2026-08-15 | https://cursor.com/downloads | — | — | — | — | — | — | `pendiente` |
| `cursor` | `es` · `it` | `linux` | `official-installer` | 2026-08-15 | https://cursor.com/downloads | — | — | — | — | — | — | `pendiente` |
| `grok` | `it` | `web` | `web-app` | 2026-08-12 | https://grok.com | — | — | — | — | — | — | `pendiente` |
| `grok` | `it` | `android` | `app-store` | 2026-08-12 | https://play.google.com/store/apps/details?id=ai.x.grok | — | — | — | — | — | — | `pendiente` |
| `grok` | `it` | `ios` | `app-store` | 2026-08-12 | https://apps.apple.com/us/app/grok/id6670324846 | — | — | — | — | — | — | `pendiente` |
| `lm-studio` | `it` | `web` | `official-site` | 2026-08-12 | https://lmstudio.ai | — | — | — | — | — | — | `pendiente` |
| `lm-studio` | `it` | `windows` | `official-site` | 2026-08-12 | https://lmstudio.ai | — | — | — | — | — | — | `pendiente` |
| `lm-studio` | `it` | `mac` | `official-site` | 2026-08-12 | https://lmstudio.ai | — | — | — | — | — | — | `pendiente` |
| `lm-studio` | `it` | `linux` | `official-site` | 2026-08-12 | https://lmstudio.ai | — | — | — | — | — | — | `pendiente` |
| `mistral-vibe` | `es` | `web` | `web-app` | 2026-08-12 | https://chat.mistral.ai | — | — | — | — | — | — | `pendiente` |
| `mistral-vibe` | `es` | `android` | `app-store` | 2026-08-12 | https://play.google.com/store/apps/details?id=ai.mistral.chat | — | — | — | — | — | — | `pendiente` |
| `mistral-vibe` | `es` | `ios` | `app-store` | 2026-08-12 | https://apps.apple.com/us/app/vibe-by-mistral-ex-le-chat/id6740410176 | — | — | — | — | — | — | `pendiente` |
| `notebooklm` | `it` | `web` | `web-app` | 2026-08-12 | https://notebooklm.google | — | — | — | — | — | — | `pendiente` |
| `ollama` | `es` · `it` | `web` | `official-site` | 2026-08-12 | https://ollama.com | — | — | — | — | — | — | `pendiente` |
| `ollama` | `es` · `it` | `windows` | `official-installer` | 2026-08-12 | https://ollama.com/download/OllamaSetup.exe | — | — | — | — | — | — | `pendiente` |
| `ollama` | `es` · `it` | `mac` | `official-installer` | 2026-08-12 | https://ollama.com/download/Ollama-darwin.zip | — | — | — | — | — | — | `pendiente` |
| `ollama` | `es` · `it` | `linux` | `documentation` | 2026-08-12 | https://ollama.com/download/linux | — | — | — | — | — | — | `pendiente` |
| `perplexity` | `es` | `web` | `web-app` | 2026-08-12 | https://www.perplexity.ai | — | — | — | — | — | — | `pendiente` |
| `perplexity` | `es` | `windows` | `app-store` | 2026-08-12 | https://apps.microsoft.com/detail/xp8jnqfbqh6pvf | — | — | — | — | — | — | `pendiente` |
| `perplexity` | `es` | `android` | `app-store` | 2026-08-12 | https://play.google.com/store/apps/details?id=ai.perplexity.app.android | — | — | — | — | — | — | `pendiente` |
| `perplexity` | `es` | `ios` | `app-store` | 2026-08-12 | https://apps.apple.com/us/app/perplexity-ai-search-chat/id1668000334 | — | — | — | — | — | — | `pendiente` |
| `stable-diffusion` | `es` | `web` | `github-repo` | 2026-08-12 | https://github.com/AUTOMATIC1111/stable-diffusion-webui | — | — | — | — | — | — | `pendiente` |
| `stable-diffusion` | `es` | `windows` | `github-repo` | 2026-08-12 | https://github.com/LykosAI/StabilityMatrix | — | — | — | — | — | — | `pendiente` |
| `stable-diffusion` | `es` | `mac` | `github-repo` | 2026-08-12 | https://github.com/comfy-org/ComfyUI | — | — | — | — | — | — | `pendiente` |
| `stable-diffusion` | `es` | `linux` | `github-repo` | 2026-08-12 | https://github.com/comfy-org/ComfyUI | — | — | — | — | — | — | `pendiente` |
### Qué falta en esta tabla, y por qué

- **`sv`.** F3-SV ([#39](https://github.com/Gunz-cop/DescargasIA/issues/39))
  sigue abierta: no hay specs suecas fusionadas y, por tanto, no hay slugs
  aprobados que añadir. Cuando F3-SV se fusione, sus slugs se añaden aquí antes
  de que F4-SV empiece. Añadir filas suecas ahora sería inventar el alcance.
- **`it`.** Cubierto con los cinco slugs que aprueba `docs/mejora/specs/it.md`
  §8.1 (`cursor`, `ollama`, `lm-studio`, `grok`, `notebooklm`). `cursor` y
  `ollama` ya estaban por `es`: comparten fila, porque comparten `tools-base`.
- **`microsoft-copilot`.** F3-IT lo deja fuera como bloqueador B1: el research
  italiano no aporta un dominio oficial y la spec se niega a inventarlo. No
  tiene fila aquí porque no tiene ruta declarada que verificar. Si Codex
  autoriza declararla, entra primero en `tools-base` y después aquí.
- **Las guías** de F3-ES (lote 4) y F3-IT (G1–G3) siguen bloqueadas por la
  ausencia de ruta pública para `src/content/guides/`. No tienen canales que
  verificar.

## Señales sin verificar

No son evidencia y no habilitan a escribir. Se conservan para que quien
verifique sepa dónde mirar con más cuidado.

| Fecha | Slug · plataforma | Señal | Origen | Qué habría que resolver |
|---|---|---|---|---|
| 2026-08-27 | `perplexity` · `windows` | Resultados de búsqueda **contradictorios entre sí** sobre si el canal de Windows es la ficha de Microsoft Store o un instalador descargable de la página del editor | Búsqueda web durante el diagnóstico de #56. **No se abrió ninguna de las dos páginas** | Si fuera un instalador del editor, `platforms.windows` (`type: app-store`) estaría desactualizado → estado `no coincide` y decisión de catálogo, no arreglo de copy |
| 2026-08-27 | `cursor` · dominio antiguo | El lote 2 de F3-ES exige comprobar qué hay hoy en `cursor.sh` antes de escribir sobre él. No es una plataforma de `platforms`, así que no tiene fila propia | `docs/mejora/specs/es/F3-ES-lote-2-redistribucion.md` | Anotar lo observado con fecha, o no mencionar el dominio. La spec prohíbe suponer que redirige |

## Cómo se actualiza

1. Codex o el propietario abre la URL declarada de una fila y rellena sus seis
   columnas de observación y el estado.
2. Ejecuta el comprobador de arriba; debe salir 0.
3. Commit con la fecha en el mensaje y PR contra `main`. La tabla se versiona:
   el historial de git **es** el registro de cuándo se verificó cada cosa.
4. Si alguna fila queda en `no coincide`, se abre la decisión de catálogo antes
   de desbloquear el lote que dependa de ella.
5. Cuando las filas de un lote estén `verificado`, ese lote de F4 puede
   arrancar y debe citar en su PR las filas exactas que usó, con su fecha.
