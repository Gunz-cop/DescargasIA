/**
 * Capa de IA de la app "¿qué modelos de IA puedo correr?" — F6.
 *
 * Esta pieza es ENTERAMENTE OPCIONAL: si Workers AI se cae, se agota la cuota
 * o el usuario está sin red, la app sigue funcionando igual. La IA solo
 * traduce lenguaje a datos (`/api/hw/parse`, `/api/hw/gpu-lookup`) y datos a
 * lenguaje (`/api/hw/explain`). Ningún número del veredicto sale de aquí:
 * el motor determinista de F2 es el que decide, y el Worker solo reconcilia
 * lo que la IA diga de la GPU contra la base curada del repo.
 *
 * TypeScript que empaqueta wrangler; importa el matcher local de F2 y los
 * datos de F1 igual que lo haría el cliente.
 */

import { resolveGpu } from '../src/lib/hardware/resolve';
import type { GpuSpec, SystemSpecs, Vendor } from '../src/lib/hardware/types';
import gpusData from '../src/data/hardware/gpus.json';

/** Plazo máximo de espera a Workers AI. Ante fallo, el cliente sigue en local. */
const AI_TIMEOUT_MS = 6000;

const GPUS = gpusData as GpuSpec[];

/** Normaliza el nombre de GPU para usarlo como clave de caché KV. */
function normalizeGpuKey(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

interface AiBinding {
  run(model: string, inputs: Record<string, unknown>, opts?: { signal?: AbortSignal }): Promise<unknown>;
}

/** La respuesta de JSON mode viene bajo `.response`; lo resolvemos a un objeto. */
function unwrap(result: unknown): Record<string, unknown> {
  const obj = (result ?? {}) as Record<string, unknown>;
  const inner = obj.response;
  if (inner && typeof inner === 'object') return inner as Record<string, unknown>;
  return obj;
}

async function callAi(
  ai: AiBinding,
  messages: { role: 'system' | 'user'; content: string }[],
  responseFormat: unknown
): Promise<Record<string, unknown>> {
  const result = await ai.run(MODEL, { messages, response_format: responseFormat }, {
    signal: AbortSignal.timeout(AI_TIMEOUT_MS)
  });
  return unwrap(result);
}

// ---------------------------------------------------------------------------
// /api/hw/parse — texto libre → SystemSpecs parcial
// ---------------------------------------------------------------------------

export const PARSE_SCHEMA = {
  type: 'object',
  properties: {
    gpuName: { type: ['string', 'null'] },
    vramGb: { type: ['number', 'null'] },
    ramGb: { type: ['number', 'null'] },
    vendor: { type: ['string', 'null'], enum: ['nvidia', 'amd', 'intel', 'apple', 'other', null] },
    os: { type: ['string', 'null'], enum: ['windows', 'macos', 'linux', 'unknown', null] },
    cpuName: { type: ['string', 'null'] },
    confidence: { type: 'number' },
    unknownFields: { type: 'array', items: { type: 'string' } }
  },
  required: ['gpuName', 'vramGb', 'ramGb', 'vendor', 'os', 'cpuName', 'confidence', 'unknownFields'],
  additionalProperties: false
} as const;

const PARSE_RESPONSE_FORMAT = {
  type: 'json_schema',
  json_schema: PARSE_SCHEMA
} as const;

const PARSE_SYSTEM = [
  'Eres un extractor de especificaciones de hardware para una app que dice a la gente qué LLM puede correr en su máquina.',
  'Recibes texto libre en español, sueco o italiano y devuelves SOLO los datos que el usuario escribió explícitamente.',
  'REGLA DE ORO: extrae, no infieras. Si el usuario no mencionó la RAM, devuelve ramGb: null. Nunca inventes cifras.',
  'gpuName: el modelo de tarjeta gráfica si lo dijo (p. ej. "RTX 4060 Laptop"). vramGb: solo si dio VRAM. ramGb: solo si dio RAM del sistema.',
  'vendor: marca de la GPU si se deduce del nombre (nvidia/amd/intel/apple/other); si no, null.',
  'os: el sistema operativo si lo indicó (windows/macos/linux); si no, null. cpuName: el procesador si lo nombró.',
  'confidence: 0-1 según cuánto del texto entendiste. unknownFields: fragmentos que parecían specs pero no supiste clasificar.',
  'Responde siempre en el esquema JSON solicitado, sin texto adicional.'
].join(' ');

export async function parseSpecs(ai: AiBinding, text: string) {
  const result = await callAi(
    ai,
    [
      { role: 'system', content: PARSE_SYSTEM },
      { role: 'user', content: text }
    ],
    PARSE_RESPONSE_FORMAT
  );

  const get = (k: string) => (result[k] === undefined || result[k] === null ? null : result[k]);

  const rawGpuName = (get('gpuName') as string | null)?.trim() || null;
  const rawVram = get('vramGb') as number | null;
  const rawRam = get('ramGb') as number | null;
  const rawVendor = get('vendor') as Vendor | null;
  const rawOs = get('os') as SystemSpecs['os'] | null;
  const rawCpu = (get('cpuName') as string | null)?.trim() || null;
  const confidence = typeof result.confidence === 'number' ? result.confidence : 0;
  const unknownFields = Array.isArray(result.unknownFields)
    ? result.unknownFields.filter((x) => typeof x === 'string').map((x) => String(x))
    : [];

  // Reconciliación contra la base curada del repo (F1). Si la GPU está en la
  // base, GANÁ la base: se descarta cualquier VRAM/ancho de banda que la IA
  // haya dicho. Lo que la IA aporte para GPUs fuera de la base viaja como
  // "ai-estimate" y el cliente lo rotula como tal.
  const specs: SystemSpecs = {
    os: rawOs ?? 'unknown'
  };

  if (rawGpuName) {
    const resolved = resolveGpu(rawGpuName, GPUS);
    if (resolved.gpu) {
      const g = resolved.gpu;
      specs.gpu = {
        id: g.id,
        rawName: g.name,
        vramGb: g.vramGb,
        bandwidthGbs: g.bandwidthGbs,
        vendor: g.vendor,
        unifiedMemory: g.unifiedMemory ?? false,
        source: 'db'
      };
    } else {
      specs.gpu = {
        rawName: rawGpuName,
        vramGb: typeof rawVram === 'number' ? rawVram : undefined,
        vendor: rawVendor ?? undefined,
        source: 'ai-estimate'
      };
    }
  } else if (typeof rawVram === 'number') {
    specs.gpu = {
      rawName: 'desconocida',
      vramGb: rawVram,
      vendor: rawVendor ?? undefined,
      source: 'ai-estimate'
    };
  }

  if (typeof rawRam === 'number') {
    specs.ram = { totalGb: rawRam, source: 'ai-estimate' };
  }
  if (rawCpu) {
    specs.cpu = { rawName: rawCpu, source: 'ai-estimate' };
  }

  return { specs, confidence, unknownFields };
}

// ---------------------------------------------------------------------------
// /api/hw/gpu-lookup — GPU fuera de la base → specs estimados (cacheado en KV)
// ---------------------------------------------------------------------------

export const GPU_LOOKUP_SCHEMA = {
  type: 'object',
  properties: {
    vramGb: { type: ['number', 'null'] },
    bandwidthGbs: { type: ['number', 'null'] },
    vendor: { type: ['string', 'null'], enum: ['nvidia', 'amd', 'intel', 'apple', 'other', null] },
    year: { type: ['number', 'null'] },
    confidence: { type: 'number' }
  },
  required: ['vramGb', 'bandwidthGbs', 'vendor', 'year', 'confidence'],
  additionalProperties: false
} as const;

const GPU_LOOKUP_RESPONSE_FORMAT = {
  type: 'json_schema',
  json_schema: GPU_LOOKUP_SCHEMA
} as const;

const GPU_LOOKUP_SYSTEM = [
  'Eres una base de datos de tarjetas gráficas.',
  'Recibes el nombre de una GPU que no está en nuestra base local (puede estar mal escrita o ser muy nueva).',
  'Devuelve tu MEJOR ESTIMACIÓN de vramGb (memoria dedicada en GB), bandwidthGbs (ancho de banda en GB/s), vendor (nvidia/amd/intel/apple/other) y year (año aproximado).',
  'Si de verdad no tienes ni idea de algún campo, devuélvelo null. confidence: 0-1 de cuánto confías en la estimación.',
  'Nunca inventes una GPU que no existe. Responde siempre en el esquema JSON, sin texto adicional.'
].join(' ');

export async function lookupGpu(ai: AiBinding, name: string) {
  const result = await callAi(
    ai,
    [
      { role: 'system', content: GPU_LOOKUP_SYSTEM },
      { role: 'user', content: name }
    ],
    GPU_LOOKUP_RESPONSE_FORMAT
  );

  const num = (k: string): number | null => {
    const v = result[k];
    return typeof v === 'number' && Number.isFinite(v) ? v : null;
  };

  return {
    vramGb: num('vramGb'),
    bandwidthGbs: num('bandwidthGbs'),
    vendor: (result.vendor as Vendor | null) ?? null,
    year: num('year'),
    confidence: typeof result.confidence === 'number' ? result.confidence : 0
  };
}

// ---------------------------------------------------------------------------
// /api/hw/explain — veredicto ya calculado → prosa localizada (SOLO redacta)
// ---------------------------------------------------------------------------

export const EXPLAIN_SCHEMA = {
  type: 'object',
  properties: {
    sentences: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 3 },
    tips: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 2 }
  },
  required: ['sentences', 'tips'],
  additionalProperties: false
} as const;

