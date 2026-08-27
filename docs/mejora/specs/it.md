# F3-IT — Specs editoriales y UX del producto italiano

> Spec SDD del issue #41. Producto: `it` (italiano). Rama base: `main`.
> Dependencia satisfecha: #37 (F2-IT), fusionado en `main` vía PR #48
> (`ba7f198 docs: merge F2-IT Italian research`). El research vive en
> `docs/mejora/research/it.md` y es entrada de solo lectura de esta spec.
>
> Convención de este documento: la narrativa y los metadatos están en español
> (idioma de trabajo del repositorio y de revisión de Codex). Las **consultas,
> intenciones, copy above the fold, secciones, FAQ, advertencias y enlaces
> previstos están en italiano nativo**, no son traducción del español. Cada
> campo de producto se marca `(IT)`.

---

## 1. Identidad y alcance

| Campo | Valor |
|---|---|
| Issue | #41 |
| Fase | F3-IT (Specs editoriales y UX) |
| Producto | `it` |
| Rama base | `main` |
| Depende de | #37 (F2-IT) — fusionado |
| Input no bloqueante | #36 (F1, contrato canónico de eventos de funnel) — **rama no fusionada en `main`** |
| Salida | `docs/mejora/specs/it.md` (este archivo) |
| Regla de oro | Sin mirrors, sin instaladores de terceros, solo fuentes oficiales; copy nativo italiano; revisión editorial posterior |

---

## 2. Contrato de entrada (lo que ya existe)

- `docs/mejora/research/it.md` (v3): market brief italiano, matriz de
  oportunidades, selección/rechazo y fuentes. Las oportunidades de esta spec se
  rastrean línea a línea a ese documento.
- `docs/mejora/decisiones.md`: `it` decide consultas, selección y prioridades
  italianas; no hereda de `es`/`sv`. F3-IT posee `docs/mejora/specs/it.md`.
  Además mantiene una **decisión abierta** que bloquea «Cualquier guía nueva»:
  «Si las guías de intención necesitan una ruta pública antes de
  desbloquearse» (responsable F3/Codex). Las guías G1–G3 por eso **no son
  ejecutables en esta fase** (ver §8.2).
- `docs/plan-mejora-productos-por-idioma.md` §6 (F3): campos obligatorios de
  cada spec (ficha/guía/descarte, intención, above the fold, canales oficiales,
  secciones, FAQ, advertencias, enlaces, eventos, métricas).
- `src/utils/funnel-events.ts` y `docs/mejora/fases/F1.md` (F1, #36 — **rama no
  fusionada en `main`**): contrato canónico de eventos de funnel. Esta spec usa
  **solo** esos nombres, no inventa otros:
  - Eventos: `ficha_view`, `platform_select`, `redirect_start`,
    `redirect_result`, `redirect_error`.
  - Parámetros de todo el payload: `lang` ∈ {`es`, `sv`, `it`} (aquí `it`);
    `tool` = slug del catálogo; `platform` ∈ {`web`, `windows`, `mac`,
    `linux`, `android`, `ios`, `null`}; `channel` ∈ {`official-site`,
    `app-store`, `github-repo`, `documentation`, `official-installer`,
    `web-app`}.
  - `redirect_start` y `redirect_result` añaden `valid: true`;
    `redirect_error` añade `valid: false` y `reason` ∈ {`tool_not_found`,
    `platform_not_found`, `not_official`, `missing_params`, `unknown`}.
  - `channel` es un **tipo de canal controlado**, no un dominio: las URLs no
    son parámetros de funnel (el contrato excluye texto libre y PII).
  - `ficha_view` corresponde solo a fichas, no a guías (ver B2).
  - Es una **dependencia no fusionada**: esta spec se alinea al contrato de la
    rama F1 sin copiar archivos ni declarar la dependencia como integrada. Si
    F1 cambia el contrato antes de fusionarse, F4-IT debe realinear.

---

## 3. Contrato de salida

- `docs/mejora/specs/it.md`: spec ejecutable por oportunidad para el producto
  `it`. F4-IT implementa únicamente las fichas del §8.1 en
  `src/content/tools/it/`. Las guías del §8.2 quedan **bloqueadas** por la
  decisión abierta de `docs/mejora/decisiones.md` y no forman parte del
  entregable ejecutable de esta fase.

---

