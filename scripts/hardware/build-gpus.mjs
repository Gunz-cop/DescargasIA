/**
 * Genera `src/data/hardware/gpus.json` a partir del snapshot de TechPowerUp.
 *
 *     node scripts/hardware/build-gpus.mjs
 *
 * No toca la red: lee `scripts/hardware/techpowerup-snapshot.json`, que está
 * commiteado. Quien quiera refrescarlo corre antes el extractor de Python que
 * hay al lado.
 *
 * Por qué existe este script en vez de un JSON escrito a mano: son ~430 GPUs y
 * el valor entero del producto se apoya en que la VRAM y el ancho de banda sean
 * ciertos. Transcribir cuatrocientas cifras a mano garantiza erratas; derivarlas
 * de un dataset y contrastar una muestra, no. `docs/fases/F1.md` lo contempla
 * explícitamente: si el JSON se genera, el generador se commitea.
 *
 * Lo que el script NO deriva del dataset, porque el dataset no lo trae, está en
 * las tablas curadas de más abajo, cada una con su fuente:
 *
 *   - El ancho de banda de las GPU integradas. No es una propiedad del chip
 *     gráfico sino de la RAM del equipo, así que TechPowerUp lo deja vacío. Se
 *     calcula del máximo de memoria que el fabricante documenta para esa
 *     plataforma (ver IGP_BANDWIDTH).
 *   - El nombre comercial de las variantes portátiles. TechPowerUp las llama
 *     "Mobile"; NVIDIA las llama "Laptop GPU" desde la serie 30, y es lo que
 *     devuelve `WEBGL_debug_renderer_info`, que es la cadena que F5 le pasará
 *     al resolver.
 *
 * Ver `src/data/hardware/README.md` para el detalle de fuentes y fechas.
 */
import fs from 'node:fs';
import path from 'node:path';

const SNAPSHOT = 'scripts/hardware/techpowerup-snapshot.json';
const OUT = 'src/data/hardware/gpus.json';

// ---------------------------------------------------------------------------
// 1. Qué se descarta
// ---------------------------------------------------------------------------

/**
 * SKU que no llegan a manos de un usuario que quiera correr un LLM en su
 * equipo, o que son la misma tarjeta con otro die. Meterlas solo ensucia el
 * autocompletado y multiplica las colisiones de alias.
 */
const DROP_NAME = [
  /\bOEM\b/i,
  /\bEmbedded\b/i,
  /\bPassive\b/i,
  /\bCNX\b/i,
  /\bX2\b/,
  /\bMac Edition\b/i,
  /\bCEO Edition\b/i,
  /50th Anniversary/i,
  /\bRev\. \d/i,
  /\d+Gbps\b/i,
  /-\d+Q$/, // particiones vGPU: RTX A5000-8Q
  /^PG\d/, // placas de ingeniería sin nombre comercial
  /\bTiM\b/,
  /\b(A800|H800)\b/, // variantes de exportación, no se venden al público
  /\bA100X\b/,
  /\bA10M\b/,
  /\bRefresh\b/i,
  /\bGeForce RTX 3060 3840SP\b/i,
  // Sufijos de die: es el mismo producto comercial, con otro chip dentro.
  /\b(GK|GP|GA|TU|AD|GB)\d{3}[A-Z]?$/,
  /\bGDDR5X\b/i,
  /\bA4 Mobile\b/, // SKU OEM sin nombre comercial público
];

/**
 * SKU concretas que el segundo dataset (el derivado de Wikipedia; ver
 * `cross-check-gpus.mjs`) no corrobora. TechPowerUp también cataloga tarjetas
 * anunciadas y nunca lanzadas, y alguna solo-OEM. Ante la duda se quitan:
 * `docs/fases/F1.md` es explícito en que una GPU de menos es mejor que una VRAM
 * equivocada.
 */