const EXPLAIN_RESPONSE_FORMAT = {
  type: 'json_schema',
  json_schema: EXPLAIN_SCHEMA
} as const;

const EXPLAIN_SYSTEM = [
  'Eres el redactor de una app que explica, en lenguaje claro y cercano, qué modelos de IA puede correr el equipo de un usuario.',
  'Recibes un veredicto YA CALCULADO por un motor determinista (números exactos de VRAM/RAM, cuantización recomendada, tok/s).',
  'Tu único trabajo es REDACTAR: convierte esos datos en 2-3 frases en el idioma pedido y 2 consejos prácticos. NO calcules, NO corrijas cifras, NO inventes números.',
  'Si el veredicto es "no-cabe", explica con calma qué falta. Si es "holgado", felicita. Usa el tono del sitio: confiable, directo, sin tecnicismos innecesarios.'
].join(' ');

export async function explainVerdict(
  ai: AiBinding,
  payload: { verdict: string; summary: string; lang: string }
) {
  const user = [
    `Idioma: ${payload.lang}`,
    `Veredicto: ${payload.verdict}`,
    `Resumen de datos (ya calculados, no los cambies): ${payload.summary}`
  ].join('\n');

  const result = await callAi(
    ai,
    [
      { role: 'system', content: EXPLAIN_SYSTEM },
      { role: 'user', content: user }
    ],
    EXPLAIN_RESPONSE_FORMAT
  );

  const sentences = Array.isArray(result.sentences)
    ? result.sentences.filter((x) => typeof x === 'string').map((x) => String(x)).slice(0, 3)
    : [];
  const tips = Array.isArray(result.tips)
    ? result.tips.filter((x) => typeof x === 'string').map((x) => String(x)).slice(0, 2)
    : [];

  return { sentences, tips };
}

/** Modelo fijado en una única constante. Verificado contra el catálogo de
 *  Workers AI en el momento de implementar: el más pequeño con salida
 *  estructurada (JSON mode) de la lista oficial. El trabajo es extracción,
 *  no razonamiento, así que 8B alcanza. */
export const MODEL = '@cf/meta/llama-3.1-8b-instruct-fast';

export { normalizeGpuKey };
