/**
 * Auditoría de la base de datos de hardware de la app "¿qué modelos de IA puedo
 * correr?".
 *
 * Se ejecuta con `npm run hw:audit`, y `npm run build` la encadena antes de
 * compilar, igual que `audit-catalog.mjs`. Sale con código 1 si algo falla.
 *
 * Qué protege, y por qué cada regla existe:
 *
 *   - El esquema, con zod. Estos cuatro JSON son el contrato que F2 consume y F6
 *     embebe en el Worker; un campo que falta ahí revienta lejos de aquí.
 *   - Los `id` únicos. Un id repetido hace que dos tarjetas distintas compartan
 *     ficha y el veredicto salga de la que no es.
 *   - Los alias sin colisión. Un alias que apunta a dos GPU distintas obliga al
 *     matcher a elegir a ciegas, y elegir a ciegas entre 8 y 16 GB de VRAM es
 *     exactamente el error que esta app existe para no cometer.
 *   - `vramGb > 0` salvo memoria unificada. Una GPU sin VRAM declarada y sin
 *     `unifiedMemory` haría que el motor calculara sobre cero.
 *   - `fileSizeGb` contra `paramsB * bpw / 8`. Atrapa la errata de un dígito:
 *     4,92 GB escrito 49,2 GB pasa desapercibido leyendo, no aquí.
 *   - Cobertura mínima de portátiles e integradas. Es el diferenciador del
 *     producto: si alguien recorta el JSON y se lleva por delante las variantes
 *     Laptop, la app vuelve a ser la que dejaba fuera al usuario que la motivó.
 *
 * Ver `docs/fases/F1.md` y `src/data/hardware/README.md`.
 */
import fs from 'node:fs';
import { z } from 'zod';

const DIR = 'src/data/hardware';
const BRAND_FILE = 'src/utils/brand.ts';

/** Ver "Cobertura mínima obligatoria" en docs/fases/F1.md. */
const MIN_LAPTOP = 30;
const MIN_INTEGRATED = 10;

/**
 * Margen entre el tamaño real del `.gguf` y el que predicen los bits por
 * parámetro. No es holgura para que quepan datos flojos: es lo que tolera que un
 * repo republique un requantizado algo distinto. Una errata de un dígito se sale
 * de aquí por un factor de diez.
 */
const SIZE_TOLERANCE = 0.25;

const errors = [];
const warnings = [];

const readJson = (file) => JSON.parse(fs.readFileSync(DIR + '/' + file, 'utf8'));

// --- Esquemas --------------------------------------------------------------
// Reflejan `src/lib/hardware/types.ts`, que es el contrato y no se toca desde
// aquí. `strict()` es deliberado: un campo de más suele ser un campo mal escrito.

const gpuSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    aliases: z.array(z.string().min(1)).min(1),
    vendor: z.enum(['nvidia', 'amd', 'intel', 'apple', 'other']),
    vramGb: z.number().positive().optional(),
    bandwidthGbs: z.number().positive(),
    arch: z.string().optional(),
    year: z.number().int().min(1990).max(2100).optional(),
    formFactor: z.enum(['desktop', 'laptop', 'integrated', 'workstation']),
    unifiedMemory: z.boolean().optional(),
    unifiedUsableFraction: z.number().positive().max(1).optional(),
  })
  .strict();

const quantSchema = z
  .object({
    name: z.string().min(1),
    bpw: z.number().positive(),
    fileSizeGb: z.number().positive().optional(),
    qualityNote: z.string().optional(),
  })
  .strict();

const modelSchema = z
  .object({
    id: z.string().min(1),
    family: z.string().min(1),
    displayName: z.string().min(1),
    paramsB: z.number().positive(),
    activeParamsB: z.number().positive().optional(),
    numLayers: z.number().int().positive(),
    numKvHeads: z.number().int().positive(),
    headDim: z.number().int().positive(),
    contextMax: z.number().int().positive(),
    license: z.string().min(1),
    hfRepo: z.string().min(1),
    ollamaTag: z.string().min(1).optional(),
    useCases: z.array(z.string().min(1)).min(1),
    quants: z.array(quantSchema).min(1),
  })
  .strict();

const parse = (file, schema, raw) => {
  const result = z.array(schema).safeParse(raw);
  if (result.success) return result.data;
  for (const issue of result.error.issues) {
    errors.push(file + ': ' + issue.path.join('.') + ' — ' + issue.message);
  }
  return [];
};

const gpus = parse('gpus.json', gpuSchema, readJson('gpus.json'));
const apple = parse('apple-silicon.json', gpuSchema, readJson('apple-silicon.json'));
const models = parse('models.json', modelSchema, readJson('models.json'));
const quants = parse('quants.json', quantSchema, readJson('quants.json'));

// --- 1. Identificadores únicos --------------------------------------------
const checkIds = (file, entries) => {
  const seen = new Set();
  for (const entry of entries) {
    if (seen.has(entry.id ?? entry.name)) {
      errors.push(file + ': "' + (entry.id ?? entry.name) + '" está dos veces.');
    }
    seen.add(entry.id ?? entry.name);
  }
};

checkIds('gpus.json', gpus);
checkIds('apple-silicon.json', apple);
checkIds('models.json', models);
checkIds('quants.json', quants.map((quant) => ({ id: quant.name })));

// Los dos archivos de GPU alimentan el mismo resolver, así que sus ids compiten
// en el mismo espacio de nombres aunque vivan separados.
const gpuIds = new Set(gpus.map((gpu) => gpu.id));
for (const chip of apple) {
  if (gpuIds.has(chip.id)) {
    errors.push('apple-silicon.json: "' + chip.id + '" choca con un id de gpus.json.');
  }
}

