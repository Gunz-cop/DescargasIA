/**
 * Matcher difuso local de tarjetas gráficas. F2 — docs/fases/F2.md.
 *
 * La IA nunca es el primer recurso: esto resuelve la mayoría de los casos sin
 * red, y solo lo que aquí queda sin match llega a `/api/hw/gpu-lookup` (F6) o
 * a que la persona teclee su VRAM a mano.
 *
 * TypeScript puro: sin DOM, sin Astro, sin variables de entorno.
 */

import type { FormFactor, GpuSpec, ResolveResult } from './types';

export const RESOLVE_THRESHOLDS = {
  /** Por encima de esto la coincidencia se da por buena. */
  direct: 0.65,
  /** Entre este umbral y el anterior se ofrece "¿quisiste decir…?". */
  candidate: 0.3,
  /** Cuántas candidatas devolver como máximo. */
  maxCandidates: 3
} as const;

/**
 * Palabras que la gente escribe pero no distinguen un modelo de otro. Si la
 * consulta las trae se cuentan; si no las trae, no penalizan a la candidata.
 * Sin esto, "3060ti" puntúa mal contra "NVIDIA GeForce RTX 3060 Ti" solo por
 * no haber escrito la marca entera.
 */
const OPTIONAL_QUALIFIERS = new Set([
  'nvidia',
  'geforce',
  'amd',
  'radeon',
  'intel',
  'apple',
  'rtx',
  'gtx',
  'rx',
  'arc'
]);

/** Ruido puro: no aporta ni cuando está. */
const NOISE_TOKENS = new Set([
  'angle',
  'gpu',
  'graphics',
  'grafica',
  'grafico',
  'tarjeta',
  'placa',
  'video',
  'card',
  'adapter',
  'gb',
  'series',
  'edition',
  'oem',
  'grafikkort',
  'scheda'
]);

/**
 * Señales de formato. Se quitan de ambos lados antes de puntuar —para que
 * "RTX 4060" y "RTX 4060 Laptop GPU" empaten— y se usan aparte para decidir
 * cuál de las dos quería la persona.
 */
const FORM_SIGNALS: Record<string, 'laptop' | 'desktop'> = {
  laptop: 'laptop',
  portatil: 'laptop',
  notebook: 'laptop',
  mobile: 'laptop',
  movil: 'laptop',
  maxq: 'laptop',
  desktop: 'desktop',
  sobremesa: 'desktop',
  escritorio: 'desktop',
  torre: 'desktop'
};

/**
 * Normaliza como escribe la gente de verdad y como escriben los navegadores.
 *
 * Minúsculas, sin acentos, sin los identificadores hex ni el envoltorio
 * `ANGLE (...)` de `WEBGL_debug_renderer_info`, y separando dígitos de letras
 * para que `3060ti` y `RTX3060Ti` acaben igual que `rtx 3060 ti`.
 */
