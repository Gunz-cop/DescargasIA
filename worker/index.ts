/**
 * Worker delante de los assets estáticos.
 *
 * El sitio sigue siendo un build estático de Astro: este Worker no renderiza
 * páginas. Solo existe para lo que un archivo estático no puede hacer, y todo
 * eso vive en `worker/agents/`: MCP en `/mcp`, A2A en `/a2a` y la negociación
 * `Accept: text/markdown`.
 *
 * Cualquier otra cosa —y cualquier excepción— cae a `env.ASSETS.fetch()`: un
 * fallo en el código de agentes no puede tumbar la web para personas.
 *
 * NOTA DE INTEGRACIÓN. La rama de la app de hardware tiene su propio
 * `worker/index.ts` con las rutas `/api/hw/*`, sus bindings (`AI`, `HW_CACHE`)
 * y su `security.ts`. Este archivo NO se fusiona con aquel: se descarta, y en
 * el router que sobreviva se añaden las dos líneas de `tryAgentRoutes` más el
 * `Vary: Accept`. Todo lo demás de esta capa vive en `worker/agents/`, que no
 * toca ningún fichero suyo. Ver `docs/agent-readiness.md`.
 */
import { tryAgentRoutes, variesByAccept, type AgentEnv } from './agents';

type Env = AgentEnv;

async function route(request: Request, env: Env): Promise<Response> {
  const agent = await tryAgentRoutes(request, env);
  if (agent) return agent;

  const response = await env.ASSETS.fetch(request);

  // La misma URL puede devolver HTML o Markdown según `Accept`: sin este Vary
  // una caché intermedia podría servirle Markdown a un navegador.
  if (variesByAccept(request)) {
    const headers = new Headers(response.headers);
    headers.append('Vary', 'Accept');
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  }
  return response;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      return await route(request, env);
    } catch (error) {
      console.error('worker error', error);

      // La red de seguridad NO puede reintentar con una petición cuyo cuerpo ya
      // se consumió: `env.ASSETS.fetch(request)` lanza entonces
      // "Cannot reconstruct a Request with a used body" y convierte un error
      // manejable en un 500 sin cuerpo. Los endpoints de agentes son POST y ya
      // han leído el suyo, así que ahí se responde un error JSON-RPC en condiciones.
      const { pathname } = new URL(request.url);
      if (pathname === '/mcp' || pathname === '/a2a') {
        return new Response(
          JSON.stringify({
            jsonrpc: '2.0',
            id: null,
            error: { code: -32603, message: 'Error interno del servidor.' }
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Para el resto (GET/HEAD del sitio) el cuerpo nunca se tocó: se puede
      // reintentar y servir la web como si nada hubiera pasado.
      return env.ASSETS.fetch(request);
    }
  }
};
