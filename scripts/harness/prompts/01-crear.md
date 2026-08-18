Vas a crear una ficha nueva del catálogo de FuenteAI/DescargasIA, sin intervención
humana, dentro de un runner de CI. Trabajás en el repo ya clonado, en el working
directory actual.

## Encargo

- Herramienta a fichar: **{{HERRAMIENTA}}**
- Idioma editorial: **{{LANG}}**
- Slug sugerido (vacío = decidilo vos, en kebab-case, a partir del nombre oficial): **{{SLUG}}**

## Cómo trabajar

Usá la skill `/descargasia-tool-ficha` y seguila entera: leé `AGENTS.md`,
`src/content.config.ts` (es la fuente de verdad del schema), 2-3 fichas maduras de
ejemplo, y las referencias de la skill que correspondan a cada etapa.

Verificá cada URL con WebSearch/WebFetch antes de escribirla. No inventes IDs de
App Store, paquetes de Play, ni fuentes. Si no podés confirmar una plataforma,
omitila — es preferible una plataforma de menos que un enlace falso.

## Restricciones propias de este entorno

- **No levantes el servidor de desarrollo** (`astro dev` / `npm run dev`) ni
  intentes previsualizar: no hay navegador acá. La validación visual la hace un
  humano después, revisando el pull request.
- Para el build usá `npm run build:no-shorten`. Nunca `npm run build` a secas: el
  shortener de enlaces necesita credenciales que este runner no tiene.
- **Escribí sólo el idioma pedido.** Los archivos de esta corrida son
  `src/content/tools-base/<slug>.json` y `src/content/tools/{{LANG}}/<slug>.json`,
  y ninguno más. Aunque veas que la ficha existe en otro idioma y notes que está
  desactualizada, no lo toques: ese es otro trabajo, con su propio pedido y su
  propia revisión. Anotalo en `notas` y seguí.
- Tocá únicamente archivos bajo `src/content/`. No modifiques componentes,
  layouts, configuración, scripts, workflows ni las skills.
- Si algo del encargo es imposible de verificar, escribí la ficha sin ese dato y
  dejalo anotado en el campo `notas` de tu salida estructurada. No rellenes.

## Salida

Cuando termines, además de los archivos, devolvé la salida estructurada que te
pide el esquema: el `slug` final, el nombre oficial, la categoría elegida, y en
`notas` todo lo que no pudiste verificar o decidiste omitir.
