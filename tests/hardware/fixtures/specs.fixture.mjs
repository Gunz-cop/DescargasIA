/** Equipos de prueba, en la forma de `SystemSpecs` que cruza cliente ↔ Worker. */

import { byId } from './gpus.fixture.mjs';

/** Construye un `SystemSpecs` a partir de una GPU del catálogo de prueba. */
export function systemFor(gpuId, ramGb, os = 'windows') {
  const gpu = byId[gpuId];
  if (!gpu) throw new Error(`GPU de prueba desconocida: ${gpuId}`);
  return {
    gpu: {
      id: gpu.id,
      rawName: gpu.name,
      vramGb: gpu.vramGb,
      bandwidthGbs: gpu.bandwidthGbs,
      vendor: gpu.vendor,
      unifiedMemory: gpu.unifiedMemory,
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
