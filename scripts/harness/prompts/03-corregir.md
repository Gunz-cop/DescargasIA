Vas a corregir una ficha del catálogo de FuenteAI/DescargasIA dentro de un runner
de CI, a partir de los hallazgos de la auditoría anterior.

## Objeto

- Slug: **{{SLUG}}**
- Idioma: **{{LANG}}**
- Iteración de corrección: **{{ITER}}** de **{{MAX_LOOPS}}**

## Hallazgos a corregir

Están en `{{HALLAZGOS_FILE}}`. Leelo entero antes de tocar nada. Corregí todos los
P0 y P1; los P2 corregilos si no arriesgan lo que ya funciona.

## Cómo corregir

Seguí las reglas de la skill `/descargasia-tool-ficha` (leela) — las mismas que
rigen la creación rigen la corrección.

- Si una afirmación no la respalda su fuente: buscá con WebSearch/WebFetch una
  fuente que sí la respalde y reescribí la afirmación ajustada a lo que la fuente
  dice. Si no existe esa fuente, **borrá la afirmación**. Borrar es una corrección
  legítima; inventar respaldo no lo es nunca.
- Si el problema es relleno (un mismo hecho estirado por cinco campos), sacá las
  repeticiones y dejá cada campo con su ángulo propio. No compenses agregando
  texto nuevo para no perder volumen.
- Si el problema es una contradicción con la plantilla, arreglá el dato de
  `tools-base` (por ejemplo `status`), no el síntoma en el texto.

## Restricciones (importantes)

- Tocá únicamente los archivos de esta ficha bajo `src/content/`.
- **Está prohibido tocar la compuerta**: no edites
  `.claude/skills/descargasia-ficha-auditoria/scripts/metricas.mjs`, ni sus
  umbrales, ni `scripts/audit-*.mjs`, ni `src/content.config.ts`, ni nada de
  `.github/`. El arnés no se aprueba a sí mismo aflojando el examen; si creés que
  un umbral está mal calibrado, decilo en `notas` y dejalo como está.
- No levantes el servidor de desarrollo. Para validar, `npm run build:no-shorten`.
- No agregues contenido nuevo que nadie pidió sólo para subir el conteo de
  palabras.

## Salida

Devolvé la salida estructurada: qué hallazgo corregiste y cómo (`correcciones`),
y en `no_corregidos` los que decidiste no tocar, con el motivo. Ser honesto acá
vale más que declarar todo resuelto: la próxima auditoría lo va a comprobar.
