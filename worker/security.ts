/**
 * Validación de entrada y cabeceras de seguridad para la capa de IA (F7).
 *
 * La app entera es estática; estos endpoints son ayuda opcional. Por eso
 * validamos con mano dura: solo JSON del propio sitio, cuerpos pequeños y
 * respuestas sin cachear en el cliente, con cabeceras de seguridad estándar.
 */

const MAX_BODY_BYTES = 4 * 1024;

export type ValidationResult =
  | { ok: true }
  | { ok: false; status: number; reason: string };

/**
 * Valida la petición antes de tocar el cuerpo o la IA:
 *  - `Content-Type: application/json`
 *  - `Origin` del propio sitio (mismo origin que la petición)
 *  - `Content-Length` ≤ `maxBytes`
 *
 * No lee el cuerpo: la longitud se acota por la cabecera. El texto libre del
 * usuario nunca se toca aquí, y mucho menos se registra.
 */
export function validateRequest(request: Request, maxBytes = MAX_BODY_BYTES): ValidationResult {
  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return { ok: false, status: 415, reason: 'unsupported_media_type' };
  }

  const origin = request.headers.get('origin');
  const siteOrigin = new URL(request.url).origin;
  if (!origin || origin !== siteOrigin) {
    return { ok: false, status: 403, reason: 'origin_not_allowed' };
  }

  const length = Number(request.headers.get('content-length') ?? 0);
  if (Number.isFinite(length) && length > maxBytes) {
    return { ok: false, status: 413, reason: 'payload_too_large' };
  }

  return { ok: true };
}

/** Añade cabeceras de seguridad y de no-cache a cualquier respuesta de la API. */
export function withSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set('cache-control', 'no-store');
  headers.set('x-content-type-options', 'nosniff');
  headers.set('x-frame-options', 'DENY');
  headers.set('referrer-policy', 'same-origin');
  headers.set('permissions-policy', 'geolocation=(), microphone=(), camera=()');
  return new Response(response.body, { status: response.status, headers });
}
