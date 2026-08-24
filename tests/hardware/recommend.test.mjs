/** Ordenación y agrupación del catálogo. F2 — docs/fases/F2.md. */

import test from 'node:test';
import assert from 'node:assert/strict';

import { groupByUseCase, recommend, USE_CASE_ORDER } from '../../src/lib/hardware/recommend.ts';
import { verdictRank } from '../../src/lib/hardware/estimate.ts';
import { models, systemFor, cpuOnly } from './fixtures/catalog.mjs';

test('devuelve un resultado por modelo del catálogo', () => {
  const results = recommend(systemFor('nvidia-geforce-rtx-3090', 32), models);
  assert.equal(results.length, models.length);
  assert.deepEqual(
    [...new Set(results.map((r) => r.modelId))].sort(),
    models.map((m) => m.id).sort()
  );
});

test('ordena de lo que mejor corre a lo que no corre', () => {
  const results = recommend(systemFor('nvidia-geforce-rtx-4060-laptop-gpu', 16), models);
  for (let i = 1; i < results.length; i += 1) {
    assert.ok(
      verdictRank(results[i - 1].verdict) <= verdictRank(results[i].verdict),
      `${results[i - 1].modelId} debería ir antes que ${results[i].modelId}`
    );
  }
});

test('a igual veredicto gana el modelo más capaz, no el más rápido', () => {
  const results = recommend(systemFor('nvidia-geforce-rtx-3090', 32), models);
  const paramsOf = Object.fromEntries(models.map((m) => [m.id, m.paramsB]));
  for (let i = 1; i < results.length; i += 1) {
    if (results[i - 1].verdict !== results[i].verdict) continue;
    assert.ok(paramsOf[results[i - 1].modelId] >= paramsOf[results[i].modelId]);
  }
});

test('elige por su cuenta la mejor cuantización que entra', () => {
  const grande = recommend(systemFor('nvidia-geforce-rtx-3090', 32), models);
  const chica = recommend(systemFor('nvidia-geforce-rtx-3050-laptop-gpu', 8), models);

  const en3090 = grande.find((r) => r.modelId === 'llama-3.1-8b-instruct');
  const en3050 = chica.find((r) => r.modelId === 'llama-3.1-8b-instruct');

  assert.equal(en3090.quant, 'Q8_0', 'con 24 GB no hay razón para cuantizar tan bajo');
  assert.equal(en3050.quant, 'Q4_K_M', 'con 4 GB solo cabe la más comprimida');
});

test('se puede fijar la cuantización y saltarse la elección automática', () => {
  const results = recommend(systemFor('nvidia-geforce-rtx-3090', 32), models, { quant: 'Q4_K_M' });
  assert.ok(results.length > 0);
  for (const r of results) assert.equal(r.quant, 'Q4_K_M');
});

test('onlyRunnable deja fuera lo que no corre', () => {
  const specs = cpuOnly(8);
  const todos = recommend(specs, models);
  const corren = recommend(specs, models, { onlyRunnable: true });

  assert.ok(todos.some((r) => r.verdict === 'no-cabe'), 'con 8 GB algo tiene que no caber');
  assert.ok(corren.length < todos.length);
  assert.ok(corren.every((r) => r.verdict !== 'no-cabe'));
});

test('subir el contexto cambia el resultado: es la razón de ser del deslizador', () => {
  const specs = systemFor('nvidia-geforce-rtx-4060-laptop-gpu', 16);
  const corto = recommend(specs, models, { contextTokens: 2048, onlyRunnable: true });
  const largo = recommend(specs, models, { contextTokens: 131072, onlyRunnable: true });
  assert.ok(largo.length < corto.length, 'con 128k de contexto tienen que caer modelos');
});

test('agrupa por caso de uso respetando el orden del producto', () => {
  const results = recommend(systemFor('nvidia-geforce-rtx-3090', 32), models);
  const grupos = groupByUseCase(results, models);
  const nombres = grupos.map((g) => g.useCase);

  assert.deepEqual(nombres, [...USE_CASE_ORDER]);
  for (const g of grupos) assert.ok(g.estimates.length > 0, `${g.useCase} está vacío`);

  const asistentes = grupos.find((g) => g.useCase === 'asistentes-ia');
  assert.ok(asistentes.estimates.some((e) => e.modelId === 'llama-3.1-8b-instruct'));
});

test('un modelo aparece en todos los casos de uso que declara', () => {
  const results = recommend(systemFor('nvidia-geforce-rtx-3090', 32), models);
  const grupos = groupByUseCase(results, models);
  const uno = models.find((m) => m.useCases.length > 1);
  const apariciones = grupos.filter((g) => g.estimates.some((e) => e.modelId === uno.id));
  assert.deepEqual(apariciones.map((g) => g.useCase).sort(), [...uno.useCases].sort());
});

test('los casos de uso del catálogo son categorías reales del sitio', () => {
  // El audit de F1 lo exige, y por eso USE_CASE_ORDER son slugs de categoría
  // y no los cuatro nombres genéricos que nombra la spec de F2.
  const declarados = new Set(models.flatMap((m) => m.useCases));
  const desconocidos = [...declarados].filter((u) => !USE_CASE_ORDER.includes(u));
  assert.deepEqual(desconocidos, [], 'hay casos de uso que la interfaz no sabe ordenar');
});

test('un caso de uso desconocido no se pierde: va al final', () => {
  const extra = [{ ...models[0], id: 'inventado', useCases: ['una-categoria-nueva'] }];
  const grupos = groupByUseCase(recommend(systemFor('nvidia-geforce-rtx-3090', 32), extra), extra);
  assert.deepEqual(grupos.map((g) => g.useCase), ['una-categoria-nueva']);
});
