# F3-ES · Lote 3 — desambiguación de producto y de marca

**Spec madre:** `docs/mejora/specs/es.md`
**Research de origen:** `docs/mejora/research/es.md` §3.8, §3.11 y §4 (filas 5 y 11)
**Producto:** `es`
**Rama base:** `main`
**Ejecuta:** F4-ES
**Depende de:** F3-ES (#40) fusionada. Instrumentación de funnel F1 (#36) **no fusionada** — ver «Eventos de funnel».

> Alcance: dos fichas existentes, `stable-diffusion` y `mistral-vibe`.
> **Ninguna ficha nueva.** Ninguna edición de `src/content/tools-base/`.

---

## Objetivo

Resolver los dos casos donde el problema español no es el riesgo de clon sino
**la ambigüedad del destino**: «Stable Diffusion» se usa para el modelo, para
la interfaz y para servicios en la nube, y Mistral cambió de nombre comercial
mientras el contenido en español sigue mezclando el antiguo y el nuevo. Al
terminar, cada ficha deja claro **qué es exactamente lo que se está
descargando o abriendo**.

## Contrato de entrada

- `docs/mejora/research/es.md` §3.8: confusión alta de destino entre modelo,
  interfaz web y servicio en la nube; material español anclado en
  AUTOMATIC1111 y en descargar un ZIP del botón «Code» de GitHub; un resultado
  observado propone instalarlo mediante un emulador de Android en PC. Hueco
  alto en desambiguación, **medio en instalación**, que ya está cubierta.
- `docs/mejora/research/es.md` §3.11: conviven la marca antigua (`Le Chat`) y
  la nueva (`Vibe`) en resultados y en fichas de tienda; el canal oficial está
  presente; riesgo de clon bajo; hueco medio y concentrado **en el nombre, no
  en el canal**.
- Estado del catálogo en la fecha de esta spec (2026-08-27), comprobado sobre
  el árbol del repositorio:

| Slug | `name` en `tools-base` | `platforms` declaradas | Ficha `es`: `editorialSections` / `faq` / `safetyNotes` / `longDescription` |
|---|---|---|---|
| `stable-diffusion` | `Stable Diffusion WebUI` | `web` → repositorio de AUTOMATIC1111; `windows` → repositorio de Stability Matrix; `mac` y `linux` → repositorio de ComfyUI. Los cuatro de tipo `github-repo`; `trustLevel: verified` | 3 / 4 / 3 / 188 caracteres |
| `mistral-vibe` | `Vibe by Mistral (ex Le Chat)` | `web` (`web-app`, `chat.mistral.ai`), `android` (`app-store`), `ios` (`app-store`); `trustLevel: official` | 4 / 4 / 2 / 447 caracteres |

- Hecho estructural que el copy debe asumir: la ficha `stable-diffusion` **no
  cataloga el modelo**, cataloga interfaces, y cada plataforma apunta a un
  proyecto distinto. Esa es precisamente la ambigüedad que hay que explicar,
  no esconder.
- `mistral-vibe` **no declara ninguna plataforma de escritorio**.

## Contrato de salida

- `src/content/tools/es/stable-diffusion.json` y
  `src/content/tools/es/mistral-vibe.json` actualizados según las decisiones de
  abajo, validados por `npm run build`.
- Registro de reverificación de canal en el PR del lote, con fecha por URL, y
  constancia de qué nombre muestra hoy cada ficha de tienda de Mistral.

## Decisión por oportunidad

### Fila 5 — `stable diffusion descargar español` → ficha `es/stable-diffusion`

| Campo de decisión | Contenido |
|---|---|
| **Tipo de página** | Ficha existente reforzada, con foco en desambiguación |
| **Intención primaria** | Mixta: transaccional («descargar») sobre un objeto que el usuario no tiene bien definido |
| **Intenciones secundarias** | Qué se instala exactamente, qué hardware hace falta, qué diferencia hay entre las interfaces, si funciona sin conexión |
| **Respuesta above the fold** | Que lo que se descarga es **una interfaz** para ejecutar el modelo en el propio equipo, no «Stable Diffusion» a secas, y que hay más de una interfaz según la plataforma. Se materializa en `shortDescription` y `editorialSummary`; la `longDescription` actual (188 caracteres) se amplía |
| **Plataformas y canales** | Los cuatro destinos son repositorios (`github-repo`) y **no son el mismo proyecto**: la ficha debe nombrar qué proyecto corresponde a cada plataforma, tal y como lo declara `tools-base`, en vez de presentar un botón indistinto |
| **Secciones editoriales** | Se conservan las 3 existentes. Se añaden **3 nuevas y únicas**: (a) modelo, interfaz y servicio en la nube: qué es cada cosa y cuál de las tres cataloga esta ficha; (b) por qué la plataforma cambia de proyecto y cómo elegir entre ellos; (c) qué hace falta en el equipo para que la ejecución local tenga sentido, enlazando la app de compatibilidad en vez de repetir umbrales sueltos —el research observa cifras presentadas como umbral único (§3.6)—. Ningún `heading` repetido |
| **FAQ** | Se conservan las 4 existentes y se añaden **3**: qué se descarga realmente al «descargar Stable Diffusion»; en qué se diferencian los proyectos que la ficha enlaza por plataforma; si tiene sentido usar un emulador de Android en PC —el research observó esa propuesta— con la respuesta anclada en el canal, no en un juicio de seguridad |
| **Advertencias (`safetyNotes`)** | Se conservan las 3 existentes y se añade **1**: que los paquetes «todo en uno» que circulan fuera de los repositorios enlazados no son publicaciones de esos proyectos. Sin afirmar qué contienen |
| **Enlaces internos** | Alternativas ya declaradas en su `tools-base`: `/es/midjourney`, `/es/canva`, `/es/flux`, `/es/comfyui`. Categorías `/es/categoria/generacion-imagenes` y `/es/categoria/modelos-locales`, ambas declaradas en su `tools-base`. `/es/puedo-correr-ia` para la pregunta de hardware. Interstitial `/r?t=stable-diffusion&p=<plataforma>&l=es` |
| **Eventos de funnel** | `ficha_view` con `tool=stable-diffusion`; `platform_select` por plataforma, que aquí mide algo más que preferencia: mide si la desambiguación funciona; `redirect_start`/`redirect_result` con `channel=github-repo` |
| **Ventana y métrica** | Ventana de 90 días con corte a 30. Primaria (condicionada a #36): reparto de `platform_select` entre plataformas y proporción `redirect_result`/`redirect_start`. Un reparto concentrado en una sola plataforma no es un fallo por sí mismo; se lee junto a la secundaria. Secundaria (condicionada a #50): consultas de §3.8 |

### Fila 11 — `mistral vibe descargar` / `le chat mistral` → ficha `es/mistral-vibe`

| Campo de decisión | Contenido |
|---|---|
| **Tipo de página** | Ficha existente reforzada, con foco en el nombre |
| **Intención primaria** | Transaccional, con **dos nombres para el mismo producto** |
| **Intenciones secundarias** | Continuidad («¿Le Chat sigue existiendo?»), plataforma, coste, comparación con otros asistentes |
| **Respuesta above the fold** | Que el producto que se busca como «Le Chat» es el que hoy se llama Vibe, y cuál es su acceso oficial. Se materializa en `shortDescription` y `editorialSummary`, ambos conteniendo el nombre antiguo como sinónimo explícito |
| **Plataformas y canales** | `web` → `web-app` (`chat.mistral.ai`); `android` e `ios` → `app-store`. Escritorio: **no declarado en `tools-base`**, así que no se afirma nada sobre Windows ni macOS |
| **Verificación obligatoria previa** | Comprobar con qué nombre aparece hoy la app en cada tienda y anotarlo. El research observó dos formulaciones distintas conviviendo; el copy debe reflejar lo que se vea en la fecha de verificación, no una de las dos por defecto |
| **Secciones editoriales** | Se conservan las 4 existentes —incluida la que ya explica el cambio de nombre—. Se añaden **2 nuevas y únicas**: (a) cómo identificar la app del editor en cada tienda cuando el nombre mostrado puede variar; (b) qué implica que el acceso de escritorio sea el navegador y no una aplicación. Ninguna puede reescribir ni duplicar la sección existente sobre el renombrado |
| **FAQ** | Se conservan las 4 existentes y se añaden **2**: una redactada con el término antiguo tal y como lo escribe quien busca, y otra sobre qué hacer si la tienda muestra un nombre distinto al de la ficha |
| **Advertencias (`safetyNotes`)** | Hoy son 2; suben a **3 como mínimo**. La nueva cubre las apps de tienda que usan el nombre antiguo sin ser del editor, con el criterio del editor que publica. El riesgo de clon observado es bajo: la advertencia no puede inflarlo |
| **Enlaces internos** | Alternativas ya declaradas en su `tools-base`: `/es/chatgpt`, `/es/claude`, `/es/gemini`, `/es/grok`. Categoría `/es/categoria/asistentes-ia`. Interstitial `/r?t=mistral-vibe&p=web&l=es` y equivalentes de `android` e `ios` |
| **Eventos de funnel** | `ficha_view` con `tool=mistral-vibe`; `platform_select` en `web`/`android`/`ios`; `redirect_start`/`redirect_result` con `channel` `web-app` o `app-store` |
| **Ventana y métrica** | Ventana de 90 días con corte a 30. Primaria (condicionada a #36): proporción `platform_select`/`ficha_view` y `redirect_result`/`redirect_start`. Secundaria (condicionada a #50): consultas de §3.11, mirando específicamente si entra tráfico por el término antiguo. Es la fila de menor prioridad del lote: su hueco es medio |

## Archivos que posee

- `src/content/tools/es/stable-diffusion.json` — copy español de la fila 5.
- `src/content/tools/es/mistral-vibe.json` — copy español de la fila 11.

## PROTEGIDOS

- `src/content/tools-base/stable-diffusion.json`
- `src/content/tools-base/mistral-vibe.json`
- `src/content/tools/es/character-ai.json`
- `src/content/tools/es/perplexity.json`
- `src/content/tools/es/ollama.json`
- `src/content/tools/es/cursor.json`
- `src/content/tools/es/comfyui.json`
- `src/content/tools/es/lm-studio.json`
- `src/content/tools/sv/`
- `src/content/tools/it/`
- `src/content/guides/`
- `src/content/categories/`
- `src/content.config.ts`
- `src/pages/`
- `src/components/`
- `src/layouts/`
- `src/utils/`
- `src/i18n/`
- `docs/mejora/specs/es.md`
- `docs/mejora/research/es.md`
- `docs/mejora/decisiones.md`
- `AGENTS.md`
- `public/`
- `worker/`
- `scripts/`
- `.github/workflows/`
- `package.json`
- `package-lock.json`

## Instrucciones

1. Aplica la regla común 3 de `docs/mejora/specs/es.md`: reverifica las cuatro
   URL de `stable-diffusion` —son tres repositorios distintos— y las tres de
   `mistral-vibe`, anotando fecha y nombre mostrado en cada tienda.
2. Escribe el copy según la tabla de decisión. Registro editorial: regla común
   2 de la spec madre.
3. En `stable-diffusion`, no conviertas la ficha en un tutorial de instalación:
   el research observa ese formato ya cubierto en español. El valor que falta
   es la desambiguación.
4. En `mistral-vibe`, el nombre antiguo se trata como sinónimo de búsqueda, no
   como producto distinto ni como marca vigente.
5. Respeta el esquema de `src/content.config.ts`.
6. Ejecuta `npm run build` y no cierres el lote con ninguna auditoría en rojo.
7. Abre un PR contra `main` enlazando el issue del lote, con el registro de
   verificación en la descripción.

## Fuera de alcance

- Editar `src/content/tools-base/`, incluido el reparto de proyectos por
  plataforma de `stable-diffusion`. Si ese reparto se considera incorrecto, es
  una decisión de catálogo de Codex.
- Tocar la ficha `es/comfyui` u otras fichas enlazadas.
- Escribir una guía de instalación de una interfaz de imagen.
- Recomendar una interfaz por encima de otra sin evidencia: la ficha describe
  qué es cada una, no arbitra.
- Afirmar cualquier cosa sobre escritorio en `mistral-vibe`.
- Instrumentar eventos de funnel — F1 (#36).

## Criterios de aceptación

- [ ] `npm run build` sale 0.
- [ ] `node -e "const fs=require('fs');const min={'stable-diffusion':{s:6,f:7,n:4,l:800},'mistral-vibe':{s:6,f:6,n:3,l:600}};for(const [s,m] of Object.entries(min)){const j=JSON.parse(fs.readFileSync('src/content/tools/es/'+s+'.json','utf8'));const h=(j.editorialSections||[]).map(x=>x.heading);if(h.length<m.s)process.exit(1);if(new Set(h).size!==h.length)process.exit(1);if((j.faq||[]).length<m.f)process.exit(1);if((j.safetyNotes||[]).length<m.n)process.exit(1);if(j.longDescription.length<m.l)process.exit(1);if(j.shortDescription.length>180)process.exit(1);}"` sale 0.
- [ ] **Comprobador del nombre antiguo** (recibe la ruta por argumento, para poder ejecutarse igual sobre una fixture): `node -e "const fs=require('fs');let mal=0;for(const f of process.argv.slice(1)){const j=JSON.parse(fs.readFileSync(f,'utf8'));if(!(j.shortDescription+' '+(j.editorialSummary||'')).toLowerCase().includes('le chat'))mal++;}process.exit(mal?1:0)" src/content/tools/es/mistral-vibe.json` sale 0 — el nombre antiguo aparece en la respuesta above the fold, no solo enterrado en el cuerpo.
- [ ] `[manual]` **Prueba con dato inválido del comprobador del nombre antiguo**, sobre una fixture real y sin tocar el repositorio: 1. `node -e "const fs=require('fs'),os=require('os'),p=require('path');const j=JSON.parse(fs.readFileSync('src/content/tools/es/mistral-vibe.json','utf8'));j.shortDescription=j.shortDescription.replace(/le chat/gi,'');j.editorialSummary=(j.editorialSummary||'').replace(/le chat/gi,'');const out=p.join(os.tmpdir(),'f3es-lote3-invalida.json');fs.writeFileSync(out,JSON.stringify(j));console.log(out)"` escribe en el directorio temporal una copia de la ficha sin el nombre antiguo en el above the fold e imprime su ruta; 2. ejecuta **el mismo comando del comprobador del nombre antiguo** con esa ruta como argumento; 3. resultado esperado: sale 1; 4. borra la fixture con `node -e "const fs=require('fs'),os=require('os'),p=require('path');fs.rmSync(p.join(os.tmpdir(),'f3es-lote3-invalida.json'),{force:true})"`.
- [ ] `node -e "const fs=require('fs');const b=JSON.parse(fs.readFileSync('src/content/tools-base/stable-diffusion.json','utf8'));const j=JSON.parse(fs.readFileSync('src/content/tools/es/stable-diffusion.json','utf8'));const t=JSON.stringify(j).toLowerCase();for(const p of ['automatic1111','stabilitymatrix','stability matrix','comfyui'])if(!t.includes(p))process.exit(1);if(Object.keys(b.platforms).length!==4)process.exit(1)"` sale 0 — el copy nombra los tres proyectos que `tools-base` enlaza, que es la condición mínima para que la desambiguación exista.
- [ ] `node -e "const fs=require('fs');for(const s of ['stable-diffusion','mistral-vibe']){const b=JSON.parse(fs.readFileSync('src/content/tools-base/'+s+'.json','utf8'));const t=fs.readFileSync('src/content/tools/es/'+s+'.json','utf8');const m=t.match(/\/r\?t=[a-z0-9-]+&p=([a-z]+)/g)||[];for(const url of m){const p=url.split('p=')[1];if(!b.platforms[p])process.exit(1);}}"` sale 0 — ningún enlace al interstitial usa una plataforma no declarada.
- [ ] `node -e "const fs=require('fs');for(const s of ['stable-diffusion','mistral-vibe']){const t=fs.readFileSync('src/content/tools/es/'+s+'.json','utf8');const m=t.match(/\/es\/[a-z0-9-]+/g)||[];for(const url of m){const slug=url.slice(4);if(slug==='categoria'||slug==='puedo-correr-ia')continue;if(!fs.existsSync('src/content/tools/es/'+slug+'.json'))process.exit(1);}}"` sale 0.
- [ ] `node -e "const {execSync}=require('child_process');const out=execSync('git diff --name-only origin/main...HEAD').toString().split('\n').filter(Boolean);const ok=['src/content/tools/es/stable-diffusion.json','src/content/tools/es/mistral-vibe.json'];process.exit(out.every(f=>ok.includes(f))?0:1)"` sale 0.
- [ ] `[manual]` Verificación de canal: 1. abre las cuatro URL de `stable-diffusion` y las tres de `mistral-vibe`; 2. anota fecha, proyecto o editor y nombre mostrado; 3. resultado esperado: coincide con `tools-base` y el PR incluye la tabla; si no coincide, el lote escala en vez de escribir.
- [ ] `[manual]` Prueba de desambiguación: 1. abre `/es/stable-diffusion` en el preview del build; 2. lee solo lo visible antes del primer scroll; 3. resultado esperado: se entiende que lo que se descarga es una interfaz y que el destino cambia según la plataforma.

## Riesgos conocidos

| Riesgo | Evidencia que lo detecta | Quién lo resuelve |
|---|---|---|
| El reparto de proyectos por plataforma de `tools-base` resulta discutible al verificar | La verificación manual del canal | Codex: decisión de catálogo |
| La ficha se convierte en un tutorial de instalación | «Fuera de alcance» y la estructura de `docs/ux-tool-pages.md` | La sesión del lote |
| El copy arbitra entre interfaces sin evidencia | Revisión editorial contra el research, que no compara interfaces | La sesión del lote |
| El nombre mostrado en tienda vuelve a cambiar | La verificación con fecha; el copy trata el nombre antiguo como sinónimo, no como estado | La sesión del lote |
| Se infla el riesgo de clon de Mistral, que el research observa bajo | La tabla de decisión limita la advertencia a un hecho comprobable | La sesión del lote |
| F1 (#36) sin fusionar al cerrar la ventana | No hay eventos que observar | Codex |
