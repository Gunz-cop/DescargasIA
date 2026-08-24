/**
 * Ordena el catálogo de modelos para un equipo concreto y lo agrupa por caso
 * de uso. F2 — docs/fases/F2.md.
 *
 * No decide nada por su cuenta: pregunta a `estimate.ts` por cada modelo y
 * ordena el resultado. TypeScript puro: sin DOM, sin Astro, sin entorno.
 */

import type { Estimate, ModelSpec, SystemSpecs } from './types';
import { bestQuant, estimate, verdictRank, type EstimateOptions } from './estimate.ts';

/**
 * Los cuatro casos de uso del producto, en el orden en que se enseñan. Un
 * modelo puede estar en varios; los `useCases` que no estén aquí se muestran
 * después, en el orden en que aparezcan en los datos.
 */
export const USE_CASE_ORDER = ['chat', 'codigo', 'razonamiento', 'documentos'] as const;

export interface RecommendOptions extends EstimateOptions {
  /** Longitud de contexto a la que se juzga cada modelo. Por defecto 4k. */
  contextTokens?: number;
  /** Fija la cuantización en vez de elegir la mejor que entra. */
  quant?: string;
  /** Deja fuera lo que no corre. Por defecto vienen todos, ya ordenados. */
  onlyRunnable?: boolean;
}

const DEFAULT_CONTEXT_TOKENS = 4096;

/**
 * Un `Estimate` por modelo, del que mejor corre al que no corre.
 *
 * Dentro del mismo veredicto gana el modelo más grande: si dos caben, el de
 * más parámetros es el más capaz, y el orden debe premiar eso y no la
 * velocidad, que ya se muestra aparte.
 */
export function recommend(
  specs: SystemSpecs,
  models: ModelSpec[],
  opts: RecommendOptions = {}
): Estimate[] {
  const ctxTokens = opts.contextTokens ?? DEFAULT_CONTEXT_TOKENS;
  const byModel = new Map<string, ModelSpec>();

  const results: Estimate[] = [];
  for (const model of models) {
    if (model.quants.length === 0) continue;
    const quant = opts.quant ?? bestQuant(model, specs, ctxTokens, opts)?.name;
    if (!quant) continue;
    if (opts.quant && !model.quants.some((q) => q.name.toLowerCase() === quant.toLowerCase())) {
      continue;
    }
    byModel.set(model.id, model);
    results.push(estimate(model, quant, specs, ctxTokens, opts));
  }

  results.sort((a, b) => {
    const rank = verdictRank(a.verdict) - verdictRank(b.verdict);
    if (rank !== 0) return rank;
    const paramsA = byModel.get(a.modelId)?.paramsB ?? 0;
    const paramsB = byModel.get(b.modelId)?.paramsB ?? 0;
    if (paramsA !== paramsB) return paramsB - paramsA;
    return b.tokensPerSecond.max - a.tokensPerSecond.max;
  });

  return opts.onlyRunnable ? results.filter((e) => e.verdict !== 'no-cabe') : results;
}

/**
 * Agrupa un resultado de `recommend` por caso de uso, conservando el orden de
 * cada lista. Un modelo aparece en todos los casos de uso que declara.
 */
export function groupByUseCase(
  estimates: Estimate[],
  models: ModelSpec[]
): Array<{ useCase: string; estimates: Estimate[] }> {
  const byId = new Map(models.map((m) => [m.id, m]));
  const groups = new Map<string, Estimate[]>();

  for (const e of estimates) {
    for (const useCase of byId.get(e.modelId)?.useCases ?? []) {
      const bucket = groups.get(useCase);
      if (bucket) bucket.push(e);
      else groups.set(useCase, [e]);
    }
  }

  const known = USE_CASE_ORDER.filter((u) => groups.has(u));
  const rest = [...groups.keys()].filter((u) => !USE_CASE_ORDER.includes(u as never));

  return [...known, ...rest].map((useCase) => ({
    useCase,
    estimates: groups.get(useCase) ?? []
  }));
}
