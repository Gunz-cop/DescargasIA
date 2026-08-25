/**
 * Límite de peticiones por IP para la capa de IA (F7).
 *
 * 30 peticiones cada 10 minutos por IP, sobre KV con ventana deslizante. Al
 * superarlo devolvemos 429 con `Retry-After` y la app sigue entera en local:
 * el límite nunca rompe la experiencia, solo apaga la ayuda con IA. El cliente
 * lo interpreta como "IA no disponible" y continúa con el resolver local.
 *
 * Privacidad: aquí no se registra nunca el texto libre del usuario. Solo
 * contadores agregados por IP, nunca el contenido de la petición.
 */

interface KvLike {
  get(key: string, type: 'json'): Promise<unknown>;
  put(key: string, value: string, opts: { expirationTtl: number }): Promise<void>;
}

const WINDOW_SECONDS = 10 * 60;
const MAX_REQUESTS = 30;

/** Status que devolvemos al superar el límite. */
const TOO_MANY_REQUESTS = 429;

/**
 * Sal fija del hash de IP. No es un secreto de verdad para este uso: solo evita
 * que alguien reaproveche una rainbow table de SHA-256(ip) ya calculada. Con
 * sal, el espacio deja de ser enumerable y el hash cumple lo que promete la
 * página de privacidad (la IP no es recuperable desde la clave de KV).
 */
const IP_SALT = 'fuenteai-rate-limit-v1';

/** Hash SHA-256 de la IP + sal: nunca guardamos la dirección en claro. */
async function hashIp(ip: string): Promise<string> {
  const bytes = new TextEncoder().encode(ip + IP_SALT);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Clave de KV por IP hasheada (SHA-256 + sal); no guardamos la IP en claro. */
async function clientKey(request: Request): Promise<string> {
  const ip =
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'local';
  return 'rl:' + (await hashIp(ip));
}

export interface RateLimitResult {
  limited: boolean;
  retryAfter: number;
}

export async function checkRateLimit(cache: KvLike, request: Request): Promise<RateLimitResult> {
  const key = await clientKey(request);
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - WINDOW_SECONDS;

  let hits: number[] = [];
  try {
    const stored = (await cache.get(key, 'json')) as number[] | null;
    if (Array.isArray(stored)) hits = stored;
  } catch {
    // Caché best-effort: si falla, dejamos pasar la petición.
  }
  hits = hits.filter((t) => t > windowStart);

  if (hits.length >= MAX_REQUESTS) {
    const oldest = hits[0];
    const retryAfter = Math.max(1, oldest + WINDOW_SECONDS - now);
    return { limited: true, retryAfter };
  }

  hits.push(now);
  try {
    await cache.put(key, JSON.stringify(hits), { expirationTtl: WINDOW_SECONDS + 60 });
  } catch {
    // Caché best-effort.
  }
  return { limited: false, retryAfter: 0 };
}

export { TOO_MANY_REQUESTS };
