/**
 * Auditoría del enlazado interno sobre el build (`dist/`).
 *
 * Se ejecuta con `npm run links:audit` DESPUÉS de `npm run build`.
 * Sale con código 1 si encuentra un error duro; los avisos no rompen nada.
 *
 * Qué comprueba y por qué — ver docs/enlazado-interno.md:
 *   1. Enlaces internos rotos, y enlaces que apuntan a una redirección.
 *   2. Páginas indexables huérfanas (0 enlaces entrantes).
 *   3. Canonical presente y autorreferencial.
 *   4. hreflang: autorreferencia, bidireccionalidad y x-default.
 *   5. El interstitial /r se enlaza siempre con rel="nofollow".
 *   6. Fichas por debajo del mínimo de enlaces entrantes (aviso).
 */
import fs from 'node:fs';
import path from 'node:path';

const DIST = 'dist';
const SITE = 'https://fuenteai.com';

/** Aviso si una ficha recibe menos enlaces internos que esto. */
const MIN_INLINKS = 5;

const errors = [];
const warnings = [];

if (!fs.existsSync(DIST)) {
  console.error('No existe dist/. Ejecuta `npm run build` antes de auditar.');
  process.exit(1);
}

// --- 1. Recolectar páginas -------------------------------------------------
const files = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name === 'index.html') files.push(full);
  }
})(DIST);

/** Ruta pública de un index.html. `dist/es/chatgpt/index.html` -> `/es/chatgpt` */
const toRoute = (file) => {
  const rel = '/' + path.relative(DIST, file).split(path.sep).join('/');
  return rel.replace(/\/index\.html$/, '') || '/';
};

const routes = new Set(files.map(toRoute));

const attrOf = (tag, name) => tag.match(new RegExp(name + '="([^"]*)"', 'i'))?.[1] ?? '';

const pages = files.map((file) => {
  const html = fs.readFileSync(file, 'utf8');
  const anchors = [...html.matchAll(/<a\b([^>]*)>/gi)].map((m) => m[1]);
  const links = anchors
    .map((tag) => ({ href: attrOf(tag, 'href'), rel: attrOf(tag, 'rel') }))
    .filter((link) => link.href.startsWith('/') && !link.href.startsWith('//'));

  return {
    route: toRoute(file),
    links,
    canonical: html.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? null,
    noindex: /<meta name="robots" content="[^"]*noindex/i.test(html),
    alternates: [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map(
      (m) => ({ hreflang: m[1], url: m[2] })
    ),
    lang: html.match(/<html lang="([^"]+)"/)?.[1] ?? null
  };
});

const byRoute = new Map(pages.map((page) => [page.route, page]));

/** Normaliza un href interno a la ruta de página que representa. */
const hrefToRoute = (href) => {
  const clean = href.split('#')[0].split('?')[0];
  if (!clean) return null;
  return clean.replace(/\/$/, '') || '/';
};

/** Convierte una URL absoluta del sitio en ruta. */
const urlToRoute = (url) => hrefToRoute(url.replace(SITE, '')) ?? '/';

// Rutas servidas que no son páginas HTML.
const NON_PAGE = new Set(['/favicon.svg', '/robots.txt', '/sitemap-index.xml', '/sitemap-0.xml']);

const REDIRECTS = new Map(
  fs.existsSync('public/_redirects')
    ? fs
        .readFileSync('public/_redirects', 'utf8')
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('#'))
        .map((line) => line.split(/\s+/))
        .map(([from, to]) => [from.replace(/\/$/, '') || '/', to])
    : []
);

// --- 2. Grafo de enlaces ---------------------------------------------------
const inlinks = new Map(pages.map((page) => [page.route, new Set()]));

for (const page of pages) {
  const seen = new Set();
  for (const link of page.links) {
    const target = hrefToRoute(link.href);
    if (!target) continue;

    // /r: noindex + querystring infinito. Debe ir siempre con nofollow.
    if (target === '/r') {
      if (!/\bnofollow\b/i.test(link.rel)) {
        errors.push(page.route + ': enlace a /r sin rel="nofollow" (' + link.href + ')');
      }
      continue;
    }

    if (NON_PAGE.has(target) || target.startsWith('/_astro') || target.startsWith('/fonts')) continue;

    if (!routes.has(target)) {
      if (REDIRECTS.has(target)) {
        errors.push(
          page.route + ': enlaza a ' + target + ', que es una redirección. Enlaza directo a ' +
            REDIRECTS.get(target) + ' y evita el salto.'
        );
      } else {
        errors.push(page.route + ': enlace interno roto -> ' + link.href);
      }
      continue;
    }

    if (target !== page.route && !seen.has(target)) {
      seen.add(target);
      inlinks.get(target).add(page.route);
    }
  }
}

