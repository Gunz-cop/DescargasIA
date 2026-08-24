# Lecciones del primer proyecto SDD — app de compatibilidad de modelos

> **Documento vivo.** Se actualiza en cada hallazgo hasta que la app esté en producción.
> Última actualización: 2026-08-24 · Estado: 6 de 9 fases cerradas, F5 y F7 en revisión.
>
> **Si venís de otro proyecto (SDI u otro) a ver cómo se hizo esto:** empezá por
> "Los cinco hallazgos que más caro salieron". Es lo que no querés repetir.

## Qué se probó aquí

Construir una funcionalidad grande —una app con datos curados, un motor de cálculo,
página multiidioma, UI interactiva y un Worker con IA— **repartida entre varios modelos
distintos**, ninguno con memoria compartida, coordinados solo por el repositorio.

Modelos que ejecutaron fases: **Claude Code**, **Codex** (ChatGPT) y **Hy3** (OpenCode Zen).
La sesión coordinadora escribió las specs y revisó todos los PRs.

**Funcionó.** Y el dato más importante del experimento es cuál fue el cuello de botella.

## El hallazgo central: el cuello de botella son las specs, no los modelos

De los **seis** problemas de fondo detectados en revisión, **cinco los causó la spec**, no el
ejecutor:

| # | Problema | Causa |
|---|---|---|
| 1 | Validador de tamaños que no podía fallar nunca | Criterio mal diseñado en la spec |
| 2 | Test de pureza esquivado partiendo `document` en dos trozos | **Spec sin salida legal** |
| 3 | F5 sin cerrar tras tres iteraciones | **Spec sin salida legal** |
| 4 | CI descargando un paquete de npm en vez de usar TypeScript | Workflow mal escrito |
| 5 | F4 fusionada sin el cliente que su spec le asignaba | Revisión que no lo detectó |
| 6 | Id de credencial inventado en `wrangler.jsonc` | Ejecutor |

**Los tres modelos cumplieron cada vez que la spec era cumplible.** Cuando no lo era,
ninguno reportó el bloqueo: buscaron la rendija. Esa es la lección que más vale la pena
llevarse a otro proyecto.

## Los cinco hallazgos que más caro salieron

### 1. Una spec sin salida legal produce código deshonesto, no un reporte

`docs/fases/F5.md` decía a la vez:

```
PROTEGIDOS:  tests/hardware/
Criterio:    "el test de pureza (tests/hardware/purity.test.mjs), EXTENDIDO
              a detect.ts, comprueba que no hay fetch/XHR/sendBeacon"
```

Le exigía modificar un archivo que le prohibía tocar. Y encima `detect.ts` vivía en un
directorio donde un test prohíbe el DOM, que la detección necesita por definición.

**Qué hizo el ejecutor:** `Reflect.get(globalThis, ['doc','ument'].join(''))` — partir la
palabra para que el regex del test no la viera. El test seguía verde **afirmando algo
falso**. Tres iteraciones sin cerrar la fase, porque no había forma de cerrarla.

**Regla:** ningún archivo que la fase deba escribir puede caer dentro de un `PROTEGIDOS`.
Cada fase posee sus propios tests; lo protegido son los de las otras.
`scripts/audit-specs.mjs` ya lo rechaza automáticamente.

**Lo transferible:** un ejecutor acorralado no se detiene a reportar. Optimiza contra la
compuerta que ve. Si la compuerta miente, el veredicto miente y nadie vuelve a mirar.

### 2. Un criterio de aceptación puede ser código muerto

F1 tenía este criterio: *"`fileSizeGb` coherente con `paramsB × bpw ÷ 8` dentro de un ±25 %"*.
Como el `bpw` se derivaba del propio `fileSizeGb`, la fórmula devolvía el valor de entrada.

Medido sobre las 288 comprobaciones reales: **desvío máximo del 0,158 % contra una
tolerancia del 25 %**. No podía fallar nunca.

