#!/usr/bin/env node
/**
 * Imprime el estado real de las fases leyendo los issues de GitHub.
 *
 * Por qué existe: el tablero de `docs/app-compatibilidad-ia.md` tenía una
 * columna "Estado" que duplicaba lo que ya dicen las etiquetas de los issues.
 * Dos representaciones del mismo hecho derivan siempre, y encima obligan a
 * cada sesión a acordarse de actualizar dos sistemas. Se quitó la columna: el
 * documento describe estructura y dependencias (hechos estables, versionados)
 * y GitHub es la única fuente de verdad del estado (hecho volátil).
 *
 * Este script es la vista legible de ese estado, generada bajo demanda.
 * NO se encadena en `npm run build`: necesita red, y una compuerta de build
 * jamás debe depender de una API externa.
 *
 * Uso:
 *   node scripts/estado-fases.mjs
 *   GITHUB_TOKEN=ghp_... node scripts/estado-fases.mjs   (necesario si el repo es privado)
 */
const REPO = process.env.FASES_REPO ?? 'Gunz-cop/DescargasIA';
const ETIQUETA = 'app-compatibilidad-ia';

const SIMBOLO = {
  'estado:hecha': '✅ hecha',
  'estado:en-revision': '👀 en revisión',
  'estado:tomada': '🟨 en curso',
  'estado:lista-para-tomar': '🟢 lista para tomar',
  'estado:bloqueada': '⛔ bloqueada'
};

const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'fuenteai-estado-fases'
};
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

const url = `https://api.github.com/repos/${REPO}/issues?state=all&labels=${ETIQUETA}&per_page=100`;

let res;
try {
  res = await fetch(url, { headers });
} catch (err) {
  console.error(`✖ No se pudo consultar GitHub: ${err.message}`);
  process.exit(1);
}

if (!res.ok) {
  console.error(`✖ GitHub respondió ${res.status}.`);
  if (res.status === 404 && !process.env.GITHUB_TOKEN) {
    console.error('  Si el repositorio es privado, exportá GITHUB_TOKEN con permiso de lectura de issues.');
  }
  process.exit(1);
}

const issues = (await res.json())
  .filter((i) => !i.pull_request)
  .map((i) => ({
    num: i.number,
    titulo: i.title,
    cerrado: i.state === 'closed',
    fase: (i.labels.find((l) => l.name.startsWith('fase:'))?.name ?? 'fase:??').slice(5),
    estado: i.labels.find((l) => l.name.startsWith('estado:'))?.name,
    area: (i.labels.find((l) => l.name.startsWith('area:'))?.name ?? '').slice(5)
  }))
  .sort((a, b) => a.fase.localeCompare(b.fase));

if (issues.length === 0) {
  console.error(`✖ Ningún issue con la etiqueta "${ETIQUETA}" en ${REPO}.`);
  process.exit(1);
}

const listas = issues.filter((i) => !i.cerrado && i.estado === 'estado:lista-para-tomar');
const hechas = issues.filter((i) => i.cerrado || i.estado === 'estado:hecha');

console.log(`\nEstado de las fases — ${REPO}\n`);
for (const i of issues) {
  const marca = i.cerrado ? '✅ hecha' : (SIMBOLO[i.estado] ?? '⬜ sin estado');
  console.log(`  ${i.fase.padEnd(3)} #${String(i.num).padEnd(3)} ${marca.padEnd(20)} ${i.area.padEnd(9)} ${i.titulo}`);
}
console.log(`\n  ${hechas.length}/${issues.length} fases cerradas.`);
console.log(listas.length > 0
  ? `  Listas para tomar ahora: ${listas.map((i) => `${i.fase} (#${i.num})`).join(', ')}\n`
  : '  Ninguna fase lista para tomar: revisá qué desbloquea el último merge.\n');
