/**
 * Que pasa cuando /api/catalog.json no se puede leer.
 *
 * Fallo real encontrado al reverificar: el error escapaba como excepcion, la
 * red de seguridad del Worker intentaba reintentar con una peticion cuyo cuerpo
 * ya se habia consumido, y el resultado era un 500 sin cuerpo. La regla es que
 * el fallo tiene que llegar como respuesta JSON-RPC.
 *
 * Ver docs/agent-readiness.md.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * Estos casos provocan fallos a proposito, y la capa los registra con
 * console.error. Sin silenciarlos, la salida del build se llena de lineas que
 * parecen errores reales: es justo lo que ensena a ignorar los de verdad.
 */
function silenciarErrores(t) {
  const original = console.error;
  console.error = () => {};
  t.after(() => {
    console.error = original;
  });
}
import { tryAgentRoutes } from '../../worker/agents/index.ts';
import { resetCatalogCache } from '../../worker/agents/catalog.ts';
import { envSinCatalogo, rpc } from './fixtures/fake-env.mjs';

test.beforeEach(() => resetCatalogCache());

test('MCP: tools/call devuelve isError, no lanza ni da 500', async () => {
  const res = await tryAgentRoutes(
    rpc('/mcp', {
      jsonrpc: '2.0', id: 1, method: 'tools/call',
      params: { name: 'search_tools', arguments: { query: 'x' } }
    }),
    envSinCatalogo()
  );
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.jsonrpc, '2.0');
  assert.equal(body.result.isError, true);
  assert.match(body.result.content[0].text, /catalog\.json/);
});

test('A2A: message/send devuelve error JSON-RPC, no lanza ni da 500', async () => {
  const res = await tryAgentRoutes(
    rpc('/a2a', {
      jsonrpc: '2.0', id: 'a', method: 'message/send',
      params: { message: { kind: 'message', role: 'user', messageId: 'm', parts: [{ kind: 'text', text: 'musica' }] } }
    }),
    envSinCatalogo()
  );
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.jsonrpc, '2.0');
  assert.equal(body.error.code, -32603);
  assert.match(body.error.message, /catalog\.json/);
});

test('MCP: el handshake sigue funcionando sin catalogo', async () => {
  // initialize y tools/list no leen el catalogo: un catalogo caido no debe
  // impedir que un cliente se conecte y descubra las herramientas.
  for (const method of ['initialize', 'tools/list', 'ping']) {
    const res = await tryAgentRoutes(rpc('/mcp', { jsonrpc: '2.0', id: 1, method }), envSinCatalogo());
    const body = await res.json();
    assert.ok(body.result, `${method} deberia responder result`);
  }
});
