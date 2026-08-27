# F3-ES · Lote 1 — canal oficial ausente en la SERP española

**Spec madre:** `docs/mejora/specs/es.md`
**Research de origen:** `docs/mejora/research/es.md` §3.2, §3.4 y §4 (filas 1 y 2)
**Producto:** `es`
**Rama base:** `main`
**Ejecuta:** F4-ES
**Depende de:** F3-ES (#40) fusionada. Instrumentación de funnel F1 (#36) **integrada en `main`** mediante el PR #52 — ver «Eventos de funnel».

> Alcance: dos fichas existentes, `character-ai` y `perplexity`. **Ninguna
> ficha nueva.** Ninguna edición de `src/content/tools-base/`.

---

## Objetivo

Cerrar el hueco que el research documenta como el peor del producto español:
consultas transaccionales donde la primera página **no devuelve el canal
oficial** y sí devuelve portales de APK, apps homónimas de tienda y
redistribuciones. Al terminar, las fichas `es/character-ai` y `es/perplexity`
responden, antes del primer scroll, cuál es el canal oficial por plataforma y
qué cosas que se parecen no lo son.

## Contrato de entrada

- `docs/mejora/research/es.md` §3.2: en `Character AI descargar app oficial
  gratis`, 7 de 7 resultados observados son portales de APK o de descarga de
  terceros, y el único resultado de tienda oficial corresponde a **otro
  producto** (`Janitor AI`).
- `docs/mejora/research/es.md` §3.4: en `descargar Perplexity app oficial para
  Windows y Android`, se observan un portal de APK «Premium» y una app de
  tienda de un tercero que usa la marca. El research marca **explícitamente
  como no verificado** el estado de la aplicación de escritorio de Perplexity.
- Estado del catálogo en la fecha de esta spec (2026-08-27), comprobado sobre
  el árbol del repositorio:

| Slug | `platforms` declaradas en `tools-base` | `lastChecked` | Ficha `es`: `editorialSections` / `faq` / `safetyNotes` / `longDescription` |
|---|---|---|---|
| `character-ai` | `web` (`web-app`), `android` (`app-store`), `ios` (`app-store`) | 2026-08-12 | 4 / 4 / 3 / 604 caracteres |
| `perplexity` | `web` (`web-app`), `windows` (`app-store`), `android` (`app-store`), `ios` (`app-store`) | 2026-08-12 | 3 / 4 / 3 / 181 caracteres |

- `character-ai` **no declara ninguna plataforma de escritorio**; `perplexity`
  declara `windows` de tipo `app-store`, no `official-installer`.

Si al empezar el lote alguna de esas dos filas ya no coincide con el
repositorio, la spec se revisa antes de escribir: significa que otra sesión
tocó el catálogo.

## Contrato de salida

- `src/content/tools/es/character-ai.json` y
  `src/content/tools/es/perplexity.json` actualizados según las decisiones de
  abajo, validados por `npm run build`.
- Un registro en el PR del lote con la reverificación de canal: para cada URL
  de `platforms`, fecha de comprobación y resultado.
- Si la verificación encuentra una discrepancia con `tools-base`: un comentario
  en el issue del lote con URL, captura textual de lo observado y la pregunta
  de catálogo, **sin** editar `tools-base`.

## Decisión por oportunidad

### Fila 1 — `character ai descargar app oficial` → ficha `es/character-ai`

| Campo de decisión | Contenido |
|---|---|
| **Tipo de página** | Ficha existente reforzada. No se crea página nueva |
| **Intención primaria** | Transaccional: conseguir la app o el acceso oficial |
| **Intenciones secundarias** | Verificación («¿cuál es la de verdad?»), plataforma («¿hay algo para PC?»), coste («¿es gratis?»), edad/uso permitido |
| **Respuesta above the fold** | Que el acceso oficial es la web y las dos apps de tienda publicadas por el editor, y que **el catálogo no declara ningún canal de escritorio verificado**: en un ordenador, la vía verificada es el navegador. Se materializa en `shortDescription` (≤180 caracteres) y `editorialSummary`. No se promete una descarga que no esté declarada y **no se afirma que el instalador no exista**: la evidencia disponible es la ausencia en el catálogo, no una comprobación de inexistencia (regla común 4 de la spec madre) |
| **Plataformas y canales** | `web` → `web-app` (`character.ai`); `android` → `app-store` (Google Play); `ios` → `app-store` (App Store). Windows, macOS y Linux: **la ausencia en el catálogo se declara explícitamente como tal**, no se omite ni se convierte en afirmación de inexistencia. Si la sesión verifica en la fuente oficial que el editor no publica escritorio, puede escribir la forma absoluta citando esa verificación con URL y fecha; sin esa verificación, escribe la forma acotada |
| **Secciones editoriales** | Se conservan las 4 existentes. Se añaden **2 nuevas y únicas**: (a) cómo distinguir la app del editor de las homónimas de tienda, con los criterios comprobables en la propia ficha de la tienda (nombre del desarrollador y editor que figura); (b) qué se pierde y qué no al usar la web en un ordenador, que es la única vía de escritorio que el catálogo declara y verifica. Ninguna puede repetir un `heading` ya presente |
| **FAQ** | Se conservan las 4 existentes y se añaden **2** derivadas de la SERP observada: una sobre por qué al buscar «Character AI oficial» aparecen APK y apps de otro producto, y otra sobre qué hacer si la app instalada pide pagar por funciones que el editor da gratis. Las respuestas describen hechos del canal, no juicios de seguridad |
| **Advertencias (`safetyNotes`)** | Se conservan las 3 existentes. Se añade **1**: que un resultado de tienda con un nombre parecido puede ser un producto distinto —el research observó exactamente ese caso— y que el criterio es el editor que publica, no el nombre |
| **Enlaces internos** | A las alternativas ya declaradas en su `tools-base`: `/es/chatgpt`, `/es/claude`, `/es/gemini`. A la categoría `/es/categoria/asistentes-ia`. Al interstitial `/r?t=character-ai&p=web&l=es` y equivalentes de `android`/`ios`. Ningún enlace a un portal de terceros |
| **Eventos de funnel** | `ficha_view` con `tool=character-ai`; `platform_select` con `platform` en `web`/`android`/`ios`; `redirect_start` y `redirect_result` con `channel` `web-app` o `app-store`. Un `redirect_error` con `reason=platform_not_found` sobre este slug indica que el copy prometió una plataforma que no existe |
| **Ventana y métrica** | Ventana de 90 días con corte a 30. Primaria (instrumentada por F1/#36, ya integrada en `main` vía PR #52): proporción `platform_select`/`ficha_view` y `redirect_result`/`redirect_start`, y cero `redirect_error` con `reason=platform_not_found`. Secundaria (condicionada a #50, **abierto**): presencia en las consultas de §3.2. La distinción se mantiene: la **entrega** se da por verificada con los criterios de aceptación de esta spec, pero **no se declara éxito medido** mientras falte la línea base de consultas de #50 |

### Fila 2 — `descargar perplexity para windows` → ficha `es/perplexity`

| Campo de decisión | Contenido |
|---|---|
| **Tipo de página** | Ficha existente reforzada. No se crea página nueva |
| **Intención primaria** | Transaccional **con premisa errónea**: la consulta presupone un `.exe` descargable desde la web del editor |
| **Intenciones secundarias** | Canal por plataforma, diferencia entre app de tienda y aplicación web, coste, comparación con otros asistentes |
| **Respuesta above the fold** | Cuál es el canal real en cada plataforma, corrigiendo la premisa sin ridiculizarla. La corrección se apoya en `platforms`, que declara `windows` como `app-store`, **no** como `official-installer`. Se materializa en `shortDescription` y `editorialSummary`; la `longDescription` actual (181 caracteres) se amplía |
| **Plataformas y canales** | `web` → `web-app`; `windows` → `app-store` (Microsoft Store); `android` → `app-store`; `ios` → `app-store`. macOS y Linux: no declaradas en `tools-base`, así que **no se afirma nada** sobre ellas |
| **Verificación obligatoria previa** | El research marca el estado del escritorio como **no verificado**. Antes de escribir sobre Windows hay que comprobar en el canal oficial del editor qué ofrece hoy. Si lo que hay no coincide con `platforms.windows`, **se para y se escala**: es una decisión de catálogo, no de copy. Sin esa comprobación, la fila 2 no se ejecuta |
| **Secciones editoriales** | Se conservan las 3 existentes y se añaden **al menos 3 nuevas y únicas**, hasta un mínimo de **6 secciones** en la ficha —el mismo mínimo que exige el comprobador de profundidad de los criterios de aceptación—. Dos son obligatorias: (a) qué significa exactamente que en Windows el canal sea una app de tienda y no un instalador descargado del sitio; (b) cómo reconocer las apps de tienda de terceros que usan la marca —el research observó una— comprobando el editor que publica. La tercera, y las que hagan falta para llegar al mínimo, salen de las intenciones secundarias de esta fila (diferencia entre app de tienda y aplicación web, coste, comparación con otros asistentes) y no pueden ser texto genérico intercambiable con otra ficha. Ningún `heading` repetido |
| **FAQ** | Se conservan las 4 existentes y se añaden **2**: una que responde literalmente a la consulta «descargar Perplexity para Windows» con el canal verificado, y otra sobre los APK «Premium» que prometen funciones de pago desbloqueadas. Ninguna respuesta afirma nada que la verificación previa no haya confirmado |
| **Advertencias (`safetyNotes`)** | Se conservan las 3 existentes y se añade **1** sobre apps de tienda publicadas por terceros que usan la marca, descrita como hecho comprobable en la ficha de la tienda |
| **Enlaces internos** | Alternativas ya declaradas en su `tools-base`: `/es/chatgpt`, `/es/gemini`, `/es/claude`, `/es/microsoft-copilot`. Categoría `/es/categoria/asistentes-ia`. Interstitial `/r?t=perplexity&p=windows&l=es` y equivalentes de `web`, `android` e `ios` |
| **Eventos de funnel** | `ficha_view` con `tool=perplexity`; `platform_select` con `platform=windows` como señal específica de esta fila; `redirect_start`/`redirect_result` con `channel=app-store` para Windows. `redirect_error` con `reason=not_official` sería un fallo directo de este lote |
| **Ventana y métrica** | Ventana de 90 días con corte a 30. Primaria (instrumentada por F1/#36, ya integrada en `main` vía PR #52): proporción de `platform_select` con `platform=windows` sobre `ficha_view` de este slug, y `redirect_result`/`redirect_start`. Secundaria (condicionada a #50, **abierto**): consultas de §3.4. La distinción se mantiene: la **entrega** se da por verificada con los criterios de aceptación de esta spec, pero **no se declara éxito medido** mientras falte la línea base de consultas de #50 |

## Archivos que posee

- `src/content/tools/es/character-ai.json` — copy español de la fila 1.
- `src/content/tools/es/perplexity.json` — copy español de la fila 2.

Nada más. Si el lote necesita otro archivo, la spec está mal cortada.

## PROTEGIDOS

- `src/content/tools-base/character-ai.json`
- `src/content/tools-base/perplexity.json`
- `src/content/tools/es/ollama.json`
- `src/content/tools/es/cursor.json`
- `src/content/tools/es/stable-diffusion.json`
- `src/content/tools/es/mistral-vibe.json`
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

El resto de fichas de `src/content/tools/es/` que no aparecen arriba tampoco se
tocan: este lote solo posee las dos que enumera.

## Instrucciones

1. Aplica la regla común 3 de `docs/mejora/specs/es.md`: reverifica cada URL de
   `platforms` de los dos slugs y anota fecha y resultado. Para Perplexity, la
   verificación del canal de Windows es condición de arranque.
2. Escribe el copy español según la tabla de decisión de cada fila. Registro
   editorial: regla común 2. Nada de traducir `sv/` ni `it/`.
3. Respeta el esquema de `src/content.config.ts`: `shortDescription` como
   máximo 180 caracteres; `communityInsights[].source` debe ser una URL y
   `date` cumplir `YYYY-MM-DD` o `YYYY-MM`.
4. Solo añade `communityInsights` si encuentras una fuente real y citable. Si
   no la hay, no toques el campo.
5. Enlaza únicamente los slugs listados en «Enlaces internos». Comprueba que
   existen antes de enlazar.
6. Ejecuta `npm run build` — encadena `catalog:audit`, `hw:audit`, `npm test`,
   `agents:skills` y `links:audit` — y no cierres el lote con ninguna en rojo.
7. Abre un PR contra `main` enlazando el issue del lote, con el registro de
   verificación de canal en la descripción.

## Fuera de alcance

- Editar `src/content/tools-base/` para corregir un canal — decisión de
  catálogo de Codex.
- Tocar cualquier otra ficha `es`, aunque aparezca como alternativa enlazada.
- Crear páginas, rutas, categorías o guías.
- Instrumentar o modificar eventos de funnel — F1 (#36).
- Escribir sobre macOS o Linux en Perplexity, o sobre cualquier escritorio en
  Character.AI: `tools-base` no declara esas plataformas.
- Afirmar cumplimiento normativo, cifrado o tratamiento de datos de terceros.

## Criterios de aceptación

- [ ] `npm run build` sale 0.
- [ ] **Comprobador de profundidad** (recibe las rutas por argumento, para poder ejecutarse igual sobre una fixture): `node -e "const fs=require('fs');let mal=0;for(const f of process.argv.slice(1)){const j=JSON.parse(fs.readFileSync(f,'utf8'));const h=(j.editorialSections||[]).map(x=>x.heading);if(h.length<6||new Set(h).size!==h.length)mal++;if((j.faq||[]).length<6)mal++;if((j.safetyNotes||[]).length<4)mal++;if(j.shortDescription.length>180)mal++;}process.exit(mal?1:0)" src/content/tools/es/character-ai.json src/content/tools/es/perplexity.json` sale 0 — ambas fichas tienen al menos 6 secciones editoriales sin `heading` repetido, 6 FAQ y 4 advertencias.
- [ ] `node -e "const fs=require('fs');const j=JSON.parse(fs.readFileSync('src/content/tools/es/perplexity.json','utf8'));if(j.longDescription.length<600)process.exit(1)"` sale 0 — la `longDescription` de Perplexity deja de ser la más corta del lote (181 caracteres en la línea base).
- [ ] **Comprobador de plataformas** (recibe el slug de `tools-base` y la ruta del copy, para poder ejecutarse igual sobre una fixture): `node -e "const fs=require('fs');const A=process.argv.slice(1);const b=JSON.parse(fs.readFileSync('src/content/tools-base/'+A[0]+'.json','utf8'));const j=JSON.parse(fs.readFileSync(A[1],'utf8'));const RE={windows:/\bwindows\b/i,mac:/\bmac\b|\bmacos\b/i,linux:/\blinux\b/i,android:/\bandroid\b/i,ios:/\bios\b|\biphone\b|\bipad\b/i};const NEG=/\bno\b|\bsin\b|\búnicamente\b|\bsolo\b|\bausencia\b|\btampoco\b/i;const fr=[];const w=(v)=>{if(typeof v==='string')fr.push(...v.split(/(?<=[.:;!?])\s+/));else if(Array.isArray(v))v.forEach(w);else if(v&&typeof v==='object')Object.values(v).forEach(w)};for(const [k,v] of Object.entries(j)){if(k==='faq')for(const q of v)fr.push(q.question+' '+q.answer);else w(v)}let mal=0;for(const f of fr)for(const [p,re] of Object.entries(RE))if(re.test(f)&&!b.platforms[p]&&!NEG.test(f)){console.log(p+' :: '+f.slice(0,110));mal++}process.exit(mal?1:0)" character-ai src/content/tools/es/character-ai.json` sale 0, y lo mismo con `perplexity src/content/tools/es/perplexity.json`.

  **Qué comprueba exactamente, y qué no.** Recorre los valores de texto del JSON —las FAQ como pareja pregunta+respuesta, el resto partido en frases—, busca cada plataforma con **límites de palabra** sobre el texto real, no sobre el JSON serializado, y falla cuando una frase nombra una plataforma que `tools-base` no declara. Exime las frases que contienen una marca de ausencia (`no`, `sin`, `únicamente`, `solo`, `ausencia`, `tampoco`), porque hablar de la plataforma que falta es justamente lo que este lote exige. **No detecta** una afirmación de disponibilidad redactada con una de esas marcas en la misma frase, ni una perífrasis que evite el nombre de la plataforma; para eso está el criterio manual frase por frase, que sigue siendo la salvaguarda.
- [ ] `[manual]` **Prueba con dato inválido del comprobador de profundidad**, sobre una fixture real y sin tocar el repositorio: 1. `node -e "const fs=require('fs'),os=require('os'),p=require('path');const j=JSON.parse(fs.readFileSync('src/content/tools/es/character-ai.json','utf8'));const s=j.editorialSections||[];j.editorialSections=[...s,{heading:s[0].heading,body:'duplicado'}];const out=p.join(os.tmpdir(),'f3es-lote1-invalida.json');fs.writeFileSync(out,JSON.stringify(j));console.log(out)"` escribe en el directorio temporal del sistema una copia de la ficha con un `heading` duplicado e imprime su ruta; 2. ejecuta **el mismo comando del comprobador de profundidad** sustituyendo las dos rutas por la ruta impresa; 3. resultado esperado: sale 1, porque el comprobador lee el archivo de la fixture y detecta el `heading` repetido —si saliera 0, el comprobador no sirve—; 4. borra la fixture con `node -e "const fs=require('fs'),os=require('os'),p=require('path');fs.rmSync(p.join(os.tmpdir(),'f3es-lote1-invalida.json'),{force:true})"`.
- [ ] `[manual]` **Prueba con dato inválido del comprobador de plataformas**, sobre una fixture real y sin tocar el repositorio: 1. `node -e "const fs=require('fs'),os=require('os'),p=require('path');const j=JSON.parse(fs.readFileSync('src/content/tools/es/character-ai.json','utf8'));j.bestFor=[...(j.bestFor||[]),'Disponible para Windows con instalador propio'];const out=p.join(os.tmpdir(),'f3es-lote1-plataformas.json');fs.writeFileSync(out,JSON.stringify(j));console.log(out)"` escribe en el directorio temporal una copia de la ficha con una afirmación de disponibilidad **en prosa normal**, sin comillas alrededor del nombre de la plataforma, e imprime su ruta; 2. ejecuta **el mismo comando del comprobador de plataformas** con `character-ai` y la ruta impresa; 3. resultado esperado: sale 1 e imprime `windows :: Disponible para Windows…`. Es exactamente el caso que el comprobador anterior de esta spec no detectaba; 4. borra la fixture con `node -e "const fs=require('fs'),os=require('os'),p=require('path');fs.rmSync(p.join(os.tmpdir(),'f3es-lote1-plataformas.json'),{force:true})"`.
- [ ] `[manual]` Revisión frase por frase de las plataformas, como salvaguarda de lo que el comprobador no cubre: 1. lista las frases candidatas con `node -e "const fs=require('fs');const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));const RE=/\bwindows\b|\bmac\b|\bmacos\b|\blinux\b|\bandroid\b|\bios\b|\biphone\b|\bipad\b/i;const fr=[];const w=(v)=>{if(typeof v==='string')fr.push(...v.split(/(?<=[.:;!?])\s+/));else if(Array.isArray(v))v.forEach(w);else if(v&&typeof v==='object')Object.values(v).forEach(w)};w(j);for(const f of fr)if(RE.test(f))console.log('- '+f)" src/content/tools/es/character-ai.json` y repítelo con `perplexity`; 2. comprueba una por una que cada frase, o describe una plataforma declarada en `tools-base`, o dice que el catálogo no declara canal verificado para ella; 3. resultado esperado: ninguna frase promete disponibilidad en una plataforma no declarada, ni siquiera con una perífrasis que evite el nombre.
- [ ] `node -e "const fs=require('fs');const enlaces={'character-ai':['chatgpt','claude','gemini'],'perplexity':['chatgpt','gemini','claude','microsoft-copilot']};for(const [s,alts] of Object.entries(enlaces)){const t=fs.readFileSync('src/content/tools/es/'+s+'.json','utf8');for(const a of alts){if(t.includes('/es/'+a)&&!fs.existsSync('src/content/tools/es/'+a+'.json'))process.exit(1);}const m=t.match(/\/es\/[a-z0-9-]+/g)||[];for(const url of m){const slug=url.slice(4);if(slug!=='categoria'&&!fs.existsSync('src/content/tools/es/'+slug+'.json'))process.exit(1);}}"` sale 0 — todo enlace `/es/<slug>` del copy apunta a una ficha que existe.
- [ ] `node -e "const {execSync}=require('child_process');const out=execSync('git diff --name-only origin/main...HEAD').toString().split('\n').filter(Boolean);const permitidos=['src/content/tools/es/character-ai.json','src/content/tools/es/perplexity.json'];process.exit(out.every(f=>permitidos.includes(f))?0:1)"` sale 0 — el diff del lote solo toca los dos archivos que posee.
- [ ] `[manual]` Registro de verificación de canal: 1. abre cada URL de `platforms` de los dos slugs; 2. anota fecha y qué editor publica; 3. resultado esperado: el PR incluye esa tabla y ninguna afirmación del copy va más allá de lo anotado.
- [ ] `[manual]` Afirmación acotada sobre el escritorio: 1. localiza en `src/content/tools/es/character-ai.json` cada frase que hable de PC, ordenador o escritorio; 2. comprueba que cada una dice que el catálogo no declara un canal de escritorio verificado —o cita una verificación en la fuente oficial con URL y fecha, registrada en el PR—; 3. resultado esperado: ninguna frase afirma que el instalador no existe apoyándose solo en la ausencia en `tools-base`.
- [ ] `[manual]` Lectura above the fold: 1. abre `/es/character-ai` y `/es/perplexity` en el preview del build; 2. lee solo lo visible antes del primer scroll; 3. resultado esperado: en ambas se entiende el canal oficial por plataforma, y en Character.AI se entiende que la vía verificada en un ordenador es el navegador, sin que el texto afirme la inexistencia de un instalador.

## Riesgos conocidos

| Riesgo | Evidencia que lo detecta | Quién lo resuelve |
|---|---|---|
| El canal de escritorio de Perplexity no coincide con `platforms.windows` | La verificación previa obligatoria | Codex: decisión de catálogo sobre `tools-base` |
| Se describe una app homónima concreta y esta desaparece o cambia de nombre | La reverificación al abrir el PR | La sesión del lote, describiendo el criterio (editor que publica) en vez del nombre |
| El copy deriva hacia claims de seguridad al hablar de APK | Revisión editorial contra `AGENTS.md` y la regla común 4 | La sesión del lote |
| Las dos fichas acaban con la misma estructura de secciones | El criterio de `heading` repetido solo detecta duplicados dentro de una ficha; entre fichas lo detecta la revisión editorial | La sesión del lote |
| La ventana se cierra sin línea base de consultas: F1 (#36) ya está integrada y sus eventos son observables, pero #50 sigue abierto | La métrica secundaria no puede calcularse: no hay export de Search Console del producto `es` | Codex, al cerrar #50. Hasta entonces la entrega se declara verificada, no exitosa |
