#!/usr/bin/env node
/**
 * Métricas objetivas para auditar fichas del catálogo DescargasIA.
 *
 * Uso:
 *   node …/metricas.mjs <slug> [slug2 ...] [--lang es] [--check-urls] [--strict]
 *   node …/metricas.mjs --catalogo [--lang es]
 *
 * Banderas:
 *   --catalogo     mide todas las fichas del idioma
 *   --check-urls   comprueba por red que cada fuente citada exista (lento)
 *   --strict       código de salida 1 si hay bloqueantes (para lazos automáticos)
 *
 * Termina con un bloque `# VEREDICTO` por ficha. Ojo con qué significa: APTO es
 * "no quedan defectos mecánicos", no "la ficha es buena". Lo que hunde una
 * revisión —una cita que no respalda su dato, dos incidentes fundidos en un
 * párrafo— sólo aparece abriendo las fuentes, y para eso el script imprime la
 * lista de afirmaciones a confirmar. Los umbrales y su lectura viven en
 * references/metricas.md.
 */

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const langIdx = args.indexOf('--lang');
const LANG = langIdx >= 0 ? args[langIdx + 1] : 'es';
const CATALOGO = args.includes('--catalogo');
const CHECK_URLS = args.includes('--check-urls');
const STRICT = args.includes('--strict');
const CROSS_LANG = args.includes('--cross-lang');
const slugs = args.filter((a, i) => !a.startsWith('--') && !(langIdx >= 0 && i === langIdx + 1));

// ---------- localizar el repo ----------
function repoRoot() {
  let dir = process.cwd();
  for (let i = 0; i < 6; i++) {
    if (fs.existsSync(path.join(dir, 'src', 'content', 'tools-base'))) return dir;
    dir = path.dirname(dir);
  }
  console.error('No encuentro src/content/tools-base. Corré esto desde la raíz del repo.');
  process.exit(1);
}
const ROOT = repoRoot();
const BASE_DIR = path.join(ROOT, 'src', 'content', 'tools-base');
const LANG_DIR = path.join(ROOT, 'src', 'content', 'tools', LANG);

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const allSlugs = fs.readdirSync(BASE_DIR).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', ''));
const langSlugs = fs.existsSync(LANG_DIR)
  ? fs.readdirSync(LANG_DIR).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', ''))
  : [];

const targets = CATALOGO ? langSlugs : slugs;
if (targets.length === 0) {
  console.error('Pasá al menos un slug, o --catalogo para medir todo.');
  process.exit(1);
}

// ---------- utilidades de texto ----------
const words = (s) => (s || '').split(/\s+/).filter(Boolean).length;

const normalize = (s) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

/** N-gramas de 5 palabras: detectan prosa reutilizada sin castigar frases cortas comunes. */
const grams = (text, n = 5) => {
  const w = normalize(text);
  const set = new Set();
  for (let i = 0; i + n <= w.length; i++) set.add(w.slice(i, i + n).join(' '));
  return set;
};

const overlap = (a, b) => {
  if (a.size === 0) return { hits: 0, pct: 0 };
  let hits = 0;
  for (const g of a) if (b.has(g)) hits++;
  return { hits, pct: (100 * hits) / a.size };
};

const prosa = (d) =>
  [d.editorialSummary, ...(d.editorialSections || []).map((s) => s.body)].filter(Boolean).join(' ');

const todoElTexto = (d) =>
  [
    d.editorialSummary,
    ...(d.editorialSections || []).map((s) => `${s.heading} ${s.body}`),
    ...(d.limitations || []),
    ...(d.safetyNotes || []),
    ...(d.bestFor || []),
    ...(d.faq || []).map((q) => `${q.question} ${q.answer}`),
    d.shortDescription,
    d.longDescription
  ]
    .filter(Boolean)
    .join(' ');

// ---------- registro: voseo vs tuteo ----------
// Sólo formas inequívocamente voseantes: la tilde es obligatoria. Un patrón
// como /us[aá]s/ matchearía "usas", que es tuteo, y entonces casi toda ficha
// daría un falso "MEZCLA" — el detector tiene que ser preciso o no sirve.
const RE_VOSEO =
  /\b(podés|tenés|usás|necesitás|conectás|hablás|preferís|querés|sabés|transcribís|escribís|revisá|consultá|fijate|acordate|instalá|evitá|verificá|elegí|tené en cuenta|fuiste vos)\b/gi;
const RE_TUTEO =
  /\b(puedes|tienes|usas|necesitas|conectas|hablas|prefieres|quieres|sabes|escribes|verifica|revisa|consulta|desconf[ií]a|instala|evita|ten en cuenta)\b/gi;

// ---------- cache de prosa del catálogo ----------
const prosaCatalogo = new Map();
for (const s of langSlugs) {
  try {
    prosaCatalogo.set(s, grams(prosa(readJson(path.join(LANG_DIR, `${s}.json`)))));
  } catch {
    /* ficha ilegible: se reporta abajo si es un target */
  }
}

// ---------- líneas repetidas literalmente en el catálogo ----------
const normLinea = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();

