# Blocker F5 — las guías publicadas no reciben ningún enlace contextual

**Issue bloqueado:** [#42](https://github.com/Gunz-cop/DescargasIA/issues/42) — SDD F5
**Blocker:** [#83](https://github.com/Gunz-cop/DescargasIA/issues/83)
**Fase:** F5 · común a `es`, `sv` e `it`
**Rama base:** `main`
**Rama de diagnóstico:** `codex/issue-42-f5-enlazado`
**Commit base comprobado:** `9e2d392`
**Fecha de comprobación:** 2026-08-28
**Estado:** RESUELTO el 2026-08-28 por la vía A, en F5.1 ([#85](https://github.com/Gunz-cop/DescargasIA/issues/85))

> **Resolución.** Codex aprobó la **vía A**: la ficha publica un bloque
> derivado con las guías de su idioma que ya la enlazan en su Markdown. No se
> tocó contenido de F4, ni el esquema de `guides`, ni el de `tools-base`, ni
> el campo `category`. Las cinco guías pasan de 1 a 3-4 enlaces entrantes.
> El diagnóstico de abajo se conserva tal cual: es la evidencia sobre la que
> se tomó la decisión. Ver `docs/enlazado-interno.md` §2 ("Descubrimiento de
> guías"), `docs/ux-tool-pages.md` §11 y `docs/mejora/decisiones.md`.

## Resumen

`#42` incluye en su alcance «cluster de herramientas locales cuando exista
evidencia» y «rutas y anclas canónicas, accesibles y descriptivas». La
evidencia para ese cluster existe y está aprobada. Lo que **no** existe es una
vía documentada para materializarlo: hoy ninguna ficha ni ninguna categoría
enlaza hacia una guía, y la única implementación posible exigiría tocar
`src/pages/[lang]/[slug].astro`, `src/utils/` y `src/i18n/ui.ts`, además de
añadir a la ficha un bloque que `docs/ux-tool-pages.md` no contempla.

La sesión **se detiene aquí** en vez de improvisar la UX. Esta parte de F5 queda
sin ejecutar; el resto de la fase sí se entrega.

## Puerta 1 — las guías son casi huérfanas, medido

Sobre el build de `origin/main@9e2d392` (`npm ci && npm run build`), contando
enlaces internos entrantes por ruta desde `dist/`:

```
/es/guias/descargar-chatgpt-para-windows   1 entrante  <- /es/guias
/sv/guias/ai-presentation-svenska          1 entrante  <- /sv/guias
/sv/guias/ai-skriva-text-svenska           1 entrante  <- /sv/guias
/sv/guias/ai-transkribering-svenska        1 entrante  <- /sv/guias
/sv/guias/kora-ai-lokalt                   1 entrante  <- /sv/guias
```

Comparación con el resto del sitio en el mismo build: las fichas reciben entre
4 y 26 enlaces entrantes (mediana 11). Las cinco guías reciben **1**.

`links:audit` no lo marca porque 1 entrante no es 0: la regla 3 de
`docs/enlazado-interno.md` prohíbe páginas indexables **huérfanas**, y estas no
lo son. Pero su único camino de entrada es el índice del idioma, y el índice
solo se enlaza desde la cabecera, que es boilerplate. Es exactamente el
problema que `docs/enlazado-interno.md` §2 describe y corrige para las fichas
(«el grafo anterior dejaba las fichas casi aisladas»), sin resolver para las
guías.

El flujo es además unidireccional: cada guía enlaza **hacia** fichas y
categorías —`/sv/guias/kora-ai-lokalt` enlaza `/sv/categoria/modelos-locales`,
`/sv/lm-studio`, `/sv/ollama` y `/sv/jan`—, y ninguna de ellas devuelve el
enlace.

## Puerta 2 — la evidencia del cluster local existe y está aprobada

No es una hipótesis de esta sesión:

- `docs/mejora/research/es.md` §3.5 y §3.6: el contenido español existente
  «enumera herramientas sin resolver la pregunta previa —qué modelo aguanta el
  equipo—». §4 fila 6 recomienda una guía de intención enlazada a la app de
  compatibilidad y a las fichas de `modelos-locales`.
- `docs/mejora/specs/es/F3-ES-lote-4-guia-ia-local.md` desarrolla esa fila y
  declara como enlaces internos `/es/puedo-correr-ia`,
  `/es/categoria/modelos-locales`, `/es/ollama` y `/es/lm-studio`, con la nota:
  «**Enlaces entrantes**: sin al menos uno, la guía sería una página huérfana y
  no debe publicarse».
- En sueco eso ya está publicado: `src/content/guides/sv/kora-ai-lokalt.md`
  (F4-SV, #43) es la guía del cluster local, y recibe 1 entrante.

Es decir: la spec española anticipó el problema y F4-SV lo produjo igualmente,
porque ninguna fase tenía la propiedad del enlace entrante.

## Puerta 3 — la relación es derivable, pero la implementación no está especificada

La relación guía↔ficha **no habría que inventarla**: el cuerpo Markdown de cada
guía ya declara a qué fichas y categorías apunta. Un helper podría invertir esos
enlaces y responder «qué guías de este idioma mencionan esta herramienta», con
la misma clase de evidencia que usa el resto de F5.

Lo que falta es la decisión de cómo materializarlo:

1. `docs/ux-tool-pages.md` enumera diez secciones de la ficha y **ninguna es un
   bloque de guías**. Añadirlo es una decisión de UX.
2. El bloque necesitaría un rótulo en `src/i18n/ui.ts` en los tres idiomas.
   Redactar copy sueco e italiano no es trabajo de una fase común.
3. `src/pages/[lang]/[slug].astro`, `src/utils/` y `src/i18n/` no figuran como
   propiedad de F5 en la matriz de `docs/mejora/decisiones.md`, que le asigna
   «archivos comunes y relaciones que su spec enumere» — y #42 no enumera
   ninguno de esos.
4. El frontmatter de `guides` (`src/content.config.ts`) tiene `category`, pero
   hoy las cinco guías lo rellenan con el literal `"guias"`, que **no** es una
   categoría del catálogo. No sirve como fuente de la relación sin cambiar
   contenido de F4, que está protegido.

Cualquiera de las cuatro es una decisión de arquitectura o de producto. La
sesión ejecutora no las toma.

## Pregunta concreta a Codex

> El descubrimiento de guías está roto en los tres productos: cada guía recibe
> un único enlace entrante, el de su índice. ¿Cuál de estas vías se aprueba, y
> como fase propia con issue y spec?
>
> **A. Bloque derivado en la ficha.** Un helper nuevo en `src/utils/` invierte
> los enlaces que el Markdown de cada guía ya declara y la ficha renderiza
> «guías que mencionan esta herramienta», con rótulo en los tres idiomas.
> Requiere ampliar `docs/ux-tool-pages.md`. Cero contenido inventado.
>
> **B. Enlace desde la página de categoría.** La categoría lista las guías del
> idioma relacionadas con ella. Requiere una fuente de la relación: dar un
> significado real al campo `category` del frontmatter de `guides`, lo que
> obliga a editar las cinco guías ya publicadas (contenido de F4).
>
> **C. Relación declarada en el frontmatter de la guía.** Añadir al esquema un
> campo de slugs de herramienta y renderizarlo en los dos sentidos. Es el
> equivalente de `alternatives` para guías, pero cambia `src/content.config.ts`
> y el contenido de F4.
>
> **D. Se acepta el estado actual** y las guías viven con un solo enlace
> entrante. En ese caso conviene registrarlo en `docs/enlazado-interno.md` §8
> como pendiente aceptado, para que ninguna fase futura lo trate como bug.

## Qué NO se hizo mientras el blocker está abierto

- No se creó ningún helper ni ningún bloque nuevo en la ficha.
- No se tocó `src/pages/`, `src/utils/`, `src/i18n/` ni `src/content.config.ts`.
- No se editó ninguna guía ni ningún JSON localizado.
- No se escribió la guía española de `F3-ES-lote-4-guia-ia-local.md`, que
  además sigue marcada **BLOQUEADA** por su propia spec.

## Nota adicional detectada al comprobar este blocker

`docs/mejora/specs/es/F3-ES-lote-4-guia-ia-local.md` está **desactualizada**: su
primera condición de bloqueo es «no existe `src/pages/[lang]/guias/[slug].astro`»,
y esa ruta existe desde el PR #78. Sus criterios de aceptación automáticos, que
comprueban precisamente la ausencia de la ruta, ya no pasan. Corregir esa spec
es de F3-ES; F5 no la edita, solo lo señala.
