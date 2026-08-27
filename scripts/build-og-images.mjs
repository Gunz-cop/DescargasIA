import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import satori from 'satori';
import { getCategoryLabel } from '../src/utils/brand.ts';
import { useTranslations } from '../src/i18n/ui.ts';
import { Resvg } from '@resvg/resvg-js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const OG_DIR = path.join(PUBLIC_DIR, 'og');
const MANIFEST_PATH = path.join(ROOT, '.og-image-manifest.json');
const FONTS_DIR = path.join(ROOT, 'assets', 'fonts-og');
const WIDTH = 1200;
const HEIGHT = 630;
const GENERATOR_VERSION = '2';
const LANGS = ['es', 'sv', 'it'];

const palette = {
  bg: '#04120e',
  surface: '#0a211b',
  signal: '#0fbf8f',
  find: '#c6f24e',
  ink: '#e8f5f0',
  muted: '#9bb5ad',
  line: '#1b3a32'
};

const font = (file, name, weight) => ({
  name,
  data: fs.readFileSync(path.join(FONTS_DIR, file)),
  weight,
  style: 'normal'
});

const fonts = [
  font('SpaceGrotesk-Regular.ttf', 'Space Grotesk', 400),
  font('SpaceGrotesk-Medium.ttf', 'Space Grotesk', 500),
  font('SpaceGrotesk-Bold.ttf', 'Space Grotesk', 700),
  font('IBM-Plex-Mono-Regular.ttf', 'IBM Plex Mono', 400),
  font('IBM-Plex-Mono-Medium.ttf', 'IBM Plex Mono', 500),
  font('IBM-Plex-Mono-SemiBold.ttf', 'IBM Plex Mono', 600)
];

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const readJsonRaw = (file) => fs.readFileSync(file, 'utf8');
const jsonFiles = (dir) => fs.readdirSync(dir)
  .filter((file) => file.endsWith('.json'))
  .sort()
  .map((file) => ({ file, slug: file.slice(0, -'.json'.length) }));

const baseDir = path.join(ROOT, 'src', 'content', 'tools-base');
const toolsDir = path.join(ROOT, 'src', 'content', 'tools');
const categoriesDir = path.join(ROOT, 'src', 'content', 'categories');

const categories = new Map(
  jsonFiles(categoriesDir).map(({ file, slug }) => {
    const data = readJson(path.join(categoriesDir, file));
    return [data.slug ?? slug, data];
  })
);

const compact = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();

function shorten(value, maxLength) {
  const text = compact(value);
  if (text.length <= maxLength) return text;
  const clipped = text.slice(0, maxLength - 1).replace(/\s+\S*$/, '').trim();
  return `${clipped || text.slice(0, maxLength - 1)}…`;
}

function escapeText(value) {
  return compact(value).replace(/[<>]/g, '');
}

function categoryMarker(icon) {
  // Las fuentes TTF no incluyen los emojis de los iconos del catálogo y
  // resvg los convertiría en tofu (un cuadrado vacío). El icono sigue siendo
  // parte del input/hash; visualmente usamos el marcador geométrico de marca.
  return icon && /^[\x00-\x7F]+$/.test(icon) ? icon : '•';
}

function textNode(text, style = {}) {
  return { type: 'div', props: { style, children: escapeText(text) } };
}

function cardTree({ name, category, icon, description, eyebrow }) {
  return {
    type: 'div',
    props: {
      style: {
        width: WIDTH,
        height: HEIGHT,
        display: 'flex',
        flexDirection: 'column',
        padding: 58,
        backgroundColor: palette.bg,
        color: palette.ink,
        fontFamily: 'Space Grotesk'
      },
      children: [
        {
          type: 'div',
          props: {
            style: { display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'space-between', padding: 42, border: `2px solid ${palette.line}`, backgroundColor: palette.surface },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', alignItems: 'center', gap: 14 },
                        children: [
                          { type: 'div', props: { style: { width: 22, height: 22, backgroundColor: palette.find } } },
                          textNode(eyebrow, { fontFamily: 'IBM Plex Mono', fontSize: 22, fontWeight: 600, letterSpacing: 3, color: palette.signal })
                        ]
                      }
                    },
                    textNode('fuenteai.com', { fontFamily: 'IBM Plex Mono', fontSize: 18, fontWeight: 500, letterSpacing: 2, color: palette.muted })
                  ]
                }
              },
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 990 },
                  children: [
                    textNode(name, { fontSize: name.length > 25 ? 64 : 76, lineHeight: 1.05, fontWeight: 700, letterSpacing: -2.4, color: palette.ink }),
                    textNode(shorten(description, 175), { fontSize: 27, lineHeight: 1.28, fontWeight: 400, color: palette.muted })
                  ]
                }
              },
              {
                type: 'div',
                props: {
                  style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', border: `1px solid ${palette.signal}`, color: palette.ink },
                        children: [
                          textNode(categoryMarker(icon), { fontSize: 23, lineHeight: 1, color: palette.find }),
                          textNode(category || 'Herramientas de IA', { fontFamily: 'IBM Plex Mono', fontSize: 18, fontWeight: 500, letterSpacing: 1, color: palette.ink })
                        ]
                      }
                    },
                    textNode('FuenteAI', { fontSize: 34, fontWeight: 700, letterSpacing: -1.2, color: palette.ink })
                  ]
                }
              }
            ]
          }
        }
      ]
    }
  };
}