// --- 2. Alias sin colisión -------------------------------------------------
const allGpus = [...gpus, ...apple];
const aliasOwner = new Map();
for (const gpu of allGpus) {
  const seen = new Set();
  for (const alias of gpu.aliases ?? []) {
    if (alias !== alias.trim().toLowerCase()) {
      errors.push(gpu.id + ': el alias "' + alias + '" no está normalizado (minúsculas, sin espacios sobrantes).');
    }
    if (seen.has(alias)) {
      warnings.push(gpu.id + ' repite el alias "' + alias + '".');
      continue;
    }
    seen.add(alias);

    const owner = aliasOwner.get(alias);
    if (owner && owner !== gpu.id) {
      errors.push('El alias "' + alias + '" apunta a la vez a ' + owner + ' y a ' + gpu.id + '.');
      continue;
    }
    aliasOwner.set(alias, gpu.id);
  }
}

// --- 3. Memoria coherente --------------------------------------------------
for (const gpu of allGpus) {
  if (gpu.unifiedMemory) {
    if (gpu.vramGb !== undefined) {
      errors.push(gpu.id + ': declara `unifiedMemory` y a la vez `vramGb`. La memoria sale de la RAM o de la tarjeta, no de las dos.');
    }
    if (gpu.unifiedUsableFraction === undefined) {
      warnings.push(gpu.id + ': memoria unificada sin `unifiedUsableFraction`; el motor usará su valor por defecto.');
    }
  } else if (!(gpu.vramGb > 0)) {
    errors.push(gpu.id + ': sin `vramGb` y sin `unifiedMemory`. El motor calcularía sobre cero.');
  }
}

// --- 4. Cobertura ----------------------------------------------------------
const byFormFactor = (formFactor) => gpus.filter((gpu) => gpu.formFactor === formFactor).length;

if (byFormFactor('laptop') < MIN_LAPTOP) {
  errors.push(
    'gpus.json: solo ' + byFormFactor('laptop') + ' GPU con formFactor "laptop"; el mínimo es ' + MIN_LAPTOP +
      '. Las variantes Laptop son el hueco que esta app existe para cubrir.'
  );
}
if (byFormFactor('integrated') < MIN_INTEGRATED) {
  errors.push(
    'gpus.json: solo ' + byFormFactor('integrated') + ' GPU con formFactor "integrated"; el mínimo es ' + MIN_INTEGRATED + '.'
  );
}

// --- 5. Tamaños de los GGUF ------------------------------------------------
const quantNames = new Set(quants.map((quant) => quant.name));

for (const model of models) {
  const seen = new Set();
  for (const quant of model.quants) {
    if (seen.has(quant.name)) {
      errors.push(model.id + ': la cuantización "' + quant.name + '" está dos veces.');
    }
    seen.add(quant.name);

    if (!quantNames.has(quant.name)) {
      warnings.push(model.id + ': "' + quant.name + '" no está en quants.json, así que se queda sin nota de calidad.');
    }

    if (quant.fileSizeGb === undefined) continue;
    const expected = (model.paramsB * quant.bpw) / 8;
    const drift = Math.abs(quant.fileSizeGb / expected - 1);
    if (drift > SIZE_TOLERANCE) {
      errors.push(
        model.id + ' / ' + quant.name + ': el archivo pesa ' + quant.fileSizeGb + ' GB pero ' + model.paramsB +
          ' B a ' + quant.bpw + ' bpw dan ' + expected.toFixed(2) + ' GB (' + Math.round(drift * 100) + ' % de desvío).'
      );
    }
  }

  if (model.activeParamsB && model.activeParamsB > model.paramsB) {
    errors.push(model.id + ': `activeParamsB` es mayor que `paramsB`.');
  }
  if (model.numKvHeads > model.numLayers * 1000) {
    errors.push(model.id + ': `numKvHeads` fuera de rango.');
  }
}

// --- 6. Casos de uso contra las categorías reales del sitio ----------------
// Un `useCases` que no existe como categoría deja el bloque de "dónde aprender a
// instalarlo" enlazando a una página que no se genera.
const brandCategories = new Set(
  [...fs.readFileSync(BRAND_FILE, 'utf8').matchAll(/^\s{4}slug: '([^']+)',/gm)].map((match) => match[1])
);
for (const model of models) {
  for (const useCase of model.useCases) {
    if (!brandCategories.has(useCase)) {
      errors.push(
        model.id + ': `useCases` cita "' + useCase + '", que no es una categoría de ' + BRAND_FILE + '.'
      );
    }
  }
}

// --- Informe ---------------------------------------------------------------
console.log('--- Auditoria de la base de hardware ---');
console.log('GPUs:      ' + gpus.length + ' (' + byFormFactor('desktop') + ' escritorio, ' + byFormFactor('laptop') +
  ' portatil, ' + byFormFactor('integrated') + ' integrada, ' + byFormFactor('workstation') + ' workstation)');
console.log('Apple:     ' + apple.length + ' chips de memoria unificada');
console.log('Alias:     ' + aliasOwner.size + ' sin colisiones');
console.log('Modelos:   ' + models.length + ' en ' + new Set(models.map((m) => m.family)).size + ' familias');
console.log('Cuantiz.:  ' + quants.length);

if (warnings.length) {
  console.log('\nAVISOS (' + warnings.length + '):');
  for (const warning of warnings.slice(0, 10)) console.log('  ! ' + warning);
  if (warnings.length > 10) console.log('  ... y ' + (warnings.length - 10) + ' mas');
}

if (errors.length) {
  console.log('\nERRORES (' + errors.length + '):');
  for (const error of errors) console.log('  x ' + error);
  console.log('\nFallo la auditoria de la base de hardware.');
  process.exit(1);
}

console.log('\nBase de hardware integra.');
