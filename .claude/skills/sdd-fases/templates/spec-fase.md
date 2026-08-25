# F<n> — <nombre de la fase>

> Plantilla. Todas las secciones son obligatorias: `scripts/audit-specs.mjs` las verifica.
> Escribila para que alguien que **solo lee este archivo** pueda ejecutarla.

**Proyecto:** <spec de producto: `docs/<proyecto>.md`>
**Issue:** #<n>
**Rama base:** <rama de integración>
**Depende de:** F<x>, F<y> — o "ninguna"

## Objetivo

Una o dos frases. Qué queda hecho cuando esta fase cierra, y por qué importa para el producto.

## Contrato de entrada

Qué asume que ya existe (archivos, tipos, datos) y que por lo tanto **no** debe crear. Si algo de esto falta, la fase está bloqueada: decilo en el issue en vez de improvisarlo.

## Contrato de salida

Qué deja listo para las fases siguientes, con los nombres exactos de lo que exporta. Es el contrato que las otras specs citan.

## Archivos que posee

Lista explícita. Ningún archivo fuera de esta lista debe aparecer en el diff del PR.

- `ruta/al/archivo.ts` (nuevo) — para qué
- `ruta/existente.astro` (editar) — qué cambia exactamente

## PROTEGIDOS

Archivos que esta fase **no puede modificar** bajo ninguna circunstancia: sus propios tests de aceptación, las auditorías y las specs. Se verifica en la revisión.

- `tests/<...>`
- `scripts/audit-<...>.mjs`
- `docs/fases/`

## Instrucciones

El "cómo", con el detalle necesario para no tener que adivinar: fórmulas, esquemas de datos, patrones del repo a copiar (con ruta), decisiones ya cerradas y su motivo. Citá archivos existentes como referencia en vez de describir código desde cero.

## Fuera de alcance

Explícito. Qué **no** se hace en esta fase aunque parezca natural hacerlo, y en qué fase se hace.

## Criterios de aceptación

Cada criterio es un comando con su salida esperada. La fase no cierra hasta que todos pasen.

- [ ] `npm run build` sale 0
- [ ] `npm test` sale 0
- [ ] `git diff --name-only origin/<base>...HEAD` no contiene ningún archivo de PROTEGIDOS
- [ ] `[manual]` <pasos numerados y reproducibles, con el resultado esperado de cada uno>

## Riesgos conocidos

Lo que probablemente salga mal y cómo manejarlo. Si no se te ocurre nada, no entendiste la fase todavía.