async function renderPng(data) {
  const svg = await satori(cardTree(data), { width: WIDTH, height: HEIGHT, fonts });
  return new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } }).render().asPng();
}

function hashInput(parts) {
  return crypto.createHash('sha256')
    .update(JSON.stringify({ generator: GENERATOR_VERSION, ...parts }))
    .digest('hex');
}

function loadManifest() {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  } catch {
    return { version: GENERATOR_VERSION, images: {} };
  }
}

function categoryFor(base) {
  const slug = base.categories?.[0];
  return slug ? categories.get(slug) : undefined;
}

/**
 * El nombre de la categoria y el encabezado salen de las MISMAS tablas que
 * usa el sitio (`getCategoryLabel` de brand.ts y las cadenas de i18n/ui.ts).
 * Los JSON de src/content/categories solo traen el nombre en espanol: leerlos
 * aqui ponia "Programacion" y "FUENTE OFICIAL" en las tarjetas suecas e
 * italianas, cuya descripcion si estaba traducida.
 */
const eyebrowFor = (lang) => useTranslations(lang)('info.trust.official').toUpperCase();
const categoryLabelFor = (slug, lang) =>
  slug ? getCategoryLabel(slug, lang) : undefined;

function localizedTools() {
  const baseFiles = jsonFiles(baseDir);
  const result = [];

  for (const lang of LANGS) {
    const localizedDir = path.join(toolsDir, lang);
    const localizedSlugs = new Set(jsonFiles(localizedDir).map(({ slug }) => slug));
    for (const { file, slug } of baseFiles) {
      if (!localizedSlugs.has(slug)) continue;
      const basePath = path.join(baseDir, file);
      const localizedPath = path.join(localizedDir, `${slug}.json`);
      const base = readJson(basePath);
      const localized = readJson(localizedPath);
      const category = categoryFor(base);
      const categorySlug = base.categories?.[0];
      const categoryLabel = categoryLabelFor(categorySlug, lang);
      const eyebrow = eyebrowFor(lang);
      result.push({
        relative: `og/${lang}/${slug}.png`,
        output: path.join(OG_DIR, lang, `${slug}.png`),
        inputHash: hashInput({
          kind: 'tool',
          lang,
          base: readJsonRaw(basePath),
          localized: readJsonRaw(localizedPath),
          categoryLabel: categoryLabel ?? '',
          eyebrow
        }),
        data: {
          name: base.name,
          category: categoryLabel ?? DEFAULT_COPY[lang].category,
          icon: category?.icon,
          description: localized.shortDescription,
          eyebrow
        }
      });
    }
  }
  return result;
}

/**
 * Portadas, categorias y guias comparten una tarjeta por idioma. Con una sola
 * en espanol, 43 de las 190 paginas del sitio —entre ellas las portadas sueca
 * e italiana— se compartian con un texto que su lector no entiende.
 */
const DEFAULT_COPY = {
  es: {
    name: 'Fuentes oficiales de IA',
    category: 'Directorio de herramientas de IA',
    description: 'Encuentra herramientas de inteligencia artificial y sus canales oficiales, sin clones ni mirrors.'
  },
  sv: {
    name: 'Officiella AI-källor',
    category: 'Katalog över AI-verktyg',
    description: 'Hitta AI-verktyg och deras officiella kanaler, utan kloner eller speglar.'
  },
  it: {
    name: 'Fonti ufficiali di IA',
    category: 'Directory di strumenti IA',
    description: 'Trova strumenti di intelligenza artificiale e i loro canali ufficiali, senza cloni né mirror.'
  }
};

const defaultImages = LANGS.map((lang) => ({
  relative: `og/default-${lang}.png`,
  output: path.join(OG_DIR, `default-${lang}.png`),
  inputHash: hashInput({ kind: 'default', lang, copy: DEFAULT_COPY[lang], eyebrow: eyebrowFor(lang) }),
  data: { ...DEFAULT_COPY[lang], icon: '✦', eyebrow: eyebrowFor(lang) }
}));

async function main() {
  fs.mkdirSync(OG_DIR, { recursive: true });
  const manifest = loadManifest();
  const expected = [...defaultImages, ...localizedTools()];
  const nextImages = {};
  let generated = 0;
  let reused = 0;

  for (const image of expected) {
    const relative = image.relative.replaceAll(path.sep, '/');
    const previousHash = manifest.images?.[relative];
    if (previousHash === image.inputHash && fs.existsSync(image.output)) {
      reused += 1;
    } else {
      fs.mkdirSync(path.dirname(image.output), { recursive: true });
      fs.writeFileSync(image.output, await renderPng(image.data));
      generated += 1;
    }
    nextImages[relative] = image.inputHash;
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify({ version: GENERATOR_VERSION, images: nextImages }, null, 2) + '\n');
  console.log(`OG images: ${generated} generadas, ${reused} reutilizadas (${expected.length} esperadas).`);
}

main().catch((error) => {
  console.error('No se pudieron generar las imágenes OG.');
  console.error(error);
  process.exitCode = 1;
});
