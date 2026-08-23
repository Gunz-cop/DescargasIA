#!/usr/bin/env node
/**
 * Compuerta de la metodología: valida que cada spec de fase en docs/fases/
 * sea ejecutable por una sesión sin contexto.
 *
 * No juzga el contenido — eso no se puede automatizar. Verifica lo que sí es
 * mecánico y es donde falla en la práctica: secciones que faltan, y criterios
 * de aceptación escritos como adjetivo ("la UI se ve bien") en vez de como
 * comando. Un criterio que no se puede ejecutar obliga a alguien a opinar, y
 * ahí es donde el método se rompe.
 *
 * Uso:  node .claude/skills/sdd-fases/scripts/audit-specs.mjs [dir]
 * Sale 1 si hay errores.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DIR = process.argv[2] ?? 'docs/fases';

const SECCIONES = [
  'Objetivo',
  'Contrato de entrada',
  'Contrato de salida',
  'Archivos que posee',
  'PROTEGIDOS',
  'Instrucciones',
  'Fuera de alcance',
  'Criterios de aceptación',
  'Riesgos conocidos'
];

// Un criterio vale si nombra un comando ejecutable o está marcado [manual].
const EJECUTABLE = /`[^`]*\b(npm|npx|node|bash|git|wrangler|pnpm|yarn|curl|grep)\b[^`]*`/;
const MANUAL = /\[manual\]/i;

const errores = [];
const avisos = [];

if (!existsSync(DIR)) {
  console.error(`✖ No existe el directorio de specs: ${DIR}`);
  process.exit(1);
}

const specs = readdirSync(DIR).filter((f) => /^F\d+.*\.md$/.test(f)).sort();

if (specs.length === 0) {
  console.error(`✖ ${DIR} no contiene ninguna spec (se esperan archivos F<n>*.md)`);
  process.exit(1);
}

for (const archivo of specs) {
  const ruta = join(DIR, archivo);
  const texto = readFileSync(ruta, 'utf8');
  const encabezados = [...texto.matchAll(/^##+\s+(.+)$/gm)].map((m) => m[1].trim());

  for (const seccion of SECCIONES) {
    if (!encabezados.some((h) => h.toLowerCase().startsWith(seccion.toLowerCase()))) {
      errores.push(`${ruta}: falta la sección "## ${seccion}"`);
    }
  }

  // Los criterios de aceptación son las casillas bajo esa sección.
  const bloque = texto.split(/^##+\s+Criterios de aceptación.*$/m)[1] ?? '';
  const hasta = bloque.split(/^##+\s+/m)[0] ?? '';
  const criterios = [...hasta.matchAll(/^\s*-\s*\[[ x]\]\s*(.+)$/gm)].map((m) => m[1].trim());

  if (criterios.length === 0) {
    errores.push(`${ruta}: la sección de criterios de aceptación no tiene ninguna casilla "- [ ]"`);
    continue;
  }

  const noEjecutables = criterios.filter((c) => !EJECUTABLE.test(c) && !MANUAL.test(c));
  for (const c of noEjecutables) {
    errores.push(`${ruta}: criterio no ejecutable → "${c}"\n    Escribilo como comando entre backticks, o marcalo [manual] con pasos reproducibles.`);
  }

  const manuales = criterios.filter((c) => MANUAL.test(c));
  if (manuales.length === criterios.length) {
    avisos.push(`${ruta}: todos los criterios son [manual]. Una fase sin ninguna compuerta automática suele estar mal cortada.`);
  }

  // PROTEGIDOS con contenido real, no la plantilla sin rellenar.
  const prot = (texto.split(/^##+\s+PROTEGIDOS.*$/m)[1] ?? '').split(/^##+\s+/m)[0] ?? '';
  const entradas = [...prot.matchAll(/^\s*-\s+`([^`]+)`/gm)].map((m) => m[1]);
  if (entradas.length === 0) {
    errores.push(`${ruta}: PROTEGIDOS está vacío. Como mínimo debe proteger sus propios tests y las specs.`);
  } else if (entradas.some((e) => e.includes('<') || e.includes('...'))) {
    errores.push(`${ruta}: PROTEGIDOS tiene marcadores de plantilla sin rellenar (${entradas.filter((e) => e.includes('<') || e.includes('...')).join(', ')}).`);
  }
}

for (const a of avisos) console.warn(`⚠ ${a}`);

if (errores.length > 0) {
  console.error(`\n✖ ${errores.length} problema(s) en las specs de ${DIR}:\n`);
  for (const e of errores) console.error(`  - ${e}`);
  console.error('');
  process.exit(1);
}

console.log(`✔ ${specs.length} spec(s) válidas en ${DIR}: ${specs.join(', ')}`);