const DROP_EXACT = new Set([
  'GeForce RTX 3080 Ti 20 GB', // anunciada y cancelada; Wikipedia solo conoce la de 12 GB
  'GeForce RTX 3050 4 GB', // Wikipedia solo recoge la de escritorio en 6 y 8 GB
  'GeForce GT 1010', // solo OEM, y las dos fuentes no coinciden en el ancho de banda
  'GeForce GT 1010 DDR4',
]);

/** Generaciones enteras que quedan fuera del alcance de la v1. */
const DROP_GENERATION = new Set([
  'Server Hopper(Hxx)', // datacenter puro; nadie lo tiene bajo el escritorio
]);

/**
 * Las 900M de gama baja (910M–945M, MX) no llegan a correr ni un 3B con
 * contexto útil y son decenas de SKU casi idénticos. Se mantiene la gama GTX.
 */
const dropLowEnd900M = (row) =>
  row.generation === 'GeForce 900M' && !/GTX 9[5-8]/.test(row.name);

// ---------------------------------------------------------------------------
// 2. Ancho de banda de las GPU integradas
// ---------------------------------------------------------------------------

/**
 * Una iGPU no tiene memoria propia: usa la RAM del sistema por el mismo bus que
 * la CPU. Su ancho de banda depende de la RAM que lleve montada el equipo, no
 * del chip, y por eso TechPowerUp lo deja vacío.
 *
 * Lo que se guarda aquí es el **pico teórico de la plataforma**: la memoria más
 * rápida que el fabricante documenta como soportada, por el ancho de bus.
 *
 *     GB/s = MT/s x bits_de_bus / 8 / 1000
 *
 * Es un techo, no una medida: un portátil con un solo módulo (64 bits) va a la
 * mitad. El motor de F2 lo usa para estimar tok/s, y F4 tiene que rotularlo
 * como estimación —nunca como dato del equipo de quien consulta.
 */
const IGP_BANDWIDTH = {
  // AMD — memoria máxima soportada según la ficha de plataforma de AMD.
  'Vega II IGP(Renoir)': [3200, 128], // DDR4-3200
  'Vega II IGP(Renoir Mobile)': [3200, 128],
  'Vega II IGP(Lucienne Mobile)': [3200, 128],
  'Vega II IGP(Cezanne)': [3200, 128],
  'Vega II IGP(Cezanne Mobile)': [3200, 128],
  'Navi II IGP(Rembrandt Mobile)': [6400, 128], // LPDDR5-6400
  'Navi II IGP(Raphael)': [5200, 128], // DDR5-5200
  'Navi II IGP(Dragon Range-M)': [5600, 128], // DDR5-5600
  'Navi II IGP(Mendocino Mobile)': [5500, 128], // LPDDR5-5500
  'Navi III IGP(Phoenix)': [7500, 128], // LPDDR5x-7500
  'Navi III IGP(Phoenix Mobile)': [7500, 128],
  'Navi III IGP(Hawx Point Mobile)': [7500, 128],
  'Navi III IGP(Strix Point Mobile)': [7500, 128],
  // Ryzen AI Max ("Strix Halo"): bus de 256 bits, el motivo por el que aparece
  // en todas las conversaciones de LLM locales.
  'Navi Mobile(RX 8000M)': [8000, 256], // LPDDR5x-8000

  // Intel — memoria máxima soportada según ARK.
  'HD Graphics-M(Comet Lake)': [2933, 128], // DDR4-2933
  'HD Graphics(Comet Lake)': [2933, 128],
  'HD Graphics-M(Ice Lake)': [3733, 128], // LPDDR4x-3733
  'HD Graphics(Rocket Lake)': [3200, 128], // DDR4-3200
  'HD Graphics-M(Tiger Lake)': [4266, 128], // LPDDR4x-4266
  'HD Graphics(Alder Lake)': [4800, 128], // DDR5-4800
  'HD Graphics-M(Alder Lake)': [5200, 128], // LPDDR5-5200
  'HD Graphics(Raptor Lake)': [5600, 128], // DDR5-5600
  'HD Graphics-M(Raptor Lake)': [6400, 128], // LPDDR5x-6400
  'Arc Graphics-M(Meteor Lake)': [7467, 128], // LPDDR5x-7467
  'Arc Graphics-M(Lunar Lake)': [8533, 128], // LPDDR5x-8533
  'Arc Graphics-M(Arrow Lake)': [8400, 128], // LPDDR5x-8400
};