// --- 3. Canonical ----------------------------------------------------------
for (const page of pages) {
  if (page.noindex) continue;
  if (!page.canonical) {
    errors.push(page.route + ': sin <link rel="canonical">');
    continue;
  }
  const canonicalRoute = urlToRoute(page.canonical);
  if (canonicalRoute !== page.route) {
    errors.push(
      page.route + ': el canonical apunta a ' + canonicalRoute +
        '. Una página que se genera debe ser canónica de sí misma, o no generarse.'
    );
  }
}

// --- 4. hreflang -----------------------------------------------------------
const HREFLANG_BY_LANG = { es: 'es-ES', sv: 'sv-SE', it: 'it-IT' };

for (const page of pages) {
  if (page.noindex || page.alternates.length === 0) continue;

  const expectedSelf = HREFLANG_BY_LANG[page.lang];
  const self = page.alternates.find((alt) => alt.hreflang === expectedSelf);
  if (!self) {
    errors.push(page.route + ': falta la autorreferencia hreflang="' + expectedSelf + '"');
  } else if (urlToRoute(self.url) !== page.route) {
    errors.push(page.route + ': la autorreferencia hreflang apunta a otra URL (' + self.url + ')');
  }

  if (!page.alternates.some((alt) => alt.hreflang === 'x-default')) {
    warnings.push(page.route + ': sin hreflang="x-default"');
  }

  // Bidireccionalidad: si A declara a B, B tiene que declarar a A.
  for (const alt of page.alternates) {
    if (alt.hreflang === 'x-default') continue;
    const targetRoute = urlToRoute(alt.url);
    const target = byRoute.get(targetRoute);
    if (!target) {
      errors.push(page.route + ': hreflang ' + alt.hreflang + ' apunta a ' + targetRoute + ', que no existe');
      continue;
    }
    const reciprocal = target.alternates.some((entry) => urlToRoute(entry.url) === page.route);
    if (!reciprocal) {
      errors.push(page.route + ': hreflang no recíproco con ' + targetRoute + ' (Google ignora el bloque entero)');
    }
  }
}

// --- 5. Huérfanas y cola larga --------------------------------------------
const indexable = pages.filter((page) => !page.noindex);

for (const page of indexable) {
  if (inlinks.get(page.route).size === 0) {
    errors.push(page.route + ': página indexable HUÉRFANA (0 enlaces internos entrantes)');
  }
}

const RESERVED = new Set(['acerca-de', 'aviso-legal', 'privacidad', 'cookies']);
const isToolRoute = (route) =>
  /^\/(es|sv|it)\/[^/]+$/.test(route) && !RESERVED.has(route.split('/').pop());

const toolPages = indexable.filter((page) => isToolRoute(page.route));

const weak = toolPages
  .map((page) => ({ route: page.route, count: inlinks.get(page.route).size }))
  .filter((entry) => entry.count < MIN_INLINKS)
  .sort((a, b) => a.count - b.count);

for (const entry of weak) {
  warnings.push(
    entry.route + ': solo ' + entry.count + ' enlaces internos entrantes (mínimo deseado ' + MIN_INLINKS + ')'
  );
}

// --- 6. Informe ------------------------------------------------------------
const counts = toolPages.map((page) => inlinks.get(page.route).size);
const avg = counts.length ? counts.reduce((a, b) => a + b, 0) / counts.length : 0;

console.log('--- Auditoria de enlazado interno ---');
console.log('Paginas en dist:        ' + pages.length);
console.log('Indexables:             ' + indexable.length);
console.log('Fichas de herramienta:  ' + toolPages.length);
console.log(
  'Enlaces entrantes por ficha: min ' + Math.min(...counts) +
    ' | media ' + avg.toFixed(1) +
    ' | max ' + Math.max(...counts)
);

if (warnings.length) {
  console.log('\nAVISOS (' + warnings.length + '):');
  for (const warning of warnings) console.log('  ! ' + warning);
}

if (errors.length) {
  console.log('\nERRORES (' + errors.length + '):');
  for (const error of errors) console.log('  x ' + error);
  console.log('\nFallo la auditoria de enlazado interno.');
  process.exit(1);
}

console.log('\nSin errores de enlazado interno.');
