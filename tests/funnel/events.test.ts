import test from 'node:test';
import assert from 'node:assert/strict';
import {
  VALID_LANGS,
  VALID_PLATFORMS,
  VALID_CHANNELS,
  FUNNEL_EVENT_NAMES,
  REDIRECT_ERROR_REASONS,
  validatePayload,
  stripPII,
  dispatchFunnelEvent,
  onFunnelEvent,
  sanitizeLang,
  sanitizePlatform,
  sanitizeTool,
  sanitizeChannel,
  sanitizeReason,
  buildFunnelPayload,
} from '../../src/utils/funnel-events.js';

// ---------------------------------------------------------------------------
// validatePayload — payloads reales
// ---------------------------------------------------------------------------

test('validatePayload acepta un ficha_view válido', () => {
  assert.equal(validatePayload({ event: 'ficha_view', lang: 'es', tool: 'chatgpt', platform: 'web', channel: 'web-app' }), true);
});

test('validatePayload acepta redirect_start con valid: true', () => {
  assert.equal(validatePayload({ event: 'redirect_start', lang: 'sv', tool: 'ollama', platform: 'windows', channel: 'official-installer', valid: true }), true);
});

test('validatePayload acepta redirect_error con reason válido', () => {
  assert.equal(validatePayload({ event: 'redirect_error', lang: 'es', tool: '', platform: null, channel: 'web-app', valid: false, reason: 'tool_not_found' }), true);
});

test('validatePayload acepta platform null', () => {
  assert.equal(validatePayload({ event: 'ficha_view', lang: 'es', tool: 'claude', platform: null, channel: 'official-site' }), true);
});

test('validatePayload rechaza event desconocido', () => {
  assert.equal(validatePayload({ event: 'page_view', lang: 'es', tool: 'x', platform: 'web', channel: 'web-app' }), false);
});

test('validatePayload rechaza lang inválido', () => {
  assert.equal(validatePayload({ event: 'ficha_view', lang: 'fr', tool: 'x', platform: 'web', channel: 'web-app' }), false);
});

test('validatePayload rechaza platform inválida', () => {
  assert.equal(validatePayload({ event: 'ficha_view', lang: 'es', tool: 'x', platform: 'blackberry', channel: 'web-app' }), false);
});

test('validatePayload rechaza channel inválido', () => {
  assert.equal(validatePayload({ event: 'ficha_view', lang: 'es', tool: 'x', platform: 'web', channel: 'torrent' }), false);
});

test('validatePayload rechaza tool vacío', () => {
  assert.equal(validatePayload({ event: 'ficha_view', lang: 'es', tool: '', platform: 'web', channel: 'web-app' }), false);
});

test('validatePayload rechaza tool que no es string', () => {
  assert.equal(validatePayload({ event: 'ficha_view', lang: 'es', tool: 123 as any, platform: 'web', channel: 'web-app' }), false);
});

test('validatePayload rechaza campo adicional (PII injection)', () => {
  assert.equal(validatePayload({ event: 'ficha_view', lang: 'es', tool: 'x', platform: 'web', channel: 'web-app', ip: '1.2.3.4' }), false);
});

test('validatePayload rechaza campo search query', () => {
  assert.equal(validatePayload({ event: 'ficha_view', lang: 'es', tool: 'x', platform: 'web', channel: 'web-app', q: 'descargar gratis' }), false);
});

test('validatePayload rechaza reason inválido en redirect_error', () => {
  assert.equal(validatePayload({ event: 'redirect_error', lang: 'es', tool: '', platform: null, channel: 'web-app', valid: false, reason: 'hack' as any }), false);
});

test('validatePayload rechaza redirect_start sin valid: true', () => {
  assert.equal(validatePayload({ event: 'redirect_start', lang: 'es', tool: 'x', platform: 'web', channel: 'web-app', valid: false }), false);
});

test('validatePayload acepta channel official-site (del catálogo)', () => {
  assert.equal(validatePayload({ event: 'ficha_view', lang: 'es', tool: 'x', platform: 'web', channel: 'official-site' }), true);
});

// ---------------------------------------------------------------------------
// sanitizeTool — rechaza texto arbitrario de URL
// ---------------------------------------------------------------------------

test('sanitizeTool acepta slug válido', () => {
  assert.equal(sanitizeTool('chatgpt'), 'chatgpt');
});

