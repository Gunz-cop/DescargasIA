/**
 * El motor determinista: la matemática que emite el veredicto.
 * F2 — docs/fases/F2.md.
 *
 * Regla de oro del producto: ningún número del resultado sale de una IA.
 * Todo sale de aquí, es reproducible y se puede auditar leyendo este archivo.
 *
 * TypeScript puro: sin DOM, sin Astro, sin variables de entorno. Lo importan
 * por igual el script de cliente, el Worker de Cloudflare y `node --test`.
 * El motor recibe objetos ya cargados; no lee archivos.
 */

import type {
  Backend,
  Estimate,
  ModelSpec,
  QuantSpec,
  SystemSpecs,
  VerdictLevel,
  VerdictReason
} from './types';

const BYTES_PER_GIB = 1024 ** 3;

/**
 * Todas las aproximaciones del motor, en un único bloque para que se puedan
 * revisar de una sola lectura. Ninguna se repite suelta por el código: si una
 * constante hay que discutirla, se discute aquí.
 */
export const ENGINE_CONSTANTS = {
  /** El 8 % de la VRAM queda para el escritorio y el compositor. */
  VRAM_USABLE_FRACTION: 0.92,
  /** Apple Silicon: fracción de la memoria unificada asignable a la GPU. */
  UNIFIED_USABLE_FRACTION: 0.75,
  /** Lo que se reserva para el sistema operativo al inferir en CPU. */
  OS_RESERVED_RAM_GB: 3,
  /** Runtime de CUDA / Vulkan / Metal cargado en memoria. */
  RUNTIME_OVERHEAD_GB: 0.6,
  /** Activaciones y buffers intermedios, proporcionales a los pesos. */
  ACTIVATION_FRACTION_OF_WEIGHTS: 0.05,
  /** Bytes por elemento del KV cache según su precisión. */
  KV_BYTES: { f16: 2, q8: 1 },
  /**
   * Una GPU que declara menos de esto no tiene memoria dedicada de verdad:
   * es una integrada que comparte la RAM del sistema. Va por CPU.
   */
  INTEGRATED_VRAM_MAX_GB: 2,
  /** Fracción del ancho de banda teórico que alcanza la inferencia real. */
  GPU_BANDWIDTH_EFFICIENCY: 0.7,
  CPU_BANDWIDTH_EFFICIENCY: 0.5,
  /** Ancho de banda típico de RAM de sistema en doble canal, GB/s. */
  SYSTEM_RAM_BANDWIDTH_GBS: 50,
  /** Ancho del rango de tok/s alrededor del valor central. */
  TPS_RANGE_SPREAD: 0.2,
  /** Ocupación por debajo de la cual el modelo va holgado. */
  HEADROOM_ROOMY: 0.75,
  /** Ocupación por encima de la cual el modelo va justo. */
  HEADROOM_COMFORTABLE: 0.9,
  /** En CPU nada va holgado; por encima de esta ocupación va justo. */
  HEADROOM_CPU: 0.5,
  /** Margen que se le exige a una cuantización para recomendarla. */
  RECOMMEND_MARGIN: 0.9,
  /** Con menos capas que esto en la GPU, el offload parcial va justo. */
  OFFLOAD_COMFORTABLE_LAYER_FRACTION: 0.5
} as const;

export type KvPrecision = keyof typeof ENGINE_CONSTANTS.KV_BYTES;

export interface EstimateOptions {
  /** Precisión del KV cache. Los runtimes usan f16 salvo que se les pida otra. */
  kvPrecision?: KvPrecision;
  /**
   * Fracción de la memoria unificada asignable a la GPU, cuando se conoce.
   * Sale de `GpuSpec.unifiedUsableFraction`, que `SystemSpecs` no transporta.
   */
  unifiedUsableFraction?: number;
}

export interface MemoryBreakdown {
  weights: number;
  kvCache: number;
  overhead: number;
  total: number;
}

/** Resuelve una cuantización por nombre; acepta el objeto ya resuelto. */
export function resolveQuant(model: ModelSpec, quant: QuantSpec | string): QuantSpec {
  if (typeof quant !== 'string') return quant;
  const found = model.quants.find((q) => q.name.toLowerCase() === quant.toLowerCase());
  if (!found) {
    throw new Error(`El modelo ${model.id} no publica la cuantización ${quant}`);
  }
  return found;
}

