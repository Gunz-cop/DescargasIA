/**
 * Cada og:image que el sitio anuncia tiene que existir en el build.
 *
 * El defecto que motiva este test: `BaseLayout` declaraba por defecto
 * `https://fuenteai.com/og-default.png`, ese fichero no existia, y ninguna
 * ficha traia `screenshotUrl`. El sitio entero anunciaba una imagen que
 * devolvia 404, y ningun test lo veia porque el HTML era valido.
 *
 * Se comprueba en dos niveles, igual que `tests/agents/catalogo-campos.test.mjs`,
 * porque `npm test` corre ANTES de `astro build` tanto en ci.yml como en el
 * ciclo de trabajo local:
 *   - sin build, se salta;
 *   - con `npm run test:build`, que corre DESPUES de `astro build`, la ausencia
 *     de dist/ deja de ser un skip y pasa a ser un fallo.
 *
 * Sin ese segundo nivel el test no comprueba nada en CI; con un `assert` duro
 * en el primero, CI falla en todos los PR aunque el sitio este bien.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const SITE_ORIGIN = 'https://fuenteai.com';

/** `npm run test:build` exige que el build exista en vez de saltarse. */
const EXIGIR_BUILD =
  process.env.npm_lifecycle_event === 'test:build' || process.env.REQUIRE_BUILD === '1';

function htmlFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? htmlFiles(file) : entry.name.endsWith('.html') ? [file] : [];
  });
}

test('cada og:image local del build apunta a un fichero existente en dist', (t) => {
  // Solo bajo `test:build`. Que dist/ exista no prueba que este al dia: un
  // build anterior deja un arbol viejo que hace fallar el test con el sitio
  // bien. La unica corrida que significa algo es la inmediatamente posterior
  // a `astro build`, y ahi la ausencia de dist/ si es un fallo.
  if (!EXIGIR_BUILD) {
    t.skip('se comprueba en `npm run test:build`, sobre el build recien hecho');
    return;
  }
  assert.ok(fs.existsSync(DIST), 'No existe dist/. Ejecuta `astro build` antes de este test.');

  const pages = htmlFiles(DIST);
  assert.ok(pages.length > 0, 'el build no generó páginas HTML');

  let pagesWithImage = 0;
  let externas = 0;
  for (const page of pages) {
    const html = fs.readFileSync(page, 'utf8');
    const match = html.match(/<meta property="og:image" content="([^"]+)"/i);
    if (!match) continue;
    pagesWithImage += 1;

    // og:image tiene que ser absoluta: varios scrapers descartan las
    // relativas en silencio.
    assert.ok(
      /^https?:\/\//.test(match[1]),
      `${path.relative(DIST, page)} declara una og:image relativa: ${match[1]}`
    );

    const imageUrl = new URL(match[1]);
    if (imageUrl.origin !== SITE_ORIGIN) {
      // Una ficha con `screenshotUrl` apunta fuera y su existencia no se puede
      // comprobar aqui. Se cuenta y se exige https, en vez de saltarla sin
      // dejar rastro: ese silencio es el mismo que dejo pasar el bug original.
      assert.equal(
        imageUrl.protocol,
        'https:',
        `${path.relative(DIST, page)} apunta a una og:image externa sin https: ${match[1]}`
      );
      externas += 1;
      continue;
    }

    const relative = decodeURIComponent(imageUrl.pathname).replace(/^\//, '').replaceAll('/', path.sep);
    const imagePath = path.join(DIST, relative);
    assert.ok(fs.existsSync(imagePath), `${path.relative(DIST, page)} apunta a ${imageUrl.pathname}, pero no existe en dist/`);
  }

  assert.ok(pagesWithImage > 0, 'el build no generó ninguna og:image para verificar');
  t.diagnostic(`${pagesWithImage} páginas con og:image; ${externas} externas (no verificables)`);
});
