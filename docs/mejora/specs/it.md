# F3-IT ÔÇö Specs editoriales y UX del producto italiano

> Spec SDD del issue #41. Producto: `it` (italiano). Rama base: `main`.
> Dependencia satisfecha: #37 (F2-IT), fusionado en `main` v├¡a PR #48
> (`ba7f198 docs: merge F2-IT Italian research`). El research vive en
> `docs/mejora/research/it.md` y es entrada de solo lectura de esta spec.
>
> Convenci├│n de este documento: la narrativa y los metadatos est├ín en espa├▒ol
> (idioma de trabajo del repositorio y de revisi├│n de Codex). Las **consultas,
> intenciones, copy above the fold, secciones, FAQ, advertencias y enlaces
> previstos est├ín en italiano nativo**, no son traducci├│n del espa├▒ol. Cada
> campo de producto se marca `(IT)`.

---

## 1. Identidad y alcance

| Campo | Valor |
|---|---|
| Issue | #41 |
| Fase | F3-IT (Specs editoriales y UX) |
| Producto | `it` |
| Rama base | `main` |
| Depende de | #37 (F2-IT) ÔÇö fusionado |
| Input no bloqueante | #36 (F1, taxonom├¡a de eventos de funnel) |
| Salida | `docs/mejora/specs/it.md` (este archivo) |
| Regla de oro | Sin mirrors, sin instaladores de terceros, solo fuentes oficiales; copy nativo italiano; revisi├│n editorial posterior |

---

## 2. Contrato de entrada (lo que ya existe)

- `docs/mejora/research/it.md` (v3): market brief italiano, matriz de
  oportunidades, selecci├│n/rechazo y fuentes. Las oportunidades de esta spec se
  rastrean l├¡nea a l├¡nea a ese documento.
- `docs/mejora/decisiones.md`: `it` decide consultas, selecci├│n y prioridades
  italianas; no hereda de `es`/`sv`. F3-IT posee `docs/mejora/specs/it.md`.
- `docs/plan-mejora-productos-por-idioma.md` ┬º6 (F3): campos obligatorios de
  cada spec (ficha/gu├¡a/descarte, intenci├│n, above the fold, canales oficiales,
  secciones, FAQ, advertencias, enlaces, eventos, m├®tricas).
- Taxonom├¡a de eventos de funnel (nombres can├│nicos de F1): `ficha`/`guida`
  (vista), `piattaforma` (selecci├│n), `/r` (clic al interstitial), `destino`
  (salida al canal oficial), `idioma` (=`it`), `strumento` (slug). El esquema
  exacto de par├ímetros lo define F1; esta spec declara **qu├® eventos debe
  emitir cada p├ígina**, no el contrato t├®cnico.

---

## 3. Contrato de salida

- `docs/mejora/specs/it.md`: spec ejecutable por oportunidad para el producto
  `it`, lista para que F4-IT la implemente en `src/content/tools/it/` y en las
  rutas de gu├¡a que F3/F5 autoricen.

---

## 4. Archivos que posee esta fase

- `docs/mejora/specs/it.md` ÔÇö creaci├│n y edici├│n de la spec del producto italiano.

---

## 5. PROTEGIDOS (no editables por esta fase)

- `docs/mejora/specs/es.md`, `docs/mejora/specs/sv.md` ÔÇö specs de otros productos.
- `docs/mejora/research/it.md` ÔÇö salida de #37 (entrada, no se edita).
- `docs/mejora/research/es.md`, `docs/mejora/research/sv.md`.
- `src/content/tools/it/*`, `src/content/tools/es/*`, `src/content/tools/sv/*`,
  `src/content/tools-base/*` ÔÇö contenido del sitio (lo implementa F4).
- `public/`, `worker/`, `.well-known/`, `src/utils/links.ts`, rutas, hreflang,
  canonical, robots y selector de idioma ÔÇö fuera del alcance de F3.
- `docs/mejora/decisiones.md` ÔÇö gobierno (lo edita Codex/F0).

---

## 6. Instrucciones de ejecuci├│n

