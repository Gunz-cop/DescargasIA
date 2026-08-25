/**
 * Negociación de contenido: `Accept: text/markdown` sobre una página normal
 * devuelve su espejo Markdown generado en build.
 *
 * Ver `docs/agent-readiness.md`.
 */
import type { AgentEnv } from './types.ts';

/**
 * `/es/chatgpt` -> `/md/es/chatgpt.md`, `/` -> `/md/index.md`.
 * Gemela de `markdownPathFor()` en `src/utils/agent-content.ts`, que es la que
 * decide el nombre del archivo generado en build.
 */
export function markdownPathFor(pathname: string): string {
  const clean = pathname.replace(/\/+$/, '');
  return clean === '' ? '/md/index.md' : `/md${clean}.md`;
}

export function prefersMarkdown(request: Request): boolean {
  const accept = request.headers.get('accept');
  return Boolean(accept && accept.toLowerCase().includes('text/markdown'));
}

export async function serveMarkdown(request: Request, env: AgentEnv): Promise<Response | null> {
  const url = new URL(request.url);
  const target = new URL(markdownPathFor(url.pathname), url.origin);
  const response = await env.ASSETS.fetch(new Request(target));
  if (!response.ok) return null; // La página no tiene espejo: se sirve el HTML.

  const headers = new Headers(response.headers);
  headers.set('Content-Type', 'text/markdown; charset=utf-8');
  // El asset de /md/** va marcado noindex para no competir con el canonical,
  // pero ESTA URL si es indexable: la cabecera no debe viajar con ella.
  headers.delete('X-Robots-Tag');
  // La representación canónica sigue siendo el HTML de esta misma URL.
  headers.set('Link', `<${url.origin}${url.pathname}>; rel="canonical"`);
  headers.set('Vary', 'Accept');
  return new Response(response.body, { status: 200, headers });
}