test('sanitizeTool acepta slug con guiones', () => {
  assert.equal(sanitizeTool('stable-diffusion'), 'stable-diffusion');
});

test('sanitizeTool rechaza URL', () => {
  assert.equal(sanitizeTool('https://ejemplo.com'), '');
});

test('sanitizeTool rechaza texto libre', () => {
  assert.equal(sanitizeTool('descargar gratis virus'), '');
});

test('sanitizeTool rechaza ruta', () => {
  assert.equal(sanitizeTool('../../etc/passwd'), '');
});

test('sanitizeTool rechaza string vacío', () => {
  assert.equal(sanitizeTool(''), '');
});

test('sanitizeTool rechaza slug demasiado largo', () => {
  assert.equal(sanitizeTool('a'.repeat(65)), '');
});

test('sanitizeTool acepta slug de 64 chars', () => {
  assert.equal(sanitizeTool('a'.repeat(64)), 'a'.repeat(64));
});

test('sanitizeTool rechaza null', () => {
  assert.equal(sanitizeTool(null as any), '');
});

test('sanitizeTool rechaza número', () => {
  assert.equal(sanitizeTool(42 as any), '');
});

// ---------------------------------------------------------------------------
// sanitizeLang — fallback controlado
// ---------------------------------------------------------------------------

test('sanitizeLang acepta es, sv, it', () => {
  assert.equal(sanitizeLang('es'), 'es');
  assert.equal(sanitizeLang('sv'), 'sv');
  assert.equal(sanitizeLang('it'), 'it');
});

test('sanitizeLang cae a es para valor arbitrario', () => {
  assert.equal(sanitizeLang('fr'), 'es');
});

test('sanitizeLang cae a es para null', () => {
  assert.equal(sanitizeLang(null), 'es');
});

test('sanitizeLang cae a es para URL', () => {
  assert.equal(sanitizeLang('https://evil.com'), 'es');
});

// ---------------------------------------------------------------------------
// sanitizePlatform — null para valores ilegibles
// ---------------------------------------------------------------------------

test('sanitizePlatform acepta keys válidas', () => {
  for (const p of ['web', 'windows', 'mac', 'linux', 'android', 'ios']) {
    assert.equal(sanitizePlatform(p), p);
  }
});

test('sanitizePlatform devuelve null para valor inválido', () => {
  assert.equal(sanitizePlatform('blackberry'), null);
});

test('sanitizePlatform devuelve null para URL', () => {
  assert.equal(sanitizePlatform('https://evil.com'), null);
});

test('sanitizePlatform devuelve null para null', () => {
  assert.equal(sanitizePlatform(null), null);
});

// ---------------------------------------------------------------------------
// sanitizeChannel — fallback a web-app
// ---------------------------------------------------------------------------

test('sanitizeChannel acepta canales del catálogo', () => {
  for (const ch of ['official-site', 'app-store', 'github-repo', 'documentation', 'official-installer', 'web-app']) {
    assert.equal(sanitizeChannel(ch), ch);
  }
});

test('sanitizeChannel cae a web-app para valor inválido', () => {
  assert.equal(sanitizeChannel('torrent'), 'web-app');
});

// ---------------------------------------------------------------------------
// sanitizeReason — fallback a unknown
// ---------------------------------------------------------------------------

test('sanitizeReason acepta razones válidas', () => {
  for (const r of ['tool_not_found', 'platform_not_found', 'not_official', 'missing_params', 'unknown']) {
    assert.equal(sanitizeReason(r), r);
  }
});

test('sanitizeReason cae a unknown para valor inválido', () => {
  assert.equal(sanitizeReason('hack'), 'unknown');
});

// ---------------------------------------------------------------------------
// buildFunnelPayload — construye payload seguro
// ---------------------------------------------------------------------------

test('buildFunnelPayload sanitiza tool de URL', () => {
  const payload = buildFunnelPayload({ event: 'redirect_error', lang: 'https://evil.com', tool: 'https://malware.com', platform: 'blackberry', channel: 'torrent', reason: 'hack' });
  assert.equal(payload.lang, 'es');
  assert.equal(payload.tool, '');
  assert.equal(payload.platform, null);
  assert.equal(payload.channel, 'web-app');
  assert.equal(payload.reason, 'unknown');
});

