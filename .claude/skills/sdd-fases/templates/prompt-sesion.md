# Prompt de arranque de sesión ejecutora

Una sola línea, sin contexto heredado. Sustituí `<...>` y entregáselo al usuario listo para copiar.

```
Trabajás en Gunz-cop/DescargasIA. Leé AGENTS.md, docs/<proyecto>.md y docs/fases/F<n>.md.
Implementá la fase F<n> completa contra la rama <rama de integración>. No modifiques ningún
archivo de la lista PROTEGIDOS de la spec. Cuando todos los criterios de aceptación pasen,
abrí un PR con "Closes #<issue>" en el cuerpo.
```

## Por qué el prompt es tan corto

Porque tiene que serlo. Si hace falta explicarle algo más a la sesión ejecutora, ese algo pertenece a la spec, no al prompt: en la spec queda escrito para siempre y para todas las sesiones; en el prompt se pierde en cuanto la sesión termina.

Cuando una sesión ejecutora pregunta algo que la spec no responde, la corrección va **a la spec**.