export function normalizeGpuText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/0x[0-9a-f]+/g, ' ')
    .replace(/\bmax\s*-?\s*q\b/g, ' maxq ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/(\d)([a-z])/g, '$1 $2')
    .replace(/([a-z])(\d)/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
}

interface Parsed {
  /** Tokens con peso, ya sin ruido ni señales de formato. */
  tokens: string[];
  signal: 'laptop' | 'desktop' | null;
}

function parse(text: string): Parsed {
  const tokens: string[] = [];
  let signal: 'laptop' | 'desktop' | null = null;
  for (const token of normalizeGpuText(text).split(' ')) {
    if (!token) continue;
    const form = FORM_SIGNALS[token];
    if (form) {
      signal = signal ?? form;
      continue;
    }
    if (NOISE_TOKENS.has(token)) continue;
    tokens.push(token);
  }
  return { tokens, signal };
}

interface Surface {
  tokens: Set<string>;
}

interface Index {
  gpus: GpuSpec[];
  surfaces: Surface[][];
  weights: Map<string, number>;
}

const INDEX_CACHE = new WeakMap<readonly GpuSpec[], Index>();

function buildIndex(gpus: GpuSpec[]): Index {
  const surfaces: Surface[][] = [];
  const df = new Map<string, number>();
  let total = 0;

  for (const gpu of gpus) {
    const perGpu: Surface[] = [];
    for (const raw of [gpu.name, ...gpu.aliases]) {
      const tokens = new Set(parse(raw).tokens);
      if (tokens.size === 0) continue;
      perGpu.push({ tokens });
      total += 1;
      for (const token of tokens) df.set(token, (df.get(token) ?? 0) + 1);
    }
    surfaces.push(perGpu);
  }

  const weights = new Map<string, number>();
  for (const [token, count] of df) {
    weights.set(token, Math.log(1 + total / count));
  }

  return { gpus, surfaces, weights };
}

function indexOf(gpus: GpuSpec[]): Index {
  const cached = INDEX_CACHE.get(gpus);
  if (cached) return cached;
  const built = buildIndex(gpus);
  INDEX_CACHE.set(gpus, built);
  return built;
}

interface Scored {
  gpu: GpuSpec;
  score: number;
  /** Qué tokens de la consulta explica esta GPU. Define qué es un empate. */
  covered: string;
}

/**
 * Puntúa una superficie (nombre o alias) contra la consulta.
 *
 * Cuenta lo que la candidata explica de la consulta frente a lo que le sobra
 * a cada lado. Los tokens de la consulta que no existen en ninguna GPU pesan
 * 0, así que la morralla de las cadenas de WebGL no penaliza. Y una
 * coincidencia hecha solo de marcas no vale: "nvidia" no identifica nada.
 */
function scoreSurface(surface: Surface, query: Set<string>, weights: Map<string, number>) {
  let covered = 0;
  let candidateTotal = 0;
  let discriminative = false;
  const coveredTokens: string[] = [];

  for (const token of surface.tokens) {
    const weight = weights.get(token) ?? 0;
    const inQuery = query.has(token);
    if (inQuery) {
      covered += weight;
      coveredTokens.push(token);
      if (!OPTIONAL_QUALIFIERS.has(token)) discriminative = true;
      candidateTotal += weight;
    } else if (!OPTIONAL_QUALIFIERS.has(token)) {
      candidateTotal += weight;
    }
  }

  if (!discriminative || candidateTotal <= 0) return { score: 0, coveredTokens };

  let uncovered = 0;
  for (const token of query) {
    if (surface.tokens.has(token)) continue;
    uncovered += weights.get(token) ?? 0;
  }

  return { score: covered / (candidateTotal + uncovered), coveredTokens };
}

function matchesSignal(formFactor: FormFactor, signal: 'laptop' | 'desktop'): boolean {
  if (signal === 'laptop') return formFactor === 'laptop';
  return formFactor === 'desktop' || formFactor === 'workstation';
}

/**
 * Resuelve un texto libre a una GPU del catálogo.
 *
 * Devuelve `gpu: null` en dos situaciones distintas y ambas deliberadas:
 * cuando nada coincide lo bastante, y cuando coinciden igual de bien una
 * variante de escritorio y una de portátil con distinta VRAM. En ese segundo
 * caso las dos vuelven como candidatas: resolver por defecto a escritorio le
 * prometería 24 GB a quien tiene 16, que es exactamente el fallo que esta app
 * existe para corregir.
 */
export function resolveGpu(text: string, gpus: GpuSpec[]): ResolveResult {
  const empty: ResolveResult = { gpu: null, score: 0, candidates: [] };
  if (!text || gpus.length === 0) return empty;

  const { tokens, signal } = parse(text);
  if (tokens.length === 0) return empty;
  const query = new Set(tokens);

  const index = indexOf(gpus);
  const scored: Scored[] = [];

  for (let i = 0; i < index.gpus.length; i += 1) {
    let best = 0;
    let bestCovered: string[] = [];
    for (const surface of index.surfaces[i] ?? []) {
      const { score, coveredTokens } = scoreSurface(surface, query, index.weights);
      if (score > best) {
        best = score;
        bestCovered = coveredTokens;
      }
    }
    if (best >= RESOLVE_THRESHOLDS.candidate) {
      scored.push({
        gpu: index.gpus[i]!,
        score: best,
        covered: [...bestCovered].sort().join(' ')
      });
    }
  }

  if (scored.length === 0) return empty;

  scored.sort((a, b) => b.score - a.score || a.gpu.name.localeCompare(b.gpu.name));
  const candidates = scored.slice(0, RESOLVE_THRESHOLDS.maxCandidates).map((s) => s.gpu);

  // Empate: mismas palabras explicadas y misma puntuación. Es donde vive la
  // confusión entre escritorio y portátil.
  const top = scored[0]!;
  let peers = scored.filter((s) => s.covered === top.covered && s.score >= top.score - 1e-9);

  if (signal) {
    const filtered = peers.filter((s) => matchesSignal(s.gpu.formFactor, signal));
    if (filtered.length > 0) peers = filtered;
  } else if (peers.length > 1) {
    const forms = new Set(peers.map((s) => s.gpu.formFactor));
    const vrams = new Set(peers.map((s) => s.gpu.vramGb));
    if (forms.size > 1 && vrams.size > 1) {
      return {
        gpu: null,
        score: top.score,
        candidates: peers.slice(0, RESOLVE_THRESHOLDS.maxCandidates).map((s) => s.gpu)
      };
    }
  }

  const winner = peers[0] ?? top;
  return {
    gpu: winner.score >= RESOLVE_THRESHOLDS.direct ? winner.gpu : null,
    score: winner.score,
    candidates
  };
}
