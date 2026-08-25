import type { APIRoute } from 'astro';
import { CATEGORIES, type Lang } from '../../utils/brand';
import { LANGS, homeUrl, toolUrl, categoryUrl } from '../../utils/links';
import { getTranslatedTools } from '../../utils/tools';
import {
  categoryToMarkdown,
  homeToMarkdown,
  markdownPathFor,
  toolToMarkdown
} from '../../utils/agent-content';

/**
 * Espejo en Markdown de las páginas del sitio.
 *
 * Existe para dos cosas:
 *  - servir la negociación de contenido: el Worker traduce
 *    `GET /es/chatgpt` con `Accept: text/markdown` a `/md/es/chatgpt.md`;
 *  - dar una URL estable a agentes que prefieran pedir el Markdown directo.
 *
 * No es contenido nuevo: es la misma ficha sin el shell HTML, marcada
 * `noindex` en `public/_headers` para que no compita con su canonical.
 *
 * El nombre del archivo lo calcula `markdownPathFor()`, la misma función que
 * usa el Worker: si el patrón de URLs cambia, ambos lados cambian juntos.
 */

/** `/md/es/chatgpt.md` -> `es/chatgpt.md`, que es el valor del rest param. */
const paramFor = (route: string) => markdownPathFor(route).replace(/^\/md\//, '');

export async function getStaticPaths() {
  const entries: Array<{ params: { path: string }; props: { body: string } }> = [];

  for (const lang of LANGS as Lang[]) {
    entries.push({
      params: { path: paramFor(homeUrl(lang)) },
      props: { body: await homeToMarkdown(lang) }
    });

    for (const tool of await getTranslatedTools(lang)) {
      entries.push({
        params: { path: paramFor(toolUrl(lang, tool.slug)) },
        props: { body: toolToMarkdown(tool, lang) }
      });
    }

    for (const category of CATEGORIES) {
      const body = await categoryToMarkdown(lang, category.slug);
      if (!body) continue;
      entries.push({
        params: { path: paramFor(categoryUrl(lang, category.slug)) },
        props: { body }
      });
    }
  }

  return entries;
}

export const GET: APIRoute = ({ props }) =>
  new Response((props as { body: string }).body, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' }
  });
