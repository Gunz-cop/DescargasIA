/**
 * Los datos reales de F1 (#6), cargados para los tests del motor.
 *
 * F2 arrancó contra fixtures inventadas porque F1 no había cerrado; cerró, y
 * el contrato de entrada de `docs/fases/F2.md` manda cambiar la importación.
 * Esto es solo el cargador: **el motor no lee archivos**, recibe los objetos
 * ya cargados, y por eso este cambio no tocó ni una línea de
 * `src/lib/hardware/`. F6 los embeberá en el Worker de otra manera y le
 * servirá el mismo motor.
 */

import fs from 'node:fs';

const DIR = 'src/data/hardware';

const leer = (nombre) => JSON.parse(fs.readFileSync(`${DIR}/${nombre}.json`, 'utf8'));

/** GPUs discretas e integradas de NVIDIA, AMD e Intel. */
export const discretas = leer('gpus');
/** Chips Apple con memoria unificada. Viven aparte en el catálogo. */
export const apple = leer('apple-silicon');
/** Lo que ve el resolver: todo lo que una persona puede escribir. */
export const gpus = [...discretas, ...apple];
export const models = leer('models');
/**
 * Tabla de referencia para la interfaz. El motor NO la usa: usa el bpw medido
 * de `ModelSpec.quants[]`, que es otra cosa y difiere hasta un 30 %.
 */
export const quants = leer('quants');

export const gpuById = Object.fromEntries(gpus.map((g) => [g.id, g]));
export const modelById = Object.fromEntries(models.map((m) => [m.id, m]));

function requerir(mapa, id, que) {
  const x = mapa[id];
  if (!x) throw new Error(`${que} "${id}" no está en el catálogo de F1`);
  return x;
}

export const gpu = (id) => requerir(gpuById, id, 'GPU');
export const model = (id) => requerir(modelById, id, 'Modelo');

/** Construye un `SystemSpecs` a partir de una GPU del catálogo. */
export function systemFor(gpuId, ramGb, os = 'windows') {
  const g = gpu(gpuId);
  return {
    gpu: {
      id: g.id,
      rawName: g.name,
      vramGb: g.vramGb ?? undefined,
      bandwidthGbs: g.bandwidthGbs,
      vendor: g.vendor,
      unifiedMemory: g.unifiedMemory,
      source: 'db'
    },
    ram: { totalGb: ramGb, source: 'user' },
    os
  };
}

/** Un equipo sin GPU declarada: solo CPU y RAM. */
export function cpuOnly(ramGb, os = 'linux') {
  return { ram: { totalGb: ramGb, source: 'user' }, os };
}
