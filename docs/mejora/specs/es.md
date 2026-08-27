# F3-ES — specs editoriales y UX del producto español

**Proyecto:** `docs/plan-mejora-productos-por-idioma.md`
**Issue:** #40
**Producto:** `es`
**Rama base:** `main` — rama de integración de la serie (`docs/mejora/decisiones.md`, registro 2026-08-27)
**Depende de:** F2-ES (#38, fusionada vía PR #51) y F0 (#35, fusionada vía PR #53)

> Documento de especificación. **No cambia código ni contenido.** Traduce la
> matriz de `docs/mejora/research/es.md` en lotes ejecutables por sesiones de
> F4-ES. Cada lote vive en su propia spec hija y es autosuficiente.

---

## Objetivo

Que una sesión limpia pueda ejecutar el trabajo editorial español sin releer el
research completo ni recuperar ninguna conversación: qué ficha toca, qué debe
responder antes del primer scroll, qué canal oficial verifica, qué secciones y
FAQ tiene que añadir, qué enlaces internos usa, qué eventos de funnel debe
poder observar y con qué ventana y métrica se juzga.

F3-ES **no** publica nada. Cierra la conversión de oportunidades en contratos.

## Contrato de entrada

- `docs/mejora/research/es.md` existe en `main` con la matriz de oportunidades
  (§4), los motivos de descarte (§5) y la secuencia propuesta (§6).
- `docs/mejora/decisiones.md` asigna a F3-ES la propiedad de
  `docs/mejora/specs/es.md` «y specs hijas que enumere», y protege
  `docs/mejora/specs/sv.md`, `docs/mejora/specs/it.md` y el contenido del sitio.
- El catálogo tiene 86 slugs en `src/content/tools-base/` y 86 fichas
  editoriales en `src/content/tools/es/`; **ninguna de las herramientas
  seleccionadas es una ficha nueva** (research §2.1).
- `src/content.config.ts` fija el esquema de ambos lados: `tools-base` (datos
  técnicos y canales) y `tools/<lang>` (copy localizado).
- `docs/ux-tool-pages.md` fija la estructura y el orden de secciones de la
  ficha renderizada; `docs/enlazado-interno.md` fija las reglas de enlazado;
  `docs/BRIEF-IMPLEMENTACION.md` y `docs/design-system.md` fijan el brief
  visual; `AGENTS.md` fija la política de fuentes y de claims.

### Entradas que **no** están disponibles y qué implican

| Entrada | Estado | Efecto sobre estas specs |
|---|---|---|
| Export de Google Search Console del producto `es` | **Ausente.** Blocker abierto: [issue #50](https://github.com/Gunz-cop/DescargasIA/issues/50) | Ninguna métrica de éxito puede expresarse hoy en impresiones, clics o posición. La sección «Ventana y métrica» de cada lote separa lo medible ahora de lo condicionado a #50 |
| Instrumentación de funnel (F1, #36) | **No fusionada.** El PR [#52](https://github.com/Gunz-cop/DescargasIA/pull/52) sigue abierto | Los eventos que estas specs citan son los del esquema de F1 y **no existen todavía en `main`**. Ninguna spec hija copia `src/utils/funnel-events.ts` ni da la dependencia por satisfecha |
| Ruta pública para `src/content/guides/` | **No existe.** `docs/enlazado-interno.md` §7 lo documenta y no hay `src/pages/[lang]/guias/[slug].astro` | La única página nueva propuesta por el research (fila 6) **no puede especificarse como publicable**. Su spec se entrega bloqueada con la pregunta a Codex |

Si alguna de las tres cambia de estado, se actualiza la spec hija afectada; no
se sustituye ninguna por una suposición.

## Contrato de salida

- `docs/mejora/specs/es.md` — esta spec madre: decisión por fila del research,
  reglas comunes a todos los lotes y orden de ejecución.
- `docs/mejora/specs/es/F3-ES-lote-1-canal-oficial-ausente.md` — filas 1 y 2
  (`character-ai`, `perplexity`).
- `docs/mejora/specs/es/F3-ES-lote-2-redistribucion.md` — filas 3 y 4
  (`ollama`, `cursor`).
- `docs/mejora/specs/es/F3-ES-lote-3-desambiguacion.md` — filas 5 y 11
  (`stable-diffusion`, `mistral-vibe`).
- `docs/mejora/specs/es/F3-ES-lote-4-guia-ia-local.md` — fila 6, **bloqueada**.

Cada spec hija es ejecutable por separado y declara sus propios archivos,
protegidos, criterios y riesgos.

## Decisión por fila del research

Una fila del research = una decisión aquí. No se añade ninguna oportunidad que
no esté en `docs/mejora/research/es.md` §4.

| Fila | Oportunidad | Decisión de F3-ES | Lote |
|---|---|---|---|
| 1 | `character ai descargar app oficial` | **Ficha** — reforzar `es/character-ai` | 1 |
| 2 | `descargar perplexity para windows` | **Ficha** — reforzar `es/perplexity`, con verificación previa del canal de escritorio | 1 |
| 3 | `descargar ollama para windows` | **Ficha** — reforzar `es/ollama` | 2 |
| 4 | `descargar cursor para windows` | **Ficha** — reforzar `es/cursor` | 2 |
| 5 | `stable diffusion descargar español` | **Ficha** — reforzar `es/stable-diffusion`, foco en desambiguación | 3 |
| 6 | `qué IA puedo usar sin conexión en mi PC` | **Guía de intención — bloqueada.** No hay ruta pública para `guides` y la decisión de `decisiones.md` sigue abierta | 4 |
| 7 | `descargar lm studio` | **Mantener.** Sin trabajo en F4-ES: es el clúster mejor cubierto en español y la ficha ya tiene 5 secciones editoriales y 4 FAQ | — |
| 8 | `alternativas a chatgpt privacidad` | **Descarte confirmado.** El ángulo dominante exige claims legales que `AGENTS.md` prohíbe | — |
| 9 | `open webui instalar sin docker` | **Descarte confirmado.** Baja competencia sin evidencia de demanda; la vía sin Docker no está soportada upstream | — |
| 10 | `herramientas de IA sin instalar nada` | **Descarte confirmado.** El formato ganador es la granja de listados, incompatible con la tesis del producto | — |
| 11 | `mistral vibe descargar` / `le chat mistral` | **Ficha** — reforzar `es/mistral-vibe`, foco en el nombre antiguo | 3 |
| 12 | `hugging face`, `gamma` | **Sin decisión.** El research declara ausencia de auditoría, no descarte. F3-ES no decide sin evidencia propia | — |

Los descartes de las filas 8, 9 y 10 se confirman **con el motivo del research**,
no con uno nuevo. Reabrirlos exige lo que `docs/mejora/research/es.md` §5 pide
en su columna «Qué lo reabriría».

## Archivos que posee

- `docs/mejora/specs/es.md` — esta spec madre.
- `docs/mejora/specs/es/F3-ES-lote-1-canal-oficial-ausente.md` — spec del lote 1.
- `docs/mejora/specs/es/F3-ES-lote-2-redistribucion.md` — spec del lote 2.
- `docs/mejora/specs/es/F3-ES-lote-3-desambiguacion.md` — spec del lote 3.
- `docs/mejora/specs/es/F3-ES-lote-4-guia-ia-local.md` — spec del lote 4.

F3-ES no posee ningún archivo fuera de esa lista. La propiedad de los JSON de
contenido se declara **dentro de cada spec hija** y pertenece a la sesión de
F4-ES que la ejecute, no a esta fase.

## PROTEGIDOS

- `docs/mejora/specs/sv.md`
- `docs/mejora/specs/it.md`
- `docs/mejora/research/es.md`
- `docs/mejora/research/sv.md`
- `docs/mejora/research/it.md`
- `docs/mejora/decisiones.md`
- `docs/mejora/baseline.md`
- `docs/mejora/fases/F0.md`
- `docs/mejora/fases/F1.md`
- `docs/mejora/templates/issue.md`
- `docs/mejora/templates/spec-fase.md`
- `AGENTS.md`
- `src/content/tools-base/`
- `src/content/tools/es/`
- `src/content/tools/sv/`
- `src/content/tools/it/`
- `src/content/guides/`
- `src/pages/`
- `src/components/`
- `src/layouts/`
- `src/utils/`
- `src/i18n/`
- `public/`
- `worker/`
- `scripts/`
- `.github/workflows/`
- `package.json`
- `package-lock.json`

`src/content/tools/es/` está protegido **para esta fase**: F3-ES escribe specs,
no fichas. Las specs hijas devuelven esa propiedad a F4-ES, archivo por archivo.

## Reglas comunes a todos los lotes

Estas reglas no se repiten enteras en cada hija; cada hija las referencia y
añade lo suyo.

### 1. Separación `tools-base` / copy localizado

- `src/content/tools-base/<slug>.json` contiene **datos técnicos y canales**:
  `officialWebsite`, `platforms` con `type`, `isOfficial` y `lastChecked`,
  `pricingModel`, `requiresAccount`, `alternatives`, `officialSources`,
  `trustLevel`, `lastReviewed`, `status`.
- `src/content/tools/es/<slug>.json` contiene **solo copy español**:
  `shortDescription`, `longDescription`, `bestFor`, `limitations`,
  `safetyNotes`, `editorialSummary`, `editorialSections`, `communityInsights`,
  `faq`, `spanishSupport`.
- Ninguna sesión de F4-ES edita `tools-base`. Si la verificación de canal
  encuentra una URL, un tipo o un estado desactualizados, **para y escala**: es
  una decisión de catálogo, no un arreglo de copy. Ver regla 3.
- El copy español no puede contradecir a `tools-base`. Si la ficha afirma una
  plataforma que `platforms` no declara, el error está en uno de los dos y se
  resuelve escalando, no escribiendo.

### 2. Registro editorial

Fijado por `docs/mejora/research/es.md` §1: español neutro con léxico
peninsular (`descargar`, `ordenador/PC` como forma principal; `computadora`
admitido como sinónimo; `bajar` nunca como término principal), tuteo, tono
informativo y verificador.

- Ninguna frase puede presentarse como demanda de un país concreto: el alcance
  declarado es hispanohablante multi-país sin evidencia segmentada
  (research §1.1).
- Prohibido traducir o adaptar copy de `sv/` o `it/`. Cada texto se escribe
  contra la evidencia española del research.
- Prohibido el texto genérico intercambiable entre fichas: si un párrafo vale
  igual para otra herramienta, no cumple.

### 3. Verificación de canal antes de escribir

`platforms.<plataforma>.lastChecked` de las herramientas seleccionadas es
`2026-08-12` (Cursor, además, `2026-08-15`). El research §6 es explícito: ese
sello **autoriza a priorizar, no a afirmar**.

Antes de escribir una sola frase sobre canales, la sesión de F4-ES:

1. abre cada URL de `platforms` del slug que va a tocar;
2. comprueba que sigue siendo el canal oficial del editor y que el `type`
   declarado coincide con lo que hay al otro lado;
3. si todo coincide, escribe;
4. si algo no coincide, **no escribe sobre ese canal**: registra la
   discrepancia con URL y fecha en el issue del lote y pide la decisión de
   catálogo. Ninguna sesión de F4-ES corrige `tools-base` por su cuenta.

### 4. Seguridad y claims

`AGENTS.md` manda: sin mirrors, sin APK de terceros, sin instaladores
modificados, sin claims de seguridad, auditorías, afiliaciones o endorsements.

- Los `safetyNotes` describen **hechos observables del canal** («esta app de la
  tienda la publica X», «el editor no distribuye instalador de escritorio»), no
  valoraciones legales ni de cifrado.
- Un portal de terceros observado en la SERP se puede describir como categoría
  («portales que redistribuyen el binario») sin enlazarlo ni recomendarlo.
- Toda afirmación sobre una app homónima de tienda debe poder comprobarse en la
  ficha de la tienda, y se cita como fuente.

### 5. Estructura y UX de la ficha

`docs/ux-tool-pages.md` fija el orden renderizado: header + CTA oficial →
alternativas → plataformas → «mejor para» → resumen editorial + byline →
`editorialSections` → `communityInsights` → `safetyNotes` → `limitations` →
`faq`. F4-ES **no cambia ese orden ni la plantilla**: solo rellena campos.

- La «respuesta above the fold» de cada lote se materializa en
  `shortDescription` (máx. 180 caracteres por esquema) y `editorialSummary`,
  que son lo primero que se lee antes del primer scroll.
- `editorialSections` es el cuerpo largo: headings propios, sin repetir la
  misma estructura literal entre fichas.
- `communityInsights` solo se añade con fuente real y verificable; si no la
  hay, no se añade. Es la regla ya vigente en `docs/ux-tool-pages.md`.

### 6. Enlaces internos

`docs/enlazado-interno.md` §3 manda:

- ninguna ruta interna se escribe a mano: en el copy, los enlaces a otras
  fichas usan el patrón `/es/<slug>` que generan los helpers de
  `src/utils/links.ts`, y el interstitial se enlaza como `/r?t=&p=&l=es`;
- el ancla es descriptiva (nombre de la herramienta o de la categoría), nunca
  «aquí» ni «ver más»;
- los enlaces a `/r` van con `rel="nofollow"`, que ya aplica la plantilla;
- **solo se enlazan slugs que existen** en `tools-base` y tienen ficha `es`;
- los cruces se hacen entre fichas de la misma familia (`alternatives` del
  propio `tools-base`), no se inventan relaciones nuevas.

Cada spec hija enumera los enlaces internos exactos que su lote debe dejar
existiendo.

### 7. Eventos de funnel

**Dependencia no satisfecha:** el módulo y los call sites son de F1 (#36) y su
PR [#52](https://github.com/Gunz-cop/DescargasIA/pull/52) no está fusionado en
`main`. Ninguna spec hija instrumenta nada: se limitan a declarar **qué evento
del esquema de F1 tiene que poder observarse** para que el lote se pueda juzgar.

Eventos del esquema de F1 que usan estas specs, sin añadir ninguno nuevo:
`ficha_view`, `platform_select`, `redirect_start`, `redirect_result`,
`redirect_error`, con los parámetros `lang`, `tool`, `platform` y `channel`.

Si #36 se fusiona antes que un lote, ese lote puede evidenciar su métrica de
comportamiento. Si no, la métrica queda declarada y sin medir, y así debe
reportarse.

### 8. Ventana y métrica de éxito

Regla común, particularizada en cada hija:

- **Ventana:** 90 días naturales desde la fusión del PR del lote, con un corte
  intermedio a 30 días para detectar regresiones.
- **Métrica primaria (condicionada a #36):** por `tool`, la proporción
  `platform_select` / `ficha_view` y `redirect_result` / `redirect_start`, y el
  recuento de `redirect_error` por `reason`.
- **Métrica secundaria (condicionada a #50):** impresiones, clics y posición
  media de las consultas del research para esa ficha en Search Console.
- **Comparación:** contra el mismo periodo previo a la publicación del lote. No
  se compara contra `sv` ni `it`: son productos distintos.
- Mientras #36 y #50 sigan abiertos, **ningún lote puede declarar éxito
  medido**. Puede declarar entrega verificada, que es otra cosa.

## Instrucciones

1. Lee `docs/mejora/research/es.md` entero antes de ejecutar cualquier lote: la
   spec hija cita evidencia, no la reproduce.
2. Ejecuta los lotes en el orden de la sección «Orden de ejecución». Un lote no
   depende de otro para escribir, pero el orden refleja el riesgo de clon.
3. Un lote = una rama = un PR contra `main`, enlazando el issue del lote.
4. Antes de escribir, aplica la regla común 3 (verificación de canal). Sin ella,
   el lote no puede empezar.
5. No amplíes el alcance de un lote con otra herramienta «ya que estamos». Una
   herramienta que no está en la tabla de decisión no tiene evidencia asignada.
6. Si una spec hija se queda corta para terminar, para y documenta el bloqueo en
   su issue. No inventes datos, fuentes, URLs ni resultados.

### Orden de ejecución

1. **Lote 1** — canal oficial ausente en la SERP (riesgo máximo de clon).
2. **Lote 2** — redistribución y builds alteradas.
3. **Lote 3** — desambiguación de producto y de marca.
4. **Lote 4** — bloqueado; no se ejecuta hasta que Codex cierre la decisión de
   ruta.

## Fuera de alcance

- Escribir, editar o borrar cualquier JSON de contenido — F4-ES, con la spec
  hija correspondiente.
- Tocar `src/content/tools-base/` — decisión de catálogo de Codex.
- Crear la ruta de guías, cambiar rutas, canonical, hreflang, robots o sitemap.
- Instrumentar eventos, elegir proveedor de analítica o crear dashboards — F1 y
  F7.
- Auditar la calidad de las fichas existentes — corresponde a la skill
  `descargasia-ficha-auditoria`, no a esta fase.
- Investigar `hugging face` o `gamma` (fila 12) — exige auditoría propia, que
  esta fase no tiene.
- Añadir herramientas nuevas al catálogo.

## Criterios de aceptación

- [ ] `node .claude/skills/sdd-fases/scripts/audit-specs.mjs docs/mejora/specs/es` sale 0 y reconoce las cuatro specs hijas.
- [ ] `node -e "const fs=require('fs');const t=fs.readFileSync('docs/mejora/specs/es.md','utf8');const h=['F3-ES-lote-1-canal-oficial-ausente','F3-ES-lote-2-redistribucion','F3-ES-lote-3-desambiguacion','F3-ES-lote-4-guia-ia-local'];for(const x of h){if(!t.includes(x))process.exit(1);if(!fs.existsSync('docs/mejora/specs/es/'+x+'.md'))process.exit(1);}"` sale 0.
- [ ] `node -e "const fs=require('fs');for(const s of ['character-ai','perplexity','ollama','cursor','stable-diffusion','mistral-vibe','lm-studio']){if(!fs.existsSync('src/content/tools-base/'+s+'.json'))process.exit(1);if(!fs.existsSync('src/content/tools/es/'+s+'.json'))process.exit(1);}"` sale 0 — todo slug citado por estas specs existe en ambos lados del catálogo.
- [ ] `node -e "const fs=require('fs');const d='docs/mejora/specs/es';const mal=fs.readdirSync(d).filter(f=>{const t=fs.readFileSync(d+'/'+f,'utf8');return !t.includes('src/content/tools-base/')||!t.includes('PROTEGIDOS')});process.exit(mal.length?1:0)"` sale 0 — cada spec hija declara sus protegidos y nombra explícitamente el lado `tools-base`.
- [ ] `node -e "const {execSync}=require('child_process');const out=execSync('git diff --name-only origin/main...HEAD').toString().split('\n').filter(Boolean);process.exit(out.every(f=>f.startsWith('docs/mejora/specs/'))?0:1)"` sale 0 — el diff de esta fase no toca nada fuera de `docs/mejora/specs/`.
- [ ] `[manual]` Prueba con dato inválido del criterio anterior: 1. `git commit --allow-empty -m tmp` y crea `src/content/tools/es/_tmp-f3.json` con `{}` y `git add -f src/content/tools/es/_tmp-f3.json && git commit -m tmp2`; 2. repite el comando del criterio anterior; 3. resultado esperado: sale 1 porque el diff incluye un archivo fuera de `docs/mejora/specs/`; 4. deshaz con `git reset --hard HEAD~2` y borra el archivo.

## Riesgos conocidos

| Riesgo | Evidencia que lo detecta | Quién lo resuelve |
|---|---|---|
| Un canal cambia entre la verificación y la publicación | Reverificación de la regla común 3 al abrir el PR del lote | La sesión del lote, escalando a Codex si `tools-base` está desactualizado |
| F1 (#36) no se fusiona nunca | La métrica primaria de cada lote queda sin datos | Codex: o fusiona #52, o F7 redefine la medición |
| #50 (Search Console) sigue abierto al cerrar la ventana de 90 días | No hay métrica secundaria comparable | Codex |
| Se publica copy que contradice `tools-base` | El criterio de coherencia de cada spec hija falla | La sesión del lote |
| El lote 4 se ejecuta sin ruta de guías | La guía quedaría escrita y no publicada, o forzaría un cambio de rutas fuera de alcance | Codex, cerrando la decisión abierta de `docs/mejora/decisiones.md` |
| Deriva de alcance hacia fichas sin evidencia | La tabla de decisión de esta spec no las contiene | La sesión del lote, parándose |