/**
 * Pesos + KV cache + overhead, en bytes.
 *
 *   weights  = paramsB * 1e9 * bpw / 8
 *   kvCache  = 2 * numLayers * numKvHeads * headDim * ctxTokens * kvBytes
 *   overhead = 0,6 GB de runtime + 5 % de los pesos en activaciones
 *
 * El `bpw` es el de `ModelSpec.quants[]`, medido sobre ese `.gguf` concreto.
 * Nunca el de `quants.json`, que es tabla de referencia general para la
 * interfaz: en modelos pequeños la tabla de embeddings domina el archivo y la
 * diferencia llega al 30 %.
 */
export function memoryBreakdown(
  model: ModelSpec,
  quant: QuantSpec | string,
  ctxTokens: number,
  opts: EstimateOptions = {}
): MemoryBreakdown {
  const q = resolveQuant(model, quant);
  const kvBytes = ENGINE_CONSTANTS.KV_BYTES[opts.kvPrecision ?? 'f16'];

  const weights = (model.paramsB * 1e9 * q.bpw) / 8;
  const kvCache = 2 * model.numLayers * model.numKvHeads * model.headDim * ctxTokens * kvBytes;
  const overhead =
    ENGINE_CONSTANTS.RUNTIME_OVERHEAD_GB * BYTES_PER_GIB +
    weights * ENGINE_CONSTANTS.ACTIVATION_FRACTION_OF_WEIGHTS;

  return { weights, kvCache, overhead, total: weights + kvCache + overhead };
}

interface Pool {
  backend: Backend;
  available: number;
  /** Ancho de banda efectivo del camino de memoria, GB/s. 0 = desconocido. */
  bandwidthGbs: number;
  efficiency: number;
}

function gibOf(gb: number | undefined): number {
  return (gb ?? 0) * BYTES_PER_GIB;
}

/**
 * Memoria unificada de verdad: Apple Silicon.
 *
 * `gpus.json` marca también las integradas de AMD e Intel con
 * `unifiedMemory`, y físicamente es cierto que comparten la RAM. Pero el
 * glosario del producto define memoria unificada como lo que hace Apple, y la
 * spec de esta fase pide que una iGPU x86 caiga a CPU. Y es lo honesto: una
 * iGPU lee exactamente la misma RAM que la CPU, así que no gana ancho de
 * banda, y tratarla como acelerador recortaría la memoria disponible a la
 * fracción asignable en vez de dejarle la RAM del sistema entera.
 */
function isUnifiedMemory(specs: SystemSpecs): boolean {
  return specs.gpu?.unifiedMemory === true && specs.gpu.vendor === 'apple';
}

function hasDedicatedVram(specs: SystemSpecs): boolean {
  const gpu = specs.gpu;
  if (!gpu || isUnifiedMemory(specs)) return false;
  return (gpu.vramGb ?? 0) > ENGINE_CONSTANTS.INTEGRATED_VRAM_MAX_GB;
}

function systemRamAvailable(specs: SystemSpecs): number {
  const total = gibOf(specs.ram?.totalGb);
  return Math.max(0, total - ENGINE_CONSTANTS.OS_RESERVED_RAM_GB * BYTES_PER_GIB);
}

/**
 * Cuántas capas del modelo caben en la VRAM cuando no cabe entero. El resto
 * se queda en RAM y las procesa la CPU: funciona, pero mucho más lento.
 */
export function offloadLayers(
  model: ModelSpec,
  memory: MemoryBreakdown,
  vramUsableBytes: number
): number {
  const perLayer = (memory.weights + memory.kvCache) / model.numLayers;
  if (!(perLayer > 0)) return 0;
  const budget = vramUsableBytes - memory.overhead;
  if (!(budget > 0)) return 0;
  return Math.max(0, Math.min(model.numLayers, Math.floor(budget / perLayer)));
}

/**
 * Los tres modos de ejecución, evaluados en orden: GPU completa, memoria
 * unificada, offload parcial y, si no hay GPU utilizable, CPU.
 */