const indiceLineas = {};
for (const campo of ['limitations', 'safetyNotes', 'bestFor']) {
  indiceLineas[campo] = new Map();
  for (const s of langSlugs) {
    let d;
    try {
      d = readJson(path.join(LANG_DIR, `${s}.json`));
    } catch {
      continue;
    }
    for (const item of d[campo] || []) {
      const k = normLinea(item);
      if (!indiceLineas[campo].has(k)) indiceLineas[campo].set(k, []);
      indiceLineas[campo].get(k).push(s);
    }
  }
}

// ---------- informe ----------
const HOY = new Date();
const out = [];
const p = (s = '') => out.push(s);

// Corta en el último espacio antes de `max`, no a mitad de palabra: un corte
// crudo puede partir una URL citada (p.ej. "ampcode.com/docs/cli" en
// "ampcode.com/doc") y un auditor que no vuelve a abrir el archivo original
// termina reportando como defecto real algo que sólo rompió el propio recorte.
function truncar(frase, max = 110) {
  if (frase.length <= max) return frase;
  const corte = frase.slice(0, max);
  const ultimoEspacio = corte.lastIndexOf(' ');
  return (ultimoEspacio > 0 ? corte.slice(0, ultimoEspacio) : corte) + '…';
}

// Hallazgos acumulados por ficha, para el bloque de veredicto final. Existe
// porque esta skill se usa dentro de un lazo redacción→auditoría→redacción:
// un agente necesita un corte binario, no sólo una tabla de números.
const veredictos = new Map();
const urlsPorSlug = new Map();
const bloquea = (slug, msg) => {
  if (!veredictos.has(slug)) veredictos.set(slug, { bloqueantes: [], avisos: [] });
  veredictos.get(slug).bloqueantes.push(msg);
};
const avisa = (slug, msg) => {
  if (!veredictos.has(slug)) veredictos.set(slug, { bloqueantes: [], avisos: [] });
  veredictos.get(slug).avisos.push(msg);
};

p(`# Métricas de auditoría — lang=${LANG} — ${HOY.toISOString().slice(0, 10)}`);
p(`Catálogo: ${allSlugs.length} fichas base, ${langSlugs.length} traducidas a ${LANG}.`);
p();

