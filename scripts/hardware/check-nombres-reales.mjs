/**
 * Comprueba que la base de GPUs resuelve nombres escritos COMO LOS ESCRIBE LA
 * GENTE, que es el criterio de aceptación de `docs/fases/F1.md`: veinte nombres
 * reales, con al menos una GPU de portátil y un Apple Silicon.
 *
 *     node scripts/hardware/check-nombres-reales.mjs
 *
 * Esto NO es el matcher difuso: ese lo trae F2 (`src/lib/hardware/resolve.ts`) y
 * es el que resolverá los casos a medias, los "¿quisiste decir…?" y los que aquí
 * no aciertan. Lo que se comprueba aquí es más estrecho a propósito: que la vía
 * directa —normalizar y buscar el alias exacto— ya resuelve los casos frecuentes
 * sin necesitar puntuación difusa ni, sobre todo, la red.
 *
 * La normalización de aquí es mínima y deliberadamente tonta. Cuando F2 publique
 * la suya, este archivo debería pasar a usarla.
 */
import fs from 'node:fs';

const gpus = JSON.parse(fs.readFileSync('src/data/hardware/gpus.json', 'utf8'));
const apple = JSON.parse(fs.readFileSync('src/data/hardware/apple-silicon.json', 'utf8'));

const index = new Map();
for (const gpu of [...gpus, ...apple]) {
  for (const alias of gpu.aliases) index.set(alias, gpu);
}

/**
 * Lo que devuelve `WEBGL_debug_renderer_info` viene envuelto en ANGLE, con el id
 * PCI en hexadecimal y la cadena de Direct3D detrás. F5 alimentará el resolver
 * justo con eso, así que hay que quitarle la envoltura antes de buscar.
 */
const normalize = (value) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\(0x[0-9a-f]+\)/g, ' ')
    .replace(/^angle \((?:nvidia|amd|intel|apple|ati technologies inc\.?), ?/, '')
    .replace(/^angle metal renderer: /, '')
    .replace(/ direct3d11.*$/, '')
    .replace(/,? ?d3d11\)?$/, '')
    .replace(/,? ?unspecified version\)?$/, '')
    .replace(/[,()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** [lo que teclea o detecta el navegador, id que debe salir] */
const CASES = [
  ['3060ti', 'nvidia-geforce-rtx-3060-ti'],
  ['rtx 3060 ti', 'nvidia-geforce-rtx-3060-ti'],
  ['RTX3060Ti', 'nvidia-geforce-rtx-3060-ti'],
  ['nvidia geforce rtx 3060 ti', 'nvidia-geforce-rtx-3060-ti'],
  ['RTX 4060 Laptop GPU', 'nvidia-geforce-rtx-4060-laptop-gpu'],
  ['rtx 4060 laptop', 'nvidia-geforce-rtx-4060-laptop-gpu'],
  ['rtx 4060 portátil', 'nvidia-geforce-rtx-4060-laptop-gpu'],
  [
    'ANGLE (NVIDIA, NVIDIA GeForce RTX 4060 Laptop GPU (0x000028E0) Direct3D11 vs_5_0 ps_5_0, D3D11)',
    'nvidia-geforce-rtx-4060-laptop-gpu',
  ],
  [
    'ANGLE (NVIDIA, NVIDIA GeForce RTX 3050 Laptop GPU (0x000025A2) Direct3D11 vs_5_0 ps_5_0, D3D11)',
    'nvidia-geforce-rtx-3050-laptop-gpu',
  ],
  ['GTX 1660 Super', 'nvidia-geforce-gtx-1660-super'],
  ['gtx1650', 'nvidia-geforce-gtx-1650'],
  ['rtx 4090 sobremesa', 'nvidia-geforce-rtx-4090'],
  ['RTX 5090 desktop', 'nvidia-geforce-rtx-5090'],
  ['RTX 4090 Laptop GPU', 'nvidia-geforce-rtx-4090-laptop-gpu'],
  ['radeon rx 6600 xt', 'amd-radeon-rx-6600-xt'],
  ['7900xtx', 'amd-radeon-rx-7900-xtx'],
  ['rx 9070 xt', 'amd-radeon-rx-9070-xt'],
  ['radeon 780m', 'amd-radeon-780m'],
  ['780M', 'amd-radeon-780m'],
  ['Arc A770', 'intel-arc-a770'],
  ['intel arc b580', 'intel-arc-b580'],
  ['iris xe graphics 96eu', 'intel-iris-xe-graphics-96eu-mobile'],
  ['Apple M3 Max', 'apple-m3-max-gpu-de-30-nucleos'],
  ['ANGLE (Apple, ANGLE Metal Renderer: Apple M2 Pro, Unspecified Version)', 'apple-m2-pro'],
  ['m4 pro', 'apple-m4-pro'],
  ['tesla t4', 'nvidia-tesla-t4'],
  ['rtx a4000 desktop', 'nvidia-rtx-a4000'],
  ['rtx a4000 mobile', 'nvidia-rtx-a4000-mobile'],
];

/**
 * Y el reverso: formas cortas que NO deben resolver a nadie, porque escritorio y
 * portátil no coinciden en memoria. Resolverlas a la de escritorio —que es lo que
 * pasa si uno no lo piensa— le prometería 24 GB a quien tiene 16. F2 tiene que
 * verlas empatar y ofrecer las dos candidatas.
 */
const AMBIGUAS = [
  'rtx 4090', // 24 GB en escritorio, 16 en portátil
  'rtx 4080', // 16 contra 12
  'rtx 4070', // 12 contra 8
  'rtx 3080', // 10 contra 8
  'rtx 5070', // 12 contra 8
  'rtx 5090', // 32 contra 24
  'rtx a4000', // 16 contra 8: el mismo eje en las workstation
  'rtx 3060', // 12 contra 8 entre las dos de escritorio
];

let failed = 0;
for (const [input, expected] of CASES) {
  const hit = index.get(normalize(input));
  if (hit?.id === expected) continue;
  failed++;
  console.log('x ' + JSON.stringify(input));
  console.log('    esperado: ' + expected + '   obtenido: ' + (hit ? hit.id : '(ningún alias)'));
}

for (const input of AMBIGUAS) {
  const hit = index.get(normalize(input));
  if (!hit) continue;
  failed++;
  console.log('x ' + JSON.stringify(input) + ' debería quedar sin dueño y resuelve a ' + hit.id);
}

const total = CASES.length + AMBIGUAS.length;
console.log(
  (total - failed) + '/' + total + ' comprobaciones: ' + CASES.length + ' nombres reales resueltos, ' +
    AMBIGUAS.length + ' formas ambiguas correctamente sin dueño'
);
if (failed) process.exit(1);