## 4. Archivos que posee esta fase

- `docs/mejora/specs/it.md` — creación y edición de la spec del producto italiano.

---

## 5. PROTEGIDOS (no editables por esta fase)

- `docs/mejora/specs/es.md`, `docs/mejora/specs/sv.md` — specs de otros productos.
- `docs/mejora/research/it.md` — salida de #37 (entrada, no se edita).
- `docs/mejora/research/es.md`, `docs/mejora/research/sv.md`.
- `src/content/tools/it/*`, `src/content/tools/es/*`, `src/content/tools/sv/*`,
  `src/content/tools-base/*` — contenido del sitio (lo implementa F4).
- `public/`, `worker/`, `.well-known/`, `src/utils/links.ts`, `src/utils/funnel-events.ts`,
  rutas, hreflang, canonical, robots y selector de idioma — fuera del alcance de F3.
- `docs/mejora/decisiones.md` — gobierno (lo edita Codex/F0).

---

## 6. Instrucciones de ejecución

1. Toda oportunidad se rastrea a `research/it.md` (número de sección citado).
2. Consultas, copy, FAQ y advertencias son **italiano nativo**; no se traduce
   del español.
3. Las rutas oficiales son **solo los dominios verificados en research/it.md §9**
   (`cursor.com`, `ollama.com`, `lmstudio.ai`, `x.com/i/grok`,
   `notebooklm.google.com`, `languagetool.org`, `ai.meta.com`,
   `github.com/features/copilot`). Sin dominio verificado → no se declara ruta
   (ver §9, `microsoft-copilot`).
4. Se preserva: no-installer explícito, fuentes oficiales, y badge de revisión
   editorial pendiente (Codex/Antigravity).
5. No se modifican rutas, hreflang, canonical, selector de idioma ni contenido
   existente. Esta spec es un documento de planificación.
6. Los enlaces internos previstos usan solo slugs que existen en `it/` (según
   research/it.md §3.1) o los slugs nuevos que esta misma spec aprueba.
7. La instrumentación usa **solo** el contrato canónico de F1 (§2): nombres de
   eventos, parámetros `lang`/`tool`/`platform`/`channel`/`reason` y banderín
   `valid`; `channel` siempre como tipo de canal controlado, nunca como URL.
8. Las guías nuevas están **bloqueadas** por la decisión abierta de
   `docs/mejora/decisiones.md`; no se entregan como specs ejecutables (ver §8.2).

---

## 7. Fuera de alcance

- Crear o modificar fichas/`it/` (lo hace F4-IT).
- Crear rutas públicas de guía: **bloqueadas** por la decisión abierta de
  `docs/mejora/decisiones.md` («Cualquier guía nueva»); ver §8.2.
- Cambiar hreflang, canonical, robots, selector de idioma o `src/utils/links.ts`.
- Definir o modificar el esquema técnico de eventos (lo posee F1).
- Decidir el producto español o sueco (independencia de producto).

---

## 8. Especificaciones por oportunidad

> Leyenda de campos por ficha (§8.1): **Trazabilidad** (research/it.md §),
> **Intención primaria (IT)**, **Intenciones secundarias (IT)**, **Above the
> fold (IT)**, **Plataformas**, **Rutas oficiales**, **Secciones nativas (IT)**,
> **FAQ (IT)**, **Advertencias (IT)**, **Enlaces internos (slugs it/)**,
> **Eventos de funnel (contrato F1)**, **Métricas y ventana**.
>
> Forma canónica de cada evento de ficha (contrato F1, §2):
> - `ficha_view` — `{ lang: it, tool: <slug>, platform: <P|null>, channel: <C> }`
> - `platform_select` — `{ lang: it, tool: <slug>, platform: <P>, channel: <C> }`
> - `redirect_start` — `{ lang: it, tool: <slug>, platform: <P>, channel: <C>, valid: true }`
> - `redirect_result` — `{ lang: it, tool: <slug>, platform: <P>, channel: <C>, valid: true }`
> - `redirect_error` — `{ lang: it, tool: <slug>, platform: <P>, channel: <C>, valid: false, reason: <R> }`
>
> donde `<P>` es la plataforma detectada (`ficha_view`) o seleccionada
> (`platform_select`/`redirect_*`) dentro de {`web`, `windows`, `mac`, `linux`,
> `android`, `ios`, `null`}, `<C>` el tipo de canal controlado y `<R>` el código
> de error predefinido. Cada ficha declara debajo su `tool`, sus plataformas y
> su canal.

