# Blocker — el export de Search Console entregado no está segmentado por ruta

**Issue bloqueado:** [#47](https://github.com/Gunz-cop/DescargasIA/issues/47) — F7, medición postpublicación
**Blocker:** [#50](https://github.com/Gunz-cop/DescargasIA/issues/50) — **sigue abierto, ahora acotado**
**Fase:** F7 · afecta también a F2-ES ([#38](https://github.com/Gunz-cop/DescargasIA/issues/38)) y a F1
**Rama base:** `main`
**Rama de ingesta:** `codex/issue-50-gsc-ingesta`
**Commit base comprobado:** `17ea604`
**Fecha de comprobación:** 2026-08-28
**Estado:** PARCIALMENTE RESUELTO. Lo entregado se ingirió; lo que falta está abajo

## Qué dejó de estar bloqueado

El propietario entregó cuatro exports el 2026-08-28 y están ingeridos en
`docs/mejora/evidencia/gsc-2026-08-28/`. Con ellos ya existe:

- **volumen confirmado por página** para las 86 URLs `/es/*` que recibieron
  impresiones en el periodo (`docs/mejora/research/es.md` §4.2);
- **tendencia de propiedad**: serie diaria 2026-06-19 → 2026-08-26, 6.531
  impresiones y 47 clics;
- **estado de indexación**: 160 URLs indexadas y 90 no indexadas el 2026-08-20,
  con sus motivos;
- **periodo, propiedad, tipo de búsqueda y filtros verificados**, que la
  baseline anterior marcaba como «no preservados».

## Qué sigue bloqueado, y por qué no se puede resolver leyendo más el archivo

El export es un conjunto de **tablas agregadas por dimensión**, no un cubo
cruzado. Tiene consultas, y tiene páginas, pero no tiene consulta × página.
Ningún cálculo sobre estos CSV produce el cruce que falta: habría que
inventarlo.

| Falta | Qué impide | Por qué no se deduce |
|---|---|---|
| Consultas filtradas por página `/es/` | Decir «esta consulta trae impresiones a esta ficha». Sin esto, F3-ES sigue ordenando por riesgo observado en la SERP, no por demanda medida | La tabla de consultas es de propiedad completa (incluye `sv` e `it`) y además está truncada: 920 filas que suman 3.618 de las 6.531 impresiones |
| Cruce consulta × país, o página × país | Ratificar o rechazar el alcance multi-país de `es` (`decisiones.md`, decisión abierta) | La tabla de países es de propiedad completa. España con 1.879 impresiones no es «España en `/es/*`» |
| Serie temporal por URL | Que F7 mida el antes y el después de **una ficha**. Hoy solo puede medir la propiedad entera | La única serie diaria del export no está desglosada por página |
| Apariencia en búsquedas | Saber si alguna ficha aparece en un resultado enriquecido | El CSV `Aparición en búsquedas.csv` viene vacío, solo con cabecera |
| Enlaces externos | Cualquier lectura de autoridad o de enlazado entrante | `Latest links` viene vacío: cero filas |

## Por qué esto importa antes de F7 y no después

F7 compara a 14 y 28 días. Si el «antes» es un agregado de propiedad y el
«después» también, entonces una mejora en `es/perplexity` y un cambio de
estacionalidad en `sv` son indistinguibles en la misma cifra. Con 47 clics en
69 días, el ruido de propiedad es del mismo orden que cualquier efecto que F7
quiera detectar en una ficha.

## Pregunta concreta a Codex

> El export entregado el 2026-08-28 desbloquea volumen por página y tendencia
> de propiedad, pero no permite atribuir ninguna consulta a una ruta `/es/*` ni
> medir una ficha en el tiempo. ¿Qué se hace?
>
> **A. Un export nuevo con filtro aplicado en Search Console.** Tres cortes
> con el filtro de página `contiene /es/`: consultas, páginas y países, sobre
> la misma ventana. Es la opción que cierra las tres faltas de golpe y no
> requiere nada del repositorio. Requiere una acción manual del propietario en
> la interfaz de Search Console.
>
> **B. Un export por ventana, repetido.** Además del filtro de A, un corte
> mensual archivado con la misma estructura, para que F7 tenga serie por URL
> construida a partir de cortes sucesivos en vez de una serie diaria. Más
> trabajo recurrente y quién lo actualiza sigue sin dueño.
>
> **C. Acceso programático a la API de Search Console.** Resuelve todo de forma
> reproducible y elimina el trabajo manual, pero exige credenciales, decidir
> dónde viven y quién las rota. Es una decisión de infraestructura, no de F7.
>
> **D. Se acepta formalmente que F7 mida a nivel de propiedad** y que F2-ES y
> F3-ES sigan ordenando por riesgo observado. En ese caso hay que escribirlo en
> `decisiones.md` como límite aceptado, para que ninguna fase futura presente
> una comparación de propiedad como si fuera de ficha.

Sigue en pie la segunda mitad de la pregunta original de #50: **quién actualiza
esta evidencia y cada cuánto**. Hoy ninguna fase la posee; esta ingesta la
versiona pero no se asigna la actualización.

## Qué NO se hizo mientras el blocker sigue abierto

- No se atribuyó ninguna consulta a ninguna ruta `/es/*`.
- No se sumó, prorrateó ni extrapoló la tabla de consultas truncada.
- No se dio tendencia a ninguna página concreta.
- No se usó la tabla de países para cerrar el alcance geográfico de `es`.
- No se creó `docs/mejora/seguimiento.md`: es propiedad de F7 y esta ingesta no
  escribe las conclusiones de esa fase.
- No se cerró #50.
