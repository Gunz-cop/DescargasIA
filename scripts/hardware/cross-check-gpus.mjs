/**
 * Contrasta `src/data/hardware/gpus.json` contra una SEGUNDA fuente
 * independiente: `voidful/gpu-info-api`, que se scrapea de las tablas de
 * Wikipedia. La base del sitio se genera de TechPowerUp; si las dos fuentes
 * coinciden en la VRAM, la cifra es creíble sin abrir 369 fichas a mano.
 *
 *     curl -sSLO https://raw.githubusercontent.com/voidful/gpu-info-api/main/gpu.json
 *     node scripts/hardware/cross-check-gpus.mjs gpu.json
 *
 * No corre en el build ni forma parte de la auditoría: es una revisión que se
 * pasa cuando se refresca el snapshot, y su resultado se anota en el PR. Por eso
 * el dataset de contraste se descarga y no se commitea.
 *
 * Solo compara escritorio y workstation. Enfrentar una "RTX 4090 Laptop GPU"
 * contra la fila de escritorio de Wikipedia no valida nada: son 16 GB contra 24,
 * y confundirlas es justo el error que esta app existe para no cometer.
 */
import fs from 'node:fs';

const GPUS = 'src/data/hardware/gpus.json';
const source = process.argv[2];

if (!source) {
  console.error('Uso: node scripts/hardware/cross-check-gpus.mjs <gpu.json de voidful/gpu-info-api>');
  process.exit(2);
}

/** Tolerancia del ancho de banda: las dos fuentes redondean distinto. */
const BANDWIDTH_TOLERANCE = 0.05;

const key = (value) => String(value).toLowerCase().replace(/[^a-z0-9]/g, '');

const memory = new Map();
const bandwidth = new Map();

for (const row of Object.values(JSON.parse(fs.readFileSync(source, 'utf8')))) {
  const name = row['Model name'];
  if (!name) continue;
  const id = key(name);

  let sizes = [];
  if (row['Memory Size (GiB)']) {
    sizes = String(row['Memory Size (GiB)']).split(/[ ,]+/).map(Number).filter((size) => size > 0);
  } else if (row['Memory Size (MiB)']) {
    sizes = String(row['Memory Size (MiB)'])
      .split(/[ ,]+/)
      .map(Number)
      .filter((size) => size > 0)
      .map((size) => size / 1024);
  }
  if (sizes.length) {
    if (!memory.has(id)) memory.set(id, new Set());
    for (const size of sizes) memory.get(id).add(Math.round(size * 10) / 10);
  }

  const gbs = Number(row['Memory Bandwidth (GB/s)']);
  if (gbs > 0) {
    if (!bandwidth.has(id)) bandwidth.set(id, new Set());
    bandwidth.get(id).add(gbs);
  }
}

const gpus = JSON.parse(fs.readFileSync(GPUS, 'utf8'));

let vramCompared = 0;
let vramAgree = 0;
let bandwidthCompared = 0;
let bandwidthAgree = 0;
const vramDiff = [];
const bandwidthDiff = [];

for (const gpu of gpus) {
  if (gpu.formFactor === 'laptop' || gpu.formFactor === 'integrated') continue;

  // Wikipedia nombra las tarjetas sin la capacidad y a veces sin "GeForce".
  const candidates = [gpu.name, gpu.name.replace(/ \d+ GB$/, ''), gpu.name.replace(/^GeForce /, '')];
  const id = candidates.map(key).find((value) => memory.has(value));
  if (!id) continue;

  if (gpu.vramGb) {
    vramCompared++;
    if (memory.get(id).has(gpu.vramGb)) vramAgree++;
    else vramDiff.push(gpu.id + ': ' + gpu.vramGb + ' GB aquí, ' + [...memory.get(id)].join('/') + ' GB en la otra fuente');
  }

  if (bandwidth.has(id)) {
    bandwidthCompared++;
    const close = [...bandwidth.get(id)].some(
      (value) => Math.abs(value / gpu.bandwidthGbs - 1) < BANDWIDTH_TOLERANCE
    );
    if (close) bandwidthAgree++;
    else bandwidthDiff.push(gpu.id + ': ' + gpu.bandwidthGbs + ' GB/s aquí, ' + [...bandwidth.get(id)].join('/') + ' en la otra fuente');
  }
}

const pct = (part, total) => (total ? Math.round((part / total) * 100) : 0);

console.log('--- Contraste contra la segunda fuente ---');
console.log('VRAM:           ' + vramAgree + '/' + vramCompared + ' (' + pct(vramAgree, vramCompared) + ' %)');
console.log('Ancho de banda: ' + bandwidthAgree + '/' + bandwidthCompared + ' (' + pct(bandwidthAgree, bandwidthCompared) + ' %)');

if (vramDiff.length) {
  console.log('\nVRAM que no coincide (' + vramDiff.length + '):');
  for (const line of vramDiff) console.log('  ! ' + line);
}
if (bandwidthDiff.length) {
  console.log('\nAncho de banda que no coincide (' + bandwidthDiff.length + '):');
  for (const line of bandwidthDiff) console.log('  ! ' + line);
}

// Informativo a propósito: una discrepancia pide mirar la ficha del fabricante,
// no romper el build. Quien la mire decide si se corrige o se quita la entrada.
