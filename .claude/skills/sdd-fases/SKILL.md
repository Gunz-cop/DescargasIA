---
name: sdd-fases
description: Convierte un requerimiento grande de FuenteAI/DescargasIA en un plan ejecutable por varias sesiones de IA independientes — spec de producto en docs/, una spec por fase en docs/fases/, un issue de GitHub por fase y criterios de aceptación ejecutables. Usá esta skill SIEMPRE que el usuario pida "un plan de implementación", quiera construir una funcionalidad nueva del sitio (una app, una calculadora, una herramienta interactiva, una sección nueva), pida descomponer un proyecto en fases, pida preparar trabajo para que lo ejecuten otras sesiones o agentes, o exprese preocupación por perder contexto en un chat largo — incluso si no menciona la palabra "skill", "SDD" ni "spec". NO es para crear fichas del catálogo: para eso está descargasia-tool-ficha.
---

# Planificación por fases (spec-driven) para FuenteAI

Esta skill empaqueta el método con el que se planificó la app "¿qué modelos de IA puedo correr en mi máquina?" (`docs/app-compatibilidad-ia.md`), para que cualquier requerimiento grande futuro entre por el mismo camino sin volver a derivarlo en un chat.

## Por qué existe

Un requerimiento grande no cabe en una sola sesión: el contexto se resume y los detalles se pierden. La reacción intuitiva —"que una IA recuerde y las otras ejecuten"— **no funciona**, porque la sesión coordinadora también se resume. La solución es mover la memoria fuera de las sesiones: al repo.

Este repo ya hizo esa apuesta y le salió bien. `scripts/harness/run.sh` lo dice en su cabecera: *"cada llamada al modelo es un `claude -p` nuevo, sin contexto compartido, y toda la memoria entre pasadas viaja por archivos"*.

## El reparto de roles

| Pieza | Rol |
|---|---|
| El repo | La memoria. Único lugar donde el estado es verdad. |
| `docs/<proyecto>.md` | Spec de producto: el porqué, la arquitectura, las decisiones cerradas. |
| `docs/fases/F<n>.md` | Spec de fase: qué construir y **cómo se verifica**. |
| El issue de GitHub | La orden de trabajo y el estado visible. |
| La sesión ejecutora | Músculo desechable: nace, hace una fase, abre PR, muere. |
| La sesión coordinadora | Revisa PRs y corrige specs. Reemplazable en cualquier momento. |

## Las cuatro invariantes

Son lo único realmente transferible entre proyectos. Si una se rompe, el método deja de funcionar.

1. **Criterios de aceptación ejecutables.** Cada criterio es un comando que sale 0 o 1. `npm test` sí; "la UI se ve bien" no. Si una fase necesita que alguien juzgue *"¿esto está bien?"*, la spec falló — se arregla la spec, no se pide una opinión.
2. **El examen es intocable.** Cada spec declara `PROTEGIDOS`: los archivos que su sesión ejecutora **no puede modificar** (sus tests de aceptación, los audits, las specs). Se verifica en la revisión con `git diff --name-only`. Si el examinado puede editar la compuerta, el veredicto no vale nada.
3. **El issue apunta a la spec, no la copia.** Duplicar el contenido garantiza deriva entre los dos.
4. **Si una sesión no puede terminar con solo su spec, el bug es de la spec.** Esa información es valiosa: se corrige la spec y se relanza, no se compensa con explicaciones en el chat.

## Primeros pasos

1. Leé `AGENTS.md` y las guías que enumera.
2. Leé `references/restricciones-repo.md` — las reglas fijas de este repo que toda fase debe respetar (regla de oro de `links.ts`, error de página huérfana, hreflang recíproco, `output: 'static'`, tokens `fai-*`). Verificalas contra el código: si hay discrepancia, gana el código y actualizá la referencia.
3. Leé `references/procedimiento.md` — el flujo completo, de la exploración al primer issue.
4. Mirá `docs/app-compatibilidad-ia.md` como ejemplo trabajado del formato.

## Flujo resumido (el detalle está en `references/procedimiento.md`)

1. **Explorar** el repo antes de proponer nada. Buscá primero qué se puede reutilizar.
2. **Cerrar decisiones con el usuario** usando `AskUserQuestion` con opciones concretas y una recomendación. Las que casi siempre hay que cerrar: backend/runtime, rol de la IA, alcance de la v1, idiomas. No planifiques sobre supuestos.
3. **Escribir la spec de producto** en `docs/<proyecto>.md` (plantilla en `templates/spec-producto.md`).
4. **Descomponer en fases** con dependencias explícitas y propiedad de archivos disjunta.
5. **Escribir una spec por fase** en `docs/fases/F<n>.md` (plantilla en `templates/spec-fase.md`).
6. **Validar las specs** con `node .claude/skills/sdd-fases/scripts/audit-specs.mjs`.
7. **Abrir un issue por fase** (plantilla en `templates/issue.md`), con labels y dependencias.
8. **Entregar al usuario** el prompt de arranque de sesión ejecutora (`templates/prompt-sesion.md`).

## No negociables

- **Nunca planifiques sin explorar el repo primero.** Proponer código que ya existe es el error más caro: se paga en cada fase.
- **Una fase = una sesión = un PR** contra una rama de integración, nunca contra `main`. `deploy.yml` despliega en cada push a `main`: un merge prematuro publica una app a medio construir.
- **La propiedad de archivos entre fases debe ser disjunta.** Dos fases que editan el mismo archivo se pisan; si es inevitable, secuencialas en vez de paralelizarlas.
- **Toda fase declara "Fuera de alcance".** Sin esa sección, las sesiones ejecutoras extienden el trabajo por su cuenta y el PR crece hasta ser irrevisable.
- **No automatices con el arnés de Actions antes de tener una compuerta automática confiable.** El arnés (`ficha-harness.yml`) funciona porque hay auditorías que lo frenan. Sin tests, un arnés de fases corre a ciegas.
- **Ninguna cifra inventada llega a una spec.** Si un dato (un tamaño, un límite, un id de modelo) no se puede verificar, la spec dice "verificar en el momento de implementar y fijar en una constante", no un número inventado.
- **Las decisiones cerradas se registran con su motivo** en la spec de producto. Sin el motivo, la fase siguiente las reabre.

## Handoff

Al terminar la planificación, resumí al usuario:

- qué decisiones quedaron cerradas y cuáles siguen abiertas;
- el orden de lanzamiento y qué fases pueden ir en paralelo;
- los números de issue creados y cuáles están desbloqueados **ahora**;
- el prompt exacto, copiable, para arrancar la primera sesión ejecutora;
- los riesgos que detectaste y cómo los mitiga el plan.
