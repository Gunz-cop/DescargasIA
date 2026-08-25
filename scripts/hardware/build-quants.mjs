/**
 * Genera `src/data/hardware/quants.json`: la tabla de referencia de
 * cuantizaciones, con los bits por parámetro efectivos y una nota de calidad.
 *
 *     node scripts/hardware/build-quants.mjs
 *
 * Los `bpw` NO se copian de ninguna tabla publicada. Se miden sobre los GGUF
 * reales del snapshot, quedándose con la mediana de los modelos grandes:
 *
 *     bpw = tamaño_del_gguf x 8 / parámetros
 *
 * Por qué solo los grandes: en un modelo pequeño la tabla de embeddings —que
 * llama.cpp deja a más bits que el resto— pesa una fracción enorme del archivo,
 * y arrastra el bpw hacia arriba. Un Q4_K_M de 135 M sale a 6,3 bpw y uno de
 * 70 B a 4,8; el valor que describe la cuantización en sí es el segundo.
 *
 * Por qué medirlo en vez de citar la tabla del README de llama.cpp: esa tabla se
 * calculó sobre LLaMA-7B en 2023 y las cuantizaciones han cambiado desde
 * entonces. Q2_K ya no son 2,63 bpw sino ~3,0, porque ahora guarda a más bits
 * las matrices de atención. Citar el número viejo prometería 400 MB que no
 * existen.
 *
 * El bpw de cada modelo concreto va en su propia entrada de `models.json`, medido
 * sobre su archivo. Esta tabla es la referencia general que la interfaz enseña.
 */
import fs from 'node:fs';
import path from 'node:path';

const SNAPSHOT = 'scripts/hardware/hf-models-snapshot.json';
const OUT = 'src/data/hardware/quants.json';

/** Por debajo de esto el peso de los embeddings distorsiona la medida. */
const MIN_PARAMS_B = 20;

/**
 * El orden es de menor a mayor calidad. Las notas describen lo que le pasa al
 * modelo, no lo que ocupa: el tamaño ya está en el número de al lado.
 */
const QUALITY = {
  Q2_K:
    'Degradación severa. El modelo sigue contestando, pero razona bastante peor y se inventa más. ' +
    'Casi siempre sale mejor un modelo más pequeño en Q4_K_M que uno grande en Q2_K.',
  Q3_K_M:
    'Se nota la pérdida. Tiene sentido cuando Q4_K_M no entra y no quieres bajar de tamaño de modelo.',
  Q4_K_M:
    'El punto dulce, y la cuantización por defecto de casi todo el ecosistema local: ' +
    'la mejor relación entre lo que ocupa y lo que conserva.',
  Q5_K_M: 'Un escalón de calidad por encima de Q4_K_M, a cambio de algo más de memoria.',
  Q6_K: 'Diferencia inapreciable frente al modelo sin cuantizar en uso normal.',
  Q8_0:
    'Prácticamente idéntico al modelo original. Solo compensa si te sobra memoria: ' +
    'ocupa casi el doble que Q4_K_M.',
};

const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

const samples = new Map(Object.keys(QUALITY).map((name) => [name, []]));

for (const model of Object.values(snapshot)) {
  const paramsB = model.params / 1e9;
  if (paramsB < MIN_PARAMS_B) continue;
  for (const [name, bytes] of Object.entries(model.quants)) {
    if (!samples.has(name)) continue;
    samples.get(name).push((bytes / 1e9 / paramsB) * 8);
  }
}

const table = [];
for (const [name, qualityNote] of Object.entries(QUALITY)) {
  const values = samples.get(name);
  if (!values.length) {
    console.error('x ' + name + ': ningún modelo de ' + MIN_PARAMS_B + ' B o más lo publica.');
    process.exit(1);
  }
  table.push({ name, bpw: Math.round(median(values) * 100) / 100, qualityNote });
}

table.sort((a, b) => a.bpw - b.bpw);

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(table, null, 2) + '\n');

console.log(OUT + ': ' + table.length + ' cuantizaciones');
for (const { name, bpw } of table) {
  console.log('  ' + name.padEnd(8) + bpw + ' bpw  (mediana de ' + samples.get(name).length + ' modelos)');
}
