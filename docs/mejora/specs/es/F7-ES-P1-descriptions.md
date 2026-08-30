# SDD SEO-ES P1 — recorte seguro de `shortDescription`

**Issue:** #99  
**Producto:** `es` únicamente  
**Mercado:** español; el alcance geográfico sigue sin ratificarse y no se atribuye a un país concreto  
**Rama base:** `main`  
**Commit base comprobado:** `cf98ca6`  
**Fecha de rebaseline:** 2026-08-29  
**Ejecuta después:** una sesión de implementación separada, mediante un issue de ejecución que referencie esta spec

> Esta spec no modifica fichas. Convierte P1 del plan SEO en un contrato ejecutable y
> corrige el alcance histórico contra el árbol actual.

## Referencias y evidencia

- Plan: `docs/mejora/plan-seo-es-2026-08-29.md`, §7.1, §8 P1 y §9.2 E1.
- Evidencia: `docs/mejora/evidencia/gsc-2026-08-28/`, especialmente
  `rendimiento-paginas.csv`.
- Fuente: Google Search Console, propiedad completa `fuenteai.com`, Web,
  2026-06-19 → 2026-08-26, sin filtros. Las impresiones son evidencia de páginas;
  no se atribuyen consultas a fichas.
- El plan histórico identificó 15 fichas con al menos 50 impresiones y una
  `shortDescription` superior a 160 caracteres en el árbol de `ae8eed5`.

## Rebaseline obligatorio

La lista histórica no puede ejecutarse literalmente sin volver a comprobarla: entre
`ae8eed5` y `cf98ca6` varias fichas cambiaron. En `origin/main@cf98ca6` solo tres de
las 15 siguen por encima de 160 caracteres:

| Ficha | Impresiones del corte | Clics | Posición media | Caracteres actuales |
|---|---:|---:|---:|---:|
| `ollama` | 317 | 1 | 18,15 | 168 |
| `stable-diffusion` | 75 | 0 | 11,60 | 179 |
| `mistral-vibe` | 73 | 0 | 8,67 | 176 |

Las otras 12 pertenecen a la cohorte histórica, pero ya cumplen el umbral actual y
no se modifican:

`cursor`, `perplexity`, `character-ai`, `qwen-chat`, `google-flow`, `qwen-code`,
`deepseek`, `notebooklm`, `devin-desktop`, `adobe-podcast`, `napkin-ai` y
`google-antigravity`.

La implementación debe repetir esta comprobación sobre `origin/main` justo antes de
editar. Si cambia cualquiera de las tres filas activas o reaparece una ficha de la
cohorte histórica por encima de 160, se actualiza esta spec antes de escribir.

## Objetivo

Reducir cada `shortDescription` activa a **160 caracteres o menos**, conservando la
propuesta de valor y los hechos que ya constan en la ficha. El cambio reorganiza o
recorta copy existente; no es una investigación de keywords ni una promesa de mejora
de CTR.

## Contrato de entrada

Antes de editar, la sesión debe comprobar:

1. que existen los tres archivos de contenido español;
2. que `shortDescription` de cada uno supera 160 y no supera el límite de 180 del
   esquema;
3. que el texto actual sigue respaldado por los campos y fuentes de la propia ficha;
4. que no hay cambios ajenos en esos archivos;
5. que las cifras del cuadro anterior siguen siendo las del CSV versionado, sin
   convertirlas en tendencia ni demanda de consulta.

Si una descripción necesita añadir un dato para que el recorte sea comprensible, no se
añade: se crea un blocker editorial con la ficha y la evidencia que falta.

## Contrato de salida

- La spec queda versionada sin modificar contenido del sitio.
- La implementación posterior debe entregar solo los tres `shortDescription`
  activos, salvo que un blocker documente una excepción.
- El PR de implementación debe incluir la comprobación del grupo de control y la
  declaración explícita de que #47/#50 siguen abiertos.

## Archivos que posee la implementación

- `src/content/tools/es/ollama.json`
- `src/content/tools/es/stable-diffusion.json`
- `src/content/tools/es/mistral-vibe.json`

La sesión de implementación no puede tocar los otros 12 archivos de la cohorte
histórica, aunque aparezcan en el plan.

## PROTEGIDOS

