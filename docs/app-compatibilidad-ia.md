# Plan de implementación — App "¿Qué modelos de IA puedo correr en mi máquina?"

> **Spec de producto.** Contiene el porqué, la arquitectura y las decisiones cerradas.
> El contrato de cada fase está en `docs/fases/F<n>.md`; el trabajo pendiente, en los
> issues de GitHub. Si vas a ejecutar una fase, leé `AGENTS.md`, este documento y la
> spec de tu fase — nada más hace falta.
>
> - Creado: 2026-08-23
> - Alcance v1 cerrado: solo LLMs de texto (GGUF/Ollama), es/sv/it, veredicto determinista
> - **El estado no se escribe aquí.** Vive en las etiquetas de los issues; se consulta con `node scripts/estado-fases.mjs`

## Contexto

FuenteAI (`/home/user/DescargasIA`) es hoy un directorio Astro **100 % estático** de 86 fichas de herramientas de IA en `es/sv/it`, desplegado en Cloudflare como assets sin runtime de servidor. Todo el sitio es contenido; no hay ninguna herramienta interactiva propia.

**El problema a resolver:** los comprobadores de compatibilidad de LLM locales que existen (todos en inglés) fuerzan al usuario a elegir su hardware de un combo box cerrado. Si tu GPU no está en la lista —caso típico de las variantes *Laptop*, iGPU y modelos regionales— la herramienta simplemente no te sirve. El usuario probó varios y su propia gráfica de portátil no aparecía.

**Resultado buscado:** una app en el sitio donde el usuario (1) **escriba** su hardware en texto libre, con el combo box como ayuda y no como cárcel; (2) opcionalmente deje que el navegador **detecte** lo básico; y (3) obtenga un veredicto claro y explicado de qué LLMs puede correr en local, con enlace a las fichas del catálogo que ya explican cómo instalarlos.

**Valor secundario:** es la primera pieza de utilidad real del sitio (no contenido informativo), genera enlazado interno hacia las fichas de Ollama/LM Studio/Jan, y es contenido genuinamente original —justo lo que un revisor de AdSense premia frente a un directorio de fichas.

### Decisiones ya cerradas con el usuario

| Decisión | Elección |
|---|---|
| Backend | **Worker + assets** en el mismo `wrangler.jsonc`. Astro sigue `output: 'static'`; el Worker sirve `/api/*` y delega el resto a `env.ASSETS`. Cero riesgo para las 86 fichas y el SEO. |
| Rol de la IA | **Motor determinista decide; la IA asiste.** La matemática de VRAM/RAM/cuantización emite el veredicto (reproducible y auditable). Workers AI solo normaliza texto libre, resuelve GPUs desconocidas y redacta la explicación. |
| Alcance v1 | **Solo LLMs de texto (GGUF/Ollama).** Imagen/audio/video quedan fuera. |
| Idiomas y datos | **es/sv/it desde el día uno** (el audit exige hreflang recíproco) + **catálogo curado y versionado en el repo**, sin dependencias de terceros en runtime. |

### Restricciones del repo que condicionan el diseño

- `npm run build` encadena `catalog:audit` + `astro build` + `links:audit`. **Una página indexable con 0 enlaces entrantes es ERROR ("página HUÉRFANA")** → la app debe enlazarse desde `BaseLayout` (nav desktop + menú móvil) sí o sí.
- Canonical autorreferencial y **hreflang recíproco entre los 3 idiomas** son error duro → hay que publicar `es`, `sv` e `it` a la vez y usar `buildAlternates`.
- **Ninguna ruta interna se escribe a mano** (`AGENTS.md`, "regla de oro"): todo sale de `src/utils/links.ts`.
- No hay islas de framework (React/Vue/Svelte) ni ganas de introducirlas: la interactividad es **JS vanilla en `<script>` al pie del `.astro`**, patrón de `src/components/Directory.astro`.
- Tailwind v4 sin config JS; tokens `fai-*` en `@theme` dentro de `src/styles/global.css`. Sitio **solo oscuro**.
- No existe componente de tooltip ni de combobox. Hay que crearlos.
- Si la página usa query params, hay que añadirlos a `public/robots.txt` (precedente: `?q=`, `?cat=`).

---

## Arquitectura propuesta

