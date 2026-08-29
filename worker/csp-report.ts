/**
 * Receptor first-party de informes CSP (#88).
 *
 * El endpoint no devuelve los informes ni registra el cuerpo recibido. Solo
 * persiste una forma mínima y saneada durante la ventana aprobada de
 * observación. La IP se usa únicamente para el límite transitorio y nunca se
 * guarda en claro.
 */

export interface CspReportStore {
  get(key: string, type: 'json'): Promise<unknown>;
  put(key: string, value: string, options: { expirationTtl: number }): Promise<void>;
}

export const CSP_REPORT_PATH = '/api/csp-report';
export const CSP_REPORT_MAX_BODY_BYTES = 16 * 1024;
export const CSP_REPORT_RATE_LIMIT = 30;
export const CSP_REPORT_RATE_WINDOW_SECONDS = 60;
export const CSP_REPORT_TTL_SECONDS = 30 * 24 * 60 * 60;

const RATE_LIMIT_SALT = 'fuenteai-csp-report-rate-limit-v1';

type RecordValue = Record<string, unknown>;

function isRecord(value: unknown): value is RecordValue {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown, max = 256): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, max);
}

function firstString(record: RecordValue, keys: string[], max = 256): string {
  for (const key of keys) {
    const value = stringValue(record[key], max);
    if (value) return value;
  }
  return '';
}

function pathFrom(value: string): string {
  if (!value) return '';
  try {
    return new URL(value).pathname.slice(0, 256) || '/';
  } catch {
    return value.startsWith('/') ? value.split(/[?#]/, 1)[0].slice(0, 256) : '';
  }
}

function originFrom(value: string): string {
  if (!value) return '';
  const marker = value.toLowerCase();
  if (marker === 'inline' || marker === 'eval' || marker === 'data' || marker === 'blob') {
    return marker;
  }
  try {
    return new URL(value).origin.slice(0, 256);
  } catch {
    return stringValue(value.split(/[/?#]/, 1)[0], 256);
  }
}

function browserFamily(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (ua.includes('edg/')) return 'Edge';
  if (ua.includes('firefox/')) return 'Firefox';
  if (ua.includes('chrome/') || ua.includes('chromium/')) return 'Chrome';
  if (ua.includes('safari/') && !ua.includes('chrome/')) return 'Safari';
  if (ua.includes('bot') || ua.includes('crawler') || ua.includes('spider')) return 'Bot';
  return 'Other';
}

function directiveFrom(value: string): string {
  const directive = value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 64);
  return directive || 'unknown';
}

function reportBody(value: unknown): RecordValue | null {
  if (!isRecord(value)) return null;
  const legacy = value['csp-report'];
  if (isRecord(legacy)) return legacy;
  const modern = value.body;
  if (isRecord(modern)) return modern;
  return value;
}

function normaliseReport(value: unknown, request: Request): {
  path: string;
  effectiveDirective: string;
  blockedOrigin: string;
  browser: string;
} | null {
  const body = reportBody(value);
  if (!body) return null;

  const path = pathFrom(firstString(body, ['document-uri', 'documentURL', 'document-url', 'url'])) || 'unknown';
  const directive = directiveFrom(
    firstString(body, ['effective-directive', 'effectiveDirective', 'violated-directive', 'violatedDirective'])
  );
  const blockedOrigin =
    originFrom(firstString(body, ['blocked-uri', 'blockedURL', 'blocked-url'])) || 'unknown';
  const userAgent =
    firstString(body, ['user-agent', 'userAgent'], 512) ||
    stringValue(request.headers.get('user-agent'), 512);

  if (path === 'unknown' && directive === 'unknown' && blockedOrigin === 'unknown') return null;

  return { path, effectiveDirective: directive, blockedOrigin, browser: browserFamily(userAgent) };
}

function clientIp(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  );
}

async function hashIp(ip: string): Promise<string> {
  const bytes = new TextEncoder().encode(ip + RATE_LIMIT_SALT);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function checkRateLimit(store: CspReportStore, request: Request): Promise<boolean> {
  const key = `csp:rate:${await hashIp(clientIp(request))}`;
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - CSP_REPORT_RATE_WINDOW_SECONDS;
  let hits: number[] = [];

  try {
    const stored = (await store.get(key, 'json')) as unknown;
    if (Array.isArray(stored)) hits = stored.filter((value): value is number => typeof value === 'number');
  } catch {
    // La limitación es best-effort: un fallo de KV no debe romper el sitio.
  }

  hits = hits.filter((timestamp) => timestamp > windowStart);
  if (hits.length >= CSP_REPORT_RATE_LIMIT) return false;

  hits.push(now);
  try {
    await store.put(key, JSON.stringify(hits), {
      expirationTtl: CSP_REPORT_RATE_WINDOW_SECONDS + 60
    });
  } catch {
    // La respuesta sigue siendo válida aunque falle el contador de KV.
  }
  return true;
}

function response(status: number, headers: Record<string, string> = {}): Response {
  const responseHeaders = new Headers({
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    ...headers
  });
  return new Response(null, { status, headers: responseHeaders });
}

export async function handleCspReport(store: CspReportStore, request: Request): Promise<Response> {
  if (request.method !== 'POST') return response(405, { allow: 'POST' });

  const contentType = request.headers.get('content-type')?.toLowerCase() ?? '';
  if (
    !contentType.includes('application/csp-report') &&
    !contentType.includes('application/reports+json') &&
    !contentType.includes('application/json')
  ) {
    return response(415);
  }

  const declaredLength = Number(request.headers.get('content-length') ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > CSP_REPORT_MAX_BODY_BYTES) {
    return response(413);
  }

  if (!(await checkRateLimit(store, request))) {
    return response(429, { 'retry-after': String(CSP_REPORT_RATE_WINDOW_SECONDS) });
  }

  const body = await request.arrayBuffer();
  if (body.byteLength === 0 || body.byteLength > CSP_REPORT_MAX_BODY_BYTES) return response(413);

  let payload: unknown;
  try {
    payload = JSON.parse(new TextDecoder().decode(body));
  } catch {
    return response(400);
  }

  const values = Array.isArray(payload) ? payload : [payload];
  const reports = values
    .map((value) => normaliseReport(value, request))
    .filter((value): value is NonNullable<typeof value> => value !== null);
  if (reports.length === 0) return response(400);

  const record = {
    receivedAt: new Date().toISOString(),
    reports
  };

  try {
    await store.put(`csp:report:${Date.now()}:${crypto.randomUUID()}`, JSON.stringify(record), {
      expirationTtl: CSP_REPORT_TTL_SECONDS
    });
  } catch {
    return response(503);
  }

  return response(204);
}
