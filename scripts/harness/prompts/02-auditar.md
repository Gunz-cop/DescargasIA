Vas a auditar una ficha del catálogo de FuenteAI/DescargasIA dentro de un runner
de CI, y tu veredicto decide si el arnés sigue iterando o cierra.

## Objeto de la auditoría

- Slug: **{{SLUG}}**
- Idioma: **{{LANG}}**
- Iteración: **{{ITER}}** de **{{MAX_LOOPS}}**

## Cómo trabajar

Usá la skill `/descargasia-ficha-auditoria` con su criterio completo: sos un
revisor externo de calidad de Google, escéptico por defecto, buscando motivos de
rechazo y no de aprobación.

El paso 2 (script de métricas) ya corrió y su salida está en
`{{METRICAS_FILE}}` — leela, no la vuelvas a correr salvo que necesites una
bandera distinta. El paso que sí tenés que hacer entero es el **paso 3**:
verificar cada fuente citada contra la afirmación exacta, abriendo la URL con
WebFetch. Que el link abra no es verificación.

El paso 4 (leer la página renderizada) no se puede hacer completo acá: no hay
navegador. En su lugar, leé `src/pages/[lang]/[slug].astro` y comprobá contra el
JSON las mismas contradicciones que buscarías en el DOM: qué promete el `<title>`,
el panel de fuente oficial y el label del CTA frente a lo que dice el texto de la
ficha; el orden real de render frente a las referencias direccionales ("más
arriba" / "más abajo"); y si el producto está discontinuado o es de tipo
`documentation`, si la plantilla igual anuncia una descarga.

{{HISTORIAL}}

## Reportá todo: esta es la única auditoría completa

Después de vos no viene otro auditor escéptico. Viene una verificación acotada
que sólo comprueba si **tus** hallazgos quedaron corregidos. Lo que no anotes acá
no lo anota nadie: llega al pull request sin marcar.

Así que **reportá cada hallazgo, incluidos los que dudás y los que te parecen
menores**. No filtres por importancia ni por confianza en este paso — para eso
está la prioridad. Un P2 que después se descarta cuesta una línea; un P1 que no
reportaste por parecerte discutible es una afirmación falsa publicada.

Concretamente: si abriste una fuente y el respaldo te resultó parcial, es un
hallazgo aunque no estés seguro. Si una cifra no tiene camino a ninguna fuente,
es un hallazgo aunque suene plausible. Si el registro se te mezcla en un solo
párrafo, es un P2, no un "detalle". Poné la prioridad honesta y dejá que el
arnés decida qué bloquea.

## Restricciones

- **No corrijas nada.** Esta es una pasada de evaluación: no edites ni un archivo.
  Otra pasada del arnés se encarga de las correcciones.
- No modifiques el script de métricas, el schema, los umbrales ni el workflow.
- Resolvé todo vos, en esta misma pasada: no delegues en subagentes ni abras
  trabajo en paralelo.

## Salida

1. Escribí el informe completo, con el formato de `references/formato-informe.md`,
   en `{{INFORME_FILE}}`.
2. Llená `fuentes_verificadas` con **una entrada por cada afirmación que abriste
   a comprobar**: la URL, la afirmación exacta que la ficha le atribuye, y si la
   fuente la respalda o no. Es el registro del paso 3, y es lo único que
   distingue una pasada que abrió cada fuente de una que las dio por buenas: si
   el array sale vacío, el resumen del arnés lo publica como omisión. Las
   entradas con `confirmada: false` tienen que tener además su bloqueante
   correspondiente.
3. `veredicto` es la compuerta del arnés:
   - `APTO` — no quedan defectos mecánicos y ninguna fuente falló la verificación.
   - `APTO_CON_AVISOS` — sirve para publicar, quedan P2 cosméticos.
   - `NO_APTO` — hay al menos un P0 o P1.
   En `bloqueantes` va un ítem por hallazgo, con la ubicación exacta
   (`archivo:campo`) y una instrucción de corrección concreta y accionable: ese
   texto es literalmente lo único que va a leer la pasada de corrección.
4. Acordate del `PENDIENTE MANUAL`: si algo no lo pudiste verificar en este
   entorno, decilo en `resumen` en vez de darlo por bueno.
5. Tu **último mensaje** tiene que terminar con un único bloque de código
   \`\`\`json (nada de texto después) con exactamente esta forma:

   \`\`\`json
   {
     "veredicto": "APTO|APTO_CON_AVISOS|NO_APTO",
     "resumen": "...",
     "fuentes_verificadas": [
       {"url": "...", "afirmacion": "...", "confirmada": true, "observacion": "..."}
     ],
     "bloqueantes": [
       {"prioridad": "P0|P1|P2", "ubicacion": "...", "problema": "...", "como_corregir": "..."}
     ]
   }
   \`\`\`

   `observacion` es opcional; si no aplica, omitila (no pongas `null`).
   `fuentes_verificadas` y `bloqueantes` van igual como array vacío `[]` si no
   corresponde ninguna entrada — nunca los omitas.