for (const slug of targets) {
  const basePath = path.join(BASE_DIR, `${slug}.json`);
  const langPath = path.join(LANG_DIR, `${slug}.json`);
  p(`## ${slug}`);
  if (!fs.existsSync(basePath)) { p(`  ERROR: falta ${basePath}`); p(); continue; }
  if (!fs.existsSync(langPath)) { p(`  ERROR: falta ${langPath}`); p(); continue; }

  const b = readJson(basePath);
  const d = readJson(langPath);

  // --- volumen por bloque ---
  const bloques = {
    editorialSections: (d.editorialSections || []).reduce((a, s) => a + words(s.heading) + words(s.body), 0),
    faq: (d.faq || []).reduce((a, q) => a + words(q.question) + words(q.answer), 0),
    communityInsights: (d.communityInsights || []).reduce((a, c) => a + words(c.text), 0),
    editorialSummary: words(d.editorialSummary),
    longDescription: words(d.longDescription),
    limitations: (d.limitations || []).reduce((a, s) => a + words(s), 0),
    bestFor: (d.bestFor || []).reduce((a, s) => a + words(s), 0),
    safetyNotes: (d.safetyNotes || []).reduce((a, s) => a + words(s), 0),
    shortDescription: words(d.shortDescription)
  };
  const total = Object.values(bloques).reduce((a, x) => a + x, 0);
  p(`### Volumen — ${total} palabras de editorial propio`);
  for (const [k, v] of Object.entries(bloques).sort((a, b2) => b2[1] - a[1])) p(`  ${String(v).padStart(5)}  ${k}`);
  if (total < 400) bloquea(slug, `thin content: ${total} palabras de editorial propio (mínimo 400)`);
  else if (total < 700) avisa(slug, `volumen justo: ${total} palabras (el rango sano del catálogo es 700-1200)`);
  if (bloques.communityInsights === 0)
    bloquea(slug, 'sin communityInsights: es la única señal de experiencia propia que distingue la ficha de una página de enlaces');
  if (bloques.editorialSummary === 0)
    bloquea(slug, 'sin editorialSummary: la sección que sostiene el byline cae a longDescription y pierde la voz editorial');
  if (bloques.safetyNotes < 25) avisa(slug, `safetyNotes de ${bloques.safetyNotes} palabras: probablemente genérico`);

  // --- originalidad frente al resto del catálogo ---
  const mia = grams(prosa(d));
  const union = new Set();
  for (const [s, g] of prosaCatalogo) if (s !== slug) for (const x of g) union.add(x);
  const cat = overlap(mia, union);
  const porFicha = [];
  for (const [s, g] of prosaCatalogo) {
    if (s === slug) continue;
    const o = overlap(mia, g);
    if (o.hits > 0) porFicha.push([s, o.hits, o.pct]);
  }
  porFicha.sort((a, b2) => b2[1] - a[1]);
  p(`### Originalidad — solape de 5-gramas con el resto del catálogo`);
  p(`  n-gramas propios: ${mia.size}`);
  p(`  solape con el catálogo entero: ${cat.hits} (${cat.pct.toFixed(1)}%)`);
  if (porFicha.length) {
    p(`  peores coincidencias individuales:`);
    porFicha.slice(0, 5).forEach(([s, h, pc]) => p(`    ${s}: ${h} (${pc.toFixed(1)}%)`));
  } else {
    p(`  sin coincidencias con ninguna otra ficha`);
  }

  // --- duplicación interna: el insight repite lo que ya dice la ficha ---
  const ciTexto = (d.communityInsights || []).map((c) => c.text).join(' ');
  if (ciTexto) {
    const resto = [
      d.editorialSummary,
      ...(d.editorialSections || []).map((s) => s.body),
      ...(d.limitations || []),
      ...(d.safetyNotes || []),
      ...(d.faq || []).map((q) => q.answer)
    ]
      .filter(Boolean)
      .join(' ');
    const dup = overlap(grams(ciTexto), grams(resto));
    p(`### Duplicación interna — el insight repetido en el resto de la misma ficha`);
    p(`  ${dup.hits}/${grams(ciTexto).size} (${dup.pct.toFixed(1)}%)`);
    if (dup.pct > 25) bloquea(slug, `el insight reescribe la ficha: ${dup.pct.toFixed(1)}% de duplicación interna`);
    else if (dup.pct > 10) avisa(slug, `duplicación interna de ${dup.pct.toFixed(1)}%: el insight solapa con secciones existentes`);
  } else {
    p(`### Duplicación interna — sin communityInsights`);
  }

  // --- líneas idénticas a otras fichas ---
  p(`### Líneas idénticas a otras fichas`);
  let hallazgos = 0;
  for (const campo of ['limitations', 'safetyNotes', 'bestFor']) {
    for (const item of d[campo] || []) {
      const otros = (indiceLineas[campo].get(normLinea(item)) || []).filter((s) => s !== slug);
      if (otros.length) {
        hallazgos++;
        p(`  ${campo}: "${item.slice(0, 70)}…"`);
        p(`    también en: ${otros.join(', ')}`);
      }
    }
  }
  if (!hallazgos) p(`  ninguna`);
  else bloquea(slug, `${hallazgos} línea(s) idénticas a otra ficha: contenido duplicado literal`);

  // --- registro ---
  const texto = todoElTexto(d);
  const vos = (texto.match(RE_VOSEO) || []).length;
  const tu = (texto.match(RE_TUTEO) || []).length;
  const registro = vos > tu ? 'VOSEO' : tu > vos ? 'tuteo' : 'indeterminado';
  // Con la regex estricta, el catálogo es tuteo casi puro: un solo token de la
  // forma minoritaria ya es un resto sin revisar, no ruido. Umbral en 1.
  const minoria = Math.min(vos, tu);
  const mezcla = minoria >= 1;
  p(`### Registro — ${registro} (voseo=${vos}, tuteo=${tu})${mezcla ? '  ← MEZCLA dentro de la misma ficha' : ''}`);
  if (mezcla) avisa(slug, `registro mezclado (voseo=${vos}, tuteo=${tu}): texto no revisado de punta a punta`);

  // --- locale incrustado en las URLs ---
  // `tools-base` es compartido por es/it/sv, así que una URL con locale fijo
  // sólo puede ser correcta para un idioma y manda a los otros dos a una
  // página en la lengua equivocada — justo después del botón "Descargar".
  const urlsTodas = [
    ...(b.officialSources || []).map((u) => ({ u, ctx: 'officialSource' })),
    ...Object.entries(b.platforms || {}).map(([k, v]) => ({ u: v?.url, ctx: `platform:${k}` }))
  ].filter((x) => x.u);
  const conLocale = urlsTodas
    .map((x) => ({ ...x, loc: (x.u.match(/\/(es|it|sv|fr|de|pt|ja|nl|pl)(?:\/|$)/) || [])[1] }))
    .filter((x) => x.loc);
  if (conLocale.length) {
    p(`### Locale incrustado en URLs`);
    for (const x of conLocale) p(`  [${x.ctx}] locale "/${x.loc}/" → ${x.u}`);
    const ajenas = conLocale.filter((x) => x.loc !== LANG);
    if (ajenas.length)
      bloquea(
        slug,
        `${ajenas.length} URL(s) apuntan a un locale distinto de "${LANG}" (${[...new Set(ajenas.map((x) => x.loc))].join(', ')}): el lector aterriza en otro idioma tras el botón`
      );
    else avisa(slug, `URLs con locale "/${LANG}/" fijo: correctas acá, pero rompen las fichas de los otros idiomas (tools-base es compartido)`);
  }

  // --- el insight no puede tener por fuente al propio fabricante ---
  // "Qué dice la comunidad" citando el sitio de la marca no es evidencia de
  // experiencia: es marketing del vendedor con otra etiqueta.
  const dominioMarca = (() => {
    try {
      return new URL(b.officialWebsite).hostname.replace(/^www\./, '');
    } catch {
      return null;
    }
  })();
  for (const c of d.communityInsights || []) {
    let h = null;
    try {
      h = new URL(c.source).hostname.replace(/^www\./, '');
    } catch {
      bloquea(slug, `communityInsight con source ilegible: ${c.source}`);
      continue;
    }
    if (dominioMarca && (h === dominioMarca || h.endsWith(`.${dominioMarca}`)))
      bloquea(slug, `el communityInsight cita al propio fabricante (${h}) como "comunidad": es marketing, no experiencia de usuarios`);
  }

  // --- afirmaciones comprobables del insight ---
  // "Abrí la fuente y fijate si respalda lo que dice" es una instrucción que se
  // cumple a medias porque no tiene forma de fallar visiblemente. Extraer los
  // tokens duros (cifras, citas, fechas, nombres propios) la convierte en una
  // lista donde cada ítem se confirma o no se confirma, y donde saltearse uno
  // se nota. Los dos casos que se escaparon en las pruebas —una cifra que no
  // estaba en la fuente y unos nombres propios que venían de otro hecho— eran
  // exactamente tokens de esta lista.
  for (const [i, c] of (d.communityInsights || []).entries()) {
    const t = c.text || '';
    const citas = [...t.matchAll(/[«"“]([^»"”]{8,120})[»"”]/g)].map((m) => m[1].trim());
    const cifras = [...t.matchAll(/\b\d[\d.,]*\s?(?:%|por ciento|millones?|mil|dólares|USD|EUR|minutos?|créditos?|mensajes?|registros?|estrellas?|apps?|usuarios?|vulnerabilidades?)?\b/gi)]
      .map((m) => m[0].trim())
      .filter((x) => /\d/.test(x) && x.length > 1);
    const fechas = [...t.matchAll(/\b(?:enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+de\s+\d{4}\b|\b(?:19|20)\d{2}\b/gi)].map((m) => m[0]);
    // Nombres propios: secuencias capitalizadas que no arrancan oración.
    const propios = [...t.matchAll(/(?<![.!?]\s)(?<!^)\b([A-ZÁÉÍÓÚÑ][\wáéíóúñ.-]+(?:\s+[A-ZÁÉÍÓÚÑ][\wáéíóúñ.-]+)*)\b/gm)]
      .map((m) => m[1].trim())
      .filter((x) => x.length > 2 && !/^(La|El|Los|Las|Si|Un|Una|En|Y|O|Pero|Su|Este|Esta|Cuando|Otro|Otros|Según)$/i.test(x));
    const uniq = (a) => [...new Set(a)];
    const lista = [
      ...uniq(citas).map((x) => `cita textual: “${x}”`),
      ...uniq(cifras).slice(0, 12).map((x) => `cifra: ${x}`),
      ...uniq(fechas).map((x) => `fecha: ${x}`),
      ...uniq(propios).slice(0, 12).map((x) => `nombre propio: ${x}`)
    ];
    p(`### Afirmaciones a confirmar en la fuente — insight ${i + 1}`);
    p(`  FUENTE: ${c.source}`);
    p(`  Confirmá que CADA ítem aparezca en esa página. El que no aparezca viene de otro lado:`);
    for (const item of lista) p(`    [ ] ${item}`);
    if (!lista.length) p(`    (sin tokens duros: insight puramente cualitativo — revisá si aporta algo verificable)`);
    else avisa(slug, `${lista.length} afirmación(es) del insight ${i + 1} pendientes de confirmar contra ${new URL(c.source).hostname.replace(/^www\./, '')}`);
  }

  // --- cifras del cuerpo editorial sin camino a una fuente ---
  // El caso Lovable: un párrafo de sección editorial mezclaba dos incidentes y
  // remitía al insight, pero la cifra del segundo no estaba ni en el insight ni
  // en la fuente citada. Una cifra dura en la prosa que no aparece en ningún
  // insight no tiene forma de ser verificada por el lector.
  const cifrasDe = (s) =>
    [...(s || '').matchAll(/\b\d{2,}(?:[.,]\d+)*\b/g)].map((m) => m[0]).filter((x) => !/^(19|20)\d{2}$/.test(x));
  const cifrasInsights = new Set((d.communityInsights || []).flatMap((c) => cifrasDe(c.text)));
  const huerfanas = [];
  for (const s of d.editorialSections || []) {
    for (const n of cifrasDe(s.body)) {
      if (!cifrasInsights.has(n) && !huerfanas.some((h) => h.n === n)) huerfanas.push({ n, h: s.heading });
    }
  }
  if (huerfanas.length && (d.communityInsights || []).length) {
    p(`### Cifras del cuerpo editorial que no están en ningún insight`);
    for (const { n, h } of huerfanas) p(`  ${n}  — en la sección "${h}"`);
    p(`  Si alguna sostiene un hecho distinto del que cubre la fuente citada, necesita fuente propia.`);
    avisa(slug, `${huerfanas.length} cifra(s) en secciones editoriales sin camino a una fuente: ${huerfanas.map((x) => x.n).join(', ')}`);
  }

  // --- fuentes a verificar a mano ---
  p(`### Fuentes citadas (abrir cada una y buscar la afirmación exacta)`);
  const fuentes = [
    ...(d.communityInsights || []).map((c) => ({ url: c.source, ctx: 'communityInsight', date: c.date, text: c.text })),
    ...(b.officialSources || []).map((u) => ({ url: u, ctx: 'officialSource' })),
    ...Object.entries(b.platforms || {}).map(([k, v]) => ({ url: v?.url, ctx: `platform:${k}` }))
  ].filter((f) => f.url);
  urlsPorSlug.set(slug, fuentes.map((f) => ({ url: f.url, ctx: f.ctx, date: f.date })));
  if (!fuentes.length) p(`  ninguna`);
  for (const f of fuentes) {
    p(`  [${f.ctx}] ${f.url}`);
    if (f.date) {
      const dt = new Date(f.date);
      const meses = Number.isNaN(dt.getTime()) ? null : (HOY - dt) / (1000 * 60 * 60 * 24 * 30.44);
      const fmt = /^\d{4}-\d{2}-\d{2}$/.test(f.date) ? '' : '  ← formato de fecha no es YYYY-MM-DD';
      // `date` es la fecha de PUBLICACIÓN del artículo citado, no la del hecho
      // que narra. Confundirlas no rompe nada visible: la ficha renderiza igual
      // y la antigüedad que se imprime abajo sale correcta sobre un dato falso.
      // Con --check-urls se contrasta contra la fecha que declara la página.
      p(`    fecha declarada de publicación: ${f.date}${meses !== null ? ` (${meses.toFixed(0)} meses de antigüedad)` : '  ← fecha inválida'}${fmt}`);
      if (meses !== null && meses > 12) {
        p(`    ANTIGÜEDAD >12 meses: verificá si la afirmación se presenta en presente sobre un producto activo`);
        if ((b.status || 'active') === 'active')
          avisa(slug, `fuente de ${meses.toFixed(0)} meses sosteniendo afirmaciones sobre un producto activo`);
      }
    }
  }

  // --- integridad y coherencia estructural ---
  p(`### Integridad`);
  const rotas = (b.alternatives || []).filter((s) => !allSlugs.includes(s));
  p(`  alternatives declaradas: ${(b.alternatives || []).length}${(b.alternatives || []).length < 3 ? '  ← pocas: la plantilla rellenará el resto por categoría' : ''}`);
  p(`  alternatives rotas: ${rotas.length ? rotas.join(', ') : 'ninguna'}`);
  if (rotas.length) bloquea(slug, `alternatives rotas: ${rotas.join(', ')}`);
  if ((b.alternatives || []).length < 3) avisa(slug, `sólo ${(b.alternatives || []).length} alternativa(s) declarada(s): la plantilla rellena el resto por categoría`);

  // Alternativas de otra categoría. Caso ElevenLabs (voz) apuntando a Runway,
  // Luma y Canva —video y diseño— mientras su propio texto nombraba otras.
  // Como la plantilla también rellena por categoría, una herramienta mal
  // categorizada envenena la sección sin que se note en ningún otro lado: por
  // eso se imprimen las categorías propias al lado.
  const misCats = new Set(b.categories || []);
  const ajenas = (b.alternatives || [])
    .filter((s) => allSlugs.includes(s))
    .map((s) => ({ s, cats: readJson(path.join(BASE_DIR, `${s}.json`)).categories || [] }))
    .filter((x) => x.cats.length && misCats.size && !x.cats.some((c) => misCats.has(c)));
  p(`  categorías propias: ${[...misCats].join(', ') || 'ninguna'}`);
  if (ajenas.length) {
    p(`  alternativas sin categoría en común: ${ajenas.map((x) => `${x.s} (${x.cats.join('/')})`).join(', ')}`);
    avisa(slug, `${ajenas.length} alternativa(s) de otra categoría: ${ajenas.map((x) => x.s).join(', ')} — o la comparación no sirve al lector, o la categoría de esta ficha está mal`);
  }
  const tiposPlat = Object.entries(b.platforms || {}).map(([k, v]) => `${k}:${v?.type}`);
  p(`  plataformas: ${tiposPlat.join(', ') || 'ninguna'}`);
  p(`  status: ${b.status || 'active'}`);
  const soloDocs = tiposPlat.length > 0 && tiposPlat.every((t) => t.endsWith(':documentation'));
  // El flag `status: discontinued` ya cambia título, meta description, panel y
  // label del CTA. Sin él, la plantilla promete una descarga que no existe.
  if (soloDocs && b.status !== 'discontinued')
    p(`  AVISO: plataformas sólo 'documentation' y status='${b.status || 'active'}' — la plantilla mostrará "Descargar" y "Fuente oficial verificada". Confirmá en el render si eso es honesto.`);
  p(`  lastReviewed: ${b.lastReviewed}${/^\d{4}-\d{2}-\d{2}$/.test(b.lastReviewed || '') ? '' : '  ← formato inesperado'}`);
  const menciones = (b.alternatives || []).length;
  // herramientas nombradas en la prosa que no están entre las alternativas declaradas
  const nombres = allSlugs.map((s) => ({ slug: s, name: (readJson(path.join(BASE_DIR, `${s}.json`)).name || '').trim() }));
  const mencionadas = nombres.filter(
    (n) => n.slug !== slug && n.name.length > 3 && new RegExp(`\\b${n.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(prosa(d))
  );
  const noEnlazadas = mencionadas.filter((n) => !(b.alternatives || []).includes(n.slug));
  if (noEnlazadas.length)
    p(`  herramientas nombradas en la prosa pero NO declaradas como alternativa: ${noEnlazadas.map((n) => n.name).join(', ')}`);
  void menciones;

  // --- coherencia interna: referencias direccionales y fuentes invocadas ---
  p(`### Coherencia interna`);
  let coherencia = 0;

  // Orden real en que [slug].astro pinta las secciones. Una ficha que dice
  // "más abajo" apuntando a algo que se renderiza antes manda al lector a
  // buscar donde no está — ya pasó tres veces en este catálogo.
  // Nombres de sección en los tres idiomas del catálogo: las fichas it/sv se
  // escriben traduciendo las es, así que el bug direccional viaja con ellas.
  const ORDEN = [
    { pos: 1, campo: 'alternatives', re: /\b(alternativas?|alternative|alternativ)\b/i },
    // "plataforma" a secas es sustantivo común en casi toda ficha ("la
    // plataforma genera el frontend"); sólo cuenta si nombra la sección.
    { pos: 2, campo: 'platforms', re: /\b(elige tu plataforma|secci[óo]n de plataformas|tabla de plataformas|scegli la tua piattaforma|v[äa]lj din plattform)\b/i },
    { pos: 3, campo: 'bestFor', re: /\b(para qué sirve|a cosa serve|vad .{0,12}passar b[äa]st)\b/i },
    { pos: 4, campo: 'editorialSummary', re: /\b(qué debes saber|cosa dovresti sapere|vad du b[öo]r veta)\b/i },
    { pos: 5, campo: 'communityInsights', re: /\b(qué dice la comunidad|cosa dice la community|vad communityn s[äa]ger)\b/i },
    { pos: 6, campo: 'editorialSections', re: /\b(guía completa|guida all'uso|guide till)\b/i },
    { pos: 7, campo: 'safetyNotes', re: /\b(seguridad y descarga|sicurezza e download|s[äa]kerhet)\b/i },
    { pos: 8, campo: 'limitations', re: /\b(límites y precauciones|limitaciones|limiti e precauzioni|begr[äa]nsningar)\b/i },
    { pos: 9, campo: 'faq', re: /\b(preguntas frecuentes|domande frequenti|vanliga fr[åa]gor)\b/i }
  ];
  const POS_CAMPO = Object.fromEntries(ORDEN.map((o) => [o.campo, o.pos]));

  // Dos exclusiones deliberadas, ambas por falsos positivos reales:
  // - "más adelante" en español casi siempre es temporal, no espacial.
  // - "por debajo" es idiomático ("usa Supabase por debajo" = under the hood).
  const RE_ABAJO =
    /\b(m[áa]s abajo|(?<!por )debajo|abajo de|al final de (la p[áa]gina|esta p[áa]gina)|pi[uù] in basso|qui sotto|sotto in questa|l[äa]ngre ned|nedan)\b/i;
  const RE_ARRIBA =
    /\b(m[áa]s arriba|arriba de|encima|al comienzo de (la p[áa]gina|esta p[áa]gina)|al principio|pi[uù] in alto|qui sopra|sopra in questa|l[äa]ngre upp|ovan)\b/i;

  // Campos con texto y la posición en que se renderizan.
  const fragmentos = [
    ...(d.bestFor || []).map((t) => ({ t, campo: 'bestFor' })),
    d.editorialSummary ? { t: d.editorialSummary, campo: 'editorialSummary' } : null,
    ...(d.communityInsights || []).map((c) => ({ t: c.text, campo: 'communityInsights' })),
    ...(d.editorialSections || []).map((s) => ({ t: s.body, campo: 'editorialSections' })),
    ...(d.safetyNotes || []).map((t) => ({ t, campo: 'safetyNotes' })),
    ...(d.limitations || []).map((t) => ({ t, campo: 'limitations' })),
    ...(d.faq || []).map((q) => ({ t: q.answer, campo: 'faq' }))
  ].filter(Boolean);

  for (const { t, campo } of fragmentos) {
    for (const frase of t.split(/(?<=[.:;])\s+/)) {
      const abajo = RE_ABAJO.test(frase);
      const arriba = RE_ARRIBA.test(frase);
      if (!abajo && !arriba) continue;
      const destino = ORDEN.find((o) => o.re.test(frase));
      if (!destino) {
        coherencia++;
        p(`  [${campo}] referencia direccional sin destino claro — verificá a mano:`);
        p(`    "${truncar(frase.trim())}"`);
        continue;
      }
      const origen = POS_CAMPO[campo];
      const realmenteAbajo = destino.pos > origen;
      const dicho = abajo ? 'abajo' : 'arriba';
      const real = realmenteAbajo ? 'abajo' : 'arriba';
      if (dicho !== real) {
        coherencia++;
        bloquea(slug, `referencia direccional invertida en ${campo}: dice "${dicho}" y ${destino.campo} está ${real}`);
        p(`  ERROR de dirección [${campo}]: dice "${dicho}" pero ${destino.campo} se renderiza ${real}.`);
        p(`    "${truncar(frase.trim())}"`);
      }
    }
  }

  // Afirmaciones que invocan un documento como respaldo: si la ficha dice
  // "según la documentación oficial", ese documento tiene que estar enlazado
  // — es literalmente lo que promete la metodología declarada del sitio.
  const RE_INVOCA = new RegExp(
    [
      'seg[úu]n (la|el|su|los|las|propia|propio)?\\s?(documentaci[óo]n|aviso|comunicado|p[áa]gina oficial|sitio oficial|centro de ayuda|soporte|fuente)',
      'verificad[oa] (en|sobre) la documentaci[óo]n',
      'secondo (la|il|le|lo)?\\s?(documentazione|avviso|sito ufficiale|pagina ufficiale|centro assistenza|fonte)',
      'enligt (den|det|deras)?\\s?(officiella )?(dokumentationen|meddelandet|webbplatsen|k[äa]llan)'
    ].join('|'),
    'gi'
  );
  const urlsDeclaradas = [...(b.officialSources || []), ...Object.values(b.platforms || {}).map((v) => v?.url)].filter(Boolean);
  let invocaciones = 0;
  for (const { t, campo } of fragmentos) {
    for (const frase of t.split(/(?<=[.:;])\s+/)) {
      if (!RE_INVOCA.test(frase)) continue;
      RE_INVOCA.lastIndex = 0;
      coherencia++;
      invocaciones++;
      p(`  [${campo}] invoca un documento como respaldo — confirmá que esté entre las fuentes enlazadas:`);
      p(`    "${truncar(frase.trim())}"`);
    }
  }
  if (invocaciones && urlsDeclaradas.length)
    p(`    (dominios enlazados hoy: ${[...new Set(urlsDeclaradas.map((u) => new URL(u).hostname.replace(/^www\./, '')))].join(', ')})`);
  if (!coherencia) p(`  sin referencias direccionales ni documentos invocados sin enlazar`);

  p();
}

// ---------- ¿existen las URLs citadas? (--check-urls) ----------
// Una fuente inventada es el fallo más probable de un redactor automático, y
// es el único de los graves que una máquina puede descartar sola. Un 404 es
// inapelable; un 403 suele ser bloqueo de bots, así que se reporta pero no
// bloquea — eso se confirma abriendo la URL en el navegador.
if (CHECK_URLS) {
  p(`# EXISTENCIA DE URLs`);
  for (const slug of targets) {
    const lista = urlsPorSlug.get(slug) ?? [];
    if (!lista.length) continue;
    p(`## ${slug}`);
    for (const { url, ctx, date } of lista) {
      let estado;
      let cuerpo = '';
      try {
        const r = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15000) });
        estado = r.status;
        // Sólo se lee el cuerpo cuando hay una fecha declarada que contrastar.
        if (r.ok && date) cuerpo = (await r.text()).slice(0, 200000);
      } catch (e) {
        estado = `sin respuesta (${e.name})`;
      }
      p(`  ${String(estado).padEnd(22)} [${ctx}] ${url}`);

      // Fecha del hecho vs. fecha del artículo. El caso Notion: la ficha
      // declaraba mayo de 2025 (cuándo cambió el precio) citando un artículo
      // publicado en junio de 2026. La antigüedad impresa era correcta sobre
      // un dato equivocado, así que ningún chequeo interno podía verla.
      if (cuerpo && date) {
        const m =
          cuerpo.match(/<meta[^>]+(?:property|name)=["'](?:article:published_time|datePublished|date|pubdate|DC\.date\.issued)["'][^>]+content=["']([^"']+)["']/i) ||
          cuerpo.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:article:published_time|datePublished)["']/i) ||
          cuerpo.match(/"datePublished"\s*:\s*"([^"]+)"/i) ||
          cuerpo.match(/<time[^>]+datetime=["']([^"']+)["']/i);
        const pub = m ? new Date(m[1]) : null;
        const dec = new Date(date);
        if (pub && !Number.isNaN(pub.getTime()) && !Number.isNaN(dec.getTime())) {
          const dias = Math.abs(pub - dec) / 86400000;
          p(`    fecha que declara la página: ${pub.toISOString().slice(0, 10)} (ficha: ${date}, ${dias.toFixed(0)} días de diferencia)`);
          if (dias > 60)
            avisa(
              slug,
              `la ficha declara ${date} pero ${new URL(url).hostname.replace(/^www\./, '')} dice ${pub.toISOString().slice(0, 10)} (${dias.toFixed(0)} días): ¿pusiste la fecha del hecho en vez de la de publicación?`
            );
        }
      }
      if (estado === 404 || estado === 410)
        bloquea(slug, `fuente inexistente (HTTP ${estado}) en ${ctx}: ${url}`);
      else if (typeof estado !== 'number')
        avisa(slug, `no se pudo resolver ${url} (${ctx}): confirmalo en el navegador`);
      else if (estado === 403 || estado === 401)
        avisa(slug, `HTTP ${estado} en ${url} (${ctx}): suele ser bloqueo de bots; abrilo en el navegador antes de darlo por roto`);
    }
  }
  p();
}

// ---------- contradicciones entre idiomas (--cross-lang) ----------
// Las fichas de un mismo slug comparten producto pero se escriben por separado,
// así que un dato corregido en un idioma se queda viejo en los otros. Ya pasó
// dos veces con Otter.ai: la ficha it decía seis idiomas de transcripción y la
// es seguía diciendo tres. Comparar cifras es tosco pero encuentra justo eso.
if (CROSS_LANG) {
  p(`# COHERENCIA ENTRE IDIOMAS`);
  const TOOLS_DIR = path.join(ROOT, 'src', 'content', 'tools');
  const idiomas = fs.readdirSync(TOOLS_DIR).filter((l) => fs.statSync(path.join(TOOLS_DIR, l)).isDirectory());
  const cifrasDe = (s) =>
    [...(s || '').matchAll(/\b\d{2,}(?:[.,]\d+)*\b/g)].map((m) => m[0]).filter((x) => !/^(19|20)\d{2}$/.test(x));

  for (const slug of targets) {
    const versiones = [];
    for (const l of idiomas) {
      const f = path.join(TOOLS_DIR, l, `${slug}.json`);
      if (!fs.existsSync(f)) continue;
      const dd = readJson(f);
      const t = todoElTexto(dd);
      versiones.push({ lang: l, cifras: new Set(cifrasDe(t)), insights: (dd.communityInsights || []).length, pal: words(t) });
    }
    p(`## ${slug}: ${versiones.map((v) => v.lang).join(', ') || 'sin versiones'}`);
    if (versiones.length < 2) {
      p(`  sólo un idioma: nada que comparar`);
      continue;
    }
    let diffs = 0;
    for (const v of versiones) {
      const otras = versiones.filter((x) => x.lang !== v.lang);
      const solo = [...v.cifras].filter((n) => otras.every((o) => !o.cifras.has(n)));
      if (solo.length) {
        diffs++;
        p(`  cifras sólo en ${v.lang}: ${solo.join(', ')}`);
      }
    }
    const nIns = [...new Set(versiones.map((v) => v.insights))];
    if (nIns.length > 1) p(`  nº de communityInsights distinto por idioma: ${versiones.map((v) => `${v.lang}=${v.insights}`).join(', ')}`);
    // Una ficha curada frente a una en crudo diverge por volumen, no por
    // contradicción: ahí la diferencia se informa pero no se avisa, o el aviso
    // aparecería en casi todo el catálogo y se volvería ruido de fondo. El caso
    // que importa es el de dos versiones comparables que dicen cosas distintas.
    const pals = versiones.map((v) => v.pal);
    const comparables = Math.max(...pals) / Math.max(1, Math.min(...pals)) <= 1.5;
    if (diffs) {
      p(`  volumen por idioma: ${versiones.map((v) => `${v.lang}=${v.pal}p`).join(', ')}`);
      if (comparables) {
        p(`  Versiones de tamaño comparable: una cifra en una sola es sospecha de dato desactualizado.`);
        avisa(slug, `cifras que no coinciden entre idiomas en versiones de volumen similar: confirmá cuál está al día`);
      } else {
        p(`  Volúmenes dispares (una curada, otra en crudo): la divergencia es esperable, no un defecto.`);
      }
    } else p(`  sin cifras divergentes`);
  }
  p();
}

// ---------- veredicto ----------
// Deliberadamente al final y en un bloque aparte: un agente que corre esto en
// lazo necesita leer un corte, y una persona necesita el detalle de arriba.
// Ojo: APTO acá significa "no quedan defectos mecánicos", no "la ficha es
// buena". Los hallazgos que hunden una revisión —una cita que no respalda su
// dato, dos incidentes fundidos en un párrafo— sólo aparecen abriendo las
// fuentes, y eso no lo puede cerrar ningún script.
p(`# VEREDICTO`);
let totalBloq = 0;
for (const slug of targets) {
  const v = veredictos.get(slug) ?? { bloqueantes: [], avisos: [] };
  totalBloq += v.bloqueantes.length;
  const estado = v.bloqueantes.length ? `NO APTO (${v.bloqueantes.length} bloqueante(s))` : v.avisos.length ? 'APTO CON AVISOS' : 'APTO';
  p(`## ${slug}: ${estado}`);
  for (const m of v.bloqueantes) p(`  BLOQUEA  ${m}`);
  for (const m of v.avisos) p(`  aviso    ${m}`);
  if (!v.bloqueantes.length)
    p(`  PENDIENTE MANUAL: abrir cada fuente citada y confirmar que respalde la afirmación exacta. Sin ese paso el veredicto no está completo.`);
}
p();
p(`Resumen: ${targets.length} ficha(s), ${totalBloq} bloqueante(s).`);

console.log(out.join('\n'));

// --strict convierte el veredicto en código de salida, para que un lazo pueda
// usar el script como compuerta sin parsear texto. Sin la bandera siempre sale
// 0: una auditoría que aborta no le sirve a la persona que la está leyendo.
if (STRICT && totalBloq > 0) process.exit(1);
