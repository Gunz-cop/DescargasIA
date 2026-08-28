/**
 * Contrato de la seccion de guias: `src/content/guides/<lang>/<slug>.md`.
 *
 * Lo que se protege aqui es la regla que mas caro sale romper: que una guia
 * escrita en un idioma acabe publicada en otro. El idioma sale de la CARPETA,
 * nunca del frontmatter, y el sitemap solo pone `lastmod` en URLs que existen.
 *
 * Como `tests/og-images.test.mjs`, se comprueba en dos niveles: sin `dist/`
 * solo se validan las fuentes; con `npm run test:build` tambien el build.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import { getSitemapDates } from '../scripts/get-sitemap-dates.mjs';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const GUIDES = path.join(ROOT, 'src', 'content', 'guides');
const SITE = 'https://fuenteai.com';
const LANGS = ['es', 'sv', 'it'];

const EXIGIR_BUILD =
  process.env.npm_lifecycle_event === 'test:build' || process.env.REQUIRE_BUILD === '1';

/** [{ lang, slug }] de las guias que existen como archivo. */
function guiasEnDisco() {
  if (!fs.existsSync(GUIDES)) return [];
  const found = [];
  for (const lang of LANGS) {
    const dir = path.join(GUIDES, lang);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.md'))) {
      found.push({ lang, slug: file.replace(/\.md$/, '') });
    }
  }
  return found;
}

test('todas las guias viven en una carpeta de idioma conocido', () => {
  if (!fs.existsSync(GUIDES)) return;

  const sueltas = fs.readdirSync(GUIDES, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name);

  assert.deepEqual(
    sueltas,
    [],
    'una guia en la raiz de src/content/guides/ no tiene idioma: muevela a <lang>/'
  );

  const carpetas = fs.readdirSync(GUIDES, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  for (const carpeta of carpetas) {
    assert.ok(LANGS.includes(carpeta), `carpeta de guias con idioma desconocido: ${carpeta}`);
  }
});

test('el sitemap solo fecha guias que existen como archivo', () => {
  const dates = getSitemapDates(SITE);
  const guias = guiasEnDisco();
  const esperadas = new Set(guias.map(({ lang, slug }) => `${SITE}/${lang}/guias/${slug}`));

  const fechadas = Object.keys(dates).filter((url) => url.includes('/guias/'));

  for (const url of fechadas) {
    assert.ok(esperadas.has(url), `el sitemap fecha ${url}, que no tiene archivo de guia`);
  }
  for (const url of esperadas) {
    assert.ok(fechadas.includes(url), `falta lastmod en el sitemap para ${url}`);
  }
});

test('el build solo genera guias con archivo real', (t) => {
  if (!fs.existsSync(DIST)) {
    if (EXIGIR_BUILD) assert.fail('no existe dist/: ejecuta `npm run build` antes de test:build');
    return t.skip('sin dist/');
  }

  const guias = guiasEnDisco();
  const conGuias = new Set(guias.map((guia) => guia.lang));

  for (const lang of LANGS) {
    const indice = path.join(DIST, lang, 'guias', 'index.html');
    assert.equal(
      fs.existsSync(indice),
      conGuias.has(lang),
      `/${lang}/guias ${conGuias.has(lang) ? 'deberia' : 'NO deberia'} generarse`
    );

    const dir = path.join(DIST, lang, 'guias');
    if (!fs.existsSync(dir)) continue;

    const publicados = fs.readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
    const esperados = guias.filter((guia) => guia.lang === lang).map((guia) => guia.slug).sort();

    assert.deepEqual(publicados, esperados, `guias publicadas en /${lang}/guias no coinciden con los archivos`);
  }
});

test('la guia renderizada no deja Markdown crudo ni URLs con undefined', (t) => {
  if (!fs.existsSync(DIST)) {
    if (EXIGIR_BUILD) assert.fail('no existe dist/: ejecuta `npm run build` antes de test:build');
    return t.skip('sin dist/');
  }

  for (const { lang, slug } of guiasEnDisco()) {
    const file = path.join(DIST, lang, 'guias', slug, 'index.html');
    assert.ok(fs.existsSync(file), `no se genero ${lang}/guias/${slug}`);
    const html = fs.readFileSync(file, 'utf8');

    const body = html.split('class="fai-guide-body')[1] ?? '';
    assert.ok(body.includes('<h2'), 'el cuerpo de la guia no trae HTML renderizado');
    assert.ok(!/^\s*##\s/m.test(body.replace(/<[^>]+>/g, '')), 'quedo Markdown crudo en el cuerpo');

    assert.ok(!html.includes('/undefined'), 'hay una URL con undefined en la guia');
    assert.ok(
      html.includes(`<link rel="canonical" href="${SITE}/${lang}/guias/${slug}"`),
      'canonical no autorreferencial'
    );
    assert.ok(html.includes('"@type":"Article"'), 'falta el JSON-LD de la guia');
  }
});
