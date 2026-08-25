/**
 * Punto de entrada único de todo lo que este sitio expone a agentes de IA.
 *
 * Está aislado en un módulo, y no repartido por `worker/index.ts`, para que
 * convivir con el Worker de la app de hardware (`/api/hw/*`) sea añadir dos
 * líneas a su router en vez de fusionar dos ficheros que hacen cosas distintas:
 *
 *     const agent = await tryAgentRoutes(request, env);
 *     if (agent) return agent;
 *
 * Devuelve `null` cuando la petición no es cosa suya, así que el router que lo
 * llama sigue decidiendo todo lo demás. Ver `docs/agent-readiness.md`.
 */
import { handleA2a } from './a2a.ts';
import { handleMcp } from './mcp.ts';
import { prefersMarkdown, serveMarkdown } from './markdown.ts';
import type { AgentEnv } from './types.ts';

export type { AgentEnv } from './types.ts';

/** Rutas POST de esta capa. Su cuerpo se consume al atenderlas. */
const RPC_ROUTES = new Set(['/mcp', '/a2a']);

/**
 * Error interno como respuesta JSON-RPC.
 *
 * Existe porque la red de seguridad del Worker anfitrión NO puede reintentar
 * con `env.ASSETS.fetch(request)` una petición cuyo cuerpo ya se consumió: eso
 * lanza "Cannot reconstruct a Request with a used body" y convierte un error
 * manejable en un 500 sin cuerpo. La contención vive aquí, dentro del módulo
 * que consume el cuerpo, para que ningún router que nos integre tenga que
 * saberlo ni acordarse de replicarlo.
 */
function internalError(): Response {
  return new Response(
    JSON.stringify({
      jsonrpc: '2.0',
      id: null,
      error: { code: -32603, message: 'Error interno del servidor.' }
    }),
    { status: 500, headers: { 'Content-Type': 'application/json' } }
  );
}

/**
 * Resuelve la petición si le corresponde a la capa de agentes.
 *
 * Nunca lanza: los fallos de `/mcp` y `/a2a` salen como error JSON-RPC, y los
 * de la negociación de contenido devuelven `null` para que se sirva el HTML.
 *
 * @returns la respuesta, o `null` si esta petición no es para agentes.
 */
export async function tryAgentRoutes(request: Request, env: AgentEnv): Promise<Response | null> {
  const { pathname } = new URL(request.url);

  if (RPC_ROUTES.has(pathname)) {
    try {
      return pathname === '/mcp' ? await handleMcp(request, env) : await handleA2a(request, env);
    } catch (error) {
      console.error('agent rpc error', pathname, error);
      return internalError();
    }
  }

  // Negociación de contenido sobre una página normal. Si esa página no tiene
  // espejo Markdown —o si algo falla al buscarlo— se devuelve null y el router
  // sirve el HTML de siempre. Es un GET: el cuerpo nunca se tocó, así que
  // reintentar contra los assets es seguro.
  if ((request.method === 'GET' || request.method === 'HEAD') && prefersMarkdown(request)) {
    try {
      return await serveMarkdown(request, env);
    } catch (error) {
      console.error('agent markdown error', pathname, error);
      return null;
    }
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