```
Navegador (estático, funciona sin JS y sin red)
  ├─ Formulario editable  ── combobox "creatable" sobre gpus.json  ← el usuario SIEMPRE puede escribir
  ├─ Autodetección opt-in ── WebGPU adapter.info / WebGL renderer / deviceMemory
  └─ MOTOR DETERMINISTA (TS puro, mismo código en cliente y Worker)
         weights + KV cache + overhead  vs  VRAM / RAM unificada / RAM sistema
         → veredicto + tok/s estimados + cuantización recomendada
                 │
                 │  (opcional, degradable — si falla, la app sigue entera)
                 ▼
Worker `/api/hw/*` (Cloudflare, binding AI + KV)
  ├─ POST /parse       texto libre → specs estructuradas (JSON mode)
  ├─ POST /gpu-lookup  GPU fuera de la base → VRAM/ancho de banda estimados (cacheado en KV)
  └─ POST /explain     números deterministas → prosa localizada
```

Regla de oro del diseño: **ningún número del veredicto sale de la IA.** La IA solo convierte lenguaje a datos y datos a lenguaje.

---

## Modelo de ejecución

Este proyecto **no se implementa en una sola sesión**. Se ejecuta como *spec-driven development*, con el método empaquetado en la skill `.claude/skills/sdd-fases/`:

| Pieza | Rol |
|---|---|
| Este documento | Spec de producto: el porqué, la arquitectura y las decisiones cerradas. |
| `docs/fases/F<n>.md` | Spec autoritativa de cada fase. **Es lo que lee la sesión ejecutora.** |
| El issue de GitHub | La orden de trabajo y la fuente de verdad del estado. |
| La sesión ejecutora | Desechable: nace, hace una fase, abre PR, muere. |
| La sesión revisora | Corre los criterios, revisa el PR y corrige specs. Reemplazable. |

Ninguna sesión de Claude Code es memoria durable —tampoco la que coordina—, así que la memoria vive en el repo. Es la misma apuesta que ya hace `scripts/harness/run.sh`.

### Las reglas que lo sostienen

1. **Criterios de aceptación ejecutables.** Cada criterio es un comando que sale 0 o 1. Si una fase necesita que alguien juzgue "¿esto está bien?", la spec falló y se arregla la spec.
2. **El examen es intocable.** Cada spec declara `PROTEGIDOS`: los archivos que su sesión ejecutora no puede modificar. Si el examinado puede editar la compuerta, el veredicto no vale nada.
3. **El issue apunta a la spec, no la copia.**
4. **Si una sesión no puede terminar leyendo solo su spec, el bug es de la spec.** Se corrige la spec y se relanza.

### Cómo se arranca una fase

```
Trabajás en el repo Gunz-cop/DescargasIA.

Usá /goal para planificar y ejecutar esto:

Leé, en este orden: AGENTS.md, docs/app-compatibilidad-ia.md y docs/fases/F<n>.md.

Implementá la fase F<n> completa contra la rama claude/ai-model-compatibility-plan-ptlr3j
(hacé checkout de esa rama; ya existe).

No modifiques ningún archivo de la lista PROTEGIDOS de la spec.

Cuando todos los criterios de aceptación pasen, abrí un PR con "Closes #<issue>" en el
cuerpo y suscribite a la actividad del PR con subscribe_pr_activity: quedás a cargo de
llevarlo a verde y de atender los comentarios hasta que se fusione o se cierre.

Si algo de la spec no te alcanza para trabajar, no improvises: comentá en el issue #<issue>
qué faltaba. Eso es un bug de la spec, no tuyo.
```

**`/goal` hace que la sesión presente un plan antes de escribir código**, que es el punto de máximo apalancamiento: revisar veinte líneas de plan cuesta un minuto; revisar el PR resultante, una hora, y para entonces las decisiones de fondo ya están tomadas. El costo es que **se bloquea esperando tu aprobación**: si vas a lanzar la sesión y desconectarte, quitá esa línea.

**La sesión ejecutora se suscribe a su propio PR** y queda a cargo de llevarlo a verde. Sigue siendo desechable para trabajo nuevo —no se le encarga otra fase— pero no abandona lo que abrió. Para que no se pise con la revisora: la ejecutora **empuja código**, la revisora **comenta y corrige specs**, y ninguna de las dos fusiona.

**Integración:** todas las fases abren PR contra `claude/ai-model-compatibility-plan-ptlr3j`. Nada llega a `main` hasta que la app esté completa y verde: `deploy.yml` despliega en cada push a `main`.

**Los criterios los corre GitHub, no el examinado.** `.github/workflows/ci.yml` ejecuta en cada pull request las mismas ocho comprobaciones que corre quien revisa: specs bien formadas, los tres audits, tests, tipos, build, enlazado y —si la rama trae Worker— `wrangler deploy --dry-run`. Cada una aparece como un check separado en el PR.

Validá las specs en local con `node .claude/skills/sdd-fases/scripts/audit-specs.mjs`.

### Tablero

Esta tabla describe **estructura y dependencias**: hechos estables y versionados. **No lleva columna de estado, a propósito.**

El estado es un hecho volátil y vive en un único sitio: las etiquetas `estado:*` de los issues. Mantenerlo también aquí obligaría a cada sesión a actualizar dos sistemas, y dos representaciones del mismo hecho derivan siempre. Para ver el estado real:

```bash
node scripts/estado-fases.mjs
```

| Fase | Spec | Depende de | Issue | Área |
|---|---|---|---|---|
| F0 | Fundaciones, tipos, specs e issues — [`F0.md`](fases/F0.md) | — | [#5](https://github.com/Gunz-cop/DescargasIA/issues/5) | meta |
| F1 | Datos: GPUs, modelos y cuantizaciones — [`F1.md`](fases/F1.md) | F0 | [#6](https://github.com/Gunz-cop/DescargasIA/issues/6) | datos |
| F2 | Motor determinista + tests — [`F2.md`](fases/F2.md) | F0 | [#7](https://github.com/Gunz-cop/DescargasIA/issues/7) | motor |
| F3 | Página, i18n, SEO y enlazado (sin JS) — [`F3.md`](fases/F3.md) | F1 | [#8](https://github.com/Gunz-cop/DescargasIA/issues/8) | frontend |
| F4 | UI interactiva: combobox, tooltips, resultados — [`F4.md`](fases/F4.md) | F2, F3 | [#9](https://github.com/Gunz-cop/DescargasIA/issues/9) | frontend |
| F5 | Autodetección de hardware — [`F5.md`](fases/F5.md) | F3 | [#10](https://github.com/Gunz-cop/DescargasIA/issues/10) | frontend |
| F6 | Worker + Workers AI — [`F6.md`](fases/F6.md) | F1, F2 | [#11](https://github.com/Gunz-cop/DescargasIA/issues/11) | worker |
| F7 | Endurecimiento: límites, caché, privacidad — [`F7.md`](fases/F7.md) | F6 | [#12](https://github.com/Gunz-cop/DescargasIA/issues/12) | worker |
| F8 | QA, accesibilidad, rendimiento y lanzamiento — [`F8.md`](fases/F8.md) | todas | [#13](https://github.com/Gunz-cop/DescargasIA/issues/13) | qa |

```
                F1 ──────┬─ F3 ──┬─ F4
               /         │       └─ F5      ┐
        F0 ───┤          │                  ├─ F8
               \         └─ F6 ── F7        ┘
                F2 ──────┘
```

F1 y F2 son independientes entre sí y pueden ejecutarse en paralelo, en sesiones distintas.

F1 y F2 pueden ir en paralelo. F4 y F5 pueden ir en paralelo. F6 puede arrancar en cuanto F1+F2 estén cerradas.

---

## F0 — Fundaciones, tipos y tablero

**Objetivo:** fijar el contrato de datos para que F1, F2 y F6 avancen sin pisarse.

**Archivos que posee:**
- `docs/app-compatibilidad-ia.md` (nuevo) — plan + tablero.
- `src/lib/hardware/types.ts` (nuevo) — `GpuSpec`, `SystemSpecs`, `ModelSpec`, `QuantSpec`, `Estimate`, `Verdict`, `Backend`.
- `src/utils/links.ts` (editar) — añadir `HARDWARE_SLUG = 'puedo-correr-ia'` y `hardwareUrl(lang)`.
- `src/i18n/ui.ts` (editar) — bloque de claves `hw.*` en `es`, `sv`, `it` (esqueleto; el copy final lo rellenan F3/F4).

**Decisiones que fija:**
- Slug **estable en los 3 idiomas**: `/puedo-correr-ia` (precedente: `acerca-de`, `aviso-legal` son slugs en español también en sv/it, y `categoria` no se traduce a propósito para mantener el mapeo hreflang 1:1).
- `SystemSpecs` es el único objeto que cruza cliente ↔ Worker: `{ gpu?: {id?, rawName, vramGb, bandwidthGbs?, vendor, source}, ram: {totalGb, source}, cpu?: {rawName, cores?}, os: 'windows'|'macos'|'linux'|'unknown', unifiedMemory: boolean }`. Cada campo lleva `source: 'user' | 'detected' | 'db' | 'ai-estimate'` — **es lo que permite mostrar honestamente qué es dato y qué es estimación**.
- Todo `src/lib/hardware/*` es **TS puro sin DOM y sin imports de Astro**, para que lo consuman igual la página y el Worker.

**Aceptación:** `npx astro check` (o `tsc --noEmit`) limpio; `npm run build` verde; los helpers de `links.ts` exportados y tipados.

---

## F1 — Datos: GPUs, modelos y cuantizaciones

**Objetivo:** la base curada que hace que la app acierte donde las otras fallan.

**Archivos que posee:** `src/data/hardware/gpus.json`, `models.json`, `quants.json`, `apple-silicon.json`, y `scripts/audit-hardware-data.mjs` (nuevo).

### `gpus.json` (~350–450 entradas, es el diferenciador)
`{ id, name, aliases[], vendor, vramGb, bandwidthGbs, arch, year, formFactor: 'desktop'|'laptop'|'integrated'|'workstation' }`

Cobertura mínima obligatoria:
- NVIDIA GeForce **desktop** GTX 900 → RTX 50, y **todas las variantes Laptop** (`RTX 4060 Laptop GPU`, `RTX 3060 Laptop`, Max-Q…) — este es el hueco concreto que motivó el proyecto.
- NVIDIA workstation (RTX A-series, Quadro) y datacenter común (T4, L4, A100).
- AMD RX 5000→9000, Radeon integradas (680M/780M/890M).
- Intel Arc A/B-series y iGPU Iris Xe / UHD.
- Apple Silicon en `apple-silicon.json`: M1→M4 (base/Pro/Max/Ultra) con **memoria unificada**, no VRAM (`unifiedMemory: true`, fracción utilizable por defecto 0,75, nota sobre `iogpu.wired_limit_mb`).

`aliases[]` debe cubrir cómo escribe la gente de verdad: `"3060ti"`, `"rtx 3060 ti"`, `"nvidia geforce rtx 3060 ti"`, `"RTX3060Ti"`, y las cadenas exactas que devuelve `WEBGL_debug_renderer_info`.

Fuentes de referencia para poblarlo (verificar VRAM contra la ficha del fabricante antes de escribir; no inventar cifras): TechPowerUp GPU Database y los datasets abiertos derivados (`RightNow-AI/RightNow-GPU-Database`, `painebenjamin/dbgpu`, `voidful/gpu-info-api`). Registrar en el JSON la fecha de revisión.

### `models.json` (~45–60 modelos)
`{ id, family, displayName, paramsB, activeParamsB?, numLayers, numKvHeads, headDim, contextMax, license, hfRepo, ollamaTag, useCases[], quants: [{ name, bpw, fileSizeGb }] }`

Los campos de arquitectura (`numLayers`, `numKvHeads`, `headDim`) **no son opcionales**: sin ellos el KV cache no se puede calcular y el veredicto sería el error clásico de "cabe el modelo" seguido de OOM al pegar un documento largo. Salen del `config.json` del repo en Hugging Face.

`fileSizeGb` por cuantización sale del tamaño real del `.gguf` publicado (bartowski / unsloth / el repo oficial), no de una fórmula. Cubrir Q4_K_M, Q5_K_M, Q6_K, Q8_0 como mínimo, y Q3_K_M/Q2_K en los modelos grandes.

Familias a cubrir: Llama, Qwen, Mistral/Mixtral, Gemma, Phi, DeepSeek(-R1 destilados), Granite, SmolLM, Nemotron. Incluir MoE marcando `activeParamsB` (afecta velocidad, no memoria).

### `quants.json`
Tabla `bpw` efectivos por cuantización + una nota de calidad por nivel (Q4_K_M como punto dulce; Q2_K con aviso explícito de degradación).

**`scripts/audit-hardware-data.mjs`** (se encadena en `npm run build`): valida esquema con zod, IDs únicos, alias sin colisiones entre GPUs distintas, VRAM > 0, `bpw` coherente con `fileSizeGb / paramsB`, y que cada `useCases[]` referencie una categoría existente. Sale con código 1 si falla, igual que `audit-catalog.mjs`.

**Aceptación:** el audit pasa; búsqueda manual de 20 nombres reales escritos "como usuario" resuelve correctamente (incluida al menos una GPU Laptop y un Apple Silicon).

---

## F2 — Motor determinista + tests

**Objetivo:** la matemática que emite el veredicto. Es el corazón auditable del producto.

**Archivos que posee:** `src/lib/hardware/resolve.ts`, `estimate.ts`, `recommend.ts`, `format.ts`, y `tests/hardware/*.test.mjs`. Añade `"test": "node --test tests/"` a `package.json` y lo encadena en `build`.

**`resolve.ts` — matcher local difuso** (sin IA): normaliza (minúsculas, sin acentos, colapsa espacios, separa `3060ti`→`3060 ti`), tokeniza y puntúa contra `name` + `aliases`. Devuelve `{ gpu, score, candidates[] }`. Umbral alto → match directo; umbral medio → "¿quisiste decir…?" con hasta 3 candidatos; sin match → la vía de escape (el usuario teclea la VRAM, o F6 pregunta a la IA). **La IA nunca es el primer recurso**: el matcher local resuelve la mayoría sin red.

**`estimate.ts` — fórmulas**

```
weights   = paramsB * 1e9 * bpw / 8
kvCache   = 2 * numLayers * numKvHeads * headDim * ctxTokens * kvBytes   // kvBytes: f16=2, q8=1
overhead  = 0.6 GB (runtime/CUDA/Vulkan) + 5 % de weights (activaciones)
required  = weights + kvCache + overhead
```

Y tres modos de ejecución evaluados en orden:
1. **GPU completa** — `required <= vramGb * 0.92` (el 8 % se reserva para el escritorio/compositor).
2. **Offload parcial** — se calcula cuántas capas caben en VRAM y el resto en RAM; se marca "funciona con ajustes" y se avisa de la caída de velocidad.
3. **CPU / memoria unificada** — Apple Silicon usa `ramGb * 0.75`; x86 CPU-only usa RAM del sistema menos 3 GB de SO.

**Velocidad estimada (roofline de ancho de banda):** `tok/s ≈ bandwidthGbs / modelSizeGb * eficiencia` (0,7 GPU, 0,5 CPU; en MoE se usa `activeParamsB`). Se presenta siempre como **rango con aviso de aproximación**, nunca como cifra exacta.

**Veredictos:** `holgado` / `funciona` / `justo` / `no-cabe`, con la razón (`limitado por VRAM`, `limitado por contexto`, `sin GPU compatible`) y la **mejor cuantización recomendada** = la de mayor calidad que entra con margen.

**`recommend.ts`:** ordena el catálogo para unas specs dadas y agrupa por caso de uso (`chat general`, `código`, `razonamiento`, `resumen de documentos`).

**Tests (`node --test`), obligatorios:**
- Casos dorados: `RTX 4060 Laptop 8 GB` + Llama-3.1-8B-Q4_K_M → cabe a 4 k de contexto, **no** cabe a 32 k (el caso que rompe a los competidores).
- `M2 Pro 16 GB` unificada; `RTX 3090 24 GB`; `iGPU + 16 GB RAM` (debe caer a CPU-only); `RTX 4090 + 70B` (offload parcial).
- Resolver: 25 cadenas escritas como un humano → GPU esperada.
- **Paridad de i18n**: `Object.keys(ui.es)` ⊇ claves usadas, y `sv`/`it` tienen exactamente el mismo conjunto de claves que `es` (el explorador detectó riesgo real de deriva).

**Aceptación:** `npm test` verde; ninguna función toca `document`, `window` ni `import.meta.env`.

---

## F3 — Página, i18n, SEO y enlazado (funcional sin JS)

**Objetivo:** la página existe, se indexa, se enlaza y **sirve aunque el JS no cargue**.

**Archivos que posee:** `src/pages/[lang]/puedo-correr-ia.astro` (nuevo), `src/components/hardware/ModelTable.astro` (nuevo), `src/layouts/BaseLayout.astro` (editar: nav desktop + menú móvil), `public/robots.txt` (editar), `src/i18n/ui.ts` (copy de la página).

- `getStaticPaths()` sobre `Object.keys(languages)` — **sin excluir `es`** (solo la portada excluye `es`). Plantilla: `src/pages/[lang]/acerca-de.astro`.
- `BaseLayout` con `title`, `description`, `lang`, `alternates={buildAlternates(Astro.url.origin, (l) => hardwareUrl(l))}` y `jsonLd` con `WebApplication` + `BreadcrumbList` + `FAQPage`. El `author`/`publisher` sale de `src/data/editorial-team.ts` como `Organization`, nunca `Person` (convención del sitio).
- **Enlace desde `BaseLayout`** (nav desktop y menú móvil) usando `hardwareUrl(lang)` — sin esto `links:audit` marca HUÉRFANA y rompe el build. Enlazar además desde la home y desde las fichas de Ollama / LM Studio / Jan.
- **Estado sin JS:** el servidor renderiza `ModelTable.astro`, una tabla completa del catálogo con VRAM aproximada por cuantización. Es contenido indexable de valor por sí mismo (y lo que hace que la página no sea *thin content* para AdSense). El `.no-js` del sitio ya cubre el patrón.
- `robots.txt`: añadir los params de la app (`?gpu=`, `?vram=`, `?ram=`, `?os=`) al bloque de `Disallow` de querystrings, igual que `?q=`/`?cat=`.
- Copy: etiquetas cortas en `ui.ts` (`hw.*`) en los 3 idiomas; prosa larga con el ternario `lang === 'sv' ? … : lang === 'it' ? … : …`, patrón vigente en `Home.astro` y `[slug].astro`.

**Aceptación:** `npm run build` verde con ambos audits; con JS desactivado la página muestra la tabla completa y es navegable; hreflang recíproco en los 3 idiomas.

---

## F4 — UI interactiva: combobox, tooltips y resultados

**Objetivo:** la experiencia. Móvil primero, elegante, con tooltips que enseñan.

**Archivos que posee:** `src/components/hardware/SpecsForm.astro`, `ResultCard.astro`, `Tooltip.astro`, `src/components/hardware/app.ts` (script cliente), y bloques nuevos en `src/styles/global.css`.

### Paso 1 — "Tu equipo"
- **Campo protagonista de texto libre**: *"Escribí tu equipo como te salga: «laptop Lenovo con RTX 4060 y 16 GB de RAM»"*. Se parsea primero en local (regex de VRAM/RAM + `resolve.ts`); si queda ambiguo y el Worker responde, se enriquece con F6.
- Botón **"Detectar mi equipo"** (F5).
- **"Modo detallado"** (`<details>`, mismo patrón que los menús de `BaseLayout`) con campos explícitos: GPU, VRAM, RAM, CPU, SO.
- **Combobox creatable** para la GPU, patrón ARIA 1.2: `role="combobox"` **sobre el `<input>`** (no sobre el contenedor), `aria-expanded`, `aria-controls`, `aria-haspopup="listbox"`, `aria-activedescendant`; el foco del DOM nunca sale del input; `↑↓` navegan, `Enter` confirma, `Esc` cierra. **Cualquier texto es un valor válido**: si no hay match, la última opción es siempre *"Usar «lo que escribiste» →"* y aparece un campo de VRAM para completarlo. Este es el requisito central del proyecto: la lista ayuda, no limita.
- Truco de alto valor y coste cero: bloque copiable *"¿No sabés tu VRAM?"* con el comando por SO (`nvidia-smi --query-gpu=name,memory.total --format=csv`, `wmic path win32_VideoController get name,AdapterRAM`, `system_profiler SPDisplaysDataType`). El usuario pega la salida en el campo libre y el parser la entiende.

### Paso 2 — Resultados
- Tres grupos: **Corre holgado · Funciona con ajustes · No corre** (los dos primeros expandidos, el tercero colapsado).
- Cada tarjeta: nombre + tamaño, **barra de memoria apilada** (pesos / KV cache / overhead frente a tu VRAM), cuantización recomendada, rango de tok/s, y enlace a la ficha del catálogo del runtime (Ollama, LM Studio, Jan) — enlazado interno que el audit premia.
- **Deslizador de contexto** (2k → 128k) que recalcula todo en vivo: es la demostración visual de por qué el KV cache importa y lo que ninguna herramienta rival muestra.
- Estado compartible por URL (`?gpu=&vram=&ram=&os=&ctx=`) con `history.replaceState`, patrón de `Directory.astro`.
- `role="status" aria-live="polite"` anunciando "N modelos compatibles" al recalcular, como el contador del directorio.

### `Tooltip.astro` (primitivo nuevo, reutilizable)
`<button type="button" aria-describedby>` + panel; **se abre con hover, foco y toque** (nunca solo hover: en móvil el hover no existe); `Esc` cierra; objetivo táctil de 44 px; se cierra al tocar fuera. Contenido en `ui.ts`. Tooltips mínimos: *VRAM vs RAM*, *cuantización*, *KV cache*, *tok/s*, *offload parcial*, *memoria unificada*.

**Estilo:** solo tokens `fai-*` (`--fai-signal` para "corre", `--fai-find` para acentos; no introducir colores nuevos); `.fai-live`, `.fai-chip` (con `aria-pressed`), `.fai-grid`; inputs a 16 px para no disparar el zoom de iOS; objetivos táctiles ≥ 44 px; rama `prefers-reduced-motion` en toda animación.

**Aceptación:** flujo completo usable con una sola mano en 360 px de ancho; recorrido de teclado íntegro sin ratón; una GPU inexistente ("Radeon RX 9999") sigue permitiendo obtener resultados escribiendo la VRAM.

---

## F5 — Autodetección de hardware en el navegador

**Objetivo:** cumplir el "sería bueno que el app pudiera leer los componentes", sin prometer más precisión de la que el navegador da.

**Archivo que posee:** `src/lib/hardware/detect.ts`.

Cadena de detección, toda **opt-in tras pulsar el botón**, nunca al cargar:
1. `navigator.gpu.requestAdapter()` → `adapter.info` (`vendor`, `architecture`, `device`, `description`) y `adapter.limits.maxBufferSize` como **cota inferior** de VRAM.
2. Respaldo WebGL: `WEBGL_debug_renderer_info` → `UNMASKED_RENDERER_WEBGL`, que en muchos Chromium aún devuelve la cadena completa (*"NVIDIA GeForce RTX 4060 Laptop GPU"*) — precisamente el caso que motivó el proyecto.
3. `navigator.deviceMemory` (solo Chromium, **topado a 8**), `hardwareConcurrency`, y `navigator.userAgentData.getHighEntropyValues(['platform','architecture'])` para el SO.

Reglas no negociables:
- **Todo lo detectado precarga el formulario y queda editable.** Nunca se bloquea un campo.
- Cada valor detectado lleva chip *"detectado"* con tooltip que explica que los navegadores enmascaran y topan estos datos por privacidad, y que conviene confirmarlo.
- `deviceMemory` se trata como **mínimo, jamás como verdad** (16 GB y 32 GB reportan ambos "8").
- Nota de privacidad visible: **la detección ocurre entera en el navegador y no se envía a ningún sitio** salvo que el usuario use la ayuda con IA (F6), que lo dice explícitamente en ese momento.
- Degradación silenciosa: sin WebGPU ni WebGL, el botón se oculta y el formulario manual queda como camino único.

**Aceptación:** probado en Chromium, Firefox y Safari (WebKit no expone `deviceMemory` ni `adapter.info` completo: debe degradar sin errores en consola).

---

## F6 — Worker + Workers AI

**Objetivo:** la capa de IA. Enteramente **opcional**: si se cae, la app funciona igual.

**Archivos que posee:** `worker/index.ts`, `worker/ai.ts`, `worker/ratelimit.ts`, `wrangler.jsonc` (editar), `.env.example` / secretos de CI.

`wrangler.jsonc` pasa de "solo assets" a Worker con assets:
```jsonc
{ "name": "fuenteai",
  "main": "worker/index.ts",
  "compatibility_date": "2026-06-18",
  "assets": { "directory": "./dist", "binding": "ASSETS",
              "html_handling": "drop-trailing-slash", "not_found_handling": "404-page" },
  "ai": { "binding": "AI" },
  "kv_namespaces": [{ "binding": "HW_CACHE", "id": "…" }] }
```
El `fetch` del Worker: si `pathname` empieza por `/api/`, enruta; si no, `return env.ASSETS.fetch(request)`. **Todo el sitio actual sigue sirviéndose exactamente igual.**

Tres endpoints, todos `POST`, todos con `response_format: { type: 'json_schema', json_schema: … }` (JSON mode de Workers AI):

| Ruta | Entrada | Salida | Papel |
|---|---|---|---|
| `/api/hw/parse` | texto libre (≤ 1 KB) | `SystemSpecs` parcial + `confidence` + `unknownFields[]` | Traduce lenguaje a datos. La salida se **reconcilia contra `gpus.json` en el servidor**; lo que la IA diga de VRAM se descarta si la GPU está en la base. |
| `/api/hw/gpu-lookup` | nombre de GPU sin match | `{ vramGb, bandwidthGbs, vendor, year, confidence }` | Solo para GPUs fuera de la base. Se cachea en KV 30 días por nombre normalizado. Se muestra **siempre etiquetado "estimado por IA"**. |
| `/api/hw/explain` | veredicto ya calculado + specs + `lang` | 2–3 frases + 2 consejos | Solo redacta. **Recibe los números hechos; no los calcula.** |

- Modelo: un instruct de Workers AI con soporte de salida estructurada. **Verificar el catálogo vigente en `developers.cloudflare.com/workers-ai/models` en el momento de implementar** y fijar el id en una única constante `worker/ai.ts:MODEL`. Criterio: el más pequeño que pase los tests de parseo (el trabajo es extracción, no razonamiento).
- Prompts versionados en `worker/ai.ts` con instrucción explícita de "extraer, no inferir": si el usuario no dijo la RAM, el campo va `null`, no inventado.
- Timeout de 6 s; ante cualquier fallo se devuelve `{ ok: false, reason }` y **el cliente continúa con el resolver local**.

**Aceptación:** `wrangler dev` sirve el sitio estático intacto y los tres endpoints; desconectar la red deja la app plenamente funcional (probado explícitamente); 15 frases de prueba en es/sv/it parsean correctamente.

---

## F7 — Endurecimiento: límites, caché, privacidad

**Archivos que posee:** `worker/ratelimit.ts`, `worker/security.ts`, `docs/app-compatibilidad-ia.md` (sección de operación), `src/pages/[lang]/privacidad.astro` (editar).

- Límite por IP con KV + TTL (p. ej. 30 req / 10 min), respuesta `429` con `Retry-After`; el cliente lo trata como "IA no disponible" y sigue en local.
- Validaciones: `Content-Type: application/json`, cuerpo ≤ 4 KB, `Origin` del propio sitio, métodos permitidos, respuestas con `Cache-Control` y cabeceras de seguridad.
- Caché KV de `gpu-lookup` (30 días) y de `explain` (7 días, clave = hash de specs+veredicto+idioma) — reduce coste y latencia drásticamente.
- **Sin logs de PII**: nunca registrar el texto libre del usuario. Métricas agregadas únicamente (tasa de acierto del resolver, tasa de fallback a IA, GPUs sin match — esta última lista es oro para saber qué falta en `gpus.json`).
- Actualizar la página de privacidad: qué se envía al usar la ayuda con IA, qué no sale nunca del navegador.
- Documentar en `docs/` el runbook: cómo desactivar la IA (feature flag) sin desplegar nada roto.

**Aceptación:** superar el límite devuelve 429 y la app sigue usable; segunda consulta idéntica de `gpu-lookup` sirve desde KV.

---

## F8 — QA, accesibilidad, rendimiento y lanzamiento

- `npm run build` verde: `catalog:audit` + `audit-hardware-data` + `astro build` + `links:audit` + `npm test`.
- Accesibilidad: recorrido completo con teclado; combobox verificado con lector de pantalla (VoiceOver iOS + NVDA); contraste AA sobre el fondo `--fai-bg`; foco visible en todos los controles; tooltips accesibles al tacto.
- Rendimiento: Lighthouse móvil ≥ 95 en Rendimiento y 100 en Accesibilidad; sin CLS al pintar resultados (reservar altura, igual que hace `AdSlot.astro`); los JSON de datos se cargan **diferidos** al interactuar, no en el HTML inicial (el catálogo de modelos puede pesar; servirlo como endpoint estático estilo `search-index.json.ts`).
- Contenido: revisar la página con la skill `descargasia-ficha-auditoria` (criterio AdSense: valor original y sin claims inventados). Los rangos de tok/s deben ir siempre rotulados como estimación, con la metodología explicada en la propia página — eso es E-E-A-T real.
- Enlazado: verificar ≥ 5 enlaces entrantes (nav, menú móvil, home, fichas de runtimes).
- Sitemap y `lastmod` correctos; `?` params en `robots.txt`.

---

## Operación (runbook) — capa de IA

La IA es ayuda opcional: si se cae, se agota la cuota o está apagada, la app
funciona entera en local. Esto es lo que un operador debe saber para mantenerla.

### Interruptor de la IA (feature flag)

La variable de entorno `AI_ENABLED` controla los tres endpoints (`/api/hw/parse`,
`/api/hw/gpu-lookup`, `/api/hw/explain`). Vale `"true"` (por defecto, en
`wrangler.jsonc`) o `"false"`.

Cuando vale `"false"`, **los tres endpoints devuelven `{ ok: false, reason: 'disabled' }`**
y la app sigue funcionando: el cliente lo trata como "IA no disponible" y usa el
resolver local. No se rompe ninguna ruta estática ni el veredicto.

**Cómo apagarla sin tocar el código** (un redploy, pero la app nunca deja de
funcionar):

```bash
# Opción A — variable de entorno (no secreta):
npx wrangler variable set AI_ENABLED false

# Opción B — secreto (no va al repo):
npx wrangler secret put AI_ENABLED   # y escribís "false" cuando lo pida

# Volver a encender:
npx wrangler variable set AI_ENABLED true
```

Como el Worker sirve `/api/*` y delega el resto a `env.ASSETS`, cambiar solo la
variable no afecta las 86 fichas ni el SEO.

### Límites y abuso

- Límite por IP: **30 peticiones / 10 min** (ventana deslizante en KV, binding
  `HW_CACHE`, clave `rl:<sha256-ip+salt>` — la IP se guarda hasheada con
  SHA-256 + sal fija, nunca en claro ni reversible).
  Al superarlo se responde `429` con
  `Retry-After`; el cliente lo ignora y sigue en local. Chocar contra el muro
  nunca rompe la app.
- Validación de entrada: `Content-Type: application/json`, cuerpo ≤ 4 KB,
  `Origin` del propio sitio, solo `POST`. Respuestas con `Cache-Control:
  no-store` y cabeceras de seguridad (`X-Content-Type-Options`,
  `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`).

### Caché en KV (binding `HW_CACHE`)

| Clave | TTL | Qué guarda |
|---|---|---|
| `gpu:<nombre-normalizado>` | 30 días | Estimación de VRAM/ancho de banda de una GPU fuera de la base |
| `explain:<hash>` | 7 días | Prosa redactada; hash de specs + veredicto + idioma |
| `metrics:gpu:<nombre-normalizado>` | 180 días | **Contador agregado** de cuántas veces faltó esa GPU en la base |

`metrics:gpu:*` es la lista de oro para saber qué añadir a `gpus.json`: es un
contador por GPU, **nunca el texto libre del usuario**. El texto libre de
`/api/hw/parse` no se registra en ningún log.

### Invalidar una clave concreta de la caché

Si una estimación de IA sale mal, queda hasta 30 días. Para borrarla:

```bash
npx wrangler kv key delete --binding=HW_CACHE "gpu:<nombre-normalizado>"
# o, para borrar toda la caché de un tipo:
npx wrangler kv key list --binding=HW_CACHE --prefix="gpu:" | npx wrangler kv bulk delete --binding=HW_CACHE
```

El `<nombre-normalizado>` es el nombre de la GPU en minúsculas, sin acentos ni
espacios dobles (el mismo criterio de `normalizeGpuKey` en `worker/ai.ts`).

---

## Verificación de punta a punta

```bash
npm ci
npm test                    # motor determinista, resolver, paridad i18n
npm run build               # encadena catalog:audit + hardware audit + astro build + links:audit
npx wrangler dev            # sirve dist/ + /api/hw/* con bindings AI y KV
```

Recorrido manual obligatorio antes de dar F8 por cerrada:

1. En móvil (360 px), escribir *"laptop con RTX 4060 y 16gb"* → debe resolver la **variante Laptop** y dar veredicto sin tocar nada más.
2. Escribir una GPU inexistente → el combobox debe ofrecer *"Usar lo que escribiste"* y pedir la VRAM → veredicto igualmente.
3. Pulsar "Detectar mi equipo" → campos precargados, **todos editables**, chips "detectado" con su tooltip.
4. Mover el deslizador de contexto de 4k a 32k con un modelo justo → algún modelo debe pasar de "funciona" a "no cabe" (el KV cache es visible).
5. Desactivar JavaScript → la tabla completa de modelos sigue ahí y es navegable.
6. Bloquear `/api/*` en las DevTools → la app entera sigue funcionando, sin errores en consola, sin la prosa de la IA.
7. Recorrido de teclado completo, sin ratón, de principio a fin.
8. Repetir 1 y 2 en `/sv/puedo-correr-ia` y `/it/puedo-correr-ia`.

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| `links:audit` marca la página HUÉRFANA y rompe el deploy | Enlazar desde `BaseLayout` en la **misma** PR que crea la página (F3) |
| Cifras de VRAM/tok/s equivocadas dañan la credibilidad | Motor determinista con tests dorados; todo rango rotulado como estimación con metodología publicada |
| Deriva de claves entre `es`/`sv`/`it` | Test de paridad de claves en F2, dentro de `npm test` |
| Pasar de assets a Worker rompe el sitio actual | El Worker delega todo lo que no sea `/api/*` a `env.ASSETS`; verificar en `wrangler dev` antes de desplegar |
| Coste o caída de Workers AI | La IA es puramente opcional en todos los caminos; caché KV; feature flag para apagarla |
| `gpus.json` se queda obsoleto | Registrar las GPUs sin match (agregado, sin PII) y revisar el JSON cada trimestre |

---

## Glosario para quien ejecute una fase

| Término | Qué significa aquí |
|---|---|
| **VRAM** | Memoria dedicada de la tarjeta gráfica. Es el cuello de botella real en Windows/Linux con GPU discreta. |
| **Memoria unificada** | En Apple Silicon no hay VRAM separada: CPU y GPU comparten la RAM. Solo una fracción es asignable a la GPU (por defecto ~75 %). |
| **Cuantización (`Q4_K_M`, `Q8_0`…)** | Comprimir los pesos a menos bits. Menos bits = menos memoria y menos calidad. `Q4_K_M` es el punto dulce habitual. |
| **`bpw`** | *Bits per weight*, los bits efectivos por parámetro de una cuantización. Es lo que convierte "8B parámetros" en gigabytes. |
| **KV cache** | Memoria que crece **linealmente con el contexto**. Es el error clásico: el modelo "cabe" y luego revienta al pegar un documento largo. Por eso el deslizador de contexto es parte del producto, no un extra. |
| **Offload parcial** | Repartir capas entre GPU y CPU cuando el modelo no cabe entero en VRAM. Funciona, pero mucho más lento. |
| **Roofline de ancho de banda** | La generación de tokens está limitada por la memoria, no por el cómputo: `tok/s ≈ ancho de banda ÷ tamaño del modelo`. De ahí salen las estimaciones de velocidad. |

## Fuentes consultadas al elaborar el plan

Investigación previa que respalda las decisiones técnicas. Quien implemente una fase debería releer la que le toca:

- **Detección de hardware en el navegador** — [MDN: `GPUAdapter.info`](https://developer.mozilla.org/en-US/docs/Web/API/GPUAdapter/info) y [`GPUAdapterInfo`](https://developer.mozilla.org/en-US/docs/Web/API/GPUAdapterInfo): confirma que los navegadores exponen `vendor`/`architecture`/`device` de forma deliberadamente reducida y distinta según el navegador, por riesgo de *fingerprinting*. De ahí la regla de F5: lo detectado precarga, nunca decide.
- **Matemática de memoria** — [Guía de requisitos de VRAM con llama.cpp](https://localllm.in/blog/llamacpp-vram-requirements-for-local-llms) y [el desglose pesos + KV cache + overhead](https://dev.to/bytecalculators/the-math-behind-local-llms-how-to-calculate-exact-vram-requirements-before-you-crash-your-gpu-12n5): fundamentan las fórmulas de F2 y el overhead de runtime de 0,5–1 GB.
- **Salidas estructuradas en Cloudflare** — [JSON Mode de Workers AI](https://developers.cloudflare.com/workers-ai/features/json-mode/) y [el anuncio de salidas JSON estructuradas](https://developers.cloudflare.com/changelog/2025-02-25-json-mode/): es lo que permite que `/api/hw/parse` devuelva un `SystemSpecs` validable en vez de prosa.
- **Bases de datos de GPU** — [RightNow-AI/RightNow-GPU-Database](https://github.com/RightNow-AI/RightNow-GPU-Database) (2.824 GPUs), [dbgpu](https://github.com/painebenjamin/dbgpu) y [gpu-info-api](https://github.com/voidful/gpu-info-api): puntos de partida para poblar `gpus.json` en F1, siempre contrastando la VRAM con la ficha del fabricante.
- **Combobox accesible** — [MDN: rol `combobox`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/combobox_role) y [la guía de React Aria sobre autocompletado accesible](https://react-aria.adobe.com/blog/building-a-combobox): el patrón ARIA 1.2 pone el rol en el `<input>` y mantiene el foco ahí usando `aria-activedescendant`, y documenta las divergencias necesarias en móvil.

## Bitácora de decisiones

Cada agente que cierre una fase añade aquí una línea con lo que decidió y que no estaba en el plan. Sirve para que el siguiente no reabra discusiones ya resueltas.

| Fecha | Fase | Decisión | Motivo |
|---|---|---|---|
| 2026-08-23 | — | Plan aprobado con: Worker + assets, veredicto determinista, solo LLMs de texto, 3 idiomas y catálogo curado en el repo | Ver tabla "Decisiones ya cerradas con el usuario" |
| 2026-08-23 | — | El proyecto se ejecuta con sesiones desechables por fase, no en una sesión larga | Ninguna sesión es memoria durable, tampoco la coordinadora; la memoria vive en el repo |
| 2026-08-23 | F0 | El criterio de tipado es `npx tsc --noEmit`, no `astro check` | `@astrojs/check` no es dependencia del proyecto: el criterio no era ejecutable como estaba escrito |
| 2026-08-23 | F0 | El tablero pierde la columna de estado; el estado vive solo en las etiquetas de los issues y se consulta con `scripts/estado-fases.mjs` | Dos representaciones del mismo hecho derivan siempre y obligan a actualizar dos sistemas |
| 2026-08-23 | F0 | Prohibidos los criterios de aceptación del tipo «`grep X` no devuelve nada»; las ausencias se comprueban sobre el código sin comentarios | El grep matchea el comentario que documenta la regla: el criterio de pureza de F2 no podía pasar nunca, y `types.ts` estaba en sus PROTEGIDOS. `audit-specs.mjs` ya lo rechaza |
| 2026-08-24 | F1 | `src/data/hardware/README.md` es contrato de salida de F1, no un extra | Los criterios exigen que los JSON sean arrays y `types.ts` no tiene campo de notas: la fecha de revisión, las fuentes y los supuestos no caben dentro del dato |
| 2026-08-24 | F1 | La regla «`fileSizeGb` contra `paramsB * bpw / 8` al ±25 %» se sustituye por monotonía de tamaño en el orden canónico de cuantización | Con `bpw` nominales falla en modelos legítimos (+29 % en uno de 135 M por el peso de los embeddings); con `bpw` medidos es tautológica: 0,16 % de desvío máximo sobre 288 comprobaciones contra una tolerancia del 25 % |
| 2026-08-24 | F1 | `ModelSpec.quants[].bpw` es el medido sobre cada `.gguf`; `quants.json` es solo tabla de referencia para la interfaz | Los `bpw` publicados se midieron sobre LLaMA-7B en 2023 y las cuantizaciones cambiaron: Q2_K son ~3,0 bpw, no 2,63 |
| 2026-08-24 | F1/F2 | Una forma corta ambigua **entre escritorio y portátil** tampoco se asigna: F2 devuelve candidatas | La política de "no adivinar" se había aplicado solo entre variantes de escritorio. Hay 9 familias donde difiere la VRAM (`rtx 4090`: 24 GB contra 16), y sesgar a escritorio reintroduce en silencio el sesgo que la app existe para corregir |
| 2026-08-24 | — | Las sesiones ejecutoras arrancan con `/goal` y se suscriben a su propio PR | El plan es donde se corrigen barato las decisiones de fondo; y quien implementó una fase es quien mejor la arregla. La ejecutora empuja código, la revisora comenta y corrige specs, ninguna fusiona |
| 2026-08-24 | — | Los criterios `[manual]` de F3, F4, F5 y F8 se verifican sobre la Branch Preview URL que Cloudflare publica en cada PR | Construye la rama sin tocar producción (`fuenteai.com` solo cambia con `deploy.yml` en push a `main`), así que se puede probar el sitio real antes de fusionar. Ese build no publica status check: no es compuerta |
| 2026-08-24 | F2 | `npm test` es `node --test "tests/**/*.test.mjs"`, no `node --test tests/` | En Node 22 los argumentos posicionales del runner son globs: `tests/` casa con el propio directorio y falla con `MODULE_NOT_FOUND` |
| 2026-08-24 | F2 | `tsconfig.json` activa `allowImportingTsExtensions` | El motor lo importan `node --test` y el Worker, y ESM exige extensión explícita. Sin la opción, `recommend.ts` importando `./estimate.ts` era el único error de tipos nuevo del repo |
| 2026-08-24 | F2 | El desempate escritorio/portátil se dispara solo cuando la VRAM difiere | Es la condición que la spec da como motivo. Con `rtx 4060` (8 GB en ambas) preguntar no cambiaría el veredicto y solo añade fricción |
| 2026-08-24 | F2 | Cuando ninguna cuantización cabe entera en el acelerador, la recomendada es la de mejor veredicto y no la de más bits | Una Q6_K con la mitad de las capas en RAM se arrastra: recomendarla por calidad nominal sería recomendar la peor experiencia |
| 2026-08-24 | F2 | El camino de memoria unificada se reserva a Apple; una iGPU x86 cae a CPU | `gpus.json` marca con `unifiedMemory` también las integradas de AMD e Intel. El glosario define memoria unificada como lo de Apple y F2 pide que una iGPU caiga a CPU. Además es lo honesto: una iGPU lee la misma RAM que la CPU, no gana ancho de banda, y tratarla como acelerador le recortaría la memoria a la fracción asignable |
| 2026-08-24 | F2 | `USE_CASE_ORDER` son los slugs de categoría del sitio, no los cuatro nombres que enumera la spec | El audit de F1 exige que cada `useCases[]` referencie una categoría existente, así que «razonamiento» y «resumen de documentos» no existen en los datos. Ver el comentario en #7 |
| 2026-08-24 | F2 | Al desempatar, la capacidad escrita en el nombre es decoración; la que escribe la persona, pista | El catálogo llama «RTX 3060 12 GB» a la de sobremesa y «RTX 3060 Laptop GPU» a la portátil: puntuando el «12» ganaba siempre la portátil de 6 GB ante `rtx 3060`, que es el sesgo de la app al revés |
| 2026-08-24 | F3/F4 | La fórmula de memoria que F3 escribió en `ModelTable.astro` es deuda deliberada; F4 la sustituye por `estimate()` y lo verifica un criterio | F3 va antes que F2 por cómo corté las fases, así que no había motor al que llamar. Dos fuentes de verdad para el número central del producto divergen en cuanto se toque una constante |
| 2026-08-24 | F6 | El criterio de salida estructurada comprueba que los tres endpoints pidan un esquema, no cuántas veces aparece `response_format` | Contar apariciones premia la duplicación: una función compartida que reciba el esquema como argumento es mejor diseño y solo tiene una |
| 2026-08-24 | F6 | El bloque `kv_namespaces` es opcional en F6 y su `id` nunca puede ser un placeholder con forma de id real | `wrangler deploy --dry-run` no resuelve el namespace contra la cuenta, así que un id inventado pasa el criterio y falla en el despliegue. La caché es de F7 |
| 2026-08-24 | F5/F2 | `detect.ts` se mueve a `src/lib/browser/`; `src/lib/hardware/` queda reservado al motor | El test de pureza prohíbe el DOM en ese directorio y la detección lo necesita. La contradicción empujó a la sesión a escribir `Reflect.get(globalThis, ['doc','ument'].join(''))` para que el regex no lo viera: el test quedaba verde mintiendo |
| 2026-08-24 | — | Los criterios de aceptación corren en CI (`.github/workflows/ci.yml`) en cada PR | Hasta ahora los corría a mano quien revisaba, y quien los declaraba cumplidos era la misma sesión que escribía el código. Eso funciona con un buen ejecutor y falla en silencio con cualquier otro |
| 2026-08-24 | — | `npx tsc --noEmit` pasa a ser criterio de todas las fases, no solo de F0 | F4 y F6 metieron dos errores de tipos a la rama de integración —los dos sobre `SystemSpecs.os`, uno de ellos sobre datos que llegan por red sin validar— y ninguna revisión los vio porque el criterio no existía |
| 2026-08-24 | F5 | `PROTEGIDOS` de F5 lista los tests ajenos uno por uno, no `tests/hardware/` entera | La spec exigía crear `detect-sin-red.test.mjs` dentro de un directorio que ella misma prohibía tocar: la fase quedaba sin salida legal. Es la causa de las tres iteraciones fallidas y del código ofuscado. `audit-specs.mjs` ya rechaza que un archivo que la fase posee caiga dentro de un PROTEGIDO |
