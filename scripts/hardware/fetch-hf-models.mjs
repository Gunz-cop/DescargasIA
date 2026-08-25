/**
 * Descarga de Hugging Face los datos duros de cada modelo y los deja en
 * `scripts/hardware/hf-models-snapshot.json`.
 *
 *     node scripts/hardware/fetch-hf-models.mjs
 *
 * Es el único paso con red del lado de los modelos, y no corre en el build: su
 * salida está commiteada. Se vuelve a correr cuando se añaden modelos o cuando
 * alguien republica un GGUF con otro tamaño.
 *
 * De dónde sale cada cosa:
 *
 *   - `numLayers`, `numKvHeads`, `headDim`, `contextMax`: del `config.json` del
 *     repo oficial. Son los que permiten calcular el KV cache, y por eso
 *     `docs/fases/F1.md` los declara obligatorios.
 *   - `params`: del índice de safetensors que publica la propia API de HF, no de
 *     redondear el nombre del modelo ("8B" son 8.030.261.248 parámetros).
 *   - `fileSizeGb` de cada cuantización: del tamaño real del `.gguf` publicado.
 *     Nunca de una fórmula.
 *
 * Repos con acceso restringido (meta-llama, google/gemma) devuelven 401 al pedir
 * el `config.json`, así que la arquitectura se lee de una réplica pública que
 * publica el mismo archivo. `hfRepo` sigue apuntando al repo oficial, que es el
 * que se le enseña a la persona.
 */
import fs from 'node:fs';

const CATALOG = 'scripts/hardware/models-catalog.json';
const OUT = 'scripts/hardware/hf-models-snapshot.json';

/** Cuantizaciones que se guardan. El resto del repo GGUF se ignora. */
const QUANTS = ['Q2_K', 'Q3_K_M', 'Q4_K_M', 'Q5_K_M', 'Q6_K', 'Q8_0'];

const getJson = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(url + ' -> HTTP ' + response.status);
  return response.json();
};

/**
 * Los repos GGUF publican decenas de variantes por nivel: `Q4_K_L`, `Q4_K_S`,
 * `Q4_K_M-fp16`, `Q6_K-f32`… Solo vale el archivo canónico, `<base>-<QUANT>.gguf`,
 * o sus partes cuando el modelo es tan grande que va partido. Aceptar cualquier
 * cosa que contenga la cadena "Q4_K_M" mete un `Q4_K_M-fp16` de 6,8 GB donde
 * había uno de 5,8 y arruina el veredicto.
 */
const sizeOfQuant = (files, quant) => {
  // El separador es "-" en bartowski y unsloth y "." en TheBloke y QuantFactory.
  const exact = new RegExp('[-.]' + quant + '\\.gguf$');
  const split = new RegExp('[-.]' + quant + '-\\d{5}-of-\\d{5}\\.gguf$');
  const parts = files.filter(([name]) => {
    const file = name.split('/').pop();
    return exact.test(file) || split.test(file);
  });
  if (!parts.length) return null;
  return parts.reduce((total, [, size]) => total + size, 0);
};

const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));
const snapshot = {};

for (const model of catalog) {
  const config = await getJson('https://huggingface.co/' + (model.configRepo ?? model.hfRepo) + '/raw/main/config.json');
  // Gemma 3 y los multimodales anidan la arquitectura del LLM en `text_config`.
  const text = config.text_config ?? config;
  const meta = await getJson('https://huggingface.co/api/models/' + model.hfRepo);
  const gguf = await getJson('https://huggingface.co/api/models/' + model.ggufRepo + '?blobs=true');

  const files = gguf.siblings
    .filter((sibling) => sibling.rfilename.endsWith('.gguf'))
    .map((sibling) => [sibling.rfilename, sibling.size]);

  const quants = {};
  for (const quant of QUANTS) {
    const bytes = sizeOfQuant(files, quant);
    if (bytes) quants[quant] = bytes;
  }

  // El tag de Ollama es un enlace que la persona va a copiar y pegar en su
  // terminal: si no existe, se lleva un "model not found" con nuestro nombre
  // encima. Se comprueba contra el registro real, no de memoria.
  if (model.ollamaTag) {
    const [name, tag] = model.ollamaTag.split(':');
    const head = await fetch('https://registry.ollama.ai/v2/library/' + name + '/manifests/' + tag, {
      method: 'HEAD',
    });
    if (!head.ok) throw new Error(model.id + ': el tag de Ollama "' + model.ollamaTag + '" no existe');
  }

  snapshot[model.id] = {
    hfRepo: model.hfRepo,
    configRepo: model.configRepo ?? model.hfRepo,
    ggufRepo: model.ggufRepo,
    // Cuando el repo declara `other`, el nombre real de la licencia está en
    // `license_name`. La diferencia importa: la MNPL de Codestral prohíbe el uso
    // comercial, y enseñar "other" a quien va a instalarlo no le dice nada.
    license:
      meta?.cardData?.license === 'other'
        ? (meta?.cardData?.license_name ?? 'other')
        : (meta?.cardData?.license ?? null),
    params: meta?.safetensors?.total ?? null,
    numLayers: text.num_hidden_layers,
    numKvHeads: text.num_key_value_heads,
    headDim: text.head_dim ?? text.hidden_size / text.num_attention_heads,
    contextMax: text.max_position_embeddings,
    quants,
  };
  process.stderr.write('.');
}

fs.writeFileSync(OUT, JSON.stringify(snapshot, null, 2) + '\n');
console.error('\n' + OUT + ': ' + Object.keys(snapshot).length + ' modelos');