const bandwidthFor = (row) => {
  if (row.memory_bandwidth_gb_s) return round1(row.memory_bandwidth_gb_s);
  const platform = IGP_BANDWIDTH[row.generation];
  if (!platform) return null;
  const [mts, bits] = platform;
  return round1((mts * bits) / 8 / 1000);
};

// ---------------------------------------------------------------------------
// 3. Nombre comercial
// ---------------------------------------------------------------------------

/**
 * TechPowerUp llama "Mobile" a todas las variantes portátiles. NVIDIA las
 * bautizó "Laptop GPU" a partir de la serie 30, y esa es la cadena que aparece
 * dentro de `WEBGL_debug_renderer_info`:
 *
 *     ANGLE (NVIDIA, NVIDIA GeForce RTX 4060 Laptop GPU (0x000028E0) ...)
 *
 * Antes de la serie 30 no hubo sufijo oficial: la RTX 2060 de un portátil se
 * anunciaba "GeForce RTX 2060" a secas. Ahí se conserva "Mobile" como
 * desambiguador —el `id` y el `formFactor` son los que separan de verdad— y los
 * alias cubren las dos formas.
 */
const LAPTOP_GPU_BRANDING = new Set(['GeForce 30 Mobile', 'GeForce 40 Mobile', 'GeForce 50 Mobile']);

const commercialName = (row) => {
  let name = row.name;
  if (LAPTOP_GPU_BRANDING.has(row.generation)) {
    if (name.endsWith(' Mobile')) name = name.replace(/ Mobile$/, ' Laptop GPU');
    else if (name.includes(' Max-Q')) name = name.replace(/ Max-Q/, ' Laptop GPU Max-Q');
  }
  return name;
};

// ---------------------------------------------------------------------------
// 4. Clasificación
// ---------------------------------------------------------------------------

const VENDOR = { NVIDIA: 'nvidia', AMD: 'amd', Intel: 'intel' };

const isIntegrated = (row) => row.memory_type === 'System Shared';

