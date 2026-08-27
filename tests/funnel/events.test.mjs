import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const SOURCE = fs.readFileSync('src/utils/funnel-events.ts', 'utf8');

test('exporta VALID_LANGS con es, sv, it', () => {
  assert.match(SOURCE, /VALID_LANGS\s*=\s*\['es',\s*'sv',\s*'it'\]/);
});

test('exporta VALID_PLATFORMS con las 6 plataformas', () => {
  assert.match(SOURCE, /VALID_PLATFORMS\s*=\s*\['web',\s*'windows',\s*'mac',\s*'linux',\s*'android',\s*'ios'\]/);
});

test('exporta VALID_CHANNELS con los 7 canales', () => {
  const channels = ['official-website', 'app-store', 'github-repo', 'package-manager', 'documentation', 'official-installer', 'web-app'];
  for (const ch of channels) {
    assert.match(SOURCE, new RegExp(`'${ch.replace('-', '\\-')}'`), `canal ${ch} debe estar declarado`);
  }
});

test('exporta FUNNEL_EVENT_NAMES con los 5 eventos', () => {
  const events = ['ficha_view', 'platform_select', 'redirect_start', 'redirect_result', 'redirect_error'];
  for (const ev of events) {
    assert.match(SOURCE, new RegExp(`'${ev}'`), `evento ${ev} debe estar declarado`);
  }
});

test('exporta REDIRECT_ERROR_REASONS con las 4 razones', () => {
  const reasons = ['tool_not_found', 'platform_not_found', 'not_official', 'missing_params'];
  for (const r of reasons) {
    assert.match(SOURCE, new RegExp(`'${r}'`), `razón ${r} debe estar declarada`);
  }
});

test('exporta validatePayload como función', () => {
  assert.match(SOURCE, /export\s+function\s+validatePayload/);
});

test('exporta stripPII como función', () => {
  assert.match(SOURCE, /export\s+function\s+stripPII/);
});

test('exporta dispatchFunnelEvent como función', () => {
  assert.match(SOURCE, /export\s+function\s+dispatchFunnelEvent/);
});

test('exporta onFunnelEvent como función', () => {
  assert.match(SOURCE, /export\s+function\s+onFunnelEvent/);
});

test('validatePayload verifica ALLOWED_FIELDS', () => {
  assert.match(SOURCE, /ALLOWED_FIELDS/);
  const allowedMatch = SOURCE.match(/ALLOWED_FIELDS\s*=\s*new\s+Set\(\[([\s\S]*?)\]\)/);
  assert.ok(allowedMatch, 'ALLOWED_FIELDS debe existir como Set');
  const fields = allowedMatch[1].split(',').map(f => f.trim().replace(/['"]/g, '')).filter(Boolean);
  const expected = ['event', 'lang', 'tool', 'platform', 'channel', 'valid', 'reason'];
  assert.deepEqual(fields.sort(), expected.sort());
});

test('dispatchFunnelEvent valida antes de despachar', () => {
  const fnBody = SOURCE.match(/export\s+function\s+dispatchFunnelEvent[^{]*\{([\s\S]*?)\n\}/);
  assert.ok(fnBody, 'dispatchFunnelEvent debe existir');
  assert.match(fnBody[1], /validatePayload/, 'debe llamar a validatePayload');
  assert.match(fnBody[1], /stripPII/, 'debe llamar a stripPII');
});

test('dispatchFunnelEvent despacha CustomEvent', () => {
  const fnBody = SOURCE.match(/export\s+function\s+dispatchFunnelEvent[^{]*\{([\s\S]*?)\n\}/);
  assert.ok(fnBody);
  assert.match(fnBody[1], /CustomEvent/, 'debe crear un CustomEvent');
  assert.match(fnBody[1], /fuenteai:funnel/, 'debe usar el nombre de evento fuenteai:funnel');
});

test('dispatchFunnelEvent registra handlers', () => {
  const fnBody = SOURCE.match(/export\s+function\s+dispatchFunnelEvent[^{]*\{([\s\S]*?)\n\}/);
  assert.ok(fnBody);
  assert.match(fnBody[1], /handlers/, 'debe iterar sobre handlers');
});