### 8.1 Fichas seleccionadas (de research/it.md §5.1 y §7.1)

---

#### cursor — Ficha (editor de código con IA)

- **Trazabilidad:** research/it.md §4.2 (#4, #5, #6), §5.1 (#1), §7.1, §7.2 P1.
  Evidencia: 6+ artículos italianos (suoggi.com, utileapp.com, datacamp.com/it).
  Confianza: Media.
- **Intención primaria (IT):** Installare e usare Cursor, l'editor di codice
  con l'IA, per scrivere e revisionare codice più velocemente.
- **Intenciones secundarie (IT):**
  - Capire la differenza tra Cursor e un editor classico (es. VS Code).
  - Sapere se Cursor è gratuito per uso personale.
  - Trovare la documentazione e i canali ufficiali.
- **Above the fold (IT):**
  - H1: `Cursor`
  - Tagline: `L'editor di codice con l'intelligenza artificiale. Ufficiale su cursor.com.`
  - CTA: `Vai al sito ufficiale cursor.com`
  - Badge piattaforme: `Windows` · `macOS` · `Linux`
  - Nota no-installer: `DescargasIA non ospita l'installer: scarica sempre dalla fonte ufficiale.`
  - Badge revisione: `Canale ufficiale verificato · revisione editoriale pendente`
- **Piattaforme:** Windows, macOS, Linux (il supporto Linux è dichiarato sul
  sito ufficiale; fuori dalle "piattaforme predominanti" del research, ma
  verificabile sulla fonte ufficiale).
- **Rutas oficiales (research/it.md §9):** `https://cursor.com`
- **Secciones nativas (IT):**
  - `Cos'è Cursor e a cosa serve`
  - `Come si installa (passaggi ufficiali)` — enlaza a cursor.com, sin descargas.
  - `Cursor e la privacy del codice`
  - `Cursor o un editor classico?`
- **FAQ (IT):**
  - **Q: Cursor è gratuito?** A: Cursor offre un piano gratuito e piani a
    pagamento; prezzi e termini aggiornati sono sul sito ufficiale cursor.com.
    Non riportiamo prezzi non verificati.
  - **Q: Cursor funziona su Windows e Mac?** A: Sì, è disponibile per Windows e
    macOS e anche Linux; scarica la versione dalla pagina ufficiale.
  - **Q: I miei codici restano privati?** A: Impostazioni di privacy e uso dei
    dati sono gestiti da Cursor; consulta la sua informativa ufficiale.
    DescargasIA non elabora il tuo codice.
- **Advertencias (IT):** Non scaricare Cursor da siti non ufficiali: rischi
  versioni modificate o non sicure. Usa sempre `cursor.com`.
- **Enlaces internos esperados (slugs it/):** `chatgpt` (complemento
  generativo). *Relaciones fuertes mínimas en esta fase; F5 definirá el grafo.*
- **Eventos de funnel (contrato F1):** `tool: cursor`; plataformas
  `windows`/`mac`/`linux`; `channel: official-site` (descarga desde el sitio
  oficial cursor.com). Emite `ficha_view`, `platform_select`,
  `redirect_start`, `redirect_result` y `redirect_error` en la forma canónica
  de la leyenda de §8.
- **Métricas y ventana:** primaria = salidas al canal oficial `cursor.com` por
  plataforma; secundaria = CTR y posición en consulta "Cursor AI". Ventana: 14
  días para errores de destino, 28 días para tendencia (según plan F7).

---

#### ollama — Ficha (IA locale, LLM in locale)

- **Trazabilidad:** research/it.md §4.2 (#1, #2), §5.1 (#2), §7.1, §7.2 P2.
  Evidencia: 2+ artículos italianos; tema privacidad relevante (45%,
  Eurobarómetro). Confianza: Media.
- **Intención primaria (IT):** Eseguire modelli di linguaggio (LLM) in locale
  sul proprio PC, senza inviare dati al cloud.
- **Intenciones secundarie (IT):**
  - Installare Ollama su Windows/macOS/Linux.
  - Scaricare un modello (es. Llama) in locale.
  - Capire la differenza con LM Studio.
  - Valutare la privacy dell'IA locale.
- **Above the fold (IT):**
  - H1: `Ollama`
  - Tagline: `Esegui modelli di IA direttamente sul tuo computer, in locale.`
  - CTA: `Scarica da ollama.com (ufficiale)`
  - Badge piattaforme: `Windows` · `macOS` · `Linux`
  - Nota no-installer: `DescargasIA non ospita l'installer: usa solo la fonte ufficiale.`
  - Badge revisione: `Canale ufficiale verificato · revisione editoriale pendente`
- **Piattaforme:** Windows, macOS, Linux (sitio ufficiale).
- **Rutas oficiales (research/it.md §9):** `https://ollama.com`
- **Secciones nativas (IT):**
  - `Cos'è Ollama e a cosa serve`
  - `Installazione dalla fonte ufficiale`
  - `Primi passi: scaricare un modello`
  - `Ollama e la privacy dei dati`
  - `Ollama o LM Studio?` (enlace a la guía G2, bloqueada — ver §8.2)
- **FAQ (IT):**
  - **Q: Serve una GPU per usare Ollama?** A: Ollama può usare CPU o GPU; le
    prestazioni dipendono dal modello e dall'hardware. Verifica i requisiti
    sulla documentazione ufficiale.
  - **Q: Ollama è gratuito?** A: Ollama è open source; dettagli e termini sono
    sul sito ufficiale. Non riportiamo prezzi non verificati.
  - **Q: I miei dati restano sul mio PC?** A: Eseguendo i modelli in locale i
    dati non lasciano il dispositivo, salvo configurazioni esplicite. Conferma
    sulla documentazione ufficiale.
- **Advertencias (IT):** Non usare installer di terze parti; scarica solo da
  `ollama.com`. I modelli locali richiedono risorse hardware: verifica prima.
- **Enlaces internos esperados (slugs it/):** `lm-studio` (activo); `ia-locale-privacy`
  (G1) y `ollama-vs-lm-studio` (G2) quedan pendientes del desbloqueo de guías (§8.2).
- **Eventos de funnel (contrato F1):** `tool: ollama`; plataformas
  `windows`/`mac`/`linux`; `channel: official-site` (descarga desde el sitio
  oficial ollama.com). Emite `ficha_view`, `platform_select`,
  `redirect_start`, `redirect_result` y `redirect_error` en la forma canónica
  de la leyenda de §8.
- **Métricas y ventana:** primaria = salidas a `ollama.com`; secundaria = CTR y
  posición en "installare Llama in locale" / "Ollama". Ventana F7 (14/28 días).

---

#### lm-studio — Ficha (IA locale, interfaccia grafica)

- **Trazabilidad:** research/it.md §4.2 (#1, #2), §5.1 (#3), §7.1, §7.2 P2.
  Evidencia: 2+ artículos italianos; alternativa grafica a Ollama. Confianza: Media.
- **Intención primaria (IT):** Usare un'interfaccia grafica per scaricare ed
  eseguire modelli di IA in locale, senza riga di comando.
- **Intenciones secundarie (IT):**
  - Installare LM Studio.
  - Scaricare modelli dall'interfaccia.
  - Confronto con Ollama.
  - Privacy dei dati locali.
- **Above the fold (IT):**
  - H1: `LM Studio`
  - Tagline: `L'IA locale con interfaccia grafica. Ufficiale su lmstudio.ai.`
  - CTA: `Scarica da lmstudio.ai (ufficiale)`
  - Badge piattaforme: `Windows` · `macOS` · `Linux`
  - Nota no-installer: `DescargasIA non ospita l'installer: usa solo la fonte ufficiale.`
  - Badge revisione: `Canale ufficiale verificato · revisione editoriale pendente`
- **Piattaforme:** Windows, macOS, Linux (sitio ufficiale).
- **Rutas oficiales (research/it.md §9):** `https://lmstudio.ai`
- **Secciones nativas (IT):**
  - `Cos'è LM Studio`
  - `Installazione ufficiale`
  - `Scaricare e avviare un modello`
  - `LM Studio vs Ollama` (enlace a la guía G2, bloqueada — ver §8.2)
  - `Privacy dei dati locali`
- **FAQ (IT):**
  - **Q: LM Studio è gratuito?** A: LM Studio è gratuito per uso personale
    secondo i termini ufficiali; verifica su lmstudio.ai.
  - **Q: Posso usarlo senza comandi?** A: Sì, ha un'interfaccia grafica; questo
    lo distingue da soluzioni solo terminale come Ollama.
  - **Q: I modelli restano sul mio PC?** A: I modelli girano in locale; i
    dettagli sulla privacy sono nella documentazione ufficiale.
- **Advertencias (IT):** Scarica solo da `lmstudio.ai`; evita pacchetti non
  ufficiali o modificati.
- **Enlaces internos esperados (slugs it/):** `ollama` (activo); `ia-locale-privacy`
  (G1) y `ollama-vs-lm-studio` (G2) quedan pendientes del desbloqueo de guías (§8.2).
- **Eventos de funnel (contrato F1):** `tool: lm-studio`; plataformas
  `windows`/`mac`/`linux`; `channel: official-site` (descarga desde el sitio
  oficial lmstudio.ai). Emite `ficha_view`, `platform_select`,
  `redirect_start`, `redirect_result` y `redirect_error` en la forma canónica
  de la leyenda de §8.
- **Métricas y ventana:** primaria = salidas a `lmstudio.ai`; secundaria = CTR
  "LM Studio" / "Ollama vs LM Studio". Ventana F7.

---

#### grok — Ficha (assistente IA integrato in X)

- **Trazabilidad:** research/it.md §4.2 (#10 uso app), §5.1 (#4), §7.1, §7.2 P1.
  Evidencia cuantitativa: 656K usuarios Italia (dic 2025, Cosenza/Audicom).
  Confianza: Media-alta.
- **Intención primaria (IT):** Usare Grok, l'assistente IA integrato in X, dal
  web o dall'app ufficiale.
- **Intenciones secundarie (IT):**
  - Accedere a Grok da X.
  - Capire cos'è Grok e cosa sa fare.
  - Gratuito o a pagamento.
  - Differenze con ChatGPT e Gemini.
- **Above the fold (IT):**
  - H1: `Grok`
  - Tagline: `L'assistente IA di x.com, accessibile dal web e dall'app ufficiale.`
  - CTA: `Apri Grok su x.com/i/grok`
  - Badge piattaforme: `Web` · `iOS` · `Android`
  - Nota no-installer: `Accedi solo dalla fonte ufficiale; non inserire credenziali altrove.`
  - Badge revisione: `Canale ufficiale verificato · revisione editoriale pendente`
- **Piattaforme:** Web, iOS, Android.
- **Rutas oficiales (research/it.md §9):** `https://x.com/i/grok`
- **Sezioni nativi (IT):**
  - `Cos'è Grok`
  - `Come accedere (ufficiale)`
  - `Cosa sa fare`
  - `Grok, ChatGPT e Gemini: differenze`
  - `Privacy e account X`
- **FAQ (IT):**
  - **Q: Grok è gratis?** A: L'accesso e i piani dipendono da X; verifica le
    condizioni ufficiali su x.com.
  - **Q: Serve l'account X?** A: Grok è integrato in X; l'accesso avviene
    dall'app o dal sito ufficiale.
  - **Q: Grok è disponibile in Italia?** A: Risulta tra le app di IA più usate
    in Italia secondo i dati Audicom/Audiweb (dic 2025); la disponibilità va
    confermata sulla fonte ufficiale.
- **Advertencias (IT):** Accedi solo da `x.com/i/grok`; non inserire credenziali
  in siti terzi che imitano l'accesso.
- **Enlaces interni esperados (slugs it/):** `chatgpt`, `gemini`, `perplexity`.
- **Eventos de funnel (contrato F1):** `tool: grok`; plataformas `web`/`ios`/
  `android`; `channel: web-app` para `web` (ruta x.com/i/grok) y
  `channel: app-store` para `ios`/`android` (app X oficial). Emite
  `ficha_view`, `platform_select`, `redirect_start`, `redirect_result` y
  `redirect_error` en la forma canónica de la leyenda de §8.
- **Métricas y ventana:** primaria = salidas a `x.com/i/grok`; secundaria = CTR
  "Grok". Ventana F7.

---

#### notebooklm — Ficha (studio e riassunti con IA)

- **Trazabilidad:** research/it.md §4.2 (#7, #9), §5.1 (#9), §7.1, §7.2 P2.
  Evidencia: mencionado en 2+ guías italiane como herramienta gratuita.
  Confianza: Media.
- **Intención primaria (IT):** Usare NotebookLM per riassumere, organizzare e
  studiare documenti con l'IA.
- **Intenciones secundarie (IT):**
  - Creare un quaderno da file.
  - Generare riassunti e audio.
  - NotebookLM gratuito?
  - Lingue e supporto italiano.
- **Above the fold (IT):**
  - H1: `NotebookLM`
  - Tagline: `Lo studio assistito da IA di Google. Ufficiale su notebooklm.google.com.`
  - CTA: `Apri notebooklm.google.com`
  - Badge piattaforme: `Web`
  - Nota no-installer: `Servizio ufficiale Google; accedi dalla fonte ufficiale.`
  - Badge revisione: `Canale ufficiale verificato · revisione editoriale pendente`
- **Piattaforme:** Web.
- **Rutas oficiales (research/it.md §9):** `https://notebooklm.google.com`
- **Sezioni nativi (IT):**
  - `Cos'è NotebookLM`
  - `Come iniziare (ufficiale)`
  - `Riassunti e fonti`
  - `Audio overview e studio`
  - `Privacy dei documenti`
- **FAQ (IT):**
  - **Q: NotebookLM è gratuito?** A: Ha un piano gratuito; verifica limiti e
    piani su notebooklm.google.com.
  - **Q: Funziona in italiano?** A: NotebookLM supporta più lingue; conferma le
    lingue disponibili sulla documentazione ufficiale.
  - **Q: I miei documenti sono al sicuro?** A: La gestione dei dati è di Google;
    consulta l'informativa ufficiale.
- **Advertencias (IT):** Usa solo `notebooklm.google.com`; non caricare
  documenti sensibili senza verificare le policy ufficiali.
- **Enlaces interni esperados (slugs it/):** `chatgpt`, `gemini`, `perplexity`
  (activos); `strumenti-ai-freelance` (G3) queda pendiente del desbloqueo de
  guías (§8.2).
- **Eventos de funnel (contrato F1):** `tool: notebooklm`; plataforma `web`;
  `channel: web-app`. Emite `ficha_view`, `platform_select`, `redirect_start`,
  `redirect_result` y `redirect_error` en la forma canónica de la leyenda de §8.
- **Métricas y ventana:** primaria = salidas a `notebooklm.google.com`;
  secundaria = CTR "NotebookLM". Ventana F7.

---

### 8.2 Guías G1–G3 — identificadas en research, BLOQUEADAS (no ejecutables en esta fase)

`docs/mejora/decisiones.md` mantiene una **decisión abierta** que bloquea
explícitamente «Cualquier guía nueva»: «Si las guías de intención necesitan una
ruta pública antes de desbloquearse» (responsable F3/Codex). Por lo tanto, en
esta fase las guías **no** se entregan como specs ejecutables. Se conservan
aquí su trazabilidad a research y su intención nativa para no perder el
trabajo, pero **no** se definen above the fold, secciones, FAQ, advertencias,
enlaces, eventos ni métricas hasta que Codex cierre esa decisión. Además, F1 no
define un evento de vista para guías (`ficha_view` solo aplica a fichas), así
que incluso desbloqueadas requerirían un evento propio de F1 (ver B2).

#### G1 — ia-locale-privacy (BLOQUEADA)

- **Trazabilidad:** research/it.md §4.2 (#11), §5.2 (G1), §7.1. Evidencia: 2+
  artículos dedicados; privacidad = barrera #1 en Italia (45%, Eurobarómetro).
  Confianza: Media.
- **Intención primaria (IT):** Capire quando conviene un'IA in locale per la
  privacy e quando il cloud è sufficiente.
- **Estado:** BLOQUEADA — no ejecutable en F3-IT (ver nota superior y B2).

#### G2 — ollama-vs-lm-studio (BLOQUEADA)

- **Trazabilidad:** research/it.md §4.2 (#2), §5.2 (G2), §7.1. Evidencia: 1
  artículo italiano dedicado (convly.ai). Confianza: Media.
- **Intención primaria (IT):** Scegliere tra Ollama e LM Studio per l'IA locale.
- **Estado:** BLOQUEADA — no ejecutable en F3-IT (ver nota superior y B2).

#### G3 — strumenti-ai-freelance (BLOQUEADA)

- **Trazabilidad:** research/it.md §4.2 (#7, #8, #9), §5.2 (G3), §7.1.
  Evidencia: 3+ artículos italiani. Confianza: Media.
- **Intención primaria (IT):** Quali strumenti di IA usare come freelance in
  Italia per produttività e studio.
- **Estado:** BLOQUEADA — no ejecutable en F3-IT (ver nota superior y B2).

---

### 8.3 Candidatos "evaluar en F3" (de research/it.md §7.1) — decisión de esta spec

| Slug | Decisión | Motivo (evidencia) |
|---|---|---|
| `languagetool` | **Descarte** | Sin evidencia de búsqueda italiana en research/it.md §5.1 (#5). Soporta italiano (languagetool.org) pero no hay señal de demanda. No se inventa demanda. |
| `meta-ai` | **Descarte** | Hipótesis editorial sin confirmar (research/it.md §5.1 #6). Sin evidencia de búsqueda como herramienta independiente. |
| `microsoft-copilot` | **Pendiente / blocker B1** | 1,8M usuarios (Cosenza) pero en declive y competencia alta (research/it.md §5.1 #7); además research/it.md §9 **no registra dominio oficial verificado**. No se declara ruta oficial ni ficha sin fuente. Ver §9. |
| `github-copilot` | **Descarte** | Sin evidencia de búsqueda italiana (research/it.md §5.1 #8). Existe en tools-base pero sin señal de demanda. |

### 8.4 Descartes confirmados (de research/it.md §5.3)

`chatminerva`, `insieme-ai`, `deepseek` (ya existe en `it/`; el descarte se
refiere a no ampliar — fuera de alcance de esta spec modificarla),
`sora`, `character-ai`, `qwen`/`kimi`, `comfyui`, `anythingllm`/`gpt4all`/`jan`.
Motivos según research/it.md §5.3 (producto temprano, nicho, en declive,
baja tracción en Italia, o sin evidencia de búsqueda italiana).

---

## 9. Bloqueadores y preguntas abiertas

### B1 — `microsoft-copilot`: ruta oficial no verificada (bloqueador)

- **Evidencia:** research/it.md §5.1 (#7) lista `microsoft-copilot` con 1,8M
  usuarios (Cosenza/Audicom) pero en declive y "Competencia alta en SERP";
  research/it.md §9 (sitios oficiales) **no incluye** un dominio para
  `microsoft-copilot` (sí para `github-copilot`: `github.com/features/copilot`).
- **Problema:** esta spec no puede declarar "Rutas oficiales" para
  `microsoft-copilot` sin inventar una URL. La regla anti-alucinación lo prohíbe.
- **Decisión de esta spec:** no se incluye `microsoft-copilot` como ficha
  aprobada en F3-IT. Queda pendiente de verificar la fuente oficial en F4-IT.
- **Pregunta a Codex:** ¿Autoriza F4-IT verificar y, en su caso, declarar la
  ruta oficial de `microsoft-copilot` (p. ej. `copilot.microsoft.com`) antes de
  crear su ficha, o lo descartamos definitivamente por el declive y la alta
  competencia SERP? Hasta entonces, la spec no lo aprueba.

### B2 — Evento de vista de guía no definido en F1 + guías bloqueadas

- F1 (#36, rama no fusionada) no define un evento de vista para guías: su
  taxonomía tiene `ficha_view` (solo para fichas), `platform_select`,
  `redirect_start`, `redirect_result`, `redirect_error`. Ninguno corresponde a
  la vista de una guía.
- Las guías G1–G3 (§8.2) están además bloqueadas por la decisión abierta de
  `docs/mejora/decisiones.md` («Cualquier guía nueva»). Por lo tanto esta spec
  no emite eventos de guía.
- **Pregunta a Codex:** al desbloquear las guías, ¿define F1 un evento de vista
  de guía (p. ej. `guida_view`) y su ruta pública antes de que F4-IT las
  implemente? Hasta entonces, las guías no instrumentan `ficha_view`.

---

## 10. Criterios de aceptación (mapeo al issue #41)

- [x] **Toda spec se rastrea a una oportunidad del research italiano** — §8
  cita sección de `research/it.md` por cada oportunidad; descartes citan §5.3.
- [x] **Consultas y copy nativos, no traducción del español** — todos los
  campos `(IT)` están en italiano redactado nativo; ninguno es calco del
  español.
- [x] **Cada spec declara archivos propios y protegidos** — §4 (propia) y §5
  (protegidos).
- [x] **Se preservan no-installer, fuentes oficiales y revisión** — advertencias
  `(IT)` y notas no-installer en cada above the fold; rutas solo de §9.
- [x] **No se modifica contenido, rutas, hreflang ni selector de idioma** —
  §7 fuera de alcance; el diff de este entregable es solo
  `docs/mejora/specs/it.md` (ver validación §11).

### Cumplimiento del contrato F1 y de la gobernanza (corregido en esta revisión)

- [x] **Eventos canónicos de F1:** las fichas de §8.1 emiten solo
  `ficha_view`, `platform_select`, `redirect_start`, `redirect_result`,
  `redirect_error`; no quedan nombres inventados.
- [x] **Parámetros canónicos de F1:** los payloads usan solo `lang`, `tool`,
  `platform`, `channel`, `valid` y `reason` (solo en `redirect_error`), con
  valores dentro de las enumeraciones controladas de F1; `channel` siempre como
  tipo de canal, nunca como URL. No quedan parámetros no canónicos.
- [x] **`ficha_view` no se usa para guías:** las guías de §8.2 no emiten
  eventos (ver B2).
- [x] **Guías no presentadas como ejecutables:** §8.2 las registra como
  BLOQUEADAS por la decisión abierta de `docs/mejora/decisiones.md`, sin above
  the fold, secciones, FAQ, eventos ni métricas ejecutables.
- [x] **Dependencia F1 declarada no fusionada:** §1, §2 y B2 lo explicitan; no
  se copian archivos de la rama F1 ni se marca la dependencia como integrada.

> **Estado de la entrega:** entregado para revisión de Codex; **no fusionado**.
> El issue #41 permanece abierto. Bloqueadores pendientes: **B1**
> (`microsoft-copilot`, sin fuente oficial verificada) y **B2** (guías nuevas
> bloqueadas y sin evento de vista de guía en F1). Ningún criterio que dependa
> de esas decisiones se marca como resuelto.

## 11. Validación y evidencia

- Comando: `git status` / `git diff --stat` tras el commit → debe mostrar
  **solo** `docs/mejora/specs/it.md` como archivo modificado; ningún archivo
  protegido ni contenido de sitio modificado.
- Esta spec es un documento de planificación (no UI/contenido del sitio), por lo
  que `npm run build` y los audits de contenido (`catalog:audit`, `hw:audit`,
  `links:audit`) no se ejecutan sobre ella; se ejecutarán en F4-IT al
  implementar las fichas.
- Trazabilidad verificable: cada bloque de §8 enlaza a `research/it.md`
  (secciones §4.2, §5.1, §5.2, §5.3, §7.1, §9).
- Contrato F1: los eventos y parámetros de §8.1 se contrastaron contra
  `src/utils/funnel-events.ts` de la rama F1 (`FUNNEL_EVENT_NAMES`,
  `VALID_LANGS`, `VALID_PLATFORMS`, `VALID_CHANNELS`,
  `REDIRECT_ERROR_REASONS`); solo se usan nombres y valores de esas
  enumeraciones.
- Codificación: archivo verificado a nivel de bytes como UTF-8 válido
  (acentos correctos, sin secuencias de mojibake).

## 12. Riesgos conocidos

1. **Sin datos de volumen de búsqueda:** el research/it.md no midió volumen
   (limitación explícita §1.2). Las prioridades son cualitativas; F7 medirá el
   efecto real postpublicación.
2. **Disponibilidad regional no verificada:** el research no confirmó
   disponibilidad en tiendas italianas; las fichas deben verificarlo en F4.
3. **AI Act (2 ago 2026):** posible impacto en disponibilidad; no verificado.
4. **`microsoft-copilot` sin ruta oficial** → bloqueador B1.
5. **Guías G1–G3 bloqueadas** por la decisión abierta de
   `docs/mejora/decisiones.md` → no forman parte del entregable ejecutable
   (§8.2, B2).
6. **F1 no fusionada en `main`:** el contrato de eventos se alinea a la rama
   F1; si cambia antes de fusionarse, F4-IT debe realinear (§2, B2).
