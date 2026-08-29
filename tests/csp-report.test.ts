import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CSP_REPORT_MAX_BODY_BYTES,
  CSP_REPORT_RATE_LIMIT,
  CSP_REPORT_RATE_WINDOW_SECONDS,
  CSP_REPORT_TTL_SECONDS,
  handleCspReport
} from '../worker/csp-report.ts';

class MemoryStore {
  values = new Map<string, unknown>();
  writes: Array<{ key: string; value: string; expirationTtl: number }> = [];

  async get(key: string): Promise<unknown> {
    return this.values.get(key) ?? null;
  }

  async put(key: string, value: string, options: { expirationTtl: number }): Promise<void> {
    this.values.set(key, JSON.parse(value));
    this.writes.push({ key, value, expirationTtl: options.expirationTtl });
  }
}

function request(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request('https://fuenteai.com/api/csp-report', {
    method: 'POST',
    headers: { 'content-type': 'application/csp-report', 'cf-connecting-ip': '203.0.113.10', ...headers },
    body: JSON.stringify(body)
  });
}

test('acepta un informe CSP legado y persiste solo campos saneados con TTL de 30 días', async () => {
  const store = new MemoryStore();
  const response = await handleCspReport(
    store,
    request({
      'csp-report': {
        'document-uri': 'https://fuenteai.com/es/ollama?secret=omit',
        'effective-directive': 'script-src-elem',
        'blocked-uri': 'https://ads.example.test/path/to/creative',
        'user-agent': 'Mozilla/5.0 Chrome/123.0'
      }
    })
  );

  assert.equal(response.status, 204);
  const reportWrites = store.writes.filter((write) => write.key.startsWith('csp:report:'));
  assert.equal(reportWrites.length, 1);
  assert.equal(reportWrites[0].expirationTtl, CSP_REPORT_TTL_SECONDS);
  const record = reportWrites[0].value;
  assert.doesNotMatch(record, /secret|creative|document-uri|user-agent/);
  assert.match(record, /"path":"\/es\/ollama"/);
  assert.match(record, /"blockedOrigin":"https:\/\/ads\.example\.test"/);
  assert.match(record, /"browser":"Chrome"/);
});

test('acepta el formato Reporting API y no expone el cuerpo en la respuesta', async () => {
  const store = new MemoryStore();
  const response = await handleCspReport(
    store,
    request([{ url: 'https://fuenteai.com/', user_agent: 'Mozilla/5.0 Safari/605', body: {
      effectiveDirective: 'img-src', blockedURL: 'https://images.example.test/a.png'
    } }], { 'content-type': 'application/reports+json' })
  );

  assert.equal(response.status, 204);
  assert.equal(await response.text(), '');
});

test('rechaza método, tipo, JSON y tamaño inválidos', async () => {
  const store = new MemoryStore();
  const getResponse = await handleCspReport(store, new Request('https://fuenteai.com/api/csp-report'));
  assert.equal(getResponse.status, 405);

  const mediaResponse = await handleCspReport(
    store,
    new Request('https://fuenteai.com/api/csp-report', { method: 'POST', headers: { 'content-type': 'text/plain' }, body: '{}' })
  );
  assert.equal(mediaResponse.status, 415);

  const badJsonResponse = await handleCspReport(
    store,
    new Request('https://fuenteai.com/api/csp-report', { method: 'POST', headers: { 'content-type': 'application/json', 'cf-connecting-ip': '203.0.113.11' }, body: '{' })
  );
  assert.equal(badJsonResponse.status, 400);

  const largeResponse = await handleCspReport(
    store,
    new Request('https://fuenteai.com/api/csp-report', { method: 'POST', headers: { 'content-type': 'application/json', 'content-length': String(CSP_REPORT_MAX_BODY_BYTES + 1) }, body: '{}' })
  );
  assert.equal(largeResponse.status, 413);
});

test('aplica el límite aprobado de 30 solicitudes por minuto por IP', async () => {
  const store = new MemoryStore();
  const body = { 'csp-report': { 'document-uri': 'https://fuenteai.com/', 'effective-directive': 'script-src' } };
  for (let i = 0; i < CSP_REPORT_RATE_LIMIT; i++) {
    const response = await handleCspReport(store, request(body));
    assert.equal(response.status, 204);
  }
  const limited = await handleCspReport(store, request(body));
  assert.equal(limited.status, 429);
  assert.equal(limited.headers.get('retry-after'), String(CSP_REPORT_RATE_WINDOW_SECONDS));
});
