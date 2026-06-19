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

## Mobile

- Usar formato de resultado de busqueda.
- Mostrar monograma grande, nombre grande y dominio oficial visible.
- Limitar la descripcion a 2 lineas.
- Mostrar pocos metadatos: categoria, confianza y resumen de plataformas.
- Usar CTA primario `Descarga oficial` y CTA secundario `Ficha`.
- Evitar bloques largos de advertencias; si existen, deben vivir en la ficha o en la pantalla intermedia `/ir/`.

## Desktop

- Mantener tarjetas editoriales completas, pero con una jerarquia clara.
- El monograma y el nombre deben aparecer antes de badges/metadatos.
- Los nombres de herramientas deben arrancar a la misma altura visual.
- Los badges van debajo del nombre, no encima.
- Dominio oficial, advertencia y plataformas pueden mostrarse porque hay mas espacio.
- Mantener botones finales: `Ver ficha` y `Ir al canal oficial`.

## Identidad Visual

- Usar monogramas propios, no logos oficiales, salvo que exista una politica explicita de assets por marca.
- Se permiten colores inspirados por producto para ayudar al escaneo.
- Evitar reproducir logos, lockups, iconos oficiales o combinaciones visuales exactas que puedan parecer afiliacion.
- Si se incorporan logos en el futuro, deben ser assets curados localmente, con fuente y reglas de uso documentadas.

## Al Agregar Una Nueva Herramienta

1. Confirmar que el enlace apunta al dominio oficial o tienda oficial.
2. Definir categoria principal y plataformas reales.
3. Revisar que `shortDescription` se entienda en 1-2 lineas.
4. Agregar advertencias solo si ayudan a evitar clones, mirrors o instaladores falsos.
5. Si la marca necesita reconocimiento visual especial, agregar una entrada en `visualStyles` dentro de `src/components/ToolCard.astro`.
6. Verificar mobile primero: nombre reconocible, CTA claro y dominio visible.
7. Ejecutar `npm run build` antes de publicar.
