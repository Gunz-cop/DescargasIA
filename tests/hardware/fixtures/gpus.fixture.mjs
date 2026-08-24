/**
 * GPUs de prueba para el motor de F2.
 *
 * NO es el catálogo del producto: ese es `src/data/hardware/gpus.json` y lo
 * construye F1 (#6). Esto es el mínimo con el que se puede probar el motor
 * mientras F1 no cierre, tal como autoriza el contrato de entrada de
 * `docs/fases/F2.md`. El motor recibe objetos ya cargados, así que cambiar de
 * fixtures a los JSON de F1 no toca ni una línea de `src/lib/hardware/`.
 *
 * VRAM y ancho de banda son las cifras publicadas por el fabricante. La forma
 * de los `aliases` imita la que exige F1: cómo escribe la gente de verdad más
 * las cadenas crudas de `WEBGL_debug_renderer_info`.
 */

/** @type {import('../../../src/lib/hardware/types.ts').GpuSpec[]} */
export const gpus = [
  // --- NVIDIA GeForce, escritorio ---
  {
    id: 'nvidia-rtx-4090',
    name: 'NVIDIA GeForce RTX 4090',
    aliases: ['rtx 4090 desktop', '4090 sobremesa'],
    vendor: 'nvidia',
    vramGb: 24,
    bandwidthGbs: 1008,
    arch: 'Ada Lovelace',
    year: 2022,
    formFactor: 'desktop'
  },
  {
    id: 'nvidia-rtx-4080',
    name: 'NVIDIA GeForce RTX 4080',
    aliases: ['rtx 4080', '4080'],
    vendor: 'nvidia',
    vramGb: 16,
    bandwidthGbs: 717,
    arch: 'Ada Lovelace',
    year: 2022,
    formFactor: 'desktop'
  },
  {
    id: 'nvidia-rtx-4060',
    name: 'NVIDIA GeForce RTX 4060',
    aliases: ['rtx 4060 desktop'],
    vendor: 'nvidia',
    vramGb: 8,
    bandwidthGbs: 272,
    arch: 'Ada Lovelace',
    year: 2023,
    formFactor: 'desktop'
  },
  {
    id: 'nvidia-rtx-4060-ti-8gb',
    name: 'NVIDIA GeForce RTX 4060 Ti 8GB',
    aliases: ['rtx 4060 ti', '4060ti', 'rtx4060ti'],
    vendor: 'nvidia',
    vramGb: 8,
    bandwidthGbs: 288,
    arch: 'Ada Lovelace',
    year: 2023,
    formFactor: 'desktop'
  },
  {
    id: 'nvidia-rtx-3090',
    name: 'NVIDIA GeForce RTX 3090',
    aliases: ['rtx 3090', '3090', 'rtx3090', 'nvidia geforce rtx 3090'],
    vendor: 'nvidia',
    vramGb: 24,
    bandwidthGbs: 936,
    arch: 'Ampere',
    year: 2020,
    formFactor: 'desktop'
  },
  {
    id: 'nvidia-rtx-3080-10gb',
    name: 'NVIDIA GeForce RTX 3080 10GB',
    aliases: ['rtx 3080 desktop'],
    vendor: 'nvidia',
    vramGb: 10,
    bandwidthGbs: 760,
    arch: 'Ampere',
    year: 2020,
    formFactor: 'desktop'
  },
  {
    id: 'nvidia-rtx-3060-12gb',
    name: 'NVIDIA GeForce RTX 3060 12GB',
    aliases: ['rtx 3060 desktop'],
    vendor: 'nvidia',
    vramGb: 12,
    bandwidthGbs: 360,
    arch: 'Ampere',
    year: 2021,
    formFactor: 'desktop'
  },
  {
    id: 'nvidia-rtx-3060-ti',
    name: 'NVIDIA GeForce RTX 3060 Ti',
    aliases: ['rtx 3060 ti', '3060ti', 'rtx3060ti', 'nvidia geforce rtx 3060 ti'],
    vendor: 'nvidia',
    vramGb: 8,
    bandwidthGbs: 448,
    arch: 'Ampere',
    year: 2020,
    formFactor: 'desktop'
  },
  {
    id: 'nvidia-gtx-1080-ti',
    name: 'NVIDIA GeForce GTX 1080 Ti',
    aliases: ['gtx 1080 ti', '1080ti', 'gtx1080ti'],
    vendor: 'nvidia',
    vramGb: 11,
    bandwidthGbs: 484,
    arch: 'Pascal',
    year: 2017,
    formFactor: 'desktop'
  },
  {
    id: 'nvidia-gtx-1650',
    name: 'NVIDIA GeForce GTX 1650',
    aliases: ['gtx 1650', '1650'],
    vendor: 'nvidia',
    vramGb: 4,
    bandwidthGbs: 128,
    arch: 'Turing',
    year: 2019,
    formFactor: 'desktop'
  },

  // --- NVIDIA GeForce, portátil. El hueco que motivó el proyecto. ---
  {
    id: 'nvidia-rtx-4090-laptop',
    name: 'NVIDIA GeForce RTX 4090 Laptop GPU',
    aliases: ['rtx 4090 laptop', 'rtx 4090 mobile', '4090 portatil'],
    vendor: 'nvidia',
    vramGb: 16,
    bandwidthGbs: 576,
    arch: 'Ada Lovelace',
    year: 2023,
    formFactor: 'laptop'
  },
  {
    id: 'nvidia-rtx-4060-laptop',
    name: 'NVIDIA GeForce RTX 4060 Laptop GPU',
    aliases: [
      'rtx 4060 laptop',
      'rtx 4060 laptop gpu',
      '4060 portatil',
      'NVIDIA GeForce RTX 4060 Laptop GPU/PCIe/SSE2'
    ],
    vendor: 'nvidia',
    vramGb: 8,
    bandwidthGbs: 256,
    arch: 'Ada Lovelace',
    year: 2023,
    formFactor: 'laptop'
  },
  {
    id: 'nvidia-rtx-3060-laptop',
    name: 'NVIDIA GeForce RTX 3060 Laptop GPU',
    aliases: ['rtx 3060 laptop', 'rtx 3060 mobile', '3060 portatil'],
    vendor: 'nvidia',
    vramGb: 6,
    bandwidthGbs: 336,
    arch: 'Ampere',
    year: 2021,
    formFactor: 'laptop'
  },
  {
    id: 'nvidia-rtx-3080-laptop-16gb',
    name: 'NVIDIA GeForce RTX 3080 Laptop GPU 16GB',
    aliases: ['rtx 3080 laptop', 'rtx 3080 max-q'],
    vendor: 'nvidia',
    vramGb: 16,
    bandwidthGbs: 448,
    arch: 'Ampere',
    year: 2021,
    formFactor: 'laptop'
  },
  {
    id: 'nvidia-rtx-3050-laptop-4gb',
    name: 'NVIDIA GeForce RTX 3050 Laptop GPU 4GB',
    aliases: ['rtx 3050 laptop', '3050 portatil'],
    vendor: 'nvidia',
    vramGb: 4,
    bandwidthGbs: 192,
    arch: 'Ampere',
    year: 2022,
    formFactor: 'laptop'
  },

  // --- NVIDIA profesional ---
  {
    id: 'nvidia-rtx-a4000',
    name: 'NVIDIA RTX A4000',
    aliases: ['rtx a4000', 'a4000', 'quadro rtx a4000'],
    vendor: 'nvidia',
    vramGb: 16,
    bandwidthGbs: 448,
    arch: 'Ampere',
    year: 2021,
    formFactor: 'workstation'
  },
  {
    id: 'nvidia-tesla-t4',
    name: 'NVIDIA Tesla T4',
    aliases: ['tesla t4', 't4'],
    vendor: 'nvidia',
    vramGb: 16,
    bandwidthGbs: 320,
    arch: 'Turing',
    year: 2018,
    formFactor: 'workstation'
  },

  // --- AMD ---
  {
    id: 'amd-rx-7900-xtx',
    name: 'AMD Radeon RX 7900 XTX',
    aliases: ['rx 7900 xtx', '7900xtx', 'radeon rx 7900 xtx'],
    vendor: 'amd',
    vramGb: 24,
    bandwidthGbs: 960,
    arch: 'RDNA 3',
    year: 2022,
    formFactor: 'desktop'
  },
  {
    id: 'amd-rx-6800-xt',
    name: 'AMD Radeon RX 6800 XT',
    aliases: ['rx 6800 xt', '6800xt'],
    vendor: 'amd',
    vramGb: 16,
    bandwidthGbs: 512,
    arch: 'RDNA 2',
    year: 2020,
    formFactor: 'desktop'
  },
  {
    id: 'amd-rx-6600',
    name: 'AMD Radeon RX 6600',
    aliases: ['rx 6600', '6600'],
    vendor: 'amd',
    vramGb: 8,
    bandwidthGbs: 224,
    arch: 'RDNA 2',
    year: 2021,
    formFactor: 'desktop'
  },
  {
    id: 'amd-radeon-780m',
    name: 'AMD Radeon 780M',
    aliases: ['radeon 780m', '780m'],
    vendor: 'amd',
    bandwidthGbs: 120,
    arch: 'RDNA 3',
    year: 2023,
    formFactor: 'integrated'
  },

  // --- Intel ---
  {
    id: 'intel-arc-a770-16gb',
    name: 'Intel Arc A770 16GB',
    aliases: ['arc a770', 'a770', 'intel arc a770'],
    vendor: 'intel',
    vramGb: 16,
    bandwidthGbs: 560,
    arch: 'Alchemist',
    year: 2022,
    formFactor: 'desktop'
  },
  {
    id: 'intel-iris-xe',
    name: 'Intel Iris Xe Graphics',
    aliases: ['iris xe', 'intel iris xe graphics', 'ANGLE (Intel, Intel(R) Iris(R) Xe Graphics)'],
    vendor: 'intel',
    bandwidthGbs: 68,
    arch: 'Xe-LP',
    year: 2020,
    formFactor: 'integrated'
  },
  {
    id: 'intel-uhd-620',
    name: 'Intel UHD Graphics 620',
    aliases: ['uhd 620', 'intel uhd graphics 620'],
    vendor: 'intel',
    bandwidthGbs: 34,
    arch: 'Gen9.5',
    year: 2017,
    formFactor: 'integrated'
  },

  // --- Apple Silicon: memoria unificada, no VRAM ---
  {
    id: 'apple-m1',
    name: 'Apple M1',
    aliases: ['m1', 'apple m1'],
    vendor: 'apple',
    bandwidthGbs: 68.25,
    year: 2020,
    formFactor: 'integrated',
    unifiedMemory: true,
    unifiedUsableFraction: 0.75
  },
  {
    id: 'apple-m2',
    name: 'Apple M2',
    aliases: ['m2', 'apple m2'],
    vendor: 'apple',
    bandwidthGbs: 100,
    year: 2022,
    formFactor: 'integrated',
    unifiedMemory: true,
    unifiedUsableFraction: 0.75
  },
  {
    id: 'apple-m2-pro',
    name: 'Apple M2 Pro',
    aliases: ['m2 pro', 'apple m2 pro', 'macbook pro m2 pro'],
    vendor: 'apple',
    bandwidthGbs: 200,
    year: 2023,
    formFactor: 'integrated',
    unifiedMemory: true,
    unifiedUsableFraction: 0.75
  },
  {
    id: 'apple-m2-max',
    name: 'Apple M2 Max',
    aliases: ['m2 max', 'apple m2 max'],
    vendor: 'apple',
    bandwidthGbs: 400,
    year: 2023,
    formFactor: 'integrated',
    unifiedMemory: true,
    unifiedUsableFraction: 0.75
  },
  {
    id: 'apple-m3-max',
    name: 'Apple M3 Max',
    aliases: ['m3 max', 'apple m3 max'],
    vendor: 'apple',
    bandwidthGbs: 400,
    year: 2023,
    formFactor: 'integrated',
    unifiedMemory: true,
    unifiedUsableFraction: 0.75
  },
  {
    id: 'apple-m1-ultra',
    name: 'Apple M1 Ultra',
    aliases: ['m1 ultra', 'apple m1 ultra'],
    vendor: 'apple',
    bandwidthGbs: 800,
    year: 2022,
    formFactor: 'integrated',
    unifiedMemory: true,
    unifiedUsableFraction: 0.75
  }
];

export const byId = Object.fromEntries(gpus.map((g) => [g.id, g]));