const isLaptop = (row) =>
  / Mobile\b|Max-Q|\bLaptop\b/.test(row.name) ||
  /Mobile\)|Mobile$|900M|-M\(|-MW\(/.test(row.generation);

const isWorkstation = (row) =>
  /^(Quadro|Workstation|Server|Tesla|Ada-MW|Ampere-MW)/.test(row.generation);

const formFactorFor = (row) => {
  if (isIntegrated(row)) return 'integrated';
  if (isLaptop(row)) return 'laptop';
  if (isWorkstation(row)) return 'workstation';
  return 'desktop';
};

// ---------------------------------------------------------------------------
// 5. Alias
// ---------------------------------------------------------------------------

const strip = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

const VENDOR_WORD = { nvidia: 'nvidia', amd: 'amd', intel: 'intel' };

/**
 * Cómo escribe la gente el nombre de su tarjeta. El resolver de F2 normaliza
 * antes de comparar, así que aquí todo va en minúsculas y sin acentos; lo que
 * importa es cubrir las FORMAS: con y sin marca, con y sin "GeForce", pegado,
 * separado, "laptop" y "mobile", y la cadena que devuelve el navegador.
 */
const aliasesFor = ({ name, vendor, formFactor, vramGb }) => {
  const out = new Set();
  const add = (value) => {
    const clean = strip(value);
    if (clean) out.add(clean);
  };

  const base = strip(name);
  const vendorWord = VENDOR_WORD[vendor];

  /** Las variantes de una cadena: tal cual, sin la marca de familia, y pegada. */
  const forms = (value) => {
    const list = [value];
    // "geforce rtx 3060 ti" -> "rtx 3060 ti"; "radeon rx 7800 xt" -> "rx 7800 xt"
    const short = value.replace(/^(geforce|radeon|quadro) /, '');
    if (short !== value) list.push(short);
    // "geforce gtx 1660 ti" -> "gtx 1660 ti" -> "1660 ti"
    const bare = short.replace(/^(rtx|gtx|gt|rx|arc) /, '');
    if (bare !== short && /^\d/.test(bare)) list.push(bare);
    return list;
  };

  const variants = new Set();
  variants.add(base);
  // "GeForce RTX 4060 Laptop GPU" también se escribe "RTX 4060 Laptop" y
  // "RTX 4060 Mobile": son la misma tarjeta y la gente usa las tres.
  if (/ laptop gpu$/.test(base)) {
    variants.add(base.replace(/ laptop gpu$/, ' laptop'));
    variants.add(base.replace(/ laptop gpu$/, ' mobile'));
    variants.add(base.replace(/ laptop gpu$/, ' portatil'));
  }
  if (/ mobile$/.test(base)) {
    variants.add(base.replace(/ mobile$/, ' laptop'));
    variants.add(base.replace(/ mobile$/, ' laptop gpu'));
    variants.add(base.replace(/ mobile$/, ' portatil'));
  }
  if (/ laptop gpu max-q$/.test(base)) {
    variants.add(base.replace(/ laptop gpu max-q$/, ' max-q'));
    variants.add(base.replace(/ laptop gpu max-q$/, ' max q'));
  }
  if (/max-q/.test(base)) variants.add(base.replace(/max-q/, 'max q'));
  for (const variant of [...variants]) {
    // "8 GB" en el nombre: la gente escribe también "8gb".
    if (/ \d+ gb\b/.test(variant)) variants.add(variant.replace(/ (\d+) gb\b/, ' $1gb'));
  }

  const expand = (source, sink) => {
    for (const variant of source) {
      for (const form of forms(variant)) {
        sink(form);
        sink(vendorWord + ' ' + form);
        // Todo junto, que es como media internet escribe el modelo:
        // "rtx 3060 ti" -> "rtx3060ti", y su forma corta -> "3060ti".
        sink(form.replace(/ /g, ''));
      }
    }
  };

  expand(variants, add);
  // Las integradas se nombran casi siempre sin marca ("780m", "iris xe"), ya
  // cubierto arriba. Para las de escritorio, la forma sin la marca de familia
  // es la más tecleada y ya está en `forms`.
  if (formFactor === 'integrated') add(vendorWord + ' ' + base);

  // La FORMA DESNUDA: el nombre sin ninguno de los dos desambiguadores, ni la
  // capacidad ni el sufijo de portátil. "GeForce RTX 4090 Laptop GPU" y
  // "GeForce RTX 3060 12 GB" se reducen las dos a lo que la gente teclea de
  // verdad. Sale aparte porque es la que se disputan varias tarjetas, y quién se
  // la queda —o si no se la queda nadie— lo decide el reparto de más abajo.
  const bareKey = base
    .replace(/ \d+ ?gb\b/, '')
    .replace(/ (laptop gpu|laptop|mobile|portatil)( max-q)?$/, '')
    .trim();

  const bare = new Set();
  if (bareKey !== base) {
    expand([bareKey], (value) => {
      const clean = strip(value);
      if (clean && !out.has(clean)) bare.add(clean);
    });
  } else {
    // La tarjeta se llama ya por su forma desnuda —el caso de las de escritorio,
    // "GeForce RTX 4090"—, así que TODOS sus alias son la forma en disputa.
    for (const value of out) bare.add(value);
    out.clear();
  }

  /**
   * Alias de reserva para cuando la forma desnuda queda sin dueño. Llevan la
   * señal que falta —de formato o de capacidad—, que es la que F2 busca en el
   * texto para desempatar. Sin ellos, una tarjeta cuyo nombre ES la forma
   * desnuda (una "GeForce RTX 4090", una "Radeon RX 9070 GRE") se quedaría
   * literalmente sin ningún alias propio.
   */
  const markedByFormat = new Set();
  if (formFactor !== 'laptop') {
    expand([bareKey + ' desktop', bareKey + ' sobremesa', bareKey + ' de escritorio'], (value) => {
      const clean = strip(value);
      if (clean) markedByFormat.add(clean);
    });
  }

  const capacity = vramGb ? [bareKey + ' ' + vramGb + ' gb', bareKey + ' ' + vramGb + 'gb'] : [];

  const markedByCapacity = new Set();
  expand(capacity, (value) => {
    const clean = strip(value);
    if (clean && !out.has(clean)) markedByCapacity.add(clean);
  });

  // Y las dos señales juntas, para el caso en que ninguna basta por separado: una
  // "GeForce RTX 2060" convive con una de 12 GB (misma forma) y con una de
  // portátil de 6 GB (misma memoria), así que solo "rtx 2060 6gb desktop" la
  // identifica sin ambigüedad.
  const markedByBoth = new Set();
  if (formFactor !== 'laptop') {
    expand(
      capacity.flatMap((value) => [value + ' desktop', value + ' sobremesa']),
      (value) => {
        const clean = strip(value);
        if (clean && !out.has(clean)) markedByBoth.add(clean);
      }
    );
  }

  return {
    specific: [...out],
    bare: [...bare],
    markedByFormat: [...markedByFormat],
    markedByCapacity: [...markedByCapacity],
    markedByBoth: [...markedByBoth],
    bareKey,
  };
};

// ---------------------------------------------------------------------------
// 6. Construcción
// ---------------------------------------------------------------------------

const round1 = (n) => Math.round(n * 10) / 10;

const slug = (value) =>
  strip(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const rows = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));

const kept = [];
const dropped = { patron: 0, generacion: 0, 'sin-ancho-de-banda': 0, 'sin-vram': 0, duplicado: 0 };
const seenName = new Map();

for (const row of rows) {
  if (DROP_GENERATION.has(row.generation) || dropLowEnd900M(row)) {
    dropped.generacion++;
    continue;
  }
  if (DROP_EXACT.has(row.name) || DROP_NAME.some((pattern) => pattern.test(row.name))) {
    dropped.patron++;
    continue;
  }

  const vendor = VENDOR[row.manufacturer];
  const formFactor = formFactorFor(row);
  const integrated = formFactor === 'integrated';
  const vramGb = integrated ? null : row.memory_size_gb;

  // Una VRAM equivocada es peor que una GPU de menos: si el dato no está, la
  // entrada no entra. Ver "Verificación de los datos" en docs/fases/F1.md.
  if (!integrated && !(vramGb > 0)) {
    dropped['sin-vram']++;
    continue;
  }
  const bandwidthGbs = bandwidthFor(row);
  if (!(bandwidthGbs > 0)) {
    dropped['sin-ancho-de-banda']++;
    continue;
  }

  const name = commercialName(row);

  // El dataset trae la misma GPU varias veces cuando se relanzó en otra
  // plataforma (la Radeon 780M aparece en Phoenix, Phoenix Mobile y Hawk
  // Point). Gana la primera aparición; si una repetición trae más ancho de
  // banda que la que ganó, se queda con el mayor: es la misma pieza.
  const key = vendor + '|' + name;
  if (seenName.has(key)) {
    const previous = seenName.get(key);
    previous.bandwidthGbs = Math.max(previous.bandwidthGbs, bandwidthGbs);
    dropped.duplicado++;
    continue;
  }

  const entry = {
    id: vendor + '-' + slug(name),
    name,
    aliases: [],
    vendor,
    ...(integrated ? {} : { vramGb: round1(vramGb) }),
    bandwidthGbs,
    ...(row.architecture ? { arch: row.architecture } : {}),
    ...(row.release_date ? { year: Number(row.release_date.slice(0, 4)) } : {}),
    formFactor,
    ...(integrated
      ? {
          // Una iGPU no tiene memoria propia: la toma prestada de la RAM. Es el
          // mismo caso que Apple Silicon, y el motor lo trata igual.
          unifiedMemory: true,
          // Windows expone como "memoria de GPU compartida" la mitad de la RAM
          // del sistema, y es el techo real con el que se topa quien carga un
          // modelo en una integrada.
          unifiedUsableFraction: 0.5,
        }
      : {}),
    _releaseDate: row.release_date ?? '9999-99-99',
    _tpu: row.tpu_url,
  };

  seenName.set(key, entry);
  kept.push(entry);
}

// Alias: se reparten por orden de salida al mercado. Cuando dos tarjetas se
// disputan la forma corta ("rtx 3060" la quieren la de 12 GB y la de 8 GB), se
// la queda la que salió primero, que es la que la gente llama así. La otra
// conserva sus alias con la capacidad ("rtx 3060 8gb").
kept.sort((a, b) => a._releaseDate.localeCompare(b._releaseDate) || a.name.localeCompare(b.name));

const aliasOwner = new Map();
const collisions = [];
const claim = (entry, aliases) => {
  for (const alias of aliases) {
    if (aliasOwner.has(alias)) {
      collisions.push(alias + ': ' + aliasOwner.get(alias) + ' gana a ' + entry.id);
      continue;
    }
    aliasOwner.set(alias, entry.id);
    entry.aliases.push(alias);
  }
};

// Primera ronda: cada tarjeta se queda con las formas que llevan un
// desambiguador —la capacidad, el sufijo de portátil— y que por tanto no puede
// disputarle nadie.
const alias = kept.map((entry) => aliasesFor(entry));
kept.forEach((entry, index) => claim(entry, alias[index].specific));

// Segunda ronda: la forma desnuda, la que la gente teclea de verdad.
//
// Si se la disputan dos tarjetas con distinta memoria, NO se le adjudica a
// ninguna. Sin alias, el matcher de F2 puntúa la cadena contra los dos `name`
// completos, empata, y cae en la vía de "¿quisiste decir…?" con las dos
// candidatas — que es lo que el producto quiere que pase.
//
// El caso obvio son las variantes de capacidad: "rtx 3060" la quieren la de
// 12 GB y la de 8 GB, y adivinar promete 4 GB que quizá no existen.
//
// El caso que importa de verdad es el otro eje, escritorio contra portátil. Una
// RTX 4090 son 24 GB en una torre y 16 en un portátil; una 4070, 12 contra 8.
// Dejar que la forma corta se la quede la de escritorio —que es lo que pasa si
// uno no lo piensa, porque su nombre ES la forma corta— reintroduce en silencio
// el sesgo que esta app existe para corregir, y encima en la dirección
// peligrosa: prometerle memoria de más a quien tiene menos.
//
// Lo que decide el empate es la MEMORIA, no el formato. Cuando escritorio y
// portátil coinciden en VRAM (la RTX 4060 son 8 GB en los dos), el veredicto sale
// igual por cualquiera de las dos y la forma corta se la queda la de escritorio,
// que es de quien es el nombre: NVIDIA le pone "Laptop GPU" a la otra. Lo único
// que difiere ahí es el ancho de banda, que solo mueve una estimación de tok/s ya
// presentada como rango.
//
// La de escritorio nunca se queda muda: cuando pierde la forma corta recibe sus
// alias con señal explícita ("rtx 4090 desktop", "rtx 4090 sobremesa"), que es la
// señal que F2 busca en el texto.
// El reparto se decide POR CADENA DE ALIAS, no por nombre. Dos tarjetas de
// familias distintas pueden producir la misma forma corta —"Quadro T1000 Mobile"
// y "T1000" se reducen las dos a "t1000"— y agrupar por nombre las dejaría
// pasar.
const bareClaimants = new Map();
kept.forEach((entry, index) => {
  for (const value of alias[index].bare) {
    if (aliasOwner.has(value)) continue;
    if (!bareClaimants.has(value)) bareClaimants.set(value, []);
    bareClaimants.get(value).push(index);
  }
});

/** Qué memoria promete esta tarjeta. `unificada` no se compara con un número. */
const memorySignature = (entry) => (entry.unifiedMemory ? 'unificada' : String(entry.vramGb));

const ambiguous = [];
for (const [value, indexes] of bareClaimants) {
  const entries = indexes.map((index) => kept[index]);

  if (new Set(entries.map(memorySignature)).size > 1) {
    ambiguous.push(value);
    continue;
  }

  // Todas prometen la misma memoria, así que la forma corta no puede mentir. Se
  // la queda la de escritorio si hay exactamente una —el nombre desnudo es suyo,
  // NVIDIA le pone "Laptop GPU" a la otra—, y si no, la más antigua, que es a la
  // que la gente llama así.
  const desktops = indexes.filter((index) => kept[index].formFactor !== 'laptop');
  const winner = desktops.length === 1 ? desktops[0] : indexes[0];
  claim(kept[winner], [value]);
}

// Una tarjeta cuyo nombre ES la forma corta ("GeForce RTX 4090", "Radeon RX 9070
// GRE") se queda sin ningún alias cuando esa forma cae en disputa. Recibe
// entonces los alias con señal explícita —de formato, de capacidad, o las dos
// juntas cuando ninguna basta por separado—, que es la señal que F2 busca en el
// texto para desempatar.
const quiet = (entry, aliases) => {
  for (const value of aliases) {
    if (aliasOwner.has(value)) continue;
    aliasOwner.set(value, entry.id);
    entry.aliases.push(value);
  }
};

let rescued = 0;
kept.forEach((entry, index) => {
  if (entry.aliases.length) return;
  quiet(entry, alias[index].markedByFormat);
  quiet(entry, alias[index].markedByCapacity);
  quiet(entry, alias[index].markedByBoth);
  rescued++;
});

const orphans = kept.filter((entry) => entry.aliases.length === 0);
if (orphans.length) {
  console.error('GPUs sin ningún alias propio (revisar): ' + orphans.map((e) => e.id).join(', '));
  process.exit(1);
}

const ids = new Set();
for (const entry of kept) {
  if (ids.has(entry.id)) {
    console.error('id duplicado: ' + entry.id);
    process.exit(1);
  }
  ids.add(entry.id);
}

const output = kept
  .sort((a, b) => a.id.localeCompare(b.id))
  .map(({ _releaseDate, _tpu, ...entry }) => entry);

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(output, null, 2) + '\n');

const count = (predicate) => output.filter(predicate).length;
console.log(OUT + ': ' + output.length + ' GPUs');
console.log('  desktop:     ' + count((g) => g.formFactor === 'desktop'));
console.log('  laptop:      ' + count((g) => g.formFactor === 'laptop'));
console.log('  integrated:  ' + count((g) => g.formFactor === 'integrated'));
console.log('  workstation: ' + count((g) => g.formFactor === 'workstation'));
console.log('  alias:       ' + aliasOwner.size);
console.log('Descartadas: ' + JSON.stringify(dropped));
console.log('Formas cortas sin dueño por ambiguedad: ' + ambiguous.length);
console.log('Tarjetas rescatadas con alias de señal explicita: ' + rescued);
console.log('Colisiones directas de nombre exacto: ' + collisions.length);
if (process.env.DEBUG_ALIAS) console.log(collisions.slice(0, 12).join('\n'));
