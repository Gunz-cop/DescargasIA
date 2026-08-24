/**
 * Worker que sirve la app "¿qué modelos de IA puedo correr?" (F6 + F7).
 *
 * Enruta `/api/hw/*` a la capa de IA y delega TODO lo demás a `env.ASSETS`,
 * que sirve el sitio estático de Astro exactamente igual que antes. Ningún
 * cambio de esta fase puede romper las 86 fichas ni la navegación: si el
 * pathname no empieza por `/api/`, la petición va directa a los assets.
 *
 * Los tres endpoints son degradables: ante cualquier fallo devuelven
 * `{ ok: false, reason }` y el cliente continúa con el resolver local. La IA
 * nunca es camino crítico.
 *
 * F7 añade: límite por IP, validación de entrada, cabeceras de seguridad,
 * caché de `explain` en KV, métricas agregadas sin PII y un interruptor para
 * apagar la IA sin romper la app.
 */

import {
  parseSpecs,
  lookupGpu,
  explainVerdict,
  normalizeGpuKey
} from './ai';
import { checkRateLimit, TOO_MANY_REQUESTS } from './ratelimit';
import { validateRequest, withSecurityHeaders } from './security';
import type { SystemSpecs } from '../src/lib/hardware/types.ts';

interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  AI: {
    run(model: string, inputs: Record<string, unknown>, opts?: { signal?: AbortSignal }): Promise<unknown>;
  };
  HW_CACHE: {
    get(key: string, type: 'json'): Promise<unknown>;
    put(key: string, value: string, opts: { expirationTtl: number }): Promise<void>;
  };
  /** Interruptor de la IA. "false" apaga los tres endpoints (F7). */
  AI_ENABLED?: string;
}

/**
 * Métrica agregada. Nunca lleva el texto libre del usuario: solo el nombre del
 * evento y contadores numéricos. Es lo que permite saber la tasa de uso sin
 * registrar nada personal.
 */
function logMetric(name: string, fields: Record<string, number> = {}): void {
  console.log(JSON.stringify({ metric: name, ...fields }));
}

const MAX_BODY_BYTES = 4 * 1024;

/** Hash estable y barato para la clave de caché de `explain` (specs+veredicto+idioma). */
function hashKey(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) + h + input.charCodeAt(i)) >>> 0;
  }
  return h.toString(36);
}

/** Lanza un error con `reason` legible si la petición no sirve. */
async function readJson(request: Request, maxBytes: number): Promise<unknown> {
  const length = Number(request.headers.get('content-length') ?? 0);
  if (length > maxBytes) throw new Error('payload_too_large');
  const text = await request.text();
  if (text.length > maxBytes) throw new Error('payload_too_large');
  if (!text) throw new Error('empty_body');
  return JSON.parse(text);
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  });
}

function fail(reason: string): Response {
  return json({ ok: false, reason }, 200);
}

async function handleParse(env: Env, request: Request): Promise<Response> {
  const body = (await readJson(request, 1024)) as { text?: unknown };
  const text = typeof body.text === 'string' ? body.text.slice(0, 1024) : '';
  if (!text.trim()) return fail('empty_text');
  const result = await parseSpecs(env.AI, text);
  logMetric('hw_parse', { resolver_hit: result.specs.gpu?.source === 'db' ? 1 : 0 });
  return json({ ok: true, ...result });
}

async function handleGpuLookup(env: Env, request: Request): Promise<Response> {
  const body = (await readJson(request, 1024)) as { name?: unknown };
  const name = typeof body.name === 'string' ? body.name.slice(0, 200).trim() : '';
  if (!name) return fail('empty_name');

  // lookupGpu reconcilia contra la base completa (gpus.json + Apple Silicon):
  // si la GPU es conocida devuelve datos reales sin consultar la IA; si no,
  // estima y cachea en KV 30 días.
  const result = await lookupGpu(env.AI, name, env.HW_CACHE);
  if (!result.known) {
    // Métrica agregada: cuántas veces se pidió una GPU que falta en la base.
    // Guardamos el contador en KV por nombre normalizado, nunca en un log.
    await recordUnmatchedGpu(env.HW_CACHE, name);
  }
  logMetric('hw_gpu_lookup', { known: result.known ? 1 : 0 });
  return json({ ok: true, ...result });
}