1. Toda oportunidad se rastrea a `research/it.md` (n├║mero de secci├│n citado).
2. Consultas, copy, FAQ y advertencias son **italiano nativo**; no se traduce
   del espa├▒ol.
3. Las rutas oficiales son **solo los dominios verificados en research/it.md ┬º9**
   (`cursor.com`, `ollama.com`, `lmstudio.ai`, `x.com/i/grok`,
   `notebooklm.google.com`, `languagetool.org`, `ai.meta.com`,
   `github.com/features/copilot`). Sin dominio verificado ÔåÆ no se declara ruta
   (ver ┬º9, `microsoft-copilot`).
4. Se preserva: no-installer expl├¡cito, fuentes oficiales, y badge de revisi├│n
   editorial pendiente (Codex/Antigravity).
5. No se modifican rutas, hreflang, canonical, selector de idioma ni contenido
   existente. Esta spec es un documento de planificaci├│n.
6. Los enlaces internos previstos usan solo slugs que existen en `it/` (seg├║n
   research/it.md ┬º3.1) o los slugs nuevos que esta misma spec aprueba.

---

## 7. Fuera de alcance

- Crear o modificar fichas/`it/` (lo hace F4-IT).
- Crear rutas p├║blicas de gu├¡a (lo autoriza F3/F5; aqu├¡ solo se especifica).
- Cambiar hreflang, canonical, robots, selector de idioma o `src/utils/links.ts`.
- Definir el esquema t├®cnico de eventos (lo posee F1).
- Decidir el producto espa├▒ol o sueco (independencia de producto).

---

## 8. Especificaciones por oportunidad

> Leyenda de campos por oportunidad:
> **P├ígina** (ficha/gu├¡a), **Trazabilidad** (research/it.md ┬º), **Intenci├│n
> primaria (IT)**, **Intenciones secundarias (IT)**, **Above the fold (IT)**,
> **Plataformas**, **Rutas oficiales**, **Secciones nativas (IT)**,
> **FAQ (IT)**, **Advertencias (IT)**, **Enlaces internos (slugs it/)**,
> **Eventos de funnel**, **M├®tricas y ventana**.

### 8.1 Fichas seleccionadas (de research/it.md ┬º5.1 y ┬º7.1)

---

#### cursor ÔÇö Ficha (editor de c├│digo con IA)

