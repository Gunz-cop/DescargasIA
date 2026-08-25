/**
 * Negociacion de contenido: `Accept: text/markdown` devuelve el espejo .md.
 *
 * El caso que hay que blindar es el de las portadas: el glob "/sv/*" de
 * run_worker_first NO matchea "/sv", asi que /sv y /it devolvian HTML aunque
 * les pidieran Markdown. Ver docs/agent-readiness.md.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { tryAgentRoutes } from '../../worker/agents/index.ts';
import { markdownPathFor } from '../../worker/agents/markdown.ts';
import { fakeEnv } from './fixtures/fake-env.mjs';

/** Rutas con espejo y el .md que les corresponde. */
const ESPEJOS = [
  ['/', '/md/index.md'],
  ['/sv', '/md/sv.md'],
  ['/it', '/md/it.md'],
  ['/es/chatgpt', '/md/es/chatgpt.md'],
  ['/sv/chatgpt', '/md/sv/chatgpt.md'],
  ['/it/chatgpt', '/md/it/chatgpt.md'],
  ['/es/categoria/programacion', '/md/es/categoria/programacion.md']
];

const pedirMarkdown = (ruta) =>
  new Request(`https://fuenteai.com${ruta}`, { headers: { Accept: 'text/markdown' } });

test('markdownPathFor mapea cada ruta a su espejo, portadas incluidas', () => {
  for (const [ruta, esperado] of ESPEJOS) {
    assert.equal(markdownPathFor(ruta), esperado, `ruta ${ruta}`);
  }
  // La barra final no debe cambiar el destino.
  assert.equal(markdownPathFor('/es/chatgpt/'), '/md/es/chatgpt.md');
});

for (const [ruta, espejo] of ESPEJOS) {
  test(`Accept: text/markdown en ${ruta} sirve ${espejo}`, async () => {
    const env = fakeEnv({
      [espejo]: {
        body: `# contenido de ${ruta}`,
        // El asset lleva noindex para no competir con el canonical...
        headers: { 'Content-Type': 'text/markdown', 'X-Robots-Tag': 'noindex' }
      }
    });
    const res = await tryAgentRoutes(pedirMarkdown(ruta), env);
    assert.ok(res, `${ruta} deberia devolver una respuesta, no null`);
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /text\/markdown/);
    assert.equal(await res.text(), `# contenido de ${ruta}`);
    // ...pero esta URL si es indexable: la cabecera no debe viajar con ella.
    assert.equal(res.headers.get('x-robots-tag'), null);
    assert.match(res.headers.get('vary') ?? '', /Accept/);
  });
}

test('sin Accept: text/markdown no se toca la peticion', async () => {
  const env = fakeEnv({ '/md/index.md': { body: '# home' } });
  const res = await tryAgentRoutes(new Request('https://fuenteai.com/'), env);
  assert.equal(res, null, 'debe delegar en el router para que sirva el HTML');
});

test('una pagina sin espejo cae al HTML en vez de dar 404', async () => {
  const res = await tryAgentRoutes(pedirMarkdown('/es/acerca-de'), fakeEnv({}));
  assert.equal(res, null);
});

test('Accept compuesto de navegador no dispara Markdown', async () => {
  const req = new Request('https://fuenteai.com/', {
    headers: { Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' }
  });
  const res = await tryAgentRoutes(req, fakeEnv({ '/md/index.md': { body: '# home' } }));
  assert.equal(res, null);
});
