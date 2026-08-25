/**
 * Punto de entrada único de todo lo que este sitio expone a agentes de IA.
 *
 * Está aislado en un módulo, y no repartido por `worker/index.ts`, para que
 * integrarlo en un Worker que ya existe —el de la app de hardware, con sus
 * rutas `/api/hw/*`— sea añadir dos líneas a su router en vez de fusionar dos
 * ficheros que hacen cosas distintas:
 *
 *     const agent = await tryAgentRoutes(request, env);
 *     if (agent) return agent;
 *
 * Devuelve `null` cuando la petición no es cosa suya, así que el router que lo
 * llama sigue decidiendo todo lo demás. Ver `docs/agent-readiness.md`.
 */
import { handleA2a } from './a2a';
import { handleMcp } from './mcp';
import { prefersMarkdown, serveMarkdown } from './markdown';
import type { AgentEnv } from './types';

export type { AgentEnv } from './types';

/**
 * Resuelve la petición si le corresponde a la capa de agentes.
 *
 * @returns la respuesta, o `null` si esta petición no es para agentes.
 */
export async function tryAgentRoutes(request: Request, env: AgentEnv): Promise<Response | null> {
  const { pathname } = new URL(request.url);

  if (pathname === '/mcp') return handleMcp(request, env);
  if (pathname === '/a2a') return handleA2a(request, env);

  // Negociación de contenido sobre una página normal. Si esa página no tiene
  // espejo Markdown, `serveMarkdown` devuelve null y se sirve el HTML.
  if ((request.method === 'GET' || request.method === 'HEAD') && prefersMarkdown(request)) {
    return serveMarkdown(request, env);
  }

  return null;
}

/**
 * ¿Puede esta petición devolver Markdown o HTML según `Accept`?
 *
 * El router que sirva los assets debe añadir `Vary: Accept` a esas respuestas,
 * o una caché intermedia acabará sirviéndole Markdown a un navegador.
 */
export function variesByAccept(request: Request): boolean {
  return request.method === 'GET' || request.method === 'HEAD';
}