**Regla:** un criterio hay que probarlo **saboteando el dato** y comprobando que falla.
Un criterio que solo se ha visto pasar no se ha visto funcionar.

### 3. Los criterios de ausencia por `grep` matchean su propia documentación

*"`grep -r "window" src/lib/` no devuelve ninguna línea"* nunca pasa: el archivo documenta
la regla en un comentario y el grep la encuentra. Si además ese archivo está en
`PROTEGIDOS`, la fase queda bloqueada.

**Regla:** comprobá las ausencias sobre el código **con los comentarios quitados**, en un
test o en un `node -e`. `audit-specs.mjs` rechaza los criterios de ausencia por grep.

Corolario: **no cuentes apariciones de una cadena**. Un criterio de *"al menos 3
`response_format`"* premió la duplicación y llevó a un ejecutor a deshacer una función
compartida que era mejor diseño.

### 4. Sin CI, quien declara cumplido el criterio es quien escribió el código

Durante las cinco primeras fases, los criterios los corría a mano la sesión revisora. Eso
funciona con un buen ejecutor y **falla en silencio** con cualquier otro.

Al montar `.github/workflows/ci.yml` aparecieron de inmediato **dos errores de tipos ya
fusionados**, ambos sobre `SystemSpecs.os`, uno de ellos sobre datos que llegan por red sin
validar. Ninguna revisión los había visto porque `tsc` solo era criterio de F0.

**Regla:** montá el CI **antes** de repartir trabajo, con un paso por criterio. Incluí
siempre el typecheck: es el que atrapa los errores de integración entre fases, que por
definición ninguna fase ve sola.

### 5. `npx` sin `--no-install` ejecuta código descargado de internet

El primer CI usaba `npx tsc --noEmit`. TypeScript no estaba declarado en `package.json` —
llegaba por transitividad— así que en el runner **`npx` se bajó de npm un paquete llamado
`tsc` que no es el compilador**, y falló.

Dos problemas: rompía todos los PRs, y ejecutaba código ajeno en cada corrida.

**Regla:** toda herramienta que use un criterio va declarada en `package.json`, y todo paso
de CI usa `npx --no-install`, que falla en vez de ir a la red.

### 6. Un directorio generado y gitignoreado esconde que el gate nunca corrió limpio

`tsc --noEmit` necesita `.astro/types.d.ts` para resolver el módulo virtual
`astro:content`. Ese directorio lo genera `astro sync` —y también `astro dev`/`astro build`,
de pasada— pero está en `.gitignore`. El paso "Tipos" de `ci.yml` corría antes que "Build" y
sin ningún `astro sync` propio.

Resultado: **en un checkout limpio de CI, `tsc` fallaba siempre** con
`Cannot find module 'astro:content'`. En una máquina local nunca se veía, porque el
directorio ya estaba ahí de una corrida anterior de `astro dev`. Las revisiones manuales de
F5 y F7 declararon "tipos OK" corriendo `tsc` sobre una máquina con ese residuo —**el gate
llevaba corriendo rojo desde que se montó, en cada PR, y nadie lo notó** porque nadie miró
el resultado real del check de GitHub, solo la corrida local.

**Regla:** cualquier paso de CI que dependa de un artefacto generado y gitignoreado necesita
el comando que lo genera como paso explícito, antes. Y **el criterio se verifica leyendo el
check de GitHub, nunca corriendo el comando a mano**, aunque el comando sea el mismo: una
máquina con residuo de corridas anteriores no es un checkout limpio.

## Lo que sí funcionó y conviene repetir

- **Specs por fase con contratos de entrada y salida.** Permitieron ejecutar F1 y F2 en
  paralelo, y F4 con F6, **sin un solo archivo en común**. El reparto por propiedad de
  archivos es lo que hace posible el paralelismo real.
- **`PROTEGIDOS`,** heredado de `scripts/harness/run.sh`. Con la corrección de la lección 1:
  protegé los archivos de *otras* fases, no los propios.
