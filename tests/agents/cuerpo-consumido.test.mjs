/**
 * El fallo que convertia un error manejable en un 500 sin cuerpo.
 *
 * `handleMcp` y `handleA2a` leen el cuerpo de la peticion. Si despues escapaba
 * una excepcion, el catch del Worker hacia `env.ASSETS.fetch(request)` sobre
 * esa misma peticion y el runtime lanzaba "Cannot reconstruct a Request with a
 * used body": la red de seguridad se caia sola.
 *
 * La contencion vive ahora dentro de tryAgentRoutes, para que ningun router que
 * integre esta capa tenga que acordarse de replicarla.
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
import { rpc } from './fixtures/fake-env.mjs';

/** Un env cuyo ASSETS revienta: fuerza el camino de excepcion. */
const envQueRevienta = () => ({
  ASSETS: {
    async fetch() {
      throw new Error('binding roto');
    }
  }
});

test('la premisa: una peticion con el cuerpo consumido no se puede reutilizar', async () => {
  const req = rpc('/mcp', { jsonrpc: '2.0', id: 1, method: 'ping' });
  await req.json();
  assert.equal(req.bodyUsed, true);
  // Esto es lo que hacia el catch del Worker, y por eso fallaba.
  assert.throws(() => new Request(req), /already been used/i);
});

for (const ruta of ['/mcp', '/a2a']) {
  test(`${ruta}: una excepcion tras leer el cuerpo sale como JSON-RPC, no como 500 vacio`, async (t) => {
    silenciarErrores(t);
    const cuerpo = ruta === '/mcp'
      ? { jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'search_tools', arguments: {} } }
      : { jsonrpc: '2.0', id: 1, method: 'message/send', params: { message: { parts: [{ kind: 'text', text: 'x' }] } } };

    const req = rpc(ruta, cuerpo);
    let res;
    await assert.doesNotReject(async () => {
      res = await tryAgentRoutes(req, envQueRevienta());
    }, 'tryAgentRoutes no debe dejar escapar la excepcion');

    // Cuerpo consumido, como en el fallo original.
    assert.equal(req.bodyUsed, true);

    // El cuerpo se lee UNA vez: una Response tampoco se puede releer.
    const texto = await res.text();
    assert.notEqual(texto, '', 'nunca un 500 sin cuerpo');

    const body = JSON.parse(texto);
    assert.equal(body.jsonrpc, '2.0');
    // MCP contempla dos formas legitimas de fallo: un error de protocolo, o un
    // resultado marcado isError cuando lo que falla es la herramienta. Las dos
    // son legibles; lo inaceptable es la excepcion.
    assert.ok(body.error || body.result?.isError, 'debe traer un fallo JSON-RPC legible');
  });
}

test('un fallo en la negociacion Markdown devuelve null para que se sirva el HTML', async (t) => {
  silenciarErrores(t);
  // Es un GET: el cuerpo nunca se toco, asi que reintentar contra los assets es
  // seguro y lo correcto es delegar en el router.
  const req = new Request('https://fuenteai.com/es/chatgpt', { headers: { Accept: 'text/markdown' } });
  const res = await tryAgentRoutes(req, envQueRevienta());
  assert.equal(res, null);
});
