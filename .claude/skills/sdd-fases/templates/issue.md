**Spec:** `docs/fases/F<n>.md` ← **la spec manda; este issue es solo la orden de trabajo**

**Depende de:** #<n> (o "ninguna — lista para tomar")
**Rama base:** <rama de integración>

## Qué hay que hacer

<Dos o tres frases. El detalle está en la spec; acá solo lo suficiente para decidir si tomar el issue.>

## Cómo arrancar

```
Trabajás en Gunz-cop/DescargasIA. Leé AGENTS.md, docs/<proyecto>.md y docs/fases/F<n>.md.
Implementá la fase F<n> completa contra la rama <rama base>. No modifiques ningún archivo
de la lista PROTEGIDOS de la spec. Cuando todos los criterios de aceptación pasen, abrí un
PR con "Closes #<n>" en el cuerpo.
```

## Criterios de aceptación

<Copiar la checklist de la spec. Es lo único que se duplica, porque GitHub necesita las casillas.>

- [ ] ...

## Definición de terminado

- [ ] Todos los criterios de aceptación pasan
- [ ] `npm run build` verde
- [ ] El diff no toca ningún archivo de PROTEGIDOS
- [ ] PR abierto contra la rama de integración con `Closes #<n>`

---
Si no pudiste terminar leyendo solo la spec, **eso es un bug de la spec**: comentá acá qué faltaba en vez de improvisar.
