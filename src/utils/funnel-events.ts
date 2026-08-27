/**
 * Instrumentación de funnel — F1.
 *
 * Define el esquema de eventos, la validación de parámetros y el mecanismo de
 * dispatch. No instala un proveedor de analítica externo; despacha
 * `CustomEvent`s en `window` para que cualquier consumidor futuro las escuche.
 *
 * Privacidad: los parámetros son exclusivamente identificadores controlados
 * derivados del catálogo (tool, platform, lang, channel) o códigos de error
 * predefinidos (reason). Nunca incluyen texto libre, IP, correo, IDs
 * persistentes ni URLs introducidas por el usuario.
 *
 * Ver `docs/mejora/fases/F1.md` para el contrato completo.
 */

// ---------------------------------------------------------------------------
// Enumeraciones controladas
// ---------------------------------------------------------------------------

export const VALID_LANGS = ['es', 'sv', 'it'] as const;
export type FunnelLang = (typeof VALID_LANGS)[number];

export const VALID_PLATFORMS = ['web', 'windows', 'mac', 'linux', 'android', 'ios'] as const;
export type FunnelPlatform = (typeof VALID_PLATFORMS)[number];

export const VALID_CHANNELS = [
  'official-website',
  'app-store',
  'github-repo',
  'package-manager',
  'documentation',
  'official-installer',
  'web-app',
] as const;
export type FunnelChannel = (typeof VALID_CHANNELS)[number];

export const FUNNEL_EVENT_NAMES = [
  'ficha_view',
  'platform_select',
  'redirect_start',
  'redirect_result',
  'redirect_error',
] as const;
export type FunnelEventName = (typeof FUNNEL_EVENT_NAMES)[number];

export const REDIRECT_ERROR_REASONS = [
  'tool_not_found',
  'platform_not_found',
  'not_official',
  'missing_params',
] as const;
export type RedirectErrorReason = (typeof REDIRECT_ERROR_REASONS)[number];

// ---------------------------------------------------------------------------
// Payloads por evento
// ---------------------------------------------------------------------------

interface CommonParams {
  event: FunnelEventName;
  lang: FunnelLang;
  tool: string;
  platform: FunnelPlatform | null;
  channel: FunnelChannel;
}

export interface FichaViewPayload extends CommonParams {
  event: 'ficha_view';
}

export interface PlatformSelectPayload extends CommonParams {
  event: 'platform_select';
}

export interface RedirectStartPayload extends CommonParams {
  event: 'redirect_start';
  valid: true;
}

export interface RedirectResultPayload extends CommonParams {
  event: 'redirect_result';
  valid: true;
}

export interface RedirectErrorPayload extends CommonParams {
  event: 'redirect_error';
  valid: false;
  reason: RedirectErrorReason;
}

export type FunnelPayload =
  | FichaViewPayload
  | PlatformSelectPayload
  | RedirectStartPayload
  | RedirectResultPayload
  | RedirectErrorPayload;

// ---------------------------------------------------------------------------
// Validación
// ---------------------------------------------------------------------------

function isKnown<T extends readonly string[]>(arr: T, value: unknown): value is T[number] {
  return typeof value === 'string' && (arr as readonly string[]).includes(value);
}

/**
 * Campos permitidos en el payload. Cualquier campo adicional se descarta.
 * Esto previene que un call site inyecte accidentalmente PII.
 */
const ALLOWED_FIELDS = new Set([
  'event', 'lang', 'tool', 'platform', 'channel', 'valid', 'reason',
]);

/**
 * Valida un payload de evento. Devuelve `true` si el payload cumple el
 * esquema; `false` si tiene parámetros fuera de enumeración o campos no
 * permitidos.
 *
 * Esta función puede ejecutarse tanto en build-time (Astro SSR) como
 * en el navegador.
 */
export function validatePayload(payload: Record<string, unknown>): boolean {
  if (!isKnown(FUNNEL_EVENT_NAMES, payload.event)) return false;
  if (!isKnown(VALID_LANGS, payload.lang)) return false;
  if (typeof payload.tool !== 'string' || payload.tool.length === 0) return false;
  if (payload.platform !== null && !isKnown(VALID_PLATFORMS, payload.platform)) return false;
  if (!isKnown(VALID_CHANNELS, payload.channel)) return false;

  if (payload.event === 'redirect_error') {
    if (payload.valid !== false) return false;
    if (!isKnown(REDIRECT_ERROR_REASONS, payload.reason)) return false;
  }

  if (payload.event === 'redirect_start' || payload.event === 'redirect_result') {
    if (payload.valid !== true) return false;
  }

  for (const key of Object.keys(payload)) {
    if (!ALLOWED_FIELDS.has(key)) return false;
  }

  return true;
}

/**
 * Verifica que un payload no contenga campos de PII.
 * Devuelve `true` si está limpio; `false` si detecta un campo prohibido.
 */
export function stripPII(payload: Record<string, unknown>): boolean {
  const PII_PATTERNS = [
    /\bfetch\s*\(/,
    /\bsendBeacon\b/,
    /\bXMLHttpRequest\b/,
    /\bdocument\.cookie\b/,
    /\blocalStorage\.setItem\b/,
  ];

  for (const value of Object.values(payload)) {
    if (typeof value === 'string') {
      for (const pattern of PII_PATTERNS) {
        if (pattern.test(value)) return false;
      }
    }
  }

  return true;
}

// ---------------------------------------------------------------------------
// Dispatch
// ---------------------------------------------------------------------------

type FunnelEventHandler = (payload: FunnelPayload) => void;

const handlers: FunnelEventHandler[] = [];

/**
 * Registra un handler que recibirá cada payload validado.
 * Úsese para conectar un proveedor de analítica cuando se decida en F7.
 */
export function onFunnelEvent(handler: FunnelEventHandler): void {
  handlers.push(handler);
}

/**
 * Construye, valida y despacha un evento de funnel.
 *
 * - Si el payload no es válido, lo descarta silenciosamente (no revienta).
 * - Despacha un `CustomEvent` en `window` con detalle serializable.
 * - Llama a los handlers registrados vía `onFunnelEvent()`.
 *
 * Esta función está diseñada para ser llamada desde scripts Astro (SSR)
 * o desde scripts inline en el navegador.
 */
export function dispatchFunnelEvent(payload: Record<string, unknown>): void {
  if (!validatePayload(payload)) return;
  if (!stripPII(payload)) return;

  const event = new CustomEvent('fuenteai:funnel', { detail: payload });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(event);
  }

  for (const handler of handlers) {
    try {
      handler(payload as FunnelPayload);
    } catch {
      // Los handlers no deben romper el flujo de usuario.
    }
  }
}
