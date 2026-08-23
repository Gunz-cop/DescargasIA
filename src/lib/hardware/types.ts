/**
 * Contrato de datos de la app "¿qué modelos de IA puedo correr?".
 *
 * Este archivo es la ÚNICA fuente de verdad de las formas que cruzan entre la
 * página, el Worker y los tests. Ninguna fase lo redefine: si algo falta, se
 * amplía aquí y se anota en `docs/app-compatibilidad-ia.md`.
 *
 * Regla que condiciona todo el módulo: es TypeScript puro, sin DOM, sin
 * imports de Astro y sin `import.meta.env`. Lo importan por igual el script de
 * cliente, el Worker de Cloudflare y `node --test`. Ver docs/fases/F0.md.
 */

export type Vendor = 'nvidia' | 'amd' | 'intel' | 'apple' | 'other';

export type FormFactor = 'desktop' | 'laptop' | 'integrated' | 'workstation';

/**
 * De dónde salió cada dato. Es lo que permite a la interfaz distinguir un dato
 * de una estimación en vez de presentarlo todo con la misma autoridad —
 * requisito de producto, no un detalle de implementación.
 *
 *   user        lo escribió la persona
 *   detected    lo leyó el navegador (topado y enmascarado: nunca es certeza)
 *   db          salió de src/data/hardware/
 *   ai-estimate lo estimó un modelo, y la interfaz debe rotularlo como tal
 */
export type SpecSource = 'user' | 'detected' | 'db' | 'ai-estimate';

export interface GpuSpec {
  id: string;
  name: string;
  /**
   * Cómo escribe la gente este modelo, más las cadenas crudas que devuelve
   * `WEBGL_debug_renderer_info`. Ningún alias puede pertenecer a dos GPUs.
   */
  aliases: string[];
  vendor: Vendor;
  /** Ausente cuando `unifiedMemory` es true: ahí la memoria sale de la RAM. */
  vramGb?: number;
  bandwidthGbs: number;
  arch?: string;
  year?: number;
  formFactor: FormFactor;
  /** Apple Silicon: CPU y GPU comparten la RAM del equipo. */
  unifiedMemory?: boolean;
  /** Fracción de la RAM asignable a la GPU en memoria unificada. Por defecto 0,75. */
  unifiedUsableFraction?: number;
}

export interface QuantSpec {
  /** Q4_K_M, Q8_0, … */
  name: string;
  /** Bits efectivos por parámetro. Convierte "8B parámetros" en gigabytes. */
  bpw: number;
  /** Tamaño real del .gguf publicado, no un cálculo. */
  fileSizeGb?: number;
  qualityNote?: string;
}

export interface ModelSpec {
  id: string;
  family: string;
  displayName: string;
  paramsB: number;
  /** Solo en MoE. Afecta la velocidad, no la memoria. */
  activeParamsB?: number;
  /**
   * Los tres campos de arquitectura son obligatorios: sin ellos no se puede
   * calcular el KV cache, y el veredicto caería en el error clásico de "cabe
   * el modelo" seguido de un OOM al pegar un documento largo.
   */
  numLayers: number;
  numKvHeads: number;
  headDim: number;
  contextMax: number;
  license: string;
  hfRepo: string;
  ollamaTag?: string;
  useCases: string[];
  quants: QuantSpec[];
}

/** El único objeto que cruza cliente ↔ Worker. */
export interface SystemSpecs {
  gpu?: {
    id?: string;
    rawName: string;
    vramGb?: number;
    bandwidthGbs?: number;
    vendor?: Vendor;
    unifiedMemory?: boolean;
    source: SpecSource;
  };
  ram?: { totalGb: number; source: SpecSource };
  cpu?: { rawName: string; cores?: number; source: SpecSource };
  os: 'windows' | 'macos' | 'linux' | 'unknown';
}

/** Cómo acabaría ejecutándose el modelo con este equipo. */
export type Backend = 'gpu' | 'partial-offload' | 'unified' | 'cpu';

export type VerdictLevel = 'holgado' | 'funciona' | 'justo' | 'no-cabe';

export type VerdictReason = 'vram' | 'contexto' | 'sin-gpu' | 'ram';

export interface Estimate {
  modelId: string;
  quant: string;
  backend: Backend;
  verdict: VerdictLevel;
  reason?: VerdictReason;
  /** Desglose en bytes, para poder pintar la barra apilada. */
  memory: { weights: number; kvCache: number; overhead: number; total: number };
  /** Memoria disponible según el backend elegido, en bytes. */
  available: number;
  contextTokens: number;
  /**
   * Rango, nunca cifra única: el método no sostiene esa precisión y quien lo
   * consuma está obligado a rotularlo como estimación.
   */
  tokensPerSecond: { min: number; max: number };
  /** Mejor cuantización que entra con margen, si la recomendada no es esta. */
  recommendedQuant?: string;
}

export interface ResolveResult {
  gpu: GpuSpec | null;
  /** 0 a 1. Alto = coincidencia directa; medio = mostrar candidatos. */
  score: number;
  candidates: GpuSpec[];
}
