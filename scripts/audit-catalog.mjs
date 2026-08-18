/**
 * Auditoría de integridad del catálogo, sobre el CONTENIDO FUENTE.
 *
 * Se ejecuta con `npm run catalog:audit`, y `npm run build` la encadena ANTES
 * de compilar: es rápida y no necesita `dist/`, así que da el fallo sin
 * esperar al build entero.
 *
 * Complementa a `audit-internal-links.mjs`, que audita el grafo del build ya
 * generado. La diferencia importa: esta detecta contenido que NO LLEGA A
 * EXISTIR, que por definición no produce ningún enlace roto que la otra pueda
 * ver. Los tres casos que hoy se caen en silencio:
 *
 *   - `getTranslatedTools()` hace `if (!localized) return null`: una ficha de
 *     `tools-base/` sin ninguna traducción no se renderiza en ningún idioma,
 *     sin error ni aviso de Astro.
 *   - Un `tools/<lang>/<slug>.json` sin su `tools-base/<slug>.json` se ignora
 *     por completo: el trabajo editorial existe en el repo y no se publica.
 *   - `getAlternatives()` hace `if (entry && ...)`: un slug mal escrito en
 *     `alternatives` desaparece sin dejar rastro.
 *
 * Los avisos se agrupan por clase con un par de ejemplos; `--verbose` los
 * lista todos. Un muro de 60 avisos planos en cada build no lo lee nadie.
 *
 * Ver docs/enlazado-interno.md.
 */
import fs from 'node:fs';
import path from 'node:path';

const BASE_DIR = 'src/content/tools-base';
const TOOLS_DIR = 'src/content/tools';
const CATEGORIES_DIR = 'src/content/categories';
const BRAND_FILE = 'src/utils/brand.ts';

const LANGS = ['es', 'sv', 'it'];

/**
 * Una categoría con menos fichas que esto en un idioma produce bloques de
 * alternativas cortos y una página de categoría pobre. No es un fallo: es la
 * lista de lo que conviene traducir a continuación.
 */
const MIN_PER_CATEGORY = 6;

const VERBOSE = process.argv.includes('--verbose');

const errors = [];
/** Avisos agrupados: clase -> { titulo, items[] } */
const warnGroups = new Map();

const warn = (group, title, message) => {
  if (!warnGroups.has(group)) warnGroups.set(group, { title, items: [] });
  warnGroups.get(group).items.push(message);
};

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const slugsIn = (dir) =>
  fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => file.replace(/\.json$/, ''));

// --- Cargar catálogo -------------------------------------------------------
const baseSlugs = slugsIn(BASE_DIR);
const base = new Map(baseSlugs.map((slug) => [slug, readJson(path.join(BASE_DIR, slug + '.json'))]));

/** slug -> idiomas en los que existe la ficha editorial. */
const translations = new Map(baseSlugs.map((slug) => [slug, []]));
for (const lang of LANGS) {
  const dir = path.join(TOOLS_DIR, lang);
  if (!fs.existsSync(dir)) continue;
  for (const slug of slugsIn(dir)) {
    if (!translations.has(slug)) translations.set(slug, []);
    translations.get(slug).push(lang);
  }
}

const hasLang = (slug, lang) => (translations.get(slug) ?? []).includes(lang);

// Slugs de categoría declarados en brand.ts (el orden y las etiquetas viven ahí).
const brandSource = fs.readFileSync(BRAND_FILE, 'utf8');
const brandCategories = [...brandSource.matchAll(/^\s{4}slug: '([^']+)',/gm)].map((m) => m[1]);
const brandCategorySet = new Set(brandCategories);
const contentCategories = new Set(
  slugsIn(CATEGORIES_DIR).map((slug) => readJson(path.join(CATEGORIES_DIR, slug + '.json')).slug)
);

// --- 1. Base <-> traducción ------------------------------------------------
for (const [slug, langs] of translations) {
  if (!base.has(slug)) {
    errors.push(
      TOOLS_DIR + '/{' + langs.join(',') + '}/' + slug + '.json: no existe ' + BASE_DIR + '/' + slug +
        '.json. La ficha se ignora entera y no se publica en ningún idioma.'
    );
  }
}

for (const slug of baseSlugs) {
  if (!(translations.get(slug) ?? []).length) {
    errors.push(
      BASE_DIR + '/' + slug + '.json: sin ninguna traducción en ' + TOOLS_DIR +
        '/<lang>/. No se renderiza en ningún idioma, y el build no avisa.'
    );
  }
}