- `src/content/tools/es/adobe-firefly.json`
- `src/content/tools/es/adobe-podcast.json`
- `src/content/tools/es/aiva.json`
- `src/content/tools/es/anythingllm.json`
- `src/content/tools/es/bolt-new.json`
- `src/content/tools/es/canva.json`
- `src/content/tools/es/character-ai.json`
- `src/content/tools/es/chatgpt.json`
- `src/content/tools/es/chatpdf.json`
- `src/content/tools/es/claude-code.json`
- `src/content/tools/es/claude.json`
- `src/content/tools/es/comet.json`
- `src/content/tools/es/comfyui.json`
- `src/content/tools/es/consensus.json`
- `src/content/tools/es/cursor.json`
- `src/content/tools/es/deepl.json`
- `src/content/tools/es/deepseek.json`
- `src/content/tools/es/descript.json`
- `src/content/tools/es/devin-desktop.json`
- `src/content/tools/es/elevenlabs.json`
- `src/content/tools/es/elevenmusic.json`
- `src/content/tools/es/fathom.json`
- `src/content/tools/es/fireflies.json`
- `src/content/tools/es/flux.json`
- `src/content/tools/es/gamma-app.json`
- `src/content/tools/es/gemini.json`
- `src/content/tools/es/gemma.json`
- `src/content/tools/es/genspark.json`
- `src/content/tools/es/github-copilot.json`
- `src/content/tools/es/google-antigravity.json`
- `src/content/tools/es/google-flow.json`
- `src/content/tools/es/gpt4all.json`
- `src/content/tools/es/grammarly.json`
- `src/content/tools/es/grok.json`
- `src/content/tools/es/hailuo-ai.json`
- `src/content/tools/es/heygen.json`
- `src/content/tools/es/hugging-face.json`
- `src/content/tools/es/ideogram.json`
- `src/content/tools/es/invokeai.json`
- `src/content/tools/es/jan.json`
- `src/content/tools/es/kimi.json`
- `src/content/tools/es/klang.json`
- `src/content/tools/es/kling-ai.json`
- `src/content/tools/es/krea-ai.json`
- `src/content/tools/es/languagetool.json`
- `src/content/tools/es/leonardo-ai.json`
- `src/content/tools/es/lm-studio.json`
- `src/content/tools/es/lovable.json`
- `src/content/tools/es/ltx-studio.json`
- `src/content/tools/es/luma-dream-machine.json`
- `src/content/tools/es/macwhisper.json`
- `src/content/tools/es/manus.json`
- `src/content/tools/es/meta-ai.json`
- `src/content/tools/es/microsoft-copilot.json`
- `src/content/tools/es/midjourney.json`
- `src/content/tools/es/msty.json`
- `src/content/tools/es/n8n.json`
- `src/content/tools/es/napkin-ai.json`
- `src/content/tools/es/notebooklm.json`
- `src/content/tools/es/notion.json`
- `src/content/tools/es/open-webui.json`
- `src/content/tools/es/opencode.json`
- `src/content/tools/es/otter-ai.json`
- `src/content/tools/es/pdfgear.json`
- `src/content/tools/es/perplexity.json`
- `src/content/tools/es/phind.json`
- `src/content/tools/es/pika.json`
- `src/content/tools/es/quillbot.json`
- `src/content/tools/es/quizlet.json`
- `src/content/tools/es/qwen-chat.json`
- `src/content/tools/es/qwen-code.json`
- `src/content/tools/es/recraft.json`
- `src/content/tools/es/replit.json`
- `src/content/tools/es/runway.json`
- `src/content/tools/es/scispace.json`
- `src/content/tools/es/seedance.json`
- `src/content/tools/es/sora.json`
- `src/content/tools/es/suno.json`
- `src/content/tools/es/synthesia.json`
- `src/content/tools/es/udio.json`
- `src/content/tools/es/v0.json`
- `src/content/tools/es/wan.json`
- `src/content/tools/es/z-ai.json`
- `src/content/tools/sv/` y `src/content/tools/it/`.
- Todo `src/content/tools-base/`.
- `src/pages/`, `src/components/`, `src/layouts/`, `src/utils/`, `src/i18n/`.
- `src/content/guides/`, categorías, rutas, canonical, hreflang y enlazado.
- `docs/mejora/plan-seo-es-2026-08-29.md`, `research/`, `decisiones.md` y el
  registro de evidencia GSC.
- `package.json`, `package-lock.json`, `public/`, `worker/`, `scripts/` y workflows.

Si la validación necesita código nuevo, la sesión debe detenerse y proponer una spec
separada; no puede ampliar este diff por conveniencia.

## Instrucciones