function choosePool(specs: SystemSpecs, required: number, opts: EstimateOptions): Pool {
  const gpu = specs.gpu;
  const gpuBandwidth = gpu?.bandwidthGbs ?? 0;

  if (isUnifiedMemory(specs)) {
    return {
      backend: 'unified',
      available:
        gibOf(specs.ram?.totalGb) *
        (opts.unifiedUsableFraction ?? ENGINE_CONSTANTS.UNIFIED_USABLE_FRACTION),
      bandwidthGbs: gpuBandwidth,
      efficiency: ENGINE_CONSTANTS.GPU_BANDWIDTH_EFFICIENCY
    };
  }

  if (hasDedicatedVram(specs)) {
    const vramUsable = gibOf(gpu?.vramGb) * ENGINE_CONSTANTS.VRAM_USABLE_FRACTION;
    if (required <= vramUsable) {
      return {
        backend: 'gpu',
        available: vramUsable,
        bandwidthGbs: gpuBandwidth,
        efficiency: ENGINE_CONSTANTS.GPU_BANDWIDTH_EFFICIENCY
      };
    }
    return {
      backend: 'partial-offload',
      available: vramUsable + systemRamAvailable(specs),
      bandwidthGbs: gpuBandwidth,
      efficiency: ENGINE_CONSTANTS.CPU_BANDWIDTH_EFFICIENCY
    };
  }

  return {
    backend: 'cpu',
    available: systemRamAvailable(specs),
    bandwidthGbs: ENGINE_CONSTANTS.SYSTEM_RAM_BANDWIDTH_GBS,
    efficiency: ENGINE_CONSTANTS.CPU_BANDWIDTH_EFFICIENCY
  };
}

/**
 * Roofline de ancho de banda: generar tokens está limitado por la memoria, no
 * por el cómputo. En MoE manda `activeParamsB`, que es lo que se lee por token.
 *
 * Se devuelve siempre como rango. "23,7 tok/s" daría una impresión de
 * exactitud que este método no sostiene.
 */
function throughput(
  model: ModelSpec,
  quant: QuantSpec,
  pool: Pool,
  gpuLayerFraction: number
): { min: number; max: number } {
  const activeGb = ((model.activeParamsB ?? model.paramsB) * quant.bpw) / 8;
  if (!(activeGb > 0)) return { min: 0, max: 0 };

  let bandwidth = pool.bandwidthGbs;
  if (pool.backend === 'partial-offload') {
    const gpuBw = pool.bandwidthGbs;
    const cpuBw = ENGINE_CONSTANTS.SYSTEM_RAM_BANDWIDTH_GBS;
    if (!(gpuBw > 0)) {
      bandwidth = cpuBw;
    } else {
      // Media armónica: el tramo lento domina, que es justo lo que pasa.
      bandwidth = 1 / (gpuLayerFraction / gpuBw + (1 - gpuLayerFraction) / cpuBw);
    }
  }
  if (!(bandwidth > 0)) return { min: 0, max: 0 };

  const center = (bandwidth / activeGb) * pool.efficiency;
  const spread = ENGINE_CONSTANTS.TPS_RANGE_SPREAD;
  return { min: center * (1 - spread), max: center * (1 + spread) };
}

function verdictFor(pool: Pool, ratio: number, gpuLayerFraction: number): VerdictLevel {
  if (ratio > 1) return 'no-cabe';
  if (pool.backend === 'gpu' || pool.backend === 'unified') {
    if (ratio <= ENGINE_CONSTANTS.HEADROOM_ROOMY) return 'holgado';
    if (ratio <= ENGINE_CONSTANTS.HEADROOM_COMFORTABLE) return 'funciona';
    return 'justo';
  }
  if (pool.backend === 'partial-offload') {
    return gpuLayerFraction >= ENGINE_CONSTANTS.OFFLOAD_COMFORTABLE_LAYER_FRACTION
      ? 'funciona'
      : 'justo';
  }
  // En CPU nada va holgado, por mucha RAM que sobre.
  return ratio <= ENGINE_CONSTANTS.HEADROOM_CPU ? 'funciona' : 'justo';
}

/**
 * Por qué el veredicto es el que es.
 *
 * La pregunta cambia según el modo. En offload parcial lo interesante no es
 * si cabe en el total —cabe, por eso hay offload— sino qué lo echó de la
 * GPU: `vramUsable` es ahí el listón. Cuando no cabe en ningún sitio, el
 * listón es la memoria entera disponible.
 */
function reasonFor(
  specs: SystemSpecs,
  pool: Pool,
  memory: MemoryBreakdown,
  vramUsable: number,
  fits: boolean
): VerdictReason | undefined {
  const withoutContext = memory.weights + memory.overhead;
  const tippedBy = (limit: number) => withoutContext <= limit && memory.total > limit;

  if (!fits) {
    if (tippedBy(pool.available)) return 'contexto';
    if (pool.backend === 'cpu') return specs.gpu ? 'ram' : 'sin-gpu';
    return pool.backend === 'unified' ? 'ram' : 'vram';
  }

  if (pool.backend === 'gpu' || pool.backend === 'unified') return undefined;
  if (pool.backend === 'partial-offload') return tippedBy(vramUsable) ? 'contexto' : 'vram';
  return 'sin-gpu';
}