// --- 2. Categorías ---------------------------------------------------------
for (const [slug, data] of base) {
  const categories = data.categories ?? [];
  if (!categories.length) {
    errors.push(BASE_DIR + '/' + slug + '.json: sin categorías. Solo sería alcanzable desde la portada.');
  }
  for (const category of categories) {
    if (!brandCategorySet.has(category)) {
      errors.push(
        BASE_DIR + '/' + slug + '.json: la categoría "' + category + '" no está en CATEGORIES de ' +
          BRAND_FILE + '; la ficha no aparece en ninguna página de categoría.'
      );
    }
    if (!contentCategories.has(category)) {
      errors.push(
        BASE_DIR + '/' + slug + '.json: la categoría "' + category + '" no tiene ' + CATEGORIES_DIR +
          '/' + category + '.json, así que su página no se genera.'
      );
    }
  }
}

for (const category of brandCategories) {
  if (!contentCategories.has(category)) {
    errors.push(
      BRAND_FILE + ': la categoría "' + category + '" se enlaza desde la cabecera pero no existe ' +
        CATEGORIES_DIR + '/' + category + '.json.'
    );
  }
}
for (const category of contentCategories) {
  if (!brandCategorySet.has(category)) {
    errors.push(
      CATEGORIES_DIR + '/' + category + '.json: no está en CATEGORIES de ' + BRAND_FILE +
        ', así que su página se genera pero nadie la enlaza.'
    );
  }
}

// --- 3. Alternativas -------------------------------------------------------
const citedBy = new Map(baseSlugs.map((slug) => [slug, 0]));

for (const [slug, data] of base) {
  const seen = new Set();

  for (const alternative of data.alternatives ?? []) {
    if (alternative === slug) {
      errors.push(BASE_DIR + '/' + slug + '.json: se cita a sí misma en `alternatives`.');
      continue;
    }
    if (seen.has(alternative)) {
      warn('dup', 'Slugs repetidos dentro de `alternatives`', slug + ' repite "' + alternative + '"');
      continue;
    }
    seen.add(alternative);

    if (!base.has(alternative)) {
      errors.push(
        BASE_DIR + '/' + slug + '.json: `alternatives` apunta a "' + alternative + '", que no existe en ' +
          BASE_DIR + '. Se descarta en silencio al renderizar.'
      );
      continue;
    }
    citedBy.set(alternative, citedBy.get(alternative) + 1);

    // El bloque no se acorta por esto (el relleno rotado lo completa), pero la
    // relación que eligió el equipo editorial se pierde en ese idioma.
    const missing = (translations.get(slug) ?? []).filter((lang) => !hasLang(alternative, lang));
    if (missing.length) {
      warn(
        'alt-lang',
        'Relaciones editoriales que se pierden por falta de traducción',
        slug + ' -> ' + alternative + ' (falta en ' + missing.join(', ') + ')'
      );
    }
  }
}

const uncited = baseSlugs.filter((slug) => citedBy.get(slug) === 0);
for (const slug of uncited) {
  warn(
    'uncited',
    'Fichas que nadie cita en `alternatives` (dependen solo del relleno rotado)',
    slug
  );
}

// --- 4. Cobertura por idioma y categoría ----------------------------------
// Es lo que decide si un bloque de alternativas sale completo o cojo, y qué
// conviene traducir a continuación.
const coverage = [];
for (const lang of LANGS) {
  for (const category of brandCategories) {
    const count = baseSlugs.filter(
      (slug) => hasLang(slug, lang) && (base.get(slug).categories ?? []).includes(category)
    ).length;
    coverage.push({ lang, category, count });
    if (count > 0 && count < MIN_PER_CATEGORY) {
      warn(
        'coverage',
        'Categorías con poca cobertura (bloques de alternativas cortos)',
        lang + '/' + category + ': ' + count + ' fichas'
      );
    }
  }
}

// --- Informe ---------------------------------------------------------------
console.log('--- Auditoria de integridad del catalogo ---');
console.log('Fichas base:  ' + baseSlugs.length);
for (const lang of LANGS) {
  const total = baseSlugs.filter((slug) => hasLang(slug, lang)).length;
  const pct = Math.round((total / baseSlugs.length) * 100);
  console.log('  ' + lang + ': ' + String(total).padStart(3) + ' traducidas (' + pct + '%)');
}
console.log('Categorias:   ' + brandCategories.length);

if (warnGroups.size) {
  console.log('\nAVISOS');
  for (const { title, items } of warnGroups.values()) {
    console.log('\n  ' + title + ' (' + items.length + '):');
    const shown = VERBOSE ? items : items.slice(0, 4);
    for (const item of shown) console.log('    ! ' + item);
    if (!VERBOSE && items.length > shown.length) {
      console.log('    ... y ' + (items.length - shown.length) + ' mas (--verbose para verlos)');
    }
  }
}

if (errors.length) {
  console.log('\nERRORES (' + errors.length + '):');
  for (const error of errors) console.log('  x ' + error);
  console.log('\nFallo la auditoria de integridad del catalogo.');
  process.exit(1);
}

console.log('\nCatalogo integro.');
