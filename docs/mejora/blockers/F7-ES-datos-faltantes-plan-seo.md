# Blocker — datos que faltan para ejecutar y medir el plan SEO del producto `es`

**Issue bloqueado:** [#47](https://github.com/Gunz-cop/DescargasIA/issues/47) — F7, medición postpublicación
**Documento afectado:** `docs/mejora/plan-seo-es-2026-08-29.md`
**Blocker previo del que este deriva:** [#50](https://github.com/Gunz-cop/DescargasIA/issues/50) · `docs/mejora/blockers/F7-bloqueo-export-gsc-sin-segmentar.md` — **sigue abierto**
**Rama base:** `main`
**Rama de trabajo:** `codex/issue-47-plan-seo-es`
**Commit base comprobado:** `ae8eed5`
**Fecha de comprobación:** 2026-08-29
**Estado:** ABIERTO. El plan se puede escribir; **no se puede medir**

## Por qué existe este blocker si ya existe el de #50

`F7-bloqueo-export-gsc-sin-segmentar.md` acota lo que el export del 2026-08-28
no demuestra. Este documento añade lo que apareció **al intentar convertir ese
export en un plan ejecutable y medible**: cuatro huecos nuevos (D6, D7, D8,
D11) que no estaban acotados allí, y la consecuencia operativa de todos juntos.

No duplica los tres primeros. Los referencia y sigue.

## Lo que ya está acotado en #50 y este plan hereda

| Falta | Efecto sobre el plan |
|---|---|
| **D1** · consultas filtradas por página `/es/` | **0 de 6.066 impresiones `/es/*` es atribuible a una consulta.** El plan ordena por volumen de página y riesgo observado, nunca por demanda |
| **D2** · cruce consulta × país o página × país | El alcance geográfico de `es` sigue declarado y no ratificado (`decisiones.md`, decisión abierta) |
| **D3** · serie temporal por URL | Ninguna página tiene tendencia. Es lo que obliga a que **todo** experimento del plan lleve grupo de control |

## Lo que este plan añade

### D4 · Apariencia en búsquedas — export vacío

`Aparición en búsquedas.csv` del corte del 2026-08-28 trae **solo cabecera**.
No se sabe si alguna ficha `es` aparece en algún resultado enriquecido, así que
no puede descartarse ni proponerse como palanca de CTR.

**No se deduce del HTML.** El sitio puede emitir datos estructurados sin que
Google los use.

### D5 · Enlaces externos — export vacío

`fuenteai.com-Latest.links-2026-08-28.csv` trae **cero filas**. Ninguna lectura
de autoridad entrante es posible, ni para explicar la posición media de una
ficha ni para descartarla como causa.

### D6 · No existe la lista de URLs de las 90 páginas no indexadas

`cobertura-motivos-no-indexado.csv` da motivos y **recuentos**, no URLs:

| Motivo | Fuente | Páginas |
|---|---|---|
| Excluida por una etiqueta `noindex` | Sitio web | 52 |
| Descubierta: actualmente sin indexar | Sistemas de Google | 15 |
| Página alternativa con etiqueta canónica adecuada | Sitio web | 8 |
| Rastreada: actualmente sin indexar | Sistemas de Google | 8 |
| Página con redirección | Sitio web | 4 |
| Error de redirección | Sitio web | 3 |

El criterio de aceptación de #47 dice: *«evolución de páginas no indexadas sólo
cuando sean realmente indexables»*. **Ese criterio no se puede evaluar hoy**:
sin la lista no se sabe cuál de los 52 `noindex` es deliberado —`/r` lo es— ni
qué URL está detrás de los 3 «Error de redirección».

Los 3 errores de redirección son el dato que más interesa, porque no hay
ninguna hipótesis en el repositorio que los explique.

### D7 · Estado real de `http://fuenteai.com/es/*` en producción — no medido

La tabla de páginas contiene dos filas con esquema `http`:

| URL | Impresiones | Clics | Posición media |
|---|---|---|---|
| `http://fuenteai.com/es/categoria/modelos-locales` | 17 | 0 | 26,47 |
| `http://fuenteai.com/es/lm-studio` | 14 | 0 | 8,29 |

`grep` sobre el `dist/` completo del build de `ae8eed5`: **cero apariciones** de
`http://fuenteai.com` en cualquier HTML y en el sitemap. El sitio no las emite.

Lo que falta es comprobar si esas URLs redirigen 301 a `https` en producción.
**Esta sesión no puede hacerlo**: no alcanza el dominio. Es la misma limitación
que #88 registró al auditar HSTS (`CONNECT tunnel failed, response 403`).

No se propone ningún cambio de `public/_redirects` ni de la zona mientras el
estado real no esté observado: escribir una redirección que ya existe es ruido,
y escribir la equivocada rompe URLs indexadas.

### D8 · Tres URLs con impresiones que no figuran entre las indexadas — no explicado

`/es/categoria/asistentes-ia`, `/es/klang` y `/es/microsoft-copilot` tienen
impresiones en la ventana de rendimiento y no aparecen entre las 81 URLs `es`
de `cobertura-validas-urls.csv`.

Las dos tablas tienen fechas distintas —cobertura al 2026-08-20, rendimiento
hasta el 2026-08-26—, lo que es una explicación plausible y **no comprobable
con este export**. Queda como **no explicado**, no como error. Resolverlo
necesita una inspección de URL en Search Console, que esta sesión no tiene.

### D9 · Export de Cloudflare con sus filtros

`baseline.md` conserva agregados de Cloudflare con sus filtros de hostname,
ruta, referente, agente y parámetros marcados como **no preservados**.

El criterio de #47 exige separar *«los clics hacia la fuente oficial»* de *«las
visitas de página»*. Search Console **no mide `/r`**: mide la SERP de Google.
Sin el export de Cloudflare con sus filtros declarados, ese criterio no se
puede cumplir, y el plan lo deja explícitamente fuera de sus métricas.

### D10 · Volumen de mercado por consulta

Sin herramienta de keywords, el plan prioriza por volumen de página observado y
por riesgo de SERP (`research/es.md` §1.2 y §3). No hay ninguna fila ordenada
por demanda de mercado, y ninguna debe presentarse así.

### D11 · Quién actualiza esta evidencia y cada cuánto — sin dueño

**Es el que bloquea el plan entero.**

Los tres experimentos del plan (§9) comparan un corte por página contra otro
corte por página **de la misma longitud y con los mismos filtros**. El «antes»
existe y está versionado. El «después» **no tiene dueño, ni fecha, ni
procedimiento**.

Sin ese segundo corte, ninguno de los experimentos se puede leer, por bien
diseñado que esté. Es la segunda mitad de la pregunta original de #50, que
sigue sin respuesta.

## Efecto conjunto: qué se puede hacer y qué no

| Acción del plan | ¿Se puede ejecutar? | ¿Se puede medir? |
|---|---|---|
| P1 — recortar `description` largas | Sí, con spec aprobada | Sólo si se resuelve **D11** |
| P2 — diferenciar títulos | Sí, con spec aprobada | Sólo si se resuelve **D11** |
| P3 — guía de intención y enlazado | Sí, con spec aprobada | Los entrantes, sí, en el build. El efecto en búsqueda, **no** (D3) |
| P4/P5 — auditorías de SERP | Sí, no dependen de nada de esta lista | No aplica: producen evidencia |
| P6 — profundizar fichas | Sí, con spec aprobada | **No** de forma aislada (D3 + D11) |
| P7 — redirección `http` | **No.** Falta observar el estado real | Sí, en el corte siguiente |
| P8 — candidatas de CTR | Sí | **No** con el volumen actual (319 impresiones) |
| Criterio de #47 sobre páginas no indexadas | — | **No.** Falta **D6** |
| Criterio de #47 sobre clics a la fuente oficial | — | **No.** Falta **D9** |

## Preguntas concretas

Ordenadas por lo que desbloquean. Ninguna se puede responder leyendo más el
archivo que ya hay.

> **P-A (D11, bloqueante).** ¿Quién toma el corte «después», con qué
> periodicidad y en qué fecha? La propuesta del plan es: un corte de la tabla
> de páginas cada 28 días, tipo de búsqueda `Web`, sin filtros, versionado en
> `docs/mejora/evidencia/gsc-<fecha>/` con el procedimiento de
> `evidencias.md`. **Falta decidir quién lo ejecuta.** Sin esto, el plan se
> puede aprobar pero no se puede cerrar ningún experimento.
>
> **P-B (D6).** ¿Se puede exportar la lista de URLs no indexadas con su motivo,
> en particular las 3 de «Error de redirección» y las 4 de «Página con
> redirección»? Es lo único que permite evaluar el criterio de #47 sobre
> páginas no indexadas.
>
> **P-C (D7).** ¿Alguien con acceso a producción puede comprobar qué devuelve
> `http://fuenteai.com/es/lm-studio`? Basta el código de estado y la cabecera
> `Location`. Si ya redirige, D7 se cierra sin cambio; si no, entra como spec
> propia.
>
> **P-D (D1, D2, D3).** Sigue en pie la pregunta de #50: ¿se toma un export
> nuevo con el filtro de página `contiene /es/` —consultas, páginas y países
> sobre la misma ventana—, o se acepta formalmente que F7 mida a nivel de
> propiedad? El plan está escrito para funcionar en el segundo caso, con grupo
> de control; conviene que esa aceptación quede escrita en `decisiones.md` en
> lugar de quedar implícita.

## Qué NO se hizo mientras este blocker sigue abierto

- No se atribuyó ninguna consulta a ninguna ruta `/es/*`.
- No se extrapoló ni prorrateó la tabla de consultas truncada.
- No se dio tendencia a ninguna página.
- No se usó la tabla de países para cerrar el alcance geográfico de `es`.
- No se tocó `public/_redirects`, ni la configuración de la zona, ni ninguna
  ficha, título, `description`, ruta, `canonical` o `hreflang`.
- No se creó `docs/mejora/seguimiento.md`: es propiedad de F7 y este plan no
  escribe las conclusiones de esa fase.
- No se cerró #50 ni el blocker del que este deriva.
