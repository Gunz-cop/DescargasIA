/**
 * Política de origen y CORS para los endpoints de agentes (`/mcp`, `/a2a`).
 *
 * La spec de MCP Streamable HTTP obliga a validar `Origin` en toda conexión
 * para prevenir DNS rebinding: una página maliciosa abierta en el navegador de
 * la víctima haciendo POST contra el servidor.
 * https://modelcontextprotocol.io/specification/2025-06-18/basic/transports
 *
 * Pero la política NO puede ser la de `worker/security.ts` (exigir que `Origin`
 * sea el propio sitio), porque los clientes MCP reales —Claude Desktop, los
 * conectores de ChatGPT, un script— **no son navegadores y no envían `Origin`
 * en absoluto**. Exigirlo bloquearía a todos los clientes legítimos y dejaría
 * pasar exactamente a nadie.
 *
 * La regla correcta para un servidor remoto, público y de solo lectura:
 *
 *   sin `Origin`            -> permitir. Es el cliente MCP normal.
 *   `Origin` == este sitio  -> permitir, y devolver ese origen en CORS.
 *   cualquier otro `Origin` -> 403, y NO devolver `Access-Control-Allow-Origin`.
 *
 * Es decir: el navegador ajeno queda fuera, que es de lo que protege la spec,
 * sin romper al cliente que no es un navegador.
 */

export type OriginDecision =
  | { allowed: true; origin: string | null }
  | { allowed: false; origin: string };

export function checkOrigin(request: Request): OriginDecision {
  const origin = request.headers.get('origin');
  if (!origin) return { allowed: true, origin: null };

  const siteOrigin = new URL(request.url).origin;
  if (origin === siteOrigin) return { allowed: true, origin };

  return { allowed: false, origin };
}

/**
 * Cabeceras CORS de la respuesta.
 *
 * Solo se emite `Access-Control-Allow-Origin` cuando la petición traía un
 * `Origin` permitido, y se emite **ese** origen, nunca `*`: un comodín aquí
 * autorizaría a cualquier página a leer la respuesta desde el navegador de un
 * tercero, que es justo lo que la validación pretende impedir.
 *
 * `Vary: Origin` es obligatorio en cuanto la respuesta depende del origen.
 */
export function corsHeaders(decision: OriginDecision): Record<string, string> {
  const base: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept, Mcp-Protocol-Version, Mcp-Session-Id',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin'
  };
  if (decision.allowed && decision.origin) {
    base['Access-Control-Allow-Origin'] = decision.origin;
  }
  return base;
}

/** Respuesta JSON con las cabeceras CORS que correspondan. */
export function jsonResponse(body: unknown, decision: OriginDecision, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(decision) }
  });
}

/** 403 para un `Origin` de navegador ajeno. Sin CORS: el navegador no debe poder leerlo. */
export function forbiddenOrigin(decision: OriginDecision): Response {
  return new Response(
    JSON.stringify({
      jsonrpc: '2.0',
      id: null,
      error: {
        code: -32000,
        message:
          'Origin no permitido. Este endpoint solo acepta peticiones sin Origin (clientes que no son navegadores) o desde el propio sitio.'
      }
    }),
    { status: 403, headers: { 'Content-Type': 'application/json', Vary: 'Origin' } }
  );
}

export const rpcResult = (id: unknown, result: unknown) => ({ jsonrpc: '2.0', id, result });

export const rpcError = (id: unknown, code: number, message: string) => ({
  jsonrpc: '2.0',
  id,
  error: { code, message }
});

/** Límite defensivo para mensajes JSON-RPC públicos. */
export const MAX_JSON_BODY_BYTES = 64 * 1024;

export class JsonBodyError extends Error {
  readonly status: 400 | 413 | 415;
  readonly rpcCode: number;

  constructor(message: string, status: 400 | 413 | 415, rpcCode: number) {
    super(message);
    this.name = 'JsonBodyError';
    this.status = status;
    this.rpcCode = rpcCode;
  }
}

/**
 * Lee un cuerpo JSON sin permitir que una petición pública consuma memoria de
 * forma ilimitada. Content-Length permite rechazar pronto, pero no se confía
 * en él: el stream también se cuenta byte a byte.
 */
export async function readJsonBody(request: Request): Promise<unknown> {
  const mediaType = request.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase();
  if (mediaType !== 'application/json') {
    throw new JsonBodyError('Content-Type debe ser application/json', 415, -32600);
  }

  const declaredLength = request.headers.get('content-length');
  if (declaredLength !== null) {
    const parsedLength = Number(declaredLength);
    if (Number.isFinite(parsedLength) && parsedLength > MAX_JSON_BODY_BYTES) {
      throw new JsonBodyError(`El cuerpo supera el límite de ${MAX_JSON_BODY_BYTES} bytes`, 413, -32000);
    }
  }

  if (!request.body) throw new JsonBodyError('JSON inválido', 400, -32700);

  const reader = request.body.getReader();
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let total = 0;
  let source = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_JSON_BODY_BYTES) {
        await reader.cancel();
        throw new JsonBodyError(`El cuerpo supera el límite de ${MAX_JSON_BODY_BYTES} bytes`, 413, -32000);
      }
      source += decoder.decode(value, { stream: true });
    }
    source += decoder.decode();
    return JSON.parse(source);
  } catch (error) {
    if (error instanceof JsonBodyError) throw error;
    throw new JsonBodyError('JSON inválido o no codificado en UTF-8', 400, -32700);
  } finally {
    reader.releaseLock();
  }
}
