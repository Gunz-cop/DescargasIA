Vas a verificar una corrección, no a auditar una ficha. La diferencia es el punto
entero de esta pasada, así que leela con atención antes de empezar.

## Objeto

- Slug: **{{SLUG}}**
- Idioma: **{{LANG}}**
- Iteración: **{{ITER}}** de **{{MAX_LOOPS}}**

## Qué NO es esta pasada

**No es una auditoría.** No abras la ficha buscando problemas nuevos, no releas
secciones que nadie tocó, no reabras fuentes que ya estaban citadas y no
cambiaron. Una auditoría escéptica completa ya corrió sobre esta ficha y dejó su
lista de hallazgos; tu trabajo es comprobar si esa lista quedó saldada.

Esto no es pereza ni un recorte de calidad: es que un auditor fresco, corrido de
nuevo, siempre encuentra algo más —está diseñado para eso— y el lazo nunca
cerraría. Los hallazgos nuevos que vos podrías encontrar no se pierden: la ficha
va igual a revisión humana antes de publicarse. Lo que necesitamos de vos es una
respuesta acotada y confiable a una pregunta chica.

## Qué SÍ es

Tenés cuatro entradas:

1. **Los hallazgos originales**: `{{HALLAZGOS_FILE}}`
2. **Lo que la corrección dice haber hecho**: `{{CORRECCION_FILE}}`
3. **El diff real de la corrección**: `{{DIFF_FILE}}`
4. **El alcance de lo que cambió**, medido por script: `{{ALCANCE_FILE}}`

Y tenés que responder tres preguntas, en este orden:

### 1. ¿Cada hallazgo está realmente corregido?

Uno por uno, para cada P0 y P1 de la lista original. **Lo que la corrección
declara no es evidencia** — mirá el diff y el estado actual del archivo. Un
hallazgo declarado como corregido cuyo texto sigue igual en el diff es un
`corregido: false`, sin importar lo convincente que suene la declaración.

Si el hallazgo era que una afirmación no sobrevivía abrir su fuente, comprobá que
el texto nuevo sí se corresponda con lo que la fuente dice — abriendo la fuente si
el diff cambió la afirmación o la fuente. Los P2 verificalos también, pero no
bloquean el cierre.

### 2. ¿Las fuentes nuevas respaldan lo que se les atribuye?

`{{ALCANCE_FILE}}` lista las URLs que la corrección agregó. Agregar una fuente
suele ser la corrección correcta —la ficha tiene que hacer trazable cada documento
que menciona—, así que no es un problema en sí. Pero nadie las verificó todavía:
abrí cada una y confirmá que respalde la afirmación que ahora la cita.

### 3. ¿Las entradas nuevas responden a algún hallazgo?

`{{ALCANCE_FILE}}` también lista los campos donde la corrección **agregó
contenido**: secciones editoriales, FAQ, insights, plataformas, alternativas.

Cada una de esas entradas es una afirmación que ninguna auditoría miró. Para cada
una, decidí: **¿responde a un hallazgo de la lista, o es contenido que nadie
pidió?** Agregar una limitación porque la auditoría dijo que faltaba está en
alcance. Agregar una sección editorial entera porque sí, no lo está — y una
plataforma nueva es la afirmación más fuerte que puede hacer esta ficha, porque
promete un canal de descarga oficial.

Si `entradas_nuevas` viene vacío, esta pregunta se responde sola.

### 4. ¿La corrección rompió algo?

Mirá el diff en busca de daño colateral: texto borrado que no correspondía a
ningún hallazgo, una fuente quitada que sostenía otra afirmación, un campo
vaciado. No busques defectos preexistentes — sólo lo que **este diff** cambió.

## Restricciones

- **No edites nada.** Esta pasada no corrige; sólo verifica.
- No toques scripts, workflows, schema ni skills.
- Resolvé todo vos, en esta misma pasada: no delegues en subagentes ni abras
  trabajo en paralelo.

## Salida

Tu **último mensaje** tiene que terminar con un único bloque de código
\`\`\`json (nada de texto después) con exactamente esta forma:

\`\`\`json
{
  "verificaciones": [
    {"ubicacion": "...", "prioridad": "P0|P1|P2", "corregido": true, "evidencia": "..."}
  ],
  "fuentes_nuevas": [
    {"url": "...", "afirmacion": "...", "respalda": true}
  ],
  "entradas_nuevas": [
    {"campo": "...", "responde_a_hallazgo": true, "detalle": "..."}
  ],
  "regresiones": ["..."],
  "cierra": true,
  "resumen": "..."
}
\`\`\`

Los cuatro arrays van igual como `[]` si no corresponde ninguna entrada — nunca
los omitas. `cierra` es la compuerta del arnés: ponelo en `true` sólo si todos
los P0/P1 quedaron corregidos, cada fuente nueva respalda su afirmación, cada
entrada nueva responde a un hallazgo, y no encontraste regresiones. Ante la
duda, `false` con el motivo en `resumen` — una vuelta más cuesta mucho menos
que una ficha publicada con una afirmación falsa.
