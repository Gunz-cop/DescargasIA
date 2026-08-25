/**
 * Genera `src/data/hardware/models.json` cruzando dos archivos commiteados:
 *
 *   - `scripts/hardware/models-catalog.json`: la parte curada a mano (qué
 *     modelos entran, cómo se llaman, para qué sirven, su tag de Ollama).
 *   - `scripts/hardware/hf-models-snapshot.json`: la parte medida, que baja
 *     `fetch-hf-models.mjs` de Hugging Face.
 *
 *     node scripts/hardware/build-models.mjs
 *
 * No toca la red.
 */
import fs from 'node:fs';
import path from 'node:path';

const CATALOG = 'scripts/hardware/models-catalog.json';
const SNAPSHOT = 'scripts/hardware/hf-models-snapshot.json';
const QUANTS = 'src/data/hardware/quants.json';
const OUT = 'src/data/hardware/models.json';

const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
const quantTable = new Map(JSON.parse(fs.readFileSync(QUANTS, 'utf8')).map((q) => [q.name, q]));

const round = (value, digits) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const errors = [];
const models = [];

for (const model of catalog) {
  const hf = snapshot[model.id];
  if (!hf) {
    errors.push(model.id + ': no está en ' + SNAPSHOT + '. Corré fetch-hf-models.mjs.');
    continue;
  }

  // Nada de redondear el nombre: "8B" son 8.030.261.248 parámetros, y la
  // diferencia se nota al multiplicarla por los bits de la cuantización.
  const paramsB = round(hf.params / 1e9, 2);

  const quants = [];
  for (const [name, bytes] of Object.entries(hf.quants)) {
    // GB decimales, que es la unidad en la que Hugging Face y los repos GGUF
    // anuncian el tamaño de descarga.
    const fileSizeGb = round(bytes / 1e9, 2);
    quants.push({
      name,
      // Bits por parámetro REALES de este archivo, no los de la tabla de
      // referencia. En un modelo pequeño la tabla de embeddings pesa tanto como
      // el resto, así que un Q4_K_M de 0,6 B acaba en 5,1 bpw y no en 4,85: dar
      // por bueno el valor nominal sobreestimaría lo que cabe en la VRAM.
      bpw: round((fileSizeGb * 8) / paramsB, 2),
      fileSizeGb,
      qualityNote: quantTable.get(name)?.qualityNote,
    });
  }

  if (!quants.length) errors.push(model.id + ': ninguna cuantización con tamaño.');
  for (const field of ['numLayers', 'numKvHeads', 'headDim', 'contextMax']) {
    if (!hf[field]) errors.push(model.id + ': falta ' + field + ' en el config.json del repo.');
  }
  if (!hf.license) errors.push(model.id + ': el repo no declara licencia.');

  models.push({
    id: model.id,
    family: model.family,
    displayName: model.displayName,
    paramsB,
    ...(model.activeParamsB ? { activeParamsB: model.activeParamsB } : {}),
    numLayers: hf.numLayers,
    numKvHeads: hf.numKvHeads,
    headDim: hf.headDim,
    contextMax: hf.contextMax,
    license: hf.license,
    hfRepo: model.hfRepo,
    ...(model.ollamaTag ? { ollamaTag: model.ollamaTag } : {}),
    useCases: model.useCases,
    quants: quants.sort((a, b) => a.bpw - b.bpw),
  });
}

if (errors.length) {
  for (const error of errors) console.error('x ' + error);
  process.exit(1);
}

models.sort((a, b) => a.paramsB - b.paramsB || a.id.localeCompare(b.id));

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(models, null, 2) + '\n');

console.log(OUT + ': ' + models.length + ' modelos');
const families = [...new Set(models.map((m) => m.family))];
console.log('  familias: ' + families.join(', '));
console.log('  MoE:      ' + models.filter((m) => m.activeParamsB).length);
console.log('  de 0 a 4 B: ' + models.filter((m) => m.paramsB < 4).length);
