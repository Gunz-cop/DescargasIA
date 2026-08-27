**Spec:** `docs/mejora/fases/F<n>.md` ← la spec manda; este issue es la orden de trabajo.

**Producto:** `es`, `sv`, `it` o `común`
**Depende de:** #<n> o `ninguna — lista para tomar`
**Rama de integración:** `<rama declarada por Codex>`

## Qué hay que hacer

Implementa únicamente la fase descrita en la spec enlazada. La spec debe
definir contratos, propiedad, protegidos, validaciones y fuera de alcance; no
uses este issue para introducir decisiones que no estén versionadas.

## Cómo arrancar

```text
Trabajas en Gunz-cop/DescargasIA. Lee AGENTS.md, el plan maestro y la spec enlazada.
Trabaja contra la rama de integración declarada. No modifiques ningún archivo de
PROTEGIDOS. Si la spec no alcanza para terminar, detente y documenta el bloqueo
en este issue; no inventes datos, URLs, credenciales, proveedores ni workarounds.
```

## Criterios de aceptación

Duplica aquí únicamente la checklist ejecutable de la spec para que GitHub la
muestre. No sustituyas comandos por adjetivos ni por recuentos de cadenas.

- [ ] `<criterio ejecutable o [manual] reproducible>`

## Definición de terminado

- [ ] Todos los criterios de la spec pasan.
- [ ] El build y las pruebas exigidas por la spec pasan.
- [ ] El diff no toca PROTEGIDOS ni archivos fuera de la propiedad declarada.
- [ ] El PR apunta a la rama de integración y enlaza este issue.
- [ ] Los problemas que requieran una decisión quedan documentados, no
      resueltos mediante una suposición.
