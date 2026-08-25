/**
 * El matcher difuso. F2 — docs/fases/F2.md.
 *
 * Las cadenas de prueba están escritas como las escribe la gente: en
 * minúsculas, con la marca a medias, con faltas de espaciado, con la frase
 * entera alrededor y, en un caso, tal cual la devuelve el navegador.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeGpuText, resolveGpu, RESOLVE_THRESHOLDS } from '../../src/lib/hardware/resolve.ts';
import { gpus } from './fixtures/catalog.mjs';

/** 25 cadenas humanas → la GPU que la persona quería decir. */
const HUMAN_STRINGS = [
  ['rtx 3090', 'nvidia-geforce-rtx-3090'],
  ['RTX3090', 'nvidia-geforce-rtx-3090'],
  ['nvidia geforce rtx 3090', 'nvidia-geforce-rtx-3090'],
  ['tengo una 3090', 'nvidia-geforce-rtx-3090'],
  ['3060ti', 'nvidia-geforce-rtx-3060-ti'],
  ['rtx 3060 ti', 'nvidia-geforce-rtx-3060-ti'],
  ['RTX 3060Ti', 'nvidia-geforce-rtx-3060-ti'],
  ['NVIDIA GeForce RTX 3060 Ti', 'nvidia-geforce-rtx-3060-ti'],
  ['rtx 4060 laptop', 'nvidia-geforce-rtx-4060-laptop-gpu'],
  ['laptop con RTX 4060', 'nvidia-geforce-rtx-4060-laptop-gpu'],
  ['rtx 4060 portátil', 'nvidia-geforce-rtx-4060-laptop-gpu'],
  ['RTX 4060 Laptop GPU', 'nvidia-geforce-rtx-4060-laptop-gpu'],
  // La cadena cruda de WEBGL_debug_renderer_info, envoltorio ANGLE incluido.
  [
    'ANGLE (NVIDIA, NVIDIA GeForce RTX 4060 Laptop GPU (0x00002820) Direct3D11 vs_5_0 ps_5_0, D3D11)',
    'nvidia-geforce-rtx-4060-laptop-gpu'
  ],
  ['rtx 4090 de sobremesa', 'nvidia-geforce-rtx-4090'],
  ['RTX 4090 Laptop', 'nvidia-geforce-rtx-4090-laptop-gpu'],
  ['rtx 3080 max-q', 'nvidia-geforce-rtx-3080-laptop-gpu-max-q'],
  ['gtx1080ti', 'nvidia-geforce-gtx-1080-ti'],
  ['GTX 1650', 'nvidia-geforce-gtx-1650'],
  ['rx 6800 xt', 'amd-radeon-rx-6800-xt'],
  ['radeon rx 7900 xtx', 'amd-radeon-rx-7900-xtx'],
  ['una amd 6600', 'amd-radeon-rx-6600'],
  ['intel arc a770', 'intel-arc-a770'],
  ['radeon 780m', 'amd-radeon-780m'],
  ['macbook pro con m2 pro', 'apple-m2-pro'],
  ['Apple M1 Ultra', 'apple-m1-ultra']
];

test('25 cadenas escritas como las escribe un humano', () => {
  assert.equal(HUMAN_STRINGS.length, 25);
  const fallos = [];
  for (const [text, expected] of HUMAN_STRINGS) {
    const { gpu, score } = resolveGpu(text, gpus);
    if (gpu?.id !== expected) fallos.push(`${text} → ${gpu?.id ?? 'null'} (esperado ${expected})`);
    else if (score < RESOLVE_THRESHOLDS.direct) fallos.push(`${text} → score ${score}`);
  }
  assert.deepEqual(fallos, []);
});

test('la normalización separa dígitos de letras y limpia lo que mete el navegador', () => {
  assert.equal(normalizeGpuText('RTX3060Ti'), 'rtx 3060 ti');
  assert.equal(normalizeGpuText('3060ti'), '3060 ti');
  assert.equal(normalizeGpuText('  Gráfica   RTX  4060  '), 'grafica rtx 4060');
  assert.equal(
    normalizeGpuText('ANGLE (NVIDIA, NVIDIA GeForce RTX 4060 (0x00002803) Direct3D11 vs_5_0)'),
    'nvidia nvidia geforce rtx 4060'
  );
});

test('una forma corta ambigua entre escritorio y portátil no se resuelve: se pregunta', () => {
  const { gpu, candidates } = resolveGpu('rtx 4090', gpus);

  assert.equal(gpu, null, 'resolver a escritorio prometería 24 GB a quien tiene 16');
  const ids = candidates.map((c) => c.id);
  assert.ok(ids.includes('nvidia-geforce-rtx-4090'));
  assert.ok(ids.includes('nvidia-geforce-rtx-4090-laptop-gpu'));
  assert.notEqual(
    candidates[0].vramGb,
    candidates[1].vramGb,
    'la ambigüedad existe justamente porque la VRAM difiere'
  );
});

