/**
 * Modelos de prueba para el motor de F2.
 *
 * NO es el catálogo del producto: ese es `src/data/hardware/models.json` y lo
 * construye F1 (#6). Esto es el mínimo con el que se puede probar el motor
 * mientras F1 no cierre, tal como autoriza el contrato de entrada de
 * `docs/fases/F2.md`.
 *
 * `numLayers` / `numKvHeads` / `headDim` salen del `config.json` del repo en
 * Hugging Face. `fileSizeGb` es el tamaño del `.gguf` publicado y `bpw` es el
 * medido sobre ese archivo (`fileSizeGb * 8 / paramsB`), no el de la tabla de
 * referencia: son cosas distintas y la spec prohíbe intercambiarlas.
 */

/** @type {import('../../../src/lib/hardware/types.ts').ModelSpec[]} */
export const models = [
  {
    id: 'llama-3.1-8b-instruct',
    family: 'Llama',
    displayName: 'Llama 3.1 8B Instruct',
    paramsB: 8.03,
    numLayers: 32,
    numKvHeads: 8,
    headDim: 128,
    contextMax: 131072,
    license: 'Llama 3.1 Community License',
    hfRepo: 'meta-llama/Llama-3.1-8B-Instruct',
    ollamaTag: 'llama3.1:8b',
    useCases: ['chat', 'documentos'],
    quants: [
      { name: 'Q4_K_M', bpw: 4.9, fileSizeGb: 4.92 },
      { name: 'Q5_K_M', bpw: 5.71, fileSizeGb: 5.73 },
      { name: 'Q6_K', bpw: 6.58, fileSizeGb: 6.6 },
      { name: 'Q8_0', bpw: 8.51, fileSizeGb: 8.54 }
    ]
  },
  {
    id: 'qwen2.5-7b-instruct',
    family: 'Qwen',
    displayName: 'Qwen2.5 7B Instruct',
    paramsB: 7.62,
    numLayers: 28,
    numKvHeads: 4,
    headDim: 128,
    contextMax: 32768,
    license: 'Apache-2.0',
    hfRepo: 'Qwen/Qwen2.5-7B-Instruct',
    ollamaTag: 'qwen2.5:7b',
    useCases: ['chat', 'codigo'],
    quants: [
      { name: 'Q4_K_M', bpw: 4.91, fileSizeGb: 4.68 },
      { name: 'Q6_K', bpw: 6.55, fileSizeGb: 6.25 },
      { name: 'Q8_0', bpw: 8.5, fileSizeGb: 8.1 }
    ]
  },
  {
    id: 'mistral-7b-instruct-v0.3',
    family: 'Mistral',
    displayName: 'Mistral 7B Instruct v0.3',
    paramsB: 7.25,
    numLayers: 32,
    numKvHeads: 8,
    headDim: 128,
    contextMax: 32768,
    license: 'Apache-2.0',
    hfRepo: 'mistralai/Mistral-7B-Instruct-v0.3',
    ollamaTag: 'mistral:7b',
    useCases: ['chat'],
    quants: [
      { name: 'Q4_K_M', bpw: 4.82, fileSizeGb: 4.37 },
      { name: 'Q8_0', bpw: 8.5, fileSizeGb: 7.7 }
    ]
  },
  {
    id: 'gemma-2-9b-it',
    family: 'Gemma',
    displayName: 'Gemma 2 9B Instruct',
    paramsB: 9.24,
    numLayers: 42,
    numKvHeads: 8,
    headDim: 256,
    contextMax: 8192,
    license: 'Gemma Terms of Use',
    hfRepo: 'google/gemma-2-9b-it',
    ollamaTag: 'gemma2:9b',
    useCases: ['chat', 'documentos'],
    quants: [
      { name: 'Q4_K_M', bpw: 4.99, fileSizeGb: 5.76 },
      { name: 'Q6_K', bpw: 6.55, fileSizeGb: 7.57 }
    ]
  },
  {
    id: 'phi-3.5-mini-instruct',
    family: 'Phi',
    displayName: 'Phi-3.5 Mini Instruct',
    paramsB: 3.82,
    numLayers: 32,
    numKvHeads: 32,
    headDim: 96,
    contextMax: 131072,
    license: 'MIT',
    hfRepo: 'microsoft/Phi-3.5-mini-instruct',
    ollamaTag: 'phi3.5:3.8b',
    useCases: ['chat', 'razonamiento'],
    quants: [
      { name: 'Q4_K_M', bpw: 5.01, fileSizeGb: 2.39 },
      { name: 'Q8_0', bpw: 8.51, fileSizeGb: 4.06 }
    ]
  },
  {
    id: 'llama-3.2-3b-instruct',
    family: 'Llama',
    displayName: 'Llama 3.2 3B Instruct',
    paramsB: 3.21,
    numLayers: 28,
    numKvHeads: 8,
    headDim: 128,
    contextMax: 131072,
    license: 'Llama 3.2 Community License',
    hfRepo: 'meta-llama/Llama-3.2-3B-Instruct',
    ollamaTag: 'llama3.2:3b',
    useCases: ['chat'],
    quants: [
      { name: 'Q4_K_M', bpw: 5.03, fileSizeGb: 2.02 },
      { name: 'Q8_0', bpw: 8.52, fileSizeGb: 3.42 }
    ]
  },
  {
    id: 'smollm2-1.7b-instruct',
    family: 'SmolLM',
    displayName: 'SmolLM2 1.7B Instruct',
    paramsB: 1.71,
    numLayers: 24,
    numKvHeads: 32,
    headDim: 64,
    contextMax: 8192,
    license: 'Apache-2.0',
    hfRepo: 'HuggingFaceTB/SmolLM2-1.7B-Instruct',
    ollamaTag: 'smollm2:1.7b',
    useCases: ['chat'],
    quants: [
      { name: 'Q4_K_M', bpw: 4.96, fileSizeGb: 1.06 },
      { name: 'Q8_0', bpw: 8.51, fileSizeGb: 1.82 }
    ]
  },
  {
    id: 'deepseek-r1-distill-qwen-7b',
    family: 'DeepSeek',
    displayName: 'DeepSeek-R1 Distill Qwen 7B',
    paramsB: 7.62,
    numLayers: 28,
    numKvHeads: 4,
    headDim: 128,
    contextMax: 131072,
    license: 'MIT',
    hfRepo: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B',
    ollamaTag: 'deepseek-r1:7b',
    useCases: ['razonamiento', 'codigo'],
    quants: [{ name: 'Q4_K_M', bpw: 4.91, fileSizeGb: 4.68 }]
  },
  {
    id: 'mixtral-8x7b-instruct-v0.1',
    family: 'Mixtral',
    displayName: 'Mixtral 8x7B Instruct v0.1',
    paramsB: 46.7,
    // MoE: solo se leen dos expertos por token. Afecta a la velocidad, no a
    // la memoria: los pesos tienen que estar todos cargados igual.
    activeParamsB: 12.9,
    numLayers: 32,
    numKvHeads: 8,
    headDim: 128,
    contextMax: 32768,
    license: 'Apache-2.0',
    hfRepo: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    ollamaTag: 'mixtral:8x7b',
    useCases: ['chat', 'razonamiento'],
    quants: [{ name: 'Q4_K_M', bpw: 4.52, fileSizeGb: 26.4 }]
  },
  {
    id: 'llama-3.3-70b-instruct',
    family: 'Llama',
    displayName: 'Llama 3.3 70B Instruct',
    paramsB: 70.6,
    numLayers: 80,
    numKvHeads: 8,
    headDim: 128,
    contextMax: 131072,
    license: 'Llama 3.3 Community License',
    hfRepo: 'meta-llama/Llama-3.3-70B-Instruct',
    ollamaTag: 'llama3.3:70b',
    useCases: ['razonamiento', 'documentos'],
    quants: [
      { name: 'Q3_K_M', bpw: 3.91, fileSizeGb: 34.5 },
      { name: 'Q4_K_M', bpw: 4.82, fileSizeGb: 42.5 }
    ]
  }
];

export const byId = Object.fromEntries(models.map((m) => [m.id, m]));
