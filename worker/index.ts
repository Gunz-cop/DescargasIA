/**
 * Worker que sirve la app "¿qué modelos de IA puedo correr?" (F6).
 *
 * Enruta `/api/hw/*` a la capa de IA y delega TODO lo demás a `env.ASSETS`,
 * que sirve el sitio estático de Astro exactamente igual que antes. Ningún
 * cambio de esta fase puede romper las 86 fichas ni la navegación: si el
 * pathname no empieza por `/api/`, la petición va directa a los assets.
 *
 * Los tres endpoints son degradables: ante cualquier fallo devuelven
 * `{ ok: false, reason }` y el cliente continúa con el resolver local. La IA
 * nunca es camino crítico.
 */

import {
  parseSpecs,
  lookupGpu,
  explainVerdict
} from './ai';

interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  AI: {
    run(model: string, inputs: Record<string, unknown>, opts?: { signal?: AbortSignal }): Promise<unknown>;
  };
  HW_CACHE: {
    get(key: string, type: 'json'): Promise<unknown>;
    put(key: string, value: string, opts: { expirationTtl: number }): Promise<void>;
  };
}

const MAX_BODY_BYTES = 4 * 1024;

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
  return json({ ok: true, ...result });
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

  const result = await explainVerdict(env.AI, { verdict, specs, lang });
  return json({ ok: true, ...result });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
      }
      try {
        if (url.pathname === '/api/hw/parse') return await handleParse(env, request);
        if (url.pathname === '/api/hw/gpu-lookup') return await handleGpuLookup(env, request);
        if (url.pathname === '/api/hw/explain') return await handleExplain(env, request);
        return new Response('Not Found', { status: 404 });
      } catch (err) {
        const reason = err instanceof Error ? err.message : 'unknown_error';
        return fail(reason);
      }
    }

    // Todo lo que no es /api/* se sirve como estaba: el sitio estático intacto.
    return env.ASSETS.fetch(request);
  }
};