test('buildFunnelPayload genera payload válido para ficha_view', () => {
  const payload = buildFunnelPayload({ event: 'ficha_view', lang: 'es', tool: 'chatgpt', platform: 'web', channel: 'web-app' });
  assert.equal(validatePayload(payload), true);
});

test('buildFunnelPayload genera payload válido para redirect_error', () => {
  const payload = buildFunnelPayload({ event: 'redirect_error', lang: 'sv', tool: '', platform: null, channel: 'web-app', reason: 'tool_not_found' });
  assert.equal(validatePayload(payload), true);
  assert.equal(payload.valid, false);
});

test('buildFunnelPayload genera payload válido para redirect_start', () => {
  const payload = buildFunnelPayload({ event: 'redirect_start', lang: 'it', tool: 'ollama', platform: 'linux', channel: 'official-installer' });
  assert.equal(validatePayload(payload), true);
  assert.equal(payload.valid, true);
});

// ---------------------------------------------------------------------------
// stripPII — rechaza payloads con patrones prohibidos
// ---------------------------------------------------------------------------

test('stripPII rechaza sendBeacon en value', () => {
  assert.equal(stripPII({ event: 'test', value: 'navigator.sendBeacon()' }), false);
});

test('stripPII rechaza fetch() en value', () => {
  assert.equal(stripPII({ event: 'test', value: 'fetch("https://evil.com")' }), false);
});

test('stripPII rechaza document.cookie en value', () => {
  assert.equal(stripPII({ event: 'test', value: 'document.cookie' }), false);
});

test('stripPII acepta payload limpio', () => {
  assert.equal(stripPII({ event: 'ficha_view', lang: 'es', tool: 'chatgpt' }), true);
});

// ---------------------------------------------------------------------------
// dispatchFunnelEvent + onFunnelEvent — comportamiento real
// ---------------------------------------------------------------------------

test('dispatchFunnelEvent llama a handler registrado con payload validado', () => {
  const received: any[] = [];
  onFunnelEvent((p) => received.push(p));
  dispatchFunnelEvent({ event: 'ficha_view', lang: 'es', tool: 'chatgpt', platform: 'web', channel: 'web-app' });
  assert.equal(received.length >= 1, true);
  const last = received[received.length - 1];
  assert.equal(last.event, 'ficha_view');
  assert.equal(last.lang, 'es');
  assert.equal(last.tool, 'chatgpt');
});

test('dispatchFunnelEvent descarta payload inválido (no llama handler)', () => {
  const received: any[] = [];
  onFunnelEvent((p) => received.push(p));
  const lenBefore = received.length;
  dispatchFunnelEvent({ event: 'INVALID', lang: 'es', tool: 'x', platform: 'web', channel: 'web-app' });
  assert.equal(received.length, lenBefore);
});

test('dispatchFunnelEvent sanitiza valores antes de despachar', () => {
  const received: any[] = [];
  onFunnelEvent((p) => received.push(p));
  dispatchFunnelEvent({ event: 'redirect_error', lang: 'fr', tool: 'https://evil.com', platform: 'blackberry', channel: 'torrent', reason: 'hack' });
  const last = received[received.length - 1];
  assert.equal(last.lang, 'es');
  assert.equal(last.tool, '');
  assert.equal(last.platform, null);
  assert.equal(last.channel, 'web-app');
  assert.equal(last.reason, 'unknown');
});

test('dispatchFunnelEvent no revienta con handler que lanza', () => {
  onFunnelEvent(() => { throw new Error('boom'); });
  dispatchFunnelEvent({ event: 'ficha_view', lang: 'es', tool: 'x', platform: null, channel: 'web-app' });
});

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

test('VALID_CHANNELS coincide con los tipos del catálogo (6 canales)', () => {
  const catalogTypes = ['app-store', 'documentation', 'github-repo', 'official-installer', 'official-site', 'web-app'];
  assert.deepEqual([...VALID_CHANNELS].sort(), catalogTypes.sort());
});

test('FUNNEL_EVENT_NAMES tiene exactamente 5 eventos', () => {
  assert.equal(FUNNEL_EVENT_NAMES.length, 5);
});

test('REDIRECT_ERROR_REASONS incluye unknown', () => {
  assert.ok([...REDIRECT_ERROR_REASONS].includes('unknown'));
});
