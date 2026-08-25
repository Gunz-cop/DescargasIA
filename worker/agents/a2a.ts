/**
 * Agente A2A sobre el catálogo de FuenteAI.
 *
 * Síncrono a propósito: solo `message/send`, sin streaming ni tareas de larga
 * duración, que es exactamente lo que declara `/.well-known/agent-card.json`.
 *
 * Ver `docs/agent-readiness.md`.
 */
import { loadCatalog, rankCatalog, describeTool, ORIGIN } from './catalog.ts';
import {
  checkOrigin,
  corsHeaders,
  forbiddenOrigin,
  JsonBodyError,
  jsonResponse,
  readJsonBody,
  rpcError,
  rpcResult
} from './http.ts';
import type { AgentEnv } from './types.ts';

/** Texto plano de un `Message` A2A, concatenando sus partes de texto. */
function a2aMessageText(message: Record<string, unknown> | undefined): string {
  const parts = (message?.parts ?? []) as Array<Record<string, unknown>>;
  return parts
    .filter((part) => part.kind === 'text' || part.type === 'text')
    .map((part) => String(part.text ?? ''))
    .join(' ')
    .trim();
}

const a2aTextMessage = (text: string, contextId?: string) => ({
  kind: 'message',
  role: 'agent',
  messageId: crypto.randomUUID(),
  ...(contextId ? { contextId } : {}),
  parts: [{ kind: 'text', text }]
});

export async function handleA2a(request: Request, env: AgentEnv): Promise<Response> {
  // Misma política de origen que MCP: el agente A2A es un endpoint público
  // para clientes que no son navegadores. Ver ./http.ts.
  const origin = checkOrigin(request);
  if (!origin.allowed) return forbiddenOrigin(origin);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }
  if (request.method !== 'POST') {
    return new Response(JSON.stringify(rpcError(null, -32000, 'Este endpoint A2A solo acepta POST.')), {
      status: 405,
      headers: { 'Content-Type': 'application/json', Allow: 'POST, OPTIONS', ...corsHeaders(origin) }
    });
  }

  let payload: Record<string, unknown>;
  try {
    const parsed = await readJsonBody(request);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return jsonResponse(rpcError(null, -32600, 'Mensaje JSON-RPC inválido'), origin, 400);
    }
    payload = parsed as Record<string, unknown>;
  } catch (error) {
    if (error instanceof JsonBodyError) {
      return jsonResponse(rpcError(null, error.rpcCode, error.message), origin, error.status);
    }
    throw error;
  }

  if (payload.jsonrpc !== '2.0' || typeof payload.method !== 'string') {
    return jsonResponse(rpcError(payload.id ?? null, -32600, 'Mensaje JSON-RPC inválido'), origin, 400);
  }

  const id = payload.id ?? null;
  const method = String(payload.method ?? '');
  const params = (payload.params ?? {}) as Record<string, unknown>;

  if (method !== 'message/send') {
    return jsonResponse(
      rpcError(
        id,
        -32601,
        `Este agente solo implementa "message/send" (recibido: "${method}"). Responde de forma síncrona, sin tareas de larga duración.`
      ),
      origin
    );
  }

  const incoming = params.message as Record<string, unknown> | undefined;
  const query = a2aMessageText(incoming);
  const contextId = incoming?.contextId ? String(incoming.contextId) : undefined;

  if (!query) {
    return jsonResponse(
      rpcResult(
        id,
        a2aTextMessage(
          'Envía en el mensaje qué herramienta de IA buscas y respondo con las fichas del catálogo y sus canales oficiales de descarga.',
          contextId
        )
      ),
      origin
    );
  }

  // Si el catálogo no se puede leer, el agente responde que no puede en vez de
  // dejar escapar la excepción: el error tiene que llegar como respuesta
  // JSON-RPC, no como un 500 sin cuerpo.
  let catalog;
  try {
    catalog = await loadCatalog(env);
  } catch (error) {
    return jsonResponse(
      rpcError(id, -32603, `No se pudo leer el catálogo: ${(error as Error).message}`),
      origin
    );
  }

  const results = rankCatalog(catalog, { query, limit: 5 });
  const text =
    results.length === 0
      ? `No encontré nada para "${query}" en el catálogo de FuenteAI (${catalog.count} fichas). El catálogo completo está en ${ORIGIN}/api/catalog.json.`
      : `Esto es lo que tiene FuenteAI para "${query}". FuenteAI no aloja archivos: cada enlace es del desarrollador.\n\n` +
        results.map(describeTool).join('\n\n');

  return jsonResponse(rpcResult(id, a2aTextMessage(text, contextId)), origin);
}