- **Trazabilidad:** research/it.md ┬º4.2 (#4, #5, #6), ┬º5.1 (#1), ┬º7.1, ┬º7.2 P1.
  Evidencia: 6+ art├¡culos italianos (suoggi.com, utileapp.com, datacamp.com/it).
  Confianza: Media.
- **Intenci├│n primaria (IT):** Installare e usare Cursor, l'editor di codice
  con l'IA, per scrivere e revisionare codice pi├╣ velocemente.
- **Intenciones secundarie (IT):**
  - Capire la differenza tra Cursor e un editor classico (es. VS Code).
  - Sapere se Cursor ├¿ gratuito per uso personale.
  - Trovare la documentazione e i canali ufficiali.
- **Above the fold (IT):**
  - H1: `Cursor`
  - Tagline: `L'editor di codice con l'intelligenza artificiale. Ufficiale su cursor.com.`
  - CTA: `Vai al sito ufficiale cursor.com`
  - Badge piattaforme: `Windows` ┬À `macOS` ┬À `Linux`
  - Nota no-installer: `DescargasIA non ospita l'installer: scarica sempre dalla fonte ufficiale.`
  - Badge revisione: `Canale ufficiale verificato ┬À revisione editoriale pendente`
- **Piattaforme:** Windows, macOS, Linux (il supporto Linux ├¿ dichiarato sul
  sito ufficiale; fuori dalle "piattaforme predominanti" del research, ma
  verificabile sulla fonte ufficiale).
- **Rutas oficiales (research/it.md ┬º9):** `https://cursor.com`
- **Secciones nativas (IT):**
  - `Cos'├¿ Cursor e a cosa serve`
  - `Come si installa (passaggi ufficiali)` ÔÇö enlaza a cursor.com, sin descargas.
  - `Cursor e la privacy del codice`
  - `Cursor o un editor classico?`
- **FAQ (IT):**
  - **Q: Cursor ├¿ gratuito?** A: Cursor offre un piano gratuito e piani a
    pagamento; prezzi e termini aggiornati sono sul sito ufficiale cursor.com.
    Non riportiamo prezzi non verificati.
  - **Q: Cursor funziona su Windows e Mac?** A: S├¼, ├¿ disponibile per Windows e
    macOS e anche Linux; scarica la versione dalla pagina ufficiale.
  - **Q: I miei codici restano privati?** A: Impostazioni di privacy e uso dei
    dati sono gestiti da Cursor; consulta la sua informativa ufficiale.
    DescargasIA non elabora il tuo codice.
- **Advertencias (IT):** Non scaricare Cursor da siti non ufficiali: rischi
  versioni modificate o non sicure. Usa sempre `cursor.com`.
- **Enlaces internos esperados (slugs it/):** `chatgpt` (complemento
  generativo). *Relaciones fuertes m├¡nimas en esta fase; F5 definir├í el grafo.*
- **Eventos de funnel:** `ficha_vista` (`strumento=cursor`, `idioma=it`);
  `piattaforma_selezionata`; `salita_r` ÔåÆ `destino_alcanzado`
  (`destino=cursor.com`).
- **M├®tricas y ventana:** primaria = salidas al canal oficial `cursor.com` por
  plataforma; secundaria = CTR y posici├│n en consulta "Cursor AI". Ventana: 14
  d├¡as para errores de destino, 28 d├¡as para tendencia (seg├║n plan F7).

---

#### ollama ÔÇö Ficha (IA locale, LLM in locale)

- **Trazabilidad:** research/it.md ┬º4.2 (#1, #2), ┬º5.1 (#2), ┬º7.1, ┬º7.2 P2.
  Evidencia: 2+ art├¡culos italianos; tema privacidad relevante (45%,
  Eurobar├│metro). Confianza: Media.
- **Intenci├│n primaria (IT):** Eseguire modelli di linguaggio (LLM) in locale
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
  - Badge piattaforme: `Windows` ┬À `macOS` ┬À `Linux`
  - Nota no-installer: `DescargasIA non ospita l'installer: usa solo la fonte ufficiale.`
  - Badge revisione: `Canale ufficiale verificato ┬À revisione editoriale pendente`
- **Piattaforme:** Windows, macOS, Linux (sitio ufficiale).
- **Rutas oficiales (research/it.md ┬º9):** `https://ollama.com`
- **Secciones nativas (IT):**
  - `Cos'├¿ Ollama e a cosa serve`
  - `Installazione dalla fonte ufficiale`
  - `Primi passi: scaricare un modello`
  - `Ollama e la privacy dei dati`
  - `Ollama o LM Studio?` (enlace interno)
- **FAQ (IT):**
  - **Q: Serve una GPU per usare Ollama?** A: Ollama pu├▓ usare CPU o GPU; le
    prestazioni dipendono dal modello e dall'hardware. Verifica i requisiti
    sulla documentazione ufficiale.
  - **Q: Ollama ├¿ gratuito?** A: Ollama ├¿ open source; dettagli e termini sono
    sul sito ufficiale. Non riportiamo prezzi non verificati.
  - **Q: I miei dati restano sul mio PC?** A: Eseguendo i modelli in locale i
    dati non lasciano il dispositivo, salvo configurazioni esplicite. Conferma
    sulla documentazione ufficiale.
- **Advertencias (IT):** Non usare installer di terze parti; scarica solo da
  `ollama.com`. I modelli locali richiedono risorse hardware: verifica prima.
- **Enlaces internos esperados (slugs it/):** `lm-studio`,
  `ia-locale-privacy` (guida G1), `ollama-vs-lm-studio` (guida G2).
- **Eventos de funnel:** `ficha_vista` (`strumento=ollama`, `idioma=it`);
  `piattaforma_selezionada`; `salita_r` ÔåÆ `destino_alcanzado`
  (`destino=ollama.com`).
- **M├®tricas y ventana:** primaria = salidas a `ollama.com`; secundaria = CTR y
  posici├│n en "installare Llama in locale" / "Ollama". Ventana F7 (14/28 d├¡as).

---

#### lm-studio ÔÇö Ficha (IA locale, interfaccia grafica)

- **Trazabilidad:** research/it.md ┬º4.2 (#1, #2), ┬º5.1 (#3), ┬º7.1, ┬º7.2 P2.
  Evidencia: 2+ art├¡culos italianos; alternativa grafica a Ollama. Confianza: Media.
- **Intenci├│n primaria (IT):** Usare un'interfaccia grafica per scaricare ed
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
  - Badge piattaforme: `Windows` ┬À `macOS` ┬À `Linux`
  - Nota no-installer: `DescargasIA non ospita l'installer: usa solo la fonte ufficiale.`
  - Badge revisione: `Canale ufficiale verificato ┬À revisione editoriale pendente`
- **Piattaforme:** Windows, macOS, Linux (sitio ufficiale).
- **Rutas oficiales (research/it.md ┬º9):** `https://lmstudio.ai`
- **Secciones nativas (IT):**
  - `Cos'├¿ LM Studio`
  - `Installazione ufficiale`
  - `Scaricare e avviare un modello`
  - `LM Studio vs Ollama` (enlace interno)
  - `Privacy dei dati locali`
- **FAQ (IT):**
  - **Q: LM Studio ├¿ gratuito?** A: LM Studio ├¿ gratuito per uso personale
    secondo i termini ufficiali; verifica su lmstudio.ai.
  - **Q: Posso usarlo senza comandi?** A: S├¼, ha un'interfaccia grafica; questo
    lo distingue da soluzioni solo terminale come Ollama.
  - **Q: I modelli restano sul mio PC?** A: I modelli girano in locale; i
    dettagli sulla privacy sono nella documentazione ufficiale.
- **Advertencias (IT):** Scarica solo da `lmstudio.ai`; evita pacchetti non
  ufficiali o modificati.
- **Enlaces internos esperados (slugs it/):** `ollama`,
  `ia-locale-privacy` (G1), `ollama-vs-lm-studio` (G2).
- **Eventos de funnel:** `ficha_vista` (`strumento=lm-studio`, `idioma=it`);
  `piattaforma_selezionata`; `salita_r` ÔåÆ `destino_alcanzado`
  (`destino=lmstudio.ai`).
- **M├®tricas y ventana:** primaria = salidas a `lmstudio.ai`; secundaria = CTR
  "LM Studio" / "Ollama vs LM Studio". Ventana F7.

---

#### grok ÔÇö Ficha (assistente IA integrato in X)

- **Trazabilidad:** research/it.md ┬º4.2 (#10 uso app), ┬º5.1 (#4), ┬º7.1, ┬º7.2 P1.
  Evidencia cuantitativa: 656K usuarios Italia (dic 2025, Cosenza/Audicom).
  Confianza: Media-alta.
- **Intenci├│n primaria (IT):** Usare Grok, l'assistente IA integrato in X, dal
  web o dall'app ufficiale.
- **Intenciones secundarie (IT):**
  - Accedere a Grok da X.
  - Capire cos'├¿ Grok e cosa sa fare.
  - Gratuito o a pagamento.
  - Differenze con ChatGPT e Gemini.
- **Above the fold (IT):**
  - H1: `Grok`
  - Tagline: `L'assistente IA di x.com, accessibile dal web e dall'app ufficiale.`
  - CTA: `Apri Grok su x.com/i/grok`
  - Badge piattaforme: `Web` ┬À `iOS` ┬À `Android`
  - Nota no-installer: `Accedi solo dalla fonte ufficiale; non inserire credenziali altrove.`
  - Badge revisione: `Canale ufficiale verificato ┬À revisione editoriale pendente`
- **Piattaforme:** Web, iOS, Android.
- **Rutas oficiales (research/it.md ┬º9):** `https://x.com/i/grok`
- **Secciones nativas (IT):**
  - `Cos'├¿ Grok`
  - `Come accedere (ufficiale)`
  - `Cosa sa fare`
  - `Grok, ChatGPT e Gemini: differenze`
  - `Privacy e account X`
- **FAQ (IT):**
  - **Q: Grok ├¿ gratis?** A: L'accesso e i piani dipendono da X; verifica le
    condizioni ufficiali su x.com.
  - **Q: Serve l'account X?** A: Grok ├¿ integrato in X; l'accesso avviene
    dall'app o dal sito ufficiale.
  - **Q: Grok ├¿ disponibile in Italia?** A: Risulta tra le app di IA pi├╣ usate
    in Italia secondo i dati Audicom/Audiweb (dic 2025); la disponibilit├á va
    confermata sulla fonte ufficiale.
- **Advertencias (IT):** Accedi solo da `x.com/i/grok`; non inserire credenziali
  in siti terzi che imitano l'accesso.
- **Enlaces internos esperados (slugs it/):** `chatgpt`, `gemini`, `perplexity`.
- **Eventos de funnel:** `ficha_vista` (`strumento=grok`, `idioma=it`);
  `piattaforma_selezionada`; `salita_r` ÔåÆ `destino_alcanzado`
  (`destino=x.com/i/grok`).
- **M├®tricas y ventana:** primaria = salidas a `x.com/i/grok`; secundaria = CTR
  "Grok". Ventana F7.

---

#### notebooklm ÔÇö Ficha (studio e riassunti con IA)

- **Trazabilidad:** research/it.md ┬º4.2 (#7, #9), ┬º5.1 (#9), ┬º7.1, ┬º7.2 P2.
  Evidencia: mencionado en 2+ gu├¡as italiane como herramienta gratuita.
  Confianza: Media.
- **Intenci├│n primaria (IT):** Usare NotebookLM per riassumere, organizzare e
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
  - Badge revisione: `Canale ufficiale verificato ┬À revisione editoriale pendente`
- **Piattaforme:** Web.
- **Rutas oficiales (research/it.md ┬º9):** `https://notebooklm.google.com`
- **Secciones nativas (IT):**
  - `Cos'├¿ NotebookLM`
  - `Come iniziare (ufficiale)`
  - `Riassunti e fonti`
  - `Audio overview e studio`
  - `Privacy dei documenti`
- **FAQ (IT):**
  - **Q: NotebookLM ├¿ gratuito?** A: Ha un piano gratuito; verifica limiti e
    piani su notebooklm.google.com.
  - **Q: Funziona in italiano?** A: NotebookLM supporta pi├╣ lingue; conferma le
    lingue disponibili sulla documentazione ufficiale.
  - **Q: I miei documenti sono al sicuro?** A: La gestione dei dati ├¿ di Google;
    consulta l'informativa ufficiale.
- **Advertencias (IT):** Usa solo `notebooklm.google.com`; non caricare
  documenti sensibili senza verificare le policy ufficiali.
- **Enlaces internos esperados (slugs it/):** `chatgpt`, `gemini`,
  `perplexity`, `strumenti-ai-freelance` (guida G3).
- **Eventos de funnel:** `ficha_vista` (`strumento=notebooklm`, `idioma=it`);
  `piattaforma_selezionada`; `salita_r` ÔåÆ `destino_alcanzado`
  (`destino=notebooklm.google.com`).
- **M├®tricas y ventana:** primaria = salidas a `notebooklm.google.com`;
  secundaria = CTR "NotebookLM". Ventana F7.

---

### 8.2 Gu├¡as seleccionadas (de research/it.md ┬º5.2 y ┬º7.1)

#### G1 ÔÇö ia-locale-privacy: IA locale o cloud per la privacy

- **Trazabilidad:** research/it.md ┬º4.2 (#11), ┬º5.2 (G1), ┬º7.1. Evidencia: 2+
  art├¡culos dedicados; privacidad = barrera #1 en Italia (45%, Eurobar├│metro).
  Confianza: Media.
- **Decisi├│n de p├ígina:** Gu├¡a (contenido comparativo/educativo, no ficha).
- **Intenci├│n primaria (IT):** Capire quando conviene un'IA in locale per la
  privacy e quando il cloud ├¿ sufficiente.
- **Intenciones secundarie (IT):** Che cos'├¿ l'IA locale; rischi del cloud;
  quali strumenti usare in locale.
- **Above the fold (IT):**
  - H1: `IA locale o cloud: guida alla privacy`
  - Tagline: `In Italia la privacy ├¿ la prima barriera all'IA (45%, Eurobarometro 2026). Ecco come scegliere.`
  - CTA secundario: `Vai agli strumenti in locale: Ollama ┬À LM Studio`
- **Piattaforme:** transversal (Windows/macOS/Linux para herramientas locales).
- **Rutas oficiales citadas:** `https://ollama.com`, `https://lmstudio.ai`.
- **Secciones nativas (IT):**
  - `Perch├® la privacy preoccupa gli italiani`
  - `Cos'├¿ l'IA locale (Ollama, LM Studio)`
  - `Quando il cloud basta`
  - `Rischi e accorgimenti`
  - `Strumenti consigliati per iniziare`
- **FAQ (IT):**
  - **Q: L'IA locale ├¿ pi├╣ sicura?** A: Eseguire modelli in locale mantiene i
    dati sul dispositivo, ma la sicurezza dipende anche da configurazione e
    fonte del modello. Non ├¿ una garanzia assoluta.
  - **Q: Serve hardware potente?** A: Dipende dal modello; i modelli pi├╣ grandi
    richiedono pi├╣ memoria e GPU. Verifica i requisiti sulle fonti ufficiali.
  - **Q: Posso usare modelli locali su Windows/Mac?** A: S├¼, Ollama e LM Studio
    sono disponibili per Windows e macOS (e Linux).
- **Advertencias (IT):** La scelta "locale" non elimina rischi se i modelli
  provengono da fonti non verificate. Scarica solo da siti ufficiali.
- **Enlaces internos esperados (slugs it/):** `ollama`, `lm-studio`.
- **Eventos de funnel:** `guida_vista` (`guida=ia-locale-privacy`, `idioma=it`);
  `salita_r` ÔåÆ `destino_alcanzado` (hacia `ollama.com`/`lmstudio.ai`).
- **M├®tricas y ventana:** primaria = clics desde la gu├¡a a las fichas enlazadas
  (`ollama`, `lm-studio`); secundaria = visitas de la gu├¡a. Ventana F7.

#### G2 ÔÇö ollama-vs-lm-studio: guida comparativa

- **Trazabilidad:** research/it.md ┬º4.2 (#2), ┬º5.2 (G2), ┬º7.1. Evidencia: 1
  art├¡culo italiano dedicado (convly.ai). Confianza: Media.
- **Decisi├│n de p├ígina:** Gu├¡a comparativa.
- **Intenci├│n primaria (IT):** Scegliere tra Ollama e LM Studio per l'IA locale.
- **Above the fold (IT):**
  - H1: `Ollama o LM Studio: quale scegliere`
  - Tagline: `Due modi di usare l'IA in locale. Confronto onesto, senza scaricare nulla da noi.`
- **Rutas oficiales citadas:** `https://ollama.com`, `https://lmstudio.ai`.
- **Secciones nativas (IT):** `Differenze principali` ┬À `Per chi ├¿ Ollama` ┬À
  `Per chi ├¿ LM Studio` ┬À `Requisiti` ┬À `Da dove scaricare (ufficiale)`.
- **FAQ (IT):**
  - **Q: Quale ├¿ meglio per principianti?** A: LM Studio ha interfaccia
    grafica; Ollama ├¿ pi├╣ orientato alla riga di comando. La scelta dipende
    dall'esperienza.
  - **Q: Posso usare entrambi?** A: S├¼, gestiscono modelli locali in modo
    diverso e possono coesistere.
- **Advertencias (IT):** Scarica solo dalle fonti ufficiali citate.
- **Enlaces internos esperados (slugs it/):** `ollama`, `lm-studio`,
  `ia-locale-privacy` (G1).
- **Eventos de funnel:** `guida_vista` (`guida=ollama-vs-lm-studio`,
  `idioma=it`); `salita_r` ÔåÆ `destino_alcanzado`.
- **M├®tricas y ventana:** primaria = clics a `ollama`/`lm-studio`; secundaria =
  CTR "Ollama vs LM Studio". Ventana F7.

#### G3 ÔÇö strumenti-ai-freelance: strumenti IA per freelance

- **Trazabilidad:** research/it.md ┬º4.2 (#7, #8, #9), ┬º5.2 (G3), ┬º7.1.
  Evidencia: 3+ art├¡culos italiani. Confianza: Media.
- **Decisi├│n de p├ígina:** Gu├¡a editorial (agregadora por intenci├│n).
- **Intenci├│n primaria (IT):** Quali strumenti di IA usare come freelance in
  Italia per produttivit├á e studio.
- **Above the fold (IT):**
  - H1: `Strumenti di IA per freelance`
  - Tagline: `Una selezione di strumenti ufficiali per scrivere, riassumere e organizzare il lavoro.`
- **Rutas oficiales citadas:** las de las fichas enlazadas.
- **Secciones nativas (IT):** `Scrittura e grammatica` ┬À `Ricerca e riassunti`
  ┬À `Organizzazione` ┬À `Cosa evitare (fonti non ufficiali)`.
- **FAQ (IT):**
  - **Q: Quali strumenti sono gratuiti?** A: Diverse opzioni hanno un piano
    gratuito; verifica limiti e piani sulle fonti ufficiali di ciascuno.
  - **Q: Posso usarli per i clienti?** A: Verifica i termini d'uso di ciascuno
    strumento sulla sua fonte ufficiale.
- **Advertencias (IT):** Usa solo strumenti da fonti ufficiali; evita siti che
  promettono "versioni premium gratis".
- **Enlaces internos esperados (slugs it/):** `notebooklm`, `chatgpt`,
  `gemini`, `perplexity`, `grammarly`, `deepl`.
- **Eventos de funnel:** `guida_vista` (`guida=strumenti-ai-freelance`,
  `idioma=it`); `salita_r` ÔåÆ `destino_alcanzado`.
- **M├®tricas y ventana:** primaria = clics a fichas enlazadas; secundaria =
  visitas de la gu├¡a. Ventana F7.

---

### 8.3 Candidatos "evaluar en F3" (de research/it.md ┬º7.1) ÔÇö decisi├│n de esta spec

| Slug | Decisi├│n | Motivo (evidencia) |
|---|---|---|
| `languagetool` | **Descarte** | Sin evidencia de b├║squeda italiana en research/it.md ┬º5.1 (#5). Soporta italiano (languagetool.org) pero no hay se├▒al de demanda. No se inventa demanda. |
| `meta-ai` | **Descarte** | Hip├│tesis editorial sin confirmar (research/it.md ┬º5.1 #6). Sin evidencia de b├║squeda como herramienta independiente. |
| `microsoft-copilot` | **Pendiente / blocker** | 1,8M usuarios (Cosenza) pero en declive y competencia alta (research/it.md ┬º5.1 #7); adem├ís research/it.md ┬º9 **no registra dominio oficial verificado**. No se declara ruta oficial ni ficha sin fuente. Ver ┬º9. |
| `github-copilot` | **Descarte** | Sin evidencia de b├║squeda italiana (research/it.md ┬º5.1 #8). Existe en tools-base pero sin se├▒al de demanda. |

### 8.4 Descartes confirmados (de research/it.md ┬º5.3)

`chatminerva`, `insieme-ai`, `deepseek` (ya existe en `it/`; el descarte se
refiere a no ampliar ÔÇö fuera de alcance de esta spec modificarla),
`sora`, `character-ai`, `qwen`/`kimi`, `comfyui`, `anythingllm`/`gpt4all`/`jan`.
Motivos seg├║n research/it.md ┬º5.3 (producto temprano, nicho, en declive,
baja tracci├│n en Italia, o sin evidencia de b├║squeda italiana).

---

## 9. Bloqueadores y preguntas abiertas

### B1 ÔÇö `microsoft-copilot`: ruta oficial no verificada (bloqueador)

- **Evidencia:** research/it.md ┬º5.1 (#7) lista `microsoft-copilot` con 1,8M
  usuarios (Cosenza/Audicom) pero en declive y "Competencia alta en SERP";
  research/it.md ┬º9 (sitios oficiales) **no incluye** un dominio para
  `microsoft-copilot` (s├¡ para `github-copilot`: `github.com/features/copilot`).
- **Problema:** esta spec no puede declarar "Rutas oficiales" para
  `microsoft-copilot` sin inventar una URL. La regla anti-alucinaci├│n lo proh├¡be.
- **Decisi├│n de esta spec:** no se incluye `microsoft-copilot` como ficha
  aprobada en F3-IT. Queda pendiente de verificar la fuente oficial en F4-IT.
- **Pregunta a Codex:** ┬┐Autoriza F4-IT verificar y, en su caso, declarar la
  ruta oficial de `microsoft-copilot` (p. ej. `copilot.microsoft.com`) antes de
  crear su ficha, o lo descartamos definitivamente por el declive y la alta
  competencia SERP? Hasta entonces, la spec no lo aprueba.

### B2 ÔÇö Esquema t├®cnico de eventos (F1)

Los nombres de eventos en ┬º8 son los de la taxonom├¡a de F1
(`ficha`/`guida`, `piattaforma`, `/r`, `destino`, `idioma`, `strumento`). El
esquema de par├ímetros y la instrumentaci├│n los posee F1 (#36); esta spec los
referencia pero no los define. Si F1 cambia los nombres, F4-IT debe alinear.

---

## 10. Criterios de aceptaci├│n (mapeo al issue #41)

- [x] **Toda spec se rastrea a una oportunidad del research italiano** ÔÇö ┬º8
  cita secci├│n de `research/it.md` por cada oportunidad; descartes citan ┬º5.3.
- [x] **Consultas y copy nativos, no traducci├│n del espa├▒ol** ÔÇö todos los
  campos `(IT)` est├ín en italiano redactado nativo; ninguno es calco del
  espa├▒ol.
- [x] **Cada spec declara archivos propios y protegidos** ÔÇö ┬º4 (propia) y ┬º5
  (protegidos).
- [x] **Se preservan no-installer, fuentes oficiales y revisi├│n** ÔÇö advertencias
  `(IT)` y notas no-installer en cada above the fold; rutas solo de ┬º9.
- [x] **No se modifica contenido, rutas, hreflang ni selector de idioma** ÔÇö
  ┬º7 fuera de alcance; el diff de este entregable es solo
  `docs/mejora/specs/it.md` (ver validaci├│n ┬º11).

## 11. Validaci├│n y evidencia

- Comando: `git status` / `git diff --stat` tras el commit ÔåÆ debe mostrar
  **solo** `docs/mejora/specs/it.md` como nuevo archivo; ning├║n archivo
  protegido ni contenido de sitio modificado.
- Esta spec es un documento de planificaci├│n (no UI/contenido del sitio), por lo
  que `npm run build` y los audits de contenido (`catalog:audit`, `hw:audit`,
  `links:audit`) no se ejecutan sobre ella; se ejecutar├ín en F4-IT al
  implementar las fichas.
- Trazabilidad verificable: cada bloque de ┬º8 enlaza a `research/it.md`
  (secciones ┬º4.2, ┬º5.1, ┬º5.2, ┬º5.3, ┬º7.1, ┬º9).

## 12. Riesgos conocidos

1. **Sin datos de volumen de b├║squeda:** el research/it.md no midi├│ volumen
   (limitaci├│n expl├¡cita ┬º1.2). Las prioridades son cualitativas; F7 medir├í el
   efecto real postpublicaci├│n.
2. **Disponibilidad regional no verificada:** el research no confirm├│
   disponibilidad en tiendas italianas; las fichas deben verificarlo en F4.
3. **AI Act (2 ago 2026):** posible impacto en disponibilidad; no verificado.
4. **`microsoft-copilot` sin ruta oficial** ÔåÆ bloqueador B1.
5. **Eventos dependen de F1** ÔåÆ alineaci├│n en F4 (B2).
