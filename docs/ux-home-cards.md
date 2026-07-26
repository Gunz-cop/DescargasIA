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

## Estructura Unica Responsive

`src/components/ToolCard.astro` renderiza **un solo arbol DOM** para todos los
tamanos de pantalla. No duplicar bloques mobile/desktop: el orden de lectura es
el mismo en ambos y el layout se adapta con la rejilla contenedora.

Orden de la tarjeta, de arriba a abajo:

1. Monograma + nombre (enlace a la ficha) + dominio oficial con marca de verificacion.
2. Descripcion corta, maximo 3 lineas (`line-clamp-3`).
3. Metadatos en una linea: categoria principal y modelo de precios.
4. Plataformas disponibles en monoespaciada.
5. Acciones: `Ir al canal oficial` (primaria, tono ambar suave) y `Ver ficha` (secundaria, fantasma).

La accion primaria usa estilo tenue a proposito: con 26 tarjetas en pantalla, un
boton solido por tarjeta convierte la rejilla en un muro de color y destruye la
jerarquia. El relleno solido queda reservado para los CTA de decision (hero y
ficha de herramienta).

## Identidad Visual

- Usar monogramas propios, no logos oficiales, salvo que exista una politica explicita de assets por marca.
- Se permiten colores inspirados por producto para ayudar al escaneo.
- Evitar reproducir logos, lockups, iconos oficiales o combinaciones visuales exactas que puedan parecer afiliacion.
- Si se incorporan logos en el futuro, deben ser assets curados localmente, con fuente y reglas de uso documentadas.

### Como se define el color de una herramienta

Existe **un unico mapa**: `TOOL_TONES` en `src/utils/brand.ts`. Cada herramienta
declara un solo color hexadecimal. El CSS (`.monogram`, `.tone-rule` en
`src/styles/global.css`) deriva fondo, borde y texto desde ese tono con
`color-mix()`, por lo que funciona en tema claro y oscuro sin escribir clases
duplicadas. Si una herramienta no tiene tono propio, se hereda el de su categoria.

No volver a crear mapas paralelos de clases Tailwind por herramienta.

## Al Agregar Una Nueva Herramienta

1. Confirmar que el enlace apunta al dominio oficial o tienda oficial.
2. Definir categoria principal y plataformas reales.
3. Revisar que `shortDescription` se entienda en 1-2 lineas.
4. Agregar advertencias solo si ayudan a evitar clones, mirrors o instaladores falsos.
5. Si la marca necesita reconocimiento visual especial, agregar una entrada en `TOOL_TONES` dentro de `src/utils/brand.ts` (un solo color).
6. Verificar mobile primero: nombre reconocible, CTA claro y dominio visible.
7. Ejecutar `npm run build` antes de publicar.
