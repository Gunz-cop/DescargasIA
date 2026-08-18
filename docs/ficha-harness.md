# Arnés de fichas en GitHub Actions

Automatiza el ciclo completo de una ficha nueva: **crear → auditar → corregir →
auditar**, hasta que la auditoría apruebe o se agoten las iteraciones (5 por
defecto). Corre en un runner de GitHub, no en una sesión de Claude Code, que es
justamente el punto: el ciclo consume mucha cuota y no tiene sentido gastarlo
mientras trabajás en otra cosa.

Las tres pasadas usan las mismas skills que ya están versionadas en el repo
(`.claude/skills/descargasia-tool-ficha` y `descargasia-ficha-auditoria`), así
que mejorar las skills mejora el arnés sin tocar nada de esto.

## Puesta en marcha (una sola vez)

1. Generá un token de larga duración contra tu suscripción, desde una terminal
   con `claude` logueado:

   ```bash
   claude setup-token
   ```

2. Cargalo como secret del repositorio:

   ```bash
   gh secret set CLAUDE_CODE_OAUTH_TOKEN --repo Gunz-cop/DescargasIA
   ```

   El token queda atado a tu suscripción: la cuota que gaste el arnés es la
   tuya, y si lo rotás localmente hay que volver a cargarlo acá.

3. Verificá que Actions tenga permiso de crear pull requests, en
   *Settings → Actions → General → Workflow permissions*.

## Cómo se dispara

Desde la pestaña Actions, workflow **Arnes de fichas**, botón *Run workflow*:

| Input | Para qué |
|---|---|
| `herramienta` | Qué fichar. Poné el nombre y, si la sabés, la URL oficial: ahorra una búsqueda y evita que agarre un clon. |
| `slug` | Vacío = lo decide la pasada de creación a partir del nombre oficial. |
| `lang` | `es`, `sv` o `it`. |
| `max_loops` | Ciclos auditar/corregir. **2 por defecto** — cada ciclo son dos pasadas de modelo, y el costo crece lineal. |
| `model` | `claude-opus-5` por defecto. |
| `effort` | `medium` por defecto. Ver más abajo por qué no es `high`. |
| `skip_create` | Saltea la creación: audita y corrige un slug que ya existe. Sirve para pasarle el arnés a fichas viejas del catálogo. |

### Por qué Opus 5 en `medium` y no Sonnet 5

Por token, Opus 5 cuesta bastante más que Sonnet 5 (US$5/US$25 por millón contra
US$3/US$15, y Sonnet 5 arrastra un precio introductorio más bajo todavía hasta el
31/08/2026). La razón para elegirlo igual es que en Opus 5 los niveles `low` y
`medium` rinden desproporcionadamente bien —calidad alta a una fracción de los
tokens y la latencia— y el default de esfuerzo heredado de otros modelos casi
nunca es el correcto. Un arnés que resuelve la ficha en menos vueltas relee menos
contexto en cada turno, que es donde se va la cuota de verdad.

Eso **no** garantiza que salga más barato en total: para empatar con Sonnet 5 al
precio de hoy tendría que gastar menos del 40% de los tokens. Es plausible en un
lazo agéntico y no está medido. Lo que sí es seguro es más calidad por token
gastado. Si querés comparar, el resumen de cada corrida imprime modelo, esfuerzo
y costo estimado — corré la misma ficha con las dos combinaciones y mirá esos
números en vez de discutirlo en abstracto.

También se puede correr entero en local, con `claude` logueado:

```bash
HERRAMIENTA="Kling AI" FICHA_LANG=es MAX_LOOPS=5 bash scripts/harness/run.sh
```

## Qué hace exactamente

```
crear ficha  (skill descargasia-tool-ficha)
   │
   ├─► compuerta determinista: npm run build:no-shorten + metricas.mjs --strict
   │      │
   │      ├─ falla ──► los hallazgos son la salida del build/script, sin gastar
   │      │            una pasada de auditoría del modelo
   │      │
   │      └─ pasa ───► auditoría (skill descargasia-ficha-auditoria)
   │                      └─► veredicto estructurado: APTO / APTO_CON_AVISOS / NO_APTO
   │                             └─ si aprueba ──► verificación de cierre:
   │                                               metricas.mjs --check-urls
   │
   ├─ aprueba y el cierre pasa ──► fin, pull request listo para revisar
   └─ no aprueba ──► corrección con los hallazgos ──► vuelve arriba (hasta max_loops)
```

Cinco detalles del diseño que conviene conocer antes de tocarlo:

- **La compuerta barata va primero.** El build y `metricas.mjs --strict` cuestan
  segundos y encuentran los defectos mecánicos con más precisión que el modelo.
  Si fallan, el arnés salta directo a corregir: no gasta una auditoría en
  redescubrir lo que un script ya dijo mejor.
- **`--check-urls` corre una sola vez, al cerrar.** Hace una petición de red por
  cada fuente citada, y la skill lo reserva para el cierre justamente por eso.
  Corre recién cuando la auditoría aprobó, y puede desmentirla: si encuentra una
  fuente que no existe o una fecha declarada que no coincide con la que publica
  la página, la aprobación se cae y el lazo sigue.
- **Aprobar es `APTO`, o `APTO_CON_AVISOS` sin ningún P0.** Un P0, según la
  propia skill de auditoría, es motivo de rechazo por sí solo, así que no
  alcanza con que el veredicto global sea benévolo.
