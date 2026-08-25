/**
 * Politica de Origin de /mcp y /a2a.
 *
 * La spec de MCP Streamable HTTP obliga a validar Origin en toda conexion para
 * prevenir DNS rebinding. La regla NO es la de worker/security.ts (exigir el
 * origen propio): los clientes MCP reales no son navegadores y no envian
 * Origin, asi que exigirlo no dejaria pasar a nadie.
 *
 * Ver docs/agent-readiness.md.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { tryAgentRoutes } from '../../worker/agents/index.ts';
import { envConCatalogo, rpc } from './fixtures/fake-env.mjs';

const LISTA = { jsonrpc: '2.0', id: 1, method: 'tools/list' };
const ENVIA = {
  jsonrpc: '2.0', id: 1, method: 'message/send',
  params: { message: { kind: 'message', role: 'user', messageId: 'm', parts: [{ kind: 'text', text: 'chatgpt' }] } }
};

for (const [ruta, cuerpo] of [['/mcp', LISTA], ['/a2a', ENVIA]]) {
  test(`${ruta}: sin Origin se permite (cliente que no es navegador)`, async () => {
    const res = await tryAgentRoutes(rpc(ruta, cuerpo), envConCatalogo());
    assert.equal(res.status, 200);
    // Sin Origin no hay nada que autorizar: tampoco se emite ACAO.
    assert.equal(res.headers.get('access-control-allow-origin'), null);
  });

  test(`${ruta}: Origin propio se permite y CORS devuelve ESE origen, no *`, async () => {
    const res = await tryAgentRoutes(
      rpc(ruta, cuerpo, { Origin: 'https://fuenteai.com' }),
      envConCatalogo()
    );
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('access-control-allow-origin'), 'https://fuenteai.com');
    assert.notEqual(res.headers.get('access-control-allow-origin'), '*');
    assert.match(res.headers.get('vary') ?? '', /Origin/);
  });

  test(`${ruta}: Origin ajeno -> 403 y ninguna cabecera CORS`, async () => {
    const res = await tryAgentRoutes(
      rpc(ruta, cuerpo, { Origin: 'https://evil.example' }),
      envConCatalogo()
    );
    assert.equal(res.status, 403);
    // Sin ACAO el navegador atacante no puede leer ni siquiera el error.
    assert.equal(res.headers.get('access-control-allow-origin'), null);
    const body = await res.json();
    assert.equal(body.error.code, -32000);
  });
}

test('/mcp: OPTIONS de un origen ajeno tampoco abre CORS', async () => {
  const req = new Request('https://fuenteai.com/mcp', {
    method: 'OPTIONS',
    headers: { Origin: 'https://evil.example' }
  });
  const res = await tryAgentRoutes(req, envConCatalogo());
  assert.equal(res.status, 403);
  assert.equal(res.headers.get('access-control-allow-origin'), null);
});

test('/mcp: OPTIONS del origen propio devuelve 204 con CORS acotado', async () => {
  const req = new Request('https://fuenteai.com/mcp', {
    method: 'OPTIONS',
    headers: { Origin: 'https://fuenteai.com' }
  });
  const res = await tryAgentRoutes(req, envConCatalogo());
  assert.equal(res.status, 204);
  assert.equal(res.headers.get('access-control-allow-origin'), 'https://fuenteai.com');
});
