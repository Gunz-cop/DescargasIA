# F3-ES · Lote 2 — redistribución y builds alteradas

**Spec madre:** `docs/mejora/specs/es.md`
**Research de origen:** `docs/mejora/research/es.md` §3.1, §3.3 y §4 (filas 3 y 4)
**Producto:** `es`
**Rama base:** `main`
**Ejecuta:** F4-ES
**Depende de:** F3-ES (#40) fusionada. Instrumentación de funnel F1 (#36) fusionada mediante PR #52 — ver «Eventos de funnel».

> Alcance: dos fichas existentes, `ollama` y `cursor`. **Ninguna ficha nueva.**
> Ninguna edición de `src/content/tools-base/`.

---

## Objetivo

Cubrir el hueco que el research documenta en dos consultas de descarga donde el
canal oficial existe y funciona, pero convive en la primera página con
**redistribución del binario** (Ollama) y con **builds alteradas distribuidas
como «Full/Portable»** (Cursor). Al terminar, las dos fichas explican qué es
exactamente el canal oficial, por qué una copia redistribuida no es lo mismo y
cómo se reconoce.

## Contrato de entrada

- `docs/mejora/research/es.md` §3.1: en `descargar Ollama para Windows`, 3 de 7
  resultados observados son portales que redistribuyen el binario fuera del
  canal oficial, uno de ellos ofreciendo una versión antigua como si fuera la
  actual. Ninguno de los resultados observados separa instalador oficial de
  redistribución.
- `docs/mejora/research/es.md` §3.3: en la consulta de Cursor se observan dos
  resultados de software alterado («Full + Portable») y contenido que aún
  dirige a un dominio antiguo (`cursor.sh`) junto al actual (`cursor.com`).
  Existe además competencia editorial española legítima.
- Estado del catálogo en la fecha de esta spec (2026-08-27), comprobado sobre
  el árbol del repositorio:

| Slug | `platforms` declaradas en `tools-base` | `lastChecked` | Ficha `es`: `editorialSections` / `faq` / `safetyNotes` / `longDescription` |
|---|---|---|---|
| `ollama` | `web` (`official-site`), `windows` (`official-installer`), `mac` (`official-installer`), `linux` (`documentation`) | 2026-08-12 | 5 / 4 / 2 / 296 caracteres |
| `cursor` | `web` (`official-site`), `windows` · `mac` · `linux` (`official-installer`) | 2026-08-12 · 2026-08-15 en las tres de escritorio | 5 / 4 / 1 / 318 caracteres |

- Nota de esquema relevante para el copy: en Ollama, **Linux no es un
  instalador**, es `documentation`. El copy no puede tratar las cuatro
  plataformas como si fueran lo mismo.

## Contrato de salida

- `src/content/tools/es/ollama.json` y `src/content/tools/es/cursor.json`
  actualizados según las decisiones de abajo, validados por `npm run build`.
- Registro de reverificación de canal en el PR del lote, con fecha por URL.
- Para Cursor, constancia explícita de qué se observó al comprobar el dominio
  antiguo `cursor.sh`, **sin** afirmar de antemano que redirige.

## Decisión por oportunidad

### Fila 3 — `descargar ollama para windows` → ficha `es/ollama`

| Campo de decisión | Contenido |
|---|---|
| **Tipo de página** | Ficha existente reforzada |
| **Intención primaria** | Transaccional: descargar e instalar |
| **Intenciones secundarias** | Confianza en el origen del binario, versión actual, requisitos de la máquina, uso sin conexión |
| **Respuesta above the fold** | Que el instalador se obtiene del sitio del proyecto y que cualquier binario servido por otro portal es una redistribución, con el riesgo concreto observado: versiones antiguas presentadas como actuales. Se materializa en `shortDescription` y `editorialSummary` |
| **Plataformas y canales** | `web` → `official-site`; `windows` y `mac` → `official-installer`; `linux` → `documentation`, es decir, instrucciones oficiales, no un archivo. Esa diferencia se explica, no se aplana |
| **Secciones editoriales** | Se conservan las 5 existentes. Se añade **1 nueva y única**: cómo distinguir el canal oficial de una redistribución y por qué la versión importa —el research observó una versión antigua ofrecida como vigente—. Ningún `heading` repetido |
| **FAQ** | Se conservan las 4 existentes y se añaden **2**: una sobre qué pasa si se instaló una copia bajada de un portal de terceros, y otra sobre cómo saber qué versión se está instalando. Respuestas basadas en hechos observables del canal |
| **Advertencias (`safetyNotes`)** | Hoy son 2; suben a **4 como mínimo**. Las nuevas cubren: (a) redistribución del binario en portales de descarga; (b) versiones desactualizadas presentadas como actuales. Descritas como categoría de resultado, sin enlazar ni nombrar como recomendación ningún portal |
| **Enlaces internos** | Alternativas ya declaradas en su `tools-base`: `/es/lm-studio`, `/es/jan`, `/es/gpt4all`, `/es/open-webui`. Categoría `/es/categoria/modelos-locales`. Y `/es/puedo-correr-ia`, la app de compatibilidad de hardware que ya existe en el sitio, porque la pregunta «qué modelo aguanta mi equipo» es la que el research ve sin responder (§3.5, §3.6) |
| **Eventos de funnel** | `ficha_view` con `tool=ollama`; `platform_select` distinguiendo `windows`/`mac`/`linux`; `redirect_start`/`redirect_result` con `channel` `official-installer` o `documentation`. Un `redirect_result` con `channel=documentation` en Linux es el comportamiento correcto, no un error |
| **Ventana y métrica** | Ventana de 90 días con corte a 30. Primaria (condicionada a #36): `platform_select`/`ficha_view` y `redirect_result`/`redirect_start`, con desglose por plataforma para ver si Linux se comporta distinto. Secundaria (condicionada a #50): consultas de §3.1 |

### Fila 4 — `descargar cursor para windows` → ficha `es/cursor`

| Campo de decisión | Contenido |
|---|---|
| **Tipo de página** | Ficha existente reforzada |
| **Intención primaria** | Transaccional: descargar el editor |
| **Intenciones secundarias** | Legitimidad del origen, coste real frente a las builds «Full» que prometen todo desbloqueado, compatibilidad con lo que ya se usa, plataforma |
| **Respuesta above the fold** | Que la descarga sale del sitio del editor y que las builds «Full/Portable» que circulan **no son mirrors, son software alterado**. Es la distinción que el research encontró ausente. Se materializa en `shortDescription` y `editorialSummary` |
| **Plataformas y canales** | `web` → `official-site`; `windows`, `mac` y `linux` → `official-installer`, las tres desde la página de descargas del editor |
| **Verificación obligatoria previa** | Comprobar qué hay hoy en el dominio antiguo `cursor.sh` y anotarlo. El copy solo puede decir lo observado; si el resultado no es concluyente, se omite el tema en vez de suponerlo |
| **Secciones editoriales** | Se conservan las 5 existentes. Se añade **1 nueva y única**: qué es una build «Full/Portable» y por qué no equivale a la versión gratuita del editor, con el criterio de origen —dominio del editor— como única prueba manejable por quien lee. Ningún `heading` repetido |
| **FAQ** | Se conservan las 4 existentes y se añaden **2**: una sobre las versiones «Full/Portable en español» que aparecen al buscar, y otra sobre el dominio antiguo, redactada **después** de la verificación. Si la verificación no concluye, se sustituye por una FAQ de plataforma y se documenta el cambio en el PR |
| **Advertencias (`safetyNotes`)** | Hoy es 1; suben a **3 como mínimo**: (a) builds alteradas distribuidas como «Full/Portable»; (b) descargas fuera del dominio del editor; (c) enlaces de descarga alojados en servicios de archivos. Sin claims de malware ni de auditoría: se describe lo que es, no lo que hace |
| **Enlaces internos** | Alternativa ya declarada en su `tools-base`: `/es/github-copilot`. Categoría `/es/categoria/programacion`. Interstitial `/r?t=cursor&p=windows&l=es` y equivalentes de `mac`, `linux` y `web` |
| **Eventos de funnel** | `ficha_view` con `tool=cursor`; `platform_select` por plataforma de escritorio; `redirect_start`/`redirect_result` con `channel=official-installer`. Un `redirect_error` con `reason=not_official` sobre este slug sería un fallo directo del lote |
| **Ventana y métrica** | Ventana de 90 días con corte a 30. Primaria (condicionada a #36): `platform_select`/`ficha_view` y `redirect_result`/`redirect_start`. Secundaria (condicionada a #50): consultas de §3.3. La competencia editorial española es real y correcta, así que la métrica secundaria se lee como participación, no como desplazamiento |

## Archivos que posee

- `src/content/tools/es/ollama.json` — copy español de la fila 3.
- `src/content/tools/es/cursor.json` — copy español de la fila 4.

## PROTEGIDOS

- `src/content/tools-base/ollama.json`
- `src/content/tools-base/cursor.json`
- `src/content/tools/es/character-ai.json`
- `src/content/tools/es/perplexity.json`
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

## Instrucciones

1. Aplica la regla común 3 de `docs/mejora/specs/es.md`: reverifica cada URL de
   `platforms` de los dos slugs, incluida la de Linux de Ollama, que es
   documentación y no un archivo.
2. Comprueba el dominio antiguo de Cursor antes de escribir sobre él. Anota lo
   observado con fecha.
3. Escribe el copy según la tabla de decisión. Registro editorial: regla común
   2 de la spec madre.
4. Al describir portales de redistribución, hazlo como categoría de resultado.
   No los enlaces, no los cites como fuente y no afirmes qué contienen sus
   archivos: el research observó su existencia y su desactualización, no su
   contenido binario.
5. Respeta el esquema de `src/content.config.ts`.
6. Ejecuta `npm run build` y no cierres el lote con ninguna auditoría en rojo.
7. Abre un PR contra `main` enlazando el issue del lote, con el registro de
   verificación en la descripción.

## Fuera de alcance

- Editar `src/content/tools-base/`, incluida cualquier corrección de URL o de
  `lastChecked`.
- Tocar otras fichas `es`, incluidas `lm-studio`, `jan`, `gpt4all`,
  `open-webui` y `github-copilot`, que solo se enlazan.
- Escribir una guía de instalación paso a paso: el research observó que ese
  formato ya está cubierto en español (§3.3, §3.6) y la ficha no es una guía.
- Afirmar que un binario redistribuido contiene malware.
- Instrumentar eventos de funnel — F1 (#36).
- Crear o modificar la app de compatibilidad de hardware; solo se enlaza.

## Criterios de aceptación

- [ ] `npm run build` sale 0.
- [ ] `node -e "const fs=require('fs');const min={ollama:{s:6,f:6,n:4},cursor:{s:6,f:6,n:3}};for(const [s,m] of Object.entries(min)){const j=JSON.parse(fs.readFileSync('src/content/tools/es/'+s+'.json','utf8'));const h=(j.editorialSections||[]).map(x=>x.heading);if(h.length<m.s)process.exit(1);if(new Set(h).size!==h.length)process.exit(1);if((j.faq||[]).length<m.f)process.exit(1);if((j.safetyNotes||[]).length<m.n)process.exit(1);if(j.shortDescription.length>180)process.exit(1);if(j.longDescription.length<600)process.exit(1);}"` sale 0.
- [ ] **Comprobador de destinos** (recibe las rutas por argumento, para poder ejecutarse igual sobre una fixture): `node -e "const fs=require('fs');const prohibidos=['uptodown','malavida','onworks','softonic','artistapirata','mega.nz'];let mal=0;for(const f of process.argv.slice(1)){const t=fs.readFileSync(f,'utf8').toLowerCase();for(const d of prohibidos)if(t.includes(d))mal++;}process.exit(mal?1:0)" src/content/tools/es/ollama.json src/content/tools/es/cursor.json` sale 0 — el copy no enlaza ni nombra como destino ninguno de los portales de redistribución observados en la SERP.
- [ ] `[manual]` **Prueba con dato inválido del comprobador de destinos**, sobre una fixture real y sin tocar el repositorio: 1. `node -e "const fs=require('fs'),os=require('os'),p=require('path');const j=JSON.parse(fs.readFileSync('src/content/tools/es/ollama.json','utf8'));j.safetyNotes=[...(j.safetyNotes||[]),'Descarga alternativa en uptodown.com'];const out=p.join(os.tmpdir(),'f3es-lote2-invalida.json');fs.writeFileSync(out,JSON.stringify(j));console.log(out)"` escribe en el directorio temporal una copia de la ficha con un destino prohibido e imprime su ruta; 2. ejecuta **el mismo comando del comprobador de destinos** con esa ruta como único argumento; 3. resultado esperado: sale 1; 4. borra la fixture con `node -e "const fs=require('fs'),os=require('os'),p=require('path');fs.rmSync(p.join(os.tmpdir(),'f3es-lote2-invalida.json'),{force:true})"`.
- [ ] `node -e "const fs=require('fs');for(const s of ['ollama','cursor']){const b=JSON.parse(fs.readFileSync('src/content/tools-base/'+s+'.json','utf8'));const t=fs.readFileSync('src/content/tools/es/'+s+'.json','utf8');const m=t.match(/\/r\?t=([a-z0-9-]+)&p=([a-z]+)/g)||[];for(const url of m){const p=url.split('p=')[1];if(!b.platforms[p])process.exit(1);}}"` sale 0 — ningún enlace al interstitial usa una plataforma que `tools-base` no declara.
- [ ] `node -e "const fs=require('fs');const t=fs.readFileSync('src/content/tools/es/ollama.json','utf8');const alts=['lm-studio','jan','gpt4all','open-webui','puedo-correr-ia'];const m=t.match(/\/es\/[a-z0-9-]+/g)||[];for(const url of m){const slug=url.slice(4);if(slug==='categoria')continue;if(alts.includes(slug))continue;if(!fs.existsSync('src/content/tools/es/'+slug+'.json'))process.exit(1);}"` sale 0 — todo enlace interno de la ficha de Ollama apunta a una ficha existente o a una de las rutas previstas.
- [ ] `node -e "const {execSync}=require('child_process');const out=execSync('git diff --name-only origin/main...HEAD').toString().split('\n').filter(Boolean);const ok=['src/content/tools/es/ollama.json','src/content/tools/es/cursor.json'];process.exit(out.every(f=>ok.includes(f))?0:1)"` sale 0.
- [ ] `[manual]` Verificación de canal: 1. abre las cuatro URL de Ollama y las cuatro de Cursor; 2. anota fecha, editor y tipo de destino; 3. resultado esperado: coincide con `platforms` y el PR incluye la tabla. Si no coincide, el criterio falla y el lote escala en vez de escribir.
- [ ] `[manual]` Dominio antiguo de Cursor: 1. abre `cursor.sh`; 2. anota a dónde lleva y en qué fecha; 3. resultado esperado: el copy dice exactamente eso, o no menciona el dominio.

## Riesgos conocidos

| Riesgo | Evidencia que lo detecta | Quién lo resuelve |
|---|---|---|
| Describir un portal de redistribución acaba pareciendo una recomendación | El criterio de dominios prohibidos y la revisión editorial | La sesión del lote |
| El dominio antiguo de Cursor cambia de comportamiento | La verificación manual con fecha | La sesión del lote |
| El copy trata la documentación de Linux de Ollama como si fuera un instalador | El criterio de plataformas del interstitial y la lectura de la ficha | La sesión del lote |
| Se cruza la frontera hacia la guía paso a paso | «Fuera de alcance» y la estructura de `docs/ux-tool-pages.md` | La sesión del lote |
| F1 (#36) sin detección de eventos de funnel al cerrar la ventana | No hay eventos que observar | Codex |
