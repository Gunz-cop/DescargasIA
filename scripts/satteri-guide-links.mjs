/**
 * Plugin hast para el HTML que Astro genera a partir del Markdown de las guías
 * (`src/content/guides/<lang>/<slug>.md`).
 *
 * Por qué existe: el cuerpo de una guía es Markdown, así que no puede llamar a
 * los helpers de `src/utils/links.ts` ni escribir atributos en un enlace. Pero
 * la regla 7 de `docs/enlazado-interno.md` no admite excepciones: TODO enlace
 * al interstitial `/r` sale con `rel="nofollow"`, y `links:audit` falla si no.
 * Este plugin lo aplica sobre el árbol ya renderizado, así que la regla se
 * cumple sin depender de que quien escriba la guía se acuerde.
 *
 * No reescribe destinos ni inventa enlaces: solo añade el `rel`.
 *
 * Se engancha al procesador Sätteri (el de Astro 7 por defecto) vía
 * `markdown.processor` en `astro.config.mjs`.
 */

/** ¿Es este href el interstitial de salida? `/r`, `/r?...` o `/r#...`. */
export function isInterstitial(href) {
  return typeof href === 'string' && /^\/r(\?|#|$)/.test(href);
}

/** Plugin hast de Sätteri: visita solo los `<a>` y marca los que van a /r. */
export const guideLinkRel = {
  name: 'fuenteai-guide-link-rel',
  element: {
    filter: ['a'],
    visit(node, ctx) {
      if (isInterstitial(node.properties?.href)) {
        ctx.setProperty(node, 'rel', 'nofollow noopener noreferrer');
      }
    }
  }
};

export default guideLinkRel;
