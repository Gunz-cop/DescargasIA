# Prompt de arranque de sesión ejecutora

Sustituí `<...>` y entregáselo al usuario listo para copiar.

```
Trabajás en el repo <owner/repo>.

Usá /goal para planificar y ejecutar esto:

Leé, en este orden: AGENTS.md, docs/<proyecto>.md y docs/fases/F<n>.md.

Implementá la fase F<n> completa contra la rama <rama de integración>
(hacé checkout de esa rama; ya existe).

No modifiques ningún archivo de la lista PROTEGIDOS de la spec.

Cuando todos los criterios de aceptación pasen, abrí un PR con "Closes #<issue>" en el
cuerpo y suscribite a la actividad del PR con subscribe_pr_activity: quedás a cargo de
llevarlo a verde y de atender los comentarios hasta que se fusione o se cierre.

Si algo de la spec no te alcanza para trabajar, no improvises: comentá en el issue #<issue>
qué faltaba. Eso es un bug de la spec, no tuyo.
```

## Por qué `/goal`

Hace que la sesión explore el repo y presente un plan **antes** de escribir código. Ese es el punto de máximo apalancamiento del proceso: revisar un plan de veinte líneas cuesta un minuto, revisar un PR de cuatrocientos archivos cuesta una hora, y las decisiones de fondo ya están tomadas para entonces.

**El costo:** `/goal` termina pidiendo aprobación y **se bloquea esperándola**. Sirve si vas a estar presente para aprobar el plan. Si querés lanzar la sesión y desconectarte, quitá esa línea del prompt.

## Por qué la sesión se suscribe a su propio PR

La sesión que implementó la fase es la que mejor puede arreglar lo que falle: tiene el contexto fresco y sabe por qué tomó cada decisión. Sin suscripción, un fallo de CI espera a que alguien lo mire.

Esto matiza el "la sesión ejecutora es desechable": sigue siéndolo para el trabajo nuevo —no se le encarga otra fase— pero se queda a cargo del PR que abrió.

**Reparto que evita que dos sesiones se pisen sobre el mismo PR:**

| | Ejecutora (suscrita a su PR) | Revisora |
|---|---|---|
| Empuja código al PR | **sí, es su trabajo** | nunca |
| Comenta hallazgos | responde a los que recibe | **sí, es su trabajo** |
| Corrige specs de fase | no: las reporta en el issue | **sí** |
| Fusiona | nunca | nunca: decide la persona |

## Por qué el prompt es corto

Si hace falta explicarle algo más a la sesión ejecutora, ese algo pertenece a la spec, no al prompt: en la spec queda escrito para siempre y para todas las sesiones; en el prompt se pierde en cuanto la sesión termina.

Cuando una sesión ejecutora pregunta algo que la spec no responde, la corrección va **a la spec**.