- Escribir y revisar en español, sin copiar `sv` ni `it`.
- Mantener la frase de valor y la distinción de producto que ya existe.
- No añadir keywords por la mera presencia de una consulta en la tabla de propiedad.
- No añadir datos de precio, privacidad, seguridad, disponibilidad, plataforma,
  compatibilidad o tendencia sin fuente primaria vigente en la ficha.
- No convertir `shortDescription` en una lista de keywords.
- No cambiar `longDescription`, `editorialSummary`, títulos, FAQ, secciones,
  alternativas, rutas, eventos ni metadatos SEO en esta fase.
- El límite de 160 es una convención de experimento, no una garantía de cómo Google
  mostrará el fragmento.

## Grupo de control y experimento

El grupo de tratamiento activo son las tres fichas anteriores. Para que la lectura no
se elija después de ver el resultado, el grupo de control queda declarado aquí:

| Control | Impresiones | Posición media | Caracteres actuales | Motivo de inclusión |
|---|---:|---:|---:|---|
| `notebooklm` | 71 | 14,55 | 137 | Volumen próximo a dos tratamientos y descripción ya ≤160 |
| `devin-desktop` | 66 | 8,27 | 135 | Volumen y posición próximos a `stable-diffusion`/`mistral-vibe` |
| `open-webui` | 64 | 13,23 | 116 | Volumen próximo y descripción ya ≤160 |

No se modifica el grupo de control durante el experimento. La sesión de ejecución
debe registrar que el control se declaró antes de publicar; no puede sustituirlo por
otro conjunto después.

La comparación futura será solo descriptiva/diferencia de diferencias sobre páginas,
con dos cortes de igual duración y mismos filtros. #50 sigue abierto: no se asignan
consultas a estas URLs y no se declara éxito mientras no exista el corte posterior.

## Criterios de aceptación

- [ ] [manual] Los tres `shortDescription` quedan entre 1 y 160 caracteres, en español natural,
   sin pérdida de la propuesta de valor ni incorporación de claims no respaldados.
- [ ] El diff contra `origin/main` contiene únicamente los tres archivos propios; comprobar con `git diff --name-only origin/main...HEAD`.
- [ ] [manual] Ninguno de los 12 archivos ya conformes ni el grupo de control cambia; comprobar con `git diff --name-only origin/main...HEAD`.
- [ ] [manual] No cambian campos distintos de `shortDescription` en los tres JSON; comparar el JSON parseado antes y después.
- [ ] Los JSON siguen siendo válidos y pasan el esquema de `src/content.config.ts`; ejecutar `npm run build`.
- [ ] [manual] Una prueba o comprobación de fixture demuestra que un texto de más de 160
   caracteres falla el criterio; la fixture vive fuera del repositorio y se elimina
   después. Si para lograrlo hay que crear un validador permanente, debe declararse
   como trabajo separado.
- [ ] `npm run build` sale 0 y sus auditorías encadenadas pasan.
- [ ] [manual] La revisión manual comprueba en las tres páginas que el fragmento visible conserva
   nombre, valor y canal sin prometer una descarga o capacidad no declarada.
- [ ] [manual] El PR documenta la cohorte histórica, el rebaseline, el grupo de control y que
   P1 no demuestra causalidad ni éxito SEO.

## Fuera de alcance

- Cambiar títulos o el sufijo `alternativas verificadas`.
- Reescribir las otras 12 fichas que ya cumplen ≤160.
- Añadir o quitar secciones, FAQ, enlaces, alternativas o eventos.
- Crear una guía o cambiar rutas.
- Usar Bing, una herramienta de keywords o la tabla de consultas como atribución por
  página.
- Cerrar #47 o #50.

## Riesgos conocidos

| Riesgo | Evidencia | Respuesta |
|---|---|---|
| El árbol vuelve a cambiar antes de implementar | Comparación de los tres JSON contra `origin/main` | Rebaseline de la spec antes de editar |
| El recorte elimina una distinción factual | Revisión frase por frase y diff editorial | Blocker por ficha; no completar con una conjetura |
| El umbral de 160 se interpreta como garantía de snippet | Limitación declarada en el plan §7.1 | Mantenerlo como convención experimental |
| El tráfico cambia durante la ventana | #47/#50 y el crecimiento de la propiedad | Grupo de control y no declarar causalidad |

## Regla de bloqueo

Si la sesión no puede conservar el sentido de una ficha dentro de 160 caracteres, o
encuentra una afirmación que requiere una fuente que no está disponible, no rellena el
hueco con una conjetura. Debe publicar un blocker con la ficha, el texto afectado, la
evidencia revisada y una pregunta concreta; la implementación queda detenida solo para
esa ficha.
