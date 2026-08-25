import test from 'node:test';
import assert from 'node:assert/strict';
import { tryAgentRoutes } from '../../worker/agents/index.ts';
import { MAX_JSON_BODY_BYTES } from '../../worker/agents/http.ts';
import { envConCatalogo } from './fixtures/fake-env.mjs';

const request = (path, body, headers = {}) =>
  new Request(`https://fuenteai.com${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
      ...headers
    },
    body
  });

for (const path of ['/mcp', '/a2a']) {
  test(`${path}: rechaza un tipo de contenido que no sea JSON`, async () => {
    const res = await tryAgentRoutes(request(path, '{}', { 'Content-Type': 'text/plain' }), envConCatalogo());
    assert.equal(res.status, 415);
    assert.equal((await res.json()).error.code, -32600);
  });

  test(`${path}: rechaza un cuerpo mayor de 64 KiB aunque no haya Content-Length confiable`, async () => {
    const oversized = JSON.stringify({ jsonrpc: '2.0', method: 'ping', padding: 'x'.repeat(MAX_JSON_BODY_BYTES) });
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(oversized));
        controller.close();
      }
    });
    const res = await tryAgentRoutes(
      new Request(`https://fuenteai.com${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json, text/event-stream'
        },
        body: stream,
        duplex: 'half'
      }),
      envConCatalogo()
    );
    assert.equal(res.status, 413);
    assert.equal((await res.json()).error.code, -32000);
  });

  test(`${path}: rechaza JSON-RPC sin versión 2.0`, async () => {
    const res = await tryAgentRoutes(request(path, JSON.stringify({ id: 1, method: 'ping' })), envConCatalogo());
    assert.equal(res.status, 400);
    assert.equal((await res.json()).error.code, -32600);
  });
}

test('/mcp: Streamable HTTP rechaza lotes JSON-RPC', async () => {
  const body = JSON.stringify([{ jsonrpc: '2.0', id: 1, method: 'ping' }]);
  const res = await tryAgentRoutes(request('/mcp', body), envConCatalogo());
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error.code, -32600);
});

test('/mcp: exige que Accept anuncie JSON y SSE', async () => {
  const body = JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'ping' });
  const res = await tryAgentRoutes(request('/mcp', body, { Accept: 'application/json' }), envConCatalogo());
  assert.equal(res.status, 406);
});

test('/mcp: rechaza una versión de protocolo desconocida después del handshake', async () => {
  const body = JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'ping' });
  const res = await tryAgentRoutes(
    request('/mcp', body, { 'Mcp-Protocol-Version': '2099-01-01' }),
    envConCatalogo()
  );
  assert.equal(res.status, 400);
});
