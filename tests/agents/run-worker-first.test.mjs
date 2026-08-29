/**
 * `run_worker_first` cubre todo lo que tiene que pasar por el Worker.
 *
 * Este test existe por un fallo real: el glob "/sv/*" NO matchea "/sv", asi que
 * las portadas sueca e italiana devolvian HTML aunque les pidieran Markdown.
 * Es un fallo de configuracion, invisible para cualquier test de runtime: solo
 * se ve mirando la lista.
 *
 * Ver docs/agent-readiness.md.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

/** JSONC -> JSON. Quita comentarios de linea que no esten dentro de una cadena. */
function parseJsonc(source) {
  return JSON.parse(source.replace(/^\s*\/\/.*$/gm, ''));
}

const config = parseJsonc(fs.readFileSync('wrangler.jsonc', 'utf8'));
const rutas = config.assets.run_worker_first ?? [];

/** ¿Cubre alguno de los patrones esta ruta exacta? */
function cubierta(ruta) {
  return rutas.some((patron) => {
    if (patron === ruta) return true;
    if (!patron.endsWith('/*')) return false;
    const prefijo = patron.slice(0, -1); // "/es/*" -> "/es/"
    return ruta.startsWith(prefijo) && ruta.length > prefijo.length;
  });
}

test('el Worker se declara como main y ASSETS tiene binding', () => {
  assert.equal(config.main, 'worker/index.ts');
  assert.equal(config.assets.binding, 'ASSETS');
});

test('los bindings de la app de hardware siguen presentes', () => {
  assert.equal(config.ai?.binding, 'AI');
  assert.deepEqual(config.kv_namespaces?.map((k) => k.binding), ['HW_CACHE']);
  assert.equal(config.vars?.AI_ENABLED, 'true');
});

test('las rutas POST llegan al Worker pese a not_found_handling', () => {
  // Con not_found_handling "404-page" el router de assets responde el 404 el
  // mismo y el Worker no se ejecuta: hay que listarlas aunque no sean archivos.
  assert.equal(config.assets.not_found_handling, '404-page');
  for (const ruta of ['/mcp', '/a2a', '/api/hw/parse', '/api/csp-report']) {
    assert.ok(cubierta(ruta), `${ruta} no pasa por el Worker`);
  }
});

test('TODAS las portadas de idioma pasan por el Worker, no solo "/"', () => {
  // El fallo original: "/sv/*" no matchea "/sv".
  for (const portada of ['/', '/sv', '/it']) {
    assert.ok(cubierta(portada), `la portada ${portada} no pasa por el Worker`);
  }
});

test('las paginas internas de los tres idiomas pasan por el Worker', () => {
  for (const ruta of ['/es/chatgpt', '/sv/chatgpt', '/it/chatgpt', '/es/categoria/programacion', '/es/hardware']) {
    assert.ok(cubierta(ruta), `${ruta} no pasa por el Worker`);
  }
});

test('"/es" queda fuera a proposito: lo resuelve el 301 de _redirects', () => {
  assert.ok(!rutas.includes('/es'), '"/es" no debe estar en run_worker_first');
  const redirects = fs.readFileSync('public/_redirects', 'utf8');
  assert.match(redirects, /^\/es\s+\/\s+301$/m, 'falta el 301 de /es en public/_redirects');
});

test('/sitemap.xml redirige al indice en vez de dar 404', () => {
  // Tres de las cinco IAs que auditaron el sitio reportaron un 404 aqui: piden
  // /sitemap.xml antes de leer la directiva Sitemap: de robots.txt.
  const redirects = fs.readFileSync('public/_redirects', 'utf8');
  assert.match(redirects, /^\/sitemap\.xml\s+\/sitemap-index\.xml\s+301$/m);

  const robots = fs.readFileSync('public/robots.txt', 'utf8');
  assert.match(robots, /^Sitemap:\s+https:\/\/fuenteai\.com\/sitemap-index\.xml$/m,
    'el destino del 301 debe ser el sitemap que robots.txt declara');
});

test('los estaticos no invocan al Worker', () => {
  for (const ruta of ['/_astro/x.css', '/fonts/x.woff2', '/md/es/chatgpt.md', '/api/catalog.json', '/.well-known/api-catalog']) {
    assert.ok(!cubierta(ruta), `${ruta} no deberia invocar al Worker`);
  }
});
