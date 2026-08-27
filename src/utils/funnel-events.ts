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
  'official-site',
  'app-store',
  'github-repo',
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
  'unknown',
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
  if (typeof payload.tool !== 'string') return false;
  if (payload.tool.length === 0 && payload.event !== 'redirect_error') return false;
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
// Sanitización de entradas
// ---------------------------------------------------------------------------

const VALID_LANG_SET = new Set<string>(VALID_LANGS);
const VALID_PLATFORM_SET = new Set<string>(VALID_PLATFORMS);
const VALID_CHANNEL_SET = new Set<string>(VALID_CHANNELS);
const VALID_REASON_SET = new Set<string>(REDIRECT_ERROR_REASONS);
const SLUG_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
const MAX_TOOL_SLUG_LENGTH = 64;

/**
 * Sanitiza `lang`: acepta solo `es`, `sv`, `it`. Cualquier otro valor
 * devuelve `es` como fallback controlado.
 */
export function sanitizeLang(raw: unknown): FunnelLang {
  return VALID_LANG_SET.has(String(raw)) ? (String(raw) as FunnelLang) : 'es';
}

/**
 * Sanitiza `platform`: acepta solo las keys del catálogo o `null`.
 */
export function sanitizePlatform(raw: unknown): FunnelPlatform | null {
  if (raw === null || raw === undefined) return null;
  return VALID_PLATFORM_SET.has(String(raw)) ? (String(raw) as FunnelPlatform) : null;
}

/**
 * Sanitiza `tool`: acepta solo slugs alfanuméricos con guiones, máx 64 chars.
 * Rechaza URLs, rutas, texto libre o strings vacíos. Devuelve string vacío
 * si no es un slug válido.
 */
export function sanitizeTool(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_TOOL_SLUG_LENGTH) return '';
  if (!SLUG_RE.test(trimmed)) return '';
  return trimmed;
}

/**
 * Sanitiza `channel`: acepta solo tipos de canal del catálogo.
 */
export function sanitizeChannel(raw: unknown): FunnelChannel {
  return VALID_CHANNEL_SET.has(String(raw)) ? (String(raw) as FunnelChannel) : 'web-app';
}

/**
 * Sanitiza `reason`: acepta solo razones predefinidas.
 */
export function sanitizeReason(raw: unknown): RedirectErrorReason {
  return VALID_REASON_SET.has(String(raw)) ? (String(raw) as RedirectErrorReason) : 'unknown';
}

/**
 * Construye un payload sanitizado y listo para dispatch.
 * Todas las entradas pasan por sanitización; los valores ilegibles se
 * reemplazan por fallbacks controlados. El payload resultante siempre
 * pasa `validatePayload()`.
 */
export function buildFunnelPayload(fields: Record<string, unknown>): Record<string, unknown> {
  const event = String(fields.event ?? '');
  const lang = sanitizeLang(fields.lang);
  const tool = sanitizeTool(fields.tool);
  const platform = sanitizePlatform(fields.platform);
  const channel = sanitizeChannel(fields.channel);

  const base: Record<string, unknown> = { event, lang, tool, platform, channel };

  if (event === 'redirect_error') {
    base.valid = false;
    base.reason = sanitizeReason(fields.reason);
  } else if (event === 'redirect_start' || event === 'redirect_result') {
    base.valid = true;
  }

  return base;
}

// ---------------------------------------------------------------------------
// Resolución de /r
// ---------------------------------------------------------------------------

/**
 * Forma mínima de una entrada de herramienta en el interstitial `/r`.
 * Es la misma forma que `src/pages/r/index.astro` construye a partir de
 * `toolsBase` (name, officialWebsite y platforms con url/isOfficial/type).
 */
export interface RedirectPlatformEntry {
  url: string;
  displayUrl?: string;
  isOfficial: boolean;
  type: string;
}

export interface RedirectToolEntry {
  name: string;
  officialWebsite: string;
  officialWebsiteDisplay?: string;
  platforms: Record<string, RedirectPlatformEntry | null | undefined>;
}

export interface RedirectResolution {
  lang: FunnelLang;
  toolId: string;
  platformId: FunnelPlatform | null;
  channel: FunnelChannel;
  targetUrl: string;
  displayUrl: string;
  name: string;
  /** `null` cuando `targetUrl` es válido; código controlado en caso contrario. */
  errorReason: RedirectErrorReason | null;
}

/**
 * Resuelve el destino del interstitial `/r` a partir de los parámetros de
 * URL y el catálogo. Es la única implementación de esta lógica: la página
 * `/r` la importa en lugar de mantener su propia copia.
 *
 * Reglas:
 * - `p` ausente: fallback a `officialWebsite` (comportamiento previsto).
 * - `p` presente pero inválido o inexistente en la herramienta
 *   (ej. `p=banana`): error `platform_not_found`; NO cae en `officialWebsite`.
 * - `p` existente en la herramienta pero no oficial: error `not_official`.
 * - `t` ausente: error `missing_params`; `t` inválida o no catalogada:
 *   error `tool_not_found`.
 */
export function resolveRedirect(
  params: URLSearchParams,
  toolsDb: Record<string, RedirectToolEntry | undefined>,
): RedirectResolution {
  const rawT = params.get('t') ?? '';
  const rawP = params.get('p');
  const hasP = params.has('p');
  const lang = sanitizeLang(params.get('l') ?? 'es');
  const toolId = sanitizeTool(rawT);
  const platformId = sanitizePlatform(rawP);
  const tool = toolId ? toolsDb[toolId] : null;

  let targetUrl = '';
  let displayUrl = '';
  let name = '';
  let channel: FunnelChannel = 'web-app';

  if (tool) {
    name = tool.name;
    if (hasP) {
      if (platformId !== null) {
        const plat = tool.platforms[platformId];
        if (plat && plat.isOfficial) {
          targetUrl = plat.url;
          displayUrl = plat.displayUrl || plat.url;
          channel = sanitizeChannel(plat.type);
        } else if (plat) {
          channel = sanitizeChannel(plat.type);
        }
      }
      // p presente pero inválido: targetUrl queda vacío -> redirect_error
    } else {
      // p ausente: fallback a officialWebsite (comportamiento previsto)
      targetUrl = tool.officialWebsite;
      displayUrl = tool.officialWebsiteDisplay || tool.officialWebsite;
    }
  }

  let errorReason: RedirectErrorReason | null = null;
  if (!targetUrl) {
    if (!rawT) {
      errorReason = 'missing_params';
    } else if (!toolId || !tool) {
      errorReason = 'tool_not_found';
    } else if (hasP && platformId === null) {
      errorReason = 'platform_not_found';
    } else if (hasP && platformId) {
      errorReason = tool.platforms[platformId] ? 'not_official' : 'platform_not_found';
    } else {
      errorReason = 'unknown';
    }
  }

  return { lang, toolId, platformId, channel, targetUrl, displayUrl, name, errorReason };
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
  const safe = buildFunnelPayload(payload);
  if (!validatePayload(safe)) return;
  if (!stripPII(safe)) return;

  const event = new CustomEvent('fuenteai:funnel', { detail: safe });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(event);
  }

  for (const handler of handlers) {
    try {
      handler(safe as unknown as FunnelPayload);
    } catch {
      // Los handlers no deben romper el flujo de usuario.
    }
  }
}
