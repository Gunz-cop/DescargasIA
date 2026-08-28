# F3-SV — specs editoriales y UX del producto sueco

**Proyecto:** `docs/plan-mejora-productos-por-idioma.md`
**Issue:** #39
**Producto:** `sv`
**Rama base:** `main` — rama de integración de la serie, según el registro de
`docs/mejora/decisiones.md` del 2026-08-27
**Depende de:** F2-SV (#34, fusionada en `main` mediante el PR #49) y F0 (#35,
fusionada en `main` mediante el PR #53)

> Documento de especificación. **No publica contenido.** Convierte el research
> sueco en contratos ejecutables para F4-SV. La ruta pública de guías ya está
> integrada mediante PR #78; F4-SV puede crear únicamente los cuatro archivos
> aprobados en esta spec.

## Objetivo

Dejar especificadas, sin ejecutarlas todavía, las cuatro oportunidades de guía
seleccionadas por `docs/mejora/research/sv.md`: transcripción en sueco,
escritura y corrección en sueco, IA local/offline y presentaciones en sueco.
Cada contrato debe permitir que una sesión posterior sepa qué intención
responde, qué evidencia debe reverificar, qué canales oficiales puede mostrar,
qué límites debe explicar y cómo medir el resultado, sin heredar decisiones del
producto español o italiano.

La prioridad paraguas `bästa ai verktyg svenska` se conserva como backlog de
baja prioridad del research, pero no se convierte en una quinta guía ejecutable
en esta fase.

## Archivos aprobados para F4-SV

Los nombres de archivo son parte del contrato y no se pueden sustituir por
variantes de una consulta ni por nombres traducidos desde otro producto:

| Oportunidad sueca | Archivo permitido |
|---|---|
| `ai transkribering svenska` | `src/content/guides/sv/ai-transkribering-svenska.md` |
| `ai skriva text svenska` | `src/content/guides/sv/ai-skriva-text-svenska.md` |
| `köra ai lokalt` | `src/content/guides/sv/kora-ai-lokalt.md` |
| `ai presentation svenska` | `src/content/guides/sv/ai-presentation-svenska.md` |

## Contrato de entrada

- `docs/mejora/research/sv.md` está integrado en `main` y es la fuente de
  verdad de las oportunidades, formulaciones nativas, evidencia cualitativa,
  fuentes y rechazos.
- El market brief fija Suecia, sueco de Suecia (`sv-SE`), plataformas web,
  Windows, macOS, Linux, Android e iOS, y registro neutral, directo y práctico.
- El research no conserva volumen de keywords, posición, CTR ni una serie
  temporal reproducible para Suecia. Las sugerencias de Google y la SERP son
  señales cualitativas, no volumen confirmado.
- `docs/mejora/decisiones.md` fija que `sv` es un producto independiente y
  asigna a F3-SV la propiedad de este archivo. La decisión de crear la ruta
  pública quedó cerrada con PR #78.
- `docs/enlazado-interno.md` y PR #78 definen la ruta pública bajo
  `src/pages/[lang]/guias/[slug].astro`, con canonical, hreflang y sitemap
  derivados de las guías que existen en disco.
- F1/#36 está integrada en `main` mediante el PR #52. Su esquema de eventos
  existe y puede citarse, pero no autoriza inventar eventos ni convierte por sí
  solo una spec en éxito medido.

### Puerta de entrada resuelta

La ruta pública de guías está integrada en `main` mediante PR #78 y la decisión
global correspondiente ya está registrada. F4-SV puede crear los cuatro
Markdown aprobados, sin crear rutas, cambiar el sitemap, canonical, hreflang,
navegación ni contenido de fichas. Debe consumir únicamente las filas
`Verificado` del registro canónico de canales y detenerse si una afirmación
necesaria no tiene evidencia primaria.

## Contrato de salida

- Este archivo, `docs/mejora/specs/sv.md`, con cuatro contratos ejecutables y
  un registro explícito de oportunidades aparcadas o rechazadas.
- Para cada guía: consulta primaria y variantes nativas, tipo de
  página, intención, respuesta above the fold prevista, plataformas y canales
  que deben reverificarse, secciones únicas, FAQ, advertencias, enlaces
  internos, eventos permitidos, ventana y métrica.
- F4-SV puede modificar únicamente los cuatro archivos aprobados bajo
  `src/content/guides/sv/`; no puede crear rutas ni modificar fichas, catálogo,
  sitemap, canonical, hreflang o navegación.

## Archivos que posee

- `docs/mejora/specs/sv.md` — spec madre y única salida de F3-SV; solo puede
  contener contratos de especificación y decisiones respaldadas por el
  research sueco.

## PROTEGIDOS

- `docs/plan-mejora-productos-por-idioma.md`
- `docs/mejora/research/sv.md`
- `docs/mejora/research/es.md`
- `docs/mejora/research/it.md`
- `docs/mejora/decisiones.md`
- `docs/mejora/baseline.md`
- `docs/mejora/specs/es.md`
- `docs/mejora/specs/it.md`
- `docs/mejora/templates/`
- `docs/fuenteai-referencia-visual.html`
- `docs/BRIEF-IMPLEMENTACION.md`
- `docs/design-system.md`
- `docs/ux-home-cards.md`
- `docs/ux-tool-pages.md`
- `docs/enlazado-interno.md`
- `AGENTS.md`
- `src/content/`
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

## Instrucciones

### Reglas comunes para las cuatro guías

1. Escribir el copy directamente en sueco de Suecia. Las variantes listadas
   abajo son las formulaciones del research; no son traducciones de las
   consultas españolas y no autorizan una URL por variante.
2. Mantener la diferencia entre guía, ficha, modelo, runtime, aplicación y
   servicio. No crear fichas para productos que no forman parte del catálogo
   base ni usar la existencia de una ficha sueca como prueba de demanda.
3. Antes de publicar, reverificar cada canal y cada afirmación cambiante en la
   fuente primaria. `Klang`, `ElevenLabs`, `DeepL Write`, `LanguageTool`, `LM
   Studio`, `Ollama`, `Microsoft Learn`, `Gamma` y `Canva` son candidatos del
   research, no hechos inmutables para copiar sin comprobación.
4. No afirmar volumen, ranking, precisión, soporte lingüístico completo,
   gratuidad, disponibilidad regional, privacidad, cumplimiento o rendimiento
   sin evidencia primaria y fecha. «Local» u «offline» no equivale por sí solo
   a una garantía legal de privacidad.
5. Si la futura guía enlaza fichas o categorías, usar los helpers de
   `src/utils/links.ts`; no escribir rutas internas a mano. Los enlaces a
   `/r` deben conservar `nofollow` y solo apuntar a plataformas declaradas en
   `tools-base`.
6. Los únicos eventos permitidos son los ya definidos por F1: una guía no
   puede inventar `guide_view` ni otros nombres. Si F1 no amplía el contrato,
   la guía queda sin métrica de funnel propia y eso se reporta.
7. Cada guía debe tener una salida editorial suficiente para decidir, no una
   lista de enlaces ni una página delgada para una variante de búsqueda.

### Oportunidad 1 — `ai transkribering svenska` (**LISTA PARA F4-SV**)

**Archivo aprobado:** `src/content/guides/sv/ai-transkribering-svenska.md`

**Tipo y alcance:** guía comparativa de transcripción en sueco, con `ai
transkribering svenska gratis`, `ai transkribera svenska` y `whisper svenska
transkribering` como variantes dentro de la misma página. El research permite
evaluar Klang como caso o ficha relacionada, pero no autoriza crear una ficha
nueva desde esta fase.

**Intención primaria:** encontrar una forma de transcribir audio o vídeo en
sueco y elegir entre web, app, API o ruta local según el trabajo real.

**Respuesta above the fold:** dejar claro que la guía compara canales y
limitaciones para sueco; «gratis» debe describir el límite que se pueda
verificar, no prometer transcripción ilimitada ni ausencia de cuenta.

**Plataformas y canales a reverificar:** Klang y ElevenLabs como páginas
oficiales de transcripción; cualquier producto adicional debe quedar en el
catálogo o contar con una decisión posterior. Registrar si el canal es web,
app, API o local, si requiere cuenta, qué ocurre con archivos y si el modo
offline existe realmente.

**Secciones únicas:** audio frente a vídeo; sueco de entrada y salida;
identificación de hablantes y subtítulos solo si cada función se documenta;
límites de prueba/gratis; web, móvil, API y local; tratamiento de datos y qué
operación requiere conexión.

**FAQ y advertencias:** incluir preguntas sobre `gratis`, formatos, cuenta,
offline y destino oficial. Advertir que la página localizada de un proveedor
no demuestra por sí sola precisión, soporte de todas las variantes ni
disponibilidad regional.

**Enlaces, funnel y medición:** enlazar solo a fichas suecas/categorías
existentes y destinos declarados; la ruta pública ya existe y F4-SV debe usar
los helpers de enlaces al implementar.
Con el contrato integrado de F1, medir navegación hacia una ficha o `/r` con
los eventos existentes; ventana de 90 días desde publicación, corte a 30. La
integración de F1/#36 no equivale por sí sola a éxito medido. Sin #50, no se
declara éxito SEO medido.

### Oportunidad 2 — `ai skriva text svenska` (**LISTA PARA F4-SV**)

**Archivo aprobado:** `src/content/guides/sv/ai-skriva-text-svenska.md`

**Tipo y alcance:** guía de escritura y corrección en sueco. Incluye `ai
skriva svenska`, `ai skriva om text svenska`, `rättstavning svenska online` y
`bästa ai för svenska texter` como variantes y separa generación, reescritura,
corrección gramatical y traducción. No es un ranking universal.

**Intención primaria:** escoger una herramienta para crear o mejorar texto en
sueco entendiendo qué tarea cubre cada producto.

**Respuesta above the fold:** distinguir desde el principio generador,
corrector, parafraseador y traductor; explicar que la etiqueta «bäst på
svenska» requiere una prueba reproducible y no se afirmará por marketing.

**Plataformas y canales a reverificar:** DeepL Write y LanguageTool como
referencias oficiales; Claude, Grammarly y otras fichas existentes solo como
comparables si el canal y el soporte sueco se verifican en fuente primaria.

**Secciones únicas:** escribir desde cero frente a reescribir; ortografía y
gramática; traducción frente a producción sueca; navegador, extensión y
móvil; cuenta, límites y datos; criterios de revisión humana. La estadística de
SCB del research sirve como contexto de adopción empresarial, no como volumen
SEO.

**FAQ y advertencias:** preguntar por corrector online, texto generado,
traducción, cuenta y datos. No presentar Grammarly como corrector sueco sin
verificar soporte primario; no convertir «gratis» o «GDPR» en garantía.

**Enlaces, funnel y medición:** solo enlaces internos a fichas suecas
existentes y canales oficiales revisados. Mantener la ventana de 90 días/corte de 30 y las métricas condicionadas
al contrato integrado de F1/#36 y a Search Console/#50.

### Oportunidad 3 — `köra ai lokalt` (**LISTA PARA F4-SV**)

**Archivo aprobado:** `src/content/guides/sv/kora-ai-lokalt.md`

**Tipo y alcance:** guía de decisión local/offline. Incluye `AI utan internet`,
`lokal AI Windows`, `köra språkmodell på datorn` y `ladda ner AI modell lokalt`.
No es una ficha de Foundry Local ni un tutorial de instalación.

**Intención primaria:** entender qué se puede ejecutar en el propio equipo,
qué necesita conexión una vez y qué depende de hardware, modelo y
cuantización.

**Respuesta above the fold:** explicar que programa, modelo, runtime y
servidor no son lo mismo; descargar la aplicación o el primer modelo puede
requerir internet, aunque una operación posterior pueda ser local.

**Plataformas y canales a reverificar:** LM Studio, Ollama, Jan y Open WebUI
solo según sus fichas/base y documentación oficial; Microsoft Learn puede
aportar contexto de Windows/Foundry Local. Verificar qué es aplicación,
runtime, servidor o documentación, y no prometer que todas las funciones son
offline.

**Secciones únicas:** qué significa local/offline; primer modelo y
actualizaciones; relación entre equipo, modelo y cuantización; Windows,
macOS y Linux; interfaz frente a runtime/servidor; datos que podrían salir del
equipo; selección posterior de una ficha oficial. La guía no debe dar un
umbral único de RAM o VRAM ni prometer rendimiento.

**FAQ y advertencias:** preguntar por uso sin internet, descarga inicial,
hardware, privacidad y modelos. Advertir que «local» no es una certificación
de privacidad y que una función cloud puede seguir requiriendo conexión.

**Enlaces, funnel y medición:** salida principal a fichas/categoría existentes
mediante helpers; no crear una ruta ni ampliar F1. Métrica futura solo
si el esquema de F1 se amplía de forma autorizada para guías; ventana propuesta de 90
días y corte de 30, sin declararla medible hoy.

### Oportunidad 4 — `ai presentation svenska` (**LISTA PARA F4-SV**)

**Archivo aprobado:** `src/content/guides/sv/ai-presentation-svenska.md`

**Tipo y alcance:** guía comparativa de creación de presentaciones. Incluye
`ai presentation svenska gratis`, `ai presentationer svenska` y `bästa ai för
presentationer`; no crea una página por variante ni afirma que una herramienta
sea «la mejor» sin una prueba definida.

**Intención primaria:** elegir una herramienta para crear presentaciones en
sueco y entender generación, edición, exportación, plataformas y límites.

**Respuesta above the fold:** separar generación de diapositivas, edición y
exportación; dejar claro que una página sueca del proveedor no demuestra que
todo el producto o cada función produzca sueco.

**Plataformas y canales a reverificar:** Gamma y Canva en sus páginas oficiales
localizadas; verificar por separado idioma declarado, entrada/salida, planes,
exportación a PPT/PDF/Google Slides y requisitos de cuenta. No convertir una
prueba de terceros en hecho del producto.

**Secciones únicas:** prompt y fuente de entrada; generación frente a edición;
calidad del sueco como prueba editorial reproducible; exportaciones;
colaboración y cuenta; precio/uso gratuito solo con fecha; revisión humana y
canal oficial.

**FAQ y advertencias:** preguntar por presentaciones gratis, exportación,
PowerPoint, idioma y cuenta. Advertir que Gamma no debe describirse como
compatible con sueco en toda su superficie si la lista oficial no lo confirma.

**Enlaces, funnel y medición:** enlazar solo a fichas suecas y destinos
oficiales existentes; usar eventos de F1
sin inventar nombres. Ventana futura de 90 días con corte de 30; no se declara
éxito SEO mientras #50 no aporte sus entradas; F1/#36 ya está integrada, pero
la guía no tiene eventos propios autorizados.

### Oportunidades aparcadas o rechazadas por el research

- `bästa ai verktyg svenska`: guía paraguas de segunda prioridad; no forma
  parte de las cuatro bloqueadas porque la SERP ya está saturada y las
  afirmaciones comparativas son difíciles de reproducir.
- `klang ai svenska`: señal de marca para validar o mejorar la ficha existente
  en una fase de contenido; no crear una traducción nueva aquí.
- `chatpdf svenska`: rechazada por señal insuficiente de brecha editorial y
  producto ya disponible en el catálogo.
- `AI-bildgenerator svenska` / `ai skapa bilder svenska`: rechazada por
  competencia alta y ausencia de una brecha sueca verificable.
- `AI video svenska`: rechazada por intención demasiado amplia; requiere un
  brief separado.
- `grammarly svenska` como ficha principal: aparcada; el research la conserva
  como competidor de escritura y exige verificar soporte primario.
- `ladda ner ai verktyg`: rechazada por no identificar producto ni canal
  oficial único.
- Foundry Local como ficha de consumo, Skrivar y SpeechText: no seleccionados;
  necesitan contrato y verificación independiente antes de entrar al catálogo
  o a una fase de contenido.

## Fuera de alcance

- Crear archivos fuera de los cuatro nombres aprobados bajo
  `src/content/guides/sv/`, o crear cualquier archivo en `src/content/tools/sv/`.
- Crear o modificar `src/pages/[lang]/guias/[slug].astro` o cualquier ruta.
- Cambiar sitemap, canonical, hreflang, selector de idioma, navegación,
  categorías, `src/utils/links.ts` o cualquier archivo común.
- Añadir eventos, proveedor de analítica, dashboards o datos de funnel.
- Añadir fichas, modelos, runtimes, plataformas o relaciones al catálogo base.
- Traducir specs, research o contenido de `es` o `it`.
- Presentar sugerencias, SERP, SCB o una página comercial como volumen de
  búsquedas confirmado.
- Reabrir la decisión de ruta o ampliar el alcance sin un issue/decisión de
  arquitectura propio.

## Criterios de aceptación

- [ ] `node -e "const fs=require('fs');const t=fs.readFileSync('docs/mejora/specs/sv.md','utf8');for(const h of ['ai transkribering svenska','ai skriva text svenska','köra ai lokalt','ai presentation svenska'])if(!t.includes(h)||!t.includes('**LISTA PARA F4-SV**'))process.exit(1);"` sale 0: las cuatro oportunidades seleccionadas y sus estados ejecutables están presentes.
- [ ] `node -e "const fs=require('fs');const t=fs.readFileSync('docs/mejora/specs/sv.md','utf8');for(const h of ['Objetivo','Contrato de entrada','Contrato de salida','Archivos que posee','PROTEGIDOS','Instrucciones','Fuera de alcance','Criterios de aceptación','Riesgos conocidos'])if(!t.includes('## '+h))process.exit(1);if(!t.includes('docs/mejora/research/sv.md'))process.exit(1);"` sale 0: la spec declara el contrato completo y protege explícitamente el research sueco.
- [ ] `node -e "const fs=require('fs');const t=fs.readFileSync('docs/mejora/specs/sv.md','utf8');for(const x of ['src/content/guides/sv/','src/pages/[lang]/guias/[slug].astro','src/content/tools/sv/','guide_view'])if(!t.includes(x))process.exit(1);"` sale 0: las superficies propias y protegidas están declaradas.
- [ ] `node -e "const {execSync}=require('child_process');const out=execSync('git diff --name-only origin/main...HEAD').toString().split('\n').filter(Boolean);process.exit(out.length===1&&out[0]==='docs/mejora/specs/sv.md'?0:1);"` sale 0: el diff de F3-SV contra la base actual del PR contiene únicamente el archivo propio.
- [ ] `node -e "const fs=require('fs');const t=fs.readFileSync('docs/mejora/specs/sv.md','utf8');const sections=['Objetivo','Contrato de entrada','Contrato de salida','Archivos que posee','PROTEGIDOS','Instrucciones','Fuera de alcance','Criterios de aceptación','Riesgos conocidos'];for(const h of sections)if(!new RegExp('^## '+h,'m').test(t))process.exit(1);const own=(t.match(/^- `docs\\/mejora\\/specs\\/sv\\.md`/gm)||[]).length;if(own!==1)process.exit(1);"` sale 0: la spec conserva todas las secciones obligatorias y declara exactamente un archivo propio.
- [ ] `[manual]` Puerta de ruta: 1. comprobar que `src/pages/[lang]/guias/[slug].astro` existe en `main`; 2. comprobar que PR #78 está fusionado y la decisión de ruta figura como cerrada; 3. comprobar que F4 solo crea los cuatro archivos aprobados y no modifica la ruta.
- [ ] `[manual]` Revisión de independencia: 1. comparar las cuatro consultas con `docs/mejora/research/sv.md`; 2. comprobar que no se usan consultas, selección ni copy de `es` o `it`; 3. resultado esperado: cada contrato se puede rastrear a una oportunidad sueca y sus límites de evidencia están explícitos.

## Riesgos conocidos

| Riesgo | Evidencia que lo detecta | Resolución |
|---|---|---|
| Una sesión publica una guía fuera del contrato de ruta | La ruta existe por PR #78, pero el criterio manual y el diff deben detectar archivos nuevos fuera de los cuatro nombres aprobados | F4-SV conserva la ruta común intacta y escala cualquier cambio de SEO/ruta a un issue propio |
| Se trata una sugerencia o SERP como volumen sueco | El research declara que no hay volumen confirmado ni filtros reproducibles | Mantener lenguaje de señal cualitativa; no añadir cifras |
| Se heredan prioridades de español o italiano | La matriz de `decisiones.md` separa productos y el criterio manual compara contra el research SV | Codex revisa cada contrato contra `research/sv.md` |
| Se confunde guía con ficha o se amplía el catálogo | La salida de las cuatro oportunidades es guía; Klang es una ficha existente y Foundry Local/Skrivar/SpeechText no están seleccionados | Escalar cualquier ficha nueva a una fase con contrato propio |
| Se afirma soporte sueco, gratis, privacidad u offline sin base primaria | Las páginas localizadas no garantizan toda la funcionalidad; el research enumera esta incertidumbre | Reverificar fecha, función y canal en F4; retirar la afirmación si no coincide |
| La ruta se crea para poder medir o enlazar | `docs/enlazado-interno.md` exige constructor de URL y enlace entrante antes de una sección nueva | Ruta, enlazado, canonical, hreflang y sitemap pertenecen a una fase previa |
| F1/#36 ya está integrada, pero Search Console/#50 sigue sin datos | La integración del contrato no equivale a observaciones de funnel ni SEO | Declarar la entrega de la spec, no éxito SEO medido; no inventar eventos de guía |