/** Cuenta, agregado por GPU normalizada, cuántas veces se pidió fuera de la base. */
async function recordUnmatchedGpu(cache: Env['HW_CACHE'], name: string): Promise<void> {
  const key = 'metrics:gpu:' + normalizeGpuKey(name);
  try {
    const prev = (await cache.get(key, 'json')) as { count?: number } | null;
    const count = (prev && typeof prev.count === 'number' ? prev.count : 0) + 1;
    await cache.put(key, JSON.stringify({ count }), { expirationTtl: 180 * 24 * 3600 });
  } catch {
    // Métrica best-effort.
  }
}

async function handleExplain(env: Env, request: Request): Promise<Response> {
  const body = (await readJson(request, 4 * 1024)) as {
    verdict?: unknown;
    specs?: unknown;
    lang?: unknown;
  };
  const verdict = typeof body.verdict === 'string' ? body.verdict : '';
  const specs = body.specs;
  const lang = typeof body.lang === 'string' ? body.lang : 'es';
  if (!verdict || !specs || typeof specs !== 'object') return fail('missing_fields');

  // `specs` viene de la red: `os` es parte del contrato de SystemSpecs y no se
  // puede dar por supuesto. Un cuerpo sin `os` llegaba a explainVerdict como
  // SystemSpecs incompleto.
  const rawOs = (specs as { os?: unknown }).os;
  const os: SystemSpecs['os'] =
    rawOs === 'windows' || rawOs === 'macos' || rawOs === 'linux' ? rawOs : 'unknown';

  // Caché KV 7 días: la misma consulta (specs+veredicto+idioma) no vuelve a
  // golpear a Workers AI. Clave = hash del payload, sin el texto libre.
  const cacheKey = 'explain:' + hashKey(JSON.stringify({ verdict, specs: { ...(specs as object), os }, lang }));
  try {
    const cached = (await env.HW_CACHE.get(cacheKey, 'json')) as { sentences?: string[]; tips?: string[] } | null;
    if (cached && Array.isArray(cached.sentences) && Array.isArray(cached.tips)) {
      logMetric('hw_explain_cache_hit');
      return json({ ok: true, sentences: cached.sentences, tips: cached.tips });
    }
  } catch {
    // Caché best-effort.
  }

  const result = await explainVerdict(env.AI, {
    verdict,
    specs: { ...(specs as Omit<SystemSpecs, 'os'>), os },
    lang
  });

  try {
    await env.HW_CACHE.put(cacheKey, JSON.stringify(result), { expirationTtl: 7 * 24 * 3600 });
  } catch {
    // Caché best-effort.
  }
  logMetric('hw_explain');
  return json({ ok: true, ...result });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      // Interruptor de la IA (F7): apagada, los tres endpoints devuelven
      // "disabled" y la app sigue funcionando entera en local.
      if (env.AI_ENABLED === 'false') {
        logMetric('hw_disabled');
        return withSecurityHeaders(json({ ok: false, reason: 'disabled' }));
      }

      if (request.method !== 'POST') {
        return withSecurityHeaders(new Response('Method Not Allowed', { status: 405 }));
      }

      const validation = validateRequest(request);
      if (!validation.ok) {
        logMetric('hw_rejected', { status: validation.status });
        return withSecurityHeaders(json({ ok: false, reason: validation.reason }, validation.status));
      }

      const limit = await checkRateLimit(env.HW_CACHE, request);
      if (limit.limited) {
        logMetric('hw_rate_limited');
        const response = json({ ok: false, reason: 'rate_limited' }, TOO_MANY_REQUESTS);
        response.headers.set('retry-after', String(limit.retryAfter));
        return withSecurityHeaders(response);
      }

      try {
        if (url.pathname === '/api/hw/parse') return withSecurityHeaders(await handleParse(env, request));
        if (url.pathname === '/api/hw/gpu-lookup') return withSecurityHeaders(await handleGpuLookup(env, request));
        if (url.pathname === '/api/hw/explain') return withSecurityHeaders(await handleExplain(env, request));
        return withSecurityHeaders(new Response('Not Found', { status: 404 }));
      } catch (err) {
        const reason = err instanceof Error ? err.message : 'unknown_error';
        return withSecurityHeaders(fail(reason));
      }
    }

    // Todo lo que no es /api/* se sirve como estaba: el sitio estático intacto.
    return env.ASSETS.fetch(request);
  }
};
