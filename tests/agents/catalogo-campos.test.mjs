/**
 * Integridad de los campos que el catalogo expone a agentes.
 *
 * `safetyNotes` y `faq` son lo que impide que un cliente entregue el enlace de
 * descarga sin las advertencias que la pagina si muestra. Si una ficha se
 * publica sin ellos, el agente responde con menos cuidado que el sitio.
 *
 * Se comprueba en dos niveles porque `npm test` corre ANTES de `astro build`:
 *   - siempre, sobre el contenido fuente, que es lo que alimenta el catalogo;
 *   - ademas, sobre dist/api/catalog.json cuando ya existe un build.
 *
 * Ese segundo nivel se saltaba en un arbol limpio y no se repetia despues, asi
 * que en CI no llegaba a ejecutarse nunca. Ahora `npm run test:build` vuelve a
 * lanzar este fichero DESPUES de `astro build`, con REQUIRE_BUILD=1: con esa
 * variable, la ausencia de dist/api/catalog.json deja de ser un skip y pasa a
 * ser un fallo. Sin ella, un build que dejara de emitir el catalogo habria
 * pasado la comprobacion en silencio.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'src/content/tools-base';
const TRADUCCIONES = 'src/content/tools';
const CATALOGO_BUILD = 'dist/api/catalog.json';

const leerJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

/** Slugs con datos tecnicos publicados. */
const slugsBase = new Set(
  fs.readdirSync(BASE).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, ''))
);

/** Fichas publicadas: las que tienen traduccion, que son las que llegan al catalogo. */
const publicadas = [];
for (const lang of fs.readdirSync(TRADUCCIONES)) {
  const dir = path.join(TRADUCCIONES, lang);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.json')) continue;
    const slug = file.replace(/\.json$/, '');
    if (!slugsBase.has(slug)) continue; // sin datos base no entra al catalogo
    publicadas.push({ lang, slug, data: leerJson(path.join(dir, file)) });
  }
}

test('hay fichas publicadas que auditar', () => {
  assert.ok(publicadas.length > 0, 'no se encontro ninguna ficha traducida');
});

test('toda ficha publicada trae safetyNotes y faq no vacios', () => {
  const sinSafety = [];
  const sinFaq = [];

  for (const { lang, slug, data } of publicadas) {
    if (!Array.isArray(data.safetyNotes) || data.safetyNotes.length === 0) sinSafety.push(`${lang}/${slug}`);
    if (!Array.isArray(data.faq) || data.faq.length === 0) sinFaq.push(`${lang}/${slug}`);
  }

  assert.deepEqual(sinSafety, [], 'fichas sin safetyNotes');
  assert.deepEqual(sinFaq, [], 'fichas sin faq');
});

test('cada entrada de faq tiene pregunta y respuesta con contenido', () => {
  const malas = [];
  for (const { lang, slug, data } of publicadas) {
    for (const [i, item] of (data.faq ?? []).entries()) {
      if (!item?.question?.trim() || !item?.answer?.trim()) malas.push(`${lang}/${slug}[${i}]`);
    }
  }
  assert.deepEqual(malas, []);
});

/** `npm run test:build` la pone: exige que el build exista en vez de saltarse. */
const EXIGIR_BUILD = process.env.REQUIRE_BUILD === '1';

test('el catalogo construido expone safetyNotes y faq en todas sus entradas', (t) => {
  if (!fs.existsSync(CATALOGO_BUILD)) {
    if (EXIGIR_BUILD) {
      assert.fail(
        `No existe ${CATALOGO_BUILD}. Con REQUIRE_BUILD=1 este test corre despues de ` +
          '`astro build` y su ausencia es un fallo, no un skip.'
      );
    }
    t.skip(`sin ${CATALOGO_BUILD}: npm test corre antes de astro build. Lo valida npm run test:build.`);
    return;
  }

  const catalogo = leerJson(CATALOGO_BUILD);
  assert.equal(catalogo.tools.length, catalogo.count, 'count no coincide con las entradas');
  assert.equal(
    catalogo.tools.length,
    publicadas.length,
    'el catalogo no lista exactamente las fichas publicadas'
  );

  const sinCampos = catalogo.tools.filter(
    (t) => !Array.isArray(t.safetyNotes) || !Array.isArray(t.faq)
  );
  assert.deepEqual(sinCampos.map((t) => `${t.lang}/${t.slug}`), []);

  const faqVacia = catalogo.tools.filter((t) => t.faq.length === 0);
  assert.deepEqual(faqVacia.map((t) => `${t.lang}/${t.slug}`), [], 'entradas del catalogo sin faq');
});
