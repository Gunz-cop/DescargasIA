# F<n> — <nombre de la fase>

> Plantilla para `docs/mejora/fases/`. Todas las secciones son obligatorias.
> El estado operativo vive en las etiquetas de GitHub, no en esta plantilla.

**Proyecto:** `docs/plan-mejora-productos-por-idioma.md`
**Issue:** #<n>
**Producto:** `es`, `sv`, `it` o `común`
**Rama base:** `main`
**Depende de:** F<x>, F<y> o `ninguna`

## Objetivo

Qué queda hecho cuando esta fase cierra y por qué importa.

## Contrato de entrada

Archivos, decisiones y datos que ya existen. Si falta una entrada, la fase se
bloquea; no se inventa un sustituto.

## Contrato de salida

Archivos, exports, tipos o decisiones que quedan disponibles para las fases
posteriores, con nombres exactos.

## Archivos que posee

Lista completa de archivos que esta fase puede crear o editar. No uses un
directorio amplio si la fase solo necesita algunos archivos.

- `ruta/al/archivo` — propósito y cambio permitido.

## PROTEGIDOS

Archivos que la fase no puede modificar. Nunca incluyas aquí un archivo que la
fase posee. Protege los tests de otras fases y las superficies no autorizadas,
no la carpeta completa de la propia fase.

- `ruta/de/archivo-ajeno`

## Instrucciones

Decisiones cerradas, referencias del repositorio, formato de datos, comandos y
restricciones necesarias para ejecutar sin consultar una conversación previa.

## Fuera de alcance

Qué no se hace, aunque parezca una extensión natural, y qué fase lo posee.

## Criterios de aceptación

Cada criterio debe salir 0 o 1, o ser `[manual]` con pasos reproducibles y
resultado esperado. Prueba el efecto con datos válidos e inválidos cuando
corresponda. No uses criterios que solo cuenten apariciones de texto ni
criterios de ausencia por `grep` que puedan coincidir con su propia
documentación.

- [ ] `<comando entre backticks>` sale 0.
- [ ] `[manual]` 1. <paso>; 2. <resultado esperado>.

## Riesgos conocidos

Qué puede salir mal, qué evidencia lo detecta y qué decisión o fase lo resuelve.
