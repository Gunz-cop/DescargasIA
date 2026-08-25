/** Presentación de los números. F2 — docs/fases/F2.md. */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  BYTES_PER_GIB,
  formatContext,
  formatGb,
  formatTps,
  formatUsage
} from '../../src/lib/hardware/format.ts';

test('los gigabytes se escriben con la coma decimal de cada idioma', () => {
  assert.equal(formatGb(4.92 * BYTES_PER_GIB, 'es'), '4,9 GB');
  assert.equal(formatGb(4.92 * BYTES_PER_GIB, 'it'), '4,9 GB');
  assert.equal(formatGb(4.92 * BYTES_PER_GIB, 'sv'), '4,9 GB');
});

test('por encima de 100 GB no se finge un decimal', () => {
  assert.equal(formatGb(127.34 * BYTES_PER_GIB, 'es'), '127 GB');
});

test('un idioma que no existe cae al español sin romperse', () => {
  assert.equal(formatGb(BYTES_PER_GIB, 'klingon'), formatGb(BYTES_PER_GIB, 'es'));
});

test('la velocidad se enseña siempre como rango', () => {
  assert.equal(formatTps({ min: 28.4, max: 42.6 }, 'es'), '28–43 tok/s');
  assert.match(formatTps({ min: 2.1, max: 3.2 }, 'es'), /^2,1–3,2 tok\/s$/);
});

test('sin velocidad conocida no se enseña nada, en vez de un cero engañoso', () => {
  assert.equal(formatTps({ min: 0, max: 0 }), '');
});

test('el contexto se nombra como lo nombran los runtimes', () => {
  assert.equal(formatContext(4096), '4k');
  assert.equal(formatContext(32768), '32k');
  assert.equal(formatContext(131072), '128k');
  assert.equal(formatContext(512), '512');
});

test('la ocupación se escribe como "usado / disponible"', () => {
  const estimate = {
    memory: { weights: 0, kvCache: 0, overhead: 0, total: 6 * BYTES_PER_GIB },
    available: 8 * BYTES_PER_GIB
  };
  assert.equal(formatUsage(estimate, 'es'), '6,0 GB / 8,0 GB');
});