test('con una señal de formato la ambigüedad desaparece', () => {
  assert.equal(resolveGpu('rtx 4090 laptop', gpus).gpu?.id, 'nvidia-geforce-rtx-4090-laptop-gpu');
  assert.equal(resolveGpu('rtx 4090 portatil', gpus).gpu?.id, 'nvidia-geforce-rtx-4090-laptop-gpu');
  assert.equal(resolveGpu('rtx 4090 desktop', gpus).gpu?.id, 'nvidia-geforce-rtx-4090');
  assert.equal(resolveGpu('rtx 4090 de sobremesa', gpus).gpu?.id, 'nvidia-geforce-rtx-4090');
});

test('la ambigüedad se aplica a todas las familias donde la VRAM difiere', () => {
  for (const short of ['rtx 3080', 'rtx 3060', 'rtx 4090', 'rtx 4060 ti']) {
    assert.equal(resolveGpu(short, gpus).gpu, null, `${short} no debería resolverse sola`);
  }
});

test('la duda no es solo escritorio contra portátil', () => {
  // `rtx 4060 ti` son 8 GB o 16 según la edición, las dos de sobremesa.
  const { gpu, candidates } = resolveGpu('rtx 4060 ti', gpus);
  assert.equal(gpu, null);
  assert.deepEqual(candidates.map((c) => c.vramGb).sort((a, b) => a - b), [8, 16]);
  assert.deepEqual([...new Set(candidates.map((c) => c.formFactor))], ['desktop']);
});

test('la capacidad escrita deshace la duda', () => {
  assert.equal(resolveGpu('rtx 3060 12gb', gpus).gpu?.vramGb, 12);
  assert.equal(resolveGpu('rtx 3060 8 GB', gpus).gpu?.vramGb, 8);
  assert.equal(resolveGpu('rtx 4060 ti 16gb', gpus).gpu?.vramGb, 16);
});

test('donde la VRAM coincide no se molesta a nadie preguntando', () => {
  // RTX 4060 son 8 GB tanto en sobremesa como en portátil: la duda no cambia
  // el veredicto, así que se resuelve y punto.
  assert.equal(resolveGpu('rtx 4060', gpus).gpu?.vramGb, 8);
});

test('una Max-Q se puede pedir a propósito', () => {
  // `maxq` dice "portátil" y además distingue una variante real: si se
  // tratara solo como señal de formato, nadie podría seleccionarla.
  assert.match(resolveGpu('rtx 3080 max-q', gpus).gpu?.id ?? '', /max-q$/);
  assert.doesNotMatch(resolveGpu('rtx 3080 laptop', gpus).gpu?.id ?? '', /max-q$/);
});

test('nunca se responde con una GPU cuya VRAM no es la que la persona tiene', () => {
  // La trampa concreta: "rtx 3060" a secas son 12 GB en sobremesa y 6 en
  // portátil. Contestar 12 es lo que hace fallar a las herramientas rivales.
  const { gpu, candidates } = resolveGpu('rtx 3060', gpus);
  assert.equal(gpu, null);
  const vrams = candidates.map((c) => c.vramGb);
  assert.ok(vrams.includes(12), 'la de sobremesa son 12 GB');
  assert.ok(vrams.includes(6), 'la portátil son 6 GB');
});

test('una GPU que no existe devuelve null y deja la vía de escape abierta', () => {
  const { gpu, score, candidates } = resolveGpu('Radeon RX 9999', gpus);
  assert.equal(gpu, null);
  assert.ok(score < RESOLVE_THRESHOLDS.direct);
  assert.ok(candidates.length <= RESOLVE_THRESHOLDS.maxCandidates);
});

test('solo la marca no identifica nada', () => {
  for (const text of ['nvidia', 'amd', 'geforce', 'radeon', 'intel']) {
    assert.equal(resolveGpu(text, gpus).gpu, null, `"${text}" no debería resolver`);
  }
});

test('texto vacío o catálogo vacío no revientan', () => {
  assert.deepEqual(resolveGpu('', gpus), { gpu: null, score: 0, candidates: [] });
  assert.deepEqual(resolveGpu('rtx 3090', []), { gpu: null, score: 0, candidates: [] });
  assert.deepEqual(resolveGpu('!!! ???', gpus), { gpu: null, score: 0, candidates: [] });
});

test('nunca se devuelven más de tres candidatas', () => {
  for (const text of ['rtx', 'nvidia geforce rtx 30', 'radeon rx']) {
    assert.ok(resolveGpu(text, gpus).candidates.length <= RESOLVE_THRESHOLDS.maxCandidates);
  }
});
