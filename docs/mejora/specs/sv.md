# F3-SV — specs editoriales y UX del producto sueco

**Proyecto:** `docs/plan-mejora-productos-por-idioma.md`
**Issue:** #39
**Producto:** `sv`
**Rama base:** `main` — rama de integración de la serie, según el registro de
`docs/mejora/decisiones.md` del 2026-08-27
**Depende de:** F2-SV (#34, fusionada en `main` mediante el PR #49) y F0 (#35,
fusionada en `main` mediante el PR #53)

> Documento de especificación. **No publica contenido ni crea rutas.** Convierte
> el research sueco en contratos para una fase posterior. Las cuatro guías
> quedan bloqueadas hasta que exista una decisión global que autorice la ruta
> pública de guías y la publicación de contenido nuevo.

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

## Contrato de entrada

- `docs/mejora/research/sv.md` está integrado en `main` y es la fuente de
  verdad de las oportunidades, formulaciones nativas, evidencia cualitativa,
  fuentes y rechazos.
- El market brief fija Suecia, sueco de Suecia (`sv-SE`), plataformas web,
  Windows, macOS, Linux, Android e iOS, y registro neutral, directo y práctico.
- El research no conserva volumen de keywords, posición, CTR ni una serie
  temporal reproducible para Suecia. Las sugerencias de Google y la SERP son
  señales cualitativas, no volumen confirmado.
- `docs/mejora/decisiones.md` fija que `sv` es un producto independiente,
  asigna a F3-SV la propiedad de este archivo y mantiene abierta la decisión
  sobre una ruta pública para las guías.
- `docs/enlazado-interno.md` §7 confirma que la colección `guides` no tiene
  ruta pública bajo `src/pages/[lang]/guias/[slug].astro`.
- F1/#36 no se considera una dependencia satisfecha. Las métricas de funnel
  solo pueden referirse al esquema de F1 y no autorizan inventar eventos.

### Bloqueo global vigente

Las cuatro oportunidades son **BLOQUEADAS**. La decisión abierta de
`docs/mejora/decisiones.md` («Si las guías de intención necesitan una ruta
pública antes de desbloquearse») no está cerrada y la ruta de guías no existe.
Por tanto, esta fase no crea un Markdown de guía, no crea una ruta, no cambia
el sitemap, canonical, hreflang, navegación ni enlazado entrante, y no escribe
contenido de ninguna ficha.

## Contrato de salida

- Este archivo, `docs/mejora/specs/sv.md`, con cuatro contratos bloqueados y un
  registro explícito de oportunidades aparcadas o rechazadas.
- Para cada guía bloqueada: consulta primaria y variantes nativas, tipo de
  página, intención, respuesta above the fold prevista, plataformas y canales
  que deben reverificarse, secciones únicas, FAQ, advertencias, enlaces
  internos, eventos permitidos, ventana y métrica.
- Ningún archivo de `src/` ni de `public/` queda modificado por F3-SV.
- Si Codex desbloquea la ruta pública, deberá abrir una fase/issue previo para
  ruta, SEO, enlazado y sitemap. Solo después podrá F4-SV redactar las guías
  con un alcance aprobado.

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

### Oportunidad 1 — `ai transkribering svenska` (**BLOQUEADA**)

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
existentes y destinos declarados; no publicar mientras no haya ruta de guías.
Si F1 lo permite, medir navegación hacia una ficha o `/r` con los eventos
existentes; ventana de 90 días desde publicación, corte a 30. Sin F1/#36 no se
declara éxito medido. Sin #50, no se declara éxito SEO medido.

### Oportunidad 2 — `ai skriva text svenska` (**BLOQUEADA**)

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
existentes y canales oficiales revisados; ningún enlace se implementa en esta
fase. Mantener la ventana de 90 días/corte de 30 y las métricas condicionadas
al contrato de F1/#36 y a Search Console/#50.

### Oportunidad 3 — `köra ai lokalt` (**BLOQUEADA**)

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
mediante helpers; no crear la ruta de guía ni ampliar F1. Métrica futura solo
si el esquema de F1 se amplía de forma autorizada; ventana propuesta de 90
días y corte de 30, sin declararla medible hoy.

### Oportunidad 4 — `ai presentation svenska` (**BLOQUEADA**)

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
oficiales existentes cuando una fase posterior tenga ruta; usar eventos de F1
sin inventar nombres. Ventana futura de 90 días con corte de 30; no se declara
éxito mientras F1/#36 y #50 no aporten sus entradas.

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

- Crear cualquier archivo en `src/content/guides/` o `src/content/tools/sv/`.
- Crear `src/pages/[lang]/guias/[slug].astro` o cualquier ruta nueva.
- Cambiar sitemap, canonical, hreflang, selector de idioma, navegación,
  categorías, `src/utils/links.ts` o cualquier archivo común.
- Añadir eventos, proveedor de analítica, dashboards o datos de funnel.
- Añadir fichas, modelos, runtimes, plataformas o relaciones al catálogo base.
- Traducir specs, research o contenido de `es` o `it`.
- Presentar sugerencias, SERP, SCB o una página comercial como volumen de
  búsquedas confirmado.
- Cerrar el bloqueo por iniciativa propia. La decisión global debe quedar
  registrada en `docs/mejora/decisiones.md` y contar con una fase/issue de ruta
  antes de que F4-SV pueda redactar.

## Criterios de aceptación

- [ ] `node -e "const fs=require('fs');const t=fs.readFileSync('docs/mejora/specs/sv.md','utf8');for(const h of ['ai transkribering svenska','ai skriva text svenska','köra ai lokalt','ai presentation svenska'])if(!t.includes(h)||!t.includes('**BLOQUEADA**'))process.exit(1);"` sale 0: las cuatro oportunidades seleccionadas están presentes y bloqueadas.
- [ ] `node -e "const fs=require('fs');const t=fs.readFileSync('docs/mejora/specs/sv.md','utf8');for(const h of ['Objetivo','Contrato de entrada','Contrato de salida','Archivos que posee','PROTEGIDOS','Instrucciones','Fuera de alcance','Criterios de aceptación','Riesgos conocidos'])if(!t.includes('## '+h))process.exit(1);if(!t.includes('docs/mejora/research/sv.md'))process.exit(1);"` sale 0: la spec declara el contrato completo y protege explícitamente el research sueco.
- [ ] `node -e "const fs=require('fs');const t=fs.readFileSync('docs/mejora/specs/sv.md','utf8');for(const x of ['src/content/guides/','src/pages/[lang]/guias/[slug].astro','src/content/tools/sv/','guide_view'])if(!t.includes(x))process.exit(1);"` sale 0: las superficies bloqueadas o fuera de alcance están declaradas, sin implementarlas.
- [ ] `node -e "const {execSync}=require('child_process');const out=execSync('git diff --name-only 82cde661b4140e8a6b8ecfe8046d400e992eea1d...HEAD').toString().split('\n').filter(Boolean);process.exit(out.length===1&&out[0]==='docs/mejora/specs/sv.md'?0:1);"` sale 0: el diff de F3-SV contiene únicamente el archivo propio.
- [ ] `node -e "const fs=require('fs');const t=fs.readFileSync('docs/mejora/specs/sv.md','utf8');const sections=['Objetivo','Contrato de entrada','Contrato de salida','Archivos que posee','PROTEGIDOS','Instrucciones','Fuera de alcance','Criterios de aceptación','Riesgos conocidos'];for(const h of sections)if(!new RegExp('^## '+h,'m').test(t))process.exit(1);const own=(t.match(/^- `docs\\/mejora\\/specs\\/sv\\.md`/gm)||[]).length;if(own!==1)process.exit(1);"` sale 0: la spec conserva todas las secciones obligatorias y declara exactamente un archivo propio.
- [ ] `[manual]` Estado del bloqueo: 1. comprobar que no existe `src/pages/[lang]/guias/[slug].astro`; 2. comprobar que la decisión sobre la ruta pública sigue abierta en `docs/mejora/decisiones.md`; 3. resultado esperado: las cuatro guías siguen sin archivo de contenido y no se ha creado ninguna ruta.
- [ ] `[manual]` Revisión de independencia: 1. comparar las cuatro consultas con `docs/mejora/research/sv.md`; 2. comprobar que no se usan consultas, selección ni copy de `es` o `it`; 3. resultado esperado: cada contrato se puede rastrear a una oportunidad sueca y sus límites de evidencia están explícitos.

## Riesgos conocidos

| Riesgo | Evidencia que lo detecta | Resolución |
|---|---|---|
| Una sesión publica una guía sin ruta pública | No existe `src/pages/[lang]/guias/[slug].astro`; el criterio manual y el diff detectan archivos nuevos fuera de la spec | Codex debe cerrar la decisión y abrir una fase de ruta antes de F4-SV |
| Se trata una sugerencia o SERP como volumen sueco | El research declara que no hay volumen confirmado ni filtros reproducibles | Mantener lenguaje de señal cualitativa; no añadir cifras |
| Se heredan prioridades de español o italiano | La matriz de `decisiones.md` separa productos y el criterio manual compara contra el research SV | Codex revisa cada contrato contra `research/sv.md` |
| Se confunde guía con ficha o se amplía el catálogo | La salida de las cuatro oportunidades es guía; Klang es una ficha existente y Foundry Local/Skrivar/SpeechText no están seleccionados | Escalar cualquier ficha nueva a una fase con contrato propio |
| Se afirma soporte sueco, gratis, privacidad u offline sin base primaria | Las páginas localizadas no garantizan toda la funcionalidad; el research enumera esta incertidumbre | Reverificar fecha, función y canal en F4; retirar la afirmación si no coincide |
| La ruta se crea para poder medir o enlazar | `docs/enlazado-interno.md` exige constructor de URL y enlace entrante antes de una sección nueva | Ruta, enlazado, canonical, hreflang y sitemap pertenecen a una fase previa |
| F1/#36 o Search Console/#50 siguen sin datos | Dependencias y bloqueos no satisfechos | Declarar la entrega de la spec, no éxito de funnel ni SEO |