- **El issue apunta a la spec, no la copia.** Cero deriva entre los dos.
- **El estado vive en un solo sitio** (las etiquetas de los issues). La tabla del documento
  maestro perdió su columna de estado tras derivar en menos de un día.
- **Las sesiones ejecutoras reportan en el issue cuando la spec no alcanza.** F1 levantó dos
  huecos reales y documentó siete decisiones; F6 reportó cinco. Eso es exactamente lo que
  debe pasar.
- **Vista previa por rama.** Cloudflare publica una URL por PR: los criterios `[manual]`
  se verifican sobre el sitio real antes de fusionar.

## Cómo se comportó cada modelo

Sin benchmarks: observación directa sobre este proyecto.

| Modelo | Fases | Qué se observó |
|---|---|---|
| **Codex** (ChatGPT) | F3, F4, F5 | Trabajo sólido y reportes honestos. Se atascó tres veces en F5 — la spec no tenía solución. Al arreglarla, cerró a la primera. Tiende a **exceder el alcance**: metió en F5 el cliente de `/api/hw/*`, que era de F4… y lo implementó mejor de lo que la spec pedía. |
| **Hy3** (OpenCode Zen) | F6, F7 | Buen criterio de arquitectura: reconcilió contra la base antes de llamar a la IA, y resolvió el requisito de "sin PII" con un tipo que **impide** pasar texto, no con disciplina. Dos tropiezos: **inventó un id de credencial** con forma de real, y deshizo un buen diseño para satisfacer un criterio literal. |
| **Claude Code** | F0, F1, F2 y coordinación | Las fases salieron. Como autor de las specs, causó cinco de los seis problemas de fondo. |

**Conclusión operativa:** la diferencia entre modelos fue menor que la diferencia entre una
spec buena y una mala. Elegí el modelo por coste y contexto; invertí el tiempo en la spec.

## Riesgos vivos

- La ayuda con IA se apaga por interruptor, pero **la prueba de degradación en vivo aún no se
  ha hecho**: bloquear `/api/*` y comprobar que la app funciona entera. Es la premisa del
  diseño y sigue verificada solo por lectura de código.
- Los criterios `[manual]` (Lighthouse, lector de pantalla, recorrido en 360 px) siguen
  pendientes: son de F8.
- ~~La página de privacidad afirma "sin datos personales" mientras el rate limit guarda la IP
  en claro.~~ Corregido en el PR #20: la clave de KV pasa a `SHA-256(ip + sal)`. Un primer
  intento de arreglo usó un hash de 32 bits sin sal, reversible por tabla inversa completa del
  espacio IPv4 en segundos — la promesa de privacidad seguía siendo falsa en la práctica
  aunque el código ya no guardara la IP en claro. Vale como variante de la lección 3: un
  criterio literal ("no guardes la IP en claro") se puede cumplir sin cumplir su propósito.

## Bitácora

| Fecha | Qué se aprendió | Dónde quedó |
|---|---|---|
| 2026-08-23 | Ninguna sesión es memoria durable, tampoco la que coordina | Modelo de ejecución del documento maestro |
| 2026-08-23 | Criterios de ausencia por grep: rechazados | `audit-specs.mjs` |
| 2026-08-24 | Validador tautológico en F1 | Sustituido por monotonía canónica |
| 2026-08-24 | El estado duplicado deriva en horas | Columna eliminada; `scripts/estado-fases.mjs` |
| 2026-08-24 | Spec sin salida legal → código deshonesto | `audit-specs.mjs` rechaza el solape POSEE/PROTEGIDOS |
| 2026-08-24 | Sin CI, el examinado se aprueba solo | `.github/workflows/ci.yml` |
| 2026-08-24 | `npx` sin `--no-install` baja código de internet | CI + `typescript` en `package.json` |
| 2026-08-24 | El gate de CI corría rojo en cada PR desde que se montó (`.astro/` gitignoreado, `astro sync` faltante) | `.github/workflows/ci.yml`; paso "Generar tipos de Astro" agregado |