function evaluate(
  model: ModelSpec,
  quant: QuantSpec,
  specs: SystemSpecs,
  ctxTokens: number,
  opts: EstimateOptions
): Omit<Estimate, 'recommendedQuant'> {
  const memory = memoryBreakdown(model, quant, ctxTokens, opts);
  const pool = choosePool(specs, memory.total, opts);

  const vramUsable =
    pool.backend === 'partial-offload'
      ? gibOf(specs.gpu?.vramGb) * ENGINE_CONSTANTS.VRAM_USABLE_FRACTION
      : 0;
  const layersOnGpu =
    pool.backend === 'partial-offload' ? offloadLayers(model, memory, vramUsable) : model.numLayers;
  const gpuLayerFraction = model.numLayers > 0 ? layersOnGpu / model.numLayers : 0;

  const fits = pool.available > 0 && memory.total <= pool.available;
  const ratio = pool.available > 0 ? memory.total / pool.available : Infinity;

  return {
    modelId: model.id,
    quant: quant.name,
    backend: pool.backend,
    verdict: verdictFor(pool, ratio, gpuLayerFraction),
    reason: reasonFor(specs, pool, memory, vramUsable, fits),
    memory,
    available: pool.available,
    contextTokens: ctxTokens,
    tokensPerSecond: fits ? throughput(model, quant, pool, gpuLayerFraction) : { min: 0, max: 0 }
  };
}

const VERDICT_RANK: Record<VerdictLevel, number> = {
  holgado: 0,
  funciona: 1,
  justo: 2,
  'no-cabe': 3
};

/**
 * La cuantización de mayor calidad que entra con margen. Se prefiere la que
 * cabe entera en la GPU o en la memoria unificada; si ninguna lo consigue, la
 * de mayor calidad que al menos funcione con ajustes.
 */
export function bestQuant(
  model: ModelSpec,
  specs: SystemSpecs,
  ctxTokens: number,
  opts: EstimateOptions = {}
): QuantSpec | null {
  if (model.quants.length === 0) return null;
  const byQuality = [...model.quants].sort((a, b) => b.bpw - a.bpw);

  for (const q of byQuality) {
    const e = evaluate(model, q, specs, ctxTokens, opts);
    const onDevice = e.backend === 'gpu' || e.backend === 'unified';
    const withMargin = e.memory.total <= e.available * ENGINE_CONSTANTS.RECOMMEND_MARGIN;
    if (onDevice && withMargin) return q;
  }

  // Ninguna cabe entera en el acelerador. Entonces manda el veredicto y no la
  // calidad: una Q6_K que deja la mitad de las capas en RAM se arrastra, y
  // recomendarla por tener más bits sería recomendar la peor experiencia.
  let best: QuantSpec | null = null;
  let bestRank = Infinity;
  for (const q of byQuality) {
    const rank = VERDICT_RANK[evaluate(model, q, specs, ctxTokens, opts).verdict];
    if (rank < bestRank) {
      bestRank = rank;
      best = q;
    }
  }
  const smallest = byQuality[byQuality.length - 1] ?? null;
  return bestRank === VERDICT_RANK['no-cabe'] ? smallest : best;
}

/**
 * El veredicto para un modelo, una cuantización y un contexto concretos.
 *
 * `recommendedQuant` solo aparece cuando otra cuantización del mismo modelo le
 * sirve mejor a este equipo que la consultada.
 */
export function estimate(
  model: ModelSpec,
  quant: QuantSpec | string,
  specs: SystemSpecs,
  ctxTokens: number,
  opts: EstimateOptions = {}
): Estimate {
  const q = resolveQuant(model, quant);
  const result = evaluate(model, q, specs, ctxTokens, opts);
  const best = bestQuant(model, specs, ctxTokens, opts);
  const recommendedQuant = best && best.name !== q.name ? best.name : undefined;
  return recommendedQuant ? { ...result, recommendedQuant } : result;
}

/** Orden de peor a mejor veredicto, para ordenar listas de resultados. */
export function verdictRank(verdict: VerdictLevel): number {
  return VERDICT_RANK[verdict];
}
