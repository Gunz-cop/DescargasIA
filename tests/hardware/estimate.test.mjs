/**
 * Casos dorados del motor determinista. F2 — docs/fases/F2.md.
 *
 * Estos números son el contrato del producto: si alguien cambia una constante
 * del motor "para que quede bonito", aquí se entera.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ENGINE_CONSTANTS,
  estimate,
  memoryBreakdown,
  offloadLayers
} from '../../src/lib/hardware/estimate.ts';
import { model, systemFor, cpuOnly } from './fixtures/catalog.mjs';

const GIB = 1024 ** 3;
const llama8b = model('llama-3.1-8b-instruct');
const llama70b = model('llama-3.3-70b-instruct');
const mixtral = model('mixtral-8x7b-instruct-v0.1');

test('el caso que rompe a las herramientas rivales: RTX 4060 Laptop 8 GB + Llama-3.1-8B-Q4_K_M', async (t) => {
  const laptop = systemFor('nvidia-geforce-rtx-4060-laptop-gpu', 16);

  await t.test('a 4k de contexto cabe entero en la VRAM', () => {
    const e = estimate(llama8b, 'Q4_K_M', laptop, 4096);
    assert.equal(e.backend, 'gpu');
    assert.notEqual(e.verdict, 'no-cabe');
    assert.ok(e.memory.total <= e.available, 'debería caber en la VRAM utilizable');
  });

  await t.test('a 32k de contexto ya NO cabe en la VRAM', () => {
    const e = estimate(llama8b, 'Q4_K_M', laptop, 32768);
    assert.notEqual(e.backend, 'gpu', 'con 32k el modelo no puede vivir solo en la GPU');
    const vramUsable = 8 * GIB * ENGINE_CONSTANTS.VRAM_USABLE_FRACTION;
    assert.ok(e.memory.total > vramUsable, 'debería exceder la VRAM utilizable');
    assert.equal(e.reason, 'contexto', 'lo que lo saca de la GPU es el KV cache');
  });

  await t.test('la diferencia entre 4k y 32k es KV cache y nada más', () => {
    const a = memoryBreakdown(llama8b, 'Q4_K_M', 4096);
    const b = memoryBreakdown(llama8b, 'Q4_K_M', 32768);
    assert.equal(a.weights, b.weights);
    assert.equal(a.overhead, b.overhead);
    assert.ok(b.kvCache > a.kvCache * 7);
    assert.equal(b.kvCache, 8 * a.kvCache, 'el KV cache crece lineal con el contexto');
  });
});

test('M2 Pro con 16 GB de memoria unificada', () => {
  const mac = systemFor('apple-m2-pro', 16, 'macos');
  const e = estimate(llama8b, 'Q4_K_M', mac, 4096);

  assert.equal(e.backend, 'unified');
  assert.equal(e.verdict, 'holgado');
  assert.equal(
    e.available,
    16 * GIB * ENGINE_CONSTANTS.UNIFIED_USABLE_FRACTION,
    'en Apple Silicon solo una fracción de la RAM es asignable a la GPU'
  );
  assert.ok(e.tokensPerSecond.min > 0 && e.tokensPerSecond.max > e.tokensPerSecond.min);
});

test('RTX 3090 de 24 GB: holgado y con margen para subir de cuantización', () => {
  const desktop = systemFor('nvidia-geforce-rtx-3090', 32);
  const e = estimate(llama8b, 'Q4_K_M', desktop, 8192);

  assert.equal(e.backend, 'gpu');
  assert.equal(e.verdict, 'holgado');
  assert.equal(e.reason, undefined);
  assert.equal(e.recommendedQuant, 'Q8_0', 'con 24 GB entra la mejor cuantización publicada');
});

test('iGPU con 16 GB de RAM cae a CPU', () => {
  const igpu = systemFor('intel-iris-xe-graphics-96eu-mobile', 16);
  assert.equal(igpu.gpu.vramGb, undefined, 'una integrada no declara VRAM dedicada');

  const e = estimate(llama8b, 'Q4_K_M', igpu, 4096);
  assert.equal(e.backend, 'cpu');
  assert.equal(e.reason, 'sin-gpu');
  assert.equal(
    e.available,
    (16 - ENGINE_CONSTANTS.OS_RESERVED_RAM_GB) * GIB,
    'en CPU se reserva RAM para el sistema operativo'
  );
  assert.notEqual(e.verdict, 'holgado', 'en CPU nada va holgado');
});

test('sin GPU declarada también se responde por CPU', () => {
  const e = estimate(model('llama-3.2-3b-instruct'), 'Q4_K_M', cpuOnly(8), 4096);
  assert.equal(e.backend, 'cpu');
  assert.notEqual(e.verdict, 'no-cabe');
});

test('RTX 4090 con un 70B: offload parcial, no milagro', () => {
  const rig = systemFor('nvidia-geforce-rtx-4090', 64);
  const e = estimate(llama70b, 'Q4_K_M', rig, 4096);

  assert.equal(e.backend, 'partial-offload');
  assert.notEqual(e.verdict, 'no-cabe');
  assert.equal(e.reason, 'vram');

  const vramUsable = 24 * GIB * ENGINE_CONSTANTS.VRAM_USABLE_FRACTION;
  const layers = offloadLayers(llama70b, e.memory, vramUsable);
  assert.ok(layers > 0 && layers < llama70b.numLayers, `${layers} capas de ${llama70b.numLayers}`);
});

test('un 70B en una portátil de 8 GB no cabe de ninguna manera', () => {
  const laptop = systemFor('nvidia-geforce-rtx-4060-laptop-gpu', 8);
  const e = estimate(llama70b, 'Q4_K_M', laptop, 4096);

  assert.equal(e.verdict, 'no-cabe');
  assert.equal(e.tokensPerSecond.max, 0, 'lo que no corre no lleva velocidad estimada');
});

test('las fórmulas son las de la spec, al byte', () => {
  const ctx = 4096;
  const m = memoryBreakdown(llama8b, 'Q4_K_M', ctx);
  const quant = llama8b.quants.find((q) => q.name === 'Q4_K_M');

  const weights = (llama8b.paramsB * 1e9 * quant.bpw) / 8;
  const kv = 2 * llama8b.numLayers * llama8b.numKvHeads * llama8b.headDim * ctx * 2;
  const overhead = ENGINE_CONSTANTS.RUNTIME_OVERHEAD_GB * GIB + weights * 0.05;

  assert.equal(m.weights, weights);
  assert.equal(m.kvCache, kv);
  assert.equal(m.overhead, overhead);
  assert.equal(m.total, weights + kv + overhead);
});

test('el KV cache en q8 ocupa la mitad que en f16', () => {
  const f16 = memoryBreakdown(llama8b, 'Q4_K_M', 32768);
  const q8 = memoryBreakdown(llama8b, 'Q4_K_M', 32768, { kvPrecision: 'q8' });
  assert.equal(q8.kvCache, f16.kvCache / 2);
});

test('en MoE la velocidad se calcula sobre los parámetros activos', () => {
  const rig = systemFor('nvidia-geforce-rtx-4090', 128);
  const e = estimate(mixtral, 'Q4_K_M', rig, 4096);
  const dense = estimate(llama70b, 'Q3_K_M', rig, 4096);

  assert.ok(mixtral.activeParamsB < mixtral.paramsB);
  assert.ok(
    e.tokensPerSecond.max > dense.tokensPerSecond.max,
    'un MoE de 46B debe estimarse más rápido que un denso de 70B similar en tamaño'
  );
});

test('la velocidad se devuelve siempre como rango, nunca como cifra exacta', () => {
  const e = estimate(llama8b, 'Q4_K_M', systemFor('nvidia-geforce-rtx-3090', 32), 4096);
  assert.ok(e.tokensPerSecond.min < e.tokensPerSecond.max);
});

test('sin ancho de banda conocido no se inventa una velocidad', () => {
  const specs = {
    gpu: { rawName: 'Radeon RX 9999', vramGb: 12, source: 'user' },
    ram: { totalGb: 16, source: 'user' },
    os: 'windows'
  };
  const e = estimate(llama8b, 'Q4_K_M', specs, 4096);
  assert.equal(e.backend, 'gpu');
  assert.deepEqual(e.tokensPerSecond, { min: 0, max: 0 });
});

test('subir el contexto solo puede empeorar el veredicto, nunca mejorarlo', () => {
  const laptop = systemFor('nvidia-geforce-rtx-4060-laptop-gpu', 16);
  const rank = { holgado: 0, funciona: 1, justo: 2, 'no-cabe': 3 };
  let previous = -1;
  for (const ctx of [2048, 4096, 8192, 16384, 32768, 65536, 131072]) {
    const current = rank[estimate(llama8b, 'Q4_K_M', laptop, ctx).verdict];
    assert.ok(current >= previous, `el veredicto empeoró al bajar el contexto a ${ctx}`);
    previous = current;
  }
});

test('pedir una cuantización que el modelo no publica es un error, no un silencio', () => {
  assert.throws(
    () => estimate(llama8b, 'Q1_K_XS', systemFor('nvidia-geforce-rtx-3090', 32), 4096),
    /Q1_K_XS/
  );
});
