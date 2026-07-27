# UX Home Cards

Guia para mantener consistente la presentacion de herramientas en la home de DescargasIA.

## Intencion

La home funciona como un buscador editorial de descargas oficiales de IA. Las tarjetas no deben sentirse como mini articulos ni como fichas tecnicas completas. Deben comportarse como resultados escaneables: el usuario identifica la herramienta, valida que el enlace es oficial y decide si quiere ver la ficha o salir al canal oficial.

## Principios

- Priorizar reconocimiento rapido sobre densidad informativa.
- El nombre de la herramienta es el ancla principal.
- La accion primaria es ir al canal oficial; la ficha es accion secundaria.
- La confianza debe verse sin exigir lectura profunda: dominio, canal oficial, revision y advertencias.
- La UI no debe sugerir afiliacion, patrocinio o endorsement de las marcas listadas.

## Estructura De La Tarjeta

`src/components/ToolCard.astro` renderiza **un solo arbol DOM** para todos los
tamanos. Orden, de arriba a abajo:

1. Avatar y nombre de la herramienta.
2. One-liner de 2 lineas con altura minima, para que el pie de todas las
   tarjetas de una fila quede alineado.
3. Pie **en columna**: dominio oficial y, si hay dato, badge. Nunca en fila con
   `space-between`: a 253px de columna parte ambos textos.

El dominio es la prueba de confianza y por eso no se trunca ni se parte
(`white-space: nowrap`).

El badge `nueva para ti` / `ya la conocias` depende del campo `knownBy` del §4
del brief, que el catalogo todavia no tiene. Mientras no exista, la tarjeta no
pinta badge.

## Identidad Visual

- Usar monogramas propios, no logos oficiales, salvo que exista una politica explicita de assets por marca.
- Se permiten colores inspirados por producto para ayudar al escaneo.
- Evitar reproducir logos, lockups, iconos oficiales o combinaciones visuales exactas que puedan parecer afiliacion.
- Si se incorporan logos en el futuro, deben ser assets curados localmente, con fuente y reglas de uso documentadas.

### Color

El avatar solo tiene dos estados, definidos en CSS: `.fai-avatar--find`
(gradiente teal, hallazgo) y `.fai-avatar--known` (`--fai-deep`). No hay mapa
de color por herramienta: la direccion "Senal nocturna" no lo usa. Los chips de
necesidad si llevan el `tone` de su categoria, definido en `src/utils/brand.ts`.

## Al Agregar Una Nueva Herramienta

1. Confirmar que el enlace apunta al dominio oficial o tienda oficial.
2. Definir categoria principal y plataformas reales.
3. Revisar que `shortDescription` se entienda en 1-2 lineas.
4. Agregar advertencias solo si ayudan a evitar clones, mirrors o instaladores falsos.
5. No hay color propio por marca: el avatar usa los dos estados del sistema.
6. Verificar mobile primero: nombre reconocible, CTA claro y dominio visible.
7. Ejecutar `npm run build` antes de publicar.