- **La compuerta es intocable, y se comprueba después de cada pasada.** No al
  final de cada vuelta: una comprobación por vuelta se saltea entera en el camino
  que termina aprobando, que es justo el que produce un PR de aspecto limpio.
  Los archivos de infraestructura (`.github/`, `.claude/`, `scripts/`,
  `src/content.config.ts`, `src/pages/`, `src/components/`, `src/utils/`,
  `src/data/`, `package.json`) se revierten y la corrida aborta. Los de
  `src/content` no se revierten nunca —ahí vive el trabajo de la corrida—, pero
  si los toca la pasada de auditoría, que es de sólo lectura, también aborta.
- **La auditoría tiene que mostrar su trabajo, y eso bloquea.** El campo
  `fuentes_verificadas` es obligatorio en el esquema: una entrada por afirmación
  comprobada, con la URL y si la fuente la respalda. Un veredicto aprobatorio con
  el array vacío **no aprueba**. El argumento es que la combinación es
  contradictoria: una ficha sin `communityInsights` ya es bloqueante en
  `metricas.mjs`, así que toda ficha que llega a aprobar tiene al menos una fuente
  que verificar, y declarar cero sólo puede significar que el paso 3 no se hizo.
  En ese caso el arnés saltea la pasada de corrección —no hay nada que corregir en
  la ficha, lo que falta es la verificación— y le pasa el aviso a la auditoría de
  la vuelta siguiente.

## Qué produce

- **Un pull request** contra `main` con la ficha (`src/content/**` y nada más).
  Si el arnés aprobó, sale como PR normal; si agotó las iteraciones o abortó,
  sale como **draft**, para que no se mergee de taquito algo que la auditoría
  nunca dejó pasar.
- **El resumen en la página del run**: veredicto por iteración, hallazgos y qué
  dijo haber corregido cada pasada.
- **Un artifact** (`harness-<run_id>`, 30 días) con el detalle completo: el
  informe de auditoría de cada vuelta, la salida de métricas, los logs del build
  y las respuestas crudas del modelo con su costo estimado.

El resumen se escribe desde un trap de salida, así que una corrida que aborta a
mitad —una pasada que falló, el guardián que saltó— deja igual su rastro en vez
de perderse entera.

## Cuándo NO usar el arnés

**Para actualizar una ficha que ya existe, usá una sesión interactiva.** El arnés
no compite ahí y no va a competir: cada pasada es un `claude -p` nuevo, sin
contexto compartido, así que recarga la skill, `AGENTS.md`, `content.config.ts` y
las fichas de ejemplo **en cada pasada**. Una sesión de curación carga todo eso
una vez y lo reutiliza cacheado. El aislamiento que hace confiable al arnés es lo
mismo que lo hace caro.

Su caso de uso es una ficha **genuinamente nueva**, donde la alternativa es una
sesión larga de investigación. Por eso el arnés aborta —antes de gastar una sola
pasada— si la herramienta pedida ya está en el catálogo, buscándola por slug y
por dominio oficial. Si de verdad querés actualizarla, `skip_create: true` saltea
la creación y va derecho al lazo de auditar/corregir.

Esto se aprendió caro: la primera corrida real se pidió sobre `kling-ai`, que ya
estaba fichada. En vez de crear, reescribió tres archivos en dos idiomas, midió
originalidad contra material maduro, y se comió el 30% de una cuota de cinco
horas sin terminar.

## Lo que el arnés no puede hacer

El paso 4 de la skill de auditoría —levantar el sitio y medir el DOM renderizado—
**no corre acá**: no hay navegador en el runner. El prompt de auditoría lo
sustituye por una lectura de `src/pages/[lang]/[slug].astro` contra el JSON, que
atrapa las contradicciones más gruesas (un botón "Descargar" sobre un producto
discontinuado, referencias direccionales al revés), pero no es lo mismo.

Por eso el pull request lo dice explícitamente: **antes de mergear, mirá la ficha
renderizada**. El arnés existe para que llegues a esa revisión con el trabajo
mecánico hecho, no para saltearla.

Tampoco valida el shortener de enlaces: el arnés usa `build:no-shorten` porque
LinkZip necesita credenciales que el runner no tiene. Los enlaces cortos se
generan en el build de `deploy.yml`, después del merge.

## Ajustar el arnés

- Los prompts de las tres pasadas están en `scripts/harness/prompts/`, uno por
  etapa. Son texto plano con `{{PLACEHOLDERS}}`: si una corrida sale mal por cómo
  se le pidió algo, se arregla ahí.
- El criterio de aprobación, los turnos máximos por pasada y la lista de archivos
  protegidos están en `scripts/harness/run.sh`.
- **Si tocás una ruta protegida, stageá antes de correr nada que ejercite la
  guardia.** Cuando salta, la guardia hace `git checkout --` sobre esas rutas, y
  eso revierte tus cambios sin commitear a lo que haya en el índice. Pasó dos
  veces mientras se escribía este arnés: se probaba el guardián y se perdía la
  edición del propio `run.sh`. Un `git add` antes convierte el checkout en una
  operación inocua.
- Si tocás `escribir_resumen`, corré `scripts/harness/test-resumen.sh`. Arma un
  `harness-out/` de fixture y comprueba que el resumen renderice: es el único
  tramo del arnés que, si no, se ejecuta recién al final de una corrida pagada.
  Necesita `jq` (viene en los runners de Ubuntu; en Windows hay que instalarlo).
- Todo lo que sea criterio editorial o de auditoría —qué hace buena a una ficha,
  qué cuenta como fuente— va en las skills, no acá. El arnés sólo las encadena.
