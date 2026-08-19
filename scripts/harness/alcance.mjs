/**
 * Detecta qué agregó una pasada de corrección, comparando la ficha antes y
 * después. Sirve de compuerta para la verificación diferencial.
 *
 *   node scripts/harness/alcance.mjs <dirAntes> <dirDespues>
 *
 * Cada directorio tiene `base.json` (tools-base) y `editorial.json` (tools/<lang>).
 * Imprime un JSON por stdout.
 *
 * Por qué existe: la verificación diferencial sólo mira los hallazgos que la
 * auditoría listó. Si la corrección agrega algo fuera de esa lista, ese algo
 * llega al pull request sin que nadie lo haya auditado. Detectarlo con un script
 * no cuesta nada y no se puede negociar con el modelo.
 *
 * La distinción que importa —y que se aprendió de una corrida real— es entre
 * agregar una CITA y agregar una AFIRMACIÓN:
 *
 *   - Una URL nueva en `officialSources` suele ser la corrección correcta: la
 *     skill exige que cada documento mencionado en el texto sea trazable desde
 *     la ficha. Se verifica esa fuente contra su afirmación y se sigue. Acotado.
 *   - Una entrada nueva en `editorialSections`, `faq`, `communityInsights`,
 *     `platforms` o `alternatives` es contenido que nadie auditó. Eso sí obliga
 *     a mirar antes de aprobar.
 *
 * En la corrida que motivó esto, la corrección agregó `docs/models` a
 * `officialSources` para respaldar el roster de modelos que acababa de corregir.
 * Tratar eso como "fuera de alcance" habría penalizado la corrección correcta.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const [dirAntes, dirDespues] = process.argv.slice(2);
if (!dirAntes || !dirDespues) {
  console.error('uso: alcance.mjs <dirAntes> <dirDespues>');
  process.exit(1);
}

const leer = (dir, nombre) => {
  try {
    return JSON.parse(readFileSync(join(dir, nombre), 'utf8'));
  } catch {
    return null;
  }
};

// Arrays cuyo crecimiento significa una afirmación nueva, no una cita nueva.
const AFIRMACIONES = {
  base: ['alternatives'],
  editorial: [
    'editorialSections',
    'faq',
    'communityInsights',
    'bestFor',
    'limitations',
    'safetyNotes',
  ],
};

const urlsDe = (obj) => {
  const encontradas = new Set();
  const texto = JSON.stringify(obj ?? {});
  for (const m of texto.matchAll(/https?:\/\/[^"\s\\]+/g)) {
    // Se normaliza la barra final: `example.com/docs` y `example.com/docs/` son
    // la misma fuente y no deberían contarse como una cita nueva.
    encontradas.add(m[0].replace(/\/+$/, ''));
  }
  return encontradas;
};

const antes = { base: leer(dirAntes, 'base.json'), editorial: leer(dirAntes, 'editorial.json') };
const despues = { base: leer(dirDespues, 'base.json'), editorial: leer(dirDespues, 'editorial.json') };

const urlsAntes = new Set([...urlsDe(antes.base), ...urlsDe(antes.editorial)]);
const urlsDespues = new Set([...urlsDe(despues.base), ...urlsDe(despues.editorial)]);

const urlsNuevas = [...urlsDespues].filter((u) => !urlsAntes.has(u));
const urlsQuitadas = [...urlsAntes].filter((u) => !urlsDespues.has(u));

const entradasNuevas = [];
for (const [archivo, campos] of Object.entries(AFIRMACIONES)) {
  for (const campo of campos) {
    const a = Array.isArray(antes[archivo]?.[campo]) ? antes[archivo][campo].length : 0;
    const d = Array.isArray(despues[archivo]?.[campo]) ? despues[archivo][campo].length : 0;
    if (d > a) entradasNuevas.push({ archivo, campo, antes: a, despues: d, delta: d - a });
  }
}

// Una plataforma nueva afirma que existe un canal de descarga oficial que antes
// no se declaraba. Es de las afirmaciones más fuertes que puede hacer la ficha.
const platsAntes = Object.keys(antes.base?.platforms ?? {});
const platsDespues = Object.keys(despues.base?.platforms ?? {});
const platformasNuevas = platsDespues.filter((p) => !platsAntes.includes(p));
if (platformasNuevas.length) {
  entradasNuevas.push({
    archivo: 'base',
    campo: `platforms (${platformasNuevas.join(', ')})`,
    antes: platsAntes.length,
    despues: platsDespues.length,
    delta: platformasNuevas.length,
  });
}

const salida = {
  urls_nuevas: urlsNuevas,
  urls_quitadas: urlsQuitadas,
  entradas_nuevas: entradasNuevas,
  hay_afirmaciones_nuevas: entradasNuevas.length > 0,
};

console.log(JSON.stringify(salida, null, 2));
