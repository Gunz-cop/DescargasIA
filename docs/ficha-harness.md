# Arnés de fichas en GitHub Actions

Automatiza el ciclo completo de una ficha nueva: **crear → auditar → corregir →
auditar**, hasta que la auditoría apruebe o se agoten las iteraciones (2 por
defecto y máximo). Corre en un runner de GitHub, no en una sesión interactiva,
que es justamente el punto: el ciclo consume cuota y no tiene sentido gastarla
mientras trabajás en otra cosa. Usa el CLI de [OpenCode](https://opencode.ai)
contra un modelo de Cloudflare Workers AI, pagado con la cuenta de Cloudflare
del usuario y sin tocar ninguna suscripción de Claude.

Las tres pasadas usan las mismas skills que ya están versionadas en el repo
(`.claude/skills/descargasia-tool-ficha` y `descargasia-ficha-auditoria`), así
que mejorar las skills mejora el arnés sin tocar nada de esto.

> **Ventana de prueba temporal (sacar después del 2026-09-07):** el workflow
> tiene un `schedule:` que lo dispara una vez por día a las 08:52 UTC, del
> 2026-09-02 al 2026-09-07, re-auditando siempre la ficha `amp` con
> `skip_create` para comparar el comportamiento del arnés migrado a Cloudflare
> en corridas consecutivas. El job `gate` hace que las corridas por horario
> después del 2026-09-07 no gasten cuota, pero **no borra el `schedule:` solo**
> — sacá el bloque `schedule:` y el job `gate` de
> `.github/workflows/ficha-harness.yml` una vez terminada la ventana.

## Puesta en marcha (una sola vez)

1. En el dashboard de Cloudflare, andá a **Workers AI → Use REST API** y anotá
   tu **Account ID**. Desde ahí mismo (o en *My Profile → API Tokens*) creá un
   API token con permiso **Workers AI:Read**.

2. Cargá los dos como secrets del repositorio:

   ```bash
   gh secret set CLOUDFLARE_ACCOUNT_ID --repo Gunz-cop/DescargasIA
   gh secret set CLOUDFLARE_TOKEN_FINCHAS --repo Gunz-cop/DescargasIA
   ```

   El workflow los mapea a `CLOUDFLARE_ACCOUNT_ID` / `CLOUDFLARE_API_KEY` en el
   entorno del arnés (`.github/workflows/ficha-harness.yml`, paso "Correr el
   arnés") — `CLOUDFLARE_API_KEY` es el nombre de variable que el proveedor
   `cloudflare-workers-ai` de OpenCode espera; el secret se llama distinto
   (`CLOUDFLARE_TOKEN_FINCHAS`) porque el repo ya tenía un
   `CLOUDFLARE_API_TOKEN` para otra cosa (el deploy con `wrangler`) y no
   convenía pisarlo ni confundirlos.

   El costo que gaste el arnés es el de tu cuenta de Cloudflare (pago por
   neurona), no una suscripción de Claude. Si rotás el token, hay que volver a
   cargarlo acá.

3. Verificá que Actions tenga permiso de crear pull requests, en
   *Settings → Actions → General → Workflow permissions*.

## Cómo se dispara

Desde la pestaña Actions, workflow **Arnes de fichas**, botón *Run workflow*:

| Input | Para qué |
|---|---|
| `herramienta` | Qué fichar. Poné el nombre y, si la sabés, la URL oficial: ahorra una búsqueda y evita que agarre un clon. |
| `slug` | Vacío = lo decide la pasada de creación a partir del nombre oficial. |
| `lang` | `es`, `sv` o `it`. |
| `max_loops` | Ciclos auditar/corregir. **2 por defecto y máximo** — cada ciclo son dos pasadas de modelo. |
| `model` | Modelo de Cloudflare Workers AI. `kimi-k2.7-code` por defecto; `glm-5.3` para fichas especialmente complejas, `gpt-oss-120b` para pasadas baratas. |
| `skip_create` | Saltea la creación: audita y corrige un slug que ya existe. Sirve para pasarle el arnés a fichas viejas del catálogo. |

### Por qué Kimi K2.7 Code es el default

Cada pasada recarga el repositorio y las skills, y el lazo puede ejecutar varias
pasadas. Es el modelo de código de Cloudflare Workers AI con mejor relación
entre calidad de tool-calling (Bash/Edit/Write, que el arnés usa en cada
pasada) y costo. GLM-5.3 sigue disponible como input explícito para casos
complejos. El resumen imprime modelo y costo estimado para comparar corridas
reales.

También se puede correr entero en local, con `CLOUDFLARE_ACCOUNT_ID` y
`CLOUDFLARE_API_KEY` en el entorno:

```bash
CLOUDFLARE_ACCOUNT_ID=... CLOUDFLARE_API_KEY=... \
  HERRAMIENTA="Kling AI" FICHA_LANG=es MAX_LOOPS=2 bash scripts/harness/run.sh
```

## Qué hace exactamente

```
crear ficha  (skill descargasia-tool-ficha)
   │
   ├─► compuerta determinista: build + metricas.mjs --strict         gratis
   │      ├─ falla ──► los hallazgos son la salida del script, sin gastar
   │      │            una pasada del modelo
   │      └─ pasa ───►
   │
   ├─► AUDITORÍA ESCÉPTICA COMPLETA — una sola vez en la corrida     ~$1.10
   │      skill descargasia-ficha-auditoria, con instrucción de reportar
   │      todo (no filtrar por severidad ni por confianza)
   │      └─ si aprueba de una ──► cierre por red ──► fin
   │
   ├─► corrección dirigida: sólo los hallazgos listados              ~$0.90
   │
   ├─► alcance de la corrección, medido por script                   gratis
   │      qué URLs se agregaron (citas) y qué arrays crecieron (afirmaciones)
   │
   └─► VERIFICACIÓN DIFERENCIAL                                      ~$0.20
          ¿quedó corregido cada P0/P1?  ¿las fuentes nuevas respaldan
          su afirmación?  ¿lo agregado responde a algún hallazgo?
          ¿la corrección rompió algo?   NO busca hallazgos nuevos.
             │
             ├─ cierra ──► metricas.mjs --check-urls ──► aprobado, PR
             └─ no cierra ──► otra corrección, o draft al agotar vueltas
```

### Por qué la auditoría corre una sola vez

Éste es el corazón del diseño y se aprendió midiendo. La primera versión del
arnés repetía la auditoría escéptica completa después de cada corrección. No
converge, y la razón está en la propia skill: le pide al auditor *"sé escéptico
por defecto, buscá motivos de rechazo, no de aprobación"*. Un auditor así, corrido
fresco, casi siempre encuentra algo nuevo — está diseñado para eso. **"El auditor
no tiene nada que decir" no es un estado alcanzable**, así que el lazo se agotaba
siempre.

Los números de la corrida que lo demostró (ficha nueva, 2 vueltas) son de
cuando el arnés todavía corría contra Claude — quedan como referencia de las
proporciones entre pasadas, no como costo esperado con Cloudflare Workers AI,
que cobra por neurona y es sustancialmente más barato:

| Pasada | Costo |
|---|---|
| Crear | $1.14 |
| Auditar #1 | $1.10 |
| Corregir | $0.88 |
| Auditar #2 | $1.00 |

La segunda auditoría hizo dos cosas: confirmar que las tres correcciones habían
entrado —acotado, barato, y lo único que el lazo necesitaba— y correr una
auditoría entera de nuevo, que encontró un hallazgo más y volvió a no aprobar.
Sólo la primera mitad cierra el ciclo.

La contrapartida es explícita: **el arnés ya no busca defectos nuevos después de
la primera auditoría.** Los que aparecerían en una segunda pasada quedan para el
revisor humano, que de todos modos tiene que mirar la ficha renderizada porque el
paso 4 de la skill no corre en CI. Para fichas donde eso no alcance está
`final_audit`, que paga una auditoría escéptica más antes de aprobar.

### Citas nuevas vs. afirmaciones nuevas

La verificación diferencial sólo mira lo que la auditoría listó, así que algo que
la corrección agregue por su cuenta llegaría al PR sin auditar. `alcance.mjs`
compara la ficha antes y después y distingue dos casos, sin preguntarle al modelo
que hizo la corrección:

- **Una URL nueva** suele ser la corrección correcta — la skill exige que cada
  documento mencionado sea trazable desde la ficha. Se verifica esa fuente contra
  su afirmación y se sigue.
- **Una entrada nueva** en `editorialSections`, `faq`, `communityInsights`,
  `platforms` o `alternatives` es contenido que nadie auditó. El verificador tiene
  que decir si responde a un hallazgo; si no, no cierra.

La distinción no es teórica: en la corrida real la corrección agregó `docs/models`
a `officialSources` para respaldar el roster de modelos que acababa de arreglar.
Tratar eso como "fuera de alcance" habría penalizado la corrección correcta.

Cinco detalles más del diseño que conviene conocer antes de tocarlo:

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
no compite ahí y no va a competir: cada pasada es un `opencode run` nuevo, sin
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

- Las pasadas tienen un límite de 10 minutos cada una; el build y las métricas
  tienen límites separados más cortos. Si una fuente o herramienta externa se
  atasca, la corrida aborta con resumen en vez de esperar al límite del job.
- Los prompts de las tres pasadas están en `scripts/harness/prompts/`, uno por
  etapa. Son texto plano con `{{PLACEHOLDERS}}`: si una corrida sale mal por cómo
  se le pidió algo, se arregla ahí.
- El criterio de aprobación y la lista de archivos protegidos están en
  `scripts/harness/run.sh`. No hay techo de turnos por pasada — opencode no lo
  soporta —, así que `PASS_TIMEOUT` es el único límite real.
- La salida estructurada depende de que el modelo cierre con un bloque
  ` ```json ` que valide contra el esquema de la pasada; ese contrato está
  descripto en cada prompt y se valida con `scripts/harness/extraer-salida.mjs`.
  Si una pasada empieza a fallar con "sin salida estructurada válida", mirá
  `${OUT}/*/raw.json` (el stream crudo) antes de tocar el prompt.
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
